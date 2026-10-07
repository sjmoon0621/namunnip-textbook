/* 카드: 답을 놓치지 않고 얼마나 덜 볼 수 있을까? — 배낭 문제의 완전 탐색·가지치기·분기 한정·탐욕 비교 */
(() => {
  const root = document.getElementById("card-info-bnb");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const RAW = [["A", 2, 3], ["B", 3, 4], ["C", 4, 5], ["D", 5, 8], ["E", 9, 10], ["F", 4, 7]];
  const ITEMS = RAW.slice().sort((a, b) => b[2] / b[1] - a[2] / a[1]);
  const n = ITEMS.length;
  const DFS = [
    "def dfs(i, w, v):",
    "    global best",
    "    if w > cap:",
    "        return              # 가지치기 1",
    "    best = max(best, v)",
    "    if i == n:",
    "        return",
    "    if v + bound(i, cap - w) <= best:",
    "        return              # 가지치기 2",
    "    dfs(i + 1, w + W[i], v + V[i])",
    "    dfs(i + 1, w, v)",
  ];
  const GREEDY = [
    "def greedy(items, cap):",
    "    items.sort(key=lambda t: t[1] / t[0],",
    "               reverse=True)",
    "    w = v = 0",
    "    for wt, val in items:",
    "        if w + wt <= cap:",
    "            w += wt",
    "            v += val",
    "    return v",
  ];
  const pre = $(".i2c");
  let cp = null, method = "bnb", cap = 12, runs = {}, k = 0;
  const sCap = $(".cap");

  function bound(i, room) {
    let b = 0;
    for (let j = i; j < n; j++) {
      const [, wt, val] = ITEMS[j];
      if (wt <= room) { room -= wt; b += val; } else { b += val * room / wt; break; }
    }
    return b;
  }
  function search(kind) {
    const ev = []; let best = 0, bestBits = "";
    const go = (i, w, v, bits) => {
      const e = { bits, i, w, v, st: "ok", line: 4 };
      ev.push(e);
      if (kind !== "full" && w > cap) { e.st = "over"; e.line = 3; return; }
      if (w <= cap && v > best) { best = v; bestBits = bits; e.best = true; }
      if (i === n) { e.st = w > cap ? "over" : "leaf"; e.line = kind === "full" ? 5 : 6; return; }
      if (kind === "bnb" && v + bound(i, cap - w) <= best) { e.st = "bound"; e.line = 8; return; }
      go(i + 1, w + ITEMS[i][1], v + ITEMS[i][2], bits + "1");
      go(i + 1, w, v, bits + "0");
    };
    go(0, 0, 0, "");
    return { ev, best, bestBits };
  }
  function greedy() {
    const ev = [{ bits: "", i: 0, w: 0, v: 0, st: "ok", line: 3 }];
    let w = 0, v = 0, bits = "";
    for (let i = 0; i < n; i++) {
      const [, wt, val] = ITEMS[i];
      if (w + wt <= cap) { w += wt; v += val; bits += "1"; ev.push({ bits, i: i + 1, w, v, st: "ok", line: 7 }); }
      else { bits += "0"; ev.push({ bits, i: i + 1, w, v, st: "ok", line: 5, skip: true }); }
    }
    ev[ev.length - 1].st = "leaf";
    return { ev, best: v, bestBits: bits };
  }
  function build() {
    cap = +sCap.value; $(".cap-out").textContent = cap;
    runs = { full: search("full"), cap: search("cap"), bnb: search("bnb"), greedy: greedy() };
    const opt = runs.full.best;
    const names = { full: "완전 탐색", cap: "무게 초과 가지치기", bnb: "분기 한정", greedy: "탐욕 (가치/무게 순)" };
    $(".cmp tbody").innerHTML = Object.keys(names).map((m) =>
      `<tr${m === method ? ' class="on"' : ""}><th>${names[m]}</th><td>${runs[m].ev.length}</td><td>${runs[m].best}</td><td class="${runs[m].best === opt ? "good" : "bad"}">${runs[m].best === opt ? "최적" : "최적 아님"}</td></tr>`).join("");
    const code = method === "greedy" ? GREEDY : DFS;
    if (!cp || pre.dataset.kind !== (method === "greedy" ? "g" : "d")) { cp = I2.code(pre, code); pre.dataset.kind = method === "greedy" ? "g" : "d"; }
    k = 0; cp.set(runs[method].ev[0].line); draw(); state();
  }
  function step() {
    const ev = runs[method].ev;
    if (k >= ev.length - 1) return false;
    k++; cp.set(ev[k].line); draw(); state();
    return k < ev.length - 1;
  }
  const label = (bits) => [...bits].map((b, i) => (b === "1" ? ITEMS[i][0] : "")).join("") || "없음";
  function state() {
    const e = runs[method].ev[k];
    const why = { ok: "", over: " → 무게 초과, 여기서 멈춤", bound: ` → 상한 ${(e.v + bound(e.i, cap - e.w)).toFixed(1)} ≤ 지금까지 최고, 여기서 멈춤`, leaf: " → 끝까지 결정함" }[e.st];
    $(".state").textContent = `${k + 1}번째 방문: 넣은 물건 ${label(e.bits)}, w = ${e.w} kg, v = ${e.v}${e.skip ? " (방금 물건은 안 들어가 건너뜀)" : ""}${why}`;
  }

  const view = fit($(".cv-wide"), () => draw());
  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w || !runs.full) return;
    ctx.clearRect(0, 0, w, h);
    const top = 14, rh = (h - top - 22) / n, L = 2 ** n, r = Math.max(2.5, Math.min(6, (w - 30) / L * 0.36));
    const X = (bits, i) => {
      const span = 2 ** (n - i);
      const first = bits ? (L - span) - parseInt(bits, 2) * span : 0;
      return 22 + (w - 30) * (first + span / 2) / L;
    };
    const Y = (i) => top + i * rh;
    const seen = new Map(runs[method].ev.slice(0, k + 1).map((e) => [e.bits, e]));
    const cur = runs[method].ev[k];
    const all = [];
    const walk = (i, bits) => { all.push([i, bits]); if (i < n) { walk(i + 1, bits + "1"); walk(i + 1, bits + "0"); } };
    walk(0, "");
    for (const [i, bits] of all) if (i > 0) {
      const p = bits.slice(0, -1), on = seen.has(bits);
      ctx.strokeStyle = on ? C.ink2 : "#e6e7e0"; ctx.lineWidth = on ? 1.3 : 1;
      if (cur.bits.startsWith(bits)) { ctx.strokeStyle = C.warn; ctx.lineWidth = 2.2; }
      ctx.beginPath(); ctx.moveTo(X(p, i - 1), Y(i - 1)); ctx.lineTo(X(bits, i), Y(i)); ctx.stroke();
    }
    for (const [i, bits] of all) {
      const e = seen.get(bits), x = X(bits, i), y = Y(i);
      if (!e) { ctx.fillStyle = "#eeefe8"; ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, Math.PI * 2); ctx.fill(); continue; }
      ctx.fillStyle = e.st === "over" ? "#e3b6a3" : e.st === "bound" ? C.amber : e.st === "leaf" ? "#9cc68f" : C.ink3;
      if (bits === runs[method].bestBits && k === runs[method].ev.length - 1) ctx.fillStyle = C.forest;
      ctx.strokeStyle = e === cur ? C.warn : C.ink2; ctx.lineWidth = e === cur ? 2.5 : 1;
      ctx.beginPath(); ctx.arc(x, y, e === cur ? r + 2 : r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    for (let i = 0; i < n; i++) ctx.fillText(`${ITEMS[i][0]}?`, 0, top + (i + 0.5) * rh + 4);
    ctx.textAlign = "right"; ctx.fillText("왼쪽 가지 = 넣음, 오른쪽 = 안 넣음", w - 4, h - 4);
  }

  const run = I2.runner($(".run"), step, () => 70);
  const reset = () => { run.stop(); build(); };
  sCap.addEventListener("input", reset);
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => {
    method = b.dataset.m;
    root.querySelectorAll("[data-m]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    reset();
  }));
  $(".step").addEventListener("click", () => { run.stop(); step(); });
  $(".again").addEventListener("click", reset);
  $(".items").innerHTML = ITEMS.map(([a, wt, v]) => `<span><b>${a}</b> ${wt} kg · ${v} <i>(${(v / wt).toFixed(2)})</i></span>`).join("");
  build();
  if (NMLab.demo) { for (let i = 0; i < 200 && step(); i++); }
})();
