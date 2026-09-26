/* 카드: 태풍은 어디서 에너지를 얻을까? — 숨은열과 강수량으로 어림한 에너지 (단면은 모식) */
(() => {
  const root = document.getElementById("card-earth-typhoon-energy");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sS = $(".sst"), sR = $(".rain"), sA = $(".rad");
  const oS = $(".sst-out"), oR = $(".rain-out"), oA = $(".rad-out");
  const nQ = $(".n-q"), nE = $(".n-e"), nPw = $(".n-pw"), nX = $(".n-x"), msg = $(".msg");

  const LV = 2.5e6;          // J/kg, 물의 숨은열(근사)
  const WORLD = 3.4e12;      // W, 2023년 세계 발전량 약 3만 TWh의 평균 일률
  const es = (T) => 6.112 * Math.exp(17.62 * T / (243.12 + T)); // hPa
  let land = 0;

  function calc() {
    const T = +sS.value, R = +sR.value, r = +sA.value * 1000;
    const e = es(T), q = 622 * e / (1013 - e);                    // g/kg, 포화 혼합비
    const E = R / 1000 * Math.PI * r * r * 1000 * LV;              // J/일
    const P = E / 86400;
    const k = land ? 0.25 : clamp((T - 24) / 5, 0.08, 1);          // 모식 세기
    return { T, q, E, P, k };
  }
  const sci = (v) => { const ex = Math.floor(Math.log10(v)); return `${(v / 10 ** ex).toFixed(1)}×10${String(ex).replace(/./g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}`; };

  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const PARTS = Array.from({ length: 70 }, () => ({ s: rnd(), side: rnd() < .5 ? -1 : 1, v: .7 + rnd() * .6 }));
  const { ctx, size } = fit(cv, () => draw());
  let ph = 0;

  function draw() {
    const { w, h } = size; if (!w) return;
    const c = calc(), small = w < 480;
    ctx.clearRect(0, 0, w, h);
    const top = 20, sea = h - 34, cx = w / 2, eye = w * .035, wall = w * .09;
    const ztop = top + (sea - top) * (1 - (0.35 + 0.65 * c.k));  // 구름 꼭대기
    // 하늘
    ctx.fillStyle = "#eef2f4"; ctx.fillRect(0, 0, w, sea);
    // 바다 또는 땅
    if (land) { ctx.fillStyle = "#b9a888"; ctx.fillRect(0, sea, w, h - sea); }
    else {
      const t = clamp((c.T - 18) / 13, 0, 1);
      ctx.fillStyle = `rgb(${Math.round(40 + 30 * t)},${Math.round(80 + 70 * t)},${Math.round(150 + 20 * t)})`; ctx.fillRect(0, sea, w, h - sea);
    }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = "#fff"; ctx.textAlign = "left";
    ctx.fillText(land ? "육지: 증발이 적음" : `해수면 ${c.T} °C`, 8, h - 12);
    // 나선형 띠 구름 (바깥쪽 낮은 구름)
    ctx.fillStyle = "rgba(160,163,170,.55)";
    for (const sgn of [-1, 1]) for (let i = 0; i < 3; i++) {
      const x = cx + sgn * (wall + (i + .6) * w * .1), hh = (sea - ztop) * (0.45 - i * .1) * c.k + 10;
      ctx.beginPath(); ctx.ellipse(x, sea - 20 - hh / 2, w * .035, hh / 2, 0, 0, Math.PI * 2); ctx.fill();
    }
    // 눈벽 구름과 위쪽으로 퍼지는 구름 모자
    ctx.fillStyle = "rgba(120,123,130,.75)";
    for (const sgn of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + sgn * eye, sea - 18); ctx.lineTo(cx + sgn * eye * 1.6, ztop + 10);
      ctx.lineTo(cx + sgn * w * .46, ztop + 4 + (sea - ztop) * .06); ctx.lineTo(cx + sgn * w * .46, ztop + 14 + (sea - ztop) * .1);
      ctx.lineTo(cx + sgn * wall * 1.6, ztop + 30); ctx.lineTo(cx + sgn * wall, sea - 18); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = `${small ? 10 : 11}px ${F.sans}`;
    ctx.fillText("눈", cx, sea - 28);
    ctx.fillStyle = C.ink2; ctx.fillText("↓ 약한 하강", cx, (ztop + sea) / 2);
    // 입자: 수면 위로 들어옴 → 눈벽 상승 → 위로 퍼져 나감
    const speed = land ? .35 : 0.4 + 0.8 * c.k;
    PARTS.forEach((p) => {
      const u = (p.s + ph * .08 * p.v * speed) % 1;
      let x, y, wet;
      if (u < .45) { const f = u / .45; x = cx + p.side * (w * .47 - (w * .47 - wall * 1.2) * f); y = sea - 8; wet = 0; }
      else if (u < .7) { const f = (u - .45) / .25; x = cx + p.side * (wall * 1.2 - wall * .4 * f); y = sea - 8 - (sea - 8 - ztop - 14) * f; wet = f; }
      else { const f = (u - .7) / .3; x = cx + p.side * (wall * .8 + (w * .44 - wall * .8) * f); y = ztop + 14; wet = 1; }
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = wet > .35 ? "rgba(255,255,255,.95)" : "rgba(63,111,163,.85)"; ctx.fill();
      if (wet > .35 && wet < .75 && c.k > .2) { ctx.fillStyle = "rgba(224,160,42,.9)"; ctx.fillRect(x + 3, y - 1, 3, 2); }
    });
    // 라벨
    ctx.font = `${small ? 9.5 : 10.5}px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = "#3f6fa3";
    ctx.fillText(land ? "수증기 공급 적음" : "증발한 수증기가 모여듦 →", 8, sea - 16);
    ctx.fillStyle = "#a8781c"; ctx.textAlign = "left";
    ctx.fillText("응결 → 숨은열 방출", cx + wall * 1.3 + 4, (ztop + sea) / 2 + 20);
    ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.fillText("바깥으로 퍼져 나감", w - 8, ztop + 4);
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.fillText("모식 단면", 8, 14);
  }

  function update() {
    const c = calc();
    oS.textContent = sS.value; oR.textContent = sR.value; oA.textContent = sA.value;
    nQ.textContent = `${c.q.toFixed(1)} g/kg`;
    nE.textContent = `${sci(c.E)} J`;
    nPw.textContent = `${(c.P / 1e12).toFixed(0)} TW`;
    nX.textContent = `약 ${Math.round(c.P / WORLD)}배`;
    msg.textContent = land ? "육지에서는 증발할 물이 적어 수증기 공급이 크게 줄어듭니다. 숨은열이 모자라 태풍은 빠르게 약해집니다."
      : c.T < 26 ? "수온이 약 26 °C보다 낮으면 증발량이 모자라 태풍이 세력을 유지하기 어렵습니다."
      : "따뜻한 바다가 수증기를 계속 공급합니다. 공기가 품을 수 있는 수증기는 1 °C마다 약 6~7 %씩 늘어납니다.";
    draw();
  }
  sS.addEventListener("input", () => { land = 0; update(); });
  [sR, sA].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [t, l] = b.dataset.set.split(","); sS.value = t; land = +l; update();
  }));
  NM.loop(cv, (dt) => { if (!NM.reduce) { ph += dt; draw(); } });
  update();
})();
