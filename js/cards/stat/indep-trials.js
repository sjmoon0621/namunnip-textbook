/* 카드: 동전을 네 번 던져 앞면이 두 번 나오는 길은 몇 가지일까? — n번 독립시행의 결과를 성공 횟수별로 모아 nCr · p^r · (1−p)^(n−r) */
(() => {
  const root = document.getElementById("card-stat-indep-trials");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s), sn = $(".n"), sr = $(".r");
  const chips = [...root.querySelectorAll(".presets .chip")];
  const comb = (n, k) => { if (k < 0 || k > n) return 0; let v = 1; for (let i = 1; i <= k; i++) v = v * (n - k + i) / i; return Math.round(v); };
  const gcd = (x, y) => (y ? gcd(y, x % y) : x);
  const fr = (p, q) => { if (p === 0) return "0"; const g = gcd(p, q); return q / g === 1 ? String(p / g) : `${p / g}/${q / g}`; };
  const bits = (v) => { let c = 0; while (v) { c += v & 1; v >>= 1; } return c; };
  let m = 2;
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, r = +sr.value, p = 1 / m, cols = n + 1, cw = (w - 12) / cols, top = 26, bot = 30;
    const rowH = Math.min(26, (h - top - bot) / comb(n, Math.floor(n / 2)));
    const sq = Math.max(3, Math.min(rowH - 4, (cw - 10 - 2 * (n - 1)) / n, 16));
    for (let k = 0; k <= n; k++) {
      const x = 6 + k * cw, on = k === r;
      if (on) {
        ctx.globalAlpha = 0.35; ctx.fillStyle = C.sprout; ctx.fillRect(x + 2, 4, cw - 4, h - 8); ctx.globalAlpha = 1;
        ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.strokeRect(x + 2, 4, cw - 4, h - 8);
      }
      ctx.font = `600 11px ${F.mono}`; ctx.fillStyle = on ? C.forest : C.ink2; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(`${k}번`, x + cw / 2, 15);
      let j = 0;
      for (let v = 0; v < 1 << n; v++) {
        if (bits(v) !== k) continue;
        const y = top + j * rowH + (rowH - sq) / 2, sx = x + (cw - n * sq - (n - 1) * 2) / 2;
        for (let t = 0; t < n; t++) {
          const hit = (v >> (n - 1 - t)) & 1, xx = sx + t * (sq + 2);
          if (hit) { ctx.fillStyle = on ? C.forest : C.ink2; ctx.fillRect(xx, y, sq, sq); }
          else { ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(xx + 0.5, y + 0.5, sq - 1, sq - 1); }
        }
        j++;
      }
      const pk = comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
      ctx.font = `${on ? 700 : 500} 10.5px ${F.mono}`; ctx.fillStyle = on ? C.forest : C.ink2;
      ctx.fillText(pk.toFixed(3), x + cw / 2, h - 15);
    }
  }

  function update() {
    const n = +sn.value;
    sr.max = n; if (+sr.value > n) sr.value = n;
    const r = +sr.value, c = comb(n, r), one = Math.pow(m - 1, n - r), den = Math.pow(m, n);
    $(".n-out").textContent = n; $(".r-out").textContent = r;
    $(".eq").innerHTML = `<sub>${n}</sub>C<sub>${r}</sub> × (1/${m})<sup>${r}</sup> × (${m - 1}/${m})<sup>${n - r}</sup> = ${c} × ${fr(one, den)} = ${fr(c * one, den)} ≈ ${(c * one / den).toFixed(4)}`;
    $(".n-c").textContent = c;
    $(".n-one").textContent = fr(one, den);
    $(".n-p").textContent = fr(c * one, den);
    draw();
  }
  chips.forEach((b) => b.addEventListener("click", () => { m = +b.dataset.m; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  sn.addEventListener("input", update); sr.addEventListener("input", update);
  update();
})();
