/* 카드: 가정과 결론을 바꾸거나 부정하면 참·거짓은 어떻게 될까? — U = {1..20}에서 원래 명제·역·대우의 가정, 결론, 반례를 비교 */
(() => {
  const root = document.getElementById("card-cm2-converse");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSets;
  const $ = (s) => root.querySelector(s);
  const pb = [...root.querySelectorAll(".props .chip")], fb = [...root.querySelectorAll(".forms .chip")];
  const isPrime = (k) => { if (k < 2) return false; for (let d = 2; d * d <= k; d++) if (k % d === 0) return false; return true; };
  const N = "<i>n</i>";
  /* 조건마다 [가정형, 부정 가정형, 결론형, 부정 결론형] */
  const c = (f, s, s2) => ({ f, hy: `${s2 || N + "이"} ${s}이면`, hn: `${s2 || N + "이"} ${s}가 아니면`, cy: `${(s2 || N + "이").replace(/이$/, "은")} ${s}이다`, cn: `${(s2 || N + "이").replace(/이$/, "은")} ${s}가 아니다` });
  const PROPS = {
    m4: [c((k) => k % 4 === 0, "4의 배수"), c((k) => k % 2 === 0, "짝수")],
    d6: [c((k) => 6 % k === 0, "6의 약수"), c((k) => 12 % k === 0, "12의 약수")],
    odd: [c((k) => k % 2 === 1, "홀수"), c((k) => (k * k) % 2 === 1, "홀수", `${N}<sup>2</sup>이`)],
    pr: [c(isPrime, "소수"), c((k) => k % 2 === 1, "홀수")],
  };
  let pk = "m4", fk = "orig";
  const seen = {};
  const U = Array.from({ length: 20 }, (_, i) => i + 1);
  const form = () => {
    const [p, q] = PROPS[pk];
    if (fk === "orig") return { H: p.f, K: q.f, t: `${p.hy} ${q.cy}.` };
    if (fk === "conv") return { H: q.f, K: p.f, t: `${q.hy} ${p.cy}.` };
    return { H: (k) => !q.f(k), K: (k) => !p.f(k), t: `${q.hn} ${p.cn}.` };
  };
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { H, K } = form(), cols = 10, cw = (w - 8) / cols, ch = (h - 12) / 2;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    U.forEach((k, i) => {
      const x = 4 + (i % cols) * cw, y = 4 + Math.floor(i / cols) * (ch + 4), hy = H(k), co = K(k), bad = hy && !co;
      ctx.fillStyle = bad ? C.warn : hy ? C.sprout : C.card; ctx.globalAlpha = bad ? 0.28 : 1; ctx.fillRect(x + 2, y, cw - 4, ch); ctx.globalAlpha = 1;
      ctx.strokeStyle = co ? C.forest : C.rule; ctx.lineWidth = co ? 3 : 1;
      const o = co ? 1.5 : .5; ctx.strokeRect(x + 2 + o, y + o, cw - 4 - 2 * o, ch - 2 * o);
      ctx.font = `${hy ? 700 : 400} 14px ${F.mono}`; ctx.fillStyle = bad ? C.warn : hy ? C.forest : C.ink3; ctx.fillText(String(k), x + cw / 2, y + ch / 2);
    });
  }
  function truth(f) { const save = fk; fk = f; const { H, K } = form(); fk = save; return U.filter((k) => H(k) && !K(k)); }
  function update() {
    const { t } = form(), bad = truth(fk);
    seen[fk] = true;
    $(".eq").innerHTML = `${t}<br>${bad.length ? `<span class="bad">거짓, 반례: ${S.fmt(bad)}</span>` : "반례 없음 → 참 (20 이하에서)"}`;
    ["orig", "conv", "contra"].forEach((f) => {
      const d = $(`.n-${f}`);
      if (!seen[f]) { d.textContent = "?"; d.className = `n-${f}`; return; }
      const ok = !truth(f).length; d.textContent = ok ? "참" : "거짓"; d.className = `n-${f} ${ok ? "good" : "bad"}`;
    });
    draw();
  }
  pb.forEach((b) => b.addEventListener("click", () => { pk = b.dataset.p; for (const k in seen) delete seen[k]; pb.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  fb.forEach((b) => b.addEventListener("click", () => { fk = b.dataset.f; fb.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  update();
})();
