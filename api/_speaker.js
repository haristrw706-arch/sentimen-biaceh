// Ekstraksi narasumber dari isi berita (bahasa Indonesia). Dipakai di api/article.js.
const SAY_AFTER = "ujar|ujarnya|kata|katanya|ucap|ucapnya|tutur|tuturnya|jelas|jelasnya|tegas|tegasnya|ungkap|ungkapnya|sebut|sebutnya|terang|terangnya|imbuh|imbuhnya|tambah|tambahnya|lanjut|lanjutnya|papar|paparnya|pungkas|pungkasnya|kata dia|ujar dia";
const SAY_VERB = "mengatakan|menyampaikan|menjelaskan|menuturkan|mengungkapkan|menyebutkan|menyebut|menegaskan|mengakui|mengaku|memaparkan|menerangkan|berharap|meminta|mengimbau|menilai|mengklaim|membenarkan|mengemukakan|menyatakan|melaporkan|mencatat|memastikan|mendorong|mengajak|menambahkan|berpendapat|mengeluhkan|bercerita|menceritakan";
const NAME = "(?:(?:dr|Dr|Ir|H|Hj|Prof|Drs|Dra|Tgk|Teuku|Cut|T|M|Muhammad|Moh)\\.?\\s+)*[A-Z][A-Za-z'’-]+(?:\\s+(?:[A-Z][A-Za-z'’.-]*|bin|binti|Al|al|el|van|de)){0,4}";
const DAYS = /^(Senin|Selasa|Rabu|Kamis|Jumat|Jum'at|Sabtu|Minggu|Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)$/;
const ORG_WORDS = new Set("Aceh Banda Provinsi Prov Kota Kabupaten Kab Setda Setdako Setdakab Bank Indonesia BI KPw BPS OJK TPID Dinas Disperindag Pemerintah Pemko Pemkot Pemkab Pemprov DPRA DPRK II III IV V VI Bidang Badan Kantor Perwakilan Wilayah Region Cabang Pusat Daerah Utara Selatan Barat Timur Tengah Besar Jaya Tamiang Singkil Simeulue Lhokseumawe Langsa Sabang Meulaboh Takengon Bireuen Pidie Gayo Lues Nagan Raya Subulussalam UMKM Syariah Koperasi Perdagangan Perindustrian Pangan Pertanian Keuangan Ekonomi Unit Bulog PT CV UD Tbk Persero USK UIN Universitas Fakultas Kadin APPSI".split(" "));
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
  return desc.split(/\s+/).slice(-9).join(" ");
}
function validName(n) {
  const w = n.trim().split(/\s+/);
  return w.length >= 1 && w.length <= 5 && !STOP_NAME.test(w[0]) && !DAYS.test(w[0]) && !/^(Kepala|Ketua|Direktur|Deputi|Gubernur|Bupati|Wali|Pedagang|Petani|Warga)$/.test(w[0]);
}
function fmt(org, name) {
  org = (org || "").replace(/[,\s]+$/, "").trim();
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
    m = s.match(new RegExp(`^((?:Kepala|Ketua|Direktur|Deputi|Gubernur|Wakil|Bupati|Wali Kota|Sekda|Kadis|Asisten|Kabid|Kasi|Plt|Pj|Camat|Keuchik|Pedagang|Petani|Warga|Pengamat|Ekonom|Dosen)[^,.“"]{3,110}?)(?:\\s+(?:di|saat|ketika|dalam)\\s+[^,]{2,60})?(?:,\\s*[^,]{2,30},)?\\s+(?:${SAY_VERB})\\b`));
    if (m) { const [org, nm] = splitTrailingName(m[1]); push(fmt(org, nm), "jabatan nama mengatakan"); continue; }
  }
  // rapikan: gabungkan entri yang menyebut nama yang sama
  const named = found.map((f) => (f.text.match(/\(([^)]+)\)$/) || [])[1]).filter(Boolean);
  for (const f of found) {
    if (/\)$/.test(f.text)) continue;
    const n = named.find((n) => f.text === n || f.text.endsWith(" " + n));
    if (n) f.text = f.text === n ? "" : `${f.text.slice(0, -n.length).trim()} (${n})`;
  }
  const out = [], seen = new Set();
  for (const f of found) {
    if (!f.text) continue;
    const key = (f.text.match(/\(([^)]+)\)$/) || [, f.text])[1].toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key); out.push(f);
  }
  return out.slice(0, 4);
}

if (typeof module !== "undefined") module.exports = { extractSpeakersFromBody, cleanLead, shortOrg };
