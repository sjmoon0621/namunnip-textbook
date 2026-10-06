/* 카드: 감자 조각의 질량 변화와 차르다코프법으로 등장 농도·수분 퍼텐셜 구하기 */
(() => {
  const root = document.getElementById("card-labbio-water-potential");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const RT = 0.00831 * 293;
  const ciso = 0.24 + Math.random() * 0.07;   // 숨은 참값: 이 감자의 등장 농도 (M)
  let last = null, drop = null;
  const tbl = L.table($(".tbl-host"), [{ key: "m", label: "방법" }, { key: "c", label: "C (M)", res: 0.01 }, { key: "a", label: "처음 (g)", res: 0.01 }, { key: "b", label: "나중 (g)", res: 0.01 }, { key: "p", label: "변화율 (%)", res: 0.1 }, { key: "d", label: "방울" }], () => { drawPlot(); });
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());
  const conc = () => +$(".conc").value;

  /* 1시간 뒤 질량 변화율(%): 등장점 아래는 물을 얻고, 위는 잃는다 (위쪽은 세포벽 탄성 때문에 휘어짐) */
  const dPct = (c) => { const x = ciso - c; return x > 0 ? 36 * x / (1 + 0.8 * x) : 52 * x / (1 - 1.6 * x); };

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = conc(), base = h - 18;
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink2;
    /* 1) 시험관 + 감자 조각 */
    const tx = w * 0.13, tw = 40, top = 24;
    const shade = 0.15 + c * 0.5;
    ctx.fillStyle = `rgba(200,220,240,${shade})`; ctx.fillRect(tx - tw / 2, top + 30, tw, base - top - 40);
    const sw = last ? clamp(1 + last.p / 100, 0.75, 1.2) : 1;
    ctx.fillStyle = "#efe0a8"; ctx.strokeStyle = "#b9a46a"; ctx.lineWidth = 1;
    ctx.fillRect(tx - 7 * sw, base - 70 * sw - 14, 14 * sw, 70 * sw); ctx.strokeRect(tx - 7 * sw, base - 70 * sw - 14, 14 * sw, 70 * sw);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tx - tw / 2, top); ctx.lineTo(tx - tw / 2, base - 8); ctx.quadraticCurveTo(tx, base + 8, tx + tw / 2, base - 8); ctx.lineTo(tx + tw / 2, top); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillText(`설탕 ${c.toFixed(2)} M`, tx, top - 8);
    /* 2) 전자저울 */
    const bx = w * 0.42, bw = Math.min(150, w * 0.26);
    ctx.fillStyle = "#d6d6d0"; ctx.fillRect(bx - bw / 2, base - 30, bw, 30);
    ctx.fillStyle = "#bdbdb6"; ctx.fillRect(bx - bw * 0.35, base - 38, bw * 0.7, 8);
    ctx.fillStyle = "#1f2a1f"; ctx.fillRect(bx - bw * 0.32, base - 24, bw * 0.64, 18);
    ctx.fillStyle = "#9fe08f"; ctx.font = `13px ${F.mono}`; ctx.fillText(last ? `${last.b.toFixed(2)} g` : "0.00 g", bx, base - 10);
    if (last) { ctx.fillStyle = "#efe0a8"; ctx.fillRect(bx - 22, base - 48, 44, 10); }
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText("전자저울 (0.01 g)", bx, base - 62);
    if (last) { ctx.font = `11px ${F.mono}`; ctx.fillText(`${last.a.toFixed(2)} g → ${last.b.toFixed(2)} g`, bx, base - 80); }
    /* 3) 차르다코프법: 원래 농도 용액 속 색 방울 */
    const cx = w * 0.78, cw = 52, ctop = 30;
    ctx.fillStyle = `rgba(200,220,240,${shade})`; ctx.fillRect(cx - cw / 2, ctop + 8, cw, base - ctop - 16);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx - cw / 2, ctop); ctx.lineTo(cx - cw / 2, base - 8); ctx.quadraticCurveTo(cx, base + 8, cx + cw / 2, base - 8); ctx.lineTo(cx + cw / 2, ctop); ctx.stroke();
    ctx.strokeStyle = "#888"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + 22, ctop - 2); ctx.lineTo(cx + 2, (ctop + base) / 2 - 6); ctx.stroke();
    if (drop) {
      const y = clamp((ctop + base) / 2 + drop.y, ctop + 12, base - 14), spread = drop.dir === 0 ? Math.min(12, 4 + drop.t * 3) : 5;
      ctx.fillStyle = "rgba(40,90,190,.8)"; ctx.beginPath(); ctx.ellipse(cx, y, spread, drop.dir === 0 ? spread * 0.6 : 6, 0, 0, Math.PI * 2); ctx.fill();
      if (drop.dir !== 0) { ctx.strokeStyle = "rgba(40,90,190,.35)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, (ctop + base) / 2); ctx.lineTo(cx, y); ctx.stroke(); }
    }
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.fillText("원래 농도 용액", cx - 12, ctop - 10);
    if (drop && drop.t > 2) { ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.fillText(drop.dir > 0 ? "떠오름" : drop.dir < 0 ? "가라앉음" : "제자리에서 퍼짐", cx, base + 12 > h ? h - 2 : h - 2); }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.m === "질량법"), pts = rows.map((r) => ({ x: r.c, y: r.p }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
    const res = L.plot(ctx, { x0: 46, y0: 18, w: w - 60, h: h - 52 }, { pts, fit: ft, xr: [0, 0.65], yr: [-20, 15], xlabel: "설탕 농도 C (M)", ylabel: "질량 변화율 (%)" });
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(res.X(0), res.Y(0)); ctx.lineTo(res.X(0.65), res.Y(0)); ctx.stroke();
    if (ft && ft.a < 0) {
      const x0 = -ft.b / ft.a;
      $(".n-c").textContent = `${x0.toFixed(3)} M`;
      $(".n-p").textContent = `${(-x0 * RT).toFixed(2)} MPa`;
      if (x0 > 0 && x0 < 0.65) { ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(res.X(x0), res.Y(0), 4.5, 0, Math.PI * 2); ctx.fill(); }
    } else { $(".n-c").textContent = "점 2개 이상"; $(".n-p").textContent = "—"; }
    const ch = tbl.rows.filter((r) => r.m === "차르다코프").sort((a, b) => a.c - b.c);
    let lo = null, hi = null;
    ch.forEach((r) => { if (r.d === "가라앉음") lo = r.c; });
    ch.forEach((r) => { if (r.d === "떠오름" && hi == null && (lo == null || r.c > lo)) hi = r.c; });
    const same = ch.find((r) => r.d === "제자리");
    $(".n-d").textContent = same ? `약 ${same.c.toFixed(2)} M` : lo != null && hi != null ? `${lo.toFixed(2)}~${hi.toFixed(2)} M 사이` : ch.length ? "방향이 바뀌는 두 농도 필요" : "—";
  }

  $(".conc").addEventListener("input", () => { $(".c-out").textContent = conc().toFixed(2); last = null; drop = null; draw(); });
  function massRun() {
    const c = conc(), a = L.snap(2.5 + 0.15 * L.gauss(), 0.01);
    const p = dPct(c) + 1.0 * L.gauss();
    let b = a * (1 + p / 100); if ($(".wet").checked) b += 0.04 + 0.015 * Math.abs(L.gauss());
    b = L.measure(b, { res: 0.01 });
    last = { a, b, p: (b - a) / a * 100 };
    tbl.add({ m: "질량법", c, a, b, p: last.p, d: "—" });
  }
  function chardRun(instant) {
    const c = conc(), x = c - ciso + 0.006 * L.gauss();
    const dir = Math.abs(x) < 0.012 ? 0 : x > 0 ? 1 : -1;
    drop = { dir, y: 0, t: instant ? 3 : 0, v: -dir * clamp(Math.abs(x) * 260, 6, 30) };
    if (instant) drop.y = drop.v * 2.5;
    tbl.add({ m: "차르다코프", c, a: NaN, b: NaN, p: NaN, d: dir > 0 ? "떠오름" : dir < 0 ? "가라앉음" : "제자리" });
  }
  $(".mass").addEventListener("click", () => massRun());
  $(".chard").addEventListener("click", () => chardRun(false));
  $(".clear").addEventListener("click", () => { tbl.clear(); last = null; drop = null; draw(); });
  loop($(".cv-wide"), (dt) => { if (drop && drop.t < 3) { drop.t += dt; drop.y += drop.v * dt; } draw(); });
  draw();

  if (L.demo) {
    [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].forEach((c) => { $(".conc").value = c; massRun(); massRun(); });
    [0.2, 0.25, 0.3].forEach((c) => { $(".conc").value = c; chardRun(true); });
    $(".c-out").textContent = conc().toFixed(2);
  }
})();
