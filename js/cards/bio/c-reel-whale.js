/* 영상: 고래는 어떻게 바다로 돌아갔을까 — 화석으로 보는 고래의 진화 (코드로 그리는 숏폼, 생김새는 모식) */
(() => {
  const root = document.getElementById("video-bio-whale");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
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
    [0, 5, sceneNow, [[0.2, 5, "고래는 폐로 숨 쉬고 새끼에게 [젖]을 먹입니다. 물고기가 아니라 포유류입니다."]]],
    [5, 10.5, scenePaki, [[5.1, 10.5, "약 5,000만 년 전 [파키케투스]. 네 다리로 걸었지만 귀뼈 모양이 고래와 같습니다."]]],
    [10.5, 15.5, sceneAmbu, [[10.6, 15.5, "약 4,900만 년 전 [암불로케투스]. 물가에서 걷기도, 헤엄치기도 했습니다."]]],
    [15.5, 20.5, sceneRodho, [[15.6, 20.5, "약 4,700만 년 전 [로도케투스]. 발목뼈가 하마·소 무리와 같은 모양입니다."]]],
    [20.5, 25.5, sceneBasilo, [[20.6, 25.5, "약 4,000만 년 전 [바실로사우루스]. 완전히 물에 살고, 뒷다리는 아주 작아졌습니다."]]],
    [25.5, 32, sceneEnd, [[25.6, 28.8, "지금 고래 몸속에도 [골반뼈 흔적]이 남아 있습니다."], [28.8, 32, "DNA로 보면 가장 가까운 현생 친척은 [하마]입니다."]]],
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

  const MYA = [[50, "파키케투스"], [49, "암불로케투스"], [47, "로도케투스"], [40, "바실로사우루스"], [0, "현생 고래"]];
  function timeline(k) {
    const x0 = 36, x1 = 324, y = 440, X = (m) => x1 - m / 55 * (x1 - x0);
    ctx.strokeStyle = "rgba(243,244,239,.3)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    MYA.forEach(([m], i) => {
      ctx.fillStyle = i === k ? C.sprout : "rgba(243,244,239,.35)";
      ctx.beginPath(); ctx.arc(X(m), y, i === k ? 5 : 3, 0, Math.PI * 2); ctx.fill();
    });
    label("5,500만 년 전", x0, y + 18, "rgba(243,244,239,.4)");
    label("현재", x1, y + 18, "rgba(243,244,239,.4)", "right");
    if (k >= 0) label(["약 5,000만 년 전", "약 4,900만 년 전", "약 4,700만 년 전", "약 4,000만 년 전", "현재"][k], X(MYA[k][0]), y - 12, C.sprout, "center");
  }
  function water(level) {
    const g = ctx.createLinearGradient(0, level, 0, 420);
    g.addColorStop(0, "rgba(63,111,156,.45)"); g.addColorStop(1, "rgba(63,111,156,.12)");
    ctx.fillStyle = g; ctx.fillRect(0, level, W, 420 - level);
    ctx.strokeStyle = "rgba(160,200,235,.5)"; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = 0; x <= W; x += 4) { const y = level + Math.sin(x / 14 + T * 3) * 2; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  }
  function ground(y) { ctx.fillStyle = "rgba(160,130,90,.35)"; ctx.fillRect(0, y, W, 4); }
  // 생김새는 모식: 몸통 길이 L, 높이 hb, 앞다리 fl, 뒷다리 hl, 꼬리 tl, 머리 hd, 꼬리지느러미 fluke, 앞지느러미 flip
  function beast(cx, cy, p, col = "#b9b3a6") {
    const { L, hb, fl, hl, tl, hd, fluke, flip, feet } = p;
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = "round";
    // 다리
    ctx.lineWidth = 7;
    if (hl > 0) { ctx.beginPath(); ctx.moveTo(cx - L * .3, cy); ctx.lineTo(cx - L * .32, cy + hb * .4 + hl); ctx.stroke();
      if (feet) { ctx.beginPath(); ctx.ellipse(cx - L * .32 + 6, cy + hb * .4 + hl, 10, 3.5, 0, 0, Math.PI * 2); ctx.fill(); } }
    if (flip) { ctx.beginPath(); ctx.ellipse(cx + L * .22, cy + hb * .45, fl * .7, 6, .6, 0, Math.PI * 2); ctx.fill(); }
    else if (fl > 0) { ctx.beginPath(); ctx.moveTo(cx + L * .28, cy); ctx.lineTo(cx + L * .3, cy + hb * .4 + fl); ctx.stroke();
      if (feet) { ctx.beginPath(); ctx.ellipse(cx + L * .3 + 5, cy + hb * .4 + fl, 8, 3, 0, 0, Math.PI * 2); ctx.fill(); } }
    // 꼬리
    ctx.beginPath(); ctx.moveTo(cx - L * .45, cy - hb * .25);
    ctx.quadraticCurveTo(cx - L * .5 - tl * .6, cy - hb * .1, cx - L * .5 - tl, cy + (fluke ? -2 : 8));
    ctx.lineTo(cx - L * .5 - tl, cy + (fluke ? 4 : 10));
    ctx.quadraticCurveTo(cx - L * .5 - tl * .5, cy + hb * .2, cx - L * .45, cy + hb * .3); ctx.fill();
    if (fluke) { ctx.beginPath(); ctx.ellipse(cx - L * .5 - tl, cy + 1, 5, 22, 0, 0, Math.PI * 2); ctx.fill(); }
    // 몸통, 머리
    ctx.beginPath(); ctx.ellipse(cx, cy, L / 2, hb / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + L * .45 + hd * .35, cy - hb * .12, hd * .6, hb * .3, .08, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.night; ctx.beginPath(); ctx.arc(cx + L * .45 + hd * .3, cy - hb * .25, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  function sceneNow() {
    water(120);
    beast(185, 270, { L: 190, hb: 62, fl: 30, hl: 0, tl: 60, hd: 50, fluke: 1, flip: 1 }, "#8fa3b5");
    label("숨구멍", 245, 222, "rgba(243,244,239,.55)");
    timeline(4);
  }
  function scenePaki(lt) {
    ground(330);
    beast(190, 272, { L: 100, hb: 34, fl: 38, hl: 40, tl: 62, hd: 44 });
    label("몸길이 1~2 m 정도", 180, 380, "rgba(243,244,239,.45)", "center");
    timeline(0);
  }
  function sceneAmbu() {
    water(300); ground(330);
    beast(185, 290, { L: 140, hb: 34, fl: 18, hl: 22, tl: 70, hd: 64, feet: 1 });
    label("큰 뒷발로 물을 저었을 것", 180, 380, "rgba(243,244,239,.45)", "center");
    timeline(1);
  }
  function sceneRodho() {
    water(160);
    beast(190, 270, { L: 140, hb: 36, fl: 14, hl: 20, tl: 70, hd: 56, feet: 1 });
    timeline(2);
  }
  function sceneBasilo() {
    water(140);
    beast(205, 270, { L: 220, hb: 34, fl: 26, hl: 5, tl: 70, hd: 46, fluke: 1, flip: 1 });
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(205 - 220 * .31, 270 + 20, 10, 0, Math.PI * 2); ctx.stroke();
    label("뒷다리", 205 - 220 * .31, 330, C.amber, "center");
    timeline(3);
  }
  function sceneEnd(lt) {
    water(120);
    beast(185, 250, { L: 190, hb: 62, fl: 30, hl: 0, tl: 60, hd: 50, fluke: 1, flip: 1 }, "#8fa3b5");
    ctx.save(); ctx.globalAlpha *= .9; ctx.fillStyle = C.paper;
    ctx.beginPath(); ctx.ellipse(185 - 190 * .3, 262, 12, 3, -.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(185 - 190 * .3, 262, 16, 0, Math.PI * 2); ctx.stroke();
    label("몸속 골반뼈 흔적", 185 - 190 * .3, 305, C.amber, "center");
    if (lt > 3.3) {
      label("화석 동물들은 한 줄로 이어진 조상이 아니라", 180, 360, "rgba(243,244,239,.55)", "center", `11.5px ${SANS}`);
      label("고래로 이어진 가지 곁의 친척들입니다.", 180, 378, "rgba(243,244,239,.55)", "center", `11.5px ${SANS}`);
    }
    timeline(4);
  }

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
  const poster = () => { if (!playing) { T = reduce ? 7 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
