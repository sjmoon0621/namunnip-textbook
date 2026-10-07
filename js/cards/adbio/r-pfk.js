/* 카드: PFK-1의 다른 자리 입체성 조절 — 에너지 충전량 → ATP/ADP/AMP → MWC 곡선 (상수는 모식) */
(() => {
  const root = document.getElementById("card-adbio-pfk");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sE = $(".e"), oE = $(".e-out"), nAd = $(".n-ad"), nK = $(".n-k"), nV = $(".n-v");
  const TOT = 5, KAK = 0.44, KR = 0.1, KI = 1, KA = 0.1, F6P = 0.2;
  const on = { cit: false, f26: false };
  /* 에너지 충전량 → [ATP, ADP, AMP] (mM) */
  function aden(EC) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 60; i++) {
      const d = (lo + hi) / 2, a = EC - d / 2, m = 1 - a - d;
      if (m < 0 || a < 0) { hi = d; continue; }
      if (a * m - KAK * d * d > 0) lo = d; else hi = d;
    }
    const d = (lo + hi) / 2, a = EC - d / 2;
    return [a * TOT, d * TOT, (1 - a - d) * TOT];
  }
  function Lof(EC, mods) {
    const [atp, , amp] = aden(EC);
    let L = Math.pow((1 + atp / KI) / (1 + amp / KA), 4);
    if (mods.cit) L *= 5;
    if (mods.f26) L /= 50;
    return L;
  }
  const Y = (s, L) => { const a = s / KR; return a * Math.pow(1 + a, 3) / (Math.pow(1 + a, 4) + L); };
  function k50(L) { let lo = 0, hi = 50; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (Y(m, L) < 0.5) lo = m; else hi = m; } return lo; }

  const { ctx, size } = fit(cv, () => draw());
  function txt(s, x, y, col, font, al) { ctx.fillStyle = col; ctx.font = font; ctx.textAlign = al || "center"; ctx.fillText(s, x, y); }
  const blue = "#3f6fa3";

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const EC = +sE.value, L = Lof(EC, on), Lref = Lof(0.9, { cit: false, f26: false });
    const gx = 40, gw = w * 0.66 - gx, gy = 24, gh = h - 60;
    const X = (s) => gx + s / 1 * gw, Yp = (v) => gy + gh * (1 - v);
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y: Yp, xt: [[0, "0"], [0.2, "0.2"], [0.5, "0.5"], [1, "1.0"]], yt: [[0, "0"], [0.5, "50"], [1, "100 %"]], xlabel: "F6P 농도 (mM)", ylabel: "" });
    txt("PFK-1 반응 속도 (최대 속도 대비)", gx, 14, C.ink2, `600 11.5px ${F.sans}`, "left");
    const curve = (LL, col, dash, wd) => { ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash); ctx.beginPath(); for (let i = 0; i <= 200; i++) { const s = i / 200; const y = Yp(Y(s, LL)); i ? ctx.lineTo(X(s), y) : ctx.moveTo(X(s), y); } ctx.stroke(); ctx.setLineDash([]); };
    curve(Lref, C.ink3, [4, 4], 1.4);
    curve(L, C.warn, [], 2.4);
    /* 세포 속 F6P */
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(F6P), gy); ctx.lineTo(X(F6P), gy + gh); ctx.stroke(); ctx.setLineDash([]);
    txt("세포 속 F6P", X(F6P) + 4, gy + 12, C.forest, `10.5px ${F.sans}`, "left");
    const v = Y(F6P, L);
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(F6P), Yp(v), 5, 0, Math.PI * 2); ctx.fill();
    const k = k50(L);
    if (k < 1) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(k), Yp(0.5), 3, 0, Math.PI * 2); ctx.fill(); txt("K₀.₅", X(k) + 6, Yp(0.5) + 14, C.ink2, `10.5px ${F.mono}`, "left"); }
    /* 오른쪽: 아데닌 뉴클레오타이드 */
    const bx = w * 0.7, bw = w - bx - 10, base = h - 36, top = 30, sc = (c) => (base - top) * c / 5;
    txt("세포 속 농도 (mM)", bx + bw / 2, 14, C.ink2, `600 11.5px ${F.sans}`);
    const [atp, adp, amp] = aden(EC), [atp0, , amp0] = aden(0.9);
    const cols = [[atp, "ATP", C.amber], [adp, "ADP", blue], [amp, "AMP", C.apple]];
    const cw = bw / 3;
    cols.forEach(([c, n, col], i) => {
      const x = bx + i * cw + cw * 0.2, ww = cw * 0.6;
      ctx.fillStyle = col; ctx.fillRect(x, base - sc(c), ww, sc(c));
      txt(n, x + ww / 2, base + 14, C.ink, `600 11px ${F.mono}`);
      txt(c < 0.1 ? c.toFixed(3) : c.toFixed(2), x + ww / 2, base - sc(c) - 5, col === C.amber ? "#b07b10" : col, `600 10.5px ${F.mono}`);
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, base); ctx.lineTo(bx + bw, base); ctx.stroke();
    txt(`0.90 대비 ATP ×${(atp / atp0).toFixed(2)}, AMP ×${(amp / amp0).toFixed(1)}`, bx + bw / 2, base + 30, C.ink2, `10.5px ${F.sans}`);
  }
  function update() {
    const EC = +sE.value; oE.textContent = EC.toFixed(2);
    root.querySelectorAll("[data-x]").forEach((b) => b.setAttribute("aria-pressed", String(on[b.dataset.x])));
    const [a, d, m] = aden(EC), L = Lof(EC, on);
    nAd.textContent = `${a.toFixed(2)} / ${d.toFixed(2)} / ${m.toFixed(2)}`;
    nK.textContent = `${k50(L).toFixed(2)} mM`;
    nV.textContent = `${(100 * Y(F6P, L)).toFixed(0)} %`;
    draw();
  }
  root.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", () => { on[b.dataset.x] = !on[b.dataset.x]; update(); }));
  sE.addEventListener("input", update);
  update();
})();
