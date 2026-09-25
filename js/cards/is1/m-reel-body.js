/* 영상: 통통사과 「내 몸의 원소는 어디서 왔을까」 — 코드로 그리는 33초 숏폼 */
(() => {
  const root = document.getElementById("video-is1-body");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas"), phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek"), toggle = root.querySelector(".reel-toggle"), timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 33;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 몸무게 60 kg 기준 질량 비율 (%)
  const BODY = [["O", "산소", 65, "#7fb3d5"], ["C", "탄소", 18.5, "#9a9a9a"], ["H", "수소", 9.5, "#f3f4ef"], ["N", "질소", 3.2, "#b5d7ac"], ["Ca", "칼슘", 1.5, "#e0a02a"], ["P", "인", 1.0, "#d4493a"], ["", "기타", 1.3, "#5d5d61"]];

  const SCENES = [
    [0, 5.5, sBody, [[0.2, 5.5, "몸무게 60 kg. 그중 [39 kg]이 산소입니다."]]],
    [5.5, 11, sBang, [[5.6, 8.3, "수소 [5.7 kg]은 빅뱅 직후에 생겼습니다."], [8.3, 11, "내 몸의 수소 원자는 [138억 년] 전부터 있었습니다."]]],
    [11, 17, sOld, [[11.1, 17, "탄소와 질소의 상당 부분은 [태양 같은 별]이 늙어 가며 만들어 내보낸 것입니다."]]],
    [17, 23, sNova, [[17.1, 23, "산소와 칼슘은 [무거운 별] 속에서 만들어져 초신성 폭발로 흩어졌습니다."]]],
    [23, 28.5, sHeavy, [[23.1, 25.8, "피 속의 철 [3~4 g]은 별의 폭발에서,"], [25.8, 28.5, "갑상샘의 아이오딘은 [중성자별 충돌] 같은 r 과정에서 왔습니다."]]],
    [28.5, 33, sSum, [[28.6, 33, "몸 질량의 약 [90%]는 별이 만든 원소입니다."]]],
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

  /* 1. 몸의 원소 막대 */
  function sBody(lt) {
    const p = ease(clamp(lt / 1.6, 0, 1));
    // 사람 윤곽
    ctx.fillStyle = "rgba(243,244,239,.1)";
    ctx.beginPath(); ctx.arc(80, 120, 18, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(60, 142, 40, 90, 12); ctx.fill();
    ctx.fillRect(62, 228, 14, 70); ctx.fillRect(84, 228, 14, 70);
    let y = 104;
    for (const [s, n, pct, col] of BODY) {
      const bw = 200 * pct / 65 * p;
      ctx.fillStyle = col; ctx.fillRect(130, y, Math.max(2, bw), 20);
      label(`${n}`, 124, y + 15, C.paper, "right", `600 12px ${SANS}`);
      label(`${pct}%`, 136 + Math.max(2, bw), y + 15, "rgba(243,244,239,.75)");
      y += 30;
    }
    label("질량 비율 · 몸무게 60 kg 기준", 180, 340, "rgba(243,244,239,.45)", "center");
  }

  /* 2. 빅뱅 */
  function sBang(lt) {
    const r = 20 + ease(clamp(lt / 3, 0, 1)) * 140;
    const g = ctx.createRadialGradient(180, 250, 0, 180, 250, r);
    g.addColorStop(0, "rgba(255,240,200,.95)"); g.addColorStop(.5, "rgba(224,160,42,.35)"); g.addColorStop(1, "rgba(224,160,42,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(180, 250, r, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996, d = r * (0.3 + (i % 7) / 9);
      ctx.fillStyle = i % 4 ? "#d4493a" : "#8d8d92";
      ctx.beginPath(); ctx.arc(180 + d * Math.cos(a), 250 + d * Math.sin(a), 3, 0, Math.PI * 2); ctx.fill();
    }
    if (lt > 1.5) tag("H", 180, 250, C.paper);
    label("빅뱅 · 138억 년 전", 180, 440, "rgba(243,244,239,.55)", "center");
  }

  /* 3. 늙은 별이 바깥층을 내보냄 */
  function sOld(lt) {
    const p = clamp(lt / 5, 0, 1);
    for (let k = 0; k < 3; k++) {
      const r = 40 + ((p * 120 + k * 40) % 130);
      ctx.strokeStyle = `rgba(181,215,172,${0.5 * (1 - r / 170)})`; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(180, 250, r, 0, Math.PI * 2); ctx.stroke();
    }
    star(180, 250, 12, "rgba(243,244,239,.95)");
    if (lt > 1) { tag("C", 110, 170, "#bdbdbd"); tag("N", 250, 330, C.sprout); }
    label("태양 같은 별의 마지막 · 행성상 성운 (모식)", 180, 440, "rgba(243,244,239,.55)", "center");
  }

  /* 4. 초신성 */
  function sNova(lt) {
    if (lt < 1.4) {
      const s = 1 - lt / 1.4 * 0.5;
      star(180, 250, 26 * s, "rgba(214,120,90,.95)", 2);
      label("무거운 별의 중심: 철", 180, 330, "rgba(243,244,239,.55)", "center");
    } else {
      const q = ease(clamp((lt - 1.4) / 2, 0, 1));
      star(180, 250, 10 + q * 60, "rgba(255,245,220,.9)", 2.2);
      for (let i = 0; i < 40; i++) {
        const a = i * 0.157 + 0.3, d = 30 + q * (110 + (i % 5) * 12);
        ctx.fillStyle = i % 3 ? "rgba(127,179,213,.9)" : "rgba(224,160,42,.9)";
        ctx.beginPath(); ctx.arc(180 + d * Math.cos(a), 250 + d * Math.sin(a), 2.5, 0, Math.PI * 2); ctx.fill();
      }
      if (lt > 2.6) { tag("O", 90, 150, "#7fb3d5"); tag("Ca", 270, 350, C.amber); }
    }
    label("초신성 폭발 (모식)", 180, 440, "rgba(243,244,239,.55)", "center");
  }

  /* 5. 철과 아이오딘 */
  function sHeavy(lt) {
    // 적혈구와 철
    ctx.fillStyle = "rgba(212,73,58,.75)";
    ctx.beginPath(); ctx.ellipse(110, 220, 44, 26, -.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(28,30,27,.35)"; ctx.beginPath(); ctx.ellipse(110, 220, 20, 10, -.3, 0, Math.PI * 2); ctx.fill();
    tag("Fe", 110, 290, "#c9a58f");
    label("피 속 철 3~4 g", 110, 330, "rgba(243,244,239,.6)", "center");
    if (lt > 2.5) {
      const q = clamp((lt - 2.5) / 1.5, 0, 1), a = q * 6;
      const d = 34 * (1 - q * 0.8);
      star(250 + d * Math.cos(a), 220 + d * Math.sin(a), 6, "rgba(200,220,255,.95)");
      star(250 - d * Math.cos(a), 220 - d * Math.sin(a), 6, "rgba(200,220,255,.95)");
      if (q > .95) star(250, 220, 18, "rgba(255,210,180,.8)", 3);
      tag("I", 250, 290, "#b9a3d6");
      label("아이오딘 약 15 mg", 250, 330, "rgba(243,244,239,.6)", "center");
    }
  }

  /* 6. 요약: 빅뱅 9.5% vs 별 90.5% */
  function sSum(lt) {
    const p = ease(clamp(lt / 1.5, 0, 1));
    const cx = 180, cy = 250, R = 100, a0 = -Math.PI / 2, aH = a0 + 2 * Math.PI * 0.095;
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a0 + (aH - a0) * p); ctx.fill();
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, aH, aH + (2 * Math.PI * 0.905) * p); ctx.fill();
    ctx.fillStyle = C.night; ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fill();
    label("별", cx, cy + 6, C.amber, "center", `700 20px ${SANS}`);
    label("빅뱅 9.5% (수소)", 250, 138, C.paper, "left");
    label("별 90.5%", 180, 385, C.amber, "center", `600 14px ${MONO}`);
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
