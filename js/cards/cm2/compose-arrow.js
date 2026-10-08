/* 카드: 두 함수를 이어 붙이면 무엇이 될까? — X → X → X 화살표 그림에서 f, g의 값을 바꾸며 g∘f와 f∘g를 비교 */
(() => {
  const root = document.getElementById("card-cm2-compose-arrow");
  if (!root) return;
  const { C } = NM;
  const $ = (s) => root.querySelector(s);
  const ords = [...root.querySelectorAll(".presets.p-ord .chip")], cyc = [...root.querySelectorAll(".cyc")];
  const items = ["1", "2", "3"];
  const cols = [{ name: "X", items }, { name: "X", items }, { name: "X", items }];
  const F = { f: [1, 2, 0], g: [0, 0, 2] };
  let order = "gf", sel = 0;
  const M = NMMap.make($("canvas"), cols, () => draw());
  const first = () => (order === "gf" ? "f" : "g"), second = () => (order === "gf" ? "g" : "f");
  const comp = (o, x) => (o === "gf" ? F.g[F.f[x]] : F.f[F.g[x]]);
  const it = (s) => `<i>${s}</i>`;

  function draw() {
    if (!M.size.w) return;
    const a = F[first()], b = F[second()], mid = a[sel], end = b[mid];
    M.sets({
      ring: (c, i) => ((c === 0 && i === sel) || (c === 1 && i === mid) || (c === 2 && i === end) ? C.amber : null),
      fill: (c, i) => (c === 0 && i === sel ? C.sprout : null),
    });
    [0, 1, 2].forEach((x) => { if (x !== sel) M.arrow(0, x, 1, a[x], C.forest, 1.4); });
    [0, 1, 2].forEach((y) => { if (y !== mid) M.arrow(1, y, 2, b[y], C.ink3, 1.4); });
    M.arrow(0, sel, 1, mid, C.amber, 2.8); M.arrow(1, mid, 2, end, C.amber, 2.8);
    M.label(0, first(), C.forest); M.label(1, second(), C.ink2);
  }

  function update() {
    cyc.forEach((b) => { const m = b.dataset.m, i = +b.dataset.i; b.innerHTML = `${it(m)}(${i + 1}) = ${F[m][i] + 1}`; });
    const name = (o) => (o === "gf" ? `(${it("g")}∘${it("f")})` : `(${it("f")}∘${it("g")})`);
    const row = (o) => `${name(o)}(${it("x")}): ` + [0, 1, 2].map((x) => `${x + 1}→${comp(o, x) + 1}`).join(", ");
    const a = F[first()], x = sel;
    $(".eq").innerHTML = `${name(order)}(${x + 1}) = ${it(second())}(${it(first())}(${x + 1})) = ${it(second())}(${a[x] + 1}) = ${comp(order, x) + 1}<br>${row("gf")}<br>${row("fg")}`;
    $(".n-v").textContent = String(comp(order, x) + 1);
    const same = [0, 1, 2].every((t) => comp("gf", t) === comp("fg", t));
    $(".n-s").textContent = same ? "같다" : "다르다"; $(".n-s").className = `n-s ${same ? "good" : "bad"}`;
    const rg = [...new Set([0, 1, 2].map((t) => comp(order, t) + 1))].sort();
    $(".n-r").textContent = `{${rg.join(", ")}}`;
    $(".d-v").innerHTML = `${name(order)}(${x + 1})`;
    draw();
  }

  cyc.forEach((b) => b.addEventListener("click", () => { const m = b.dataset.m, i = +b.dataset.i; F[m][i] = (F[m][i] + 1) % 3; update(); }));
  ords.forEach((b) => b.addEventListener("click", () => { order = b.dataset.o; ords.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  $(".go-id").addEventListener("click", () => { F.g = [0, 1, 2]; update(); });
  M.tap((h) => { if (h.c === 0) { sel = h.i; update(); } });
  update();
})();
