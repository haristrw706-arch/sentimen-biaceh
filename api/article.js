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

// Narasumber via AI. Prioritas: GEMINI_API_KEY (gratis, Google AI Studio) -> ANTHROPIC_API_KEY (berbayar, opsional).
const ASK = `Sebutkan narasumber yang dikutip atau disebut berbicara dalam berita ini (bukan wartawan, bukan media). Untuk tiap narasumber tulis lembaga/usaha/jabatannya dan namanya. Jika tidak ada orang yang dikutip, sebutkan lembaga sumber data/informasi utama berita (mis. "Badan Pangan Nasional"), dengan nama dikosongkan. Balas HANYA JSON: {"narasumber":[{"lembaga":"...","nama":"..."}]} urut dari yang paling utama. Jika benar-benar tidak ada, {"narasumber":[]}.`;
function aiPrompt(lines, title) {
  return `Berikut isi berita berbahasa Indonesia berjudul "${title}".\n\n${lines.join("\n").slice(0, 6000)}\n\n${ASK}`;
}
function parseAi(text) {
  const out = JSON.parse((text || "").match(/\{[\s\S]*\}/)[0]);
  return (out.narasumber || []).map((n) => ({ text: n.lembaga && n.nama ? `${n.lembaga} (${n.nama})` : n.lembaga || n.nama, how: "AI" })).filter((x) => x.text).slice(0, 4);
}
async function httpErr(r, tag) { let m = ""; try { m = (await r.json())?.error?.message || ""; } catch (e) {} return new Error((`${tag} HTTP ${r.status} ${m}`).slice(0, 200)); }
const geminiKey = () => String(process.env.GEMINI_API_KEY || "").replace(/^\s*(GEMINI_API_KEY\s*=\s*)?["'`]?|["'`]?\s*$/g, "");
const MODELS = () => (process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.0-flash", "gemini-2.0-flash-lite"]);
async function gemini(body, key, ms) {
  let last;
  for (const model of MODELS()) {
    const b = JSON.parse(JSON.stringify(body));
    if (model.includes("2.5")) b.generationConfig = { ...b.generationConfig, thinkingConfig: { thinkingBudget: 0 } };
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", signal: withTimeout(ms), headers: { "x-goog-api-key": key, "content-type": "application/json" }, body: JSON.stringify(b),
    });
    if (r.status === 429 || r.status === 503) { last = await httpErr(r, "Gemini"); continue; } // kuota model ini habis -> coba model gratis lain
    if (r.status === 404 || r.status === 400) { last = await httpErr(r, "Gemini"); if (/API key/i.test(last.message)) throw new Error(last.message + ` [panjang key ${key.length}, awalan ${key.slice(0, 4) === "AIza" ? "AIza OK" : "bukan AIza"}]`); continue; }
    if (!r.ok) throw await httpErr(r, "Gemini");
    return r.json();
  }
  throw last || new Error("Gemini: model tidak tersedia");
}
const textOf = (data) => (data.candidates?.[0]?.content?.parts || []).map((x) => x.text || "").join("");
async function geminiSpeakers(lines, title, key) {
  const data = await gemini({ contents: [{ role: "user", parts: [{ text: aiPrompt(lines, title) }] }], generationConfig: { temperature: 0, maxOutputTokens: 600, responseMimeType: "application/json" } }, key, 15000);
  return parseAi(textOf(data));
}
// Situs yang menolak dibaca langsung dari server: minta Gemini membuka halaman lewat alat resmi "URL context" milik Google.
async function geminiUrlSpeakers(url, title, key) {
  const data = await gemini({
    contents: [{ role: "user", parts: [{ text: `Buka dan baca berita berbahasa Indonesia ini: ${url}\nJudul: "${title}".\n\n${ASK}` }] }],
    tools: [{ url_context: {} }],
    generationConfig: { temperature: 0, maxOutputTokens: 800 },
  }, key, 20000);
  const meta = data.candidates?.[0]?.urlContextMetadata || data.candidates?.[0]?.url_context_metadata;
  const st = (meta?.urlMetadata || meta?.url_metadata || []).map((m) => m.urlRetrievalStatus || m.url_retrieval_status);
  if (!st.some((x) => /SUCCESS/.test(x || ""))) throw new Error("Gemini URL context: halaman gagal dibuka (" + (st.join(",") || "tanpa status") + ")");
  return parseAi(textOf(data));
}
async function anthropicSpeakers(lines, title, key) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", signal: withTimeout(12000),
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5", max_tokens: 400, messages: [{ role: "user", content: aiPrompt(lines, title) }] }),
  });
  if (!r.ok) throw await httpErr(r, "Anthropic");
  const data = await r.json();
  return parseAi(data.content?.[0]?.text);
}
async function aiSpeakers(lines, title) {
  if (geminiKey()) return geminiSpeakers(lines, title, geminiKey());
  if (process.env.ANTHROPIC_API_KEY && process.env.USE_ANTHROPIC === "1") return anthropicSpeakers(lines, title, process.env.ANTHROPIC_API_KEY);
  return null;
}
const LONG = "s-maxage=604800, stale-while-revalidate=86400";

module.exports = async (req, res) => {
  const link = String(req.query.url || "");
  const title = String(req.query.title || "");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!/^https?:\/\//.test(link)) return res.status(400).json({ status: "error", error: "url wajib diisi" });
  let url = link;
  // fallback untuk situs yang menolak dibaca: baca lewat Gemini URL context
  const viaUrl = async (why) => {
    let aiErr = why;
    if (geminiKey() && url !== link) {
      try {
        const sp = await geminiUrlSpeakers(url, title, geminiKey());
        res.setHeader("Cache-Control", LONG);
        return res.status(200).json({ status: "ok", method: "AI", via: "url-context", aiOn: true, url, speakers: sp, lead: "" });
      } catch (e) { aiErr = String(e.message || e); }
    }
    res.setHeader("Cache-Control", "s-maxage=1800");
    return res.status(200).json({ status: "blocked", url, speakers: [], ...(geminiKey() ? { aiErr } : {}) });
  };
  try {
    url = await resolveGoogleNews(link);
  } catch (e) {
    res.setHeader("Cache-Control", "s-maxage=600");
    return res.status(200).json({ status: "error", url, speakers: [], error: String(e.message || e) });
  }
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, "accept-language": "id-ID,id;q=0.9" }, redirect: "follow", signal: withTimeout(8000) });
    const html = await r.text();
    if (r.status >= 400 || /Just a moment|Attention Required|cf-browser-verification|verifies you are not a bot/i.test(html.slice(0, 5000))) return viaUrl("HTTP " + r.status);
    const lines = htmlToLines(html);
    if (!lines.length) return viaUrl("isi kosong");
    let speakers = [], method = "aturan", aiErr = "";
    const aiOn = !!(geminiKey() || (process.env.ANTHROPIC_API_KEY && process.env.USE_ANTHROPIC === "1"));
    if (aiOn) { try { const ai = await aiSpeakers(lines, title); if (ai) { speakers = ai; method = "AI"; } } catch (e) { aiErr = String(e.message || e); } }
    if (!speakers.length) speakers = extractSpeakersFromBody(lines);
    res.setHeader("Cache-Control", aiErr ? "s-maxage=600" : LONG);
    return res.status(200).json({ status: "ok", method, aiOn, ...(aiErr ? { aiErr } : {}), url, speakers, lead: (lines[0] || "").slice(0, 280), ...(req.query.debug ? { lines } : {}) });
  } catch (e) {
    return viaUrl(String(e.message || e));
  }
};
module.exports.htmlToLines = htmlToLines;
