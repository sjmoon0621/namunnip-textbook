/* 카드: 좁은 세상 연결망 — 와츠–스트로가츠 모형, 평균 거리 L과 뭉침 C, 최단 경로 */
(() => {
  const root = document.getElementById("card-hist-smallworld");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p");
  const N = 60, K = 2;
  const pOf = (v) => (v <= 0 ? 0 : 10 ** (-3 + 3 * v / 100));
  function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  // 연결마다 고정된 난수를 두어, p를 올리면 지름길이 하나씩 늘어나게 한다
  function base(seed) {
    const r = rng(seed), E = [];
    for (let i = 0; i < N; i++) for (let d = 1; d <= K; d++) E.push({ a: i, b: (i + d) % N, u: r(), t: r() });
    return E;
  }
  function build(E, p) {
    const adj = Array.from({ length: N }, () => new Set()), out = [];
    for (const e of E) {
      let b = e.b, sc = false;
      if (e.u < p) {
        b = Math.floor(e.t * N); let tries = 0;
        while ((b === e.a || adj[e.a].has(b)) && tries < N) { b = (b + 1) % N; tries++; }
        sc = true;
      }
      if (b === e.a || adj[e.a].has(b)) { b = e.b; sc = false; }
      adj[e.a].add(b); adj[b].add(e.a); out.push([e.a, b, sc]);
    }
    return { adj: adj.map((s) => [...s]), edges: out };
  }
  function bfs(adj, s) {
    const d = Array(N).fill(-1), pr = Array(N).fill(-1), q = [s]; d[s] = 0;
    for (let h = 0; h < q.length; h++) { const u = q[h]; for (const v of adj[u]) if (d[v] < 0) { d[v] = d[u] + 1; pr[v] = u; q.push(v); } }
    return { d, pr };
  }
  function metrics(adj) {
    let sum = 0, cnt = 0;
    for (let s = 0; s < N; s++) { const { d } = bfs(adj, s); for (let t = 0; t < N; t++) if (t !== s && d[t] > 0) { sum += d[t]; cnt++; } }
    let cs = 0;
    for (let i = 0; i < N; i++) {
      const nb = adj[i], k = nb.length; if (k < 2) continue;
      let l = 0; for (let x = 0; x < k; x++) for (let y = x + 1; y < k; y++) if (adj[nb[x]].includes(nb[y])) l++;
      cs += l / (k * (k - 1) / 2);
    }
    return { L: sum / cnt, C: cs / N };
  }
  // 곡선: 무작위 연결망 20개 평균
  const PV = [], LC = [];
  const E0 = base(11), m0 = metrics(build(E0, 0).adj);
  const ENS = Array.from({ length: 20 }, (_, i) => base(101 + i * 7919));
  for (let v = 0; v <= 100; v += 5) {
    const p = pOf(v); let l = 0, c = 0;
    ENS.forEach((E) => { const m = metrics(build(E, p).adj); l += m.L; c += m.C; });
    PV.push(v); LC.push([l / ENS.length / m0.L, c / ENS.length / m0.C]);
  }
  const { ctx, size } = fit(cv, () => draw());
  let G = null, M = null;
  function draw() {
    const { w, h } = size; if (!w || !G) return;
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.235, cy = h * 0.5, R = Math.min(w * 0.2, h * 0.42);
    const P = (i) => [cx + R * Math.cos(-Math.PI / 2 + i / N * 2 * Math.PI), cy + R * Math.sin(-Math.PI / 2 + i / N * 2 * Math.PI)];
    G.edges.forEach(([a, b, sc]) => {
      const [x1, y1] = P(a), [x2, y2] = P(b);
      ctx.strokeStyle = sc ? "rgba(224,160,42,.9)" : "rgba(93,93,97,.35)"; ctx.lineWidth = sc ? 1.4 : 1;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });
    // 0 → 30 최단 경로
    const { pr } = bfs(G.adj, 0); let v = 30; const path = [v]; while (pr[v] >= 0) { v = pr[v]; path.push(v); }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 3; ctx.beginPath();
    path.forEach((i, k) => { const [x, y] = P(i); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke();
    for (let i = 0; i < N; i++) {
      const [x, y] = P(i), on = path.includes(i);
      ctx.fillStyle = i === 0 || i === 30 ? C.forest : on ? C.leaf : C.ink2;
      ctx.beginPath(); ctx.arc(x, y, i === 0 || i === 30 ? 4.5 : on ? 3.2 : 2.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.forest; ctx.textAlign = "center";
    ctx.fillText("0", cx, cy - R - 9); ctx.fillText("30", cx, cy + R + 16);
    // 오른쪽: 곡선
    const gx0 = w * 0.55, gx1 = w - 10, gy0 = h - 30, gy1 = 22;
    const X = (vv) => gx0 + vv / 100 * (gx1 - gx0), Y = (y) => gy0 - y * (gy0 - gy1);
    NM.axes(ctx, { x0: gx0, y0: gy1, w: gx1 - gx0, h: gy0 - gy1, X, Y, xt: [[0, "0"], [33.3, "0.01"], [66.7, "0.1"], [100, "1"]], yt: [[0, "0"], [0.5, "0.5"], [1, "1"]], xlabel: "p (로그 눈금)" });
    const line = (k, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); PV.forEach((vv, i) => { const x = X(vv), y = Y(LC[i][k]); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke(); };
    line(0, "#3f6fa3"); line(1, C.warn);
    const vv = +sP.value; ctx.strokeStyle = C.ink; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(vv), gy1); ctx.lineTo(X(vv), gy0); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("평균 거리 L / L(0)", gx0 + 6, gy0 - 22);
    ctx.fillStyle = C.warn; ctx.fillText("뭉침 C / C(0)", gx0 + 6, gy0 - 8);
  }
  function update() {
    const p = pOf(+sP.value);
    $(".p-out").textContent = p === 0 ? "0" : p < 0.01 ? p.toFixed(4) : p.toFixed(3);
    G = build(E0, p); M = metrics(G.adj);
    $(".n-s").textContent = `${G.edges.filter((e) => e[2]).length} 개`;
    $(".n-l").textContent = M.L.toFixed(2);
    $(".n-c").textContent = M.C.toFixed(2);
    const d30 = bfs(G.adj, 0).d[30]; $(".n-d").textContent = d30 < 0 ? "끊어짐" : `${d30} 단계`;
    draw();
  }
  sP.addEventListener("input", update);
  if (/[?&]demo\b/.test(location.search)) sP.value = 42;
  update();
})();
