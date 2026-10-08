/* 카드: 바둑판 길에서 가장 짧은 길은 몇 가지일까? — → m개, ↑ n개의 배열 (m+n)!/(m!n!), 점 P를 지나는 경로, 덧셈 규칙 */
(() => {
  const root = document.getElementById("card-stat-grid-path");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sm = $(".m"), sn = $(".n"), bCount = $(".go-count"), bP = $(".go-p");
  const Cn = (n, k) => { if (k < 0 || k > n) return 0; let v = 1; for (let i = 1; i <= k; i++) v = v * (n - k + i) / i; return Math.round(v); };
  let path = [], showCount = false, useP = false, P = [2, 1], drag = false;
  const { ctx, size } = fit(cv, () => draw());
  const geo = () => {
    const { w, h } = size, m = +sm.value, n = +sn.value, cell = Math.min((w - 56) / m, (h - 48) / n);
    const ox = (w - cell * m) / 2, oy = (h + cell * n) / 2;
    return { m, n, cell, X: (i) => ox + i * cell, Y: (j) => oy - j * cell };
  };
  const pos = () => path.reduce(([i, j], s) => (s === "R" ? [i + 1, j] : [i, j + 1]), [0, 0]);
  const viaP = (i, j) => {
    if (i <= P[0] && j <= P[1]) return Cn(i + j, i);
    if (i >= P[0] && j >= P[1]) return Cn(P[0] + P[1], P[0]) * Cn(i - P[0] + j - P[1], i - P[0]);
    return 0;
  };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { m, n, cell, X, Y } = geo();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= m; i++) { ctx.moveTo(X(i), Y(0)); ctx.lineTo(X(i), Y(n)); }
    for (let j = 0; j <= n; j++) { ctx.moveTo(X(0), Y(j)); ctx.lineTo(X(m), Y(j)); }
    ctx.stroke();
    let [i, j] = [0, 0];
    ctx.strokeStyle = C.warn; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(X(0), Y(0));
    path.forEach((s) => { if (s === "R") i++; else j++; ctx.lineTo(X(i), Y(j)); });
    ctx.stroke(); ctx.lineCap = "butt";
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(i), Y(j), 5, 0, 7); ctx.fill();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (showCount) {
      const fs = cell < 40 ? 9.5 : 11;
      for (let a = 0; a <= m; a++) for (let b = 0; b <= n; b++) {
        const v = useP ? viaP(a, b) : Cn(a + b, a);
        if (useP && !v) continue;
        const s = String(v); ctx.font = `600 ${fs}px ${F.mono}`;
        const tw = ctx.measureText(s).width + 6;
        ctx.fillStyle = C.card; ctx.fillRect(X(a) + 3, Y(b) - 15, tw, 13);
        ctx.fillStyle = C.forest; ctx.textAlign = "left"; ctx.fillText(s, X(a) + 6, Y(b) - 8);
      }
      ctx.textAlign = "center";
    }
    if (useP) {
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(X(P[0]), Y(P[1]), 8, 0, 7); ctx.fill();
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.fillText("P", X(P[0]), Y(P[1]) + 1);
    }
    ctx.font = `600 13px ${F.sans}`; ctx.fillStyle = C.ink;
    ctx.fillText("A", X(0) - 12, Y(0) + 12); ctx.fillText("B", X(m) + 12, Y(n) - 12);
  }

  function update() {
    const m = +sm.value, n = +sn.value;
    P = [Math.min(P[0], m), Math.min(P[1], n)];
    let [i, j] = [0, 0], keep = [];
    for (const s of path) { if (s === "R" && i < m) { i++; keep.push(s); } else if (s === "U" && j < n) { j++; keep.push(s); } else break; }
    path = keep;
    $(".m-out").textContent = m; $(".n-out").textContent = n;
    const all = Cn(m + n, m), a1 = Cn(P[0] + P[1], P[0]), a2 = Cn(m - P[0] + n - P[1], m - P[0]);
    $(".n-all").textContent = `${m + n}!/(${m}!·${n}!) = ${all}`;
    $(".n-p").textContent = useP ? `${a1} × ${a2} = ${a1 * a2}` : "P를 켜면 보입니다";
    const str = path.map((s) => (s === "R" ? "→" : "↑")).join("");
    const r = path.filter((s) => s === "R").length, u = path.length - r, done = r === m && u === n;
    let msg = path.length ? `지금 경로: ${str}  (→ ${r}/${m}, ↑ ${u}/${n})` : "→, ↑ 버튼으로 A에서 출발하세요.";
    if (done) {
      let ii = 0, jj = 0, hit = !useP || (P[0] === 0 && P[1] === 0);
      path.forEach((s) => { if (s === "R") ii++; else jj++; if (ii === P[0] && jj === P[1]) hit = true; });
      msg = `완성: ${str} — → ${m}개와 ↑ ${n}개를 늘어놓은 ${all}가지 배열 가운데 하나입니다.${useP ? (hit ? " P를 지났습니다." : " P를 지나지 않았습니다.") : ""}`;
    }
    $(".msg").textContent = msg;
    draw();
  }
  const step = (s) => { const [i, j] = pos(); if ((s === "R" && i < +sm.value) || (s === "U" && j < +sn.value)) { path.push(s); update(); } };
  $(".go-right").addEventListener("click", () => step("R"));
  $(".go-up").addEventListener("click", () => step("U"));
  $(".go-back").addEventListener("click", () => { path.pop(); update(); });
  $(".go-clear").addEventListener("click", () => { path = []; update(); });
  bCount.addEventListener("click", () => { showCount = !showCount; bCount.setAttribute("aria-pressed", String(showCount)); update(); });
  bP.addEventListener("click", () => { useP = !useP; bP.setAttribute("aria-pressed", String(useP)); update(); });
  const nearest = (e) => {
    const b = cv.getBoundingClientRect(), { m, n, cell, X, Y } = geo();
    const i = Math.round((e.clientX - b.left - X(0)) / cell), j = Math.round((Y(0) - (e.clientY - b.top)) / cell);
    return [Math.max(0, Math.min(m, i)), Math.max(0, Math.min(n, j))];
  };
  cv.addEventListener("pointerdown", (e) => {
    if (!useP) return;
    drag = true; cv.setPointerCapture(e.pointerId); P = nearest(e); update();
  });
  cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const q = nearest(e); if (q[0] !== P[0] || q[1] !== P[1]) { P = q; update(); }
  });
  cv.addEventListener("pointerup", () => { drag = false; });
  [sm, sn].forEach((s) => s.addEventListener("input", update));
  update();
})();
