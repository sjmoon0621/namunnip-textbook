/* 카드: 뽑아서 줄 세우는 방법은 왜 n(n − 1)(n − 2)…일까? — 자리 r개를 하나씩 채우며 후보 수가 줄어드는 것 보기 */
(() => {
  const root = document.getElementById("card-cm1-perm-slots");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sn = $(".n"), sr = $(".r"), L = "ABCDEFGH";
  const sub = (v) => String(v).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);
  const fact = (k) => (k <= 1 ? 1 : k * fact(k - 1));
  let filled = [];
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, r = +sr.value, cur = filled.length;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    // 후보
    const pr = Math.min(17, (w - 20) / n / 2 - 4), py = h * 0.17, pstep = (w - 20) / n;
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(`후보 ${n}개 (남은 것 ${n - cur}개)`, 6, 9);
    ctx.textAlign = "center";
    for (let i = 0; i < n; i++) {
      const x = 10 + (i + 0.5) * pstep, used = filled.includes(L[i]);
      ctx.globalAlpha = used ? 0.25 : 1;
      ctx.fillStyle = C.sprout; ctx.beginPath(); ctx.arc(x, py + 6, pr, 0, 7); ctx.fill();
      ctx.fillStyle = C.ink; ctx.font = `600 ${Math.round(pr * 0.85)}px ${F.mono}`; ctx.fillText(L[i], x, py + 7);
      ctx.globalAlpha = 1;
    }
    // 자리
    const sw = Math.min(46, (w - 20) / r - 8), sstep = (w - 20) / r, sy = h * 0.5;
    for (let i = 0; i < r; i++) {
      const x = 10 + (i + 0.5) * sstep, on = i < cur, hot = i === cur - 1;
      ctx.strokeStyle = hot ? C.warn : on ? C.forest : C.ink3; ctx.lineWidth = hot ? 2.2 : 1.4;
      ctx.strokeRect(x - sw / 2, sy - sw / 2, sw, sw);
      if (on) { ctx.fillStyle = hot ? C.warn : C.ink; ctx.font = `600 ${Math.round(sw * 0.5)}px ${F.mono}`; ctx.fillText(filled[i], x, sy + 1); }
      ctx.font = `${r > 6 ? 10 : 11.5}px ${F.mono}`; ctx.fillStyle = on ? (hot ? C.warn : C.forest) : C.ink3;
      ctx.fillText(on ? `${n - i}가지` : "?", x, sy + sw / 2 + 14);
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText(`${i + 1}째`, x, sy - sw / 2 - 9);
    }
    // 곱
    const parts = [];
    for (let i = 0; i < r; i++) parts.push(i < cur ? String(n - i) : "□");
    const done = cur === r, prod = filled.reduce((s, _, i) => s * (n - i), 1);
    ctx.font = `600 ${w < 400 ? 13 : 14.5}px ${F.mono}`; ctx.fillStyle = done ? C.forest : C.ink;
    ctx.fillText(`${parts.join(" × ")}${done ? ` = ${prod}` : cur ? `  (지금까지 ${prod})` : ""}`, w / 2, h * 0.9);
  }

  function msg() {
    const n = +sn.value, r = +sr.value, cur = filled.length;
    if (!cur) return `빈자리 ${r}개를 왼쪽부터 채웁니다. 첫째 자리에는 후보 ${n}개 중 무엇이든 올 수 있습니다.`;
    if (cur === r) return `${r}자리를 모두 채웠습니다. 나열 하나가 정해졌고, 자리마다 고를 수 있던 수를 곱하면 ${sub(n)}P${sub(r)} = ${filled.reduce((s, _, i) => s * (n - i), 1)}입니다.`;
    return `${cur}째 자리에 ${filled[cur - 1]}를 놓았습니다. 이미 쓴 ${cur}개(${filled.join(", ")})는 다시 쓸 수 없으므로 다음 자리의 후보는 ${n - cur}개입니다.`;
  }

  function step() {
    const n = +sn.value, r = +sr.value;
    if (filled.length >= r) return;
    const left = [...L.slice(0, n)].filter((c) => !filled.includes(c));
    filled.push(left[Math.floor(Math.random() * left.length)]);
  }

  function update() {
    if (+sr.value > +sn.value) sr.value = sn.value;
    sr.max = sn.value;
    const n = +sn.value, r = +sr.value;
    $(".n-out").textContent = n; $(".r-out").textContent = r;
    $(".d-p").innerHTML = `<sub>${n}</sub>P<sub>${r}</sub>`; $(".d-f").textContent = `${n}!/${n - r}!`; $(".d-n").textContent = `${n}!`;
    let p = 1; for (let i = 0; i < r; i++) p *= n - i;
    $(".n-p").textContent = p; $(".n-f").textContent = `${fact(n)}/${fact(n - r)} = ${fact(n) / fact(n - r)}`; $(".n-n").textContent = fact(n);
    $(".msg").textContent = msg();
    draw();
  }
  $(".go-next").addEventListener("click", () => { step(); update(); });
  $(".go-all").addEventListener("click", () => { while (filled.length < +sr.value) step(); update(); });
  $(".go-reset").addEventListener("click", () => { filled = []; update(); });
  [sn, sr].forEach((s) => s.addEventListener("input", () => { filled = []; update(); }));
  update();
})();
