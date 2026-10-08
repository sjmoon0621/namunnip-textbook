/* 카드: 약수의 개수는 왜 지수에 1을 더해 곱할까? — 2^i·3^j·5^l 약수 표, 칸 수 = (a+1)(b+1)(c+1) */
(() => {
  const root = document.getElementById("card-cm1-divisors");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sb = $(".b"), sc = $(".c");
  const SUP = ["⁰", "¹", "²", "³"];
  let sel = null, cells = [];
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, b = +sb.value, c = +sc.value, np = c + 1, gap = 18, lm = 30, top = 40;
    const pw = (w - lm * np - gap * (np - 1) - 4) / np, cw = pw / (a + 1), ch = Math.min(70, (h - top - 6) / (b + 1));
    cells = [];
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let l = 0; l <= c; l++) {
      const px = lm + l * (pw + lm + gap);
      ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink2;
      ctx.fillText(`× 5${SUP[l]}`, px + pw / 2, 11);
      ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3;
      for (let i = 0; i <= a; i++) ctx.fillText(`2${SUP[i]}`, px + (i + 0.5) * cw, top - 10);
      for (let j = 0; j <= b; j++) ctx.fillText(`3${SUP[j]}`, px - 14, top + (j + 0.5) * ch);
      for (let i = 0; i <= a; i++) for (let j = 0; j <= b; j++) {
        const x = px + i * cw, y = top + j * ch, v = 2 ** i * 3 ** j * 5 ** l;
        const hot = sel && sel[0] === i && sel[1] === j && sel[2] === l;
        ctx.fillStyle = hot ? C.warn : l ? C.amber : C.sprout; ctx.globalAlpha = hot ? 1 : l ? 0.4 : 0.6;
        ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2); ctx.globalAlpha = 1;
        ctx.fillStyle = hot ? C.card : C.ink; ctx.font = `${cw < 40 ? 11 : 13}px ${F.mono}`;
        ctx.fillText(v, x + cw / 2, y + ch / 2 + 1);
        cells.push({ x, y, w: cw, h: ch, k: [i, j, l] });
      }
    }
  }

  function update() {
    const a = +sa.value, b = +sb.value, c = +sc.value;
    $(".a-out").textContent = a; $(".b-out").textContent = b; $(".c-out").textContent = c;
    if (sel && (sel[0] > a || sel[1] > b || sel[2] > c)) sel = null;
    const N = 2 ** a * 3 ** b * 5 ** c, gs = (p, e) => (p ** (e + 1) - 1) / (p - 1);
    $(".n-n").textContent = `${N} = 2${SUP[a]}·3${SUP[b]}·5${SUP[c]}`;
    $(".n-d").textContent = `${a + 1} × ${b + 1} × ${c + 1} = ${(a + 1) * (b + 1) * (c + 1)}`;
    $(".n-s").textContent = `${gs(2, a)} × ${gs(3, b)} × ${gs(5, c)} = ${gs(2, a) * gs(3, b) * gs(5, c)}`;
    if (sel) {
      const [i, j, l] = sel;
      $(".msg").textContent = `${2 ** i * 3 ** j * 5 ** l} = 2${SUP[i]} × 3${SUP[j]} × 5${SUP[l]}: 2의 지수 ${i}(0~${a}의 ${a + 1}가지 중), 3의 지수 ${j}(${b + 1}가지 중), 5의 지수 ${l}(${c + 1}가지 중)를 고른 결과입니다.`;
    } else $(".msg").textContent = "표의 칸을 눌러 보세요.";
    draw();
  }
  $("canvas").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = cells.find((q) => x >= q.x && x < q.x + q.w && y >= q.y && y < q.y + q.h);
    if (hit) { sel = hit.k; update(); }
  });
  [sa, sb, sc].forEach((s) => s.addEventListener("input", update));
  update();
})();
