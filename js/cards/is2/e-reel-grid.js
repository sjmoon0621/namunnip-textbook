/* 영상: 콘센트까지 오는 전기의 여행 — 코드로 그리는 30초 숏폼 */
(() => {
  const root = document.getElementById("video-is2-grid");
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

  // 여정의 정거장과 전압 (V)
  const ST = [
    { name: "발전기", v: 2e4, lab: "약 2만 V" },
    { name: "승압 변압기", v: 3.45e5, lab: "345 kV" },
    { name: "송전선", v: 3.45e5, lab: "345·765 kV" },
    { name: "변전소", v: 2.29e4, lab: "154 → 22.9 kV" },
    { name: "주상 변압기", v: 220, lab: "220 V" },
    { name: "콘센트", v: 220, lab: "220 V · 60 Hz" },
  ];
  const SCENES = [
    [0, 5, 0, [[0.2, 5, "발전소의 터빈이 발전기를 돌려 약 [2만 V]의 교류를 만듭니다."]]],
    [5, 10, 1, [[5.1, 10, "변압기가 전압을 [345 kV], 먼 곳은 [765 kV]까지 높입니다."]]],
    [10, 15.5, 2, [[10.1, 15.5, "전압이 높으면 같은 전력을 [작은 전류]로 보내 전선에서 잃는 열이 줄어듭니다."]]],
    [15.5, 21, 3, [[15.6, 21, "도시 가까이 변전소에서 [154 kV], 다시 [22.9 kV]로 낮춥니다."]]],
    [21, 25.5, 4, [[21.1, 25.5, "전봇대 위 변압기가 집에서 쓰는 [220 V]로 낮춥니다."]]],
    [25.5, 30, 5, [[25.6, 30, "전선 속 전자는 1초에 [60번] 앞뒤로 흔들릴 뿐, 멀리 가지 않습니다."]]],
  ];

  let T = 0, playing = false, userPaused = false;

  function frame(time) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
    for (const [s, e, k, caps] of SCENES) {
      if (time < s || time >= e) continue;
      const lt = time - s, dur = e - s;
      ladder(k, lt);
      ctx.save(); ctx.globalAlpha = clamp(Math.min(1, lt / 0.35, (dur - lt) / 0.35), 0, 1);
      [sGen, sUp, sLine, sSub, sPole, sPlug][k](lt);
      ctx.restore();
      for (const [c0, c1, text] of caps) {
        if (time < c0 || time >= c1) continue;
        caption(text, clamp(Math.min((time - c0) / 0.3, (c1 - time) / 0.25), 0, 1), (time - c0) / 0.3);
      }
    }
    chrome(time);
  }

  // 위쪽: 전압 사다리 (로그 눈금). 지금 정거장까지만 밝게.
  function ladder(k, lt) {
    const x0 = 34, x1 = 330, y0 = 76, y1 = 196;
    const Y = (v) => y1 - (Math.log10(v) - 2) / (6 - 2) * (y1 - y0);
    ctx.font = `9.5px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.35)"; ctx.textAlign = "right";
    [[1e2, "100 V"], [1e4, "10 kV"], [1e6, "1 MV"]].forEach(([v, t]) => { ctx.fillText(t, x0 - 4, Y(v) + 3); ctx.fillRect(x0, Y(v), x1 - x0, 0.5); });
    ctx.textAlign = "left";
    const step = (x1 - x0) / ST.length;
    ctx.beginPath();
    ST.forEach((s, i) => { const xa = x0 + i * step, xb = xa + step, y = Y(s.v); i ? ctx.lineTo(xa, y) : ctx.moveTo(xa, y); ctx.lineTo(xb, y); });
    ctx.strokeStyle = "rgba(243,244,239,.18)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath();
    const upto = k + clamp(lt / 1.2, 0, 1);
    ST.forEach((s, i) => { if (i >= upto) return; const xa = x0 + i * step, xb = xa + step * clamp(upto - i, 0, 1), y = Y(s.v); i ? ctx.lineTo(xa, y) : ctx.moveTo(xa, y); ctx.lineTo(xb, y); });
    ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5; ctx.stroke();
    const s = ST[k], xm = x0 + (k + 0.5) * step;
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(xm, Y(s.v), 4, 0, 7); ctx.fill();
    ctx.font = `600 12px ${MONO}`; ctx.textAlign = xm > 250 ? "right" : xm < 100 ? "left" : "center";
    ctx.fillText(s.lab, xm, Y(s.v) - 10);
    ctx.font = `10px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)"; ctx.textAlign = "center";
    ctx.fillText("전압 (로그 눈금)", 180, 222);
    ctx.textAlign = "left";
  }

  function chrome(time) {
    const gap = 4, n = SCENES.length, sw = (W - 24 - gap * (n - 1)) / n;
    SCENES.forEach(([s, e], i) => {
      const x = 12 + i * (sw + gap);
      ctx.fillStyle = "rgba(243,244,239,.25)"; ctx.fillRect(x, 12, sw, 2.5);
      ctx.fillStyle = C.paper; ctx.fillRect(x, 12, sw * clamp((time - s) / (e - s), 0, 1), 2.5);
    });
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(24, 38, 7, 0, 7); ctx.fill();
    ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left";
    ctx.fillText("나뭇잎 숏폼", 38, 43);
    ctx.font = `11px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)";
    ctx.fillText("· 전기의 여행", 120, 43);
  }

  function caption(text, alpha, rise) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.font = `700 20px ${SANS}`;
    const words = []; let hi = false;
    for (const part of text.split(/(\[|\])/)) {
      if (part === "[") { hi = true; continue; }
      if (part === "]") { hi = false; continue; }
      part.split(/( +)/).forEach((wd) => wd && words.push({ wd, hi }));
    }
    const maxW = W - 56, lines = [[]]; let lw = 0;
    for (const t of words) {
      const m = ctx.measureText(t.wd).width;
      if (lw + m > maxW && t.wd.trim() && lines.at(-1).length) { lines.push([]); lw = 0; }
      if (!lines.at(-1).length && !t.wd.trim()) continue;
      lines.at(-1).push({ ...t, m }); lw += m;
    }
    const lh = 29, y0 = H - 92 - (lines.length - 1) * lh + (1 - clamp(rise, 0, 1)) * 8;
    lines.forEach((ln, i) => { let x = 28; for (const t of ln) { ctx.fillStyle = t.hi ? C.sprout : C.paper; ctx.fillText(t.wd, x, y0 + i * lh); x += t.m; } });
    ctx.restore();
  }
  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "center", font = `11px ${MONO}`) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left";
  };
  const CY = 360; // 그림 중심

  function coil(x, y, turns, hgt, col) {
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    for (let i = 0; i < turns; i++) { const yy = y - hgt / 2 + (i + 0.5) * hgt / turns; ctx.beginPath(); ctx.ellipse(x, yy, 16, 3.5, 0, 0, 7); ctx.stroke(); }
  }

  function sGen(lt) {
    // 터빈 날개
    ctx.save(); ctx.translate(120, CY); ctx.rotate(lt * 6);
    ctx.fillStyle = "rgba(243,244,239,.75)";
    for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.ellipse(0, -26, 7, 22, 0, 0, 7); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = C.night; ctx.beginPath(); ctx.arc(120, CY, 6, 0, 7); ctx.fill();
    ctx.strokeStyle = "rgba(243,244,239,.4)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(126, CY); ctx.lineTo(196, CY); ctx.stroke();
    ctx.strokeStyle = C.paper; ctx.lineWidth = 1.5; ctx.strokeRect(196, CY - 34, 90, 68);
    label("발전기", 241, CY + 4, C.paper);
    // 교류 파형
    ctx.beginPath(); for (let x = 0; x <= 90; x++) { const y = CY + 62 + 14 * Math.sin((x / 90) * 4 * Math.PI - lt * 8); x ? ctx.lineTo(196 + x, y) : ctx.moveTo(196, y); }
    ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.stroke();
    label("증기·물·바람이 터빈을 돌린다", 120, CY + 62, "rgba(243,244,239,.5)", "center", `10px ${MONO}`);
  }
  function sUp(lt) {
    ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.lineWidth = 6; ctx.strokeRect(130, CY - 60, 100, 120);
    coil(130, CY, 5, 90, C.amber); coil(230, CY, 16 * clamp(lt / 1.2, 0.3, 1) | 0, 110, C.sprout);
    label("1차 코일", 130, CY + 82); label("2차 코일 (더 많이)", 230, CY + 82);
    label("전압 비 = 감은 수 비", 180, CY - 76, C.paper, "center", `600 13px ${MONO}`);
  }
  function sLine(lt) {
    for (let i = 0; i < 3; i++) {
      const x = 60 + i * 120;
      ctx.strokeStyle = "rgba(243,244,239,.55)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x - 18, CY + 70); ctx.lineTo(x, CY - 40); ctx.lineTo(x + 18, CY + 70); ctx.moveTo(x - 24, CY - 20); ctx.lineTo(x + 24, CY - 20); ctx.stroke();
    }
    ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, CY - 20); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, CY - 20 + 6 * Math.sin(((x - 60) % 120) / 120 * Math.PI)); ctx.stroke();
    // 전력은 같게, 전류는 작게
    const p = clamp((lt - 0.8) / 1, 0, 1);
    ctx.save(); ctx.globalAlpha *= p;
    label("P = V × I", 180, CY - 92, C.paper, "center", `600 20px ${MONO}`);
    label("손실 = I² × R", 180, CY - 68, C.sprout, "center", `600 15px ${MONO}`);
    ctx.restore();
  }
  function sSub(lt) {
    const steps = [["154 kV", 0], ["22.9 kV", 1.4]];
    steps.forEach(([t, d], i) => {
      const a = clamp((lt - d) / 0.6, 0, 1);
      ctx.save(); ctx.globalAlpha *= a;
      ctx.strokeStyle = C.paper; ctx.lineWidth = 1.5; ctx.strokeRect(60 + i * 140, CY - 40, 100, 80);
      label(t, 110 + i * 140, CY + 5, C.paper, "center", `600 15px ${MONO}`);
      ctx.restore();
    });
    label("↓", 180, CY + 5, "rgba(243,244,239,.5)", "center", `18px ${MONO}`);
    label("변전소", 180, CY - 60, "rgba(243,244,239,.5)");
  }
  function sPole(lt) {
    ctx.fillStyle = "#6b5a45"; ctx.fillRect(176, CY - 90, 8, 170);
    ctx.fillStyle = "rgba(243,244,239,.7)"; ctx.fillRect(150, CY - 90, 60, 5);
    ctx.fillStyle = "#8d8d92"; ctx.fillRect(190, CY - 60, 30, 40);
    label("22.9 kV", 110, CY - 96, C.paper);
    // 집
    ctx.strokeStyle = C.paper; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(250, CY + 80); ctx.lineTo(250, CY + 20); ctx.lineTo(285, CY - 8); ctx.lineTo(320, CY + 20); ctx.lineTo(320, CY + 80); ctx.stroke();
    ctx.strokeStyle = C.amber; ctx.beginPath(); ctx.moveTo(220, CY - 40); ctx.quadraticCurveTo(250, CY - 10, 285, CY + 10); ctx.stroke();
    label("220 V", 285, CY + 50, C.amber, "center", `600 14px ${MONO}`);
  }
  function sPlug(lt) {
    // 전선 속 전자: 제자리에서 흔들린다
    ctx.strokeStyle = "rgba(243,244,239,.5)"; ctx.lineWidth = 1;
    ctx.strokeRect(20, CY - 30, 320, 60);
    const sway = 10 * Math.sin(lt * 2 * Math.PI * 1.2);
    for (let i = 0; i < 12; i++) { ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.arc(40 + i * 26 + sway, CY + ((i % 3) - 1) * 14, 4, 0, 7); ctx.fill(); }
    label("전자 (느리게 보여 줌)", 180, CY - 42, "rgba(243,244,239,.55)");
    label("에너지는 전선 둘레의 전자기장을 타고 전해집니다", 180, CY + 58, "rgba(243,244,239,.55)", "center", `10px ${MONO}`);
  }

  /* 재생 제어 */
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
  const q = /[?&]reel=([\d.]+)/.exec(location.search); // 검토용: ?reel=초 로 그 장면에서 멈춘다
  if (q) { T = +q[1]; userPaused = true; }
  const poster = () => { if (!playing) { T = reduce && !q ? 12 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
