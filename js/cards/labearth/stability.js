/* 카드: 여름 오후와 겨울 아침, 대기는 얼마나 다르게 쌓여 있을까? — 두 라디오존데 자료의 기온 감률, 역전층, 구름 밑면 */
(() => {
  const root = document.getElementById("card-labearth-stability");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab, T = LEThermo, SND = window.LESnd || [];
  const $ = (s) => root.querySelector(s);
  const sZ1 = $(".z1"), sZ2 = $(".z2");
  const NAME = { "072700": "여름 09시", "072706": "여름 15시", "011700": "겨울 09시" };
  const SH = { "072700": "여름09", "072706": "여름15", "011700": "겨울09" };
  const PAIRS = [["072700", "072706"], ["072706", "011700"]];
  const ZMAX = 10;
  let pair = 0;

  const get = (id) => SND.find((s) => s.id === id);
  /* 높이 z (m)에서 열 col(2 기온, 3 이슬점) 값 */
  function atZ(lv, z, col) {
    const pts = lv.filter((r) => r[col] != null);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (a[1] <= z && z <= b[1]) return a[col] + (b[col] - a[col]) * (z - a[1]) / (b[1] - a[1]);
    }
    return null;
  }
  const judge = (g, gm) => (g < 0 ? "역전층" : g < gm ? "절대 안정" : g <= T.gammaD ? "조건부 불안정" : "절대 불안정");

  const cv = fit($(".st-cv"), () => draw());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "s", label: "자료" }, { key: "z", label: "층 (km)" }, { key: "t1", label: "T₁ (°C)", res: 0.1 }, { key: "t2", label: "T₂ (°C)", res: 0.1 },
    { key: "g", label: "Γ (°C/km)", res: 0.1 }, { key: "gm", label: "Γm", res: 0.1 }, { key: "j", label: "판정" },
  ], () => { draw(); drawPlot(); });

  function panel(ctx, x0, y0, w, h, s, tag) {
    const lo = -50, hi = 40;
    const X = (t) => x0 + (t - lo) / (hi - lo) * w, Y = (z) => y0 + h - z / (ZMAX * 1000) * h;
    const xt = []; for (let t = lo + 10; t <= hi; t += 20) xt.push([t, String(t)]);
    const yt = []; for (let z = 0; z <= ZMAX; z += 2) yt.push([z * 1000, String(z)]);
    NM.axes(ctx, { x0, y0, w, h, X, Y, xt, yt, xlabel: "", ylabel: "" });
    /* 고른 층 */
    const z1 = +sZ1.value * 1000, z2 = +sZ2.value * 1000;
    ctx.fillStyle = "rgba(224,160,42,.16)"; ctx.fillRect(x0, Y(z2), w, Y(z1) - Y(z2));
    /* 구름 밑면 어림 */
    const s0 = s.lv[0], cb = 125 * (s0[2] - s0[3]);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, Y(cb)); ctx.lineTo(x0 + w, Y(cb)); ctx.stroke(); ctx.setLineDash([]);
    /* 기온과 이슬점 */
    const line = (col, color) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); let st = false;
      s.lv.forEach((r) => { if (r[col] == null || r[1] > ZMAX * 1000 + 800) return; st ? ctx.lineTo(X(r[col]), Y(r[1])) : ctx.moveTo(X(r[col]), Y(r[1])); st = true; });
      ctx.stroke();
    };
    line(3, C.forest); line(2, C.apple);
    /* 기록한 층 */
    tbl.rows.filter((r) => r.s === SH[s.id]).forEach((r) => {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(r.t1), Y(r.z1)); ctx.lineTo(X(r.t2), Y(r.z2)); ctx.stroke();
    });
    ctx.restore();
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(`${tag}  ${NAME[s.id]}`, x0 + 4, y0 - 8);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText(`구름 밑면 어림 ${Math.round(cb)} m`, x0 + w - 2, Math.max(y0 + 12, Y(cb) - 4));
  }

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const [a, b] = PAIRS[pair].map(get), pw = (w - 70) / 2;
    panel(ctx, 30, 26, pw, h - 76, a, "A");
    panel(ctx, 30 + pw + 34, 26, pw, h - 76, b, "B");
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("km", 4, 22);
    ctx.font = `10.5px ${F.sans}`;
    ctx.fillStyle = C.ink3; ctx.fillText("가로축: 기온 (°C)", w - 120, h - 6);
    ctx.fillStyle = C.apple; ctx.fillText("— 기온", 30, h - 6);
    ctx.fillStyle = C.forest; ctx.fillText("— 이슬점", 82, h - 6);
    ctx.fillStyle = C.ink3; ctx.fillText("- - 구름 밑면 어림", 146, h - 6);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 44, y0: 22, w: w - 60, h: h - 56 };
    const rows = tbl.rows;
    const r = L.plot(ctx, box, { pts: rows.map((q) => ({ x: q.g, y: (q.z1 + q.z2) / 2000, ey: (q.z2 - q.z1) / 2000 })), xr: [-15, 15], yr: [0, ZMAX], xlabel: "기온 감률 Γ (°C/km)", ylabel: "층 가운데 높이 (km)" });
    ctx.save(); ctx.beginPath(); ctx.rect(box.x0, box.y0, box.w, box.h); ctx.clip();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.4; ctx.setLineDash([5, 3]);
    ctx.beginPath(); ctx.moveTo(r.X(T.gammaD), box.y0); ctx.lineTo(r.X(T.gammaD), box.y0 + box.h); ctx.stroke();
    ctx.strokeStyle = C.forest; ctx.beginPath(); ctx.moveTo(r.X(0), box.y0); ctx.lineTo(r.X(0), box.y0 + box.h); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "rgba(59,124,42,.10)"; ctx.fillRect(r.X(4), box.y0, r.X(7) - r.X(4), box.h);
    ctx.restore();
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = C.warn; ctx.fillText("Γd 9.8", r.X(T.gammaD) + 3, box.y0 + 12);
    ctx.fillStyle = C.forest; ctx.fillText("Γm 4~7", r.X(4) + 2, box.y0 + 26);
    ctx.fillStyle = C.ink3; ctx.fillText("역전층 ←", box.x0 + 4, box.y0 + 12);
  }

  function measure(which) {
    const s = get(PAIRS[pair][which]);
    let z1 = +sZ1.value * 1000, z2 = +sZ2.value * 1000;
    if (z2 <= z1) return;
    const a = atZ(s.lv, z1, 2), b = atZ(s.lv, z2, 2);
    if (a == null || b == null) return;
    const t1 = L.measure(a, { sd: 0.2, res: 0.1 }), t2 = L.measure(b, { sd: 0.2, res: 0.1 });
    const g = -(t2 - t1) / ((z2 - z1) / 1000);
    const pm = T.pAtZ(s.lv, (z1 + z2) / 2), gm = T.gammaM((a + b) / 2, pm);
    tbl.add({ s: SH[s.id], z: `${(z1 / 1000).toFixed(1)}–${(z2 / 1000).toFixed(1)}`, z1, z2, t1, t2, g, gm, j: judge(g, gm) });
  }
  function cloudBase() {
    PAIRS[pair].map(get).forEach((s) => {
      const s0 = s.lv[0], d = s0[2] - s0[3];
      tbl.add({ s: SH[s.id], z: "밑면", z1: NaN, z2: NaN, t1: s0[2], t2: s0[3], g: NaN, gm: NaN, j: `약 ${Math.round(125 * d)} m` });
    });
  }

  const upd = () => {
    if (+sZ2.value <= +sZ1.value) sZ2.value = Math.min(10, +sZ1.value + 0.2);
    $(".z1-out").textContent = (+sZ1.value).toFixed(1); $(".z2-out").textContent = (+sZ2.value).toFixed(1); draw();
  };
  [sZ1, sZ2].forEach((el) => el.addEventListener("input", upd));
  $(".ma").addEventListener("click", () => measure(0));
  $(".mb").addEventListener("click", () => measure(1));
  $(".cb").addEventListener("click", cloudBase);
  $(".clear").addEventListener("click", () => tbl.clear());
  $(".pair").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    pair = +b.dataset.p; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw();
  });
  upd();
  if (L.demo) {
    pair = 1; root.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.p === "1")));
    [[0, 0.7], [0.7, 1.2], [1.5, 3], [3, 6]].forEach(([a, b]) => { sZ1.value = a; sZ2.value = b; measure(0); measure(1); });
    cloudBase();
    sZ1.value = 0.7; sZ2.value = 1.2; upd();
  }
})();
