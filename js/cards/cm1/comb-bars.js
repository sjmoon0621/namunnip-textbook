/* 카드: 뽑는 수 r가 바뀌면 조합의 수는 어떻게 변할까? — nCk 막대그래프, 대칭 nCr = nCn−r, A 기준 나누기, 합 2^n */
(() => {
  const root = document.getElementById("card-cm1-comb-bars");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sn = $(".n"), sr = $(".r"), sb = $(".go-split");
  const Cn = (n, k) => { if (k < 0 || k > n) return 0; let v = 1; for (let i = 1; i <= k; i++) v = v * (n - k + i) / i; return Math.round(v); };
  let split = false;
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, r = +sr.value, max = Cn(n, Math.floor(n / 2));
    const x0 = 8, y0 = 36, gw = w - 16, gh = h - y0 - 22, bw = gw / (n + 1), Y = (v) => y0 + gh - v / max * gh;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let k = 0; k <= n; k++) {
      const x = x0 + k * bw + bw * 0.12, ww = bw * 0.76, v = Cn(n, k), isR = k === r, isM = k === n - r;
      if (split && n >= 1) {
        const out = Cn(n - 1, k), inA = Cn(n - 1, k - 1);
        ctx.fillStyle = C.sprout; ctx.fillRect(x, Y(out), ww, y0 + gh - Y(out));
        ctx.fillStyle = C.leaf; ctx.fillRect(x, Y(v), ww, Y(out) - Y(v));
        if (isR) { ctx.strokeStyle = C.warn; ctx.lineWidth = 2.4; ctx.strokeRect(x, Y(v), ww, y0 + gh - Y(v)); }
      } else {
        ctx.fillStyle = isR ? C.warn : isM ? C.amber : C.sprout;
        ctx.fillRect(x, Y(v), ww, y0 + gh - Y(v));
      }
      ctx.fillStyle = isR ? C.warn : C.ink2; ctx.font = `${isR ? 600 : 400} ${bw < 34 ? 10 : 11.5}px ${F.mono}`;
      ctx.fillText(v, x + ww / 2, Y(v) - 8);
      ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.fillText(k, x + ww / 2, y0 + gh + 11);
    }
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0 + gh + .5); ctx.lineTo(x0 + gw, y0 + gh + .5); ctx.stroke();
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2;
    ctx.fillText(split ? "아래: A가 빠짐 · 위: A가 뽑힘" : `막대 = ${n}명에서 k명을 뽑는 수 (아래 숫자가 k)`, x0, 8);
  }

  function update() {
    const n = +sn.value; sr.max = n;
    if (+sr.value > n) sr.value = n;
    const r = +sr.value;
    $(".n-out").textContent = n; $(".r-out").textContent = r;
    $(".d-a").innerHTML = `<sub>${n}</sub>C<sub>${r}</sub>`; $(".d-b").innerHTML = `<sub>${n}</sub>C<sub>${n - r}</sub>`;
    $(".n-a").textContent = Cn(n, r); $(".n-b").textContent = Cn(n, n - r);
    $(".n-s").textContent = `${2 ** n} = 2^${n}`.replace(`^${n}`, String(n).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]));
    const inA = Cn(n - 1, r - 1), out = Cn(n - 1, r);
    $(".msg").textContent = split
      ? `${n}명에서 ${r}명: A가 뽑히는 경우 ${inA}가지(나머지 ${n - 1}명에서 ${Math.max(r - 1, 0)}명) + A가 빠지는 경우 ${out}가지(나머지 ${n - 1}명에서 ${r}명) = ${inA + out}가지`
      : `${r}명을 뽑는 방법 ${Cn(n, r)}가지 = 남길 ${n - r}명을 고르는 방법 ${Cn(n, n - r)}가지`;
    draw();
  }
  sb.addEventListener("click", () => { split = !split; sb.setAttribute("aria-pressed", String(split)); update(); });
  [sn, sr].forEach((s) => s.addEventListener("input", update));
  update();
})();
