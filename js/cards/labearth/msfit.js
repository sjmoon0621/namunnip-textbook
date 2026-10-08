/* 카드: 주계열 맞추기 — Gaia DR3 성단 측광(플레이아데스, M67)에 표준 왜성 주계열을 겹쳐 거리 지수를 찾는다 */
(() => {
  const root = document.getElementById("card-labearth-msfit");
  if (!root || !window.NMDwarfs || !window.NMClusters) return;
  const { C, F, fit, axes } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const sMu = $(".mu"), cbRed = $(".red");
  const EBV = 0.04, kE = 1.339, kA = 2.74;
  const CL = {
    pleiades: { name: "플레이아데스", plx: 7.36, dTxt: "약 136 pc (Gaia 시차 ϖ ≈ 7.36 mas)", fitR: [0.35, 1.9], gMin: 0, gr: [-0.3, 3.2], Gr: [2.5, 19] },
    m67: { name: "M67", plx: 1.15, dTxt: "약 0.87 kpc (Gaia 시차 ϖ ≈ 1.15 mas)", fitR: [0.95, 1.9], gMin: 13.8, gr: [0.3, 3.2], Gr: [9, 19] },
  };
  let key = "pleiades";

  /* 표준 주계열: (BP−RP)0 → M_G 보간 */
  const ms = NMDwarfs.filter((r) => r[5] != null && r[6] != null).map((r) => [r[5], r[6]]).sort((a, b) => a[0] - b[0]);
  const msMG = (c) => {
    if (c < ms[0][0] || c > ms[ms.length - 1][0]) return NaN;
    for (let i = 1; i < ms.length; i++) if (c <= ms[i][0]) { const [x0, y0] = ms[i - 1], [x1, y1] = ms[i]; return y0 + (y1 - y0) * (c - x0) / (x1 - x0 || 1); }
    return NaN;
  };
  const stars = (k) => { const a = NMClusters[k], o = []; for (let i = 0; i < a.length; i += 2) o.push([a[i + 1], a[i]]); return o; };

  const cmd = fit($(".msf-cmd"), () => drawCmd());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "cl", label: "성단" }, { key: "red", label: "소광" }, { key: "mu", label: "m−M", res: 0.01 },
    { key: "off", label: "어긋남", res: 0.01 }, { key: "d", label: "d (pc)", res: 1 },
  ], () => drawPlot());

  function offset(mu, red) {
    const c = CL[key], sh = red ? EBV * kE : 0, a = red ? EBV * kA : 0, res = [];
    for (const [col, g] of stars(key)) {
      if (col < c.fitR[0] || col > c.fitR[1] || g < c.gMin) continue;
      const m = msMG(col - sh); if (!Number.isFinite(m)) continue;
      res.push(g - (m + mu + a));
    }
    res.sort((x, y) => x - y);
    const med = res.length ? res[Math.floor(res.length / 2)] : NaN;
    return { n: res.length, off: med };
  }

  function drawCmd() {
    const { ctx } = cmd, { w, h } = cmd.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const c = CL[key], box = { x0: 40, y0: 22, w: w - 54, h: h - 58 };
    const X = (v) => box.x0 + (v - c.gr[0]) / (c.gr[1] - c.gr[0]) * box.w;
    const Y = (v) => box.y0 + (v - c.Gr[0]) / (c.Gr[1] - c.Gr[0]) * box.h;
    ctx.fillStyle = "rgba(116,171,102,.13)"; const gy = Math.max(box.y0, Y(c.gMin)); ctx.fillRect(X(c.fitR[0]), gy, X(c.fitR[1]) - X(c.fitR[0]), box.y0 + box.h - gy);
    const xt = L.ticks(c.gr[0], c.gr[1], 6).map((v) => [v, String(+v.toFixed(1))]);
    const yt = L.ticks(c.Gr[0], c.Gr[1], 6).map((v) => [v, String(v)]);
    axes(ctx, { ...box, X, Y, xt, yt, xlabel: "색지수 BP − RP", ylabel: "겉보기 등급 G (위가 밝음)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    ctx.fillStyle = "rgba(35,35,38,.55)";
    for (const [col, g] of stars(key)) { ctx.beginPath(); ctx.arc(X(col), Y(g), 1.6, 0, 7); ctx.fill(); }
    const mu = +sMu.value, red = cbRed.checked, sh = red ? EBV * kE : 0, a = red ? EBV * kA : 0;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath();
    ms.forEach(([col, m], i) => { const x = X(col + sh), y = Y(m + mu + a); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.stroke();
    ctx.restore();
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "right";
    ctx.fillText("표준 주계열 + (m − M)", box.x0 + box.w - 4, box.y0 + 14);
    ctx.fillStyle = C.ink2; ctx.fillText(`${c.name} · 별 ${stars(key).length}개`, box.x0 + box.w - 4, box.y0 + 29);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rows = tbl.rows.filter((r) => r.key === key);
    const groups = [rows.filter((r) => r.red === "끔"), rows.filter((r) => r.red === "켬")];
    const all = rows.map((r) => r.mu);
    const xr = all.length ? [Math.min(...all) - 0.3, Math.max(...all) + 0.3] : [2, 12];
    const offs = rows.map((r) => r.off), ym = Math.max(0.5, ...offs.map(Math.abs)) * 1.7;
    const box = { x0: 44, y0: 18, w: w - 58, h: h - 52 };
    const o = L.plot(ctx, box, { pts: groups[0].map((r) => ({ x: r.mu, y: r.off })), xr, yr: [-ym, ym], xlabel: "m − M 추정값", ylabel: "어긋남 (등급)" });
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(box.x0, o.Y(0)); ctx.lineTo(box.x0 + box.w, o.Y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.amber;
    groups[1].forEach((r) => { ctx.beginPath(); ctx.arc(o.X(r.mu), o.Y(r.off), 3.4, 0, 7); ctx.fill(); });
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "left";
    let ty = 32;
    groups.forEach((g, i) => {
      const f = g.length > 1 ? L.linfit(g.map((r) => r.mu), g.map((r) => r.off)) : null;
      if (!f || !f.a) return;
      const mu0 = -f.b / f.a, d = 10 ** ((mu0 + 5) / 5);
      ctx.fillStyle = i ? C.amber : C.forest;
      ctx.fillText(`${i ? "소광 보정" : "보정 없음"}: m−M = ${mu0.toFixed(2)} → d ≈ ${Math.round(d)} pc`, box.x0 + 6, ty); ty += 15;
    });
    if (!rows.length) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("겹침을 기록하면 여기에 점이 찍힙니다", box.x0 + box.w / 2, box.y0 + box.h / 2); }
  }

  function upd() {
    $(".mu-out").textContent = (+sMu.value).toFixed(2);
    const r = offset(+sMu.value, cbRed.checked);
    $(".n-n").textContent = r.n;
    $(".n-off").textContent = Number.isFinite(r.off) ? (r.off >= 0 ? "+" : "") + r.off.toFixed(2) : "—";
    $(".n-d").textContent = Math.round(10 ** ((+sMu.value + 5) / 5)) + " pc";
    drawCmd();
  }
  function record() {
    const mu = +sMu.value, r = offset(mu, cbRed.checked);
    tbl.add({ key, cl: CL[key].name, red: cbRed.checked ? "켬" : "끔", mu, off: r.off, d: 10 ** ((mu + 5) / 5) });
  }
  sMu.addEventListener("input", upd);
  cbRed.addEventListener("change", upd);
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".truth-b").addEventListener("click", () => { $(".msf-truth").textContent = `${CL[key].name}: ${CL[key].dTxt} → 참 거리 지수 ≈ ${(5 * Math.log10(1000 / CL[key].plx) - 5).toFixed(2)}`; });
  $(".msf-cl").addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    key = b.dataset.c; root.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    sMu.value = key === "m67" ? 8.5 : 4; $(".msf-truth").textContent = ""; upd(); drawPlot();
  });
  upd();
  if (L.demo) {
    [5.2, 5.5, 5.8, 6.1].forEach((v) => { sMu.value = v; record(); });
    cbRed.checked = true; [5.3, 5.6, 5.9].forEach((v) => { sMu.value = v; record(); });
    sMu.value = 5.6; upd();
  }
})();
