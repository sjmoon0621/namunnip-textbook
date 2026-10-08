/* 카드: 'p이면 q이다'가 참인지 집합으로 어떻게 판단할까? — 수직선에서 P = [a, b]와 Q를 비교하고 반례 P ∩ Qᶜ를 표시 */
(() => {
  const root = document.getElementById("card-cm2-prop-truthset");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSets, n = S.n;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sb = $(".b"), qb = [...root.querySelectorAll(".qs .chip")];
  const I = Infinity;
  const Q = {
    sq4: { f: (x) => x * x <= 4, iv: [{ a: -2, b: 2, ca: 1, cb: 1 }], t: "−2 ≤ x ≤ 2" },
    pos: { f: (x) => x > 0, iv: [{ a: 0, b: I, ca: 0 }], t: "x > 0" },
    mid: { f: (x) => x > -1 && x < 3, iv: [{ a: -1, b: 3, ca: 0, cb: 0 }], t: "−1 < x < 3" },
    out: { f: (x) => x * x - 1 > 0, iv: [{ a: -I, b: -1, cb: 0 }, { a: 1, b: I, ca: 0 }], t: "x < −1 또는 x > 1" },
  };
  let qk = "sq4";
  const { ctx, size } = fit($("canvas"), () => draw());
  const bad = () => { const a = +sa.value, b = +sb.value, f = Q[qk].f, o = []; for (let i = Math.round(a * 20); i <= Math.round(b * 20); i++) if (!f(i / 20)) o.push(i / 20); return o; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lo = -5, hi = 5, x0 = 70, x1 = w - 18, yL = h - 26;
    const X = S.line(ctx, { x0, x1, y: yL, lo, hi, step: 1 });
    const a = +sa.value, b = +sb.value, rows = [h * 0.17, h * 0.4, h * 0.62];
    ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    [["P", C.forest], ["Q", C.amber], ["반례", C.warn]].forEach(([t, col], i) => { ctx.fillStyle = col; ctx.fillText(t, 8, rows[i]); });
    S.seg(ctx, X, rows[0], a, b, C.forest, 1, 1, [x0 - 4, x1 + 4]);
    Q[qk].iv.forEach((v) => S.seg(ctx, X, rows[1], v.a, v.b, C.amber, v.ca, v.cb, [x0 - 4, x1 + 4]));
    const bd = bad();
    let i = 0;
    while (i < bd.length) {
      let j = i; while (j + 1 < bd.length && Math.abs(bd[j + 1] - bd[j] - 0.05) < 1e-9) j++;
      if (j === i) { ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(X(bd[i]), rows[2], 5, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.strokeStyle = C.warn; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(X(bd[i]), rows[2]); ctx.lineTo(X(bd[j]), rows[2]); ctx.stroke(); }
      i = j + 1;
    }
    if (!bd.length) { ctx.font = `12px ${F.sans}`; ctx.fillStyle = C.forest; ctx.textAlign = "left"; ctx.fillText("없음 → P ⊂ Q", x0, rows[2]); }
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    [a, b].forEach((v) => { ctx.beginPath(); ctx.moveTo(X(v), rows[0]); ctx.lineTo(X(v), yL); ctx.stroke(); });
    ctx.setLineDash([]);
  }
  function update() {
    if (+sa.value > +sb.value) (document.activeElement === sb ? sa : sb).value = document.activeElement === sb ? sb.value : sa.value;
    const a = +sa.value, b = +sb.value; $(".a-out").textContent = n(a); $(".b-out").textContent = n(b);
    const bd = bad(), ok = !bd.length;
    $(".eq").innerHTML = `P = {<i>x</i> | ${n(a)} ≤ <i>x</i> ≤ ${n(b)}}<br>Q = {<i>x</i> | ${Q[qk].t.replace(/x/g, "<i>x</i>")}}`;
    const s = $(".n-sub"), t = $(".n-tf");
    s.textContent = ok ? "예" : "아니요 (P ⊄ Q)"; s.className = `n-sub ${ok ? "good" : "bad"}`;
    t.textContent = ok ? "참 (p ⇒ q)" : `거짓, 반례 x = ${n(bd[0])}`; t.className = `n-tf ${ok ? "good" : "bad"}`;
    draw();
  }
  [sa, sb].forEach((s) => s.addEventListener("input", update));
  qb.forEach((b) => b.addEventListener("click", () => { qk = b.dataset.q; qb.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  update();
})();
