/* 카드: 어떤 대응을 함수라고 부를까? — X의 원소를 누르고 Y의 원소를 눌러 화살표를 잇고, 함수인지와 종류를 판정 */
(() => {
  const root = document.getElementById("card-cm2-func-map");
  if (!root) return;
  const { C } = NM;
  const $ = (s) => root.querySelector(s);
  const pre = [...root.querySelectorAll(".presets.p-rel .chip")], ych = [...root.querySelectorAll(".presets.p-y .chip")];
  const cols = [{ name: "X", items: ["1", "2", "3"] }, { name: "Y", items: ["1", "2", "3", "4"] }];
  const PRE = {
    fn: [4, [[0, 1], [1, 0], [2, 1]]],
    miss: [4, [[0, 0], [2, 2]]],
    two: [4, [[0, 0], [1, 1], [1, 3], [2, 2]]],
    inj: [4, [[0, 3], [1, 0], [2, 2]]],
    bij: [3, [[0, 1], [1, 2], [2, 0]]],
    con: [4, [[0, 2], [1, 2], [2, 2]]],
    id: [3, [[0, 0], [1, 1], [2, 2]]],
  };
  let ny = 4, rel = PRE.fn[1].map((r) => r.slice()), sel = -1;
  const M = NMMap.make($("canvas"), cols, () => draw());
  const set = (list) => `{${list.join(", ")}}`;

  function analyze() {
    const img = [0, 1, 2].map((x) => rel.filter((r) => r[0] === x).map((r) => r[1]).sort());
    const miss = img.map((v, x) => (v.length === 0 ? x : -1)).filter((x) => x >= 0);
    const many = img.map((v, x) => (v.length > 1 ? x : -1)).filter((x) => x >= 0);
    const fn = !miss.length && !many.length;
    const f = img.map((v) => v[0]);
    const range = fn ? [...new Set(f)].sort() : [];
    const inj = fn && range.length === 3, onto = fn && range.length === ny;
    const kind = !fn ? "함수가 아님"
      : ny === 3 && f.every((v, i) => v === i) ? "항등함수 (일대일대응)"
      : inj && onto ? "일대일대응"
      : inj ? "일대일함수 (대응은 아님)"
      : range.length === 1 ? "상수함수"
      : "함수 (일대일 아님)";
    return { img, miss, many, fn, f, range, kind };
  }

  function draw() {
    if (!M.size.w) return;
    const A = analyze();
    M.sets({
      ring: (c, i) => (c === 0 && i === sel ? C.amber : c === 0 && (A.miss.includes(i) || A.many.includes(i)) ? C.warn : c === 1 && A.range.includes(i) ? C.forest : null),
      fill: (c, i) => (c === 0 && i === sel ? C.sprout : null),
    });
    rel.forEach(([x, y]) => M.arrow(0, x, 1, y, A.many.includes(x) ? C.warn : C.forest, 2));
    M.label(0, "f : X → Y", C.ink2);
  }

  function update() {
    const A = analyze(), lab = (i) => String(i + 1);
    const nf = $(".n-f");
    nf.textContent = A.fn ? "예" : "아니요"; nf.className = `n-f ${A.fn ? "good" : "bad"}`;
    $(".n-r").textContent = A.fn ? set(A.range.map(lab)) : "—";
    $(".n-k").textContent = A.kind;
    let t;
    if (A.fn) t = A.f.map((v, x) => `<i>f</i>(${x + 1}) = ${v + 1}`).join(", ") + `<br>정의역 ${set(["1", "2", "3"])}, 공역 ${set(cols[1].items)}, 치역 ${set(A.range.map(lab))}`;
    else t = [...A.miss.map((x) => `${x + 1}에 대응하는 원소가 없습니다.`), ...A.many.map((x) => `${x + 1}에 대응하는 원소가 ${A.img[x].length}개(${A.img[x].map(lab).join(", ")})입니다.`)].join("<br>");
    $(".eq").innerHTML = t;
    draw();
  }

  function setY(n) {
    ny = n; cols[1].items = ["1", "2", "3", "4"].slice(0, n);
    rel = rel.filter((r) => r[1] < n);
    ych.forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.y === n)));
  }
  pre.forEach((b) => b.addEventListener("click", () => {
    const [n, r] = PRE[b.dataset.p];
    rel = r.map((x) => x.slice()); setY(n); sel = -1;
    pre.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    update();
  }));
  ych.forEach((b) => b.addEventListener("click", () => { setY(+b.dataset.y); pre.forEach((x) => x.setAttribute("aria-pressed", "false")); update(); }));
  $(".go-clear").addEventListener("click", () => { rel = []; sel = -1; pre.forEach((x) => x.setAttribute("aria-pressed", "false")); update(); });
  M.tap((h) => {
    if (h.c === 0) sel = sel === h.i ? -1 : h.i;
    else if (sel >= 0) {
      const k = rel.findIndex((r) => r[0] === sel && r[1] === h.i);
      if (k >= 0) rel.splice(k, 1); else rel.push([sel, h.i]);
      sel = -1; pre.forEach((x) => x.setAttribute("aria-pressed", "false"));
    }
    update();
  });
  update();
})();
