/* 영상: 통통사과 「열이 오를 때 왜 추울까」 — 시상 하부의 기준값이 옮겨 가는 30초 */
(() => {
  const root = document.getElementById("video-bio-fever");
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
  const WARM = "#e0a02a", COLD = "#7fb0d8", RED = "#d4493a";

  const SCENES = [
    [0, 5, sceneSet, [[0.2, 5, "뇌의 [시상 하부]는 체온의 기준값을 약 37 °C로 잡고 지킵니다."]]],
    [5, 10, scenePyro, [[5.1, 10, "병원체와 싸우는 면역 세포가 [발열 물질]을 내보내면"]]],
    [10, 15, sceneDial, [[10.1, 15, "시상 하부의 기준값이 [39 °C]로 올라갑니다."]]],
    [15, 21, sceneChill, [[15.1, 18, "몸은 아직 37 °C. 기준보다 2 °C [낮습니다]."], [18, 21, "그래서 [춥다]고 느끼고, 피부 혈관을 조이고 떱니다."]]],
    [21, 26, sceneSweat, [[21.1, 26, "병이 나아 기준값이 내려가면, 이번엔 [덥다]고 느껴 땀을 흘립니다."]]],
    [26, 31, sceneGraph, [[26.1, 31, "열은 조절이 고장 난 것이 아니라, [기준을 옮겨] 지키는 것입니다."]]],
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
    ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(21, 38, 6.4, 0, Math.PI * 2); ctx.arc(27, 38, 6.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.leaf; ctx.beginPath(); ctx.ellipse(28, 30, 3.6, 1.6, -0.5, 0, Math.PI * 2); ctx.fill();
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

  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left";
  };

  function head(x, y, r) {
    ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 0.85, Math.PI * 2.15); ctx.quadraticCurveTo(x + r * 0.9, y + r * 1.1, x + r * 0.3, y + r * 1.3); ctx.lineTo(x - r * 0.3, y + r * 1.3); ctx.quadraticCurveTo(x - r * 1.05, y + r * 0.9, x - r * 0.83, y + r * 0.45); ctx.stroke();
    ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.arc(x + r * 0.05, y + r * 0.35, r * 0.13, 0, Math.PI * 2); ctx.fill();
  }

  function dial(x, y, r, v, target) {
    // v: 35~41 °C
    const a = (t) => Math.PI * (0.8 + (t - 35) / 6 * 1.4);
    ctx.strokeStyle = "rgba(243,244,239,.2)"; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(x, y, r, a(35), a(41)); ctx.stroke();
    ctx.strokeStyle = WARM; ctx.beginPath(); ctx.arc(x, y, r, a(35), a(v)); ctx.stroke();
    for (const t of [35, 37, 39, 41]) label(`${t}`, x + Math.cos(a(t)) * (r + 18), y + Math.sin(a(t)) * (r + 18) + 4, "rgba(243,244,239,.5)", "center");
    if (target != null) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(x + Math.cos(a(target)) * r, y + Math.sin(a(target)) * r, 6, 0, Math.PI * 2); ctx.fill(); }
    label(`${v.toFixed(1)} °C`, x, y + 12, C.paper, "center", `600 30px ${MONO}`);
    label("기준값", x, y - 22, "rgba(243,244,239,.55)", "center");
  }

  function body(x, y, s, tone, shiver, sweat, lt) {
    const j = shiver ? Math.sin(lt * 70) * 2.5 : 0;
    ctx.save(); ctx.translate(x + j, y);
    ctx.fillStyle = tone;
    ctx.beginPath(); ctx.arc(0, -70 * s, 18 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-22 * s, -48 * s, 44 * s, 70 * s, 10 * s); ctx.fill();
    ctx.strokeStyle = tone; ctx.lineCap = "round"; ctx.lineWidth = 11 * s;
    ctx.beginPath(); ctx.moveTo(-22 * s, -40 * s); ctx.lineTo(-32 * s, 12 * s); ctx.moveTo(22 * s, -40 * s); ctx.lineTo(32 * s, 12 * s);
    ctx.moveTo(-10 * s, 22 * s); ctx.lineTo(-12 * s, 80 * s); ctx.moveTo(10 * s, 22 * s); ctx.lineTo(12 * s, 80 * s); ctx.stroke();
    if (shiver) { ctx.strokeStyle = COLD; ctx.lineWidth = 2; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 46 * s, -30 * s); ctx.lineTo(k * 54 * s, -22 * s); ctx.lineTo(k * 46 * s, -14 * s); ctx.lineTo(k * 54 * s, -6 * s); ctx.stroke(); } }
    if (sweat) { ctx.fillStyle = COLD; for (let i = 0; i < 5; i++) { const yy = ((lt * 40 + i * 23) % 70) - 80; ctx.beginPath(); ctx.arc((i % 2 ? 1 : -1) * (14 + i * 3) * s, yy * s, 3, 0, Math.PI * 2); ctx.fill(); } }
    ctx.restore();
  }

  function sceneSet(lt) {
    head(180, 190, 70);
    label("시상 하부", 180, 305, C.sprout, "center", `600 15px ${SANS}`);
    const p = ease(clamp(lt / 1.5, 0, 1));
    dial(180, 420, 60, 35 + 2 * p, 37);
  }
  function scenePyro(lt) {
    // 병원체 → 면역 세포 → 발열 물질 → 뇌
    ctx.fillStyle = "#8fbf5e";
    for (let i = 0; i < 5; i++) { const a = i * 1.3 + lt; ctx.beginPath(); ctx.arc(80 + Math.cos(a) * 30, 330 + Math.sin(a) * 30, 7, 0, Math.PI * 2); ctx.fill(); }
    label("병원체", 80, 390, "rgba(243,244,239,.55)", "center");
    ctx.fillStyle = "rgba(243,244,239,.85)"; ctx.beginPath(); ctx.arc(180, 330, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.night; ctx.beginPath(); ctx.arc(186, 326, 9, 0, Math.PI * 2); ctx.fill();
    label("면역 세포", 180, 390, "rgba(243,244,239,.55)", "center");
    const p = clamp((lt - 1.2) / 2.5, 0, 1);
    for (let i = 0; i < 7; i++) {
      const q = clamp(p * 1.4 - i * 0.06, 0, 1), x = 205 + q * 75 + Math.sin(i * 2) * 8, y = 320 - q * 150 + i * 6;
      if (q > 0) { ctx.fillStyle = WARM; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); }
    }
    head(280, 140, 40);
    if (p > 0.4) label("발열 물질", 300, 260, WARM, "center");
  }
  function sceneDial(lt) {
    head(180, 170, 55);
    const p = ease(clamp((lt - 0.6) / 2.4, 0, 1));
    dial(180, 400, 60, 37 + 2 * p, 39);
    label("기준값만 바뀝니다. 체온은 아직 37 °C", 180, 490, "rgba(243,244,239,.5)", "center");
  }
  function sceneChill(lt) {
    body(120, 330, 1.3, "#c9b6a4", lt > 1.2, false, lt);
    label("피부 혈관 수축", 250, 230, COLD); label("→ 창백, 손발이 참", 250, 248, "rgba(243,244,239,.5)");
    label("근육 떨림", 250, 300, COLD); label("→ 열 생산", 250, 318, "rgba(243,244,239,.5)");
    const Tb = 37 + 2 * ease(clamp((lt - 1.5) / 4.2, 0, 1));
    label(`체온 ${Tb.toFixed(1)} °C`, 250, 380, C.paper, "left", `600 20px ${MONO}`);
    label("기준 39.0 °C", 250, 404, WARM);
  }
  function sceneSweat(lt) {
    body(120, 330, 1.3, "#e9a58c", false, true, lt);
    label("피부 혈관 확장", 250, 230, WARM); label("→ 붉어짐, 열 방출", 250, 248, "rgba(243,244,239,.5)");
    label("땀 분비", 250, 300, WARM); label("→ 증발로 열 방출", 250, 318, "rgba(243,244,239,.5)");
    const Tb = 39 - 2 * ease(clamp((lt - 1) / 3.6, 0, 1));
    label(`체온 ${Tb.toFixed(1)} °C`, 250, 380, C.paper, "left", `600 20px ${MONO}`);
    label("기준 37.0 °C", 250, 404, COLD);
  }
  function sceneGraph(lt) {
    const x0 = 40, x1 = 320, y0 = 150, y1 = 420;
    const X = (t) => x0 + t / 10 * (x1 - x0), Y = (v) => y1 - (v - 36) / 4 * (y1 - y0);
    ctx.strokeStyle = "rgba(243,244,239,.25)"; ctx.lineWidth = 1;
    for (const v of [37, 39]) { ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x1, Y(v)); ctx.stroke(); label(`${v}`, x0 - 6, Y(v) + 4, "rgba(243,244,239,.5)", "right"); }
    const sp = (t) => t < 2 ? 37 : t < 7 ? 39 : 37;
    const body2 = (t) => t < 2 ? 37 : t < 7 ? 37 + 2 * (1 - Math.exp(-(t - 2) * 1.2)) : 37 + (body2(6.999) - 37) * Math.exp(-(t - 7) * 1.1);
    const p = clamp(lt / 3, 0, 1) * 10;
    ctx.setLineDash([6, 5]); ctx.strokeStyle = WARM; ctx.lineWidth = 2; ctx.beginPath();
    for (let t = 0; t <= p; t += 0.02) { const y = Y(sp(t)); t ? ctx.lineTo(X(t), y) : ctx.moveTo(X(t), y); } ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.paper; ctx.lineWidth = 3; ctx.beginPath();
    for (let t = 0; t <= p; t += 0.02) { const y = Y(body2(t)); t ? ctx.lineTo(X(t), y) : ctx.moveTo(X(t), y); } ctx.stroke();
    label("점선: 기준값", x0, 130, WARM); label("실선: 체온", x0 + 110, 130, C.paper);
    if (p > 3) label("오한", X(2.6), Y(38) + 30, COLD, "center", `600 14px ${SANS}`);
    if (p > 8) label("땀", X(7.8), Y(38) - 12, WARM, "center", `600 14px ${SANS}`);
    label("시간 →", x1, y1 + 20, "rgba(243,244,239,.5)", "right");
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
  const poster = () => { if (!playing) { T = reduce ? 17 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
