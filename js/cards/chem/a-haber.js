/* 카드: 하버–보슈법은 어떻게 인류를 먹여 살렸을까? — 세계 인구와 합성 질소 비료 사용량 (대략값) */
(() => {
  const root = document.getElementById("card-chem-haber");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sY = $(".year"), oY = $(".year-out"), band = $(".band");
  const dP = $(".v-pop"), dN = $(".v-n"), dPer = $(".v-per"), msg = $(".hb-msg");

  // 세계 인구 (억 명, UN·HYDE 추정 반올림), 질소 비료 사용량 (백만 t N/년, FAO·IFA 자료 반올림)
  const POP = [[1900, 16.5], [1910, 17.5], [1920, 18.6], [1930, 20.7], [1940, 23.0], [1950, 25.4], [1960, 30.2], [1961, 30.8], [1970, 37.0], [1980, 44.4], [1990, 53.3], [2000, 61.5], [2010, 69.9], [2020, 78.4]];
  const NF = [[1961, 11.6], [1970, 31.8], [1980, 60.8], [1990, 77.2], [2000, 81.0], [2010, 104], [2020, 113]];
  const EV = [[1909, "하버, 실험실에서 암모니아 합성"], [1913, "보슈, 첫 공장 가동"], [1931, "보슈 노벨상"], [1965, "녹색 혁명 확산"]];
  const at = (arr, y) => {
    if (y < arr[0][0]) return null;
    for (let i = 1; i < arr.length; i++) if (y <= arr[i][0]) { const [x0, v0] = arr[i - 1], [x1, v1] = arr[i]; return v0 + (v1 - v0) * (y - x0) / (x1 - x0); }
    return arr[arr.length - 1][1];
  };

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const y = +sY.value, small = w < 520;
    const x0 = small ? 34 : 44, x1 = w - (small ? 34 : 44), y0 = 30, ph = h - y0 - 52;
    const X = (t) => x0 + (t - 1900) / 120 * (x1 - x0);
    const YP = (p) => y0 + (1 - p / 80) * ph, YN = (n) => y0 + (1 - n / 120) * ph;
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: ph, X, Y: YP, xt: [[1900, "1900"], [1940, "1940"], [1980, "1980"], [2020, "2020"]], yt: [[0, "0"], [20, "20"], [40, "40"], [60, "60"], [80, "80"]] });
    ctx.font = `${small ? 9.5 : 10.5}px ${F.mono}`;
    ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText("세계 인구 (억 명)", x0, y0 - 10);
    ctx.fillStyle = C.forest; ctx.textAlign = "right"; ctx.fillText("질소 비료 (백만 t N/년)", x1, y0 - 10);
    for (const n of [0, 30, 60, 90, 120]) ctx.fillText(`${n}`, x1 + (small ? 30 : 38), YN(n) + 3);
    // 합성 질소에 기대는 인구 어림 (2000년대 연구, 40~50%)
    if (band.checked) {
      ctx.fillStyle = "rgba(224,160,42,.25)";
      ctx.beginPath();
      for (let t = 2000; t <= 2020; t += 5) ctx.lineTo(X(t), YP(at(POP, t) * 0.5));
      for (let t = 2020; t >= 2000; t -= 5) ctx.lineTo(X(t), YP(at(POP, t) * 0.4));
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#9a6d12"; ctx.textAlign = "right"; ctx.fillText("합성 질소 비료로 먹는 인구 40~50%", X(2020) - 2, YP(at(POP, 2020) * 0.5) - 6);
    }
    // 곡선
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.beginPath(); POP.forEach(([t, p], i) => i ? ctx.lineTo(X(t), YP(p)) : ctx.moveTo(X(t), YP(p))); ctx.stroke();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.beginPath(); NF.forEach(([t, n], i) => i ? ctx.lineTo(X(t), YN(n)) : ctx.moveTo(X(t), YN(n))); ctx.stroke();
    NF.forEach(([t, n]) => { ctx.beginPath(); ctx.arc(X(t), YN(n), 2.5, 0, Math.PI * 2); ctx.fillStyle = C.forest; ctx.fill(); });
    ctx.setLineDash([2, 3]); ctx.strokeStyle = C.forest; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(1913), YN(0)); ctx.lineTo(X(1961), YN(11.6)); ctx.stroke(); ctx.setLineDash([]);
    // 사건
    EV.forEach(([t, lab], i) => {
      const x = X(t), yy = y0 + ph + 26 + (i % 2) * 12;
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y0 + ph); ctx.lineTo(x, yy - 9); ctx.stroke();
      ctx.fillStyle = C.ink3; ctx.textAlign = t > 1990 ? "right" : "left"; ctx.font = `${small ? 9 : 10}px ${F.sans}`;
      if (!small || i !== 2) ctx.fillText(`${t} ${lab}`, x - 2, yy);
    });
    // 현재 연도
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(y) + .5, y0); ctx.lineTo(X(y) + .5, y0 + ph); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(y), YP(at(POP, y)), 5, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    const n = at(NF, y);
    if (n !== null) { ctx.beginPath(); ctx.arc(X(y), YN(n), 5, 0, Math.PI * 2); ctx.fillStyle = C.forest; ctx.fill(); }
  }

  function update() {
    const y = +sY.value, p = at(POP, y), n = at(NF, y);
    oY.textContent = y;
    dP.textContent = `약 ${Math.round(p)}억 명`;
    dN.textContent = n === null ? (y < 1913 ? "없음" : "통계 전") : `${n.toFixed(0)}백만 t`;
    dPer.textContent = n === null ? "—" : `${(n * 1e9 / (p * 1e8)).toFixed(1)} kg`;
    msg.textContent = y < 1913 ? "합성 비료가 없던 때입니다. 질소는 퇴비, 콩과 식물, 칠레 초석(질산 나트륨) 같은 천연 자원에 기댔습니다."
      : y < 1961 ? "공장은 돌기 시작했지만 초기 생산량의 상당 부분은 화약 원료로 쓰였습니다. 세계 통계는 1961년부터 있습니다(점선은 이어 그린 것)."
      : "비료 사용량과 인구가 함께 늘어납니다. 두 곡선의 눈금이 다르니 몇 배 늘었는지를 비교해 보세요.";
    draw();
  }
  sY.addEventListener("input", update); band.addEventListener("input", draw);
  root.querySelectorAll("[data-y]").forEach((b) => b.addEventListener("click", () => { sY.value = b.dataset.y; update(); }));
  update();
})();
