/* 카드: 공기 중의 산소는 언제, 어떻게 늘어났을까? — 대기 산소 농도 역사(로그 눈금)와 사건 연표 */
(() => {
  const root = document.getElementById("card-esys-oxygen");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sT = $(".t"), oT = $(".t-out"), nO = $(".n-o"), nEv = $(".n-ev"), msg = $(".ev-msg");
  // [억 년 전, log10(현재 대비 산소)] 대략적 중앙값
  const O2 = [[40, -6], [30, -5.5], [25, -5], [24, -4], [22, -1.5], [20, -1.5], [18, -2], [10, -2.5], [8, -2], [6, -0.7], [5.4, -0.5], [4, -0.2], [3, 0.2], [2.5, -0.1], [1, 0], [0, 0]];
  const EV = [
    [38, 38, "가장 오래된 퇴적암, 이 무렵 생명의 흔적 논란", "바다가 이미 있었다는 증거입니다."],
    [35, 35, "스트로마톨라이트 화석", "미생물 매트가 층층이 쌓인 구조로, 초기 생명의 흔적입니다."],
    [30, 27, "남세균의 광합성 시작(추정)", "산소가 만들어졌지만 대부분 바닷물 속 철과 반응했습니다."],
    [28, 18, "호상철광층이 많이 쌓임", "Fe²⁺ + 산소 → 산화 철 침전. 지금 쓰는 철광석의 대부분이 이때 쌓였습니다."],
    [24, 21, "대산화 사건", "대기에 산소가 쌓이기 시작하고 오존층이 생기기 시작합니다."],
    [7.2, 6.4, "눈덩이 지구", "지구 전체가 얼음에 덮였다가, 화산의 CO₂로 녹은 뒤 두꺼운 석회암이 쌓였습니다."],
    [6.3, 5.4, "신원생대 산소 증가, 에디아카라 생물군", "산소가 현재 수준에 가까워지고 큰 다세포 생물이 나타납니다."],
    [5.4, 4.8, "캄브리아기 생물 대폭발", "다양한 동물이 짧은 기간에 나타납니다."],
    [4.5, 3.6, "육상 식물의 확산", "식물이 육지로 올라와 풍화와 탄소 순환을 바꿉니다."],
    [3.6, 2.9, "석탄기 높은 산소", "산소가 지금보다 높았고(약 30 %), 거대한 곤충이 살았습니다."],
  ];
  const sup = (n) => String(n).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  const at = (t) => { for (let i = 1; i < O2.length; i++) if (t >= O2[i][0]) { const [a, va] = O2[i - 1], [b, vb] = O2[i]; return vb + (va - vb) * (t - b) / (a - b); } return 0; };
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 50, x1 = w - 14, y0 = h - 40, y1 = 16, X = (t) => x1 - t / 40 * (x1 - x0), Y = (l) => y0 - (l + 6.5) / 7 * (y0 - y1);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    [-6, -4, -2, 0].forEach((l) => { ctx.beginPath(); ctx.moveTo(x0, Y(l)); ctx.lineTo(x1, Y(l)); ctx.stroke(); ctx.fillText(l === 0 ? "현재" : `10${sup(l)}`, x0 - 4, Y(l) + 3); });
    ctx.textAlign = "center"; [40, 30, 20, 10, 0].forEach((t) => ctx.fillText(`${t}억 년 전`.replace("0억 년 전", t ? "0억 년 전" : "현재"), X(t), y0 + 14));
    // 사건 띠
    EV.forEach(([a, b], i) => { ctx.fillStyle = i === 3 ? "rgba(181,83,47,.12)" : i === 5 ? "rgba(110,164,230,.18)" : "rgba(141,141,146,.08)"; ctx.fillRect(X(a), y1, Math.max(2, X(b) - X(a)), y0 - y1); });
    ctx.strokeStyle = "#3b7c2a"; ctx.lineWidth = 2.6; ctx.beginPath(); O2.forEach(([t, l], i) => (i ? ctx.lineTo(X(t), Y(l)) : ctx.moveTo(X(t), Y(l)))); ctx.stroke();
    const t = +sT.value; ctx.strokeStyle = "#e0a02a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(t), y1); ctx.lineTo(X(t), y0); ctx.stroke();
    ctx.fillStyle = "#e0a02a"; ctx.beginPath(); ctx.arc(X(t), Y(at(t)), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`; ctx.fillText("대기 산소 (현재 대비, 로그 눈금)", x0 + 4, y1 + 10);
    ctx.fillStyle = "#b5532f"; ctx.fillText("호상철광층", X(28) + 3, y0 - 6); ctx.fillStyle = "#3f6fa3"; ctx.fillText("눈덩이", X(7.2) + 2, y0 - 6);
  }
  function update() {
    const t = +sT.value; oT.textContent = t;
    const l = at(t); nO.textContent = l > -0.05 ? "현재 수준" : l > -2 ? `약 ${Math.round(10 ** l * 100)} %` : `현재의 10${sup(Math.round(l))} 배 정도`;
    const e = EV.filter(([a, b]) => t <= a + 0.5 && t >= b - 0.5).sort((p, q) => (p[0] - p[1]) - (q[0] - q[1]))[0]; nEv.textContent = e ? e[2] : "—"; msg.textContent = e ? e[3] : "";
    draw();
  }
  sT.addEventListener("input", update); update();
})();
