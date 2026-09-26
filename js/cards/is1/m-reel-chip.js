/* 영상: 통통사과 「모래에서 반도체 칩까지」 — 코드로 그리는 32초 숏폼 */
(() => {
  const root = document.getElementById("video-is1-chip");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas"), phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek"), toggle = root.querySelector(".reel-toggle"), timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 32;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const SCENES = [
    [0, 5.5, sSand, [[0.2, 5.5, "규소는 지각 질량의 [27.7%]. 모래알 속 석영(SiO₂)에 들어 있습니다."]]],
    [5.5, 11, sFurnace, [[5.6, 11, "탄소와 함께 약 [2000 °C]로 가열해 산소를 떼어 냅니다."]]],
    [11, 16.5, sPure, [[11.1, 16.5, "반도체용 규소는 불순물이 [10억 개 중 1개] 이하가 되도록 정제합니다."]]],
    [16.5, 22, sIngot, [[16.6, 22, "[1414 °C]로 녹인 규소에서 원자가 한 방향으로 줄 선 단결정 기둥을 끌어올립니다."]]],
    [22, 27, sWafer, [[22.1, 27, "기둥을 얇게 썰면 지름 [300 mm], 두께 0.775 mm의 웨이퍼가 됩니다."]]],
    [27, 32, sChip, [[27.1, 32, "그다음 [붕소와 인]을 정확히 넣어, 손톱만 한 칩에 트랜지스터를 100억 개 넘게 만듭니다."]]],
  ];

  let T = 0, playing = false, userPaused = false;

  function frame(time) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
    for (const [s, e, fn, caps] of SCENES) {
      if (time < s || time >= e) continue;
      const lt = time - s, dur = e - s;
      ctx.save(); ctx.globalAlpha = clamp(Math.min(1, lt / 0.35, (dur - lt) / 0.35), 0, 1);
      fn(lt, dur); ctx.restore();
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
    appleIcon(24, 38, 8);
    ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left"; ctx.fillText("통통사과", 38, 43);
    ctx.font = `11px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)"; ctx.fillText("· 나뭇잎", 98, 43);
  }

  function caption(text, alpha, rise) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.font = `700 21px ${SANS}`;
    const words = []; let hi = false;
    for (const part of text.split(/(\[|\])/)) {
      if (part === "[") { hi = true; continue; }
      if (part === "]") { hi = false; continue; }
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

  function appleIcon(x, y, r) {
    ctx.fillStyle = "#d4493a";
    ctx.beginPath(); ctx.arc(x - r * .38, y + r * .1, r * .8, 0, Math.PI * 2); ctx.arc(x + r * .38, y + r * .1, r * .8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#5a3a22"; ctx.lineWidth = Math.max(1, r * .16);
    ctx.beginPath(); ctx.moveTo(x, y - r * .45); ctx.lineTo(x + r * .1, y - r * 1.05); ctx.stroke();
    ctx.fillStyle = C.leaf; ctx.beginPath(); ctx.ellipse(x + r * .5, y - r * .9, r * .45, r * .2, -0.5, 0, Math.PI * 2); ctx.fill();
  }
  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left";
  };
  const star = (x, y, r, col, glow = 2.6) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * glow);
    g.addColorStop(0, col); g.addColorStop(0.35, col); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * glow, 0, Math.PI * 2); ctx.fill();
  };
  const tag = (sym, x, y, col) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2); ctx.fill();
    label(sym, x, y + 5, C.night, "center", `700 15px ${MONO}`);
  };

  /* 1. 모래 */
  function sSand(lt) {
    let sd = 5; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 160; i++) {
      const x = r() * W, y = 330 + r() * 120 - Math.sin(r() * 3) * 20;
      ctx.fillStyle = `rgba(${200 + r() * 40},${170 + r() * 40},${110 + r() * 30},.85)`;
      ctx.beginPath(); ctx.arc(x, y, 3 + r() * 4, 0, Math.PI * 2); ctx.fill();
    }
    const z = NM.ease(clamp((lt - 1.2) / 1.5, 0, 1));
    if (z > 0) {
      ctx.save(); ctx.globalAlpha *= z;
      ctx.strokeStyle = C.paper; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(180, 220, 80, 0, Math.PI * 2); ctx.stroke();
      // 규소-산소 그물 (모식)
      for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
        const x = 180 + i * 30 + (j % 2) * 15, y = 220 + j * 26;
        if ((x - 180) ** 2 + (y - 220) ** 2 > 70 * 70) continue;
        ctx.fillStyle = "#e8a79c"; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(x + 15, y + 9, 4, 0, Math.PI * 2); ctx.fill();
      }
      label("O", 110, 150, "#e8a79c", "left", `600 13px ${MONO}`); label("Si", 250, 150, C.paper, "left", `600 13px ${MONO}`);
      ctx.restore();
    }
  }
  /* 2. 환원 */
  function sFurnace(lt) {
    ctx.fillStyle = "#3a302a"; ctx.fillRect(110, 170, 140, 200);
    const g = ctx.createRadialGradient(180, 330, 5, 180, 330, 90);
    g.addColorStop(0, "rgba(255,210,120,.95)"); g.addColorStop(1, "rgba(224,110,42,0)");
    ctx.fillStyle = g; ctx.fillRect(110, 230, 140, 140);
    for (let i = 0; i < 6; i++) { // 빠져나가는 CO
      const y = 170 - ((lt * 40 + i * 30) % 120);
      label("CO", 140 + (i % 3) * 30, y, "rgba(243,244,239,.55)", "center");
    }
    label("SiO₂ + 2C → Si + 2CO", 180, 420, C.paper, "center", `500 17px ${MONO}`);
    label("이 단계의 순도 약 98~99%", 180, 446, "rgba(243,244,239,.5)", "center");
  }
  /* 3. 정제: 점 1000개 중 불순물 */
  function sPure(lt) {
    const p = clamp((lt - 1) / 3, 0, 1);
    for (let i = 0; i < 400; i++) {
      const x = 60 + (i % 20) * 12, y = 150 + Math.floor(i / 20) * 12;
      const bad = i % 37 === 5 && (i / 400) > p;
      ctx.fillStyle = bad ? C.apple : "rgba(243,244,239,.55)";
      ctx.beginPath(); ctx.arc(x, y, bad ? 3.2 : 2.2, 0, Math.PI * 2); ctx.fill();
    }
    label(p < 1 ? "불순물을 걸러 내는 중" : "99.9999999% 이상", 180, 420, p < 1 ? "rgba(243,244,239,.6)" : C.sprout, "center", `600 16px ${MONO}`);
  }
  /* 4. 단결정 끌어올리기 */
  function sIngot(lt) {
    const up = clamp(lt / 5, 0, 1);
    ctx.fillStyle = "rgba(224,110,42,.8)"; ctx.beginPath(); ctx.ellipse(180, 400, 90, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(243,244,239,.4)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(90, 400); ctx.lineTo(90, 440); ctx.lineTo(270, 440); ctx.lineTo(270, 400); ctx.stroke();
    const topY = 110, len = 60 + up * 220;
    ctx.fillStyle = "#8f9aa3"; ctx.fillRect(160, 400 - len, 40, len);
    ctx.fillStyle = "rgba(255,255,255,.15)"; ctx.fillRect(166, 400 - len, 8, len);
    ctx.strokeStyle = "rgba(243,244,239,.6)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(180, topY); ctx.lineTo(180, 400 - len); ctx.stroke();
    label("↻ 천천히 돌리며 위로", 210, 140, "rgba(243,244,239,.6)");
    label("녹은 규소 1414 °C", 180, 470, "rgba(243,244,239,.6)", "center");
  }
  /* 5. 웨이퍼 */
  function sWafer(lt) {
    const p = NM.ease(clamp(lt / 2, 0, 1));
    ctx.fillStyle = "#8f9aa3"; ctx.fillRect(40, 180, 80, 180);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = "rgba(243,244,239,.5)"; ctx.fillRect(40, 190 + i * 34, 80, 1); }
    const cx = 120 + p * 120;
    const g = ctx.createLinearGradient(cx - 70, 200, cx + 70, 340);
    g.addColorStop(0, "#b8c4d6"); g.addColorStop(.5, "#7f8fa8"); g.addColorStop(1, "#c9b8d6");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, 270, 70, 0, Math.PI * 2); ctx.fill();
    label("300 mm", cx, 370, C.paper, "center", `600 14px ${MONO}`);
  }
  /* 6. 칩 */
  function sChip(lt) {
    const g = ctx.createLinearGradient(80, 150, 280, 350);
    g.addColorStop(0, "#b8c4d6"); g.addColorStop(1, "#8f7fa8");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(180, 250, 110, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(180, 250, 110, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = "rgba(28,30,27,.35)"; ctx.lineWidth = 1;
    for (let x = 70; x < 300; x += 22) { ctx.beginPath(); ctx.moveTo(x, 130); ctx.lineTo(x, 370); ctx.stroke(); }
    for (let y = 140; y < 370; y += 22) { ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(300, y); ctx.stroke(); }
    ctx.restore();
    if (lt > 1.2) {
      const z = NM.ease(clamp((lt - 1.2) / 1, 0, 1));
      ctx.fillStyle = "rgba(28,30,27,.9)"; ctx.fillRect(180 - 60 * z, 400 - 60 * z, 120 * z, 120 * z);
      ctx.fillStyle = C.sprout;
      for (let i = 0; i < 6; i++) ctx.fillRect(180 - 50 * z + i * 18 * z, 400 - 50 * z, 10 * z, 100 * z);
      label("p형 · n형", 180, 490, C.sprout, "center");
    }
  }

  /* 재생 제어 */
  const fmt = (s) => `0:${String(Math.floor(s)).padStart(2, "0")}`;
  function sync() {
    phone.classList.toggle("paused", !playing);
    toggle.textContent = playing ? "일시정지" : "재생";
    seek.value = Math.round(T / D * 1000); timeEl.textContent = fmt(T);
  }
  let raf = 0, last = 0;
  function tick(now) {
    T += clamp((now - last) / 1000, 0, 0.05); last = now;
    if (T >= D) T = 0;
    frame(T); sync();
    if (playing) raf = requestAnimationFrame(tick);
  }
  function play() { if (playing) return; playing = true; last = performance.now(); raf = requestAnimationFrame(tick); sync(); }
  function pause() { playing = false; cancelAnimationFrame(raf); sync(); }
  const flip = () => { if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); } };
  cv.addEventListener("click", flip);
  root.querySelector(".reel-play").addEventListener("click", flip);
  toggle.addEventListener("click", flip);
  seek.addEventListener("input", () => { T = seek.value / 1000 * D; frame(T); sync(); });
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !userPaused && !reduce) play(); else if (!e.isIntersecting) pause();
  }, { threshold: 0.4 }).observe(cv);
  const poster = () => { if (!playing) { T = reduce ? 3 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
