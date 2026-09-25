/* 카드 2.1.1: 별빛에서 원소를 어떻게 읽을까? — 관측 스펙트럼과 원소별 기준 선 맞추기 */
(() => {
  const root = document.getElementById("card-is1-spectrum");
  if (!root) return;
  const { C, F, clamp, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const outExpl = $(".expl"), outMiss = $(".miss"), outCur = $(".cur");

  const L0 = 390, L1 = 700, TOL = 0.3;

  // 원소별 기준 선 (공기 중 파장, nm) — NIST 원자 스펙트럼 자료의 대표 선
  const REF = {
    H:  { name: "H",  lines: [656.28, 486.13, 434.05, 410.17] },
    He: { name: "He", lines: [402.62, 447.15, 471.31, 492.19, 501.57, 587.56, 667.82] },
    Na: { name: "Na", lines: [589.00, 589.59] },
    Mg: { name: "Mg", lines: [516.73, 517.27, 518.36] },
    Ca: { name: "Ca", lines: [393.37, 396.85, 422.67] },
    Fe: { name: "Fe", lines: [404.58, 406.36, 407.17, 430.79, 432.58, 438.35, 440.48, 495.76, 527.04, 532.80, 537.15] },
    Hg: { name: "Hg", lines: [404.66, 435.83, 546.07, 576.96, 579.07] },
  };
  const ORDER = ["H", "He", "Na", "Mg", "Ca", "Fe", "Hg"];

  // 관측 대상: [파장, 세기(흡수 깊이 또는 밝기), 폭(nm)]
  const L = (arr, s, wd) => arr.map((l) => [l, s, wd]);
  const TARGET = {
    sun: {
      label: "태양 · 흡수 스펙트럼", abs: true,
      lines: [
        [656.28, .8, .6], [486.13, .75, .5], [434.05, .7, .45], [410.17, .65, .4],
        [589.00, .85, .25], [589.59, .8, .25],
        [516.73, .55, .2], [517.27, .75, .25], [518.36, .8, .25],
        [393.37, .95, .9], [396.85, .95, .9], [422.67, .6, .2],
        ...L([404.58, 406.36, 407.17, 432.58, 440.48, 495.76, 532.80, 537.15], .5, .15),
        [430.79, .7, .2], [438.35, .65, .18], [527.04, .6, .18],
        [686.72, .7, .5], // 지구 대기 O₂ (B 띠)
      ],
    },
    vega: { label: "직녀성(베가) · 흡수 스펙트럼", abs: true, lines: L([656.28, 486.13, 434.05, 410.17], .85, 2.4) },
    htube: { label: "수소 방전관 · 방출 스펙트럼", abs: false, lines: [[656.28, 1, .3], [486.13, .6, .3], [434.05, .35, .3], [410.17, .25, .3]] },
    x: {
      label: "미지의 방전관 · 방출 스펙트럼", abs: false,
      lines: [[402.62, .3, .3], [447.15, .6, .3], [471.31, .3, .3], [492.19, .35, .3], [501.57, .6, .3], [587.56, 1, .3], [667.82, .6, .3],
        [404.66, .6, .3], [435.83, .9, .3], [546.07, 1, .3], [576.96, .6, .3], [579.07, .6, .3]],
    },
  };

  let target = "sun", cursor = null;
  const on = new Set();

  function wl2rgb(l) { // Dan Bruton 근사
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; }
    else if (l < 490) { g = (l - 440) / 50; b = 1; }
    else if (l < 510) { g = 1; b = -(l - 510) / 20; }
    else if (l < 580) { r = (l - 510) / 70; g = 1; }
    else if (l < 645) { r = 1; g = -(l - 645) / 65; }
    else { r = 1; }
    let f = 1;
    if (l < 420) f = 0.3 + 0.7 * (l - 380) / 40;
    else if (l > 700) f = 0.3 + 0.7 * (780 - l) / 80;
    return [r * f, g * f, b * f].map((v) => Math.pow(clamp(v, 0, 1), 1 / 1.4));
  }
  const rgb = (c, k = 1) => `rgb(${c.map((v) => Math.round(255 * clamp(v * k, 0, 1))).join(",")})`;

  const found = (l, list) => list.some((x) => Math.abs(x[0] - l) <= TOL);
  const refStatus = (el) => {
    const obs = TARGET[target].lines;
    const hit = REF[el].lines.filter((l) => found(l, obs)).length;
    return { hit, n: REF[el].lines.length };
  };

  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520;
    const padL = small ? 40 : 58, padR = 8;
    const pw = w - padL - padR;
    const X = (l) => padL + (l - L0) / (L1 - L0) * pw;
    const nmPerPx = (L1 - L0) / pw;
    const T = TARGET[target];

    const bandY = 22, bandH = Math.round(h * 0.2);
    const axisY = bandY + bandH;
    const rowsTop = axisY + 30, rowGap = 3;
    const rowH = Math.max(10, (h - rowsTop - 4) / ORDER.length - rowGap);

    // 제목
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(`관측: ${T.label}`, padL, 14);

    // 관측 스펙트럼 — 열마다 선 윤곽을 더해서 그린다
    for (let px = 0; px < pw; px++) {
      const l = L0 + (px + .5) * nmPerPx;
      let s = 0;
      for (const [lc, st, wd] of T.lines) {
        const sig = Math.max(0.9, wd / nmPerPx * 0.5);
        const d = (px + .5 - (lc - L0) / nmPerPx) / sig;
        if (Math.abs(d) < 4) s += st * Math.exp(-0.5 * d * d);
      }
      const c = wl2rgb(l);
      ctx.fillStyle = T.abs ? rgb(c, 1 - clamp(s, 0, 0.97)) : rgb(c, clamp(s * 1.3, 0, 1));
      if (!T.abs) { ctx.fillStyle = "#0d0d0e"; ctx.fillRect(padL + px, bandY, 1.2, bandH); ctx.fillStyle = rgb(c, clamp(s * 1.3, 0, 1)); ctx.globalAlpha = clamp(s * 1.6, 0, 1); }
      ctx.fillRect(padL + px, bandY, 1.2, bandH);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(padL - .5, bandY - .5, pw + 1, bandH + 1);

    // 파장 눈금
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let l = 400; l <= 700; l += 50) {
      if (small && l % 100 !== 0 && l !== 450 && l !== 550 && l !== 650) continue;
      ctx.fillRect(Math.round(X(l)), axisY, 1, 4);
      ctx.fillText(l, X(l), axisY + 15);
    }
    ctx.textAlign = "left"; ctx.fillText("nm", padL + pw - 14, axisY + 27);

    // 켠 원소의 선 표시: 관측과 겹치면 초록 ▼, 없으면 주황 ▽
    for (const el of ORDER) {
      if (!on.has(el)) continue;
      for (const l of REF[el].lines) {
        const x = X(l), ok = found(l, T.lines);
        ctx.strokeStyle = ok ? "rgba(59,124,42,.9)" : "rgba(181,83,47,.9)";
        ctx.setLineDash([2, 2]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, bandY - 4); ctx.lineTo(x, bandY + bandH); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x - 4, bandY - 9); ctx.lineTo(x + 4, bandY - 9); ctx.lineTo(x, bandY - 3); ctx.closePath();
        if (ok) { ctx.fillStyle = C.forest; ctx.fill(); } else { ctx.strokeStyle = C.warn; ctx.stroke(); }
      }
    }
    // 켠 원소로 설명되지 않는 관측 선: 띠 아래에 표시
    if (on.size) {
      for (const [l] of T.lines) {
        const ex = [...on].some((el) => REF[el].lines.some((r) => Math.abs(r - l) <= TOL));
        if (ex) continue;
        const x = X(l);
        ctx.fillStyle = C.warn;
        ctx.beginPath(); ctx.moveTo(x - 4, axisY + 1); ctx.lineTo(x + 4, axisY + 1); ctx.lineTo(x, axisY - 6); ctx.closePath(); ctx.fill();
      }
    }

    // 기준 선 스펙트럼 행
    ORDER.forEach((el, i) => {
      const y = rowsTop + i * (rowH + rowGap), act = on.has(el);
      ctx.fillStyle = act ? "#0d0d0e" : "#2a2b2c";
      ctx.fillRect(padL, y, pw, rowH);
      for (const l of REF[el].lines) {
        ctx.fillStyle = rgb(wl2rgb(l), act ? 1 : .55);
        ctx.fillRect(Math.round(X(l)) - 1, y, 2.2, rowH);
      }
      ctx.font = `${act ? 600 : 400} 11px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillStyle = act ? C.ink : C.ink3;
      ctx.fillText(REF[el].name, padL - (small ? 14 : 18), y + rowH / 2 + 4);
      if (act) {
        const { hit, n } = refStatus(el);
        ctx.fillStyle = hit === n ? C.forest : C.warn;
        ctx.beginPath(); ctx.arc(padL - (small ? 7 : 9), y + rowH / 2, 3.5, 0, Math.PI * 2);
        hit === n ? ctx.fill() : (ctx.strokeStyle = C.warn, ctx.stroke());
      }
    });
    ctx.textAlign = "left";

    // 커서
    if (cursor != null) {
      const x = X(cursor);
      ctx.strokeStyle = "rgba(35,35,38,.55)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + .5, bandY - 2); ctx.lineTo(x + .5, h - 2); ctx.stroke();
    }
  }

  // 커서에서 가장 가까운 관측 선 (원소 이름은 알려 주지 않는다)
  function nearestLine(l) {
    let best = null;
    for (const [r] of TARGET[target].lines) {
      const d = Math.abs(r - l);
      if (!best || d < best.d) best = { d, r };
    }
    return best;
  }

  function update() {
    const T = TARGET[target];
    const N = T.lines.length;
    let M = 0, miss = 0;
    for (const [l] of T.lines) if ([...on].some((el) => REF[el].lines.some((r) => Math.abs(r - l) <= TOL))) M++;
    for (const el of on) for (const l of REF[el].lines) if (!found(l, T.lines)) miss++;
    outExpl.textContent = `${M} / ${N}`;
    outExpl.className = "expl" + (on.size && M === N ? " good" : "");
    outMiss.textContent = on.size ? `${miss}개` : "—";
    outMiss.className = "miss" + (miss ? " bad" : "");
    draw();
  }

  root.querySelectorAll(".target .chip").forEach((b) => b.addEventListener("click", () => {
    target = b.dataset.t;
    root.querySelectorAll(".target .chip").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    update();
  }));
  root.querySelectorAll(".els .chip").forEach((b) => b.addEventListener("click", () => {
    const el = b.dataset.el;
    on.has(el) ? on.delete(el) : on.add(el);
    b.setAttribute("aria-pressed", on.has(el) ? "true" : "false");
    update();
  }));

  const pick = (e) => {
    const r = cv.getBoundingClientRect(), w = r.width;
    const small = w < 520, padL = small ? 40 : 58, pw = w - padL - 8;
    const l = L0 + (e.clientX - r.left - padL) / pw * (L1 - L0);
    if (l < L0 || l > L1) return;
    cursor = l;
    const nb = nearestLine(l);
    outCur.textContent = nb && nb.d < 1.2 ? `선 ${nb.r.toFixed(2)} nm` : `${l.toFixed(1)} nm`;
    draw();
  };
  cv.addEventListener("pointermove", pick);
  cv.addEventListener("pointerdown", pick);
  update();
})();
