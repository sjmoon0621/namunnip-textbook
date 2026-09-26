/* 카드: 개체군은 왜 끝없이 늘지 않을까? — 지수 생장과 로지스틱 생장 (모식) */
(() => {
  const root = document.getElementById("card-bio-logistic");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const [cvT, cvR] = root.querySelectorAll("canvas");
  const sR = $(".r"), sK = $(".k"), sN = $(".n0"), oR = $(".r-out"), oK = $(".k-out"), oN = $(".n0-out");
  const nHalf = $(".half"), nMax = $(".maxrate"), nGap = $(".gap"), msg = $(".lg-msg");
  const TEND = 30;

  // 로지스틱 생장의 해석해: N(t) = K / (1 + (K − N0)/N0 · e^(−rt))
  const logi = (t, r, K, N0) => K / (1 + (K - N0) / N0 * Math.exp(-r * t));
  const expo = (t, r, N0) => N0 * Math.exp(r * t);

  const T = fit(cvT, () => drawT());
  const R = fit(cvR, () => drawR());

  function drawT() {
    const { ctx, size: { w, h } } = T; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = +sR.value, K = +sK.value, N0 = +sN.value;
    const x0 = 42, y0 = 22, pw = w - x0 - 12, ph = h - y0 - 36, ymax = 1000 * 1.1;
    const X = (t) => x0 + t / TEND * pw, Y = (n) => y0 + (1 - Math.min(n, ymax) / ymax) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 10, 20, 30].map((t) => [t, `${t}`]), yt: [0, 250, 500, 750, 1000].map((n) => [n, `${n}`]), ylabel: "개체 수", xlabel: "시간 (일)" });
    // 환경 저항: 지수 곡선과 실제 곡선 사이
    ctx.beginPath();
    for (let t = 0; t <= TEND; t += 0.1) ctx.lineTo(X(t), Y(expo(t, r, N0)));
    for (let t = TEND; t >= 0; t -= 0.1) ctx.lineTo(X(t), Y(logi(t, r, K, N0)));
    ctx.closePath(); ctx.fillStyle = "rgba(181,83,47,.14)"; ctx.fill();
    // 환경 수용력
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, Y(K)); ctx.lineTo(x0 + pw, Y(K)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.fillText(`환경 수용력 K = ${K}`, x0 + pw, Y(K) - 5);
    // 곡선
    const curve = (f, col, dash) => {
      ctx.beginPath(); for (let t = 0; t <= TEND; t += 0.1) { const y = Y(f(t)); t ? ctx.lineTo(X(t), y) : ctx.moveTo(X(t), y); }
      ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
    };
    curve((t) => expo(t, r, N0), C.warn, [5, 4]);
    curve((t) => logi(t, r, K, N0), C.forest);
    // 이름표
    ctx.textAlign = "left"; ctx.font = `600 11px ${F.sans}`;
    let te = 0; while (te < TEND && expo(te, r, N0) < ymax * 0.8) te += 0.1;
    ctx.fillStyle = C.warn; ctx.fillText("이론적 생장 곡선 (J자)", Math.min(X(te) + 6, x0 + pw - 130), Y(ymax * 0.8) + 4);
    ctx.fillStyle = C.forest; ctx.fillText("실제 생장 곡선 (S자)", Math.min(X(TEND * 0.62), x0 + pw - 120), Y(logi(TEND * 0.62, r, K, N0)) + 18);
    const tm = Math.log((K - N0) / N0) / r;
    ctx.fillStyle = "#9a4a2a"; ctx.font = `10.5px ${F.sans}`;
    if (tm > 1 && tm < TEND - 2) ctx.fillText("환경 저항", X(tm) + 8, Y(K * 0.72));
  }

  // 오른쪽: 개체 수에 따른 하루 증가량 (dN/dt = rN(1 − N/K))
  function drawR() {
    const { ctx, size: { w, h } } = R; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = +sR.value, K = +sK.value;
    const x0 = 40, y0 = 22, pw = w - x0 - 12, ph = h - y0 - 36;
    const ymax = Math.max(1, 1.0 * 1000 / 4) * 1.1;
    const X = (n) => x0 + n / 1000 * pw, Y = (v) => y0 + (1 - v / ymax) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 500, 1000].map((n) => [n, `${n}`]), yt: [0, 100, 200].map((v) => [v, `${v}`]), ylabel: "하루 증가량", xlabel: "개체 수" });
    ctx.beginPath(); for (let n = 0; n <= K; n += 2) { const y = Y(r * n * (1 - n / K)); n ? ctx.lineTo(X(n), y) : ctx.moveTo(X(n), y); }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(K / 2), Y(0)); ctx.lineTo(X(K / 2), Y(r * K / 4)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(X(K / 2), Y(r * K / 4), 4, 0, Math.PI * 2); ctx.fillStyle = C.forest; ctx.fill();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    ctx.fillText("K/2", X(K / 2), Y(r * K / 4) - 9);
  }

  function update() {
    const r = +sR.value, K = +sK.value, N0 = +sN.value;
    oR.textContent = r.toFixed(2); oK.textContent = K; oN.textContent = N0;
    const tHalf = Math.log((K - N0) / N0) / r;
    nHalf.textContent = tHalf > 0 ? `${tHalf.toFixed(1)}일` : "이미 넘음";
    nMax.textContent = `${Math.round(r * K / 4)}마리`;
    const e = expo(20, r, N0), l = logi(20, r, K, N0);
    nGap.textContent = e > 1e6 ? `${e.toExponential(1).replace("e+", "×10^")} vs ${Math.round(l)}` : `${Math.round(e).toLocaleString("ko-KR")} vs ${Math.round(l)}`;
    msg.textContent = N0 >= K ? "처음부터 환경 수용력을 넘었습니다. 이런 개체군은 오히려 줄어듭니다."
      : `처음에는 두 곡선이 거의 겹치다가, 개체 수가 K/2(${K / 2}마리) 근처를 지나면서 크게 벌어집니다.`;
    drawT(); drawR();
  }
  [sR, sK, sN].forEach((el) => el.addEventListener("input", update));
  update();
})();
