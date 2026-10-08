/* 카드: y = (ax + b)/(cx + d)의 점근선은 어떻게 찾을까? — 계수를 바꾸며 표준형 k/(x − p) + q로 고치는 단계를 넘긴다
   (ax + b)/(cx + d) = a/c + (bc − ad)/c² · 1/(x + d/c)  (c ≠ 0) */
(() => {
  const root = document.getElementById("card-cm2-rational-form");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const S = ["a", "b", "c", "d"].map((k) => $("." + k));
  let step = 0;
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 13 }, () => draw());
  const X = "<i>x</i>", Y = "<i>y</i>";
  const co = () => S.map((s) => +s.value);

  function draw() {
    if (!P.size.w) return;
    const [a, b, c, d] = co(), D = b * c - a * d;
    P.grid();
    if (c !== 0 && step >= 3 && D !== 0) { P.line(1, 0, d / c, C.warn, 1.4, [6, 4]); P.line(0, 1, -a / c, C.warn, 1.4, [6, 4]); }
    P.curve((x) => { const den = c * x + d; return Math.abs(den) < 1e-9 ? NaN : (a * x + b) / den; }, C.forest, 2.8);
    if (c !== 0 && D === 0) {
      const hx = -d / c, hy = a / c;
      const ctx = P.ctx;
      P.dot([hx, hy], C.card, 5);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(P.X(hx), P.Y(hy), 5, 0, 7); ctx.stroke();
      P.text(`(${K.n(hx)}, ${K.n(hy)}) 빠짐`, [hx, hy], C.forest, 10, -14);
    }
  }

  function update() {
    const [a, b, c, d] = co(), D = b * c - a * d;
    S.forEach((s, i) => { root.querySelector(`.${"abcd"[i]}-out`).textContent = K.n(+s.value); });
    const num = K.lin([[a, X], [b, ""]]), den = K.lin([[c, X], [d, ""]]);
    const lines = [`${Y} = (${num})/(${den})`];
    let kind = "", asym = "—", ctr = "—";
    if (c === 0) {
      lines.push(d === 0 ? "분모가 0이라 함수가 정해지지 않습니다." : `분모가 상수 ${K.n(d)}이므로 ${Y} = ${K.lin([[a / d, X], [b / d, ""]])}, 다항함수입니다.`);
      kind = d === 0 ? "정의되지 않음" : "다항함수";
    } else {
      const p = K.frac(-d, c), q = K.frac(a, c), k = K.frac(D, c * c);
      lines.push(`① 분자를 분모로 나눕니다: ${num} = ${K.frac(a, c)}·(${den}) ${D / c >= 0 ? "+" : "−"} ${K.frac(Math.abs(D), Math.abs(c))}`);
      lines.push(`② 그래서 ${Y} = ${q} + (${K.frac(D, c)})/(${den})`);
      lines.push(D === 0 ? `③ 나머지가 0이므로 ${Y} = ${q} (단, ${X} ≠ ${p}). 유리함수의 꼴이지만 그래프는 직선에서 한 점이 빠진 것입니다.`
        : `③ 분모의 ${X} 계수로 묶으면 ${Y} = (${k})/(${X} − (${p}))${q === "0" ? "" : q.startsWith("−") ? ` − ${q.slice(1)}` : ` + ${q}`}`);
      kind = D === 0 ? "상수함수 (한 점 제외)" : "유리함수";
      if (D !== 0) { asym = `x = ${p}, y = ${q}`; ctr = `(${p}, ${q})`; }
    }
    $(".eq").innerHTML = lines.slice(0, c === 0 ? 2 : step + 1).join("<br>");
    $(".n-k").textContent = kind; $(".n-a").textContent = step >= 3 || c === 0 ? asym : "단계 ③에서"; $(".n-c").textContent = step >= 3 || c === 0 ? ctr : "단계 ③에서";
    $(".go-next").disabled = c === 0 || step >= 3;
    draw();
  }
  S.forEach((s) => s.addEventListener("input", update));
  $(".go-next").addEventListener("click", () => { step = Math.min(step + 1, 3); update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  update();
})();
