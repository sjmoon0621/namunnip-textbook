/* 카드: 배낭에 넣을 물건의 모든 경우는 몇 가지일까? — 0/1 배낭 문제의 상태 공간 트리를 완전 탐색 */
(() => {
  const root = document.getElementById("card-info-space");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const ITEMS = [["A", 2, 3], ["B", 3, 4], ["C", 4, 5], ["D", 5, 8], ["E", 9, 10], ["F", 4, 7]];
  const CODE = [
    "def search(i, w, v):",
    "    global best",
    "    if i == n:",
    "        if w <= cap and v > best:",
    "            best = v",
    "        return",
    "    search(i + 1, w, v)",
    "    search(i + 1, w + W[i], v + V[i])",
  ];
  const cp = I2.code($(".i2c"), CODE);
  const sN = $(".n"), sCap = $(".cap");
  let order = [], k = 0, n = 4, cap = 10, best = -1, bestNode = null;

  function build() {
    n = +sN.value; cap = +sCap.value;
    order = [];
    const make = (i, w, v, bits, via) => {
      const nd = { i, w, v, bits, via, leaf: i === n };
      order.push(nd);
      if (i < n) {
        make(i + 1, w, v, bits + "0", 6);
        make(i + 1, w + ITEMS[i][1], v + ITEMS[i][2], bits + "1", 7);
      }
    };
    make(0, 0, 0, "", 0);
    k = 0; best = -1; bestNode = null;
    $(".items").innerHTML = ITEMS.slice(0, n).map(([a, w, v]) => `<span><b>${a}</b> ${w} kg · 가치 ${v}</span>`).join("");
    visit();
  }
  function visit() {
    const nd = order[k];
    nd.seen = true;
    let line = nd.via;
    if (nd.leaf) {
      nd.ok = nd.w <= cap;
      if (nd.ok && nd.v > best) { best = nd.v; bestNode = nd; line = 4; } else line = 3;
    }
    cp.set(line); show(); draw();
  }
  function step() {
    if (k >= order.length - 1) return false;
    k++; visit();
    return k < order.length - 1;
  }
  const pos = (nd, w) => {
    const L = 2 ** n, span = 2 ** (n - nd.i), first = nd.bits ? parseInt(nd.bits, 2) * span : 0;
    return 12 + (w - 24) * (first + span / 2) / L;
  };

  const view = fit($(".cv-wide"), () => draw());
  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w || !order.length) return;
    ctx.clearRect(0, 0, w, h);
    const top = 16, bot = n <= 4 ? 34 : 18, rh = (h - top - bot) / n, r = Math.max(2.5, Math.min(7, (w - 24) / 2 ** n * 0.35));
    const Y = (nd) => top + nd.i * rh;
    const path = new Set(); let cur = order[k];
    for (let b = cur.bits; ; b = b.slice(0, -1)) { path.add(b); if (!b) break; }
    for (const nd of order) if (nd.bits) {
      const pb = nd.bits.slice(0, -1), p = { i: nd.i - 1, bits: pb };
      ctx.strokeStyle = path.has(nd.bits) ? C.warn : nd.seen ? C.ink3 : C.rule;
      ctx.lineWidth = path.has(nd.bits) ? 2.2 : 1;
      ctx.beginPath(); ctx.moveTo(pos(p, w), Y(p)); ctx.lineTo(pos(nd, w), Y(nd)); ctx.stroke();
    }
    for (const nd of order) {
      let fill = nd.seen ? C.ink3 : C.card;
      if (nd.leaf && nd.seen) fill = nd.ok ? "#9cc68f" : "#e3b6a3";
      if (nd === bestNode) fill = C.forest;
      ctx.fillStyle = fill; ctx.strokeStyle = nd === cur ? C.warn : C.ink2; ctx.lineWidth = nd === cur ? 2.5 : 1;
      ctx.beginPath(); ctx.arc(pos(nd, w), Y(nd), nd === cur ? r + 2 : r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (nd.leaf && n <= 4 && nd.seen) {
        ctx.fillStyle = nd.ok ? C.ink : C.warn; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
        ctx.fillText(nd.ok ? nd.v : "초과", pos(nd, w), Y(nd) + 18);
      }
    }
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
    for (let i = 0; i < n; i++) ctx.fillText(`${ITEMS[i][0]}?`, 2, top + (i + 0.5) * rh + 4);
    ctx.textAlign = "right"; ctx.fillText("왼쪽 가지 = 안 넣음, 오른쪽 = 넣음", w - 4, h - 3);
  }
  function show() {
    const cur = order[k], leaves = 2 ** n;
    const seenLeaves = order.slice(0, k + 1).filter((d) => d.leaf).length;
    $(".n-node").textContent = `${k + 1} / ${order.length}`;
    $(".n-leaf").textContent = `${seenLeaves} / ${leaves}`;
    const pick = (nd) => [...nd.bits].map((b, i) => (b === "1" ? ITEMS[i][0] : "")).join("") || "없음";
    $(".n-best").textContent = bestNode ? `${best} (${pick(bestNode)})` : "—";
    $(".state").textContent = `지금 상태: i = ${cur.i}, 넣은 물건 ${pick(cur)}, 무게 w = ${cur.w} kg, 가치 v = ${cur.v}` + (cur.leaf ? (cur.ok ? "  → 완성, 가능" : "  → 완성, 무게 초과") : "");
    $(".n-out").textContent = n; $(".cap-out").textContent = cap;
  }

  const run = I2.runner($(".run"), step, () => (n > 4 ? 40 : 160));
  const reset = () => { run.stop(); build(); };
  [sN, sCap].forEach((el) => el.addEventListener("input", reset));
  $(".step").addEventListener("click", () => { run.stop(); step(); });
  $(".again").addEventListener("click", reset);
  build();
  if (NMLab.demo) { for (let i = 0; i < 22 && step(); i++); }
})();
