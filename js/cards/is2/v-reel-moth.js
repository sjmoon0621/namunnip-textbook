/* 영상: 흰 나방, 검은 나방 — 회색가지나방의 공업 암화 (코드로 그리는 32초 숏폼) */
(() => {
  const root = document.getElementById("video-is2-moth");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas"), phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek"), toggle = root.querySelector(".reel-toggle"), timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 32;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const SCENES = [
    [0, 5.5, sLight, [[0.2, 5.5, "영국의 회색가지나방은 대부분 [흰 바탕에 검은 점]이 있었습니다."]]],
    [5.5, 11, sSoot, [[5.6, 11, "[1848년], 공장 굴뚝의 그을음이 나무를 덮던 맨체스터에서 온몸이 검은 나방이 처음 기록됩니다."]]],
    [11, 17, sRise, [[11.1, 17, "[1895년] 무렵, 맨체스터 부근 나방의 약 [98%]가 검은 나방이었습니다."]]],
    [17, 22.5, sClean, [[17.1, 22.5, "[1956년] 대기 오염을 줄이는 법이 생기고 나무껍질이 밝아지자, 검은 나방은 다시 [드물어졌습니다]."]]],
    [22.5, 27.5, sVar, [[22.6, 27.5, "나방이 색을 바꾼 것이 아닙니다. 검은 나방은 원래 드물게 있던 [변이]였습니다."]]],
    [27.5, 32, sSum, [[27.6, 32, "새에게 덜 들킨 쪽이 더 많이 살아남아 [자손을 남겼을] 뿐입니다."]]],
  ];
  let T = 0, playing = false, userPaused = false;

  const rng = (() => { let s = 5; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
  const SPOTS = Array.from({ length: 40 }, () => [rng(), rng(), 3 + rng() * 9]);
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (c1, c2, t) => `rgb(${[0, 1, 2].map((k) => Math.round(lerp(c1[k], c2[k], t)))})`;
  const LIGHT = [205, 202, 186], DARK = [52, 50, 46];

  function bark(t, y0 = 70, y1 = 470) {
    ctx.fillStyle = mix(LIGHT, DARK, t); ctx.fillRect(40, y0, 280, y1 - y0);
    // 지의류 얼룩 (그을음에 덮이면 사라짐)
    for (const [x, y, r] of SPOTS) {
      ctx.fillStyle = `rgba(170,190,150,${0.55 * (1 - t)})`;
      ctx.beginPath(); ctx.arc(40 + x * 280, y0 + y * (y1 - y0), r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = `rgba(0,0,0,${0.12 + 0.1 * t})`; ctx.lineWidth = 2;
    for (let k = 0; k < 6; k++) { const x = 60 + k * 48; ctx.beginPath(); ctx.moveTo(x, y0); ctx.bezierCurveTo(x + 10, y0 + 120, x - 10, y1 - 120, x + 5, y1); ctx.stroke(); }
  }
  function moth(x, y, s, dark, alpha = 1) {
    ctx.save(); ctx.globalAlpha *= alpha;
    const body = dark ? "#26241f" : "#e9e5d8";
    ctx.fillStyle = body; ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 1;
    for (const sg of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(x, y - s * .15); ctx.lineTo(x + sg * s, y - s * .5); ctx.lineTo(x + sg * s * .85, y + s * .45); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (!dark) { ctx.fillStyle = "#3a3833"; for (let k = 0; k < 7; k++) { const a = k * 2.1; ctx.beginPath(); ctx.arc(x + Math.cos(a) * s * .55, y + Math.sin(a) * s * .25, s * .06, 0, Math.PI * 2); ctx.fill(); } }
    ctx.fillStyle = "#1c1a17"; ctx.fillRect(x - s * .06, y - s * .3, s * .12, s * .7);
    ctx.restore();
  }
  function bird(x, y, s) {
    ctx.fillStyle = "#4b3b2e";
    ctx.beginPath(); ctx.ellipse(x, y, s, s * .6, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x - s * .8, y - s * .5, s * .45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(x - s * 1.2, y - s * .55); ctx.lineTo(x - s * 1.6, y - s * .4); ctx.lineTo(x - s * 1.2, y - s * .35); ctx.fill();
  }
  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left"; };

  function sLight(lt) {
    bark(0, 70, 440);
    moth(180, 250, 30 + 2 * Math.sin(lt * 2), false);
    moth(110, 380, 16, false); moth(250, 150, 16, false);
    label("Biston betularia", 180, 470, "rgba(243,244,239,.55)", "center", `italic 13px ${NM.F.serif}`);
    label("밝은 지의류가 덮인 나무껍질 위", 180, 490, "rgba(243,244,239,.45)", "center");
  }
  function sSoot(lt) {
    const t = ease(clamp(lt / 3.5, 0, 1));
    bark(t, 70, 400);
    moth(130, 220, 22, false); moth(240, 330, 22, true, clamp((lt - 2.5) / 0.8, 0, 1));
    label("1848", 180, 440, C.sprout, "center", `600 28px ${MONO}`);
  }
  function sRise(lt) {
    bark(1, 70, 300);
    const p = ease(clamp((lt - 0.4) / 3, 0, 1));
    // 나방 20마리 중 검은 나방 비율
    for (let i = 0; i < 20; i++) {
      const dark = i / 20 < 0.02 + 0.96 * p;
      moth(70 + (i % 5) * 55, 100 + Math.floor(i / 5) * 50, 13, dark);
    }
    // 흰 나방을 노리는 새
    if (lt > 3.6) bird(300 - (lt - 3.6) * 20, 250, 13);
    const bx = 50, bw = 260, by = 350;
    ctx.fillStyle = "rgba(243,244,239,.12)"; ctx.fillRect(bx, by, bw, 22);
    ctx.fillStyle = "#26241f"; ctx.fillRect(bx, by, bw * (0.02 + 0.96 * p), 22);
    ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.strokeRect(bx + .5, by + .5, bw, 22);
    label(`검은 나방 ${Math.round(2 + 96 * p)}%`, bx, by + 44, C.paper, "left", `500 15px ${MONO}`);
    label(`${Math.round(1848 + 47 * p)}`, bx + bw, by + 44, C.sprout, "right", `500 15px ${MONO}`);
    label("1848년의 비율은 기록이 없어 그림은 모식", bx, by + 66);
  }
  function sClean(lt) {
    const t = 1 - ease(clamp(lt / 3.2, 0, 1));
    bark(t, 70, 300);
    for (let i = 0; i < 20; i++) moth(70 + (i % 5) * 55, 100 + Math.floor(i / 5) * 50, 13, i / 20 < 0.98 * t + 0.02);
    label("1956  청정 대기법", 180, 350, C.sprout, "center", `600 18px ${MONO}`);
    label("그 뒤 수십 년에 걸쳐 검은 나방 감소", 180, 374, "rgba(243,244,239,.55)", "center");
  }
  function sVar(lt) {
    // 흰 나방 사이에 검은 나방 하나 — 원래 있던 변이
    for (let i = 0; i < 24; i++) moth(60 + (i % 6) * 48, 110 + Math.floor(i / 6) * 55, 13, i === 14);
    const p = clamp((lt - 1) / 0.6, 0, 1);
    ctx.strokeStyle = `rgba(181,215,172,${p})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(60 + 2 * 48, 110 + 2 * 55, 22, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.globalAlpha *= clamp((lt - 1.6) / 0.6, 0, 1);
    label("검은 색을 만드는 유전자 변이", 180, 380, C.sprout, "center", `600 15px ${SANS}`);
    label("1819년 무렵 생긴 것으로 추정 (2016년 연구)", 180, 402, "rgba(243,244,239,.55)", "center");
    ctx.restore();
  }
  function sSum(lt) {
    const items = ["개체마다 다르다 (변이)", "그 차이가 자식에게 전해진다 (유전)", "환경에 따라 살아남는 수가 다르다", "→ 집단의 구성이 바뀐다 (진화)"];
    items.forEach((s, i) => {
      ctx.save(); ctx.globalAlpha *= clamp((lt - 0.3 - i * 0.5) / 0.4, 0, 1);
      label(s, 40, 170 + i * 48, i === 3 ? C.sprout : C.paper, "left", `${i === 3 ? 700 : 500} 17px ${SANS}`);
      ctx.restore();
    });
  }

  function frame(time) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
    for (const [s, e, fn, caps] of SCENES) {
      if (time < s || time >= e) continue;
      const lt = time - s, dur = e - s;
      ctx.save(); ctx.globalAlpha = clamp(Math.min(1, lt / 0.35, (dur - lt) / 0.35), 0, 1); fn(lt, dur); ctx.restore();
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
    ctx.fillStyle = "#d4493a"; ctx.beginPath(); ctx.arc(21, 39, 6.4, 0, Math.PI * 2); ctx.arc(27, 39, 6.4, 0, Math.PI * 2); ctx.fill();
    ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left"; ctx.fillText("통통사과", 38, 43);
    ctx.font = `11px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)"; ctx.fillText("· 나뭇잎", 98, 43);
  }
  function caption(text, alpha, rise) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.font = `700 20px ${SANS}`;
    const words = []; let hi = false;
    for (const part of text.split(/(\[|\])/)) {
      if (part === "[") { hi = true; continue; } if (part === "]") { hi = false; continue; }
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
  const poster = () => { if (!playing) { T = reduce ? 14 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
