/* 카드: 물높이만 바꿔서 소리의 속력을 잴 수 있을까? — 기주 공명, (2n−1)/4f–L 직선 맞춤 */
(() => {
  const root = document.getElementById("card-labphy-standing");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sH = $(".h"), sT = $(".t");
  const TUBE = 100, E = 0.6 * 1.9;   // 관 길이, 끝보정 (cm)
  let f = 512;
  const vTrue = () => 331.3 + 0.606 * +sT.value;
  const lam = () => vTrue() * 100 / f;
  const resL = () => { const out = []; for (let n = 1; n < 20; n++) { const x = (2 * n - 1) * lam() / 4 - E; if (x > TUBE - 3) break; out.push(x); } return out; };
  const loud = (h) => Math.min(1, resL().reduce((s, x) => s + 1 / (1 + ((h - x) / 0.9) ** 2), 0.03));
  const tbl = L.table($(".tbl-host"), [{ key: "f", label: "f (Hz)", res: 0.1 }, { key: "n", label: "n", res: 1 }, { key: "L", label: "L (cm)", res: 0.1 }, { key: "x", label: "(2n−1)/4f (ms)", res: 0.001 }], () => drawPlot());
  const app = fit($(".cv-wide"), () => draw()), pl = fit($(".cv-plot"), () => drawPlot());

  function draw() {
    const { ctx } = app, { w, h } = app.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const top = 34, bot = h - 12, sc = (bot - top) / TUBE, tx = w * 0.36, hw = 13;
    const hv = +sH.value, wy = top + hv * sc, ld = loud(hv);
    // 물
    ctx.fillStyle = "rgba(110,164,230,.35)"; ctx.fillRect(tx - hw, wy, hw * 2, bot - wy);
    // 정상파 변위 진폭 (공명일 때만 크게)
    const A = (hw - 3) * Math.min(1, ld * 1.1), k = 2 * Math.PI / lam();
    ctx.strokeStyle = "rgba(59,124,42,.75)"; ctx.lineWidth = 1.3;
    [1, -1].forEach((sg) => { ctx.beginPath(); for (let d = 0; d <= hv; d += 0.5) { const y = top + d * sc, x = tx + sg * A * Math.abs(Math.cos(k * (d + E))); d ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); });
    // 관
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx - hw, top); ctx.lineTo(tx - hw, bot); ctx.lineTo(tx + hw, bot); ctx.lineTo(tx + hw, top); ctx.stroke();
    // 눈금자
    ctx.fillStyle = C.ink3; ctx.font = `9px ${F.mono}`; ctx.textAlign = "right";
    for (let c = 0; c <= TUBE; c += 5) { const y = top + c * sc; ctx.fillRect(tx - hw - (c % 10 ? 4 : 7), y, c % 10 ? 4 : 7, 1); if (c % 20 === 0) ctx.fillText(c ? c : "0 cm", tx - hw - 10, y + 3); }
    // 수면 표시
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx - hw - 2, wy); ctx.lineTo(tx + hw + 20, wy); ctx.stroke();
    // 물통과 호스
    const ry = Math.min(bot - 26, wy - 8), rx = tx + 70;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, bot); ctx.quadraticCurveTo(tx + 30, bot + 6, rx, ry + 26); ctx.stroke();
    ctx.fillStyle = "rgba(110,164,230,.35)"; ctx.fillRect(rx - 14, wy, 28, ry + 26 - wy);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.strokeRect(rx - 14, ry - 10, 28, 36);
    // 소리굽쇠
    ctx.strokeStyle = "#8d8d92"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(tx - 9, 6); ctx.lineTo(tx - 9, 22); ctx.quadraticCurveTo(tx, 30, tx + 9, 22); ctx.lineTo(tx + 9, 6); ctx.moveTo(tx, 28); ctx.lineTo(tx + 26, 28); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${f} Hz`, tx + 32, 31);
    // 소리 세기 막대
    const mx = w * 0.78, mh = bot - top - 30;
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("소리 세기", mx, top - 8);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(mx - 12, top, 24, mh);
    ctx.fillStyle = ld > 0.8 ? C.warn : C.leaf; ctx.fillRect(mx - 11, top + mh * (1 - ld), 22, mh * ld);
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.mono}`; ctx.fillText(ld > 0.8 ? "공명!" : ld > 0.3 ? "커짐" : "작음", mx, top + mh + 18);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pts = tbl.rows.map((r) => ({ x: r.x, y: r.L }));
    const ft = pts.length > 1 ? L.linfit(pts.map((p) => p.x), pts.map((p) => p.y)) : null;
    L.plot(ctx, { x0: 44, y0: 18, w: w - 58, h: h - 52 }, { pts, fit: ft, xr: [0, 3.2], yr: [-10, 100], xlabel: "(2n−1)/4f (ms)", ylabel: "L (cm)" });
    $(".n-v").textContent = ft ? `${(ft.a * 10).toFixed(0)} ± ${(ft.sa * 10).toFixed(0)} m/s` : "점 2개 이상";
    $(".n-e").textContent = ft ? `${(-ft.b).toFixed(1)} cm` : "—";
  }

  function record() {
    const hv = +sH.value, rs = resL();
    let n = 1, best = Infinity;
    rs.forEach((x, i) => { if (Math.abs(x - hv) < best) { best = Math.abs(x - hv); n = i + 1; } });
    const Lm = L.measure(hv, { sd: 0.1, res: 0.1 });
    tbl.add({ f, n, L: Lm, x: (2 * n - 1) / (4 * f) * 1000 });
  }
  const upd = () => { $(".h-out").textContent = (+sH.value).toFixed(1); $(".t-out").textContent = sT.value; $(".n-th").textContent = `${vTrue().toFixed(1)} m/s`; draw(); };
  [sH, sT].forEach((el) => el.addEventListener("input", upd));
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".fsel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-f]"); if (!b) return;
    f = +b.dataset.f; root.querySelectorAll("[data-f]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); upd();
  });
  upd();
  if (L.demo) {
    [512, 426.7, 384].forEach((fd) => { f = fd; resL().forEach((x) => { sH.value = (x + 0.35 * L.gauss()).toFixed(1); record(); }); });
    root.querySelector('[data-f="512"]').click(); sH.value = resL()[1].toFixed(1); upd();
  }
})();
