/* 카드: PCR은 아주 적은 양의 바이러스를 어떻게 찾아낼까? — 증폭 곡선과 Ct (모식 모형) */
(() => {
  const root = document.getElementById("card-is2-pcr");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sN0 = $(".n0"), oN0 = $(".n0-out"), sE = $(".eff"), oE = $(".eff-out"), sCy = $(".cyc"), oCy = $(".cyc-out");
  const cLog = $(".logy"), cSer = $(".series"), bRun = $(".run");
  const [dCyc, dN, dCt, dFold] = root.querySelectorAll(".nums dd");

  // 모식 모형: 한 사이클마다 N ← N + E·N·(1 − N/NMAX). 재료가 떨어지면 증폭이 멈춘다.
  const NMAX = 1e12, TH = 1e10, CYC = 40;
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = (n) => String(n).split("").map((d) => (d === "-" ? "⁻" : SUP[+d])).join("");
  const sci = (x) => {
    if (x < 1e4) return Math.round(x).toLocaleString("ko-KR");
    let e = Math.floor(Math.log10(x)), m = Math.round(x / 10 ** e * 10) / 10;
    if (m >= 10) { m /= 10; e += 1; }
    return `${m.toFixed(1)}×10${sup(e)}`;
  };

  function curve(n0, E) {
    const a = [n0];
    let N = n0;
    for (let i = 1; i <= CYC; i++) { N = N + E * N * (1 - N / NMAX); a.push(N); }
    return a;
  }
  function ct(a) {
    for (let i = 1; i < a.length; i++) if (a[i] >= TH) {
      const l0 = Math.log10(a[i - 1]), l1 = Math.log10(a[i]);
      return i - 1 + (Math.log10(TH) - l0) / (l1 - l0);
    }
    return null;
  }
  const at = (a, c) => { const i = Math.floor(c), f = c - i; if (i >= CYC) return a[CYC]; return a[i] * Math.pow(a[i + 1] / a[i], f); };

  let cyc = +sCy.value, running = false;
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size;
    if (!w) return;
    const n0 = 10 ** +sN0.value, E = +sE.value / 100, logy = cLog.checked;
    const main = curve(n0, E);
    ctx.clearRect(0, 0, w, h);
    const x0 = logy ? 46 : 40, y0 = 22, pw = w - x0 - 14, ph = h - y0 - 36;
    const X = (c) => x0 + c / CYC * pw;
    const Y = logy ? (N) => y0 + (1 - Math.log10(Math.max(N, 1)) / 12) * ph : (N) => y0 + (1 - N / NMAX) * ph;
    const yt = logy ? [0, 2, 4, 6, 8, 10, 12].map((k) => [10 ** k, `10${sup(k)}`])
      : [0, .25, .5, .75, 1].map((k) => [k * NMAX, `${k * 100}`]);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y,
      xt: [0, 10, 20, 30, 40].map((c) => [c, String(c)]), yt,
      xlabel: "사이클", ylabel: logy ? "DNA 조각 수 (로그 눈금)" : "형광 세기 (최댓값 대비 %)" });

    // 검출 기준선
    ctx.setLineDash([5, 4]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, Math.round(Y(TH)) + .5); ctx.lineTo(x0 + pw, Math.round(Y(TH)) + .5); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.warn; ctx.textAlign = "left";
    ctx.fillText("검출 기준선", x0 + 4, Y(TH) - 5);

    const line = (a, upto, color, lw) => {
      ctx.beginPath();
      for (let c = 0; c <= upto + 1e-9; c += 0.25) { const x = X(c), y = Y(at(a, c)); c ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke();
    };

    // 10배 희석 계열
    if (cSer.checked) {
      const cts = [];
      for (let k = 6; k >= 0; k--) {
        const a = curve(10 ** k, E); line(a, CYC, "rgba(59,124,42,.28)", 1.2);
        const t = ct(a); if (t !== null) cts.push([k, t]);
      }
      ctx.fillStyle = C.forest;
      cts.forEach(([, t]) => { ctx.beginPath(); ctx.arc(X(t), Y(TH), 2.6, 0, Math.PI * 2); ctx.fill(); });
      if (cts.length > 1) {
        const gap = (cts[cts.length - 1][1] - cts[0][1]) / (cts.length - 1);
        ctx.textAlign = "right"; ctx.font = `500 11px ${F.mono}`;
        ctx.fillText(`10배 묽힐 때마다 Ct +${gap.toFixed(1)}`, x0 + pw - 4, logy ? y0 + ph - 8 : y0 + 14);
      }
    }

    // 지금 시료
    line(main, cyc, C.ink, 2.4);
    const N = at(main, cyc);
    ctx.beginPath(); ctx.arc(X(cyc), Y(N), 4.5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    const t = ct(main);
    if (t !== null && cyc >= t) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(X(t), Y(TH), 6, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = C.warn; ctx.textAlign = "center"; ctx.font = `500 11px ${F.mono}`;
      ctx.fillText(`Ct ${t.toFixed(1)}`, X(t), Y(TH) + (logy ? -12 : -12));
    }
    ctx.textAlign = "left";

    // 수치
    oN0.textContent = sci(n0); oE.textContent = Math.round(E * 100); oCy.textContent = Math.floor(cyc);
    dCyc.textContent = String(Math.floor(cyc));
    dN.textContent = sci(at(main, Math.floor(cyc)));
    dCt.textContent = t === null ? "40회 안에 없음" : t.toFixed(1);
    dCt.classList.toggle("bad", t === null);
    dFold.textContent = sci(at(main, Math.floor(cyc)) / n0) + "배";
  }

  [sN0, sE, cLog, cSer].forEach((el) => el.addEventListener("input", draw));
  sCy.addEventListener("input", () => { running = false; cyc = +sCy.value; draw(); });
  bRun.addEventListener("click", () => { cyc = 0; running = true; });
  let autoplayed = false;
  loop(cv, (dt) => {
    if (!autoplayed && !NM.reduce) { autoplayed = true; cyc = 0; running = true; }
    if (!running) return;
    cyc = Math.min(CYC, cyc + dt * 5);
    sCy.value = Math.floor(cyc);
    if (cyc >= CYC) running = false;
    draw();
  });
  draw();
})();
