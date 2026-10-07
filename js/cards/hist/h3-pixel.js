/* 카드: 점묘화와 화소 — 점 간격·보는 거리에 따른 시각, 눈의 분해능(약 1분), 가산 혼합 */
(() => {
  const root = document.getElementById("card-hist-pixel");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), sD = $(".d");
  const CASES = { phone: [0.055, 0.3, "rgb"], tv: [0.317, 2, "rgb"], seurat: [2, 1, "yb"], led: [10, 20, "rgb"] };
  const COLS = {
    rgb: [[230, 40, 40], [40, 190, 60], [40, 70, 230]],
    yb: [[240, 205, 40], [40, 80, 210]],
    rg: [[215, 50, 40], [40, 150, 70]],
  };
  const PAINT = { yb: [70, 140, 70], rg: [110, 85, 50] };
  let cs = "seurat", kind = "yb";
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const enc = (v) => Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
  const avg = (cols) => [0, 1, 2].map((k) => enc(cols.reduce((s, c) => s + lin(c[k]), 0) / cols.length));
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  const mix = (a, b, t) => [0, 1, 2].map((k) => Math.round(a[k] * (1 - t) + b[k] * t));
  const P = () => 10 ** +sP.value, D = () => 10 ** +sD.value;
  const arcmin = () => P() / 1000 / D() * 180 / Math.PI * 60;

  // 한 칸(화소 하나)을 그린다: rgb는 세로 줄 셋, 두 색은 바둑판
  function cell(x, y, s, i, j, cols) {
    if (kind === "rgb") { cols.forEach((c, k) => { ctx.fillStyle = rgb(c); ctx.fillRect(x + k * s / 3, y, s / 3 - (s > 9 ? 1 : 0), s - (s > 9 ? 1 : 0)); }); }
    else { ctx.fillStyle = rgb(cols[(i + j) % 2]); ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s * 0.46, 0, Math.PI * 2); ctx.fill(); }
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const S = Math.min(w * 0.42, h - 46), y0 = 22, lx = w * 0.04, rx = w * 0.54;
    const cols = COLS[kind], av = avg(cols);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("가까이 확대한 모습", lx, 14); ctx.fillText(`${fmtD(D())}에서 보이는 모습 (모식)`, rx, 14);
    // 왼쪽: 확대
    ctx.fillStyle = "#111"; ctx.fillRect(lx, y0, S, S);
    const n = 6, s = S / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) cell(lx + i * s, y0 + j * s, s, i, j, cols);
    // 오른쪽: 보는 거리에서
    const a = arcmin(), t = clamp((2 - a) / (2 - 0.7), 0, 1), px = clamp(a * 7, 0.4, 60);
    ctx.save(); ctx.beginPath(); ctx.rect(rx, y0, S, S); ctx.clip();
    if (px < 1.6) { ctx.fillStyle = rgb(av); ctx.fillRect(rx, y0, S, S); }
    else {
      ctx.fillStyle = rgb(mix([17, 17, 17], av, t)); ctx.fillRect(rx, y0, S, S);
      const mc = cols.map((c) => mix(c, av, t)), m = Math.ceil(S / px);
      for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) cell(rx + i * px, y0 + j * px, px, i, j, mc);
    }
    ctx.restore();
    ctx.strokeStyle = C.rule; ctx.strokeRect(rx + .5, y0 + .5, S, S);
    // 아래: 결과 색과 물감 혼합 비교
    const yb = y0 + S + 16;
    ctx.fillStyle = rgb(av); ctx.fillRect(rx, yb - 9, 12, 12);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.fillText("빛이 섞인 색", rx + 17, yb + 1);
    if (PAINT[kind]) { ctx.fillStyle = rgb(PAINT[kind]); ctx.fillRect(rx + S * 0.5, yb - 9, 12, 12); ctx.fillStyle = C.ink2; ctx.fillText("물감으로 섞으면 (대략)", rx + S * 0.5 + 17, yb + 1); }
    ctx.fillStyle = t >= 1 ? C.forest : t > 0 ? C.amber : C.warn; ctx.fillText(t >= 1 ? "점이 보이지 않음" : t > 0 ? "점이 아른거림" : "점이 또렷이 보임", lx, yb + 1);
  }
  const fmtD = (d) => (d < 1 ? `${Math.round(d * 100)} cm` : `${d < 10 ? d.toFixed(1) : Math.round(d)} m`);
  function update() {
    root.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === cs)));
    root.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === kind)));
    const p = P(), d = D(), a = arcmin();
    $(".p-out").textContent = p < 0.1 ? p.toFixed(3) : p < 1 ? p.toFixed(2) : p.toFixed(1);
    $(".d-out").textContent = d < 1 ? d.toFixed(2) : d < 10 ? d.toFixed(1) : Math.round(d);
    $(".n-a").textContent = a < 10 ? `${a.toFixed(2)} 분` : `${a.toFixed(0)} 분`;
    $(".n-a").className = "n-a" + (a > 1 ? " bad" : " good");
    const dm = p / 1000 / Math.tan(Math.PI / 180 / 60);
    $(".n-d").textContent = `${fmtD(dm)} 이상`;
    const need = 25.4 / (d * 1000 * Math.tan(Math.PI / 180 / 60));
    $(".n-r").textContent = `약 ${Math.round(need)} ppi`;
    draw();
  }
  root.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => {
    cs = b.dataset.c; const [p, d, k] = CASES[cs]; sP.value = Math.log10(p); sD.value = Math.log10(d); kind = k; update();
  }));
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { kind = b.dataset.k; update(); }));
  [sP, sD].forEach((s) => s.addEventListener("input", () => { cs = ""; update(); }));
  if (/[?&]demo\b/.test(location.search)) { sD.value = Math.log10(5); cs = ""; }
  update();
})();
