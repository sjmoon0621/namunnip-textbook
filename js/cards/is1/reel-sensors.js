/* 영상: 통통사과 「스마트폰 속 센서들」 — 코드로 그리는 32초 숏폼 (센서 구조는 모식) */
(() => {
  const root = document.getElementById("video-is1-sensors");
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

  const SCENES = [
    [0, 5, scenePhone, [[0.2, 5, "휴대 전화 한 대에는 [센서]가 여럿 들어 있습니다."]]],
    [5, 11, sceneAccel, [[5.1, 8, "가속도 센서: 기울이면 작은 추가 밀려 [전극 사이 거리]가 바뀝니다."], [8, 11, "가만히 둬도 약 [9.8 m/s²]를 읽습니다. 중력 때문입니다."]]],
    [11, 16.5, sceneLight, [[11.1, 13.8, "빛 센서: 빛이 들어오면 [전자]가 움직여 전류가 흐릅니다."], [13.8, 16.5, "카메라는 이런 칸이 [수천만 개] 모인 것입니다."]]],
    [16.5, 22, sceneMic, [[16.6, 22, "마이크: 공기의 [압력 변화]가 얇은 막을 떨게 하고, 전압이 따라 떨립니다."]]],
    [22, 27, sceneBaro, [[22.1, 27, "기압 센서: 한 층(약 3 m)만 올라가도 기압이 약 [0.36 hPa] 낮아집니다."]]],
    [27, 32, sceneDigital, [[27.1, 32, "재는 것은 달라도 끝은 같습니다. 전기 신호가 [숫자]로 바뀝니다."]]],
  ];

  let T = 0, playing = false, userPaused = false;

  function frame(time) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
    for (const [s, e, fn, caps] of SCENES) {
      if (time < s || time >= e) continue;
      const lt = time - s, dur = e - s;
      const a = Math.min(1, lt / 0.35, (dur - lt) / 0.35);
      ctx.save(); ctx.globalAlpha = clamp(a, 0, 1); fn(lt, dur); ctx.restore();
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
    ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left";
    ctx.fillText("통통사과", 38, 43);
    ctx.font = `11px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)";
    ctx.fillText("· 나뭇잎", 98, 43);
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
    ctx.fillStyle = C.leaf;
    ctx.beginPath(); ctx.ellipse(x + r * .5, y - r * .9, r * .45, r * .2, -0.5, 0, Math.PI * 2); ctx.fill();
  }
  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left";
  };
  const fade = (lt, d0, d = 0.5) => clamp((lt - d0) / d, 0, 1);

  /* 1. 전화와 센서 위치 (모식) */
  function scenePhone(lt) {
    const x = 110, y = 100, w = 140, h = 280;
    ctx.strokeStyle = C.paper; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.stroke();
    const parts = [["가속도·자이로", 180, 250], ["빛·근접", 150, 122], ["카메라", 220, 122], ["마이크", 180, 366], ["기압", 140, 300], ["GPS 수신기", 200, 200]];
    parts.forEach(([name, px, py], i) => {
      const a = fade(lt, 0.4 + i * 0.35, 0.3);
      ctx.save(); ctx.globalAlpha *= a;
      ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      const lx = px > 180 ? 268 : 92;
      ctx.strokeStyle = "rgba(181,215,172,.5)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lx, py); ctx.stroke();
      label(name, px > 180 ? lx + 4 : lx - 4, py + 4, C.paper, px > 180 ? "left" : "right", `12px ${SANS}`);
      ctx.restore();
    });
    label("위치는 모식", 180, 410, "rgba(243,244,239,.4)", "center");
  }

  /* 2. 가속도 센서: 용수철에 매달린 추와 빗 모양 전극 */
  function sceneAccel(lt) {
    const tilt = lt < 3 ? Math.sin(lt * 2.2) * 0.8 : 0;
    const off = tilt * 26, cx = 180, cy = 250;
    ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.lineWidth = 2;
    ctx.strokeRect(70, 160, 220, 180);
    // 용수철
    const spring = (x0, x1) => { ctx.beginPath(); ctx.moveTo(x0, cy); for (let i = 1; i <= 8; i++) ctx.lineTo(x0 + (x1 - x0) * i / 8, cy + (i % 2 ? -7 : 7)); ctx.lineTo(x1, cy); ctx.stroke(); };
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 1.5;
    spring(70, cx - 40 + off); spring(cx + 40 + off, 290);
    ctx.fillStyle = "#b9bcc0"; ctx.fillRect(cx - 40 + off, cy - 30, 80, 60);
    // 전극 (고정 / 움직임)
    for (let i = 0; i < 3; i++) {
      const xx = cx - 30 + i * 30 + off;
      ctx.fillStyle = "#b9bcc0"; ctx.fillRect(xx - 2, cy - 70, 4, 40);
      ctx.fillStyle = C.amber; ctx.fillRect(cx - 42 + i * 30, 170, 4, 50);
    }
    label("움직이는 추", cx + off, cy + 5, C.night, "center", `600 12px ${SANS}`);
    label("고정 전극", 180, 158, C.amber, "center");
    label(`전기 용량 변화 → 전압`, 180, 372, C.sprout, "center", `500 13px ${MONO}`);
    if (lt > 3) {
      ctx.save(); ctx.globalAlpha *= fade(lt, 3);
      label("a = 9.8 m/s² (위쪽)", 180, 405, C.paper, "center", `500 16px ${MONO}`);
      ctx.restore();
    }
    label("실제 크기는 0.1 mm 정도 (모식)", 180, 128, "rgba(243,244,239,.4)", "center");
  }

  /* 3. 빛 센서 */
  function sceneLight(lt) {
    const n = 5, x0 = 70, gw = 220 / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const on = ((i * 7 + j * 3 + Math.floor(lt * 3)) % 5) / 5;
      ctx.fillStyle = `rgba(181,215,172,${0.15 + on * 0.6})`;
      ctx.fillRect(x0 + i * gw + 2, 180 + j * gw + 2, gw - 4, gw - 4);
    }
    // 들어오는 빛
    ctx.strokeStyle = "#f5d67a"; ctx.lineWidth = 2;
    for (let k = 0; k < 4; k++) {
      const x = 90 + k * 55, p = (lt * 1.4 + k * 0.3) % 1;
      ctx.beginPath(); ctx.moveTo(x - 30 + p * 30, 110 + p * 60); ctx.lineTo(x - 20 + p * 30, 130 + p * 60); ctx.stroke();
    }
    label("한 칸 = 빛을 전하로 바꾸는 광다이오드", 180, 430, "rgba(243,244,239,.6)", "center");
    label("밝을수록 전하가 많이 모임", 180, 450, "rgba(243,244,239,.6)", "center");
  }

  /* 4. 마이크 */
  function sceneMic(lt) {
    const y = 230;
    // 음파
    for (let k = 0; k < 5; k++) {
      const r = ((lt * 60 + k * 30) % 150);
      ctx.strokeStyle = `rgba(243,244,239,${0.4 * (1 - r / 150)})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(40, y, r + 10, -0.6, 0.6); ctx.stroke();
    }
    const d = Math.sin(lt * 12) * 8;
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(200, y - 60); ctx.quadraticCurveTo(200 + d, y, 200, y + 60); ctx.stroke();
    ctx.fillStyle = C.amber; ctx.fillRect(228, y - 60, 5, 120);
    label("떨리는 막", 200, y - 72, C.sprout, "center");
    label("고정판", 232, y + 82, C.amber, "center");
    // 전압 파형
    ctx.strokeStyle = C.paper; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const x = 60 + i * 1.2, v = Math.sin((i / 200) * 6 * Math.PI * 2 - lt * 12) * 18; i ? ctx.lineTo(x, 380 + v) : ctx.moveTo(x, 380 + v); }
    ctx.stroke();
    label("전압", 60, 350, "rgba(243,244,239,.6)");
  }

  /* 5. 기압 센서 */
  function sceneBaro(lt) {
    const floors = 5, fh = 50, x = 100, base = 420;
    for (let i = 0; i < floors; i++) {
      ctx.strokeStyle = "rgba(243,244,239,.35)"; ctx.lineWidth = 1;
      ctx.strokeRect(x, base - (i + 1) * fh, 90, fh);
      label(`${i + 1}층`, x + 45, base - i * fh - 20, "rgba(243,244,239,.5)", "center");
    }
    const f = Math.min(floors - 1, Math.floor(lt / 1.0));
    const py = base - f * fh - 25;
    ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.roundRect(x + 30, py - 12, 30, 22, 4); ctx.fill();
    const p = 1013.25 - 0.12 * 3 * f;
    label(`${p.toFixed(2)} hPa`, 215, py + 4, C.paper, "left", `500 15px ${MONO}`);
    label("해수면 근처, 모식", 180, 150, "rgba(243,244,239,.4)", "center");
  }

  /* 6. 모두 숫자로 */
  function sceneDigital(lt) {
    const rows = ["가속도", "빛", "소리", "기압"];
    rows.forEach((r, i) => {
      const y = 170 + i * 58, a = fade(lt, i * 0.4, 0.4);
      ctx.save(); ctx.globalAlpha *= a;
      label(r, 40, y + 5, C.paper, "left", `600 13px ${SANS}`);
      ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let k = 0; k <= 40; k++) { const x = 100 + k * 2, v = Math.sin(k * 0.3 + i + lt * 3) * 9; k ? ctx.lineTo(x, y + v) : ctx.moveTo(x, y + v); }
      ctx.stroke();
      label("→ ADC →", 230, y + 4, C.sprout, "center");
      const val = Math.round((Math.sin(i * 1.7 + lt * 3) * 0.5 + 0.5) * 255);
      const bitsTxt = val.toString(2).padStart(8, "0");
      label(bitsTxt, 320, y + 5, C.amber, "right", `500 13px ${MONO}`);
      ctx.restore();
    });
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
  const poster = () => { if (!playing) { T = reduce ? 3 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
