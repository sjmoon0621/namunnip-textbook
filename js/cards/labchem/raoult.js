/* 카드: 설탕물의 증기압은 맹물보다 얼마나 낮을까? — 차압 센서로 증기압 내림 측정, 라울 법칙과 편차, 유리 덮개 시연 */
(() => {
  const root = document.getElementById("card-labchem-raoult");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sM = $(".m"), sD = $(".d");
  const P50 = 12.35, P25 = 3.17, MW = 0.018015;

  // 삼투 계수 φ (25 °C 문헌값을 단순화한 근사식): 물의 활동도 ln a = −ν·φ·m·M_물
  const NACL = [[0, 1], [0.1, 0.932], [0.5, 0.921], [1, 0.936], [2, 0.983], [3, 1.045], [4, 1.116], [5, 1.192]];
  const phiNaCl = (m) => { for (let i = 1; i < NACL.length; i++) if (m <= NACL[i][0]) { const [a, pa] = NACL[i - 1], [b, pb] = NACL[i]; return pa + (pb - pa) * (m - a) / (b - a); } return 1.192; };
  const SOL = [
    { name: "요소", M: 60.06, nu: 1, phi: (m) => 1 - 0.05 * m + 0.004 * m * m, col: "#4f7fb0" },
    { name: "포도당", M: 180.16, nu: 1, phi: (m) => 1 + 0.02 * m, col: "#3b7c2a" },
    { name: "설탕", M: 342.3, nu: 1, phi: (m) => 1 + 0.09 * m, col: "#e0a02a" },
    { name: "NaCl", M: 58.44, nu: 2, phi: phiNaCl, col: "#b5532f" },
  ];
  const aw = (i, m) => Math.exp(-SOL[i].nu * SOL[i].phi(m) * m * MW);
  const xSol = (m) => m / (1 / MW + m);
  let si = 0, t = 0;

  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const jar = fit($(".cv-jar"), () => drawJar());
  const tbl = L.table($(".tbl-host"), [
    { key: "nm", label: "용질" }, { key: "m", label: "m (mol/kg)", res: 0.1 }, { key: "x", label: "x 용질", res: 0.0001 },
    { key: "dP", label: "ΔP (kPa)", res: 0.01 }, { key: "r", label: "P/P°", res: 0.001 },
  ], () => drawPlot());

  function flask(ctx, cx, by, s, fillCol, label) {
    const r = 30 * s, cy = by - r;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.fillStyle = C.card;
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2 + 0.25, -Math.PI / 2 - 0.25 + Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 7 * s, cy - r + 1); ctx.lineTo(cx - 7 * s, cy - r - 30 * s); ctx.moveTo(cx + 7 * s, cy - r + 1); ctx.lineTo(cx + 7 * s, cy - r - 30 * s); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 1, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = fillCol; ctx.fillRect(cx - r, cy + 2, 2 * r, r); ctx.restore();
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(label, cx, by + 14 * s);
    return cy - r - 30 * s;
  }
  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = h / 242, bx = w * 0.06, bw = w * 0.88, by = h * 0.45, bb = h - 10 * s;
    ctx.fillStyle = "rgba(120,170,220,0.25)"; ctx.fillRect(bx, by + 8 * s, bw, bb - by - 8 * s);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, bb); ctx.lineTo(bx + bw, bb); ctx.lineTo(bx + bw, by); ctx.stroke();
    const m = +sM.value;
    const top1 = flask(ctx, w * 0.24, bb - 22 * s, s, "rgba(120,170,220,0.45)", "순수한 물");
    const top2 = flask(ctx, w * 0.76, bb - 22 * s, s, `rgba(${si === 3 ? "200,200,210" : "224,190,120"},${(0.3 + m * 0.06).toFixed(2)})`, SOL[si].name === "NaCl" ? "염화 나트륨 수용액" : SOL[si].name + " 수용액");
    // 증기 분자: 왼쪽이 조금 더 많다
    const dots = (cx, n) => { ctx.fillStyle = "#4f7fb0"; for (let k = 0; k < n; k++) { const hs = (q) => { const z = Math.sin(q) * 43758.5453; return z - Math.floor(z); }, u = (hs(k * 12.99) + 0.03 * Math.sin(t * 1.3 + k)) % 1, v = (hs(k * 78.23) + t * 0.04 * (1 + k % 3)) % 1; ctx.beginPath(); ctx.arc(cx + (u - 0.5) * 40 * s, bb - 22 * s - 30 * s - 4 * s - v * 22 * s, 1.6, 0, Math.PI * 2); ctx.fill(); } };
    dots(w * 0.24, 22); dots(w * 0.76, Math.round(22 * aw(si, m)));
    // 관과 차압 센서
    const sx = w * 0.5, sy = top1 - 20 * s;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2.5; ctx.beginPath();
    ctx.moveTo(w * 0.24, top1); ctx.lineTo(w * 0.24, sy); ctx.lineTo(sx - 56, sy);
    ctx.moveTo(w * 0.76, top2); ctx.lineTo(w * 0.76, sy); ctx.lineTo(sx + 56, sy); ctx.stroke();
    ctx.fillStyle = C.night; ctx.fillRect(sx - 56, sy - 22, 112, 42);
    ctx.fillStyle = "#cfe8c4"; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText("ΔP 센서", sx, sy - 4);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = "#9fb59a"; ctx.fillText("기록 버튼으로 읽기", sx, sy + 12);
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("물중탕 50.0 °C", bx + 6, bb - 6);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 20, w: w - 58, h: h - 54 };
    const m = L.plot(ctx, box, { pts: [], model: (x) => P50 * x, xr: [0, 0.09], yr: [0, 2.6], xlabel: "용질 몰분율 x (화학식 단위)", ylabel: "증기압 내림 ΔP (kPa)" });
    SOL.forEach((q, i) => {
      ctx.fillStyle = q.col;
      tbl.rows.filter((r) => r.si === i).forEach((r) => { ctx.beginPath(); ctx.arc(m.X(r.x), m.Y(r.dP), 3.2, 0, Math.PI * 2); ctx.fill(); });
    });
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    SOL.forEach((q, i) => { ctx.fillStyle = q.col; ctx.fillText("● " + (q.name === "NaCl" ? "염화 나트륨" : q.name), box.x0 + 8, box.y0 + 12 + i * 13); });
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("라울 법칙 ΔP = x·P°", m.X(0.056), m.Y(P50 * 0.056) + 24);
  }

  // 유리 덮개 시연: 맹물 100 mL, 설탕물(물 100 g + 설탕 34.2 g, 1 mol/kg). 옮겨 가는 빠르기 ∝ 증기압 차 (모식)
  function jarState(days) {
    let a = 100, b = 100; const nS = 0.1, k = 65;
    for (let d = 0; d < days * 20 && a > 0; d++) {
      const mb = nS / (b / 1000), dP = P25 * (1 - Math.exp(-(1 + 0.09 * mb) * mb * MW));
      const dv = Math.min(a, k * dP / 20); a -= dv; b += dv;
    }
    return { a, b, mb: nS / (b / 1000) };
  }
  function drawJar() {
    const { ctx } = jar, { w, h } = jar.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const st = jarState(+sD.value), s = h / 215;
    const base = h - 18 * s, cx = w / 2, jw = Math.min(w * 0.42, 190 * s), jt = 20 * s;
    ctx.fillStyle = C.ink3; ctx.fillRect(cx - jw - 14, base, 2 * jw + 28, 5);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(cx - jw, base); ctx.lineTo(cx - jw, jt + 50 * s); ctx.quadraticCurveTo(cx - jw, jt, cx, jt); ctx.quadraticCurveTo(cx + jw, jt, cx + jw, jt + 50 * s); ctx.lineTo(cx + jw, base); ctx.stroke();
    const beaker = (bx, vol, col, label) => {
      const bw = 52 * s, bh = 110 * s, top = base - bh, lv = vol / 220 * bh;
      ctx.fillStyle = col; ctx.fillRect(bx - bw / 2 + 1, base - lv, bw - 2, lv);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(bx - bw / 2, top); ctx.lineTo(bx - bw / 2, base); ctx.lineTo(bx + bw / 2, base); ctx.lineTo(bx + bw / 2, top); ctx.stroke();
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.8;
      for (let k = 50; k <= 200; k += 50) { const yy = base - k / 220 * bh; ctx.beginPath(); ctx.moveTo(bx + bw / 2 - 7, yy); ctx.lineTo(bx + bw / 2, yy); ctx.stroke(); }
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(label, bx, top - 6);
    };
    beaker(cx - jw * 0.48, st.a, "rgba(120,170,220,0.45)", "맹물");
    beaker(cx + jw * 0.48, st.b + 21, "rgba(224,190,120,0.5)", "설탕물");
    if (st.a > 0.5) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.3; ctx.setLineDash([4, 3]);
      const y0 = base - 130 * s;
      ctx.beginPath(); ctx.moveTo(cx - jw * 0.3, y0); ctx.quadraticCurveTo(cx, y0 - 34 * s, cx + jw * 0.3, y0); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(cx + jw * 0.3 + 2, y0 + 1); ctx.lineTo(cx + jw * 0.3 - 7, y0 - 5); ctx.lineTo(cx + jw * 0.3 - 4, y0 + 5); ctx.fill();
      ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("수증기", cx, y0 - 22 * s);
    }
    $(".n-a").textContent = st.a.toFixed(0) + " mL";
    $(".n-b").textContent = st.b.toFixed(0) + " mL";
    $(".n-mb").textContent = st.mb.toFixed(2) + " mol/kg";
  }

  function measure() {
    const m = +sM.value, dPt = P50 * (1 - aw(si, m));
    const dP = L.measure(dPt, { sd: 0.012, res: 0.01 });
    tbl.add({ si, nm: SOL[si].name, m, x: xSol(m), dP, r: (P50 - dP) / P50 });
  }
  const upd = () => {
    $(".m-out").textContent = (+sM.value).toFixed(1);
    $(".g-out").textContent = (+sM.value * SOL[si].M / 10).toFixed(1);
    drawApp();
  };
  loop($(".cv-wide"), (dt) => { t += dt; drawApp(); });
  sM.addEventListener("input", upd);
  sD.addEventListener("input", () => { $(".d-out").textContent = sD.value; drawJar(); });
  $(".sol").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b) return;
    si = +b.dataset.s; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd();
  });
  $(".meas").addEventListener("click", measure);
  $(".clear").addEventListener("click", () => tbl.clear());
  if (L.demo) {
    [[0, [1, 2, 3, 5]], [1, [1, 2, 3, 4]], [2, [1, 2, 3, 4, 5]], [3, [0.5, 1, 2, 3, 4]]].forEach(([i, ms]) => { si = i; ms.forEach((m) => { sM.value = m; measure(); }); });
    si = 2; sM.value = 1; root.querySelectorAll("[data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.s === "2")));
    sD.value = 14; $(".d-out").textContent = "14";
  }
  upd();
})();
