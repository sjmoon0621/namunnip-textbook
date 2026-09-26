/* 영상: 킬링 곡선 60여 년 — 코드로 그리는 30초 숏폼 */
(() => {
  const root = document.getElementById("video-is2-keeling");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas");
  const phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek");
  const toggle = root.querySelector(".reel-toggle");
  const timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 30;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // NOAA 마우나로아 연평균 CO₂ (ppm, 대략값)
  const ANN = [[1959, 316.0], [1965, 320.0], [1970, 325.7], [1975, 331.1], [1980, 338.8], [1985, 346.1],
    [1990, 354.4], [1995, 360.8], [2000, 369.7], [2005, 380.0], [2010, 389.9], [2015, 401.0], [2020, 414.2], [2024, 424.6]];
  const annual = (y) => {
    for (let i = 1; i < ANN.length; i++) if (y <= ANN[i][0]) {
      const [y0, v0] = ANN[i - 1], [y1, v1] = ANN[i]; return v0 + (v1 - v0) * (y - y0) / (y1 - y0);
    }
    return ANN.at(-1)[1];
  };
  // 계절 변동 모양 (근사): 5월 중순 최고, 10월 초 최저, 폭 약 6 ppm
  const season = (y) => {
    const f = ((y % 1) + 1) % 1, hi = 0.37, lo = 0.76;
    if (f >= hi && f < lo) return 3 * Math.cos(Math.PI * (f - hi) / (lo - hi));
    const g = (f - lo + 1) % 1; return -3 * Math.cos(Math.PI * g / (1 - (lo - hi)));
  };
  const co2 = (y) => annual(y) + season(y);

  const SCENES = [
    [0, 5, sIntro, [[0.2, 5, "1958년, 하와이 [마우나로아]산 중턱에서 공기 속 CO₂를 재기 시작했습니다."]]],
    [5, 13, sCurve, [[5.1, 9, "그때 약 [316 ppm]이던 값은"], [9, 13, "2024년 약 [425 ppm]이 되었습니다."]]],
    [13, 19.5, sSaw, [[13.1, 16.2, "선이 톱니 모양인 까닭은? 해마다 [5월]에 높고 [10월]에 낮습니다."], [16.2, 19.5, "북반구 숲이 여름에 [광합성]으로 CO₂를 빨아들이기 때문입니다."]]],
    [19.5, 25, sRate, [[19.6, 25, "오르는 속도도 빨라졌습니다. 1년에 [0.9 ppm]에서 [2.4 ppm]으로."]]],
    [25, 30, sIce, [[25.1, 30, "빙하 속 공기로 본 지난 80만 년, CO₂는 [300 ppm]을 넘은 적이 없습니다."]]],
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
    ctx.fillStyle = C.leaf; ctx.beginPath(); ctx.arc(24, 38, 7, 0, 7); ctx.fill();
    ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left";
    ctx.fillText("나뭇잎 숏폼", 38, 43);
    ctx.font = `11px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)";
    ctx.fillText("· 킬링 곡선", 120, 43);
  }

  function caption(text, alpha, rise) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.font = `700 20px ${SANS}`;
    const words = []; let hi = false;
    for (const part of text.split(/(\[|\])/)) {
      if (part === "[") { hi = true; continue; }
      if (part === "]") { hi = false; continue; }
      part.split(/( +)/).forEach((wd) => wd && words.push({ wd, hi }));
    }
    const maxW = W - 56, lines = [[]]; let lw = 0;
    for (const t of words) {
      const m = ctx.measureText(t.wd).width;
      if (lw + m > maxW && t.wd.trim() && lines.at(-1).length) { lines.push([]); lw = 0; }
      if (!lines.at(-1).length && !t.wd.trim()) continue;
      lines.at(-1).push({ ...t, m }); lw += m;
    }
    const lh = 29, y0 = H - 92 - (lines.length - 1) * lh + (1 - clamp(rise, 0, 1)) * 8;
    lines.forEach((ln, i) => { let x = 28; for (const t of ln) { ctx.fillStyle = t.hi ? C.sprout : C.paper; ctx.fillText(t.wd, x, y0 + i * lh); x += t.m; } });
    ctx.restore();
  }
  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left";
  };

  // 공용 그래프 틀
  function plot(x0, y0, w, h, ya, yb, xa, xb) {
    return { X: (v) => x0 + (v - xa) / (xb - xa) * w, Y: (v) => y0 + (1 - (v - ya) / (yb - ya)) * h };
  }

  /* 1. 산과 관측소 */
  function sIntro(lt) {
    ctx.translate(0, -60);
    ctx.fillStyle = "#2a2d29";
    ctx.beginPath(); ctx.moveTo(0, 430); ctx.quadraticCurveTo(180, 250, 360, 430); ctx.lineTo(360, 480); ctx.lineTo(0, 480); ctx.fill();
    ctx.fillStyle = "#1f3b57"; ctx.fillRect(0, 470, W, 10);
    // 관측소 (산꼭대기 y ≈ 340 근처)
    ctx.fillStyle = C.paper; ctx.fillRect(196, 332, 18, 10); ctx.fillRect(203, 316, 3, 16);
    label("마우나로아 관측소 · 해발 약 3,400 m", 180, 300, C.paper, "center");
    label("태평양 한가운데, 공장과 숲에서 먼 곳", 180, 190, "rgba(243,244,239,.45)", "center");
    // 공기 흐름 점
    for (let i = 0; i < 18; i++) {
      const x = ((i * 47 + lt * 40) % 400) - 20, y = 200 + (i % 5) * 16;
      ctx.fillStyle = "rgba(181,215,172,.5)"; ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill();
    }
  }

  /* 2. 곡선이 그려진다 */
  function sCurve(lt) {
    const p = ease(clamp(lt / 6.5, 0, 1));
    const yEnd = 1959 + p * (2024.9 - 1959);
    const g = plot(46, 120, 290, 330, 310, 430, 1958, 2025);
    ctx.strokeStyle = "rgba(243,244,239,.12)"; ctx.lineWidth = 1; ctx.font = `10px ${MONO}`;
    for (let v = 320; v <= 420; v += 20) { ctx.beginPath(); ctx.moveTo(46, g.Y(v)); ctx.lineTo(336, g.Y(v)); ctx.stroke(); label(v, 40, g.Y(v) + 3, "rgba(243,244,239,.45)", "right", `10px ${MONO}`); }
    [1960, 1980, 2000, 2020].forEach((y) => label(y, g.X(y), 468, "rgba(243,244,239,.45)", "center", `10px ${MONO}`));
    label("CO₂ (ppm)", 46, 108, "rgba(243,244,239,.5)");
    ctx.beginPath();
    for (let y = 1959; y <= yEnd; y += 1 / 24) { const X = g.X(y), Y = g.Y(co2(y)); y === 1959 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); }
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.beginPath(); ctx.arc(g.X(yEnd), g.Y(co2(yEnd)), 4, 0, 7); ctx.fillStyle = C.paper; ctx.fill();
    label(`${Math.floor(yEnd)}년 · ${annual(yEnd).toFixed(0)} ppm`, 336, 150, C.paper, "right", `600 15px ${MONO}`);
    label("연평균: NOAA 대략값", 336, 168, "rgba(243,244,239,.4)", "right", `10px ${MONO}`);
  }

  /* 3. 두 해만 확대 */
  function sSaw(lt) {
    const g = plot(46, 150, 290, 260, 415, 427, 2021, 2023);
    ctx.font = `10px ${MONO}`;
    ["1월", "5월", "10월", "1월", "5월", "10월"].forEach((m, i) => {
      const y = 2021 + Math.floor(i / 3) + [0, 0.37, 0.76][i % 3];
      ctx.strokeStyle = "rgba(243,244,239,.12)"; ctx.beginPath(); ctx.moveTo(g.X(y), 150); ctx.lineTo(g.X(y), 410); ctx.stroke();
      label(m, g.X(y), 426, i % 3 === 1 ? C.sprout : "rgba(243,244,239,.5)", "center", `10px ${MONO}`);
    });
    const p = clamp(lt / 2.5, 0, 1);
    ctx.beginPath();
    for (let y = 2021; y <= 2021 + 2 * p; y += 1 / 60) { const X = g.X(y), Y = g.Y(co2(y)); y === 2021 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); }
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(g.X(2021), g.Y(annual(2021))); ctx.lineTo(g.X(2023), g.Y(annual(2023)));
    ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(243,244,239,.4)"; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
    label("2021–2022년 확대 · 약 6 ppm 오르내림", 180, 130, C.paper, "center");
    label("계절 모양은 이해를 돕는 근사", 180, 448, "rgba(243,244,239,.4)", "center", `10px ${MONO}`);
    if (lt > 3.2) {
      ctx.save(); ctx.globalAlpha *= clamp((lt - 3.2) / 0.5, 0, 1);
      label("여름: 광합성 > 호흡 → CO₂ 줄어듦", 180, 470, C.sprout, "center", `11px ${MONO}`);
      ctx.restore();
    }
  }

  /* 4. 증가 속도 */
  function sRate(lt) {
    const rows = [["1960년대", 0.86], ["1980년대", 1.56], ["2000년대", 1.96], ["2010년대", 2.43]];
    const p = ease(clamp(lt / 2, 0, 1));
    label("한 해 동안 늘어난 양 (10년 평균, ppm/년)", 180, 170, "rgba(243,244,239,.6)", "center");
    rows.forEach(([t, v], i) => {
      const y = 205 + i * 58;
      label(t, 30, y + 18, C.paper, "left", `12px ${MONO}`);
      ctx.fillStyle = i === 3 ? C.warn : "rgba(243,244,239,.35)";
      ctx.fillRect(110, y, v / 2.6 * 190 * p, 26);
      label(v.toFixed(1), 110 + v / 2.6 * 190 * p + 8, y + 18, C.paper, "left", `600 13px ${MONO}`);
    });
  }

  /* 5. 지난 80만 년 */
  function sIce(lt) {
    const g = plot(40, 150, 300, 280, 150, 440, 0, 1);
    ctx.fillStyle = "rgba(181,215,172,.18)"; ctx.fillRect(40, g.Y(300), 250, g.Y(172) - g.Y(300));
    label("80만 년 동안의 범위", 165, g.Y(236) + 4, C.sprout, "center", `12px ${MONO}`);
    label("약 172 ~ 300 ppm", 165, g.Y(236) + 22, "rgba(181,215,172,.8)", "center", `11px ${MONO}`);
    [[300, "300"], [172, "172"]].forEach(([v, t]) => label(t, 34, g.Y(v) + 4, "rgba(243,244,239,.45)", "right", `10px ${MONO}`));
    const p = ease(clamp((lt - 0.8) / 1.5, 0, 1));
    const top = 280 + (424.6 - 280) * p;
    ctx.fillStyle = C.warn; ctx.fillRect(300, g.Y(top), 24, g.Y(150) - g.Y(top));
    label(`${Math.round(top)}`, 312, g.Y(top) - 8, C.paper, "center", `600 15px ${MONO}`);
    label("지금", 312, g.Y(150) + 16, C.paper, "center");
    label("빙하 기록 · 남극 얼음 속 공기 방울", 165, g.Y(150) + 16, "rgba(243,244,239,.45)", "center", `10px ${MONO}`);
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
  const q = /[?&]reel=([\d.]+)/.exec(location.search); // 검토용: ?reel=초 로 그 장면에서 멈춘다
  if (q) { T = +q[1]; userPaused = true; }
  const poster = () => { if (!playing) { T = reduce && !q ? 12 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
