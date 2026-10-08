/* 카드: (a + b)^n의 계수는 왜 조합의 수일까? — 인수마다 a·b 고르기, b를 k번 고른 선택의 수 = nCk 막대 */
(() => {
  const root = document.getElementById("card-stat-binom-expand");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sn = $(".n");
  const Cn = (n, k) => { if (k < 0 || k > n) return 0; let v = 1; for (let i = 1; i <= k; i++) v = v * (n - k + i) / i; return Math.round(v); };
  let mask = 0b0110;
  const { ctx, size } = fit(cv, () => draw());
  const bit = (j) => (mask >> j) & 1;
  const kOf = () => { let k = 0; for (let j = 0; j < +sn.value; j++) k += bit(j); return k; };
  const geo = () => {
    const { w } = size, n = +sn.value, bw = Math.min(46, (w - 16) / n - 6);
    return { n, bw, bx: (j) => w / 2 + (j - (n - 1) / 2) * (bw + 6), top: 8, bh: 54 };
  };
  const term = (n, k, html) => {
    const p = (s, e) => (e === 0 ? "" : e === 1 ? s : html ? `${s}<sup>${e}</sup>` : `${s}^${e}`);
    const a = html ? "<i>a</i>" : "a", b = html ? "<i>b</i>" : "b";
    return p(a, n - k) + p(b, k) || "1";
  };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { n, bw, bx, top, bh } = geo(), k = kOf();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let j = 0; j < n; j++) {
      const x = bx(j) - bw / 2, b = bit(j);
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1.5; ctx.strokeRect(x, top, bw, bh);
      ctx.fillStyle = b ? C.sprout : C.amber; ctx.globalAlpha = 0.45;
      ctx.fillRect(x + 3, b ? top + bh / 2 + 1 : top + 3, bw - 6, bh / 2 - 4); ctx.globalAlpha = 1;
      ctx.font = `600 15px ${F.serif}`;
      ctx.fillStyle = b ? C.ink3 : C.ink; ctx.fillText("a", bx(j), top + bh / 4 + 1);
      ctx.fillStyle = b ? C.ink : C.ink3; ctx.fillText("b", bx(j), top + bh * 3 / 4);
    }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`;
    ctx.fillText(`인수 (a + b) ${n}개`, w / 2, top + bh + 11);
    const gy = top + bh + 34, gh = h - gy - 34, max = Cn(n, Math.floor(n / 2)), cw = (w - 16) / (n + 1);
    for (let r = 0; r <= n; r++) {
      const v = Cn(n, r), bhh = v / max * gh, x = 8 + r * cw, on = r === k;
      ctx.fillStyle = on ? C.warn : C.sprout; ctx.fillRect(x + cw * 0.14, gy + gh - bhh, cw * 0.72, bhh);
      ctx.fillStyle = on ? C.warn : C.ink2; ctx.font = `${on ? 600 : 400} ${cw < 34 ? 10 : 11.5}px ${F.mono}`;
      ctx.fillText(v, x + cw / 2, gy + gh - bhh - 8);
      ctx.fillStyle = on ? C.warn : C.ink3; ctx.font = `${cw < 34 ? 9.5 : 11}px ${F.serif}`;
      ctx.fillText(term(n, r, false), x + cw / 2, gy + gh + 12);
      ctx.font = `9.5px ${F.mono}`; ctx.fillText(`b ${r}번`, x + cw / 2, gy + gh + 25);
    }
  }

  function update() {
    const n = +sn.value; mask &= (1 << n) - 1;
    $(".n-out").textContent = n;
    const k = kOf();
    $(".n-pick").textContent = Array.from({ length: n }, (_, j) => (bit(j) ? "b" : "a")).join(" ");
    $(".n-term").innerHTML = term(n, k, true);
    $(".n-same").innerHTML = `<sub>${n}</sub>C<sub>${k}</sub> = ${Cn(n, k)}`;
    $(".n-all").innerHTML = `2<sup>${n}</sup> = ${2 ** n}`;
    const parts = [];
    for (let r = 0; r <= n; r++) { const c = Cn(n, r); parts.push(`${c === 1 ? "" : c}${term(n, r, true)}`); }
    $(".eq").innerHTML = `(<i>a</i> + <i>b</i>)<sup>${n}</sup> = ${parts.join(" + ")}`;
    draw();
  }
  $(".go-next").addEventListener("click", () => {
    const n = +sn.value; let rev = 0;
    for (let j = 0; j < n; j++) rev = rev * 2 + bit(j);
    rev = (rev + 1) % (1 << n); mask = 0;
    for (let j = n - 1; j >= 0; j--) { mask |= (rev & 1) << j; rev >>= 1; }
    update();
  });
  $(".go-reset").addEventListener("click", () => { mask = 0; update(); });
  cv.addEventListener("click", (e) => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top, { n, bw, bx, top, bh } = geo();
    if (y < top || y > top + bh) return;
    for (let j = 0; j < n; j++) if (Math.abs(x - bx(j)) <= bw / 2) { mask ^= 1 << j; update(); return; }
  });
  sn.addEventListener("input", update);
  update();
})();
