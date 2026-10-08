/* 카드: 한 집합이 다른 집합 안에 들어 있는지 어떻게 판단할까? — a의 약수, b의 약수의 집합을 벤 다이어그램에 놓고 포함관계를 판정 */
(() => {
  const root = document.getElementById("card-cm2-subset-venn");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSets;
  const $ = (s) => root.querySelector(s);
  const sa = $(".a"), sb = $(".b");
  const divs = (n) => { const o = []; for (let k = 1; k <= n; k++) if (n % k === 0) o.push(k); return o; };
  const { ctx, size } = fit($("canvas"), () => draw());

  function state() {
    const A = divs(+sa.value), B = divs(+sb.value);
    const ab = A.every((x) => B.includes(x)), ba = B.every((x) => A.includes(x));
    return { A, B, ab, ba };
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { A, B, ab, ba } = state();
    const cx = w / 2, cy = h / 2 + 6, R = Math.min(h * 0.42, w * 0.3);
    let cA, cB, ang;
    if (ab && ba) { cA = { x: cx, y: cy, r: R }; cB = { x: cx, y: cy, r: R }; ang = [135, 135]; }
    else if (ab) { cB = { x: cx, y: cy, r: R }; cA = { x: cx - R * 0.32, y: cy + R * 0.05, r: R * 0.56 }; ang = [140, 45]; }
    else if (ba) { cA = { x: cx, y: cy, r: R }; cB = { x: cx + R * 0.32, y: cy + R * 0.05, r: R * 0.56 }; ang = [135, 40]; }
    else { cA = { x: cx - R * 0.62, y: cy, r: R * 0.86 }; cB = { x: cx + R * 0.62, y: cy, r: R * 0.86 }; ang = [130, 50]; }
    const cs = [cA, cB], rect = { x: 4, y: 20, w: w - 8, h: h - 24 };
    S.shade(ctx, cs, rect, 3, C.sprout, 0.75);
    S.shade(ctx, cs, rect, 1, C.warn, 0.18);
    S.shade(ctx, cs, rect, 2, C.amber, 0.16);
    S.outline(ctx, cs, ab && ba ? ["A = B", ""] : ["A", "B"], ang, [C.forest, C.amber]);
    const g = { 1: [], 2: [], 3: [] };
    new Set([...A, ...B]).forEach((x) => g[(A.includes(x) ? 1 : 0) | (B.includes(x) ? 2 : 0)].push(x));
    const pts = S.place(cs, rect, [[3, g[3]], [1, g[1]], [2, g[2]]], 26, 10);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    pts.forEach((p) => {
      ctx.font = `${p.mask === 2 ? 400 : 700} 13px ${F.mono}`;
      ctx.fillStyle = p.mask === 1 ? C.warn : p.mask === 3 ? C.forest : C.ink2;
      ctx.fillText(String(p.label), p.x, p.y);
    });
    ctx.font = `12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
    ctx.fillText(ab && ba ? "두 원이 겹쳐 하나가 됩니다" : ab ? "A가 B 안에 통째로 들어갑니다" : ba ? "B가 A 안에 통째로 들어갑니다" : "서로 빠져나온 원소가 있습니다", 8, 11);
  }
  function update() {
    $(".a-out").textContent = sa.value; $(".b-out").textContent = sb.value;
    const { A, B, ab, ba } = state(), only = A.filter((x) => !B.includes(x));
    $(".eq").innerHTML = `A = ${S.fmt(A)}<br>B = ${S.fmt(B)}<br>A에만 있는 원소: ${only.length ? S.fmt(only) : "없음"}`;
    const set = (sel, ok, yes, no) => { const d = $(sel); d.textContent = ok ? yes : no; d.className = `${sel.slice(1)} ${ok ? "good" : "bad"}`; };
    set(".n-ab", ab, ab && !ba ? "예 (진부분집합)" : "예", "아니요 (A ⊄ B)");
    set(".n-ba", ba, ba && !ab ? "예 (진부분집합)" : "예", "아니요 (B ⊄ A)");
    set(".n-eq", ab && ba, "예", "아니요");
    draw();
  }
  [sa, sb].forEach((s) => s.addEventListener("input", update));
  update();
})();
