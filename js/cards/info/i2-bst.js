/* 카드: 15개 중 하나를 몇 번 만에 찾을까? — 이진 탐색 트리 탐색과 넣는 순서에 따른 높이 */
(() => {
  const root = document.getElementById("card-info-bst");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const CODE = [
    "def find(node, key):",
    "    count = 0",
    "    while node is not None:",
    "        count += 1",
    "        if key == node.key:",
    "            return node, count",
    "        if key < node.key:",
    "            node = node.left",
    "        else:",
    "            node = node.right",
    "    return None, count",
  ];
  const cp = I2.code($(".i2c"), CODE);
  const KEYS = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
  const ORDERS = {
    even: [50, 30, 70, 20, 40, 60, 80, 15, 25, 35, 45, 55, 65, 75, 85],
    sorted: KEYS.slice(),
  };
  let order = ORDERS.even, tree = null, nodes = [], seed = 3, s = null;
  const sK = $(".k");

  function build(keys) {
    tree = null; nodes = [];
    for (const k of keys) {
      const nd = { key: k, left: null, right: null, depth: 0 };
      if (!tree) { tree = nd; nodes.push(nd); continue; }
      let p = tree;
      for (;;) {
        nd.depth++;
        const side = k < p.key ? "left" : "right";
        if (!p[side]) { p[side] = nd; break; }
        p = p[side];
      }
      nodes.push(nd);
    }
    const ino = []; const walk = (n) => { if (!n) return; walk(n.left); ino.push(n); walk(n.right); }; walk(tree);
    ino.forEach((n, i) => { n.ix = i; });
  }
  const height = () => Math.max(...nodes.map((n) => n.depth)) + 1;
  function startSearch() {
    s = { key: +sK.value, node: tree, count: 0, path: [], done: false, found: null };
    cp.set(1); show(); draw();
  }
  function step() {
    if (s.done) return false;
    if (!s.node) { s.done = true; cp.set(10); show(); draw(); return false; }
    s.count++; s.path.push(s.node);
    if (s.key === s.node.key) { s.done = true; s.found = s.node; cp.set(5); }
    else if (s.key < s.node.key) { s.node = s.node.left; cp.set(7); }
    else { s.node = s.node.right; cp.set(9); }
    show(); draw();
    return !s.done;
  }

  const view = fit($(".cv-tree"), () => draw());
  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w || !s) return;
    ctx.clearRect(0, 0, w, h);
    const H = height(), n = nodes.length;
    const cw = (w - 20) / n, rh = (h - 30) / Math.max(H, 4);
    const r = Math.max(7, Math.min(15, cw * 0.46, rh * 0.42));
    const X = (nd) => 10 + cw * (nd.ix + 0.5), Y = (nd) => 18 + rh * (nd.depth + 0.5);
    ctx.lineWidth = 1.2;
    for (const nd of nodes) for (const c of [nd.left, nd.right]) if (c) {
      const on = s.path.includes(nd) && (s.path.includes(c) || s.node === c);
      ctx.strokeStyle = on ? C.warn : C.ink3; ctx.lineWidth = on ? 2.5 : 1.2;
      ctx.beginPath(); ctx.moveTo(X(nd), Y(nd)); ctx.lineTo(X(c), Y(c)); ctx.stroke();
    }
    for (const nd of nodes) {
      const vis = s.path.includes(nd), cur = !s.done && s.node === nd;
      ctx.fillStyle = s.found === nd ? C.forest : vis ? "#f3dcb0" : C.card;
      ctx.strokeStyle = cur ? C.warn : C.ink; ctx.lineWidth = cur ? 3 : 1.2;
      ctx.beginPath(); ctx.arc(X(nd), Y(nd), r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = s.found === nd ? "#fff" : C.ink; ctx.font = `${r > 11 ? 12 : 10}px ${F.mono}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(nd.key, X(nd), Y(nd) + 1);
    }
    ctx.textBaseline = "alphabetic"; ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`;
    ctx.fillText(`찾는 값 ${s.key}`, 10, 12);
    if (s.done && !s.found) { ctx.fillStyle = C.warn; ctx.fillText("None에 닿음 → 트리에 없음", 90, 12); }
  }
  function show() {
    $(".k-out").textContent = sK.value;
    $(".n-c").textContent = s.count + (s.done ? (s.found ? " (찾음)" : " (없음)") : "");
    const idx = order.indexOf(s.key);
    $(".n-l").textContent = idx >= 0 ? idx + 1 : order.length;
    $(".n-h").textContent = height();
    const avg = nodes.reduce((a, nd) => a + nd.depth + 1, 0) / nodes.length;
    $(".n-a").textContent = `${avg.toFixed(1)} / ${((order.length + 1) / 2).toFixed(1)}`;
    $(".ord").textContent = "넣은 순서: " + order.join(", ");
  }

  const run = I2.runner($(".run"), step, 450);
  const reset = () => { run.stop(); startSearch(); };
  root.querySelectorAll("[data-ord]").forEach((b) => b.addEventListener("click", () => {
    const o = b.dataset.ord;
    if (o === "rand") {
      const rnd = I2.rng(seed++), a = KEYS.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      order = a;
    } else order = ORDERS[o];
    root.querySelectorAll("[data-ord]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    build(order); reset();
  }));
  sK.addEventListener("input", reset);
  $(".step").addEventListener("click", () => { run.stop(); step(); });
  $(".again").addEventListener("click", reset);

  build(order); startSearch();
  if (NMLab.demo) { for (let i = 0; i < 20 && step(); i++); }
})();
