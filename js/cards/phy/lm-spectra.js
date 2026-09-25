/* 카드: 스펙트럼으로 무엇이 빛나는지 알아낼 수 있을까? — 원소별 선 스펙트럼 비교 */
(() => {
  const root = document.getElementById("card-phy-lm-spec");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const sw = $(".sw"), swT = $(".sw-t"), matchEl = $(".match");
  // 공기 중 파장(nm)과 상대 세기(모식). 가시광 범위의 뚜렷한 선만 골랐다.
  const EL = {
    H: { name: "수소", lines: [[656.28, 1], [486.13, .35], [434.05, .15], [410.17, .08], [397.01, .05]] },
    He: { name: "헬륨", lines: [[388.87, .5], [447.15, .4], [471.31, .1], [492.19, .12], [501.57, .25], [587.56, 1], [667.82, .3], [706.52, .25]] },
    Ne: { name: "네온", lines: [[540.06, .2], [585.25, .6], [588.19, .3], [594.48, .4], [597.55, .2], [603.00, .25], [607.43, .35], [609.62, .4], [614.31, .6], [616.36, .3], [621.73, .3], [626.65, .4], [633.44, .5], [638.30, .55], [640.22, 1], [650.65, .5], [659.90, .3], [667.83, .4], [671.70, .3], [692.95, .5], [703.24, .6]] },
    Na: { name: "나트륨", lines: [[589.00, 1], [589.59, .5], [568.27, .03], [568.82, .04], [615.42, .03], [616.07, .03]] },
    Hg: { name: "수은", lines: [[404.66, .5], [407.78, .1], [435.83, 1], [546.07, .9], [576.96, .3], [579.07, .3]] },
  };
  // 태양 스펙트럼의 대표적인 흡수선 (프라운호퍼선)
  const SUN_OTHER = [[393.37, 1], [396.85, 1], [422.67, .6], [430.79, .7], [438.36, .5], [495.76, .4], [516.73, .5], [517.27, .6], [518.36, .7], [527.04, .5]];
  const SAMPLES = {
    neon: { name: "네온사인", emit: true, lines: EL.Ne.lines },
    sodium: { name: "나트륨 가로등", emit: true, lines: EL.Na.lines },
    mercury: { name: "수은등", emit: true, lines: EL.Hg.lines },
    mystery: { name: "수수께끼 방전관", emit: true, lines: [...EL.H.lines.map(([l, a]) => [l, a * 0.8]), ...EL.He.lines] },
    sun: { name: "햇빛", emit: false, lines: [...EL.H.lines.slice(0, 4), [589.00, .9], [589.59, .8], ...SUN_OTHER] },
  };
  let sample = SAMPLES.neon;
  const L0 = 380, L1 = 720, TOL = 0.25;

  function wl2rgb(l, k = 1) {
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; }
    else if (l < 510) { g = 1; b = -(l - 510) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; }
    else if (l < 645) { r = 1; g = -(l - 645) / 65; } else r = 1;
    let f = 1; if (l < 420) f = 0.3 + 0.7 * (l - 380) / 40; else if (l > 700) f = 0.3 + 0.7 * (780 - l) / 80;
    return `rgb(${[r, g, b].map((v) => Math.round(255 * k * Math.pow(Math.max(0, v * f), 0.8))).join(",")})`;
  }
  // 선들이 섞였을 때 눈에 보이는 색 (CIE 1931 근사 → sRGB)
  const gs = (x, m, s1, s2) => { const t = (x - m) / (x < m ? s1 : s2); return Math.exp(-0.5 * t * t); };
  const xb = (l) => 1.056 * gs(l, 599.8, 37.9, 31.0) + 0.362 * gs(l, 442.0, 16.0, 26.7) - 0.065 * gs(l, 501.1, 20.4, 26.2);
  const yb = (l) => 0.821 * gs(l, 568.8, 46.9, 40.5) + 0.286 * gs(l, 530.9, 16.3, 31.1);
  const zb = (l) => 1.217 * gs(l, 437.0, 11.8, 36.0) + 0.681 * gs(l, 459.0, 26.0, 13.8);
  function mix(lines) {
    let X = 0, Y = 0, Z = 0;
    for (const [l, a] of lines) { X += a * xb(l); Y += a * yb(l); Z += a * zb(l); }
    let c = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.2040 * Y + 1.0570 * Z].map((v) => Math.max(0, v));
    const m = Math.max(...c) || 1; c = c.map((v) => v / m);
    return `rgb(${c.map((v) => Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055))).join(",")})`;
  }

  const { ctx, size } = fit(cv, () => draw());
  const checked = () => [...root.querySelectorAll("[data-el]")].filter((c) => c.checked).map((c) => c.dataset.el);

  function strip(y, hgt, lines, emit, X, label, labCol) {
    const x0 = X(L0), x1 = X(L1);
    if (emit) { ctx.fillStyle = C.night; ctx.fillRect(x0, y, x1 - x0, hgt); }
    else for (let x = x0; x < x1; x++) { ctx.fillStyle = wl2rgb(L0 + (x - x0) / (x1 - x0) * (L1 - L0), 0.95); ctx.fillRect(x, y, 1.5, hgt); }
    for (const [l, a] of lines) {
      if (l < L0 || l > L1) continue;
      if (emit) { ctx.globalAlpha = Math.min(1, 0.35 + a); ctx.fillStyle = wl2rgb(l); }
      else { ctx.globalAlpha = 0.55 + 0.45 * a; ctx.fillStyle = "#111"; }
      ctx.fillRect(X(l) - 1, y, 2, hgt); ctx.globalAlpha = 1;
    }
    ctx.fillStyle = labCol || C.ink2; ctx.textAlign = "right"; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText(label, x0 - 6, y + hgt / 2 + 4);
  }

  function draw() {
    const { w, h } = size;
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const padL = 64, padR = 10;
    const X = (l) => padL + (l - L0) / (L1 - L0) * (w - padL - padR);
    const els = checked();
    const topH = Math.max(26, h * 0.2), gap = 6;
    strip(8, topH, sample.lines, sample.emit, X, sample.name, C.ink);
    const avail = h - 8 - topH - 30 - gap, rowH = els.length ? Math.min(24, (avail - gap * els.length) / els.length) : 0;
    let y = 8 + topH + 12;
    for (const k of els) { strip(y, rowH, EL[k].lines, true, X, EL[k].name); y += rowH + gap; }
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let l = 400; l <= 700; l += 50) ctx.fillText(l, X(l), h - 6);
    ctx.textAlign = "right"; ctx.fillText("nm", w - 2, h - 18);
    if (!els.length) { ctx.textAlign = "center"; ctx.fillStyle = C.ink3; ctx.fillText("아래에서 비교할 원소를 골라 보세요", (X(L0) + X(L1)) / 2, 8 + topH + 40); }
  }

  function update() {
    const vis = sample.lines.filter(([l]) => l >= L0 && l <= L1);
    const els = checked();
    const explained = vis.filter(([l]) => els.some((k) => EL[k].lines.some(([m]) => Math.abs(m - l) < TOL)));
    matchEl.textContent = els.length ? `${explained.length} / ${vis.length}개` : `— / ${vis.length}개`;
    matchEl.classList.toggle("good", els.length > 0 && explained.length === vis.length);
    if (sample.emit) { sw.style.background = mix(sample.lines); swT.textContent = "이 빛의 색"; }
    else { sw.style.background = "#fff8ec"; swT.textContent = "거의 흰색"; }
    draw();
  }
  const chips = root.querySelectorAll("[data-sample]");
  chips.forEach((b) => b.addEventListener("click", () => {
    sample = SAMPLES[b.dataset.sample]; chips.forEach((o) => o.setAttribute("aria-pressed", o === b)); update();
  }));
  root.querySelectorAll("[data-el]").forEach((c) => c.addEventListener("change", update));
  update();
})();
