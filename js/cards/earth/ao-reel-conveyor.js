/* 영상 카드: 통통사과 「천 년 걸리는 바닷물의 여행」 — 코드로 그리는 36초 숏폼 (모식 지도) */
(() => {
  const root = document.getElementById("video-earth-conveyor");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas");
  const phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek");
  const toggle = root.querySelector(".reel-toggle");
  const timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 36;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const COLD = "#6fa8dc", WARM = "#e8835f";

  const SCENES = [
    [0, 6, sceneIce, [[0.2, 6, "겨울 그린란드 앞바다. 바닷물이 식고, 얼음이 얼면서 [염류]는 물속에 남습니다."]]],
    [6, 12.5, sceneSink, [[6.1, 9.3, "차갑고 짜진 물은 무거워 [수천 m 아래]로 가라앉습니다."], [9.3, 12.5, "남극 바다에서 가라앉은 더 무거운 물은 그 [아래]를 흐릅니다."]]],
    [12.5, 22, sceneDeep, [[12.6, 17, "심층수는 대서양을 따라 내려가 [남극 둘레]를 돕니다."], [17, 22, "그리고 [인도양과 태평양]으로 아주 천천히 퍼집니다."]]],
    [22, 27, sceneAge, [[22.1, 27, "북태평양 깊은 곳의 물은 표층을 떠난 지 [천 년] 이상 지났습니다."]]],
    [27, 32, sceneReturn, [[27.1, 32, "천천히 떠오른 물은 [표층 해류]를 타고 다시 북대서양으로 돌아옵니다."]]],
    [32, 36, sceneWhy, [[32.1, 36, "이 순환이 [열·산소·이산화 탄소]를 깊은 바다까지 나릅니다."]]],
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
    const lh = 29, y0 = H - 90 - (lines.length - 1) * lh + (1 - clamp(rise, 0, 1)) * 8;
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
  function arrow(x1, y1, x2, y2, col, lw = 2) {
    const a = Math.atan2(y2 - y1, x2 - x1), hl = 7;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a - .45), y2 - hl * Math.sin(a - .45)); ctx.lineTo(x2 - hl * Math.cos(a + .45), y2 - hl * Math.sin(a + .45)); ctx.closePath(); ctx.fill();
  }

  /* 1. 결빙과 냉각 */
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const SALT = Array.from({ length: 46 }, () => ({ x: rnd(), y: rnd(), v: .4 + rnd() * .6 }));
  function sceneIce(lt) {
    const x0 = 40, x1 = 320, top = 190, bot = 420;
    // 찬 바람
    for (let i = 0; i < 3; i++) {
      const off = ((lt * 60 + i * 50) % 150);
      arrow(x0 + off - 20, 110 + i * 22, x0 + off + 40, 110 + i * 22, "rgba(243,244,239,.5)", 1.5);
    }
    label("찬 바람", x1, 104, "rgba(243,244,239,.55)", "right");
    // 바닷물 (식을수록 파랗게)
    const k = clamp(lt / 4, 0, 1);
    ctx.fillStyle = `rgba(${Math.round(70 - 30 * k)},${Math.round(110 - 20 * k)},${Math.round(150 + 20 * k)},.85)`;
    ctx.fillRect(x0, top, x1 - x0, bot - top);
    // 얼음 조각이 자란다
    const iw = (x1 - x0) * clamp((lt - .8) / 3, 0, .8);
    ctx.fillStyle = "#e8f0f5"; ctx.fillRect(x0 + 10, top - 8, iw, 14);
    if (iw > 20) label("얼음 (염류는 거의 빠짐)", x0 + 14, top - 16, "rgba(243,244,239,.7)");
    // 염류 알갱이는 물속에 남아 아래로 쌓임
    SALT.forEach((s) => {
      const y = top + 14 + s.y * (bot - top - 20) + clamp(lt - 1.5, 0, 4) * 10 * s.v;
      ctx.fillStyle = "rgba(255,255,255,.75)";
      ctx.beginPath(); ctx.arc(x0 + 8 + s.x * (x1 - x0 - 16), Math.min(bot - 4, y), 1.8, 0, Math.PI * 2); ctx.fill();
    });
    // 밀도 막대
    const bx = 330, bh = 150, fill = .35 + .55 * clamp((lt - .5) / 4.5, 0, 1);
    ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.lineWidth = 1; ctx.strokeRect(bx, top + 30, 10, bh);
    ctx.fillStyle = C.sprout; ctx.fillRect(bx, top + 30 + bh * (1 - fill), 10, bh * fill);
    label("밀도", bx + 5, top + 22, "rgba(243,244,239,.7)", "center");
    label(`수온 ${(6 - 7.8 * k).toFixed(1)} °C`, x0 + 6, bot + 22, C.paper, "left", `500 14px ${MONO}`);
  }

  /* 2. 대서양 남북 단면: 오른쪽이 북쪽 */
  function sceneSink(lt) {
    const x0 = 20, x1 = 340, top = 110, bot = 420;
    const Zy = (z) => top + z / 5000 * (bot - top);
    const g = ctx.createLinearGradient(0, top, 0, bot); g.addColorStop(0, "#35607f"); g.addColorStop(1, "#15283b");
    ctx.fillStyle = g; ctx.fillRect(x0, top, x1 - x0, bot - top);
    label("남극", x0, top - 10, "rgba(243,244,239,.6)"); label("북대서양", x1, top - 10, "rgba(243,244,239,.6)", "right");
    label("0", x0 - 4, top + 4, "rgba(243,244,239,.4)", "right"); label("5 km", x1 + 2, bot + 14, "rgba(243,244,239,.4)", "right");
    // 북대서양 심층수: 오른쪽에서 가라앉아 남쪽으로
    const p = ease(clamp(lt / 3.2, 0, 1));
    ctx.strokeStyle = COLD; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath();
    const sx = x1 - 30, dz = Zy(2500);
    ctx.moveTo(sx, top + 4);
    if (p < .45) ctx.lineTo(sx, top + 4 + (dz - top) * p / .45);
    else { ctx.lineTo(sx, dz); ctx.lineTo(sx - (sx - x0 - 30) * (p - .45) / .55, dz); }
    ctx.stroke();
    if (p > .5) label("북대서양 심층수", 190, dz - 12, COLD, "center");
    // 남극 저층수: 왼쪽에서 바닥을 따라 북쪽으로
    const q = ease(clamp((lt - 3.3) / 2.6, 0, 1));
    if (q > 0) {
      ctx.strokeStyle = "#9fc5e8"; ctx.beginPath();
      const bz = Zy(4500), ax = x0 + 26;
      ctx.moveTo(ax, top + 4);
      if (q < .4) ctx.lineTo(ax, top + 4 + (bz - top) * q / .4);
      else { ctx.lineTo(ax, bz); ctx.lineTo(ax + (x1 - x0 - 120) * (q - .4) / .6, bz); }
      ctx.stroke();
      if (q > .5) label("남극 저층수", 130, bz + 20, "#9fc5e8", "center");
    }
    ctx.lineCap = "butt";
    label("모식 단면 · 깊이 과장", 180, bot + 30, "rgba(243,244,239,.4)", "center");
  }

  /* 모식 지도 (경도 −160° ~ 200°, 대략적인 해안선) */
  const LAND = [
    [[-168,66],[-140,70],[-110,72],[-95,72],[-80,68],[-65,60],[-55,52],[-66,45],[-70,42],[-76,35],[-81,30],[-80,25],[-83,29],[-90,30],[-97,27],[-97,22],[-92,18],[-87,21],[-88,16],[-83,10],[-78,8],[-85,11],[-92,15],[-105,20],[-110,23],[-115,30],[-120,34],[-124,40],[-124,48],[-130,55],[-140,60],[-150,60],[-160,58],[-165,62]],
    [[-73,78],[-60,82],[-30,83],[-20,80],[-20,72],[-40,65],[-50,62],[-55,68],[-65,76]],
    [[-78,8],[-72,12],[-62,10],[-50,0],[-35,-5],[-39,-15],[-48,-26],[-58,-35],[-65,-42],[-68,-54],[-72,-50],[-74,-40],[-72,-30],[-71,-18],[-77,-12],[-81,-5],[-80,1]],
    [[-10,36],[-9,43],[-2,44],[-5,48],[3,51],[8,54],[10,57],[5,58],[5,62],[15,69],[28,71],[40,67],[60,70],[80,73],[100,77],[120,73],[140,72],[160,70],[180,68],[190,66],[180,65],[170,60],[160,55],[157,51],[155,58],[140,55],[140,48],[130,42],[127,38],[126,35],[122,31],[121,25],[110,21],[106,17],[109,12],[105,9],[100,13],[100,3],[104,1],[98,8],[98,16],[92,22],[88,22],[80,15],[77,8],[73,17],[70,22],[62,25],[57,26],[50,30],[48,29],[57,23],[59,22],[55,17],[44,12],[43,17],[35,28],[33,31],[35,36],[27,37],[26,40],[22,37],[20,40],[15,40],[16,38],[12,44],[8,44],[3,43],[-5,36]],
    [[-17,21],[-10,30],[-6,36],[10,37],[11,33],[20,31],[32,31],[35,28],[43,12],[51,12],[48,5],[40,-3],[40,-15],[35,-25],[27,-34],[20,-35],[18,-30],[12,-17],[13,-7],[9,-1],[9,4],[-3,5],[-8,4],[-13,8],[-17,14]],
    [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[135,-35],[129,-32],[115,-34]],
    [[95,5],[105,-6],[120,-9],[140,-8],[150,-6],[140,-2],[128,2],[118,6],[108,2]],
    [[130,31],[135,34],[141,36],[142,43],[145,44],[141,40],[137,37],[131,34]],
    [[-180,-70],[-120,-73],[-60,-64],[-55,-68],[0,-70],[60,-67],[120,-66],[180,-70],[220,-73],[220,-90],[-180,-90]],
  ];
  const M = { x0: 10, y0: 150, sx: 340 / 360, sy: 1.15 };
  const MX = (lon) => M.x0 + (lon + 160) * M.sx, MY = (lat) => M.y0 + (80 - lat) * M.sx * M.sy;
  const DEEP = [[-20,65],[-40,55],[-48,40],[-40,20],[-30,0],[-25,-20],[-20,-40],[0,-55],[40,-56],[80,-55],[120,-57],[160,-58],[190,-50],[188,-30],[184,-10],[180,10],[175,30],[172,42]];
  const DEEP_IND = [[80,-55],[82,-40],[80,-20],[75,-5]];
  const SURF = [[172,42],[160,25],[140,8],[126,-2],[115,-12],[90,-14],[65,-22],[38,-36],[15,-35],[5,-20],[-15,-8],[-40,5],[-62,15],[-80,26],[-72,36],[-48,44],[-28,56],[-20,65]];

  function mapBase() {
    const w = 340, h = 160 * M.sx * M.sy;
    ctx.save(); ctx.beginPath(); ctx.rect(M.x0, M.y0, w, h); ctx.clip();
    ctx.fillStyle = "#1f3a52"; ctx.fillRect(M.x0, M.y0, w, h);
    ctx.fillStyle = "#4a5a48";
    for (const poly of LAND) for (const sh of [0, 360, -360]) {
      ctx.beginPath(); poly.forEach(([lo, la], i) => (i ? ctx.lineTo(MX(lo + sh), MY(la)) : ctx.moveTo(MX(lo + sh), MY(la)))); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    label("모식 지도", M.x0 + w, M.y0 + h + 14, "rgba(243,244,239,.4)", "right");
  }
  function pathLen(P) { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(MX(P[i][0]) - MX(P[i - 1][0]), MY(P[i][1]) - MY(P[i - 1][1])); return L; }
  function drawPath(P, frac, col, lw, dash) {
    const L = pathLen(P) * frac; let acc = 0, end = null;
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(MX(P[0][0]), MY(P[0][1]));
    for (let i = 1; i < P.length; i++) {
      const ax = MX(P[i - 1][0]), ay = MY(P[i - 1][1]), bx = MX(P[i][0]), by = MY(P[i][1]), d = Math.hypot(bx - ax, by - ay);
      if (acc + d >= L) { const k = (L - acc) / d; end = [ax + (bx - ax) * k, ay + (by - ay) * k]; ctx.lineTo(end[0], end[1]); break; }
      ctx.lineTo(bx, by); acc += d; end = [bx, by];
    }
    ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = "butt";
    return end;
  }
  function dot(p, col) { if (!p) return; ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke(); }
  function legend() {
    const y = 360;
    ctx.fillStyle = COLD; ctx.fillRect(40, y - 4, 18, 3); label("깊은 바다의 흐름", 64, y, "rgba(243,244,239,.7)");
    ctx.fillStyle = WARM; ctx.fillRect(190, y - 4, 18, 3); label("표층의 흐름", 214, y, "rgba(243,244,239,.7)");
  }

  /* 3. 심층 경로 */
  function sceneDeep(lt, dur) {
    mapBase(); legend();
    const p = ease(clamp(lt / (dur - .8), 0, 1));
    const end = drawPath(DEEP, p, COLD, 3);
    if (p > .45) drawPath(DEEP_IND, clamp((p - .45) / .3, 0, 1), COLD, 3);
    dot(end, COLD);
    label("출발", MX(-20) + 8, MY(65) + 4, "rgba(243,244,239,.8)");
  }
  /* 4. 나이 */
  function sceneAge(lt) {
    mapBase(); legend();
    drawPath(DEEP, 1, COLD, 3); drawPath(DEEP_IND, 1, COLD, 3);
    const pulse = 1 + .25 * Math.sin(lt * 5);
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(MX(176), MY(30), 16 * pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.globalAlpha *= clamp((lt - .6) / .6, 0, 1);
    label("1000년+", 180, 440, C.sprout, "center", `600 44px ${MONO}`);
    label("탄소-14로 잰 심층수의 나이 (대략)", 180, 466, "rgba(243,244,239,.5)", "center");
    ctx.restore();
  }
  /* 5. 표층으로 돌아옴 */
  function sceneReturn(lt, dur) {
    mapBase(); legend();
    drawPath(DEEP, 1, "rgba(111,168,220,.45)", 3); drawPath(DEEP_IND, 1, "rgba(111,168,220,.45)", 3);
    const p = ease(clamp(lt / (dur - .6), 0, 1));
    dot(drawPath(SURF, p, WARM, 3), WARM);
  }
  /* 6. 왜 중요한가 */
  function sceneWhy(lt) {
    const items = [["열", "#e8835f"], ["산소", "#9fc5e8"], ["CO₂", C.sprout]];
    ctx.fillStyle = "#1f3a52"; ctx.fillRect(20, 200, 320, 230);
    ctx.fillStyle = "rgba(243,244,239,.15)"; ctx.fillRect(20, 200, 320, 2);
    items.forEach(([t, col], i) => {
      const x = 80 + i * 100, k = clamp((lt - .3 * i) / 2.2, 0, 1);
      label(t, x, 180, col, "center", `600 20px ${SANS}`);
      arrow(x, 205, x, 215 + 180 * ease(k), col, 3);
    });
    label("표층 → 심층", 180, 450, "rgba(243,244,239,.5)", "center");
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
  const poster = () => { if (!playing) { T = T || 19; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
