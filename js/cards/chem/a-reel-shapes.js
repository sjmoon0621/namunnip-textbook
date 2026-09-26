/* 영상: 통통사과 「분자 모양 한 번에 보기」 — 코드로 그리는 32초 숏폼 */
(() => {
  const root = document.getElementById("video-chem-shapes");
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

  // 분자 기하: 결합 방향(b)과 비공유 전자쌍 방향(l), 단위 벡터
  const n = (v) => { const r = Math.hypot(...v); return v.map((x) => x / r); };
  const pyr = (alpha) => { // 결합각 alpha인 세 결합 (아래쪽), 비공유 전자쌍 위쪽
    const ca = Math.cos(alpha * Math.PI / 180), c = Math.sqrt((ca + 0.5) / 1.5), s = Math.sqrt(1 - c * c);
    return [0, 1, 2].map((i) => [s * Math.cos(i * 2.094), -c, s * Math.sin(i * 2.094)]);
  };
  const half = 104.5 / 2 * Math.PI / 180;
  const MOL = {
    lin: { c: "Be", x: "Cl", b: [[1, 0, 0], [-1, 0, 0]], l: [], name: "직선형", f: "BeCl₂", ang: "180°" },
    tri: { c: "B", x: "F", b: [0, 1, 2].map((i) => [Math.cos(i * 2.094 + 1.571), Math.sin(i * 2.094 + 1.571), 0]), l: [], name: "평면 삼각형", f: "BF₃", ang: "120°" },
    tet: { c: "C", x: "H", b: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(n), l: [], name: "정사면체", f: "CH₄", ang: "109.5°" },
    pyr: { c: "N", x: "H", b: pyr(107), l: [[0, 1, 0]], name: "삼각뿔", f: "NH₃", ang: "107°" },
    bent: { c: "O", x: "H", b: [[Math.sin(half), -Math.cos(half), 0], [-Math.sin(half), -Math.cos(half), 0]], l: [n([0, 0.6, 0.8]), n([0, 0.6, -0.8])], name: "굽은 형", f: "H₂O", ang: "104.5°" },
  };
  const COL = { Be: "#9aa0a6", B: "#e8a0a0", C: "#4a4a4f", N: "#3f6fb5", O: C.apple, H: "#f4f4f0", F: "#9fc95a", Cl: "#5ea35a" };

  const SCENES = [
    [0, 5, (t) => shape(MOL.lin, t, 1), [[0.2, 5, "전자쌍은 모두 음전하. 서로 [가장 멀리] 떨어지려 합니다."]]],
    [5, 10, (t) => shape(MOL.tri, t, 1), [[5.1, 10, "셋이면 평면에서 [120°]씩."]]],
    [10, 15.5, (t) => shape(MOL.tet, t, 1), [[10.1, 15.5, "넷이면 평면(90°)보다 [입체]가 더 멀어서 [109.5°]."]]],
    [15.5, 21, (t) => shape(MOL.pyr, t, 1), [[15.6, 21, "하나가 [비공유 전자쌍]이면 더 넓게 밀어내 [107°]."]]],
    [21, 26.5, (t) => shape(MOL.bent, t, 1), [[21.1, 26.5, "둘이면 [104.5°]. 물이 굽은 이유입니다."]]],
    [26.5, 32, summary, [[26.6, 32, "모양은 [원자]의 위치로 부르고, 각도는 [전자쌍 수]가 정합니다."]]],
  ];

  function rot([x, y, z], yaw, pitch) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = cy * x + sy * z, z1 = -sy * x + cy * z;
    return [x1, cp * y - sp * z1, sp * y + cp * z1];
  }
  function mol3d(m, cx, cy, S, yaw, lpOn) {
    const it = [{ z: 0, t: "c" }];
    m.b.forEach((v) => it.push({ t: "b", r: rot(v, yaw, -0.3) }));
    if (lpOn) m.l.forEach((v) => it.push({ t: "l", r: rot(v, yaw, -0.3) }));
    it.forEach((q) => { if (q.r) q.z = q.r[2]; });
    it.sort((a, b) => a.z - b.z);
    for (const q of it) {
      if (q.t === "c") { ball(cx, cy, S * 0.22, COL[m.c], m.c); continue; }
      const [x, y, z] = q.r, k = 1 + z * 0.15;
      if (q.t === "b") {
        const bx = cx + x * S * k, by = cy - y * S * k;
        ctx.strokeStyle = "rgba(243,244,239,.55)"; ctx.lineWidth = S * 0.07 * k; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
        ball(bx, by, S * (m.x === "H" ? 0.13 : 0.17) * k, COL[m.x], m.x);
      } else {
        const lx = cx + x * S * 0.5 * k, ly = cy - y * S * 0.5 * k;
        ctx.save(); ctx.translate(lx, ly); ctx.rotate(Math.atan2(-y, x));
        ctx.fillStyle = "rgba(181,215,172,.28)"; ctx.strokeStyle = "rgba(181,215,172,.7)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 0, Math.max(8, S * 0.3 * Math.hypot(x, y)), S * 0.18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.arc(0, 5, 2.6, 0, 6.3); ctx.arc(0, -5, 2.6, 0, 6.3); ctx.fill();
        ctx.restore();
      }
    }
  }
  function ball(x, y, r, col, lab) {
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, "#fff"); g.addColorStop(0.25, col); g.addColorStop(1, col);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    if (r > 11) { ctx.fillStyle = col === "#f4f4f0" || col === "#9fc95a" || col === "#e8a0a0" ? C.night : "#fff"; ctx.font = `600 ${Math.round(r * 0.7)}px ${SANS}`; ctx.textAlign = "center"; ctx.fillText(lab, x, y + r * 0.25); }
  }
  function shape(m, lt) {
    mol3d(m, 180, 280, 105, 0.5 + lt * 0.6, true);
    ctx.textAlign = "center";
    ctx.font = `700 30px ${SANS}`; ctx.fillStyle = C.paper; ctx.fillText(m.name, 180, 104);
    ctx.font = `15px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.6)";
    ctx.fillText(`${m.f} · 결합각 ${m.ang}`, 180, 130);
    ctx.fillText(`결합 전자쌍 ${m.b.length} · 비공유 전자쌍 ${m.l.length}`, 180, 420);
  }
  function summary(lt) {
    const list = [MOL.lin, MOL.tri, MOL.tet, MOL.pyr, MOL.bent];
    list.forEach((m, i) => {
      const x = i < 3 ? 70 + i * 110 : 125 + (i - 3) * 110, y = i < 3 ? 170 : 340;
      ctx.save(); ctx.globalAlpha *= clamp((lt - i * 0.25) / 0.4, 0, 1);
      mol3d(m, x, y, 38, 0.5 + lt * 0.5, true);
      ctx.textAlign = "center"; ctx.font = `600 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.fillText(m.name, x, y + 66);
      ctx.font = `11px ${MONO}`; ctx.fillStyle = C.sprout; ctx.fillText(`${m.f} ${m.ang}`, x, y + 84);
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
  const poster = () => { if (!playing) { T = reduce ? 28 : T; frame(T); sync(); } };
  poster(); document.fonts && document.fonts.ready.then(poster);
})();
