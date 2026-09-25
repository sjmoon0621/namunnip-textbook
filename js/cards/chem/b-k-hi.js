/* 카드: 평형 상수는 무엇을 알려 줄까? — H₂ + I₂ ⇌ 2HI (430 °C, K = 54.3) 실험 기록에서 K 식 찾기 */
(() => {
  const root = document.getElementById("card-chem-k-hi");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sl = { a: $(".h2"), b: $(".i2"), c: $(".hi") }, ou = { a: $(".h2-out"), b: $(".i2-out"), c: $(".hi-out") };
  const go = $(".react"), rec = $(".record"), clr = $(".clear"), tbody = $("tbody");
  const dQ = $(".q-now"), dQ1 = $(".q1-now"), dSt = $(".state");
  const K = 54.3;
  const COL = { a: "#6f8fb8", b: "#7b4e9e", c: C.forest };

  // 평형 위치: (c+2x)² = K(a−x)(b−x) 를 만족하는 x (mM 단위, 정반응 방향 +)
  function solve(a, b, c) {
    let lo = -c / 2, hi = Math.min(a, b);
    if (hi - lo < 1e-12) return 0;
    const f = (x) => (c + 2 * x) ** 2 - K * (a - x) * (b - x);
    for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; f(m) > 0 ? hi = m : lo = m; }
    return (lo + hi) / 2;
  }

  let init = { a: 5, b: 5, c: 0 }, xeq = 0, x = 0, anim = -1, runs = [];
  function readSliders() {
    init = { a: +sl.a.value, b: +sl.b.value, c: +sl.c.value };
    for (const k in sl) ou[k].textContent = (+sl[k].value).toFixed(1);
    xeq = solve(init.a, init.b, init.c); x = 0; anim = -1;
    rec.disabled = true; update();
  }
  const conc = () => ({ a: init.a - x, b: init.b - x, c: init.c + 2 * x });
  const Q = (s) => s.a > 1e-9 && s.b > 1e-9 ? (s.c * s.c) / (s.a * s.b) : Infinity;
  const Q1 = (s) => s.a > 1e-9 && s.b > 1e-9 ? (s.c / 1000) / ((s.a / 1000) * (s.b / 1000)) : Infinity; // M⁻¹
  const fmt = (v) => !isFinite(v) ? "∞" : v === 0 ? "0" : v >= 1000 ? Math.round(v).toLocaleString("en-US") : v >= 10 ? v.toFixed(1) : v.toFixed(2);

  function update() {
    const s = conc();
    dQ.textContent = fmt(Q(s)); dQ1.textContent = fmt(Q1(s));
    const q = Q(s);
    dSt.textContent = anim >= 0 && anim < 1 ? "반응 중" : Math.abs(x - xeq) < 1e-6 && (init.a + init.b + init.c) > 0 && isFinite(q) ? "평형" :
      !isFinite(q) ? "H₂나 I₂가 없음" : q < K ? "정반응 쪽으로 갈 상태" : q > K ? "역반응 쪽으로 갈 상태" : "평형";
    draw();
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 520;
    const split = Math.round(w * (narrow ? 0.46 : 0.44));
    // ── 막대: 농도 (mM)
    const s = conc(), top = 26, bot = h - 40, cMax = 20;
    const Y = (v) => bot - v / cMax * (bot - top);
    NM.axes(ctx, { x0: 34, y0: top, w: split - 44, h: bot - top, X: (v) => v, Y, xt: [], yt: [[0, "0"], [5, "5"], [10, "10"], [15, "15"], [20, "20"]], ylabel: "농도 (×10⁻³ mol/L)" });
    const keys = [["a", "H₂"], ["b", "I₂"], ["c", "HI"]];
    const bw = (split - 44) / 3;
    keys.forEach(([k, lab], i) => {
      const x0 = 34 + i * bw + bw * 0.2, ww = bw * 0.6;
      ctx.fillStyle = COL[k]; ctx.fillRect(x0, Y(Math.min(s[k], cMax)), ww, bot - Y(Math.min(s[k], cMax)));
      ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
      ctx.strokeRect(x0 + .5, Y(Math.min(init[k], cMax)) + .5, ww - 1, bot - Y(Math.min(init[k], cMax)));
      ctx.setLineDash([]);
      ctx.font = `12px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
      ctx.fillText(lab, x0 + ww / 2, bot + 16);
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`;
      ctx.fillText(s[k].toFixed(2), x0 + ww / 2, Math.max(top + 10, Y(Math.min(s[k], cMax)) - 5));
    });
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText("점선 = 처음 농도", 34, h - 6);

    // ── 오른쪽: 기록한 실험들의 두 후보 식 값 (로그 눈금)
    const x0 = split + 46, y0 = 26, pw = w - x0 - 10, ph = h - y0 - 40;
    const L0 = 0, L1 = 6;
    const YL = (v) => y0 + (1 - (Math.log10(v) - L0) / (L1 - L0)) * ph;
    const n = Math.max(runs.length, 3);
    const X = (i) => x0 + (i + 0.5) / n * pw;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y: YL, xt: runs.map((_, i) => [i, `${i + 1}`]),
      yt: [[1, "1"], [10, "10"], [100, "10²"], [1e3, "10³"], [1e4, "10⁴"], [1e5, "10⁵"], [1e6, "10⁶"]], ylabel: "평형에서 계산한 값 (로그 눈금)", xlabel: "실험 번호" });
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.forest; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, YL(K)); ctx.lineTo(x0 + pw, YL(K)); ctx.stroke(); ctx.setLineDash([]);
    runs.forEach((r, i) => {
      const cx = X(i);
      ctx.fillStyle = C.forest; ctx.beginPath(); ctx.arc(cx, YL(r.q), 5, 0, Math.PI * 2); ctx.fill();
      if (r.q1 > 1 && r.q1 < 1e6) { ctx.fillStyle = C.warn; ctx.fillRect(cx - 4.5, YL(r.q1) - 4.5, 9, 9); }
    });
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillStyle = C.forest; ctx.fillText("● [HI]²/([H₂][I₂])", x0 + pw, y0 + 12);
    ctx.fillStyle = C.warn; ctx.fillText("■ [HI]/([H₂][I₂])", x0 + pw, y0 + 26);
    if (!runs.length) { ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("평형에 도달하면 ‘기록’을 누르세요", x0 + pw / 2, y0 + ph / 2); }
    ctx.textAlign = "left";
  }

  function renderTable() {
    tbody.innerHTML = runs.map((r, i) => `<tr><td>${i + 1}</td><td>${r.i}</td><td>${r.e.a.toFixed(2)}</td><td>${r.e.b.toFixed(2)}</td><td>${r.e.c.toFixed(2)}</td><td class="bad">${fmt(r.q1)}</td><td class="good">${fmt(r.q)}</td></tr>`).join("") ||
      `<tr><td colspan="7" class="dim">아직 기록이 없습니다.</td></tr>`;
  }

  Object.values(sl).forEach((el) => el.addEventListener("input", readSliders));
  go.addEventListener("click", () => { x = 0; anim = 0; });
  rec.addEventListener("click", () => {
    const s = conc();
    if (runs.length >= 6) runs.shift();
    runs.push({ i: `${init.a.toFixed(0)}/${init.b.toFixed(0)}/${init.c.toFixed(0)}`, e: s, q: Q(s), q1: Q1(s) });
    rec.disabled = true; renderTable(); draw();
  });
  clr.addEventListener("click", () => { runs = []; renderTable(); draw(); });
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [a, bb, c] = b.dataset.set.split(",");
    sl.a.value = a; sl.b.value = bb; sl.c.value = c; readSliders();
  }));
  loop(cv, (dt) => {
    if (anim < 0 || anim >= 1) return;
    anim = Math.min(1, anim + dt / 2.2);
    x = xeq * (1 - Math.exp(-5 * anim)) / (1 - Math.exp(-5));
    if (anim >= 1) { x = xeq; rec.disabled = !isFinite(Q(conc())); }
    update();
  });
  readSliders(); renderTable();
})();
