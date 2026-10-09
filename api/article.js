// GET /api/article?url=<link berita>
// Membuka artikel (termasuk link Google News), membaca isi berita, lalu mengambil narasumber
// (siapa yang berbicara) beserta lembaganya, mis. "UD. Indo Plastik (Intan)".
const { extractSpeakersFromBody } = require("./_speaker.js");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const withTimeout = (ms) => { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; };

async function resolveGoogleNews(link) {
  const m = link.match(/news\.google\.com\/(?:rss\/)?articles\/([^?]+)/);
  if (!m) return link;
  const id = m[1];
  const page = await fetch(`https://news.google.com/rss/articles/${id}`, { headers: { "user-agent": UA }, signal: withTimeout(6000) }).then((r) => r.text());
  const sg = (page.match(/data-n-a-sg="([^"]+)"/) || [])[1];
  const ts = (page.match(/data-n-a-ts="([^"]+)"/) || [])[1];
  if (!sg || !ts) throw new Error("gagal membuka tautan Google News");
  const inner = `["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0],"${id}",${ts},"${sg}"]`;
  const body = "f.req=" + encodeURIComponent(JSON.stringify([[["Fbv4je", inner, null, "generic"]]]));
  const txt = await fetch("https://news.google.com/_/DotsSplashUi/data/batchexecute", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8", "user-agent": UA }, body, signal: withTimeout(6000),
  }).then((r) => r.text());
  const json = JSON.parse(txt.split("\n\n")[1]);
  const url = JSON.parse(json[0][2])[1];
  if (!/^https?:\/\//.test(url)) throw new Error("tautan asli tidak ditemukan");
  return url;
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", ndash: "–", mdash: "—", hellip: "…" };
function htmlToLines(html) {
  let h = html.replace(/<(script|style|noscript|svg|iframe|form|nav|footer|header|aside|figure|figcaption)[\s\S]*?<\/\1>/gi, " ");
  h = h.replace(/<br\s*\/?>|<(p|div|li|blockquote|h\d)(\s[^>]*)?>/gi, "\n").replace(/<\/(p|div|h\d|li|blockquote)>/gi, "\n").replace(/<[^>]+>/g, " ");
  h = h.replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (m, e) => e[0] === "#" ? String.fromCharCode(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e.toLowerCase()] ?? m);
  return h.split("\n").map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .filter((l) => l.length >= 50 && / /.test(l) && !/^(baca juga|simak|lihat juga|editor|pewarta|penulis|copyright|©|dapatkan|ikuti|follow|klik|artikel ini)/i.test(l));
}

async function aiSpeakers(lines, title) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const prompt = `Berikut isi berita berbahasa Indonesia berjudul "${title}".\n\n${lines.join("\n").slice(0, 6000)}\n\nSebutkan narasumber yang dikutip atau disebut berbicara dalam berita ini (bukan wartawan, bukan media). Untuk tiap narasumber tulis lembaga/usaha/jabatannya dan namanya. Balas HANYA JSON: {"narasumber":[{"lembaga":"...","nama":"..."}]} urut dari yang paling utama. Jika tidak ada, {"narasumber":[]}.`;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", signal: withTimeout(12000),
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5", max_tokens: 400, messages: [{ role: "user", content: prompt }] }),
  });
  if (!r.ok) { let m = ""; try { m = (await r.json())?.error?.message || ""; } catch (e) {} throw new Error(("AI HTTP " + r.status + " " + m).slice(0, 200)); }
  const data = await r.json();
  const out = JSON.parse((data.content?.[0]?.text || "").match(/\{[\s\S]*\}/)[0]);
  return (out.narasumber || []).map((n) => ({ text: n.lembaga && n.nama ? `${n.lembaga} (${n.nama})` : n.lembaga || n.nama, how: "AI" })).filter((x) => x.text).slice(0, 4);
}

module.exports = async (req, res) => {
  const link = String(req.query.url || "");
  const title = String(req.query.title || "");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!/^https?:\/\//.test(link)) return res.status(400).json({ status: "error", error: "url wajib diisi" });
  let url = link;
  try {
    url = await resolveGoogleNews(link);
    const r = await fetch(url, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: withTimeout(8000) });
    const html = await r.text();
    if (r.status === 403 || r.status === 429 || r.status === 503 || /Just a moment|Attention Required|cf-browser-verification|verifies you are not a bot/i.test(html.slice(0, 5000))) {
      res.setHeader("Cache-Control", "s-maxage=3600");
      return res.status(200).json({ status: "blocked", url, speakers: [] });
    }
    const lines = htmlToLines(html);
    let speakers = [], method = "aturan", aiErr = "";
    const aiOn = !!process.env.ANTHROPIC_API_KEY;
    if (aiOn && lines.length) { try { const ai = await aiSpeakers(lines, title); if (ai) { speakers = ai; method = "AI"; } } catch (e) { aiErr = String(e.message || e); } }
    if (!speakers.length) speakers = extractSpeakersFromBody(lines);
    res.setHeader("Cache-Control", aiErr ? "s-maxage=600" : "s-maxage=604800, stale-while-revalidate=86400");
    return res.status(200).json({ status: lines.length ? "ok" : "empty", method, aiOn, ...(aiErr ? { aiErr } : {}), url, speakers, lead: (lines[0] || "").slice(0, 280), ...(req.query.debug ? { lines } : {}) });
  } catch (e) {
    res.setHeader("Cache-Control", "s-maxage=600");
    return res.status(200).json({ status: "error", url, speakers: [], error: String(e.message || e) });
  }
};
module.exports.htmlToLines = htmlToLines;
