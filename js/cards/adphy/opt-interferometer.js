/* 카드: 빛의 파장으로 1만분의 1 mm를 잴 수 있을까? — 마이컬슨 간섭계의 동심원 무늬와 뉴턴 링 */
(() => {
  const root = document.getElementById("card-adphy-interferometer");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const SL = [{ inp: $(".sa"), out: $(".oa"), lab: $(".la") }, { inp: $(".sb"), out: $(".ob"), lab: $(".lb") }];
  const N = [0, 1, 2].map((i) => ({ dt: $(".d" + i), dd: $(".n" + i) }));
  const THMAX = 0.06; /* 마이컬슨 스크린이 보는 최대 각 (rad) */
  const RMAX = 3e-3; /* 뉴턴 링 스크린 반지름 (m) */
  const MODES = {
    mich: [["거울 간격 차 d₀", 0.05, 1.5, 0.01, 0.8, (v) => v.toFixed(2) + " mm"],
      ["미세 이동 δ", 0, 2, 0.005, 0, (v) => v.toFixed(3) + " μm"]],
    newton: [["렌즈 곡률 반지름 R", 0.5, 5, 0.05, 1, (v) => v.toFixed(2) + " m"],
      ["렌즈를 든 높이 h₀", 0, 1, 0.005, 0, (v) => v.toFixed(3) + " μm"]],
  };
  const store = { mich: [0.8, 0], newton: [1, 0] };
  let mode = "mich", lam = 632.8e-9;
  const RGB = { "632.8": [255, 45, 25], "589.3": [255, 196, 20], "532": [70, 240, 50] };
  const col = () => RGB[String(+(lam * 1e9).toFixed(1)).replace(/\.0$/, "")] || [255, 255, 255];

  /* 밝기 함수: 마이컬슨 I(θ), 뉴턴 링 I(r) */
  const Imich = (th) => { const d = store.mich[0] * 1e-3 + store.mich[1] * 1e-6; return Math.cos(2 * Math.PI * d * Math.cos(th) / lam) ** 2; };
  const Inew = (r) => { const t = store.newton[1] * 1e-6 + r * r / (2 * store.newton[0]); return Math.sin(2 * Math.PI * t / lam) ** 2; };

  const { ctx, size } = fit(cv, () => draw());
  let off = null;

  function rings(cx, cy, R, fn) {
    const dpr = cv.width / size.w, n = Math.max(40, Math.round(2 * R * dpr));
    if (!off || off.width !== n) { off = document.createElement("canvas"); off.width = off.height = n; }
    const o = off.getContext("2d"), im = o.createImageData(n, n), [cr, cg, cb] = col();
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const dx = (i + 0.5) / n * 2 - 1, dy = (j + 0.5) / n * 2 - 1, q = Math.hypot(dx, dy), k = 4 * (j * n + i);
      if (q > 1) { im.data[k + 3] = 0; continue; }
      const I = fn(q);
      im.data[k] = cr * I + 8; im.data[k + 1] = cg * I + 8; im.data[k + 2] = cb * I + 10; im.data[k + 3] = 255;
    }
    o.putImageData(im, 0, 0);
    ctx.drawImage(off, cx - R, cy - R, 2 * R, 2 * R);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  }
  function txt(t, x, y, al, c) { ctx.fillStyle = c || C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = al || "left"; ctx.fillText(t, x, y); }
  function beam(pts, c) { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }

  function schemMich(x0, y0, w, h) {
    const [r, g, b] = col(), bc = `rgba(${r},${g},${b},.85)`;
    const cx = x0 + w * 0.45, cy = y0 + h * 0.5, arm = Math.min(w * 0.4, h * 0.42), shift = 4 + store.mich[0] / 1.5 * 10 + store.mich[1] * 2;
    beam([[x0 + 22, cy], [cx + arm + shift, cy]], bc);
    beam([[cx, cy], [cx, y0 + h * 0.5 - arm]], bc);
    beam([[cx, cy], [cx, cy + arm * 0.85]], bc);
    ctx.fillStyle = C.ink; ctx.fillRect(x0 + 4, cy - 7, 18, 14); txt("광원", x0 + 2, cy - 12, "left", C.ink);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 10, cy + 10); ctx.lineTo(cx + 10, cy - 10); ctx.stroke();
    txt("빛 가르개", cx - 14, cy + 22, "right");
    ctx.fillStyle = "#5d5d61"; ctx.fillRect(cx - 14, y0 + h * 0.5 - arm - 5, 28, 5); txt("거울 1 (고정)", cx + 18, y0 + h * 0.5 - arm, "left", C.ink);
    ctx.fillRect(cx + arm + shift, cy - 14, 5, 28); txt("거울 2", cx + arm + shift - 4, cy - 20, "center", C.ink);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + arm, cy + 20); ctx.lineTo(cx + arm + shift + 2, cy + 20); ctx.stroke();
    txt("d", cx + arm + shift / 2, cy + 32, "center", C.warn);
    ctx.fillStyle = C.ink; ctx.fillRect(cx - 14, cy + arm * 0.85, 28, 4); txt("스크린 →", cx + 18, cy + arm * 0.85 + 5, "left", C.ink);
  }
  function schemNewton(x0, y0, w, h) {
    const base = y0 + h * 0.72, cx = x0 + w * 0.5, half = w * 0.42, sag = h * 0.32, lift = store.newton[1] * 10;
    ctx.fillStyle = "rgba(63,111,163,.18)"; ctx.fillRect(cx - half, base, 2 * half, 14);
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 1.2; ctx.strokeRect(cx - half, base, 2 * half, 14);
    /* 볼록 렌즈 (곡률 과장) */
    const k = sag / (half * half) / Math.sqrt(store.newton[0]);
    ctx.beginPath(); ctx.moveTo(cx - half, base - lift - k * half * half);
    for (let x = -half; x <= half; x += 2) ctx.lineTo(cx + x, base - lift - k * x * x);
    ctx.lineTo(cx + half, base - lift - k * half * half - 18); ctx.lineTo(cx - half, base - lift - k * half * half - 18); ctx.closePath();
    ctx.fillStyle = "rgba(63,111,163,.18)"; ctx.fill(); ctx.stroke();
    txt("볼록 렌즈 (곡률 반지름 R)", cx, base - lift - k * half * half - 24, "center", C.ink);
    txt("평평한 유리", cx + half, base + 28, "right", C.ink);
    const [r, g, b] = col();
    ctx.strokeStyle = `rgba(${r},${g},${b},.9)`; ctx.lineWidth = 1.5;
    [-0.6, 0.35].forEach((f) => { const x = cx + f * half; ctx.beginPath(); ctx.moveTo(x, y0 + 6); ctx.lineTo(x, base - lift - k * (f * half) ** 2); ctx.stroke(); });
    txt("공기층 t ≈ h₀ + r²/2R (과장)", cx - half, base + 28);
  }
  function graph(x0, y0, w, h, fn, xmax, xlab, mark) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + h); ctx.lineTo(x0 + w, y0 + h); ctx.stroke();
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i <= 400; i++) { const x = i / 400 * xmax, y = y0 + h - fn(x) * h * 0.92; i ? ctx.lineTo(x0 + i / 400 * w, y) : ctx.moveTo(x0, y); }
    ctx.stroke();
    if (mark != null) { ctx.fillStyle = C.warn; const mx = x0 + mark / xmax * w; ctx.beginPath(); ctx.arc(mx, y0 + h - fn(mark) * h * 0.92, 4, 0, 7); ctx.fill(); }
    txt(xlab, x0 + w, y0 + h + 14, "right"); txt("밝기", x0 + 4, y0 - 4);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const R = Math.min(w * 0.22, h * 0.44), rx = w - R - 10, ry = h * 0.5, lw = w - 2 * R - 34;
    if (mode === "mich") {
      schemMich(6, 6, lw, h * 0.6);
      const dm = store.mich[1];
      graph(14, h * 0.7, lw - 20, h * 0.2, (x) => Math.cos(2 * Math.PI * (store.mich[0] * 1e-3 + x * 1e-6) / lam) ** 2, 2, "미세 이동 δ (0 ~ 2 μm) → 중심 밝기", dm);
      rings(rx, ry, R, (q) => Imich(q * THMAX));
      txt("스크린 (±3.4°)", rx, ry + R + 14, "center");
    } else {
      schemNewton(6, 6, lw, h * 0.6);
      graph(14, h * 0.7, lw - 20, h * 0.2, (x) => Inew(x * 1e-3), RMAX * 1e3, "중심에서의 거리 r (0 ~ 3 mm)", null);
      rings(rx, ry, R, (q) => Inew(q * RMAX));
      txt("위에서 본 반사광 (지름 6 mm)", rx, ry + R + 14, "center");
    }
    readout();
  }
  function readout() {
    if (mode === "mich") {
      const d = store.mich[0] * 1e-3 + store.mich[1] * 1e-6, Ic = Imich(0);
      N[0].dt.textContent = "중심의 광로차 2d"; N[0].dd.textContent = `${(2 * d * 1e3).toFixed(4)} mm = ${(2 * d / lam).toFixed(2)} λ`;
      N[1].dt.textContent = "중심 밝기 (0~1)"; N[1].dd.textContent = Ic.toFixed(2);
      N[2].dt.textContent = "δ 동안 지나간 무늬 2δ/λ"; N[2].dd.textContent = (2 * store.mich[1] * 1e-6 / lam).toFixed(2);
    } else {
      const Rr = store.newton[0];
      N[0].dt.textContent = "첫째 어두운 고리 √(λR)"; N[0].dd.textContent = `${(Math.sqrt(lam * Rr) * 1e3).toFixed(3)} mm`;
      N[1].dt.textContent = "다섯째 고리 √(5λR)"; N[1].dd.textContent = `${(Math.sqrt(5 * lam * Rr) * 1e3).toFixed(3)} mm`;
      N[2].dt.textContent = "중심을 지나간 무늬 2h₀/λ"; N[2].dd.textContent = (2 * store.newton[1] * 1e-6 / lam).toFixed(2);
    }
  }
  function setMode(m) {
    mode = m;
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
    MODES[m].forEach((d, i) => { const s = SL[i]; s.lab.textContent = d[0]; s.inp.min = d[1]; s.inp.max = d[2]; s.inp.step = d[3]; s.inp.value = store[m][i]; s.inp.setAttribute("aria-label", d[0]); });
    update();
  }
  function update() {
    MODES[mode].forEach((d, i) => { store[mode][i] = +SL[i].inp.value; SL[i].out.textContent = d[5](store[mode][i]); });
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.m)));
  root.querySelectorAll("[data-l]").forEach((b) => b.addEventListener("click", () => {
    lam = +b.dataset.l * 1e-9;
    root.querySelectorAll("[data-l]").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    draw();
  }));
  SL.forEach((s) => s.inp.addEventListener("input", update));
  const dq = new URLSearchParams(location.search).get("demo");
  setMode(MODES[dq] ? dq : "mich");
})();
