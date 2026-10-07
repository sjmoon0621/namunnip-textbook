/* 카드: 하늘 전체에서 오는 희미한 전파는 왜 대폭발의 증거일까? — FIRAS 스펙트럼에 플랑크 곡선 맞추기, T(z)와 우주의 연대
   자료: COBE/FIRAS CMB monopole spectrum, Fixsen et al. 1996, ApJ 473, 576 (Table 4); Fixsen & Mather 2002, ApJ 581, 817.
   출처: NASA LAMBDA, https://lambda.gsfc.nasa.gov/data/cobe/firas/monopole_spec/firas_monopole_spec_v1.txt (v1, 2005-05), 2026-10 내려받음.
   라이선스: 미국 NASA 자료 — 퍼블릭 도메인. 열: 진동수(cm⁻¹), 세기(MJy/sr), 1σ 불확도(kJy/sr). */
(() => {
  const root = document.getElementById("card-adearth-cmb");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const D = [[2.27,200.723,14],[2.72,249.508,19],[3.18,293.024,25],[3.63,327.770,23],[4.08,354.081,22],[4.54,372.079,21],[4.99,381.493,18],[5.45,383.478,18],[5.90,378.901,16],[6.35,368.833,14],[6.81,354.063,13],[7.26,336.278,12],[7.71,316.076,11],[8.17,293.924,10],[8.62,271.432,11],[9.08,248.239,12],[9.53,225.940,14],[9.98,204.327,16],[10.44,183.262,18],[10.89,163.830,22],[11.34,145.750,22],[11.80,128.835,23],[12.25,113.568,23],[12.71,99.451,23],[13.16,87.036,22],[13.61,75.876,21],[14.07,65.766,20],[14.52,57.008,19],[14.97,49.223,19],[15.43,42.267,19],[15.88,36.352,21],[16.34,31.062,23],[16.79,26.580,26],[17.24,22.644,28],[17.70,19.255,30],[18.15,16.391,32],[18.61,13.811,33],[19.06,11.716,35],[19.51,9.921,41],[19.97,8.364,55],[20.42,7.087,88],[20.87,5.801,155],[21.33,4.523,282]];
  const H = 6.62607015e-34, K = 1.380649e-23, CL = 2.99792458e8, T0 = 2.7255;
  /* 플랑크 함수, 진동수 단위 cm⁻¹ → MJy/sr */
  const B = (s, T) => { const nu = CL * 100 * s; return 2 * H * nu ** 3 / CL ** 2 / Math.expm1(H * nu / (K * T)) / 1e-20; };
  const sT = $(".t"), oT = $(".t-out"), sZ = $(".z"), oZ = $(".z-out");
  const nChi = $(".n-chi"), nRes = $(".n-res"), nLam = $(".n-lam"), nTz = $(".n-tz"), nAge = $(".n-age"), nNg = $(".n-ng");

  /* 우주의 나이 표: Planck 2018 */
  const H0 = 67.4 * 1000 / 3.0857e22, OM = 0.315, OR = 9.1e-5, OL = 1 - OM - OR, YR = 3.156e7;
  const LNA0 = -30, NT = 6000, tab = new Float64Array(NT + 1);
  (() => {
    const Hf = (a) => H0 * Math.sqrt(OR / a ** 4 + OM / a ** 3 + OL);
    let a = Math.exp(LNA0); tab[0] = a * a / (2 * H0 * Math.sqrt(OR));
    const dl = -LNA0 / NT;
    for (let i = 1; i <= NT; i++) { const l1 = LNA0 + (i - 0.5) * dl; tab[i] = tab[i - 1] + dl / Hf(Math.exp(l1)); }
  })();
  const ageAt = (z) => { const l = -Math.log(1 + z), x = (l - LNA0) / (-LNA0) * NT, i = Math.min(NT - 1, Math.max(0, Math.floor(x))); return tab[i] + (tab[i + 1] - tab[i]) * (x - i); };
  const fmtT = (s) => {
    const y = s / YR;
    if (s < 120) return `약 ${s.toFixed(0)}초`;
    if (s < 7200) return `약 ${(s / 60).toFixed(0)}분`;
    if (s < 2 * 86400) return `약 ${(s / 3600).toFixed(0)}시간`;
    if (y < 1) return `약 ${(s / 86400).toFixed(0)}일`;
    if (y < 1e4) return `약 ${Math.round(y).toLocaleString()}년`;
    if (y < 1e8) return `약 ${(y / 1e4).toPrecision(3).replace(/\.0+$/, "")}만 년`;
    return `약 ${(y / 1e8).toPrecision(3)}억 년`;
  };
  const sup = (e) => String(e).replace(/-/g, "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  const sci = (v, p = 2) => { const e = Math.floor(Math.log10(v)); return e < 4 ? (v < 100 ? v.toPrecision(p + 1) : Math.round(v).toLocaleString()) : `${(v / 10 ** e).toFixed(p - 1)}×10${sup(e)}`; };

  const SP = fit($(".cv-s"), () => drawS());
  const ZP = fit($(".cv-z"), () => drawZ());
  function drawS() {
    const { ctx, size: { w, h } } = SP; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = +sT.value, x0 = 48, gw = w - x0 - 12, y0 = 16, gh = (h - 60) * 0.62, ry0 = y0 + gh + 26, rgh = h - ry0 - 34;
    const X = (s) => x0 + (s - 1) / 22 * gw, Y = (v) => y0 + gh - v / 420 * gh;
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [], yt: [[0, "0"], [100, "100"], [200, "200"], [300, "300"], [400, "400"]], ylabel: "세기 (MJy/sr)" });
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const s = 1 + i / 200 * 22; const v = B(s, T); i ? ctx.lineTo(X(s), Y(v)) : ctx.moveTo(X(s), Y(v)); }
    ctx.stroke();
    ctx.fillStyle = C.ink; for (const [s, v] of D) { ctx.beginPath(); ctx.arc(X(s), Y(v), 2.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink2;
    ctx.fillText("● FIRAS 측정값", x0 + gw - 4, y0 + 12); ctx.fillStyle = C.forest; ctx.fillText(`— ${T.toFixed(3)} K 흑체`, x0 + gw - 4, y0 + 26);
    /* 나머지 */
    const res = D.map(([s, v, e]) => [s, (v - B(s, T)) * 1000, e]);
    let lim = Math.max(150, 1.15 * Math.max(...res.slice(0, 38).map(([, r]) => Math.abs(r))));
    const st = lim > 4000 ? 2000 : lim > 1500 ? 1000 : lim > 600 ? 500 : lim > 250 ? 200 : 100; lim = Math.ceil(lim / st) * st;
    const RY = (r) => ry0 + rgh / 2 - r / lim * rgh / 2;
    const yt = []; for (let v = -lim; v <= lim + 1e-9; v += st) yt.push([v, String(v)]);
    NM.axes(ctx, { x0, y0: ry0, w: gw, h: rgh, X, Y: RY, xt: [2, 5, 10, 15, 20].map((s) => [s, String(s)]), yt: [yt[0], [0, "0"], yt[yt.length - 1]], xlabel: "진동수 (cm⁻¹, 1 cm⁻¹ = 30 GHz)", ylabel: "나머지 (kJy/sr)" });
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, RY(0) + .5); ctx.lineTo(x0 + gw, RY(0) + .5); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(x0, ry0, gw, rgh); ctx.clip();
    for (const [s, r, e] of res) {
      ctx.strokeStyle = "rgba(35,35,38,.45)"; ctx.beginPath(); ctx.moveTo(X(s), RY(r - e)); ctx.lineTo(X(s), RY(r + e)); ctx.stroke();
      ctx.fillStyle = Math.abs(r) <= 2 * e ? C.ink : C.warn; ctx.beginPath(); ctx.arc(X(s), RY(r), 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    let chi = 0, ok = 0; for (const [, r, e] of res) { chi += (r / e) ** 2; if (Math.abs(r) <= 2 * e) ok++; }
    nChi.textContent = chi < 1e4 ? chi.toFixed(0) : sci(chi); nChi.className = chi < 70 ? "n-chi good" : "n-chi";
    nRes.textContent = `${ok} / 43`;
    nLam.textContent = `${(2.898 / T).toFixed(3)} mm`;
  }
  const EV = [
    [0, "지금 (2.7 K)", -1],
    [7.7, "재이온화", 1],
    [1090, "재결합 · 배경 복사 방출", -1],
    [3400, "물질 = 복사 밀도", 1],
    [1e9 / T0 - 1, "대폭발 핵합성 (10⁹ K)", 1],
  ];
  function drawZ() {
    const { ctx, size: { w, h } } = ZP; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 48, gw = w - x0 - 14, y0 = 16, gh = h - y0 - 34;
    const X = (lz) => x0 + lz / 10 * gw, Y = (lt) => y0 + gh - lt / 11 * gh;
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [0, 2, 4, 6, 8, 10].map((v) => [v, v === 0 ? "1" : `10${sup(v)}`]), yt: [0, 2, 4, 6, 8, 10].map((v) => [v, v === 0 ? "1" : `10${sup(v)}`]), xlabel: "1 + z (= 지금 크기 / 그때 크기)", ylabel: "복사 온도 (K)" });
    ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(Math.log10(T0))); ctx.lineTo(X(10), Y(Math.log10(T0) + 10)); ctx.stroke();
    ctx.font = `10.5px ${F.sans}`;
    for (const [z, lab, side] of EV) {
      const lz = Math.log10(1 + z), lt = Math.log10(T0 * (1 + z)), px = X(lz), py = Y(lt);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink2; ctx.textAlign = side < 0 ? "left" : "right";
      ctx.fillText(lab, px + (side < 0 ? 8 : -8), py + (side < 0 ? 12 : -6));
    }
    const lz = +sZ.value, px = X(lz), py = Y(Math.log10(T0) + lz);
    ctx.strokeStyle = C.forest; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, y0 + gh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  function updS() { oT.textContent = (+sT.value).toFixed(3); drawS(); }
  function updZ() {
    const lz = +sZ.value, z = 10 ** lz - 1;
    oZ.textContent = z < 10 ? z.toFixed(2) : sci(z, 2);
    nTz.textContent = `${sci(T0 * (1 + z), 3)} K`;
    nAge.textContent = fmtT(ageAt(z));
    nNg.textContent = `${sci(410.7 * (1 + z) ** 3, 2)} /cm³`;
    drawZ();
  }
  sT.addEventListener("input", updS); sZ.addEventListener("input", updZ);
  if (/[?&]demo/.test(location.search)) { sT.value = 2.725; sZ.value = Math.log10(1091).toFixed(2); }
  updS(); updZ();
})();
