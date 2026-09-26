/* 카드: 스피커 두 대 사이에서 소리가 사라지는 자리는 어디일까? — 두 점 음원의 간섭 세기 지도, 경로차, 반대 위상 */
(() => {
  const root = document.getElementById("card-mech-two-speaker");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sF = $(".f"), sD = $(".d"), oF = $(".f-out"), oL = $(".l-out"), oD = $(".d-out");
  const nDx = $(".n-dx"), nRatio = $(".n-ratio"), nDb = $(".n-db");
  const VS = 340, RW = 8, RH = 5;
  let ph = 0, lx = 5.5, ly = 3.2;   // 듣는 사람 위치 (m)
  const src = () => { const d = +sD.value; return [[0.6, RH / 2 - d / 2], [0.6, RH / 2 + d / 2]]; };
  function field(x, y) {
    const k = 2 * Math.PI * +sF.value / VS, [[x1, y1], [x2, y2]] = src();
    const r1 = Math.max(0.15, Math.hypot(x - x1, y - y1)), r2 = Math.max(0.15, Math.hypot(x - x2, y - y2));
    const a1 = 1 / Math.sqrt(r1), a2 = 1 / Math.sqrt(r2), p2 = k * r2 + (ph ? Math.PI : 0);
    const re = a1 * Math.cos(k * r1) + a2 * Math.cos(p2), im = a1 * Math.sin(k * r1) + a2 * Math.sin(p2);
    return { I: re * re + im * im, I1: a1 * a1, r1, r2 };
  }
  let img = null;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const sc = Math.min(w / RW, h / RH), ox = (w - RW * sc) / 2, oy = (h - RH * sc) / 2;
    // 세기 지도 (저해상도 격자)
    const nx = 160, ny = 100, off = document.createElement("canvas"); off.width = nx; off.height = ny;
    const oc = off.getContext("2d"), data = oc.createImageData(nx, ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const { I } = field((i + 0.5) / nx * RW, (j + 0.5) / ny * RH);
      const v = Math.min(1, I / 1.6), p = (j * nx + i) * 4;
      data.data[p] = 28 + 220 * v; data.data[p + 1] = 30 + 170 * v; data.data[p + 2] = 45 + 70 * v; data.data[p + 3] = 255;
    }
    oc.putImageData(data, 0, 0);
    ctx.clearRect(0, 0, w, h); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, ox, oy, RW * sc, RH * sc);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(ox, oy, RW * sc, RH * sc);
    // 스피커
    src().forEach(([x, y], i) => { ctx.fillStyle = "#fbfbf8"; ctx.fillRect(ox + x * sc - 10, oy + y * sc - 8, 12, 16); ctx.fillStyle = C.ink; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(ph && i ? "−" : "+", ox + x * sc + 4, oy + y * sc + 4); });
    // 듣는 사람과 두 경로
    const [[x1, y1], [x2, y2]] = src(), px = ox + lx * sc, py = oy + ly * sc;
    ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(ox + x1 * sc, oy + y1 * sc); ctx.lineTo(px, py); ctx.moveTo(ox + x2 * sc, oy + y2 * sc); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#e0a02a"; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("밝을수록 소리가 큼 · 그림을 눌러 위치 이동", ox + RW * sc - 6, oy + RH * sc - 8);
  }
  function update() {
    const f = +sF.value, lam = VS / f;
    oF.textContent = f; oL.textContent = lam.toFixed(2); oD.textContent = (+sD.value).toFixed(1);
    const q = field(lx, ly), dx = Math.abs(q.r1 - q.r2), ratio = dx / lam;
    nDx.textContent = `${dx.toFixed(2)} m`;
    const frac = ratio - Math.floor(ratio);
    nRatio.textContent = `${ratio.toFixed(2)} ${ph ? (Math.abs(frac - 0) < 0.12 || frac > 0.88 ? "→ 상쇄" : Math.abs(frac - 0.5) < 0.12 ? "→ 보강" : "") : (Math.abs(frac - 0) < 0.12 || frac > 0.88 ? "→ 보강" : Math.abs(frac - 0.5) < 0.12 ? "→ 상쇄" : "")}`;
    const db = 10 * Math.log10(Math.max(q.I, 1e-6) / q.I1);
    nDb.textContent = `${db >= 0 ? "+" : "−"}${Math.abs(db).toFixed(1)} dB`;
    root.querySelectorAll("[data-ph]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.ph === ph)));
    draw();
  }
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), { w, h } = size, sc = Math.min(w / RW, h / RH), ox = (w - RW * sc) / 2, oy = (h - RH * sc) / 2;
    lx = Math.min(RW, Math.max(0, (e.clientX - r.left - ox) / sc)); ly = Math.min(RH, Math.max(0, (e.clientY - r.top - oy) / sc)); update();
  });
  [sF, sD].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-ph]").forEach((b) => b.addEventListener("click", () => { ph = +b.dataset.ph; update(); }));
  update();
})();
