/* 카드: 멀티탭에 기구를 많이 꽂으면 왜 위험할까? — 병렬 연결에서 전류의 합과 연장선의 발열 */
(() => {
  const root = document.getElementById("card-phy-multitap");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const nI = $(".n-i"), nR = $(".n-r"), nP = $(".n-p"), nH = $(".n-h"), warnEl = $(".mt-warn");

  const V = 220, RATED = 16;
  // 코드 저항: 구리 ρ = 1.68×10⁻⁸ Ω·m, 길이 1.5 m × 왕복 2가닥, 단면 1.5 mm²
  const R_CORD = 1.68e-8 * 3 / 1.5e-6;
  const APP = [
    { key: "phone", name: "휴대폰 충전기", P: 25 },
    { key: "laptop", name: "노트북", P: 65 },
    { key: "micro", name: "전자레인지", P: 1200 },
    { key: "dryer", name: "헤어드라이어", P: 1500 },
    { key: "kettle", name: "전기 포트", P: 1800 },
    { key: "heater", name: "전기난로", P: 2000 },
  ];
  APP.forEach((a) => { a.on = a.key === "phone" || a.key === "laptop"; a.R = V * V / a.P; a.I = a.P / V; a.ph = 0; });
  let cordPh = 0;

  const tot = () => APP.filter((a) => a.on).reduce((s, a) => s + a.I, 0);
  const P = fit(cv, () => draw());

  function heatColor(wt) { // 코드 발열(W) → 색
    const t = clamp(wt / 30, 0, 1);
    const mix = (a, b, u) => a.map((v, i) => Math.round(v + (b[i] - v) * u));
    const c = t < 0.4 ? mix([93, 93, 97], [224, 160, 42], t / 0.4) : mix([224, 160, 42], [200, 50, 30], (t - 0.4) / 0.6);
    return `rgb(${c.join(",")})`;
  }

  function draw() {
    const { ctx, size: { w, h } } = P;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const I = tot(), heat = I * I * R_CORD;
    const narrow = w < 520;
    const meterW = narrow ? 34 : 46;
    const xL = 14, xTap = narrow ? 70 : 118, xEnd = w - meterW - 26;
    const yT = h * 0.2, yB = h * 0.74;
    ctx.font = `10.5px ${F.mono}`;

    // 콘센트
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(xL, yT - 14, 26, yB - yT + 28);
    ctx.fillStyle = C.ink2; ctx.save(); ctx.translate(xL + 17, (yT + yB) / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center"; ctx.fillText("220 V", 0, 0); ctx.restore();

    // 연장선 (두 가닥): 발열에 따라 색이 바뀐다
    const cordC = heatColor(heat);
    ctx.strokeStyle = cordC; ctx.lineWidth = 5; ctx.lineCap = "round";
    [yT, yB].forEach((y) => { ctx.beginPath(); ctx.moveTo(xL + 26, y); ctx.lineTo(xTap, y); ctx.stroke(); });
    ctx.lineCap = "butt";
    if (!narrow) { ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("연장선", (xL + 26 + xTap) / 2, yT - 10); }
    // 멀티탭 몸체와 레일
    ctx.fillStyle = "rgba(35,35,38,.04)"; ctx.fillRect(xTap, yT - 16, xEnd - xTap, yB - yT + 32);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    [yT, yB].forEach((y) => { ctx.beginPath(); ctx.moveTo(xTap, y); ctx.lineTo(xEnd, y); ctx.stroke(); });

    // 전류 점: 코드
    const dots = (x0, y0, x1, y1, ph, gap) => {
      const L = Math.hypot(x1 - x0, y1 - y0);
      for (let s = ((ph % gap) + gap) % gap; s < L; s += gap) {
        ctx.beginPath(); ctx.arc(x0 + (x1 - x0) * s / L, y0 + (y1 - y0) * s / L, 2.2, 0, Math.PI * 2); ctx.fill();
      }
    };
    ctx.fillStyle = C.forest;
    if (I > 0) { dots(xL + 26, yT, xTap, yT, cordPh, 14); dots(xTap, yB, xL + 26, yB, cordPh, 14); }

    // 가지 6개
    const n = APP.length, bw = (xEnd - xTap) / n;
    APP.forEach((a, i) => {
      const x = xTap + bw * (i + 0.5);
      ctx.strokeStyle = a.on ? C.ink : C.rule; ctx.lineWidth = 1.5;
      if (a.on) {
        const r0 = yT + (yB - yT) * 0.3, r1 = yT + (yB - yT) * 0.7;
        ctx.beginPath(); ctx.moveTo(x, yT); ctx.lineTo(x, r0);
        for (let k = 0; k <= 6; k++) ctx.lineTo(x + (k % 2 ? 6 : -6) * (k > 0 && k < 6 ? 1 : 0), r0 + (r1 - r0) * k / 6);
        ctx.lineTo(x, yB); ctx.stroke();
        ctx.fillStyle = C.forest;
        dots(x, yT, x, yB, a.ph, 12);
      } else {
        ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(x, yT); ctx.lineTo(x, yT + 12); ctx.moveTo(x, yB - 12); ctx.lineTo(x, yB); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = a.on ? C.ink : C.ink3; ctx.textAlign = "center";
      ctx.font = `${narrow ? 9.5 : 10.5}px ${F.sans}`;
      const nm = narrow ? a.name.replace("헤어드라이어", "드라이어").replace("휴대폰 충전기", "충전기") : a.name;
      ctx.fillText(nm, x, yB + (i % 2 ? 30 : 17));
      if (a.on) {
        ctx.font = `${narrow ? 9.5 : 10.5}px ${F.mono}`; ctx.fillStyle = C.forest;
        ctx.fillText(`${a.I < 1 ? a.I.toFixed(2) : a.I.toFixed(1)} A`, x, yT - (i % 2 ? 6 : 20));
      }
    });

    // 오른쪽: 전류 막대 (정격 16 A 눈금)
    const mx = w - meterW - 6, my0 = yT - 16, my1 = yB + 16, full = 40;
    const Ym = (i) => my1 - (my1 - my0) * clamp(i / full, 0, 1);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(mx + .5, my0 + .5, meterW - 1, my1 - my0);
    ctx.fillStyle = I > RATED ? C.warn : C.forest; ctx.fillRect(mx + 3, Ym(I), meterW - 6, my1 - Ym(I));
    ctx.strokeStyle = C.warn; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(mx - 6, Ym(RATED)); ctx.lineTo(mx + meterW, Ym(RATED)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.font = `10px ${F.mono}`;
    ctx.fillText("정격", mx - 8, Ym(RATED) - 2); ctx.fillText("16 A", mx - 8, Ym(RATED) + 10);
    ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    ctx.fillText("40 A", mx + meterW / 2, my0 - 5); ctx.fillText("총 전류", mx + meterW / 2, my1 + 17);
    ctx.textAlign = "left";
  }

  function update() {
    const I = tot();
    nI.textContent = `${I.toFixed(2)} A`;
    nI.classList.toggle("bad", I > RATED);
    nR.textContent = I > 0 ? `${(V / I).toFixed(V / I < 100 ? 1 : 0)} Ω` : "∞";
    nP.textContent = `${Math.round(I * V).toLocaleString("ko-KR")} W`;
    const heat = I * I * R_CORD;
    nH.textContent = `${heat < 1 ? heat.toFixed(3) : heat.toFixed(1)} W`;
    nH.classList.toggle("bad", I > RATED);
    warnEl.hidden = I <= RATED;
    root.querySelectorAll("[data-app]").forEach((b) => b.setAttribute("aria-pressed", String(APP.find((a) => a.key === b.dataset.app).on)));
    draw();
  }
  root.querySelectorAll("[data-app]").forEach((b) => b.addEventListener("click", () => {
    const a = APP.find((x) => x.key === b.dataset.app); a.on = !a.on; update();
  }));
  // 점의 속력은 그 도선의 전류에 비례한다 (모식)
  loop(cv, (dt) => {
    if (NM.reduce) return;
    const I = tot();
    cordPh += dt * clamp(4 * I, 0, 160);
    APP.forEach((a) => { if (a.on) a.ph += dt * clamp(4 * a.I, 0, 160); });
    draw();
  });
  update();
})();
