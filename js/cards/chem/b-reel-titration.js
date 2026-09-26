/* 영상: 중화 적정 실험 따라 하기 — 식초의 아세트산 농도 구하기 (코드로 그리는 30초 숏폼) */
(() => {
  const root = document.getElementById("video-chem-titration");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas"), phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek"), toggle = root.querySelector(".reel-toggle"), timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 30;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const GLASS = "rgba(243,244,239,.75)", LIQ = "rgba(150,190,230,.35)", PINK = "rgba(226,70,160,";

  const SCENES = [
    [0, 5.5, s1, [[0.2, 5.5, "식초 [10.0 mL]를 피펫으로 옮기고, 눈금선까지 물을 채워 [10배]로 묽힙니다."]]],
    [5.5, 10.5, s2, [[5.6, 10.5, "묽힌 식초 [20.0 mL]에 페놀프탈레인을 두세 방울 넣습니다."]]],
    [10.5, 15, s3, [[10.6, 15, "뷰렛에 [0.100 M] NaOH를 채우고 처음 눈금을 읽습니다."]]],
    [15, 22.5, s4, [[15.1, 18.6, "흔들며 조금씩. 떨어진 자리가 붉어졌다 사라지면 [거의 다 왔다]는 뜻입니다."], [18.6, 22.5, "옅은 분홍이 [30초] 동안 남으면 종말점. 16.70 mL를 넣었습니다."]]],
    [22.5, 30, s5, [[22.6, 30, "몰수가 같다는 것만으로 식초의 농도가 나옵니다. 약 [5.0%]."]]],
  ];

  let T = 0, playing = false, userPaused = false;
  function frame(time) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
    for (const [s, e, fn, caps] of SCENES) {
      if (time < s || time >= e) continue;
      const lt = time - s, dur = e - s;
      ctx.save(); ctx.globalAlpha = clamp(Math.min(1, lt / 0.35, (dur - lt) / 0.35), 0, 1); fn(lt, dur); ctx.restore();
      for (const [c0, c1, text] of caps) if (time >= c0 && time < c1) caption(text, clamp(Math.min((time - c0) / 0.3, (c1 - time) / 0.25), 0, 1), (time - c0) / 0.3);
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
    ctx.fillStyle = "#d4493a"; ctx.beginPath(); ctx.arc(24, 38, 7, 0, 7); ctx.fill();
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
    // 괄호 바로 뒤에 붙는 조사는 앞 낱말과 함께 줄바꿈한다
    const toks = [];
    for (const t of words) { const last = toks.at(-1); if (last && t.wd.trim() && last.parts.at(-1).wd.trim()) last.parts.push(t); else toks.push({ parts: [t] }); }
    const maxW = W - 56, lines = [[]]; let lw = 0;
    for (const tk of toks) {
      const m = tk.parts.reduce((s, p) => s + ctx.measureText(p.wd).width, 0), sp = !tk.parts[0].wd.trim();
      if (lw + m > maxW && !sp && lines.at(-1).length) { lines.push([]); lw = 0; }
      if (!lines.at(-1).length && sp) continue;
      lines.at(-1).push(tk); lw += m;
    }
    const lh = 30, y0 = H - 96 - (lines.length - 1) * lh + (1 - clamp(rise, 0, 1)) * 8;
    lines.forEach((ln, i) => { let x = 28; for (const tk of ln) for (const p of tk.parts) { ctx.fillStyle = p.hi ? C.sprout : C.paper; ctx.fillText(p.wd, x, y0 + i * lh); x += ctx.measureText(p.wd).width; } });
    ctx.restore();
  }
  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left"; };

  function volFlask(x, yb, fill) { // 부피 플라스크
    const r = 44, cy = yb - r;
    ctx.save(); ctx.beginPath(); ctx.arc(x, cy, r, 0, 7); ctx.rect(x - 7, cy - 150, 14, 150); ctx.clip();
    ctx.fillStyle = LIQ; const top = yb - fill * (2 * r + 110); ctx.fillRect(x - r, top, 2 * r, yb - top); ctx.restore();
    ctx.strokeStyle = GLASS; ctx.lineWidth = 1.5; const a = Math.asin(7 / r);
    ctx.beginPath(); ctx.moveTo(x - 7, cy - 150); ctx.lineTo(x - 7, cy - r * Math.cos(a)); ctx.arc(x, cy, r, -Math.PI / 2 - a, -Math.PI / 2 + a, true); ctx.lineTo(x + 7, cy - 150); ctx.stroke();
    ctx.strokeStyle = C.amber; ctx.beginPath(); ctx.moveTo(x - 12, cy - 110); ctx.lineTo(x + 12, cy - 110); ctx.stroke();
  }
  function erlen(x, yb, pinkA, liq = 0.35) {
    const w = 110, top = yb - 130, nk = 22;
    const lvl = yb - 130 * liq, ew = (y) => nk / 2 + (w / 2 - nk / 2) * clamp((y - (top + 20)) / 110, 0, 1);
    ctx.beginPath(); ctx.moveTo(x - ew(lvl), lvl); ctx.lineTo(x - w / 2, yb); ctx.lineTo(x + w / 2, yb); ctx.lineTo(x + ew(lvl), lvl); ctx.closePath();
    ctx.fillStyle = LIQ; ctx.fill(); if (pinkA > 0) { ctx.fillStyle = PINK + pinkA + ")"; ctx.fill(); }
    ctx.strokeStyle = GLASS; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(x - nk / 2, top); ctx.lineTo(x - nk / 2, top + 20); ctx.lineTo(x - w / 2, yb); ctx.lineTo(x + w / 2, yb); ctx.lineTo(x + nk / 2, top + 20); ctx.lineTo(x + nk / 2, top); ctx.stroke();
  }
  function burette(x, reading) {
    const top = 70, len = 250, Y = (v) => top + 10 + v / 50 * (len - 20);
    ctx.fillStyle = LIQ; ctx.fillRect(x - 6, Y(reading), 12, top + len - Y(reading));
    ctx.strokeStyle = GLASS; ctx.lineWidth = 1.3; ctx.strokeRect(x - 6, top, 12, len);
    for (let v = 0; v <= 50; v += 10) { ctx.beginPath(); ctx.moveTo(x - 6, Y(v)); ctx.lineTo(x, Y(v)); ctx.stroke(); label(`${v}`, x - 10, Y(v) + 4, "rgba(243,244,239,.45)", "right", `9px ${MONO}`); }
    ctx.fillStyle = GLASS; ctx.fillRect(x - 10, top + len, 20, 5); ctx.fillRect(x - 1.5, top + len + 5, 3, 16);
    return top + len + 21;
  }
  function s1(lt) {
    const p = ease(clamp((lt - 0.6) / 2.2, 0, 1));
    volFlask(250, 440, 0.2 + 0.62 * ease(clamp((lt - 3) / 1.8, 0, 1)));
    // 피펫
    const px = 120, py = 150 + 30 * p;
    ctx.strokeStyle = GLASS; ctx.lineWidth = 1.3; ctx.strokeRect(px - 3, py, 6, 60); ctx.strokeRect(px - 9, py + 60, 18, 60); ctx.strokeRect(px - 2, py + 120, 4, 50);
    ctx.fillStyle = "rgba(230,200,140,.45)"; ctx.fillRect(px - 8, py + 61 + 58 * p, 16, 58 * (1 - p));
    label("피펫 10.0 mL", px, py - 10, "rgba(243,244,239,.6)", "center");
    label("100 mL 부피 플라스크", 250, 460, "rgba(243,244,239,.6)", "center");
  }
  function s2(lt) {
    erlen(180, 430, clamp((lt - 2.5) / 0.3, 0, 1) > 0 && lt < 2.9 ? 0.2 : 0);
    for (let i = 0; i < 3; i++) { const t = lt - 1.6 - i * 0.35; if (t > 0 && t < 0.6) { ctx.fillStyle = "rgba(243,244,239,.8)"; ctx.beginPath(); ctx.arc(180, 250 + t * 180, 3, 0, 7); ctx.fill(); } }
    label("묽힌 식초 20.0 mL", 180, 460, "rgba(243,244,239,.6)", "center");
    label("페놀프탈레인: 산성·중성에서 무색", 180, 200, C.sprout, "center", `13px ${SANS}`);
    label("pH 8.2 넘으면 붉은색", 180, 220, "rgba(243,244,239,.6)", "center", `13px ${SANS}`);
  }
  function s3(lt) {
    burette(180, 0);
    erlen(180, 450, 0);
    ctx.save(); ctx.globalAlpha *= clamp((lt - 1.2) / 0.5, 0, 1);
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 1; ctx.strokeRect(220, 64, 110, 40);
    label("처음 눈금", 275, 80, "rgba(243,244,239,.6)", "center"); label("0.00 mL", 275, 98, C.sprout, "center", `600 14px ${MONO}`);
    label("눈높이를 메니스커스 아래에 맞춘다", 275, 124, "rgba(243,244,239,.45)", "center", `10px ${SANS}`);
    ctx.restore();
  }
  function s4(lt) {
    const v = lt < 3.5 ? 16.2 * ease(clamp(lt / 3.2, 0, 1)) : 16.2 + 0.5 * clamp((lt - 3.5) / 1.5, 0, 1);
    const tip = burette(180, v);
    const drop = (lt * 3) % 1;
    if (lt < 5) { ctx.fillStyle = LIQ; ctx.beginPath(); ctx.arc(180, tip + drop * 30, 3, 0, 7); ctx.fill(); }
    const flashA = lt > 2.4 && lt < 5 ? 0.35 * Math.max(0, Math.sin((lt - 2.4) * 6)) : 0;
    const endA = lt > 5 ? 0.35 * clamp((lt - 5) / 0.4, 0, 1) : 0;
    ctx.save(); ctx.translate(180, 450); ctx.rotate(lt < 5 ? Math.sin(lt * 9) * 0.04 : 0); ctx.translate(-180, -450);
    erlen(180, 450, Math.max(flashA, endA), 0.45); ctx.restore();
    label(`${v.toFixed(2)} mL`, 250, 260, C.sprout, "left", `600 16px ${MONO}`);
  }
  function s5(lt) {
    const L = [["NaOH", "0.100 M × 16.70 mL = 1.670 mmol"], ["CH₃COOH", "1.670 mmol (1 : 1로 반응)"], ["묽힌 식초", "1.670 ÷ 20.0 mL = 0.0835 M"], ["원래 식초", "× 10 = 0.835 M"], ["질량", "× 60.05 g/mol = 50.1 g/L"]];
    L.forEach(([a, b], i) => {
      const al = clamp((lt - 0.3 - i * 0.7) / 0.4, 0, 1); if (!al) return;
      ctx.save(); ctx.globalAlpha *= al;
      label(a, 28, 120 + i * 58, "rgba(243,244,239,.55)", "left", `12px ${SANS}`);
      label(b, 28, 142 + i * 58, C.paper, "left", `500 15px ${MONO}`);
      ctx.restore();
    });
    ctx.save(); ctx.globalAlpha *= clamp((lt - 4) / 0.5, 0, 1);
    label("≈ 5.0 g / 100 mL", 180, 440, C.sprout, "center", `600 28px ${MONO}`);
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
  const poster = () => { if (!playing) { T = reduce ? 21 : T; frame(T); sync(); } };
  poster(); document.fonts && document.fonts.ready.then(poster);
})();
