/* 카드: 선천 면역과 후천 면역은 따로 싸울까? — 병원체·선천 면역·후천 면역의 상호작용 (모식 모형, 상대값) */
(() => {
  const root = document.getElementById("card-adbio-infection");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sR = $(".rr"), oR = $(".rr-out");
  const ck = { noInnate: $(".k-inn"), noAdapt: $(".k-ad"), noLink: $(".k-link"), mem: $(".k-mem") };
  const nPk = $(".n-pk"), nCl = $(".n-cl"), nOut = $(".n-out");

  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹", sup = (n) => String(n).split("").map((d) => SUP[+d]).join("");
  const sci = (v) => { const e = Math.floor(Math.log10(v)), m = v / 10 ** e; return `${m.toFixed(1)}×10${sup(e)}`; };
  const DAYS = 21, DT = 0.002, PMAX = 1e9, PDEATH = 1e8;
  function run() {
    const o = {}; Object.keys(ck).forEach((k) => { o[k] = ck[k].checked; });
    const r = +sR.value;
    let P = 100, N = 1, A = o.mem ? 0.1 : 1e-5;
    const A0 = A, out = { t: [], P: [], N: [], A: [] };
    let peak = P, tClear = null, tDeath = null;
    const nOn = !o.noInnate, aOn = !o.noAdapt;
    for (let i = 0; i * DT <= DAYS; i++) {
      const t = i * DT;
      /* 선천: 상주 식세포·보체(기본 1) + 사이토카인으로 동원되는 호중구·대식세포. 병원체가 많으면 처리 능력이 포화 */
      const kill = (nOn ? 0.12 * N * P / (1 + P / 1e6) : 0) + (aOn ? 40 * A * P : 0);
      P += DT * (r * P * (1 - P / PMAX) - kill);
      if (P < 1) { P = 0; if (tClear === null) tClear = t; }
      if (P > peak) peak = P;
      if (tDeath === null && P >= PDEATH) tDeath = t;
      N += DT * ((nOn ? 20 * P / (P + 1e5) : 0) - (N - (nOn ? 1 : 0)));
      /* 후천: 항원 제시(수지상 세포 등 선천 면역 세포가 맡음)를 받아야 클론이 증식 */
      const act = aOn ? (P / (P + 1e3)) * (o.noLink ? 0 : nOn ? 1 : 0.15) : 0;
      A += DT * (2.4 * A * act * (1 - A) - 0.25 * (A - A0) * (1 - act));
      if (i % 25 === 0) { out.t.push(t); out.P.push(P); out.N.push(N); out.A.push(A); }
    }
    return { out, peak, tClear, tDeath };
  }

  const { ctx, size } = fit(cv, () => draw());
  let res = null;
  function draw() {
    const { w, h } = size; if (!w || !res) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 46, x1 = w - 12, X = (t) => x0 + t / DAYS * (x1 - x0);
    const panel = (y0, ph, title) => {
      ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + ph); ctx.lineTo(x1, y0 + ph); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(title, x0, y0 - 7);
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
      for (let d = 0; d <= DAYS; d += 3) { ctx.fillText(String(d), X(d), y0 + ph + 13); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(X(d), y0); ctx.lineTo(X(d), y0 + ph); ctx.stroke(); }
    };
    const plot = (arr, f, col, wid, dash) => { ctx.strokeStyle = col; ctx.lineWidth = wid; ctx.setLineDash(dash || []); ctx.beginPath(); arr.forEach((v, i) => { const x = X(res.out.t[i]), y = f(v); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; };
    /* 1) 병원체 */
    const a0 = 22, ah = h * 0.38;
    panel(a0, ah, "병원체 수 (상대값, 로그 눈금)");
    const PY = (p) => a0 + ah - Math.log10(Math.max(1, p)) / 9 * ah;
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (const e of [0, 3, 6, 9]) ctx.fillText(e === 0 ? "1" : `10${sup(e)}`, x0 - 4, PY(10 ** e) + 3);
    ctx.fillStyle = "rgba(181,83,47,.08)"; ctx.fillRect(x0, a0, x1 - x0, PY(PDEATH) - a0);
    ctx.setLineDash([4, 3]); ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(x0, PY(PDEATH)); ctx.lineTo(x1, PY(PDEATH)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("몸이 견디기 어려운 수준(가정)", x1 - 2, PY(PDEATH) + 12);
    plot(res.out.P, PY, C.ink, 2.2);
    /* 2) 선천 면역 */
    const b0 = a0 + ah + 44, bh = h * 0.17;
    panel(b0, bh, "선천 면역: 감염 부위에 모인 식세포 (상대값)");
    const NY = (n) => b0 + bh - Math.min(22, n) / 22 * bh;
    plot(res.out.N, NY, "#e0a02a", 2);
    /* 3) 후천 면역 */
    const c0 = b0 + bh + 44, chh = h - c0 - 30;
    panel(c0, chh, "후천 면역: 이 병원체에 맞는 림프구 수 (처음 대비, 로그)");
    const AY = (a) => c0 + chh - Math.log10(Math.max(1e-5, a) / 1e-5) / 5 * chh;
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("1배", x0 - 4, AY(1e-5) + 3); ctx.fillText("10⁵배", x0 - 4, AY(1) + 3);
    plot(res.out.A, AY, "#3f6fa3", 2);
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3; ctx.fillText("감염 후 날짜", x1, c0 + chh + 26);
  }
  function update() {
    oR.textContent = (+sR.value).toFixed(1);
    res = run();
    nPk.textContent = res.peak >= PMAX * 0.99 ? "10⁹ 이상" : sci(res.peak);
    nCl.textContent = res.tClear !== null ? `${res.tClear.toFixed(1)}일째` : "제거 못 함";
    nOut.textContent = res.tDeath !== null ? `위험 (${res.tDeath.toFixed(0)}일째)` : res.tClear !== null ? "회복" : "감염 지속";
    nOut.className = "n-out " + (res.tDeath !== null ? "bad" : res.tClear !== null ? "good" : "");
    draw();
  }
  sR.addEventListener("input", update);
  Object.values(ck).forEach((c) => c.addEventListener("change", update));
  update();
})();
