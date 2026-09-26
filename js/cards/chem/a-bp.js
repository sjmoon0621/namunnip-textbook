/* 카드: 물의 끓는점은 왜 100 °C나 될까? — 14~17족 수소 화합물의 끓는점 (1 atm 실측) */
(() => {
  const root = document.getElementById("card-chem-bp");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const dSel = $(".v-sel"), dTr = $(".v-tr"), dGap = $(".v-gap"), msg = $(".bp-msg");

  const G = {
    14: { c: C.ink3, n: ["CH₄", "SiH₄", "GeH₄", "SnH₄"], t: [-161.5, -111.9, -88.5, -51.8] },
    15: { c: "#3f6fb5", n: ["NH₃", "PH₃", "AsH₃", "SbH₃"], t: [-33.3, -87.7, -62.5, -17.1] },
    16: { c: C.apple, n: ["H₂O", "H₂S", "H₂Se", "H₂Te"], t: [100.0, -60.3, -41.3, -2.2] },
    17: { c: C.forest, n: ["HF", "HCl", "HBr", "HI"], t: [19.5, -85.1, -66.8, -35.4] },
  };
  // 3~5주기 값으로 그은 직선을 2주기까지 늘인 값
  const trend = (g) => { const y = G[g].t.slice(1), m = (y[0] + y[1] + y[2]) / 3, s = (y[2] - y[0]) / 2; return m - 2 * s; };
  let focus = 16, per = 2, pts = [];

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520;
    const x0 = small ? 40 : 50, y0 = 22, pw = w - x0 - (small ? 50 : 70), ph = h - y0 - 38;
    const X = (p) => x0 + (p - 1.7) / 3.6 * pw, Y = (t) => y0 + (1 - (t + 180) / 300) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [[2, "2주기"], [3, "3"], [4, "4"], [5, "5"]], yt: [[-150, "−150"], [-100, "−100"], [-50, "−50"], [0, "0"], [50, "50"], [100, "100"]], ylabel: "끓는점 (°C, 1 atm)" });
    pts = [];
    for (const g of [14, 15, 16, 17]) {
      const d = G[g], on = g === focus;
      ctx.globalAlpha = on ? 1 : 0.4;
      ctx.strokeStyle = d.c; ctx.lineWidth = on ? 2.2 : 1.4;
      ctx.beginPath(); d.t.forEach((t, i) => i ? ctx.lineTo(X(i + 2), Y(t)) : ctx.moveTo(X(i + 2), Y(t))); ctx.stroke();
      d.t.forEach((t, i) => {
        const x = X(i + 2), y = Y(t); pts.push({ g, i, x, y });
        ctx.beginPath(); ctx.arc(x, y, on ? 5 : 4, 0, Math.PI * 2); ctx.fillStyle = d.c; ctx.fill();
        if (on && i === per - 2) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.stroke(); }
      });
      if (on) {
        ctx.font = `600 ${small ? 10 : 11.5}px ${F.mono}`; ctx.fillStyle = d.c; ctx.textAlign = "left";
        d.t.forEach((t, i) => ctx.fillText(d.n[i], X(i + 2) + 9, Y(t) + (i ? 14 : 4)));
      }
      ctx.globalAlpha = 1;
    }
    // 초점 족의 추세선 연장
    const d = G[focus], tr = trend(focus), y = d.t.slice(1), m = (y[0] + y[1] + y[2]) / 3, s = (y[2] - y[0]) / 2;
    ctx.setLineDash([4, 4]); ctx.strokeStyle = d.c; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(X(5), Y(m + s)); ctx.lineTo(X(2), Y(tr)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(X(2), Y(tr), 5, 0, Math.PI * 2); ctx.strokeStyle = d.c; ctx.lineWidth = 1.5; ctx.fillStyle = C.card; ctx.fill(); ctx.stroke();
    // 차이 화살표
    if (Math.abs(d.t[0] - tr) > 25) {
      const ax = X(2) + 14;
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(ax, Y(tr) - 6); ctx.lineTo(ax, Y(d.t[0]) + 6); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.font = `${small ? 10 : 11}px ${F.sans}`; ctx.textAlign = "left";
      const dy = d.t[0] > tr ? 1 : -1;
      ctx.beginPath(); ctx.moveTo(ax, Y(d.t[0]) + 2 * dy); ctx.lineTo(ax - 4, Y(d.t[0]) + 9 * dy); ctx.lineTo(ax + 4, Y(d.t[0]) + 9 * dy); ctx.fill();
      ctx.fillText(`${Math.round(d.t[0] - tr) > 0 ? "+" : ""}${Math.round(d.t[0] - tr)} °C`, ax + 6, (Y(tr) + Y(d.t[0])) / 2 + 4);
    }
    ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`; ctx.textAlign = "right";
    [14, 15, 16, 17].forEach((q, i) => { ctx.fillStyle = G[q].c; ctx.fillText(`● ${q}족`, x0 + pw + (small ? 44 : 60), y0 + 10 + i * 14); });
    ctx.fillStyle = C.ink3; ctx.fillText("빈 원: 3~5주기 추세를 직선으로 늘인 어림값", x0 + pw, y0 + ph - 6);
  }

  function info() {
    const d = G[focus], i = per - 2, tr = trend(focus);
    dSel.textContent = `${d.n[i]} ${d.t[i].toFixed(1)} °C`;
    dTr.textContent = `약 ${Math.round(tr)} °C`;
    dGap.textContent = `${Math.round(d.t[0] - tr) > 0 ? "+" : ""}${Math.round(d.t[0] - tr)} °C`;
    msg.textContent = focus === 14
      ? "14족은 2주기인 CH₄가 가장 낮습니다. 분자가 작을수록 분산력이 약하다는 추세 그대로입니다."
      : `${d.n[0]}는 추세로 어림한 값보다 약 ${Math.round(d.t[0] - tr)} °C 높습니다. ${{ 15: "N", 16: "O", 17: "F" }[focus]}–H 결합의 수소가 이웃 분자와 수소 결합을 하기 때문입니다.`;
    root.querySelectorAll("[data-g]").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.g === focus ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { focus = +b.dataset.g; per = 2; info(); }));
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const p = pts.map((q) => ({ ...q, d: Math.hypot(q.x - x, q.y - y) })).sort((a, b) => a.d - b.d)[0];
    if (p && p.d < 24) { focus = p.g; per = p.i + 2; info(); }
  });
  info();
})();
