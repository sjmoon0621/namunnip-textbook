/* 카드: 붙어 있던 두 수레가 튕겨 나가면 운동량의 합은 얼마일까? — 용수철 플런저 분리, 포토게이트, m₁v₁ + m₂v₂ = 0 */
(() => {
  const root = document.getElementById("card-labphy-explode");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const G = 9.8, CART = 0.25, BAR = 0.25, FLAG = 0.1, GATE = 0.2;
  const MU = 0.001;                         // 구름 마찰 (저마찰 트랙, 모식값)
  const TILT = G * Math.sin(0.3 * Math.PI / 180);   // 0.3° 기울기 → 0.051 m/s²
  const EK = [0, 0.06, 0.12, 0.18];          // 누름 단계별 용수철 에너지 (J, 모식값)
  const sB1 = $(".b1"), sB2 = $(".b2"), sK = $(".k"), cT = $(".tilt");
  let xKey = "p", anim = null, lastGate = null;

  const app = fit($(".cv-wide"), () => drawApp()), pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "m1", label: "m₁ (kg)", res: 0.001 }, { key: "dt1", label: "Δt₁ (s)", res: 0.0001 }, { key: "v1", label: "v₁ (m/s)", res: 0.001 },
    { key: "m2", label: "m₂ (kg)", res: 0.001 }, { key: "dt2", label: "Δt₂ (s)", res: 0.0001 }, { key: "v2", label: "v₂ (m/s)", res: 0.001 },
    { key: "p1", label: "p₁", res: 0.001 }, { key: "p2", label: "p₂", res: 0.001 }, { key: "sp", label: "Σp (kg·m/s)", res: 0.001 },
  ], () => drawPlot());
  const m1 = () => CART + BAR * +sB1.value, m2 = () => CART + BAR * +sB2.value;

  // 게이트 깃발 통과 시간: 감속 dec로 GATE만큼 간 뒤 깃발 FLAG가 지나는 시간
  function gateTime(v, dec) {
    const vg2 = v * v - 2 * dec * GATE, vf2 = vg2 - 2 * dec * FLAG;
    if (vf2 <= 0) return NaN;
    const vg = Math.sqrt(vg2), vf = Math.sqrt(vf2);
    return Math.abs(dec) < 1e-9 ? FLAG / vg : (vg - vf) / dec;
  }
  function measure() {
    const a = m1(), b = m2(), E = EK[+sK.value] * (1 + 0.04 * L.gauss());   // 용수철을 풀 때마다 에너지가 조금 다름
    const u1 = Math.sqrt(2 * E * b / (a * (a + b))), u2 = Math.sqrt(2 * E * a / (b * (a + b)));   // 속력 (참값)
    const tl = cT.checked ? TILT : 0;
    const dt1 = L.measure(gateTime(u1, MU * G + tl), { sd: 0.00005, res: 0.0001 });
    const dt2 = L.measure(gateTime(u2, MU * G - tl), { sd: 0.00005, res: 0.0001 });
    const v1 = -FLAG / dt1, v2 = FLAG / dt2;
    return { u1, u2, rec: { m1: a, dt1, v1, m2: b, dt2, v2, p1: a * v1, p2: b * v2, sp: a * v1 + b * v2 } };
  }

  function cart(ctx, x, y, cw, bars, flip, s) {
    ctx.fillStyle = "#3f6fa3"; ctx.fillRect(x - cw / 2, y - 14, cw, 12);
    ctx.fillStyle = "#26272a"; [-0.32, 0.32].forEach((k) => { ctx.beginPath(); ctx.arc(x + k * cw, y, 4, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = "#8d8d92"; for (let i = 0; i < bars; i++) ctx.fillRect(x - cw * 0.38, y - 20 - i * 6, cw * 0.76, 5);
    const fx = x + (flip ? 0.25 : -0.25) * cw;   // 깃발 (폭 10 cm)
    ctx.fillStyle = "rgba(35,35,38,.75)"; ctx.fillRect(fx - FLAG * s / 2, y - 46, FLAG * s, 10);
    ctx.fillRect(fx - 1, y - 36, 2, 22);
  }
  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = (w - 30) / 1.2, cx = w / 2, ty = h * 0.66, cw = 0.17 * s;
    ctx.fillStyle = "#c9c9c4"; ctx.fillRect(10, ty + 4, w - 20, 7);
    ctx.fillStyle = C.ink2; ctx.fillRect(10, ty - 10, 4, 21); ctx.fillRect(w - 14, ty - 10, 4, 21);
    // 게이트: 깃발 가운데가 GATE만큼 갔을 때 지나는 위치
    const gx = [cx - cw * 0.75 - GATE * s - 0.05 * s, cx + cw * 0.75 + GATE * s + 0.05 * s];
    gx.forEach((x) => { ctx.fillStyle = C.forest; ctx.fillRect(x - 3, ty - 72, 6, 30); ctx.fillRect(x - 3, ty - 72, 18, 4); });
    let d1 = 0, d2 = 0;
    if (anim) { d1 = Math.min(anim.u1 * anim.el, 0.38); d2 = Math.min(anim.u2 * anim.el, 0.38); }
    const x1 = cx - cw / 2 - d1 * s, x2 = cx + cw / 2 + d2 * s;
    // 용수철 플런저 (수레 1 오른쪽 끝)
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.beginPath();
    const ox = x1 + cw / 2;
    for (let i = 0; i <= 8; i++) { const xx = ox + (anim ? 0.035 * s : 4) * i / 8, yy = ty - 8 + (i % 2 ? -4 : 4); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, ty - 8); }
    ctx.stroke();
    cart(ctx, x1, ty, cw, +sB1.value, false, s); cart(ctx, x2, ty, cw, +sB2.value, true, s);
    ctx.fillStyle = "#fff"; ctx.font = `600 10px ${F.sans}`; ctx.textAlign = "center";
    ctx.fillText("1", x1, ty - 4); ctx.fillText("2", x2, ty - 4);
    // 게이트 읽기
    ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink2;
    const r = lastGate;
    ctx.textAlign = "left"; ctx.fillText(r ? `Δt₁ ${r.dt1.toFixed(4)} s` : "게이트 1", 14, 18);
    ctx.textAlign = "right"; ctx.fillText(r ? `Δt₂ ${r.dt2.toFixed(4)} s` : "게이트 2", w - 14, 18);
    ctx.textAlign = "center"; ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`;
    ctx.fillText("← −", 40, ty + 26); ctx.fillText("+ →", w - 40, ty + 26);
    if (cT.checked) ctx.fillText("오른쪽이 0.3° 낮음", cx, ty + 26);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows;
    const pts = xKey === "p" ? rows.map((r) => ({ x: r.p2, y: -r.p1 })) : rows.map((r) => ({ x: r.m1 / r.m2, y: r.v2 / -r.v1 }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y), true) : null;
    const o = xKey === "p" ? { xlabel: "m₂v₂ (kg·m/s)", ylabel: "m₁|v₁| (kg·m/s)", xr: [0, 0.4], yr: [0, 0.4] } : { xlabel: "m₁/m₂", ylabel: "v₂/|v₁|", xr: [0, 3.3], yr: [0, 3.3] };
    L.plot(ctx, { x0: 50, y0: 18, w: w - 64, h: h - 52 }, { pts, fit: ft, model: (x) => x, ...o });
    $(".n-a").textContent = ft ? `${ft.a.toFixed(3)} ± ${ft.sa.toFixed(3)}` : "점 2개 이상";
    if (rows.length) {
      const sp = L.stats(rows.map((r) => r.sp)).mean, pm = L.stats(rows.map((r) => (Math.abs(r.p1) + Math.abs(r.p2)) / 2)).mean;
      $(".n-r").textContent = `${(sp / pm * 100).toFixed(1)} %`;
      const r = rows[rows.length - 1];
      $(".n-k").textContent = `${(0.5 * r.m1 * r.v1 ** 2 + 0.5 * r.m2 * r.v2 ** 2).toFixed(3)} J`;
    } else { $(".n-r").textContent = "—"; $(".n-k").textContent = "—"; }
  }

  loop($(".cv-wide"), (dt) => {
    if (!anim) return;
    anim.el += dt * 0.6;
    if (anim.el > 0.4 / Math.min(anim.u1, anim.u2) + 0.3 || anim.el > 4) { tbl.add(anim.rec); lastGate = anim.rec; anim = null; }
    drawApp();
  });
  const upd = () => {
    $(".b1-out").textContent = sB1.value; $(".b2-out").textContent = sB2.value; $(".k-out").textContent = sK.value;
    $(".m1-out").textContent = m1().toFixed(3); $(".m2-out").textContent = m2().toFixed(3);
    if (!anim) drawApp();
  };
  [sB1, sB2, sK].forEach((el) => el.addEventListener("input", () => { lastGate = null; upd(); }));
  cT.addEventListener("change", () => drawApp());
  $(".fire").addEventListener("click", () => { if (!anim) anim = { ...measure(), el: 0 }; });
  $(".clear").addEventListener("click", () => { anim = null; lastGate = null; tbl.clear(); drawApp(); });
  $(".xsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-x]"); if (!b) return;
    xKey = b.dataset.x; root.querySelectorAll("[data-x]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawPlot();
  });
  upd();
  if (L.demo) {
    [[0, 0, 2], [1, 0, 2], [2, 0, 2], [0, 1, 2], [0, 2, 2], [1, 2, 3], [2, 1, 1], [1, 1, 3]].forEach(([a, b, k]) => {
      sB1.value = a; sB2.value = b; sK.value = k; const r = measure().rec; tbl.add(r); lastGate = r;
    });
    upd();
  }
})();
