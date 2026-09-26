/* 카드: 공기의 78%가 질소인데 식물은 왜 질소가 모자랄까? — 질소 순환 상자 모형 (상대값, 모식) */
(() => {
  const root = document.getElementById("card-bio-nitrogen");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sFert = $(".fert");
  const on = { fix: true, nit: true, den: true, dec: true };

  // 연간 흐름 (상대값). 생물 = 생산자·소비자 몸속 유기 질소, 사체 = 사체·배설물 유기 질소
  function flows(s, o) {
    const cap = Math.max(0, 1 - s.B / 400);
    return {
      fix: 8 * (o.fix ? 1 : 0) + 0.5, fert: o.fert, nit: 1.5 * (o.nit ? 1 : 0) * s.NH4,
      upN: 0.8 * s.NO3 * cap, upA: 0.05 * s.NH4 * cap, vol: 0.1 * s.NH4,
      death: 0.1 * s.B, amm: 0.3 * (o.dec ? 1 : 0) * s.D, den: 0.12 * (o.den ? 1 : 0) * s.NO3, leach: 0.06 * s.NO3,
    };
  }
  function stepS(s, o, dt) {
    const f = flows(s, o);
    return {
      NH4: s.NH4 + (f.fix + f.fert + f.amm - f.nit - f.upA - f.vol) * dt,
      NO3: s.NO3 + (f.nit - f.upN - f.den - f.leach) * dt,
      B: s.B + (f.upN + f.upA - f.death) * dt,
      D: s.D + (f.death - f.amm) * dt,
    };
  }
  const BASEO = { fix: 1, nit: 1, den: 1, dec: 1, fert: 0 };
  let BASE = { NH4: 5, NO3: 10, B: 200, D: 60 };
  for (let i = 0; i < 40000; i++) BASE = stepS(BASE, BASEO, 0.02);
  const YEARS = 50;
  function run() {
    const o = { ...on, fert: +sFert.value };
    let s = { ...BASE }; const pts = [s];
    for (let i = 1; i <= YEARS / 0.02; i++) { s = stepS(s, o, 0.02); if (i % 25 === 0) pts.push(s); }
    return { pts, o, fl: flows(s, o) };
  }

  const { ctx, size } = fit(cv, () => draw());
  const VW = 400, VH = 300;
  let R = null;
  const COL = { B: C.forest, D: "#9b7a55", NH4: "#7d4f8f", NO3: "#4a78b5" };
  function txt(s, x, y, o = {}) {
    ctx.font = `${o.w || 500} ${o.size || 11}px ${o.mono ? F.mono : F.sans}`;
    ctx.textAlign = o.align || "center"; ctx.fillStyle = o.c || C.ink; ctx.fillText(s, x, y); ctx.textAlign = "left";
  }
  function box(x, y, w, h, t1, t2, c) {
    ctx.fillStyle = "#fff"; ctx.strokeStyle = c; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 6); ctx.fill(); ctx.stroke();
    txt(t1, x, y - (t2 ? 2 : -4), { w: 700, c, size: 11.5 }); if (t2) txt(t2, x, y + 12, { size: 10, mono: 1, c: C.ink2 });
  }
  function arr(x0, y0, x1, y1, flux, alive, lab, lx, ly, align = "center") {
    const c = alive ? C.ink2 : C.warn, wdt = alive ? Math.max(0.8, Math.min(7, flux / 4)) : 1.2;
    ctx.strokeStyle = c; ctx.lineWidth = wdt; ctx.setLineDash(alive ? [] : [4, 4]);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
    const a = Math.atan2(y1 - y0, x1 - x0), hs = 5 + wdt * 0.6;
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - hs * Math.cos(a - .5), y1 - hs * Math.sin(a - .5)); ctx.lineTo(x1 - hs * Math.cos(a + .5), y1 - hs * Math.sin(a + .5)); ctx.fill();
    if (lab) txt(alive ? lab : `${lab} ✕`, lx, ly, { size: 10, c: alive ? C.ink : C.warn, w: 600, align });
  }

  function draw() {
    const { w, h } = size;
    if (!w || !R) return;
    const dpr = cv.width / w, s = w / VW;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
    const st = R.pts[R.pts.length - 1], f = R.fl, o = R.o;
    arr(160, 32, 88, 82, f.fix, o.fix, "질소 고정", 112, 50, "right");
    arr(312, 82, 240, 32, f.den, o.den, "탈질산화", 292, 50, "left");
    arr(118, 100, 272, 100, f.nit, o.nit, "질산화", 195, 94);
    arr(330, 120, 330, 150, f.upN, true, "흡수", 338, 140, "left");
    arr(276, 176, 124, 176, f.death, true, "죽음·배설", 200, 170);
    arr(70, 158, 70, 120, f.amm, o.dec, "분해(암모니아화)", 62, 142, "right");
    if (o.fert > 0) { arr(4, 100, 24, 100, o.fert, true, "", 0, 0); txt("비료", 12, 90, { size: 10, c: C.ink2 }); }
    arr(378, 100, 396, 100, f.leach, true, "", 0, 0); txt("강으로", 388, 118, { size: 10, c: C.ink2 });
    box(200, 20, 150, 26, "대기 N₂ (공기의 78%)", "", C.ink2);
    box(70, 100, 92, 36, "암모늄 이온", `NH₄⁺ ${st.NH4.toFixed(0)}`, COL.NH4);
    box(330, 100, 92, 36, "질산 이온", `NO₃⁻ ${st.NO3.toFixed(0)}`, COL.NO3);
    box(330, 176, 104, 36, "생물 (단백질 등)", `${st.B.toFixed(0)}`, COL.B);
    box(70, 176, 100, 36, "사체·배설물", `${st.D.toFixed(0)}`, COL.D);
    // 그래프
    const gx = 34, gy = 216, gw = 356, gh = 70;
    const mx = Math.max(300, ...R.pts.map((p) => Math.max(p.B, p.D, p.NH4, p.NO3)));
    const top = Math.ceil(mx / 100) * 100;
    const X = (t) => gx + t / YEARS * gw, Y = (v) => gy + (1 - v / top) * gh;
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [[0, "0"], [10, "10"], [20, "20"], [30, "30"], [40, "40"], [50, "50년"]], yt: [[0, "0"], [top / 2, `${top / 2}`], [top, `${top}`]], ylabel: "질소량 (상대값)" });
    for (const k of ["D", "NH4", "NO3", "B"]) {
      ctx.strokeStyle = COL[k]; ctx.lineWidth = k === "B" ? 2.4 : 1.4; ctx.beginPath();
      R.pts.forEach((p, i) => (i ? ctx.lineTo(X(i * 0.5), Y(p[k])) : ctx.moveTo(X(0), Y(p[k]))));
      ctx.stroke();
    }
  }

  function update() {
    $(".fert-out").textContent = sFert.value;
    root.querySelectorAll("[data-b]").forEach((el) => (on[el.dataset.b] = el.checked));
    R = run();
    const st = R.pts[R.pts.length - 1];
    const pct = st.B / BASE.B * 100;
    const b = $(".n-bio"); b.textContent = `${Math.round(pct)}%`; b.className = "n-bio " + (pct < 80 ? "bad" : pct > 120 ? "good" : "");
    $(".n-leach").textContent = `${(R.fl.leach / (0.06 * BASE.NO3)).toFixed(1)}배`;
    $(".n-nh4").textContent = `${(st.NH4 / BASE.NH4).toFixed(1)}배`;
    draw();
  }
  root.querySelectorAll("[data-b]").forEach((el) => el.addEventListener("change", update));
  sFert.addEventListener("input", update);
  update();
})();
