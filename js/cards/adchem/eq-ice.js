/* 카드: 아무렇게나 섞은 기체는 어디에서 멈출까? — 반응 진행 정도 x에 따른 Q, Q = K인 x 찾기, Kp = Kc(RT)^Δn */
(() => {
  const root = document.getElementById("card-adchem-ice");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const R = 0.082057;
  /* 계수 nu: 반응물 음수, 생성물 양수. c0: 처음 농도 기본값(mol/L), max: 슬라이더 최대 */
  const RX = {
    hi: { K: 54, T: 703, t: "430 °C", sp: [["H₂", -1, 1.0], ["I₂", -1, 1.0], ["HI", 2, 0]], max: 2 },
    no2: { K: 4.6e-3, T: 298, t: "25 °C", sp: [["N₂O₄", -1, 0.10], ["NO₂", 2, 0]], max: 0.2 },
    pcl: { K: 0.042, T: 523, t: "250 °C", sp: [["PCl₅", -1, 0.50], ["PCl₃", 1, 0], ["Cl₂", 1, 0]], max: 1 },
    nh3: { K: 0.105, T: 745, t: "472 °C", sp: [["N₂", -1, 1.0], ["H₂", -1, 3.0], ["NH₃", 2, 0]], max: 4 },
  };
  const COL = ["#3f6fa3", C.warn, C.forest];
  let r = "hi", c0 = [], xs = 0, anim = 0;
  const cv = $("canvas"), sx = $(".x"), ox = $(".x-out"), box = $(".c0"), ice = $(".ice");
  const nQ = $(".n-q"), nK = $(".n-k"), nD = $(".n-dir"), nKp = $(".n-kp");
  const sup = (n) => String(n).replace(/-/g, "⁻").replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  const sci = (v) => {
    if (!isFinite(v)) return "∞";
    if (v === 0) return "0";
    if (v >= 0.01 && v < 1000) return v.toPrecision(3);
    const e = Math.floor(Math.log10(v)), m = v / 10 ** e;
    return `${m.toFixed(2)} × 10${sup(e)}`;
  };
  const range = () => {
    const sp = RX[r].sp; let lo = -Infinity, hi = Infinity;
    sp.forEach(([, nu], i) => { const b = -c0[i] / nu; if (nu > 0) lo = Math.max(lo, b); else hi = Math.min(hi, b); });
    return [lo, hi];
  };
  const conc = (x) => RX[r].sp.map(([, nu], i) => Math.max(0, c0[i] + nu * x));
  const lnQ = (x) => RX[r].sp.reduce((s, [, nu], i) => s + nu * Math.log(Math.max(1e-300, c0[i] + nu * x)), 0);
  function xEq() {
    let [lo, hi] = range(); const lk = Math.log(RX[r].K);
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (lnQ(m) > lk) hi = m; else lo = m; }
    return (lo + hi) / 2;
  }
  const s2x = (v) => { const [lo, hi] = range(); return lo + (hi - lo) * v / 1000; };
  const x2s = (x) => { const [lo, hi] = range(); return hi > lo ? (x - lo) / (hi - lo) * 1000 : 0; };
  /* 한쪽이 모두 0이면 반응할 수 없다 */

  function buildC0() {
    const sp = RX[r].sp; c0 = sp.map((s) => s[2]);
    box.innerHTML = sp.map(([n], i) => `<label class="mono">[${n}]₀ = <output>${c0[i].toFixed(2)}</output> M<input type="range" min="0" max="${RX[r].max}" step="${RX[r].max / 100}" value="${c0[i]}" data-i="${i}" aria-label="${n} 처음 농도"></label>`).join("");
    box.querySelectorAll("input").forEach((el) => el.addEventListener("input", () => {
      const i = +el.dataset.i; c0[i] = +el.value; el.previousElementSibling.textContent = c0[i].toFixed(2);
      setX(xs);
    }));
  }
  function setX(x) {
    const [lo, hi] = range(); xs = clamp(x, lo, hi); sx.value = x2s(xs); update();
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rx = RX[r], [lo, hi] = range(), lk = Math.log10(rx.K);
    if (!(hi - lo > 1e-9)) { ctx.fillStyle = C.ink2; ctx.font = `13px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("반응물이나 생성물 중 한쪽은 0보다 많아야 반응할 수 있습니다", w / 2, h / 2); return; }
    const bw = Math.min(120, w * 0.26);
    const x0 = 44, x1 = w - bw - 22, y0 = 22, y1 = h - 30;
    const ymin = lk - 5, ymax = lk + 5;
    const X = (x) => x0 + (x - lo) / (hi - lo) * (x1 - x0), Y = (v) => y1 - (clamp(v, ymin, ymax) - ymin) / (ymax - ymin) * (y1 - y0);
    /* 영역: Q < K (정반응) 아래, Q > K 위 */
    ctx.fillStyle = "rgba(59,124,42,.07)"; ctx.fillRect(x0, Y(lk), x1 - x0, y1 - Y(lk));
    ctx.fillStyle = "rgba(181,83,47,.07)"; ctx.fillRect(x0, y0, x1 - x0, Y(lk) - y0);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.textAlign = "right";
    for (let v = Math.ceil(ymin); v <= ymax; v += 2) { ctx.fillText(`10${sup(v)}`, x0 - 4, Y(v) + 3); }
    ctx.textAlign = "center";
    [lo, (lo + hi) / 2, hi].forEach((v) => ctx.fillText(v.toFixed(2), X(v), y1 + 13));
    if (lo < 0 && hi > 0) { ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(X(0), y0); ctx.lineTo(X(0), y1); ctx.stroke(); ctx.fillText("0", X(0), y1 + 13); }
    ctx.textAlign = "right"; ctx.fillText("x (mol/L) →", x1, y1 + 25);
    ctx.textAlign = "left"; ctx.fillText("Q (로그 눈금)", x0 + 4, y0 - 8);
    /* K 선 */
    ctx.strokeStyle = C.forest; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0, Y(lk)); ctx.lineTo(x1, Y(lk)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.forest; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(`K = ${sci(rx.K)}`, x1 - 4, Y(lk) - 5);
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("Q < K: 정반응 우세", x0 + 6, y1 - 6); ctx.fillText("Q > K: 역반응 우세", x0 + 6, y0 + 12);
    /* Q 곡선 */
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 300; i++) { const x = lo + (hi - lo) * (0.0005 + 0.999 * i / 300), y = Y(lnQ(x) / Math.LN10); i ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y); }
    ctx.stroke();
    const lq = lnQ(xs) / Math.LN10, px = X(xs), py = Y(lq);
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
    if (Math.abs(lq - lk) > 0.02) {
      const dir = lq < lk ? 1 : -1; ctx.strokeStyle = C.apple; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(px + dir * 9, py); ctx.lineTo(px + dir * 30, py); ctx.lineTo(px + dir * 25, py - 4); ctx.moveTo(px + dir * 30, py); ctx.lineTo(px + dir * 25, py + 4); ctx.stroke();
    }
    /* 농도 막대 */
    const cs = conc(xs), sp = rx.sp, top = Math.max(...c0.map((v, i) => v + Math.max(0, sp[i][1]) * Math.max(0, hi)), ...cs, 1e-9);
    const bx0 = w - bw - 4, bh = y1 - y0 - 16, gap = bw / sp.length;
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
    sp.forEach(([n], i) => {
      const hh = cs[i] / top * bh, xx = bx0 + gap * i + gap * 0.18, ww = gap * 0.64;
      ctx.fillStyle = COL[i]; ctx.fillRect(xx, y1 - hh, ww, hh);
      ctx.strokeStyle = COL[i]; ctx.setLineDash([3, 3]); const h0 = c0[i] / top * bh; ctx.strokeRect(xx + .5, y1 - h0 + .5, ww - 1, h0); ctx.setLineDash([]);
      ctx.fillStyle = C.ink; ctx.fillText(n, xx + ww / 2, y1 + 13); ctx.fillStyle = C.ink2; ctx.fillText(cs[i] === 0 ? "0" : cs[i] < 0.01 ? cs[i].toExponential(1) : cs[i].toFixed(3), xx + ww / 2, Math.max(y0 + 8, y1 - hh - 4));
    });
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(bx0, y1); ctx.lineTo(w - 4, y1); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("농도 (M), 점선 = 처음", bx0, y0 - 8);
  }
  function update() {
    const rx = RX[r], sp = rx.sp, cs = conc(xs), lq = lnQ(xs), Q = Math.exp(lq);
    ox.textContent = (xs < 0 ? "−" : "") + Math.abs(xs).toFixed(3);
    nQ.textContent = sci(Q); nK.textContent = sci(rx.K);
    const d = Math.log(Q / rx.K);
    nD.textContent = Math.abs(d) < 0.01 ? "평형 (Q = K)" : d < 0 ? "정반응 →" : "← 역반응";
    nD.className = Math.abs(d) < 0.01 ? "n-dir good" : "n-dir";
    const dn = sp.reduce((s, [, nu]) => s + nu, 0);
    nKp.innerHTML = `${rx.t}: Δn = ${dn > 0 ? "+" : ""}${dn}${dn ? "" : "(기체 분자 수 변화 없음)"}, K<sub>p</sub> = K<sub>c</sub>(RT)<sup>Δn</sup> = ${sci(rx.K * (R * rx.T) ** dn)} (압력 단위 atm, R = 0.08206 L·atm/(mol·K), T = ${rx.T} K)`;
    const sgn = (nu) => nu > 0 ? `+${nu === 1 ? "" : nu}x` : `−${nu === -1 ? "" : -nu}x`;
    ice.innerHTML = `<tr><th></th>${sp.map(([n]) => `<th>${n}</th>`).join("")}</tr>`
      + `<tr><td>처음</td>${c0.map((v) => `<td>${v.toFixed(2)}</td>`).join("")}</tr>`
      + `<tr><td>변화</td>${sp.map(([, nu]) => `<td>${sgn(nu)}</td>`).join("")}</tr>`
      + `<tr><td>지금</td>${cs.map((v) => `<td>${v.toFixed(3)}</td>`).join("")}</tr>`;
    root.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.r === r)));
    draw();
  }
  function animTo(t) {
    cancelAnimationFrame(anim); const a = xs, t0 = performance.now(), dur = NM.reduce ? 1 : 900;
    const step = (now) => { const k = clamp((now - t0) / dur, 0, 1); setX(a + (t - a) * NM.ease(k)); if (k < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  }
  root.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { r = b.dataset.r; buildC0(); setX(0); }));
  sx.addEventListener("input", () => { cancelAnimationFrame(anim); xs = s2x(+sx.value); update(); });
  $(".go").addEventListener("click", () => animTo(xEq()));
  buildC0(); setX(0);
})();
