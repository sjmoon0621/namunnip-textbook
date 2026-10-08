/* 카드: 두 집합으로 새 집합을 만드는 방법은 몇 가지일까? — U = {1..12}에서 합·교·여·차집합 영역을 칠하고 원소와 개수를 비교 */
(() => {
  const root = document.getElementById("card-cm2-set-ops");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSets;
  const $ = (s) => root.querySelector(s);
  const sb = [...root.querySelectorAll(".sets .chip")], ob = [...root.querySelectorAll(".ops .chip")];
  const isPrime = (k) => { if (k < 2) return false; for (let d = 2; d * d <= k; d++) if (k % d === 0) return false; return true; };
  const DEF = { m2: (k) => k % 2 === 0, m3: (k) => k % 3 === 0, m4: (k) => k % 4 === 0, d12: (k) => 12 % k === 0, pr: isPrime, odd: (k) => k % 2 === 1 };
  /* 영역 번호 m: 1비트 = A, 2비트 = B */
  const OPS = {
    uni: { t: "A ∪ B", f: (m) => m !== 0 }, int: { t: "A ∩ B", f: (m) => m === 3 }, ac: { t: "Aᶜ", f: (m) => !(m & 1) },
    amb: { t: "A − B", f: (m) => m === 1 }, bma: { t: "B − A", f: (m) => m === 2 }, anbc: { t: "A ∩ Bᶜ", f: (m) => m === 1 },
    uc: { t: "(A ∪ B)ᶜ", f: (m) => m === 0 }, acbc: { t: "Aᶜ ∩ Bᶜ", f: (m) => m === 0 },
  };
  let pa = "m2", pb = "m3", op = "uni";
  const U = Array.from({ length: 12 }, (_, i) => i + 1);
  const mask = (k) => (DEF[pa](k) ? 1 : 0) | (DEF[pb](k) ? 2 : 0);
  const { ctx, size } = fit($("canvas"), () => draw());

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const rect = { x: 6, y: 22, w: w - 12, h: h - 28 }, r = Math.min(rect.h * 0.4, rect.w * 0.23);
    const cs = [{ x: w / 2 - r * 0.62, y: rect.y + rect.h / 2, r }, { x: w / 2 + r * 0.62, y: rect.y + rect.h / 2, r }];
    S.shadeWhere(ctx, cs, rect, OPS[op].f, C.sprout, 0.9);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.strokeRect(rect.x + .5, rect.y + .5, rect.w - 1, rect.h - 1);
    S.outline(ctx, cs, ["A", "B"], [125, 55]);
    ctx.font = `600 13px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("U", rect.x + 8, rect.y + 13);
    ctx.textAlign = "right"; ctx.fillStyle = C.forest; ctx.fillText(`칠한 영역: ${OPS[op].t}`, w - 8, 11);
    const g = [[], [], [], []]; U.forEach((k) => g[mask(k)].push(k));
    const pts = S.place(cs, { x: rect.x + 18, y: rect.y + 8, w: rect.w - 26, h: rect.h - 14 }, [[3, g[3]], [1, g[1]], [2, g[2]], [0, g[0]]], 26, 8);
    ctx.textAlign = "center";
    pts.forEach((p) => {
      const on = OPS[op].f(p.mask);
      ctx.font = `${on ? 700 : 400} 13px ${F.mono}`; ctx.fillStyle = on ? C.forest : C.ink3; ctx.fillText(String(p.label), p.x, p.y);
    });
  }
  function update() {
    const res = U.filter((k) => OPS[op].f(mask(k)));
    const A = U.filter((k) => mask(k) & 1), B = U.filter((k) => mask(k) & 2), I = U.filter((k) => mask(k) === 3), Un = U.filter((k) => mask(k));
    const name = ob.find((b) => b.dataset.o === op).innerHTML;
    $(".eq").innerHTML = `A = ${S.fmt(A)}, B = ${S.fmt(B)}<br>${name} = ${S.fmt(res)}, 원소 ${res.length}개`;
    $(".n-ab").textContent = `${A.length}, ${B.length}`; $(".n-i").textContent = String(I.length); $(".n-u").textContent = String(Un.length);
    $(".form").innerHTML = `n(A) + n(B) − n(A ∩ B) = ${A.length} + ${B.length} − ${I.length} = ${A.length + B.length - I.length} = n(A ∪ B)` +
      (I.length ? "" : "<br>A ∩ B = ∅이므로 A와 B는 서로소입니다.");
    draw();
  }
  sb.forEach((b) => b.addEventListener("click", () => { [pa, pb] = b.dataset.p.split(","); sb.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  ob.forEach((b) => b.addEventListener("click", () => { op = b.dataset.o; ob.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  update();
})();
