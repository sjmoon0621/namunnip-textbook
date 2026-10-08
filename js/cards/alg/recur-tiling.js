/* 카드: 2×n 판을 덮는 방법은 몇 가지일까? — 맨 왼쪽이 세로 하나(aₙ₋₁가지) 또는 가로 둘(aₙ₋₂가지) */
(() => {
  const root = document.getElementById("card-alg-recur-tiling");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSeq;
  const $ = (s) => root.querySelector(s), sn = $(".n");
  /* 덮는 방법을 조각 문자열로: V(세로 하나, 폭 1), H(가로 둘, 폭 2) */
  const tilings = (n) => n === 0 ? [""] : n < 0 ? [] : [...tilings(n - 1).map((t) => "V" + t), ...tilings(n - 2).map((t) => "H" + t)];
  const { ctx, size } = fit($("canvas"), () => draw());

  function thumb(t, x, y, u, first) {
    let c = 0;
    [...t].forEach((p, i) => {
      const lead = i === 0, col = lead ? (first === "V" ? C.leaf : C.warn) : C.rule, fill = lead ? (first === "V" ? "rgba(116,171,102,.5)" : "rgba(181,83,47,.4)") : C.card;
      ctx.lineWidth = 1.2; ctx.strokeStyle = lead ? col : C.ink2; ctx.fillStyle = fill;
      if (p === "V") { ctx.fillRect(x + c * u + 1, y + 1, u - 2, 2 * u - 2); ctx.strokeRect(x + c * u + 1.5, y + 1.5, u - 3, 2 * u - 3); c += 1; }
      else for (const r of [0, 1]) { ctx.fillRect(x + c * u + 1, y + r * u + 1, 2 * u - 2, u - 2); ctx.strokeRect(x + c * u + 1.5, y + r * u + 1.5, 2 * u - 3, u - 3); }
      if (p === "H") c += 2;
    });
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, all = tilings(n), gA = all.filter((t) => t[0] === "V"), gB = all.filter((t) => t[0] === "H");
    const u = Math.max(7, Math.min(16, (w - 24) / (3.6 * n + 3))), tw = n * u, gap = Math.max(8, u * 0.9);
    const per = Math.max(1, Math.floor((w - 16 + gap) / (tw + gap)));
    let y = 8;
    const group = (g, label, col, first) => {
      S.tag(ctx, label, 10, y + 9, col, "left", 11.5); y += 22;
      g.forEach((t, i) => { const r = Math.floor(i / per), c = i % per; thumb(t, 10 + c * (tw + gap), y + r * (2 * u + gap), u, first); });
      y += Math.ceil(g.length / per) * (2 * u + gap) + 6;
    };
    group(gA, `세로로 시작: ${gA.length}가지 = a_${n - 1 || 0}`.replace("= a_0", "(n = 1)"), C.forest, "V");
    if (n >= 2) group(gB, `가로 둘로 시작: ${gB.length}가지${n >= 3 ? ` = a_${n - 2}` : " (남는 판 없음)"}`, C.warn, "H");
  }

  function update() {
    const n = +sn.value, a = (k) => tilings(k).length;
    $(".n-out").textContent = n;
    $(".d-1").innerHTML = n >= 2 ? `세로로 시작 = <i>a</i><sub>${n - 1}</sub>` : "세로로 시작";
    $(".d-2").innerHTML = n >= 3 ? `가로로 시작 = <i>a</i><sub>${n - 2}</sub>` : "가로로 시작";
    $(".d-n").innerHTML = `전체 <i>a</i><sub>${n}</sub>`;
    $(".v-1").textContent = a(n - 1); $(".v-2").textContent = a(n - 2); $(".v-n").textContent = a(n);
    draw();
  }
  sn.addEventListener("input", update);
  update();
})();
