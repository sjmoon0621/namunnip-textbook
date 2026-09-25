/* 영상: 지구 46억 년을 하루로 — 코드로 그리는 30초 숏폼 */
(() => {
  const root = document.getElementById("video-earth-day");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas"), phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek"), toggle = root.querySelector(".reel-toggle"), timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 32;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 하루 환산: t(백만 년 전) → 자정부터 흐른 초
  const sec = (ma) => (1 - ma / 4600) * 86400;
  // 장면: [시작, 끝, 시계가 가리킬 사건(Ma), 사건 이름, 자막]
  const SCENES = [
    [0, 5, 4600, "지구 탄생", "지구의 역사 46억 년을 [하루 24시간]으로 줄여 봅니다."],
    [5, 10, 3500, "스트로마톨라이트", "새벽 [5시 44분]. 남세균이 만든 가장 오래된 화석 흔적 가운데 하나."],
    [10, 14.5, 2400, "산소 증가", "[정오]가 가까워서야 대기에 산소가 늘기 시작합니다."],
    [14.5, 19.5, 538.8, "캄브리아기", "밤 [9시 11분]. 껍데기 있는 동물이 한꺼번에 늘어납니다."],
    [19.5, 25, 66, "공룡 멸종", "공룡은 밤 [10시 48분]에 나타나 [11시 39분]에 사라집니다."],
    [25, 32, 0.3, "호모 사피엔스", "우리 종은 자정 [6초 전]. 문자로 적힌 역사는 마지막 [0.1초]입니다."],
  ];
  const MARKS = [[3500, "#8fb7a2"], [2400, "#9fc3d9"], [538.8, "#e8d27a"], [230, "#d99a6c"], [66, "#d4493a"], [0.3, "#f3f4ef"]];

  let T = 0, playing = false, userPaused = false;
  const clockSec = (time) => {
    // 장면 안에서 앞 사건 → 이번 사건으로 바늘이 움직인다
    for (let i = 0; i < SCENES.length; i++) {
      const [s, e, ma] = SCENES[i];
      if (time < e || i === SCENES.length - 1) {
        const prev = i ? SCENES[i - 1][2] : 4600;
        return sec(prev) + (sec(ma) - sec(prev)) * ease(clamp((time - s) / 2.2, 0, 1));
      }
    }
    return 86400;
  };

  function frame(time) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
    const cs = clockSec(time), idx = SCENES.findIndex((s) => time < s[1]), sc = SCENES[idx < 0 ? SCENES.length - 1 : idx];
    const lt = time - sc[0];
    const last = idx === SCENES.length - 1 || idx < 0;
    dial(180, 232, 118, cs, last ? clamp((lt - 2.5) / 2, 0, 1) : 0);
    // 디지털 시계
    const hh = Math.floor(cs / 3600), mm = Math.floor(cs % 3600 / 60), ss = Math.floor(cs % 60);
    ctx.textAlign = "center"; ctx.font = `500 34px ${MONO}`; ctx.fillStyle = C.paper;
    ctx.fillText(`${String(Math.min(hh, 23)).padStart(2, "0")}:${String(hh >= 24 ? 59 : mm).padStart(2, "0")}:${String(hh >= 24 ? 59 : ss).padStart(2, "0")}`, 180, 402);
    const ma = 4600 * (1 - cs / 86400);
    ctx.font = `12px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.55)";
    ctx.fillText(ma >= 100 ? `약 ${(ma / 100).toFixed(ma >= 1000 ? 0 : 1)}억 년 전` : ma >= 1 ? `약 ${Math.round(ma)}00만 년 전` : `약 ${Math.max(1, Math.round(ma * 100))}만 년 전`, 180, 424);
    ctx.textAlign = "left";
    // 자막
    for (const s of SCENES) {
      if (time < s[0] || time >= s[1]) continue;
      const a = clamp(Math.min((time - s[0]) / 0.35, (s[1] - time) / 0.3), 0, 1);
      caption(s[4], a, (time - s[0]) / 0.35);
    }
    chrome(time);
  }

  function dial(cx, cy, r, cs, zoomA) {
    // 24시간 문자판: 자정이 위, 시계 방향
    const ang = (s) => -Math.PI / 2 + s / 86400 * Math.PI * 2;
    ctx.strokeStyle = "rgba(243,244,239,.18)"; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // 지나온 시간
    ctx.strokeStyle = "rgba(116,171,102,.55)";
    ctx.beginPath(); ctx.arc(cx, cy, r, ang(0), ang(cs)); ctx.stroke();
    // 사건 표시
    MARKS.forEach(([m, c]) => {
      const s = sec(m); if (s > cs + 1) return;
      const a = ang(s);
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 5, 0, Math.PI * 2); ctx.fill();
    });
    // 시각 눈금
    ctx.fillStyle = "rgba(243,244,239,.5)"; ctx.font = `11px ${MONO}`; ctx.textAlign = "center";
    for (let k = 0; k < 24; k += 3) {
      const a = ang(k * 3600);
      ctx.fillText(k === 0 ? "0시" : `${k}`, cx + Math.cos(a) * (r - 28), cy + Math.sin(a) * (r - 28) + 4);
    }
    // 바늘
    const a = ang(cs);
    ctx.strokeStyle = C.paper; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (r - 12), cy + Math.sin(a) * (r - 12)); ctx.stroke();
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    // 마지막 장면: 자정 직전 1분을 확대
    if (zoomA > 0) {
      ctx.save(); ctx.globalAlpha *= zoomA;
      const y = 470, x0 = 40, x1 = 320;
      ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      for (let s = 0; s <= 60; s += 10) {
        const x = x0 + s / 60 * (x1 - x0);
        ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke();
      }
      ctx.font = `10px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.55)";
      ctx.fillText("23:59:00", x0, y + 18); ctx.fillText("자정", x1, y + 18);
      const xs = x0 + (60 - 5.6) / 60 * (x1 - x0);
      ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.arc(xs, y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillText("사람", xs - 8, y - 12);
      ctx.restore();
    }
    ctx.textAlign = "left"; ctx.lineCap = "butt";
  }

  function chrome(time) {
    const gap = 4, n = SCENES.length, sw = (W - 24 - gap * (n - 1)) / n;
    SCENES.forEach(([s, e], i) => {
      const x = 12 + i * (sw + gap);
      ctx.fillStyle = "rgba(243,244,239,.25)"; ctx.fillRect(x, 12, sw, 2.5);
      ctx.fillStyle = C.paper; ctx.fillRect(x, 12, sw * clamp((time - s) / (e - s), 0, 1), 2.5);
    });
    ctx.fillStyle = C.leaf; ctx.beginPath(); ctx.arc(24, 38, 7, 0, Math.PI * 2); ctx.fill();
    ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left";
    ctx.fillText("나뭇잎 지구과학", 38, 43);
  }

  function caption(text, alpha, rise) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.font = `700 20px ${SANS}`;
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
    const lh = 29, y0 = H - 70 - (lines.length - 1) * lh + (1 - clamp(rise, 0, 1)) * 8;
    lines.forEach((ln, i) => { let x = 28; for (const t of ln) { ctx.fillStyle = t.hi ? C.sprout : C.paper; ctx.fillText(t.wd, x, y0 + i * lh); x += t.m; } });
    ctx.restore();
  }

  // 재생 제어
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
  const poster = () => { if (!playing) { T = reduce ? 16 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
