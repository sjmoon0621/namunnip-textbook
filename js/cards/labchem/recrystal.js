/* 카드: 섞인 소금 가루에서 질산 칼륨만 골라낼 수 있을까? — 용해도 곡선과 재결정 */
(() => {
  const root = document.getElementById("card-labchem-recrystal");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 용해도 (g / 100 g 물), 0–100 °C, 10 °C 간격 문헌값 */
  const SK = [13.3, 20.9, 31.6, 45.8, 63.9, 85.5, 110, 138, 169, 202, 246];
  const SN = [35.7, 35.8, 36.0, 36.3, 36.6, 37.0, 37.3, 37.8, 38.4, 39.0, 39.8];
  const sol = (tab, T) => { const i = clamp(Math.floor(T / 10), 0, 9), u = (T - i * 10) / 10; return tab[i] + (tab[i + 1] - tab[i]) * u; };
  const MK = 40;
  let mN = 4, cool = "slow", run = null, t = 0;
  const sW = $(".w"), sTh = $(".th"), sTc = $(".tc");

  function model() {
    const W = +sW.value, Th = +sTh.value, Tc = +sTc.value, hotf = $(".hotf").checked, wash = $(".wash").checked;
    const Kd = Math.min(MK, sol(SK, Th) * W / 100), Nd = Math.min(mN, sol(SN, Th) * W / 100);
    const Ku = MK - Kd, Nu = mN - Nd;   /* 뜨거울 때 녹지 않고 남은 고체 */
    let Kc = Math.max(0, Kd - sol(SK, Tc) * W / 100), Nc = Math.max(0, Nd - sol(SN, Tc) * W / 100);
    if (!hotf) { Kc += Ku; Nc += Nu; }
    const Ks = Kd - Math.max(0, Kd - sol(SK, Tc) * W / 100), Ns = Nd - Math.max(0, Nd - sol(SN, Tc) * W / 100);
    const liqTot = W + Ks + Ns, fK = Ks / liqTot, fN = Ns / liqTot;
    const cm = Kc + Nc;
    const adhere = (cool === "fast" ? 0.3 : 0.1) * cm * (wash ? 0.1 : 1);
    const incl = (cool === "fast" ? 0.06 : 0.003) * cm;
    const lq = adhere + incl;
    const wl = wash ? Math.min(Kc, 5 * sol(SK, 2) / 100) : 0;
    const Kp = Math.max(0, Kc - wl + lq * fK), Np = Nc * (wash ? 0.97 : 1) + lq * fN;
    const notes = [];
    if (Ku > 0.01) notes.push(`${Th} °C에서 KNO₃ ${Ku.toFixed(1)} g이 <b>다 녹지 않습니다</b>.`);
    if (Nu > 0.01) notes.push(`${Th} °C에서 NaCl ${Nu.toFixed(1)} g이 녹지 않고 남습니다${hotf ? "(뜨거울 때 걸러 제거)" : ""}.`);
    if (Nc - (hotf ? 0 : Nu) > 0.01) notes.push(`식히면 NaCl ${(Nc - (hotf ? 0 : Nu)).toFixed(1)} g도 <b>결정으로 나옵니다</b>.`);
    if (!notes.length) notes.push(`가열하면 모두 녹고, ${Tc} °C로 식히면 KNO₃만 결정으로 나옵니다.`);
    return { W, Th, Tc, Kp, Np, mass: Kp + Np, yieldK: Kp / MK * 100, purity: Kp / (Kp + Np) * 100, size: cool === "fast" ? 0.4 : 3, notes, Kc, Nc };
  }
  const theoryYield = (Tc, W) => clamp((MK - Math.min(MK, sol(SK, Tc) * W / 100)) / MK * 100, 0, 100);

  const cv = fit($(".cv-wide"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "c", label: "조건(NaCl·물·가열→냉각)" }, { key: "m", label: "결정(g)", res: 0.01 },
    { key: "y", label: "수득률(%)", res: 0.1 }, { key: "p", label: "순도(%)", res: 0.1 }, { key: "s", label: "크기(mm)", res: 0.1 },
  ], () => drawPlot());

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = model(), W = m.W;
    const gw = w * 0.62, box = { x0: 40, y0: 20, w: gw - 50, h: h - 52 };
    const res = L.plot(ctx, box, { pts: [], xr: [0, 100], yr: [0, 200], xlabel: "온도 (°C)", ylabel: "용해도 (g/100 g 물)" });
    const { X, Y } = res;
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    ctx.lineWidth = 2; ctx.strokeStyle = C.forest; ctx.beginPath();
    for (let T = 0; T <= 100; T += 2) T ? ctx.lineTo(X(T), Y(sol(SK, T))) : ctx.moveTo(X(T), Y(sol(SK, T)));
    ctx.stroke();
    ctx.strokeStyle = C.amber; ctx.beginPath();
    for (let T = 0; T <= 100; T += 2) T ? ctx.lineTo(X(T), Y(sol(SN, T))) : ctx.moveTo(X(T), Y(sol(SN, T)));
    ctx.stroke();
    /* 시료 상태: 물 100 g 당 농도 */
    const cK = MK / W * 100, cN = mN / W * 100;
    const yK = Math.min(cK, sol(SK, m.Th));
    ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]); ctx.strokeStyle = C.warn;
    let Tsat = 0; for (let T = 0; T <= 100; T += 0.5) if (sol(SK, T) >= cK) { Tsat = T; break; }
    if (cK <= sol(SK, 100)) {
      ctx.beginPath(); ctx.moveTo(X(m.Th), Y(yK)); ctx.lineTo(X(Math.max(Tsat, m.Tc)), Y(yK));
      for (let T = Math.max(Tsat, m.Tc); T >= m.Tc; T -= 1) ctx.lineTo(X(T), Y(Math.min(cK, sol(SK, T))));
      ctx.stroke();
    }
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.amber; ctx.beginPath(); ctx.moveTo(X(m.Th), Y(cN)); ctx.lineTo(X(m.Tc), Y(cN)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(m.Th), Y(yK), 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(X(m.Tc), Y(Math.min(cK, sol(SK, m.Tc))), 4, 0, Math.PI * 2); ctx.fill();
    /* 결정량 화살표 */
    if (cK > sol(SK, m.Tc)) {
      const x = X(m.Tc) - 8; ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, Y(Math.min(cK, 200))); ctx.lineTo(x, Y(sol(SK, m.Tc))); ctx.stroke();
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
      ctx.fillText("결정으로 나옴", x + 6, (Y(Math.min(cK, 200)) + Y(sol(SK, m.Tc))) / 2);
    }
    ctx.restore();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.forest; ctx.fillText("KNO₃", X(60), Y(165));
    ctx.fillStyle = C.amber; ctx.fillText("NaCl", X(80), Y(38) - 6);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText(`시료: 물 100 g당 KNO₃ ${cK.toFixed(0)} g`, box.x0 + 6, box.y0 + 12);
    /* 비커 */
    const bx = gw + 20, bw = w - gw - 36, by = h * 0.22, bh = h * 0.6;
    const prog = run ? Math.min(1, run.el / run.dur) : 0;
    const Tnow = run ? m.Th + (m.Tc - m.Th) * prog : m.Th;
    const hot = clamp((Tnow - 0) / 100, 0, 1);
    ctx.fillStyle = `rgba(${Math.round(120 + 110 * hot)},${Math.round(170 - 40 * hot)},${Math.round(220 - 120 * hot)},.3)`;
    const lvl = by + bh * 0.3;
    ctx.fillRect(bx + 2, lvl, bw - 4, by + bh - lvl - 1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
    /* 결정 */
    const shown = run ? m.mass * prog : 0, big = cool === "slow";
    const nC = Math.round(big ? shown * 0.6 : shown * 3);
    ctx.fillStyle = "#f3f3f6"; ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.8;
    for (let i = 0; i < Math.min(nC, 160); i++) {
      const rx = bx + 6 + ((i * 53) % (bw - 12)), ry = by + bh - 4 - ((i * 7) % 18) - Math.floor(i / 14) * (big ? 3 : 1.2);
      const L0 = big ? 9 : 3;
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(((i * 37) % 30 - 15) / 30);
      ctx.fillRect(-L0 / 2, -1.5, L0, 3); ctx.strokeRect(-L0 / 2, -1.5, L0, 3); ctx.restore();
    }
    ctx.font = `600 12px ${F.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
    ctx.fillText(`${Tnow.toFixed(0)} °C`, bx + bw / 2, by - 10);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3;
    ctx.fillText(run ? (cool === "slow" ? "천천히 식는 중" : "얼음물에서 급랭") : "가열해 녹인 상태", bx + bw / 2, by + bh + 16);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const W = +sW.value;
    const pts = tbl.rows.map((r) => ({ x: r.tc, y: r.y }));
    const res = L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, model: (T) => theoryYield(T, W), xr: [0, 40], yr: [0, 100], xlabel: "냉각 온도 (°C)", ylabel: "KNO₃ 수득률 (%)" });
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6;
    tbl.rows.forEach((r) => { if (r.p < 99) { ctx.beginPath(); ctx.arc(res.X(r.tc), res.Y(r.y), 7, 0, Math.PI * 2); ctx.stroke(); } });
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText(`점선 = 이론 수득률 (물 ${W} g)`, w - 18, 32);
    ctx.fillStyle = C.warn; ctx.fillText("붉은 테 = 순도 99% 미만", w - 18, 47);
  }

  function record(m) {
    const mass = L.measure(m.mass, { sd: 0.02, res: 0.01 });
    const p = Math.min(100, L.measure(m.purity, { sd: 0.15, res: 0.1 }));
    tbl.add({
      c: `${mN}g·${m.W}g·${m.Th}→${m.Tc}°C·${cool === "slow" ? "서냉" : "급랭"}${$(".hotf").checked ? "·고온여과" : ""}${$(".wash").checked ? "" : "·안씻음"}`,
      m: mass, y: mass * p / 100 / MK * 100, p, s: Math.max(0.1, L.measure(m.size, { rel: 0.2, res: 0.1 })), tc: m.Tc,
    });
  }
  const info = () => { $(".rc-msg").innerHTML = model().notes.join(" "); };
  function upd() {
    $(".w-out").textContent = sW.value; $(".th-out").textContent = sTh.value; $(".tc-out").textContent = sTc.value;
    info(); draw(); drawPlot();
  }
  loop($(".cv-wide"), (dt) => {
    t += dt;
    if (run) { run.el += dt; draw(); if (run.el >= run.dur + 0.4) { record(run.m); run = null; draw(); } }
  });
  [sW, sTh, sTc].forEach((el) => el.addEventListener("input", () => { if (!run) upd(); }));
  [".hotf", ".wash"].forEach((s) => $(s).addEventListener("change", upd));
  const pick = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b || run) return;
    set(b.dataset[attr]); root.querySelectorAll(`${sel} [data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd();
  });
  pick(".mix", "m", (v) => { mN = +v; });
  pick(".cool", "c", (v) => { cool = v; });
  $(".meas").addEventListener("click", () => { if (!run) run = { m: model(), el: 0, dur: 2.2 }; });
  $(".clear").addEventListener("click", () => { run = null; tbl.clear(); });
  upd();
  if (L.demo) {
    const go = (n, W, Th, Tc, c, hf, wa) => { mN = n; sW.value = W; sTh.value = Th; sTc.value = Tc; cool = c; $(".hotf").checked = hf; $(".wash").checked = wa; record(model()); };
    [0, 10, 20, 30, 40].forEach((Tc) => go(4, 40, 80, Tc, "slow", false, true));
    go(4, 40, 80, 10, "fast", false, true);
    go(4, 40, 80, 10, "slow", false, false);
    go(20, 40, 80, 10, "slow", false, true);
    go(20, 40, 80, 10, "slow", true, true);
    mN = 4; sW.value = 40; sTh.value = 80; sTc.value = 10; cool = "slow"; $(".hotf").checked = false; $(".wash").checked = true; upd();
  }
})();
