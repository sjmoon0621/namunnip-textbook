/* 카드: 조건이 붙은 줄 세우기는 어떻게 셀까? — nPr 수형도에서 조건에 맞는 가지 끝만 남겨 세고 공식과 비교 */
(() => {
  const root = document.getElementById("card-cm1-perm-tree");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s), condBtns = [...root.querySelectorAll(".cond .chip")];
  const sn = $(".n"), sr = $(".r"), L = "ABCD";
  const sub = (v) => String(v).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);
  const P = (n, r) => { let p = 1; for (let i = 0; i < r; i++) p *= n - i; return p; };
  const fact = (k) => P(k, k);
  const OK = {
    none: () => true,
    first: (s) => s[0] === "A",
    notfirst: (s) => s[0] !== "A",
    adj: (s) => { const a = s.indexOf("A"), b = s.indexOf("B"); return a >= 0 && b >= 0 && Math.abs(a - b) === 1; },
  };
  let cond = "none", sel = null, leafX = [];
  const { ctx, size } = fit($("canvas"), () => draw());

  /* levels[d]: 길이 d인 나열들(사전 순). levels[r]이 가지 끝 */
  function levels(n, r) {
    const lv = [[""]];
    for (let d = 1; d <= r; d++) {
      const nx = [];
      for (const s of lv[d - 1]) for (const c of L.slice(0, n)) if (!s.includes(c)) nx.push(s + c);
      lv.push(nx);
    }
    return lv;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, r = +sr.value, lv = levels(n, r), leaves = lv[r], N = leaves.length;
    const top = 14, bot = h - 26, xs = (w - 16) / N, X = (q, d) => { const span = N / lv[d].length; return 8 + (q * span + span / 2) * xs; };
    const Y = (d) => top + (bot - top) * d / r, rad = Math.max(5, Math.min(9, xs * 0.4));
    const lit = (str) => leaves.some((s) => s.startsWith(str) && OK[cond](s));
    const onSel = (str) => sel !== null && leaves[sel].startsWith(str);
    leafX = leaves.map((_, q) => X(q, r));
    for (let d = 1; d <= r; d++) lv[d].forEach((s, q) => {
      const pq = lv[d - 1].indexOf(s.slice(0, -1)), on = lit(s), hot = onSel(s);
      ctx.strokeStyle = hot ? C.warn : on ? C.forest : C.ink3; ctx.globalAlpha = on || hot ? 1 : 0.28; ctx.lineWidth = hot ? 2.4 : on ? 1.6 : 1;
      ctx.beginPath(); ctx.moveTo(X(pq, d - 1), Y(d - 1)); ctx.lineTo(X(q, d), Y(d)); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(0, 0), Y(0), 3.5, 0, 7); ctx.fill();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let d = 1; d <= r; d++) lv[d].forEach((s, q) => {
      const on = lit(s), hot = onSel(s), x = X(q, d), y = Y(d);
      ctx.globalAlpha = on || hot ? 1 : 0.35;
      ctx.fillStyle = hot ? C.warn : on ? (d === r ? C.forest : C.sprout) : C.rule;
      ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill();
      ctx.fillStyle = hot || (on && d === r) ? C.card : C.ink; ctx.font = `600 ${Math.round(rad * 1.25)}px ${F.mono}`;
      ctx.fillText(s.slice(-1), x, y + 1);
    });
    ctx.globalAlpha = 1;
    const ok = leaves.filter(OK[cond]).length;
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
    ctx.fillText(`가지 끝 ${N}개 중 ${ok}개`, w - 6, h - 5);
  }

  function formula(n, r) {
    const all = P(n, r);
    if (cond === "none") return `${sub(n)}P${sub(r)} = ${all}`;
    if (cond === "first") return `${sub(n - 1)}P${sub(r - 1)} = ${P(n - 1, r - 1)}`;
    if (cond === "notfirst") return `${all} − ${P(n - 1, r - 1)} = ${all - P(n - 1, r - 1)}`;
    if (r === n) return `2 × ${n - 1}! = ${2 * fact(n - 1)}`;
    return "묶기 공식은 r = n일 때만";
  }

  function update() {
    if (+sr.value > +sn.value) sr.value = sn.value;
    sr.max = sn.value;
    const n = +sn.value, r = +sr.value, leaves = levels(n, r)[r];
    if (sel !== null && sel >= leaves.length) sel = null;
    $(".n-out").textContent = n; $(".r-out").textContent = r;
    $(".d-all").innerHTML = `전체 <sub>${n}</sub>P<sub>${r}</sub>`;
    $(".n-all").textContent = leaves.length;
    const ok = leaves.filter(OK[cond]).length;
    $(".n-ok").textContent = ok; $(".n-f").textContent = formula(n, r);
    $(".msg").textContent = sel === null ? "가지 끝을 눌러 보세요." : `고른 나열: ${leaves[sel].split("").join(" ")} — ${OK[cond](leaves[sel]) ? "조건에 맞습니다." : "조건에 맞지 않습니다."}`;
    draw();
  }
  $("canvas").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left;
    let best = 0; leafX.forEach((lx, q) => { if (Math.abs(lx - x) < Math.abs(leafX[best] - x)) best = q; });
    if (leafX.length) { sel = best; update(); }
  });
  condBtns.forEach((b) => b.addEventListener("click", () => { cond = b.dataset.c; condBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [sn, sr].forEach((s) => s.addEventListener("input", () => { sel = null; update(); }));
  update();
})();
