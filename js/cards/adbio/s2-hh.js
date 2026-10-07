/* 카드: 두 번째 자극은 왜 통하지 않을까? — 호지킨–헉슬리 모형(오징어 거대 축삭, 6.3 °C)으로 활동 전위와 불응기 */
(() => {
  const root = document.getElementById("card-adbio-hh");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sA1 = $(".a1"), sD = $(".dd"), sA2 = $(".a2");
  const oA1 = $(".a1-out"), oD = $(".dd-out"), oA2 = $(".a2-out");
  const cTTX = $(".ttx"), cTEA = $(".tea");
  const nN = $(".n-n"), nP = $(".n-p"), nT = $(".n-t");

  /* 호지킨–헉슬리(1952) 표준 매개변수, 휴지 전위 −65 mV 기준 */
  const ENa = 50, EK = -77, EL = -54.387, gL = 0.3, CM = 1, PW = 0.5, T1 = 2, DT = 0.01;
  const am = (V) => { const x = V + 40; return Math.abs(x) < 1e-6 ? 1 : 0.1 * x / (1 - Math.exp(-x / 10)); };
  const bm = (V) => 4 * Math.exp(-(V + 65) / 18);
  const ah = (V) => 0.07 * Math.exp(-(V + 65) / 20);
  const bh = (V) => 1 / (1 + Math.exp(-(V + 35) / 10));
  const an = (V) => { const x = V + 55; return Math.abs(x) < 1e-6 ? 0.1 : 0.01 * x / (1 - Math.exp(-x / 10)); };
  const bn = (V) => 0.125 * Math.exp(-(V + 65) / 80);

  function sim(A1, d, A2, ttx, tea, T, rec) {
    const gNa = ttx ? 0 : 120, gK = tea ? 0 : 36;
    let V = -65, m = am(V) / (am(V) + bm(V)), h = ah(V) / (ah(V) + bh(V)), n = an(V) / (an(V) + bn(V));
    let spikes = 0, up = false;
    const tr = rec ? { V: [], gNa: [], gK: [], h: [] } : null;
    const N = Math.round(T / DT);
    for (let i = 0; i < N; i++) {
      const t = i * DT;
      let I = 0;
      if (t >= T1 && t < T1 + PW) I += A1;
      if (t >= T1 + d && t < T1 + d + PW) I += A2;
      const gna = gNa * m * m * m * h, gk = gK * n * n * n * n;
      V += DT * (I - gna * (V - ENa) - gk * (V - EK) - gL * (V - EL)) / CM;
      m += DT * (am(V) * (1 - m) - bm(V) * m);
      h += DT * (ah(V) * (1 - h) - bh(V) * h);
      n += DT * (an(V) * (1 - n) - bn(V) * n);
      if (!up && V > 0) { spikes++; up = true; }
      if (up && V < -30) up = false;
      if (tr && i % 5 === 0) { tr.V.push(V); tr.gNa.push(gna); tr.gK.push(gk); tr.h.push(h); }
    }
    return { spikes, tr };
  }

  /* 불응기 곡선: 첫 자극 40 µA/cm²(반드시 흥분) 뒤 간격 d에서 두 번째 활동 전위를 일으키는 최소 세기 */
  const A2MAX = 300;
  let curve = null, curveKey = "";
  function makeCurve(ttx, tea) {
    const out = [];
    for (let d = 1; d <= 25.01; d += 0.5) {
      const T = T1 + d + 12;
      if (sim(40, d, A2MAX, ttx, tea, T).spikes < 2) { out.push([d, null]); continue; }
      let lo = 0, hi = A2MAX;
      for (let k = 0; k < 13; k++) { const mid = (lo + hi) / 2; if (sim(40, d, mid, ttx, tea, T).spikes >= 2) hi = mid; else lo = mid; }
      out.push([d, hi]);
    }
    return out;
  }
  let single = 0;
  {
    let lo = 0, hi = 100;
    for (let k = 0; k < 16; k++) { const mid = (lo + hi) / 2; if (sim(mid, 100, 0, false, false, 20).spikes >= 1) hi = mid; else lo = mid; }
    single = hi;
  }

  const TMAX = 30;
  let cur = null;
  const { ctx, size } = fit(cv, () => draw());

  function panel(x0, y0, w, h, tLabel) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + h); ctx.lineTo(x0 + w, y0 + h); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(tLabel, x0 + 4, y0 - 6);
  }
  function draw() {
    const { w, h } = size; if (!w || !cur) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 44, x1 = w - 12, pw = x1 - x0;
    const X = (t) => x0 + t / TMAX * pw;
    const tr = cur.tr, step = DT * 5;
    /* 1) 막전위 */
    const a0 = 22, ah1 = h * 0.30;
    const VY = (v) => a0 + (60 - v) / 150 * ah1;
    panel(x0, a0, pw, ah1, "막전위 (mV)");
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (const v of [50, 0, -50, -90]) { const y = VY(v); ctx.fillText(String(v), x0 - 5, y + 3); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "#c0504d"; ctx.beginPath(); ctx.moveTo(x0, VY(ENa)); ctx.lineTo(x1, VY(ENa)); ctx.stroke();
    ctx.strokeStyle = "#3f6fa3"; ctx.beginPath(); ctx.moveTo(x0, VY(EK)); ctx.lineTo(x1, VY(EK)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    ctx.fillStyle = "#c0504d"; ctx.fillText("E_Na", x1, VY(ENa) - 3);
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("E_K", x1, VY(EK) + 11);
    /* 자극 표시 */
    const d = +sD.value;
    ctx.fillStyle = "rgba(224,160,42,.25)";
    ctx.fillRect(X(T1), a0, X(T1 + PW) - X(T1), ah1);
    if (+sA2.value > 0) ctx.fillRect(X(T1 + d), a0, Math.max(2, X(T1 + d + PW) - X(T1 + d)), ah1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
    tr.V.forEach((v, i) => { const x = X(i * step), y = VY(Math.max(-95, Math.min(60, v))); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    ctx.stroke(); ctx.lineWidth = 1;
    /* 2) 전도도 */
    const b0 = a0 + ah1 + 34, bh1 = h * 0.22;
    panel(x0, b0, pw, bh1, "전도도 (mS/cm²)와 Na⁺ 통로의 h(불활성화 문이 열린 비율)");
    const gY = (g) => b0 + bh1 - g / 40 * bh1;
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (const g of [0, 20, 40]) ctx.fillText(String(g), x0 - 5, gY(g) + 3);
    const line = (arr, col, f, dash) => { ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.setLineDash(dash || []); ctx.beginPath(); arr.forEach((v, i) => { const x = X(i * step), y = f(v); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; };
    line(tr.gNa, "#c0504d", (g) => gY(Math.min(40, g)));
    line(tr.gK, "#3f6fa3", (g) => gY(Math.min(40, g)));
    line(tr.h, C.forest, (v) => b0 + bh1 - v * bh1, [4, 3]);
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    const lx = x0 + pw * 0.62;
    ctx.fillStyle = "#c0504d"; ctx.fillText("g_Na", lx, b0 + 10);
    ctx.fillStyle = "#3f6fa3"; ctx.fillText("g_K", lx + 40, b0 + 10);
    ctx.fillStyle = C.forest; ctx.fillText("h (0~1)", lx + 76, b0 + 10);
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    for (let t = 0; t <= TMAX; t += 5) ctx.fillText(String(t), X(t), b0 + bh1 + 13);
    ctx.textAlign = "right"; ctx.fillText("시간 (ms)", x1, b0 + bh1 + 26);
    /* 3) 불응기 곡선 */
    const c0 = b0 + bh1 + 56, ch1 = h - c0 - 34;
    const DX = (dd) => x0 + (dd - 1) / 24 * pw, AY = (a) => c0 + ch1 - a / A2MAX * ch1;
    panel(x0, c0, pw, ch1, "두 번째 활동 전위에 필요한 최소 자극 세기 (µA/cm²)");
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (const a of [0, 100, 200, 300]) ctx.fillText(String(a), x0 - 5, AY(a) + 3);
    ctx.textAlign = "center";
    for (const dd of [1, 5, 10, 15, 20, 25]) ctx.fillText(String(dd), DX(dd), c0 + ch1 + 13);
    ctx.textAlign = "right"; ctx.fillText("두 자극의 간격 (ms)", x1, c0 + ch1 + 26);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(x0, AY(single)); ctx.lineTo(x1, AY(single)); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink3;
    ctx.fillText("평소 역치", x1, AY(single) - 4);
    if (curve) {
      let firstOk = null;
      curve.forEach(([dd, a]) => { if (a === null) { ctx.fillStyle = "rgba(181,83,47,.18)"; ctx.fillRect(DX(dd) - pw / 96, c0, pw / 48, ch1); } else if (firstOk === null) firstOk = dd; });
      if (firstOk !== null && firstOk > 1) { ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText("절대 불응기", DX(1) + 3, c0 + 12); }
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); let st = false;
      curve.forEach(([dd, a]) => { if (a === null) { st = false; return; } const x = DX(dd), y = AY(Math.min(A2MAX, a)); if (st) ctx.lineTo(x, y); else { ctx.moveTo(x, y); st = true; } });
      ctx.stroke(); ctx.lineWidth = 1;
    } else if (!cTTX.checked) {
      ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("계산 중…", x0 + pw / 2, c0 + ch1 / 2);
    } else {
      ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("Na⁺ 통로가 막혀 활동 전위가 생기지 않습니다", x0 + pw / 2, c0 + ch1 / 2);
    }
    /* 현재 고른 점 */
    if (d >= 1) {
      const px = DX(Math.min(25, d)), py = AY(+sA2.value);
      ctx.fillStyle = cur.spikes >= 2 ? C.forest : C.ink;
      ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  let timer = 0;
  function refreshCurve() {
    const key = `${cTTX.checked}${cTEA.checked}`;
    if (key === curveKey) return;
    curveKey = key; curve = null;
    if (cTTX.checked) return;
    clearTimeout(timer);
    timer = setTimeout(() => { curve = makeCurve(cTTX.checked, cTEA.checked); draw(); }, 30);
  }
  function update() {
    oA1.textContent = sA1.value; oD.textContent = (+sD.value).toFixed(1); oA2.textContent = sA2.value;
    cur = sim(+sA1.value, +sD.value, +sA2.value, cTTX.checked, cTEA.checked, TMAX, true);
    nN.textContent = `${cur.spikes}번`;
    let mx = -99; cur.tr.V.forEach((v) => { if (v > mx) mx = v; });
    nP.textContent = `${mx.toFixed(0)} mV`;
    nT.textContent = `${single.toFixed(1)} µA/cm²`;
    refreshCurve();
    draw();
  }
  [sA1, sD, sA2].forEach((s) => s.addEventListener("input", update));
  [cTTX, cTEA].forEach((c) => c.addEventListener("change", update));
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    const [a1, dd, a2] = b.dataset.p.split(",").map(Number);
    sA1.value = a1; sD.value = dd; sA2.value = a2; cTTX.checked = false; cTEA.checked = false; update();
  }));
  update();
})();
