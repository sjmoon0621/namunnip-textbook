/* 카드: 떨어뜨린 달걀이 깨지지 않게 하려면? — 충돌 시간과 튀어 오름(반발)이 충격량·힘에 미치는 영향 (모식) */
(() => {
  const root = document.getElementById("card-is1-egg-drop");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sH = $(".eh"), oH = $(".eh-out"), sT = $(".et"), oT = $(".et-out"), sE = $(".ee"), oE = $(".ee-out");
  const chips = [...root.querySelectorAll("[data-cu]")], go = $(".edrop");
  const nV = $(".ev"), nJ = $(".ej"), nF = $(".ef"), nR = $(".er");

  const M = 0.06, g = 9.81, LIMIT = 30; // 달걀 60 g, 깨지는 기준 최대 힘 30 N (모식)
  // 받침 모식값: 멈추는 시간(ms), 튀어 오르는 정도 e (튀어 오르는 속력 / 부딪치는 속력)
  const CU = { floor: [1, 0.1], towel: [12, 0.05], sponge: [40, 0.15], rubber: [40, 0.8] };

  let anim = 0, running = false;
  const { ctx, size } = fit(cv, () => draw());

  function state() {
    const hgt = +sH.value, T = +sT.value, e = +sE.value;
    const v = Math.sqrt(2 * g * hgt), dp = M * v * (1 + e), fmax = Math.PI * dp / (2 * T / 1000);
    return { hgt, T, e, v, dp, fmax, broke: fmax > LIMIT };
  }

  function egg(x, y, r, broke, squash) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1 + squash * 0.25, 1 - squash * 0.25);
    ctx.beginPath(); ctx.ellipse(0, -r * 1.25, r, r * 1.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#f3e6cf"; ctx.fill(); ctx.strokeStyle = "#b9a37c"; ctx.lineWidth = 1.2; ctx.stroke();
    if (broke) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.beginPath();
      ctx.moveTo(-r, -r * 1.1); ctx.lineTo(-r * .4, -r * .8); ctx.lineTo(0, -r * 1.3); ctx.lineTo(r * .4, -r * .85); ctx.lineTo(r, -r * 1.15); ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = state();
    const split = Math.round(w * 0.34);
    // ── 왼쪽: 낙하 장면
    const top = 20, ground = h - 30, sc = (ground - top - 30) / 3;
    const cushionH = s.T > 5 ? 10 + Math.min(18, s.T / 3) : 4;
    ctx.fillStyle = s.e > 0.5 ? "#6a8fb0" : s.T > 5 ? "#e0d2a8" : C.ink3;
    ctx.fillRect(12, ground - cushionH, split - 24, cushionH);
    ctx.fillStyle = C.ink2; ctx.fillRect(8, ground, split - 16, 2);
    // 높이 눈금
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.strokeStyle = C.rule;
    for (let m = 0; m <= 3; m++) { const y = ground - cushionH - m * sc; ctx.fillText(`${m} m`, 12, y - 2); ctx.beginPath(); ctx.moveTo(40, y + .5); ctx.lineTo(split - 12, y + .5); ctx.stroke(); }
    // 달걀 위치
    const tf = Math.sqrt(2 * s.hgt / g), CT = 0.35; // 접촉 장면은 느리게 0.35초로 보여 줌
    let y, squash = 0, broke = false;
    const t = anim;
    const base = ground - cushionH;
    if (t < tf) y = base - (s.hgt - 0.5 * g * t * t) * sc;
    else if (t < tf + CT) { y = base; squash = Math.sin(Math.PI * (t - tf) / CT) * (s.T > 5 ? 0.6 : 0.15); broke = s.broke && t > tf + CT / 2; }
    else {
      broke = s.broke;
      const tu = t - tf - CT, vu = s.e * s.v, hu = vu * tu - 0.5 * g * tu * tu;
      y = base - Math.max(0, broke ? 0 : hu) * sc;
    }
    egg(split / 2, y, 11, broke, squash);
    if (!running && anim === 0) { ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("‘떨어뜨리기’를 누르세요", split / 2, top + 6); ctx.textAlign = "left"; }

    // ── 오른쪽: 힘–시간 그래프
    const x0 = split + 40, y0 = 24, pw = w - x0 - 12, ph = h - y0 - 34;
    const TMAX = 80, FMAX = 100;
    const X = (ms) => x0 + ms / TMAX * pw, Y = (f) => y0 + (1 - Math.min(f, FMAX * 1.04) / FMAX) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [[0, "0"], [20, "20"], [40, "40"], [60, "60"], [80, "80"]],
      yt: [[0, "0"], [25, "25"], [50, "50"], [75, "75"], [100, "100"]], ylabel: "달걀이 받는 힘 (N)", xlabel: "시간 (ms)" });
    ctx.setLineDash([5, 4]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x0, Y(LIMIT)); ctx.lineTo(x0 + pw, Y(LIMIT)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.warn; ctx.textAlign = "right"; ctx.fillText(`깨지는 기준 ${LIMIT} N (모식)`, x0 + pw, Y(LIMIT) - 5); ctx.textAlign = "left";
    const shown = running || anim > 0 ? clamp((anim - tf) / CT, 0, 1) : 1;
    ctx.beginPath(); ctx.moveTo(X(0), Y(0));
    for (let i = 0; i <= 100 * shown; i++) ctx.lineTo(X(s.T * i / 100), Y(s.fmax * Math.sin(Math.PI * i / 100)));
    ctx.strokeStyle = s.broke ? C.warn : C.forest; ctx.lineWidth = 2.2; ctx.stroke();
    if (s.fmax > FMAX) { ctx.fillStyle = C.warn; ctx.fillText(`↑ 최대 ${Math.round(s.fmax)} N`, X(s.T / 2) + 6, y0 + 10); }
  }

  function update() {
    const s = state();
    oH.textContent = (+sH.value).toFixed(1); oT.textContent = sT.value; oE.textContent = (+sE.value).toFixed(2);
    nV.textContent = `${s.v.toFixed(1)} m/s`;
    nJ.textContent = `${s.dp.toFixed(2)} N·s`;
    nF.textContent = `${s.fmax < 100 ? s.fmax.toFixed(1) : Math.round(s.fmax)} N`;
    nR.textContent = s.broke ? "깨짐" : "견딤"; nR.className = s.broke ? "bad" : "good";
    chips.forEach((c) => { const [T, e] = CU[c.dataset.cu]; c.setAttribute("aria-pressed", +sT.value === T && Math.abs(+sE.value - e) < 1e-9 ? "true" : "false"); });
    draw();
  }
  chips.forEach((c) => c.addEventListener("click", () => { const [T, e] = CU[c.dataset.cu]; sT.value = T; sE.value = e; anim = 0; running = false; update(); }));
  [sH, sT, sE].forEach((el) => el.addEventListener("input", () => { anim = 0; running = false; update(); }));
  go.addEventListener("click", () => { anim = 0; running = true; });
  update();
  loop(cv, (dt) => {
    if (!running) return;
    anim += dt;
    const s = state(), tf = Math.sqrt(2 * s.hgt / g);
    const tu = 2 * s.e * s.v / g;
    if (anim > tf + 0.35 + (s.broke ? 0.3 : tu + 0.3)) running = false;
    draw();
  });
})();
