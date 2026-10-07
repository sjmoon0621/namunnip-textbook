/* 카드: 사하라 사막과 아마존 밀림은 같은 순환의 두 얼굴일까? — 재분석 자오면 순환·강수·지상풍(실제 자료)과 회전 접시 실험(모식) */
(() => {
  const root = document.getElementById("card-labearth-circulation");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab, Z = window.LEZonal;
  const $ = (s) => root.querySelector(s);
  const sM = $(".mon"), sR = $(".rpm");
  const MON = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  let view = "earth", hl = null, selLat = null, t = 0;
  const parts = Array.from({ length: 90 }, (_, i) => ({ r: (i * 0.618) % 1, th: i * 2.4, off: ((i * 0.37) % 1) - 0.5 }));

  /* 회전 접시 (모식): 열 로스비 수와 흐름 모양 */
  const RO_K = 9.8 * 2.07e-4 * 10 * 0.05 / (0.11 * 0.11);   // gαΔTd/(b−a)²
  const OMC = Math.sqrt(RO_K / 1.58);
  function dish() {
    const W = +sR.value * 2 * Math.PI / 60, ro = W > 0 ? RO_K / (W * W) : Infinity, k = W / OMC;
    if (k <= 1) return { W, ro, reg: W === 0 ? "회전 없음 (한 세포)" : "축대칭 (해들리형)", m: 0 };
    if (k > 6.2) return { W, ro, reg: "불규칙 파동", m: NaN };
    return { W, ro, reg: "규칙적인 파동 (로스비파)", m: Math.min(6, Math.max(2, Math.round(1 + 0.75 * k))) };
  }

  const PH = {
    desert: { b: [[15, 35], [-35, -15]], t: "사막: 해들리 세포가 내려앉는 위도 15~35°입니다. 하강하는 공기는 단열 압축으로 데워지고 상대 습도가 낮아져 구름이 생기기 어렵습니다(사하라, 아라비아, 칼라하리, 오스트레일리아 사막). 아래 그래프의 강수 극소와 겹쳐 보세요." },
    rain: { b: [[-10, 10]], t: "열대 우림: 무역풍이 모이는 열대 수렴대(ITCZ)에서 공기가 상승해 거의 날마다 소나기가 내립니다(아마존, 콩고, 인도네시아). ITCZ는 해를 따라 남북으로 오르내려 그 가장자리에는 우기와 건기가 번갈아 나타납니다." },
    trade: { b: [[5, 30], [-30, -5]], t: "무역풍: 해들리 세포의 아래쪽 가지에서 적도로 돌아가는 공기가 전향력을 받아 북반구에서는 북동풍, 남반구에서는 남동풍이 됩니다. 아래 그래프에서 지상 동서풍이 음수(동풍)인 위도입니다." },
    west: { b: [[35, 60], [-60, -35]], t: "편서풍: 페렐 세포의 아래쪽에서 극 쪽으로 가는 공기가 동쪽으로 휘어 서풍이 됩니다. 남반구 40~60°에는 막는 대륙이 없어 '울부짖는 40도대'라 불릴 만큼 강합니다. 우리나라 날씨가 서쪽에서 동쪽으로 바뀌어 가는 까닭입니다." },
    jet: { b: [[25, 45], [-50, -25]], t: "제트 기류: 해들리 세포의 위쪽 가지가 극 쪽으로 가며 각운동량을 보존해 동쪽으로 빨라지고, 남북 온도 차가 큰 곳에서 상층 서풍이 강해집니다. 200 hPa 동서풍이 가장 센 위도로, 겨울 반구에서 더 강하고 적도 쪽으로 내려옵니다." },
    front: { b: [[55, 70], [-70, -55]], t: "한대 전선: 극에서 내려온 찬 공기(극순환)와 중위도의 따뜻한 공기가 만나는 위도 60° 부근으로, 온대 저기압이 자주 생기고 강수가 다시 늘어납니다." },
  };

  const cv = fit($(".ci-cv"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "ex", label: "실험" }, { key: "cond", label: "조건" }, { key: "item", label: "항목" }, { key: "val", label: "읽은 값" },
  ], () => { drawPlot(); draw(); });

  const mi = () => +sM.value - 1;
  const latIdx = (la) => Math.round((90 - la) / 2.5);
  const pr = (m, la) => { const j = Math.min(71, Math.max(0, Math.round((la + 88.75) / 2.5))); return Z.pr[m][j]; };
  const fmtLat = (la) => (Math.abs(la) < 0.01 ? "0°" : Math.abs(la).toFixed(1) + "°" + (la > 0 ? "N" : "S"));
  let geo = null;

  function psiCol(v) {
    const k = Math.max(-1, Math.min(1, v / 16)), a = Math.abs(k), base = [244, 245, 240];
    const tg = k > 0 ? [214, 120, 60] : [60, 110, 190];
    return `rgb(${base.map((b, i) => Math.round(b + (tg[i] - b) * Math.pow(a, 0.8))).join(",")})`;
  }

  function drawEarth(ctx, w, h) {
    const m = mi(), x0 = 40, ww = w - 40 - 34;
    const top = { y0: 22, h: h * 0.47 }, bot = { y0: h * 0.47 + 66, h: h * 0.33 };
    const X = (la) => x0 + (la + 90) / 180 * ww;
    const Yp = (p) => top.y0 + (p - 100) / 900 * top.h;
    geo = { X, x0, ww, top, bot };
    /* 유선 함수 칸 */
    const lev = Z.lev;
    for (let j = 0; j < Z.lat.length; j++) {
      const la = Z.lat[j], xa = X(Math.min(90, la + 1.25)), xb = X(Math.max(-90, la - 1.25));
      for (let k = 0; k < lev.length; k++) {
        const v = Z.psi[m][k][j]; if (v == null || (la <= -67.5 && lev[k] > 700)) continue;   // 남극 대륙 땅속 자료는 그리지 않음
        const pu = k === lev.length - 1 ? 100 : (lev[k] + lev[k + 1]) / 2, pd = k === 0 ? 1000 : (lev[k] + lev[k - 1]) / 2;
        ctx.fillStyle = psiCol(v); ctx.fillRect(xb, Yp(pu), xa - xb + 0.6, Yp(pd) - Yp(pu) + 0.6);
      }
    }
    /* 축 */
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(x0, top.y0, ww, top.h);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [200, 400, 600, 800, 1000].forEach((p) => ctx.fillText(String(p), x0 - 4, Yp(p) + 3));
    ctx.textAlign = "left"; ctx.fillText("hPa", 4, top.y0 - 6);
    ctx.textAlign = "center";
    for (let la = -90; la <= 90; la += 30) ctx.fillText(la === 0 ? "0" : Math.abs(la) + (la > 0 ? "N" : "S"), X(la), top.y0 + top.h + 13);
    /* 세포 이름: 각 띠에서 |ψ|가 가장 큰 곳 */
    const k5 = lev.indexOf(500);
    const name = (lo, hi, label) => {
      let best = null;
      for (let j = 0; j < Z.lat.length; j++) { const la = Z.lat[j]; if (la < lo || la > hi) continue; const v = Math.abs(Z.psi[m][k5][j]); if (!best || v > best.v) best = { la, v }; }
      if (!best) return;
      ctx.font = `600 10.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.fillText(label, X(best.la), Yp(500) + 4);
    };
    name(-30, 30, "해들리"); name(30, 65, "페렐"); name(-65, -30, "페렐"); name(65, 88, "극"); name(-88, -65, "극");
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(`자오면 순환 · ${MON[m]}`, x0, top.y0 - 6);
    /* 아래: 강수 막대 + 지상 동서풍 */
    const PMAX = 10, UMAX = 10, Yr = (v) => bot.y0 + bot.h - v / PMAX * bot.h, Yu = (u) => bot.y0 + bot.h / 2 - u / UMAX * bot.h / 2;
    ctx.strokeStyle = C.rule; ctx.strokeRect(x0, bot.y0, ww, bot.h);
    ctx.fillStyle = "rgba(59,124,42,.45)";
    for (let j = 0; j < 72; j++) { const la = Z.plat[j], v = Z.pr[m][j]; if (v == null) continue; const xa = X(la - 1.25), xb = X(la + 1.25); ctx.fillRect(xa, Yr(Math.min(PMAX, v)), xb - xa - 0.5, bot.y0 + bot.h - Yr(Math.min(PMAX, v))); }
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(x0, Yu(0)); ctx.lineTo(x0 + ww, Yu(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath();
    Z.lat.forEach((la, j) => { const u = Z.usfc[m][j]; const x = X(la), y = Yu(Math.max(-UMAX, Math.min(UMAX, u))); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [0, 5, 10].forEach((v) => ctx.fillText(String(v), x0 - 4, Yr(v) + 3));
    ctx.textAlign = "left";
    [-10, 0, 10].forEach((v) => ctx.fillText((v > 0 ? "+" : "") + v, x0 + ww + 4, Yu(v) + 3));
    ctx.textAlign = "center";
    for (let la = -90; la <= 90; la += 30) ctx.fillText(la === 0 ? "0" : Math.abs(la) + (la > 0 ? "N" : "S"), X(la), bot.y0 + bot.h + 13);
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.forest; ctx.fillText("■ 강수 (mm/일, 왼쪽)", x0, bot.y0 - 8);
    ctx.fillStyle = C.warn; ctx.fillText("— 지상 동서풍 (m/s, 오른쪽, + 서풍)", x0 + 128, bot.y0 - 8);
    /* 현상 띠 */
    if (hl) {
      ctx.fillStyle = "rgba(224,160,42,.22)"; ctx.strokeStyle = C.amber; ctx.lineWidth = 1.2;
      PH[hl].b.forEach(([a, b]) => {
        [top, bot].forEach((pn) => { ctx.fillRect(X(a), pn.y0, X(b) - X(a), pn.h); ctx.strokeRect(X(a), pn.y0, X(b) - X(a), pn.h); });
      });
    }
    /* 고른 위도 */
    if (selLat != null) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      [top, bot].forEach((pn) => { ctx.beginPath(); ctx.moveTo(X(selLat), pn.y0); ctx.lineTo(X(selLat), pn.y0 + pn.h); ctx.stroke(); });
    }
    /* 기록 */
    tbl.rows.filter((r) => r.ex === "지구" && r.mon === m + 1).forEach((r) => {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(r.lat), bot.y0 + bot.h - 4, 3, 0, Math.PI * 2); ctx.fill();
    });
  }

  function drawDish(ctx, w, h) {
    const d = dish(), cx = w / 2, cy = h * 0.48, Rb = Math.min(w, h) * 0.42, Ra = Rb * 4 / 15, rm = (Ra + Rb) / 2;
    const g = ctx.createRadialGradient(cx, cy, Ra, cx, cy, Rb);
    g.addColorStop(0, "#d6e3f0"); g.addColorStop(1, "#f3dccb");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Rb, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#b9d0e8"; ctx.beginPath(); ctx.arc(cx, cy, Ra, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink2;
    ctx.fillText("얼음 (차가움)", cx, cy + 4);
    ctx.fillText("데운 가장자리", cx, cy + Rb + 16);
    /* 흐름의 중심선 r_j(θ) */
    const amp = d.m ? (Rb - Ra) * 0.28 : 0, m = d.m || 0, irr = Number.isNaN(d.m);
    const rj = (th) => {
      if (irr) return rm + (Rb - Ra) * (0.16 * Math.sin(5 * (th - 0.25 * t)) + 0.12 * Math.sin(7 * (th + 0.4 * t) + 1.3) + 0.06 * Math.sin(3 * th - t));
      return rm + amp * Math.sin(m * (th - 0.15 * t));
    };
    ctx.strokeStyle = "rgba(181,83,47,.75)"; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 240; i++) { const th = i / 240 * 2 * Math.PI, r = rj(th); const x = cx + r * Math.cos(th), y = cy - r * Math.sin(th); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    /* 떠다니는 알갱이 */
    ctx.fillStyle = C.ink;
    parts.forEach((p) => {
      let x, y;
      if (d.W === 0) {   // 회전 없음: 위층 물이 가운데로 모임
        const r = Rb - ((p.r + t * 0.05) % 1) * (Rb - Ra); x = cx + r * Math.cos(p.th); y = cy - r * Math.sin(p.th);
      } else if (!d.m && !irr) {   // 축대칭: 거의 동심원으로 돌며 조금씩 안쪽으로
        const r = Rb - ((p.r + t * 0.02) % 1) * (Rb - Ra), th = p.th + t * 0.5 * (r / Rb); x = cx + r * Math.cos(th); y = cy - r * Math.sin(th);
      } else {
        const th = p.th + t * 0.45, r = Math.min(Rb - 4, Math.max(Ra + 4, rj(th) + p.off * (Rb - Ra) * 0.55)); x = cx + r * Math.cos(th); y = cy - r * Math.sin(th);
      }
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
    });
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(`위에서 본 회전 접시 · ${(+sR.value).toFixed(1)} rpm (반시계 방향)`, 8, 16);
  }

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    view === "earth" ? drawEarth(ctx, w, h) : drawDish(ctx, w, h);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 22, w: w - 58, h: h - 56 };
    if (view === "earth") {
      const o = { xr: [0, 13], yr: [-40, 40], xlabel: "월", ylabel: "위도 (°, 북 +)" };
      const R = tbl.rows.filter((r) => r.ex === "지구");
      L.plot(ctx, box, { ...o, pts: R.filter((r) => r.k === "itcz").map((r) => ({ x: r.mon, y: r.lat })), color: C.forest });
      L.plot(ctx, box, { ...o, pts: R.filter((r) => r.k === "u0").map((r) => ({ x: r.mon, y: r.lat })), color: C.warn });
      L.plot(ctx, box, { ...o, pts: R.filter((r) => r.k === "dry").map((r) => ({ x: r.mon, y: r.lat })), color: C.amber });
      ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillStyle = C.forest; ctx.fillText("● ITCZ", 52, 36); ctx.fillStyle = C.amber; ctx.fillText("● 건조대", 110, 36); ctx.fillStyle = C.warn; ctx.fillText("● 무역풍↔편서풍", 176, 36);
    } else {
      const R = tbl.rows.filter((r) => r.ex === "접시" && Number.isFinite(r.mm));
      L.plot(ctx, box, { pts: R.map((r) => ({ x: r.rpm, y: r.mm })), xr: [0, 15], yr: [0, 7], xlabel: "회전 속도 (rpm)", ylabel: "파수 (축대칭은 0)" });
    }
  }

  function readout() {
    if (view !== "earth") { $(".ci-read").textContent = ""; return; }
    if (selLat == null) { $(".ci-read").textContent = "아래 그래프를 눌러 위도를 고르세요."; return; }
    const m = mi(), j = latIdx(selLat);
    $(".ci-read").textContent = `${fmtLat(selLat)} · 강수 ${pr(m, selLat).toFixed(1)} mm/일 · 지상 동서풍 ${Z.usfc[m][j].toFixed(1)} m/s · 200 hPa 동서풍 ${Z.u200[m][j].toFixed(1)} m/s · 해면 기압 ${Z.slp[m][j].toFixed(1)} hPa`;
  }
  function dishNums() {
    const d = dish();
    $(".r-out").textContent = (+sR.value).toFixed(1);
    $(".n-ro").textContent = Number.isFinite(d.ro) ? d.ro.toFixed(2) : "∞";
    $(".n-reg").textContent = d.reg;
    $(".n-m").textContent = d.m ? String(d.m) : Number.isNaN(d.m) ? "일정하지 않음" : "0";
  }

  $(".ci-cv").addEventListener("pointerdown", (e) => {
    if (view !== "earth" || !geo) return;
    const r = $(".ci-cv").getBoundingClientRect(), x = e.clientX - r.left;
    if (x < geo.x0 || x > geo.x0 + geo.ww) return;
    selLat = Math.round(((x - geo.x0) / geo.ww * 180 - 90) / 2.5) * 2.5; readout(); draw();
  });
  function recordEarth(k) {
    if (selLat == null) return;
    const m = mi(), name = { itcz: "강수 최대(ITCZ)", dry: "아열대 건조대", u0: "동풍↔서풍 경계" }[k];
    tbl.add({ ex: "지구", cond: MON[m], item: name, val: fmtLat(selLat), k, mon: m + 1, lat: selLat });
  }
  root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => recordEarth(b.dataset.k)));
  $(".rec-d").addEventListener("click", () => {
    const d = dish();
    tbl.add({ ex: "접시", cond: (+sR.value).toFixed(1) + " rpm", item: d.reg, val: d.m ? "파수 " + d.m : Number.isNaN(d.m) ? "파수 불규칙" : "파 없음", rpm: +sR.value, mm: Number.isNaN(d.m) ? NaN : d.m });
  });
  $(".clear").addEventListener("click", () => tbl.clear());
  sM.addEventListener("input", () => { $(".m-out").textContent = sM.value; readout(); draw(); });
  sR.addEventListener("input", dishNums);
  $(".phen").addEventListener("click", (e) => {
    const b = e.target.closest("[data-h]"); if (!b) return;
    hl = hl === b.dataset.h ? null : b.dataset.h;
    root.querySelectorAll("[data-h]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.h === hl)));
    $(".ci-ph").textContent = hl ? PH[hl].t : ""; draw();
  });
  $(".modes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    view = b.dataset.v; root.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $(".ci-earth").classList.toggle("ci-hide", view !== "earth"); $(".ci-dish").classList.toggle("ci-hide", view !== "dish");
    readout(); draw(); drawPlot();
  });
  loop($(".ci-cv"), (dt) => { if (view !== "dish") return false; t += dt; draw(); });
  dishNums(); readout();
  if (L.demo) {
    /* 각 달의 ITCZ(10°S~20°N 사이 강수 최대)와 북반구 동풍→서풍 경계를 자료에서 읽어 기록 */
    [1, 4, 7, 10].forEach((mo) => {
      sM.value = mo; const m = mo - 1;
      let best = null; for (let la = -15; la <= 20; la += 2.5) { const v = pr(m, la); if (!best || v > best.v) best = { la, v }; }
      selLat = best.la; recordEarth("itcz");
      let dry = null; for (let la = 10; la <= 40; la += 2.5) { const v = pr(m, la); if (!dry || v < dry.v) dry = { la, v }; }
      selLat = dry.la; recordEarth("dry");
      for (let la = 10; la <= 50; la += 2.5) { if (Z.usfc[m][latIdx(la)] > 0) { selLat = la; break; } }
      recordEarth("u0");
    });
    [[1, 0], [3, 0], [5, 0], [8, 0], [12, 0]].forEach(([r]) => { sR.value = r; dishNums(); $(".rec-d").click(); });
    sR.value = 1; dishNums();
    sM.value = 7; $(".m-out").textContent = "7"; selLat = 22.5; hl = "desert";
    root.querySelector('[data-h="desert"]').setAttribute("aria-pressed", "true"); $(".ci-ph").textContent = PH.desert.t; readout();
  }
})();
