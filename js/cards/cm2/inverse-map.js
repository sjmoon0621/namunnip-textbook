/* 카드: 화살표를 거꾸로 돌리면 언제 함수가 될까? — f : X → Y의 화살표를 뒤집어 f⁻¹이 함수인지 판정 */
(() => {
  const root = document.getElementById("card-cm2-inverse-map");
  if (!root) return;
  const { C } = NM;
  const $ = (s) => root.querySelector(s);
  const pre = [...root.querySelectorAll(".p-rel .chip")], views = [...root.querySelectorAll(".p-view .chip")];
  const YS = ["a", "b", "c", "d"];
  const cols = [{ name: "X", items: ["1", "2", "3"] }, { name: "Y", items: YS.slice(0, 3) }];
  const PRE = { bij: [3, [1, 2, 0]], many: [3, [0, 0, 2]], gap: [4, [0, 3, 1]] };
  let ny = 3, f = [1, 2, 0], inv = false, sel = -1;
  const M = NMMap.make($("canvas"), cols, () => draw());

  function analyze() {
    const back = YS.slice(0, ny).map((_, y) => [0, 1, 2].filter((x) => f[x] === y));
    const many = back.map((v, y) => (v.length > 1 ? y : -1)).filter((y) => y >= 0);
    const none = back.map((v, y) => (v.length === 0 ? y : -1)).filter((y) => y >= 0);
    return { back, many, none, inj: !many.length, onto: !none.length, ok: !many.length && !none.length };
  }

  function draw() {
    if (!M.size.w) return;
    const A = analyze();
    M.sets({
      ring: (c, i) => (c === 0 && i === sel ? C.amber : c === 1 && inv && (A.many.includes(i) || A.none.includes(i)) ? C.warn : null),
      fill: (c, i) => (c === 0 && i === sel ? C.sprout : null),
    });
    [0, 1, 2].forEach((x) => {
      const bad = A.many.includes(f[x]);
      if (inv) M.arrow(1, f[x], 0, x, bad ? C.warn : C.amber, 2.2);
      else M.arrow(0, x, 1, f[x], C.forest, 2);
    });
    M.label(0, inv ? "f⁻¹ : Y → X" : "f : X → Y", inv ? (A.ok ? C.amber : C.warn) : C.ink2);
  }

  function update() {
    const A = analyze(), x = (i) => String(i + 1), y = (i) => YS[i];
    const yes = (el, v) => { el.textContent = v ? "예" : "아니요"; el.className = v ? "good" : "bad"; };
    yes($(".n-i"), A.inj); yes($(".n-o"), A.onto); yes($(".n-v"), A.ok);
    let t = "<i>f</i>: " + [0, 1, 2].map((i) => `${x(i)}→${y(f[i])}`).join(", ");
    if (inv) {
      if (A.ok) t += "<br><i>f</i><sup>−1</sup>: " + A.back.map((v, i) => `${y(i)}→${x(v[0])}`).join(", ") +
        "<br>(<i>f</i><sup>−1</sup>∘<i>f</i>)(<i>x</i>): " + [0, 1, 2].map((i) => `${x(i)}→${x(A.back[f[i]][0])}`).join(", ");
      else t += "<br>" + [...A.many.map((i) => `${y(i)}에서 화살표가 ${A.back[i].length}개(${A.back[i].map(x).join(", ")}) 나갑니다.`), ...A.none.map((i) => `${y(i)}에서는 나가는 화살표가 없습니다.`)].join("<br>");
    }
    $(".eq").innerHTML = t;
    draw();
  }

  function setY(n) { ny = n; cols[1].items = YS.slice(0, n); f = f.map((v) => Math.min(v, n - 1)); }
  pre.forEach((b) => b.addEventListener("click", () => {
    const [n, g] = PRE[b.dataset.p]; setY(n); f = g.slice(); sel = -1;
    pre.forEach((o) => o.setAttribute("aria-pressed", String(o === b))); update();
  }));
  views.forEach((b) => b.addEventListener("click", () => {
    inv = b.dataset.v === "inv"; views.forEach((o) => o.setAttribute("aria-pressed", String(o === b))); update();
  }));
  M.tap((h) => {
    if (h.c === 0) sel = sel === h.i ? -1 : h.i;
    else if (sel >= 0) { f[sel] = h.i; sel = -1; pre.forEach((o) => o.setAttribute("aria-pressed", "false")); }
    update();
  });
  update();
})();
