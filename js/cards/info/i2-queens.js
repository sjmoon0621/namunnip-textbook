/* 카드: 가망 없는 가지를 언제 잘라야 할까? — N-Queen 백트래킹과 방문한 상태 수 비교 */
(() => {
  const root = document.getElementById("card-info-queens");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const CODE = [
    "def place(row, cols):",
    "    if row == n:",
    "        solutions.append(cols[:])",
    "        return",
    "    for c in range(n):",
    "        if safe(cols, row, c):",
    "            cols.append(c)",
    "            place(row + 1, cols)",
    "            cols.pop()",
    "",
    "def safe(cols, row, c):",
    "    for r, q in enumerate(cols):",
    "        if q == c or abs(q - c) == row - r:",
    "            return False",
    "    return True",
  ];
  const cp = I2.code($(".i2c"), CODE);
  const sN = $(".nq");
  let n = 6, ev = [], k = -1, totals = null, speed = 1;

  const safe = (cols, row, c) => cols.every((q, r) => q !== c && Math.abs(q - c) !== row - r);
  function build() {
    n = +sN.value; ev = []; k = -1;
    let calls = 0, sols = 0, checks = 0;
    const cols = [];
    const place = (row) => {
      calls++;
      if (row === n) { sols++; ev.push({ t: "sol", cols: cols.slice() }); return; }
      for (let c = 0; c < n; c++) {
        checks++;
        const ok = safe(cols, row, c);
        ev.push({ t: "try", row, c, ok, cols: cols.slice(), calls: calls + (ok ? 1 : 0) });
        if (ok) { cols.push(c); place(row + 1); cols.pop(); ev.push({ t: "back", row, cols: cols.slice() }); }
      }
    };
    place(0);
    let full = 0, perm = 0, f = 1;
    for (let i = 0; i <= n; i++) { full += n ** i; perm += f; f *= n - i; }
    totals = { calls, sols, checks, full, perm };
    $(".nq-out").textContent = n;
    show(); draw();
  }
  function cur() { return k >= 0 ? ev[k] : { t: "start", cols: [] }; }
  function step() {
    if (k >= ev.length - 1) return false;
    k++;
    const e = ev[k];
    cp.set(e.t === "sol" ? 2 : e.t === "back" ? 8 : e.ok ? 7 : 12);
    return true;
  }
  function tick() {
    let more = true;
    for (let i = 0; i < speed && more; i++) {
      more = step();
      if (more && ev[k].t === "sol" && $(".stopsol").checked) { show(); draw(); return false; }
    }
    show(); draw();
    return more;
  }

  const view = fit($(".cv-wide"), () => draw());
  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w || !totals) return;
    ctx.clearRect(0, 0, w, h);
    const e = cur(), B = Math.min(h - 8, w * 0.5), s = B / n, ox = 4, oy = (h - B) / 2;
    const cols = e.cols;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const hit = cols.some((q, rr) => q === c || Math.abs(q - c) === Math.abs(r - rr) || rr === r);
      ctx.fillStyle = (r + c) % 2 ? "#e4e5dc" : C.card;
      ctx.fillRect(ox + c * s, oy + r * s, s, s);
      if (hit && r >= cols.length) { ctx.fillStyle = "rgba(181,83,47,.13)"; ctx.fillRect(ox + c * s, oy + r * s, s, s); }
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(ox + .5, oy + .5, B, B);
    const queen = (r, c, col) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ox + c * s + s / 2, oy + r * s + s / 2, s * 0.32, 0, Math.PI * 2); ctx.fill();
    };
    cols.forEach((c, r) => queen(r, c, e.t === "sol" ? C.forest : C.ink));
    if (e.t === "try") {
      ctx.strokeStyle = e.ok ? C.forest : C.warn; ctx.lineWidth = 3;
      ctx.strokeRect(ox + e.c * s + 2, oy + e.row * s + 2, s - 4, s - 4);
      if (e.ok) queen(e.row, e.c, C.forest);
      else {
        ctx.beginPath(); ctx.moveTo(ox + e.c * s + s * .3, oy + e.row * s + s * .3); ctx.lineTo(ox + e.c * s + s * .7, oy + e.row * s + s * .7);
        ctx.moveTo(ox + e.c * s + s * .7, oy + e.row * s + s * .3); ctx.lineTo(ox + e.c * s + s * .3, oy + e.row * s + s * .7); ctx.stroke();
      }
    }
    // 오른쪽: 상태 수 막대 (로그 눈금)
    const x0 = B + 24, bw = w - x0 - 6, done = k >= ev.length - 1;
    const visited = calls();
    const bars = [
      ["가지치기 없이 모든 칸 배치", totals.full, C.ink3],
      ["열만 겹치지 않게 (순열)", totals.perm, C.amber],
      ["대각선까지 확인하며 가지치기", done ? totals.calls : visited, C.forest],
    ];
    const top = Math.log10(Math.max(totals.full, 10)) * 1.05;
    const bh = Math.min(22, (h - 40) / 6);
    ctx.textAlign = "left";
    bars.forEach(([lab, v, col], i) => {
      const y = oy + 14 + i * (bh * 2 + 8);
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.fillText(lab, x0, y);
      const len = v > 0 ? bw * 0.78 * Math.log10(v + 1) / top : 0;
      ctx.fillStyle = col; ctx.fillRect(x0, y + 5, Math.max(1, len), bh);
      ctx.fillStyle = C.ink; ctx.font = `11px ${F.mono}`; ctx.fillText(v.toLocaleString("en-US"), x0 + len + 5, y + 5 + bh * 0.72);
    });
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText("방문하는 상태(노드) 수 · 로그 눈금", x0, oy + 14 + 3 * (bh * 2 + 8));
  }
  function calls() {
    let c = 1;
    for (let i = 0; i <= k; i++) if (ev[i].t === "try" && ev[i].ok) c++;
    return c;
  }
  function show() {
    let sols = 0, checks = 0;
    for (let i = 0; i <= k; i++) { if (ev[i].t === "sol") sols++; if (ev[i].t === "try") checks++; }
    $(".n-v").textContent = `${calls().toLocaleString("en-US")} / ${totals.calls.toLocaleString("en-US")}`;
    $(".n-s").textContent = `${sols} / ${totals.sols}`;
    $(".n-c").textContent = checks.toLocaleString("en-US");
  }

  const run = I2.runner($(".run"), tick, 60);
  const reset = () => { run.stop(); cp.set(0); build(); };
  root.querySelectorAll("[data-sp]").forEach((b) => b.addEventListener("click", () => {
    speed = +b.dataset.sp;
    root.querySelectorAll("[data-sp]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
  }));
  sN.addEventListener("input", reset);
  $(".step").addEventListener("click", () => { run.stop(); step(); show(); draw(); });
  $(".again").addEventListener("click", reset);
  cp.set(0); build();
  if (NMLab.demo) { for (let i = 0; i < 400; i++) { step(); if (ev[k].t === "sol") break; } show(); draw(); }
})();
