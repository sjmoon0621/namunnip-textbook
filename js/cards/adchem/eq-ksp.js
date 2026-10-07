/* 카드: Ksp가 작은 염이 언제나 덜 녹을까? — MaXb의 몰 용해도, 공통 이온 효과 (활동도 계수 1) */
(() => {
  const root = document.getElementById("card-adchem-ksp");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  /* Ksp (25 °C, CRC), 계수 a(양이온) b(음이온), 몰질량 g/mol */
  const S = {
    agcl: { f: "AgCl", ksp: 1.77e-10, a: 1, b: 1, ion: ["Ag⁺", "Cl⁻"], M: 143.32 },
    ag2cro4: { f: "Ag₂CrO₄", ksp: 1.12e-12, a: 2, b: 1, ion: ["Ag⁺", "CrO₄²⁻"], M: 331.73 },
    pbi2: { f: "PbI₂", ksp: 9.8e-9, a: 1, b: 2, ion: ["Pb²⁺", "I⁻"], M: 461.01 },
    caf2: { f: "CaF₂", ksp: 3.45e-11, a: 1, b: 2, ion: ["Ca²⁺", "F⁻"], M: 78.07 },
    baso4: { f: "BaSO₄", ksp: 1.08e-10, a: 1, b: 1, ion: ["Ba²⁺", "SO₄²⁻"], M: 233.39 },
  };
  const KEYS = Object.keys(S);
  let k = "agcl", ion = 0;
  const cv = $("canvas"), sc = $(".c"), oc = $(".c-out"), oi = $(".ion-out"), nS = $(".n-s"), nM = $(".n-m"), nR = $(".n-r"), rank = $(".rank");
  const sup = (n) => String(n).replace(/-/g, "⁻").replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  const sci = (v) => {
    if (v >= 0.01 && v < 1000) return v.toPrecision(3);
    const e = Math.floor(Math.log10(v)), m = v / 10 ** e;
    return `${m.toFixed(2)} × 10${sup(e)}`;
  };
  /* 몰 용해도: Ksp = (a s + cM)^a (b s + cX)^b, 로그 이분법 */
  function sol(key, which, c) {
    const s = S[key], cM = which === 0 ? c : 0, cX = which === 1 ? c : 0;
    let lo = -30, hi = 1;
    for (let i = 0; i < 100; i++) {
      const m = (lo + hi) / 2, x = 10 ** m;
      const q = (s.a * x + cM) ** s.a * (s.b * x + cX) ** s.b;
      if (q > s.ksp) hi = m; else lo = m;
    }
    return 10 ** ((lo + hi) / 2);
  }
  const cNow = () => (+sc.value <= -7.99 ? 0 : 10 ** +sc.value);
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 50, x1 = w - 70, y0 = 24, y1 = h - 34;
    const ymin = -11, ymax = -2;
    const X = (lc) => x0 + (lc + 8) / 8 * (x1 - x0), Y = (ls) => y1 - (clamp(ls, ymin, ymax) - ymin) / (ymax - ymin) * (y1 - y0);
    NM.axes(ctx, { x0, y0, w: x1 - x0, h: y1 - y0, X, Y,
      xt: [-8, -6, -4, -2, 0].map((v) => [v, v === -8 ? "0" : `10${sup(v)}`]),
      yt: [-10, -8, -6, -4, -2].map((v) => [v, `10${sup(v)}`]),
      xlabel: "공통 이온 농도 (M) →", ylabel: "몰 용해도 s (mol/L)" });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    /* 다른 염: 같은 쪽 이온(양이온/음이온)을 넣을 때, 흐리게 */
    const curve = (key, which, col, lw, dash, alpha) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.globalAlpha = alpha; ctx.beginPath();
      for (let i = 0; i <= 160; i++) { const lc = -8 + 8 * i / 160, c = i === 0 ? 0 : 10 ** lc, y = Y(Math.log10(sol(key, which, c))); i ? ctx.lineTo(X(lc), y) : ctx.moveTo(X(lc), y); }
      ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    };
    KEYS.filter((q) => q !== k).forEach((q) => curve(q, ion, C.ink3, 1.2, [], 0.45));
    curve(k, 1 - ion, C.forest, 1.4, [5, 4], 0.9);
    curve(k, ion, "#3f6fa3", 2.6, [], 1);
    ctx.restore();
    /* 오른쪽 끝 이름표 */
    const labs = KEYS.map((q) => ({ q, y: Y(Math.log10(sol(q, ion, 1e-0))), t: S[q].f })).concat([{ q: "o", y: Y(Math.log10(sol(k, 1 - ion, 1))), t: `${S[k].ion[1 - ion]} 넣을 때` }]).sort((a, b) => a.y - b.y);
    for (let i = 1; i < labs.length; i++) if (labs[i].y - labs[i - 1].y < 12) labs[i].y = labs[i - 1].y + 12;
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    labs.forEach((l) => { ctx.fillStyle = l.q === k ? "#3f6fa3" : l.q === "o" ? C.forest : C.ink3; ctx.font = `${l.q === k ? "600 " : ""}10px ${F.sans}`; ctx.fillText(l.t, x1 + 5, clamp(l.y + 3, y0 + 4, y1)); });
    /* 지금 점 */
    const c = cNow(), lc = c ? Math.log10(c) : -8, s = sol(k, ion, c);
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(X(lc), Y(Math.log10(s)), 5, 0, Math.PI * 2); ctx.fill();
    /* 직선 구간 기울기 안내 */
    const coef = ion === 0 ? S[k].a : S[k].b, other = ion === 0 ? S[k].b : S[k].a, slope = -coef / other;
    ctx.fillStyle = "#3f6fa3"; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(`${S[k].ion[ion]}를 넣을 때 직선 구간 기울기 ${slope === -0.5 ? "−½" : String(slope).replace("-", "−")}`, x0 + 6, y1 - 8);
  }
  function update() {
    const s0 = S[k], c = cNow(), s = sol(k, ion, c), sw = sol(k, ion, 0);
    oi.textContent = s0.ion[ion]; oc.textContent = c ? sci(c) : "0";
    root.querySelectorAll("[data-ion]").forEach((b, i) => { b.textContent = `${s0.ion[i]} 넣기`; b.setAttribute("aria-pressed", String(+b.dataset.ion === ion)); });
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === k)));
    nS.textContent = sci(s); nM.textContent = sci(s * s0.M * 1000); nR.textContent = c ? `1 / ${sci(sw / s)}` : "같음";
    const bySol = [...KEYS].sort((a, b) => sol(b, 0, 0) - sol(a, 0, 0));
    rank.innerHTML = `<tr><th>염</th><th>Ksp</th><th>Ksp와 s의 관계</th><th>물에서 s (M)</th><th>s 순위</th></tr>`
      + [...KEYS].sort((a, b) => S[b].ksp - S[a].ksp).map((q) => `<tr class="${q === k ? "on" : ""}"><td>${S[q].f}</td><td>${sci(S[q].ksp)}</td><td>${S[q].a * S[q].b === 1 ? "s²" : "4s³"}</td><td>${sci(sol(q, 0, 0))}</td><td>${bySol.indexOf(q) + 1}</td></tr>`).join("");
    draw();
  }
  root.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { k = b.dataset.s; update(); }));
  root.querySelectorAll("[data-ion]").forEach((b) => b.addEventListener("click", () => { ion = +b.dataset.ion; update(); }));
  sc.addEventListener("input", update);
  if (/[?&]demo\b/.test(location.search)) sc.value = -2;
  update();
})();
