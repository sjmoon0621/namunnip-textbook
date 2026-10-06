/* 카드: 지시약 없이 적정이 끝난 순간을 어떻게 알까? — KMnO₄ 산화·환원 적정 (H₂O₂, Fe²⁺, 옥살산) */
(() => {
  const root = document.getElementById("card-labchem-redox-titration");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  const CK = 0.0200;
  /* 시료: 부피(mL), 참 농도(M), MnO₄⁻ / 환원제 몰 비, 상온 반응 시간 상수(s) */
  const S = {
    h2o2: { name: "H₂O₂", va: 10.00, c: +(0.0850 + 0.004 * Math.random()).toFixed(4), ratio: 2 / 5, tau: 3 },
    fe: { name: "Fe²⁺", va: 20.00, c: +(0.0880 + 0.006 * Math.random()).toFixed(4), ratio: 1 / 5, tau: 0.3 },
    ox: { name: "옥살산", va: 20.00, c: +(0.0440 + 0.004 * Math.random()).toFixed(4), ratio: 2 / 5, tau: 40 },
  };
  const ACID = { h2so4: "H₂SO₄", hcl: "HCl", none: "없음" };
  let smp = "h2o2", acid = "h2so4", tr = null, shown = false;

  const tbl = L.table($(".tbl-host"), [
    { key: "s", label: "시료" }, { key: "a", label: "산·가열" }, { key: "v0", label: "처음 (mL)", res: 0.01 }, { key: "v1", label: "나중 (mL)", res: 0.01 },
    { key: "dv", label: "부피 (mL)", res: 0.01 }, { key: "c", label: "시료 (M)", res: 0.0001 }, { key: "x", label: "원액 %" },
  ], () => { drawPlot(); nums(); });
  const app = fit($(".cv-wide"), () => drawApp());
  const pl = fit($(".cv-plot"), () => drawPlot());

  /* 종말점까지 실제로 소모되는 MnO₄⁻ 몰수 */
  function need() {
    const s = S[smp], heat = $(".heat").checked;
    let n = s.c * s.va / 1000 * s.ratio;
    if (smp === "h2o2" && heat) n *= 0.9;          // 데우면 H₂O₂ 일부가 저절로 분해
    if (acid === "hcl") n *= 1.03;                 // Cl⁻의 산화로 더 소모
    if (acid === "none") n *= 5 / 3;               // MnO₂까지만 환원 (전자 3개)
    return n;
  }
  function fresh() {
    const r0 = 0.2 + 1.3 * Math.random();
    tr = { r0, v: 0, read0: L.snap(r0 + 0.02 * L.gauss(), 0.01), u: 0, r: 0, need: need(), pink: 0, t: 0 };
    drawApp();
  }
  const add = (dv) => { tr.v += dv; tr.u += CK * dv / 1000; };
  const drop = () => 0.05 * (1 + 0.15 * L.gauss());
  /* 시간 dt(s) 동안 반응 진행: 남은 MnO₄⁻ u가 환원제와 반응, Mn²⁺가 쌓일수록 빨라짐 */
  function step(dt) {
    const s = S[smp], f = tr.r / tr.need;
    let tau = s.tau / (1 + 12 * f);
    if (smp === "ox" && $(".heat").checked) tau = 1.5 / (1 + 5 * f);
    const left = Math.max(0, tr.need - tr.r), d = Math.min(tr.u, left) * (1 - Math.exp(-dt / tau));
    tr.u -= d; tr.r += d;
    if (acid === "hcl" && left <= 0) tr.u *= Math.exp(-dt / 70);   // Cl⁻가 남은 MnO₄⁻를 천천히 없앰
    const conc = tr.u / ((S[smp].va + 10 + tr.v) / 1000);
    tr.pink = conc > 2e-6 ? tr.pink + dt : 0;
    tr.t += dt;
  }
  function record() {
    if (!tr || tr.v <= 0) return;
    const s = S[smp], read1 = L.snap(tr.r0 + tr.v + 0.02 * L.gauss(), 0.01), dv = read1 - tr.read0;
    const c = CK * dv / 1000 / s.ratio / (s.va / 1000);
    tbl.add({ s: s.name, a: ACID[acid] + ($(".heat").checked ? "·가열" : ""), sk: smp, ak: acid, hk: $(".heat").checked, v0: tr.read0, v1: read1, dv, c,
      x: smp === "h2o2" ? (c * 10 * 34.01 / 10).toFixed(2) : "—" });
    fresh();
  }

  function drawApp() {
    const { ctx } = app, { w, h } = app.size; if (!w || !tr) return;
    ctx.clearRect(0, 0, w, h);
    const bx = w * 0.14, bt = 8, bb = h * 0.6, bw = 12;
    const read = tr.r0 + tr.v, yOf = (ml) => bt + 10 + (bb - bt - 20) * ml / 50;
    ctx.fillStyle = "rgba(110,30,120,.85)"; ctx.fillRect(bx - bw / 2, yOf(read), bw, bb - yOf(read));
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.strokeRect(bx - bw / 2, bt, bw, bb - bt);
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "right";
    for (let ml = 0; ml <= 50; ml += 5) { const y = yOf(ml); ctx.fillRect(bx - bw / 2, y, ml % 10 ? 4 : 7, 1); if (ml % 10 === 0) ctx.fillText(ml, bx - bw / 2 - 3, y + 3); }
    ctx.fillStyle = C.ink2; ctx.fillRect(bx - 9, bb, 18, 7); ctx.fillRect(bx - 2, bb + 7, 4, 12);
    // 플라스크: 분홍(남은 MnO₄⁻)과 갈색(MnO₂)
    const fy = h * 0.72, fb = h - 14, fw = Math.min(90, w * 0.2);
    const conc = tr.u / ((S[smp].va + 10 + tr.v) / 1000);
    const pinkA = Math.min(0.85, conc * 4e4), brownA = acid === "none" ? Math.min(0.7, 0.75 * tr.r / tr.need) : 0;
    const body = () => { ctx.beginPath(); ctx.moveTo(bx - fw * 0.36, fy + 18); ctx.lineTo(bx + fw * 0.36, fy + 18); ctx.lineTo(bx + fw / 2, fb); ctx.lineTo(bx - fw / 2, fb); ctx.closePath(); };
    ctx.fillStyle = "rgba(225,235,245,.6)"; body(); ctx.fill();
    ctx.fillStyle = `rgba(200,40,150,${pinkA})`; body(); ctx.fill();
    if (brownA) { ctx.fillStyle = `rgba(120,75,30,${brownA})`; body(); ctx.fill(); }
    ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(bx - 8, fy - 6); ctx.lineTo(bx - 8, fy + 6); ctx.lineTo(bx - fw / 2, fb); ctx.lineTo(bx + fw / 2, fb); ctx.lineTo(bx + 8, fy + 6); ctx.lineTo(bx + 8, fy - 6); ctx.stroke();
    if ($(".heat").checked) { ctx.fillStyle = C.ink2; ctx.fillRect(bx - fw / 2 - 8, fb + 2, fw + 16, 8); ctx.fillStyle = C.apple; ctx.fillRect(bx - fw / 2, fb + 4, fw, 3); }
    // 눈금 확대: 보라색이라 메니스커스 위쪽 끝을 읽는다
    const zx = w * 0.3, zw = w * 0.2, zt = 14, zh = h * 0.6, zc = zt + zh / 2, sc = zh / 1.2;
    ctx.save(); ctx.beginPath(); ctx.rect(zx, zt, zw, zh); ctx.clip();
    ctx.fillStyle = "#fbfbf8"; ctx.fillRect(zx, zt, zw, zh);
    ctx.fillStyle = "rgba(110,30,120,.85)"; ctx.beginPath(); ctx.moveTo(zx, zc); ctx.quadraticCurveTo(zx + zw / 2, zc + 14, zx + zw, zc); ctx.lineTo(zx + zw, zt + zh); ctx.lineTo(zx, zt + zh); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.ink; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    for (let k = Math.ceil((read - 0.6) * 10); k <= (read + 0.6) * 10; k++) {
      const ml = k / 10, y = zc + (ml - read) * sc;
      ctx.fillStyle = y > zc ? "#f3e9f5" : C.ink;
      ctx.fillRect(zx, y, k % 10 ? (k % 5 ? zw * 0.25 : zw * 0.4) : zw * 0.55, 1);
      if (k % 5 === 0) ctx.fillText(k % 10 ? ml.toFixed(1) : String(ml), zx + zw * 0.6, y + 4);
    }
    ctx.restore();
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(zx, zt, zw, zh);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("눈금 확대 (위쪽 끝)", zx + zw / 2, zt + zh + 14);
    // 읽기
    const tx = w * 0.56; ctx.textAlign = "left";
    const kw = Math.min(86, (w - tx) * 0.42), line = (y, k, v, col) => { ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText(k, tx, y); let fs = 13; ctx.font = `600 ${fs}px ${F.mono}`; while (fs > 9 && ctx.measureText(v).width > w - tx - kw - 4) { fs -= 0.5; ctx.font = `600 ${fs}px ${F.mono}`; } ctx.fillStyle = col || C.ink; ctx.fillText(v, tx + kw, y); };
    const s = S[smp];
    line(28, "시료", `${s.name} ${s.va.toFixed(2)} mL`);
    line(50, "산", acid === "none" ? "넣지 않음" : `${ACID[acid]} 10 mL`);
    line(72, "KMnO₄", "0.0200 M");
    line(98, "처음 눈금", `${tr.read0.toFixed(2)} mL`);
    line(120, "넣은 양(대략)", `${tr.v.toFixed(2)} mL`, C.ink2);
    line(146, "분홍 유지", tr.pink > 0 ? `${Math.min(99, tr.pink).toFixed(0)} s` : "—", tr.pink >= 30 ? C.forest : C.warn);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText(brownA > 0.15 ? "갈색 앙금(MnO₂)이 생겨 색을 판단하기 어렵습니다" : "연분홍이 30초 넘게 남는 첫 방울에서 기록하세요", tx, h - 12);
  }

  /* 조건별 부피: 가로축은 조건, 세로축은 부피 */
  const COND = [["h2so4", false, "H₂SO₄"], ["h2so4", true, "H₂SO₄ 가열"], ["hcl", false, "HCl"], ["none", false, "산 없음"]];
  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 18, w: w - 58, h: h - 58 };
    const rows = tbl.rows.filter((r) => r.sk === smp);
    const ci = (r) => { const i = COND.findIndex(([a, hh]) => a === r.ak && (a !== "h2so4" || hh === r.hk)); return i < 0 ? 0 : i; };
    const pts = rows.map((r, k) => ({ x: ci(r) + 1 + 0.08 * ((k % 5) - 2), y: r.dv }));
    const ys = pts.map((p) => p.y), lo = ys.length ? Math.floor(Math.min(...ys) - 1) : 0, hi = ys.length ? Math.ceil(Math.max(...ys) + 1) : 40;
    const P = L.plot(ctx, box, { pts, xr: [0.4, 4.6], yr: [Math.max(0, lo), hi], ylabel: `${S[smp].name} 적정 부피 (mL)` });
    ctx.fillStyle = C.card; ctx.fillRect(box.x0, box.y0 + box.h + 4, box.w, 16);
    ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
    COND.forEach(([, , lab], i) => ctx.fillText(lab, P.X(i + 1), box.y0 + box.h + 16));
    if (!rows.length) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.fillText("기록한 적정 부피가 조건별로 쌓입니다", box.x0 + box.w / 2, box.y0 + box.h / 2); }
  }

  function concord(rows) {
    const v = rows.map((r) => r.dv).sort((a, b) => a - b); let best = null;
    for (let i = 0; i < v.length; i++) { const g = v.filter((x) => x >= v[i] && x <= v[i] + 0.1001); if (g.length >= 2 && (!best || g.length > best.length)) best = g; }
    return best;
  }
  function nums() {
    const s = S[smp], g = concord(tbl.rows.filter((r) => r.sk === smp && r.ak === "h2so4" && (smp === "ox" ? r.hk : !r.hk)));
    if (g) {
      const m = L.stats(g).mean, c = CK * m / s.ratio / s.va;
      $(".n-c").textContent = `${g.length}회, ${m.toFixed(2)} mL`;
      $(".n-m").textContent = smp === "h2o2" ? `${c.toFixed(4)} M (원액 ${(c * 34.01).toFixed(2)}%)` : `${c.toFixed(4)} M`;
    } else { $(".n-c").textContent = "아직 없음"; $(".n-m").textContent = "—"; }
    $(".n-t").textContent = shown ? `${s.c.toFixed(4)} M` : "?";
  }

  loop($(".cv-wide"), (dt) => { if (tr) { step(dt); drawApp(); } });
  const pick = (sel, attr, set) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[${attr}]`); if (!b) return;
    root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    set(b.getAttribute(attr)); fresh(); drawPlot(); nums();
  });
  pick(".smp", "data-s", (v) => { smp = v; });
  pick(".acd", "data-c", (v) => { acid = v; });
  $(".heat").addEventListener("change", fresh);
  $(".a1").addEventListener("click", () => add(1.00));
  $(".a01").addEventListener("click", () => add(0.10));
  $(".adrop").addEventListener("click", () => add(drop()));
  $(".rec").addEventListener("click", record);
  $(".fresh").addEventListener("click", fresh);
  $(".truth").addEventListener("click", () => { shown = !shown; nums(); });
  $(".clear").addEventListener("click", () => { tbl.clear(); fresh(); });
  fresh(); drawPlot(); nums();

  if (L.demo) {
    /* 학생처럼: 빠르게 넣다가 종말점 1 mL 앞부터 한 방울씩, 30초 분홍이면 기록 */
    const auto = (a, heat) => {
      acid = a; $(".heat").checked = heat; fresh();
      const vEnd = tr.need / CK * 1000;
      while (tr.v < vEnd - 1.2) { add(1.0); step(20); }
      let guard = 0;
      while (guard++ < 200) { add(drop()); step(acid === "hcl" ? 15 : 8); let t = 0; while (t < 30 && tr.pink > 0) { step(1); t++; } if (tr.pink >= 30) break; }
      record();
    };
    ["h2so4", "h2so4", "h2so4"].forEach((a) => auto(a, false));
    auto("h2so4", true); auto("hcl", false); auto("none", false);
    acid = "h2so4"; $(".heat").checked = false; fresh(); add(12.0); step(30); add(0.3); step(1.5);
    drawPlot(); nums();
  }
})();
