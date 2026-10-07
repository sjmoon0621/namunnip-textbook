/* 카드: 삼분손익법으로 12율 만들기 — 율관 길이, 피타고라스 콤마, 세 음률의 음정 비교와 소리 */
(() => {
  const root = document.getElementById("card-hist-tuning");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sK = $(".k");
  // 높이 순서의 12율 (한 글자 약칭)
  const PITCH = ["황", "대", "태", "협", "고", "중", "유", "임", "이", "남", "무", "응"];
  const GEN = ["황종", "임종", "태주", "남려", "고선", "응종", "유빈", "대려", "이칙", "협종", "무역", "중려", "황종 자리"];
  // 삼분손익: ×2/3 (손일), 황종의 절반보다 짧아지면 대신 ×4/3 (익일)
  const L = [81], OP = [""];
  for (let k = 1; k <= 12; k++) {
    const a = L[k - 1] * 2 / 3;
    if (a >= 81 / 2 - 1e-9) { L.push(a); OP.push("손일"); } else { L.push(L[k - 1] * 4 / 3); OP.push("익일"); }
  }
  const cents = (len) => 1200 * Math.log2(81 / len);
  let sys = "p", ivl = "5";
  const F1 = 311.13;
  const RAT = {
    p: { 5: 3 / 2, 3: 81 / 64, 8: 2 },
    j: { 5: 3 / 2, 3: 5 / 4, 8: 2 },
    e: { 5: 2 ** (7 / 12), 3: 2 ** (4 / 12), 8: 2 },
  };
  const TARGET = { 5: [3, 2], 3: [5, 4], 8: [2, 1] };
  const RAT_TXT = { p: { 5: "3 : 2", 3: "81 : 64", 8: "2 : 1" }, j: { 5: "3 : 2", 3: "5 : 4", 8: "2 : 1" }, e: { 5: "2^(7/12) ≈ 1.4983", 3: "2^(4/12) ≈ 1.2599", 8: "2 : 1" } };

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    const k = +sK.value;
    ctx.clearRect(0, 0, w, h);
    // 왼쪽: 옥타브 원
    const cx = w * 0.235, cy = h * 0.52, R = Math.min(w * 0.17, h * 0.36);
    const ang = (c) => -Math.PI / 2 + c / 1200 * Math.PI * 2;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = 0; i < 12; i++) {
      const a = ang(i * 100);
      ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 5), cy + Math.sin(a) * (R - 5)); ctx.lineTo(cx + Math.cos(a) * (R + 5), cy + Math.sin(a) * (R + 5)); ctx.stroke();
      ctx.fillStyle = C.ink2; ctx.fillText(PITCH[i], cx + Math.cos(a) * (R + 16), cy + Math.sin(a) * (R + 16));
    }
    // 5도 쌓기 선
    ctx.strokeStyle = "rgba(59,124,42,.55)"; ctx.lineWidth = 1.3; ctx.beginPath();
    for (let i = 0; i <= k; i++) { const a = ang(cents(L[i])); const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    for (let i = 0; i <= k; i++) {
      const a = ang(cents(L[i])), last = i === k, bad = i === 12;
      ctx.fillStyle = bad ? C.apple : last ? C.forest : C.ink;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, last ? 5 : 3.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.font = `10px ${F.mono}`;
    ctx.fillStyle = C.card; ctx.fillRect(cx - 48, cy - 9, 96, k === 12 ? 32 : 18);
    ctx.fillStyle = C.ink3; ctx.fillText("한 바퀴 = 1옥타브", cx, cy);
    if (k === 12) { ctx.fillStyle = C.apple; ctx.fillText("+23.5 센트", cx, cy + 14); }
    // 오른쪽: 율관 길이 막대 (높이 순)
    const x0 = w * 0.5, x1 = w - 8, yb = h - 24, yt = 30, bw = (x1 - x0) / 12;
    const Y = (len) => yb - len / 81 * (yb - yt);
    ctx.textBaseline = "alphabetic";
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, yb + .5); ctx.lineTo(x1, yb + .5); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("율관 길이 (상대값)", x0, 14);
    for (let i = 0; i <= Math.min(k, 11); i++) {
      const slot = Math.round(cents(L[i]) / 100) % 12, x = x0 + slot * bw;
      ctx.fillStyle = i === k ? C.forest : C.sprout;
      ctx.fillRect(x + 2, Y(L[i]), bw - 4, yb - Y(L[i]));
      ctx.fillStyle = C.ink2; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`${Math.round(L[i])}`, x + bw / 2, Y(L[i]) - 4);
    }
    if (k === 12) {
      const x = x0;
      ctx.strokeStyle = C.apple; ctx.lineWidth = 2; ctx.strokeRect(x + 2, Y(L[12]), bw - 4, yb - Y(L[12])); ctx.lineWidth = 1;
      ctx.fillStyle = C.apple; ctx.font = `9.5px ${F.mono}`; ctx.textAlign = "right"; ctx.fillText(`12번째 음의 관: ${L[12].toFixed(1)} (81이 아님)`, x1, 14);
    }
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "center";
    for (let i = 0; i < 12; i++) { ctx.fillStyle = C.ink2; ctx.fillText(PITCH[i], x0 + (i + .5) * bw, yb + 15); }
  }

  function update() {
    const k = +sK.value;
    $(".k-out").textContent = k;
    $(".n-name").textContent = k ? `${GEN[k]} (${OP[k]})` : "황종 (기준)";
    $(".n-len").textContent = L[k].toFixed(2).replace(/\.00$/, "");
    const c = cents(L[k]);
    $(".n-c").textContent = k === 12 ? `${(c).toFixed(1)} 센트 어긋남` : `${c.toFixed(0)} 센트`;
    $(".n-c").className = "n-c" + (k === 12 ? " bad" : "");
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === sys)));
    root.querySelectorAll("[data-i]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.i === ivl)));
    const r = RAT[sys][ivl], [p, q] = TARGET[ivl], beat = Math.abs(p * F1 - q * F1 * r);
    $(".n-r").textContent = RAT_TXT[sys][ivl];
    $(".n-ct").textContent = (1200 * Math.log2(r)).toFixed(1);
    $(".n-b").textContent = beat < 0.05 ? "0 (맑음)" : `${beat.toFixed(1)} 번`;
    $(".n-b").className = "n-b" + (beat > 5 ? " bad" : beat < 0.05 ? " good" : "");
    draw();
  }

  // 소리 (사용자가 누를 때만)
  let ac = null, wave = null;
  function tone(f, t0, dur) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.setPeriodicWave(wave); o.frequency.value = f;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.12, t0 + 0.03); g.gain.setValueAtTime(0.12, t0 + dur - 0.3); g.gain.linearRampToValueAtTime(0, t0 + dur);
    o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function audio() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    if (!ac) {
      ac = new AC();
      const re = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]), im = new Float32Array([0, 1, 0.6, 0.45, 0.3, 0.22, 0.15, 0.1]);
      wave = ac.createPeriodicWave(re, im);
    }
    if (ac.state === "suspended") ac.resume();
    return true;
  }
  $(".play").addEventListener("click", () => { if (!audio()) return; const t = ac.currentTime + 0.05; tone(F1, t, 3); tone(F1 * RAT[sys][ivl], t, 3); });
  $(".seq").addEventListener("click", () => { if (!audio()) return; const t = ac.currentTime + 0.05; tone(F1, t, 1); tone(F1 * RAT[sys][ivl], t + 1.05, 1); });
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { sys = b.dataset.s; update(); }));
  root.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => { ivl = b.dataset.i; update(); }));
  sK.addEventListener("input", update);
  if (/[?&]demo\b/.test(location.search)) sK.value = 12;
  update();
})();
