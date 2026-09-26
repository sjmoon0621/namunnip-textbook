/* 영상: 증기 기관에서 자동차 엔진까지 — 코드로 그리는 31초 숏폼 */
(() => {
  const root = document.getElementById("video-phy-engine");
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
  const HOT = "#e0703a", COLD = "#6fa0d8";

  const SCENES = [
    [0, 6.5, sceneNewcomen, [[0.2, 6.5, "1712년 뉴커먼 기관. 증기를 찬물로 식혀 만든 [진공]을 대기압이 눌러, 광산의 물을 퍼 올렸습니다."]]],
    [6.5, 12, sceneLoss, [[6.6, 12, "석탄의 열 가운데 일이 된 것은 [1% 안팎]. 매번 실린더 전체를 데웠다 식혔기 때문입니다."]]],
    [12, 18, sceneWatt, [[12.1, 18, "와트는 증기를 식히는 곳을 [따로] 두어 실린더를 늘 뜨겁게 유지했습니다. 석탄이 크게 줄었습니다."]]],
    [18, 25, sceneOtto, [[18.1, 25, "지금의 자동차 엔진은 실린더 [안에서] 연료를 태웁니다. 흡입, 압축, 폭발, 배기."]]],
    [25, 31, sceneBars, [[25.1, 28.2, "효율은 크게 올랐지만 [100%]에는 닿지 못합니다."], [28.2, 31, "받은 열의 일부는 늘 [차가운 쪽]으로 버려야 기관이 다시 돌 수 있습니다."]]],
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
    const lh = 30, y0 = H - 84 - (lines.length - 1) * lh + (1 - clamp(rise, 0, 1)) * 8;
    lines.forEach((ln, i) => { let x = 28; for (const t of ln) { ctx.fillStyle = t.hi ? C.sprout : C.paper; ctx.fillText(t.wd, x, y0 + i * lh); x += t.m; } });
    ctx.restore();
  }
  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left";
  };

  // 실린더 하나: 피스톤 높이 p(0 아래 ~ 1 위), 안의 색
  function cylinder(x, y, w, h, p, fill) {
    const py = y + h - p * (h - 16) - 12;
    ctx.fillStyle = fill; ctx.fillRect(x, py + 10, w, y + h - py - 10);
    ctx.strokeStyle = "rgba(243,244,239,.7)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y); ctx.stroke();
    ctx.fillStyle = "#9aa0a6"; ctx.fillRect(x + 2, py, w - 4, 10);
    ctx.fillRect(x + w / 2 - 3, py - 60, 6, 60);
    return py;
  }

  /* 1. 뉴커먼: 증기가 차면 피스톤이 올라가고, 찬물로 식히면 대기압이 누름 */
  function sceneNewcomen(lt) {
    const cyc = (lt % 3) / 3, up = cyc < 0.45, f = up ? ease(cyc / 0.45) : 1 - ease(clamp((cyc - 0.5) / 0.45, 0, 1));
    const py = cylinder(120, 220, 80, 170, f, up ? "rgba(224,112,58,.35)" : "rgba(111,160,216,.25)");
    // 보(빔)
    const bx = 230, by = 150, ang = (f - 0.5) * 0.35;
    ctx.strokeStyle = "#8a6b4e"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(bx - 70 * Math.cos(ang), by + 70 * Math.sin(ang)); ctx.lineTo(bx + 70 * Math.cos(ang), by - 70 * Math.sin(ang)); ctx.stroke();
    ctx.fillStyle = "#6b5a45"; ctx.fillRect(bx - 6, by, 12, 240);
    ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(160, py - 60); ctx.lineTo(bx - 70 * Math.cos(ang), by + 70 * Math.sin(ang)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + 70 * Math.cos(ang), by - 70 * Math.sin(ang)); ctx.lineTo(bx + 70 * Math.cos(ang), 400); ctx.stroke();
    label(up ? "증기가 들어옴" : "찬물 분사 → 진공", 160, 410, up ? HOT : COLD, "center", `600 13px ${SANS}`);
    if (!up) { for (let k = 0; k < 3; k++) { ctx.fillStyle = "rgba(243,244,239,.6)"; ctx.beginPath(); ctx.moveTo(160 + (k - 1) * 22, 190); ctx.lineTo(154 + (k - 1) * 22, 176); ctx.lineTo(166 + (k - 1) * 22, 176); ctx.fill(); } label("대기압", 160, 172, "rgba(243,244,239,.6)", "center"); }
    label("광산 펌프로", bx + 70, 420, "rgba(243,244,239,.5)", "center");
  }

  /* 2. 손실: 석탄 100 → 일 1 */
  function sceneLoss(lt) {
    const p = ease(clamp((lt - 0.6) / 1.6, 0, 1));
    label("석탄의 열", 60, 170, C.paper, "left", `600 14px ${SANS}`);
    ctx.fillStyle = HOT; ctx.fillRect(60, 180, 240, 26);
    label("100", 290, 199, C.night, "right", `600 14px ${MONO}`);
    label("일이 된 것", 60, 260, C.paper, "left", `600 14px ${SANS}`);
    ctx.fillStyle = C.sprout; ctx.fillRect(60, 270, Math.max(2.4, 240 * 0.01) * p + 0.01, 26);
    if (p > 0.9) label("≈ 1", 72, 289, C.sprout, "left", `600 14px ${MONO}`);
    label("나머지는 증기와 식힌 물이 가지고 나감", 180, 350, "rgba(243,244,239,.5)", "center");
  }

  /* 3. 와트: 따로 둔 응축기 */
  function sceneWatt(lt) {
    const cyc = (lt % 2.4) / 2.4, f = cyc < 0.5 ? ease(cyc / 0.5) : 1 - ease((cyc - 0.5) / 0.5);
    cylinder(80, 220, 80, 170, f, "rgba(224,112,58,.35)");
    label("늘 뜨거움", 120, 410, HOT, "center", `600 13px ${SANS}`);
    ctx.strokeStyle = "rgba(243,244,239,.6)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(160, 380); ctx.lineTo(220, 380); ctx.lineTo(220, 330); ctx.stroke();
    ctx.fillStyle = "rgba(111,160,216,.45)"; ctx.fillRect(200, 270, 70, 60);
    ctx.strokeStyle = COLD; ctx.lineWidth = 2; ctx.strokeRect(200, 270, 70, 60);
    label("응축기", 235, 262, COLD, "center", `600 13px ${SANS}`);
    label("늘 차가움", 235, 350, COLD, "center");
    label("1769년 특허", 180, 450, "rgba(243,244,239,.5)", "center");
  }

  /* 4. 4행정 엔진 */
  function sceneOtto(lt) {
    const cyc = (lt % 3.2) / 3.2, s = Math.floor(cyc * 4), f = cyc * 4 - s;
    const pos = s === 0 ? 1 - f : s === 1 ? f : s === 2 ? 1 - f : f; // 1 = 위(상사점)
    const fill = s === 0 ? "rgba(181,215,172,.35)" : s === 1 ? "rgba(181,215,172,.6)" : s === 2 ? `rgba(224,112,58,${0.75 - 0.4 * f})` : "rgba(150,150,150,.35)";
    const x = 130, y = 180, w = 100, h = 200;
    const py = cylinder(x, y, w, h, pos, fill);
    // 크랭크
    const ca = cyc * 4 * Math.PI, cx0 = x + w / 2, cy0 = y + h + 60, cr = 28;
    ctx.strokeStyle = "rgba(243,244,239,.35)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx0, cy0, cr, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#9aa0a6"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(cx0, py + 10); ctx.lineTo(cx0 + cr * Math.sin(ca), cy0 - cr * Math.cos(ca)); ctx.stroke();
    // 밸브
    ctx.fillStyle = s === 0 ? C.sprout : "rgba(243,244,239,.3)"; ctx.fillRect(x + 10, y - 10, 24, 8);
    ctx.fillStyle = s === 3 ? "#aaa" : "rgba(243,244,239,.3)"; ctx.fillRect(x + w - 34, y - 10, 24, 8);
    if (s === 2 && f < 0.15) { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(x + w / 2, y + 8, 10, 0, Math.PI * 2); ctx.fill(); }
    const names = ["흡입", "압축", "폭발", "배기"];
    names.forEach((nm, i) => label(nm, 60 + i * 80, 140, i === s ? C.sprout : "rgba(243,244,239,.35)", "center", `600 15px ${SANS}`));
  }

  /* 5. 효율 막대 */
  function sceneBars(lt) {
    const rows = [["뉴커먼 증기 기관", 1, "1% 안팎"], ["자동차 휘발유 엔진", 32, "25~40%"], ["대형 선박 디젤 엔진", 50, "약 50%"], ["복합 화력 발전", 60, "약 60%"]];
    rows.forEach(([nm, v, txt], i) => {
      const y = 140 + i * 62, p = ease(clamp((lt - 0.3 - i * 0.35) / 0.8, 0, 1));
      label(nm, 40, y, C.paper, "left", `600 13px ${SANS}`);
      ctx.fillStyle = "rgba(243,244,239,.12)"; ctx.fillRect(40, y + 8, 280, 16);
      ctx.fillStyle = i ? C.sprout : HOT; ctx.fillRect(40, y + 8, Math.max(2, 280 * v / 100) * p, 16);
      if (p > 0.95) label(txt, 40 + Math.max(2, 280 * v / 100) + 6, y + 21, "rgba(243,244,239,.75)");
    });
    ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(320, 128); ctx.lineTo(320, 380); ctx.stroke(); ctx.setLineDash([]);
    label("100%", 320, 398, "rgba(243,244,239,.6)", "center");
    label("값은 대표적인 범위", 180, 420, "rgba(243,244,239,.4)", "center");
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
  const poster = () => { if (!playing) { T = reduce ? 27 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
