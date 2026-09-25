/* 카드: CO₂는 극성 결합이 있는데 왜 무극성 분자일까? — 결합 쌍극자의 벡터 합 */
(() => {
  const root = document.getElementById("card-chem-dipole");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sA = $(".ang"), oA = $(".ang-out");
  const dNet = $(".v-net"), dPol = $(".v-pol"), dReal = $(".v-real"), msg = $(".dip-msg");

  const EN = { H: 2.20, C: 2.55, O: 3.44, S: 2.58 };
  // 가운데 원자, 양 끝 원자, 실제 결합각, 실측 쌍극자 모멘트(D), 결합 표시
  const MOLS = {
    co2: { c: "C", e: ["O", "O"], ang: 180, mu: 0, bond: "=", name: "CO₂" },
    ocs: { c: "C", e: ["O", "S"], ang: 180, mu: 0.71, bond: "=", name: "OCS" },
    h2o: { c: "O", e: ["H", "H"], ang: 104.5, mu: 1.85, bond: "–", name: "H₂O" },
  };
  const COL = { H: "#f4f4f0", C: "#4a4a4f", O: C.apple, S: "#e0b02a" };
  let mk = "co2";

  // 결합 쌍극자: 크기는 전기 음성도 차이에 비례(모식), 방향은 전기 음성도가 큰 원자 쪽
  function bonds(ang) {
    const m = MOLS[mk], t = ang * Math.PI / 180;
    const dirs = [[-Math.sin(t / 2), Math.cos(t / 2)], [Math.sin(t / 2), Math.cos(t / 2)]]; // 가운데 → 끝 (아래로 벌어짐)
    return m.e.map((e, i) => {
      const k = EN[e] - EN[m.c];          // +면 끝 원자 쪽으로
      return { e, dir: dirs[i], v: [dirs[i][0] * k, dirs[i][1] * k], k };
    });
  }
  const net = (ang) => { const b = bonds(ang); return [b[0].v[0] + b[1].v[0], b[0].v[1] + b[1].v[1]]; };
  const unit = () => Math.max(...bonds(180).map((b) => Math.abs(b.k)));

  const { ctx, size } = fit(cv, () => draw());

  function arrow(x1, y1, x2, y2, col, wd) {
    const L = Math.hypot(x2 - x1, y2 - y1); if (L < 4) return;
    const ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wd;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * 8, y2 - uy * 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - ux * 10 - uy * 5, y2 - uy * 10 + ux * 5); ctx.lineTo(x2 - ux * 10 + uy * 5, y2 - uy * 10 - ux * 5); ctx.closePath(); ctx.fill();
    // 꼬리의 + 표시 (δ+ 쪽)
    ctx.beginPath(); ctx.moveTo(x1 + uy * 5, y1 - ux * 5); ctx.lineTo(x1 - uy * 5, y1 + ux * 5); ctx.stroke();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = MOLS[mk], ang = +sA.value, small = w < 520, b = bonds(ang), u = unit();
    // ── 왼쪽: 분자와 결합 쌍극자
    const lw = w * 0.52, cx = lw / 2, cy = h * 0.32, L = Math.min(lw * 0.3, h * 0.3), R = Math.min(22, L * 0.34);
    const ends = b.map((q) => [cx + q.dir[0] * L, cy + q.dir[1] * L]);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2;
    for (const [x, y] of ends) {
      if (m.bond === "=") { const nx = -(y - cy) / L * 3, ny = (x - cx) / L * 3; ctx.beginPath(); ctx.moveTo(cx + nx, cy + ny); ctx.lineTo(x + nx, y + ny); ctx.moveTo(cx - nx, cy - ny); ctx.lineTo(x - nx, y - ny); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); }
    }
    const atom = (e, x, y) => { ctx.beginPath(); ctx.arc(x, y, e === "H" ? R * 0.7 : R, 0, Math.PI * 2); ctx.fillStyle = COL[e]; ctx.fill(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = e === "C" || e === "O" ? "#fff" : C.ink; ctx.font = `600 ${small ? 11 : 13}px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(e, x, y + 4.5); };
    atom(m.c, cx, cy); b.forEach((q, i) => atom(q.e, ends[i][0], ends[i][1]));
    // 결합 쌍극자 화살표 (결합 옆에 나란히)
    const sc = L * 0.6 / u, off = R + 12;
    b.forEach((q, i) => {
      if (Math.abs(q.k) < 0.05) return;
      const [ex, ey] = ends[i], nx = -q.dir[1] * (i ? -1 : 1) * off, ny = q.dir[0] * (i ? -1 : 1) * off;
      const mx = (cx + ex) / 2 + nx, my = (cy + ey) / 2 + ny, len = Math.abs(q.k) * sc, s = Math.sign(q.k);
      arrow(mx - q.dir[0] * len / 2 * s, my - q.dir[1] * len / 2 * s, mx + q.dir[0] * len / 2 * s, my + q.dir[1] * len / 2 * s, "#3f6fb5", 1.8);
    });
    // 합성 쌍극자
    const n = net(ang), nl = Math.hypot(n[0], n[1]);
    const oy = cy + L + 44;
    ctx.font = `${small ? 10 : 11}px ${F.mono}`; ctx.textAlign = "center";
    if (nl * sc > 4) { arrow(cx - n[0] * sc / 2, oy - n[1] * sc / 2, cx + n[0] * sc / 2, oy + n[1] * sc / 2, C.warn, 3); ctx.fillStyle = C.warn; ctx.fillText("합친 쌍극자", cx, Math.min(h - 8, oy + Math.abs(n[1]) * sc / 2 + 18)); }
    else { ctx.fillStyle = C.forest; ctx.fillText("합친 쌍극자 = 0 (서로 상쇄)", cx, oy + 4); }

    // ── 오른쪽: 결합각에 따른 합친 쌍극자의 크기
    const x0 = lw + (small ? 30 : 40), y0 = 22, pw = w - x0 - 12, ph = h - y0 - 36;
    const X = (a) => x0 + (a - 90) / 90 * pw, Y = (v) => y0 + (1 - v / 1.5) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [[90, "90°"], [120, "120°"], [150, "150°"], [180, "180°"]], yt: [[0, "0"], [0.5, "0.5"], [1, "1"], [1.5, "1.5"]], xlabel: "결합각", ylabel: "합친 쌍극자 (결합 하나 = 1)" });
    ctx.beginPath();
    for (let a = 90; a <= 180; a += 1) { const q = net(a), v = Math.hypot(q[0], q[1]) / u; a === 90 ? ctx.moveTo(X(a), Y(v)) : ctx.lineTo(X(a), Y(v)); }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(m.ang), y0); ctx.lineTo(X(m.ang), y0 + ph); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.font = `${small ? 9.5 : 10.5}px ${F.sans}`; ctx.textAlign = m.ang > 150 ? "right" : "left";
    ctx.fillText(`실제 ${m.name} ${m.ang}°`, X(m.ang) + (m.ang > 150 ? -4 : 4), y0 + 12);
    ctx.beginPath(); ctx.arc(X(ang), Y(nl / u), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  }

  function update() {
    const m = MOLS[mk], ang = +sA.value, n = net(ang), v = Math.hypot(n[0], n[1]) / unit();
    oA.textContent = ang;
    dNet.textContent = `${v.toFixed(2)}배`;
    dPol.textContent = v < 0.02 ? "무극성" : "극성";
    dPol.className = v < 0.02 ? "v-pol good" : "v-pol bad";
    const real = Math.abs(ang - m.ang) < 0.6;
    dReal.textContent = real ? `${m.mu.toFixed(2)} D` : "가상 분자";
    msg.textContent = real
      ? `실제 ${m.name}의 결합각입니다. 오른쪽 그래프의 점선 위치와 같습니다.`
      : `실제 ${m.name}는 ${m.ang}°입니다. 지금 모양은 결합각만 바꾼 가상의 분자입니다.`;
    draw();
  }
  root.querySelectorAll("[data-mol]").forEach((b) => b.addEventListener("click", () => {
    mk = b.dataset.mol; sA.value = MOLS[mk].ang;
    root.querySelectorAll("[data-mol]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  sA.addEventListener("input", update);
  update();
})();
