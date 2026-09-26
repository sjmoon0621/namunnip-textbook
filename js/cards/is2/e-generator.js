/* 카드: 자석을 움직이면 왜 전류가 흐를까? — 전자기 유도와 발전기 */
(() => {
  const root = document.getElementById("card-is2-generator");
  if (!root) return;
  const { C, F, fit, clamp, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const gMag = $(".g-mag"), gRot = $(".g-rot");
  const sX = $(".mx"), bAuto = $(".auto"), bFlip = $(".flip"), sRpm = $(".rpm"), oRpm = $(".rpm-out");
  const n1 = $(".n1"), n2 = $(".n2"), n3 = $(".n3"), d1 = $(".d1"), d2 = $(".d2"), d3 = $(".d3"), msg = $(".gen-msg");

  let mode = "mag", N = 100, pole = 1, auto = false, phase = 0;
  let xm = +sX.value, xPrev = xm, emf = 0, theta = 0;
  const hist = [];                        // 최근 4초의 유도 전압 (상대값)
  const phi = (x) => 1 / Math.pow(1 + (x / 0.7) ** 2, 1.5);   // 자석 위치에 따른 코일 속 자기 선속 (상대값, 모식)
  // 발전기 예시 코일
  const NB = 100, B = 0.5, A = 0.01;      // 감은 수, 자기장 (T), 면적 (m²)

  const { ctx, size } = fit(cv, () => draw());

  function drawMag(w, h) {
    const sh = h * 0.62, cx = w * 0.58, cy = sh * 0.58, unit = w * 0.12;
    // 코일
    const cw = unit * 1.3, ch = sh * 0.36, turns = Math.round(N / 25) + 2;
    ctx.lineWidth = 2; ctx.strokeStyle = "#b87333";
    for (let i = 0; i < turns; i++) {
      const x = cx - cw / 2 + (i + 0.5) * cw / turns;
      ctx.beginPath(); ctx.ellipse(x, cy, 5, ch / 2, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // 검류계
    const gx = cx, gy = cy - ch / 2 - 44, gr = 30;
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - cw / 2, cy - ch / 2); ctx.lineTo(cx - cw / 2, gy); ctx.lineTo(gx - gr, gy);
    ctx.moveTo(cx + cw / 2, cy - ch / 2); ctx.lineTo(cx + cw / 2, gy); ctx.lineTo(gx + gr, gy); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(gx, gy, gr, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    const ang = -Math.PI / 2 + clamp(emf / 2.2, -1, 1) * 1.2;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(ang) * (gr - 4), gy + Math.sin(ang) * (gr - 4)); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("0", gx, gy - gr + 12); ctx.fillText("검류계", gx, gy + 13);
    // 자석 (코일 중심 기준 xm)
    const mx = cx + xm * unit, mw = unit * 1.5, mh = ch * 0.34;
    ctx.fillStyle = pole > 0 ? C.apple : "#4a78a8"; ctx.fillRect(mx - mw / 2, cy - mh / 2, mw / 2, mh);
    ctx.fillStyle = pole > 0 ? "#4a78a8" : C.apple; ctx.fillRect(mx, cy - mh / 2, mw / 2, mh);
    ctx.fillStyle = "#fff"; ctx.font = `600 11px ${F.mono}`;
    ctx.fillText(pole > 0 ? "S" : "N", mx - mw / 4, cy + 4); ctx.fillText(pole > 0 ? "N" : "S", mx + mw / 4, cy + 4);
    // 코일을 다시 앞에 (앞쪽 반원)
    ctx.lineWidth = 2; ctx.strokeStyle = "#b87333";
    for (let i = 0; i < turns; i++) {
      const x = cx - cw / 2 + (i + 0.5) * cw / turns;
      ctx.beginPath(); ctx.ellipse(x, cy, 5, ch / 2, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    }
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText(`코일 ${N}회 감음 · 자석을 끌어 움직이세요`, 8, 14);
    // 아래: 유도 전압 기록
    const y0 = sh + 14, gh = h - y0 - 8, x0 = 36, gw = w - x0 - 10;
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X: (v) => x0 + v * gw, Y: (v) => y0 + (1 - (v + 3) / 6) * gh, yt: [[0, "0"]], ylabel: "" });
    ctx.fillStyle = C.ink3; ctx.fillText("유도 전압 (최근 4초)", x0 + 4, y0 + 11);
    ctx.beginPath();
    hist.forEach((v, i) => { const x = x0 + i / 240 * gw, y = y0 + (1 - (clamp(v, -3, 3) + 3) / 6) * gh; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.8; ctx.stroke();
  }

  function drawRot(w, h) {
    const rpm = +sRpm.value, f = rpm / 60, om = 2 * Math.PI * f;
    const sh = h * 0.56, cx = w / 2, cy = sh * 0.52;
    const mh = sh * 0.62, gap = Math.min(w * 0.5, 240);
    ctx.fillStyle = C.apple; ctx.fillRect(cx - gap / 2 - 34, cy - mh / 2, 34, mh);
    ctx.fillStyle = "#4a78a8"; ctx.fillRect(cx + gap / 2, cy - mh / 2, 34, mh);
    ctx.fillStyle = "#fff"; ctx.font = `600 13px ${F.mono}`; ctx.textAlign = "center";
    ctx.fillText("N", cx - gap / 2 - 17, cy + 5); ctx.fillText("S", cx + gap / 2 + 17, cy + 5);
    ctx.strokeStyle = "rgba(35,35,38,.2)"; ctx.lineWidth = 1;
    for (let k = -2; k <= 2; k++) { const y = cy + k * mh / 5; ctx.beginPath(); ctx.moveTo(cx - gap / 2, y); ctx.lineTo(cx + gap / 2, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + gap / 2 - 6, y - 3); ctx.lineTo(cx + gap / 2, y); ctx.lineTo(cx + gap / 2 - 6, y + 3); ctx.stroke(); }
    // 코일: 세로축 둘레로 돈다. 보이는 폭 ∝ sin θ, 자기 선속 ∝ cos θ
    const a = gap * 0.36, ch = mh * 0.62, pw = a * Math.sin(theta);
    ctx.fillStyle = Math.cos(theta) > 0 ? "rgba(184,115,51,.18)" : "rgba(184,115,51,.08)";
    ctx.fillRect(cx - Math.abs(pw), cy - ch / 2, Math.abs(pw) * 2, ch);
    ctx.strokeStyle = "#b87333"; ctx.lineWidth = 3; ctx.strokeRect(cx - Math.abs(pw), cy - ch / 2, Math.abs(pw) * 2, ch);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cx, cy - ch / 2 - 14); ctx.lineTo(cx, cy + ch / 2 + 14); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(rpm ? `화면은 느리게 재생 (실제 1초에 ${f.toFixed(f < 10 ? 1 : 0)}바퀴)` : "멈춤", 8, 14);
    // 그래프: 0~50 ms 동안의 유도 전압
    const y0 = sh + 18, gh = h - y0 - 26, x0 = 40, gw = w - x0 - 10, VM = 250;
    const X = (t) => x0 + t / 0.05 * gw, Y = (v) => y0 + (1 - (v + VM) / (2 * VM)) * gh;
    NM.axes(ctx, { x0, y0, w: gw, h: gh, X, Y, xt: [[0, "0"], [0.01, "10"], [0.02, "20"], [0.03, "30"], [0.04, "40"], [0.05, "50 ms"]],
      yt: [[-200, "−200"], [0, "0"], [200, "200 V"]] });
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(x0, Y(0) + .5); ctx.lineTo(x0 + gw, Y(0) + .5); ctx.stroke();
    const E0 = NB * B * A * om;
    ctx.beginPath(); for (let i = 0; i <= 400; i++) { const t = i / 400 * 0.05; const v = E0 * Math.sin(om * t); i ? ctx.lineTo(X(t), Y(v)) : ctx.moveTo(X(t), Y(v)); }
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.stroke();
    if (rpm) { const tc = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / om; if (tc <= 0.05) { ctx.beginPath(); ctx.arc(X(tc), Y(E0 * Math.sin(om * tc)), 4.5, 0, 7); ctx.fillStyle = C.ink; ctx.fill(); } }
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    mode === "mag" ? drawMag(w, h) : drawRot(w, h);
  }

  function readouts() {
    if (mode === "mag") {
      d1.textContent = "코일 속 자기 선속"; d2.textContent = "유도 전압 (상대값)"; d3.textContent = "전류 방향";
      n1.textContent = (phi(xm) * 100).toFixed(0);
      n2.textContent = Math.abs(emf) < 0.05 ? "0" : emf.toFixed(1);
      n3.textContent = Math.abs(emf) < 0.05 ? "흐르지 않음" : emf > 0 ? "→ 방향" : "← 방향";
      msg.textContent = Math.abs(emf) < 0.05 ? "자석이 코일 안에 있어도 멈춰 있으면 전류가 흐르지 않습니다." : "코일을 지나는 자기 선속이 바뀌는 동안에만 전류가 흐릅니다. 빠르게 움직일수록 바늘이 크게 움직입니다.";
    } else {
      const rpm = +sRpm.value, f = rpm / 60;
      d1.textContent = "주파수"; d2.textContent = "최대 전압"; d3.textContent = "예시 코일";
      n1.textContent = `${f.toFixed(1)} Hz`;
      n2.textContent = `${Math.round(NB * B * A * 2 * Math.PI * f)} V`;
      n3.textContent = "100회·0.5 T·100 cm²";
      msg.textContent = "코일 면이 자기장과 나란해지는 순간(보이는 폭이 가장 넓을 때) 자기 선속이 가장 빨리 변해 전압이 최대가 됩니다. 1초에 60바퀴 돌리면 60 Hz 교류가 나옵니다.";
    }
  }

  let t0 = 0;
  NM.loop(cv, (dt) => {
    if (!dt) return;
    if (mode === "mag") {
      if (auto) { phase += dt * 2.2; xm = 2.6 * Math.sin(phase); sX.value = xm.toFixed(2); }
      const v = (xm - xPrev) / dt; xPrev = xm;
      const dphi = (phi(xm + 1e-3) - phi(xm - 1e-3)) / 2e-3;
      const target = -pole * (N / 100) * dphi * v * 0.35;
      emf += (target - emf) * Math.min(1, dt * 20);
      hist.push(emf); if (hist.length > 240) hist.shift();
    } else {
      const f = +sRpm.value / 60;
      theta += dt * 2 * Math.PI * (f ? 0.15 + 0.5 * f / 60 : 0);
    }
    t0 += dt; if (t0 > 0.1) { readouts(); t0 = 0; }
    draw();
  });

  sX.addEventListener("input", () => { auto = false; bAuto.setAttribute("aria-pressed", false); xm = +sX.value; });
  bAuto.addEventListener("click", () => { auto = !auto; bAuto.setAttribute("aria-pressed", auto); if (auto) phase = Math.asin(clamp(xm / 2.6, -1, 1)); });
  bFlip.addEventListener("click", () => { pole = -pole; bFlip.setAttribute("aria-pressed", pole < 0); });
  root.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => {
    N = +b.dataset.n; root.querySelectorAll("[data-n]").forEach((k) => k.setAttribute("aria-pressed", k === b));
  }));
  sRpm.addEventListener("input", () => { oRpm.textContent = sRpm.value; readouts(); draw(); });
  root.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    root.querySelectorAll("[data-mode]").forEach((k) => k.setAttribute("aria-pressed", k === b));
    gMag.hidden = mode !== "mag"; gRot.hidden = mode !== "rot";
    readouts(); draw();
  }));
  // 캔버스에서 직접 자석 끌기
  let drag = false;
  const toX = (e) => { const r = cv.getBoundingClientRect(); return ((e.clientX - r.left) - r.width * 0.58) / (r.width * 0.12); };
  cv.addEventListener("pointerdown", (e) => { if (mode !== "mag") return; drag = true; auto = false; bAuto.setAttribute("aria-pressed", false); cv.setPointerCapture(e.pointerId); xm = clamp(toX(e), -3, 3); sX.value = xm; });
  cv.addEventListener("pointermove", (e) => { if (drag) { xm = clamp(toX(e), -3, 3); sX.value = xm; } });
  cv.addEventListener("pointerup", () => { drag = false; });
  if (!reduce) { auto = true; bAuto.setAttribute("aria-pressed", true); }
  oRpm.textContent = sRpm.value;
  readouts();
})();
