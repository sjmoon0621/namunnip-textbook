/* 카드: 탄소는 생태계를 어떻게 돌까? — 육상 탄소 순환 상자 모형 (전 지구 어림값, 모식) */
(() => {
  const root = document.getElementById("card-bio-carbon");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sF = $(".fossil"), sP = $(".photo"), sD = $(".decomp"), sY = $(".year"), cS = $(".season");
  const A0 = 590, DT = 1 / 48, YEARS = 100, PPM = 2.12; // 대기 CO₂ 1 ppm ≈ 2.12 GtC

  // 산업화 이전 평형: 광합성 120, 생산자 호흡 60, 섭식 6, 낙엽·사체 54, 소비자 호흡 5, 소비자 사체 1, 분해 55 (GtC/년)
  function run() {
    const F0 = +sF.value, ph = +sP.value / 100, dec = +sD.value / 100, season = cS.checked;
    let A = A0, P = 550, S = 1500, Cn = 2, cum = 0;
    const ppm = [], snap = [];
    for (let i = 0; i <= YEARS / DT; i++) {
      const t = i * DT;
      const gm = 120 * ph * Math.max(0.05, 1 + 0.25 * Math.log(Math.max(A, 1) / A0)) * Math.pow(P / 550, 0.3);
      const g = gm * (1 + (season ? 0.33 * Math.sin(2 * Math.PI * t) : 0));
      const fl = { gpp: gm, rp: 0.5 * gm, herb: 6 / 550 * P, lit: P / (550 / 54), rc: 2.5 * Cn, dc: 0.5 * Cn, rs: dec * S / (1500 / 55), oc: 0.01 * (A - A0), fos: F0 };
      if (i % 48 === 0) snap.push({ A, P, S, Cn, cum, ...fl });
      ppm.push(A / PPM);
      A += (-g + fl.rp + fl.rc + fl.rs + F0 - fl.oc) * DT;
      P += (g - fl.rp - fl.herb - fl.lit) * DT;
      Cn += (fl.herb - fl.rc - fl.dc) * DT;
      S += (fl.lit + fl.dc - fl.rs) * DT;
      cum += F0 * DT;
    }
    return { ppm, snap };
  }

  const { ctx, size } = fit(cv, () => draw());
  const VW = 400, VH = 300;
  let R = null;
  function txt(s, x, y, o = {}) {
    ctx.font = `${o.w || 500} ${o.size || 11}px ${o.mono ? F.mono : F.sans}`;
    ctx.textAlign = o.align || "center"; ctx.fillStyle = o.c || C.ink; ctx.fillText(s, x, y); ctx.textAlign = "left";
  }
  function box(x, y, w, h, t1, t2, c) {
    ctx.fillStyle = "#fff"; ctx.strokeStyle = c; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 6); ctx.fill(); ctx.stroke();
    txt(t1, x, y - 2, { w: 700, c, size: 11.5 }); txt(t2, x, y + 12, { size: 10, mono: 1, c: C.ink2 });
  }
  function arr(pts, flux, c, lab, lx, ly, align = "center") {
    const wdt = Math.max(0.8, Math.min(9, Math.abs(flux) / 11));
    ctx.strokeStyle = c; ctx.lineWidth = wdt; ctx.beginPath(); ctx.moveTo(...pts[0]);
    if (pts.length === 3) ctx.quadraticCurveTo(...pts[1], ...pts[2]); else ctx.lineTo(...pts[1]);
    ctx.stroke();
    const e = pts[pts.length - 1], b = pts[pts.length - 2], a = Math.atan2(e[1] - b[1], e[0] - b[0]), hs = 5 + wdt * 0.6;
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(e[0] + 2 * Math.cos(a), e[1] + 2 * Math.sin(a));
    ctx.lineTo(e[0] - hs * Math.cos(a - .5), e[1] - hs * Math.sin(a - .5)); ctx.lineTo(e[0] - hs * Math.cos(a + .5), e[1] - hs * Math.sin(a + .5)); ctx.fill();
    if (lab) txt(`${lab} ${Math.abs(flux).toFixed(Math.abs(flux) < 10 ? 1 : 0)}`, lx, ly, { size: 9.5, mono: 1, c: C.ink2, align });
  }

  function draw() {
    const { w, h } = size;
    if (!w || !R) return;
    const dpr = cv.width / w, s = w / VW;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
    const y = +sY.value, st = R.snap[y];
    const G = C.forest, AT = "#8d8d92";
    // 흐름 화살표
    arr([[158, 50], [80, 104]], st.gpp, G, "광합성", 96, 70, "right");
    arr([[98, 104], [174, 50]], st.rp, AT, "호흡", 146, 88, "left");
    arr([[112, 126], [154, 126]], st.herb, "#a8702e", "", 0, 0);
    txt(`섭식 ${st.herb.toFixed(1)}`, 133, 148, { size: 9.5, mono: 1, c: C.ink2 });
    arr([[200, 106], [200, 50]], st.rc, AT, "", 0, 0);
    txt(`호흡 ${st.rc.toFixed(1)}`, 204, 80, { size: 9.5, mono: 1, c: C.ink2, align: "left" });
    arr([[60, 146], [200, 190], [322, 146]], st.lit, "#9b7a55", "낙엽·사체", 200, 176);
    arr([[246, 126], [288, 126]], st.dc, "#9b7a55", "", 0, 0);
    arr([[318, 104], [238, 50]], st.rs, AT, "분해", 300, 80, "left");
    if (st.fos > 0) arr([[308, 26], [264, 26]], st.fos, C.ink, "", 0, 0);
    arr([[136, 26], [96, 26]], st.oc, "#4a78b5", "", 0, 0);
    // 저장소
    box(200, 28, 124, 36, "대기 CO₂", `${Math.round(st.A)} GtC · ${Math.round(st.A / PPM)} ppm`, C.ink);
    box(52, 26, 82, 32, "바다", `흡수 ${st.oc.toFixed(1)}`, "#4a78b5");
    box(350, 26, 84, 32, "화석 연료", `연소 ${st.fos.toFixed(0)}`, C.ink2);
    box(60, 125, 100, 38, "생산자", `${Math.round(st.P)} GtC`, G);
    box(200, 125, 90, 38, "소비자", `${st.Cn.toFixed(1)} GtC`, "#a8702e");
    box(340, 125, 104, 38, "분해자·토양", `${Math.round(st.S)} GtC`, "#9b7a55");
    // CO₂ 그래프
    const gx = 36, gy = 206, gw = 354, gh = 78;
    const vals = R.ppm, lo = Math.min(260, ...vals) - 5, hi = Math.max(300, ...vals) + 5;
    const X = (t) => gx + t / YEARS * gw, Y = (v) => gy + (1 - (v - lo) / (hi - lo)) * gh;
    const stp = hi - lo > 200 ? 100 : hi - lo > 80 ? 50 : 20, yt = [];
    for (let v = Math.ceil(lo / stp) * stp; v <= hi; v += stp) yt.push([v, `${v}`]);
    NM.axes(ctx, { x0: gx, y0: gy, w: gw, h: gh, X, Y, xt: [[0, "0"], [25, "25"], [50, "50"], [75, "75"], [100, "100년"]], yt, ylabel: "대기 CO₂ (ppm)" });
    ctx.strokeStyle = C.apple; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i < vals.length; i += 2) { const px = X(i * DT), py = Y(vals[i]); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(y) + .5, gy); ctx.lineTo(X(y) + .5, gy + gh); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(y), Y(st.A / PPM), 3.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  }

  function update() {
    $(".fossil-out").textContent = sF.value; $(".photo-out").textContent = sP.value; $(".decomp-out").textContent = sD.value; $(".year-out").textContent = sY.value;
    R = run();
    const st = R.snap[+sY.value];
    $(".c-ppm").textContent = Math.round(st.A / PPM);
    const land = st.gpp - st.rp - st.rc - st.rs;
    $(".c-land").textContent = `${land >= 0 ? "" : "−"}${Math.abs(land).toFixed(1)}`;
    $(".c-ocean").textContent = `${st.oc >= 0 ? "" : "−"}${Math.abs(st.oc).toFixed(1)}`;
    $(".c-af").textContent = st.cum > 0.5 ? `${Math.round((st.A - A0) / st.cum * 100)}%` : "—";
    root.querySelectorAll("[data-set]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.set === `${sF.value},${sP.value},${sD.value},${cS.checked ? 1 : 0}`));
    draw();
  }
  [sF, sP, sD, sY].forEach((el) => el.addEventListener("input", update));
  cS.addEventListener("change", update);
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [f, p, d, se] = b.dataset.set.split(","); sF.value = f; sP.value = p; sD.value = d; cS.checked = se === "1"; update();
  }));
  update();
})();
