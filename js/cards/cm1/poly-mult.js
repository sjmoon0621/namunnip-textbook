/* 카드: 다항식을 곱하면 왜 같은 차수끼리 모일까? — 덧셈표·곱셈표와 동류항 모으기 */
(() => {
  const root = document.getElementById("card-cm1-poly-mult");
  if (!root) return;
  const { C, F, fit } = NM;
  const P = NMPoly;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const sa = [$(".a0"), $(".a1"), $(".a2")], sb = [$(".b0"), $(".b1"), $(".b2")], st = $(".t");
  const modeBtns = $$(".mode .chip"), exBtns = $$(".ex .chip");
  const DC = [C.ink3, C.leaf, C.amber, C.apple, C.forest];
  let mode = "mul";
  const { ctx, size } = fit($("canvas"), () => draw());
  const A = () => sa.map((s) => +s.value), B = () => sb.map((s) => +s.value);
  const terms = (p) => { const t = []; for (let k = p.length - 1; k >= 0; k--) if (p[k]) t.push([p[k], k]); return t; };
  const result = () => (mode === "add" ? P.add(A(), B()) : mode === "sub" ? P.sub(A(), B()) : P.mul(A(), B()));

  function box(x, y, w, h, d, text, o = {}) {
    ctx.save();
    ctx.globalAlpha = o.faded ? 0.12 : 0.24; ctx.fillStyle = d == null ? C.rule : DC[d]; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.globalAlpha = o.faded ? 0.4 : 1; ctx.strokeStyle = d == null ? C.rule : DC[d]; ctx.lineWidth = o.bold ? 2 : 1; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    ctx.fillStyle = C.ink; ctx.font = `${o.bold ? 600 : 400} ${o.fs || 13}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2 + 1);
    ctx.restore();
  }
  function head(text, x, y, align = "center", col = C.ink2) {
    ctx.fillStyle = col; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillText(text, x, y);
  }

  function drawMul(w, h) {
    const ta = terms(A()), tb = terms(B()), fs = w < 380 ? 11.5 : 13;
    head("A의 항 × B의 항 (분배법칙)", 8, 12, "left");
    if (!ta.length || !tb.length) { head("한쪽이 0이면 곱도 0입니다", w / 2, h / 2); return; }
    const hw = Math.min(70, w * 0.18), hh = 28, top = 28;
    const cw = (w - hw - 12) / tb.length, ch = Math.min(56, (h * 0.5 - hh) / ta.length);
    tb.forEach(([c, k], j) => box(hw + 4 + j * cw, top, cw, hh, k, P.term(c, k), { fs }));
    ta.forEach(([c, k], i) => box(4, top + hh + i * ch, hw, ch, k, P.term(c, k), { fs }));
    const groups = {};
    ta.forEach(([ca, ka], i) => tb.forEach(([cb, kb], j) => {
      const d = ka + kb, c = ca * cb;
      box(hw + 4 + j * cw, top + hh + i * ch, cw, ch, d, P.term(c, d), { fs });
      (groups[d] = groups[d] || []).push(c);
    }));
    const y0 = top + hh + ta.length * ch + 26;
    head("같은 색(같은 차수)끼리 계수를 모으면", 8, y0 - 12, "left");
    const ds = Object.keys(groups).map(Number).sort((a, b) => b - a), bw = (w - 8) / ds.length, bh = 34;
    ds.forEach((d, i) => {
      const s = groups[d].reduce((a, b) => a + b, 0), x = 4 + i * bw;
      box(x, y0, bw, bh, d, s ? P.term(s, d) : "0", { bold: true, faded: !s, fs: fs + 1 });
      ctx.fillStyle = C.ink2; ctx.font = `${fs - 1.5}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      groups[d].forEach((c, r) => ctx.fillText(`(${P.term(c, d)})`, x + bw / 2, y0 + bh + 5 + r * (fs + 2)));
      if (!s) { ctx.fillStyle = C.warn; ctx.fillText("지워짐", x + bw / 2, y0 + bh + 5 + groups[d].length * (fs + 2)); }
    });
  }

  function drawAdd(w, h) {
    const a = A(), b = mode === "sub" ? P.scale(B(), -1) : B(), r = result(), fs = w < 380 ? 12 : 14;
    head(mode === "sub" ? "A − B = A + (−B): B의 부호를 모두 바꾸어 더합니다" : "차수 칸을 맞추어 계수끼리 더합니다", 8, 12, "left");
    const lw = Math.min(78, w * 0.2), cw = (w - lw - 12) / 3, rh = Math.min(64, (h - 80) / 3), top = 60;
    ["x²", "x", "상수"].forEach((s, j) => head(s, lw + 4 + (j + 0.5) * cw, top - 14));
    [[a, "A"], [b, mode === "sub" ? "−B" : "B"], [r, mode === "sub" ? "A − B" : "A + B"]].forEach(([p, name], i) => {
      const y = top + i * rh + (i === 2 ? 14 : 0);
      head(name, lw - 6, y + rh / 2, "right", i === 2 ? C.ink : C.ink2);
      for (let j = 0; j < 3; j++) { const k = 2 - j, c = p[k] || 0; box(lw + 4 + j * cw, y, cw, rh, k, c ? P.term(c, k) : "0", { faded: !c, bold: i === 2, fs }); }
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); const yl = top + 2 * rh + 7; ctx.moveTo(lw + 4, yl); ctx.lineTo(w - 8, yl); ctx.stroke();
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === "mul") drawMul(w, h); else drawAdd(w, h);
  }

  function update() {
    ["a0", "a1", "a2", "b0", "b1", "b2", "t"].forEach((n) => { $(`.${n}-out`).textContent = $(`.${n}`).value; });
    const sym = { add: "A + B", sub: "A − B", mul: "A × B" }[mode], t = +st.value;
    $(".res").innerHTML = `A = ${P.fmt(A(), true)}<br>B = ${P.fmt(B(), true)}<br><b>${sym} = ${P.fmt(result(), true)}</b>`;
    const va = P.at(A(), t), vb = P.at(B(), t), vr = P.at(result(), t);
    $(".d1").textContent = `A(${t})`; $(".d2").textContent = `B(${t})`; $(".d3").textContent = `결과식에 ${t} 대입`;
    $(".n-a").textContent = P.n(va); $(".n-b").textContent = P.n(vb);
    const direct = mode === "add" ? va + vb : mode === "sub" ? va - vb : va * vb;
    $(".n-r").textContent = `${P.n(vr)} ${Math.abs(direct - vr) < 1e-9 ? "(같음)" : ""}`;
    draw();
  }
  modeBtns.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; modeBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  exBtns.forEach((b) => b.addEventListener("click", () => {
    const [pa, pb] = b.dataset.set.split(";").map((s) => s.split(",").map(Number));
    sa.forEach((s, i) => { s.value = pa[i]; }); sb.forEach((s, i) => { s.value = pb[i]; });
    mode = "mul"; modeBtns.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.mode === "mul"))); update();
  }));
  [...sa, ...sb, st].forEach((s) => s.addEventListener("input", update));
  update();
})();
