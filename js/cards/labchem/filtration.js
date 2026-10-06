/* 카드: 무엇을 거르느냐에 따라 여과 장치를 바꿔야 할까? — 자연·감압·고온 여과 비교 (대략값 모형) */
(() => {
  const root = document.getElementById("card-labchem-filtration");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 혼합물: 고체 입자 중간 크기 d50(μm), 크기 분포 폭 sg(로그), 고체량 load(상대), 목표(goal), 뜨거운지 */
  const MX = {
    sand: { name: "모래+소금물", d50: 250, sg: 0.5, load: 1.0, goal: "filtrate", hot: false },
    kno3: { name: "KNO₃ 결정", d50: 400, sg: 0.6, load: 1.5, goal: "solid", hot: false },
    hot: { name: "뜨거운 용액+숯", d50: 30, sg: 0.9, load: 0.3, goal: "filtrate", hot: true },
    baso4: { name: "BaSO₄ 앙금", d50: 4, sg: 0.6, load: 0.6, goal: "solid", hot: false },
  };
  const MD = {
    cone: { name: "원뿔", q: 0.12, wet: 4 },
    flute: { name: "주름", q: 0.30, wet: 4 },
    vac: { name: "감압", q: 2.5, wet: 1 },
    hotf: { name: "고온", q: 0.35, wet: 4 },
  };
  const PK = { 25: 2.5, 11: 1, 2.5: 0.2 };   /* 거름종이 투과 계수 (보통 = 1) */
  let mx = "sand", md = "cone", pore = 11, anim = null, t = 0;

  const erf = (x) => {
    const s = Math.sign(x); x = Math.abs(x);
    const tt = 1 / (1 + 0.3275911 * x);
    return s * (1 - (((((1.061405429 * tt - 1.453152027) * tt) + 1.421413741) * tt - 0.284496736) * tt + 0.254829592) * tt * Math.exp(-x * x));
  };
  const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));

  /* 참 결과 계산 */
  function model() {
    const m = MX[mx], d = MD[md], vac = md === "vac";
    const cut = pore * 0.8 * (vac ? 1.3 : 1);
    const fp = Phi((Math.log(cut) - Math.log(m.d50)) / m.sg);
    let cake = m.load * Math.pow(20 / m.d50, 0.8) * (vac ? 0.6 : 1);
    if (m.d50 < pore && m.d50 > pore / 4) cake += 1.5;   /* 구멍 크기와 비슷한 입자가 종이를 막음 */
    let q = d.q * PK[pore] / (1 + cake);
    if (m.hot && md === "hotf") q *= 1.3;   /* 뜨거운 용액은 점성이 작음 */
    const notes = [];
    let loss = 0;
    if (m.hot && (md === "cone" || md === "flute")) { q /= 1.6; notes.push("용액이 식으며 <b>깔때기와 꼭지에 결정이 생겨</b> 막히고 손실이 납니다."); }
    const time = 50 / q;
    if (m.hot) {
      if (md === "vac") { loss = 25; notes.push("감압으로 뜨거운 용액이 <b>끓으며 식어</b> 플라스크 속에 결정이 생깁니다."); }
      else if (md === "hotf") loss = 2;
      else loss = Math.min(45, 5 + time / 6);
    }
    if (!m.hot && md === "hotf") notes.push("식은 혼합물에는 깔때기를 데울 이유가 없습니다. 주름 여과와 비슷합니다.");
    let rec;
    if (m.goal === "solid") rec = 100 * (1 - fp) - 1.5;
    else rec = 100 - d.wet - loss;
    const ntu = fp * m.load * 300 + (m.hot && md !== "hotf" && md !== "vac" ? 0 : 0);
    if (fp > 0.05) notes.push(`고체 입자의 약 ${Math.round(fp * 100)}%가 <b>종이를 빠져나가</b> 여액이 흐립니다.`);
    if (time > 1200) notes.push("구멍이 막혀 <b>아주 느립니다</b>.");
    if (m.goal === "solid" && md !== "vac" && time < 1200) notes.push("고체가 젖은 채 남아 말리는 데 시간이 더 듭니다.");
    return { time, rec, ntu, notes, fp };
  }
  const goalTxt = () => (MX[mx].goal === "solid" ? "목표: 거름종이 위 고체" : "목표: 여액(녹은 성분)");

  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "x", label: "혼합물" }, { key: "d", label: "방법" }, { key: "p", label: "종이(μm)", res: 0.1 },
    { key: "t", label: "시간(s)", res: 1 }, { key: "r", label: "회수율(%)", res: 0.1 }, { key: "n", label: "탁도(NTU)", res: 1 },
  ], () => drawPlot());

  /* ---------- 장치 그림 ---------- */
  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = MX[mx], prog = anim ? Math.min(1, anim.el / anim.dur) : 0;
    const liq = m.hot ? "rgba(224,160,42,.35)" : "rgba(120,170,220,.35)";
    const solidCol = mx === "hot" ? "#2b2b2b" : mx === "baso4" ? "#f4f4f4" : mx === "sand" ? "#c9a46a" : "#e9eef2";
    ctx.lineWidth = 1.4; ctx.strokeStyle = C.ink; ctx.font = `11px ${F.sans}`;
    const lab = (s, x, y, al = "left") => { ctx.fillStyle = C.ink2; ctx.textAlign = al; ctx.fillText(s, x, y); };
    const fx = w * 0.32;
    if (md === "vac") {
      /* 뷰흐너 깔때기 + 여과 플라스크 + 안전병 + 아스피레이터 */
      const bx = fx, by = h * 0.12, bw = Math.min(90, w * 0.2), bh = h * 0.2;
      const fl = h * (1 - prog) * 0.12;
      ctx.fillStyle = liq; ctx.fillRect(bx - bw / 2 + 2, by + bh - 6 - fl, bw - 4, fl);
      ctx.fillStyle = solidCol; ctx.fillRect(bx - bw / 2 + 2, by + bh - 6 - 4 * prog, bw - 4, 4 * prog);
      ctx.strokeRect(bx - bw / 2, by, bw, bh);
      ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(bx - bw / 2, by + bh - 6); ctx.lineTo(bx + bw / 2, by + bh - 6); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(bx - 8, by + bh); ctx.lineTo(bx - 5, by + bh + 26); ctx.moveTo(bx + 8, by + bh); ctx.lineTo(bx + 5, by + bh + 26); ctx.stroke();
      ctx.fillStyle = "#555"; ctx.fillRect(bx - 12, by + bh + 8, 24, 10);
      /* 플라스크 */
      const fy = by + bh + 18, fb = h - 14, fw = bw * 1.1;
      ctx.beginPath(); ctx.moveTo(bx - 9, fy); ctx.lineTo(bx - 9, fy + 22); ctx.lineTo(bx - fw / 2, fb); ctx.lineTo(bx + fw / 2, fb); ctx.lineTo(bx + 9, fy + 22); ctx.lineTo(bx + 9, fy); ctx.stroke();
      const lv = (fb - fy - 30) * 0.5 * prog;
      if (lv > 0) { ctx.fillStyle = m.hot ? "rgba(224,160,42,.3)" : "rgba(120,170,220,.3)"; const k = lv / (fb - fy - 22); ctx.beginPath(); ctx.moveTo(bx - fw / 2 + 2, fb - 1); ctx.lineTo(bx + fw / 2 - 2, fb - 1); ctx.lineTo(bx + fw / 2 - 2 - k * (fw / 2 - 9), fb - lv); ctx.lineTo(bx - fw / 2 + 2 + k * (fw / 2 - 9), fb - lv); ctx.fill(); }
      /* 곁가지 → 안전병 → 아스피레이터 */
      const sx = bx + 9, sy = fy + 14, tx = w * 0.62, ax = w * 0.86;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 14, sy); ctx.stroke();
      ctx.strokeStyle = "#8a6d4a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx + 14, sy); ctx.quadraticCurveTo(tx - 30, sy - 10, tx - 8, h * 0.45); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx + 8, h * 0.45); ctx.quadraticCurveTo(ax - 30, h * 0.3, ax - 6, h * 0.24); ctx.stroke();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(tx - 7, h * 0.47); ctx.lineTo(tx - 7, h * 0.56); ctx.lineTo(tx - 22, fb); ctx.lineTo(tx + 22, fb); ctx.lineTo(tx + 7, h * 0.56); ctx.lineTo(tx + 7, h * 0.47); ctx.stroke();
      lab("안전병(트랩)", tx + 26, h * 0.62);
      /* 수도꼭지 아스피레이터 */
      ctx.fillStyle = "#9aa"; ctx.fillRect(ax - 6, h * 0.08, 12, h * 0.36);
      ctx.fillStyle = C.ink2; ctx.fillRect(ax - 16, h * 0.06, 32, 7);
      if (anim) { ctx.strokeStyle = "rgba(120,170,220,.8)"; ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 40; ctx.beginPath(); ctx.moveTo(ax, h * 0.44); ctx.lineTo(ax, h - 10); ctx.stroke(); ctx.setLineDash([]); ctx.strokeStyle = C.ink; }
      lab("아스피레이터", ax, h * 0.04 + 2, "center");
      lab("뷰흐너 깔때기", bx + bw / 2 + 6, by + 12);
      lab("여과 플라스크", bx + fw / 2 + 4, fb - 4);
      ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText(anim ? "감압 중: 압력 차 ≈ 80 kPa" : "물이 흐르면 플라스크 속 압력이 낮아짐", 8, 14);
      return;
    }
    /* 자연 여과 / 고온 여과 */
    const fy = h * 0.1, fr = Math.min(62, w * 0.14), fh = fr * 1.15, stemless = md === "hotf";
    const top = fy, tipY = fy + fh;
    /* 깔때기 받침 */
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx - fr - 30, top + fh * 0.55); ctx.lineTo(fx - fr * 0.5, top + fh * 0.55); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(fx, top + fh * 0.55, fr * 0.5, 4, 0, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1.4;
    ctx.fillStyle = C.ink3; ctx.fillRect(fx - fr - 34, top - 10, 5, h - top);
    ctx.strokeStyle = C.ink;
    /* 거름종이와 액체 */
    const lvl = (1 - prog) * 0.7 + 0.05;
    const yl = tipY - fh * lvl;
    ctx.fillStyle = liq; ctx.beginPath(); ctx.moveTo(fx - fr * lvl, yl); ctx.lineTo(fx + fr * lvl, yl); ctx.lineTo(fx, tipY - 3); ctx.fill();
    ctx.fillStyle = solidCol; ctx.beginPath(); ctx.moveTo(fx - fr * 0.18 * (0.3 + prog), tipY - fh * 0.18 * (0.3 + prog)); ctx.lineTo(fx + fr * 0.18 * (0.3 + prog), tipY - fh * 0.18 * (0.3 + prog)); ctx.lineTo(fx, tipY - 2); ctx.fill();
    ctx.strokeStyle = "#bdb7a6";
    if (md === "cone") { ctx.beginPath(); ctx.moveTo(fx - fr * 0.9, top + 6); ctx.lineTo(fx, tipY - 2); ctx.lineTo(fx + fr * 0.9, top + 6); ctx.stroke(); }
    else { ctx.beginPath(); for (let i = 0; i <= 16; i++) { const u = -0.9 + i * 0.1125; ctx.lineTo(fx + u * fr, top + 6 + (i % 2) * 6); ctx.moveTo(fx + u * fr, top + 6 + (i % 2) * 6); ctx.lineTo(fx, tipY - 2); ctx.moveTo(fx + u * fr, top + 6 + (i % 2) * 6); } ctx.stroke(); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(fx - fr, top); ctx.lineTo(fx - 4, tipY); ctx.lineTo(fx - 4, stemless ? tipY + 6 : tipY + fh * 0.8);
    ctx.moveTo(fx + fr, top); ctx.lineTo(fx + 4, tipY); ctx.lineTo(fx + 4, stemless ? tipY + 6 : tipY + fh * 0.8); ctx.stroke();
    /* 받는 그릇 */
    const by = stemless ? tipY + 16 : tipY + fh * 0.5, bb = h - (stemless ? 30 : 10), bw = fr * 1.3;
    if (stemless) {
      ctx.beginPath(); ctx.moveTo(fx - 8, by); ctx.lineTo(fx - 8, by + 14); ctx.lineTo(fx - bw / 2, bb); ctx.lineTo(fx + bw / 2, bb); ctx.lineTo(fx + 8, by + 14); ctx.lineTo(fx + 8, by); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.fillRect(fx - bw / 2 - 14, bb, bw + 28, 12);
      ctx.fillStyle = C.apple; ctx.fillRect(fx - bw / 2 - 10, bb + 4, bw + 20, 2);
      lab("열판", fx + bw / 2 + 20, bb + 10);
      ctx.strokeStyle = "rgba(141,141,146,.6)"; ctx.lineWidth = 1;
      for (let k = 0; k < 3; k++) { const x0 = fx - 18 + k * 18, ph = t * 2 + k; ctx.beginPath(); for (let i = 0; i < 12; i++) { const yy = by - i * 3; ctx.lineTo(x0 + Math.sin(ph + i * 0.6) * 3, yy); } ctx.stroke(); }
      lab("용매 증기가 깔때기를 데움", fx + fr + 8, top + fh * 0.9);
    } else {
      ctx.beginPath(); ctx.moveTo(fx - 4, by); ctx.lineTo(fx - 4, bb); ctx.lineTo(fx - 4 + bw, bb); ctx.lineTo(fx - 4 + bw, by); ctx.stroke();
    }
    const bx0 = stemless ? fx : fx - 4 + bw / 2;
    const fill = (bb - by - 20) * 0.6 * prog;
    if (fill > 0) {
      const clear = Math.max(0.1, Math.min(0.8, anim ? anim.res.ntu / 60 : 0));
      ctx.fillStyle = m.hot ? `rgba(224,160,42,${0.3})` : `rgba(120,170,220,${0.3})`; ctx.fillRect(bx0 - bw / 2 + 2, bb - fill, bw - 4, fill - 1);
      ctx.fillStyle = `rgba(110,110,110,${clear * 0.6})`; ctx.fillRect(bx0 - bw / 2 + 2, bb - fill, bw - 4, fill - 1);
    }
    if (anim && prog < 1) { ctx.fillStyle = m.hot ? C.amber : "#78aadc"; const dy = (t * 120) % 20; ctx.beginPath(); ctx.arc(fx, (stemless ? tipY + 8 : tipY + fh * 0.8) + dy, 2, 0, Math.PI * 2); ctx.fill(); }
    lab(md === "cone" ? "원뿔로 접은 거름종이" : "주름 접은 거름종이", fx + fr + 8, top + 10);
    lab(stemless ? "꼭지 없는 깔때기" : "꼭지 끝은 그릇 벽에", fx + fr + 8, top + 26);
    /* 오른쪽: 혼합물 정보 */
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.font = `11px ${F.sans}`;
  }

  function drawInfo() {
    const r = model();
    $(".fl-msg").innerHTML = `${goalTxt()} · ${r.notes.length ? r.notes.join(" ") : "특별한 문제 없이 걸러집니다."}`;
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((r) => ({ x: Math.log10(r.t), y: r.r }));
    const res = L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, xr: [1, 4.5], yr: [0, 100], xlabel: "log₁₀(여과 시간 / s)", ylabel: "회수율 (%)" });
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    tbl.rows.forEach((r, i) => ctx.fillText(String(i + 1), res.X(Math.log10(r.t)) + 5, res.Y(r.r) + (i % 2 ? -4 : 11)));
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText("10 s", res.X(1) + 2, res.Y(0) - 4); ctx.textAlign = "right"; ctx.fillText("1시간 ≈ 3.56", res.X(4.5) - 2, res.Y(0) - 4);
  }

  function result() {
    const r = model();
    return {
      x: MX[mx].name, d: MD[md].name, p: pore,
      t: L.measure(r.time, { rel: 0.08, res: 1 }),
      r: Math.max(0, Math.min(100, L.measure(r.rec, { sd: 1.2, res: 0.1 }))),
      n: Math.max(0, L.measure(r.ntu, { sd: 1, rel: 0.1, res: 1 })), _res: r,
    };
  }
  function start() {
    const rec = result();
    anim = { el: 0, dur: 2.2, rec, res: rec._res };
  }
  loop($(".cv-wide"), (dt) => {
    t += dt;
    if (anim) { anim.el += dt; if (anim.el >= anim.dur + 0.4) { const r = anim.rec; delete r._res; tbl.add(r); anim = null; } }
    draw();
  });

  const pick = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b || anim) return;
    set(b.dataset[attr]); root.querySelectorAll(`${sel} [data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    drawInfo(); draw();
  });
  pick(".mx", "x", (v) => { mx = v; });
  pick(".md", "d", (v) => { md = v; });
  pick(".pp", "p", (v) => { pore = +v; });
  $(".meas").addEventListener("click", () => { if (!anim) start(); });
  $(".clear").addEventListener("click", () => { anim = null; tbl.clear(); });
  drawInfo();
  if (L.demo) {
    [["sand", "cone", 11], ["sand", "vac", 11], ["kno3", "cone", 11], ["kno3", "vac", 11], ["hot", "flute", 11], ["hot", "vac", 11], ["hot", "hotf", 11], ["baso4", "cone", 25], ["baso4", "cone", 2.5], ["baso4", "vac", 2.5]]
      .forEach(([a, b, c]) => { mx = a; md = b; pore = c; const r = result(); delete r._res; tbl.add(r); });
    mx = "hot"; md = "hotf"; pore = 11;
    root.querySelector('[data-x="hot"]').click(); root.querySelector('[data-d="hotf"]').click();
  }
})();
