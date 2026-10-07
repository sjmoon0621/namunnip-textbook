/* 카드: 강물이 왜 어떤 여름에만 초록색이 될까? — 남조류·규조류 경쟁, 영양염·수온·성층/흐름, 바닥 산소 (모식) */
(() => {
  const root = document.getElementById("card-clim-algal");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const PRE = { clean: [15, 24, 0.5], river: [60, 27, 0.75], weir: [60, 27, 0.15], heat: [60, 30.5, 0.1] };
  const CELL = 2e6, D0 = 152, D1 = 273;

  // 하루 단위로 6–9월을 계산한다. 반환: [날, 수온, 남조류 세포/mL, 규조류(상대), 바닥 산소 mg/L]
  function sim(TP, Tmax, m) {
    const S = 1 - m, flush = 0.01 + 0.2 * m, K0 = Math.pow(TP / 100, 2.5);
    let K = K0;   // 바닥 산소가 바닥나면 퇴적물에서 인이 녹아 나와(내부 부하) 쓸 수 있는 영양염이 늘어난다
    let Cy = 2e-4, Di = 0.01, DO = 9;
    const out = [];
    for (let d = D0; d <= D1; d++) {
      const T = Tmax - 6 + 6 * Math.exp(-0.5 * ((d - 215) / 30) ** 2);
      const muc = 0.55 * Math.exp(-0.5 * ((T - 28) / 5) ** 2) * (0.4 + 0.6 * S);
      const mud = 0.9 * Math.exp(-0.5 * ((T - 18) / 8) ** 2);
      for (let k = 0; k < 4; k++) {
        const lim = Math.max(0, 1 - (Cy + Di) / K);
        Cy += (muc * lim - 0.08 - flush) * Cy / 4;
        Di += (mud * lim - 0.08 - flush - 0.25 * S) * Di / 4;
        Cy = Math.max(Cy, 1e-6); Di = Math.max(Di, 1e-6);
      }
      DO += 0.3 * (1 - 0.85 * S) * (9 - DO) - 2.5 * (Cy + Di) * (0.3 + S);
      DO = Math.min(10, Math.max(0, DO));
      if (DO < 2) K = Math.min(2 * K0, K + 0.015 * K0);
      out.push([d, T, Cy * CELL, Di, DO]);
    }
    return out;
  }

  const { ctx, size } = fit($("canvas"), () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const TP = +$(".tp").value, Tw = +$(".tw").value, m = +$(".mx").value;
    const r = sim(TP, Tw, m);
    const x0 = 48, gw = w - x0 - 40, y0 = 22, h1 = (h - 70) * 0.62, y1 = y0 + h1 + 34, h2 = h - y1 - 22;
    const X = (d) => x0 + (d - D0) / (D1 - D0) * gw;
    const mt = [[152, "6월"], [182, "7월"], [213, "8월"], [244, "9월"]];
    // 위: 남조류 (로그)
    const L0 = 1, L1 = 7, Y = (c) => y0 + h1 - (Math.log10(Math.max(c, 10)) - L0) / (L1 - L0) * h1;
    axes(ctx, { x0, y0, w: gw, h: h1, X, Y, xt: mt, yt: [10, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7].map((c, i) => [c, i < 2 ? String(c) : `10${"²³⁴⁵⁶⁷"[i - 1]}`]), ylabel: "남조류 세포/mL (로그 눈금)" });
    [[1e3, "관심"], [1e4, "경계"], [1e6, "대발생"]].forEach(([c, s]) => {
      ctx.strokeStyle = C.warn; ctx.globalAlpha = 0.7; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, Y(c) + .5); ctx.lineTo(x0 + gw, Y(c) + .5); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.fillStyle = C.warn; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(s, x0 + gw + 4, Y(c) + 4);
    });
    // 규조류: 오른쪽 축 없이 상대 막대 대신 선 (0–1을 위 그래프의 아래쪽 절반에)
    const YD = (v) => y0 + h1 - Math.min(v / 0.6, 1) * h1 * 0.5;
    ctx.strokeStyle = "#8a6d3b"; ctx.lineWidth = 1.6; ctx.setLineDash([2, 2]); ctx.beginPath();
    r.forEach(([d, , , di], i) => (i ? ctx.lineTo(X(d), YD(di)) : ctx.moveTo(X(d), YD(di)))); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = "#2f8f4e"; ctx.lineWidth = 2.4; ctx.beginPath();
    r.forEach(([d, , c], i) => (i ? ctx.lineTo(X(d), Y(c)) : ctx.moveTo(X(d), Y(c)))); ctx.stroke();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    [["남조류", "#2f8f4e", []], ["규조류 (상대량)", "#8a6d3b", [2, 2]]].forEach(([s, c, dash], i) => {
      ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0 + 8, y0 + 10 + i * 15); ctx.lineTo(x0 + 22, y0 + 10 + i * 15); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.fillText(s, x0 + 27, y0 + 14 + i * 15);
    });
    // 아래: 바닥 산소
    const YO = (o) => y1 + h2 - o / 10 * h2;
    axes(ctx, { x0, y0: y1, w: gw, h: h2, X, Y: YO, xt: [], yt: [[0, "0"], [5, "5"], [10, "10"]], ylabel: "바닥 용존 산소 (mg/L, 상대값)" });
    ctx.fillStyle = "rgba(181,83,47,.12)"; ctx.fillRect(x0, YO(2), gw, YO(0) - YO(2));
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath();
    r.forEach(([d, , , , o], i) => (i ? ctx.lineTo(X(d), YO(o)) : ctx.moveTo(X(d), YO(o)))); ctx.stroke();
    const mx = Math.max(...r.map((x) => x[2])), low = r.filter((x) => x[4] < 2).length;
    $(".n1").textContent = mx >= 1e3 ? (() => { const e = Math.floor(Math.log10(mx)), a = Math.round(mx / 10 ** e); return a >= 10 ? `약 10${"⁰¹²³⁴⁵⁶⁷⁸⁹"[e + 1]}` : `약 ${a} × 10${"⁰¹²³⁴⁵⁶⁷⁸⁹"[e]}`; })() : "1,000 미만";
    const lev = mx >= 1e6 ? ["조류 대발생", "bad"] : mx >= 1e4 ? ["경계", "bad"] : mx >= 1e3 ? ["관심", ""] : ["해당 없음", "good"];
    $(".n2").textContent = lev[0]; $(".n2").className = "n2 " + lev[1];
    $(".n3").textContent = `${low}일`; $(".n3").className = "n3 " + (low > 0 ? "bad" : "good");
  }
  const mlab = (m) => (m < 0.25 ? "정체 (성층 강함)" : m < 0.5 ? "느림" : m < 0.75 ? "보통" : "빠름 (잘 섞임)");
  function sync() { $(".p-out").textContent = $(".tp").value; $(".t-out").textContent = $(".tw").value; $(".m-out").textContent = mlab(+$(".mx").value); }
  root.querySelectorAll(".tp, .tw, .mx").forEach((el) => el.addEventListener("input", () => { root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", "false")); sync(); draw(); }));
  $(".c2-pre").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    const [tp, tw, m] = PRE[b.dataset.p]; $(".tp").value = tp; $(".tw").value = tw; $(".mx").value = m;
    root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); sync(); draw();
  });
  sync();
  draw();
})();
