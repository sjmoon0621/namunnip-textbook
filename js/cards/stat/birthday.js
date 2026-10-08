/* 카드: 몇 명이 모이면 생일이 같은 두 사람이 있을 확률이 1/2을 넘을까? — 1 − 365Pn/365^n 곡선과 모의 학급 실험 */
(() => {
  const root = document.getElementById("card-stat-birthday");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s), sn = $(".n");
  const rng = (s) => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const r = rng(365);
  const NMAX = 80, CLASSES = 200;
  const diff = [1]; // diff[n] = P(n명의 생일이 모두 다름) = 365Pn / 365^n
  for (let n = 1; n <= NMAX; n++) diff[n] = diff[n - 1] * (365 - n + 1) / 365;
  let sims = [];
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 40, y0 = 14, gw = w - x0 - 16, gh = h - y0 - 38, n = +sn.value;
    const X = (v) => x0 + (v - 1) / (NMAX - 1) * gw, Y = (v) => y0 + (1 - v) * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [1, 10, 20, 30, 40, 50, 60, 70, 80].map((v) => [v, String(v)]),
      yt: [0, 0.25, 0.5, 0.75, 1].map((v) => [v, String(v)]), xlabel: "사람 수 n" });
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, Y(0.5)); ctx.lineTo(x0 + gw, Y(0.5)); ctx.stroke(); ctx.setLineDash([]);
    const curve = (f, col, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.setLineDash(dash);
      ctx.beginPath(); for (let k = 1; k <= NMAX; k++) { if (k === 1) ctx.moveTo(X(k), Y(f(k))); else ctx.lineTo(X(k), Y(f(k))); } ctx.stroke();
      ctx.setLineDash([]);
    };
    curve((k) => diff[k], C.ink3, [6, 4]);
    curve((k) => 1 - diff[k], C.forest, []);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(n), y0); ctx.lineTo(X(n), y0 + gh); ctx.stroke();
    ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(X(n), Y(1 - diff[n]), 5, 0, 7); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.beginPath(); ctx.arc(X(n), Y(diff[n]), 4, 0, 7); ctx.fill();
    ctx.fillStyle = C.amber; ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    sims.forEach((s) => { ctx.beginPath(); ctx.arc(X(s.n), Y(s.p), 3.5, 0, 7); ctx.fill(); ctx.stroke(); });
    ctx.font = `600 11.5px ${F.sans}`; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    const lab = (t, x, y, col) => { const tw = ctx.measureText(t).width; ctx.fillStyle = C.card; ctx.fillRect(x - 2, y - 8, tw + 4, 16); ctx.fillStyle = col; ctx.fillText(t, x, y); };
    lab("적어도 한 쌍", X(52), Y(1 - diff[52]) + 16, C.forest);
    lab("모두 다름", X(52), Y(diff[52]) - 16, C.ink2);
  }

  function update() {
    const n = +sn.value, d = diff[n];
    $(".n-out").textContent = n;
    $(".eq").innerHTML = `P(적어도 한 쌍) = 1 − <sub>365</sub>P<sub>${n}</sub> / 365<sup>${n}</sup> = 1 − ${d.toFixed(4)} = ${(1 - d).toFixed(4)}`;
    $(".n-d").textContent = d.toFixed(4);
    $(".n-a").textContent = (1 - d).toFixed(4);
    const s = sims.filter((x) => x.n === n).pop();
    $(".n-s").textContent = s ? `${s.k}/${CLASSES} = ${s.p.toFixed(3)}` : "—";
    draw();
  }
  function simulate() {
    const n = +sn.value, seen = new Uint8Array(365);
    let k = 0;
    for (let c = 0; c < CLASSES; c++) {
      seen.fill(0);
      for (let i = 0; i < n; i++) { const day = Math.floor(r() * 365); if (seen[day]) { k++; break; } seen[day] = 1; }
    }
    sims.push({ n, k, p: k / CLASSES });
    if (sims.length > 40) sims.shift();
    update();
  }
  sn.addEventListener("input", update);
  $(".go-sim").addEventListener("click", simulate);
  simulate();
})();
