// Vercel Serverless Function: GET /api/news
// Mengambil Google News RSS (id-ID) untuk kata kunci KPwBI Aceh dan isu negatif, lalu mengembalikan JSON.
// Cache di edge 5 menit supaya tidak membebani Google News saat banyak pengunjung.

const QUERIES = [
  'Aceh ("Bank Indonesia" OR "BI Aceh" OR "KPwBI" OR "BI Banda Aceh")',
  'Aceh (QRIS OR "sistem pembayaran" OR "BI-FAST" OR digitalisasi)',
  'Aceh (inflasi OR TPID OR "harga pangan" OR "harga beras" OR "harga cabai" OR "harga bawang")',
  'Aceh (UMKM OR "ekonomi syariah" OR "keuangan syariah" OR "ekonomi Aceh")',
  'Aceh ("penukaran uang" OR "kas keliling" OR "uang palsu" OR "uang rusak" OR "uang baru")',
  // Isu negatif — tetap diikat ke Aceh
  'Aceh (kecewa OR keluhan OR komplain OR kritik OR protes) ("BI" OR "Bank Indonesia")',
  'Aceh ("QRIS error" OR "QRIS gagal" OR "QRIS down" OR "QRIS bermasalah" OR "refund QRIS" OR "potongan QRIS" OR "biaya QRIS")',
  'Aceh ("susah tukar uang" OR "antrian penukaran" OR "kehabisan uang" OR "penukaran uang gagal" OR "tidak kebagian")',
  'Aceh ("inflasi tinggi" OR "harga naik" OR "daya beli turun" OR "harga sembako" OR "kebutuhan pokok mahal")',
  'Aceh ("BI Rate" OR "suku bunga" OR "bunga kredit" OR "cicilan" OR "kredit mahal")',
  'Aceh ("UMKM sulit" OR "kredit UMKM" OR "pembiayaan UMKM" OR "bantuan UMKM" OR "akses kredit")',
];

// Hanya berita yang judulnya menyebut Aceh / wilayah di Aceh, atau dari media lokal Aceh.
const ACEH_PLACES = /\b(aceh|banda aceh|lhokseumawe|langsa|sabang|meulaboh|takengon|bireuen|sigli|pidie|simeulue|tamiang|singkil|subulussalam|nagan raya|gayo|blangpidie|calang|jantho|kutacane|lhoksukon|idi rayeuk|tapaktuan|suka makmue|redelong|blangkejeren|kpwbi aceh)\b/i;
const ACEH_MEDIA = /(serambi|aceh|ajnn|kba\.one|habadaily|lintasgayo|rri banda aceh|rri takengon|rri meulaboh|rri sabang|portalsatu|dialeksis|theacehpost|nukilan)/i;
// ...dan judulnya harus menyangkut ekonomi / BI (buang berita cuaca, olahraga, dll.)
const ECON = /\b(bank|bi|kpwbi|qris|inflasi|harga|umkm|uang|rupiah|kredit|ekonomi|syariah|halal|pembayaran|cabai|beras|bawang|pangan|sembako|bunga|cicilan|pembiayaan|digital|digitalisasi|tpid|daya beli|transaksi|keuangan|investasi|ekspor|pasar|komoditas|bi-fast|tp2dd|etpd|meuseuraya|cbpr|kas keliling|penukaran)\b/i;
const isAceh = (it) => (ACEH_PLACES.test(it.title) || ACEH_MEDIA.test(it.source || "")) && ECON.test(it.title);

const decode = (s) =>
  String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, "&")
    .trim();
const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)); return m ? decode(m[1]) : ""; };

function parseRss(xml, query) {
  const items = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const raw = m[1];
    const source = tag(raw, "source");
    let title = tag(raw, "title");
    if (source && title.endsWith(" - " + source)) title = title.slice(0, -(source.length + 3));
    items.push({ title, link: tag(raw, "link"), pubDate: tag(raw, "pubDate"), source, query });
  }
  return items;
}

async function fetchQuery(q) {
  const url = "https://news.google.com/rss/search?q=" + encodeURIComponent(q + " when:90d") + "&hl=id&gl=ID&ceid=ID:id";
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; KPwBI-Aceh-Monitor/1.0)" } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return parseRss(await res.text(), q);
}

module.exports = async (req, res) => {
  const results = await Promise.allSettled(QUERIES.map(fetchQuery));
  const seen = new Set();
  const items = [];
  const errors = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") { errors.push({ query: QUERIES[i], error: String(r.reason && r.reason.message || r.reason) }); return; }
    for (const it of r.value) {
      const key = it.title.toLowerCase().replace(/\s+/g, " ").slice(0, 90);
      if (!it.title || seen.has(key) || !isAceh(it)) continue;
      seen.add(key); items.push(it);
    }
  });
  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(errors.length === QUERIES.length ? 502 : 200).json({
    fetchedAt: new Date().toISOString(),
    queries: QUERIES.length,
    count: items.length,
    errors,
    items: items.slice(0, 400),
  });
};

module.exports.parseRss = parseRss;
module.exports.isAceh = isAceh;
