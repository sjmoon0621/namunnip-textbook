/* 카드: 손난로는 어떻게 뜨거워질까? — 철가루 손난로(산화)와 아세트산 나트륨 손난로(결정화) 비교 */
(() => {
  const root = document.getElementById("card-is2-hand-warmer");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const feS = $(".fe"), feO = $(".fe-out"), airS = $(".air"), airO = $(".air-out"), saltT = $(".salt"), naS = $(".na"), naO = $(".na-out");
  const nFeT = $(".fe-t"), nFeH = $(".fe-h"), nNaT = $(".na-t"), nNaH = $(".na-h"), nE = $(".energy");

  // 4Fe + 3O₂ → 2Fe₂O₃, ΔH = −1648 kJ → 철 1 g당 7.38 kJ (정확한 값)
  // 아세트산 나트륨 삼수화물의 결정화 열 약 270 J/g, 손난로 속 용액은 약 54 °C에서 굳음
  // 나머지(산소가 들어오는 빠르기, 열이 빠져나가는 정도, 열용량)는 모식 값
  const EFE = 7379, LNA = 270, CNA = 3.0, TM = 54, TE = 20, HL = 0.28, DT = 20, TEND = 12 * 3600;

  function iron() {
    const m = +feS.value, a = +airS.value / 100, salt = saltT.checked;
    const Cp = 40 + m;
    let T = TE, rem = m, E = 0; const pts = [];
    for (let t = 0; t <= TEND; t += DT) {
      if (t % 300 === 0) pts.push([t, T]);
      const r = 4 * a * (salt ? 1 : 0.03) * Math.sqrt(Math.max(rem, 0) / m) / 3600; // g/s
      const dm = Math.min(rem, r * DT); rem -= dm; E += dm * EFE;
      T += (dm * EFE / DT - HL * (T - TE)) * DT / Cp;
    }
    return { pts, E, rem };
  }
  function acet() {
    const m = +naS.value;
    let T = TE, f = 0; const pts = [[0, TE]];
    // 금속판을 꺾는 순간 결정이 번지며 곧바로 녹는점 가까이까지 오른다
    f = CNA * (TM - TE) / LNA; T = TM;
    for (let t = 60; t <= TEND; t += DT) {
      if (f < 1) { f = Math.min(1, f + HL * (T - TE) * DT / (m * LNA)); }
      else T -= HL * (T - TE) * DT / (m * CNA);
      if (t % 300 === 0 || t === 60) pts.push([t, T]);
    }
    return { pts, E: m * LNA };
  }

  let A, B;
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w || !A) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 40, y0 = 22, pw = w - x0 - 14, ph = h - y0 - 40;
    const X = (t) => x0 + t / TEND * pw, Y = (T) => y0 + (1 - (T - 15) / 45) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [0, 2, 4, 6, 8, 10, 12].map((k) => [k * 3600, `${k}`]), yt: [[20, "20"], [40, "40"], [60, "60"]], ylabel: "손난로 온도 (°C)", xlabel: "시간 (h)" });
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Y(40)); ctx.lineTo(x0 + pw, Y(40)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText("40 °C", x0 + pw, Y(40) - 4);
    for (const [S, col, lab] of [[A, "#8a5a3a", "철가루 손난로"], [B, "#3f7fc4", "아세트산 나트륨 손난로"]]) {
      ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath();
      S.pts.forEach(([t, T], i) => i ? ctx.lineTo(X(t), Y(T)) : ctx.moveTo(X(t), Y(T))); ctx.stroke();
      void lab;
    }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    [["철가루 (산화 반응)", "#8a5a3a"], ["아세트산 나트륨 (결정화)", "#3f7fc4"]].forEach(([t, c], i) => {
      ctx.fillStyle = c; ctx.fillRect(x0 + pw - 170, y0 + 8 + i * 16, 12, 3); ctx.fillStyle = C.ink2; ctx.fillText(t, x0 + pw - 154, y0 + 13 + i * 16);
    });
  }

  const hours = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) if (pts[i][1] >= 40) s += pts[i][0] - pts[i - 1][0]; return s / 3600; };
  const fmtH = (x) => x <= 0 ? "없음" : x < 1 ? `약 ${Math.round(x * 60 / 5) * 5}분` : `약 ${x.toFixed(1)}시간`;
  function update() {
    feO.textContent = feS.value; airO.textContent = airS.value; naO.textContent = naS.value;
    A = iron(); B = acet();
    nFeT.textContent = `${Math.max(...A.pts.map((p) => p[1])).toFixed(0)} °C`;
    nFeH.textContent = fmtH(hours(A.pts));
    nNaT.textContent = `${TM} °C`;
    nNaH.textContent = fmtH(hours(B.pts));
    nE.textContent = `12시간 동안 철가루가 낸 열 ${(A.E / 1000).toFixed(0)} kJ${A.rem > 0.1 ? ` (철 ${A.rem.toFixed(0)} g 남음)` : ""} · 아세트산 나트륨이 낸 열 약 ${(B.E / 1000).toFixed(0)} kJ`;
    draw();
  }
  [feS, airS, naS].forEach((el) => el.addEventListener("input", update));
  saltT.addEventListener("change", update);
  root.querySelectorAll("[data-air]").forEach((b) => b.addEventListener("click", () => { airS.value = b.dataset.air; update(); }));
  update();
})();
