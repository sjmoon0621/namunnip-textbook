/* 카드: 자료가 많으면 결론도 옳을까? — 상관과 인과, 제3의 변수(기온). 가상 자료 */
(() => {
  const root = document.getElementById("card-is2-confound");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sN = $(".days"), oN = $(".days-out"), sD = $(".direct"), oD = $(".direct-out"), cBand = $(".band"), bNew = $(".resample"), msg = $(".cf-msg");
  const [dR, dRp, dN] = root.querySelectorAll(".nums dd");

  const NS = [30, 100, 300, 1000, 3000];
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const gauss = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };

  // 가상 자료: 기온 T(°C), 아이스크림 판매량 I(상대값), 물놀이 사고 A(상대값)
  // I = 10 + 2.6(T−14) + 잡음,  A = 5 + 1.5(T−14) + d·(I − 36) + 잡음   — d가 ‘직접 효과’(가정)
  let base = [];
  function gen() {
    base = [];
    for (let i = 0; i < 3000; i++) base.push({ T: 14 + 20 * rnd(), eI: gauss() * 8, eA: gauss() * 6 });
  }
  function data() {
    const n = NS[+sN.value], d = +sD.value;
    return base.slice(0, n).map(({ T, eI, eA }) => {
      const I = Math.max(0, 10 + 2.6 * (T - 14) + eI);
      return { T, I, A: Math.max(0, 5 + 1.5 * (T - 14) + d * (I - 36) + eA) };
    });
  }
  const corr = (xs, ys) => {
    const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
    return sxy / Math.sqrt(sxx * syy);
  };
  // 기온을 고정했을 때의 상관(편상관): 세 상관계수로 계산
  const partial = (rIA, rIT, rAT) => (rIA - rIT * rAT) / Math.sqrt((1 - rIT * rIT) * (1 - rAT * rAT));

  const BANDS = [[14, 19, "#4f7cae"], [19, 24, "#6aa39a"], [24, 29, "#e0a02a"], [29, 34.01, "#d4493a"]];
  const bandOf = (T) => BANDS.find(([a, b]) => T >= a && T < b);

  const { ctx, size } = fit(cv, () => draw());
  let cur = [];

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 40, y0 = 22, pw = w - x0 - 14, ph = h - y0 - 36;
    const X = (v) => x0 + v / 80 * pw, Y = (v) => y0 + (1 - v / 70) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y,
      xt: [0, 20, 40, 60, 80].map((v) => [v, String(v)]), yt: [0, 20, 40, 60].map((v) => [v, String(v)]),
      xlabel: "하루 아이스크림 판매량 (상대값)", ylabel: "하루 물놀이 사고 (상대값)" });
    const r = cur.length > 400 ? 1.6 : cur.length > 120 ? 2.2 : 3;
    const band = cBand.checked;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, pw, ph); ctx.clip();
    for (const p of cur) {
      ctx.beginPath(); ctx.arc(X(p.I), Y(p.A), r, 0, Math.PI * 2);
      ctx.fillStyle = band ? bandOf(p.T)[2] : "rgba(35,35,38,.55)";
      ctx.globalAlpha = cur.length > 1000 ? .55 : .85; ctx.fill();
    }
    ctx.globalAlpha = 1;
    // 추세선: 전체 또는 기온 구간별
    const fitLine = (pts, color, lw, dash) => {
      if (pts.length < 5) return;
      const xs = pts.map((p) => p.I), ys = pts.map((p) => p.A);
      const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
      let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
      const b = sxy / sxx, lo = Math.min(...xs), hi = Math.max(...xs);
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash || []);
      ctx.beginPath(); ctx.moveTo(X(lo), Y(my + b * (lo - mx))); ctx.lineTo(X(hi), Y(my + b * (hi - mx))); ctx.stroke(); ctx.setLineDash([]);
    };
    if (band) {
      fitLine(cur, "rgba(35,35,38,.45)", 1.2, [5, 4]);
      for (const [a, b, col] of BANDS) fitLine(cur.filter((p) => p.T >= a && p.T < b), col, 2.6);
    } else fitLine(cur, C.ink, 2);
    ctx.restore();
    if (band) {
      ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left";
      BANDS.forEach(([a, b, col], i) => {
        const x = x0 + 8, y = y0 + 12 + i * 15;
        ctx.fillStyle = col; ctx.fillRect(x, y - 7, 10, 8);
        ctx.fillStyle = C.ink2; ctx.fillText(`${a}–${Math.round(b)} °C`, x + 15, y);
      });
    }
  }

  function update() {
    cur = data();
    const Is = cur.map((p) => p.I), As = cur.map((p) => p.A), Ts = cur.map((p) => p.T);
    const rIA = corr(Is, As), rp = partial(rIA, corr(Is, Ts), corr(As, Ts));
    oN.textContent = NS[+sN.value].toLocaleString("ko-KR"); oD.textContent = (+sD.value).toFixed(2);
    dR.textContent = rIA.toFixed(2);
    dRp.textContent = rp.toFixed(2);
    dN.textContent = `${NS[+sN.value].toLocaleString("ko-KR")}일`;
    msg.textContent = Math.abs(rp) < 0.1
      ? "전체로 보면 뚜렷한 상관이 있지만, 기온이 같은 날끼리 비교하면 거의 0입니다. 두 변수를 함께 움직인 것은 기온입니다."
      : "기온이 같은 날끼리 비교해도 상관이 남아 있습니다. 기온만으로는 설명되지 않는 관계가 있다는 신호입니다. 그래도 측정하지 않은 다른 변수가 있을 수 있습니다.";
    draw();
  }
  [sN, sD, cBand].forEach((el) => el.addEventListener("input", update));
  bNew.addEventListener("click", () => { gen(); update(); });
  gen(); update();
})();
