/* 카드: 어떤 모임을 집합이라 하고, 어떻게 적을까? — 조건을 바꾸며 1~36 칸에서 집합의 원소를 보고 두 표현법을 비교 */
(() => {
  const root = document.getElementById("card-cm2-set-roster");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSets;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  const sn = $(".n"), cv = $("canvas");
  const COLS = 9, ROWS = 4, MAX = 36;
  let kind = "div", pick = 7;
  const isPrime = (k) => { if (k < 2) return false; for (let d = 2; d * d <= k; d++) if (k % d === 0) return false; return true; };
  const RULE = {
    div: { has: (k, n) => n % k === 0, txt: (n) => `<i>x</i>는 ${n}의 약수` },
    mul: { has: (k, n) => k % n === 0, txt: (n) => `<i>x</i>는 36 이하의 자연수이고 ${n}의 배수` },
    mulall: { has: (k, n) => k % n === 0, txt: (n) => `<i>x</i>는 ${n}의 배수인 자연수`, inf: true },
    prime: { has: (k, n) => k <= n && isPrime(k), txt: (n) => `<i>x</i>는 ${n} 이하의 소수` },
    lt: { has: (k, n) => k < n, txt: (n) => `<i>x</i>는 ${n}보다 작은 자연수` },
  };
  const { ctx, size } = fit(cv, () => draw());
  const geo = () => { const { w, h } = size; return { cw: (w - 8) / COLS, ch: (h - 30) / ROWS, x0: 4, y0: 4 }; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { cw, ch, x0, y0 } = geo(), n = +sn.value, R = RULE[kind];
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    let cnt = 0;
    for (let k = 1; k <= MAX; k++) {
      const c = (k - 1) % COLS, r = Math.floor((k - 1) / COLS), x = x0 + c * cw, y = y0 + r * ch, in_ = R.has(k, n);
      if (in_) cnt++;
      ctx.fillStyle = in_ ? C.sprout : C.card; ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
      ctx.strokeStyle = k === pick ? C.ink : C.rule; ctx.lineWidth = k === pick ? 2.5 : 1; ctx.strokeRect(x + 2, y + 2, cw - 4, ch - 4);
      ctx.font = `${in_ ? 700 : 400} ${Math.min(15, ch * 0.4)}px ${F.mono}`; ctx.fillStyle = in_ ? C.forest : C.ink3;
      ctx.fillText(String(k), x + cw / 2, y + ch / 2);
    }
    ctx.font = `12px ${F.sans}`; ctx.fillStyle = R.inf ? C.warn : C.ink2; ctx.textAlign = "left";
    const note = R.inf ? `37 이상에도 ${n}의 배수가 끝없이 있습니다 → 무한집합` : cnt ? `원소 ${cnt}개가 모두 위 칸 안에 있습니다` : "칠해진 칸이 없습니다 → 공집합";
    ctx.fillText(note, 6, h - 12);
  }

  function update() {
    const n = +sn.value, R = RULE[kind]; $(".n-out").textContent = n;
    const mem = []; for (let k = 1; k <= MAX; k++) if (R.has(k, n)) mem.push(k);
    const roster = R.inf ? `{${n}, ${2 * n}, ${3 * n}, …}` : S.fmt(mem);
    $(".eq").innerHTML = `원소나열법: A = ${roster}<br>조건제시법: A = {<i>x</i> | ${R.txt(n)}}`;
    $(".n-c").textContent = R.inf ? "셀 수 없음(무한)" : String(mem.length);
    $(".n-k").textContent = R.inf ? "무한집합" : mem.length ? "유한집합" : "공집합 ∅";
    const pin = R.has(pick, n), pd = $(".n-p"); pd.textContent = `${pick} ${pin ? "∈" : "∉"} A`; pd.className = `n-p ${pin ? "good" : ""}`;
    draw();
  }
  cv.addEventListener("pointerdown", (e) => {
    const r = cv.getBoundingClientRect(), { cw, ch, x0, y0 } = geo();
    const c = Math.floor((e.clientX - r.left - x0) / cw), rw = Math.floor((e.clientY - r.top - y0) / ch);
    if (c < 0 || c >= COLS || rw < 0 || rw >= ROWS) return;
    pick = rw * COLS + c + 1; update();
  });
  btns.forEach((b) => b.addEventListener("click", () => { kind = b.dataset.k; btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  sn.addEventListener("input", update);
  update();
})();
