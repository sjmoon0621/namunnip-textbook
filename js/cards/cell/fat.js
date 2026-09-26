/* 카드: 버터는 굳어 있는데 올리브유는 왜 흐를까? — 지방산 사슬 모양(시스 꺾임)과 녹는점(실측값), 온도에 따른 고체/액체 모식 */
(() => {
  const root = document.getElementById("card-cell-fat");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".temp"), oT = $(".t-out");
  const nMp = $(".n-mp"), nState = $(".n-state"), nFood = $(".n-food");
  // 녹는점(°C): 순수 지방산 실측 대략값
  const FA = {
    "12":   { name: "라우르산", n: 12, db: [], mp: 44, food: "코코넛유" },
    "16":   { name: "팔미트산", n: 16, db: [], mp: 63, food: "팜유·버터" },
    "18":   { name: "스테아르산", n: 18, db: [], mp: 69, food: "소기름·코코아 버터" },
    "18t":  { name: "엘라이드산", n: 18, db: [9], trans: true, mp: 45, food: "부분 경화유" },
    "18c":  { name: "올레산", n: 18, db: [9], mp: 13, food: "올리브유" },
    "18c2": { name: "리놀레산", n: 18, db: [9, 12], mp: -5, food: "콩기름·해바라기씨유" },
    "18c3": { name: "α-리놀렌산", n: 18, db: [9, 12, 15], mp: -11, food: "들기름·아마씨유" },
  };
  let key = "16", t = 0;

  // 탄소 사슬 좌표(단위 길이). C1 = 카복실 탄소
  function chain(fa) {
    const pts = []; let x = 0, y = 0, hd = 0;
    for (let i = 1; i <= fa.n; i++) {
      const off = (i % 2 ? 0 : 0.5);
      pts.push([x - Math.sin(hd) * off, y + Math.cos(hd) * off]);
      x += Math.cos(hd) * 0.87; y += Math.sin(hd) * 0.87;
      if (!fa.trans && fa.db.includes(i)) hd -= 0.5;   // 시스 이중 결합에서 꺾임
    }
    // 양 끝을 잇는 선이 수평이 되도록 돌린다
    const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1], a = -Math.atan2(by - ay, bx - ax);
    return pts.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]);
  }
  function bbox(p) { const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]); return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; }

  function drawChain(ctx, fa, pts, ox, oy, s, rot, col, lw, detail) {
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const P = pts.map(([x, y]) => [ox + (x * cs - y * sn) * s, oy + (x * sn + y * cs) * s]);
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = "round";
    ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    fa.db.forEach((d) => {   // 이중 결합: C d–C(d+1)
      const [ax, ay] = P[d - 1], [bx, by] = P[d];
      const L = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / L, ny = (bx - ax) / L;
      const k = detail ? 5 : 2.5;
      ctx.strokeStyle = C.warn; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(ax + nx * k, ay + ny * k); ctx.lineTo(bx + nx * k, by + ny * k); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.strokeStyle = col;
    });
    if (detail) {
      ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillText("HOOC", P[0][0] - 5, P[0][1] + 4);
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`; ctx.textAlign = "center";
      P.forEach(([x, y], i) => { if ((i + 1) % 3 === 0 || i === P.length - 1) ctx.fillText(i + 1, x, y + (i % 2 ? 16 : -8)); });
    }
    return P;
  }

  // 흐를 때 분자 위치용 고정 난수
  let seed = 1; const rnd = () => { const x = Math.sin(seed++ * 127.1) * 43758.5453; return x - Math.floor(x); };
  const jit = Array.from({ length: 12 }, () => [rnd(), rnd(), rnd(), rnd() * 6.28]);

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const fa = FA[key], T = +sT.value, solid = T < fa.mp;
    const pts = chain(fa), bb = bbox(pts);
    // 위: 확대한 한 분자
    ctx.fillStyle = C.ink2; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`${fa.name} (C${fa.n}:${fa.db.length}${fa.db.length ? (fa.trans ? " 트랜스" : " 시스") : ""})`, 12, 20);
    const Ha = h * 0.36 - 50, bw0 = bb.x1 - bb.x0, bh0 = Math.max(1, bb.y1 - bb.y0);
    const s1 = Math.min((w - 90) / bw0, Ha / bh0, 30);
    drawChain(ctx, fa, pts, 58 - bb.x0 * s1, 42 - bb.y0 * s1 + (Ha - bh0 * s1) / 2, s1, 0, C.ink, 2.2, true);
    if (fa.db.length) { ctx.fillStyle = C.warn; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(fa.trans ? "트랜스 이중 결합: 사슬이 곧다" : "시스 이중 결합: 그 자리에서 꺾인다", w - 12, 20); }
    // 아래: 분자 여러 개
    const bx = 12, by = h * 0.4, bw = w - 24, bh = h * 0.56;
    ctx.fillStyle = solid ? "#f1efe4" : "#eef3f6"; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = C.rule; ctx.strokeRect(bx + .5, by + .5, bw, bh);
    const s2 = Math.min(bw * 0.8 / (bb.x1 - bb.x0 + 1), 8);
    const molH = (bb.y1 - bb.y0) * s2;
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
    const col = solid ? C.ink2 : "#3f6fa3";
    if (solid) {
      const gap = molH + 4, molW = (bb.x1 - bb.x0) * s2 + 14;
      const rows = Math.max(1, Math.floor((bh - 30) / gap)), cols = Math.max(1, Math.floor((bw - 20) / molW)), n = rows * cols;
      for (let c = 0; c < cols; c++) for (let i = 0; i < rows; i++) drawChain(ctx, fa, pts, bx + 12 + c * molW - bb.x0 * s2, by + 12 - bb.y0 * s2 + i * gap, s2, 0, col, 1.4, false);
      ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText(`분자 ${n}개가 차곡차곡 쌓임`, bx + bw - 8, by + bh - 8);
    } else {
      jit.forEach(([a, b, c, r], i) => {
        const x = bx + 40 + ((i % 4) + a * 0.8) / 4 * (bw - 80) + Math.sin(t * 1.3 + i) * 6, y = by + 26 + ((Math.floor(i / 4)) + b * 0.8) / 3 * (bh - 52) + Math.cos(t * 1.1 + i * 2) * 6;
        const rot = r + Math.sin(t * 0.7 + i) * 0.4;
        const cx = (bb.x0 + bb.x1) / 2, cy = (bb.y0 + bb.y1) / 2;
        const cs = Math.cos(rot), sn = Math.sin(rot);
        drawChain(ctx, fa, pts, x - (cx * cs - cy * sn) * s2 * 0.62, y - (cx * sn + cy * cs) * s2 * 0.62, s2 * 0.62, rot, col, 1.4, false);
      });
    }
    ctx.restore();
    ctx.fillStyle = solid ? C.ink : "#3f6fa3"; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(solid ? `${T} °C · 녹는점(${fa.mp} °C)보다 낮음 → 고체` : `${T} °C · 녹는점(${fa.mp} °C)보다 높음 → 액체`, bx + 8, by + bh - 8);
  }

  function update() {
    const fa = FA[key], T = +sT.value;
    oT.textContent = T;
    nMp.textContent = `${fa.mp} °C`;
    nState.textContent = T < fa.mp ? "고체" : "액체";
    nState.classList.toggle("good", T >= fa.mp);
    nFood.textContent = fa.food;
    root.querySelectorAll("[data-fa]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.fa === key ? "true" : "false"));
    draw();
  }
  root.querySelectorAll("[data-fa]").forEach((b) => b.addEventListener("click", () => { key = b.dataset.fa; update(); }));
  sT.addEventListener("input", update);
  loop(cv, (dt) => { if (+sT.value < FA[key].mp) return; t += dt; draw(); });
  update();
})();
