/* 카드: 분별관 하나로 에탄올을 얼마나 진하게 모을 수 있을까? — 에탄올–물 분별 증류 (기액 평형 자료 + 이론단 모식) */
(() => {
  const root = document.getElementById("card-labchem-distill");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sC = $(".c"), sH = $(".h"), cBias = $(".bias");

  // 1기압 에탄올–물 기액 평형 실측 자료 (액체 몰분율 x, 증기 몰분율 y, 끓는점 °C)
  const VX = [0, 0.019, 0.0721, 0.0966, 0.1238, 0.1661, 0.2337, 0.2608, 0.3273, 0.3965, 0.5079, 0.5198, 0.5732, 0.6763, 0.7472, 0.8943, 1];
  const VY = [0, 0.17, 0.3891, 0.4375, 0.4704, 0.5089, 0.5445, 0.558, 0.5826, 0.6122, 0.6564, 0.6599, 0.6841, 0.7385, 0.7815, 0.8943, 1];
  const VT = [100, 95.5, 89.0, 86.7, 85.3, 84.1, 82.7, 82.3, 81.5, 80.7, 79.8, 79.7, 79.3, 78.74, 78.41, 78.15, 78.3];
  const interp = (xs, ys, x) => {
    if (x <= xs[0]) return ys[0];
    for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
    return ys[ys.length - 1];
  };
  const yOf = (x) => interp(VX, VY, x), tBub = (x) => interp(VX, VT, x);
  const xOfY = (y) => interp(VY, VX, Math.min(y, 0.8943));
  const tDew = (y) => (y >= 0.8943 ? tBub(0.8943) + (y - 0.8943) / 0.1057 * 0.15 : tBub(xOfY(y)));
  const VE = 58.4, VW = 18.07;   // 몰 부피 mL/mol (에탄올, 물)
  const volPct = (x) => 100 * x * VE / (x * VE + (1 - x) * VW);
  const molFr = (vp) => { const e = vp / VE, w = (100 - vp) / VW; return e / (e + w); };

  const SCOL = { 0: "#b5532f", 2: "#4f7fb0", 5: "#3b7c2a" };
  const EFF = [0, 1, 0.7, 0.4], HNAME = ["", "약하게", "중간", "세게"];
  let run = 0, stages = 2, nE = 0, nW = 0, got = 0, drip = 0, xKey = "tv", t = 0;
  const nEff = () => 1 + stages * EFF[+sH.value];
  const topY = (x) => {   // 단 수만큼 평형 계단을 오른 증기 조성 (소수 단은 선형 보간)
    const n = nEff(); let y = x;
    for (let i = 0; i < Math.floor(n); i++) y = yOf(y);
    const fr = n - Math.floor(n);
    return fr ? y + (yOf(y) - y) * fr : y;
  };
  const xPot = () => nE / (nE + nW), vPot = () => nE * VE + nW * VW;
  const headT = () => (got > 0 || drip > 0 ? tDew(topY(xPot())) + (cBias.checked ? -2.5 : 0) : 22);

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "V", label: "누적 부피 (mL)", res: 1 }, { key: "T", label: "머리 온도 (°C)", res: 0.1 },
    { key: "p", label: "에탄올 (vol%)", res: 1 }, { key: "col", label: "분별관" },
  ], () => drawPlot());

  function refill() {
    const vp = +sC.value;
    nE = vp / VE; nW = (100 - vp) / VW; got = 0; drip = 0; run++; nums();
  }
  function collect() {
    if (vPot() < 15) return false;
    let tSum = 0, vE = 0;
    for (let k = 0; k < 10; k++) {
      const y = topY(xPot()), dn = 0.5 / (y * VE + (1 - y) * VW);
      tSum += tDew(y); vE += y * dn * VE;
      nE = Math.max(0, nE - y * dn); nW = Math.max(0, nW - (1 - y) * dn);
    }
    got += 5;
    const T = L.measure(tSum / 10 + (cBias.checked ? -2.5 : 0), { sd: 0.15, res: 0.1 });
    const p = clamp(L.measure(vE / 5 * 100, { sd: 0.7, res: 1 }), 0, 100);
    tbl.add({ V: got, T, p, col: ["단순", "", "비그뢰", "", "", "충전관"][stages] + (+sH.value > 1 ? "·" + HNAME[+sH.value] : ""), st: stages, run });
    nums();
    return true;
  }
  function nums() {
    $(".n-pot").textContent = vPot().toFixed(0) + " mL";
    $(".n-got").textContent = got + " mL";
    $(".n-st").textContent = nEff().toFixed(1) + " 단";
    $(".meas").disabled = vPot() < 15;
    $(".meas").textContent = vPot() < 15 ? "그만 — 플라스크를 말리지 않습니다" : "증류액 5 mL 받기";
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = h / 242, fx = w * 0.2, r = 34 * s, fy = h - 30 * s - r;
    const colH = [16, 0, 58, 0, 0, 92][stages] * s, neckTop = fy - r + 4, topY0 = neckTop - 14 * s - colH;
    ctx.lineWidth = 1.5;
    // 가열 맨틀
    ctx.fillStyle = "#c9b8a6"; ctx.strokeStyle = C.ink2;
    ctx.beginPath(); ctx.moveTo(fx - r - 10, fy); ctx.quadraticCurveTo(fx - r - 10, h - 8 * s, fx, h - 8 * s); ctx.quadraticCurveTo(fx + r + 10, h - 8 * s, fx + r + 10, fy); ctx.closePath(); ctx.fill(); ctx.stroke();
    const glow = drip > 0 ? 0.25 + 0.2 * +sH.value : 0.15;
    ctx.fillStyle = `rgba(181,83,47,${glow})`; ctx.fillRect(fx - r - 2, fy + r * 0.55, 2 * r + 4, 4);
    // 플라스크와 액체
    const fill = clamp(vPot() / 160, 0.06, 0.62);
    ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "rgba(116,171,102,0.25)"; ctx.fillRect(fx - r, fy + r - 2 * r * fill, 2 * r, 2 * r * fill);
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.8;
    for (let i = 0; i < 9; i++) {
      const ph = (t * (0.6 + 0.3 * +sH.value) + i * 0.37) % 1, bx = fx - r * 0.6 + (i * 37 % 100) / 100 * r * 1.2;
      const by = fy + r - 4 - ph * 2 * r * fill;
      ctx.beginPath(); ctx.arc(bx, by, 1.6 + i % 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = C.ink2;
    for (let i = 0; i < 3; i++) ctx.fillRect(fx - 12 + i * 10, fy + r - 6, 4, 3);   // 끓임쪽
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(fx, fy, r, -Math.PI / 2 + 0.2, -Math.PI / 2 - 0.2 + Math.PI * 2); ctx.stroke();
    // 목과 분별관
    const cw = 7 * s;
    ctx.beginPath(); ctx.moveTo(fx - cw, fy - r + 4); ctx.lineTo(fx - cw, topY0); ctx.moveTo(fx + cw, fy - r + 4); ctx.lineTo(fx + cw, topY0); ctx.stroke();
    if (stages === 2) {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      for (let yy = neckTop - 10 * s; yy > topY0 + 8; yy -= 9 * s) { ctx.beginPath(); ctx.moveTo(fx - cw, yy); ctx.lineTo(fx - 2, yy + 3); ctx.moveTo(fx + cw, yy + 4); ctx.lineTo(fx + 2, yy + 7); ctx.stroke(); }
    } else if (stages === 5) {
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.8;
      for (let yy = neckTop - 10 * s; yy > topY0 + 10; yy -= 5 * s) for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.arc(fx + k * 4.2 * s + ((yy / 5) % 2) * 1.5, yy, 2.2 * s, 0, Math.PI * 2); ctx.stroke(); }
    }
    // 증류 머리, 곁가지, 냉각기
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    const hy = topY0, ax = fx + cw, cx1 = fx + 34 * s, cx2 = w * 0.8 - 6, cy2 = hy + 70 * s;
    ctx.beginPath(); ctx.moveTo(fx - cw, hy); ctx.lineTo(fx - cw, hy - 18 * s); ctx.moveTo(fx + cw, hy - 18 * s); ctx.lineTo(fx + cw, hy - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax, hy - 4); ctx.lineTo(cx2 + 6, cy2 - 6); ctx.moveTo(ax, hy + 6); ctx.lineTo(cx2, cy2 + 4); ctx.stroke();
    const dx = cx2 - cx1, dy = (cy2 - hy) * (dx / (cx2 - ax)), ang = Math.atan2(cy2 - hy, cx2 - ax);
    ctx.save(); ctx.translate(cx1, hy + (cx1 - ax) * Math.tan(ang)); ctx.rotate(ang);
    const len = Math.hypot(dx, dy) * 0.92;
    ctx.fillStyle = "rgba(120,170,220,0.18)"; ctx.fillRect(10, -11 * s, len - 20, 22 * s);
    ctx.strokeStyle = C.ink2; ctx.strokeRect(10, -11 * s, len - 20, 22 * s);
    ctx.beginPath(); ctx.moveTo(len - 24, 11 * s); ctx.lineTo(len - 24, 20 * s); ctx.moveTo(18, -11 * s); ctx.lineTo(18, -20 * s); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("냉각수 →", (cx1 + cx2) / 2 + 30 * s, hy + 6 * s);
    // 받는 실린더
    const rx = w * 0.8, rw = 22 * s, rb = h - 10 * s, rt = rb - 100 * s;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(rx - rw / 2, rt, rw, rb - rt);
    const lv = clamp(got / 100, 0, 1) * (rb - rt);
    ctx.fillStyle = "rgba(116,171,102,0.3)"; ctx.fillRect(rx - rw / 2 + 1, rb - lv, rw - 2, lv);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.8;
    for (let k = 1; k < 10; k++) { const yy = rb - k * (rb - rt) / 10; ctx.beginPath(); ctx.moveTo(rx + rw / 2 - (k % 5 ? 4 : 8), yy); ctx.lineTo(rx + rw / 2, yy); ctx.stroke(); }
    if (drip > 0) { const dyy = cy2 + 8 + ((t * 3) % 1) * (rt - cy2 - 6); ctx.fillStyle = "#6aa0c8"; ctx.beginPath(); ctx.arc(cx2 + 3, dyy, 2.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("100 mL", rx + rw / 2 + 4, rt + 8);
    // 온도계와 읽음값
    const bulbY = cBias.checked ? hy - 16 * s : hy + 2 * s;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, bulbY); ctx.lineTo(fx, Math.max(6, hy - 58 * s)); ctx.stroke();
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(fx, bulbY, 3, 0, Math.PI * 2); ctx.fill();
    const rdX = fx - 26 * s - 62, rdY = Math.max(6, hy - 58 * s);
    ctx.fillStyle = C.night; ctx.fillRect(rdX, rdY, 62, 20);
    ctx.fillStyle = "#cfe8c4"; ctx.font = `600 12px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillText(headT().toFixed(1) + " °C", rdX + 57, rdY + 14);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    if (stages) ctx.fillText(stages === 2 ? "비그뢰관" : "충전관", fx + cw + 4, (neckTop + topY0) / 2 + 4);
    ctx.fillText("가열 맨틀", fx + r + 14, h - 14 * s);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows;
    if (xKey === "tv") {
      const box = { x0: 44, y0: 20, w: w - 58, h: h - 54 };
      const m = L.plot(ctx, box, { pts: [], xr: [0, 90], yr: [70, 102], xlabel: "받은 증류액 누적 부피 (mL)", ylabel: "머리 온도 (°C)" });
      const runs = [...new Set(rows.map((r) => r.run))];
      runs.forEach((rn) => {
        const rr = rows.filter((r) => r.run === rn), col = SCOL[rr[0].st];
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.3; ctx.beginPath();
        rr.forEach((r, i) => (i ? ctx.lineTo(m.X(r.V), m.Y(r.T)) : ctx.moveTo(m.X(r.V), m.Y(r.T)))); ctx.stroke();
        rr.forEach((r) => { ctx.beginPath(); ctx.arc(m.X(r.V), m.Y(r.T), 3, 0, Math.PI * 2); ctx.fill(); });
      });
      ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right";
      [[0, "단순 증류"], [2, "비그뢰관"], [5, "충전관"]].forEach(([k, nm], i) => { ctx.fillStyle = SCOL[k]; ctx.fillText("● " + nm, box.x0 + box.w - 4, box.y0 + box.h - 40 + i * 14); });
      return;
    }
    const box = { x0: 44, y0: 20, w: w - 58, h: h - 54 };
    const m = L.plot(ctx, box, { pts: [], xr: [0, 1], yr: [76, 101], xlabel: "에탄올 몰분율", ylabel: "온도 (°C)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    const curve = (f, col) => { ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i <= 200; i++) { const x = i / 200, [px, py] = f(x); i ? ctx.lineTo(m.X(px), m.Y(py)) : ctx.moveTo(m.X(px), m.Y(py)); } ctx.stroke(); };
    curve((x) => [x, tBub(x)], C.forest);
    curve((x) => [yOf(x), tBub(x)], "#4f7fb0");
    // 지금 플라스크 조성에서 이론단 계단
    let x = xPot(); const n = Math.ceil(nEff());
    if (Number.isFinite(x)) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2;
      for (let i = 0; i < n && x < 0.89; i++) {
        const T = tBub(x), y = yOf(x);
        ctx.beginPath(); ctx.moveTo(m.X(x), m.Y(T)); ctx.lineTo(m.X(y), m.Y(T)); ctx.lineTo(m.X(y), m.Y(tBub(y))); ctx.stroke();
        x = y;
      }
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(m.X(xPot()), m.Y(tBub(xPot())), 3.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = C.ink;
    rows.forEach((r) => { ctx.beginPath(); ctx.arc(m.X(molFr(r.p)), m.Y(r.T), 3, 0, Math.PI * 2); ctx.fill(); });
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(m.X(0.894), m.Y(76)); ctx.lineTo(m.X(0.894), m.Y(78.15)); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.forest; ctx.fillText("끓는점 곡선", m.X(0.03), m.Y(81.5));
    ctx.fillStyle = "#4f7fb0"; ctx.fillText("이슬점 곡선", m.X(0.5), m.Y(91));
    ctx.fillStyle = C.warn; ctx.fillText("● 플라스크 액체 · 계단 = 이론단", m.X(0.03), m.Y(78.1));
    ctx.fillStyle = C.ink; ctx.fillText("● 기록한 증류액", m.X(0.03), m.Y(76.8));
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("공비점 0.894", m.X(0.894) - 3, box.y0 + box.h - 6);
  }

  loop($(".cv-wide"), (dt) => { t += dt; if (drip > 0) drip = Math.max(0, drip - dt); drawApp(); });
  const upd = () => { $(".c-out").textContent = sC.value; $(".h-out").textContent = HNAME[+sH.value]; nums(); drawApp(); drawPlot(); };
  [sH, cBias].forEach((el) => el.addEventListener("input", upd));
  sC.addEventListener("input", () => { $(".c-out").textContent = sC.value; });
  sC.addEventListener("change", () => { refill(); upd(); });
  $(".col").addEventListener("click", (e) => {
    const b = e.target.closest("[data-n]"); if (!b) return;
    stages = +b.dataset.n; root.querySelectorAll("[data-n]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd();
  });
  $(".meas").addEventListener("click", () => { if (collect()) drip = 1.2; drawApp(); });
  $(".refill").addEventListener("click", () => { refill(); upd(); });
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  refill(); upd();
  $(".clear").addEventListener("click", () => { tbl.clear(); });
  if (L.demo) {
    stages = 0; refill(); for (let i = 0; i < 12; i++) collect();
    stages = 5; refill(); for (let i = 0; i < 12; i++) collect();
    root.querySelectorAll("[data-n]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.n === "5"))); drip = 0.5; upd();
  }
})();
