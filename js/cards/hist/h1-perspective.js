/* 카드: 화가는 평평한 벽에 어떻게 깊이를 그렸을까? — 바둑판 바닥의 중심 투영, 소실점과 대각선 점검 */
(() => {
  const root = document.getElementById("card-hist-perspective");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sH = $(".h"), sF = $(".f"), gO = $(".g-orth"), gD = $(".g-diag");
  let mode = "true";
  const NROW = 14, XS = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const H = +sH.value, f = +sF.value;
    /* 왼쪽 화면: 너비 4 m, 높이 3 m, 아래 끝 = 화면이 바닥과 만나는 선 */
    const pw = w * 0.6, s = Math.min((pw - 20) / 4, (h - 30) / 3), ox = 10 + (pw - 20 - 4 * s) / 2, oy = 14, bot = oy + 3 * s, cx = ox + 2 * s;
    /* 바닥 점 (x, z): z는 화면에서부터의 깊이(m), 눈에서 거리 = f + z */
    const ytrue = (z) => bot - s * H * (z / (f + z));
    const yE = (z) => (mode === "true" ? ytrue(z) : bot - (bot - ytrue(NROW)) * z / NROW);
    const hy = bot - s * H;
    /* 화면 위 점: 줄의 높이 y를 정한 뒤, 그 줄에서 소실점까지의 비율로 가로 위치를 줄인다 */
    const kOf = (z) => 1 - (bot - yE(z)) / (bot - hy);
    const P = (x, z) => [cx + s * x * kOf(z), yE(z)];
    ctx.save(); ctx.beginPath(); ctx.rect(ox, oy, 4 * s, 3 * s); ctx.clip();
    ctx.fillStyle = "#e9e1cc"; ctx.fillRect(ox, oy, 4 * s, 3 * s);
    ctx.fillStyle = "#dfe8f0"; ctx.fillRect(ox, oy, 4 * s, Math.max(0, hy - oy));
    /* 타일 */
    for (let k = 0; k < NROW; k++) for (let i = 0; i < XS.length - 1; i++) {
      const a = P(XS[i], k), b = P(XS[i + 1], k), c = P(XS[i + 1], k + 1), d = P(XS[i], k + 1);
      ctx.fillStyle = (i + k) % 2 ? "#c8b48c" : "#f4ecda";
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
    }
    /* 기둥: x = ±1.5, 깊이 1, 4, 8 m, 높이 2 m */
    [[1, -1.5], [1, 1.5], [4, -1.5], [4, 1.5], [8, -1.5], [8, 1.5]].forEach(([z, x]) => {
      const k = kOf(z), base = P(x, z), top = base[1] - 2 * s * k, wd = 0.3 * s * k;
      ctx.fillStyle = "#9aa3ad"; ctx.fillRect(base[0] - wd / 2, top, wd, base[1] - top);
      ctx.strokeStyle = C.ink2; ctx.lineWidth = 0.8; ctx.strokeRect(base[0] - wd / 2, top, wd, base[1] - top);
    });
    if (gO.checked) {
      ctx.strokeStyle = "rgba(181,83,47,.7)"; ctx.lineWidth = 1;
      XS.forEach((x) => { const a = P(x, 0); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(cx, hy); ctx.stroke(); });
    }
    if (gD.checked) {
      ctx.strokeStyle = "#2f5f9a"; ctx.lineWidth = 1.6;
      for (const x0 of [-6, -4, -2, 0]) {
        ctx.beginPath();
        for (let k = 0; k <= NROW && x0 + k <= 6; k++) { const p = P(x0 + k, k); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
        ctx.stroke();
      }
      if (mode === "true") { ctx.fillStyle = "#2f5f9a"; ctx.beginPath(); ctx.arc(cx + s * f, hy, 4, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(ox + 0.5, oy + 0.5, 4 * s, 3 * s);
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(ox, hy); ctx.lineTo(ox + 4 * s, hy); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(cx, hy, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.warn;
    if (hy > oy + 12) ctx.fillText("지평선 = 눈높이", ox + 4, hy - 5);

    /* 오른쪽: 옆에서 본 그림 */
    const rx0 = pw + 16, rx1 = w - 12, gy = h - 34, zMax = f + 5, sc = Math.min((rx1 - rx0) / zMax, (gy - 30) / 3);
    const X = (z) => rx0 + z * sc, Y = (y) => gy - y * sc;
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rx0, gy); ctx.lineTo(rx1, gy); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(f), gy); ctx.lineTo(X(f), Y(3)); ctx.stroke();
    ctx.strokeStyle = "rgba(181,83,47,.55)"; ctx.lineWidth = 1;
    for (let k = 0; k <= 5; k++) { ctx.beginPath(); ctx.moveTo(X(0), Y(H)); ctx.lineTo(X(f + k), gy); ctx.stroke(); }
    for (let k = 0; k <= 5; k++) { const yy = H - H * (f / (f + k)); ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(f), Y(yy), 2.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#3f6fa3"; ctx.beginPath(); ctx.arc(X(0), Y(H), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("눈", X(0) + 7, Y(H) - 6); ctx.fillText("화면", X(f) + 5, Y(3) + 10);
    ctx.textAlign = "right"; ctx.fillText("바닥 (1 m 간격)", rx1, gy + 16);
    ctx.textAlign = "left"; ctx.fillText("옆에서 본 모습", rx0, 16);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    const H = +sH.value, f = +sF.value;
    $(".h-out").textContent = H.toFixed(1); $(".f-out").textContent = f.toFixed(1);
    $(".n-h").textContent = `바닥선에서 ${H.toFixed(1)} m (눈높이와 같음)`;
    const d = (k) => H * f * (1 / (f + k) - 1 / (f + k + 1));
    $(".n-r").textContent = mode === "true" ? `${(d(0) / d(4)).toFixed(2)} : 1` : "1 : 1 (같게 그림)";
    $(".n-d").textContent = mode === "true" ? `${f.toFixed(1)} m (= 눈과 화면 사이 거리)` : "한 점에 모이지 않음";
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; update(); }));
  [sH, sF].forEach((el) => el.addEventListener("input", update));
  [gO, gD].forEach((el) => el.addEventListener("change", update));
  if (window.NMLab && NMLab.demo) gD.checked = true;
  update();
})();
