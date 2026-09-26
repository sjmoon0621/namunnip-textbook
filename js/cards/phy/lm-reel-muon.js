/* 영상: 뮤온은 어떻게 지표까지 올까 — 코드로 그리는 31초 숏폼 (모식: v = 0.998c, 생성 높이 15 km) */
(() => {
  const root = document.getElementById("video-phy-lm-muon");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas");
  const phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek");
  const toggle = root.querySelector(".reel-toggle");
  const timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 31;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const MU = "#e0a02a", SKY = "#2b3a4f";

  const SCENES = [
    [0, 5, sceneBirth, [[0.2, 5, "우주에서 온 양성자가 대기 윗부분에 부딪히면 [뮤온]이 생깁니다. 높이 약 15 km."]]],
    [5, 10, sceneDecay, [[5.1, 10, "뮤온은 불안정합니다. 평균 [2.2 μs] 만에 전자와 중성미자로 붕괴합니다."]]],
    [10, 15.5, sceneNaive, [[10.1, 15.5, "빛의 속력으로 달려도 2.2 μs 동안 가는 거리는 [약 660 m]. 15 km에는 턱없이 모자랍니다."]]],
    [15.5, 20.5, sceneDetect, [[15.6, 20.5, "그런데 땅 위에서는 뮤온이 1 cm²에 [1분에 1개]꼴로 검출됩니다."]]],
    [20.5, 26, sceneDilate, [[20.6, 23.2, "지표에서 보면, v = 0.998c로 달리는 뮤온의 시계는 [16배] 느리게 갑니다."], [23.2, 26, "그래서 15 km를 지나고도 [4개 중 1개]쯤 살아남습니다."]]],
    [26, 31, sceneContract, [[26.1, 31, "뮤온이 보면 대기 두께가 [0.95 km]로 줄어 있습니다. 같은 결과, 다른 설명입니다."]]],
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
    ctx.fillStyle = MU; ctx.beginPath(); ctx.arc(24, 38, 6, 0, Math.PI * 2); ctx.fill();
    ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left";
    ctx.fillText("통통사과", 38, 43);
    ctx.font = `11px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)";
    ctx.fillText("· 나뭇잎", 98, 43);
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
    const lh = 30, y0 = H - 92 - (lines.length - 1) * lh + (1 - clamp(rise, 0, 1)) * 8;
    lines.forEach((ln, i) => { let x = 28; for (const t of ln) { ctx.fillStyle = t.hi ? C.sprout : C.paper; ctx.fillText(t.wd, x, y0 + i * lh); x += t.m; } });
    ctx.restore();
  }
  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left";
  };
  // 대기 기둥: 위 15 km, 아래 지표
  const TOP = 110, GROUND = 460, KM = (GROUND - TOP) / 15;
  function column(scale = 1) {
    const top = GROUND - (GROUND - TOP) * scale;
    const g = ctx.createLinearGradient(0, top, 0, GROUND);
    g.addColorStop(0, "rgba(43,58,79,.25)"); g.addColorStop(1, "rgba(80,120,160,.55)");
    ctx.fillStyle = g; ctx.fillRect(40, top, 280, GROUND - top);
    ctx.fillStyle = "#4a5d3a"; ctx.fillRect(0, GROUND, W, 8);
    return top;
  }
  function muon(x, y, r = 6, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = MU; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }

  function sceneBirth(lt) {
    column();
    label("15 km", 44, TOP - 6); label("지표", 44, GROUND - 6);
    const p = clamp(lt / 1.4, 0, 1);
    const hy = TOP - 60 + p * 60;
    ctx.strokeStyle = "rgba(243,244,239,.6)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(250, TOP - 60); ctx.lineTo(250 - p * 60, hy); ctx.stroke();
    if (p >= 1) {
      const q = clamp((lt - 1.4) / 2.5, 0, 1);
      for (let i = -3; i <= 3; i++) {
        const x = 190 + i * 10 * q * 3, y = TOP + q * 110;
        ctx.strokeStyle = "rgba(224,160,42,.35)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(190, TOP); ctx.lineTo(x, y); ctx.stroke();
        muon(x, y, 4);
      }
      label("뮤온 (전자보다 약 207배 무거운 입자)", 180, TOP + 150, MU, "center");
    } else { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(250 - p * 60, hy, 4, 0, Math.PI * 2); ctx.fill(); }
    label("양성자", 256, TOP - 58, "rgba(243,244,239,.7)");
  }

  function sceneDecay(lt) {
    const cx = 180, cy = 250;
    // 초시계
    ctx.strokeStyle = "rgba(243,244,239,.4)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI * 2); ctx.stroke();
    const p = clamp(lt / 3, 0, 1);
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, cy, 70, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
    label(`${(2.2 * p).toFixed(1)} μs`, cx, cy + 8, C.paper, "center", `600 26px ${MONO}`);
    if (p < 1) muon(cx, cy - 110, 9);
    else {
      const q = clamp((lt - 3) / 1, 0, 1);
      ctx.fillStyle = "#8fbfe0"; ctx.beginPath(); ctx.arc(cx - 50 * q, cy - 110 - 20 * q, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, cy - 110); ctx.lineTo(cx + 50 * q, cy - 130 * 1); ctx.moveTo(cx, cy - 110); ctx.lineTo(cx + 40 * q, cy - 110 + 30 * q); ctx.stroke(); ctx.setLineDash([]);
      label("전자", cx - 50 * q - 8, cy - 140 * 1 + 10 - 20 * q, "#8fbfe0", "right");
      label("중성미자 2개", cx + 50, cy - 80, "rgba(243,244,239,.5)");
    }
    label("평균 수명 τ = 2.197 μs (정지한 뮤온)", cx, 400, "rgba(243,244,239,.5)", "center");
  }

  function sceneNaive(lt) {
    column();
    label("15 km", 44, TOP - 6);
    const p = ease(clamp(lt / 2.2, 0, 1));
    const reach = TOP + 0.66 * KM * p;
    ctx.strokeStyle = MU; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(180, TOP); ctx.lineTo(180, reach); ctx.stroke();
    muon(180, reach, 6, p < 1 ? 1 : 0.35);
    if (p >= 1) {
      label("← 0.66 km에서 대부분 붕괴", 192, reach + 4, MU);
      ctx.strokeStyle = "rgba(243,244,239,.4)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(180, reach + 10); ctx.lineTo(180, GROUND); ctx.stroke(); ctx.setLineDash([]);
      label("남은 14.3 km", 192, (reach + GROUND) / 2, "rgba(243,244,239,.5)");
      if (lt > 3) label("지표까지 살아남을 확률: 약 100억 분의 1", 180, GROUND - 24, C.paper, "center", `12px ${MONO}`);
    }
  }

  function sceneDetect(lt) {
    column();
    ctx.fillStyle = "#6b7a8a"; ctx.fillRect(130, GROUND - 16, 100, 16);
    label("검출기", 180, GROUND + 26, "rgba(243,244,239,.6)", "center");
    const n = Math.floor(lt * 2.2);
    for (let i = 0; i < n; i++) {
      const x = 140 + ((i * 37) % 80), t0 = i / 2.2, y = TOP + (lt - t0) * 900;
      if (y < GROUND - 16) muon(x, y, 4);
    }
    label(`딸깍 × ${n}`, 180, GROUND - 40, C.sprout, "center", `600 18px ${MONO}`);
  }

  function sceneDilate(lt) {
    // 두 시계: 뮤온의 시계와 지표의 시계
    const drawClock = (x, y, frac, lab, col) => {
      ctx.strokeStyle = "rgba(243,244,239,.35)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 44, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      const a = -Math.PI / 2 + frac * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 36 * Math.cos(a), y + 36 * Math.sin(a)); ctx.stroke();
      label(lab, x, y + 64, "rgba(243,244,239,.7)", "center");
    };
    const p = clamp(lt / 4, 0, 1);
    drawClock(100, 170, p * 16 % 1, "지표의 시계", C.paper);
    drawClock(260, 170, p, "뮤온의 시계", MU);
    label(`${(50.1 * p).toFixed(1)} μs`, 100, 258, C.paper, "center", `600 15px ${MONO}`);
    label(`${(3.17 * p).toFixed(2)} μs`, 260, 258, MU, "center", `600 15px ${MONO}`);
    label("γ = 1/√(1 − 0.998²) ≈ 15.8", 180, 300, C.sprout, "center", `600 16px ${MONO}`);
    if (lt > 2.8) {
      ctx.save(); ctx.globalAlpha *= clamp((lt - 2.8) / 0.5, 0, 1);
      // 막대: 살아남는 비율
      const bx = 60, bw = 240;
      label("15 km를 지나 살아남는 비율", 180, 350, "rgba(243,244,239,.6)", "center");
      ctx.fillStyle = "rgba(243,244,239,.15)"; ctx.fillRect(bx, 362, bw, 14); ctx.fillRect(bx, 400, bw, 14);
      ctx.fillStyle = "rgba(243,244,239,.6)"; ctx.fillRect(bx, 362, 1, 14);
      ctx.fillStyle = MU; ctx.fillRect(bx, 400, bw * 0.236, 14);
      label("시간 지연 없다면: 약 10⁻¹⁰", bx, 392, "rgba(243,244,239,.6)");
      label("실제(시간 지연): 약 24%", bx, 430, MU);
      ctx.restore();
    }
  }

  function sceneContract(lt) {
    const p = ease(clamp(lt / 2, 0, 1));
    const scale = 1 - p * (1 - 1 / 15.8);
    const top = column(scale);
    label(`대기 두께 ${(15 - p * (15 - 0.95)).toFixed(2)} km`, 180, top - 10, C.paper, "center", `600 14px ${MONO}`);
    // 뮤온은 가만히 있고 땅이 다가온다
    muon(180, top + 4, 7);
    label("뮤온 기준: 땅이 0.998c로 다가옴", 180, 90, "rgba(243,244,239,.55)", "center");
    if (lt > 2.4) label("0.95 km ÷ 0.998c ≈ 3.2 μs  →  약 24% 생존", 180, 250, C.sprout, "center", `12px ${MONO}`);
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
  const poster = () => { if (!playing) { T = reduce ? 12.5 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
