/* 카드: 항생제 내성 세균은 어떻게 생길까? — 감수성균과 내성균 두 무리의 모식 모형 */
(() => {
  const root = document.getElementById("card-is2-resistance");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const dS = $(".dose"), dO = $(".dose-out"), yS = $(".days"), yO = $(".days-out"), again = $(".again");
  const nN = $(".total"), nR = $(".rfrac"), nV = $(".verdict"), msg = $(".msg");

  // 모식 모형. 세균 수: 감수성균 S, 내성균 R (처음부터 10만 마리 중 1마리꼴로 섞여 있음)
  // 성장: 로지스틱(최대 10¹⁰), 내성균은 조금 느리게 자람(내성의 비용)
  // 항생제: 12시간마다 투여, 반감기 3시간. 죽이는 빠르기는 농도/MIC에 따라 포화.
  // 면역: 세균이 적을 때 더 효과적으로 처리한다고 가정.
  const P = { gS: 0.7, gR: 0.6, K: 1e10, km: 1.3, hl: 3, MS: 1, MR: 16, im: 0.3, IK: 1e5, S0: 1e8, R0: 1e3 };
  const DAYS = 10, DT = 0.01;

  const doseOf = () => +dS.value === 0 ? 0 : 2 ** (+dS.value - 1); // MIC(감수성균)의 몇 배
  function simulate() {
    const c0 = doseOf(), days = +yS.value;
    let S = P.S0, R = P.R0, Cc = 0;
    const pts = [];
    const every = Math.round(12 / DT), rec = Math.round(0.5 / DT);
    for (let i = 0; i <= DAYS * 24 / DT; i++) {
      const t = i * DT;
      if (c0 > 0 && t < days * 24 - 1e-9 && i % every === 0) Cc += c0;
      if (i % rec === 0) pts.push([t, S, R, Cc]);
      const N = S + R, lg = 1 - N / P.K, imm = P.im * P.IK / (P.IK + N);
      const kS = P.km * Cc * Cc / (Cc * Cc + P.MS ** 2), kR = P.km * Cc * Cc / (Cc * Cc + P.MR ** 2);
      S += S * (P.gS * lg - kS - imm) * DT; R += R * (P.gR * lg - kR - imm) * DT;
      if (S < 1) S = 0; if (R < 1) R = 0;
      Cc *= Math.pow(0.5, DT / P.hl);
    }
    return pts;
  }

  let pts = simulate(), prog = 1;
  const { ctx, size } = fit(cv, () => draw());
  const COL = { S: "#6f8fae", R: C.warn };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 40, pw = w - x0 - 12, y0 = 22, cH = Math.max(34, h * 0.17), ph = h - y0 - cH - 50;
    const X = (t) => x0 + t / (DAYS * 24) * pw;
    const Y = (n) => y0 + (1 - clamp(Math.log10(Math.max(n, 1)), 0, 10) / 10) * ph;
    const xt = []; for (let d = 0; d <= DAYS; d += 2) xt.push([d * 24, `${d}일`]);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [], yt: [[1, "1"], [1e3, "10³"], [1e6, "10⁶"], [1e10, "10¹⁰"]], ylabel: "세균 수 (로그 눈금)" });
    // 투여 기간
    const days = +yS.value;
    if (doseOf() > 0) { ctx.fillStyle = "rgba(116,171,102,.10)"; ctx.fillRect(X(0), y0, X(days * 24) - X(0), ph + cH + 12); }
    const tEnd = DAYS * 24 * prog;
    const vis = pts.filter((p) => p[0] <= tEnd);
    for (const [k, idx] of [["S", 1], ["R", 2]]) {
      ctx.strokeStyle = COL[k]; ctx.lineWidth = 2.2; ctx.beginPath();
      let on = false;
      for (const p of vis) { const n = p[idx]; if (n < 1) { if (on) { ctx.lineTo(X(p[0]), Y(1)); } on = false; continue; } on ? ctx.lineTo(X(p[0]), Y(n)) : ctx.moveTo(X(p[0]), Y(n)); on = true; }
      ctx.stroke();
    }
    // 범례
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    const lx = x0 + pw - 150, ly = y0 + 12;
    ctx.fillStyle = COL.S; ctx.fillRect(lx, ly - 8, 12, 3); ctx.fillStyle = C.ink2; ctx.fillText("항생제에 약한 세균", lx + 16, ly - 3);
    ctx.fillStyle = COL.R; ctx.fillRect(lx, ly + 8, 12, 3); ctx.fillStyle = C.ink2; ctx.fillText("내성 세균", lx + 16, ly + 13);
    // 아래: 약물 농도 (MIC 배수, 로그 눈금)
    const cy0 = y0 + ph + 12, cMax = 256;
    const Yc = (c) => cy0 + cH - clamp(Math.log2(Math.max(c, 0.25)) + 2, 0, Math.log2(cMax) + 2) / (Math.log2(cMax) + 2) * cH;
    ctx.strokeStyle = C.rule; ctx.strokeRect(x0 + .5, cy0 + .5, pw, cH);
    for (const [m, lab, col] of [[P.MS, "약한 세균 MIC", COL.S], [P.MR, "내성 세균 MIC", COL.R]]) {
      ctx.strokeStyle = col; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, Yc(m)); ctx.lineTo(x0 + pw, Yc(m)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = col; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(lab, x0 + pw - 3, Yc(m) - 2);
    }
    ctx.fillStyle = "rgba(59,124,42,.35)"; ctx.beginPath(); ctx.moveTo(X(0), Yc(0));
    for (const p of vis) ctx.lineTo(X(p[0]), Yc(p[3]));
    if (vis.length) ctx.lineTo(X(vis.at(-1)[0]), Yc(0)); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("몸속 항생제 농도", x0, cy0 - 3);
    ctx.textAlign = "center";
    for (const [v, lab] of xt) ctx.fillText(lab, X(v), cy0 + cH + 14);
  }

  function update() {
    const c0 = doseOf();
    dO.textContent = c0 ? `MIC의 ${c0}배` : "투여 안 함";
    yO.textContent = yS.value;
    pts = simulate();
    const [, S, R] = pts.at(-1), N = S + R;
    nN.innerHTML = N < 1 ? "0" : `10<sup>${Math.log10(N).toFixed(1)}</sup>`;
    nR.textContent = N < 1 ? "—" : `${(100 * R / N).toFixed(R / N < 0.01 ? 3 : 0)}%`;
    const rVerdict = N < 1 ? ["모두 제거", "good"] : R / N > 0.5 ? ["내성균 감염", "bad"] : ["치료 안 됨", "bad"];
    nV.textContent = rVerdict[0]; nV.className = rVerdict[1];
    if (c0 === 0) msg.textContent = "항생제가 없으면 내성 세균은 조금 느리게 자라는 탓에 소수로 남습니다.";
    else if (N >= 1 && R / N > 0.5) msg.textContent = "항생제가 약한 세균만 없애고, 원래 섞여 있던 내성 세균에게 빈자리를 내주었습니다.";
    else if (N < 1) msg.textContent = "농도가 내성 세균의 MIC도 넘고 투여 기간도 충분해서 두 무리가 모두 사라졌습니다.";
    else msg.textContent = "세균이 남아 다시 늘어났습니다.";
    root.querySelectorAll("[data-dose]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.dose === dS.value)));
    prog = NM.reduce ? 1 : 0;
    draw();
  }
  [dS, yS].forEach((el) => el.addEventListener("input", update));
  root.querySelectorAll("[data-dose]").forEach((b) => b.addEventListener("click", () => { dS.value = b.dataset.dose; update(); }));
  again.addEventListener("click", () => { prog = 0; });
  update();
  loop(cv, (dt) => { if (prog >= 1) return; prog = clamp(prog + dt / 3.5, 0, 1); draw(); });
})();
