/* BISA-MEUHABA — tampilan sinematik 3D untuk seluruh dashboard.
   Hero 3D yang digerakkan scroll, latar partikel 3D, donut & skyline 3D, word sphere 3D, kartu kaca.
   Dimuat setelah three.js, script dashboard, dan bisa3d.js. */
(function () {
  "use strict";
  const pane = document.getElementById("paneSentimen");
  if (!pane) return;
  const T = window.THREE;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const COL = { pos: 0x2fbf7a, neu: 0xa5b4c0, neg: 0xe8594d, gold: 0xf0b429, blue: 0x2f6fd0, navy: 0x12489a };
  const HEX = { positif: "#2fbf7a", netral: "#a5b4c0", negatif: "#e8594d" };

  /* ---------- huruf & gaya ---------- */
  const fl = document.createElement("link"); fl.rel = "stylesheet";
  fl.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@200;300&display=swap";
  document.head.appendChild(fl);
  const st = document.createElement("style");
  st.textContent = `
:root{--serif:"Instrument Serif",Georgia,serif;--glass:linear-gradient(160deg,rgba(255,255,255,.075),rgba(255,255,255,.02));--glass-line:rgba(255,255,255,.1)}
html[data-theme="dark"] body{background:#040b18;background-image:radial-gradient(60vw 50vh at 85% 8%,rgba(47,111,208,.22),transparent 70%),radial-gradient(50vw 45vh at 5% 40%,rgba(240,180,41,.08),transparent 70%),radial-gradient(70vw 60vh at 50% 110%,rgba(18,72,154,.25),transparent 70%);background-attachment:fixed}
html,body{overflow-x:clip}
#bgfx{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;opacity:.85}
header.top,main.wrap,.foot,.toast,.modal-bg{position:relative;z-index:1}
header.top{background:rgba(4,11,24,.62)!important;backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border-bottom:1px solid rgba(240,180,41,.55)!important;z-index:6}
.panel,.kpi,.notice,.filters,.issue{background:var(--glass)!important;border:1px solid var(--glass-line)!important;border-radius:18px!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 24px 60px -34px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.06)}
.issue.hot{border-color:rgba(232,89,77,.45)!important}
.notice{border-style:solid!important}
.panel{padding:20px!important}
.panel-h h2{font-weight:600;letter-spacing:-.01em;display:flex;align-items:baseline;gap:10px}
.chap{font:italic 400 22px/1 var(--serif);color:#f0b429;letter-spacing:0}
.kpi{padding:18px!important;overflow:hidden}
.kpi::before{content:"";position:absolute;inset:auto -30% -60% auto;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(47,111,208,.35),transparent 70%);pointer-events:none}
.kpi.pos::before{background:radial-gradient(circle,rgba(47,191,122,.35),transparent 70%)}
.kpi.neg::before{background:radial-gradient(circle,rgba(232,89,77,.35),transparent 70%)}
.kpi{position:relative}
.kpi .v{font-family:var(--serif)!important;font-size:44px!important;font-weight:400!important;letter-spacing:-.01em;line-height:1}
input,select,textarea{background:rgba(255,255,255,.05)!important;border-color:rgba(255,255,255,.12)!important;color:#e3ecef}
select option{background:#0b1a33;color:#e3ecef}
table tbody tr:hover{background:rgba(255,255,255,.035)}
.btn.primary{background:linear-gradient(135deg,#f0b429,#d9951a)!important;color:#0b1f45!important;border:0!important;box-shadow:0 8px 24px -10px rgba(240,180,41,.7)}
/* hero */
.hero3d{position:relative;margin:0 calc(50% - 50vw);width:100vw;height:calc((100svh - var(--hdr,88px)) * 2.15)}
.hero-stick{position:sticky;top:var(--hdr,88px);height:calc(100svh - var(--hdr,88px));overflow:hidden}
.hero-stick #b3d{height:100%!important;margin:0!important;border-radius:0!important;box-shadow:none!important;background:radial-gradient(120% 90% at 70% 10%,#123476 0%,#081e47 45%,#040b18 100%)!important}
.hero-stick #b3dCapHouse{display:none}
.hero-stick .b3d-top{top:18px;left:max(20px,calc(50vw - 640px));right:max(20px,calc(50vw - 640px))}
.hero-stick .b3d-cap{left:max(20px,calc(50vw - 640px))}
.hero-stick .b3d-ctl{right:max(20px,calc(50vw - 640px))}
.hero-copy{position:absolute;z-index:3;left:max(20px,calc(50vw - 640px));top:50%;transform:translateY(-50%);max-width:min(720px,92vw);pointer-events:none;will-change:opacity,transform}
.hero-copy .eb{font:600 12px/1 var(--f-body);letter-spacing:.22em;text-transform:uppercase;color:#9fb6da;display:flex;align-items:center;gap:12px}
.hero-copy .eb::before{content:"";width:34px;height:1px;background:#f0b429}
.hero-copy h1{font:200 clamp(46px,9vw,124px)/.92 "Plus Jakarta Sans",var(--f-display);letter-spacing:-.04em;color:#fff;margin:18px 0 6px;text-shadow:0 10px 40px rgba(0,0,0,.35)}
.hero-copy h1 b{font-weight:700;letter-spacing:-.05em}
.hero-copy .tag{font:italic 400 clamp(26px,3.6vw,46px)/1.05 var(--serif);color:#f0b429}
.hero-copy p{color:#c4d5f2;font-size:clamp(13px,1.2vw,15.5px);line-height:1.6;max-width:56ch;margin:16px 0 0}
.hero-cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px;pointer-events:auto}
.hero-cta a{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font:600 13px/1 var(--f-body);padding:13px 18px;border-radius:999px}
.hero-cta .a1{background:#f0b429;color:#0b1f45}
.hero-cta .a2{color:#eaf1ff;border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(8px)}
.hero-cue{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);z-index:3;font:600 10.5px/1 var(--f-body);letter-spacing:.25em;text-transform:uppercase;color:#9fb6da;display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none}
.hero-cue i{width:1px;height:42px;background:linear-gradient(#f0b429,transparent);animation:cue 1.8s ease-in-out infinite;transform-origin:top}
@keyframes cue{0%{transform:scaleY(0)}50%{transform:scaleY(1)}100%{transform:scaleY(0);transform-origin:bottom}}
.hero-rail{position:absolute;z-index:3;right:max(20px,calc(50vw - 640px));top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:18px;font:600 11px/1.2 var(--f-body);color:#7f97bf;text-align:right;pointer-events:none}
.hero-rail span{display:block;transition:color .4s}
.hero-rail span.on{color:#fff}
.hero-rail em{font:italic 400 20px/1 var(--serif);color:#f0b429;display:block;margin-bottom:3px}
.hero-rail .bar{position:absolute;right:-14px;top:0;bottom:0;width:2px;background:rgba(255,255,255,.12);border-radius:2px}
.hero-rail .bar b{position:absolute;left:0;right:0;top:0;background:#f0b429;border-radius:2px}
.hero-veil{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(90deg,rgba(4,11,24,.82) 0%,rgba(4,11,24,.45) 38%,transparent 65%)}
.hero3d.intro .b3d-ctl,.hero3d.intro .b3d-tabs{opacity:0;pointer-events:none}.b3d-ctl,.b3d-tabs{transition:opacity .4s}
@media (max-width:520px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}.kpi .v{font-size:34px!important}}
@media (max-width:760px){.hero-cue{display:none}.hero-rail{display:none}.hero-copy p{display:none}.hero-copy .eb{font-size:10px;letter-spacing:.16em}.hero-copy{top:auto;bottom:84px;transform:none}.hero-veil{background:linear-gradient(0deg,rgba(4,11,24,.9) 0%,rgba(4,11,24,.4) 55%,transparent 80%)}}
/* ringkasan 3D */
.sum3d{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:12px;margin-bottom:14px}
@media (max-width:900px){.sum3d{grid-template-columns:minmax(0,1fr)}}
.stage{position:relative;height:330px;border-radius:14px;overflow:hidden;background:radial-gradient(100% 90% at 50% 0%,rgba(47,111,208,.18),transparent 70%)}
.stage canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab}
.stage .tip3{position:absolute;z-index:3;pointer-events:none;background:rgba(4,14,34,.92);border:1px solid rgba(240,180,41,.55);border-radius:10px;padding:8px 10px;font-size:12px;line-height:1.45;color:#eaf1ff;transform:translate(12px,12px);white-space:nowrap}
.stage .tip3 b{color:#fff}
.donut-legend{position:absolute;left:14px;top:12px;z-index:2;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#c4d5f2;pointer-events:none}
.donut-legend div{display:flex;align-items:center;gap:8px}
.donut-legend i{width:10px;height:10px;border-radius:3px}
.donut-legend b{font:400 22px/1 var(--serif);color:#fff;min-width:56px}
.donut-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;z-index:2}
.donut-center b{display:block;font:400 46px/1 var(--serif);color:#fff}
.donut-center span{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#9fb6da}
.sky-leg{position:absolute;right:14px;top:12px;z-index:2;display:flex;gap:12px;font-size:12px;color:#c4d5f2;pointer-events:none}
.sky-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
/* word sphere */
.cloud.sph{position:relative;display:block!important;height:340px;perspective:900px;overflow:hidden;cursor:grab;touch-action:pan-y}
.cloud.sph span{position:absolute;left:50%;top:50%;white-space:nowrap;will-change:transform,opacity;user-select:none;text-shadow:0 0 18px currentColor}
`;
  document.head.appendChild(st);

  /* ---------- hero sinematik ---------- */
  const b3d = $("b3d");
  const hdr = document.querySelector("header.top");
  const setHdr = () => document.documentElement.style.setProperty("--hdr", (hdr ? hdr.offsetHeight : 0) + "px");
  setHdr(); addEventListener("resize", setHdr);
  let hero = null, copy = null, rail = null, cue = null;
  if (b3d) {
    hero = document.createElement("div"); hero.className = "hero3d"; hero.id = "hero3d";
    const stick = document.createElement("div"); stick.className = "hero-stick"; hero.appendChild(stick);
    const h1 = pane.querySelector("h1"), lede = pane.querySelector(".lede"), eb = pane.querySelector(".eyebrow");
    stick.appendChild(b3d);
    stick.insertAdjacentHTML("beforeend", `<div class="hero-veil"></div>
      <div class="hero-copy" id="heroCopy"><div class="eb">KPw BI Provinsi Aceh · Dashboard Sentimen</div>
        <h1><b>BISA</b>·MEUHABA</h1><div class="tag">Peugah lage na, sesuai bak asa.</div>
        <p>${lede ? lede.innerHTML : ""}</p>
        <div class="hero-cta"><a class="a1" href="#dataStart">Jelajahi data ↓</a><a class="a2" href="#" id="heroMap">Lihat peta sentimen 3D</a></div></div>
      <div class="hero-rail" id="heroRail"><div class="bar"><b></b></div><span class="on"><em>01</em>Rumoh Aceh</span><span><em>02</em>Peta Sentimen</span><span><em>03</em>Data & Analisis</span></div>
      <div class="hero-cue" id="heroCue">Gulir<i></i></div>`);
    pane.insertBefore(hero, pane.firstChild);
    [h1, lede, eb].forEach((e) => e && (e.hidden = true));
    const anchor = document.createElement("div"); anchor.id = "dataStart"; anchor.style.scrollMarginTop = "calc(var(--hdr,88px) + 12px)";
    hero.insertAdjacentElement("afterend", anchor);
    copy = $("heroCopy"); rail = $("heroRail"); cue = $("heroCue");
    const toP = (p) => { const r = hero.getBoundingClientRect(), span = hero.offsetHeight - stick.offsetHeight; scrollTo({ top: scrollY + r.top - (hdr ? hdr.offsetHeight : 0) + span * p, behavior: REDUCED ? "auto" : "smooth" }); };
    window.BISA3D_TAB = (v) => toP(v === "map" ? 1 : 0);
    $("heroMap").onclick = (e) => { e.preventDefault(); toP(1); };
  }
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function onScroll() {
    if (!hero) return;
    const stick = hero.firstChild, span = hero.offsetHeight - stick.offsetHeight;
    const p = Math.min(1, Math.max(0, ((hdr ? hdr.offsetHeight : 0) - hero.getBoundingClientRect().top) / Math.max(1, span)));
    if (window.BISA3D) window.BISA3D.setScrub(p);
    const f = 1 - sstep(0.04, 0.32, p);
    copy.style.opacity = f; copy.style.transform = innerWidth > 760 ? `translateY(calc(-50% - ${p * 120}px))` : `translateY(${-p * 90}px)`;
    copy.querySelector(".hero-cta").style.pointerEvents = f > 0.5 ? "auto" : "none";
    cue.style.opacity = 1 - sstep(0, 0.12, p); hero.classList.toggle("intro", f > 0.4);
    hero.querySelector(".hero-veil").style.opacity = f;
    rail.querySelector(".bar b").style.height = (Math.min(1, p) * 100) + "%";
    const spans = rail.querySelectorAll("span"); spans.forEach((s, i) => s.classList.toggle("on", i === (p < 0.5 ? 0 : p < 0.98 ? 1 : 2)));
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);

  /* ---------- latar partikel 3D (seluruh halaman) ---------- */
  function background() {
    if (!T) return;
    const cv = document.createElement("canvas"); cv.id = "bgfx"; cv.setAttribute("aria-hidden", "true"); document.body.prepend(cv);
    let r; try { r = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: false }); } catch (e) { cv.remove(); return; }
    r.setPixelRatio(1);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(60, 1, 0.1, 400); cam.position.set(0, 0, 40);
    const N = innerWidth < 700 ? 900 : 1800, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const cs = [new T.Color(0x4f8ff0), new T.Color(0x9ec1ff), new T.Color(COL.gold), new T.Color(0x2fbf7a)];
    for (let i = 0; i < N; i++) { pos.set([(Math.random() - 0.5) * 160, (Math.random() - 0.5) * 260, (Math.random() - 0.5) * 120], i * 3); const c = cs[i % 11 === 0 ? 2 : i % 17 === 0 ? 3 : i % 3 === 0 ? 1 : 0]; col.set([c.r, c.g, c.b], i * 3); }
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(pos, 3)); g.setAttribute("color", new T.BufferAttribute(col, 3));
    const pts = new T.Points(g, new T.PointsMaterial({ size: 0.38, vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false, blending: T.AdditiveBlending }));
    scene.add(pts);
    // garis-garis orbit emas yang melayang pelan
    const rings = [];
    for (let i = 0; i < 3; i++) { const m = new T.Mesh(new T.TorusGeometry(26 + i * 9, 0.05, 6, 160), new T.MeshBasicMaterial({ color: i === 1 ? COL.gold : 0x2f6fd0, transparent: true, opacity: 0.18 })); m.rotation.x = 1.1 + i * 0.25; m.position.set(18 - i * 12, -40 - i * 70, -30); scene.add(m); rings.push(m); }
    const size = () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
    size(); addEventListener("resize", size);
    let mx = 0, my = 0; addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
    let on = true; document.addEventListener("visibilitychange", () => { on = !document.hidden; if (on) requestAnimationFrame(loop); });
    function loop(now) {
      if (!on) return; requestAnimationFrame(loop);
      const t = now / 1000, sy = scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
      cam.position.y += ((-sy * 150 + 20) - cam.position.y) * 0.08;
      cam.position.x += (mx * 6 - cam.position.x) * 0.04; cam.lookAt(0, cam.position.y - 4 - my * 4, 0);
      if (!REDUCED) { pts.rotation.y = t * 0.012; rings.forEach((m, i) => (m.rotation.z = t * (0.03 + i * 0.01))); }
      r.render(scene, cam);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- pembantu adegan 3D kecil ---------- */
  function label(text, color, w = 2.6) {
    const c = document.createElement("canvas"); c.width = 256; c.height = 64; const x = c.getContext("2d");
    x.font = "600 26px 'Plus Jakarta Sans', system-ui, sans-serif"; x.fillStyle = color || "#c4d5f2"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, 128, 34);
    const s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false })); s.scale.set(w, w / 4, 1); return s;
  }
  function stage(host, o) {
    const cv = document.createElement("canvas"); cv.setAttribute("aria-hidden", "true"); host.appendChild(cv);
    const tip = document.createElement("div"); tip.className = "tip3"; tip.hidden = true; host.appendChild(tip);
    let r; try { r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return null; }
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(o.fov || 34, 1, 0.1, 200);
    scene.add(new T.HemisphereLight(0xdbe8ff, 0x14284a, 1.1)); const d = new T.DirectionalLight(0xffffff, 0.9); d.position.set(6, 14, 10); scene.add(d);
    const g = new T.DirectionalLight(COL.gold, 0.35); g.position.set(-8, 4, -6); scene.add(g);
    const S = { th: o.th, ph: o.ph, r: o.r, t: new T.Vector3(...o.t) }, api = { scene, cam, S, picks: [], tick: null };
    let drag = null, last = 0, hovered = null; const ray = new T.Raycaster(), m = new T.Vector2();
    cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, id: e.pointerId, type: e.pointerType }; last = performance.now(); });
    addEventListener("pointermove", (e) => {
      if (drag && e.pointerId === drag.id) { S.th -= (e.clientX - drag.x) * 0.008; if (drag.type === "mouse") S.ph = Math.max(0.35, Math.min(1.45, S.ph - (e.clientY - drag.y) * 0.005)); drag.x = e.clientX; drag.y = e.clientY; last = performance.now(); tip.hidden = true; return; }
      if (e.target !== cv) return;
      const b = cv.getBoundingClientRect(); m.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
      ray.setFromCamera(m, cam); const hit = ray.intersectObjects(api.picks, false)[0];
      if (hovered && hovered !== (hit && hit.object)) hovered.material.emissive.setHex(hovered.userData.em || 0);
      hovered = hit ? hit.object : null;
      if (!hovered || !o.tip) { tip.hidden = true; cv.style.cursor = ""; return; }
      hovered.material.emissive.setHex(0x333333); cv.style.cursor = "pointer";
      tip.innerHTML = o.tip(hovered.userData); let x = e.clientX - b.left, y = e.clientY - b.top; if (x > b.width - 200) x -= 200;
      tip.style.left = x + "px"; tip.style.top = y + "px"; tip.hidden = false;
    });
    addEventListener("pointerup", () => (drag = null)); addEventListener("pointercancel", () => (drag = null));
    cv.addEventListener("pointerleave", () => { tip.hidden = true; if (hovered) { hovered.material.emissive.setHex(hovered.userData.em || 0); hovered = null; } });
    const size = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    new ResizeObserver(size).observe(host); size();
    let vis = false, run = false;
    const go = () => { if (vis && !document.hidden && !run) { run = true; requestAnimationFrame(loop); } };
    new IntersectionObserver((es) => { vis = es[0].isIntersecting; if (!vis) run = false; go(); }).observe(host);
    document.addEventListener("visibilitychange", () => { if (document.hidden) run = false; go(); });
    function loop(now) {
      if (!run) return; requestAnimationFrame(loop);
      if (!REDUCED && !drag && now - last > 3000) S.th += o.spin || 0.002;
      const sp = Math.sin(S.ph); cam.position.set(S.t.x + S.r * sp * Math.sin(S.th), S.t.y + S.r * Math.cos(S.ph), S.t.z + S.r * sp * Math.cos(S.th)); cam.lookAt(S.t);
      api.tick && api.tick(now / 1000); r.render(scene, cam);
    }
    return api;
  }
  const clear = (grp) => { while (grp.children.length) { const o = grp.children.pop(); o.geometry && o.geometry.dispose(); if (o.material) { o.material.map && o.material.map.dispose(); o.material.dispose(); } } };
  const mat = (c, em) => new T.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.2, emissive: em || 0, transparent: true, opacity: 0.95 });

  /* ---------- Ringkasan 3D: donut komposisi + skyline mingguan ---------- */
  let donut = null, sky = null, dG = null, sG = null;
  function buildSummary() {
    const kpis = $("kpis"); if (!kpis || !T) return;
    const wrap = document.createElement("div"); wrap.className = "sum3d";
    wrap.innerHTML = `<div class="panel"><div class="panel-h"><h2>Komposisi sentimen 3D</h2><span>tebal irisan = porsi sentimen · seret untuk memutar</span></div>
        <div class="stage" id="stDonut"><div class="donut-center"><b id="dcNum">–</b><span>Net sentiment</span></div><div class="donut-legend" id="dcLeg"></div></div></div>
      <div class="panel"><div class="panel-h"><h2>Skyline sentimen mingguan</h2><span>tiap menara = jumlah berita per minggu · arahkan untuk detail</span></div>
        <div class="stage" id="stSky"><div class="sky-leg"><span><i style="background:${HEX.positif}"></i>Positif</span><span><i style="background:${HEX.netral}"></i>Netral</span><span><i style="background:${HEX.negatif}"></i>Negatif</span></div></div></div>`;
    kpis.insertAdjacentElement("afterend", wrap);
    donut = stage($("stDonut"), { t: [0, 0.4, 0], r: 14.5, th: 0.5, ph: 0.95, spin: 0.003, tip: (u) => `<b>${u.k}</b> · ${u.n} berita (${u.p}%)` });
    sky = stage($("stSky"), { t: [0, 2.0, 0.4], r: 15.5, th: -0.42, ph: 1.18, spin: 0.0012, tip: (u) => `<b>${u.w}</b><br>${u.n} berita ${u.k}` });
    if (donut) { dG = new T.Group(); donut.scene.add(dG); donut.tick = (t) => { dG.children.forEach((m) => { if (m.userData.g < 1) { m.userData.g = Math.min(1, m.userData.g + (REDUCED ? 1 : 0.04)); m.scale.z = Math.max(0.01, m.userData.g); } }); }; }
    if (sky) { sG = new T.Group(); sky.scene.add(sG); sky.tick = () => { sG.children.forEach((m) => { if (m.userData.g !== undefined && m.userData.g < 1) { m.userData.g = Math.min(1, m.userData.g + (REDUCED ? 1 : 0.03)); const e = 1 - Math.pow(1 - m.userData.g, 3); m.scale.y = Math.max(0.01, e); m.position.y = (m.userData.h * e) / 2; } }); };
      const base = new T.Mesh(new T.BoxGeometry(17, 0.16, 4.2), new T.MeshStandardMaterial({ color: 0x0b2a63, roughness: 0.5, metalness: 0.3, transparent: true, opacity: 0.8 })); base.position.y = -0.1; sky.scene.add(base);
      const edge = new T.LineSegments(new T.EdgesGeometry(base.geometry), new T.LineBasicMaterial({ color: COL.gold })); edge.position.copy(base.position); sky.scene.add(edge); }
  }
  function updateSummary(list) {
    const c = { positif: 0, netral: 0, negatif: 0 }; list.forEach((p) => c[p.sentiment] !== undefined && c[p.sentiment]++);
    const n = list.length || 1, net = Math.round(((c.positif - c.negatif) / n) * 100);
    if ($("dcNum")) { $("dcNum").textContent = (net > 0 ? "+" : "") + net; $("dcNum").style.color = net >= 0 ? HEX.positif : HEX.negatif; }
    if ($("dcLeg")) $("dcLeg").innerHTML = ["positif", "netral", "negatif"].map((k) => `<div><i style="background:${HEX[k]}"></i><b>${Math.round((c[k] / n) * 100)}%</b>${k} · ${c[k]}</div>`).join("");
    if (dG) {
      clear(dG); let a0 = Math.PI / 2;
      ["positif", "netral", "negatif"].forEach((k) => {
        const share = c[k] / n; if (!share) return; const a1 = a0 - share * Math.PI * 2 + 0.03;
        const sh = new T.Shape(); sh.absarc(0, 0, 3.6, a0, a1, true); sh.absarc(0, 0, 2.15, a1, a0, false); sh.closePath();
        const depth = 0.5 + share * 2.2, em = k === "negatif" ? 0x2a0806 : 0x04140c;
        const m = new T.Mesh(new T.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 48 }), mat(COL[k === "positif" ? "pos" : k === "netral" ? "neu" : "neg"], em));
        m.rotation.x = -Math.PI / 2; m.userData = { k, n: c[k], p: Math.round(share * 100), g: 0, em }; m.scale.z = 0.01; dG.add(m); a0 = a1 - 0.03;
      });
      donut.picks = dG.children;
    }
    if (sG) {
      [...sG.children].forEach((o) => { sG.remove(o); o.geometry && o.geometry.dispose(); if (o.material) { o.material.map && o.material.map.dispose(); o.material.dispose(); } });
      const by = {}; list.forEach((p) => { const k = window.weekKey ? weekKey(p.date) : ""; (by[k] ||= { positif: 0, netral: 0, negatif: 0 })[p.sentiment]++; });
      const keys = Object.keys(by).sort().slice(-10), max = Math.max(4, ...keys.flatMap((k) => Object.values(by[k]))), U = 5.2 / max;
      const W = keys.length, gap = Math.min(1.7, 15 / Math.max(1, W));
      keys.forEach((k, i) => {
        const x = (i - (W - 1) / 2) * gap, wl = new Date(k).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
        ["positif", "netral", "negatif"].forEach((s, j) => {
          const v = by[k][s]; const h = Math.max(0.06, v * U), em = s === "negatif" ? 0x2a0806 : 0x04140c;
          const m = new T.Mesh(new T.BoxGeometry(gap * 0.26, h, gap * 0.26), mat(COL[s === "positif" ? "pos" : s === "netral" ? "neu" : "neg"], em));
          m.position.set(x + (j - 1) * gap * 0.3, h / 2, 0); m.userData = { w: "Minggu " + wl, k: s, n: v, h, g: 0, em }; m.scale.y = 0.01; sG.add(m);
        });
        const l = label(wl, "#c4d5f2", 2.8); l.position.set(x, -0.15, 2.6); sG.add(l);
      });
      sky.picks = sG.children.filter((o) => o.isMesh);
    }
  }

  /* ---------- word sphere 3D ---------- */
  const SPH = { ax: 0.3, ay: 0, vx: 0.0012, vy: 0.0035, items: [], drag: null, vis: false };
  function sphereify() {
    const box = $("cloud"); if (!box) return; const spans = [...box.querySelectorAll("span")]; if (!spans.length) return;
    box.classList.add("sph"); const n = spans.length;
    SPH.items = spans.map((s, i) => { const y = 1 - (i / Math.max(1, n - 1)) * 2, rr = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i; s.style.transform = "translate(-50%,-50%)"; return { s, p: [Math.cos(th) * rr, y, Math.sin(th) * rr] }; });
  }
  function sphereLoop() {
    requestAnimationFrame(sphereLoop);
    if (!SPH.vis || !SPH.items.length) return;
    const box = $("cloud"), R = Math.min(box.clientWidth * 0.46, box.clientHeight * 0.47);
    if (!SPH.drag && !REDUCED) { SPH.ay += SPH.vy; SPH.ax += SPH.vx; }
    const cx = Math.cos(SPH.ax), sx = Math.sin(SPH.ax), cy = Math.cos(SPH.ay), sy = Math.sin(SPH.ay);
    for (const it of SPH.items) {
      let [x, y, z] = it.p; const x1 = x * cy + z * sy, z1 = -x * sy + z * cy; const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      const d = (z2 + 1) / 2; it.s.style.transform = `translate(-50%,-50%) translate3d(${(x1 * R).toFixed(1)}px,${(y2 * R).toFixed(1)}px,${(z2 * R).toFixed(1)}px)`;
      it.s.style.opacity = (0.25 + d * 0.75).toFixed(2); it.s.style.zIndex = Math.round(d * 100); it.s.style.filter = d < 0.35 ? "blur(1px)" : "none";
    }
  }
  function sphereEvents() {
    const box = $("cloud"); if (!box) return;
    new IntersectionObserver((es) => (SPH.vis = es[0].isIntersecting)).observe(box);
    box.addEventListener("pointerdown", (e) => (SPH.drag = { x: e.clientX, y: e.clientY }));
    addEventListener("pointermove", (e) => { if (!SPH.drag) return; SPH.ay += (e.clientX - SPH.drag.x) * 0.006; SPH.ax += (e.clientY - SPH.drag.y) * 0.006; SPH.drag = { x: e.clientX, y: e.clientY }; });
    addEventListener("pointerup", () => (SPH.drag = null));
    requestAnimationFrame(sphereLoop);
  }

  /* ---------- angka KPI menghitung naik + nomor bab ---------- */
  function countUp() {
    if (REDUCED) return;
    document.querySelectorAll("#kpis .kpi .v").forEach((el) => {
      const m = el.textContent.trim().match(/^([+\-−]?)([\d.,]+)(%?)$/); if (!m) return;
      const pct = !!m[3], dec = pct && /[.,]\d/.test(m[2]) ? 1 : 0;
      const target = pct ? parseFloat(m[2].replace(",", ".")) : parseInt(m[2].replace(/[.,]/g, ""), 10); if (!isFinite(target)) return;
      const fmt = (v) => m[1] + (pct ? v.toFixed(dec) : new Intl.NumberFormat("id-ID").format(Math.round(v))) + m[3];
      const t0 = performance.now(), D = 900;
      const step = (now) => { const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(target * e); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  function chapters() {
    let i = 2; // 01 = hero
    pane.querySelectorAll(".panel-h h2").forEach((h) => { if (!h.querySelector(".chap")) h.insertAdjacentHTML("afterbegin", `<span class="chap">${String(i).padStart(2, "0")}</span>`); i++; });
  }

  /* ---------- sambungkan ke dashboard ---------- */
  buildSummary(); sphereEvents();
  const base = window.renderAll;
  window.renderAll = function () {
    base();
    try { const list = window.filtered(); updateSummary(list); sphereify(); countUp(); chapters(); } catch (e) { console.warn("cinema", e); }
  };
  background();
  document.documentElement.setAttribute("data-theme", "dark"); // memicu renderAll() lewat MutationObserver dashboard
  onScroll();
})();
