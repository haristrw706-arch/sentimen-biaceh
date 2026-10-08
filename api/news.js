// Vercel Serverless Function: GET /api/news
// Mengambil Google News RSS (id-ID) untuk kata kunci KPwBI Aceh dan isu negatif, lalu mengembalikan JSON.
// Cache di edge 5 menit supaya tidak membebani Google News saat banyak pengunjung.

const QUERIES = [
  '"Bank Indonesia Aceh" OR "BI Aceh" OR "KPwBI Aceh" OR "BI Banda Aceh"',
  '"QRIS Aceh" OR "QRIS Banda Aceh"',
  '"inflasi Aceh" OR "TPID Aceh" OR "harga pangan Aceh"',
  '"UMKM Aceh" OR "ekonomi syariah Aceh" OR "ekonomi Aceh"',
  '"penukaran uang" Aceh OR "kas keliling" Aceh OR "uang palsu" Aceh',
  // Isu negatif (dipendekkan ke kombinasi OR agar tetap dalam batas panjang kueri)
  '"kecewa BI Aceh" OR "keluhan BI Aceh" OR "komplain BI Aceh" OR "kritik BI Aceh" OR "protes BI Aceh" OR "pelayanan BI Aceh"',
  '"QRIS error" OR "QRIS gagal" OR "QRIS down" OR "transaksi QRIS gagal" OR "refund QRIS" OR "potongan QRIS" OR "biaya QRIS"',
  '"susah tukar uang" OR "antrian penukaran uang" OR "kehabisan uang baru" OR "uang rusak" OR "penukaran uang gagal"',
  '"harga beras naik" Aceh OR "harga cabai naik" Aceh OR "inflasi Aceh tinggi" OR "daya beli turun" Aceh',
  '"BI Rate naik" OR "suku bunga naik" OR "bunga kredit naik" OR "kebijakan BI"',
  '"UMKM sulit" Aceh OR "kredit UMKM" Aceh OR "pembiayaan UMKM" Aceh OR "bantuan UMKM" Aceh',
];

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
      if (!it.title || seen.has(key)) continue;
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
