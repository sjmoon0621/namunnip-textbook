/* 카드: 순서 없이 뽑는 수는 왜 순열의 수를 r!로 나눌까? — 순열 칸을 같은 모임끼리 묶어 nCr = nPr / r! 보기 */
(() => {
  const root = document.getElementById("card-cm1-comb-group");
  if (!root) return;
  const { C, F, fit, loop, ease, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const sn = $(".n"), sr = $(".r"), gb = $(".go-group"), L = "ABCDE";
  const fact = (k) => (k <= 1 ? 1 : k * fact(k - 1));
  let grouped = false, prog = 0, selKey = null, hits = [];
  const cv = $("canvas");
  const { ctx, size } = fit(cv, () => draw());

  function data() {
    const n = +sn.value, r = +sr.value, perms = [];
    const rec = (s) => { if (s.length === r) { perms.push(s); return; } for (const c of L.slice(0, n)) if (!s.includes(c)) rec(s + c); };
    rec("");
    const key = (s) => s.split("").sort().join(""), keys = [...new Set(perms.map(key))].sort();
    const f = fact(r), order = perms.map((s) => keys.indexOf(key(s)) * f + perms.filter((t) => key(t) === key(s)).indexOf(s));
    const cols = Math.min(perms.length, f <= 12 ? f * Math.floor(12 / f) : 12);
    return { n, r, perms, keys, key, f, order, cols, rows: Math.ceil(perms.length / cols) };
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const D = data(), g = 3, top = 22, tw = (w - 8 - g * (D.cols - 1)) / D.cols, th = Math.min(40, (h - top - 4) / D.rows - g), e = ease(prog);
    const pos = (i) => [4 + (i % D.cols) * (tw + g), top + Math.floor(i / D.cols) * (th + g)];
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(prog > 0.5 ? `묶음 ${D.keys.length}개 × 묶음마다 ${D.f}칸 = ${D.perms.length}칸` : `순열 ${D.perms.length}칸 (사전 순)`, 4, 9);
    hits = [];
    D.perms.forEach((s, i) => {
      const [x0, y0] = pos(i), [x1, y1] = pos(D.order[i]), x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e;
      const gi = D.keys.indexOf(D.key(s)), hot = selKey === D.key(s);
      ctx.fillStyle = hot ? C.warn : prog > 0 && gi % 2 ? C.amber : C.sprout;
      ctx.globalAlpha = hot ? 1 : prog > 0 && gi % 2 ? 0.25 + 0.2 * e : 0.55;
      ctx.fillRect(x, y, tw, th); ctx.globalAlpha = 1;
      ctx.fillStyle = hot ? C.card : C.ink; ctx.textAlign = "center";
      ctx.font = `${hot ? 600 : 400} ${tw < 30 ? 9.5 : 11}px ${F.mono}`; ctx.fillText(s, x + tw / 2, y + th / 2 + 1);
      hits.push({ x, y, w: tw, h: th, k: D.key(s) });
    });
    if (prog === 1) {   // 묶음 테두리
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
      if (D.f <= D.cols) D.keys.forEach((_, k) => { const [x, y] = pos(k * D.f); ctx.strokeRect(x - 1.5, y - 1.5, D.f * (tw + g) - g + 3, th + 3); });
      else ctx.strokeRect(2.5, top - 1.5, w - 5, D.rows * (th + g) - g + 3);
    }
  }

  loop(cv, (dt) => {
    const tgt = grouped ? 1 : 0;
    if (prog === tgt) return false;
    prog = reduce ? tgt : Math.max(0, Math.min(1, prog + (tgt > prog ? 1 : -1) * dt * 1.6));
    draw();
  });

  function update() {
    const n = +sn.value; sr.max = n === 5 ? 3 : n;
    if (+sr.value > +sr.max) sr.value = sr.max;
    const r = +sr.value, D = data();
    $(".n-out").textContent = n; $(".r-out").textContent = r;
    $(".d-p").innerHTML = `<sub>${n}</sub>P<sub>${r}</sub>`; $(".d-f").textContent = `${r}!`; $(".d-c").innerHTML = `<sub>${n}</sub>C<sub>${r}</sub> = <sub>${n}</sub>P<sub>${r}</sub> ÷ ${r}!`;
    $(".n-p").textContent = D.perms.length; $(".n-f").textContent = D.f; $(".n-c").textContent = `${D.perms.length} ÷ ${D.f} = ${D.perms.length / D.f}`;
    if (selKey && !D.keys.includes(selKey)) selKey = null;
    if (selKey) {
      const same = D.perms.filter((s) => D.key(s) === selKey);
      $(".msg").textContent = `모임 {${selKey.split("").join(", ")}}로 이루어진 칸은 ${same.length}개입니다: ${same.join(", ")}. 같은 ${r}명을 줄 세우는 방법 ${r}! = ${D.f}가지와 같습니다.`;
    } else $(".msg").textContent = "칸 하나를 눌러 보세요.";
    draw();
  }
  cv.addEventListener("click", (e) => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const t = hits.find((q) => x >= q.x && x < q.x + q.w && y >= q.y && y < q.y + q.h);
    if (t) { selKey = t.k; update(); }
  });
  gb.addEventListener("click", () => { grouped = !grouped; gb.setAttribute("aria-pressed", String(grouped)); gb.textContent = grouped ? "다시 펼치기" : "같은 모임끼리 묶기"; draw(); });
  [sn, sr].forEach((s) => s.addEventListener("input", () => { grouped = false; prog = 0; gb.setAttribute("aria-pressed", "false"); gb.textContent = "같은 모임끼리 묶기"; update(); }));
  update();
})();
