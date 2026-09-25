/* 카드: 평형을 흔들면 어떻게 될까? — N₂O₄ ⇌ 2NO₂ 주사기 실험 (르샤틀리에 원리) */
(() => {
  const root = document.getElementById("card-chem-lechat");
  if (!root) return;
  const { C, F, clamp, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const d1 = $(".c1"), d2 = $(".c2"), dQK = $(".qk"), dT = $(".tt"), msg = $(".msg");
  const BROWN = "#9a4a1c", PALE = "#8d8d92";

  // Kc(25 °C) = 4.6×10⁻³ mol/L, ΔH = +57.2 kJ/mol (N₂O₄ → 2NO₂), 반트호프 식으로 온도 보정
  const Kc = (T) => 4.6e-3 * Math.exp(-57200 / 8.314 * (1 / (T + 273.15) - 1 / 298.15));
  let n1, n2, V, T, t, hist, marks, lastMsg;
  function reset() {
    V = 50; T = 25; const c1 = 0.02; n1 = c1 * V; n2 = Math.sqrt(Kc(T) * c1) * V;
    t = 0; hist = []; marks = []; lastMsg = "평형 상태입니다. 아래 단추로 평형을 흔들어 보세요."; push();
  }
  // 평형까지 남은 반응 진행 정도 ξ (mmol, 정반응 +)
  function xiEq() {
    const K = Kc(T);
    let lo = -n2 / 2, hi = n1;
    const f = (x) => ((n2 + 2 * x) / V) ** 2 - K * (n1 - x) / V;
    for (let i = 0; i < 70; i++) { const m = (lo + hi) / 2; f(m) > 0 ? hi = m : lo = m; }
    return (lo + hi) / 2;
  }
  const qk = () => (n1 > 0 ? ((n2 / V) ** 2 / (n1 / V)) / Kc(T) : Infinity);
  function push() { hist.push({ t, c1: n1 / V, c2: n2 / V }); if (hist.length > 900) hist.shift(); }

  const ACT = {
    no2: () => { n2 += 0.5; return ["NO₂ 추가", "NO₂를 넣자 Q > K가 되었습니다. 넣은 NO₂의 일부가 N₂O₄로 바뀌며 새 평형을 찾아갑니다."]; },
    n2o4: () => { n1 += 0.5; return ["N₂O₄ 추가", "N₂O₄를 넣자 Q < K가 되었습니다. 정반응이 우세해져 NO₂가 늘어납니다."]; },
    press: () => { if (V <= 12.5) return null; V /= 2; return ["압축", "부피를 절반으로 줄이자 두 농도가 모두 2배가 되어 색이 확 진해졌습니다. Q가 K의 2배가 되니, 기체 분자 수가 줄어드는 쪽(N₂O₄)으로 이동해 색이 조금 옅어집니다."]; },
    expand: () => { if (V >= 200) return null; V *= 2; return ["팽창", "부피를 2배로 늘리자 Q가 K의 절반이 되었습니다. 기체 분자 수가 늘어나는 쪽(NO₂)으로 이동합니다."]; },
    heat: () => { if (T >= 100) return null; T += 25; return ["가열", "온도를 올리자 K 자체가 커졌습니다. 흡열 방향인 정반응 쪽으로 이동해 NO₂가 늘고 색이 진해집니다."]; },
    cool: () => { if (T <= 0) return null; T -= 25; return ["냉각", "온도를 낮추자 K가 작아졌습니다. 발열 방향인 역반응 쪽으로 이동해 NO₂가 줄고 색이 옅어집니다."]; },
  };

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = false;
    // ── 왼쪽: 주사기
    const sx = 8, sy = 26, sw = w * 0.36, sh = Math.min(80, h * 0.34);
    const len = (sw - 30) * (0.2 + 0.8 * Math.log2(V / 12.5) / 4);
    const c2 = n2 / V;
    ctx.fillStyle = `rgba(154,74,28,${clamp(c2 / 0.045, 0, 1) * 0.92 + 0.02})`;
    ctx.fillRect(sx + 6, sy + 6, len, sh - 12);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(sx + .5, sy + .5, sw - 20, sh);
    ctx.fillStyle = C.ink2; ctx.fillRect(sx + 6 + len, sy + 4, 5, sh - 8);
    ctx.fillRect(sx + 11 + len, sy + sh / 2 - 2, sw - 20 - len, 4);
    ctx.fillRect(sx + sw - 12, sy + sh / 2 - 16, 5, 32);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText(`V = ${V.toFixed(1)} mL`, sx, sy - 9);
    ctx.fillText(`${T} °C`, sx + sw - 60, sy - 9);
    ctx.fillStyle = C.ink3; ctx.fillText("눈으로 보는 색 = [NO₂]", sx, sy + sh + 16);

    // ── 그래프
    const gx = narrow ? 44 : sx + sw + 44, gy = narrow ? sy + sh + 44 : 22;
    const pw = w - gx - 10, ph = h - gy - 34;
    const tNow = Math.max(t, 30), tMin = tNow - 30;
    let m = 0; for (const s of hist) if (s.t >= tMin) m = Math.max(m, s.c1, s.c2);
    const st = [0.01, 0.02, 0.05, 0.1, 0.2].find((v) => v * 4 >= m * 1.1) || 0.5, yMax = st * 4;
    const X = (v) => gx + (v - tMin) / 30 * pw, Y = (c) => gy + (1 - c / yMax) * ph;
    const xt = []; for (let s = Math.ceil(tMin / 10) * 10; s <= tNow; s += 10) xt.push([s, `${s}`]);
    NM.axes(ctx, { x0: gx, y0: gy, w: pw, h: ph, X, Y, xt, yt: [0, 1, 2, 3, 4].map((k) => [k * st, (k * st).toFixed(st < 0.1 ? 2 : 1)]), ylabel: "농도 (mol/L)", xlabel: "시간 (s)" });
    for (const mk of marks) {
      if (mk.t < tMin) continue;
      ctx.strokeStyle = C.rule; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(mk.t) + .5, gy); ctx.lineTo(X(mk.t) + .5, gy + ph); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(mk.label, X(mk.t) + 3, gy + 11);
    }
    const line = (k, col) => { ctx.beginPath(); let s0 = false; for (const s of hist) { if (s.t < tMin) continue; s0 ? ctx.lineTo(X(s.t), Y(s[k])) : ctx.moveTo(X(s.t), Y(s[k])); s0 = true; } ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.stroke(); };
    line("c1", PALE); line("c2", BROWN);
    ctx.textAlign = "right"; ctx.fillStyle = PALE; ctx.fillText("N₂O₄ (무색)", gx + pw, gy + ph - 18);
    ctx.fillStyle = BROWN; ctx.fillText("NO₂ (적갈색)", gx + pw, gy + ph - 5);
    ctx.textAlign = "left";
  }

  function readout() {
    d1.textContent = (n1 / V).toFixed(4); d2.textContent = (n2 / V).toFixed(4);
    const r = qk(); dQK.textContent = !isFinite(r) ? "∞" : r.toFixed(2);
    dT.textContent = Kc(T).toExponential(1).replace(/e([+-])(\d+)/, (_, s, d) => `×10${s === "-" ? "⁻" : ""}${[...d].map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c]).join("")}`);
    msg.textContent = lastMsg;
  }

  root.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
    const r = ACT[b.dataset.a]();
    if (!r) { lastMsg = "이 모형에서는 더 바꿀 수 없습니다 (부피 12.5–200 mL, 온도 0–100 °C)."; readout(); return; }
    marks.push({ t, label: r[0] }); lastMsg = r[1]; push(); readout(); draw();
  }));
  $(".reset").addEventListener("click", () => { reset(); readout(); draw(); });
  reset();
  let acc = 0;
  loop(cv, (dt) => {
    const x = xiEq();
    const f = 1 - Math.exp(-dt / 0.6);
    n1 -= x * f; n2 += 2 * x * f; t += dt;
    acc += dt; if (acc > 0.05) { acc = 0; push(); }
    draw(); readout();
  });
  readout();
})();
