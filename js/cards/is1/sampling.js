/* 카드 1.4.1: 소리는 어떻게 숫자가 될까? — 표본화, 양자화, 에일리어싱 */
(() => {
  const root = document.getElementById("card-is1-sampling");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sF = $(".f"), sFs = $(".fs"), sB = $(".b"), oF = $(".fO"), oFs = $(".fsO"), oB = $(".bO");
  const dLv = $(".lv"), dNy = $(".ny"), dRate = $(".rate"), dHeard = $(".heard");
  const AMP = 0.9;
  const PRE = {
    cd: { f: 440, fs: 44.1, b: 16 },
    tel: { f: 440, fs: 8, b: 8 },
    low: { f: 440, fs: 8, b: 3 },
    alias: { f: 3600, fs: 4, b: 8 },
  };

  let fExact = null; // 프리셋의 정확한 진동수 (막대 눈금 반올림 방지)
  const get = () => ({ f: fExact ?? Math.round(10 ** +sF.value), fs: +sFs.value * 1000, b: +sB.value });
  const quant = (x, b) => { const L = 2 ** b; const i = Math.round((x + 1) / 2 * (L - 1)); return i / (L - 1) * 2 - 1; };
  const alias = (f, fs) => Math.abs(f - fs * Math.round(f / fs));

  const { ctx, size } = fit(cv, () => draw());

  function update() {
    const p = get();
    oF.textContent = p.f.toLocaleString("ko-KR"); oFs.textContent = (p.fs / 1000).toFixed(1); oB.textContent = p.b;
    dLv.textContent = (2 ** p.b).toLocaleString("ko-KR");
    dNy.textContent = `${(p.fs / 2000).toFixed(p.fs % 2000 ? 2 : 0)} kHz`;
    const kbps = p.fs * p.b / 1000;
    dRate.textContent = kbps >= 1000 ? `${(kbps / 1000).toFixed(2)} Mbit` : `${kbps.toFixed(0)} kbit`;
    const fa = alias(p.f, p.fs), bad = p.f >= p.fs / 2;
    dHeard.textContent = `${Math.round(bad ? fa : p.f).toLocaleString("ko-KR")} Hz`;
    dHeard.className = "heard " + (bad ? "bad" : "");
    draw();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const p = get();
    const padL = 30, padR = 10, padT = 22, padB = 30, pw = w - padL - padR, ph = h - padT - padB;
    const al = p.f >= p.fs / 2, fa0 = alias(p.f, p.fs);
    const T = al ? Math.min(fa0 > 0 ? 1.2 / fa0 : Infinity, 40 / p.f) : 3 / p.f; // 보통은 세 주기, 에일리어싱이면 가짜 소리 한 주기 남짓
    const X = (t) => padL + t / T * pw, Y = (v) => padT + (1 - (v + 1) / 2) * ph;
    // 양자화 층
    const L = 2 ** p.b;
    if (L <= 64) {
      ctx.strokeStyle = "rgba(35,35,38,.08)"; ctx.lineWidth = 1;
      for (let i = 0; i < L; i++) { const y = Math.round(Y(i / (L - 1) * 2 - 1)) + .5; ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke(); }
    }
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, Y(0) + .5); ctx.lineTo(padL + pw, Y(0) + .5); ctx.stroke();
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("+1", padL - 4, Y(1) + 4); ctx.fillText("0", padL - 4, Y(0) + 4); ctx.fillText("−1", padL - 4, Y(-1) + 4);
    ctx.textAlign = "right";
    ctx.fillText(`시간 (${(T * 1000).toFixed(2)} ms 구간)`, padL + pw, h - 8);
    ctx.textAlign = "left"; ctx.fillText("마이크 전압 (상대값)", padL, 12);

    // 원래 소리
    const sig = (t) => AMP * Math.sin(2 * Math.PI * p.f * t + 0.3);
    ctx.strokeStyle = "rgba(35,35,38,.35)"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 600; i++) { const t = T * i / 600; i ? ctx.lineTo(X(t), Y(sig(t))) : ctx.moveTo(X(t), Y(sig(t))); }
    ctx.stroke();

    // 표본과 계단
    const dt = 1 / p.fs, n = Math.floor(T / dt);
    const pts = [];
    for (let k = 0; k <= n; k++) { const t = k * dt; pts.push([t, quant(sig(t), p.b)]); }
    ctx.strokeStyle = C.forest; ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach(([t, v], k) => {
      const x = X(t), xn = X(Math.min(T, t + dt));
      if (!k) ctx.moveTo(x, Y(v)); else ctx.lineTo(x, Y(v));
      ctx.lineTo(xn, Y(v));
    });
    ctx.stroke();
    const dense = n > 90;
    if (!dense) pts.forEach(([t, v]) => { ctx.beginPath(); ctx.arc(X(t), Y(v), 3.2, 0, Math.PI * 2); ctx.fillStyle = C.forest; ctx.fill(); });

    // 에일리어싱: 표본을 지나는 낮은 진동수의 사인
    if (p.f >= p.fs / 2) {
      const fa = alias(p.f, p.fs);
      const sgn = Math.sign(p.f - p.fs * Math.round(p.f / p.fs)) || 1;
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.beginPath();
      for (let i = 0; i <= 400; i++) { const t = T * i / 400, v = AMP * Math.sin(sgn * 2 * Math.PI * fa * t + 0.3); i ? ctx.lineTo(X(t), Y(v)) : ctx.moveTo(X(t), Y(v)); }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText(`표본이 그리는 소리: ${Math.round(fa)} Hz`, padL + pw, 12);
    } else {
      ctx.fillStyle = C.forest; ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText(`한 주기에 약 ${(p.fs / p.f).toFixed(1)}번 뽑음`, padL + pw, 12);
    }
  }

  root.querySelectorAll("[data-pre]").forEach((b) => b.addEventListener("click", () => {
    const q = PRE[b.dataset.pre];
    sF.value = Math.log10(q.f); sFs.value = q.fs; sB.value = q.b; fExact = q.f;
    root.querySelectorAll("[data-pre]").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  [sF, sFs, sB].forEach((el) => el.addEventListener("input", () => {
    if (el === sF) fExact = null;
    root.querySelectorAll("[data-pre]").forEach((x) => x.setAttribute("aria-pressed", "false"));
    update();
  }));
  fExact = 440;
  update();
})();
