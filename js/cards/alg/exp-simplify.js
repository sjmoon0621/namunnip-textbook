/* 카드: 복잡한 거듭제곱 식을 밑 하나로 정리하려면? — 단계별 정리와 밑 2·3의 지수 장부 */
(() => {
  const root = document.getElementById("card-alg-exp-simplify");
  if (!root) return;
  const { C, F, fit } = NM, E = NMExp;
  const $ = (s) => root.querySelector(s), chips = [...root.querySelectorAll(".presets .chip[data-e]")];
  /* 단계: [식(html), 쓴 법칙, 2의 지수 변화, 3의 지수 변화, 화살표 글자] */
  const EX = [
    { value: 4 ** 1.5 * 8 ** (-1 / 3) / Math.SQRT2, steps: [
      ["4<sup>3/2</sup> × 8<sup>−1/3</sup> ÷ √2", "근호를 지수로: √2 = 2<sup>1/2</sup>", 0, 0, ""],
      ["4<sup>3/2</sup> = (2<sup>2</sup>)<sup>3/2</sup> = 2<sup>3</sup>", "(<i>a</i><sup><i>x</i></sup>)<sup><i>y</i></sup> = <i>a</i><sup><i>xy</i></sup>", 3, 0, "+3"],
      ["× 8<sup>−1/3</sup> = × (2<sup>3</sup>)<sup>−1/3</sup> = × 2<sup>−1</sup>", "<i>a</i><sup><i>x</i></sup><i>a</i><sup><i>y</i></sup> = <i>a</i><sup><i>x</i>+<i>y</i></sup>", -1, 0, "−1"],
      ["÷ √2 = ÷ 2<sup>1/2</sup>", "<i>a</i><sup><i>x</i></sup> ÷ <i>a</i><sup><i>y</i></sup> = <i>a</i><sup><i>x</i>−<i>y</i></sup>", -0.5, 0, "−1/2"],
      ["2<sup>3 − 1 − 1/2</sup> = 2<sup>3/2</sup> = 2√2", "정리 끝", 0, 0, ""],
    ] },
    { value: (27 ** (2 / 3)) ** 0.5 * 9 ** -0.25, steps: [
      ["(27<sup>2/3</sup>)<sup>1/2</sup> × 9<sup>−1/4</sup>", "밑을 소인수로: 27 = 3<sup>3</sup>, 9 = 3<sup>2</sup>", 0, 0, ""],
      ["27<sup>2/3</sup> = (3<sup>3</sup>)<sup>2/3</sup> = 3<sup>2</sup>", "(<i>a</i><sup><i>x</i></sup>)<sup><i>y</i></sup> = <i>a</i><sup><i>xy</i></sup>", 0, 2, "+2"],
      ["(3<sup>2</sup>)<sup>1/2</sup> = 3<sup>1</sup>", "(<i>a</i><sup><i>x</i></sup>)<sup><i>y</i></sup> = <i>a</i><sup><i>xy</i></sup> (지수 2가 ×1/2로 1)", 0, -1, "×1/2"],
      ["× 9<sup>−1/4</sup> = × (3<sup>2</sup>)<sup>−1/4</sup> = × 3<sup>−1/2</sup>", "<i>a</i><sup><i>x</i></sup><i>a</i><sup><i>y</i></sup> = <i>a</i><sup><i>x</i>+<i>y</i></sup>", 0, -0.5, "−1/2"],
      ["3<sup>1 − 1/2</sup> = 3<sup>1/2</sup> = √3", "정리 끝", 0, 0, ""],
    ] },
    { value: Math.sqrt(6) * Math.sqrt(12), steps: [
      ["√6 × √12 = 6<sup>1/2</sup> × 12<sup>1/2</sup>", "근호를 지수로", 0, 0, ""],
      ["6<sup>1/2</sup> = (2 · 3)<sup>1/2</sup> = 2<sup>1/2</sup> · 3<sup>1/2</sup>", "(<i>ab</i>)<sup><i>x</i></sup> = <i>a</i><sup><i>x</i></sup><i>b</i><sup><i>x</i></sup>", 0.5, 0.5, "+1/2"],
      ["12<sup>1/2</sup> = (2<sup>2</sup> · 3)<sup>1/2</sup> = 2<sup>1</sup> · 3<sup>1/2</sup>", "(<i>ab</i>)<sup><i>x</i></sup> = <i>a</i><sup><i>x</i></sup><i>b</i><sup><i>x</i></sup>, (<i>a</i><sup><i>x</i></sup>)<sup><i>y</i></sup> = <i>a</i><sup><i>xy</i></sup>", 1, 0.5, "+1, +1/2"],
      ["2<sup>3/2</sup> · 3<sup>1</sup> = 3 × 2√2 = 6√2", "정리 끝", 0, 0, ""],
    ] },
  ];
  let e = 0, k = 1;
  const frac = (v) => { const q = Math.round(v * 6); if (q % 6 === 0) return E.n(q / 6); const g = (a, b) => (b ? g(b, a % b) : a), d = g(Math.abs(q), 6); return `${q < 0 ? "−" : ""}${Math.abs(q) / d}/${6 / d}`; };
  const { ctx, size } = fit($("canvas"), () => draw());

  function ledger(y, w, base, idx, col) {
    const L = 46, R = w - 14, X0 = -1, X1 = 4, X = (v) => L + (v - X0) / (X1 - X0) * (R - L);
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    for (let v = X0; v <= X1; v++) { ctx.fillRect(X(v) - 0.5, y - 4, 1, 8); ctx.fillText(E.n(v), X(v), y + 16); }
    ctx.fillStyle = col; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(`밑 ${base}`, 4, y);
    let pos = 0, lane = 0;
    const st = EX[e].steps;
    for (let i = 1; i <= k; i++) {
      const d = st[i][idx]; if (!d) continue;
      const yy = y - 12 - lane * 13, x1 = X(pos), x2 = X(pos + d);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(x1, yy); ctx.lineTo(x2, yy); ctx.stroke();
      const dir = Math.sign(d); ctx.beginPath(); ctx.moveTo(x2, yy); ctx.lineTo(x2 - dir * 7, yy - 4); ctx.lineTo(x2 - dir * 7, yy + 4); ctx.fill();
      ctx.font = `600 10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(idx === 3 && st[i][4].includes(",") ? "+1/2" : idx === 2 && st[i][4].includes(",") ? "+1" : st[i][4], (x1 + x2) / 2, yy - 2);
      pos += d; lane++;
    }
    ctx.beginPath(); ctx.arc(X(pos), y, 5.5, 0, 7); ctx.fillStyle = col; ctx.fill();
    return pos;
  }

  function sums() { let a = 0, b = 0; for (let i = 1; i <= k; i++) { a += EX[e].steps[i][2]; b += EX[e].steps[i][3]; } return [a, b]; }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    ledger(h * 0.44, w, 2, 2, C.forest);
    ledger(h * 0.86, w, 3, 3, E.BLUE);
  }

  function update() {
    const st = EX[e].steps, [a, b] = sums(), last = k === st.length - 1;
    $(".eq").innerHTML = `${st[k][0]}<br><span class="law">${st[k][1]}</span>${last ? ` · 처음 식을 직접 계산하면 ${E.approx(EX[e].value)}` : ""}`;
    $(".n-2").textContent = frac(a); $(".n-3").textContent = frac(b);
    $(".n-v").textContent = E.approx(2 ** a * 3 ** b);
    $(".go-next").disabled = last;
    draw();
  }
  chips.forEach((c) => c.addEventListener("click", () => { e = +c.dataset.e; k = 0; chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c))); update(); }));
  $(".go-next").addEventListener("click", () => { if (k < EX[e].steps.length - 1) k++; update(); });
  $(".go-reset").addEventListener("click", () => { k = 0; update(); });
  update();
})();
