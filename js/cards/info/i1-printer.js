/* 카드: 중요한 문서를 먼저 인쇄하는 프린터 큐 — 큐 회전(popleft → append)으로 순서 정하기 */
(() => {
  const root = document.getElementById("card-info-printer");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const { code, stepper, rrect } = I1;

  const SRC = [
    "from collections import deque",
    "",
    "def print_order(priorities, target):",
    "    q = deque(enumerate(priorities))   # (문서 번호, 중요도)",
    "    order = 0",
    "    while q:",
    "        doc = q.popleft()",
    "        if any(p > doc[1] for _, p in q):",
    "            q.append(doc)               # 맨 뒤로",
    "        else:",
    "            order += 1                  # 인쇄",
    "            if doc[0] == target:",
    "                return order",
  ];
  const NAME = "ABCDEFGHIJKL";
  let pri = [1, 1, 9, 1, 1, 1], target = 0, steps = [];

  function trace() {
    const q = pri.map((p, i) => [i, p]), printed = [], out = [];
    let pops = 0, cmp = 0;
    out.push({ q: q.map((d) => [...d]), printed: [], cur: null, act: "", pops, cmp, line: [4, 5], note: "문서를 들어온 순서대로 큐에 넣습니다. 괄호 안의 수가 중요도입니다." });
    while (q.length) {
      const doc = q.shift(); pops++;
      let higher = false;
      for (const [, p] of q) { cmp++; if (p > doc[1]) { higher = true; break; } }
      if (higher) {
        q.push(doc);
        out.push({ q: q.map((d) => [...d]), printed: [...printed], cur: doc, act: "back", pops, cmp, line: [7, 8, 9], note: `${NAME[doc[0]]}(${doc[1]})를 꺼냈지만 더 중요한 문서가 남아 있어 맨 뒤로 보냅니다.` });
      } else {
        printed.push(doc);
        const hit = doc[0] === target;
        out.push({ q: q.map((d) => [...d]), printed: [...printed], cur: doc, act: "print", pops, cmp, line: hit ? [7, 8, 11, 12, 13] : [7, 8, 11], note: `${NAME[doc[0]]}(${doc[1]})보다 중요한 문서가 없으므로 인쇄합니다. ${printed.length}번째 인쇄.` + (hit ? ` 찾던 문서 ${NAME[target]}입니다. 답은 ${printed.length}.` : ""), done: hit });
        if (hit) break;
      }
    }
    return out;
  }

  const view = fit($("canvas"), () => draw());
  let cv = code($(".code"), SRC), stp = null;

  function chip(ctx, x, y, bw, bh, d, opt) {
    const isT = d[0] === target;
    ctx.fillStyle = opt.fill || "#fff"; ctx.strokeStyle = isT ? C.warn : C.ink2; ctx.lineWidth = isT ? 2 : 1;
    rrect(ctx, x, y, bw, bh, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.textAlign = "center";
    ctx.font = `700 ${Math.round(bh * 0.34)}px ${F.mono}`; ctx.fillText(NAME[d[0]], x + bw / 2, y + bh * 0.42);
    ctx.font = `${Math.round(bh * 0.26)}px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(`(${d[1]})`, x + bw / 2, y + bh * 0.8);
  }

  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w || !steps.length) return;
    const s = steps[stp.i] || steps[0];
    ctx.clearRect(0, 0, w, h);
    const n = pri.length, bw = Math.min(46, (w - 40) / Math.max(7, n + 1) - 6), bh = bw * 1.15;
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("대기 큐 (왼쪽이 front)", 8, 14);
    /* 방금 꺼낸 문서 */
    const qy = 28;
    if (s.cur) {
      chip(ctx, 8, qy, bw, bh, s.cur, { fill: s.act === "print" ? "#dcebd6" : "#fdf3dc" });
      ctx.fillStyle = s.act === "print" ? C.forest : C.amber; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(s.act === "print" ? "인쇄" : "뒤로", 8 + bw / 2, qy + bh + 14);
    }
    const qx = 8 + bw + 22;
    ctx.strokeStyle = C.rule; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(qx - 11, qy - 4); ctx.lineTo(qx - 11, qy + bh + 4); ctx.stroke(); ctx.setLineDash([]);
    s.q.forEach((d, i) => chip(ctx, qx + i * (bw + 6), qy, bw, bh, d, {}));
    if (s.act === "back" && s.q.length) {
      const lx = qx + (s.q.length - 1) * (bw + 6) + bw / 2;
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1.4; ctx.beginPath();
      ctx.moveTo(8 + bw / 2, qy + bh + 20); ctx.lineTo(8 + bw / 2, qy + bh + 28); ctx.lineTo(lx, qy + bh + 28); ctx.lineTo(lx, qy + bh + 4); ctx.stroke();
      I1.arrow(ctx, lx, qy + bh + 12, lx, qy + bh + 3, C.amber);
    }
    /* 인쇄된 순서 */
    const py = qy + bh + 52;
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("인쇄된 순서", 8, py);
    s.printed.forEach((d, i) => {
      const x = 8 + i * (bw + 6);
      chip(ctx, x, py + 8, bw, bh, d, { fill: "#eef5eb" });
      ctx.fillStyle = C.forest; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`${i + 1}번째`, x + bw / 2, py + bh + 22);
    });
  }

  function show(i) {
    const s = steps[i];
    cv.set(s.line);
    $(".note").textContent = s.note;
    $(".r-pops").textContent = s.pops;
    $(".r-cmp").textContent = s.cmp;
    $(".r-ans").textContent = s.done ? `${s.printed.length}번째` : "—";
    draw();
  }
  stp = stepper($(".i1-step"), () => steps.length, show, 650);

  function targets() {
    const box = $(".tg");
    box.innerHTML = pri.map((p, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="${i === target}">${NAME[i]} (${p})</button>`).join("");
    box.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => { target = +b.dataset.i; targets(); run(); }));
  }
  function run() { steps = trace(); stp.stop(); stp.go(0); }
  function parse() {
    const v = $(".pri").value.split(/[\s,]+/).filter(Boolean).map(Number).filter((x) => Number.isInteger(x) && x >= 1 && x <= 9).slice(0, 10);
    if (!v.length) return;
    pri = v; target = Math.min(target, pri.length - 1); targets(); run();
  }
  $(".pri").addEventListener("change", parse);
  $(".pri").addEventListener("input", parse);
  root.querySelectorAll(".pp .chip").forEach((b) => b.addEventListener("click", () => {
    $(".pri").value = b.dataset.v; target = +b.dataset.t; parse();
  }));
  $(".pri").value = pri.join(" ");
  targets(); run();
  if (I1.demo) { root.querySelector(".pp .chip").click(); stp.go(4); }
})();
