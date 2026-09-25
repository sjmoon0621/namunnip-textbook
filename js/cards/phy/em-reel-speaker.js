/* 영상: 통통사과 「스피커를 분해하면」 — 코드로 그리는 32초 숏폼 */
(() => {
  const root = document.getElementById("video-phy-speaker");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans, SERIF = NM.F.serif;
  const cv = root.querySelector("canvas");
  const phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek");
  const toggle = root.querySelector(".reel-toggle");
  const timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 32;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const RED = "#e0735f", BLUE = "#6fa3d0", GOLD = "#e0a02a";

  const SCENES = [
    [0, 4.5, sceneFront, [[0.2, 4.5, "스피커 속에는 무엇이 들어 있을까요?"]]],
    [4.5, 10, sceneCut, [[4.6, 10, "[자석], [코일], 그리고 종이 [콘]. 거의 이것이 전부입니다."]]],
    [10, 17, sceneForce, [[10.1, 13.5, "자석 틈에 있는 코일에 전류가 흐르면 코일이 [힘]을 받습니다."], [13.5, 17, "전류 방향이 바뀌면 힘도 [반대]로. F = BIL"]]],
    [17, 22.5, sceneSignal, [[17.1, 22.5, "음악 신호대로 전류가 1초에 [수십~수천 번] 방향을 바꾸고, 콘이 그대로 떨립니다."]]],
    [22.5, 27, sceneAir, [[22.6, 27, "콘이 공기를 밀고 당겨 [소리]가 됩니다."]]],
    [27, 32, sceneMic, [[27.1, 32, "거꾸로 소리로 코일을 흔들면 [전류]가 생깁니다. 다이내믹 마이크의 원리, 다음 절의 [전자기 유도]입니다."]]],
  ];

  let T = 0, playing = false, userPaused = false;

  function frame(time) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
    for (const [s, e, fn, caps] of SCENES) {
      if (time < s || time >= e) continue;
      const lt = time - s, dur = e - s;
      ctx.save(); ctx.globalAlpha = clamp(Math.min(1, lt / 0.35, (dur - lt) / 0.35), 0, 1);
      fn(lt, dur);
      ctx.restore();
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
  const arrowV = (x, y0, y1, col, lw = 2.5) => {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    const d = Math.sign(y1 - y0);
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 - d * 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 6, y1 - d * 9); ctx.lineTo(x + 6, y1 - d * 9); ctx.fill();
  };
  const arrowH = (x0, x1, y, col, lw = 2.5) => {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    const d = Math.sign(x1 - x0);
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1 - d * 6, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 - d * 9, y - 6); ctx.lineTo(x1 - d * 9, y + 6); ctx.fill();
  };

  /* 1. 앞모습: 콘이 음악에 맞춰 떨린다 */
  function sceneFront(lt) {
    const cx = 180, cy = 290, off = 4 * Math.sin(lt * 30) * Math.sin(lt * 2.3);
    ctx.fillStyle = "#2a2c29"; ctx.beginPath(); ctx.arc(cx, cy, 128, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(243,244,239,.25)"; ctx.lineWidth = 1;
    for (let r = 118; r > 40; r -= 13) { ctx.beginPath(); ctx.arc(cx, cy, r + off * (r / 118), 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = "#3b3d39"; ctx.beginPath(); ctx.arc(cx, cy, 34 + off, 0, Math.PI * 2); ctx.fill();
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + Math.PI / 4;
      ctx.fillStyle = "rgba(243,244,239,.3)"; ctx.beginPath(); ctx.arc(cx + 140 * Math.cos(a), cy + 140 * Math.sin(a), 4, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* 2. 단면: 자석(고리)과 극판, 코일, 콘 */
  function section(cx, cy, s, coilOff, showLabels, t) {
    // 자석 틈의 자기장: 가운데 극(N)에서 바깥 극(S)으로, 방사형
    ctx.fillStyle = "#6b6e69";
    ctx.fillRect(cx - 70 * s, cy + 40 * s, 140 * s, 14 * s);               // 뒷판
    ctx.fillRect(cx - 12 * s, cy - 14 * s, 24 * s, 54 * s);                // 가운데 극
    ctx.fillStyle = "#8a4b3f";
    ctx.fillRect(cx - 70 * s, cy + 6 * s, 40 * s, 34 * s); ctx.fillRect(cx + 30 * s, cy + 6 * s, 40 * s, 34 * s); // 고리 자석
    ctx.fillStyle = "#6b6e69";
    ctx.fillRect(cx - 70 * s, cy - 6 * s, 48 * s, 12 * s); ctx.fillRect(cx + 22 * s, cy - 6 * s, 48 * s, 12 * s);   // 윗판
    // 코일 (틈 속)
    const cyC = cy - 6 * s + coilOff;
    ctx.fillStyle = GOLD;
    ctx.fillRect(cx - 20 * s, cyC - 12 * s, 6 * s, 24 * s); ctx.fillRect(cx + 14 * s, cyC - 12 * s, 6 * s, 24 * s);
    // 콘
    ctx.strokeStyle = "#c9c9c2"; ctx.lineWidth = 3 * Math.min(1, s);
    ctx.beginPath(); ctx.moveTo(cx - 17 * s, cyC - 12 * s); ctx.lineTo(cx - 95 * s, cyC - 70 * s + coilOff * 0);
    ctx.moveTo(cx + 17 * s, cyC - 12 * s); ctx.lineTo(cx + 95 * s, cyC - 70 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 17 * s, cyC - 12 * s); ctx.quadraticCurveTo(cx, cyC - 26 * s, cx + 17 * s, cyC - 12 * s); ctx.stroke();
    // 테두리
    ctx.strokeStyle = "rgba(243,244,239,.35)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 95 * s, cy - 76 * s); ctx.lineTo(cx - 70 * s, cy - 6 * s); ctx.moveTo(cx + 95 * s, cy - 76 * s); ctx.lineTo(cx + 70 * s, cy - 6 * s); ctx.stroke();
    if (showLabels) {
      const a = (d) => clamp((t - d) / 0.4, 0, 1);
      ctx.save(); ctx.globalAlpha *= a(0.5); label("영구 자석", cx + 74 * s, cy + 30 * s, RED, "left", `600 12px ${SANS}`); ctx.restore();
      ctx.save(); ctx.globalAlpha *= a(1.3); label("코일", cx + 26 * s, cyC + 30 * s, GOLD, "left", `600 12px ${SANS}`); ctx.restore();
      ctx.save(); ctx.globalAlpha *= a(2.1); label("콘", cx + 70 * s, cy - 78 * s, "#c9c9c2", "left", `600 12px ${SANS}`); ctx.restore();
    }
  }
  function sceneCut(lt) {
    section(180, 300, 1.35, 0, true, lt);
    label("가운데를 자른 단면", 180, 450, "rgba(243,244,239,.4)", "center");
  }

  /* 3. 확대: 틈 속 코일의 한쪽 단면. B는 바깥쪽, 전류는 ⊙/⊗, 힘은 위/아래 */
  function sceneForce(lt) {
    const flip = lt > 3.5 ? -1 : 1;
    const p = ease(clamp(((lt % 3.5) - 0.8) / 1.5, 0, 1));
    const dy = -flip * 36 * p;
    // 극
    ctx.fillStyle = "#6b6e69"; ctx.fillRect(60, 200, 60, 200);
    ctx.fillStyle = "#6b6e69"; ctx.fillRect(240, 200, 60, 200);
    label("N", 90, 305, C.paper, "center", `700 18px ${MONO}`); label("S", 270, 305, C.paper, "center", `700 18px ${MONO}`);
    for (let k = 0; k < 5; k++) arrowH(126, 232, 225 + k * 38, "rgba(111,163,208,.55)", 1.5);
    label("B", 180, 196, BLUE, "center", `italic 18px ${SERIF}`);
    // 코일 도선 단면
    const cy = 300 + dy;
    ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(180, cy, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.night; ctx.strokeStyle = C.night; ctx.lineWidth = 3;
    if (flip > 0) { ctx.beginPath(); ctx.arc(180, cy, 6, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(171, cy - 9); ctx.lineTo(189, cy + 9); ctx.moveTo(189, cy - 9); ctx.lineTo(171, cy + 9); ctx.stroke(); }
    label(flip > 0 ? "전류: 화면에서 나옴" : "전류: 화면으로 들어감", 180, 440, "rgba(243,244,239,.6)", "center");
    if (p > 0.05) arrowV(180, cy - flip * 28, cy - flip * 80, C.sprout, 3);
    label("F", 200, cy - flip * 58, C.sprout, "left", `italic 20px ${SERIF}`);
  }

  /* 4. 신호 → 전류 → 콘 */
  function sceneSignal(lt) {
    const sig = (t) => 0.6 * Math.sin(t * 9) + 0.3 * Math.sin(t * 23 + 1) + 0.15 * Math.sin(t * 47);
    ctx.strokeStyle = "rgba(243,244,239,.2)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, 170); ctx.lineTo(330, 170); ctx.stroke();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = 0; x <= 300; x += 2) { const t = lt - (300 - x) / 120; const y = 170 - 50 * sig(t); x ? ctx.lineTo(30 + x, y) : ctx.moveTo(30 + x, y); }
    ctx.stroke();
    label("코일 전류", 30, 108, GOLD);
    label("+", 18, 126, "rgba(243,244,239,.4)"); label("−", 18, 222, "rgba(243,244,239,.4)");
    ctx.beginPath(); ctx.arc(330, 170 - 50 * sig(lt), 5, 0, Math.PI * 2); ctx.fillStyle = GOLD; ctx.fill();
    section(180, 360, 0.95, -22 * sig(lt), false, 0);
    label("지금 전류 → 지금 콘의 위치", 180, 470, "rgba(243,244,239,.5)", "center");
  }

  /* 5. 공기의 소밀파 */
  function sceneAir(lt) {
    const x0 = 70, cy = 300, disp = (t) => 10 * Math.sin(t * 2 * Math.PI * 1.2);
    const cone = x0 + disp(lt);
    ctx.fillStyle = "#6b6e69"; ctx.fillRect(20, cy - 60, 30, 120);
    ctx.strokeStyle = "#c9c9c2"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(50, cy - 20); ctx.lineTo(cone, cy - 80); ctx.moveTo(50, cy + 20); ctx.lineTo(cone, cy + 80); ctx.moveTo(cone, cy - 80); ctx.lineTo(cone, cy + 80); ctx.stroke();
    // 공기 입자: 각 줄의 자리에서 앞뒤로 흔들림 (파동이 오른쪽으로 전파)
    const k = 2 * Math.PI / 90, om = 2 * Math.PI * 1.2;
    for (let i = 0; i < 26; i++) for (let j = 0; j < 9; j++) {
      const xe = cone + 16 + i * 10, ye = cy - 88 + j * 22 + (i % 2) * 11;
      const x = xe + 8 * Math.sin(om * lt - k * (xe - x0));
      const a = clamp((cone + 16 + (lt * 120) - xe) / 40, 0, 1);
      ctx.fillStyle = `rgba(111,163,208,${0.25 + 0.55 * a})`;
      ctx.beginPath(); ctx.arc(x, ye, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    label("빽빽 · 성김 · 빽빽 …", 200, 420, "rgba(243,244,239,.5)", "center");
    label("공기 입자는 제자리에서 앞뒤로만 움직입니다", 200, 440, "rgba(243,244,239,.4)", "center");
  }

  /* 6. 마이크 = 거꾸로 */
  function sceneMic(lt) {
    const sig = (t) => Math.sin(t * 7) * 0.7 + 0.3 * Math.sin(t * 17);
    section(180, 260, 0.95, -20 * sig(lt), false, 0);
    arrowV(180, 150, 190, "rgba(111,163,208,.8)", 2);
    label("소리", 196, 170, BLUE, "left", `600 13px ${SANS}`);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = 0; x <= 260; x += 2) { const t = lt - (260 - x) / 100; const y = 400 - 30 * sig(t); x ? ctx.lineTo(50 + x, y) : ctx.moveTo(50 + x, y); }
    ctx.stroke();
    label("코일에 생긴 전류", 50, 360, GOLD);
    ctx.save(); ctx.globalAlpha *= clamp((lt - 1.2) / 0.6, 0, 1);
    label("스피커 ⇄ 마이크", 180, 470, C.sprout, "center", `600 20px ${SANS}`);
    ctx.restore();
  }

  /* 재생 제어 */
  const fmt = (s) => `0:${String(Math.floor(s)).padStart(2, "0")}`;
  function sync() {
    phone.classList.toggle("paused", !playing);
    toggle.textContent = playing ? "일시정지" : "재생";
    seek.value = Math.round(T / D * 1000);
    timeEl.textContent = fmt(T);
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
  const poster = () => { if (!playing) { T = reduce ? 6 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
