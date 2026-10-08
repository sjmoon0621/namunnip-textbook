/* 카드: 점을 찍지 않고 그래프의 모양을 알 수 있을까? — 정의역·절편 → 증감·극값 → 볼록·변곡점 → 점근선 → 개형 */
(() => {
  const root = document.getElementById("card-calc2-curve-sketch");
  if (!root) return;
  const { C, fit } = NM;
  const K = NMCalc, n = K.n;
  const $ = (s) => root.querySelector(s);
  const E = Math.exp, LN = Math.log, R2 = Math.SQRT2;
  const NAMES = ["정의역과 절편", "증가·감소와 극값", "볼록과 변곡점", "극한과 점근선", "개형 완성"];
  /* 표: x, f′, f″, f(2단계), f(3단계 이후). 빈 칸은 정의되지 않는 점 */
  const P = {
    lnx: {
      f: (x) => (x > 0 ? LN(x) / x : NaN), xr: [-0.6, 10], yr: [-1.6, 0.8], xs: 1, ys: 0.5,
      out: (x) => x <= 0, zeros: [[1, 0]],
      crit: [[Math.E, 1 / Math.E, "극대 1/e"]], ip: [[E(1.5), 1.5 * E(-1.5)]],
      asym: [["v", 0, "x = 0"], ["h", 0, "y = 0"]],
      text: [
        "정의역은 <i>x</i> &gt; 0입니다(회색은 정의역 밖). ln <i>x</i> = 0에서 <i>x</i>절편은 <i>x</i> = 1입니다.",
        "<i>f</i>′(<i>x</i>) = (1 − ln <i>x</i>)/<i>x</i><sup>2</sup>. <i>x</i> = <i>e</i>에서 0이고 그 왼쪽은 +, 오른쪽은 −입니다. 극댓값 <i>f</i>(<i>e</i>) = 1/<i>e</i> ≈ 0.368.",
        "<i>f</i>″(<i>x</i>) = (2 ln <i>x</i> − 3)/<i>x</i><sup>3</sup>. <i>x</i> = <i>e</i><sup>3/2</sup> ≈ 4.48에서 −에서 +로 바뀌므로 변곡점은 (<i>e</i><sup>3/2</sup>, 3/(2<i>e</i><sup>3/2</sup>)) ≈ (4.48, 0.335)입니다.",
        "<i>x</i> → 0+이면 ln <i>x</i> → −∞이고 1/<i>x</i> → ∞이므로 <i>f</i>(<i>x</i>) → −∞입니다. <i>x</i> → ∞이면 ln <i>x</i>가 <i>x</i>보다 훨씬 느리게 커져 <i>f</i>(<i>x</i>) → 0입니다. 점근선은 <i>x</i> = 0과 <i>y</i> = 0입니다.",
        "아래에서 올라와 (1, 0)을 지나고, <i>x</i> = <i>e</i>에서 꼭대기를 찍은 뒤 내려가며, 4.48 근처에서 휘는 방향을 바꾸고 <i>x</i>축에 다가갑니다.",
      ],
      cols: [["0", "", "", "", ""], ["⋯", "+", "− ∩", "↗", "↗"], ["e", "0", "− ∩", "1/e 극대", "1/e 극대"], ["⋯", "−", "− ∩", "↘", "↘"],
        ["e√e", "−", "0", "↘", "변곡점"], ["⋯", "−", "+ ∪", "↘", "↘"]],
    },
    x2e: {
      f: (x) => x * x * E(-x), xr: [-1.5, 8], yr: [-0.3, 1.2], xs: 1, ys: 0.5,
      out: () => false, zeros: [[0, 0]],
      crit: [[0, 0, "극소 0"], [2, 4 * E(-2), "극대 4/e²"]], ip: [[2 - R2, (2 - R2) ** 2 * E(R2 - 2)], [2 + R2, (2 + R2) ** 2 * E(-2 - R2)]],
      asym: [["h", 0, "y = 0"]],
      text: [
        "정의역은 실수 전체이고 <i>f</i>(<i>x</i>) ≥ 0입니다. <i>f</i>(<i>x</i>) = 0인 곳은 <i>x</i> = 0뿐이고, 그래프는 원점에서 <i>x</i>축에 닿습니다.",
        "<i>f</i>′(<i>x</i>) = <i>x</i>(2 − <i>x</i>)<i>e</i><sup>−<i>x</i></sup>. 부호가 −, +, −로 바뀌어 극솟값 <i>f</i>(0) = 0, 극댓값 <i>f</i>(2) = 4/<i>e</i><sup>2</sup> ≈ 0.541입니다.",
        "<i>f</i>″(<i>x</i>) = (<i>x</i><sup>2</sup> − 4<i>x</i> + 2)<i>e</i><sup>−<i>x</i></sup>. <i>x</i> = 2 ± √2에서 부호가 바뀌어 변곡점이 두 개 있습니다. 약 (0.586, 0.191), (3.414, 0.383)입니다.",
        "<i>x</i> → ∞이면 <i>e</i><sup><i>x</i></sup>가 <i>x</i><sup>2</sup>보다 훨씬 빠르게 커져 <i>f</i>(<i>x</i>) → 0입니다. <i>y</i> = 0이 점근선입니다. <i>x</i> → −∞이면 <i>f</i>(<i>x</i>) → ∞이라 왼쪽에는 점근선이 없습니다.",
        "왼쪽 위에서 내려와 원점에 닿고, 올라가 <i>x</i> = 2에서 꼭대기를 찍은 뒤 <i>x</i>축으로 다가갑니다. 휘는 방향은 두 번 바뀝니다.",
      ],
      cols: [["⋯", "−", "+ ∪", "↘", "↘"], ["0", "0", "+ ∪", "0 극소", "0 극소"], ["⋯", "+", "+ ∪", "↗", "↗"], ["2−√2", "+", "0", "↗", "변곡점"],
        ["⋯", "+", "− ∩", "↗", "↗"], ["2", "0", "− ∩", "극대", "극대"], ["⋯", "−", "− ∩", "↘", "↘"], ["2+√2", "−", "0", "↘", "변곡점"], ["⋯", "−", "+ ∪", "↘", "↘"]],
    },
    ex: {
      f: (x) => (x === 0 ? NaN : E(x) / x), xr: [-4, 3.5], yr: [-4, 8], xs: 1, ys: 2,
      out: (x) => Math.abs(x) < 0.02, zeros: [],
      crit: [[1, Math.E, "극소 e"]], ip: [],
      asym: [["v", 0, "x = 0"], ["h", 0, "y = 0"]],
      text: [
        "정의역은 <i>x</i> ≠ 0입니다. <i>e</i><sup><i>x</i></sup> &gt; 0이라 <i>f</i>(<i>x</i>) = 0이 되는 곳이 없고, <i>x</i> = 0이 빠지므로 <i>y</i>절편도 없습니다. <i>x</i> &lt; 0에서는 음수, <i>x</i> &gt; 0에서는 양수입니다.",
        "<i>f</i>′(<i>x</i>) = <i>e</i><sup><i>x</i></sup>(<i>x</i> − 1)/<i>x</i><sup>2</sup>. <i>x</i> &lt; 1(0 제외)에서 −, <i>x</i> &gt; 1에서 +이므로 극솟값 <i>f</i>(1) = <i>e</i>입니다.",
        "<i>f</i>″(<i>x</i>) = <i>e</i><sup><i>x</i></sup>(<i>x</i><sup>2</sup> − 2<i>x</i> + 2)/<i>x</i><sup>3</sup>. <i>x</i><sup>2</sup> − 2<i>x</i> + 2 &gt; 0이므로 부호는 <i>x</i>의 부호와 같습니다. 부호는 <i>x</i> = 0에서 바뀌지만 그 점이 정의역에 없어 변곡점은 없습니다.",
        "<i>x</i> → 0−이면 <i>f</i>(<i>x</i>) → −∞, <i>x</i> → 0+이면 <i>f</i>(<i>x</i>) → ∞이므로 <i>x</i> = 0이 점근선입니다. <i>x</i> → −∞이면 <i>f</i>(<i>x</i>) → 0이므로 <i>y</i> = 0도 점근선입니다.",
        "그래프는 두 조각입니다. 왼쪽은 <i>x</i>축 아래에서 위로 볼록하게 내려가고, 오른쪽은 (1, <i>e</i>)를 바닥으로 하는 아래로 볼록한 곡선입니다.",
      ],
      cols: [["⋯", "−", "− ∩", "↘", "↘"], ["(0)", "", "", "", ""], ["⋯", "−", "+ ∪", "↘", "↘"], ["1", "0", "+ ∪", "e 극소", "e 극소"], ["⋯", "+", "+ ∪", "↗", "↗"]],
    },
  };
  let key = "lnx", step = 1;
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = P[key];
    const g = K.frame(ctx, w, h, { xr: p.xr, yr: p.yr, xs: p.xs, ys: p.ys });
    ctx.save(); ctx.beginPath(); ctx.rect(g.x0, g.y0, g.w, g.h); ctx.clip();
    ctx.globalAlpha = 0.25; ctx.fillStyle = C.ink3;
    for (let i = 0; i < 300; i++) {
      const x = p.xr[0] + (p.xr[1] - p.xr[0]) * (i + 0.5) / 300;
      if (p.out(x)) ctx.fillRect(g.X(p.xr[0] + (p.xr[1] - p.xr[0]) * i / 300), g.y0, g.w / 300 + 1, g.h);
    }
    ctx.globalAlpha = 1;
    if (step >= 4) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.4; ctx.setLineDash([5, 4]);
      p.asym.forEach(([t, v]) => { ctx.beginPath(); if (t === "v") { ctx.moveTo(g.X(v), g.y0); ctx.lineTo(g.X(v), g.y0 + g.h); } else { ctx.moveTo(g.x0, g.Y(v)); ctx.lineTo(g.x0 + g.w, g.Y(v)); } ctx.stroke(); });
      ctx.setLineDash([]);
    }
    ctx.restore();
    if (step >= 5) K.curve(ctx, g, p.f, C.forest, { width: 2.6, N: 800 });
    if (step >= 4) p.asym.forEach(([t, v, s]) => K.tag(ctx, g, s, t === "v" ? g.X(v) + 6 : g.x0 + g.w - 4, t === "v" ? g.y0 + 12 : g.Y(v) - 12, C.warn, t === "v" ? "left" : "right"));
    p.zeros.forEach(([x, y]) => { K.dot(ctx, g, x, y, C.ink, false, 4); K.tag(ctx, g, `(${n(x)}, 0)`, g.X(x) + 6, g.Y(y) + 14, C.ink); });
    if (step >= 2) p.crit.forEach(([x, y, s]) => { K.dot(ctx, g, x, y, C.warn, false, 5); K.tag(ctx, g, s, g.X(x), g.Y(y) - 16, C.warn, "center"); });
    if (step >= 3) p.ip.forEach(([x, y]) => { K.dot(ctx, g, x, y, K.BLUE, true, 5); K.tag(ctx, g, "변곡점", g.X(x) + 8, g.Y(y) + 16, K.BLUE); });
  }

  function table() {
    const p = P[key], c = p.cols, cell = (s) => `<td>${s || "·"}</td>`;
    let rows = `<tr><th><i>x</i></th>${c.map((r) => `<th>${r[0]}</th>`).join("")}</tr>`;
    if (step >= 2) rows += `<tr><th><i>f</i>′</th>${c.map((r) => cell(r[1])).join("")}</tr>`;
    if (step >= 3) rows += `<tr><th><i>f</i>″</th>${c.map((r) => cell(r[2])).join("")}</tr>`;
    if (step >= 2) rows += `<tr><th><i>f</i></th>${c.map((r) => cell(step >= 3 ? r[4] : r[3])).join("")}</tr>`;
    $(".sk-tbl").innerHTML = `<table>${rows}</table>`;
  }

  function update() {
    $(".stp").textContent = `${step}/5 ${NAMES[step - 1]}`;
    $(".eq").innerHTML = P[key].text[step - 1];
    $(".go-prev").disabled = step === 1; $(".go-step").disabled = step === 5;
    table(); draw();
  }

  K.chips(root, ".presets .chip", (b) => { key = b.dataset.k; step = 1; update(); });
  $(".go-prev").addEventListener("click", () => { step = Math.max(1, step - 1); update(); });
  $(".go-step").addEventListener("click", () => { step = Math.min(5, step + 1); update(); });
  update();
})();
