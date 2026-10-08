/* 카드: 수열은 어떤 함수일까? — 자연수 n에 a_n을 하나씩 대응시키는 화살표와 점 그래프 */
(() => {
  const root = document.getElementById("card-alg-seq-func");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sn = $(".n"), link = $(".link");
  const N = 8, PR = [2, 3, 5, 7, 11, 13, 17, 19, 23];
  const frac = (k) => (k === 1 ? "1" : `1/${k}`);
  const RULES = {
    odd: { f: (k) => 2 * k - 1, gen: "<i>a</i><sub><i>n</i></sub> = 2<i>n</i> − 1" },
    sq: { f: (k) => k * k, gen: "<i>a</i><sub><i>n</i></sub> = <i>n</i><sup>2</sup>" },
    alt: { f: (k) => (k % 2 ? -1 : 1), gen: "<i>a</i><sub><i>n</i></sub> = (−1)<sup><i>n</i></sup>" },
    inv: { f: (k) => 1 / k, lab: frac, gen: "<i>a</i><sub><i>n</i></sub> = 1/<i>n</i>" },
    geo: { f: (k) => 3 * 2 ** (k - 1), gen: "<i>a</i><sub><i>n</i></sub> = 3 · 2<sup><i>n</i>−1</sup>" },
    prime: { f: (k) => PR[k - 1], gen: "2, 3, 5, 7, 11, … (간단한 일반항 식이 없음)" },
  };
  let rule = RULES.odd;
  const lab = (k) => (rule.lab ? rule.lab(k) : S.n(rule.f(k)));
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = +sn.value, L = 40, gw = w - L - 12, cx = (i) => L + (i - 0.5) / N * gw;
    const yN = 14, yA = h * 0.24;
    ctx.textBaseline = "middle";
    ctx.font = `11px ${F.mono}`; ctx.textAlign = "right"; ctx.fillStyle = C.ink3;
    ctx.fillText("n", L - 10, yN); S.rich(ctx, "a_n", L - 10, yA, { size: 12, family: F.mono, col: C.ink3, align: "right" });
    for (let i = 1; i <= N; i++) {
      const on = i === k, col = on ? C.warn : C.ink2;
      ctx.textAlign = "center";
      ctx.font = `${on ? "700 " : ""}12.5px ${F.mono}`; ctx.fillStyle = col; ctx.fillText(String(i), cx(i), yN);
      S.arrow(ctx, cx(i), yN + 9, cx(i), yA - 11, on ? C.warn : C.rule, on ? 2 : 1.2);
      ctx.font = `${on ? "700 " : ""}12.5px ${F.mono}`; ctx.fillStyle = on ? C.warn : C.ink; ctx.fillText(lab(i), cx(i), yA);
    }
    const vals = Array.from({ length: N }, (_, i) => rule.f(i + 1));
    let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
    const pad = (hi - lo) * 0.12 || 1; lo -= lo < 0 ? pad : 0; hi += pad;
    const box = { x: L, y: yA + 26, w: gw, h: h - yA - 26 - 22 };
    const G = S.frame(ctx, box, { x0: 0.5, x1: N + 0.5, y0: lo, y1: hi },
      { xt: Array.from({ length: N }, (_, i) => [i + 1, String(i + 1)]), yt: S.ticks(lo, hi, 4) });
    if (link.checked) {
      ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2; ctx.beginPath();
      vals.forEach((v, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, G.X(i + 1), G.Y(v))); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx(k), yA + 10); ctx.lineTo(cx(k), G.Y(vals[k - 1])); ctx.stroke(); ctx.setLineDash([]);
    vals.forEach((v, i) => S.dot(ctx, G.X(i + 1), G.Y(v), i + 1 === k ? 6 : 4.5, i + 1 === k ? C.warn : C.forest));
    const tx = `(${k}, ${lab(k)})`, right = cx(k) < L + gw * 0.7;
    S.tag(ctx, tx, cx(k) + (right ? 10 : -10), G.Y(vals[k - 1]) - 12, C.warn, right ? "left" : "right");
  }

  function update() {
    const k = +sn.value;
    $(".n-out").textContent = k; $(".gen").innerHTML = rule.gen;
    $(".v-n").textContent = k; $(".v-a").textContent = lab(k);
    const d = rule.f(k + 1) - rule.f(k);
    $(".v-d").textContent = rule === RULES.inv ? `−1/${k * (k + 1)}` : S.n(d);
    draw();
  }
  btns.forEach((b) => b.addEventListener("click", () => {
    rule = RULES[b.dataset.r]; btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update();
  }));
  sn.addEventListener("input", update); link.addEventListener("change", draw);
  update();
})();
