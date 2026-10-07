/* 카드: 망원경은 왜 클수록 더 가까이 붙은 두 별을 가를까? — 에어리 무늬 두 개의 겹침과 레일리 기준 */
(() => {
  const root = document.getElementById("card-adphy-rayleigh");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sD = $(".sd"), sL = $(".sl"), sA = $(".sa");
  const oD = $(".od"), oL = $(".ol"), oA = $(".oa"), nR = $(".nr"), nQ = $(".nq"), nDp = $(".nd"), dR = $(".dr");
  const AS = Math.PI / 180 / 3600; /* 1″ (rad) */
  let shape = "circ";

  /* 베셀 함수 J1 (Numerical Recipes 다항식 근사) */
  function J1(x) {
    const ax = Math.abs(x);
    if (ax < 8) {
      const y = x * x;
      const a1 = x * (72362614232.0 + y * (-7895059235.0 + y * (242396853.1 + y * (-2972611.439 + y * (15704.48260 + y * (-30.16036606))))));
      const a2 = 144725228442.0 + y * (2300535178.0 + y * (18583304.74 + y * (99447.43394 + y * (376.9991397 + y))));
      return a1 / a2;
    }
    const z = 8 / ax, y = z * z, xx = ax - 2.356194491;
    const a1 = 1 + y * (0.183105e-2 + y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * (-0.240337019e-6))));
    const a2 = 0.04687499995 + y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)));
    const r = Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * a1 - z * Math.sin(xx) * a2);
    return x < 0 ? -r : r;
  }
  /* 한 점광원의 밝기 (θ: rad, 중심 1) */
  function psf(th) {
    const D = 10 ** +sD.value, lam = +sL.value * 1e-9, x = Math.PI * D * th / lam;
    if (Math.abs(x) < 1e-6) return 1;
    if (shape === "circ") { const v = 2 * J1(x) / x; return v * v; }
    const s = Math.sin(x) / x; return s * s;
  }
  const thR = () => (shape === "circ" ? 1.22 : 1) * (+sL.value * 1e-9) / (10 ** +sD.value);
  const fmtA = (a) => (a >= 100 ? a.toFixed(0) : a >= 10 ? a.toFixed(1) : a >= 1 ? a.toFixed(2) : a.toFixed(3)) + "″";
  const fmtD = (d) => (d >= 1 ? d.toFixed(2) + " m" : d >= 0.01 ? (d * 100).toFixed(1) + " cm" : (d * 1000).toFixed(1) + " mm");

  const { ctx, size } = fit(cv, () => draw());
  let off = null;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = 10 ** +sA.value * AS, tr = thR(), W = Math.max(2.6 * tr, a / 2 + 2.2 * tr); /* 창의 반너비 (rad) */
    /* 왼쪽: 2차원 상 */
    const S = Math.min(w * 0.44, h - 30), x0 = 8, y0 = (h - S) / 2 - 6;
    const dpr = cv.width / w, n = Math.max(60, Math.min(260, Math.round(S * dpr / 1.5)));
    if (!off || off.width !== n) { off = document.createElement("canvas"); off.width = off.height = n; }
    const o = off.getContext("2d"), im = o.createImageData(n, n);
    for (let j = 0; j < n; j++) {
      const ty = ((j + 0.5) / n * 2 - 1) * W;
      for (let i = 0; i < n; i++) {
        const tx = ((i + 0.5) / n * 2 - 1) * W;
        let I;
        if (shape === "circ") I = psf(Math.hypot(tx + a / 2, ty)) + psf(Math.hypot(tx - a / 2, ty));
        else I = (psf(tx + a / 2) + psf(tx - a / 2)) * Math.exp(-((ty / (0.25 * W)) ** 2));
        const v = Math.min(1, Math.sqrt(I / 2)) * 255, k = 4 * (j * n + i);
        im.data[k] = v; im.data[k + 1] = v * 0.97; im.data[k + 2] = v * 0.85; im.data[k + 3] = 255;
      }
    }
    o.putImageData(im, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(off, x0, y0, S, S);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(x0, y0, S, S);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText(`창 너비 ${fmtA(2 * W / AS)}`, x0 + S / 2, y0 + S + 14);
    /* 오른쪽: 밝기 단면 */
    const gx = x0 + S + 34, gw = w - gx - 10, gy = 22, gh = h - 60;
    const X = (t) => gx + (t / W + 1) / 2 * gw, Y = (v) => gy + gh - v / 1.15 * gh;
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
    const M = 300;
    const curve = (fn, col, lw, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath();
      for (let i = 0; i <= M; i++) { const t = (i / M * 2 - 1) * W, y = Y(fn(t)); i ? ctx.lineTo(X(t), y) : ctx.moveTo(X(t), y); }
      ctx.stroke(); ctx.setLineDash([]);
    };
    curve((t) => psf(t + a / 2), "#3f6fa3", 1.2, [4, 3]);
    curve((t) => psf(t - a / 2), "#d4493a", 1.2, [4, 3]);
    curve((t) => psf(t + a / 2) + psf(t - a / 2), C.ink, 2);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("밝기 (점선: 각 별, 실선: 합)", gx + 4, gy - 6);
    ctx.textAlign = "right"; ctx.fillText("두 별을 잇는 방향의 각 →", gx + gw, gy + gh + 16);
    /* θR 눈금 */
    ctx.strokeStyle = C.warn; ctx.setLineDash([2, 3]);
    [-a / 2 + tr, a / 2 - tr].forEach((t) => { if (Math.abs(t) < W) { ctx.beginPath(); ctx.moveTo(X(t), gy + 8); ctx.lineTo(X(t), gy + gh); ctx.stroke(); } });
    ctx.setLineDash([]);
    /* 판정 */
    let pk = 0;
    for (let i = 0; i <= 400; i++) { const t = i / 400 * (a / 2 + tr); pk = Math.max(pk, psf(t + a / 2) + psf(t - a / 2)); }
    const mid = 2 * psf(a / 2), ratio = mid / pk;
    const q = a / tr;
    nR.textContent = fmtA(tr / AS); nQ.textContent = q.toFixed(2);
    nDp.textContent = ratio >= 0.999 ? "골 없음 (한 덩어리)" : `${(ratio * 100).toFixed(0)} %`;
    nDp.className = "nd " + (ratio < 0.8 ? "good" : "bad");
  }
  function update() {
    oD.textContent = fmtD(10 ** +sD.value); oL.textContent = sL.value; oA.textContent = fmtA(10 ** +sA.value);
    dR.innerHTML = shape === "circ" ? "최소 분해각 θ<sub>R</sub> = 1.22λ/D" : "첫 어두운 무늬 각 λ/D";
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === shape)));
    root.querySelectorAll("[data-d]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(Math.log10(+b.dataset.d) - +sD.value) < 0.003)));
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { shape = b.dataset.s; update(); }));
  root.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => {
    const keep = (10 ** +sA.value) / (thR() / AS);
    sD.value = Math.log10(+b.dataset.d);
    sA.value = Math.max(+sA.min, Math.min(+sA.max, Math.log10(keep * thR() / AS)));
    update();
  }));
  [sD, sL, sA].forEach((s) => s.addEventListener("input", update));
  update();
})();
