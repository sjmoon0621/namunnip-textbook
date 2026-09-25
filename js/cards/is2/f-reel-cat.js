/* 영상: 통통사과 「AI는 고양이를 어떻게 알아볼까」 — 코드로 그리는 34초 숏폼 (모식) */
(() => {
  const root = document.getElementById("video-is2-ai-cat");
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

  // 20×20 흑백 고양이 그림: 밝기 0(검정)~255(흰색)
  const ART = [
    "....................",
    "...#..........#.....",
    "...##........##.....",
    "...###......###.....",
    "...####....####.....",
    "...############.....",
    "...############.....",
    "...##oo####oo##.....",
    "...##oo####oo##.....",
    "...############.....",
    "...#####nn#####.....",
    "....##########......",
    ".....########.......",
    "....##########......",
    "...############.....",
    "..##############....",
    "..##############.##.",
    "..##############.#..",
    "..###############...",
    "..##############....",
  ];
  const VAL = { ".": 210, "#": 55, o: 230, n: 150 };
  let sd = 5;
  const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const IMG = ART.map((row) => [...row].map((ch) => Math.round(VAL[ch] + (rnd() - .5) * 16)));
  const G = 20;
  // 3×3 소벨 필터로 밝기가 갑자기 바뀌는 곳(윤곽)을 찾는다
  const px = (r, c) => IMG[clamp(r, 0, G - 1)][clamp(c, 0, G - 1)];
  const EDGE = IMG.map((row, r) => row.map((_, c) => {
    const gx = px(r - 1, c + 1) + 2 * px(r, c + 1) + px(r + 1, c + 1) - px(r - 1, c - 1) - 2 * px(r, c - 1) - px(r + 1, c - 1);
    const gy = px(r + 1, c - 1) + 2 * px(r + 1, c) + px(r + 1, c + 1) - px(r - 1, c - 1) - 2 * px(r - 1, c) - px(r - 1, c + 1);
    return Math.hypot(gx, gy);
  }));
  const EMAX = Math.max(...EDGE.flat());

  const SCENES = [
    [0, 5.5, scenePixels, [[0.2, 5.5, "컴퓨터에게 사진은 [숫자]가 빽빽한 격자입니다."]]],
    [5.5, 11.5, sceneScan, [[5.6, 11.5, "작은 창이 사진을 훑으며 밝기가 [갑자기 바뀌는 곳]을 찾습니다."]]],
    [11.5, 17, sceneParts, [[11.6, 17, "윤곽이 모이면 [뾰족한 귀], [둥근 눈] 같은 부분이 됩니다."]]],
    [17, 22, sceneScore, [[17.1, 22, "부분마다 점수를 매겨 더하면 [고양이일 가능성]이 나옵니다."]]],
    [22, 28.5, sceneTrain, [[22.1, 28.5, "점수 매기는 방법은 [이름표 붙은 사진]을 보며 틀릴 때마다 조금씩 고쳐 정합니다."]]],
    [28.5, 34, sceneLimit, [[28.6, 34, "그래서 고양이 [모양]이면 쿠션에도 높은 점수를 줄 수 있습니다."]]],
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
    ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left"; ctx.fillText("통통사과", 38, 43);
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
    const lh = 30, y0 = H - 92 - (lines.length - 1) * lh + (1 - clamp(rise, 0, 1)) * 8;
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
  const gray = (v) => `rgb(${v},${v},${v})`;
  function grid(data, x0, y0, cell, fn, upto = G * G) {
    for (let r = 0; r < G; r++) for (let c = 0; c < G; c++) {
      if (r * G + c >= upto) return;
      ctx.fillStyle = fn(data[r][c]); ctx.fillRect(x0 + c * cell, y0 + r * cell, cell - .5, cell - .5);
    }
  }
  const edgeCol = (v) => { const k = Math.round(255 * Math.min(1, v / EMAX)); return `rgb(${Math.round(k * .71)},${Math.round(k * .84)},${Math.round(k * .67)})`; };

  /* 1. 픽셀과 숫자 */
  function scenePixels(lt) {
    const cell = 12, x0 = (W - cell * G) / 2, y0 = 86;
    grid(IMG, x0, y0, cell, gray);
    const z = clamp((lt - 1.4) / 0.8, 0, 1);
    if (z > 0) {
      // 오른쪽 눈 주변 4×5칸을 확대해 숫자로
      const r0 = 6, c0 = 9, rows = 3, cols = 5;
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.strokeRect(x0 + c0 * cell, y0 + r0 * cell, cols * cell, rows * cell);
      ctx.save(); ctx.globalAlpha *= z;
      const zc = 38, zx = (W - zc * cols) / 2, zy = 356;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const v = IMG[r0 + r][c0 + c];
        ctx.fillStyle = gray(v); ctx.fillRect(zx + c * zc, zy + r * zc, zc - 1, zc - 1);
        ctx.font = `500 13px ${MONO}`; ctx.fillStyle = v > 128 ? C.night : C.paper; ctx.textAlign = "center";
        ctx.fillText(String(v), zx + c * zc + zc / 2, zy + r * zc + zc / 2 + 4);
      }
      ctx.textAlign = "left"; ctx.restore();
      label("0 = 검정, 255 = 흰색", W / 2, 344, "rgba(243,244,239,.5)", "center");
    }
    label("20 × 20 = 400개의 숫자", W / 2, 74, "rgba(243,244,239,.5)", "center");
  }

  /* 2. 3×3 창이 훑으며 윤곽 찾기 */
  function sceneScan(lt) {
    const cell = 7.5, xa = 24, xb = W - 24 - cell * G, y0 = 150;
    const k = Math.floor(clamp((lt - 0.4) / 4.6, 0, 1) * G * G);
    grid(IMG, xa, y0, cell, gray);
    ctx.fillStyle = "rgba(243,244,239,.06)"; ctx.fillRect(xb, y0, cell * G, cell * G);
    grid(EDGE, xb, y0, cell, edgeCol, k);
    if (k < G * G) {
      const r = Math.floor(k / G), c = k % G;
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
      ctx.strokeRect(xa + (c - 1) * cell, y0 + (r - 1) * cell, 3 * cell, 3 * cell);
      ctx.strokeRect(xb + c * cell, y0 + r * cell, cell, cell);
    }
    label("원래 사진", xa, y0 - 10); label("윤곽 지도", xb, y0 - 10);
    // 필터 모양
    const fx = W / 2 - 45, fy = 340, fc = 30, Kx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    Kx.forEach((row, r) => row.forEach((v, c) => {
      ctx.fillStyle = v > 0 ? "rgba(181,215,172,.35)" : v < 0 ? "rgba(212,73,58,.3)" : "rgba(243,244,239,.08)";
      ctx.fillRect(fx + c * fc, fy + r * fc, fc - 2, fc - 2);
      label(String(v), fx + c * fc + fc / 2 - 1, fy + r * fc + fc / 2 + 4, C.paper, "center", `500 13px ${MONO}`);
    }));
    label("3×3 창: 왼쪽과 오른쪽 밝기 차이를 계산", W / 2, fy + 3 * fc + 18, "rgba(243,244,239,.5)", "center");
  }

  /* 3. 윤곽이 모여 부분 특징 */
  function sceneParts(lt) {
    const cell = 13, x0 = (W - cell * G) / 2, y0 = 100;
    grid(EDGE, x0, y0, cell, edgeCol);
    const box = (r0, c0, rows, cols, t, d, below) => {
      const p = clamp((lt - d) / 0.5, 0, 1); if (!p) return;
      ctx.save(); ctx.globalAlpha *= p;
      ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.strokeRect(x0 + c0 * cell - 2, y0 + r0 * cell - 2, cols * cell + 4, rows * cell + 4);
      label(t, x0 + c0 * cell, below ? y0 + (r0 + rows) * cell + 16 : y0 + r0 * cell - 7, C.amber, "left", `600 12px ${SANS}`);
      ctx.restore();
    };
    box(1, 2, 5, 4, "귀?", 0.8); box(1, 12, 5, 4, "귀?", 1.1);
    box(6, 4, 4, 4, "눈?", 1.8, true); box(6, 10, 4, 4, "눈?", 2.0, true);
    if (lt > 2.8) label("실제 신경망은 이런 단계를 여러 층 거칩니다", W / 2, y0 + cell * G + 34, "rgba(243,244,239,.5)", "center");
  }

  function bars(pc, y, title) {
    label(title, 40, y - 14, "rgba(243,244,239,.6)");
    [["고양이", pc, C.amber], ["개", 1 - pc, "#4f7cae"]].forEach(([n, v, col], i) => {
      const yy = y + i * 42;
      label(n, 40, yy + 17, C.paper, "left", `600 15px ${SANS}`);
      ctx.fillStyle = "rgba(243,244,239,.1)"; ctx.fillRect(100, yy, 180, 24);
      ctx.fillStyle = col; ctx.fillRect(100, yy, 180 * v, 24);
      label(v.toFixed(2), 290, yy + 17, C.paper, "left", `500 14px ${MONO}`);
    });
  }

  /* 4. 점수 */
  function sceneScore(lt) {
    const items = [["뾰족한 귀", "+1.3"], ["둥근 눈", "+1.0"], ["짧은 주둥이", "+0.6"], ["늘어진 귀", "−0.2"]];
    items.forEach(([n, s], i) => {
      const p = clamp((lt - 0.3 - i * 0.4) / 0.4, 0, 1); if (!p) return;
      ctx.save(); ctx.globalAlpha *= p;
      label(n, 60, 140 + i * 36, C.paper, "left", `15px ${SANS}`);
      label(s, 300, 140 + i * 36, s.startsWith("−") ? "#8fb2d8" : C.sprout, "right", `500 15px ${MONO}`);
      ctx.restore();
    });
    const q = clamp((lt - 2.2) / 0.6, 0, 1);
    if (q) { ctx.save(); ctx.globalAlpha *= q; bars(0.94 * ease(q) + 0.5 * (1 - ease(q)), 330, "합계를 확률처럼 바꾸면 (모식)"); ctx.restore(); }
  }

  /* 5. 학습 */
  function sceneTrain(lt) {
    const p = ease(clamp((lt - 0.8) / 4, 0, 1));
    label("정답: 고양이", W / 2, 120, C.sprout, "center", `600 16px ${SANS}`);
    bars(0.4 + 0.54 * p, 190, p < 0.1 ? "처음에는 엉터리 점수" : "고칠수록 정답 쪽으로");
    label(p < 0.98 ? "틀린 만큼 가중치를 조금씩 수정" : "수많은 사진으로 되풀이", W / 2, 310, C.paper, "center", `500 14px ${SANS}`);
    // 사진 더미
    for (let i = 0; i < 7; i++) {
      const x = 70 + i * 34, y = 345 + (i % 2) * 8;
      ctx.fillStyle = "rgba(243,244,239,.1)"; ctx.fillRect(x, y, 28, 34);
      ctx.fillStyle = i % 3 ? C.amber : "#4f7cae"; ctx.fillRect(x + 4, y + 26, 20, 4);
    }
    label("이름표가 붙은 사진들", W / 2, 405, "rgba(243,244,239,.5)", "center");
  }

  /* 6. 한계: 고양이 모양 쿠션 */
  function sceneLimit(lt) {
    const cx = W / 2, cy = 190;
    ctx.fillStyle = "#c98fa6";
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy - 40); ctx.lineTo(cx - 58, cy - 92); ctx.lineTo(cx - 22, cy - 55);
    ctx.lineTo(cx + 22, cy - 55); ctx.lineTo(cx + 58, cy - 92); ctx.lineTo(cx + 70, cy - 40);
    ctx.quadraticCurveTo(cx + 84, cy + 50, cx, cy + 60); ctx.quadraticCurveTo(cx - 84, cy + 50, cx - 70, cy - 40); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.night;
    ctx.beginPath(); ctx.arc(cx - 26, cy - 5, 8, 0, Math.PI * 2); ctx.arc(cx + 26, cy - 5, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 6, cy + 14); ctx.lineTo(cx + 6, cy + 14); ctx.lineTo(cx, cy + 21); ctx.fill();
    label("고양이 모양 쿠션", cx, cy + 86, "rgba(243,244,239,.55)", "center");
    const q = clamp((lt - 0.9) / 0.6, 0, 1);
    if (q) { ctx.save(); ctx.globalAlpha *= q; bars(0.91, 330, "모델의 답 (모식)"); ctx.restore(); }
  }

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
  const poster = () => { if (!playing) { sync(); frame(T || 3); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
