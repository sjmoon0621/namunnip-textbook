/* 카드: 이차식 두 개로 된 연립방정식은 어떻게 풀까? — 인수분해로 두 직선을 얻고, 각 직선을 원에 대입 */
(() => {
  const root = document.getElementById("card-cm1-factor-system");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const E = NMEq;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".ex .chip")];
  const sc = $(".c");
  const XA = -6, XB = 6, YA = -4.5, YB = 4.5;
  let ks = [1, 2], s = 0;
  const { ctx, size } = fit($("canvas"), () => draw());
  const sgn = (v) => String(v).replace("-", "−");
  const coefX = (k) => (k === 1 ? "" : k === -1 ? "−" : sgn(k));
  const lineText = (k) => `x = ${coefX(k)}y`;
  const factorText = (k) => `(x ${k < 0 ? "+" : "−"} ${Math.abs(k) === 1 ? "" : Math.abs(k)}y)`;
  const neg = (t) => (t === "0" ? "0" : t.startsWith("−") ? t.slice(1) : "−" + t);

  function cases() {
    const c = +sc.value;
    return ks.map((k) => {
      const y2 = c / (k * k + 1), y = Math.sqrt(y2), yT = E.root(y2), xT = E.root(k * k * y2);
      const xs = k < 0 ? neg(xT) : xT;
      return { k, y2, pts: [[k * y, y], [-k * y, -y]], text: [`(${xs}, ${yT})`, `(${neg(xs)}, ${neg(yT)})`] };
    });
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 26, y0 = 8, gw = w - x0 - 8, gh = h - y0 - 22;
    const X = (x) => x0 + (x - XA) / (XB - XA) * gw, Y = (y) => y0 + (YB - y) / (YB - YA) * gh;
    axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [-6, -4, -2, 0, 2, 4, 6].map((v) => [v, sgn(v)]), yt: [-4, -2, 0, 2, 4].map((v) => [v, sgn(v)]) });
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(0)); ctx.lineTo(x0 + gw, Y(0)); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y0 + gh); ctx.stroke();
    const c = +sc.value, r = Math.sqrt(c), K = cases();
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(X(0), Y(0), X(r) - X(0), Y(0) - Y(r), 0, 0, 7); ctx.stroke();
    const cols = [C.amber, C.apple];
    if (s >= 1) K.forEach((q, i) => {
      const on = s === 1 || s === i + 2 || s >= 4;
      ctx.strokeStyle = cols[i]; ctx.lineWidth = on ? 2.5 : 1.2; ctx.setLineDash(on ? [] : [5, 4]);
      ctx.beginPath(); ctx.moveTo(X(q.k * YA), Y(YA)); ctx.lineTo(X(q.k * YB), Y(YB)); ctx.stroke(); ctx.setLineDash([]);
    });
    K.forEach((q, i) => {
      if (s < i + 2) return;
      q.pts.forEach(([x, y]) => { ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.arc(X(x), Y(y), 6, 0, 7); ctx.fill(); ctx.strokeStyle = C.card; ctx.lineWidth = 1.5; ctx.stroke(); });
    });
    ctx.restore();
    ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
    const lab = (t, x, y, col) => { const tw = ctx.measureText(t).width; ctx.fillStyle = C.card; ctx.fillRect(x - 3, y - 2, tw + 6, 17); ctx.fillStyle = col; ctx.fillText(t, x, y); };
    lab(`② x² + y² = ${c}`, x0 + 6, y0 + 5, C.forest);
    if (s >= 1) K.forEach((q, i) => lab(lineText(q.k), x0 + 6, y0 + 24 + 19 * i, cols[i]));
  }

  function update() {
    const c = +sc.value, K = cases();
    $(".c-out").textContent = c;
    const f = `${factorText(ks[0])}${factorText(ks[1])}`.replace(/x/g, "<i>x</i>").replace(/y/g, "<i>y</i>");
    const L = K.map((q) => lineText(q.k).replace(/x/g, "<i>x</i>").replace(/y/g, "<i>y</i>"));
    const sub = (q) => `${q.k * q.k + 1}<i>y</i><sup>2</sup> = ${c}`;
    let msg;
    if (s === 0) msg = "①의 좌변은 인수분해됩니다. '다음 단계'를 누르세요.";
    else if (s === 1) msg = `① ${f} = 0이므로 ${L[0]} 또는 ${L[1]}입니다. ①의 그래프는 원점을 지나는 직선 두 개입니다.`;
    else if (s === 2) msg = `경우 1: ${L[0]}을 ②에 대입하면 ${sub(K[0])}이므로 해가 두 쌍입니다.`;
    else if (s === 3) msg = `경우 2: ${L[1]}을 ②에 대입하면 ${sub(K[1])}이므로 해가 두 쌍입니다.`;
    else msg = `두 경우의 해를 모으면 모두 4쌍입니다. 직선 두 개와 원의 교점 4개와 같습니다.`;
    $(".msg").innerHTML = msg;
    K.forEach((q, i) => {
      $(`.d-${i + 1}`).innerHTML = `경우 ${i + 1}: ${L[i]}`;
      $(`.n-${i + 1}`).textContent = s >= i + 2 ? q.text.join(", ") : "…";
    });
    $(".go-next").disabled = s >= 4;
    draw();
  }
  $(".go-next").addEventListener("click", () => { s = Math.min(4, s + 1); update(); });
  $(".go-reset").addEventListener("click", () => { s = 0; update(); });
  sc.addEventListener("input", update);
  btns.forEach((b) => b.addEventListener("click", () => {
    ks = b.dataset.k.split(",").map(Number); s = 0;
    btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  update();
})();
