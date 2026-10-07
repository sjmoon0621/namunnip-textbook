/* 카드: 재귀로 쓰면 느려지는 까닭은? — 피보나치 호출 트리, 메모 재귀, 반복의 호출 수와 스택 깊이 비교 */
(() => {
  const root = document.getElementById("card-info-fibtree");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const { code, stepper, fitText } = I1;

  const SRC = {
    naive: ["def fib(n):", "    if n < 2:", "        return n", "    return fib(n - 1) + fib(n - 2)"],
    memo: ["memo = {}", "def fib(n):", "    if n < 2:", "        return n", "    if n in memo:", "        return memo[n]", "    memo[n] = fib(n - 1) + fib(n - 2)", "    return memo[n]"],
    loop: ["def fib(n):", "    a, b = 0, 1", "    for _ in range(n):", "        a, b = b, a + b", "    return a"],
  };
  const FIB = [0, 1]; for (let i = 2; i <= 40; i++) FIB[i] = FIB[i - 1] + FIB[i - 2];
  const calls = { naive: (n) => 2 * FIB[n + 1] - 1, memo: (n) => (n < 2 ? 1 : 2 * n - 1), loop: () => 1 };
  const depth = { naive: (n) => Math.max(1, n), memo: (n) => Math.max(1, n), loop: () => 1 };
  const DRAWMAX = { naive: 7, memo: 12, loop: 12 };

  let mode = "naive", N = 5, nodes = [], ev = [];

  /* 호출 트리와 사건(들어감/나옴) 목록 만들기 */
  function build() {
    nodes = []; ev = [];
    if (mode === "loop") {
      let a = 0, b = 1;
      ev.push({ line: 2, i: 0, a, b, note: "a = fib(0), b = fib(1)로 시작합니다. 프레임은 하나뿐입니다." });
      for (let i = 1; i <= N; i++) {
        [a, b] = [b, a + b];
        ev.push({ line: 4, i, a, b, note: `${i}번째 반복: 두 변수를 한 칸씩 앞으로 옮깁니다. 이제 a = fib(${i}) = ${a}.` });
      }
      ev.push({ line: 5, i: N, a, b, note: `반복 ${N}번으로 fib(${N})을 구했습니다(값 ${a}). 앞에서 구한 값을 변수 두 개에 들고 다니므로 같은 계산을 다시 하지 않습니다.` });
      return;
    }
    const memo = new Set();
    const mk = (k, d, parent, hit) => { const nd = { k, d, parent, kids: [], hit, x: 0, v: FIB[k] }; nodes.push(nd); if (parent) parent.kids.push(nd); return nd; };
    const L = mode === "naive" ? { enter: 1, base: 3, comb: 4, hit: 0 } : { enter: 2, base: 4, comb: 8, hit: 6 };
    const go = (k, d, parent) => {
      const hit = mode === "memo" && k >= 2 && memo.has(k);
      const nd = mk(k, d, parent, hit);
      ev.push({ t: "in", nd, line: L.enter, note: `fib(${k})을 호출합니다. 스택 깊이 ${d + 1}.` });
      if (k < 2) { ev.push({ t: "out", nd, line: L.base, note: `fib(${k})은 기저 조건이라 바로 ${k}을 돌려줍니다.` }); return; }
      if (hit) { ev.push({ t: "out", nd, line: L.hit, note: `fib(${k})은 이미 memo에 있으므로 다시 계산하지 않고 저장된 값(${FIB[k]})을 꺼내 돌려줍니다.` }); return; }
      go(k - 1, d + 1, nd); go(k - 2, d + 1, nd);
      if (mode === "memo") memo.add(k);
      ev.push({ t: "out", nd, line: L.comb, note: `fib(${k - 1}) + fib(${k - 2}) = ${FIB[k - 1]} + ${FIB[k - 2]} = ${FIB[k]}. 이 값을 돌려줍니다.`+(mode === "memo" ? ` memo[${k}]에도 저장합니다.` : "") });
    };
    if (N <= DRAWMAX[mode]) go(N, 0, null);
    /* 잎은 왼쪽부터 차례로, 부모는 자식의 가운데 */
    let leaf = 0;
    const place = (nd) => { if (!nd.kids.length) { nd.x = leaf++; return; } nd.kids.forEach(place); nd.x = nd.kids.reduce((s, q) => s + q.x, 0) / nd.kids.length; };
    if (nodes.length) place(nodes[0]);
    nodes.leaves = leaf;
  }

  const tv = fit($(".cv-tree"), () => drawTree());
  const pv = fit($(".cv-plot"), () => drawPlot());
  let cv = null, stp = null;

  function drawTree() {
    const { ctx } = tv, { w, h } = tv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const i = stp ? stp.i : 0;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (mode === "loop") {
      const e = ev[i] || ev[0];
      const cols = Math.min(N + 2, 12), cw = Math.min(40, (w - 80) / cols), s0 = Math.max(0, Math.min(e.i - 8, N + 2 - cols));
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
      ctx.fillText("반복할 때마다 a, b가 수열을 따라 한 칸씩 이동 (프레임 1개)", 8, 16);
      ctx.textAlign = "center";
      for (let k = s0; k < s0 + cols; k++) {
        const x = 72 + (k - s0) * cw, y = h * 0.45;
        const isA = k === e.i, isB = k === e.i + 1;
        ctx.fillStyle = isA ? "#eef5eb" : isB ? C.warn + "22" : "#fff"; ctx.strokeStyle = isA ? C.forest : isB ? C.warn : C.rule;
        ctx.lineWidth = isA || isB ? 1.6 : 1;
        ctx.fillRect(x - cw / 2 + 2, y - 16, cw - 4, 32); ctx.strokeRect(x - cw / 2 + 2.5, y - 15.5, cw - 5, 31);
        ctx.fillStyle = k <= e.i + 1 ? C.ink : C.ink3; ctx.font = `${k <= e.i + 1 ? "600 " : ""}12px ${F.mono}`;
        fitText(ctx, String(FIB[k]), x, y, cw - 6);
        ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.fillText(String(k), x, y + 28);
        if (isA) { ctx.fillStyle = C.forest; ctx.font = `600 12px ${F.mono}`; ctx.fillText("a", x, y - 28); }
        if (isB) { ctx.fillStyle = C.warn; ctx.font = `600 12px ${F.mono}`; ctx.fillText("b", x, y - 28); }
      }
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("k", 8, h * 0.45 + 28); ctx.fillText("fib(k)", 8, h * 0.45);
      ctx.textBaseline = "alphabetic";
      return;
    }
    if (!nodes.length) {
      ctx.fillStyle = C.ink3; ctx.font = `13px ${F.sans}`;
      ctx.fillText(`호출이 ${calls[mode](N).toLocaleString()}번이라 트리를 그리지 않습니다.`, w / 2, h / 2 - 10);
      ctx.fillText(`n을 ${DRAWMAX[mode]} 이하로 줄이면 트리를 볼 수 있습니다.`, w / 2, h / 2 + 12);
      ctx.textBaseline = "alphabetic"; return;
    }
    const maxD = Math.max(...nodes.map((q) => q.d));
    const dx = (w - 24) / Math.max(1, nodes.leaves), dy = (h - 54) / Math.max(1, maxD);
    const r = Math.max(6, Math.min(12, dx * 0.42, dy * 0.4));
    const X = (nd) => 12 + dx * (nd.x + 0.5), Y = (nd) => 18 + nd.d * dy;
    const seen = new Set(), done = new Set(), stack = [];
    for (let k = 0; k <= i && k < ev.length; k++) {
      const e = ev[k];
      if (e.t === "in") { seen.add(e.nd); stack.push(e.nd); } else { done.add(e.nd); stack.pop(); }
    }
    const cur = ev[i] && ev[i].nd;
    const same = $(".same").checked && cur ? cur.k : -1;
    ctx.lineWidth = 1;
    nodes.forEach((nd) => nd.kids.forEach((q) => {
      ctx.strokeStyle = stack.includes(q) ? C.forest : seen.has(q) ? C.ink3 : C.rule; ctx.lineWidth = stack.includes(q) ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(X(nd), Y(nd)); ctx.lineTo(X(q), Y(q)); ctx.stroke();
    }));
    ctx.font = `${r > 9 ? 11 : 9.5}px ${F.mono}`;
    nodes.forEach((nd) => {
      const on = seen.has(nd), inS = stack.includes(nd), fin = done.has(nd);
      ctx.fillStyle = nd.k === same && on ? "#f6d9a8" : inS ? "#dcebd6" : fin ? "#fff" : C.card;
      ctx.strokeStyle = nd === cur ? C.forest : on ? C.ink2 : C.rule;
      ctx.lineWidth = nd === cur ? 2.2 : 1;
      ctx.setLineDash(nd.hit ? [3, 2] : []);
      ctx.beginPath(); ctx.arc(X(nd), Y(nd), r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = on ? C.ink : C.ink3;
      ctx.fillText(String(nd.k), X(nd), Y(nd) + 0.5);
    });
    ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
    if (same >= 0) {
      const cnt = nodes.filter((q) => q.k === same && !q.hit).length;
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`;
      ctx.fillText(`fib(${same})을 실제로 계산하는 횟수: ${cnt}번`, 8, h - 6);
    }
  }

  function drawPlot() {
    const { ctx } = pv, { w, h } = pv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 40, y0: 16, w: w - 52, h: h - 44 };
    const X = (n) => box.x0 + n / 30 * box.w, Y = (v) => box.y0 + box.h - Math.log10(v) / 7 * box.h;
    NM.axes(ctx, { ...box, X, Y, xt: [0, 5, 10, 15, 20, 25, 30].map((v) => [v, String(v)]), yt: [[1, "1"], [10, "10"], [100, "10²"], [1e3, "10³"], [1e4, "10⁴"], [1e5, "10⁵"], [1e6, "10⁶"], [1e7, "10⁷"]], xlabel: "n", ylabel: "fib 호출 수 (로그 눈금)" });
    const ser = [["naive", C.warn, "단순 재귀"], ["memo", C.forest, "메모 재귀"], ["loop", C.ink2, "반복 (반복 횟수)"]];
    const val = (m, n) => (m === "loop" ? Math.max(1, n) : calls[m](n));
    ser.forEach(([m, col]) => {
      ctx.strokeStyle = col; ctx.lineWidth = m === mode ? 2.2 : 1.2; ctx.beginPath();
      for (let n = 0; n <= 30; n++) { const x = X(n), y = Y(val(m, n)); n ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(N), Y(val(m, N)), m === mode ? 4.5 : 3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    let lx = box.x0 + 6;
    ser.forEach(([m, col, lab]) => { ctx.fillStyle = col; ctx.fillRect(lx, box.y0 + 4, 12, 3); ctx.fillStyle = C.ink2; ctx.fillText(lab, lx + 16, box.y0 + 10); lx += ctx.measureText(lab).width + 30; });
  }

  function show(i) {
    const e = ev[i];
    if (e) { cv.set(e.line); $(".note").textContent = e.note; }
    else { cv.set([]); $(".note").textContent = `n = ${N}이면 단계별 그림을 생략합니다. 아래 그래프와 수치로 비교하세요.`; }
    drawTree();
  }
  stp = stepper($(".i1-step"), () => Math.max(1, ev.length), show, 450);

  function rebuild() {
    cv = code($(".code"), SRC[mode]);
    build();
    $(".nv-out").textContent = N;
    $(".r-calls").textContent = mode === "loop" ? `1 (반복 ${N}번)` : calls[mode](N).toLocaleString();
    $(".r-depth").textContent = depth[mode](N);
    $(".r-val").textContent = FIB[N].toLocaleString();
    stp.stop(); stp.go(0);
    drawPlot();
  }
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".presets .chip").forEach((q) => q.setAttribute("aria-pressed", String(q === b)));
    mode = b.dataset.m; rebuild();
  }));
  $(".nv").addEventListener("input", () => { N = +$(".nv").value; rebuild(); });
  $(".same").addEventListener("change", () => drawTree());
  rebuild();
  if (I1.demo) stp.go(40);
})();
