/* 영상: 유전 암호표 읽는 법 — 코드로 그리는 37초 숏폼 */
(() => {
  const root = document.getElementById("video-is1-codon");
  if (!root) return;
  const { C, clamp, reduce } = NM;
  const MONO = NM.F.mono, SANS = NM.F.sans;
  const cv = root.querySelector("canvas");
  const phone = cv.closest(".phone");
  const seek = root.querySelector(".reel-seek");
  const toggle = root.querySelector(".reel-toggle");
  const timeEl = root.querySelector(".reel-time");
  const W = 360, H = 640, D = 37;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const B4 = "UCAG", AA = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
  const ABBR = { A: "Ala", R: "Arg", N: "Asn", D: "Asp", C: "Cys", Q: "Gln", E: "Glu", G: "Gly", H: "His", I: "Ile", L: "Leu", K: "Lys", M: "Met", F: "Phe", P: "Pro", S: "Ser", T: "Thr", W: "Trp", Y: "Tyr", V: "Val", "*": "멈춤" };
  const idx = (c) => B4.indexOf(c[0]) * 16 + B4.indexOf(c[1]) * 4 + B4.indexOf(c[2]);

  const SCENES = [
    [0, 6, sceneRead, [[0.2, 6, "mRNA는 염기 3개씩 끊어 읽습니다. 이 세 글자가 [코돈]입니다."]]],
    [6, 11, sceneCount, [[6.1, 11, "염기는 4종류, 자리는 3개. 4 × 4 × 4 = [64]가지."]]],
    [11, 21, sceneFind, [[11.1, 13.8, "첫째 염기 [G]로 가로줄을,"], [13.8, 16.5, "둘째 염기 [A]로 세로줄을,"], [16.5, 21, "셋째 염기 [G]로 칸 안의 줄을 찾으면 [글루탐산(Glu)]."]]],
    [21, 27, sceneStartStop, [[21.1, 27, "[AUG]는 시작 신호이자 메싸이오닌. UAA·UAG·UGA는 [멈춤] 신호입니다."]]],
    [27, 32, sceneSyn, [[27.1, 32, "셋째 염기가 바뀐 GAA도 [글루탐산]. 뜻이 같은 코돈이 여럿입니다."]]],
    [32, 37, sceneSickle, [[32.1, 37, "가운데 A가 U로 바뀐 GUG는 [발린]. 겸형 적혈구 빈혈증을 일으키는 변화입니다."]]],
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
    ctx.fillStyle = C.leaf; ctx.beginPath(); ctx.arc(24, 38, 7, 0, Math.PI * 2); ctx.fill();
    ctx.font = `700 13px ${SANS}`; ctx.fillStyle = C.paper; ctx.textAlign = "left"; ctx.fillText("통통사과", 38, 43);
    ctx.font = `11px ${MONO}`; ctx.fillStyle = "rgba(243,244,239,.5)"; ctx.fillText("· 나뭇잎", 98, 43);
  }
  function caption(text, alpha, rise) {
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
    const lh = 31, y0 = H - 70 - (lines.length - 1) * lh + (1 - clamp(rise, 0, 1)) * 8;
    lines.forEach((ln, i) => { let x = 28; for (const t of ln) { ctx.fillStyle = t.hi ? C.sprout : C.paper; ctx.fillText(t.wd, x, y0 + i * lh); x += t.m; } });
    ctx.restore();
  }
  const label = (t, x, y, color = "rgba(243,244,239,.6)", align = "left", font = `11px ${MONO}`) => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.textAlign = "left";
  };
  const BC = { A: "#74ab66", U: "#d4493a", G: "#e0a02a", C: "#4f7fa8" };

  /* 표: 가로줄 = 첫째 염기, 세로줄 = 둘째 염기, 칸 안 = 셋째 염기 */
  const TX = 34, TY = 132, CW = 78, RH = 16.5, CH = RH * 4 + 6;
  function table(hl) {
    // hl: {row, col, cells:[codon...], cellColor}
    ctx.font = `600 11px ${MONO}`;
    for (let j = 0; j < 4; j++) label(B4[j], TX + j * CW + CW / 2, TY - 8, hl.col === j ? C.sprout : "rgba(243,244,239,.7)", "center", `700 13px ${MONO}`);
    label("둘째 염기 →", TX + 2 * CW, TY - 26, "rgba(243,244,239,.45)", "center");
    for (let i = 0; i < 4; i++) {
      const y = TY + i * CH;
      label(B4[i], TX - 16, y + CH / 2 + 4, hl.row === i ? C.sprout : "rgba(243,244,239,.7)", "center", `700 13px ${MONO}`);
      if (hl.row === i) { ctx.fillStyle = "rgba(181,215,172,.12)"; ctx.fillRect(TX, y, CW * 4, CH - 4); }
      for (let j = 0; j < 4; j++) {
        const x = TX + j * CW;
        if (hl.col === j) { ctx.fillStyle = "rgba(181,215,172,.12)"; ctx.fillRect(x, TY, CW - 4, CH * 4 - 4); }
        ctx.strokeStyle = "rgba(243,244,239,.18)"; ctx.strokeRect(x + .5, y + .5, CW - 4, CH - 4);
        for (let k = 0; k < 4; k++) {
          const cod = B4[i] + B4[j] + B4[k], a = AA[idx(cod)], yy = y + 3 + k * RH + 12;
          const on = hl.cells && hl.cells.includes(cod);
          if (on) { ctx.fillStyle = hl.cellColor || C.sprout; ctx.fillRect(x + 2, yy - 12, CW - 8, RH - 1); }
          label(cod, x + 5, yy, on ? C.night : "rgba(243,244,239,.55)", "left", `10px ${MONO}`);
          label(ABBR[a], x + CW - 8, yy, on ? C.night : a === "*" ? "#e0a02a" : "rgba(243,244,239,.85)", "right", `600 10px ${MONO}`);
        }
      }
    }
    label("← 첫째", TX - 10, TY + CH * 4 + 14, "rgba(243,244,239,.45)");
    label("칸 안 줄 = 셋째 염기 (U·C·A·G 순)", TX + CW * 4 - 4, TY + CH * 4 + 14, "rgba(243,244,239,.45)", "right");
  }

  function sceneRead(lt) {
    const mrna = "AUGGUGCAUCUGACUCCUGAG", bw = 15, x0 = (W - bw * mrna.length) / 2, y = 250;
    for (let i = 0; i < mrna.length; i++) {
      ctx.fillStyle = BC[mrna[i]]; ctx.fillRect(x0 + i * bw + 1, y, bw - 2, 24);
      label(mrna[i], x0 + i * bw + bw / 2, y + 17, "#fff", "center", `600 12px ${MONO}`);
    }
    const n = clamp(Math.floor((lt - 0.8) / 0.55) + 1, 0, 7);
    for (let c = 0; c < n; c++) {
      const xa = x0 + c * 3 * bw + 2, xb = x0 + (c + 1) * 3 * bw - 2;
      ctx.strokeStyle = C.sprout; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(xa, y + 30); ctx.lineTo(xa, y + 36); ctx.lineTo(xb, y + 36); ctx.lineTo(xb, y + 30); ctx.stroke();
    }
    label("5′", x0 - 16, y + 17); label("3′", x0 + bw * mrna.length + 4, y + 17);
    label("사람 β-글로빈 mRNA의 앞부분", W / 2, y - 16, "rgba(243,244,239,.5)", "center");
  }
  function sceneCount(lt) {
    const p = (d) => clamp((lt - d) / 0.4, 0, 1);
    ["U", "C", "A", "G"].forEach((b, i) => { ctx.save(); ctx.globalAlpha *= p(0.2 + i * 0.15); ctx.fillStyle = BC[b]; ctx.fillRect(66 + i * 60, 170, 46, 46); label(b, 89 + i * 60, 201, "#fff", "center", `700 22px ${MONO}`); ctx.restore(); });
    ctx.save(); ctx.globalAlpha *= p(1.2); label("4 × 4 × 4", W / 2, 300, C.paper, "center", `500 34px ${MONO}`); ctx.restore();
    ctx.save(); ctx.globalAlpha *= p(2.0); label("= 64", W / 2, 360, C.sprout, "center", `600 46px ${MONO}`); ctx.restore();
    ctx.save(); ctx.globalAlpha *= p(2.8); label("아미노산은 20가지뿐", W / 2, 410, "rgba(243,244,239,.55)", "center", `13px ${SANS}`); ctx.restore();
  }
  function sceneFind(lt) {
    const hl = {};
    if (lt > 0.2) hl.row = 3;
    if (lt > 2.8) hl.col = 2;
    if (lt > 5.5) hl.cells = ["GAG"];
    table(hl);
    label("G A G", W / 2, 80, C.paper, "center", `600 18px ${MONO}`);
  }
  function sceneStartStop(lt) {
    table({ cells: lt < 2.5 ? ["AUG"] : ["AUG", "UAA", "UAG", "UGA"], cellColor: lt < 2.5 ? C.sprout : "#e0a02a" });
  }
  function sceneSyn(lt) { table({ cells: ["GAA", "GAG"], row: 3, col: 2 }); }
  function sceneSickle(lt) {
    table({ cells: lt < 1.5 ? ["GAG"] : ["GAG", "GUG"] });
    label(lt < 1.5 ? "GAG" : "GAG → GUG", W / 2, 80, C.paper, "center", `600 18px ${MONO}`);
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
  const poster = () => { if (!playing) { T = reduce ? 18 : T; frame(T); sync(); } };
  poster();
  document.fonts && document.fonts.ready.then(poster);
})();
