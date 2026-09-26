/* 영상: 통통사과 「공기로 비료를, 석유로 옷을 — 화학이 바꾼 것들」 — 코드로 그리는 32초 숏폼 */
(() => {
  const root = document.getElementById("video-chem-society");
  if (!root) return;
  const { C, clamp, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas"), phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek"), toggle = root.querySelector(".reel-toggle"), timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 32;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const N_C = "#6f8fcf", H_C = "#e9e9e2", O_C = C.apple, CA_C = "#c9c9c2", C_C = "#8d8d92";

  const SCENES = [
    [0, 5.5, sAir, [[0.2, 5.5, "공기의 [78%]는 질소. 그런데 작물은 이 질소를 쓰지 못합니다."]]],
    [5.5, 11, sHaber, [[5.6, 11, "1913년, 하버–보슈법. 고온·고압에서 [N₂ + 3H₂ → 2NH₃]."]]],
    [11, 16, sFood, [[11.1, 16, "암모니아는 비료가 되고, 오늘날 인류의 [절반가량]이 그 비료로 기른 식량을 먹습니다."]]],
    [16, 21, sNylon, [[16.1, 21, "1935년 나일론. 작은 분자를 [사슬]처럼 이어 붙여 만든 섬유입니다."]]],
    [21, 26, sCement, [[21.1, 26, "시멘트는 석회석을 구워 만듭니다. [CaCO₃ → CaO + CO₂]."]]],
    [26, 32, sCost, [[26.1, 32, "해결에는 대가도 따릅니다. 그 대가를 줄이는 방법을 찾는 것도 [화학]입니다."]]],
  ];

  const atom = (x, y, r, c) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); };
  const label = (t, x, y, col = "rgba(243,244,239,.6)", font = `12px ${MONO}`, al = "center") => { ctx.font = font; ctx.fillStyle = col; ctx.textAlign = al; ctx.fillText(t, x, y); };
  const n2 = (x, y, a = 0) => { atom(x - 7 * Math.cos(a), y - 7 * Math.sin(a), 8, N_C); atom(x + 7 * Math.cos(a), y + 7 * Math.sin(a), 8, N_C); };

  function sAir(lt) {
    let s = 5;
    const rnd = () => ((s = s * 16807 % 2147483647) / 2147483647);
    for (let i = 0; i < 26; i++) {
      const x = 40 + rnd() * 280, y = 110 + rnd() * 250, a = rnd() * 6 + lt * (rnd() - .5);
      const isN = i < 20;
      if (isN) n2(x + Math.sin(lt + i) * 6, y + Math.cos(lt * .8 + i) * 6, a);
      else { atom(x - 6, y, 7.5, O_C); atom(x + 6, y, 7.5, O_C); }
    }
    label("N ≡ N  삼중 결합 — 끊기 매우 어렵다", 180, 400, C.sprout, `13px ${SANS}`);
    // 새싹
    ctx.strokeStyle = C.leaf; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(180, 470); ctx.lineTo(180, 430); ctx.stroke();
    ctx.fillStyle = C.leaf; ctx.beginPath(); ctx.ellipse(168, 432, 12, 5, -0.5, 0, 6.3); ctx.ellipse(192, 428, 12, 5, 0.5, 0, 6.3); ctx.fill();
  }
  function sHaber(lt) {
    // 반응기
    ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(110, 130, 140, 230, 30) : ctx.rect(110, 130, 140, 230); ctx.stroke();
    label("약 450 °C · 200 atm · 철 촉매", 180, 390, "rgba(243,244,239,.65)", `12px ${MONO}`);
    const p = clamp((lt - 0.8) / 3, 0, 1);
    for (let k = 0; k < 3; k++) {
      const cy = 170 + k * 65;
      if (p < 0.5) {
        const f = p * 2;
        n2(150 + f * 15, cy, 0);
        for (let j = 0; j < 3; j++) { atom(205 - f * 10, cy - 18 + j * 18, 6, H_C); atom(215 - f * 10, cy - 18 + j * 18, 6, H_C); }
      } else {
        for (const dx of [-22, 22]) { atom(180 + dx, cy, 9, N_C); for (let j = 0; j < 3; j++) { const a = j * 2.09 + (dx > 0 ? 0 : 1); atom(180 + dx + Math.cos(a) * 12, cy + Math.sin(a) * 12, 5.5, H_C); } }
      }
    }
    label(p < 0.5 ? "N₂ + 3H₂" : "2NH₃", 180, 112, C.paper, `600 20px ${MONO}`);
  }
  function sFood(lt) {
    // 인구 막대: 1900 16억, 2020 78억
    const bars = [[1900, 16.5], [1960, 30.2], [2020, 78.4]];
    bars.forEach(([y, p], i) => {
      const x = 80 + i * 100, hh = p * 3.2 * clamp((lt - i * 0.4) / 0.8, 0, 1);
      ctx.fillStyle = i === 2 ? C.sprout : "rgba(243,244,239,.35)"; ctx.fillRect(x - 24, 420 - hh, 48, hh);
      label(`${y}`, x, 440); label(`${Math.round(p)}억`, x, 412 - hh, C.paper, `600 14px ${MONO}`);
    });
    label("세계 인구", 180, 140, "rgba(243,244,239,.6)", `13px ${SANS}`);
  }
  function sNylon(lt) {
    const n = Math.floor(clamp(lt / 3.5, 0, 1) * 8) + 1;
    for (let i = 0; i < 8; i++) {
      const x = 40 + i * 37, y = 260 + Math.sin(i * 0.9 + lt) * 10;
      const on = i < n;
      ctx.globalAlpha *= on ? 1 : 0.3;
      ctx.fillStyle = i % 2 ? "#9a86c9" : "#c9a227"; ctx.fillRect(x - 13, y - 9, 26, 18);
      ctx.globalAlpha /= on ? 1 : 0.3;
      if (on && i < n - 1 && i < 7) { ctx.strokeStyle = C.paper; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 13, y); ctx.lineTo(x + 24, 260 + Math.sin((i + 1) * 0.9 + lt) * 10); ctx.stroke(); }
    }
    label("단위체 → 고분자 (모식)", 180, 330, "rgba(243,244,239,.6)", `12px ${MONO}`);
    label("스타킹, 낙하산, 밧줄", 180, 360, C.sprout, `14px ${SANS}`);
  }
  function sCement(lt) {
    // 가마
    ctx.fillStyle = "rgba(224,160,42,.18)"; ctx.fillRect(60, 200, 240, 90);
    ctx.strokeStyle = "rgba(243,244,239,.4)"; ctx.strokeRect(60, 200, 240, 90);
    label("가마 약 1450 °C", 180, 190, "rgba(243,244,239,.6)");
    const p = clamp((lt - 0.5) / 2.5, 0, 1);
    for (let k = 0; k < 4; k++) {
      const x = 90 + k * 60, y = 245;
      atom(x, y, 10, CA_C);
      if (p < 1) { ctx.globalAlpha *= 1 - p; atom(x + 14, y, 7, C_C); atom(x + 24, y - 6, 6, O_C); atom(x + 24, y + 6, 6, O_C); ctx.globalAlpha /= 1 - p || 1; }
      atom(x - 12, y + 3, 6.5, O_C);
      // 빠져나가는 CO₂
      const cy = y - p * 150;
      if (p > 0) { atom(x + 14, cy, 6, C_C); atom(x + 4, cy, 5.5, O_C); atom(x + 24, cy, 5.5, O_C); }
    }
    label("CO₂", 300, 90, C.sprout, `600 14px ${MONO}`);
    label("건물의 뼈대인 콘크리트", 180, 350, C.paper, `14px ${SANS}`);
  }
  function sCost(lt) {
    const rows = [["암모니아 합성", "세계 에너지 사용의 약 1~2%"], ["시멘트 생산", "세계 CO₂ 배출의 약 8%"], ["흘러 나간 질소", "강과 바다의 부영양화"]];
    rows.forEach(([a, b], i) => {
      ctx.save(); ctx.globalAlpha *= clamp((lt - i * 0.6) / 0.5, 0, 1);
      label(a, 40, 190 + i * 70, C.paper, `700 17px ${SANS}`, "left");
      label(b, 40, 214 + i * 70, C.sprout, `13px ${SANS}`, "left");
      ctx.restore();
    });
  }

  function chrome(time) {
    const gap = 4, k = SCENES.length, sw = (W - 24 - gap * (k - 1)) / k;
    SCENES.forEach(([s, e], i) => {
      const x = 12 + i * (sw + gap);
      ctx.fillStyle = "rgba(243,244,239,.25)"; ctx.fillRect(x, 12, sw, 2.5);
      ctx.fillStyle = C.paper; ctx.fillRect(x, 12, sw * clamp((time - s) / (e - s), 0, 1), 2.5);
    });
    ctx.fillStyle = "#d4493a"; ctx.beginPath(); ctx.arc(21, 39, 6.4, 0, 6.3); ctx.arc(27, 39, 6.4, 0, 6.3); ctx.fill();
    ctx.fillStyle = C.leaf; ctx.beginPath(); ctx.ellipse(28, 31, 3.6, 1.6, -0.5, 0, 6.3); ctx.fill();
    ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left"; ctx.fillText("통통사과", 38, 43);
    ctx.font = `11px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)"; ctx.fillText("· 나뭇잎", 98, 43);
  }
  function caption(text, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.font = `700 21px ${SANS}`;
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
    const lh = 31, y0 = H - 96 - (lines.length - 1) * lh;
    lines.forEach((ln, i) => { let x = 28; for (const t of ln) { ctx.fillStyle = t.hi ? C.sprout : C.paper; ctx.fillText(t.wd, x, y0 + i * lh); x += t.m; } });
    ctx.restore();
  }
  function frame(time) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
    for (const [s, e, fn, caps] of SCENES) {
      if (time < s || time >= e) continue;
      const lt = time - s, a = Math.min(1, lt / 0.35, (e - s - lt) / 0.35);
      ctx.save(); ctx.globalAlpha = clamp(a, 0, 1); fn(lt); ctx.restore();
      for (const [c0, c1, text] of caps) if (time >= c0 && time < c1) caption(text, clamp(Math.min((time - c0) / 0.3, (c1 - time) / 0.25), 0, 1));
    }
    chrome(time);
  }

  let T = 0, playing = false, userPaused = false, raf = 0, last = 0;
  const fmt = (s) => `0:${String(Math.floor(s)).padStart(2, "0")}`;
  function sync() { phone.classList.toggle("paused", !playing); toggle.textContent = playing ? "일시정지" : "재생"; seek.value = Math.round(T / D * 1000); timeEl.textContent = fmt(T); }
  function tick(now) { T += clamp((now - last) / 1000, 0, 0.05); last = now; if (T >= D) T = 0; frame(T); sync(); if (playing) raf = requestAnimationFrame(tick); }
  function play() { if (playing) return; playing = true; last = performance.now(); raf = requestAnimationFrame(tick); sync(); }
  function pause() { playing = false; cancelAnimationFrame(raf); sync(); }
  const flip = () => { if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); } };
  cv.addEventListener("click", flip);
  root.querySelector(".reel-play").addEventListener("click", flip);
  toggle.addEventListener("click", flip);
  seek.addEventListener("input", () => { T = seek.value / 1000 * D; frame(T); sync(); });
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !userPaused && !reduce) play(); else if (!e.isIntersecting) pause(); }, { threshold: 0.4 }).observe(cv);
  const poster = () => { if (!playing) { T = reduce ? 8 : T; frame(T); sync(); } };
  poster(); document.fonts && document.fonts.ready.then(poster);
})();
