/* 카드: 근의 공식의 √ 안이 음수이면 근이 없는 걸까? — a, b, c를 움직이며 D = b² − 4ac와 근의 종류 보기 */
(() => {
  const root = document.getElementById("card-cm1-discriminant");
  if (!root) return;
  const { C, fit } = NM;
  const E = NMEqPlot;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".ex .chip")];
  const S = ["a", "b", "c"].map((k) => $("." + k));
  const { ctx, size } = fit($("canvas"), () => draw());
  const I = "<i>i</i>";

  const exact = (v) => Math.abs(v - E.r3(v)) < 1e-9;
  const num = (v) => (exact(v) ? "" : "≈ ") + E.n(v);
  function sq(v) {
    const s = Math.sqrt(v);
    return exact(s) ? E.n(s) : `√${E.n(v)}`;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [a, b, c] = S.map((s) => +s.value);
    const fr = E.frame(ctx, { x: 30, y: 8, w: w - 40, h: h - 30 }, { X0: -6, X1: 6, Y0: -10, Y1: 10 }, { xs: 1, ys: 5, xname: "x", yname: "y" });
    const { X, Y } = fr;
    E.curve(ctx, fr, (x) => a * x * x + b * x + c, C.forest, 2.5);
    if (a === 0) { E.tag(ctx, "a = 0: 이차방정식이 아닙니다", fr.box.x + 6, fr.box.y + 12, C.warn, "left", fr.box); return; }
    const r = E.roots(a, b, c);
    if (r.kind >= 0) r.xs.forEach((x) => { if (x >= -6 && x <= 6) E.dot(ctx, X(x), Y(0), r.kind ? C.forest : C.amber, r.kind ? 6 : 7.5); });
    const txt = r.kind === 2 ? "x축과 두 점에서 만남: 서로 다른 두 실근" : r.kind === 0 ? "x축에 접함: 중근" : `x축과 만나지 않음: 허근 ${E.cx(r.p, E.r3(r.q)).replace(/ [+−] /, " ± ")}`;
    E.tag(ctx, txt, fr.box.x + 6, fr.box.y + 12, r.kind < 0 ? C.warn : C.forest, "left", fr.box);
    const px = -b / (2 * a);
    ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(X(px), fr.box.y); ctx.lineTo(X(px), fr.box.y + fr.box.h); ctx.stroke(); ctx.restore();
  }

  function update() {
    S.forEach((s, k) => { $(`.${"abc"[k]}-out`).textContent = E.n(+s.value); });
    const [a, b, c] = S.map((s) => +s.value);
    const nd = $(".n-d"), nk = $(".n-k"), nr = $(".n-r");
    if (a === 0) {
      $(".eq").innerHTML = `${E.n(b)}<i>x</i> + ${E.n(c)} = 0은 일차방정식(또는 항등식·불능)이라 근의 공식과 판별식을 쓰지 않습니다.`;
      nd.textContent = "—"; nk.textContent = "이차방정식 아님"; nr.textContent = b ? num(-c / b) : "—"; nk.className = "n-k bad"; nd.className = "n-d"; draw(); return;
    }
    const r = E.roots(a, b, c), D = b * b - 4 * a * c;
    const rad = D >= 0 ? sq(D) : `${sq(-D)}${I}`;
    $(".eq").innerHTML = `<i>x</i> = {−(${E.n(b)}) ± √(${E.n(D)})} / ${E.n(2 * a)}<br>= (${E.n(-b)} ± ${rad}) / ${E.n(2 * a)}`;
    nd.textContent = E.n(D); nd.className = `n-d ${D < 0 ? "bad" : "good"}`;
    nk.textContent = r.kind === 2 ? "서로 다른 두 실근" : r.kind === 0 ? "중근 (실근)" : "서로 다른 두 허근";
    nk.className = `n-k ${r.kind < 0 ? "bad" : "good"}`;
    nr.innerHTML = r.kind === 2 ? `${num(r.xs[0])}, ${num(r.xs[1])}` : r.kind === 0 ? num(r.xs[0]) : `${E.n(r.p) === "0" ? "" : num(r.p) + " "}± ${exact(r.q) ? "" : "≈ "}${E.n(r.q) === "1" ? "" : E.n(r.q)}${I}`;
    draw();
  }
  chips.forEach((bt) => bt.addEventListener("click", () => {
    bt.dataset.p.split(",").forEach((v, k) => { S[k].value = v; });
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === bt))); update();
  }));
  S.forEach((s) => s.addEventListener("input", () => { chips.forEach((x) => x.setAttribute("aria-pressed", "false")); update(); }));
  update();
})();
