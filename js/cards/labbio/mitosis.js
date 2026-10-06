/* 카드: 양파 뿌리 끝 세포를 세어서 분열 단계마다 걸리는 시간을 알 수 있을까? — 가상 현미경, 단계 판정, 분열 지수, 감수 분열(동조) 비교 */
(() => {
  const root = document.getElementById("card-labbio-mitosis");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 단계 정의. p는 생장점에서의 비율(교육용 모식값) */
  const MIT = [
    { k: "I", n: "간기", p: 0.855, hint: "핵막이 뚜렷하고 핵 속에 인이 보입니다. 염색체는 실처럼 풀려 있어 따로 보이지 않습니다." },
    { k: "P", n: "전기", p: 0.075, hint: "핵 안에서 염색체가 실 모양으로 응축되어 보이기 시작합니다. 인과 핵막은 점점 사라집니다." },
    { k: "M", n: "중기", p: 0.028, hint: "염색체가 세포 가운데(적도판)에 한 줄로 늘어서 있습니다." },
    { k: "A", n: "후기", p: 0.017, hint: "염색 분체가 갈라져 두 무리가 양 끝(극)으로 끌려갑니다." },
    { k: "T", n: "말기", p: 0.025, hint: "양 끝에 딸핵 두 개가 생기고 가운데에 세포판이 만들어집니다." },
  ];
  const MEI = [
    { k: "P1", n: "전기 Ⅰ", hint: "긴 실 모양 염색체가 상동끼리 짝을 짓습니다(2가 염색체). 핵이 큽니다." },
    { k: "M1", n: "중기 Ⅰ", hint: "2가 염색체(짝 지은 상동 염색체)가 적도판에 늘어서 있습니다. 덩어리가 둘씩 붙어 보입니다." },
    { k: "A1", n: "후기 Ⅰ", hint: "상동 염색체가 갈라져 양 극으로 이동합니다. 아직 세포 하나입니다." },
    { k: "T1", n: "말기 Ⅰ", hint: "세포 하나 안에 핵 두 개, 또는 막 나뉜 두 세포(2분자)입니다." },
    { k: "M2", n: "중기 Ⅱ", hint: "나뉜 두 세포에서 각각 염색체가 적도판에 늘어섭니다." },
    { k: "A2", n: "후기 Ⅱ", hint: "두 세포 각각에서 염색 분체가 갈라져 모두 네 무리가 됩니다." },
    { k: "Q", n: "사분자", hint: "세포 네 개가 한 덩어리로 붙어 있습니다. 각각 꽃가루가 됩니다." },
  ];
  /* 꽃봉오리 크기(1~5)에 따라 우세한 감수 분열 단계 (모식: 꽃밥 안 세포는 거의 동조) */
  const BUD = {
    1: { P1: 0.92, M1: 0.08 },
    2: { P1: 0.25, M1: 0.45, A1: 0.18, T1: 0.12 },
    3: { A1: 0.1, T1: 0.45, M2: 0.3, A2: 0.15 },
    4: { M2: 0.15, A2: 0.25, Q: 0.6 },
    5: { Q: 1 },
  };

  let mode = "mit", region = "tip", bud = 3, cells = [], sel = -1, seed = 7, judged = 0, right = 0;
  const STAIN = "#8b2350", CYTO = "#f2dbe2", WALL = "#b88a98";

  /* 재현 가능한 난수 (시야마다 seed 고정) */
  function rng(s) { return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function pick(r, dist) { let u = r(), acc = 0; for (const [k, p] of dist) { acc += p; if (u < acc) return k; } return dist[dist.length - 1][0]; }

  const tMit = L.table($(".lb-t-mit"), [{ key: "s", label: "부위" }, ...MIT.map((s) => ({ key: s.k, label: s.n })), { key: "x", label: "못 셈" }, { key: "n", label: "합계" }], () => drawPlot());
  const tMei = L.table($(".lb-t-mei"), [{ key: "s", label: "꽃봉오리" }, ...MEI.map((s) => ({ key: s.k, label: s.n })), { key: "n", label: "합계" }], () => drawPlot());

  const fv = fit($(".lb-field"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());

  function makeField() {
    const r = rng(seed);
    cells = []; sel = -1;
    const { w } = fv.size; if (!w) return;
    const R = w / 2 - 4, cx = w / 2, cy = w / 2;
    const inside = (x, y, m) => Math.hypot(x - cx, y - cy) < R - m;
    if (mode === "mit") {
      const cw = w / 10, ch = region === "tip" ? w / 11 : w / 4.2;
      const dist = region === "tip" ? MIT.map((s) => [s.k, s.p]) : [["I", 0.997], ["P", 0.003]];
      const nomac = $(".nomac").checked;
      for (let row = -1; row * ch < w + ch; row++) {
        const off = (row % 2) * cw * 0.35;
        for (let col = -1; col * cw < w + cw; col++) {
          const x = col * cw + off + (r() - 0.5) * 2, y = row * ch + (r() - 0.5) * 2;
          const hw = cw * (0.92 + 0.08 * r()), hh = ch * (0.9 + 0.1 * r());
          if (!inside(x + hw / 2, y + hh / 2, 6)) continue;
          cells.push({ x, y, w: hw, h: hh, st: pick(r, dist), a: r() * 6.28, j: r(), hidden: nomac && r() < 0.3 });
        }
      }
    } else {
      const dist = Object.entries(BUD[bud]);
      const rad = w / 19.5;
      for (let row = 0; row < 9; row++) for (let col = 0; col < 9; col++) {
        const x = (col + 0.5 + (row % 2) * 0.5) * (w / 8.6) - 4 + (r() - 0.5) * 6, y = (row + 0.6) * (w / 8.9) + (r() - 0.5) * 6;
        if (!inside(x, y, rad + 2)) continue;
        cells.push({ x: x - rad, y: y - rad, w: rad * 2, h: rad * 2, st: pick(r, dist), a: r() * 6.28, j: r(), hidden: false });
      }
    }
  }

  /* 염색체 그리기 도우미 */
  function rod(x, y, len, ang, lw) { ctx().lineWidth = lw; ctx().beginPath(); ctx().moveTo(x - Math.cos(ang) * len / 2, y - Math.sin(ang) * len / 2); ctx().lineTo(x + Math.cos(ang) * len / 2, y + Math.sin(ang) * len / 2); ctx().stroke(); }
  const ctx = () => fv.ctx;
  function squig(x, y, rad, n, j) {
    const c = ctx(); c.lineWidth = 1.3;
    for (let i = 0; i < n; i++) {
      const a0 = j * 9 + i * 2.1; c.beginPath();
      for (let s = 0; s <= 8; s++) { const a = a0 + s * 0.55, rr = rad * (0.25 + 0.6 * Math.abs(Math.sin(a * 1.7 + i))); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; s ? c.lineTo(px, py) : c.moveTo(px, py); }
      c.stroke();
    }
  }
  function plate(x, y, span, horiz, pairs) {
    const c = ctx(); c.strokeStyle = STAIN; c.fillStyle = STAIN;
    const n = 6;
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1) - 0.5) * span;
      const px = horiz ? x + t : x, py = horiz ? y : y + t;
      if (pairs) { const dx = horiz ? 0 : 2.2, dy = horiz ? 2.2 : 0; c.beginPath(); c.arc(px - dx, py - dy, 1.9, 0, 6.3); c.arc(px + dx, py + dy, 1.9, 0, 6.3); c.fill(); }
      else rod(px, py, 5, horiz ? Math.PI / 2 : 0, 2);
    }
  }
  function group(x, y, span, horiz, vee) {
    const c = ctx(); c.strokeStyle = STAIN;
    for (let i = 0; i < 5; i++) {
      const t = (i / 4 - 0.5) * span; const px = horiz ? x + t : x, py = horiz ? y : y + t;
      c.lineWidth = 1.8; c.beginPath();
      if (horiz) { c.moveTo(px - 1.6, py + vee * 3); c.lineTo(px, py); c.lineTo(px + 1.6, py + vee * 3); }
      else { c.moveTo(px + vee * 3, py - 1.6); c.lineTo(px, py); c.lineTo(px + vee * 3, py + 1.6); }
      c.stroke();
    }
  }
  function nucleus(x, y, rad, nucleolus) {
    const c = ctx();
    c.fillStyle = "rgba(160,60,100,.35)"; c.strokeStyle = "rgba(139,35,80,.75)"; c.lineWidth = 1;
    c.beginPath(); c.arc(x, y, rad, 0, 6.3); c.fill(); c.stroke();
    if (nucleolus) { c.fillStyle = STAIN; c.beginPath(); c.arc(x + rad * 0.2, y - rad * 0.15, rad * 0.28, 0, 6.3); c.fill(); }
  }

  function drawCell(cl, i) {
    const c = ctx(), { x, y, w, h } = cl, mx = x + w / 2, my = y + h / 2, m = Math.min(w, h);
    if (mode === "mit") {
      c.fillStyle = CYTO; c.fillRect(x + 1, y + 1, w - 2, h - 2);
      c.strokeStyle = WALL; c.lineWidth = 1; c.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
      if (region === "elong") { c.fillStyle = "rgba(255,255,255,.55)"; c.fillRect(x + 4, y + 5, w - 8, h * 0.55); }
      const ny = region === "elong" ? y + h * 0.78 : my;
      switch (cl.st) {
        case "I": nucleus(mx + (cl.j - 0.5) * 3, ny, m * 0.24, true); break;
        case "P": nucleus(mx, my, m * 0.3, cl.j > 0.6); c.strokeStyle = STAIN; squig(mx, my, m * 0.3, 4, cl.j); break;
        case "M": c.fillStyle = "rgba(160,60,100,.12)"; c.fillRect(x + 3, my - h * 0.3, w - 6, h * 0.6); plate(mx, my, w * 0.6, true, false); break;
        case "A": group(mx, my - h * 0.27, w * 0.55, true, 1); group(mx, my + h * 0.27, w * 0.55, true, -1); break;
        case "T": nucleus(mx, y + h * 0.24, m * 0.17, false); nucleus(mx, y + h * 0.76, m * 0.17, false); c.strokeStyle = "rgba(139,35,80,.5)"; c.setLineDash([2, 2]); c.beginPath(); c.moveTo(x + 4, my); c.lineTo(x + w - 4, my); c.stroke(); c.setLineDash([]); break;
      }
    } else {
      const r = w / 2;
      const ball = (bx, by, br) => { c.fillStyle = CYTO; c.strokeStyle = WALL; c.lineWidth = 1; c.beginPath(); c.arc(bx, by, br, 0, 6.3); c.fill(); c.stroke(); };
      const ax = Math.cos(cl.a), ay = Math.sin(cl.a);
      switch (cl.st) {
        case "P1": ball(mx, my, r); nucleus(mx, my, r * 0.62, false); c.strokeStyle = STAIN; squig(mx, my, r * 0.6, 5, cl.j); break;
        case "M1": ball(mx, my, r); c.save(); c.translate(mx, my); c.rotate(cl.a); plate(0, 0, r * 1.1, false, true); c.restore(); break;
        case "A1": ball(mx, my, r); c.save(); c.translate(mx, my); c.rotate(cl.a); group(-r * 0.45, 0, r * 0.9, false, -1); group(r * 0.45, 0, r * 0.9, false, 1); c.restore(); break;
        case "T1": ball(mx - ax * r * 0.45, my - ay * r * 0.45, r * 0.62); ball(mx + ax * r * 0.45, my + ay * r * 0.45, r * 0.62); nucleus(mx - ax * r * 0.45, my - ay * r * 0.45, r * 0.3, false); nucleus(mx + ax * r * 0.45, my + ay * r * 0.45, r * 0.3, false); break;
        case "M2": case "A2":
          for (const sg of [-1, 1]) {
            const bx = mx + sg * ax * r * 0.45, by = my + sg * ay * r * 0.45;
            ball(bx, by, r * 0.62); c.save(); c.translate(bx, by); c.rotate(cl.a + Math.PI / 2);
            if (cl.st === "M2") plate(0, 0, r * 0.7, false, false); else { group(-r * 0.28, 0, r * 0.55, false, -1); group(r * 0.28, 0, r * 0.55, false, 1); }
            c.restore();
          }
          break;
        case "Q":
          for (let q = 0; q < 4; q++) { const a = cl.a + q * Math.PI / 2, bx = mx + Math.cos(a) * r * 0.42, by = my + Math.sin(a) * r * 0.42; ball(bx, by, r * 0.5); nucleus(bx, by, r * 0.2, false); }
          break;
      }
    }
    if (cl.hidden) { c.fillStyle = "rgba(200,150,170,.85)"; c.fillRect(x - 3, y - 2, w + 6, h + 4); c.strokeStyle = WALL; c.strokeRect(x + 3, y + 2, w - 2, h - 4); }
    if (i === sel) { c.strokeStyle = C.amber; c.lineWidth = 2.5; c.strokeRect(x - 1, y - 1, w + 2, h + 2); }
    if (cl.mark) { c.fillStyle = cl.mark === "ok" ? C.forest : C.warn; c.beginPath(); c.arc(x + w - 5, y + 5, 3.2, 0, 6.3); c.fill(); }
  }

  function draw() {
    const { ctx: c, size } = fv, { w } = size; if (!w) return;
    if (!cells.length) makeField();
    c.clearRect(0, 0, w, w);
    const R = w / 2 - 4;
    c.fillStyle = C.night; c.fillRect(0, 0, w, w);
    c.save(); c.beginPath(); c.arc(w / 2, w / 2, R, 0, 6.3); c.clip();
    c.fillStyle = "#f7eef0"; c.fillRect(0, 0, w, w);
    cells.forEach((cl, i) => drawCell(cl, i));
    const g = c.createRadialGradient(w / 2, w / 2, R * 0.6, w / 2, w / 2, R);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.28)"); c.fillStyle = g; c.fillRect(0, 0, w, w);
    c.restore();
    c.fillStyle = "#ddd"; c.font = `11px ${F.mono}`; c.textAlign = "left";
    c.fillText("×400", 8, w - 10);
    c.textAlign = "right"; c.fillText(mode === "mit" ? (region === "tip" ? "생장점" : "신장 부위") : `꽃봉오리 ${bud}`, w - 8, w - 10);
    c.textAlign = "left"; c.fillText(`시야 ${seed - 6}`, 8, 16);
  }

  /* 단계별 비율 막대 + 추정 시간 */
  function drawPlot() {
    const { ctx: c, size } = pl, { w, h } = size; if (!w) return;
    c.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 22, w: w - 58, h: h - 68 };
    if (mode === "mit") {
      const rows = tMit.rows.filter((r) => r.s === "생장점");
      const tot = MIT.map((s) => rows.reduce((a, r) => a + r[s.k], 0)), N = tot.reduce((a, b) => a + b, 0);
      const T = +$(".cyc").value;
      const pct = tot.map((v) => (N ? v / N * 100 : 0));
      const ymax = 100;
      const Y = (v) => box.y0 + box.h - v / ymax * box.h;
      NM.axes(c, { ...box, X: (v) => v, Y, xt: [], yt: [0, 25, 50, 75, 100].map((v) => [v, String(v)]), ylabel: "비율 (%) · 생장점 기록 합계" });
      const bw = box.w / MIT.length;
      MIT.forEach((s, i) => {
        const x = box.x0 + i * bw + bw * 0.18, bh = pct[i] / ymax * box.h;
        c.fillStyle = i ? C.leaf : C.sprout; c.fillRect(x, Y(pct[i]), bw * 0.64, bh);
        c.fillStyle = C.ink; c.font = `600 12px ${F.sans}`; c.textAlign = "center"; c.fillText(s.n, x + bw * 0.32, box.y0 + box.h + 15);
        c.font = `10.5px ${F.mono}`; c.fillStyle = C.ink2;
        if (N) { c.fillText(`${pct[i].toFixed(1)}%`, x + bw * 0.32, Y(pct[i]) - 16); c.fillText(`${(pct[i] / 100 * T * 60).toFixed(0)}분`, x + bw * 0.32, Y(pct[i]) - 4); }
      });
      c.textAlign = "left"; c.font = `11px ${F.mono}`; c.fillStyle = C.ink2;
      const mi = N ? (1 - tot[0] / N) * 100 : NaN;
      c.fillText(N ? `세포 ${N}개 · 분열 지수 ${mi.toFixed(1)}% · T = ${T} h 가정` : "생장점 시야를 세어 기록하면 막대가 생깁니다", box.x0, h - 10);
    } else {
      const rows = tMei.rows; const n = Math.max(rows.length, 1);
      const bw = Math.min(46, box.w / n);
      NM.axes(c, { ...box, X: (v) => v, Y: (v) => box.y0 + box.h - v / 100 * box.h, xt: [], yt: [0, 50, 100].map((v) => [v, String(v)]), ylabel: "시야별 단계 구성 (%)" });
      const cols = ["#e8d2dc", "#d7a3b8", "#c07595", "#a64f76", "#8b2350", "#6c1a3e", "#3b7c2a"];
      rows.forEach((r, i) => {
        let acc = 0; const x = box.x0 + i * bw + 3;
        MEI.forEach((s, k) => { const v = r[s.k] / r.n * 100; c.fillStyle = cols[k]; c.fillRect(x, box.y0 + box.h - (acc + v) / 100 * box.h, bw - 6, v / 100 * box.h); acc += v; });
        c.fillStyle = C.ink2; c.font = `10px ${F.mono}`; c.textAlign = "center"; c.fillText(r.s, x + bw / 2 - 3, box.y0 + box.h + 13);
      });
      c.textAlign = "left"; c.font = `10.5px ${F.sans}`;
      let lx = box.x0;
      MEI.forEach((s, k) => { if (lx > w - 40) return; c.fillStyle = cols[k]; c.fillRect(lx, h - 18, 9, 9); c.fillStyle = C.ink2; c.fillText(s.n, lx + 12, h - 10); lx += c.measureText(s.n).width + 22; });
    }
  }

  function stagesUI() {
    const list = mode === "mit" ? MIT : MEI;
    $(".lb-stages").innerHTML = list.map((s) => `<button class="chip" data-st="${s.k}" aria-pressed="false">${s.n}</button>`).join("");
  }
  function count() {
    const r = rng(seed * 31 + 5), noisy = $(".nomac").checked, bias = $(".bias").checked;
    if (mode === "mit") {
      const row = { s: region === "tip" ? "생장점" : "신장 부위", x: 0, n: 0 };
      MIT.forEach((s) => (row[s.k] = 0));
      cells.forEach((cl) => {
        if (cl.hidden) { row.x++; return; }
        let st = cl.st;
        if (bias && st === "P" && cl.j < 0.5) st = "I";
        if (noisy && st !== "I" && r() < 0.25) st = MIT[Math.max(0, MIT.findIndex((s) => s.k === st) + (r() < 0.5 ? -1 : 1)) % MIT.length].k;
        row[st]++; row.n++;
      });
      tMit.add(row);
    } else {
      const row = { s: String(bud), n: cells.length };
      MEI.forEach((s) => (row[s.k] = 0));
      cells.forEach((cl) => row[cl.st]++);
      tMei.add(row);
    }
  }
  function newField() { seed++; cells = []; makeField(); draw(); $(".lb-sel").textContent = "시야의 세포를 하나 눌러 단계를 판정해 보세요."; }
  function setMode(m) {
    mode = m;
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
    $(".lb-region").classList.toggle("lb-hide", m !== "mit");
    $(".lb-bud").classList.toggle("lb-hide", m === "mit");
    $(".lb-t-mit").classList.toggle("lb-hide", m !== "mit");
    $(".lb-t-mei").classList.toggle("lb-hide", m === "mit");
    $(".lb-cyc-l").classList.toggle("lb-hide", m !== "mit");
    $(".lb-row").classList.toggle("lb-hide", m !== "mit");
    $(".cyc").classList.toggle("lb-hide", m !== "mit");
    stagesUI(); newField(); drawPlot();
  }

  $(".lb-field").addEventListener("click", (e) => {
    const b = e.currentTarget.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const i = cells.findIndex((cl) => x >= cl.x && x <= cl.x + cl.w && y >= cl.y && y <= cl.y + cl.h);
    if (i < 0) return;
    sel = i; draw();
    $(".lb-sel").textContent = cells[i].hidden ? "세포가 겹쳐 있어 판정할 수 없습니다. 해리를 해야 세포가 떨어집니다." : `세포 ${i + 1}: 아래에서 단계를 고르세요.`;
    root.querySelectorAll("[data-st]").forEach((x2) => x2.setAttribute("aria-pressed", "false"));
  });
  $(".lb-stages").addEventListener("click", (e) => {
    const b = e.target.closest("[data-st]"); if (!b || sel < 0 || cells[sel].hidden) return;
    const cl = cells[sel], list = mode === "mit" ? MIT : MEI, ans = list.find((s) => s.k === cl.st);
    root.querySelectorAll("[data-st]").forEach((x2) => x2.setAttribute("aria-pressed", String(x2 === b)));
    const ok = b.dataset.st === cl.st;
    if (!cl.mark) { judged++; if (ok) right++; }
    cl.mark = ok ? "ok" : "no";
    $(".lb-sel").textContent = ok ? `맞습니다 — ${ans.n}. ${ans.hint}` : `다시 보세요. 이 세포는 ${ans.n}입니다. ${ans.hint}`;
    $(".lb-score").textContent = `판정 ${judged}개 중 ${right}개 일치`;
    draw();
  });
  $(".lb-mode").addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (b) setMode(b.dataset.m); });
  $(".lb-region").addEventListener("click", (e) => {
    const b = e.target.closest("[data-r]"); if (!b) return; region = b.dataset.r;
    root.querySelectorAll("[data-r]").forEach((x2) => x2.setAttribute("aria-pressed", String(x2 === b))); newField();
  });
  $(".bud").addEventListener("input", (e) => { bud = +e.target.value; $(".bud-out").textContent = bud; newField(); });
  $(".nomac").addEventListener("change", () => { cells = []; makeField(); draw(); });
  $(".cyc").addEventListener("input", (e) => { $(".cyc-out").textContent = e.target.value; drawPlot(); });
  $(".lb-new").addEventListener("click", newField);
  $(".lb-count").addEventListener("click", count);
  $(".lb-clear").addEventListener("click", () => (mode === "mit" ? tMit : tMei).clear());
  stagesUI();

  if (L.demo) {
    const once = () => {
      if (!fv.size.w) { requestAnimationFrame(once); return; }
      for (let k = 0; k < 5; k++) { newField(); count(); }
      region = "elong"; newField(); count();
      region = "tip"; newField();
      const m = cells.findIndex((cl) => cl.st === "M");
      if (m >= 0) { sel = m; cells[m].mark = "ok"; judged = 1; right = 1; $(".lb-sel").textContent = `맞습니다 — 중기. ${MIT[2].hint}`; $(".lb-score").textContent = "판정 1개 중 1개 일치"; }
      draw(); drawPlot();
    };
    once();
  }
})();
