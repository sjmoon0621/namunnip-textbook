/* 카드: 많이 던질수록 상대도수는 어디로 갈까? — 시행 횟수(로그 눈금)에 따른 상대도수와 수학적 확률 */
(() => {
  const root = document.getElementById("card-stat-freq-prob");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  /* 씨앗 난수 (mulberry32): 첫 화면을 늘 같게 그린다 */
  const rng = (s) => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const die = (r) => 1 + Math.floor(r() * 6);
  const EV = [
    { f: "1/2", p: 1 / 2, hit: (r) => r() < 0.5 },
    { f: "1/3", p: 1 / 3, hit: (r) => die(r) % 3 === 0 },
    { f: "1/6", p: 1 / 6, hit: (r) => die(r) + die(r) === 7 },
    { f: "1/8", p: 1 / 8, hit: (r) => { const a = r() < 0.5, b = r() < 0.5, c = r() < 0.5; return a && b && c; } },
  ];
  const MAX = 10000;
  let ev = 0, seed = 20261009, r = rng(seed), cur, old = [];
  const run = () => ({ fr: new Float32Array(MAX + 1), n: 0, k: 0 });
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 40, y0 = 14, gw = w - x0 - 24, gh = h - y0 - 38;
    const X = (n) => x0 + Math.log10(n) / 4 * gw, Y = (v) => y0 + (1 - v) * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [1, 10, 100, 1000, 10000].map((v) => [v, String(v)]),
      yt: [0, 0.25, 0.5, 0.75, 1].map((v) => [v, String(v)]), xlabel: "시행 횟수 n (로그 눈금)" });
    const path = (o) => {
      if (o.n < 1) return;
      ctx.beginPath();
      for (let n = 1; n <= o.n; n++) { const x = X(n), y = Y(o.fr[n]); if (n === 1) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
    };
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.55; old.forEach(path); ctx.globalAlpha = 1;
    const p = EV[ev].p;
    ctx.setLineDash([5, 4]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x0, Y(p)); ctx.lineTo(x0 + gw, Y(p)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; path(cur);
    if (cur.n) { ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(cur.n), Y(cur.fr[cur.n]), 4, 0, 7); ctx.fill(); }
    ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "right"; ctx.textBaseline = "middle";
    const t = `수학적 확률 ${EV[ev].f}`, tw = ctx.measureText(t).width, ty = Y(p) - 12;
    ctx.fillStyle = C.card; ctx.fillRect(x0 + gw - tw - 6, ty - 8, tw + 4, 16);
    ctx.fillStyle = C.warn; ctx.fillText(t, x0 + gw - 4, ty);
  }

  function update() {
    $(".n-n").textContent = cur.n;
    $(".n-r").textContent = cur.k;
    $(".n-f").textContent = cur.n ? (cur.k / cur.n).toFixed(4) : "—";
    $(".n-p").textContent = EV[ev].p.toFixed(4);
    draw();
  }
  function more(m) {
    for (let i = 0; i < m && cur.n < MAX; i++) { cur.n++; if (EV[ev].hit(r)) cur.k++; cur.fr[cur.n] = cur.k / cur.n; }
    update();
  }
  function restart(keep) {
    if (keep && cur.n) { old.push(cur); if (old.length > 5) old.shift(); }
    if (!keep) old = [];
    r = rng(++seed); cur = run();
  }
  chips.forEach((b) => b.addEventListener("click", () => {
    ev = +b.dataset.e; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    restart(false); more(100);
  }));
  $(".go-10").addEventListener("click", () => more(10));
  $(".go-100").addEventListener("click", () => more(100));
  $(".go-1000").addEventListener("click", () => more(1000));
  $(".go-new").addEventListener("click", () => { restart(true); more(10); });
  cur = run(); more(100);
})();
