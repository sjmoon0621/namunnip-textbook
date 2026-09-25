/* 영상: 대서양은 손톱이 자라는 속도로 넓어진다 — 코드로 그리는 34초 숏폼 */
(() => {
  const root = document.getElementById("video-is1-atlantic");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas");
  const phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek");
  const toggle = root.querySelector(".reel-toggle");
  const timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 34;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const SCENES = [
    [0, 5.5, sceneNail, [[0.2, 5.5, "손톱은 1년에 [3~4 cm]쯤 자랍니다."]]],
    [5.5, 11.5, sceneRidge, [[5.6, 11.5, "대서양 한가운데 해령에서는 바다가 1년에 [2~4 cm]씩 넓어집니다."]]],
    [11.5, 17.5, sceneMul, [[11.6, 17.5, "느려 보여도 시간을 곱하면 [4,500 km]가 됩니다."]]],
    [17.5, 23.5, sceneOpen, [[17.6, 23.5, "대서양은 약 [1억 8천만 년] 전부터 이렇게 열렸습니다."]]],
    [23.5, 29, sceneAge, [[23.6, 29, "해령에서 멀수록 바다 밑 암석은 [더 오래]되었습니다."]]],
    [29, 34, sceneYoung, [[29.1, 34, "대륙에는 40억 년 된 암석도 있지만, 바다 밑 지각은 거의 모두 [2억 년]보다 젊습니다."]]],
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
    ctx.fillStyle = C.leaf; ctx.beginPath(); ctx.arc(24, 38, 7, 0, Math.PI * 2); ctx.fill();
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
  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left";
  };

  /* 1. 손톱 */
  function sceneNail(lt) {
    const g = ease(clamp((lt - 0.6) / 3.5, 0, 1)), px = 60 / 3.5; // 1 cm = 17 px 정도
    ctx.fillStyle = "#d9b49a"; ctx.beginPath(); ctx.roundRect(110, 170, 140, 330, 60); ctx.fill();
    const nailTop = 230 - g * 3.5 * px;
    ctx.fillStyle = "#f1dccd"; ctx.beginPath(); ctx.roundRect(135, 230, 90, 120, [40, 40, 12, 12]); ctx.fill();
    ctx.fillStyle = "#f7efe6"; ctx.beginPath(); ctx.roundRect(135, nailTop, 90, 230 - nailTop + 20, [40, 40, 0, 0]); ctx.fill();
    // 자
    ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(262, 230); ctx.lineTo(262, 230 - 4 * px); ctx.stroke();
    for (let c = 0; c <= 4; c++) { ctx.beginPath(); ctx.moveTo(262, 230 - c * px); ctx.lineTo(270, 230 - c * px); ctx.stroke(); label(`${c} cm`, 274, 234 - c * px); }
    label(`${Math.round(g * 12)}개월`, 40, 140, C.paper, "left", `500 16px ${MONO}`);
    label("한 달에 약 3 mm", 40, 162, "rgba(243,244,239,.45)");
  }
  /* 2. 해령 단면 */
  function sceneRidge(lt) {
    const y = 300, sp = clamp(lt / 5, 0, 1) * 40;
    ctx.fillStyle = "#2c4a66"; ctx.fillRect(0, y - 80, W, 80);
    ctx.fillStyle = "#8fa3b3"; ctx.fillRect(0, y, 180 - 4 - sp, 60); ctx.fillRect(184 + sp, y, 180, 60);
    // 새로 생긴 지각
    ctx.fillStyle = "#c86b4f"; ctx.fillRect(176 - sp, y, 8 + 2 * sp, 60);
    ctx.fillStyle = "rgba(212,73,58,.4)"; ctx.beginPath(); ctx.ellipse(180, y + 100, 30, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.paper; ctx.fillStyle = C.paper; ctx.lineWidth = 2;
    for (const d of [-1, 1]) {
      const x = 180 + d * 90; ctx.beginPath(); ctx.moveTo(x - d * 20, y + 30); ctx.lineTo(x + d * 20, y + 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + d * 26, y + 30); ctx.lineTo(x + d * 17, y + 25); ctx.lineTo(x + d * 17, y + 35); ctx.fill();
    }
    label("해령", 180, y - 90, C.sprout, "center", `600 13px ${SANS}`);
    label("새로 생긴 해양 지각", 180, y + 160, "rgba(243,244,239,.55)", "center");
    label("바닷물", 30, y - 60);
  }
  /* 3. 곱셈 */
  function sceneMul(lt) {
    const p = (d) => clamp((lt - d) / 0.5, 0, 1);
    ctx.textAlign = "center";
    ctx.font = `500 30px ${MONO}`; ctx.fillStyle = C.paper; ctx.fillText("2.5 cm / 년", 180, 180);
    ctx.save(); ctx.globalAlpha *= p(0.6); ctx.fillText("× 1억 8천만 년", 180, 240); ctx.restore();
    ctx.save(); ctx.globalAlpha *= p(1.4); ctx.fillStyle = "rgba(243,244,239,.5)"; ctx.fillRect(70, 268, 220, 2); ctx.restore();
    ctx.save(); ctx.globalAlpha *= p(2.0); ctx.font = `600 46px ${MONO}`; ctx.fillStyle = C.sprout; ctx.fillText("4,500 km", 180, 330); ctx.restore();
    ctx.save(); ctx.globalAlpha *= p(2.8); label("= 450,000,000 cm", 180, 362, "rgba(243,244,239,.5)", "center"); label("서울–부산 직선거리의 약 14배", 180, 384, "rgba(243,244,239,.5)", "center"); ctx.restore();
    ctx.textAlign = "left";
  }
  /* 4. 대서양이 열림 (모식) */
  function sceneOpen(lt) {
    const g = ease(clamp((lt - 0.4) / 4.2, 0, 1)), gap = 6 + g * 120;
    const am = (dx) => { // 아메리카 (모식)
      ctx.fillStyle = "#6f9a5e"; ctx.beginPath();
      ctx.moveTo(150 + dx, 130); ctx.bezierCurveTo(110 + dx, 170, 150 + dx, 230, 140 + dx, 260);
      ctx.bezierCurveTo(130 + dx, 290, 175 + dx, 300, 170 + dx, 340); ctx.bezierCurveTo(165 + dx, 400, 130 + dx, 440, 120 + dx, 480);
      ctx.lineTo(60 + dx, 470); ctx.lineTo(40 + dx, 150); ctx.closePath(); ctx.fill();
    };
    const af = (dx) => { // 유럽·아프리카 (모식)
      ctx.fillStyle = "#b89a6a"; ctx.beginPath();
      ctx.moveTo(160 + dx, 130); ctx.bezierCurveTo(200 + dx, 170, 160 + dx, 230, 172 + dx, 270);
      ctx.bezierCurveTo(182 + dx, 300, 178 + dx, 330, 174 + dx, 350); ctx.bezierCurveTo(190 + dx, 400, 210 + dx, 430, 230 + dx, 470);
      ctx.lineTo(310 + dx, 440); ctx.lineTo(320 + dx, 140); ctx.closePath(); ctx.fill();
    };
    ctx.fillStyle = "#2c4a66"; ctx.fillRect(0, 110, W, 390);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 110, W, 390); ctx.clip();
    am(-gap / 2); af(gap / 2);
    ctx.strokeStyle = "rgba(212,73,58,.8)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(165, 120); ctx.bezierCurveTo(150, 240, 185, 330, 190, 490); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    const yr = (1 - g) * 1.8;
    label(yr < 0.05 ? "지금" : `약 ${yr.toFixed(1)}억 년 전`, 24, 100, C.paper, "left", `500 15px ${MONO}`);
    label("모식 · 대륙 모양과 위치는 단순화", 336, 100, "rgba(243,244,239,.45)", "right");
  }
  /* 5. 해저 암석의 나이 */
  function sceneAge(lt) {
    const g = clamp(lt / 1.5, 0, 1), cols = ["#d4493a", "#e0a02a", "#e8d36a", "#74ab66", "#4f7fa8", "#6a5a9a"];
    for (let i = 5; i >= 0; i--) {
      const hw = (i + 1) * 26 * g;
      ctx.fillStyle = cols[i]; ctx.fillRect(180 - hw, 150, hw * 2, 250);
    }
    ctx.strokeStyle = C.paper; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(180, 140); ctx.lineTo(180, 410); ctx.stroke(); ctx.setLineDash([]);
    label("해령", 180, 132, C.paper, "center", `600 12px ${SANS}`);
    if (lt > 1.6) {
      label("젊음", 180, 424, "rgba(243,244,239,.6)", "center"); label("오래됨", 336, 424, "rgba(243,244,239,.6)", "right"); label("오래됨", 24, 424, "rgba(243,244,239,.6)");
      label("색: 해저 암석의 나이 (모식)", 180, 448, "rgba(243,244,239,.45)", "center");
    }
  }
  /* 6. 대륙과 해양 */
  function sceneYoung(lt) {
    const p = clamp((lt - 0.3) / 0.8, 0, 1);
    const bar = (y, len, col, t1, t2) => {
      ctx.fillStyle = col; ctx.fillRect(40, y, len * p, 26);
      label(t1, 40, y - 8, C.paper, "left", `600 13px ${SANS}`); label(t2, 40 + len * p + 8, y + 18, "rgba(243,244,239,.7)");
    };
    bar(200, 210, "#b89a6a", "대륙의 가장 오래된 암석", "약 40억 년");
    bar(300, 210 * 0.2 / 4.0, "#4f7fa8", "해양 지각의 나이", "대부분 2억 년 미만");
    if (lt > 1.6) label("바다 밑은 해령에서 생기고 해구에서 사라지며 늘 새로 바뀝니다.", 180, 400, "rgba(243,244,239,.55)", "center", `12px ${SANS}`);
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
  const poster = () => { if (!playing) { T = reduce ? 13.5 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
