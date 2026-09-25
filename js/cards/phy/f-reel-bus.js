/* 영상: 급정거한 버스 안에서 — 코드로 그리는 29초 숏폼 (관성) */
(() => {
  const root = document.getElementById("video-phy-bus");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas");
  const phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek");
  const toggle = root.querySelector(".reel-toggle");
  const timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 29;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const V0 = 10, A = 4, PX = 12; // 초속 10 m, 감속 4 m/s², 1 m = 12 px
  const TB = V0 / A;             // 2.5 s 만에 멈춤

  const SCENES = [
    [0, 5, sceneCruise, [[0.2, 5, "버스가 초속 [10 m](시속 36 km)로 달립니다. 서 있는 승객도 같은 빠르기로 달리는 중입니다."]]],
    [5, 11.5, sceneBrake, [[5.1, 8, "급정거. 버스는 1초에 [4 m/s]씩 느려져 2.5초 만에 섭니다."], [8, 11.5, "발은 바닥에 붙잡혀 함께 서지만, 몸의 윗부분은 [하던 대로] 계속 가려 합니다."]]],
    [11.5, 17, sceneForces, [[11.6, 14.3, "그럼 누가 나를 앞으로 밀었을까요? [아무도] 밀지 않았습니다."], [14.3, 17, "버스 밖에서 보면, 바닥이 발만 [뒤로] 잡아당겼을 뿐입니다."]]],
    [17, 23, sceneHandle, [[17.1, 23, "손잡이를 잡으면 버스가 손을 통해 몸을 뒤로 당겨 줍니다. 60 kg이면 [240 N]."]]],
    [23, 29, sceneStart, [[23.1, 26.2, "출발할 때는 반대로 [뒤로] 쏠립니다. 멈춰 있던 몸은 계속 멈춰 있으려 하니까요."], [26.2, 29, "알짜힘이 0이면 운동 상태는 그대로. 이것이 [관성]입니다."]]],
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
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(21, 38, 6.5, 0, Math.PI * 2); ctx.arc(27, 38, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left";
    ctx.fillText("통통사과", 38, 43);
    ctx.font = `11px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)"; ctx.fillText("· 나뭇잎", 98, 43);
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
    const lh = 30, y0 = H - 84 - (lines.length - 1) * lh + (1 - clamp(rise, 0, 1)) * 8;
    lines.forEach((ln, i) => { let x = 28; for (const t of ln) { ctx.fillStyle = t.hi ? C.sprout : C.paper; ctx.fillText(t.wd, x, y0 + i * lh); x += t.m; } });
    ctx.restore();
  }

  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left";
  };
  function arrow(x0, y0, x1, y1, col, lw = 3) {
    const a = Math.atan2(y1 - y0, x1 - x0), hl = 11;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - hl * 0.8 * Math.cos(a), y1 - hl * 0.8 * Math.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - hl * Math.cos(a - 0.45), y1 - hl * Math.sin(a - 0.45));
    ctx.lineTo(x1 - hl * Math.cos(a + 0.45), y1 - hl * Math.sin(a + 0.45)); ctx.fill();
  }

  const GY = 330; // 도로 높이
  // 버스: 앞쪽이 오른쪽. (cx: 버스 중심 x)  길이 12 m
  function bus(cx, sc = 1) {
    const L = 12 * PX * sc, Hh = 3 * PX * sc * 1.25, x0 = cx - L / 2, y0 = GY - Hh - 8 * sc;
    ctx.fillStyle = "#3f7d4a"; ctx.beginPath(); ctx.roundRect(x0, y0, L, Hh, 8 * sc); ctx.fill();
    ctx.fillStyle = "rgba(200,225,235,.35)";
    for (let i = 0; i < 5; i++) ctx.fillRect(x0 + 10 * sc + i * (L - 20 * sc) / 5, y0 + 7 * sc, (L - 20 * sc) / 5 - 5 * sc, Hh * 0.38);
    ctx.fillStyle = "#1b1b1b";
    ctx.beginPath(); ctx.arc(x0 + L * 0.2, GY - 6 * sc, 8 * sc, 0, Math.PI * 2); ctx.arc(x0 + L * 0.8, GY - 6 * sc, 8 * sc, 0, Math.PI * 2); ctx.fill();
    return { x0, y0, L, Hh, floor: GY - 12 * sc };
  }
  // 서 있는 사람: 발 (fx, fy), 기울기 lean(라디안, +면 앞쪽=오른쪽)
  function person(fx, fy, lean, sc = 1, col = C.amber) {
    const Lb = 30 * sc;
    const hx = fx + Math.sin(lean) * Lb, hy = fy - Math.cos(lean) * Lb;
    ctx.strokeStyle = col; ctx.lineWidth = 5 * sc; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(hx + Math.sin(lean) * 7 * sc, hy - Math.cos(lean) * 7 * sc, 6 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.lineCap = "butt";
    return { hx, hy };
  }
  function road(offset) {
    ctx.fillStyle = "rgba(243,244,239,.12)"; ctx.fillRect(0, GY, W, 2);
    ctx.strokeStyle = "rgba(243,244,239,.25)"; ctx.lineWidth = 2;
    for (let k = -1; k < 12; k++) {
      const x = ((k * 5 * PX - offset) % (5 * PX * 12) + 5 * PX * 12) % (5 * PX * 12) - 30;
      ctx.beginPath(); ctx.moveTo(x, GY + 16); ctx.lineTo(x + 24, GY + 16); ctx.stroke();
    }
  }

  /* 1. 일정한 속력: 카메라가 버스를 따라감 */
  function sceneCruise(lt) {
    road(lt * V0 * PX);
    const b = bus(180);
    person(170, b.floor, 0);
    arrow(210, 200, 280, 200, C.sprout, 2.5);
    label("v = 10 m/s", 245, 190, C.sprout, "center");
    label("버스도, 승객도", 180, 150, "rgba(243,244,239,.6)", "center", `13px ${SANS}`);
  }

  /* 2. 급정거: 카메라는 땅에 고정. 몸의 윗부분이 앞으로 쏠림 (모식) */
  const T0 = 0.4; // 장면 시작 뒤 0.4초에 브레이크
  const busX = (t) => t < T0 ? V0 * t : t < T0 + TB ? V0 * T0 + V0 * (t - T0) - 0.5 * A * (t - T0) ** 2 : V0 * T0 + V0 * TB - 0.5 * A * TB * TB;
  // 몸 기울기: 발을 축으로 한 뒤집힌 진자 + 버스 좌표계의 관성 효과. 20°에서 한 발 내디뎌 멈춘다고 봄.
  const leanTable = (() => {
    const out = []; let th = 0, om = 0; const Lc = 1.0, dt = 0.005;
    for (let t = 0; t <= 6.5; t += dt) {
      const a = t > T0 && t < T0 + TB ? A : 0;
      const al = (9.81 * Math.sin(th) + a * Math.cos(th)) / Lc - (a ? 0 : 6 * om + 30 * th);
      om += al * dt; th += om * dt;
      if (th > 0.35) { th = 0.35; om = Math.min(om, 0); }
      if (th < 0) { th = 0; om = Math.max(0, om); }
      out.push(th);
    }
    return out;
  })();
  function sceneBrake(lt) {
    road(0);
    const bx = 80 + busX(lt) * PX;
    const b = bus(bx);
    const lean = leanTable[Math.min(leanTable.length - 1, Math.floor(lt / 0.005))];
    const p = person(bx - 10, b.floor, lean);
    if (lt > T0) {
      // 버스가 없었다면 몸은 초속 10 m로 계속 갔을 것
      const gx = bx - 10 + (V0 * (lt - T0) - (busX(lt) - busX(T0))) * PX;
      ctx.save(); ctx.globalAlpha *= 0.55; ctx.setLineDash([3, 4]);
      ctx.strokeStyle = C.sprout; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(gx + (p.hx - bx + 10), p.hy - 7, 6, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      if (gx - bx > 40) label("아무것도 붙잡지 않았다면", gx + (p.hx - bx + 10), p.hy - 22, C.sprout, "center");
    }
    const v = lt < T0 ? V0 : Math.max(0, V0 - A * (lt - T0));
    label(`버스 속력 ${v.toFixed(1)} m/s`, 28, 130, C.paper, "left", `500 15px ${MONO}`);
    label(`몸 기울기 ${(lean * 180 / Math.PI).toFixed(0)}°`, 28, 152, C.sprout, "left", `500 15px ${MONO}`);
    label("사람 모습은 모식", 28, 172);
  }

  /* 3. 힘 그림: 앞으로 미는 힘은 없다 */
  function sceneForces(lt) {
    const b = bus(180, 1.6);
    ctx.fillStyle = "rgba(243,244,239,.12)"; ctx.fillRect(0, GY, W, 2);
    const fx = 150, p = person(fx, b.floor, 0.3, 1.6);
    // 발에 작용하는 마찰력 (뒤로)
    arrow(fx, b.floor - 4, fx - 70, b.floor - 4, C.amber, 3.5);
    label("바닥이 발을 뒤로", fx - 38, b.floor + 20, C.amber, "center", `600 12px ${SANS}`);
    // 없는 힘: 앞으로 미는 힘
    if (lt > 0.8) {
      ctx.save(); ctx.globalAlpha *= clamp((lt - 0.8) / 0.4, 0, 1);
      ctx.setLineDash([5, 5]); arrow(p.hx - 30, p.hy + 6, p.hx + 60, p.hy + 6, "rgba(243,244,239,.5)", 2.5); ctx.setLineDash([]);
      ctx.strokeStyle = C.apple; ctx.lineWidth = 3;
      const mx = p.hx + 15, my = p.hy + 6;
      ctx.beginPath(); ctx.moveTo(mx - 12, my - 12); ctx.lineTo(mx + 12, my + 12); ctx.moveTo(mx + 12, my - 12); ctx.lineTo(mx - 12, my + 12); ctx.stroke();
      label("앞으로 미는 힘: 없음", mx, my - 22, C.apple, "center", `600 13px ${SANS}`);
      ctx.restore();
    }
  }

  /* 4. 손잡이: F = ma */
  function sceneHandle(lt) {
    const b = bus(180, 1.6);
    ctx.fillStyle = "rgba(243,244,239,.12)"; ctx.fillRect(0, GY, W, 2);
    // 손잡이 봉
    ctx.strokeStyle = "rgba(243,244,239,.6)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(b.x0 + 8, b.y0 + 12); ctx.lineTo(b.x0 + b.L - 8, b.y0 + 12); ctx.stroke();
    const fx = 170, p = person(fx, b.floor, 0.04, 1.6);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(p.hx - 2, p.hy + 16); ctx.lineTo(p.hx - 22, b.y0 + 13); ctx.stroke(); ctx.lineCap = "butt";
    arrow(p.hx - 20, b.y0 + 40, p.hx - 90, b.y0 + 40, C.sprout, 3.5);
    label("손잡이가 당기는 힘", p.hx - 55, b.y0 + 60, C.sprout, "center", `600 12px ${SANS}`);
    if (lt > 1) {
      ctx.save(); ctx.globalAlpha *= clamp((lt - 1) / 0.5, 0, 1);
      label("F = m a", 180, 150, C.paper, "center", `italic 34px ${NM.F.serif}`);
      label("= 60 kg × 4 m/s² = 240 N", 180, 178, C.sprout, "center", `500 15px ${MONO}`);
      label("(24 kg짜리 물건을 드는 힘)", 180, 198, "rgba(243,244,239,.5)", "center");
      ctx.restore();
    }
  }

  /* 5. 출발: 뒤로 쏠림 */
  function sceneStart(lt) {
    const t = Math.max(0, lt - 0.6), a = 1.5;
    road(0.5 * a * t * t * PX * 3);
    const b = bus(180);
    const lean = -0.28 * ease(clamp(t / 0.8, 0, 1)) * (t < 2.4 ? 1 : clamp(1 - (t - 2.4) / 0.6, 0, 1));
    person(175, b.floor, lean);
    if (t > 0.1 && t < 3) arrow(250, 200, 250 + 40 * clamp(t, 0, 1), 200, C.sprout, 2.5);
    if (lt > 3.2) {
      ctx.save(); ctx.globalAlpha *= clamp((lt - 3.2) / 0.5, 0, 1);
      label("ΣF = 0  →  v 그대로", 180, 150, C.paper, "center", `500 20px ${MONO}`);
      ctx.restore();
    }
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
  const poster = () => { if (!playing) { T = reduce ? 9 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
