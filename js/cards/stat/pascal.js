/* 카드: 이항계수를 삼각형으로 쌓으면 어떤 규칙이 보일까? — 두 수의 합, 행의 합 2^n, 대각선 합, 홀수 무늬 */
(() => {
  const root = document.getElementById("card-stat-pascal");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const cv = $("canvas"), sN = $(".N");
  const Cn = (n, k) => { if (k < 0 || k > n) return 0; let v = 1; for (let i = 1; i <= k; i++) v = v * (n - k + i) / i; return Math.round(v); };
  const sub = (n, r) => `<sub>${n}</sub>C<sub>${r}</sub>`;
  let mode = "sum", sel = [5, 2];
  const { ctx, size } = fit(cv, () => draw());
  const geo = () => {
    const { w, h } = size, N = +sN.value, cw = Math.min(40, (w - 8) / (N + 1)), rh = Math.min(28, (h - 16) / (N + 1));
    return { N, cw, rh, X: (n, r) => w / 2 + (r - n / 2) * cw, Y: (n) => 8 + rh * (n + 0.5) };
  };
  const marks = () => {
    const [n, r] = sel, m = new Map();
    if (mode === "sum") { if (n > 0) { if (r > 0) m.set(`${n - 1},${r - 1}`, "src"); if (r < n) m.set(`${n - 1},${r}`, "src"); } }
    if (mode === "row") for (let k = 0; k <= n; k++) m.set(`${n},${k}`, "src");
    if (mode === "stick") { for (let i = r; i <= n; i++) m.set(`${i},${r}`, "src"); }
    return m;
  };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { N, cw, rh, X, Y } = geo(), m = marks(), [sn, sr] = sel;
    const stickEnd = mode === "stick" && sn + 1 <= N ? `${sn + 1},${sr + 1}` : null;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const fs = cw < 28 ? 9 : cw < 34 ? 10.5 : 12;
    for (let n = 0; n <= N; n++) for (let r = 0; r <= n; r++) {
      const v = Cn(n, r), key = `${n},${r}`, x = X(n, r), y = Y(n);
      const isSel = mode !== "odd" && n === sn && r === sr, isSrc = m.has(key), isEnd = key === stickEnd;
      let fill = null;
      if (mode === "odd") fill = v % 2 ? C.leaf : null;
      else if (isEnd) fill = C.amber;
      else if (isSel && mode !== "stick" && mode !== "row") fill = C.warn;
      else if (isSrc) fill = C.sprout;
      if (fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, cw * 0.48, rh * 0.46, 0, 0, 7); ctx.fill(); }
      if (isSel && (mode === "stick" || mode === "row")) { ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, cw * 0.48, rh * 0.46, 0, 0, 7); ctx.stroke(); }
      ctx.fillStyle = fill === C.warn ? C.card : C.ink; ctx.font = `${isSel || isEnd ? 600 : 400} ${fs}px ${F.mono}`;
      ctx.fillText(v, x, y + 0.5);
    }
    if (mode === "sum" && sn > 0) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5;
      [[sn - 1, sr - 1], [sn - 1, sr]].forEach(([a, b]) => { if (b < 0 || b > a) return; ctx.beginPath(); ctx.moveTo(X(a, b), Y(a) + rh * 0.35); ctx.lineTo(X(sn, sr), Y(sn) - rh * 0.35); ctx.stroke(); });
    }
  }

  function update() {
    const N = +sN.value; $(".N-out").textContent = N;
    if (sel[0] > N) sel = [N, Math.min(sel[1], N)];
    const [n, r] = sel, v = Cn(n, r);
    let msg = "";
    if (mode === "sum") msg = n === 0 ? "0행의 1은 위에 수가 없습니다. 다른 수를 눌러 보세요."
      : r === 0 || r === n ? `${n}행의 양 끝 수 1은 위에 수가 하나뿐입니다. ${sub(n, r)} = 1`
      : `${sub(n, r)} = ${sub(n - 1, r - 1)} + ${sub(n - 1, r)} → ${v} = ${Cn(n - 1, r - 1)} + ${Cn(n - 1, r)}`;
    if (mode === "row") {
      let alt = 0; for (let k = 0; k <= n; k++) alt += (k % 2 ? -1 : 1) * Cn(n, k);
      msg = `${n}행의 합 = 2<sup>${n}</sup> = ${2 ** n} · 번갈아 더하고 빼면 ${alt}`;
    }
    if (mode === "stick") {
      let s = 0; for (let i = r; i <= n; i++) s += Cn(i, r);
      const parts = []; for (let i = r; i <= n; i++) parts.push(sub(i, r));
      msg = `${parts.length > 4 ? `${parts[0]} + ⋯ + ${parts[parts.length - 1]}` : parts.join(" + ")} = ${s} = ${sub(n + 1, r + 1)}${n + 1 > N ? " (그림 밖, N을 늘려 보세요)" : ""}`;
    }
    if (mode === "odd") { let odd = 0; for (let a = 0; a <= N; a++) for (let b = 0; b <= a; b++) odd += Cn(a, b) % 2; msg = `0행부터 ${N}행까지 수 ${(N + 1) * (N + 2) / 2}개 가운데 홀수 ${odd}개`; }
    $(".msg").innerHTML = msg;
    draw();
  }
  chips.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  cv.addEventListener("click", (e) => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top, { N, cw, rh, X, Y } = geo();
    const n = Math.round((y - 8) / rh - 0.5);
    if (n < 0 || n > N) return;
    const r = Math.round((x - X(n, 0)) / cw);
    if (r < 0 || r > n || Math.abs(y - Y(n)) > rh / 2) return;
    sel = [n, r]; update();
  });
  sN.addEventListener("input", update);
  update();
})();
