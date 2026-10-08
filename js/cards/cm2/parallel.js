/* 카드: 두 직선이 만나지 않으려면 무엇이 같아야 할까? — 기울기·y절편 슬라이더로 평행·일치·교점 판단 */
(() => {
  const root = document.getElementById("card-cm2-parallel");
  if (!root) return;
  const { C } = NM, K = NMCoord;
  const $ = (s) => root.querySelector(s);
  const ids = ["m1", "k1", "m2", "k2"];
  const P = K.plane($("canvas"), { cx: 0, cy: 0, span: 12 }, () => draw());
  const v = () => ids.map((i) => +$("." + i).value);
  const X = "<i>x</i>";

  function tri(m, k, x, color) {
    const a = [x, m * x + k], b = [x + 1, m * x + k], c = [x + 1, m * (x + 1) + k];
    P.seg(a, b, color, 1.5, [4, 3]); P.seg(b, c, color, 1.5, [4, 3]);
    if (m) P.text(K.n(m), [x + 1, (b[1] + c[1]) / 2], color, 6, 0, "left", `600 11px ${NM.F.mono}`);
  }
  function draw() {
    if (!P.size.w) return;
    P.grid();
    const [m1, k1, m2, k2] = v(), same = m1 === m2 && k1 === k2;
    P.line(m1, -1, k1, C.forest, 3);
    P.line(m2, -1, k2, C.warn, same ? 2 : 3, same ? [8, 6] : null);
    tri(m1, k1, -4, C.forest); tri(m2, k2, 0.5, C.warn);
    if (m1 !== m2) {
      const x = (k2 - k1) / (m1 - m2), y = m1 * x + k1, B = P.box();
      if (x > B.x0 && x < B.x1 && y > B.y0 && y < B.y1) {
        P.dot([x, y], C.ink, 5);
        if (Math.abs(m1 * m2 + 1) < 1e-9) P.right([x, y], [1, m1], [1, m2], C.ink);
      }
    }
    const lab = (m, k, name, color, x) => {
      const B = P.box(), xx = Math.max(B.x0 + 1, Math.min(B.x1 - 1, Math.abs(m) > 0.01 ? Math.max(Math.min(x, (B.y1 - 0.8 - k) / m), (B.y0 + 0.8 - k) / m) : x));
      P.text(name, [xx, m * xx + k], color, 6, -12, "left");
    };
    lab(m1, k1, "ℓ₁", C.forest, -5); lab(m2, k2, "ℓ₂", C.warn, 4.5);
  }

  function update() {
    const [m1, k1, m2, k2] = v();
    ids.forEach((i, j) => { $(".o-" + i).textContent = K.n(v()[j]); });
    $(".eq").innerHTML = `ℓ₁: <i>y</i> = ${K.lin([[m1, X], [k1, ""]])}<br>ℓ₂: <i>y</i> = ${K.lin([[m2, X], [k2, ""]])}`;
    $(".n-s").textContent = m1 === m2 ? "같음" : "다름";
    let r, x = "하나";
    if (m1 === m2) { r = k1 === k2 ? "일치" : "평행"; x = k1 === k2 ? "무수히 많음" : "없음"; }
    else {
      r = Math.abs(m1 * m2 + 1) < 1e-9 ? "수직으로 만남" : "한 점에서 만남";
      const cx = (k2 - k1) / (m1 - m2);
      x = `(${K.n(cx)}, ${K.n(m1 * cx + k1)})`;
    }
    $(".n-r").textContent = r; $(".n-x").textContent = x;
    $(".n-r").className = `n-r ${m1 === m2 ? "good" : ""}`;
    draw();
  }
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => {
    b.dataset.p.split(",").forEach((x, j) => { $("." + ids[j]).value = x; }); update();
  }));
  root.querySelectorAll("input").forEach((i) => i.addEventListener("input", update));
  update();
})();
