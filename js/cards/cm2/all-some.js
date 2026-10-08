/* 카드: '모든'과 '어떤'이 붙으면 참·거짓은 어떻게 정해질까? — 전체집합의 원소별로 조건을 계산해 진리집합을 칠하고 두 명제를 판정 */
(() => {
  const root = document.getElementById("card-cm2-all-some");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSets;
  const $ = (s) => root.querySelector(s), cv = $("canvas");
  const ub = [...root.querySelectorAll(".uset .chip")], cb = [...root.querySelectorAll(".conds .chip")];
  const isPrime = (k) => { if (k < 2) return false; for (let d = 2; d * d <= k; d++) if (k % d === 0) return false; return true; };
  const n = S.n, sq = (x) => (x < 0 ? `(${n(x)})` : n(x)) + "²";
  const COND = {
    sq: { f: (x) => x * x >= x, t: "x² ≥ x", nt: "x² < x", show: (x) => `${sq(x)} = ${n(x * x)} ${x * x >= x ? "≥" : "<"} ${n(x)}` },
    gt: { f: (x) => x + 1 > 3, t: "x + 1 > 3", nt: "x + 1 ≤ 3", show: (x) => `${n(x)} + 1 = ${n(x + 1)} ${x + 1 > 3 ? ">" : "≤"} 3` },
    eq4: { f: (x) => x * x === 4, t: "x² = 4", nt: "x² ≠ 4", show: (x) => `${sq(x)} = ${n(x * x)} ${x * x === 4 ? "=" : "≠"} 4` },
    pr: { f: isPrime, t: "x는 소수", nt: "x는 소수가 아니다", show: (x) => `${n(x)}${isPrime(x) ? "는 소수" : x < 2 ? "는 2보다 작아 소수가 아님" : "는 1과 자신 말고도 약수가 있음"}` },
    neg: { f: (x) => x * x < 0, t: "x² < 0", nt: "x² ≥ 0", show: (x) => `${sq(x)} = ${n(x * x)} ≥ 0` },
  };
  let uk = "pos", ck = "sq", pick = null, hits = [];
  const U = () => (uk === "pos" ? Array.from({ length: 10 }, (_, i) => i + 1) : Array.from({ length: 7 }, (_, i) => i - 3));
  const { ctx, size } = fit(cv, () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const u = U(), c = COND[ck], cw = Math.min(56, (w - 12) / u.length), x0 = (w - cw * u.length) / 2, y0 = 26, ch = Math.min(46, h * 0.36);
    hits = [];
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `600 12px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(`칠한 칸 = 진리집합 P (p(x): ${c.t})`, x0, 11);
    ctx.textAlign = "center";
    u.forEach((x, i) => {
      const bx = x0 + i * cw, on = c.f(x);
      hits.push({ x: bx, w: cw, v: x });
      ctx.fillStyle = on ? C.sprout : C.card; ctx.fillRect(bx + 2, y0, cw - 4, ch);
      ctx.strokeStyle = x === pick ? C.ink : on ? C.forest : C.rule; ctx.lineWidth = x === pick ? 2.5 : 1; ctx.strokeRect(bx + 2.5, y0 + .5, cw - 5, ch - 1);
      ctx.font = `${on ? 700 : 400} 14px ${F.mono}`; ctx.fillStyle = on ? C.forest : C.ink3; ctx.fillText(n(x), bx + cw / 2, y0 + ch / 2);
      ctx.font = `11px ${F.sans}`; ctx.fillStyle = on ? C.forest : C.ink3; ctx.fillText(on ? "참" : "거짓", bx + cw / 2, y0 + ch + 12);
    });
    if (pick !== null && u.includes(pick)) {
      ctx.font = `600 12.5px ${F.mono}`; ctx.fillStyle = c.f(pick) ? C.forest : C.warn;
      ctx.fillText(`p(${n(pick)}): ${c.show(pick)} → ${c.f(pick) ? "참" : "거짓"}`, w / 2, y0 + ch + 34);
    } else { ctx.font = `12px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText("칸을 누르면 그 값에서 조건을 계산합니다", w / 2, y0 + ch + 34); }
  }
  function update() {
    const u = U(), c = COND[ck], P = u.filter(c.f), Pc = u.filter((x) => !c.f(x));
    $(".eq").innerHTML = `U = ${S.fmt(u)}<br>P = ${S.fmt(P)}, P<sup>C</sup> = ${S.fmt(Pc)} (~p: ${c.nt})`;
    const all = Pc.length === 0, some = P.length > 0;
    $(".d-all").textContent = `모든 x에 대하여 ${c.t}`; $(".d-some").textContent = `어떤 x에 대하여 ${c.t}`;
    const da = $(".n-all"), ds = $(".n-some");
    da.textContent = all ? "참 (P = U)" : `거짓 (반례 x = ${n(Pc[0])})`; da.className = `n-all ${all ? "good" : "bad"}`;
    ds.textContent = some ? `참 (예 x = ${n(P[0])})` : "거짓 (P = ∅)"; ds.className = `n-some ${some ? "good" : "bad"}`;
    $(".neg").textContent = `부정: '모든 x에 대하여 ${c.t}'의 부정은 '어떤 x에 대하여 ${c.nt}'이고, 이 명제는 ${all ? "거짓" : "참"}입니다.`;
    draw();
  }
  cv.addEventListener("pointerdown", (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, hit = hits.find((q) => x >= q.x && x < q.x + q.w);
    if (hit) { pick = hit.v; update(); }
  });
  ub.forEach((b) => b.addEventListener("click", () => { uk = b.dataset.u; pick = null; ub.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  cb.forEach((b) => b.addEventListener("click", () => { ck = b.dataset.c; cb.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  update();
})();
