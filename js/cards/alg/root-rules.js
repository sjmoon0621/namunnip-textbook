/* 카드: 거듭제곱근끼리 곱하면 왜 근호 하나로 합쳐질까? — 다섯 성질의 양변과 거듭제곱한 값 비교 */
(() => {
  const root = document.getElementById("card-alg-root-rules");
  if (!root) return;
  const { C, F, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip")];
  const sa = $(".a"), sb = $(".b"), sn = $(".n"), sm = $(".m");
  let k = 0;
  const rt = (x, n) => (x >= 0 ? Math.pow(x, 1 / n) : n % 2 ? -Math.pow(-x, 1 / n) : NaN);
  const fin = (v) => (isFinite(v) ? v : NaN);
  const num = (v) => (v < 0 ? `(${E.n(v)})` : E.n(v));
  const rad = (n, inner, paren) => `${n === 2 ? "" : `<sup>${n}</sup>`}√${paren ? `(${inner})` : inner}`;
  const RULES = [
    { b: 1, m: 0, pw: (n) => n, L: (a, b, n) => rt(a, n) * rt(b, n), R: (a, b, n) => rt(a * b, n),
      Lh: (a, b, n) => `${rad(n, num(a))} × ${rad(n, num(b))}`, Rh: (a, b, n) => rad(n, `${num(a)}·${num(b)}`, true) },
    { b: 1, m: 0, pw: (n) => n, L: (a, b, n) => rt(a, n) / rt(b, n), R: (a, b, n) => rt(a / b, n),
      Lh: (a, b, n) => `${rad(n, num(a))} ÷ ${rad(n, num(b))}`, Rh: (a, b, n) => rad(n, `${num(a)}/${num(b)}`, true) },
    { b: 0, m: 1, pw: (n) => n, L: (a, b, n, m) => rt(a, n) ** m, R: (a, b, n, m) => rt(a ** m, n),
      Lh: (a, b, n, m) => `(${rad(n, num(a))})<sup>${m}</sup>`, Rh: (a, b, n, m) => rad(n, `${num(a)}<sup>${m}</sup>`, true) },
    { b: 0, m: 1, pw: (n, m) => n * m, L: (a, b, n, m) => rt(rt(a, n), m), R: (a, b, n, m) => rt(a, m * n),
      Lh: (a, b, n, m) => rad(m, rad(n, num(a)), true), Rh: (a, b, n, m) => rad(m * n, num(a)) },
    { b: 0, m: 1, pw: (n) => 2 * n, L: (a, b, n, m) => rt(a ** (2 * m), 2 * n), R: (a, b, n, m) => rt(a ** m, n),
      Lh: (a, b, n, m) => rad(2 * n, `${num(a)}<sup>${2 * m}</sup>`, true), Rh: (a, b, n, m) => rad(n, `${num(a)}<sup>${m}</sup>`, true) },
  ];
  const { ctx, size } = fit($("canvas"), () => draw());

  function vals() {
    const a = +sa.value, b = +sb.value, n = +sn.value, m = +sm.value, r = RULES[k], p = r.pw(n, m);
    const L = fin(r.L(a, b, n, m)), R = fin(r.R(a, b, n, m));
    return { a, b, n, m, r, p, L, R, Lp: L ** p, Rp: R ** p };
  }

  function group(rows, top, w) {
    const lx = 84, rx = w - 70, finite = rows.map((r) => r[1]).filter(isFinite);
    const mx = Math.max(1e-9, ...finite.map(Math.abs)), neg = finite.some((v) => v < -1e-9);
    const zx = neg ? (lx + rx) / 2 : lx, sc = (neg ? (rx - lx) / 2 : rx - lx) / mx;
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(zx, top - 4); ctx.lineTo(zx, top + rows.length * 30 - 6); ctx.stroke(); ctx.setLineDash([]);
    rows.forEach(([lab, v, col], i) => {
      const y = top + i * 30;
      ctx.fillStyle = C.ink2; ctx.font = `12px ${F.sans}`; ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillText(lab, lx - 8, y + 9);
      if (!isFinite(v)) { ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.font = `600 12px ${F.sans}`; ctx.fillText("실수가 아님", zx + 6, y + 9); return; }
      const x1 = zx + v * sc;
      ctx.fillStyle = col; ctx.fillRect(Math.min(zx, x1), y, Math.max(2, Math.abs(x1 - zx)), 18);
      ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.mono}`;
      ctx.textAlign = v < 0 ? "right" : "left"; ctx.fillText(E.n(v), v < 0 ? Math.min(x1, zx) - 5 : Math.max(x1, zx) + 5, y + 9);
    });
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const v = vals(), top = 16, gap = Math.max(84, h / 2);
    ctx.fillStyle = C.ink3; ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText("양변의 값", 8, top - 4); ctx.fillText(`양변을 ${v.p}제곱한 값`, 8, top + gap - 4);
    group([["좌변", v.L, C.forest], ["우변", v.R, E.BLUE]], top + 6, w);
    group([[`좌변${E.sup(v.p)}`, v.Lp, C.forest], [`우변${E.sup(v.p)}`, v.Rp, E.BLUE]], top + gap + 6, w);
  }

  function update() {
    const v = vals();
    [["a", v.a], ["b", v.b], ["n", v.n], ["m", v.m]].forEach(([s, x]) => { $(`.${s}-out`).textContent = E.n(x); });
    sb.disabled = !v.r.b; sm.disabled = !v.r.m;
    $(".eq").innerHTML = `좌변 ${v.r.Lh(v.a, v.b, v.n, v.m)}<br>우변 ${v.r.Rh(v.a, v.b, v.n, v.m)}`;
    $(".n-l").textContent = isFinite(v.L) ? E.n(v.L) : "실수 아님";
    $(".n-r").textContent = isFinite(v.R) ? E.n(v.R) : "실수 아님";
    const same = isFinite(v.L) && isFinite(v.R) && Math.abs(v.L - v.R) < 1e-9 * Math.max(1, Math.abs(v.L));
    const vd = $(".n-v");
    vd.textContent = !isFinite(v.L) || !isFinite(v.R) ? "비교 불가" : same ? "같음" : "다름";
    vd.className = `n-v ${same ? "good" : "bad"}`;
    draw();
  }
  chips.forEach((c) => c.addEventListener("click", () => { k = +c.dataset.r; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update(); }));
  [sa, sb, sn, sm].forEach((s) => s.addEventListener("input", update));
  update();
})();
