/* 영상: 감수 분열 30초 정리 — 코드로 그리는 숏폼 (2n = 4 모식) */
(() => {
  const root = document.getElementById("video-bio-meiosis");
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
  const MOM = "#e0766b", DAD = "#6f9fd0";

  const SCENES = [
    [0, 5, sceneCell, [[0.2, 5, "사람 체세포에는 염색체가 [46개], 모양이 같은 것끼리 23쌍 있습니다."]]],
    [5, 9.5, sceneCopy, [[5.1, 9.5, "분열 전에 DNA를 복제합니다. 염색체마다 [염색 분체] 두 가닥."]]],
    [9.5, 14.5, scenePair, [[9.6, 14.5, "감수 1분열. 상동 염색체끼리 [짝]을 지어 가운데에 섭니다."]]],
    [14.5, 19.5, sceneSplit1, [[14.6, 19.5, "짝이 갈라지면 세포마다 염색체 수가 [절반]. 46 → 23."]]],
    [19.5, 24, sceneSplit2, [[19.6, 24, "감수 2분열. 염색 분체가 갈라져 세포 [4개]가 됩니다."]]],
    [24, 30, sceneCombo, [[24.1, 27, "쌍마다 어느 쪽이 갈지는 [무작위]입니다."], [27, 30, "23쌍이면 2²³, 약 [840만] 가지."]]],
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
  // 염색체: sep = 두 염색 분체 사이 벌어짐(0이면 붙음), rep = 복제 정도(0~1)
  function chromo(x, y, len, col, rep = 0, sep = 0) {
    const cw = 9;
    ctx.fillStyle = col;
    const rod = (dx) => { ctx.beginPath(); ctx.roundRect(x + dx - cw / 2, y - len / 2, cw, len, cw / 2); ctx.fill(); };
    if (rep <= 0) rod(0);
    else { const o = (cw / 2 + .5) * rep + sep; rod(-o); rod(o); }
  }
  function cell(x, y, rx, ry) {
    ctx.fillStyle = "rgba(243,244,239,.07)"; ctx.strokeStyle = "rgba(243,244,239,.35)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  const SET = [[-38, -40, 70, MOM], [38, -46, 70, DAD], [-30, 50, 42, MOM], [34, 44, 42, DAD]];

  function sceneCell(lt) {
    cell(180, 280, 130, 140);
    SET.forEach(([dx, dy, L, c]) => chromo(180 + dx, 280 + dy, L, c));
    label("그림은 2쌍만 (2n = 4)", 180, 450, "rgba(243,244,239,.45)", "center");
    if (lt > 1.5) {
      label("어머니에게서", 70, 120, MOM); label("아버지에게서", 290, 120, DAD, "right");
    }
  }
  function sceneCopy(lt) {
    const p = ease(clamp((lt - .5) / 2, 0, 1));
    cell(180, 280, 130, 140);
    SET.forEach(([dx, dy, L, c]) => chromo(180 + dx, 280 + dy, L, c, p));
    label(`DNA 양 ${p > .99 ? "2배" : "…"}`, 180, 450, C.sprout, "center", `500 14px ${MONO}`);
    label("염색체 수는 그대로 4", 180, 470, "rgba(243,244,239,.45)", "center");
  }
  function scenePair(lt) {
    const p = ease(clamp((lt - .3) / 2.2, 0, 1));
    cell(180, 280, 130, 140);
    ctx.strokeStyle = "rgba(224,160,42,.7)"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(180, 160); ctx.lineTo(180, 400); ctx.stroke(); ctx.setLineDash([]);
    const tgt = [[-13, -45], [13, -45], [13, 45], [-13, 45]];
    SET.forEach(([dx, dy, L, c], i) => chromo(180 + dx + (tgt[i][0] - dx) * p, 280 + dy + (tgt[i][1] - dy) * p, L, c, 1));
    if (p > .95) { label("2가 염색체", 222, 240, C.sprout); label("2가 염색체", 222, 330, C.sprout); }
  }
  function sceneSplit1(lt) {
    const p = ease(clamp((lt - .3) / 2, 0, 1)), q = ease(clamp((lt - 2.4) / 1.2, 0, 1));
    if (q < .5) cell(180, 280, 130 + 20 * p, 140 - 20 * p);
    else { cell(100, 280, 72, 110); cell(260, 280, 72, 110); }
    const tgt = [[-80, -45], [80, -45], [80, 45], [-80, 45]];
    const base = [[-13, -45], [13, -45], [13, 45], [-13, 45]];
    SET.forEach(([, , L, c], i) => chromo(180 + base[i][0] + (tgt[i][0] - base[i][0]) * p, 280 + base[i][1], L, c, 1));
    if (q > .5) { label("n", 100, 420, C.sprout, "center", `600 22px ${MONO}`); label("n", 260, 420, C.sprout, "center", `600 22px ${MONO}`); }
  }
  function sceneSplit2(lt) {
    const p = ease(clamp((lt - .3) / 1.8, 0, 1)), q = lt > 2.4;
    const groups = [[100, [SET[0], SET[3]]], [260, [SET[1], SET[2]]]];
    if (!q) { cell(100, 280, 72 + 8 * p, 110); cell(260, 280, 72 + 8 * p, 110); }
    else [64, 136, 224, 296].forEach((x) => cell(x, 280, 34, 96));
    groups.forEach(([gx, chs]) => chs.forEach(([, , L, c], k) => {
      const yb = 280 + (k ? 45 : -45);
      if (!q) chromo(gx, yb, L, c, 1, 32 * p);
      else { chromo(gx - 36, yb, L, c); chromo(gx + 36, yb, L, c); }
    }));
    if (q) label("세포 4개 · 각각 n", 180, 470, C.sprout, "center", `500 14px ${MONO}`);
  }
  function sceneCombo(lt) {
    const n = 23, rows = 12, cw = 11, x0 = 180 - n * cw / 2;
    const k = Math.floor(lt * 5);
    for (let r = 0; r < rows; r++) {
      let s = (r + 1) * 9301 + Math.min(k, 30) * 49297;
      for (let i = 0; i < n; i++) {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        ctx.fillStyle = (s >> 16) & 1 ? DAD : MOM;
        ctx.globalAlpha = r < Math.min(rows, 1 + k / 2) ? 1 : 0;
        ctx.fillRect(x0 + i * cw, 110 + r * 22, cw - 1.5, 16);
      }
    }
    ctx.globalAlpha = 1;
    label("생식세포 하나 = 한 줄 (23쌍에서 하나씩)", 180, 400, "rgba(243,244,239,.5)", "center");
    if (lt > 3) label("2²³ = 8,388,608", 180, 440, C.sprout, "center", `600 24px ${MONO}`);
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
  const poster = () => { if (!playing) { T = reduce ? 11 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
