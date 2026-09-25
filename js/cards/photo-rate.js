/* 카드: 빛을 늘리면 광합성도 계속 빨라질까? — 광반응 곡선과 제한 요인 (모식 모형) */
(() => {
  const root = document.getElementById("card-photo-rate");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sI = $(".light"), sC = $(".co2"), sT = $(".temp");
  const oI = $(".light-out"), oC = $(".co2-out"), oT = $(".temp-out");
  const nNet = $(".net"), nIc = $(".ic"), nLim = $(".lim"), msg = $(".lim-msg");

  // 모식 모형: 총광합성 = Pmax·I/(I+K), Pmax는 CO₂와 온도에 따라, 호흡은 온도에 따라 (Q10 = 2)
  const K = 180;
  const fT = (T) => Math.exp(-(((T - 28) / (T < 28 ? 11 : 7)) ** 2));
  const pmax = (c, T) => 32 * c / (c + 400) * fT(T);
  const resp = (T) => 1.2 * Math.pow(2, (T - 25) / 10);
  const net = (I, c, T) => pmax(c, T) * I / (I + K) - resp(T);

  const { ctx, size } = fit(cv, () => draw());
  const IMAX = 2000, YMIN = -4, YMAX = 24;

  function state() {
    const I = +sI.value, c = +sC.value, T = +sT.value;
    const P = pmax(c, T), R = resp(T);
    const ic = P > R ? R * K / (P - R) : Infinity;
    // 각 요인을 조금 늘렸을 때 총광합성이 몇 % 늘어나는지 (탄력성)으로 제한 요인을 고른다
    const eL = K / (I + K);
    const eC = 0.5 * 400 / (c + 400); // 흐린 날엔 빛, 밝은 날엔 CO₂가 먼저 걸리도록 가중
    const eT = 1 - fT(T);
    let lim = "light";
    if (eT > 0.35 && eT > eL) lim = "temp";
    else if (eC > eL) lim = "co2";
    return { I, c, T, P, R, ic, lim };
  }

  function draw() {
    const { w, h } = size;
    if (!w) return;
    const s = state();
    const padL = 36, padR = 12, padT = 22, padB = 34;
    const pw = w - padL - padR, ph = h - padT - padB;
    const X = (I) => padL + I / IMAX * pw, Y = (v) => padT + (1 - (v - YMIN) / (YMAX - YMIN)) * ph;
    ctx.clearRect(0, 0, w, h);
    NM.axes(ctx, { x0: padL, y0: padT, w: pw, h: ph, X, Y,
      xt: [[0, "0"], [500, "500"], [1000, "1000"], [1500, "1500"], [2000, "2000"]],
      yt: [[0, "0"], [10, "10"], [20, "20"]],
      ylabel: "순광합성 속도 (상대값)", xlabel: "빛의 세기 (μmol/m²·s)" });
    // 0 선 강조
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(padL, Y(0) + .5); ctx.lineTo(padL + pw, Y(0) + .5); ctx.stroke();

    // 빛 포화 구간 (최대의 90% 이상)
    const I90 = 9 * K;
    ctx.fillStyle = "rgba(224,160,42,.10)"; ctx.fillRect(X(I90), padT, X(IMAX) - X(I90), ph);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = "#a8781c"; ctx.fillText("빛 포화에 가까움", X(I90) + 6, padT + 13);

    // 기준 곡선: CO₂ 400 ppm, 25 °C
    const curve = (c, T) => { ctx.beginPath(); for (let I = 0; I <= IMAX; I += 10) { const y = Y(net(I, c, T)); I ? ctx.lineTo(X(I), y) : ctx.moveTo(X(I), y); } };
    ctx.setLineDash([5, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.3; curve(400, 25); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.4; curve(s.c, s.T); ctx.stroke();

    // 광보상점
    if (s.ic < IMAX) {
      ctx.beginPath(); ctx.arc(X(s.ic), Y(0), 4, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = C.forest; ctx.fillText("광보상점", X(s.ic) + 7, Y(0) + 14);
    }
    // 현재 빛
    const v = net(s.I, s.c, s.T);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(s.I) + .5, padT); ctx.lineTo(X(s.I) + .5, padT + ph); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(s.I), Y(v), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  }

  const LIM = {
    light: ["빛", "빛을 조금만 늘려도 속도가 바로 오릅니다. 지금 광합성을 붙잡고 있는 것은 빛입니다."],
    co2: ["CO₂", "빛을 더 줘도 거의 오르지 않습니다. CO₂ 농도를 올려 보세요."],
    temp: ["온도", "광합성 효소가 일하기 알맞은 온도(약 25–30 °C)에서 벗어났습니다."],
  };

  function update() {
    const s = state();
    oI.textContent = s.I; oC.textContent = s.c; oT.textContent = s.T;
    const v = net(s.I, s.c, s.T);
    nNet.textContent = v.toFixed(1);
    nNet.classList.toggle("bad", v < 0);
    nIc.textContent = s.ic < 5000 ? `${Math.round(s.ic)}` : "없음";
    nLim.textContent = LIM[s.lim][0];
    msg.textContent = v < 0 ? "호흡으로 쓰는 양이 광합성으로 만드는 양보다 많습니다. 이 빛에서는 식물이 자라지 못합니다." : LIM[s.lim][1];
    draw();
  }
  [sI, sC, sT].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [I, c, T] = b.dataset.set.split(",");
    sI.value = I; sC.value = c; sT.value = T; update();
  }));
  update();
})();
