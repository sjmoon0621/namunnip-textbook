/* 카드: 가방에 담을 물건을 고르는 표는 어떻게 채울까? — 0-1 배낭 문제 dp 표 채우기 */
(() => {
  const root = document.getElementById("card-info-dp-knapsack");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sW = $(".w"), pre = $("pre.code");
  const SETS = [
    { items: [[1, 1], [3, 4], [4, 5], [5, 7]], W: 7 },
    { items: [[2, 3], [3, 4], [4, 5], [5, 6]], W: 5 },
    { items: [[6, 30], [3, 14], [4, 16], [2, 9]], W: 10 },
  ];
  const CODE = [
    "def knapsack(items, W):",
    "    n = len(items)",
    "    dp = [[0] * (W + 1) for _ in range(n + 1)]",
    "    for i in range(1, n + 1):",
    "        wt, val = items[i - 1]",
    "        for w in range(W + 1):",
    "            dp[i][w] = dp[i - 1][w]",
    "            if wt <= w:",
    "                dp[i][w] = max(dp[i][w], dp[i - 1][w - wt] + val)",
    "    return dp[n][W]",
  ];
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  pre.innerHTML = CODE.map((l) => `<span class="l">${esc(l)}</span>`).join("");
  const NAMES = "ABCD";
  let set = 0, items = SETS[0].items, W = 7, dp = [], k = 0;

  const total = () => items.length * (W + 1);
  const cellAt = (j) => [1 + Math.floor(j / (W + 1)), j % (W + 1)];

  function solve() {
    const n = items.length;
    dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      const [wt, val] = items[i - 1];
      for (let w = 0; w <= W; w++) {
        dp[i][w] = dp[i - 1][w];
        if (wt <= w) dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - wt] + val);
      }
    }
  }
  function back() {
    const take = new Set(), path = [];
    let w = W;
    for (let i = items.length; i >= 1; i--) {
      path.push([i, w]);
      if (dp[i][w] !== dp[i - 1][w]) { take.add(i); w -= items[i - 1][0]; }
    }
    path.push([0, w]);
    return { take, path };
  }
  function greedy() {
    const order = items.map((it, i) => i).sort((a, b) => items[b][1] / items[b][0] - items[a][1] / items[a][0]);
    let w = 0, v = 0; const got = [];
    for (const i of order) if (w + items[i][0] <= W) { w += items[i][0]; v += items[i][1]; got.push(NAMES[i]); }
    return { v, got };
  }

  function reset() { W = +sW.value; $(".w-out").textContent = W; k = 0; solve(); update(); }

  function update() {
    const done = k >= total();
    const cur = k > 0 && !done ? cellAt(k - 1) : (k > 0 ? cellAt(k - 1) : null);
    let line = -1;
    if (cur) line = items[cur[0] - 1][0] <= cur[1] ? 8 : 6;
    if (done) line = 9;
    pre.querySelectorAll(".l").forEach((el, i) => el.classList.toggle("on", i === line));
    const g = greedy();
    if (done) {
      const { take } = back();
      $(".n-dp").textContent = `${dp[items.length][W]} (${[...take].sort().map((i) => NAMES[i - 1]).join("+") || "없음"})`;
      $(".n-gr").textContent = `${g.v} (${g.got.join("+") || "없음"})`;
      $(".n-gr").className = "n-gr" + (g.v < dp[items.length][W] ? " bad" : "");
    } else {
      $(".n-dp").textContent = "—"; $(".n-gr").textContent = "—"; $(".n-gr").className = "n-gr";
    }
    $(".n-cnt").textContent = `${Math.min(k, total())} / ${2 ** items.length}`;
    draw();
  }

  const cv = fit($("canvas"), () => draw());
  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = items.length, cols = W + 1, rows = n + 1;
    const lw = 92, top = 52, cw = Math.min(40, (w - lw - 6) / cols), ch = Math.min(32, (h - top - 30) / rows);
    const X = (c) => lw + c * cw, Y = (r) => top + r * ch;
    const done = k >= total();
    const cur = k > 0 ? cellAt(k - 1) : null;
    const showCur = cur && !done;
    const bt = done ? back() : null;
    const onPath = (r, c) => bt && bt.path.some(([a, b]) => a === r && b === c);
    // 열 머리
    ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = C.ink3;
    for (let c = 0; c < cols; c++) ctx.fillText(String(c), X(c) + cw / 2, top - 9);
    ctx.textAlign = "right"; ctx.fillText("w →", lw - 6, top - 9);
    for (let r = 0; r < rows; r++) {
      ctx.textAlign = "right"; ctx.fillStyle = r && bt && bt.take.has(r) ? C.warn : C.ink2; ctx.font = `10.5px ${F.mono}`;
      const lab = r === 0 ? "i=0 (없음)" : `i=${r} ${NAMES[r - 1]}(${items[r - 1][0]},${items[r - 1][1]})`;
      ctx.fillText(lab, lw - 6, Y(r) + ch / 2);
      for (let c = 0; c < cols; c++) {
        const idx = r === 0 ? -1 : (r - 1) * cols + c;
        const filled = r === 0 || idx < k;
        const isCur = showCur && cur[0] === r && cur[1] === c;
        ctx.fillStyle = isCur ? "#cfe5c6" : onPath(r, c) ? "#f6e0b8" : filled ? "#eef1ea" : C.card;
        ctx.fillRect(X(c), Y(r), cw, ch);
        ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(X(c) + .5, Y(r) + .5, cw - 1, ch - 1);
        if (filled) {
          ctx.textAlign = "center"; ctx.fillStyle = C.ink; ctx.font = `${cw > 30 ? 12 : 10.5}px ${F.mono}`;
          ctx.fillText(String(dp[r][c]), X(c) + cw / 2, Y(r) + ch / 2 + 0.5);
        }
      }
    }
    let msg = "‘한 칸’을 누르면 1행부터 왼쪽에서 오른쪽으로 채웁니다.";
    if (showCur) {
      const [r, c] = cur, [wt, val] = items[r - 1];
      const box = (rr, cc, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(X(cc) + 1.5, Y(rr) + 1.5, cw - 3, ch - 3); };
      box(r - 1, c, C.forest);
      if (wt <= c) {
        box(r - 1, c - wt, C.forest);
        const a = dp[r - 1][c], b = dp[r - 1][c - wt] + val;
        msg = `dp[${r}][${c}] = max(넣지 않음 ${a}, 넣음 dp[${r - 1}][${c - wt}]+${val} = ${b}) = ${dp[r][c]}`;
      } else msg = `dp[${r}][${c}] = dp[${r - 1}][${c}] = ${dp[r][c]}  (무게 ${wt} > ${c}, 넣을 수 없음)`;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.strokeRect(X(c) + 1, Y(r) + 1, cw - 2, ch - 2);
    } else if (done) {
      msg = `답 dp[${n}][${W}] = ${dp[n][W]} · 주황 칸: 위 칸과 값이 다르면 그 물건을 넣은 것`;
    }
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`;
    while (ctx.measureText(msg).width > w - 8 && ctx.font.startsWith("11")) ctx.font = `10px ${F.mono}`;
    ctx.fillText(msg, 4, 16);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText("행: 앞의 i개 물건만 고려 · 이름(무게, 가치)", 4, Y(rows) + 18);
  }

  const adv = (m) => { k = Math.min(total(), k + m); update(); };
  $(".b-cell").addEventListener("click", () => adv(1));
  $(".b-row").addEventListener("click", () => { const c = W + 1; adv(k % c === 0 ? c : c - (k % c)); });
  $(".b-all").addEventListener("click", () => adv(total()));
  $(".b-reset").addEventListener("click", () => { k = 0; update(); });
  sW.addEventListener("input", reset);
  root.querySelectorAll(".presets .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".presets .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    set = +b.dataset.p; items = SETS[set].items; sW.value = SETS[set].W; reset();
  }));
  reset();
  if (window.NMLab && NMLab.demo) { k = 2 * (W + 1) + 5; update(); }
})();
