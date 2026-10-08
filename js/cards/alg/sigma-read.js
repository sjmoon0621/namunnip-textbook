/* 카드: ∑ 기호 하나에는 무엇이 들어 있을까? — 아래끝 m부터 위끝 n까지의 칸을 골라 더하기 */
(() => {
  const root = document.getElementById("card-alg-sigma-read");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sm = $(".m"), sn = $(".n"), K = 10;
  const E = {
    odd: { f: (k) => 2 * k - 1, t: "(2k − 1)" }, sq: { f: (k) => k * k, t: "k^2" },
    c: { f: () => 3, t: "3" }, pw: { f: (k) => 2 ** k, t: "2^k" },
  };
  let e = E.odd;
  const sum = (a, b) => { let s = 0; for (let k = a; k <= b; k++) s += e.f(k); return s; };
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = +sm.value, n = +sn.value, cw = (w - 8) / K, bw = cw - 4, bh = 28;
    const cx = (k) => 4 + (k - 0.5) * cw, yS = 40, yK = 106, yB = yK + bh / 2 + 6;
    /* ∑ 표기 */
    ctx.textBaseline = "middle"; ctx.textAlign = "center"; ctx.fillStyle = C.ink;
    ctx.font = `400 30px ${F.serif}`; const sx = w / 2 - 40; ctx.fillText("∑", sx, yS);
    ctx.font = `600 11px ${F.mono}`; ctx.fillStyle = C.warn; ctx.fillText(String(n), sx, yS - 22); ctx.fillText(`k=${m}`, sx, yS + 22);
    S.rich(ctx, e.t, sx + 16, yS + 2, { size: 16, family: F.mono, col: C.forest });
    const fs = w < 380 ? 10 : 11.5;
    for (let k = 1; k <= K; k++) {
      const on = k >= m && k <= n, x = cx(k) - bw / 2;
      ctx.globalAlpha = on ? 1 : 0.35;
      ctx.fillStyle = on ? "rgba(116,171,102,.22)" : C.card; ctx.fillRect(x, yK - bh / 2, bw, bh);
      ctx.strokeStyle = on ? C.forest : C.rule; ctx.lineWidth = 1.2; ctx.strokeRect(x + .5, yK - bh / 2 + .5, bw - 1, bh - 1);
      ctx.fillStyle = on ? C.ink : C.ink3; ctx.font = `600 ${fs}px ${F.mono}`; ctx.fillText(S.n(e.f(k)), cx(k), yK);
      ctx.globalAlpha = 1;
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = on ? C.warn : C.ink3; ctx.fillText(`k=${k}`, cx(k), yK - bh / 2 - 9);
    }
    /* 괄호와 개수 */
    const l = cx(m) - bw / 2, r = cx(n) + bw / 2;
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(l, yB); ctx.lineTo(l, yB + 6); ctx.lineTo(r, yB + 6); ctx.lineTo(r, yB); ctx.stroke();
    S.tag(ctx, `${n} − ${m} + 1 = ${n - m + 1}개, 합 ${S.n(sum(m, n))}`, Math.min(w - 90, Math.max(90, (l + r) / 2)), yB + 22, C.warn, "center");
  }

  function update(src) {
    if (+sm.value > +sn.value) { if (src === sm) sn.value = sm.value; else sm.value = sn.value; }
    const m = +sm.value, n = +sn.value;
    $(".m-out").textContent = m; $(".n-out").textContent = n;
    $(".v-c").textContent = n - m + 1; $(".v-s").textContent = S.n(sum(m, n));
    $(".d-diff").innerHTML = `1부터 ${n}까지 − 1부터 ${m - 1}까지`;
    $(".v-d").textContent = `${S.n(sum(1, n))} − ${S.n(sum(1, m - 1))}`;
    draw();
  }
  btns.forEach((b) => b.addEventListener("click", () => { e = E[b.dataset.e]; btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  sm.addEventListener("input", () => update(sm)); sn.addEventListener("input", () => update(sn));
  update();
})();
