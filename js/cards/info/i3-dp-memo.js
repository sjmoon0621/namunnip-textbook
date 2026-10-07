/* 카드: 같은 계산을 두 번 하지 않으면 얼마나 빨라질까? — 계단 오르기, 단순 재귀 · 메모이제이션 · 표 채우기 */
(() => {
  const root = document.getElementById("card-info-dp-memo");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sN = $(".n"), pre = $("pre.code");
  const CODE = {
    naive: [
      "def ways(n):",
      "    if n <= 1:",
      "        return 1",
      "    return ways(n - 1) + ways(n - 2)",
    ],
    memo: [
      "memo = {}",
      "def ways(n):",
      "    if n <= 1:",
      "        return 1",
      "    if n in memo:",
      "        return memo[n]",
      "    memo[n] = ways(n - 1) + ways(n - 2)",
      "    return memo[n]",
    ],
    tab: [
      "def ways(n):",
      "    dp = [1] * (n + 1)",
      "    for i in range(2, n + 1):",
      "        dp[i] = dp[i - 1] + dp[i - 2]",
      "    return dp[n]",
    ],
  };
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let mode = "naive", n = 5, nodes = [], events = [], k = 0, stats = null;

  const fib = (m) => { let a = 1, b = 1; for (let i = 2; i <= m; i++) [a, b] = [b, a + b]; return b; };

  /* 재귀 실행을 흉내 내어 호출 트리와 사건 목록을 만든다 */
  function simulate(m, useMemo) {
    const ns = [], ev = [], seen = new Set(), memo = new Map();
    let dup = 0;
    const call = (x, parent, depth) => {
      const nd = { x, parent, depth, kids: [], kind: "calc", val: 0, id: ns.length };
      ns.push(nd);
      if (parent) parent.kids.push(nd);
      if (seen.has(x) && !(useMemo && (memo.has(x) || x <= 1))) { nd.redo = true; dup++; }
      seen.add(x);
      ev.push({ t: "in", nd });
      if (x <= 1) { nd.kind = "base"; nd.val = 1; }
      else if (useMemo && memo.has(x)) { nd.kind = "hit"; nd.val = memo.get(x); }
      else {
        nd.val = call(x - 1, nd, depth + 1) + call(x - 2, nd, depth + 1);
        if (useMemo) memo.set(x, nd.val);
      }
      ev.push({ t: "out", nd });
      return nd.val;
    };
    const v = call(m, null, 0);
    return { ns, ev, dup, val: v };
  }

  function layout() {
    let leaf = 0;
    const place = (nd) => {
      if (!nd.kids.length) { nd.lx = leaf++; return; }
      nd.kids.forEach(place);
      nd.lx = (nd.kids[0].lx + nd.kids[nd.kids.length - 1].lx) / 2;
    };
    if (nodes.length) place(nodes[0]);
    return Math.max(1, leaf);
  }

  function rebuild() {
    n = +sN.value; $(".n-out").textContent = n; k = 0;
    pre.innerHTML = CODE[mode].map((l) => `<span class="l">${esc(l)}</span>`).join("");
    nodes = []; events = [];
    if (mode === "tab") {
      events = [{ t: "init" }];
      for (let i = 2; i <= n; i++) events.push({ t: "fill", i });
      events.push({ t: "ret" });
      stats = { calls: 1, dup: 0, val: fib(n), adds: Math.max(0, n - 1) };
    } else if (n <= 7 || mode === "memo") {
      const s = simulate(n, mode === "memo");
      if (n <= 7) { nodes = s.ns; events = s.ev; }
      stats = { calls: s.ns.length, dup: s.dup, val: s.val };
    } else {
      const calls = 2 * fib(n) - 1;
      stats = { calls, dup: calls - (n + 1), val: fib(n) };
    }
    const stepOK = events.length > 0;
    root.querySelectorAll(".b-step, .b-all, .b-reset").forEach((b) => { b.disabled = !stepOK; b.style.opacity = stepOK ? "" : ".4"; });
    showNums(); hl(); draw();
  }

  function showNums() {
    const dt = root.querySelectorAll(".nums dt");
    if (mode === "tab") {
      dt[0].textContent = "덧셈 횟수"; dt[1].textContent = "재귀 호출"; dt[2].textContent = "오르는 방법의 수";
      $(".n-calls").textContent = stats.adds.toLocaleString();
      $(".n-dup").textContent = "없음";
    } else {
      dt[0].textContent = "ways() 호출 수"; dt[1].textContent = "같은 n을 다시 계산한 호출"; dt[2].textContent = "오르는 방법의 수";
      $(".n-calls").textContent = stats.calls.toLocaleString();
      $(".n-dup").textContent = stats.dup.toLocaleString();
    }
    $(".n-dup").className = "n-dup" + (stats.dup > 0 ? " bad" : "");
    $(".n-val").textContent = stats.val.toLocaleString();
  }

  function hl() {
    let line = -1;
    const e = events[k - 1];
    if (e) {
      if (mode === "tab") line = e.t === "init" ? 1 : e.t === "fill" ? 3 : 4;
      else if (mode === "naive") line = e.t === "in" ? 1 : e.nd.kind === "base" ? 2 : 3;
      else line = e.t === "in" ? 2 : e.nd.kind === "base" ? 3 : e.nd.kind === "hit" ? 5 : 6;
    }
    pre.querySelectorAll(".l").forEach((el, i) => el.classList.toggle("on", i === line));
  }

  const cv = fit($("canvas"), () => draw());

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === "tab") return drawTab(ctx, w, h);
    if (!nodes.length) return drawGrowth(ctx, w, h);
    drawTree(ctx, w, h);
  }

  function drawTree(ctx, w, h) {
    const leaves = layout();
    const maxD = Math.max(...nodes.map((d) => d.depth));
    const top = 40, bot = h - 52;
    const dx = (w - 30) / leaves, dy = maxD ? (bot - top) / maxD : 0;
    const r = Math.max(6, Math.min(12, dx * 0.42, dy * 0.32 || 12));
    const P = (d) => [15 + (d.lx + 0.5) * dx, top + d.depth * dy];
    const state = new Map();
    for (let i = 0; i < k; i++) { const e = events[i]; state.set(e.nd, e.t); }
    const cur = events[k - 1] && events[k - 1].nd;
    ctx.lineWidth = 1;
    for (const d of nodes) if (d.parent) {
      const [x1, y1] = P(d.parent), [x2, y2] = P(d);
      ctx.strokeStyle = state.has(d) ? C.ink2 : C.rule;
      ctx.beginPath(); ctx.moveTo(x1, y1 + r); ctx.lineTo(x2, y2 - r); ctx.stroke();
    }
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const d of nodes) {
      const [x, y] = P(d), st = state.get(d);
      let fill = C.card, stroke = C.rule, txt = C.ink3;
      if (st) {
        stroke = C.ink; txt = C.ink;
        if (st === "out") fill = d.kind === "hit" ? "#cfe5c6" : d.redo ? "#f3d9a4" : "#eef1ea";
        if (d.redo) stroke = C.amber;
        if (d.kind === "hit") stroke = C.forest;
      }
      ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = d === cur ? 2.6 : 1.2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = txt; ctx.font = `${r >= 9 ? 11 : 9.5}px ${F.mono}`;
      ctx.fillText(String(d.x), x, y + 0.5);
      if (st === "out" && r >= 9 && nodes.length <= 25) {
        ctx.fillStyle = C.ink2; ctx.font = `9.5px ${F.mono}`; ctx.fillText("=" + d.val, x, y + r + 8);
      }
    }
    ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
    // 호출 스택
    const stack = [];
    for (let d = cur && state.get(cur) === "in" ? cur : cur && cur.parent; d; d = d.parent) stack.unshift("ways(" + d.x + ")");
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2;
    let s = "호출 스택: " + (stack.length ? stack.join(" → ") : (k ? "(비어 있음 · 끝)" : "(실행 전)"));
    while (ctx.measureText(s).width > w - 10 && stack.length > 2) { stack.splice(1, 1); s = "호출 스택: " + stack[0] + " → … → " + stack.slice(1).join(" → "); }
    ctx.fillText(s, 4, 16);
    // 범례
    const items = [["#eef1ea", C.ink, "처음 계산"], ["#f3d9a4", C.amber, "같은 n 다시 계산"]];
    if (mode === "memo") items.push(["#cfe5c6", C.forest, "메모에서 꺼냄"]);
    let lx = 4;
    ctx.font = `11px ${F.sans}`;
    for (const [f, s2, lab] of items) {
      ctx.fillStyle = f; ctx.strokeStyle = s2; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(lx + 6, h - 10, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.fillText(lab, lx + 16, h - 6);
      lx += 22 + ctx.measureText(lab).width + 10;
    }
  }

  function drawGrowth(ctx, w, h) {
    const x0 = 50, y0 = 26, pw = w - 66, ph = h - 64;
    const X = (v) => x0 + (v - 1) / 29 * pw, Y = (lg) => y0 + ph - lg / 7 * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y,
      xt: [1, 5, 10, 15, 20, 25, 30].map((v) => [v, String(v)]),
      yt: [0, 1, 2, 3, 4, 5, 6, 7].map((v) => [v, v === 0 ? "1" : "10" + "⁰¹²³⁴⁵⁶⁷"[v]]),
      xlabel: "n", ylabel: "호출 수 (로그 눈금)" });
    const series = [[(m) => 2 * fib(m) - 1, C.amber, "단순 재귀"], [(m) => 2 * m - 1, C.forest, "메모이제이션"]];
    for (const [f, col] of series) {
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.8; ctx.beginPath();
      for (let m = 1; m <= 30; m++) { const p = [X(m), Y(Math.log10(f(m)))]; m === 1 ? ctx.moveTo(...p) : ctx.lineTo(...p); }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(X(n), Y(Math.log10(f(n))), 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(n), y0); ctx.lineTo(X(n), y0 + ph); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.amber; ctx.fillText("단순 재귀 2·ways(n) − 1", x0 + 8, y0 + 14);
    ctx.fillStyle = C.forest; ctx.fillText("메모이제이션 2n − 1", x0 + 8, y0 + 30);
    ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("n ≤ 7로 줄이면 호출 트리를 볼 수 있습니다", x0 + pw, y0 + ph - 8);
    ctx.textAlign = "left";
  }

  function drawTab(ctx, w, h) {
    const cells = n + 1, cw = Math.min(46, (w - 20) / cells), x0 = (w - cw * cells) / 2, y = h * 0.42, ch = Math.min(40, cw * 1.1 + 8);
    const e = events[k - 1];
    const filled = !k ? -1 : e.t === "init" ? 1 : e.t === "fill" ? e.i : n;
    const curI = e && e.t === "fill" ? e.i : -1;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = 0; i < cells; i++) {
      const x = x0 + i * cw;
      const on = i <= filled || (k && i <= 1);
      ctx.fillStyle = i === curI ? "#cfe5c6" : on ? "#eef1ea" : C.card;
      ctx.strokeStyle = i === curI ? C.forest : C.ink2; ctx.lineWidth = i === curI ? 2 : 1;
      ctx.fillRect(x, y, cw, ch); ctx.strokeRect(x + .5, y + .5, cw - 1, ch - 1);
      if (on) {
        const v = fib(i).toLocaleString();
        ctx.font = `${cw > 30 ? 12 : 9}px ${F.mono}`;
        if (ctx.measureText(v).width < cw - 3) { ctx.fillStyle = C.ink; ctx.fillText(v, x + cw / 2, y + ch / 2); }
      }
      if (cells <= 16 || i % 5 === 0 || i === n) { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.fillText(String(i), x + cw / 2, y + ch + 12); }
    }
    if (curI >= 2) {
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.4;
      for (const j of [curI - 1, curI - 2]) {
        const xa = x0 + (j + 0.5) * cw, xb = x0 + (curI + 0.5) * cw, lift = 14 + (curI - j) * 10;
        ctx.beginPath(); ctx.moveTo(xa, y - 2); ctx.quadraticCurveTo((xa + xb) / 2, y - lift * 1.6, xb, y - 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(xb, y - 2); ctx.lineTo(xb - 5, y - 8); ctx.lineTo(xb + 2, y - 9); ctx.closePath(); ctx.fillStyle = C.forest; ctx.fill();
      }
    }
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2;
    let s = "dp 배열 (인덱스 = 계단 수)";
    if (curI >= 2) s = `dp[${curI}] = dp[${curI - 1}] + dp[${curI - 2}] = ${fib(curI - 1).toLocaleString()} + ${fib(curI - 2).toLocaleString()} = ${fib(curI).toLocaleString()}`;
    else if (e && e.t === "ret") s = `return dp[${n}] → ${fib(n).toLocaleString()}`;
    else if (e && e.t === "init") s = "dp = [1] * (n + 1)  → dp[0] = dp[1] = 1";
    ctx.fillText(s, 6, 18);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`;
    ctx.fillText("왼쪽 칸부터 차례로 채우므로, 필요한 값은 언제나 이미 표에 있습니다.", 6, h - 10);
  }

  const step = () => { if (k < events.length) { k++; hl(); draw(); } };
  $(".b-step").addEventListener("click", step);
  $(".b-all").addEventListener("click", () => { k = events.length; hl(); draw(); });
  $(".b-reset").addEventListener("click", () => { k = 0; hl(); draw(); });
  sN.addEventListener("input", rebuild);
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".presets .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    mode = b.dataset.m; rebuild();
  }));
  const qm = /[?&]m=(naive|memo|tab)/.exec(location.search), qn = /[?&]n=(\d+)/.exec(location.search);
  if (qm) root.querySelectorAll(".presets .chip").forEach((c) => { c.setAttribute("aria-pressed", String(c.dataset.m === qm[1])); if (c.dataset.m === qm[1]) mode = qm[1]; });
  if (qn) sN.value = qn[1];
  rebuild();
  if (window.NMLab && NMLab.demo) { k = Math.min(11, events.length); hl(); draw(); }
})();
