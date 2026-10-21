/* BISA-MEUHABA 3D — Rumoh Aceh 3D, Peta Sentimen Aceh 3D, dan efek 3D kartu dashboard.
   Butuh three.js r128 (dimuat sebelum file ini). Data diambil dari dashboard: filtered(), renderAll(), F. */
(function () {
  "use strict";
  if (!window.THREE || !document.getElementById("paneSentimen")) return;
  const T = window.THREE;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- batas kabupaten/kota (GADM, disederhanakan) ---------- */
  const ACEH = {"Aceh Barat":[[[96.57,4.58],[96.33,4.43],[96.34,4.28],[96.29,4.27],[96.26,4.22],[96.33,4.11],[96.24,4.06],[96.06,4.21],[96.03,4.19],[95.84,4.4],[95.91,4.44],[96.0,4.69],[96.02,4.71],[96.05,4.66],[96.12,4.76],[96.21,4.76],[96.27,4.79],[96.26,4.71],[96.37,4.69],[96.45,4.62],[96.5,4.63]]],"Aceh Barat Daya":[[[97.12,3.82],[97.25,3.66],[97.05,3.47],[97.0,3.55],[96.9,3.6],[96.86,3.7],[96.74,3.75],[96.62,3.74],[96.58,3.84],[96.6,3.89],[96.63,3.96],[96.71,4.01],[96.72,4.1],[96.79,4.05],[96.84,3.95],[97.1,3.94]]],"Aceh Besar":[[[95.73,5.57],[95.72,5.5],[95.78,5.46],[95.75,5.43],[95.74,5.34],[95.79,5.29],[95.78,5.23],[95.84,5.17],[95.82,5.09],[95.72,5.06],[95.65,5.07],[95.65,5.16],[95.58,5.21],[95.4,5.21],[95.36,5.25],[95.31,5.17],[95.24,5.22],[95.25,5.27],[95.21,5.28],[95.21,5.31],[95.25,5.37],[95.24,5.46],[95.19,5.53],[95.23,5.58],[95.33,5.48],[95.42,5.54],[95.37,5.6],[95.43,5.66],[95.52,5.6],[95.61,5.63]],[[95.15,5.66],[95.19,5.61],[95.13,5.6],[95.12,5.61]],[[95.06,5.75],[95.13,5.69],[95.14,5.66],[95.06,5.65],[95.04,5.71],[95.06,5.72],[95.01,5.72]]],"Aceh Jaya":[[[95.75,5.07],[95.99,4.78],[96.02,4.71],[95.91,4.44],[95.84,4.4],[95.61,4.62],[95.57,4.63],[95.58,4.66],[95.54,4.66],[95.49,4.75],[95.42,4.82],[95.36,5.04],[95.28,5.12],[95.34,5.18],[95.33,5.23],[95.37,5.25],[95.4,5.21],[95.58,5.21],[95.65,5.16],[95.65,5.07]]],"Aceh Selatan":[[[97.84,2.92],[97.8,2.84],[97.77,2.63],[97.66,2.42],[97.65,2.67],[97.6,2.87],[97.4,2.96],[97.32,3.06],[97.26,3.22],[97.17,3.26],[97.05,3.47],[97.25,3.66],[97.28,3.64],[97.29,3.6],[97.37,3.64],[97.45,3.63],[97.48,3.55],[97.4,3.45],[97.47,3.33],[97.48,3.22],[97.61,3.1],[97.64,2.98],[97.79,2.96]]],"Aceh Singkil":[[[97.12,2.11],[97.16,2.07],[97.11,2.0],[97.08,2.08]],[[97.24,2.24],[97.3,2.23],[97.3,2.19],[97.34,2.16],[97.36,2.09],[97.34,2.07],[97.35,2.07],[97.34,2.03],[97.24,2.17],[97.11,2.21],[97.17,2.24],[97.22,2.2]],[[97.95,2.92],[98.11,2.79],[98.09,2.73],[98.13,2.66],[98.09,2.63],[98.08,2.58],[98.11,2.42],[98.16,2.41],[98.19,2.32],[98.15,2.15],[97.95,2.27],[97.88,2.24],[97.89,2.28],[97.85,2.25],[97.81,2.27],[97.78,2.23],[97.66,2.4],[97.79,2.67],[97.82,2.89],[97.84,2.92]]],"Aceh Tamiang":[[[98.24,4.29],[98.2,4.3],[98.07,4.25],[98.09,4.22],[98.06,4.19],[98.07,4.15],[98.04,4.1],[98.03,3.99],[97.95,3.89],[97.82,4.01],[97.8,4.09],[97.75,4.12],[97.72,4.19],[97.72,4.26],[97.79,4.39],[98.0,4.43],[98.09,4.52],[98.17,4.5],[98.17,4.47],[98.21,4.48],[98.26,4.41],[98.27,4.41],[98.28,4.42],[98.29,4.42],[98.28,4.33]]],"Aceh Tengah":[[[96.78,4.95],[96.87,4.87],[96.98,4.86],[97.02,4.91],[97.14,4.91],[97.26,4.86],[97.28,4.81],[97.26,4.73],[97.32,4.74],[97.33,4.72],[97.31,4.67],[97.27,4.66],[97.26,4.63],[97.31,4.62],[97.33,4.55],[97.28,4.51],[97.35,4.5],[97.37,4.38],[97.35,4.21],[97.25,4.17],[97.2,4.25],[97.15,4.28],[96.98,4.16],[96.82,4.28],[96.76,4.29],[96.71,4.33],[96.72,4.4],[96.63,4.41],[96.64,4.55],[96.5,4.63],[96.45,4.62],[96.37,4.69],[96.26,4.71],[96.28,4.78],[96.47,4.76],[96.47,4.89],[96.56,4.94],[96.65,4.97]]],"Aceh Tenggara":[[[97.83,3.76],[97.8,3.72],[97.87,3.57],[97.96,3.48],[97.93,3.44],[97.95,3.39],[98.03,3.33],[97.98,3.28],[97.87,3.25],[97.93,3.23],[97.98,3.11],[97.97,3.07],[97.93,3.06],[97.95,2.92],[97.84,2.92],[97.79,2.96],[97.64,2.98],[97.61,3.1],[97.48,3.22],[97.47,3.33],[97.4,3.45],[97.48,3.55],[97.46,3.62],[97.37,3.64],[97.29,3.6],[97.28,3.64],[97.22,3.68],[97.45,3.68],[97.58,3.74]]],"Aceh Timur":[[[98.02,4.61],[97.89,4.49],[97.84,4.52],[97.76,4.52],[97.78,4.42],[97.85,4.43],[97.92,4.41],[97.79,4.39],[97.72,4.26],[97.64,4.22],[97.6,4.24],[97.5,4.15],[97.36,4.22],[97.37,4.38],[97.35,4.5],[97.28,4.51],[97.33,4.55],[97.31,4.61],[97.26,4.62],[97.26,4.66],[97.31,4.67],[97.33,4.76],[97.41,4.85],[97.47,5.0],[97.51,5.03],[97.46,5.11],[97.5,5.21],[97.49,5.25],[97.65,5.12],[97.64,5.08],[97.81,4.93],[97.9,4.89],[97.96,4.67]]],"Aceh Utara":[[[97.16,5.15],[97.49,5.25],[97.5,5.21],[97.46,5.11],[97.51,5.03],[97.47,5.0],[97.41,4.85],[97.32,4.73],[97.26,4.73],[97.28,4.82],[97.21,4.89],[97.02,4.91],[96.98,4.86],[96.87,4.87],[96.78,4.95],[96.81,5.04],[96.85,5.09],[96.85,5.25],[96.88,5.24],[96.98,5.26],[96.98,5.12],[97.01,5.1],[97.05,5.0]]],"Banda Aceh":[[[95.37,5.6],[95.42,5.54],[95.3,5.49],[95.26,5.55]]],"Bireuen":[[[96.85,5.27],[96.87,5.17],[96.84,5.16],[96.85,5.09],[96.81,5.04],[96.78,4.95],[96.63,4.97],[96.47,4.89],[96.44,4.93],[96.33,4.96],[96.38,5.05],[96.33,5.23],[96.38,5.2],[96.42,5.2],[96.47,5.24],[96.53,5.2],[96.73,5.25],[96.71,5.23],[96.75,5.23]]],"Gayo Lues":[[[97.36,4.22],[97.5,4.15],[97.6,4.24],[97.64,4.22],[97.73,4.25],[97.74,4.14],[97.8,4.09],[97.82,4.02],[97.9,3.93],[97.91,3.82],[97.83,3.76],[97.58,3.74],[97.45,3.68],[97.22,3.68],[97.12,3.82],[97.1,3.94],[96.84,3.95],[96.79,4.05],[96.72,4.1],[96.8,4.22],[96.79,4.28],[96.98,4.16],[97.15,4.28],[97.2,4.25],[97.25,4.17]]],"Langsa":[[[98.09,4.53],[98.03,4.45],[97.92,4.41],[97.85,4.43],[97.78,4.42],[97.76,4.51],[97.84,4.52],[97.89,4.49],[97.97,4.55],[97.96,4.53],[98.04,4.53],[98.07,4.55]]],"Lhokseumawe":[[[97.16,5.15],[97.05,5.0],[97.01,5.1],[96.98,5.12],[96.98,5.26],[97.12,5.22]]],"Nagan Raya":[[[96.79,4.28],[96.8,4.22],[96.74,4.16],[96.71,4.01],[96.63,3.96],[96.6,3.89],[96.58,3.84],[96.62,3.74],[96.52,3.74],[96.38,3.85],[96.24,4.05],[96.33,4.11],[96.26,4.22],[96.29,4.27],[96.34,4.28],[96.33,4.43],[96.57,4.58],[96.66,4.54],[96.63,4.5],[96.65,4.47],[96.63,4.41],[96.72,4.4],[96.71,4.33]]],"Pidie":[[[95.73,5.57],[95.89,5.5],[95.89,5.42],[96.1,5.29],[96.09,5.26],[96.26,5.26],[96.33,5.23],[96.38,5.05],[96.32,4.97],[96.45,4.92],[96.47,4.76],[96.27,4.79],[96.21,4.76],[96.12,4.76],[96.08,4.69],[96.03,4.66],[95.99,4.78],[95.75,5.07],[95.82,5.09],[95.84,5.14],[95.78,5.23],[95.79,5.29],[95.74,5.34],[95.75,5.43],[95.78,5.46],[95.72,5.5]]],"Sabang":[[[95.22,5.91],[95.3,5.84],[95.33,5.9],[95.38,5.81],[95.35,5.83],[95.33,5.77],[95.28,5.78]]],"Simeulue":[[[96.65,2.12],[96.69,2.09],[96.65,2.06],[96.61,2.11]],[[96.23,2.34],[96.17,2.33],[96.16,2.37],[96.19,2.39]],[[95.8,2.93],[95.8,2.91],[95.91,2.89],[95.91,2.85],[95.87,2.86],[95.89,2.83],[95.92,2.85],[96.01,2.77],[96.1,2.75],[96.09,2.75],[96.08,2.73],[96.11,2.74],[96.15,2.69],[96.1,2.68],[96.11,2.64],[96.15,2.65],[96.18,2.62],[96.15,2.67],[96.17,2.67],[96.25,2.59],[96.34,2.55],[96.39,2.46],[96.41,2.46],[96.4,2.51],[96.45,2.48],[96.5,2.36],[96.44,2.33],[96.35,2.34],[96.32,2.35],[96.34,2.39],[96.31,2.38],[96.31,2.42],[96.23,2.44],[96.08,2.57],[96.02,2.59],[95.95,2.57],[95.86,2.64],[95.8,2.63],[95.76,2.71],[95.72,2.74],[95.73,2.76],[95.69,2.77],[95.72,2.82],[95.79,2.83],[95.76,2.88]]]};
  // kabupaten/kota hasil pemekaran yang belum punya batas sendiri di data GADM -> wilayah induk + koordinat ibu kota
  const SUB = { "Bener Meriah": { p: "Aceh Tengah", c: [96.86, 4.73] }, "Pidie Jaya": { p: "Pidie", c: [96.2, 5.16] }, "Subulussalam": { p: "Aceh Singkil", c: [97.96, 2.68] } };
  const PIN = { "Banda Aceh": [95.33, 5.55], "Sabang": [95.32, 5.86], "Lhokseumawe": [97.12, 5.16], "Langsa": [97.95, 4.48], "Aceh Besar": [95.55, 5.35], "Pidie": [96.0, 5.2] };
  // urutan penting: nama yang lebih panjang/spesifik dulu
  const KW = [
    ["Aceh Barat Daya", /aceh barat daya|\babdya\b|blangpidie/], ["Aceh Barat", /aceh barat|meulaboh/], ["Banda Aceh", /banda aceh/],
    ["Aceh Besar", /aceh besar|jantho/], ["Pidie Jaya", /pidie jaya|meureudu/], ["Pidie", /\bpidie\b|\bsigli\b/], ["Sabang", /\bsabang\b/],
    ["Lhokseumawe", /lhokseumawe/], ["Langsa", /\blangsa\b/], ["Aceh Utara", /aceh utara|lhoksukon/], ["Aceh Timur", /aceh timur/],
    ["Aceh Tamiang", /tamiang|kuala simpang/], ["Bener Meriah", /bener meriah|redelong/], ["Aceh Tengah", /aceh tengah|takengon/],
    ["Gayo Lues", /gayo lues|blangkejeren/], ["Aceh Tenggara", /aceh tenggara|kutacane/], ["Aceh Selatan", /aceh selatan|tapaktuan/],
    ["Subulussalam", /subulussalam/], ["Aceh Singkil", /singkil/], ["Nagan Raya", /nagan raya/], ["Aceh Jaya", /aceh jaya|\bcalang\b/],
    ["Simeulue", /simeulue/], ["Bireuen", /bireuen/],
  ];
  const regionOf = (p) => { const t = ((p.text || "") + " " + (p.author || "")).toLowerCase(); for (const [n, re] of KW) if (re.test(t)) return n; return null; };
  const polyOf = (name) => (SUB[name] ? SUB[name].p : name);

  /* ---------- gaya ---------- */
  const st = document.createElement("style");
  st.textContent = `
.b3d{position:relative;height:clamp(360px,46vw,500px);margin:14px 0 16px;border-radius:14px;overflow:hidden;
  background:radial-gradient(120% 90% at 70% 10%,#173f86 0%,#0a2556 45%,#061630 100%);color:#eaf1ff;isolation:isolate;
  box-shadow:0 18px 40px -18px rgba(6,22,48,.55)}
.b3d canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab}
.b3d canvas:active{cursor:grabbing}
.b3d-top{position:absolute;left:14px;right:14px;top:12px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;pointer-events:none;z-index:2}
.b3d-tabs{display:flex;gap:4px;background:rgba(4,14,34,.55);border:1px solid rgba(240,180,41,.35);border-radius:999px;padding:3px;pointer-events:auto;backdrop-filter:blur(6px)}
.b3d-tabs button{appearance:none;border:0;background:transparent;color:#cfe0ff;font:600 12px/1 var(--f-body);padding:8px 12px;border-radius:999px;cursor:pointer}
.b3d-tabs button[aria-selected="true"]{background:#f0b429;color:#0b1f45}
.b3d-tabs button:focus-visible{outline:2px solid #f0b429;outline-offset:2px}
.b3d-chip{pointer-events:auto;display:none;align-items:center;gap:6px;background:rgba(240,180,41,.95);color:#0b1f45;border:0;border-radius:999px;padding:7px 12px;font:700 12px/1 var(--f-body);cursor:pointer}
.b3d-chip.on{display:inline-flex}
.b3d-cap{position:absolute;left:18px;bottom:16px;max-width:min(420px,70%);z-index:2;pointer-events:none;transition:opacity .5s,transform .5s}
.b3d-cap.hide{opacity:0;transform:translateY(10px)}
.b3d-cap .t{font:800 clamp(20px,2.6vw,30px)/1.1 var(--f-display);letter-spacing:-.01em;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.4)}
.b3d-cap .g{font:italic 600 clamp(14px,1.6vw,18px)/1.3 var(--f-display);color:#f0b429;margin-top:4px}
.b3d-cap .d{font-size:12.5px;color:#c4d5f2;margin-top:6px;line-height:1.45}
.b3d-cap .d b{color:#fff;font-variant-numeric:tabular-nums}
.b3d-leg{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;font-size:11.5px;color:#c4d5f2}
.b3d-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.b3d-ctl{position:absolute;right:12px;bottom:12px;display:flex;flex-direction:column;gap:6px;z-index:2}
.b3d-ctl button{width:34px;height:34px;border-radius:9px;border:1px solid rgba(240,180,41,.4);background:rgba(4,14,34,.6);color:#eaf1ff;font:700 16px/1 var(--f-body);cursor:pointer;backdrop-filter:blur(6px)}
.b3d-ctl button:hover{background:rgba(240,180,41,.25)}
.b3d-tip{position:absolute;z-index:3;pointer-events:none;background:rgba(4,14,34,.92);border:1px solid rgba(240,180,41,.55);border-radius:10px;padding:9px 11px;font-size:12px;line-height:1.45;color:#eaf1ff;min-width:170px;transform:translate(14px,14px);box-shadow:0 10px 24px rgba(0,0,0,.35)}
.b3d-tip b{display:block;font-size:13px;color:#fff;margin-bottom:2px}
.b3d-tip .bar{display:flex;height:6px;border-radius:3px;overflow:hidden;margin:6px 0 4px;background:#1d3a66}
.b3d-tip .k{color:#9fb6da;font-size:11px}
.b3d-hint{font-size:11px;color:#9fb6da;margin-top:6px}
@media (max-width:640px){.b3d{height:470px}.b3d-cap{max-width:calc(100% - 64px);left:14px;bottom:12px}.b3d-cap .t{font-size:20px}.b3d-cap .d{font-size:11.5px}.b3d-leg,.b3d-hint{display:none}}
/* efek 3D kartu */
.t3d{position:relative;transition:transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .45s;transform-style:preserve-3d}
.t3d.tilt{transition:transform .08s linear,box-shadow .3s;box-shadow:0 22px 38px -20px rgba(10,30,70,.45)}
.t3d::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .3s;
  background:radial-gradient(420px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.22),transparent 45%)}
.t3d.tilt::after{opacity:1}
.kpi.t3d .v{transform:translateZ(26px);display:inline-block}
.r3d{opacity:0;transform:perspective(1100px) rotateX(9deg) translateY(30px)}
.r3d.in{opacity:1;transform:none;transition:opacity .8s ease,transform .9s cubic-bezier(.2,.7,.2,1)}
@media (prefers-reduced-motion:reduce){.r3d{opacity:1;transform:none}.t3d,.t3d.tilt{transform:none!important}}
`;
  document.head.appendChild(st);

  /* ---------- markup ---------- */
  const sec = document.createElement("section");
  sec.className = "b3d"; sec.id = "b3d"; sec.setAttribute("aria-label", "Visual 3D BISA-MEUHABA: Rumoh Aceh dan peta sentimen Aceh");
  sec.innerHTML = `<canvas aria-hidden="true"></canvas>
  <div class="b3d-top"><div class="b3d-tabs" role="tablist" aria-label="Tampilan 3D">
    <button role="tab" data-v="house" aria-selected="true">Rumoh Aceh</button><button role="tab" data-v="map" aria-selected="false">Peta Sentimen 3D</button></div>
    <button class="b3d-chip" id="b3dChip" title="Hapus filter wilayah"></button></div>
  <div class="b3d-cap" id="b3dCapHouse"><div class="t">BISA-MEUHABA</div><div class="g">Peugah lage na, sesuai bak asa</div>
    <div class="d">Suara publik Aceh dari berita dan percakapan, diolah menjadi data sentimen untuk KPw BI Aceh.</div></div>
  <div class="b3d-cap hide" id="b3dCapMap"><div class="t">Peta Sentimen Aceh</div><div class="d" id="b3dStat"></div>
    <div class="b3d-leg"><span><i style="background:#2fbf7a"></i>Positif</span><span><i style="background:#a5b4c0"></i>Netral</span><span><i style="background:#e8594d"></i>Negatif</span><span><i style="background:#3563c9"></i>Belum ada berita</span></div>
    <div class="b3d-hint">Seret untuk memutar · arahkan ke wilayah untuk detail · klik untuk memfilter dashboard</div></div>
  <div class="b3d-ctl"><button data-z="in" aria-label="Perbesar">+</button><button data-z="out" aria-label="Perkecil">−</button><button data-z="reset" aria-label="Kembali ke tampilan awal">⟲</button></div>
  <div class="b3d-tip" hidden></div><ul class="sr" id="b3dSr"></ul>`;
  const lede = document.querySelector("#paneSentimen .lede") || document.querySelector("#paneSentimen h1");
  lede.insertAdjacentElement("afterend", sec);
  const cv = sec.querySelector("canvas"), tip = sec.querySelector(".b3d-tip"), chip = sec.querySelector("#b3dChip");

  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { sec.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  const C = { navy: 0x12489a, deep: 0x0b2a63, gold: 0xf0b429, blue: 0x2f6fd0, pos: 0x2fbf7a, neu: 0xa5b4c0, neg: 0xe8594d, none: 0x1b3870, white: 0xffffff };
  const scene = new T.Scene();
  scene.fog = new T.Fog(0x071a3a, 38, 95);
  const cam = new T.PerspectiveCamera(38, 1, 0.1, 300);
  scene.add(new T.HemisphereLight(0xdbe8ff, 0x14284a, 1.15));
  const sun = new T.DirectionalLight(0xffffff, 1.0); sun.position.set(10, 22, 14); scene.add(sun);
  const rim = new T.DirectionalLight(0xf0b429, 0.35); rim.position.set(-14, 8, -12); scene.add(rim);
  const std = (color, o = {}) => new T.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15, ...o });

  /* ---------- laut berpartikel (dipakai bersama) ---------- */
  const HX = -34; // posisi Rumoh Aceh
  const sea = (() => {
    const pts = []; for (let x = -52; x <= 18; x += 1) for (let z = -16; z <= 16; z += 1) pts.push(x, 0, z);
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pts, 3));
    const m = new T.Points(g, new T.PointsMaterial({ color: 0x4f8ff0, size: 0.09, transparent: true, opacity: 0.55, depthWrite: false }));
    scene.add(m);
    const plane = new T.Mesh(new T.PlaneGeometry(140, 60), new T.MeshBasicMaterial({ color: 0x08214a, transparent: true, opacity: 0.55 }));
    plane.rotation.x = -Math.PI / 2; plane.position.set(-17, -0.12, 0); scene.add(plane);
    return g;
  })();

  /* ---------- Rumoh Aceh ---------- */
  const house = new T.Group(); house.position.set(HX, 0, 0); scene.add(house);
  const spin = []; const bob = [];
  (function buildHouse() {
    const base = new T.Mesh(new T.CylinderGeometry(6.4, 6.8, 0.35, 64), std(C.deep)); base.position.y = 0.05; house.add(base);
    const ring = new T.Mesh(new T.TorusGeometry(6.5, 0.07, 8, 96), std(C.gold, { metalness: 0.6, roughness: 0.3, emissive: 0x3a2600 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.24; house.add(ring);
    const wood = std(0x0e2f6b), navy = std(C.navy), gold = std(C.gold, { metalness: 0.55, roughness: 0.35, emissive: 0x2a1c00 });
    for (const x of [-2.4, -0.8, 0.8, 2.4]) for (const z of [-1, 0, 1]) {
      const s = new T.Mesh(new T.CylinderGeometry(0.11, 0.13, 1.7, 10), wood); s.position.set(x, 1.05, z); house.add(s);
    }
    const beam = new T.Mesh(new T.BoxGeometry(5.8, 0.18, 2.9), gold); beam.position.y = 1.95; house.add(beam);
    const body = new T.Mesh(new T.BoxGeometry(5.3, 1.35, 2.4), navy); body.position.y = 2.7; house.add(body);
    const win = new T.MeshStandardMaterial({ color: 0xffd36b, emissive: 0xf0a020, emissiveIntensity: 0.9 });
    for (const x of [-1.6, 0, 1.6]) { const w = new T.Mesh(new T.BoxGeometry(0.7, 0.55, 0.05), win); w.position.set(x, 2.75, 1.22); house.add(w); }
    const trim = new T.Mesh(new T.BoxGeometry(5.4, 0.1, 2.5), gold); trim.position.y = 3.4; house.add(trim);
    // atap pelana memanjang khas Rumoh Aceh
    const tri = new T.Shape(); tri.moveTo(-1.95, 0); tri.lineTo(1.95, 0); tri.lineTo(0, 2.35); tri.closePath();
    const rg = new T.ExtrudeGeometry(tri, { depth: 6.4, bevelEnabled: false }); rg.translate(0, 0, -3.2); rg.rotateY(Math.PI / 2);
    const roof = new T.Mesh(rg, std(C.deep, { emissive: 0x050f26 })); roof.position.y = 3.45; house.add(roof);
    const edges = new T.LineSegments(new T.EdgesGeometry(rg), new T.LineBasicMaterial({ color: C.gold })); edges.position.y = 3.45; house.add(edges);
    // tolak angin (ornamen segitiga di ujung atap)
    for (const sx of [-1, 1]) {
      const o = new T.Shape(); o.moveTo(-1.35, 0.25); o.lineTo(1.35, 0.25); o.lineTo(0, 1.85); o.closePath();
      const hole = new T.Path(); hole.moveTo(-0.7, 0.55); hole.lineTo(0.7, 0.55); hole.lineTo(0, 1.35); hole.closePath(); o.holes.push(hole);
      const m = new T.Mesh(new T.ShapeGeometry(o), new T.MeshStandardMaterial({ color: C.gold, metalness: 0.5, roughness: 0.35, side: T.DoubleSide, emissive: 0x2a1c00 }));
      m.rotation.y = Math.PI / 2; m.position.set(sx * 3.22, 3.45, 0); house.add(m);
    }
    const crown = new T.Mesh(new T.OctahedronGeometry(0.42), gold); crown.position.y = 6.2; house.add(crown); spin.push(crown);
    for (const sx of [-1, 1]) { const c = new T.Mesh(new T.ConeGeometry(0.16, 0.6, 12), gold); c.position.set(sx * 3.2, 6.0, 0); house.add(c); }
    for (let i = 0; i < 6; i++) { const s = new T.Mesh(new T.BoxGeometry(1.1, 0.12, 0.38), gold); s.position.set(0, 1.9 - i * 0.32, 1.45 + i * 0.36); house.add(s); }
    // ombak samudera (biru & emas) dari logo
    [[C.blue, 4.3, 0], [C.gold, 4.9, 1.3], [C.navy, 5.5, 2.4]].forEach(([col, z, ph]) => {
      const p = []; for (let i = 0; i <= 40; i++) { const x = -6 + i * 0.3; p.push(new T.Vector3(x, 0.45 + 0.28 * Math.sin(x * 0.9 + ph), z - 0.25 * Math.cos(x * 0.5))); }
      const tube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(p), 80, 0.14, 8), std(col, { metalness: 0.35, roughness: 0.35 }));
      house.add(tube);
    });
    // gelembung chat + grafik batang (elemen "Chat & Data" di logo)
    const cd = new T.Group(); cd.position.set(5.2, 4.6, 0.6); house.add(cd); bob.push(cd);
    const bub = new T.Mesh(new T.BoxGeometry(1.7, 1.05, 0.35), std(C.blue, { emissive: 0x0a2a66 })); cd.add(bub);
    const tail = new T.Mesh(new T.ConeGeometry(0.2, 0.45, 4), std(C.blue)); tail.position.set(-0.5, -0.65, 0); tail.rotation.z = 0.5; cd.add(tail);
    for (const x of [-0.45, 0, 0.45]) { const d = new T.Mesh(new T.SphereGeometry(0.12, 16, 12), new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0x555555 })); d.position.set(x, 0, 0.2); cd.add(d); }
    [0.6, 1.0, 1.5].forEach((h, i) => { const b = new T.Mesh(new T.BoxGeometry(0.32, h, 0.32), std(i === 2 ? C.gold : C.blue, { emissive: i === 2 ? 0x2a1c00 : 0x0a2a66 })); b.position.set(1.3 + i * 0.45, -0.52 + h / 2, 0); cd.add(b); });
  })();
  // partikel "suara publik" yang naik berputar menuju gelembung data
  const VOICES = 240;
  const vGeo = new T.BufferGeometry(), vPos = new Float32Array(VOICES * 3), vCol = new Float32Array(VOICES * 3), vSeed = [];
  const palette = [new T.Color(C.pos), new T.Color(C.neu), new T.Color(C.neg), new T.Color(C.gold)];
  for (let i = 0; i < VOICES; i++) { vSeed.push({ a: Math.random() * Math.PI * 2, t: Math.random(), r: 5 + Math.random() * 2.5, s: 0.05 + Math.random() * 0.08 }); const c = palette[i % 4]; vCol.set([c.r, c.g, c.b], i * 3); }
  vGeo.setAttribute("position", new T.BufferAttribute(vPos, 3)); vGeo.setAttribute("color", new T.BufferAttribute(vCol, 3));
  const voices = new T.Points(vGeo, new T.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending }));
  voices.position.set(HX, 0, 0); scene.add(voices);

  /* ---------- Peta Aceh 3D ---------- */
  const K = 4.2, LON0 = 96.65, LAT0 = 4.05;
  const P = (lon, lat) => [(lon - LON0) * K, (lat - LAT0) * K]; // koordinat bentuk (x, y) -> dunia (x, -y)
  const mapG = new T.Group(); scene.add(mapG);
  const regions = {}; // name -> {mesh, mat, edge, top, center:[x,z]}
  function centroid(ring) { let a = 0, cx = 0, cy = 0; for (let i = 0; i < ring.length; i++) { const [x1, y1] = ring[i], [x2, y2] = ring[(i + 1) % ring.length]; const f = x1 * y2 - x2 * y1; a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f; } a /= 2; return [cx / (6 * a), cy / (6 * a)]; }
  Object.entries(ACEH).forEach(([name, rings]) => {
    const shapes = rings.map((r) => new T.Shape(r.map(([lo, la]) => new T.Vector2(...P(lo, la)))));
    const geo = new T.ExtrudeGeometry(shapes, { depth: 1, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
    const mat = std(C.none, { roughness: 0.6, metalness: 0.1, emissive: 0x000000 });
    const mesh = new T.Mesh(geo, mat); mesh.scale.y = 0.32; mesh.userData.region = name; mapG.add(mesh);
    const edge = new T.LineSegments(new T.EdgesGeometry(geo, 25), new T.LineBasicMaterial({ color: 0x9ec1ff, transparent: true, opacity: 0.45 })); edge.scale.y = 0.32; mapG.add(edge);
    const big = rings.reduce((a, b) => (b.length > a.length ? b : a));
    const [lo, la] = PIN[name] || centroid(big);
    const [x, y] = P(lo, la);
    regions[name] = { mesh, mat, edge, h: 0.32, target: 0.32, center: [x, -y] };
  });
  Object.entries(SUB).forEach(([name, s]) => { const [x, y] = P(...s.c); regions[name] = { sub: true, center: [x, -y], h: 0.32 }; });
  (function north() { // panah utara
    const g = new T.Group(); g.position.set(-8.6, 0.1, -9.6); mapG.add(g);
    const sh = new T.Shape(); sh.moveTo(0, 0.9); sh.lineTo(0.42, -0.5); sh.lineTo(0, -0.22); sh.lineTo(-0.42, -0.5); sh.closePath();
    const m = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false }), std(C.gold, { metalness: 0.5, emissive: 0x2a1c00 })); m.rotation.x = -Math.PI / 2; g.add(m);
    const l = makeLabel("U", "rgba(240,180,41,.8)"); l.scale.set(3.4, 0.72, 1); l.position.set(0, 0.6, -1.5); g.add(l);
  })();
  const pickables = Object.values(regions).filter((r) => r.mesh).map((r) => r.mesh);
  const barsG = new T.Group(); mapG.add(barsG);
  const labelsG = new T.Group(); mapG.add(labelsG);
  const alerts = [];
  let stats = {}, barMeshes = [];

  function makeLabel(text, color) {
    const c = document.createElement("canvas"); const s = 2; c.width = 300 * s; c.height = 64 * s;
    const x = c.getContext("2d"); x.scale(s, s);
    x.font = "700 24px 'Plus Jakarta Sans', system-ui, sans-serif"; const w = Math.min(290, x.measureText(text).width + 30);
    x.fillStyle = "rgba(4,14,34,.86)"; x.strokeStyle = color; x.lineWidth = 2;
    const r = 14, X = (300 - w) / 2; x.beginPath(); x.moveTo(X + r, 8); x.arcTo(X + w, 8, X + w, 56, r); x.arcTo(X + w, 56, X, 56, r); x.arcTo(X, 56, X, 8, r); x.arcTo(X, 8, X + w, 8, r); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = "#ffffff"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, 150, 33);
    const tex = new T.CanvasTexture(c); tex.anisotropy = 4;
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false })); sp.renderOrder = 10; sp.scale.set(4.6, 0.98, 1); return sp;
  }
  const disposeGroup = (g) => { while (g.children.length) { const o = g.children.pop(); o.geometry && o.geometry.dispose(); if (o.material) { o.material.map && o.material.map.dispose(); o.material.dispose(); } } };
  const mixCol = (score) => { const n = new T.Color(C.neu); return score >= 0 ? n.lerp(new T.Color(C.pos), score) : n.lerp(new T.Color(C.neg), -score); };

  /* ---------- data dari dashboard ---------- */
  let REGION = "";
  const baseFiltered = window.filtered, baseRender = window.renderAll;
  const inRegion = (p, name) => { const r = regionOf(p); return r === name || (r && polyOf(r) === name && !SUB[name]); };
  if (typeof baseFiltered === "function") window.filtered = function () { const l = baseFiltered(); return REGION ? l.filter((p) => inRegion(p, REGION)) : l; };
  if (typeof baseRender === "function") window.renderAll = function () { baseRender(); try { update(); } catch (e) { console.warn("3D", e); } };
  const reset = document.getElementById("fReset"); if (reset) reset.addEventListener("click", () => { if (REGION) { REGION = ""; window.renderAll(); } });
  function setRegion(name) {
    REGION = REGION === name ? "" : name;
    try { page = 1; } catch (e) {}
    window.renderAll();
  }
  chip.onclick = () => setRegion(REGION);

  function update() {
    const list = typeof baseFiltered === "function" ? baseFiltered() : [];
    stats = {}; let mapped = 0, general = 0;
    for (const p of list) {
      const r = regionOf(p); if (!r) { general++; continue; }
      mapped++;
      for (const key of new Set([r, polyOf(r)])) { const s = (stats[key] = stats[key] || { n: 0, positif: 0, netral: 0, negatif: 0, own: 0 }); s.n++; s[p.sentiment] = (s[p.sentiment] || 0) + 1; if (key === r) s.own++; }
    }
    // warna & tinggi wilayah
    Object.entries(regions).forEach(([name, R]) => {
      if (!R.mesh) return; const s = stats[name];
      const col = s ? mixCol((s.positif - s.negatif) / s.n) : new T.Color(C.none);
      R.mat.color.copy(col); R.base = col.clone();
      R.target = s ? 0.42 + Math.min(0.5, Math.log2(1 + s.n) * 0.09) : 0.3;
      R.mat.emissive.setHex(REGION && (REGION === name || (SUB[REGION] && SUB[REGION].p === name)) ? 0x3a2a00 : 0x000000);
    });
    // batang bertumpuk per wilayah (pakai hitungan milik wilayah itu sendiri)
    disposeGroup(barsG); disposeGroup(labelsG); alerts.length = 0; barMeshes = [];
    const own = Object.entries(stats).filter(([k, s]) => s.own > 0).map(([k, s]) => [k, { ...s, ...ownCounts(list, k) }]);
    const max = Math.max(8, ...own.map(([, s]) => s.n));
    const U = Math.min(0.42, 4.2 / max);
    own.sort((a, b) => b[1].n - a[1].n).forEach(([name, s], idx) => {
      const R = regions[name]; if (!R) return; const [x, z] = R.center; let y = (regions[polyOf(name)] || R).target + 0.02;
      for (const k of ["positif", "netral", "negatif"]) {
        const n = s[k] || 0; if (!n) continue; const h = n * U;
        const m = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, h, 24), std(k === "positif" ? C.pos : k === "negatif" ? C.neg : C.neu, { emissive: k === "negatif" ? 0x2a0806 : 0x061a10, roughness: 0.4 }));
        m.position.set(x, y + h / 2, z); m.userData = { region: name, grow: 0 }; m.scale.y = 0.001; barsG.add(m); barMeshes.push(m); y += h;
      }
      const cap = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, 0.06, 24), std(C.gold, { metalness: 0.6, emissive: 0x2a1c00 })); cap.position.set(x, y + 0.03, z); cap.userData = { region: name, grow: 0, top: y }; cap.scale.y = 0.001; barsG.add(cap); barMeshes.push(cap);
      if (s.n >= 2 && (s.negatif || 0) / s.n >= 0.4) { const a = new T.Mesh(new T.TorusGeometry(0.62, 0.05, 8, 40), new T.MeshBasicMaterial({ color: C.neg, transparent: true })); a.rotation.x = Math.PI / 2; a.position.set(x, (regions[polyOf(name)] || R).target + 0.05, z); barsG.add(a); alerts.push(a); }
      if (idx < 6 || name === REGION) { const l = makeLabel(`${name} · ${s.n}`, name === REGION ? "#f0b429" : "rgba(240,180,41,.6)"); l.position.set(x, y + 0.95, z); labelsG.add(l); }
    });
    const nReg = own.length;
    document.getElementById("b3dStat").innerHTML = list.length
      ? `<b>${mapped}</b> dari <b>${list.length}</b> berita menyebut kab/kota tertentu, tersebar di <b>${nReg}</b> wilayah. ${general} berita lainnya bersifat umum (tingkat provinsi).`
      : "Belum ada data pada filter ini.";
    chip.textContent = REGION ? `Wilayah: ${REGION} ✕` : ""; chip.classList.toggle("on", !!REGION);
    document.getElementById("b3dSr").innerHTML = own.map(([n, s]) => `<li>${n}: ${s.n} berita (${s.positif || 0} positif, ${s.netral || 0} netral, ${s.negatif || 0} negatif)</li>`).join("");
  }
  function ownCounts(list, key) { const o = { n: 0, positif: 0, netral: 0, negatif: 0 }; for (const p of list) if (regionOf(p) === key) { o.n++; o[p.sentiment]++; } return o; }

  /* ---------- kamera & interaksi ---------- */
  const VIEWS = { house: { t: [HX, 2.9, 0], r: 16, th: 0.62, ph: 1.12 }, map: { t: [0, 0, 0.3], r: 23, th: -0.83, ph: 0.74 } };
  const S = { t: new T.Vector3(...VIEWS.house.t), r: VIEWS.house.r, th: VIEWS.house.th, ph: VIEWS.house.ph };
  let view = "house", fly = null, lastUser = 0, autoTimer = null, SCRUB = null, thOff = 0, phOff = 0;
  const tabs = [...sec.querySelectorAll(".b3d-tabs button")];
  function go(v, instant) {
    view = v; const V = v === "map" ? mapPreset() : VIEWS[v]; tabs.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.v === v)));
    document.getElementById("b3dCapHouse").classList.toggle("hide", v !== "house"); document.getElementById("b3dCapMap").classList.toggle("hide", v !== "map");
    let th = V.th; while (th - S.th > Math.PI) th -= 2 * Math.PI; while (S.th - th > Math.PI) th += 2 * Math.PI;
    const to = { t: new T.Vector3(...V.t), r: V.r * (v === "house" ? aspectBoost() : 1), th, ph: V.ph };
    if (instant || REDUCED) { S.t.copy(to.t); S.r = to.r; S.th = to.th; S.ph = to.ph; fly = null; return; }
    fly = { from: { t: S.t.clone(), r: S.r, th: S.th, ph: S.ph }, to, t0: performance.now(), dur: 2000 };
    if (v === "map") barMeshes.forEach((m) => (m.userData.grow = 0));
  }
  const mapPreset = () => { const a = cv.clientWidth / Math.max(1, cv.clientHeight); return a < 1.25 ? { t: [0, 0, 3.4], r: 31 / Math.max(0.75, a), th: 0, ph: 0.6 } : a < 2.1 ? { t: [0.4, 0, 0.6], r: 27, th: -0.83, ph: 0.74 } : VIEWS.map; };
  const aspectBoost = () => { const a = cv.clientWidth / Math.max(1, cv.clientHeight); return a < 1.1 ? 1.45 : a < 1.6 ? 1.15 : 1; };
  tabs.forEach((b) => (b.onclick = () => { lastUser = performance.now(); clearTimeout(autoTimer); if (window.BISA3D_TAB) return window.BISA3D_TAB(b.dataset.v); go(b.dataset.v); }));
  sec.querySelector(".b3d-ctl").onclick = (e) => {
    const z = e.target.dataset && e.target.dataset.z; if (!z) return; lastUser = performance.now(); clearTimeout(autoTimer);
    if (z === "reset") return go(view);
    S.r = Math.max(8, Math.min(48, S.r * (z === "in" ? 0.82 : 1.2))); fly = null;
  };
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  let drag = null; const ray = new T.Raycaster(), mouse = new T.Vector2(); let hoverName = null;
  cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId, type: e.pointerType }; lastUser = performance.now(); clearTimeout(autoTimer); fly = null; });
  addEventListener("pointermove", (e) => {
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
      if (drag.moved > 4 && !drag.cap) { try { cv.setPointerCapture(drag.id); drag.cap = true; } catch (er) {} }
      S.th -= dx * 0.006; thOff -= dx * 0.006; if (drag.type === "mouse") { S.ph = Math.max(0.32, Math.min(1.42, S.ph - dy * 0.004)); phOff = Math.max(-0.5, Math.min(0.5, phOff - dy * 0.004)); }
      lastUser = performance.now(); tip.hidden = true; return;
    }
    if (e.target === cv) hover(e);
  });
  addEventListener("pointerup", (e) => {
    if (!drag || e.pointerId !== drag.id) return; const click = drag.moved < 6; drag = null;
    if (click && e.target === cv) { const n = pick(e); if (n && (stats[n] || n === REGION)) { if (view !== "map") { if (window.BISA3D_TAB) window.BISA3D_TAB("map"); else go("map"); } setRegion(n); } }
  });
  addEventListener("pointercancel", () => { drag = null; });
  cv.addEventListener("pointerleave", () => { if (!drag) { tip.hidden = true; setHover(null); } });
  function pick(e) {
    const b = cv.getBoundingClientRect(); mouse.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    ray.setFromCamera(mouse, cam); const hit = ray.intersectObjects([...barMeshes, ...pickables], false)[0];
    return hit ? hit.object.userData.region : null;
  }
  function setHover(n) {
    if (hoverName === n) return;
    if (hoverName && regions[polyOf(hoverName)] && regions[polyOf(hoverName)].mat) regions[polyOf(hoverName)].mat.emissive.setHex(REGION === polyOf(hoverName) ? 0x3a2a00 : 0x000000);
    hoverName = n; if (n && regions[polyOf(n)] && regions[polyOf(n)].mat) regions[polyOf(n)].mat.emissive.setHex(0x1f3a70);
    cv.style.cursor = n ? "pointer" : "";
  }
  function hover(e) {
    const n = pick(e); setHover(n);
    if (!n) { tip.hidden = true; return; }
    const s = SUB[n] ? stats[n] : stats[n] ? { ...stats[n] } : null;
    const extra = !SUB[n] ? Object.keys(SUB).filter((k) => SUB[k].p === n && stats[k]).map((k) => `${k} ${stats[k].n}`).join(", ") : "";
    const b = cv.getBoundingClientRect();
    tip.innerHTML = s && s.n
      ? `<b>${n}</b>${s.n} berita${extra ? ` <span class="k">(termasuk ${extra})</span>` : ""}
         <div class="bar"><i style="width:${(s.positif / s.n) * 100}%;background:#2fbf7a"></i><i style="width:${(s.netral / s.n) * 100}%;background:#a5b4c0"></i><i style="width:${(s.negatif / s.n) * 100}%;background:#e8594d"></i></div>
         ${s.positif || 0} positif · ${s.netral || 0} netral · ${s.negatif || 0} negatif<div class="k">${REGION === n ? "klik untuk hapus filter" : "klik untuk memfilter dashboard"}</div>`
      : `<b>${n}</b><span class="k">Belum ada berita yang menyebut wilayah ini pada filter saat ini.</span>`;
    let x = e.clientX - b.left, y = e.clientY - b.top; if (x > b.width - 220) x -= 220; if (y > b.height - 120) y -= 110;
    tip.style.left = x + "px"; tip.style.top = y + "px"; tip.hidden = false;
  }

  /* ---------- loop ---------- */
  let running = false, visible = true, t0 = performance.now();
  function resize() { const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  new ResizeObserver(() => { resize(); if (!fly && SCRUB === null) go(view, true); }).observe(sec);
  function frame(now) {
    if (!running) return; requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    if (fly) { const k = Math.min(1, (now - fly.t0) / fly.dur), e = ease(k); S.t.lerpVectors(fly.from.t, fly.to.t, e); S.r = fly.from.r + (fly.to.r - fly.from.r) * e; S.th = fly.from.th + (fly.to.th - fly.from.th) * e; S.ph = fly.from.ph + (fly.to.ph - fly.from.ph) * e + Math.sin(e * Math.PI) * -0.25; if (k >= 1) fly = null; }
    else if (SCRUB !== null && !drag) {
      const wide = cv.clientWidth / Math.max(1, cv.clientHeight) > 1.3, e = ease(Math.min(1, Math.max(0, (SCRUB - 0.08) / 0.84))), A = { t: [HX - (wide ? 7.5 : 0), wide ? 3.0 : 0.6, 0], r: wide ? 25 : 17, th: 0.62, ph: 1.12 }, B = mapPreset(), hb = aspectBoost();
      if (!REDUCED && now - lastUser > 2500) thOff += 0.0012;
      let bt = B.th; while (bt - A.th > Math.PI) bt -= 2 * Math.PI; while (A.th - bt > Math.PI) bt += 2 * Math.PI;
      const q = [A.t[0] + (B.t[0] - A.t[0]) * e, A.t[1] + (B.t[1] - A.t[1]) * e, A.t[2] + (B.t[2] - A.t[2]) * e];
      S.t.x += (q[0] - S.t.x) * 0.1; S.t.y += (q[1] - S.t.y) * 0.1; S.t.z += (q[2] - S.t.z) * 0.1;
      S.r += (A.r * hb + (B.r - A.r * hb) * e - S.r) * 0.1; S.th += (A.th + (bt - A.th) * e + thOff - S.th) * 0.1;
      S.ph += (Math.max(0.32, Math.min(1.42, A.ph + (B.ph - A.ph) * e - Math.sin(e * Math.PI) * 0.25 + phOff)) - S.ph) * 0.1;
      const v2 = e < 0.5 ? "house" : "map";
      if (v2 !== view) { view = v2; tabs.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.v === v2))); document.getElementById("b3dCapMap").classList.toggle("hide", v2 !== "map"); if (v2 === "map") barMeshes.forEach((m) => (m.userData.grow = 0)); }
    }
    else if (!REDUCED && !drag && now - lastUser > 4000) S.th += 0.0016;
    const sp = Math.sin(S.ph);
    cam.position.set(S.t.x + S.r * sp * Math.sin(S.th), S.t.y + S.r * Math.cos(S.ph), S.t.z + S.r * sp * Math.cos(S.th)); cam.lookAt(S.t);
    if (!REDUCED) {
      const a = sea.attributes.position; for (let i = 0; i < a.count; i++) { const x = a.getX(i), z = a.getZ(i); a.setY(i, Math.sin(t * 1.1 + x * 0.35 + z * 0.22) * 0.12 - 0.05); } a.needsUpdate = true;
      spin.forEach((m) => (m.rotation.y = t * 0.9)); bob.forEach((m, i) => (m.position.y = 4.6 + Math.sin(t * 1.3 + i) * 0.18));
      for (let i = 0; i < VOICES; i++) { const v = vSeed[i]; v.t += v.s * 0.016; if (v.t > 1) v.t -= 1; const k = v.t, ang = v.a + k * 5, rr = v.r * (1 - k * 0.75);
        vPos[i * 3] = Math.cos(ang) * rr + k * k * 5.2; vPos[i * 3 + 1] = 0.4 + k * 4.6; vPos[i * 3 + 2] = Math.sin(ang) * rr * 0.6 + k * 0.6; }
      vGeo.attributes.position.needsUpdate = true;
      alerts.forEach((a, i) => { const s = 1 + ((t * 0.8 + i * 0.3) % 1) * 1.4; a.scale.set(s, s, s); a.material.opacity = 1 - ((t * 0.8 + i * 0.3) % 1); });
    }
    Object.values(regions).forEach((R) => { if (!R.mesh) return; R.h += (R.target - R.h) * 0.08; R.mesh.scale.y = R.h; R.edge.scale.y = R.h; });
    barMeshes.forEach((m, i) => { if (m.userData.grow < 1) { m.userData.grow = Math.min(1, m.userData.grow + (REDUCED ? 1 : 0.025)); m.scale.y = Math.max(0.001, ease(m.userData.grow)); } });
    renderer.render(scene, cam);
  }
  function setRun() { const want = visible && !document.hidden; if (want && !running) { running = true; requestAnimationFrame(frame); } else if (!want) running = false; }
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; setRun(); }, { threshold: 0.02 }).observe(sec);
  document.addEventListener("visibilitychange", setRun);
  resize(); update(); go(REDUCED ? "map" : "house", true); setRun();
  // intro: Rumoh Aceh dulu, lalu kamera terbang ke peta sentimen
  if (!REDUCED) autoTimer = setTimeout(() => { if (SCRUB === null && performance.now() - lastUser > 3000) go("map"); }, 4200);
  window.BISA3D = { setScrub: (p) => { SCRUB = p; }, update: () => update(), go: (v) => go(v) };

  /* ---------- efek 3D di seluruh dashboard ---------- */
  if (!REDUCED) {
    // muncul dengan rotasi 3D saat di-scroll
    const targets = document.querySelectorAll("#paneSentimen > .kpis, #paneSentimen > .panel, #paneSentimen > .grid2 > .panel, #paneSentimen > .notice");
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); setTimeout(() => en.target.classList.remove("r3d", "in"), 1000); } }), { threshold: 0.06 });
    targets.forEach((el) => { if (el.getBoundingClientRect().top > innerHeight * 0.95) { el.classList.add("r3d"); io.observe(el); } });
    // kartu miring mengikuti kursor + kilau
    if (FINE) {
      let cur = null;
      const skip = (el) => el.matches(".panel") && el.querySelector("table, #snaCanvas, input, select, textarea");
      document.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        let el = e.target.closest && e.target.closest(".kpi, .issue, #paneSentimen .panel");
        if (el && (skip(el) || el.closest(".b3d"))) el = null;
        if (cur && cur !== el) { cur.classList.remove("tilt"); cur.style.transform = ""; }
        cur = el; if (!el) return;
        el.classList.add("t3d", "tilt");
        const b = el.getBoundingClientRect(), px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
        const max = el.matches(".panel") ? 1.6 : 8;
        el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateZ(0) scale(${el.matches(".panel") ? 1.005 : 1.03})`;
        el.style.setProperty("--mx", px * 100 + "%"); el.style.setProperty("--my", py * 100 + "%");
      }, { passive: true });
      document.addEventListener("pointerleave", () => { if (cur) { cur.classList.remove("tilt"); cur.style.transform = ""; cur = null; } });
    }
  }
})();
