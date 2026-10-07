/* 카드: 배음을 더해 음색 만들기 — 끌 수 있는 배음 막대, 파형, 위상, Web Audio 재생 */
(() => {
  const root = document.getElementById("card-hist-synth");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), ph = $(".ph");
  const N = 10, F0 = 220;
  const PRE = {
    sine: (n) => (n === 1 ? 1 : 0),
    saw: (n) => 1 / n,
    odd: (n) => (n % 2 ? 1 / n : 0),
    soft: (n) => Math.exp(-(n - 1) * 0.9),
  };
  let amp = [], pre = "saw";
  const setPre = (p) => { pre = p; amp = Array.from({ length: N }, (_, i) => PRE[p](i + 1)); };
  setPre("saw");
  // 고정된 '뒤섞은' 위상
  const RPH = [0, 2.1, 4.4, 1.3, 5.6, 3.0, 0.7, 4.9, 2.6, 5.9];
  const phase = (i) => (ph.checked ? RPH[i] : 0);

  const { ctx, size } = fit(cv, () => draw());
  let geo = null;
  function wave(t) { let s = 0; for (let i = 0; i < N; i++) s += amp[i] * Math.sin(2 * Math.PI * (i + 1) * t + phase(i)); return s; }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    // 위: 파형
    const wx0 = 34, wx1 = w - 10, wy = h * 0.25, wa = h * 0.19;
    const M = 600; let mx = 1e-9; const ys = [];
    for (let k = 0; k <= M; k++) { const v = wave(k / M * 2); ys.push(v); mx = Math.max(mx, Math.abs(v)); }
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(wx0, wy); ctx.lineTo(wx1, wy); ctx.stroke();
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2; ctx.beginPath();
    ys.forEach((v, k) => { const x = wx0 + k / M * (wx1 - wx0), y = wy - v / mx * wa; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("파형 (두 주기, 최댓값으로 맞춤)", wx0, 14);
    ctx.textAlign = "right"; ctx.font = `10px ${F.mono}`; ctx.fillText(`${(2000 / F0).toFixed(1)} ms`, wx1, wy + wa + 16);
    // 아래: 배음 막대
    const bx0 = 34, bx1 = w - 10, by0 = h - 26, by1 = h * 0.58, bw = (bx1 - bx0) / N;
    geo = { bx0, bw, by0, by1 };
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(bx0, by0 + .5); ctx.lineTo(bx1, by0 + .5); ctx.stroke();
    ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(bx0, by1); ctx.lineTo(bx1, by1); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("배음의 진폭 (막대를 끌어 바꾸기)", bx0, by1 - 10);
    for (let i = 0; i < N; i++) {
      const x = bx0 + i * bw, y = by0 - amp[i] * (by0 - by1);
      ctx.fillStyle = i === 0 ? C.forest : C.leaf; ctx.fillRect(x + 3, y, bw - 6, by0 - y);
      ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`${i + 1}`, x + bw / 2, by0 + 13);
    }
    ctx.textAlign = "left"; ctx.fillStyle = C.ink3; ctx.fillText("n →", 4, by0 + 13);
  }
  function update() {
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === pre)));
    const on = amp.filter((a) => a > 0.02).length, sum = amp.reduce((s, a) => s + a, 0);
    const cen = sum ? amp.reduce((s, a, i) => s + a * (i + 1) * F0, 0) / sum : 0;
    $(".n-n").textContent = `${on} 개`;
    $(".n-c").textContent = sum ? `${Math.round(cen)} Hz` : "—";
    $(".n-s").textContent = on <= 1 ? "매끈한 사인 곡선" : ph.checked ? "뾰족·불규칙" : pre === "odd" ? "네모에 가까움" : pre === "saw" ? "톱니에 가까움" : "둥근 곡선";
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { setPre(b.dataset.p); update(); }));
  ph.addEventListener("change", update);
  // 막대 끌기
  let drag = false;
  function setAt(e) {
    if (!geo) return;
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const i = Math.floor((x - geo.bx0) / geo.bw); if (i < 0 || i >= N) return;
    if (y < geo.by1 - 30) return;
    amp[i] = clamp((geo.by0 - y) / (geo.by0 - geo.by1), 0, 1); pre = "";
    update();
  }
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); setAt(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) setAt(e); });
  cv.addEventListener("pointerup", () => { drag = false; });
  cv.addEventListener("pointercancel", () => { drag = false; });
  // 소리
  let ac = null;
  $(".play").addEventListener("click", () => {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    if (!ac) ac = new AC();
    if (ac.state === "suspended") ac.resume();
    if (!amp.some((a) => a > 0.001)) return;
    const re = new Float32Array(N + 1), im = new Float32Array(N + 1);
    for (let i = 0; i < N; i++) { re[i + 1] = amp[i] * Math.sin(phase(i)); im[i + 1] = amp[i] * Math.cos(phase(i)); }
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + 0.05;
    o.setPeriodicWave(ac.createPeriodicWave(re, im)); o.frequency.value = F0;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.03); g.gain.setValueAtTime(0.18, t + 1.7); g.gain.linearRampToValueAtTime(0, t + 2);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 2.05);
  });
  if (/[?&]demo\b/.test(location.search)) { setPre("odd"); }
  update();
})();
