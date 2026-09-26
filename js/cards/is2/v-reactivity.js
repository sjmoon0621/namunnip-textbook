/* 카드: 철은 왜 녹슬고 금은 녹슬지 않을까? — 금속 조각을 금속 이온 수용액에 넣어 반응성 순서 찾기 */
(() => {
  const root = document.getElementById("card-is2-reactivity");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), mSel = $(".metal"), sSel = $(".sol"), goB = $(".go"), clrB = $(".clear");
  const nRes = $(".res"), nKnown = $(".known"), nOrder = $(".order"), msg = $(".msg");

  // 순서: 반응성이 큰 쪽부터 (실제 값). 학생은 실험으로 이 순서를 알아낸다.
  const M = [
    { s: "Mg", ion: "Mg²⁺", sol: "황산 마그네슘", strip: "#c9ccd0", dep: "#c9ccd0", solCol: [232, 238, 242] },
    { s: "Zn", ion: "Zn²⁺", sol: "황산 아연", strip: "#a9b0b8", dep: "#8f969d", solCol: [232, 238, 242] },
    { s: "Fe", ion: "Fe²⁺", sol: "황산 철(Ⅱ)", strip: "#6d6f73", dep: "#3e3f42", solCol: [205, 226, 190] },
    { s: "Cu", ion: "Cu²⁺", sol: "황산 구리(Ⅱ)", strip: "#c07845", dep: "#9a4f2a", solCol: [96, 156, 214] },
    { s: "Ag", ion: "Ag⁺", sol: "질산 은", strip: "#d7d8da", dep: "#5c5d61", solCol: [232, 238, 242] },
  ];
  const n = M.length;
  const res = Array.from({ length: n }, () => Array(n).fill(null)); // res[금속][용액] = true/false
  let cur = { m: 1, s: 3, t: 1 };

  const react = (m, s) => m < s; // 반응성이 큰 금속이 작은 금속의 이온에게 전자를 준다

  function known() {
    // 금속 i가 j보다 반응성이 크다: gt[i][j]. 실험 결과에서 이끌어 내고 추이로 넓힌다.
    const gt = Array.from({ length: n }, () => Array(n).fill(false));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (i === j || res[i][j] === null) continue;
      if (res[i][j]) gt[i][j] = true; else gt[j][i] = true;
    }
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (gt[i][k] && gt[k][j]) gt[i][j] = true;
    let cnt = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (gt[i][j] || gt[j][i]) cnt++;
    return { gt, cnt };
  }

  const { ctx, size } = fit(cv, () => draw());
  let cells = [];

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 460;
    // 비커
    const bw = narrow ? w * 0.42 : w * 0.34, bx = 14, by = 34, bh = h - by - 34;
    const m = M[cur.m], so = M[cur.s], same = cur.m === cur.s, go = !same && react(cur.m, cur.s), t = cur.t;
    const c0 = so.solCol, c1 = m.solCol;
    const col = go ? c0.map((v, k) => Math.round(v + (c1[k] - v) * t * 0.9)) : c0;
    const lvl = by + bh * 0.28;
    ctx.fillStyle = `rgb(${col})`; ctx.globalAlpha = .75; ctx.fillRect(bx + 3, lvl, bw - 6, by + bh - lvl - 3); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    // 금속판
    const sx = bx + bw / 2 - 9, sy = by - 18, sh = bh * 0.85;
    ctx.fillStyle = m.strip; ctx.fillRect(sx, sy, 18, sh); ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 1; ctx.strokeRect(sx + .5, sy + .5, 17, sh);
    if (go) {
      let seed = 3; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      const nDep = Math.round(70 * t);
      for (let k = 0; k < nDep; k++) {
        const y = lvl + 4 + rnd() * (sy + sh - lvl - 6), x = sx - 3 + rnd() * 24, rr = 1.5 + rnd() * 2.5;
        ctx.fillStyle = so.dep; ctx.beginPath();
        if (so.s === "Ag") { ctx.moveTo(x, y - rr * 1.6); ctx.lineTo(x + rr, y + rr); ctx.lineTo(x - rr, y + rr); ctx.closePath(); } else ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.font = `12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    ctx.fillText(`${m.s} 조각 → ${so.sol} 수용액`, bx + bw / 2, 16);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = go ? C.forest : C.ink3;
    ctx.fillText(same ? "같은 금속 (실험 의미 없음)" : go ? (t < 1 ? "표면에 무언가 생기는 중…" : `${so.s}이(가) 석출됨`) : "변화 없음", bx + bw / 2, by + bh + 18);

    // 결과표
    const gx0 = bx + bw + (narrow ? 34 : 50), gy0 = 40, cw = Math.min((w - gx0 - 10) / n, 46), ch = Math.min((h - gy0 - 30) / n, 40);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("수용액 속 이온", gx0 + cw * n / 2, 14);
    M.forEach((x, j) => { ctx.fillStyle = C.ink2; ctx.fillText(x.ion, gx0 + cw * (j + .5), 32); });
    ctx.textAlign = "right";
    M.forEach((x, i) => { ctx.fillStyle = C.ink2; ctx.fillText(x.s, gx0 - 6, gy0 + ch * (i + .5) + 4); });
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3; ctx.fillText("금속", gx0 - 6, 32);
    cells = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = gx0 + cw * j, y = gy0 + ch * i;
      cells.push({ x, y, w: cw, h: ch, i, j });
      ctx.fillStyle = i === j ? "#e6e7df" : C.card; ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2);
      ctx.strokeStyle = i === cur.m && j === cur.s ? C.ink : C.rule; ctx.lineWidth = i === cur.m && j === cur.s ? 2 : 1; ctx.strokeRect(x + 1.5, y + 1.5, cw - 3, ch - 3);
      const r = res[i][j];
      ctx.textAlign = "center"; ctx.font = `700 14px ${F.sans}`;
      if (i === j) { ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`; ctx.fillText("—", x + cw / 2, y + ch / 2 + 4); }
      else if (r === true) { ctx.fillStyle = C.forest; ctx.fillText("반응", x + cw / 2, y + ch / 2 + 5); }
      else if (r === false) { ctx.fillStyle = C.ink3; ctx.fillText("×", x + cw / 2, y + ch / 2 + 5); }
    }
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText("칸을 눌러도 실험할 수 있습니다", gx0, gy0 + ch * n + 18);
  }

  function update() {
    mSel.value = cur.m; sSel.value = cur.s;
    const { gt, cnt } = known();
    nKnown.textContent = `${cnt} / 10`;
    // 모든 쌍이 정해지면 순서를 보여 준다
    if (cnt === 10) {
      const ord = [...M.keys()].sort((a, b) => gt[a][b] ? -1 : 1);
      nOrder.textContent = ord.map((k) => M[k].s).join(" > ");
      nOrder.classList.add("good");
    } else { nOrder.textContent = "아직 모름"; nOrder.classList.remove("good"); }
    const same = cur.m === cur.s, go = !same && react(cur.m, cur.s), m = M[cur.m], so = M[cur.s];
    nRes.textContent = res[cur.m][cur.s] === null && !same ? "—" : same ? "—" : go ? "반응함" : "반응 없음";
    msg.innerHTML = same ? "같은 금속끼리는 전자를 주고받을 이유가 없습니다."
      : res[cur.m][cur.s] === null ? "‘넣기’를 눌러 실험해 보세요."
      : go ? `${m.s}이(가) 전자를 내주고 ${m.ion}이 되어 녹아 나가고, ${so.ion}이 전자를 받아 ${so.s}로 석출됩니다. <b>${m.s}의 반응성이 ${so.s}보다 큽니다.</b>`
      : `${so.ion}이 ${m.s}에게서 전자를 빼앗지 못합니다. <b>${so.s}의 반응성이 ${m.s}보다 큽니다.</b>`;
    draw();
  }

  function test() {
    if (cur.m !== cur.s) res[cur.m][cur.s] = react(cur.m, cur.s);
    cur.t = NM.reduce ? 1 : 0; update();
  }
  mSel.addEventListener("change", () => { cur.m = +mSel.value; cur.t = 0; update(); });
  sSel.addEventListener("change", () => { cur.s = +sSel.value; cur.t = 0; update(); });
  goB.addEventListener("click", test);
  clrB.addEventListener("click", () => { res.forEach((r) => r.fill(null)); cur.t = 0; update(); });
  cv.addEventListener("click", (e) => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const c = cells.find((c) => x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h);
    if (c) { cur.m = c.i; cur.s = c.j; test(); }
  });
  res[1][3] = true; // 첫 예: 아연을 황산 구리(Ⅱ) 수용액에
  update();
  loop(cv, (dt) => { if (cur.t >= 1 || res[cur.m][cur.s] === null) return; cur.t = clamp(cur.t + dt / 2.5, 0, 1); draw(); });
})();
