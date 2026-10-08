/* 카드: 두 근의 합과 곱은 계수 어디에 숨어 있을까? — 두 근을 끌어 옮기며 a(x − α)(x − β)의 계수와 합·곱 비교 */
(() => {
  const root = document.getElementById("card-cm1-vieta");
  if (!root) return;
  const { C, fit } = NM;
  const E = NMEqPlot, P = NMPoly;
  const $ = (s) => root.querySelector(s), modes = [...root.querySelectorAll(".mode .chip")];
  const sa = $(".a"), sp = $(".p"), sq = $(".q");
  let mode = "real", al = -1, be = 3, lastA = 1, fr = null;
  const X0 = -6, X1 = 6;
  const cv = $("canvas");
  const { ctx, size } = fit(cv, () => draw());
  const I = "<i>i</i>";

  function coef() {
    const a = +sa.value;
    if (mode === "real") return { a, s: al + be, m: al * be };
    const p = +sp.value, q = +sq.value;
    return { a, s: 2 * p, m: p * p + q * q, p, q };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = coef();
    fr = E.frame(ctx, { x: 30, y: 8, w: w - 40, h: h - 30 }, { X0, X1, Y0: -10, Y1: 10 }, { xs: 1, ys: 5, xname: "x", yname: "y" });
    const { X, Y } = fr;
    E.curve(ctx, fr, (x) => k.a * (x * x - k.s * x + k.m), C.forest, 2.5);
    const mid = k.s / 2;
    ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(X(mid), fr.box.y); ctx.lineTo(X(mid), fr.box.y + fr.box.h); ctx.stroke(); ctx.restore();
    if (mode === "real") {
      [[al, "α"], [be, "β"]].forEach(([v, name], j) => {
        E.dot(ctx, X(v), Y(0), j ? C.warn : C.ink2, 7);
        E.tag(ctx, `${name} = ${E.n(v)}`, X(v), Y(0) + (j ? 18 : -18), j ? C.warn : C.ink2, "center", fr.box);
      });
      E.tag(ctx, `두 근의 가운데 ${E.n(mid)} = (α + β)/2`, fr.box.x + 6, fr.box.y + 12, C.ink2, "left", fr.box);
    } else {
      E.tag(ctx, `x축과 만나지 않음: 근 ${E.cx(k.p, k.q).replace(/ [+−] /, " ± ")}`, fr.box.x + 6, fr.box.y + 12, C.warn, "left", fr.box);
      E.tag(ctx, `축 x = ${E.n(k.p)} = 허근의 실수부분`, fr.box.x + 6, fr.box.y + 30, C.ink2, "left", fr.box);
    }
  }

  function update() {
    const k = coef(), b = -k.a * k.s, c = k.a * k.m;
    $(".a-out").textContent = E.n(k.a); $(".p-out").textContent = E.n(+sp.value); $(".q-out").textContent = E.n(+sq.value);
    const fac = mode === "real"
      ? `${E.n(k.a) === "1" ? "" : E.n(k.a) === "−1" ? "−" : E.n(k.a)}(<i>x</i> ${al < 0 ? "+" : "−"} ${E.n(Math.abs(al))})(<i>x</i> ${be < 0 ? "+" : "−"} ${E.n(Math.abs(be))})`
      : `${E.n(k.a) === "1" ? "" : E.n(k.a) === "−1" ? "−" : E.n(k.a)}{(<i>x</i> ${k.p < 0 ? "+" : "−"} ${E.n(Math.abs(k.p))})<sup>2</sup> + ${E.n(k.q * k.q)}}`;
    $(".eq").innerHTML = `${fac}<br>= ${P.fmt([c, b, k.a], true)} &nbsp;(<i>a</i> = ${E.n(k.a)}, <i>b</i> = ${E.n(b)}, <i>c</i> = ${E.n(c)})` +
      (mode === "imag" ? `<br>두 근 ${E.cx(k.p, k.q, true)}, ${E.cx(k.p, -k.q, true)}` : "");
    $(".n-s").textContent = E.n(k.s); $(".n-ba").textContent = E.n(-b / k.a);
    $(".n-p").textContent = E.n(k.m); $(".n-ca").textContent = E.n(c / k.a);
    draw();
  }

  E.drag(cv, (px, py) => {
    if (mode !== "real" || !fr) return null;
    const d = (v) => Math.hypot(px - fr.X(v), py - fr.Y(0));
    const da = d(al), db = d(be);
    if (Math.min(da, db) > 16) return null;
    return da <= db ? "al" : "be";
  }, (who, px, py) => {
    const v = Math.max(-5.5, Math.min(5.5, Math.round(fr.inv(px, py)[0] * 2) / 2));
    if (who === "al") al = v; else be = v;
    update();
  });
  sa.addEventListener("input", () => {
    if (+sa.value === 0) sa.value = lastA > 0 ? -0.5 : 0.5;
    lastA = +sa.value; update();
  });
  [sp, sq].forEach((s) => s.addEventListener("input", update));
  modes.forEach((bt) => bt.addEventListener("click", () => {
    mode = bt.dataset.m; modes.forEach((x) => x.setAttribute("aria-pressed", String(x === bt)));
    $(".imag").hidden = mode !== "imag"; update();
  }));
  update();
})();
