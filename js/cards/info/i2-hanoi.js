/* 카드: 원판 n개 문제를 원판 n−1개 문제로 바꿀 수 있을까? — 하노이 탑의 분해와 호출 스택 */
(() => {
  const root = document.getElementById("card-info-hanoi");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const CODE = [
    "def hanoi(n, src, dst, via):",
    "    if n == 1:",
    "        move(src, dst)",
    "        return",
    "    hanoi(n - 1, src, via, dst)",
    "    move(src, dst)",
    "    hanoi(n - 1, via, dst, src)",
  ];
  const cp = I2.code($(".i2c"), CODE);
  const P = ["A", "B", "C"];
  const sN = $(".n");
  let n = 3, pegs, ev = [], k = -1, moves = 0, manual = false, pick = null, msg = "";

  function build() {
    n = +sN.value; $(".n-out").textContent = n;
    pegs = [[], [], []];
    for (let d = n; d >= 1; d--) pegs[0].push(d);
    ev = []; k = -1; moves = 0; manual = false; pick = null; msg = "";
    const stack = [];
    const h = (m, s, d, v, line) => {
      stack.push(`hanoi(${m}, ${P[s]}, ${P[d]}, ${P[v]})`);
      ev.push({ t: "call", line, stack: stack.slice() });
      if (m === 1) { ev.push({ t: "move", s, d, line: 2, stack: stack.slice() }); stack.pop(); return; }
      h(m - 1, s, v, d, 4);
      ev.push({ t: "move", s, d, line: 5, stack: stack.slice() });
      h(m - 1, v, d, s, 6);
      stack.pop();
    };
    h(n, 0, 2, 1, 0);
    cp.set(-1); show(); draw();
  }
  function step() {
    if (manual) { msg = "직접 옮긴 뒤에는 '처음부터'를 눌러야 재귀 순서를 따라갈 수 있습니다."; show(); return false; }
    if (k >= ev.length - 1) return false;
    k++;
    const e = ev[k];
    if (e.t === "move") { pegs[e.d].push(pegs[e.s].pop()); moves++; }
    cp.set(e.line); show(); draw();
    return k < ev.length - 1;
  }
  function show() {
    const e = ev[k];
    const st = e ? e.stack : [];
    $(".stack").innerHTML = st.length
      ? st.map((f, i) => `<li${i === st.length - 1 ? ' class="cur"' : ""}>${"&nbsp;".repeat(i * 2)}${f}</li>`).join("")
      : "<li class=\"dim\">(호출 전)</li>";
    $(".n-m").textContent = `${moves} / ${2 ** n - 1}`;
    $(".n-d").textContent = st.length;
    const done = pegs[2].length === n;
    $(".msg").textContent = msg || (done ? `완성. 원판 ${n}개를 ${moves}번 만에 옮겼습니다.` : e && e.t === "move" ? `원판 ${pegs[e.d][pegs[e.d].length - 1]}을 ${P[e.s]} → ${P[e.d]}로 옮김` : e ? `새 호출: ${e.stack[e.stack.length - 1]}` : "");
  }

  const view = fit($(".cv-wide"), () => draw());
  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w || !pegs) return;
    ctx.clearRect(0, 0, w, h);
    const base = h - 30, colW = w / 3, maxW = colW * 0.86, dh = Math.min(34, (h - 60) / (n + 1.2));
    ctx.fillStyle = C.ink; ctx.fillRect(8, base, w - 16, 4);
    for (let p = 0; p < 3; p++) {
      const cx = colW * (p + 0.5);
      ctx.fillStyle = pick === p ? C.warn : C.ink2; ctx.fillRect(cx - 2.5, base - dh * (n + 1.2), 5, dh * (n + 1.2));
      ctx.fillStyle = C.ink2; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(P[p], cx, base + 20);
      pegs[p].forEach((d, i) => {
        const dw = maxW * (0.25 + 0.75 * d / n), y = base - (i + 1) * dh;
        const lastMoved = ev[k] && ev[k].t === "move" && ev[k].d === p && i === pegs[p].length - 1;
        ctx.fillStyle = d === n ? C.warn : lastMoved ? C.forest : "#9cc68f";
        ctx.fillRect(cx - dw / 2, y + 1, dw, dh - 2);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(cx - dw / 2 + .5, y + 1.5, dw - 1, dh - 3);
        if (dh >= 14) { ctx.fillStyle = d === n ? "#fff" : C.ink; ctx.font = `11px ${F.mono}`; ctx.fillText(d, cx, y + dh / 2 + 4); }
      });
    }
  }
  $(".cv-wide").addEventListener("click", (e) => {
    const rc = e.target.getBoundingClientRect(), p = Math.min(2, Math.floor((e.clientX - rc.left) / (rc.width / 3)));
    run.stop(); msg = "";
    if (pick === null) { if (pegs[p].length) pick = p; }
    else {
      const top = pegs[pick][pegs[pick].length - 1], under = pegs[p][pegs[p].length - 1];
      if (p !== pick) {
        if (under && under < top) msg = "작은 원판 위에 큰 원판을 놓을 수 없습니다.";
        else { pegs[p].push(pegs[pick].pop()); moves++; manual = true; ev.length && (k = -1); cp.set(-1); }
      }
      pick = null;
    }
    show(); draw();
  });

  const run = I2.runner($(".run"), step, 260);
  const reset = () => { run.stop(); build(); };
  sN.addEventListener("input", reset);
  $(".step").addEventListener("click", () => { run.stop(); step(); });
  $(".again").addEventListener("click", reset);
  build();
  if (NMLab.demo) { for (let i = 0; i < 9; i++) step(); }
})();
