/* 카드: 롤러코스터는 왜 첫 언덕이 가장 높을까? — 궤도를 따라가는 운동을 수치 적분 (마찰 포함 가능) */
(() => {
  const root = document.getElementById("card-phy-coaster");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const s1 = $(".h1"), s2 = $(".h2"), o1 = $(".h1-out"), o2 = $(".h2-out");
  const nV = $(".c-v"), nH = $(".c-h"), nQ = $(".c-q");

  const g = 9.81, VLIFT = 2, XC = 20, XEND = 110;
  let mu = 0;
  let KP = [], x, v, q, t, lifting, state, wait, maxH2;

  function build() {
    const h1 = +s1.value, h2 = +s2.value;
    // [x, y] 꼭짓점 사이를 (1 − cos)/2 로 잇는다 → 기울기가 연속
    KP = [[0, 0.5], [XC, h1], [38, 1.5], [58, h2], [76, 1.5], [90, 8], [100, 0.5], [XEND, 0.5]];
  }
  function Y(xx) {
    let i = 0; while (i < KP.length - 2 && xx > KP[i + 1][0]) i++;
    const [xa, ya] = KP[i], [xb, yb] = KP[i + 1], u = Math.min(1, Math.max(0, (xx - xa) / (xb - xa)));
    return ya + (yb - ya) * (1 - Math.cos(Math.PI * u)) / 2;
  }
  const d1 = (xx) => (Y(xx + 1e-3) - Y(xx - 1e-3)) / 2e-3;
  const d2 = (xx) => (Y(xx + 1e-3) - 2 * Y(xx) + Y(xx - 1e-3)) / 1e-6;

  function reset() {
    build(); x = 0; v = VLIFT; q = 0; t = 0; lifting = true; state = "lift"; wait = 0; maxH2 = 0;
    o1.textContent = s1.value; o2.textContent = s2.value;
    draw(); numbers();
  }

  // 역학적 에너지는 단위 질량당 (J/kg). 체인이 꼭대기까지 끌어올린 뒤의 값이 기준.
  const E0 = () => g * Y(XC) + 0.5 * VLIFT * VLIFT;

  function step(dt) {
    if (state === "done") return;
    const p = d1(x), c = Math.sqrt(1 + p * p);
    if (lifting) {             // 체인: 일정한 속력으로 끌어올림 (모터가 일을 함)
      x += VLIFT * dt / c; v = VLIFT;
      if (x >= XC) { x = XC; lifting = false; state = "run"; }
      return;
    }
    const sin = p / c, cos = 1 / c, kap = d2(x) / (c * c * c);
    const N = Math.abs(g * cos + v * v * kap);        // 단위 질량당 수직 항력 (바퀴가 궤도를 위아래로 잡고 있음)
    const fr = mu * N * Math.sign(v);
    const a = -g * sin - fr;
    let vn = v + a * dt;
    if (mu > 0 && Math.sign(vn) !== Math.sign(v) && Math.abs(g * sin) <= mu * N) vn = 0; // 마찰로 멈춤
    q += mu * N * Math.abs(v) * dt;
    v = vn; x += v * dt / c; t += dt;
    if (x > 40 && x < 76) maxH2 = Math.max(maxH2, Y(x));
    if (x < XC) { x = XC; v = 0; state = "back"; }      // 역주행 방지 장치에 걸림
    if (x > 100) { const vb = Math.max(0, v - 32 * dt); q += (v * v - vb * vb) / 2; v = vb; if (v === 0) state = "done"; } // 마지막 제동 구간 (브레이크의 열도 '열'에 넣음)
    if (x >= XEND) { x = XEND; state = "done"; }
    if (t > 20 || (v === 0 && Math.abs(g * sin) < 1e-6 + mu * N && mu > 0)) state = state === "run" ? "stuck" : state;
  }

  function numbers() {
    const E = E0(), K = 0.5 * v * v, U = g * Y(x);
    nV.textContent = `${(Math.abs(v) * 3.6).toFixed(0)} km/h`;
    nH.textContent = `${Y(x).toFixed(1)} m`;
    nQ.textContent = lifting ? "—" : `${(q / E * 100).toFixed(1)}%`;
    void K; void U;
  }

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w || !KP.length) return;
    ctx.clearRect(0, 0, w, h);
    const barH = 44, top = 22;
    const s = Math.min((w - 20) / XEND, (h - barH - top - 26) / 52);
    const ox = (w - XEND * s) / 2, gy = h - barH - 18;
    const PX = (xx) => ox + xx * s, PY = (yy) => gy - yy * s;
    // 기준선: 첫 언덕 꼭대기 높이 (마찰이 없을 때 오를 수 있는 한계)
    ctx.setLineDash([4, 4]); ctx.strokeStyle = C.forest; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX(0), PY(Y(XC))); ctx.lineTo(PX(XEND), PY(Y(XC))); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.forest; ctx.textAlign = "right";
    ctx.fillText("출발 높이", PX(XEND), PY(Y(XC)) - 4);
    // 땅과 궤도
    ctx.fillStyle = "#e6e6df"; ctx.fillRect(0, gy, w, 3);
    ctx.beginPath(); ctx.moveTo(PX(0), PY(Y(0)));
    for (let xx = 0; xx <= XEND; xx += 0.25) ctx.lineTo(PX(xx), PY(Y(xx)));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
    // 체인 구간
    ctx.beginPath(); for (let xx = 0; xx <= XC; xx += 0.25) ctx.lineTo(PX(xx), PY(Y(xx)));
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.amber; ctx.textAlign = "left"; ctx.fillText("체인", PX(4), PY(Y(8)) - 8);
    // 기둥 몇 개
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    for (let xx = 5; xx < XEND; xx += 5) { ctx.beginPath(); ctx.moveTo(PX(xx), PY(Y(xx)) + 3); ctx.lineTo(PX(xx), gy); ctx.stroke(); }
    // 차
    const p = d1(x), ang = Math.atan(p);
    ctx.save(); ctx.translate(PX(x), PY(Y(x))); ctx.rotate(-ang);
    ctx.fillStyle = C.apple; ctx.fillRect(-9, -11, 18, 9);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-5, -2, 2.4, 0, Math.PI * 2); ctx.arc(5, -2, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // 높이 눈금
    ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let yy = 0; yy <= 50; yy += 10) if (PY(yy) > top - 4) ctx.fillText(`${yy}`, ox - 2 > 14 ? ox - 2 : 14, PY(yy) + 3);
    ctx.textAlign = "left";
    const msg = { lift: "체인이 끌어올리는 중 (모터가 일을 함)", run: "", back: "둘째 언덕을 넘지 못하고 되돌아옴", stuck: "마찰로 에너지를 잃고 골짜기에 멈춤", done: "도착" }[state];
    ctx.fillStyle = state === "back" || state === "stuck" ? C.warn : C.ink2;
    ctx.fillText(msg || `v = ${(Math.abs(v) * 3.6).toFixed(0)} km/h`, 8, 13);

    // ── 에너지 막대 (체인이 끌어올린 뒤의 역학적 에너지 = 100%)
    const E = E0(), K = 0.5 * v * v, U = g * Y(x);
    const bx = 10, bw = w - 20, by = h - barH + 6, bh = 14;
    const parts = lifting ? [[U / E, C.forest, "퍼텐셜"], [K / E, C.ink, "운동"]] : [[U / E, C.forest, "퍼텐셜"], [K / E, C.ink, "운동"], [q / E, C.warn, "열"]];
    let px = bx;
    ctx.strokeStyle = C.ink3; ctx.strokeRect(bx + .5, by + .5, bw, bh);
    for (const [f, col] of parts) { const ww = Math.max(0, f) * bw; ctx.fillStyle = col; ctx.fillRect(px, by, ww, bh); px += ww; }
    ctx.font = `10px ${F.mono}`; let lx = bx;
    for (const [f, col, lab] of parts) {
      const tx = `${lab} ${(f * 100).toFixed(0)}%`;
      ctx.fillStyle = col; ctx.fillText(tx, lx, by + bh + 13); lx += ctx.measureText(tx).width + 14;
    }
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("체인이 올려놓은 에너지 = 100%", bx + bw, by - 4); ctx.textAlign = "left";
  }

  [s1, s2].forEach((el) => el.addEventListener("input", reset));
  root.querySelectorAll("[data-mu]").forEach((b) => b.addEventListener("click", () => {
    mu = +b.dataset.mu;
    root.querySelectorAll("[data-mu]").forEach((c) => c.setAttribute("aria-pressed", c === b ? "true" : "false"));
    reset();
  }));
  $(".c-go").addEventListener("click", reset);
  reset();
  loop(cv, (dt) => {
    if (state === "done" || state === "back" || state === "stuck") { wait += dt; if (wait > 3) reset(); draw(); return; }
    const sp = lifting ? 4 : 1; // 체인 구간은 빨리 감기
    for (let i = 0; i < 40; i++) step(dt * sp / 40);
    numbers(); draw();
  });
})();
