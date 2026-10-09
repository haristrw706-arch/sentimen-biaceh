// Ekstraksi narasumber dari isi berita (bahasa Indonesia). Dipakai di api/article.js.
const SAY_AFTER = "ujar|ujarnya|kata|katanya|ucap|ucapnya|tutur|tuturnya|jelas|jelasnya|tegas|tegasnya|ungkap|ungkapnya|sebut|sebutnya|terang|terangnya|imbuh|imbuhnya|tambah|tambahnya|lanjut|lanjutnya|papar|paparnya|pungkas|pungkasnya|kata dia|ujar dia";
const SAY_VERB = "mengatakan|menyampaikan|menjelaskan|menuturkan|mengungkapkan|menyebutkan|menyebut|menegaskan|mengakui|mengaku|memaparkan|menerangkan|berharap|meminta|mengimbau|menilai|mengklaim|membenarkan|mengemukakan|menyatakan|melaporkan|mencatat|memastikan|mendorong|mengajak|menambahkan|berpendapat|mengeluhkan|bercerita|menceritakan";
const NAME = "(?:(?:dr|Dr|Ir|H|Hj|Prof|Drs|Dra|Tgk|Teuku|Cut|T|M|Muhammad|Moh)\\.?\\s+)*[A-Z][A-Za-z'’-]+(?:\\s+(?:[A-Z][A-Za-z'’.-]*|bin|binti|Al|al|el|van|de)){0,4}";
const DAYS = /^(Senin|Selasa|Rabu|Kamis|Jumat|Jum'at|Sabtu|Minggu|Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)$/;
const ORG_WORDS = new Set("Aceh Banda Provinsi Prov Kota Kabupaten Kab Setda Setdako Setdakab Bank Indonesia BI KPw BPS OJK TPID Dinas Disperindag Pemerintah Pemko Pemkot Pemkab Pemprov DPRA DPRK II III IV V VI Bidang Badan Kantor Perwakilan Wilayah Region Cabang Pusat Daerah Utara Selatan Barat Timur Tengah Besar Jaya Tamiang Singkil Simeulue Lhokseumawe Langsa Sabang Meulaboh Takengon Bireuen Pidie Gayo Lues Nagan Raya Subulussalam UMKM Syariah Koperasi Perdagangan Perindustrian Pangan Pertanian Keuangan Ekonomi Unit Bulog PT CV UD Tbk Persero USK UIN Universitas Fakultas Kadin KADIN APPSI Commercial Banking Retail Consumer Business Bisnis Utama Umum Eksekutif Jaringan Operasi Humas Kemitraan Pemasaran Pengembangan BTN BRI BNI BSI Mandiri Pegadaian Pertamina PLN Telkom Foundation Group Indonesia Persero".split(" "));
function splitTrailingName(phrase) {
  const w = phrase.trim().split(/\s+/); const name = [];
  while (w.length > 1 && name.length < 4) {
    const x = w[w.length - 1];
    if (!/^[A-Z][A-Za-z'’.-]*$/.test(x) || ORG_WORDS.has(x.replace(/[.,]$/, ""))) break;
    name.unshift(w.pop());
  }
  return name.length ? [w.join(" "), name.join(" ")] : [phrase, ""];
}
const STOP_NAME = /^(Sementara|Namun|Selain|Menurut|Kemudian|Dalam|Pada|Dengan|Untuk|Hal|Ia|Dia|Mereka|Kami|Saya|Kata|Ujar|Hingga|Sedangkan|Adapun|Oleh|Karena|Jika|Bahkan|Meski|Saat|Ketika|Di|Ke|Dari|Ini|Itu|Rp|Banda|Aceh|Indonesia|Bank|Pemerintah)$/;

function cleanLead(p) {
  // buang dateline: "BANDA ACEH, RRI.co.id - ", "Banda Aceh (ANTARA) - ", "SERAMBINEWS.COM, BANDA ACEH - "
  return p.replace(/^[^.!?“"]{0,70}?\s[-–—]\s+/, (m) => (/[A-Z]{3,}|\(/.test(m) ? "" : m)).trim();
}
function shortOrg(desc) {
  desc = desc.replace(/^(sementara itu|namun|adapun|selain itu|di sisi lain|terpisah|menurut)\s*,?\s*/i, "").trim();
  const di = desc.match(/\s(?:di|dari)\s+((?:[A-Z][\w.&'’-]*\.?\s*){1,6})$/);
  if (di && /[A-Z]/.test(di[1])) return di[1].trim();
  const role = desc.match(/\b(?:Kepala|Ketua|Sekretaris|Direktur|Deputi|Gubernur|Wakil|Bupati|Wali Kota|Wabup|Wagub|Sekda|Kadis\w*|Asisten|Kabid|Kasi|Plt|Pj|Camat|Keuchik|Pedagang|Pemilik|Petani|Warga|Pengamat|Ekonom|Dosen|Manajer|General Manager|Pimpinan|Pemimpin|President|Presiden|Koordinator|Menteri|Kapolda|Kapolres|Panglima|Rektor|Dekan)\b.*$/);
  if (role) return role[0].split(/\s+/).slice(0, 12).join(" ");
  return desc.split(/\s+/).slice(-9).join(" ");
}
function validName(n) {
  const w = n.trim().split(/\s+/);
  return w.length >= 1 && w.length <= 5 && !STOP_NAME.test(w[0]) && !DAYS.test(w[0]) && !/^(Kepala|Ketua|Direktur|Deputi|Gubernur|Bupati|Wali|Pedagang|Petani|Warga)$/.test(w[0]);
}
const PLACES = new Set("Banda Aceh Lhokseumawe Langsa Sabang Meulaboh Takengon Bireuen Pidie Jaya Besar Utara Selatan Barat Timur Tengah Tenggara Daya Tamiang Singkil Simeulue Subulussalam Nagan Raya Gayo Lues Bener Meriah Abdya Kota Kabupaten Provinsi Jakarta Medan Indonesia".split(" "));
const HONOR = /^(?:Drs?|Dra|H|Hj|Ir|Prof|dr|Tgk|T|M|Teuku|Cut)\.?$/;
function fmt(org, name) {
  org = (org || "").trim(); name = (name || "").trim();
  // pindahkan gelar di ujung "lembaga" ke depan nama: "Wakil Bupati Drs H" + "Syukri" -> "Wakil Bupati" + "Drs H Syukri"
  let ow = org.split(/\s+/).filter(Boolean);
  while (name && ow.length && HONOR.test(ow[ow.length - 1])) name = ow.pop().replace(/\.$/, "") + " " + name;
  org = ow.join(" ");
  // "Palu H. Hadianto Rasyid": kata sebelum gelar ikut lembaga
  const nw = name.split(/\s+/); const hi = nw.findIndex((w, i) => i > 0 && HONOR.test(w) && !HONOR.test(nw[i - 1]));
  if (hi > 0) { org = (org + " " + nw.slice(0, hi).join(" ")).trim(); name = nw.slice(hi).join(" "); }
  if (org && !/^[A-Z(]/.test(org)) org = "";
  if (org && org.split(/\s+/).every((w) => PLACES.has(w.replace(/[.,]/g, "")))) org = "";
  org = (org || "").replace(/[,\s]+$/, "").replace(/(?:\s+(?:saat ini|adalah|yakni|yaitu|ialah))+$/i, "").replace(/\s+(?:saat|ketika|usai|seusai|dalam|pada)\s.*$/i, "").trim();
  if (DAYS.test(org.split(/\s+/)[0] || "") || /^(dalam|saat|ketika|di|pada|usai|seusai|kepada)\b/i.test(org) || /^\(?\d/.test(org)) org = "";
  name = (name || "").replace(/[,\s]+$/, "").trim();
  if (org && name) return `${org} (${name})`;
  return org || name;
}

function extractSpeakersFromBody(paragraphs) {
  const found = [];
  const push = (s, how) => { s = s.replace(/\s+/g, " ").trim(); if (s && s.length <= 90 && !found.some((f) => f.text === s)) found.push({ text: s, how }); };
  const text = paragraphs.map((p, i) => (i === 0 ? cleanLead(p) : p)).join("\n");
  // lindungi singkatan (UD. PT. CV. H. dr. dll) agar tidak dianggap akhir kalimat
  const prot = text.replace(/\b(UD|PT|CV|Tbk|H|Hj|dr|Dr|Ir|Prof|Drs|Dra|No|Jl|St|Tgk|T|M|S|SE|SH|MM|MT|Kec|Kab|Prov|Kel|Desa)\.\s/g, "$1.\u0001").replace(/\b([A-Z])\.\s(?=[A-Z])/g, "$1.\u0001");
  const sentences = prot.split(/(?<=[.!?”"])\s+(?=[A-Z“"])|\n/).map((x) => x.replace(/\u0001/g, " "));
  for (const s of sentences) {
    let m;
    // P1: "<deskripsi>, <Nama>, mengatakan ..."
    m = s.match(new RegExp(`^(.{3,120}?),\\s*(${NAME}),\\s*(?:${SAY_VERB})\\b`));
    if (m && validName(m[2])) { push(fmt(shortOrg(m[1]), m[2]), "deskripsi, nama, mengatakan"); continue; }
    // P1c: "<deskripsi>, <Nama> di <tempat>, <hari>, mengatakan ..."
    m = s.match(new RegExp(`^(.{3,120}?),\\s*(${NAME})\\s+(?:di|dalam|saat)\\s+[^,]{2,60},\\s*[^,]{2,30},\\s*(?:${SAY_VERB})\\b`));
    if (m && validName(m[2])) { push(fmt(shortOrg(m[1]), m[2]), "deskripsi, nama di tempat, mengatakan"); continue; }
    // P1b: "<Nama>, <jabatan/lembaga>, mengatakan ..."
    m = s.match(new RegExp(`^(${NAME}),\\s*([^,]{3,90}),\\s*(?:${SAY_VERB})\\b`));
    if (m && validName(m[1])) { push(fmt(shortOrg(m[2]), m[1]), "nama, jabatan, mengatakan"); continue; }
    // P2: "“...,” ujar <Nama>, <deskripsi>." atau "ujar <deskripsi> <Nama>"
    m = s.match(new RegExp(`[”"]\\s*,?\\s*(?:${SAY_AFTER})\\s+(${NAME})(?:\\s*,\\s*([^.”"]{3,90}))?`));
    if (m && validName(m[1])) { push(fmt(m[2] ? shortOrg(m[2]) : "", m[1]), "kutipan, ujar nama"); continue; }
    // P3a: "Menurut <deskripsi>, <Nama>, ..."
    m = s.match(new RegExp(`^Menurut\\s+([^,]{3,90}),\\s*(${NAME}),`));
    if (m && validName(m[2])) { push(fmt(shortOrg(m[1]), m[2]), "menurut deskripsi, nama"); continue; }
    // P3: "Menurut <Nama/deskripsi>, ..."
    m = s.match(/^Menurut\s+([^,]{3,80}),/);
    if (m) { push(m[1], "menurut"); continue; }
    // P4: "<Jabatan Lembaga> <Nama> mengatakan" (tanpa koma)
    m = s.match(new RegExp(`^((?:Kepala|Ketua|Sekretaris|Direktur|Deputi|Gubernur|Wakil|Bupati|Wali Kota|Sekda|Kadis\\w*|Asisten|Kabid|Kasi|Plt|Pj|Camat|Keuchik|Pedagang|Pemilik|Petani|Warga|Pengamat|Ekonom|Dosen|Manajer|Pimpinan|Pemimpin|President|Presiden|Koordinator|Rektor|Dekan)[^,“"]{3,110}?)(?:\\s+(?:di|dalam)\\s+[^,]{2,60})?(?:,\\s*[^,]{2,30},)?,?\\s+(?:${SAY_VERB})\\b`));
    if (m) { const [org, nm] = splitTrailingName(m[1].replace(/(?:\s+[a-z]\S*)+$/, "").replace(/\\s+(?:saat ini|adalah|yakni|yaitu|ialah)(?=\\s|$)/g, " ")); push(fmt(org, nm), "jabatan nama mengatakan"); continue; }
    // P5: "... disampaikan (langsung) oleh <lembaga/pejabat>"
    m = s.match(/\b(?:disampaikan|dipaparkan|dijelaskan|diungkapkan)\s+(?:langsung\s+)?oleh\s+([^,.;]{5,90})/);
    if (m) { const ph = m[1].split(/\s(?:yang|untuk|dengan|kepada|di hadapan|terkait|mengenai|tentang)\s/)[0].replace(/^(?:[a-z]+\s+)+(?=[A-Z])/, ""); const [org, nm] = splitTrailingName(ph); push(fmt(org, nm), "disampaikan oleh"); continue; }
  }
  // lengkapi nama tanpa jabatan dengan jabatan yang disebut di bagian lain berita
  for (const f of found) {
    if (/\(/.test(f.text) || f.text.split(" ").length > 4) continue;
    const re = new RegExp(`((?:Kepala|Ketua|Sekretaris|Direktur|Deputi|Gubernur|Wakil|Bupati|Wali Kota|Sekda|Kadis\\w*|Asisten|Kabid|Kasi|Plt|Pj|Camat|Keuchik|Pedagang|Pemilik|Petani|Warga|Pengamat|Ekonom|Dosen|Manajer|General Manager|Pimpinan|Pemimpin|President|Presiden|Koordinator|Rektor|Dekan)[^,“”"]{3,90}?)(?:\\s+(?:saat ini|adalah|yakni|yaitu))?,?\\s+${f.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    const mm = text.match(re);
    if (mm) f.text = fmt(mm[1], f.text);
  }
  // rapikan: gabungkan entri yang menyebut nama yang sama
  const named = found.map((f) => (f.text.match(/\(([^)]+)\)$/) || [])[1]).filter(Boolean);
  for (const f of found) {
    if (/\)$/.test(f.text)) continue;
    const n = named.find((n) => f.text === n || f.text.endsWith(" " + n));
    if (n) f.text = f.text === n ? "" : `${f.text.slice(0, -n.length).trim()} (${n})`;
  }
  const out = [], seen = new Set();
  const nameOf = (t) => ((t.match(/\(([^)]+)\)$/) || [, t])[1]).replace(/\./g, "").split(/\s+/).filter((w) => !HONOR.test(w)).join(" ").toLowerCase();
  for (const f of found) {
    if (!f.text) continue;
    if (/^(dia|ia|beliau|mereka|kata dia)\b/i.test(f.text) || /^(Kepala|Ketua|Direktur|Warga|Sekretaris Daerah|Pedagang|warga)$/.test(f.text)) continue;
    const nm = nameOf(f.text);
    // nama pendek ("Agus") yang merupakan bagian dari nama lengkap yang sudah ada ("Agus Chusaini") digabung
    if (nm && found.some((g) => g !== f && g.text && nameOf(g.text) !== nm && nameOf(g.text).split(" ").includes(nm.split(" ")[0]) && nameOf(g.text).length > nm.length)) continue;
    if (!/\)$/.test(f.text) && found.some((g) => g !== f && g.text.startsWith(f.text + " ("))) continue;
    const key = nm || f.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key); out.push(f);
  }
  return out.slice(0, 4);
}

if (typeof module !== "undefined") module.exports = { extractSpeakersFromBody, cleanLead, shortOrg };
