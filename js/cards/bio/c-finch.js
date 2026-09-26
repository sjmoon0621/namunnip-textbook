/* 카드: 가뭄이 든 해, 핀치의 부리는 어떻게 달라질까? — 선택 차와 유전율 (모식 모형, R = h²S) */
(() => {
  const root = document.getElementById("card-bio-finch");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sE = $(".env"), oE = $(".env-out"), sH = $(".h2"), oH = $(".h2-out");
  const nSurv = $(".n-surv"), nS = $(".n-s"), nR = $(".n-r"), nOff = $(".n-off");

  // 모식 값: 부모 세대 부리 깊이 평균 9.5 mm, 표준 편차 0.9 mm
  const MU = 9.5, SD = 0.9, Z0 = 6, Z1 = 13, DZ = 0.01;
  const pdf = (z, m) => Math.exp(-0.5 * ((z - m) / SD) ** 2) / (SD * Math.sqrt(2 * Math.PI));
  // 생존 확률: 가뭄(e > 0)이면 큰 부리가, 큰 비(e < 0)면 작은 부리가 유리
  const surv = (z, e) => Math.min(1, (0.85 - (e > 0 ? 0.55 : 0.2) * Math.abs(e)) * Math.exp((e > 0 ? 1.8 : 0.9) * e * (z - MU)));

  function calc() {
    const e = +sE.value / 100, h2 = +sH.value / 100;
    let A = 0, M = 0;
    for (let z = Z0; z <= Z1; z += DZ) { const f = pdf(z, MU) * surv(z, e); A += f * DZ; M += f * z * DZ; }
    const ms = M / A, S = ms - MU, R = h2 * S;
    return { e, h2, A, ms, S, R, mo: MU + R };
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = calc();
    const x0 = 30, y0 = 62, pw = w - x0 - 10, ph = h - y0 - 34;
    const XL = 6.5, XR = 12.5, YM = 0.5;
    const X = (z) => x0 + (z - XL) / (XR - XL) * pw, Y = (v) => y0 + ph - v / YM * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [7, 8, 9, 10, 11, 12].map((z) => [z, `${z}`]), xlabel: "부리 깊이 (mm, 모식)" });

    // 먹이 막대: 작은 씨앗과 큰 씨앗의 비율
    const small = Math.max(.08, .6 - .5 * k.e), bw = Math.min(200, w - 104 - x0 - 72);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("남은 먹이", x0, 14);
    ctx.fillStyle = "#c9b27a"; ctx.fillRect(x0 + 62, 5, bw * small, 12);
    ctx.fillStyle = "#6b5a45"; ctx.fillRect(x0 + 62 + bw * small, 5, bw * (1 - small), 12);
    ctx.fillStyle = C.ink3; ctx.fillText("작은 씨앗", x0 + 62, 30);
    ctx.textAlign = "right"; ctx.fillText(bw > 190 ? "크고 단단한 씨앗" : "큰 씨앗", x0 + 62 + bw, 30); ctx.textAlign = "left";

    const curve = (fn) => { ctx.beginPath(); ctx.moveTo(X(XL), Y(0)); for (let z = XL; z <= XR; z += .02) ctx.lineTo(X(z), Y(fn(z))); ctx.lineTo(X(XR), Y(0)); };
    curve((z) => pdf(z, MU)); ctx.fillStyle = "rgba(141,141,146,.18)"; ctx.fill(); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.stroke();
    curve((z) => pdf(z, MU) * surv(z, k.e)); ctx.fillStyle = "rgba(224,160,42,.45)"; ctx.fill();
    ctx.beginPath(); for (let z = XL; z <= XR; z += .02) { const y = Y(pdf(z, k.mo)); z === XL ? ctx.moveTo(X(z), y) : ctx.lineTo(X(z), y); }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2.2; ctx.stroke();

    // 평균선과 화살표
    const mark = (z, col, dash) => { ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(X(z), y0 - 4); ctx.lineTo(X(z), Y(0)); ctx.stroke(); ctx.setLineDash([]); };
    mark(MU, C.ink3, [4, 3]); mark(k.ms, "#b07d16", []); mark(k.mo, C.forest, [2, 2]);
    const arrow = (a, b, y, col, lab) => {
      if (Math.abs(X(b) - X(a)) < 3) return;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(X(a), y); ctx.lineTo(X(b), y); ctx.stroke();
      const d = Math.sign(b - a); ctx.beginPath(); ctx.moveTo(X(b), y); ctx.lineTo(X(b) - d * 6, y - 4); ctx.lineTo(X(b) - d * 6, y + 4); ctx.fill();
      ctx.font = `500 11px ${F.mono}`; ctx.textAlign = d > 0 ? "left" : "right"; ctx.fillText(lab, X(b) + d * 6, y + 4); ctx.textAlign = "left";
    };
    arrow(MU, k.ms, y0 + 8, "#b07d16", "S");
    arrow(MU, k.mo, y0 + 24, C.forest, "R");

    // 범례
    const lx = w - 104, ly = 4;
    {
      ctx.font = `10.5px ${F.sans}`;
      [["rgba(141,141,146,.4)", "부모 세대"], ["rgba(224,160,42,.7)", "그중 살아남은 새"], [C.forest, "자손 세대"]].forEach(([c, t], i) => {
        ctx.fillStyle = c; ctx.fillRect(lx, ly + i * 16, 12, 8); ctx.fillStyle = C.ink2; ctx.fillText(t, lx + 18, ly + i * 16 + 8);
      });
    }
  }

  function update() {
    const k = calc();
    oE.textContent = k.e > .6 ? "큰 가뭄" : k.e > .15 ? "가뭄" : k.e < -.6 ? "큰 비" : k.e < -.15 ? "비가 많음" : "보통";
    oH.textContent = k.h2.toFixed(2);
    nSurv.textContent = `${Math.round(k.A * 100)}%`;
    const f = (x) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toFixed(2)} mm`;
    nS.textContent = f(k.S); nR.textContent = f(k.R);
    nOff.textContent = `${k.mo.toFixed(2)} mm`;
    draw();
  }
  [sE, sH].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-set]").forEach((b) => b.addEventListener("click", () => {
    const [e, h] = b.dataset.set.split(","); sE.value = e; sH.value = h; update();
  }));
  update();
})();
