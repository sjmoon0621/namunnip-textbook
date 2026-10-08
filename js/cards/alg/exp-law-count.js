/* 카드: 거듭제곱끼리 곱하면 지수는 왜 더해질까? — 네 지수법칙을 인수(동그라미)를 세어 확인 */
(() => {
  const root = document.getElementById("card-alg-exp-law-count");
  if (!root) return;
  const { C, F, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const sm = $(".m"), sn = $(".n");
  let r = 0;
  const { ctx, size } = fit($("canvas"), () => draw());

  function tok(x, y, rad, lab, col, crossed) {
    ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = C.card; ctx.font = `italic 600 ${Math.round(rad * 1.05)}px ${F.serif}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(lab, x, y + 1);
    if (crossed) { ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - rad, y + rad); ctx.lineTo(x + rad, y - rad); ctx.stroke(); }
  }
  function text(s, x, y, col = C.ink2, align = "left", size = 14) {
    ctx.fillStyle = col; ctx.font = `600 ${size}px ${F.sans}`; ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillText(s, x, y);
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = +sm.value, n = +sn.value, L = 14;
    if (r === 0) {
      const step = Math.min(46, (w - 2 * L) / (m + n + 1)), rad = step * 0.4;
      text(`a${E.sup(m)}`, L, h * 0.28, C.forest); text(`a${E.sup(n)}`, L + step * (m + 1), h * 0.28, E.BLUE);
      for (let i = 0; i < m + n; i++) tok(L + rad + step * (i + (i >= m ? 1 : 0)), h * 0.5, rad, "a", i < m ? C.forest : E.BLUE);
      text(`모두 ${m + n}개 → a${E.sup(m + n)}`, L, h * 0.78, C.ink, "left", 13);
    } else if (r === 1) {
      const cnt = Math.max(m, n), step = Math.min(46, (w - 2 * L - 40) / cnt), rad = step * 0.4, x0 = L + 40;
      text("분자", L, h * 0.3); text("분모", L, h * 0.62);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0 - 4, h * 0.46); ctx.lineTo(x0 + step * cnt, h * 0.46); ctx.stroke();
      const c = Math.min(m, n);
      for (let i = 0; i < m; i++) tok(x0 + rad + step * i, h * 0.3, rad, "a", C.forest, i < c);
      for (let i = 0; i < n; i++) tok(x0 + rad + step * i, h * 0.62, rad, "a", E.BLUE, i < c);
      const res = m > n ? `분자에 ${m - n}개 남음 → a${E.sup(m - n)}` : m < n ? `분모에 ${n - m}개 남음 → 1/a${E.sup(n - m)} = a${E.sup(m - n)}` : "모두 지워짐 → 1 = a⁰";
      text(res, L, h * 0.88, C.ink, "left", 13);
    } else if (r === 2) {
      const step = Math.min(30, (w - 2 * L - 46) / m, (h - 44) / n), rad = step * 0.4, x0 = L + 46;
      for (let j = 0; j < n; j++) {
        text(`a${E.sup(m)}`, L, 12 + step * (j + 0.5), C.ink3);
        for (let i = 0; i < m; i++) tok(x0 + rad + step * i, 12 + step * (j + 0.5), rad, "a", j % 2 ? E.BLUE : C.forest);
      }
      text(`${m}개씩 ${n}줄 = ${m * n}개 → a${E.sup(m * n)}`, L, Math.min(h - 10, 12 + step * n + 16), C.ink, "left", 13);
    } else {
      const step = Math.min(40, (w - 2 * L) / (2.2 * n + 0.5)), rad = step * 0.4;
      text(`(ab)${E.sup(n)}: 짝 ${n}개`, L, h * 0.12, C.ink3);
      for (let i = 0; i < n; i++) { const x = L + rad + step * 2.2 * i; tok(x, h * 0.3, rad, "a", C.forest); tok(x + step, h * 0.3, rad, "b", E.BLUE); }
      text("a끼리, b끼리 다시 모으면", L, h * 0.52, C.ink3);
      for (let i = 0; i < n; i++) tok(L + rad + step * i, h * 0.7, rad, "a", C.forest);
      for (let i = 0; i < n; i++) tok(L + rad + step * (n + 0.5 + i), h * 0.7, rad, "b", E.BLUE);
      text(`a${E.sup(n)} b${E.sup(n)}`, L, h * 0.9, C.ink, "left", 13);
    }
  }

  function update() {
    const m = +sm.value, n = +sn.value;
    $(".m-out").textContent = m; $(".n-out").textContent = n;
    const S = (x) => `<sup>${E.n(x)}</sup>`;
    let eq, cnt, law, direct;
    if (r === 0) { eq = `<i>a</i>${S(m)} × <i>a</i>${S(n)} = <i>a</i>${S(m + n)}`; cnt = m + n; law = 2 ** (m + n); direct = 2 ** m * 2 ** n; }
    else if (r === 1) { eq = `<i>a</i>${S(m)} ÷ <i>a</i>${S(n)} = <i>a</i><sup>${m}−${n}</sup> = <i>a</i>${S(m - n)}`; cnt = Math.abs(m - n); law = 2 ** (m - n); direct = 2 ** m / 2 ** n; }
    else if (r === 2) { eq = `(<i>a</i>${S(m)})${S(n)} = <i>a</i><sup>${m}×${n}</sup> = <i>a</i>${S(m * n)}`; cnt = m * n; law = 2 ** (m * n); direct = (2 ** m) ** n; }
    else { eq = `(<i>ab</i>)${S(n)} = <i>a</i>${S(n)}<i>b</i>${S(n)}`; cnt = 2 * n; law = 2 ** n * 3 ** n; direct = 6 ** n; }
    sm.disabled = r === 3;
    $(".eq").innerHTML = eq;
    $(".n-c").textContent = `${cnt}개`;
    $(".n-l").textContent = E.n(law, 4); $(".n-d").textContent = E.n(direct, 4);
    draw();
  }
  chips.forEach((c) => c.addEventListener("click", () => { r = +c.dataset.r; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update(); }));
  [sm, sn].forEach((s) => s.addEventListener("input", update));
  update();
})();
