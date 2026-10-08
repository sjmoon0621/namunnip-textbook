/* 카드: n²이 짝수이면 n도 짝수임을 어떻게 증명할까? — n = mk + r의 정사각형을 (mk)², 띠 2개, r² 구석으로 나누어 나머지를 본다 */
(() => {
  const root = document.getElementById("card-cm2-contra-square");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s), sn = $(".n"), mb = [...root.querySelectorAll(".ms .chip")];
  let m = 2, step = 0;
  const STEPS = {
    2: ["명제: n²이 짝수이면 n은 짝수이다. n²에서 n으로 바로 가는 길은 막혀 있습니다.",
      "대우로 바꿉니다: n이 짝수가 아니면(홀수이면) n²도 홀수이다.",
      "n이 홀수이면 n = 2k + 1 (k는 0 이상의 정수)로 쓸 수 있습니다.",
      "n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1이므로 n²은 홀수입니다. 그림의 구석 조각이 1칸입니다.",
      "대우가 참이므로 원래 명제 'n²이 짝수이면 n은 짝수'도 참입니다."],
    3: ["명제: n²이 3의 배수이면 n은 3의 배수이다.",
      "대우로 바꿉니다: n이 3의 배수가 아니면 n²도 3의 배수가 아니다.",
      "n이 3의 배수가 아니면 n = 3k + 1 또는 n = 3k + 2입니다.",
      "(3k + 1)² = 3(3k² + 2k) + 1, (3k + 2)² = 3(3k² + 4k + 1) + 1. 어느 경우든 나머지가 1이므로 n²은 3의 배수가 아닙니다.",
      "대우가 참이므로 원래 명제도 참입니다."],
    4: ["명제: n²이 4의 배수이면 n은 4의 배수이다.",
      "대우로 바꿉니다: n이 4의 배수가 아니면 n²도 4의 배수가 아니다.",
      "n이 4의 배수가 아니면 n = 4k + 1, 4k + 2, 4k + 3 가운데 하나입니다.",
      "(4k + 2)² = 16k² + 16k + 4 = 4(4k² + 4k + 1)이 되어 나머지가 0입니다. 대우가 성립하지 않습니다.",
      "반례 n = 2: n² = 4는 4의 배수이지만 2는 4의 배수가 아닙니다. 원래 명제는 거짓입니다."],
  };
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, k = Math.floor(n / m), r = n % m, mk = m * k;
    const S = Math.min(h - 40, w - 90), c = S / n, x0 = (w - S) / 2 + 10, y0 = 14;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const a = i < mk, b = j < mk;
      ctx.fillStyle = a && b ? C.sprout : a || b ? C.leaf : C.amber;
      ctx.globalAlpha = a && b ? 0.9 : a || b ? 0.45 : 1;
      ctx.fillRect(x0 + j * c, y0 + i * c, c, c);
    }
    ctx.globalAlpha = 1; ctx.strokeStyle = C.card; ctx.lineWidth = 1;
    for (let i = 0; i <= n; i++) { ctx.beginPath(); ctx.moveTo(x0, y0 + i * c); ctx.lineTo(x0 + S, y0 + i * c); ctx.moveTo(x0 + i * c, y0); ctx.lineTo(x0 + i * c, y0 + S); ctx.stroke(); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, S, S);
    if (mk > 0 && r > 0) { ctx.beginPath(); ctx.moveTo(x0 + mk * c, y0); ctx.lineTo(x0 + mk * c, y0 + S); ctx.moveTo(x0, y0 + mk * c); ctx.lineTo(x0 + S, y0 + mk * c); ctx.stroke(); }
    ctx.font = `11.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.textBaseline = "top";
    if (mk > 0) ctx.fillText(`${m}k = ${mk}`, x0 + mk * c / 2, y0 + S + 6);
    if (r > 0) ctx.fillText(`r = ${r}`, x0 + mk * c + r * c / 2, y0 + S + 6);
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    if (mk > 0) ctx.fillText(`${mk}`, x0 - 6, y0 + mk * c / 2);
    if (r > 0) ctx.fillText(`${r}`, x0 - 6, y0 + mk * c + r * c / 2);
    if (r > 0) { ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.warn; ctx.fillText(`구석 ${r * r}칸`, x0 + S + 6, y0 + S - r * c / 2); }
  }
  function update() {
    const n = +sn.value, k = Math.floor(n / m), r = n % m, q = Math.floor(n * n / m), r2 = (n * n) % m;
    $(".n-out").textContent = n;
    $(".eq").innerHTML = `<i>n</i> = ${m} × ${k} + ${r}<br><i>n</i><sup>2</sup> = ${n * n} = ${m} × ${q} + ${r2}`;
    $(".n-r").textContent = r; const d2 = $(".n-r2"); d2.textContent = r2;
    d2.className = `n-r2 ${r !== 0 && r2 === 0 ? "bad" : ""}`;
    $(".n-c").textContent = r ? `${r}² = ${r * r} → 나머지 ${(r * r) % m}` : "없음";
    $(".msg").textContent = `${step + 1}/5  ${STEPS[m][step]}`;
    draw();
  }
  sn.addEventListener("input", update);
  mb.forEach((b) => b.addEventListener("click", () => { m = +b.dataset.m; step = 0; mb.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  $(".go-next").addEventListener("click", () => { step = Math.min(4, step + 1); update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  update();
})();
