/* 카드: 모양은 그대로 두고 크기만 바꾸면? — 제곱-세제곱 법칙을 로그 그래프로 */
(() => {
  const root = document.getElementById("card-extra-scale");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = root.querySelector("canvas");
  const sL = $(".L"), oL = $(".L-out");
  const dM = $(".mass"), dP = $(".press"), dS = $(".sv"), dV = $(".vt");
  const H = 1.7, VT = 55; // 사람 기준 몸길이(m), 떨어지는 최고 속도(m/s)
  const lines = [
    ["무게 k³", 3, "rgba(181,83,47,.95)"],
    ["넓이 k²", 2, "rgba(47,109,176,.95)"],
    ["뼈 압력 k", 1, "rgba(35,35,38,.9)"],
    ["최고 속도 √k", 0.5, "rgba(59,124,42,.95)"],
  ];
  const len = (m) => m < 0.01 ? `${(m * 1000).toFixed(1)} mm` : m < 1 ? `${(m * 100).toFixed(1)} cm` : `${m.toFixed(m < 10 ? 2 : 0)} m`;
  const num = (x) => x >= 1000 || x < 0.01 ? x.toExponential(1) : x < 1 ? x.toFixed(3) : x.toFixed(1);
  const V = fit(cv, () => draw());
  function draw() {
    const { ctx, size: { w, h } } = V; if (!w) return;
    const L = 10 ** +sL.value, k = L / H;
    const padL = 40, padR = 10, padT = 12, padB = 30, pw = w - padL - padR, ph = h - padT - padB;
    const lx0 = -3, lx1 = 2, ly0 = -8, ly1 = 4;
    const X = (l) => padL + (Math.log10(l) - lx0) / (lx1 - lx0) * pw;
    const Y = (v) => padT + (1 - (Math.log10(v) - ly0) / (ly1 - ly0)) * ph;
    ctx.clearRect(0, 0, w, h);
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      xt: [[0.001, "1mm"], [0.01, "1cm"], [0.1, "10cm"], [1, "1m"], [10, "10m"], [100, "100m"]],
      yt: [[1e-8, "10⁻⁸"], [1e-4, "10⁻⁴"], [1, "1"], [1e4, "10⁴"]],
      xlabel: "몸길이", ylabel: "사람을 1로 둔 배율" });
    ctx.font = `10.5px ${F.sans}`;
    lines.forEach(([lab, p, col], j) => {
      ctx.beginPath(); ctx.moveTo(X(1e-3), Y((1e-3 / H) ** p)); ctx.lineTo(X(100), Y((100 / H) ** p));
      ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke(); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(X(L), Y(k ** p), 4, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.fillStyle = col; ctx.textAlign = "left"; ctx.fillText(lab, padL + 6, padT + 14 + j * 14);
    });
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3;
    ctx.beginPath(); ctx.moveTo(X(L), padT); ctx.lineTo(X(L), padT + ph); ctx.stroke(); ctx.setLineDash([]);
  }
  function update() {
    const L = 10 ** +sL.value, k = L / H;
    oL.textContent = len(L);
    dM.textContent = num(k ** 3);
    dP.textContent = `${num(k)}배`;
    dP.classList.toggle("bad", k > 3);
    dS.textContent = `${num(1 / k)}배`;
    dV.textContent = `${(VT * Math.sqrt(k)).toFixed(1)} m/s`;
    draw();
  }
  sL.addEventListener("input", update);
  root.querySelectorAll("[data-L]").forEach((b) => b.addEventListener("click", () => { sL.value = Math.log10(+b.dataset.L); update(); }));
  update();
})();
