/* 카드: 세제곱을 모으면 왜 정사각형이 될까? — 한 변 Tₙ = n(n+1)/2인 정사각형을 ㄱ자 띠로 나누면 k번째 띠의 넓이가 k³ */
(() => {
  const root = document.getElementById("card-alg-sum-cube");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), sn = $(".n"), sk = $(".k");
  const T = (k) => k * (k + 1) / 2;
  const FILL = ["rgba(116,171,102,.45)", "rgba(63,111,163,.32)"];
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, k = Math.min(+sk.value, n), side = T(n), pad = 16, cell = (Math.min(w, h) - 2 * pad) / side;
    const ox = (w - cell * side) / 2, oy = (h - cell * side) / 2;
    /* 칸 (i, j)는 max(i, j)가 들어가는 띠 번호에 속한다 */
    const band = (m) => { let b = 1; while (T(b) <= m) b++; return b; };
    for (let i = 0; i < side; i++) for (let j = 0; j < side; j++) {
      const b = band(Math.max(i, j));
      ctx.fillStyle = b === k ? "rgba(181,83,47,.42)" : FILL[b % 2];
      ctx.fillRect(ox + i * cell, oy + j * cell, cell, cell);
    }
    ctx.strokeStyle = C.card; ctx.lineWidth = 1;
    for (let i = 0; i <= side; i++) {
      ctx.beginPath(); ctx.moveTo(ox + i * cell, oy); ctx.lineTo(ox + i * cell, oy + side * cell); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox, oy + i * cell); ctx.lineTo(ox + side * cell, oy + i * cell); ctx.stroke();
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
    for (let b = 1; b <= n; b++) ctx.strokeRect(ox, oy, T(b) * cell, T(b) * cell);
    /* 띠 번호: 띠의 오른쪽 아래 모서리 칸들 가운데 */
    for (let b = 1; b <= n; b++) {
      const c = (T(b - 1) + T(b)) / 2 * cell;
      if (cell * b < 16) continue;
      S.tag(ctx, `${b}^3`, ox + c, oy + c, b === k ? C.warn : C.ink, "center", b === k ? 12 : 10.5);
    }
  }

  function update() {
    const n = +sn.value; sk.max = n; if (+sk.value > n) sk.value = n;
    const k = +sk.value;
    let s = 0; for (let i = 1; i <= n; i++) s += i ** 3;
    $(".n-out").textContent = n; $(".k-out").textContent = k;
    $(".d-g").innerHTML = `${k}번째 띠: ${T(k)}<sup>2</sup> − ${T(k - 1)}<sup>2</sup>`;
    $(".v-g").innerHTML = `${T(k) ** 2 - T(k - 1) ** 2} = ${k}<sup>3</sup>`;
    $(".v-s").textContent = s; $(".v-q").innerHTML = `${T(n)}<sup>2</sup> = ${T(n) ** 2}`;
    draw();
  }
  [sn, sk].forEach((x) => x.addEventListener("input", update));
  update();
})();
