/* 카드: 건전지의 내부 저항 — 외부 저항을 바꿔 단자 전압·전류 측정, V = E − Ir 직선 맞춤, 새 전지와 쓰던 전지 비교 */
(() => {
  const root = document.getElementById("card-labphy-internal-r");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const RA = 0.10, RW = 0.05;
  const BAT = { new: { E: 1.592, r: 0.18, name: "새 전지" }, old: { E: 1.405, r: 0.85, name: "쓰던 전지" } };
  const LOADS = [Infinity, 20, 12, 8, 5, 3, 2, 1];
  let bat = "new", R = 5, wrong = false, rd = null;

  const lh = $(".load");
  LOADS.forEach((v) => lh.insertAdjacentHTML("beforeend", `<button class="chip" type="button" data-r="${v}" aria-pressed="${v === R}">${isFinite(v) ? v + " Ω" : "열림"}</button>`));

  function truth() {
    const b = BAT[bat], I = isFinite(R) ? b.E / (b.r + R + RA + RW) : 0;
    return { I, V: b.E - I * (b.r + (wrong ? RA : 0)) };
  }
  const readMeters = () => { const t = truth(); return { v: L.measure(t.V, { sd: 0.0015, res: 0.001 }), i: L.measure(t.I * 1000, { rel: 0.003, res: 1 }) }; };

  const tbl = L.table($(".tbl-host"), [{ key: "b", label: "전지" }, { key: "R", label: "R (Ω)" }, { key: "i", label: "I (mA)", res: 1 }, { key: "v", label: "V (V)", res: 0.001 }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());

  function meterIcon(ctx, x, y, ch) {
    ctx.fillStyle = C.card; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(ch, x, y + 5);
  }
  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const yt = 40, yb = h - 30, xb = w * 0.2, xa = w * 0.52, xR = w * 0.82, ym = (yt + yb) / 2, xvl = w * 0.05;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    // 바깥 회로: 전지(+ 위) → 스위치 → 전류계 → 외부 저항 → 전지(−)
    ctx.beginPath(); ctx.moveTo(xb, ym - 34); ctx.lineTo(xb, yt); ctx.lineTo(xR, yt); ctx.lineTo(xR, yb); ctx.lineTo(xb, yb); ctx.lineTo(xb, ym + 34); ctx.stroke();
    // 전지 상자 (E와 r)
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(xb - 24, ym - 34, 48, 68); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(xb - 12, ym - 20); ctx.lineTo(xb + 12, ym - 20); ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xb - 6, ym - 13); ctx.lineTo(xb + 6, ym - 13); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xb, ym - 34); ctx.lineTo(xb, ym - 20); ctx.moveTo(xb, ym - 13); ctx.lineTo(xb, ym + 2); ctx.stroke();
    ctx.fillStyle = C.sprout; ctx.fillRect(xb - 5, ym + 2, 10, 18); ctx.strokeRect(xb - 5, ym + 2, 10, 18);
    ctx.beginPath(); ctx.moveTo(xb, ym + 20); ctx.lineTo(xb, ym + 34); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left";
    ctx.fillText("E", xb + 14, ym - 13); ctx.fillText("r", xb + 10, ym + 15);
    ctx.fillStyle = C.ink3; ctx.fillText(BAT[bat].name, xb + 28, ym + 32);
    // 스위치 (기록할 때만 닫힘)
    const xs = w * 0.34;
    ctx.fillStyle = C.card; ctx.fillRect(xs - 12, yt - 4, 24, 8);
    ctx.beginPath(); ctx.arc(xs - 11, yt, 2.5, 0, Math.PI * 2); ctx.arc(xs + 11, yt, 2.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.beginPath(); ctx.moveTo(xs - 11, yt); ctx.lineTo(xs + 10, yt - 10); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.fillText("스위치", xs, yt - 16);
    meterIcon(ctx, xa, yt, "A");
    // 외부 저항
    ctx.fillStyle = C.card; ctx.fillRect(xR - 14, ym - 30, 28, 60);
    if (isFinite(R)) { ctx.fillStyle = "#d8c49a"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.fillRect(xR - 9, ym - 24, 18, 48); ctx.strokeRect(xR - 9, ym - 24, 18, 48); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xR, ym - 30); ctx.lineTo(xR, ym - 24); ctx.moveTo(xR, ym + 24); ctx.lineTo(xR, ym + 30); ctx.stroke(); }
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(isFinite(R) ? `R = ${R} Ω` : "R 없음 (열림)", xR + 16, ym + 4);
    // 전압계: 전지 단자에 (또는 잘못: 전류계 바깥까지)
    const tapX = wrong ? xa + 26 : xb;
    ctx.strokeStyle = wrong ? C.warn : C.forest; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(tapX, yt); ctx.lineTo(tapX, yt - 22); ctx.lineTo(xvl, yt - 22); ctx.lineTo(xvl, yb); ctx.lineTo(xb, yb); ctx.stroke();
    [[tapX, yt], [xb, yb]].forEach(([x, y]) => { ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill(); });
    meterIcon(ctx, xvl, ym, "V");
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 48, y0: 18, w: w - 62, h: h - 52 };
    const vs = tbl.rows.map((r) => r.v), lo = vs.length ? Math.max(0, Math.floor((Math.min(...vs) - 0.1) * 10) / 10) : 0;
    const xr = [0, 1400], yr = [lo, 1.7];
    const pick = (b) => tbl.rows.filter((r) => r.b === BAT[b].name).map((r) => ({ x: r.i, y: r.v }));
    const other = pick(bat === "new" ? "old" : "new"), mine = pick(bat);
    const ft = mine.length > 1 ? L.linfit(mine.map((p) => p.x), mine.map((p) => p.y)) : null;
    L.plot(ctx, box, { pts: other, xr, yr, color: C.ink3, xlabel: "I (mA)", ylabel: "V (V)" });
    L.plot(ctx, box, { pts: mine, fit: ft, xr, yr, xlabel: "I (mA)", ylabel: "V (V)" });
    if (!ft) { $(".n-e").textContent = "점 2개 이상"; $(".n-r").textContent = $(".n-sc").textContent = "—"; return; }
    const r = -ft.a * 1000;
    $(".n-e").textContent = `${ft.b.toFixed(3)} ± ${ft.sb.toFixed(3)} V`;
    $(".n-r").textContent = `${r.toFixed(3)} ± ${(ft.sa * 1000).toFixed(3)} Ω`;
    $(".n-sc").textContent = r > 0.01 ? `${(ft.b / r).toFixed(1)} A` : "—";
  }

  function upd() {
    rd = readMeters();
    $(".n-v").textContent = `${rd.v.toFixed(3)} V`; $(".n-i").textContent = `${rd.i.toFixed(0)} mA`;
    $(".n-R").textContent = isFinite(R) ? `${R} Ω` : "열림";
    draw();
  }
  function record() { rd = readMeters(); tbl.add({ b: BAT[bat].name, R: isFinite(R) ? String(R) : "열림", i: rd.i, v: rd.v }); upd(); }
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  lh.addEventListener("click", (e) => {
    const b = e.target.closest("[data-r]"); if (!b) return;
    lh.querySelectorAll("[data-r]").forEach((o) => o.setAttribute("aria-pressed", String(o === b))); R = +b.dataset.r; upd();
  });
  root.querySelectorAll(".bat [data-b]").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".bat [data-b]").forEach((o) => o.setAttribute("aria-pressed", String(o === b))); bat = b.dataset.b; upd(); drawPlot();
  }));
  $(".wrong").addEventListener("click", (e) => { wrong = !wrong; e.currentTarget.setAttribute("aria-pressed", String(wrong)); upd(); });
  upd();
  if (L.demo) {
    ["old", "new"].forEach((b) => { bat = b; LOADS.forEach((v) => { R = v; record(); }); });
    R = 5; root.querySelectorAll(".bat [data-b]").forEach((o) => o.setAttribute("aria-pressed", String(o.dataset.b === bat)));
    lh.querySelectorAll("[data-r]").forEach((o) => o.setAttribute("aria-pressed", String(+o.dataset.r === R))); upd(); drawPlot();
  }
})();
