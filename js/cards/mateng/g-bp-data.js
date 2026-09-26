/* 카드: 극성이 없는 분자도 서로 끌어당길까? — 알케인, 펜테인 이성질체, 14~17족 수소 화합물의 끓는점 실측 자료 */
(() => {
  const root = document.getElementById("card-mateng-bp-data");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), nForce = $(".n-force"), nPoint = $(".n-point");
  const SETS = {
    alkane: { x: "분자량", force: "분산력", point: "탄소 1개마다 약 20~40 °C씩 오름",
      series: [{ name: "알케인", col: "#3f6fa3", pts: [["CH₄", 16, -161.5], ["C₂H₆", 30, -88.6], ["C₃H₈", 44, -42.1], ["C₄H₁₀", 58, -0.5], ["C₅H₁₂", 72, 36.1], ["C₆H₁₄", 86, 68.7], ["C₇H₁₆", 100, 98.4], ["C₈H₁₈", 114, 125.6]] }] },
    isomer: { x: "", force: "분산력", point: "분자량이 같아도 모양이 뭉칠수록 낮음",
      series: [{ name: "C₅H₁₂", col: "#3f6fa3", pts: [["펜테인 (곧은 사슬)", 1, 36.1], ["아이소펜테인 (가지 1개)", 2, 27.7], ["네오펜테인 (공 모양)", 3, 9.5]] }] },
    hydride: { x: "분자량", force: "분산력 + 수소 결합(H₂O, HF, NH₃)", point: "2주기의 H₂O, HF, NH₃만 튀어 오름",
      series: [
        { name: "14족", col: "#8d8d92", pts: [["CH₄", 16, -161.5], ["SiH₄", 32, -111.8], ["GeH₄", 77, -88.5], ["SnH₄", 123, -52]] },
        { name: "15족", col: "#3b7c2a", pts: [["NH₃", 17, -33.3], ["PH₃", 34, -87.7], ["AsH₃", 78, -62.5], ["SbH₃", 125, -17]] },
        { name: "16족", col: "#3f6fa3", pts: [["H₂O", 18, 100], ["H₂S", 34, -60.3], ["H₂Se", 81, -41.3], ["H₂Te", 130, -2.2]] },
        { name: "17족", col: "#b5532f", pts: [["HF", 20, 19.5], ["HCl", 36, -85.1], ["HBr", 81, -66.8], ["HI", 128, -35.4]] },
      ] },
  };
  let set = "alkane";
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const S = SETS[set], all = S.series.flatMap((s) => s.pts);
    const x0 = 50, y0 = h - 34, pw = w - x0 - 20, ph = h - 56;
    const xs = all.map((p) => p[1]), xmin = set === "isomer" ? 0.5 : 0, xmax = set === "isomer" ? 3.5 : Math.max(...xs) * 1.08;
    const ymin = -180, ymax = set === "alkane" ? 140 : 120;
    const X = (x) => x0 + (x - xmin) / (xmax - xmin) * pw, Y = (y) => y0 - (y - ymin) / (ymax - ymin) * ph;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let y = -150; y <= ymax; y += 50) { ctx.beginPath(); ctx.moveTo(x0, Y(y)); ctx.lineTo(x0 + pw, Y(y)); ctx.stroke(); ctx.fillText(`${y}`, x0 - 5, Y(y) + 3); }
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + pw, Y(0)); ctx.stroke();
    ctx.textAlign = "left"; ctx.fillText("끓는점 (°C)", x0 + 4, y0 - ph + 4);
    if (S.x) { ctx.textAlign = "center"; [0, 25, 50, 75, 100, 125].filter((v) => v < xmax).forEach((v) => ctx.fillText(`${v}`, X(v), y0 + 13)); ctx.fillText(S.x, x0 + pw / 2, y0 + 26); }
    S.series.forEach((s) => {
      ctx.strokeStyle = s.col; ctx.lineWidth = 2; ctx.beginPath(); s.pts.forEach(([, x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke();
      s.pts.forEach(([n, x, y]) => {
        ctx.fillStyle = s.col; ctx.beginPath(); ctx.arc(X(x), Y(y), 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.ink; ctx.font = `${set === "isomer" ? 11.5 : 10.5}px ${F.sans}`; ctx.textAlign = set === "isomer" ? "center" : "left";
        ctx.fillText(set === "isomer" ? `${n} ${y} °C` : n, X(x) + (set === "isomer" ? 0 : 6), Y(y) - 7);
      });
      if (S.series.length > 1) { const [, x, y] = s.pts[s.pts.length - 1]; ctx.fillStyle = s.col; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(s.name, X(x) + 6, Y(y) + 12); }
    });
  }
  function update() {
    const S = SETS[set]; nForce.textContent = S.force; nPoint.textContent = S.point;
    root.querySelectorAll("[data-set]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.set === set)));
    draw();
  }
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => { set = b.dataset.set; update(); }));
  update();
})();
