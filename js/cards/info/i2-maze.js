/* 카드: 미로의 최단 경로는 큐와 스택 중 무엇으로 찾을까? — 격자 그래프에서 BFS와 DFS를 한 단계씩 */
(() => {
  const root = document.getElementById("card-info-maze");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const R = 9, Cn = 15, S = [0, 0], G = [8, 14];
  const MAZE_A = [
    ".#.............",
    ".#.#.#.###.###.",
    "...#.#.......#.",
    "####.#.#.#.#.#.",
    ".......#.#...#.",
    "##.#.#.#.###.#.",
    "...#...........",
    ".###.#####.#.#.",
    "...........#...",
  ];
  const CODE = [
    "from collections import deque",
    "",
    "def search(grid, start, goal, mode):",
    "    todo = deque([(start, None)])",
    "    prev = {}",
    "    while todo:",
    "        if mode == \"BFS\":",
    "            cur, before = todo.popleft()",
    "        else:",
    "            cur, before = todo.pop()",
    "        if cur in prev:",
    "            continue",
    "        prev[cur] = before",
    "        if cur == goal:",
    "            return prev",
    "        for nxt in neighbors(grid, cur):",
    "            if nxt not in prev:",
    "                todo.append((nxt, cur))",
    "    return None",
  ];
  const cp = I2.code($(".i2c"), CODE);
  let wall = [], mode = "BFS", st, seed = 7;
  const key = (r, c) => r * Cn + c;
  const isS = (r, c) => r === S[0] && c === S[1], isG = (r, c) => r === G[0] && c === G[1];

  function fromRows(rows) { wall = []; rows.forEach((row, r) => [...row].forEach((ch, c) => { wall[key(r, c)] = ch === "#"; })); }
  function perfect(sd) {
    const rnd = I2.rng(sd);
    wall = Array(R * Cn).fill(true);
    const seen = new Set(), stack = [[0, 0]];
    wall[0] = false; seen.add(0);
    while (stack.length) {
      const [r, c] = stack[stack.length - 1];
      const opts = [[-2, 0], [0, 2], [2, 0], [0, -2]].map(([dr, dc]) => [r + dr, c + dc, r + dr / 2, c + dc / 2])
        .filter(([a, b]) => a >= 0 && a < R && b >= 0 && b < Cn && !seen.has(key(a, b)));
      if (!opts.length) { stack.pop(); continue; }
      const [a, b, m, n] = opts[Math.floor(rnd() * opts.length)];
      wall[key(m, n)] = false; wall[key(a, b)] = false; seen.add(key(a, b)); stack.push([a, b]);
    }
  }
  const nbrs = (r, c) => [[r - 1, c], [r, c + 1], [r + 1, c], [r, c - 1]]
    .filter(([a, b]) => a >= 0 && a < R && b >= 0 && b < Cn && !wall[key(a, b)]);

  function shortest() {
    const d = new Map([[key(...S), 0]]), q = [S];
    for (let i = 0; i < q.length; i++) {
      const [r, c] = q[i];
      for (const [a, b] of nbrs(r, c)) if (!d.has(key(a, b))) { d.set(key(a, b), d.get(key(r, c)) + 1); q.push([a, b]); }
    }
    return d.get(key(...G));
  }
  function reset() {
    st = { todo: [[S, null]], prev: new Map(), cur: null, pops: 0, maxTodo: 1, done: false, found: false, path: null, best: shortest() };
    cp.set(3); draw(); show();
  }
  function step() {
    if (st.done) return false;
    if (!st.todo.length) { st.done = true; cp.set(18); show(); draw(); return false; }
    const [cur, before] = mode === "BFS" ? st.todo.shift() : st.todo.pop();
    st.pops++; st.cur = cur;
    const k = key(...cur);
    if (st.prev.has(k)) { cp.set(11); show(); draw(); return true; }
    st.prev.set(k, before);
    if (isG(...cur)) {
      st.done = true; st.found = true; cp.set(14);
      const p = []; let x = cur;
      while (x) { p.push(x); x = st.prev.get(key(...x)); }
      st.path = p.reverse();
    } else {
      for (const n of nbrs(...cur)) if (!st.prev.has(key(...n))) st.todo.push([n, cur]);
      st.maxTodo = Math.max(st.maxTodo, st.todo.length);
      cp.set(17);
    }
    show(); draw();
    return !st.done;
  }
  function depth(k) { let n = 0, x = st.prev.get(k); while (x) { n++; x = st.prev.get(key(...x)); } return n; }

  const view = fit($(".cv-wide"), () => draw());
  let geo = null;
  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w || !st) return;
    ctx.clearRect(0, 0, w, h);
    const s = Math.floor(Math.min((w - 4) / Cn, (h - 4) / R)), ox = Math.round((w - s * Cn) / 2), oy = Math.round((h - s * R) / 2);
    geo = { s, ox, oy };
    const inTodo = new Set(st.todo.map(([p]) => key(...p)));
    for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) {
      const k = key(r, c), x = ox + c * s, y = oy + r * s;
      let fill = C.card;
      if (wall[k]) fill = C.ink;
      else if (st.prev.has(k)) fill = "#dfe9d6";
      else if (inTodo.has(k)) fill = "#f3dcb0";
      ctx.fillStyle = fill; ctx.fillRect(x, y, s, s);
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, s - 1, s - 1);
      if (st.prev.has(k) && s >= 18 && !isS(r, c) && !isG(r, c)) {
        ctx.fillStyle = C.ink2; ctx.font = `${Math.min(11, s * 0.4)}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(depth(k), x + s / 2, y + s / 2 + 1);
      }
    }
    if (st.path) {
      ctx.globalAlpha = 0.65; ctx.strokeStyle = C.warn; ctx.lineWidth = Math.max(2, s * 0.12); ctx.lineJoin = "round"; ctx.beginPath();
      st.path.forEach(([r, c], i) => { const x = ox + c * s + s / 2, y = oy + r * s + s / 2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (st.cur) {
      const [r, c] = st.cur;
      ctx.strokeStyle = C.forest; ctx.lineWidth = 3; ctx.strokeRect(ox + c * s + 2, oy + r * s + 2, s - 4, s - 4);
    }
    [[S, "S"], [G, "G"]].forEach(([[r, c], t]) => {
      ctx.fillStyle = C.forest; ctx.fillRect(ox + c * s + 3, oy + r * s + 3, s - 6, s - 6);
      ctx.fillStyle = "#fff"; ctx.font = `700 ${Math.min(13, s * 0.5)}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(t, ox + c * s + s / 2, oy + r * s + s / 2 + 1);
    });
    ctx.textBaseline = "alphabetic";
  }
  function show() {
    $(".n-pop").textContent = st.pops;
    $(".n-todo").textContent = `${st.todo.length} (최대 ${st.maxTodo})`;
    const pl = st.path ? st.path.length - 1 : null;
    $(".n-len").textContent = st.found ? `${pl}칸 / 최단 ${st.best}칸` : (st.done ? "길 없음" : "—");
    $(".n-len").className = "n-len" + (st.found ? (pl === st.best ? " good" : " bad") : "");
    const items = st.todo.map(([[r, c]]) => `(${r},${c})`);
    const cut = items.length > 9 ? (mode === "BFS" ? [...items.slice(0, 9), "…"] : ["…", ...items.slice(-9)]) : items;
    $(".todo").innerHTML = `<b>todo</b> <span class="end">${mode === "BFS" ? "꺼내는 쪽 ▸" : "앞"}</span> ${cut.join(" ") || "(비었음)"} <span class="end">${mode === "BFS" ? "◂ 넣는 쪽" : "◂ 넣고 꺼내는 쪽"}</span>`;
  }

  const run = I2.runner($(".run"), step, 110);
  const restart = () => { run.stop(); reset(); };
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    root.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    restart();
  }));
  root.querySelectorAll("[data-map]").forEach((b) => b.addEventListener("click", () => {
    const m = b.dataset.map;
    if (m === "a") fromRows(MAZE_A);
    else if (m === "open") wall = Array(R * Cn).fill(false);
    else perfect(seed++);
    root.querySelectorAll("[data-map]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    restart();
  }));
  $(".step").addEventListener("click", () => { run.stop(); step(); });
  $(".reset").addEventListener("click", restart);
  $(".cv-wide").addEventListener("click", (e) => {
    if (!geo) return;
    const rc = e.target.getBoundingClientRect();
    const c = Math.floor((e.clientX - rc.left - geo.ox) / geo.s), r = Math.floor((e.clientY - rc.top - geo.oy) / geo.s);
    if (r < 0 || r >= R || c < 0 || c >= Cn || isS(r, c) || isG(r, c)) return;
    wall[key(r, c)] = !wall[key(r, c)];
    restart();
  });

  fromRows(MAZE_A);
  reset();
  if (NMLab.demo) { mode = "DFS"; root.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", x.dataset.mode === "DFS" ? "true" : "false")); reset(); for (let i = 0; i < 400 && step(); i++); }
})();
