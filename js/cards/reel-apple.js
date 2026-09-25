/* 영상 카드: 통통사과 「사과와 달」 — 코드로 그리는 30초 숏폼 */
(() => {
  const root = document.getElementById("video-apple-moon");
  if (!root) return;
  const { C, clamp, ease, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans, SERIF = NM.F.serif;
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

    // 장면: [시작, 끝, 그리기, 자막들 [[t0, t1, 문장]]]  — [대괄호] 안은 강조색
    const SCENES = [
      [0, 5.5, sceneApple, [[0.2, 5.5, "사과는 1초 동안 [4.9 m] 떨어집니다."]]],
      [5.5, 10, sceneOrbit, [[5.6, 10, "그럼 달은? 왜 달은 [안] 떨어질까요?"]]],
      [10, 16, sceneFall, [[10.1, 12.9, "사실 달도 떨어지고 있습니다. 1초에 [1.36 mm]."], [12.9, 16, "그동안 옆으로 [1 km]를 가서, 땅에 닿지 않고 돌 뿐입니다."]]],
      [16, 20.5, sceneRatio, [[16.1, 20.5, "둘을 나누면 약 [3600]. 이 숫자는 어디서 왔을까요?"]]],
      [20.5, 25.5, sceneDist, [[20.6, 25.5, "달은 지구 중심에서 사과보다 [60배] 멉니다. 60 × 60 = 3600."]]],
      [25.5, 30, sceneLaw, [[25.6, 30, "거리가 60배면 당기는 힘은 [1/3600]. 땅과 하늘에 같은 법칙."]]],
    ];

    let T = 0, playing = false, userPaused = false, visible = false;

    function frame(time) {
      ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
      for (const [s, e, fn, caps] of SCENES) {
        if (time < s || time >= e) continue;
        const lt = time - s, dur = e - s;
        const a = Math.min(1, lt / 0.35, (dur - lt) / 0.35);
        ctx.save(); ctx.globalAlpha = clamp(a, 0, 1);
        fn(lt, dur);
        ctx.restore();
        for (const [c0, c1, text] of caps) {
          if (time < c0 || time >= c1) continue;
          const ca = clamp(Math.min((time - c0) / 0.3, (c1 - time) / 0.25), 0, 1);
          caption(text, ca, (time - c0) / 0.3);
        }
      }
      chrome(time);
    }

    // 상단 진행 막대, 채널 이름
    function chrome(time) {
      const gap = 4, n = SCENES.length, sw = (W - 24 - gap * (n - 1)) / n;
      SCENES.forEach(([s, e], i) => {
        const x = 12 + i * (sw + gap);
        ctx.fillStyle = "rgba(243,244,239,.25)"; ctx.fillRect(x, 12, sw, 2.5);
        ctx.fillStyle = C.paper; ctx.fillRect(x, 12, sw * clamp((time - s) / (e - s), 0, 1), 2.5);
      });
      appleIcon(24, 38, 8);
      ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left";
      ctx.fillText("통통사과", 38, 43);
      ctx.font = `11px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)";
      ctx.fillText("· 나뭇잎", 98, 43);
    }

    function caption(text, alpha, rise) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `700 21px ${SANS}`;
      // [강조] 파싱 후 단어 단위로 줄바꿈
      const words = [];
      let hi = false;
      for (const part of text.split(/(\[|\])/)) {
        if (part === "[") { hi = true; continue; }
        if (part === "]") { hi = false; continue; }
        part.split(/(\s+)/).forEach((wd) => wd && words.push({ wd, hi }));
      }
      const maxW = W - 56, lines = [[]];
      let lw = 0;
      for (const t of words) {
        const m = ctx.measureText(t.wd).width;
        if (lw + m > maxW && t.wd.trim() && lines.at(-1).length) { lines.push([]); lw = 0; }
        if (!lines.at(-1).length && !t.wd.trim()) continue;
        lines.at(-1).push({ ...t, m }); lw += m;
      }
      const lh = 31, y0 = H - 96 - (lines.length - 1) * lh + (1 - clamp(rise, 0, 1)) * 8;
      lines.forEach((ln, i) => {
        let x = 28;
        for (const t of ln) {
          ctx.fillStyle = t.hi ? C.sprout : C.paper;
          ctx.fillText(t.wd, x, y0 + i * lh);
          x += t.m;
        }
      });
      ctx.restore();
    }

    function appleIcon(x, y, r) {
      ctx.fillStyle = "#d4493a";
      ctx.beginPath(); ctx.arc(x - r * .38, y + r * .1, r * .8, 0, Math.PI * 2); ctx.arc(x + r * .38, y + r * .1, r * .8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#5a3a22"; ctx.lineWidth = Math.max(1, r * .16);
      ctx.beginPath(); ctx.moveTo(x, y - r * .45); ctx.lineTo(x + r * .1, y - r * 1.05); ctx.stroke();
      ctx.fillStyle = C.leaf;
      ctx.beginPath(); ctx.ellipse(x + r * .5, y - r * .9, r * .45, r * .2, -0.5, 0, Math.PI * 2); ctx.fill();
    }

    const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => {
      ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left";
    };

    /* 1. 사과 — 실제로 1초 동안 y = ½gt² 로 떨어진다 */
    function sceneApple(lt) {
      const top = 130, pxm = 240 / 4.9, ground = top + 240 + 14;
      // 가지
      ctx.strokeStyle = "#6b5a45"; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-10, 88); ctx.quadraticCurveTo(110, 92, 175, 112); ctx.stroke();
      ctx.fillStyle = C.forest;
      [[60, 82], [120, 104], [150, 90], [30, 100]].forEach(([x, y], i) => {
        ctx.beginPath(); ctx.ellipse(x, y, 16, 7, i % 2 ? .5 : -.4, 0, Math.PI * 2); ctx.fill();
      });
      // 땅
      ctx.fillStyle = "rgba(243,244,239,.12)"; ctx.fillRect(0, ground, W, 2);
      // 자
      const rx = 250;
      ctx.strokeStyle = "rgba(243,244,239,.45)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(rx, top); ctx.lineTo(rx, top + 240); ctx.stroke();
      for (let m = 0; m <= 4; m++) {
        const y = top + m * pxm;
        ctx.beginPath(); ctx.moveTo(rx, y); ctx.lineTo(rx + 8, y); ctx.stroke();
        label(`${m} m`, rx + 13, y + 4);
      }
      // 낙하: 1.2 s 부터 정확히 1초
      const ft = clamp(lt - 1.2, 0, 1);
      const y = top + 0.5 * 9.8 * ft * ft * pxm;
      if (ft > 0) {
        // 0.1초 간격 잔상 — 간격이 점점 벌어진다
        for (let k = 0.1; k < ft; k += 0.1) {
          ctx.globalAlpha *= 1; ctx.fillStyle = "rgba(212,73,58,.22)";
          ctx.beginPath(); ctx.arc(180, top + 4.9 * k * k * pxm, 4, 0, Math.PI * 2); ctx.fill();
        }
      }
      appleIcon(180, y, 16);
      label(`t = ${ft.toFixed(2)} s`, 28, 200, C.paper, "left", `500 15px ${MONO}`);
      label(`h = ${(4.9 * ft * ft).toFixed(2)} m`, 28, 222, C.sprout, "left", `500 15px ${MONO}`);
      if (lt > 2.4) label("잔상은 0.1초 간격", 28, 246);
    }

    /* 2. 지구와 달 */
    function sceneOrbit(lt) {
      const cx = 180, cy = 285, R = 130;
      ctx.strokeStyle = "rgba(243,244,239,.25)"; ctx.setLineDash([3, 5]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      earth(cx, cy, 42);
      appleIcon(cx, cy - 50, 7);
      const a = -Math.PI / 2 + 0.6 + lt * 0.55;
      moon(cx + R * Math.cos(a), cy + R * Math.sin(a), 13);
      label("지구", cx, cy + 4, C.paper, "center", `600 12px ${SANS}`);
      label("크기와 거리는 실제 비율이 아님", cx, 470, "rgba(243,244,239,.4)", "center");
    }

    /* 3. 달의 낙하: 접선(관성) vs 궤도, 차이를 과장해서 표시 */
    function sceneFall(lt) {
      const oc = { x: 180, y: 880 }, R = 640, a0 = -Math.PI / 2 - 0.36;
      const p = ease(clamp((lt - 0.4) / 3.2, 0, 1));
      const a = a0 + p * 0.36;
      const m0 = { x: oc.x + R * Math.cos(a0), y: oc.y + R * Math.sin(a0) };
      // 궤도
      ctx.strokeStyle = "rgba(243,244,239,.3)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(oc.x, oc.y, R, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.3); ctx.stroke();
      // 접선: 중력이 없다면 가는 길
      const tx = -Math.sin(a0), ty = Math.cos(a0);
      const L = p * R * 0.36;
      ctx.strokeStyle = C.sprout; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(m0.x, m0.y); ctx.lineTo(m0.x + tx * 260, m0.y + ty * 260); ctx.stroke(); ctx.setLineDash([]);
      const ghost = { x: m0.x + tx * L, y: m0.y + ty * L };
      const mn = { x: oc.x + R * Math.cos(a), y: oc.y + R * Math.sin(a) };
      if (p > 0.02) {
        ctx.strokeStyle = C.sprout; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.arc(ghost.x, ghost.y, 13, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        // 떨어진 거리
        ctx.strokeStyle = "#e0a02a"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ghost.x, ghost.y); ctx.lineTo(mn.x, mn.y); ctx.stroke();
      }
      moon(mn.x, mn.y, 13);
      label("중력이 없다면 가는 길", m0.x + tx * 150 + 6, m0.y + ty * 150 - 16, C.sprout);
      if (p > 0.6) {
        label("떨어진 만큼", (ghost.x + mn.x) / 2 + 16, (ghost.y + mn.y) / 2 + 4, "#e0a02a");
        label("실제로는 1초에 1.36 mm", (ghost.x + mn.x) / 2 + 16, (ghost.y + mn.y) / 2 + 20, "rgba(243,244,239,.5)");
      }
      label("↓ 지구 쪽", 180, 440, "rgba(243,244,239,.45)", "center");
      label("v ≈ 1.02 km/s", m0.x, m0.y - 22, "rgba(243,244,239,.6)");
    }

    /* 4. 나눗셈 */
    function sceneRatio(lt) {
      const p = (d) => clamp((lt - d) / 0.5, 0, 1);
      ctx.textAlign = "center";
      ctx.globalAlpha *= 1;
      ctx.font = `500 44px ${MONO}`; ctx.fillStyle = C.paper;
      ctx.fillText("4.9 m", 180, 210);
      ctx.fillStyle = "rgba(243,244,239,.6)"; ctx.fillRect(90, 232, 180 * p(0.3), 2);
      ctx.font = `500 44px ${MONO}`; ctx.fillStyle = C.paper;
      ctx.save(); ctx.globalAlpha *= p(0.3); ctx.fillText("1.36 mm", 180, 285); ctx.restore();
      ctx.font = `12px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)";
      ctx.fillText("사과, 1초", 180, 160);
      ctx.save(); ctx.globalAlpha *= p(0.3); ctx.fillText("달, 1초", 180, 312); ctx.restore();
      ctx.save(); ctx.globalAlpha *= p(1.3);
      ctx.font = `600 54px ${MONO}`; ctx.fillStyle = C.sprout; ctx.fillText("≈ 3600", 180, 390); ctx.restore();
      ctx.textAlign = "left";
    }

    /* 5. 거리 비교: 60칸짜리 자 */
    function sceneDist(lt) {
      const x0 = 36, x1 = 324, y = 250, n = 60, u = (x1 - x0) / n;
      const p = ease(clamp(lt / 2.2, 0, 1));
      earth(x0, y, 14);
      ctx.strokeStyle = "rgba(243,244,239,.35)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (x1 - x0) * p, y); ctx.stroke();
      for (let i = 1; i <= Math.floor(n * p); i++) {
        const h = i % 10 === 0 ? 10 : 4;
        ctx.beginPath(); ctx.moveTo(x0 + i * u, y - h); ctx.lineTo(x0 + i * u, y + h); ctx.stroke();
      }
      appleIcon(x0 + u, y - 30, 7);
      label("1 R", x0 + u, y + 28, C.paper, "center");
      if (p > 0.98) {
        moon(x1, y, 10);
        label("60 R", x1, y + 28, C.paper, "center");
      }
      label("R = 지구 반지름 6,371 km", 180, 330, "rgba(243,244,239,.5)", "center");
      if (lt > 2.4) label("384,400 ÷ 6,371 ≈ 60.3", 180, 350, "rgba(243,244,239,.5)", "center");
      if (lt > 2.8) {
        ctx.save(); ctx.globalAlpha *= clamp((lt - 2.8) / 0.5, 0, 1);
        label("60² = 3600", 180, 410, C.sprout, "center", `600 34px ${MONO}`);
        ctx.restore();
      }
    }

    /* 6. 법칙 */
    function sceneLaw(lt) {
      ctx.textAlign = "center";
      ctx.font = `italic 64px ${SERIF}`; ctx.fillStyle = C.paper;
      ctx.fillText("F ∝ 1/r²", 180, 250);
      ctx.save(); ctx.globalAlpha *= clamp((lt - 0.6) / 0.6, 0, 1);
      appleIcon(128, 330, 14);
      ctx.font = `20px ${SANS}`; ctx.fillStyle = "rgba(243,244,239,.5)"; ctx.fillText("=", 180, 338);
      moon(232, 330, 14);
      ctx.restore();
      ctx.save(); ctx.globalAlpha *= clamp((lt - 1.4) / 0.6, 0, 1);
      label("뉴턴은 이 계산으로 하늘과 땅의 중력이 같다는 것을 확인했습니다.", 180, 400, "rgba(243,244,239,.55)", "center", `11px ${SANS}`);
      ctx.restore();
      ctx.textAlign = "left";
    }

    function earth(x, y, r) {
      ctx.fillStyle = "#2f5f8a"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = C.forest;
      ctx.beginPath(); ctx.ellipse(x - r * .3, y - r * .25, r * .45, r * .3, .6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + r * .4, y + r * .35, r * .35, r * .22, -.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    function moon(x, y, r) {
      ctx.fillStyle = "#c9c9c2"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,.12)";
      ctx.beginPath(); ctx.arc(x - r * .3, y - r * .2, r * .25, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + r * .35, y + r * .3, r * .18, 0, Math.PI * 2); ctx.fill();
    }

    /* 재생 제어 */
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
      visible = e.isIntersecting;
      if (visible && !userPaused && !reduce) play(); else if (!visible) pause();
    }, { threshold: 0.4 }).observe(cv);

    // 첫 프레임: 폰트가 준비된 뒤 그린다 (정지 화면은 사과가 떨어진 뒤의 모습)
    const poster = () => { if (!playing) { T = reduce ? 2.4 : T; frame(T); sync(); } };
    poster();
    document.fonts && document.fonts.ready.then(poster);
  })();
