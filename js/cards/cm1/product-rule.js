/* 카드: 언제 더하고 언제 곱할까? — 세 단계 수형도(곱의 법칙)와 묶음 중 하나 고르기(합의 법칙) 비교 */
(() => {
  const root = document.getElementById("card-cm1-product-rule");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s), modeBtns = [...root.querySelectorAll(".mode .chip")];
  const sm = $(".m"), sn = $(".n"), sk = $(".k");
  const GC = [C.forest, C.amber, C.apple];
  let mode = "mul", sel = null;
  const { ctx, size } = fit($("canvas"), () => draw());

  /* levels[d] = [{lo, hi, p(부모 번호), i(그 부모 안에서 몇 번째), g(묶음)}], 잎 번호 구간 [lo, hi) */
  function tree() {
    const m = +sm.value, n = +sn.value, k = +sk.value;
    if (mode === "mul") {
      const cs = [m, n, k], total = m * n * k, levels = [[{ lo: 0, hi: total }]];
      let cnt = 1;
      for (let d = 0; d < 3; d++) {
        cnt *= cs[d]; const span = total / cnt, L = [];
        for (let q = 0; q < cnt; q++) L.push({ lo: q * span, hi: (q + 1) * span, p: Math.floor(q / cs[d]), i: q % cs[d] });
        levels.push(L);
      }
      return { levels, total, cs };
    }
    const cs = [m, n, k], total = m + n + k, levels = [[{ lo: 0, hi: total }]], G = [], Lf = [];
    let s = 0;
    cs.forEach((c, g) => { G.push({ lo: s, hi: s + c, p: 0, i: g, g }); for (let j = 0; j < c; j++) Lf.push({ lo: s + j, hi: s + j + 1, p: g, i: j, g }); s += c; });
    levels.push(G, Lf);
    return { levels, total, cs };
  }

  let lay = null;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const T = tree(), D = T.levels.length - 1, top = 34, bot = h - 8, lh = (bot - top) / T.total;
    const xl = 26, xr = w - 22, X = (d) => xl + (xr - xl) * d / D, Yc = (nd) => top + (nd.lo + nd.hi) / 2 * lh;
    lay = { top, lh, total: T.total };
    const onPath = (nd) => sel !== null && sel >= nd.lo && sel < nd.hi;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `${w < 400 ? 10.5 : 11.5}px ${F.sans}`; ctx.fillStyle = C.ink2;
    const heads = mode === "mul" ? ["출발", `1단계 ${T.cs[0]}가지`, `2단계 ${T.cs[1]}가지`, `3단계 ${T.cs[2]}가지`] : ["출발", "묶음 고르기", "그 안에서 하나"];
    heads.forEach((t, d) => { ctx.textAlign = d === 0 ? "left" : d === D ? "right" : "center"; ctx.fillText(t, d === 0 ? 4 : d === D ? w - 4 : X(d), 12); });
    // 가지
    for (let d = 1; d <= D; d++) for (const nd of T.levels[d]) {
      const par = T.levels[d - 1][nd.p], hot = onPath(nd);
      ctx.strokeStyle = hot ? C.warn : mode === "add" ? GC[nd.g] : C.ink3;
      ctx.globalAlpha = hot || sel === null ? 1 : 0.55; ctx.lineWidth = hot ? 2.4 : 1.1;
      ctx.beginPath(); ctx.moveTo(X(d - 1), Yc(par)); ctx.lineTo(X(d), Yc(nd)); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // 마디
    for (let d = 0; d <= D; d++) for (const nd of T.levels[d]) {
      const hot = d === 0 || onPath(nd), r = d === D ? Math.max(2, Math.min(4.5, lh * 0.32)) : 4;
      ctx.fillStyle = hot && d > 0 ? C.warn : mode === "add" && d > 0 ? GC[nd.g] : C.ink;
      ctx.beginPath(); ctx.arc(X(d), Yc(nd), r, 0, 7); ctx.fill();
      const gap = (nd.hi - nd.lo) * lh;
      if (d > 0 && d < D && gap >= 14) { ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(nd.i + 1, X(d), Yc(nd) - 10); }
      if (d === D && lh >= 12) { ctx.fillStyle = hot ? C.warn : C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(nd.lo + 1, X(d) + 7, Yc(nd)); }
    }
  }

  function pathText() {
    if (sel === null) return "가지 끝을 눌러 보세요.";
    const T = tree(), D = T.levels.length - 1, ch = [];
    for (let d = 1; d <= D; d++) ch.push(T.levels[d].find((nd) => sel >= nd.lo && sel < nd.hi));
    if (mode === "mul") return `${sel + 1}번째 끝: 1단계 ${ch[0].i + 1}번 → 2단계 ${ch[1].i + 1}번 → 3단계 ${ch[2].i + 1}번. 세 단계를 모두 거쳐야 결과 하나가 됩니다.`;
    return `${sel + 1}번째 끝: ${ch[0].g + 1}번 묶음의 ${ch[1].i + 1}번째. 묶음 하나만 고르고 끝납니다.`;
  }

  function update() {
    const m = +sm.value, n = +sn.value, k = +sk.value, T = tree();
    $(".m-out").textContent = m; $(".n-out").textContent = n; $(".k-out").textContent = k;
    const lb = mode === "mul" ? ["1단계", "2단계", "3단계"] : ["1번 묶음", "2번 묶음", "3번 묶음"];
    $(".lb1").textContent = lb[0]; $(".lb2").textContent = lb[1]; $(".lb3").textContent = lb[2];
    if (sel !== null && sel >= T.total) sel = null;
    $(".n-leaf").textContent = T.total;
    $(".n-f").textContent = mode === "mul" ? `${m} × ${n} × ${k} = ${m * n * k}` : `${m} + ${n} + ${k} = ${m + n + k}`;
    $(".n-m").textContent = mode === "mul" ? "곱의 법칙" : "합의 법칙";
    $(".msg").textContent = pathText();
    draw();
  }
  $("canvas").addEventListener("click", (e) => {
    if (!lay) return;
    const r = e.currentTarget.getBoundingClientRect(), t = Math.floor((e.clientY - r.top - lay.top) / lay.lh);
    if (t >= 0 && t < lay.total) { sel = t; update(); }
  });
  modeBtns.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.m; sel = null; modeBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  [sm, sn, sk].forEach((s) => s.addEventListener("input", update));
  update();
})();
