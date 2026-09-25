/* 영상: 통통사과 「1미터의 역사」 — 코드로 그리는 32초 숏폼 */
(() => {
  const root = document.getElementById("video-is1-meter");
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
    [0, 5, sceneStick, [[0.2, 5, "1미터. 이 길이는 [누가], 무엇으로 정했을까요?"]]],
    [5, 11, sceneEarth, [[5.1, 11, "1790년대 프랑스: 북극에서 적도까지 거리의 [1천만분의 1]."]]],
    [11, 16.5, sceneSurvey, [[11.1, 13.8, "됭케르크에서 바르셀로나까지, [6년 넘게] 직접 쟀습니다."], [13.8, 16.5, "그래도 계산이 조금 빗나가, 이 미터는 의도보다 [0.2 mm] 짧았습니다."]]],
    [16.5, 22, sceneBar, [[16.6, 19.3, "1889년: 금속 막대 [하나]가 세계의 기준이 됩니다."], [19.3, 22, "하지만 막대는 온도에 따라 늘고, 닳고, [하나뿐]입니다."]]],
    [22, 27, sceneKrypton, [[22.1, 27, "1960년: 크립톤 원자가 내는 빛의 파장 [1,650,763.73]개."]]],
    [27, 32, sceneLight, [[27.1, 29.6, "1983년부터: 빛이 [1/299,792,458초] 동안 가는 거리."], [29.6, 32, "이제 원자시계와 빛만 있으면 [어디서든] 1 m를 만듭니다."]]],
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

  /* 1. 1 m 자 */
  function sceneStick(lt) {
    const x0 = 40, x1 = 320, y = 270, p = ease(clamp(lt / 1.6, 0, 1));
    ctx.fillStyle = "#e3c77e"; ctx.fillRect(x0, y, (x1 - x0) * p, 34);
    ctx.strokeStyle = "rgba(28,30,27,.8)"; ctx.lineWidth = 1;
    for (let i = 0; i <= 100; i++) {
      const x = x0 + (x1 - x0) * i / 100; if (x > x0 + (x1 - x0) * p) break;
      const hh = i % 10 === 0 ? 14 : i % 5 === 0 ? 9 : 5;
      ctx.beginPath(); ctx.moveTo(x + .5, y); ctx.lineTo(x + .5, y + hh); ctx.stroke();
    }
    if (p > .98) {
      label("0", x0, y + 52, C.paper, "center", `12px ${MONO}`);
      label("100 cm", x1, y + 52, C.paper, "center", `12px ${MONO}`);
      ctx.save(); ctx.globalAlpha *= fade(lt, 1.8);
      label("1 m", 180, 220, C.sprout, "center", `600 48px ${MONO}`);
      ctx.restore();
    }
  }

  /* 2. 지구 사분 자오선 */
  function sceneEarth(lt) {
    const cx = 180, cy = 290, R = 118;
    ctx.fillStyle = "#2f5f8a"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = C.forest;
    ctx.beginPath(); ctx.ellipse(cx - 10, cy - 60, 60, 38, .3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 40, cy + 40, 30, 55, -.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // 적도
    ctx.strokeStyle = "rgba(243,244,239,.4)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.18, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // 북극 → 적도 자오선 (앞면, 타원 호)
    const p = ease(clamp((lt - 0.5) / 2.4, 0, 1));
    ctx.strokeStyle = C.amber; ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let i = 0; i <= 60 * p; i++) {
      const th = (i / 60) * Math.PI / 2;
      const x = cx + R * 0.35 * Math.sin(th), y = cy - R * Math.cos(th) + R * 0.18 * Math.sin(th) * 0;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(cx, cy - R, 4, 0, Math.PI * 2); ctx.fill();
    label("북극", cx, cy - R - 12, C.paper, "center", `600 12px ${SANS}`);
    if (p > .98) {
      label("적도", cx + R * 0.35 + 8, cy + 4, C.paper, "left", `600 12px ${SANS}`);
      ctx.save(); ctx.globalAlpha *= fade(lt, 3.1);
      label("이 길이 = 10,000,000 m", 180, 452, C.amber, "center", `500 17px ${MONO}`);
      ctx.restore();
    }
    label("파리를 지나는 자오선", cx + R * 0.35 + 8, cy - R * 0.6, "rgba(243,244,239,.55)");
  }

  /* 3. 측량과 오차 */
  function sceneSurvey(lt) {
    // 삼각망 모식
    const pts = [[120, 110], [200, 130], [150, 175], [230, 200], [170, 245], [245, 275], [190, 320], [260, 350]];
    const p = clamp(lt / 2.4, 0, 1), n = Math.floor(p * (pts.length - 1));
    ctx.strokeStyle = "rgba(243,244,239,.45)"; ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      ctx.beginPath(); ctx.moveTo(...pts[i]); ctx.lineTo(...pts[i + 1]); ctx.stroke();
      if (i + 2 <= n) { ctx.beginPath(); ctx.moveTo(...pts[i]); ctx.lineTo(...pts[i + 2]); ctx.stroke(); }
    }
    pts.forEach(([x, y], i) => { if (i <= n) { ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); } });
    label("됭케르크", 112, 98, C.paper, "center", `600 12px ${SANS}`);
    if (n >= pts.length - 1) label("바르셀로나", 262, 374, C.paper, "center", `600 12px ${SANS}`);
    label("삼각 측량 (모식)", 30, 402, "rgba(243,244,239,.45)");
    if (lt > 2.8) {
      ctx.save(); ctx.globalAlpha *= fade(lt, 2.8);
      ctx.fillStyle = "rgba(28,30,27,.85)"; ctx.fillRect(20, 410, 320, 72);
      label("실제 북극–적도: 약 10,002 km", 180, 438, C.paper, "center", `500 14px ${MONO}`);
      label("→ 1 m가 약 0.2 mm 짧게 정해짐", 180, 462, C.amber, "center", `500 14px ${MONO}`);
      ctx.restore();
    }
  }

  /* 4. 국제 미터 원기 */
  function sceneBar(lt) {
    const x0 = 30, x1 = 330, y = 250;
    // X자 단면 막대 (옆모습)
    ctx.fillStyle = "#b9bcc0"; ctx.fillRect(x0, y, x1 - x0, 26);
    ctx.fillStyle = "#8e9196"; ctx.fillRect(x0, y + 10, x1 - x0, 6);
    const m1 = x0 + 12, m2 = x1 - 12;
    ctx.strokeStyle = C.night; ctx.lineWidth = 1.5;
    [m1, m2].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x, y + 9); ctx.stroke(); });
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(m1, y - 16); ctx.lineTo(m2, y - 16); ctx.stroke();
    label("두 눈금 사이 = 1 m (0 °C에서)", 180, y - 24, C.sprout, "center", `12px ${MONO}`);
    // 단면
    const sx = 180, sy = 360;
    ctx.strokeStyle = "#b9bcc0"; ctx.lineWidth = 9; ctx.lineCap = "butt";
    ctx.beginPath(); ctx.moveTo(sx - 20, sy - 20); ctx.lineTo(sx + 20, sy + 20); ctx.moveTo(sx + 20, sy - 20); ctx.lineTo(sx - 20, sy + 20); ctx.stroke();
    ctx.fillStyle = "#b9bcc0"; ctx.fillRect(sx - 22, sy - 3, 44, 6);
    label("단면: 휘지 않게 X자 모양", 180, sy + 42, "rgba(243,244,239,.55)", "center");
    label("백금 90% · 이리듐 10%", 180, sy + 60, "rgba(243,244,239,.55)", "center");
    if (lt > 2.9) {
      ctx.save(); ctx.globalAlpha *= fade(lt, 2.9);
      label("1 °C 오르면 약 9 μm 늘어남", 180, 200, C.amber, "center", `500 14px ${MONO}`);
      ctx.restore();
    }
  }

  /* 5. 크립톤 빛의 파장 */
  function sceneKrypton(lt) {
    const y = 270, x0 = 20, x1 = 340;
    const lam = 26, ph = lt * 6;
    ctx.strokeStyle = "#f08a3c"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 2) { const yy = y + 34 * Math.sin((x - x0) / lam * 2 * Math.PI - ph); x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
    ctx.stroke();
    // 파장 하나 표시
    const a = x0 + lam * 3.25, b = a + lam * 2 * Math.PI / (2 * Math.PI) * 1;
    ctx.strokeStyle = C.paper; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(a, y - 52); ctx.lineTo(a + lam, y - 52); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(a, y - 57); ctx.lineTo(a, y - 47); ctx.moveTo(a + lam, y - 57); ctx.lineTo(a + lam, y - 47); ctx.stroke();
    label("파장 605.78 nm", a + lam / 2, y - 64, C.paper, "center");
    label("크립톤-86 원자의 주황빛", 180, 370, "rgba(243,244,239,.6)", "center");
    label("× 1,650,763.73 = 1 m", 180, 410, C.sprout, "center", `600 20px ${MONO}`);
    label("그림의 파장은 실제보다 크게 그림", 180, 440, "rgba(243,244,239,.4)", "center");
    void b;
  }

  /* 6. 빛의 속력 */
  function sceneLight(lt) {
    ctx.textAlign = "center";
    ctx.font = `italic 44px ${SERIF}`; ctx.fillStyle = C.paper;
    ctx.fillText("c = 299,792,458", 180, 200);
    label("m/s  (정확한 값으로 고정)", 180, 228, "rgba(243,244,239,.6)", "center", `12px ${MONO}`);
    // 빛 펄스가 1 m를 지나간다
    const x0 = 50, x1 = 310, y = 300;
    ctx.strokeStyle = "rgba(243,244,239,.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    [x0, x1].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke(); });
    label("1 m", 180, y + 24, C.paper, "center", `12px ${MONO}`);
    const p = ((lt * 0.8) % 1);
    const px = x0 + (x1 - x0) * p;
    const g = ctx.createRadialGradient(px, y, 0, px, y, 16);
    g.addColorStop(0, "rgba(255,241,200,1)"); g.addColorStop(1, "rgba(255,241,200,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, y, 16, 0, Math.PI * 2); ctx.fill();
    label("걸리는 시간 약 3.3 ns", 180, y + 44, C.sprout, "center", `12px ${MONO}`);
    ctx.save(); ctx.globalAlpha *= fade(lt, 2.6);
    label("1초: 세슘 원자  ·  1 m: 빛 + 1초", 180, 410, "rgba(243,244,239,.7)", "center", `12px ${MONO}`);
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
  const poster = () => { if (!playing) { T = reduce ? 3 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
