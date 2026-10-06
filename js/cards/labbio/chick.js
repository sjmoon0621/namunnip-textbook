/* 카드: 섞여 버린 닭 배아 영구표본, 발생 순서대로 다시 놓을 수 있을까? — HH 단계 모식도, 구조 찾기, 체절 세기, 순서 정하기, 체절 시계 */
(() => {
  const root = document.getElementById("card-labbio-chick");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* Hamburger–Hamilton(1951) 기준값: 배양 시간 범위, 체절 쌍 */
  const HH = [
    { hh: 4, t: [18, 19], som: 0, shape: "flat", streak: [0.3, 1], neural: 0, brain: 0, eye: 0, heart: 0, limb: 0, len: 0.55 },
    { hh: 8, t: [26, 29], som: 4, shape: "flat", streak: [0.7, 1], neural: 1, brain: 0, eye: 0, heart: 0, limb: 0, len: 0.66 },
    { hh: 10, t: [33, 38], som: 10, shape: "flat", streak: [0.86, 1], neural: 2, brain: 3, eye: 1, heart: 1, limb: 0, len: 0.72 },
    { hh: 13, t: [48, 52], som: 19, shape: "bent", streak: null, neural: 2, brain: 4, eye: 2, heart: 2, limb: 0, len: 0.8 },
    { hh: 18, t: [65, 69], som: 33, shape: "C", streak: null, neural: 2, brain: 4, eye: 3, heart: 2, limb: 1, len: 1.25 },
  ];
  const ORDER = [3, 0, 4, 1, 2];   // 표본 A~E가 어느 단계인지 (A=HH13, B=HH4, C=HH18, D=HH8, E=HH10)
  const NAME = "ABCDE";
  const FEAT = { streak: "원시선", node: "헨젠 결절", neural: "신경 주름·신경관", somite: "체절", brain: "뇌 소포", eye: "눈", heart: "심장", limb: "사지싹" };
  let cur = 0, feat = null, order = [], revealed = false;
  const found = [new Set(), new Set(), new Set(), new Set(), new Set()];

  const tbl = L.table($(".tbl-host"), [{ key: "s", label: "표본" }, { key: "n", label: "체절 쌍" }, { key: "f", label: "찾은 구조" }, { key: "o", label: "내 순서" }, { key: "t", label: "배양 시간 (h)" }], () => drawPlot());
  const cv = fit($(".ck-view"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());

  /* 몸의 중심선: 머리(s=0) → 꼬리(s=1) */
  function midline(sp, w) {
    const P = [], n = 120, Lm = w * 0.62 * Math.min(1, sp.len);
    if (sp.shape === "C") {
      const Rc = w * 0.25, f0 = -2.35, f1 = 2.25;
      for (let i = 0; i <= n; i++) {
        const s = i / n, f = f0 + (f1 - f0) * s, rr = Rc * (1 - 0.45 * Math.max(0, 1 - s / 0.2) ** 2);
        P.push({ x: Math.cos(f) * rr, y: Math.sin(f) * rr, s });
      }
      P.forEach((p, i) => { const q = P[Math.min(n, i + 1)], o = P[Math.max(0, i - 1)]; p.th = Math.atan2(q.y - o.y, q.x - o.x); });
    } else {
      let x = 0, y = 0;
      for (let i = 0; i <= n; i++) {
        const s = i / n;
        let th = Math.PI / 2;
        if (sp.shape === "bent") th += s < 0.3 ? -1.5 * (1 - s / 0.3) ** 1.5 : 0.25 * (s - 0.3);
        P.push({ x, y, th, s });
        x += Math.cos(th) * Lm / n; y += Math.sin(th) * Lm / n;
      }
    }
    const mx = P.reduce((a, p) => a + p.x, 0) / P.length, my = P.reduce((a, p) => a + p.y, 0) / P.length;
    P.forEach((p) => { p.x += w / 2 - mx; p.y += w / 2 - my; });
    return (s) => P[Math.max(0, Math.min(n, Math.round(s * n)))];
  }

  function draw() {
    const { ctx: c, size } = cv, { w } = size; if (!w) return;
    const sp = HH[ORDER[cur]], at = midline(sp, w), A = {};
    c.clearRect(0, 0, w, w);
    c.fillStyle = C.night; c.fillRect(0, 0, w, w);
    const R = w / 2 - 4;
    c.save(); c.beginPath(); c.arc(w / 2, w / 2, R, 0, 6.3); c.clip();
    c.fillStyle = "#f1ecef"; c.fillRect(0, 0, w, w);
    const norm = (p) => ({ nx: -Math.sin(p.th), ny: Math.cos(p.th) });
    const body = (s) => { const base = sp.shape === "flat" ? 0.05 : 0.065; return w * base * (s < 0.15 && sp.brain ? 1.25 : 1) * (1 - 0.55 * Math.max(0, s - 0.6) / 0.4); };
    if (sp.shape === "flat") {
      /* 배반: 명역(투명대)과 암역 */
      const top = at(0), bot = at(1), cy = (top.y + bot.y) / 2, ry = (bot.y - top.y) * 0.75, rx = w * 0.26;
      c.fillStyle = "rgba(196,140,165,.45)"; c.beginPath(); c.ellipse(w / 2, cy, rx * 1.55, ry * 1.25, 0, 0, 6.3); c.fill();
      if (sp.hh >= 8) { c.fillStyle = "rgba(190,40,60,.45)"; for (let i = 0; i < 46; i++) { const u = i * 2.39, rr = 1.08 + 0.3 * ((i * 37) % 10) / 10; const px = w / 2 + Math.cos(u) * rx * rr, py = cy + Math.sin(u) * ry * rr * 0.95; if (py > cy - ry * 0.2) { c.beginPath(); c.arc(px, py, 2.2, 0, 6.3); c.fill(); } } }
      c.fillStyle = "#f6f1f3"; c.beginPath(); c.ellipse(w / 2, cy, rx, ry, 0, 0, 6.3); c.fill();
    } else {
      c.strokeStyle = "rgba(150,110,130,.35)"; c.lineWidth = 1; c.setLineDash([4, 4]); c.beginPath(); c.arc(w / 2 - (sp.shape === "C" ? w * 0.03 : 0), w / 2, R * 0.78, 0, 6.3); c.stroke(); c.setLineDash([]);
    }
    /* 몸 */
    if (sp.hh >= 8) {
      c.fillStyle = "rgba(186,96,136,.42)"; c.strokeStyle = "rgba(130,50,90,.6)"; c.lineWidth = 1;
      c.beginPath();
      for (let i = 0; i <= 60; i++) { const p = at(i / 60), { nx, ny } = norm(p), b = body(i / 60); const px = p.x + nx * b, py = p.y + ny * b; i ? c.lineTo(px, py) : c.moveTo(px, py); }
      for (let i = 60; i >= 0; i--) { const p = at(i / 60), { nx, ny } = norm(p), b = body(i / 60); c.lineTo(p.x - nx * b, p.y - ny * b); }
      c.closePath(); c.fill(); c.stroke();
    }
    /* 원시선과 헨젠 결절 */
    if (sp.streak) {
      const [s0, s1] = sp.streak, p0 = at(s0), p1 = at(s1);
      c.strokeStyle = "rgba(120,40,80,.85)"; c.lineWidth = sp.hh === 4 ? 5 : 3.5; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y - 4); c.stroke();
      c.strokeStyle = "#f6f1f3"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(p0.x, p0.y + 6); c.lineTo(p1.x, p1.y - 6); c.stroke();
      c.fillStyle = "rgba(110,30,70,.9)"; c.beginPath(); c.arc(p0.x, p0.y, sp.hh === 4 ? 6 : 4.5, 0, 6.3); c.fill();
      A.streak = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2, r: Math.abs(p1.y - p0.y) / 2 + 6 };
      A.node = { x: p0.x, y: p0.y, r: 10 };
      if (sp.hh === 4) { c.strokeStyle = "rgba(130,50,90,.35)"; c.lineWidth = 1; c.beginPath(); c.ellipse(p0.x, p0.y - w * 0.07, w * 0.09, w * 0.05, 0, 0, 6.3); c.stroke(); }
    }
    /* 신경 주름 / 신경관 */
    if (sp.neural) {
      const sEnd = sp.neural === 1 ? 0.62 : (sp.streak ? sp.streak[0] : 0.97);
      c.strokeStyle = "rgba(110,30,70,.75)"; c.lineWidth = 1.6;
      for (const sg of [-1, 1]) {
        c.beginPath();
        for (let i = 0; i <= 40; i++) { const s = 0.02 + (sEnd - 0.02) * i / 40, p = at(s), { nx, ny } = norm(p); const off = sp.neural === 1 ? w * (0.012 + 0.025 * Math.max(0, (s - 0.25) / 0.4)) : w * 0.012; i ? c.lineTo(p.x + sg * nx * off, p.y + sg * ny * off) : c.moveTo(p.x + sg * nx * off, p.y + sg * ny * off); }
        c.stroke();
      }
      const pm = at(sEnd * 0.6); A.neural = { x: pm.x, y: pm.y, r: w * 0.045 };
      if (sp.neural === 1) { const ph = at(0.02); c.strokeStyle = "rgba(110,30,70,.6)"; c.beginPath(); c.arc(ph.x, ph.y + w * 0.015, w * 0.05, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    }
    /* 뇌 소포 */
    if (sp.brain) {
      const nb = sp.brain, ss = nb === 3 ? [0.03, 0.085, 0.15] : [0.02, 0.065, 0.115, 0.175];
      c.fillStyle = "rgba(160,60,110,.38)"; c.strokeStyle = "rgba(110,30,70,.75)"; c.lineWidth = 1.2;
      ss.forEach((s, i) => { const p = at(s), rr = w * (nb === 3 ? 0.03 : 0.032) * (i === nb - 1 ? 0.85 : 1) ; c.beginPath(); c.arc(p.x, p.y, rr, 0, 6.3); c.fill(); c.stroke(); });
      const pb = at(ss[1]); A.brain = { x: pb.x, y: pb.y, r: w * 0.09 };
    }
    /* 눈 */
    if (sp.eye) {
      const p = at(sp.eye === 1 ? 0.03 : 0.035), { nx, ny } = norm(p), off = w * (sp.eye === 1 ? 0.045 : 0.035), rr = w * (sp.eye === 3 ? 0.035 : 0.022);
      const sides = sp.eye === 1 ? [-1, 1] : [1];
      for (const sg of sides) {
        const ex = p.x + sg * nx * off, ey = p.y + sg * ny * off;
        c.fillStyle = "rgba(150,60,110,.5)"; c.beginPath(); c.arc(ex, ey, rr, 0, 6.3); c.fill(); c.strokeStyle = "rgba(100,30,70,.8)"; c.stroke();
        if (sp.eye >= 2) { c.fillStyle = "#f6f1f3"; c.beginPath(); c.arc(ex + nx * rr * 0.3 * sg, ey + ny * rr * 0.3 * sg, rr * 0.45, 0, 6.3); c.fill(); c.stroke(); }
        A.eye = { x: ex, y: ey, r: rr + 7 };
      }
    }
    /* 체절 */
    if (sp.som) {
      const s0 = sp.hh === 8 ? 0.42 : sp.hh === 10 ? 0.36 : sp.hh === 13 ? 0.3 : 0.23;
      const s1 = sp.hh === 8 ? 0.55 : sp.hh === 10 ? 0.66 : sp.hh === 13 ? 0.8 : 0.93;
      const ds = (s1 - s0) / sp.som;
      c.fillStyle = "rgba(120,35,80,.55)";
      for (let k = 0; k < sp.som; k++) {
        const s = s0 + (k + 0.5) * ds, p = at(s), { nx, ny } = norm(p), gap = ds * w * 0.62 * Math.min(1, sp.len) * (sp.shape === "C" ? 1.35 : 1);
        const sz = Math.min(w * 0.022, gap * 0.72) * (1 - 0.3 * k / Math.max(1, sp.som));
        const sides = sp.shape === "flat" ? [-1, 1] : [-1];
        for (const sg of sides) { const off = w * 0.03; c.save(); c.translate(p.x + sg * nx * off, p.y + sg * ny * off); c.rotate(p.th); c.fillRect(-sz / 2, -sz * 0.65, sz, sz * 1.3); c.restore(); }
      }
      const pm = at((s0 + s1) / 2); A.somite = { x: pm.x, y: pm.y, r: w * (s1 - s0) * 0.35 + 12 };
      if (sp.hh === 10 || sp.hh === 8) { const pe = at(s1 + 0.04); c.fillStyle = "rgba(160,80,120,.2)"; c.beginPath(); c.ellipse(pe.x - w * 0.03, pe.y, w * 0.012, w * 0.03, 0, 0, 6.3); c.ellipse(pe.x + w * 0.03, pe.y, w * 0.012, w * 0.03, 0, 0, 6.3); c.fill(); }
    }
    /* 심장 */
    if (sp.heart) {
      const p = at(sp.heart === 1 ? 0.24 : 0.2), { nx, ny } = norm(p), sg = sp.shape === "C" ? 1 : -1;
      const ho = w * (sp.heart === 1 ? 0.035 : sp.shape === "C" ? 0.08 : 0.05), hx = p.x + sg * nx * ho, hy = p.y + sg * ny * ho;
      c.strokeStyle = "rgba(200,40,55,.85)"; c.lineWidth = sp.heart === 1 ? 6 : sp.hh === 18 ? 11 : 8; c.lineCap = "round";
      c.beginPath();
      if (sp.heart === 1) { c.moveTo(hx + 4, hy - 14); c.quadraticCurveTo(hx - 12, hy, hx + 4, hy + 14); }
      else { c.moveTo(hx + 10, hy - 18); c.bezierCurveTo(hx - 22, hy - 12, hx + 22, hy + 8, hx - 6, hy + 18); }
      c.stroke(); c.lineCap = "butt";
      A.heart = { x: hx, y: hy, r: 26 };
    }
    /* 사지싹 */
    if (sp.limb) {
      for (const s of [0.42, 0.74]) {
        const p = at(s), { nx, ny } = norm(p), b = body(s);
        c.fillStyle = "rgba(186,96,136,.6)"; c.strokeStyle = "rgba(130,50,90,.8)";
        c.save(); c.translate(p.x + nx * b * 0.9, p.y + ny * b * 0.9); c.rotate(Math.atan2(ny, nx)); c.beginPath(); c.ellipse(0, 0, w * 0.035, w * 0.026, 0, -Math.PI / 2, Math.PI / 2); c.fill(); c.stroke(); c.restore();
      }
      const p1 = at(0.58), { nx, ny } = norm(p1); A.limb = { x: p1.x + nx * w * 0.06, y: p1.y + ny * w * 0.06, r: w * 0.2 };
    }
    /* 강조 */
    if (feat && A[feat]) {
      const a = A[feat]; c.strokeStyle = C.amber; c.lineWidth = 2.5; c.setLineDash([5, 4]); c.beginPath(); c.arc(a.x, a.y, a.r, 0, 6.3); c.stroke(); c.setLineDash([]);
    }
    c.restore();
    c.fillStyle = "#ddd"; c.font = `12px ${F.mono}`; c.textAlign = "left"; c.fillText(`표본 ${NAME[cur]}`, 10, 18);
    c.textAlign = "right"; c.fillText(revealed ? `HH${sp.hh} · ${sp.t[0]}~${sp.t[1]} h` : "라벨 가림", w - 10, 18);
    c.font = `10px ${F.mono}`; c.fillText(sp.shape === "flat" ? "머리 ↑ (등 쪽에서 봄)" : "몸이 굽어 옆으로 누운 모습", w - 10, w - 10);
    return A;
  }

  function count() {
    const sp = HH[ORDER[cur]];
    const n = sp.som ? Math.max(0, L.measure(sp.som, { sd: 0.3 + 0.03 * sp.som, res: 1 })) : 0;
    const oi = order.indexOf(cur);
    tbl.add({ s: NAME[cur], n, f: [...found[cur]].map((k) => FEAT[k]).join(", ") || "—", o: oi >= 0 ? String(oi + 1) : "—", t: revealed ? `${sp.t[0]}~${sp.t[1]}` : "?" , _k: cur });
  }

  function drawPlot() {
    const { ctx: c, size } = pl, { w, h } = size; if (!w) return;
    c.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 22, w: w - 58, h: h - 58 };
    const by = {};
    tbl.rows.forEach((r) => { (by[r._k] = by[r._k] || []).push(r.n); });
    const pts = [];
    Object.keys(by).forEach((k) => {
      const sp = HH[ORDER[k]], st = L.stats(by[k]), oi = order.indexOf(+k);
      const x = revealed ? (sp.t[0] + sp.t[1]) / 2 : oi >= 0 ? oi + 1 : NaN;
      if (Number.isFinite(x)) pts.push({ x, y: st.mean, ey: by[k].length > 1 ? st.sd : 0, ex: revealed ? (sp.t[1] - sp.t[0]) / 2 : 0, lab: NAME[k] });
    });
    const fitPts = pts.filter((p) => p.y > 0.5);
    const f = revealed ? L.linfit(fitPts.map((p) => p.x), fitPts.map((p) => p.y)) : null;
    const g = L.plot(c, box, { pts, fit: f && f.a > 0 ? f : null, xr: revealed ? [0, 80] : [0, 6], yr: [0, 40], xlabel: revealed ? "배양 시간 (h)" : "내가 정한 순서", ylabel: "체절 쌍 (세어 본 평균)" });
    c.font = `11px ${F.mono}`; c.fillStyle = C.ink; c.textAlign = "left";
    pts.forEach((p) => c.fillText(p.lab, g.X(p.x) + 6, g.Y(p.y) - 6));
    c.fillStyle = C.ink2;
    if (f && f.a > 0) c.fillText(`기울기 ${f.a.toFixed(2)} 쌍/h → 한 쌍에 약 ${(60 / f.a).toFixed(0)}분`, box.x0 + 6, box.y0 + 12);
    else if (!revealed) c.fillText(pts.length ? "라벨을 열면 가로축이 배양 시간으로 바뀝니다" : "순서를 정하고 체절을 세면 점이 찍힙니다", box.x0 + 6, box.y0 + 12);
  }

  function showFeat() {
    const A = draw();
    if (!feat) return;
    const has = !!A[feat];
    if (has) found[cur].add(feat);
    $(".ck-msg").textContent = has ? `표본 ${NAME[cur]}: ${FEAT[feat]}을(를) 찾았습니다 (점선 원).` : `표본 ${NAME[cur]}에는 ${FEAT[feat]}이(가) 아직 없거나 이미 사라졌습니다.`;
  }
  const orderTxt = () => { $(".ck-order").textContent = order.length ? order.map((k) => NAME[k]).join(" → ") : "아직 없음"; };

  $(".ck-slides").addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (!b) return; cur = +b.dataset.k;
    root.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); showFeat();
  });
  $(".ck-feats").addEventListener("click", (e) => {
    const b = e.target.closest("[data-f]"); if (!b) return; feat = feat === b.dataset.f ? null : b.dataset.f;
    root.querySelectorAll("[data-f]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.f === feat)));
    if (!feat) { $(".ck-msg").textContent = "구조 단추를 눌러 이 표본에서 찾아보세요."; draw(); } else showFeat();
  });
  $(".ck-count").addEventListener("click", count);
  $(".ck-next").addEventListener("click", () => {
    if (order.includes(cur) || order.length >= 5) return;
    order.push(cur); orderTxt();
    if (order.length === 5) {
      const ok = order.every((k, i) => ORDER[k] === i);
      $(".ck-msg").textContent = ok ? "다섯 장의 순서가 발생 순서와 일치합니다. 라벨을 열어 배양 시간을 확인하세요." : "순서가 발생 순서와 다른 곳이 있습니다. 체절 수와 원시선·사지싹을 근거로 다시 정해 보세요.";
    }
    drawPlot();
  });
  $(".ck-reset").addEventListener("click", () => { order = []; orderTxt(); drawPlot(); });
  $(".ck-reveal").addEventListener("click", () => {
    revealed = !revealed;
    tbl.rows.forEach((r) => { const sp = HH[ORDER[r._k]]; r.t = revealed ? `${sp.t[0]}~${sp.t[1]}` : "?"; });
    if (tbl.rows.length) tbl.add(tbl.rows.pop()); else drawPlot();
    draw();
  });
  $(".ck-clear").addEventListener("click", () => tbl.clear());

  if (L.demo) {
    const seq = [1, 3, 4, 0, 2];   // B, D, E, A, C
    const fs = { 1: ["streak", "node"], 3: ["streak", "somite", "neural"], 4: ["somite", "brain", "heart", "eye"], 0: ["somite", "brain", "heart", "eye"], 2: ["somite", "limb", "heart", "eye"] };
    seq.forEach((k) => { cur = k; fs[k].forEach((f) => found[k].add(f)); order.push(k); count(); count(); });
    orderTxt(); revealed = true;
    tbl.rows.forEach((r) => { const sp = HH[ORDER[r._k]]; r.t = `${sp.t[0]}~${sp.t[1]}`; });
    tbl.add(tbl.rows.pop());
    cur = 2; feat = "limb";
    root.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.k === cur)));
    root.querySelector('[data-f="limb"]').setAttribute("aria-pressed", "true");
    $(".ck-msg").textContent = "다섯 장의 순서가 발생 순서와 일치합니다. 라벨을 열어 배양 시간을 확인하세요.";
    showFeat(); drawPlot();
  }
})();
