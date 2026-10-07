/* 카드: 시냅스후 전위는 어떻게 더해질까? — EPSP·IPSP, 시간 합·공간 합 (축삭 언덕 한 점 모형, 모식) */
(() => {
  const root = document.getElementById("card-adbio-psp");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sTau = $(".tau"), sEI = $(".ei"), oTau = $(".tau-out"), oEI = $(".ei-out");
  const nPk = $(".n-pk"), nAP = $(".n-ap"), nMin = $(".n-min");

  const VR = -70, VTH = -55, TMAX = 100, DT = 0.05;
  const ROWS = [
    { k: "E1", name: "흥분성 ①", sub: "세포체 가까이", col: "#c0504d", ts: 2, E: 0, target: 7 },
    { k: "E2", name: "흥분성 ②", sub: "먼 가지 돌기", col: "#e0a02a", ts: 4, E: 0, target: 4 },
    { k: "I", name: "억제성", sub: "세포체", col: "#3f6fa3", ts: 6, E: null, target: -4 },
  ];
  let spk = { E1: [20], E2: [], I: [] };
  let wts = { E1: 0.5, E2: 0.3, I: 0.6 }, wTau = -1;

  function sim(spikes, tau, EI, w, withAP) {
    const gsum = (k, ts, t) => { let s = 0; for (const t0 of spikes[k]) { const x = (t - t0) / ts; if (x > 0) s += w[k] * x * Math.exp(1 - x); } return s; };
    let V = VR, ref = 0;
    const tr = [], aps = [];
    for (let i = 0; i * DT <= TMAX; i++) {
      const t = i * DT;
      if (ref > 0) { ref -= DT; V = ref > 2 ? 30 : -75; tr.push(V); continue; }
      const gE1 = gsum("E1", 2, t), gE2 = gsum("E2", 4, t), gI = gsum("I", 6, t);
      V += DT * (-(V - VR) - gE1 * (V - 0) - gE2 * (V - 0) - gI * (V - EI)) / tau;
      if (withAP && V >= VTH) { aps.push(t); ref = 3; V = 30; }
      tr.push(V);
    }
    return { tr, aps };
  }
  /* 막 시간 상수가 바뀌어도 시냅스 하나의 전위 크기(꼭대기)가 같도록 세기를 맞춘다 */
  function calibrate(tau) {
    if (tau === wTau) return;
    for (const r of ROWS) {
      let lo = 0, hi = 20;
      for (let it = 0; it < 22; it++) {
        const mid = (lo + hi) / 2, w = { E1: 0, E2: 0, I: 0 }; w[r.k] = mid;
        const s = { E1: [], E2: [], I: [] }; s[r.k] = [5];
        const tr = sim(s, tau, -80, w, false).tr;
        const ext = r.target > 0 ? Math.max(...tr) - VR : Math.min(...tr) - VR;
        if (Math.abs(ext) < Math.abs(r.target)) lo = mid; else hi = mid;
      }
      wts[r.k] = (lo + hi) / 2;
    }
    wTau = tau;
  }

  const { ctx, size } = fit(cv, () => draw());
  let geo = null, res = null;
  function draw() {
    const { w, h } = size; if (!w || !res) return;
    ctx.clearRect(0, 0, w, h);
    /* 1) 뉴런 모식도 */
    const nh = h * 0.27, sx = w * 0.30, sy = nh * 0.55, sr = Math.min(26, nh * 0.22);
    ctx.fillStyle = "#efe7d6"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
    /* 가지 돌기 */
    ctx.beginPath(); ctx.moveTo(sx - sr * 0.8, sy - sr * 0.5); ctx.quadraticCurveTo(sx - w * 0.12, sy - nh * 0.3, sx - w * 0.24, sy - nh * 0.38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx - sr * 0.9, sy + sr * 0.3); ctx.quadraticCurveTo(sx - w * 0.12, sy + nh * 0.25, sx - w * 0.22, sy + nh * 0.35); ctx.stroke();
    /* 세포체 */
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    /* 축삭 언덕과 축삭 */
    ctx.beginPath(); ctx.moveTo(sx + sr, sy - 5); ctx.lineTo(sx + sr + 16, sy - 2); ctx.lineTo(sx + sr + 16, sy + 2); ctx.lineTo(sx + sr, sy + 5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx + sr + 16, sy); ctx.lineTo(w - 16, sy); ctx.stroke(); ctx.lineWidth = 1;
    const hx = sx + sr + 8;
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("축삭 언덕: 여기서 막전위를 기록", hx + 14, sy - 10);
    ctx.fillText("축삭 →", w - 54, sy + 16);
    /* 시냅스 단추 */
    const knob = (x, y, col, lab, on) => {
      ctx.fillStyle = col; ctx.globalAlpha = on ? 1 : 0.45;
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(lab, x + 9, y + 4);
    };
    const now = (k) => spk[k].length > 0;
    knob(sx - sr * 0.75, sy - sr * 1.05, ROWS[0].col, "①", now("E1"));
    knob(sx - w * 0.24, sy - nh * 0.38 - 7, ROWS[1].col, "②", now("E2"));
    knob(sx + sr * 0.2, sy + sr + 6, ROWS[2].col, "억제", now("I"));
    /* 2) 입력 시각 표 (눌러서 추가·삭제) */
    const x0 = 64, x1 = w - 12, X = (t) => x0 + t / TMAX * (x1 - x0);
    const r0 = nh + 8, rh = 22;
    geo = { x0, x1, r0, rh, X };
    ROWS.forEach((r, i) => {
      const y = r0 + i * rh;
      ctx.fillStyle = i % 2 ? "rgba(0,0,0,.025)" : "rgba(0,0,0,.05)"; ctx.fillRect(x0, y, x1 - x0, rh);
      ctx.fillStyle = r.col; ctx.font = `11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(r.name, x0 - 6, y + 15);
      ctx.strokeStyle = r.col; ctx.lineWidth = 2.5;
      spk[r.k].forEach((t) => { ctx.beginPath(); ctx.moveTo(X(t), y + 3); ctx.lineTo(X(t), y + rh - 3); ctx.stroke(); });
      ctx.lineWidth = 1;
    });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("칸을 누르면 그 시각에 신경 전달 물질이 나옵니다 (다시 누르면 지움)", x0, r0 - 4);
    /* 3) 막전위 */
    const v0 = r0 + 3 * rh + 30, vh = h - v0 - 30;
    const VY = (v) => v0 + (-40 - Math.max(-85, Math.min(-40, v))) / 45 * vh;
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (const v of [-40, -55, -70, -85]) { ctx.fillText(String(v), x0 - 6, VY(v) + 3); ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, VY(v)); ctx.lineTo(x1, VY(v)); ctx.stroke(); }
    ctx.setLineDash([5, 3]); ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(x0, VY(VTH)); ctx.lineTo(x1, VY(VTH)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("역치 −55 mV", x1, VY(VTH) - 4);
    ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText("축삭 언덕의 막전위 (mV)", x0, v0 - 8);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
    res.tr.forEach((v, i) => { const x = X(i * DT), y = VY(v); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    ctx.stroke(); ctx.lineWidth = 1;
    res.aps.forEach((t) => { ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("활동 전위 ↑", X(t) + 2, v0 + 10); });
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    for (let t = 0; t <= TMAX; t += 20) ctx.fillText(String(t), X(t), v0 + vh + 13);
    ctx.textAlign = "right"; ctx.fillText("시간 (ms)", x1, v0 + vh + 26);
  }
  function update() {
    const tau = +sTau.value, EI = +sEI.value;
    oTau.textContent = tau; oEI.textContent = EI;
    calibrate(tau);
    res = sim(spk, tau, EI, wts, true);
    const sub = sim(spk, tau, EI, wts, false).tr;
    nPk.textContent = `${Math.max(...sub).toFixed(1)} mV`;
    nMin.textContent = `${Math.min(...sub).toFixed(1)} mV`;
    nAP.textContent = res.aps.length ? `${res.aps.length}번` : "없음";
    nAP.className = "n-ap " + (res.aps.length ? "good" : "");
    draw();
  }
  cv.addEventListener("click", (e) => {
    if (!geo) return;
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const i = Math.floor((y - geo.r0) / geo.rh);
    if (i < 0 || i > 2 || x < geo.x0 || x > geo.x1) return;
    const t = Math.round((x - geo.x0) / (geo.x1 - geo.x0) * TMAX), k = ROWS[i].k;
    const near = spk[k].findIndex((s) => Math.abs(s - t) <= 2);
    if (near >= 0) spk[k].splice(near, 1); else spk[k].push(t);
    update();
  });
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => {
    const p = JSON.parse(b.dataset.p);
    spk = { E1: p[0], E2: p[1], I: p[2] };
    if (p[3]) sTau.value = p[3];
    update();
  }));
  sTau.addEventListener("input", update); sEI.addEventListener("input", update);
  update();
})();
