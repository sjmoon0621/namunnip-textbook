/* 카드: 해령 양쪽의 자기 줄무늬로 해저 확장 속도를 잴 수 있을까? — 지자기 역전 연대표와 자기 이상 단면 */
(() => {
  const root = document.getElementById("card-labearth-spreading");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);

  /* 지자기 극성 연대표 (GTS2012, Hilgen et al. 2012): 정자극기 [시작, 끝] (Ma) */
  const NORMAL = [[0, 0.781], [0.988, 1.072], [1.173, 1.185], [1.778, 1.945], [2.128, 2.148], [2.581, 3.032], [3.116, 3.207], [3.330, 3.596],
    [4.187, 4.300], [4.493, 4.631], [4.799, 4.896], [4.997, 5.235], [6.033, 6.252]];
  const BOUND = [
    { a: 0.781, n: "브루네/마쓰야마" }, { a: 0.988, n: "하라미요 위" }, { a: 1.072, n: "하라미요 아래" }, { a: 1.778, n: "올두바이 위" },
    { a: 1.945, n: "올두바이 아래" }, { a: 2.581, n: "마쓰야마/가우스" }, { a: 3.596, n: "가우스/길버트" }, { a: 4.187, n: "코치티 위" }, { a: 5.235, n: "트베라 아래" },
  ];
  const normal = (t) => NORMAL.some(([a, b]) => t >= a && t < b);
  /* 해령 (반확장 속도 mm/yr = km/Myr, 대표값, 화면에는 숨김) */
  const RIDGE = { mar: { v: 12.5, name: "대서양 중앙 해령 (북위 26° 부근)", tilt: 0 }, epr: { v: 71, name: "동태평양 해령 (남위 17° 부근)", tilt: 0 } };
  const TMAX = 6.0;

  let rk = "mar", bi = 0, cur = 10, showBlocks = false, prof = null;
  function build() {
    const v = RIDGE[rk].v, X = v * TMAX, n = 1201, dx = 2 * X / (n - 1), sig = 2.5;   // sig: 깊이 약 3 km에서 재면서 흐려지는 정도 (km)
    const m = [], x = [];
    for (let i = 0; i < n; i++) { x.push(-X + i * dx); m.push(normal(Math.abs(x[i]) / v) ? 1 : -1); }
    const k = Math.ceil(3 * sig / dx), wts = [];
    for (let j = -k; j <= k; j++) wts.push(Math.exp(-0.5 * (j * dx / sig) ** 2));
    const ws = wts.reduce((s, q) => s + q, 0);
    let seed = rk === "mar" ? 7 : 11;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
    const y = m.map((_, i) => { let s = 0; for (let j = -k; j <= k; j++) s += wts[j + k] * m[Math.min(n - 1, Math.max(0, i + j))]; return 260 * s / ws + 40 * rnd(); });
    prof = { x, y, m, X };
  }

  const top = fit($(".cv-wide"), () => drawTop());
  const pl = fit($(".cv-plot"), () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "r", label: "해령" }, { key: "b", label: "경계" }, { key: "age", label: "나이 (Ma)", res: 0.001 }, { key: "x", label: "해령에서 거리 (km)", res: 0.1 },
  ], () => drawPlot());

  function drawTop() {
    const { ctx } = top, { w, h } = top.size; if (!w || !prof) return;
    ctx.clearRect(0, 0, w, h);
    const bx = { x0: 46, y0: 20, w: w - 58, h: h * 0.55 };
    const X = (d) => bx.x0 + (d + prof.X) / (2 * prof.X) * bx.w, Y = (v) => bx.y0 + bx.h / 2 - v / 420 * bx.h / 2;
    const step = prof.X > 200 ? 100 : 20, xt = [];
    for (let d = -Math.floor(prof.X / step) * step; d <= prof.X; d += step) xt.push([d, String(d)]);
    NM.axes(ctx, { ...bx, X, Y, xt, yt: [[-300, "−300"], [0, "0"], [300, "300"]], ylabel: "자기 이상 (nT)" });
    ctx.save(); ctx.beginPath(); ctx.rect(bx.x0, bx.y0, bx.w, bx.h); ctx.clip();
    if (showBlocks) {
      for (let i = 0; i < prof.x.length - 1; i++) if (prof.m[i] > 0) { ctx.fillStyle = "rgba(35,35,38,.10)"; ctx.fillRect(X(prof.x[i]), bx.y0, X(prof.x[i + 1]) - X(prof.x[i]) + 0.5, bx.h); }
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath();
    prof.x.forEach((d, i) => (i ? ctx.lineTo(X(d), Y(prof.y[i])) : ctx.moveTo(X(d), Y(prof.y[i])))); ctx.stroke();
    tbl.rows.filter((r) => r.key === rk).forEach((r) => { ctx.strokeStyle = C.forest; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(r.xs), bx.y0); ctx.lineTo(X(r.xs), bx.y0 + bx.h); ctx.stroke(); });
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X(cur), bx.y0); ctx.lineTo(X(cur), bx.y0 + bx.h); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("해령 축에서 거리 (km, 서 ← → 동)", bx.x0 + bx.w, bx.y0 + bx.h + 28);
    /* 지자기 극성 연대표 띠 */
    const ty = bx.y0 + bx.h + 52, th = 18, T = (t) => bx.x0 + t / TMAX * bx.w;
    ctx.fillStyle = C.card; ctx.fillRect(bx.x0, ty, bx.w, th);
    ctx.fillStyle = C.ink; NORMAL.forEach(([a, b]) => { if (a < TMAX) ctx.fillRect(T(a), ty, T(Math.min(b, TMAX)) - T(a), th); });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(bx.x0 + .5, ty + .5, bx.w - 1, th - 1);
    ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("지자기 극성 연대표 (검정: 정자극기, 흰색: 역자극기)", bx.x0, ty - 6);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let t = 0; t <= 6; t++) ctx.fillText(t + " Ma", Math.min(T(t), bx.x0 + bx.w - 16), ty + th + 13);
    const b = BOUND[bi]; ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(T(b.a), ty + th + 1); ctx.lineTo(T(b.a) - 5, ty + th + 9); ctx.lineTo(T(b.a) + 5, ty + th + 9); ctx.fill();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink;
    ctx.fillText(RIDGE[rk].name, bx.x0 + bx.w, bx.y0 - 6);
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const bx = { x0: 50, y0: 22, w: w - 64, h: h - 56 };
    const sets = { mar: tbl.rows.filter((r) => r.key === "mar"), epr: tbl.rows.filter((r) => r.key === "epr") };
    const fits = {};
    Object.keys(sets).forEach((k) => { fits[k] = sets[k].length > 1 ? L.linfit(sets[k].map((r) => r.age), sets[k].map((r) => Math.abs(r.x)), true) : null; });
    const ymax = Math.max(100, ...tbl.rows.map((r) => Math.abs(r.x) * 1.1));
    const res = L.plot(ctx, bx, { pts: sets.mar.map((r) => ({ x: r.age, y: Math.abs(r.x) })), fit: fits.mar, xr: [0, 6], yr: [0, ymax], xlabel: "나이 (Ma)", ylabel: "해령에서 거리 |x| (km)", color: C.forest });
    ctx.save(); ctx.beginPath(); ctx.rect(bx.x0, bx.y0, bx.w, bx.h); ctx.clip();
    if (fits.epr) { ctx.strokeStyle = "#3460aa"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(res.X(0), res.Y(0)); ctx.lineTo(res.X(6), res.Y(fits.epr.a * 6)); ctx.stroke(); }
    ctx.fillStyle = "#3460aa"; sets.epr.forEach((r) => { ctx.beginPath(); ctx.arc(res.X(r.age), res.Y(Math.abs(r.x)), 3.2, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
    $(".n-1").textContent = fits.mar ? `${fits.mar.a.toFixed(1)} mm/yr` : "—";
    $(".n-2").textContent = fits.epr ? `${fits.epr.a.toFixed(1)} mm/yr` : "—";
    $(".n-3").textContent = fits.mar && fits.epr ? `${(fits.epr.a / fits.mar.a).toFixed(1)}배` : "—";
  }

  function record() {
    const b = BOUND[bi], x = L.snap(cur, 0.1);
    tbl.add({ key: rk, r: rk === "mar" ? "대서양" : "동태평양", b: b.n, age: b.a, x, xs: cur });
    drawTop();
  }
  const sC = $(".cur");
  function setRidge(k) {
    rk = k; build();
    root.querySelectorAll("[data-r]").forEach((q) => q.setAttribute("aria-pressed", String(q.dataset.r === k)));
    sC.min = -prof.X; sC.max = prof.X; sC.step = prof.X > 200 ? 0.5 : 0.1; cur = 0; sC.value = 0; upd();
  }
  const upd = () => { cur = +sC.value; $(".cur-out").textContent = cur.toFixed(1); drawTop(); };
  sC.addEventListener("input", upd);
  $(".ridges").addEventListener("click", (e) => { const b = e.target.closest("[data-r]"); if (b) setRidge(b.dataset.r); });
  const bb = $(".bounds");
  bb.innerHTML = BOUND.map((b, i) => `<button class="chip" type="button" data-b="${i}" aria-pressed="${i === bi}">${b.n} ${b.a}</button>`).join("");
  bb.addEventListener("click", (e) => { const b = e.target.closest("[data-b]"); if (!b) return; bi = +b.dataset.b; bb.querySelectorAll("[data-b]").forEach((q) => q.setAttribute("aria-pressed", String(q === b))); drawTop(); });
  $(".rec").addEventListener("click", record);
  $(".clear").addEventListener("click", () => { tbl.clear(); drawTop(); });
  $(".blocks").addEventListener("click", (e) => { showBlocks = !showBlocks; e.currentTarget.setAttribute("aria-pressed", String(showBlocks)); drawTop(); });
  setRidge("mar");
  if (L.demo) {
    /* 사람이 영점 교차를 읽는 오차를 흉내 낸다 */
    [["epr", [0, 2, 3, 5, 6, 7]], ["mar", [0, 3, 4, 5, 6, 8]]].forEach(([k, idx]) => {
      setRidge(k);
      idx.forEach((i) => { [-1, 1].forEach((sd) => { bi = i; cur = sd * (BOUND[i].a * RIDGE[k].v + (k === "mar" ? 0.6 : 2) * L.gauss()); record(); }); });
    });
    bi = 0; bb.querySelectorAll("[data-b]").forEach((q) => q.setAttribute("aria-pressed", String(+q.dataset.b === 0)));
    cur = 0; sC.value = 0; upd();
  }
})();
