/* 영상: 높은 산에 오르면 왜 숨이 찰까 — 헤모글로빈과 산소의 평형 (코드로 그리는 30초 숏폼) */
(() => {
  const root = document.getElementById("video-chem-altitude");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas"), phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek"), toggle = root.querySelector(".reel-toggle"), timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 30;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const RED = "#d4493a", DARK = "#7a2a3a";

  // 산소 포화도: 힐 식 근사 (P50 = 26.8 mmHg, n = 2.7)
  const S = (p) => 1 / (1 + (26.8 / p) ** 2.7);

  const SCENES = [
    [0, 5, sMountain, [[0.2, 5, "해발 0 m. 공기 속 산소의 분압은 약 [160 mmHg]입니다."]]],
    [5, 11, sEq, [[5.1, 11, "혈액 속 헤모글로빈(Hb)은 산소와 [가역적]으로 결합합니다."]]],
    [11, 17.5, sCurve, [[11.1, 14.2, "폐 속 산소 분압이 100 mmHg이면 Hb의 [97%]가 산소와 결합합니다."], [14.2, 17.5, "해발 4,000 m에서는 [50 mmHg] 안팎. 결합한 Hb가 [84%]로 줄어듭니다."]]],
    [17.5, 23.5, sShift, [[17.6, 23.5, "O₂가 줄면 평형은 [왼쪽]으로. 온몸에 실려 가는 산소가 줄어 숨이 찹니다."]]],
    [23.5, 30, sAdapt, [[23.6, 30, "몇 주 머물면 몸이 Hb를 [더 만듭니다]. 평형이 다시 오른쪽으로 갑니다."]]],
  ];

  let T = 0, playing = false, userPaused = false;
  function frame(time) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
    for (const [s, e, fn, caps] of SCENES) {
      if (time < s || time >= e) continue;
      const lt = time - s, dur = e - s;
      ctx.save(); ctx.globalAlpha = clamp(Math.min(1, lt / 0.35, (dur - lt) / 0.35), 0, 1); fn(lt, dur); ctx.restore();
      for (const [c0, c1, text] of caps) {
        if (time < c0 || time >= c1) continue;
        caption(text, clamp(Math.min((time - c0) / 0.3, (c1 - time) / 0.25), 0, 1), (time - c0) / 0.3);
      }
    }
    chrome(time);
  }
  function chrome(time) {
    const gap = 4, n = SCENES.length, sw = (W - 24 - gap * (n - 1)) / n;
    SCENES.forEach(([s, e], i) => {
      const x = 12 + i * (sw + gap);
      ctx.fillStyle = "rgba(243,244,239,.25)"; ctx.fillRect(x, 12, sw, 2.5);
      ctx.fillStyle = C.paper; ctx.fillRect(x, 12, sw * clamp((time - s) / (e - s), 0, 1), 2.5);
    });
    ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(24, 38, 7, 0, 7); ctx.fill();
    ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left"; ctx.fillText("통통사과", 38, 43);
    ctx.font = `11px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)"; ctx.fillText("· 나뭇잎", 98, 43);
  }
  function caption(text, alpha, rise) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.font = `700 21px ${SANS}`;
    const words = []; let hi = false;
    for (const part of text.split(/(\[|\])/)) {
      if (part === "[") { hi = true; continue; } if (part === "]") { hi = false; continue; }
      part.split(/(\s+)/).forEach((wd) => wd && words.push({ wd, hi }));
    }
    const maxW = W - 56, lines = [[]]; let lw = 0;
    for (const t of words) {
      const m = ctx.measureText(t.wd).width;
      if (lw + m > maxW && t.wd.trim() && lines.at(-1).length) { lines.push([]); lw = 0; }
      if (!lines.at(-1).length && !t.wd.trim()) continue;
      lines.at(-1).push({ ...t, m }); lw += m;
    }
    const lh = 31, y0 = H - 96 - (lines.length - 1) * lh + (1 - clamp(rise, 0, 1)) * 8;
    lines.forEach((ln, i) => { let x = 28; for (const t of ln) { ctx.fillStyle = t.hi ? C.sprout : C.paper; ctx.fillText(t.wd, x, y0 + i * lh); x += t.m; } });
    ctx.restore();
  }
  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left"; };

  function mountain(climb) {
    ctx.fillStyle = "#3a4038"; ctx.beginPath(); ctx.moveTo(0, 420); ctx.lineTo(200, 130); ctx.lineTo(250, 190); ctx.lineTo(360, 110); ctx.lineTo(360, 420); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(243,244,239,.85)"; ctx.beginPath(); ctx.moveTo(200, 130); ctx.lineTo(180, 160); ctx.lineTo(215, 150); ctx.lineTo(222, 158); ctx.closePath(); ctx.fill();
    const x = 30 + climb * 160, y = 410 - climb * 270;
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(x, y - 12, 5, 0, 7); ctx.fill(); ctx.fillRect(x - 3, y - 7, 6, 10);
    return { x, y };
  }
  function sMountain(lt) {
    const p = mountain(0);
    label("해발 0 m", p.x + 12, p.y - 6, C.paper);
    label("대기압 760 mmHg × 산소 21% ≈ 160 mmHg", 180, 470, "rgba(243,244,239,.5)", "center");
  }
  function sEq(lt) {
    ctx.textAlign = "center";
    ctx.font = `600 34px ${MONO}`; ctx.fillStyle = C.paper;
    ctx.fillText("Hb + O₂ ⇌ HbO₂", 180, 250);
    const a = clamp((lt - 1.2) / 0.6, 0, 1);
    ctx.save(); ctx.globalAlpha *= a;
    label("폐: O₂가 많다 → 오른쪽", 180, 310, C.sprout, "center", `15px ${SANS}`);
    label("조직: O₂가 적다 → 왼쪽, 산소를 내려놓음", 180, 340, "rgba(243,244,239,.7)", "center", `15px ${SANS}`);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= clamp((lt - 2.6) / 0.6, 0, 1);
    label("실제로 Hb 하나는 O₂ 4개와 결합합니다 (단순화한 식)", 180, 400, "rgba(243,244,239,.45)", "center");
    ctx.restore();
  }
  function curve(pNow, extra) {
    const x0 = 50, y0 = 110, pw = 270, ph = 260, X = (p) => x0 + p / 110 * pw, Y = (s) => y0 + (1 - s) * ph;
    ctx.strokeStyle = "rgba(243,244,239,.3)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + ph); ctx.lineTo(x0 + pw, y0 + ph); ctx.stroke();
    for (const s of [0, .5, 1]) label(`${s * 100}%`, x0 - 6, Y(s) + 4, "rgba(243,244,239,.5)", "right");
    for (const p of [0, 50, 100]) label(`${p}`, X(p), y0 + ph + 16, "rgba(243,244,239,.5)", "center");
    label("산소 분압 (mmHg)", x0 + pw, y0 + ph + 34, "rgba(243,244,239,.5)", "right");
    label("Hb 산소 포화도", x0, y0 - 12, "rgba(243,244,239,.5)");
    ctx.strokeStyle = RED; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let p = 1; p <= 110; p++) p === 1 ? ctx.moveTo(X(p), Y(S(p))) : ctx.lineTo(X(p), Y(S(p)));
    ctx.stroke();
    if (extra) extra(X, Y);
    const s = S(pNow);
    ctx.setLineDash([3, 4]); ctx.strokeStyle = "rgba(243,244,239,.4)";
    ctx.beginPath(); ctx.moveTo(X(pNow), y0 + ph); ctx.lineTo(X(pNow), Y(s)); ctx.lineTo(x0, Y(s)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(X(pNow), Y(s), 6, 0, 7); ctx.fill();
    label(`${Math.round(s * 100)}%`, X(pNow) + 10, Y(s) + 20, C.sprout, "left", `600 18px ${MONO}`);
  }
  function sCurve(lt) {
    const p = lt < 3.4 ? 100 : 100 - 50 * ease(clamp((lt - 3.4) / 1.6, 0, 1));
    curve(p);
    label("힐 식 근사 (P₅₀ = 26.8 mmHg)", 180, 440, "rgba(243,244,239,.4)", "center");
  }
  function bars(nHb, nHbO2, y) {
    const unit = 14;
    for (let i = 0; i < nHbO2; i++) { ctx.fillStyle = RED; ctx.fillRect(40 + (i % 20) * unit, y + Math.floor(i / 20) * unit, unit - 3, unit - 3); }
    for (let i = 0; i < nHb; i++) { const k = nHbO2 + i; ctx.fillStyle = DARK; ctx.fillRect(40 + (k % 20) * unit, y + Math.floor(k / 20) * unit, unit - 3, unit - 3); }
  }
  function sShift(lt) {
    ctx.textAlign = "center"; ctx.font = `600 30px ${MONO}`; ctx.fillStyle = C.paper;
    ctx.fillText("Hb + O₂ ⇌ HbO₂", 180, 150);
    const a = clamp((lt - 0.6) / 0.6, 0, 1);
    ctx.save(); ctx.globalAlpha *= a;
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(250, 185); ctx.lineTo(110, 185); ctx.stroke();
    ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.moveTo(100, 185); ctx.lineTo(116, 177); ctx.lineTo(116, 193); ctx.closePath(); ctx.fill();
    ctx.restore();
    const f = 0.97 - (0.97 - 0.84) * ease(clamp((lt - 1) / 1.5, 0, 1));
    const n = 100, nb = Math.round(n * f);
    bars(n - nb, nb, 240);
    label("■ HbO₂", 40, 400, RED); label("■ Hb", 120, 400, "#c07a8a");
    label(`100개 중 ${nb}개가 산소를 싣고 있음`, 180, 430, C.paper, "center", `14px ${SANS}`);
  }
  function sAdapt(lt) {
    const g = ease(clamp((lt - 0.8) / 2.2, 0, 1));
    const n = Math.round(100 + 20 * g), nb = Math.round(n * 0.84);
    bars(n - nb, nb, 200);
    label(`Hb ${n}개 · 산소를 실은 Hb ${nb}개`, 180, 400, C.paper, "center", `14px ${SANS}`);
    ctx.save(); ctx.globalAlpha *= clamp((lt - 3) / 0.6, 0, 1);
    label("[Hb]가 늘면 HbO₂도 다시 늘어납니다", 180, 430, C.sprout, "center", `14px ${SANS}`);
    label("증가 폭은 이해를 돕기 위한 예시입니다", 180, 452, "rgba(243,244,239,.4)", "center");
    ctx.restore();
  }

  const fmt = (s) => `0:${String(Math.floor(s)).padStart(2, "0")}`;
  function sync() { phone.classList.toggle("paused", !playing); toggle.textContent = playing ? "일시정지" : "재생"; seek.value = Math.round(T / D * 1000); timeEl.textContent = fmt(T); }
  let raf = 0, last = 0;
  function tick(now) { T += clamp((now - last) / 1000, 0, 0.05); last = now; if (T >= D) T = 0; frame(T); sync(); if (playing) raf = requestAnimationFrame(tick); }
  function play() { if (playing) return; playing = true; last = performance.now(); raf = requestAnimationFrame(tick); sync(); }
  function pause() { playing = false; cancelAnimationFrame(raf); sync(); }
  const flip = () => { if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); } };
  cv.addEventListener("click", flip);
  root.querySelector(".reel-play").addEventListener("click", flip);
  toggle.addEventListener("click", flip);
  seek.addEventListener("input", () => { T = seek.value / 1000 * D; frame(T); sync(); });
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !userPaused && !reduce) play(); else if (!e.isIntersecting) pause(); }, { threshold: 0.4 }).observe(cv);
  const poster = () => { if (!playing) { T = reduce ? 14.5 : T; frame(T); sync(); } };
  poster(); document.fonts && document.fonts.ready.then(poster);
})();
