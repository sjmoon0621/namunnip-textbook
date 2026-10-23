/* 카드: 번식력을 조금씩 키우면 물고기 수는 어떻게 갈라질까? — 로지스틱 사상과 갈림 그림 */
(() => {
  const root = document.getElementById("card-extra-logistic");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const [cvA, cvB] = root.querySelectorAll("canvas");
  const sR = $(".r"), oR = $(".r-out"), bView = $("[data-act=view]");
  const dKind = $(".d-kind"), dSplit = $(".d-split"), dFix = $(".d-fix");
  const R0 = 2.5, R1 = 4, X0 = 0.2, X1 = 0.2001, YEARS = 50;
  const f = (r, x) => r * x * (1 - x);
  let cobweb = false, bif = null;

  // 수열이 오래 지나 머무는 값들: 주기를 찾고, 64까지 없으면 혼돈으로 본다
  function kind(r) {
    let x = 0.2;
    for (let i = 0; i < 5000; i++) x = f(r, x);
    const a = x;
    for (let p = 1; p <= 64; p++) { x = f(r, x); if (Math.abs(x - a) < 1e-5) return p; }
    return 0;
  }
  function splitYear(r) {
    let a = X0, b = X1;
    for (let n = 1; n <= 200; n++) { a = f(r, a); b = f(r, b); if (Math.abs(a - b) > 0.1) return n; }
    return 0;
  }

  const A = fit(cvA, () => drawA());
  const B = fit(cvB, () => { bif = null; drawB(); });
  function frame(w, h) {
    const o = { x0: 34, y0: 18, w: w - 46, h: h - 50 };
    return o;
  }
  function drawA() {
    const { ctx, size: { w, h } } = A; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = +sR.value, o = frame(w, h);
    ctx.font = `10.5px ${F.mono}`;
    if (!cobweb) {
      o.X = (n) => o.x0 + n / YEARS * o.w; o.Y = (v) => o.y0 + o.h - v * o.h;
      o.xt = [0, 10, 20, 30, 40, 50].map((n) => [n, String(n)]);
      o.yt = [[0, "0"], [0.5, ".5"], [1, "1"]];
      o.xlabel = "해"; o.ylabel = "물고기 수 x";
      axes(ctx, o);
      const s = splitYear(r);
      if (s && s <= YEARS) {
        ctx.setLineDash([4, 4]); ctx.strokeStyle = C.warn;
        ctx.beginPath(); ctx.moveTo(o.X(s), o.y0); ctx.lineTo(o.X(s), o.y0 + o.h); ctx.stroke(); ctx.setLineDash([]);
      }
      [[X1, C.amber], [X0, C.forest]].forEach(([x0, col]) => {
        let x = x0; ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath();
        for (let n = 0; n <= YEARS; n++) { n ? ctx.lineTo(o.X(n), o.Y(x)) : ctx.moveTo(o.X(n), o.Y(x)); x = f(r, x); }
        ctx.stroke();
      });
      ctx.lineWidth = 1;
    } else {
      const S = Math.min(o.w, o.h);
      o.w = S; o.h = S;
      o.X = (v) => o.x0 + v * S; o.Y = (v) => o.y0 + S - v * S;
      o.xt = [[0, "0"], [0.5, ".5"], [1, "1"]]; o.yt = o.xt;
      o.xlabel = "올해 x"; o.ylabel = "다음 해";
      axes(ctx, o);
      ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(o.X(0), o.Y(0)); ctx.lineTo(o.X(1), o.Y(1)); ctx.stroke();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const v = i / 80; i ? ctx.lineTo(o.X(v), o.Y(f(r, v))) : ctx.moveTo(o.X(v), o.Y(f(r, v))); }
      ctx.stroke(); ctx.lineWidth = 1;
      [[X1, "rgba(224,160,42,.8)"], [X0, "rgba(59,124,42,.85)"]].forEach(([x0, col]) => {
        let x = x0; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(o.X(x), o.Y(0));
        for (let n = 0; n < 40; n++) { const y = f(r, x); ctx.lineTo(o.X(x), o.Y(y)); ctx.lineTo(o.X(y), o.Y(y)); x = y; }
        ctx.stroke();
      });
    }
  }
  // 갈림 그림은 크기가 바뀔 때만 다시 계산해 둔다
  function buildBif(w, h, o) {
    const off = document.createElement("canvas");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    off.width = Math.round(w * dpr); off.height = Math.round(h * dpr);
    const g = off.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "rgba(35,35,38,.35)";
    const cols = Math.round(o.w);
    for (let c = 0; c <= cols; c++) {
      const r = R0 + (R1 - R0) * c / cols;
      let x = 0.2;
      for (let i = 0; i < 400; i++) x = f(r, x);
      for (let i = 0; i < 160; i++) { x = f(r, x); g.fillRect(o.x0 + c, o.y0 + o.h - x * o.h, 1, 1); }
    }
    return off;
  }
  function drawB() {
    const { ctx, size: { w, h } } = B; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const o = frame(w, h);
    o.X = (r) => o.x0 + (r - R0) / (R1 - R0) * o.w; o.Y = (v) => o.y0 + o.h - v * o.h;
    o.xt = [2.5, 3, 3.5, 4].map((r) => [r, String(r)]);
    o.yt = [[0, "0"], [0.5, ".5"], [1, "1"]];
    o.xlabel = "번식력 r"; o.ylabel = "오래 지나 머무는 값";
    axes(ctx, o);
    if (!bif) bif = buildBif(w, h, o);
    ctx.drawImage(bif, 0, 0, w, h);
    const r = +sR.value;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(o.X(r), o.y0); ctx.lineTo(o.X(r), o.y0 + o.h); ctx.stroke(); ctx.lineWidth = 1;
    B.o = o;
  }
  function update() {
    const r = +sR.value; oR.textContent = r.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
    const p = kind(r);
    dKind.textContent = p === 1 ? "한 값으로 모임" : p ? `${p}개 값을 오감` : "주기 없음 (혼돈)";
    dKind.classList.toggle("bad", p === 0);
    const s = splitYear(r);
    dSplit.textContent = s ? `${s}년째` : "200년 안에는 없음";
    dFix.textContent = `${(1 - 1 / r).toFixed(3)}, ${(2 - r).toFixed(2).replace("-", "−")}`;
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(+b.dataset.r - r) < 1e-9)));
    drawA(); drawB();
  }
  sR.addEventListener("input", update);
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { sR.value = b.dataset.r; update(); }));
  bView.addEventListener("click", () => {
    cobweb = !cobweb; bView.setAttribute("aria-pressed", String(cobweb)); drawA();
  });
  cvB.addEventListener("click", (e) => {
    const o = B.o; if (!o) return;
    const rect = cvB.getBoundingClientRect();
    const r = R0 + (e.clientX - rect.left - o.x0) / o.w * (R1 - R0);
    if (r >= R0 && r <= R1) { sR.value = r.toFixed(3); update(); }
  });
  cvB.style.cursor = "crosshair";
  update();
})();
