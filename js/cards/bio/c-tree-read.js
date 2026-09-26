/* 카드: 계통수는 어떻게 읽을까? — 가지 돌리기와 가장 가까운 공통 조상 찾기 */
(() => {
  const root = document.getElementById("card-bio-tree-read");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const nPair = $(".n-pair"), nAnc = $(".n-anc"), nOut = $(".n-out"), msg = $(".tr-msg");

  // 계통 관계(분기 순서)만 나타낸 나무. 가지 길이는 시간과 무관
  const tip = (name) => ({ name });
  const node = (label, a, b) => ({ label, kids: [a, b] });
  const TREE = node("턱이 있는 척추동물",
    node("경골어류 무리 (네발 동물 포함)",
      node("네발 동물",
        node("양막류",
          node("포유류",
            node("사람아과", node("", tip("사람"), tip("침팬지")), tip("고릴라")),
            tip("생쥐")),
          node("파충류 (조류 포함)", tip("도마뱀"), tip("닭"))),
        tip("개구리")),
      tip("고등어")),
    tip("상어"));
  // 이름 없는 마디의 표시용 이름
  const nameOf = (n) => n.label || "사람과 침팬지만의 공통 조상";

  const tips = [], nodes = [];
  (function walk(n, d, par) {
    n.depth = d; n.par = par;
    if (n.kids) { nodes.push(n); n.kids.forEach((k) => walk(k, d + 1, n)); } else { tips.push(n); n.y = n.ty = 0; }
  })(TREE, 0, null);
  const maxD = Math.max(...tips.map((t) => t.depth));
  let sel = [];

  function order() {
    let i = 0;
    (function walk(n) { if (n.kids) n.kids.forEach(walk); else n.ty = i++; })(TREE);
  }
  order(); tips.forEach((t) => { t.y = t.ty; });

  const anc = (t) => { const a = []; let n = t.par; while (n) { a.push(n); n = n.par; } return a; };
  const mrca = (a, b) => { const A = anc(a); return anc(b).find((n) => A.includes(n)); };
  const under = (n) => n.kids ? n.kids.flatMap(under) : [n];

  const { ctx, size } = fit(cv, () => draw());
  let hits = [];

  function nodeY(n) { return n.kids ? (nodeY(n.kids[0]) + nodeY(n.kids[1])) / 2 : n.y; }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const small = w < 520;
    const x0 = 14, lab = small ? 58 : 76, x1 = w - lab - 8, top = 18, bot = h - 14;
    const X = (d) => x0 + d / maxD * (x1 - x0);
    const Y = (v) => top + v / (tips.length - 1) * (bot - top);
    const M = sel.length === 2 ? mrca(sel[0], sel[1]) : null;
    const hot = new Set();
    if (M) sel.forEach((t) => { let n = t; while (n && n !== M) { hot.add(n); n = n.par; } });
    hits = [];
    (function drawN(n) {
      if (!n.kids) return;
      const xn = X(n.depth), yn = Y(nodeY(n));
      for (const k of n.kids) {
        const xk = k.kids ? X(k.depth) : x1, yk = Y(nodeY(k));
        const on = hot.has(k);
        ctx.strokeStyle = on ? C.warn : C.ink; ctx.lineWidth = on ? 2.6 : 1.5;
        ctx.beginPath(); ctx.moveTo(xn, yn); ctx.lineTo(xn, yk); ctx.lineTo(xk, yk); ctx.stroke();
        drawN(k);
      }
      const isM = n === M;
      ctx.beginPath(); ctx.arc(xn, yn, isM ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isM ? C.warn : C.card; ctx.fill();
      ctx.strokeStyle = isM ? C.warn : C.ink2; ctx.lineWidth = 1.5; ctx.stroke();
      hits.push({ n, x: xn, y: yn, r: 14 });
    })(TREE);
    for (const t of tips) {
      const y = Y(t.y), on = sel.includes(t);
      ctx.font = `${on ? 700 : 500} ${small ? 12 : 14}px ${F.sans}`; ctx.fillStyle = on ? C.warn : C.ink; ctx.textAlign = "left";
      ctx.fillText(t.name, x1 + 6, y + 5);
      hits.push({ t, x0: x1, x1: w, y0: y - 12, y1: y + 12 });
    }
    if (M) {
      const xm = X(M.depth), ym = Y(nodeY(M));
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.warn; ctx.textAlign = "left";
      ctx.fillText("가장 가까운 공통 조상", xm + 9, ym - 9);
    }
  }

  function update() {
    if (sel.length === 2) {
      const M = mrca(sel[0], sel[1]);
      nPair.textContent = `${sel[0].name} · ${sel[1].name}`;
      nAnc.textContent = nameOf(M);
      const inside = under(M).map((t) => t.name).filter((x) => !sel.some((s) => s.name === x));
      nOut.textContent = inside.length ? inside.join(", ") : "없음";
      const wa = (x) => (x.charCodeAt(x.length - 1) - 0xAC00) % 28 ? "과" : "와";
      msg.textContent = `${sel[0].name}${wa(sel[0].name)} ${sel[1].name}의 관계는 가지가 어떻게 돌아가 있든 이 공통 조상으로 정해집니다.`;
    } else {
      nPair.textContent = sel.length ? `${sel[0].name} · ?` : "—";
      nAnc.textContent = "—"; nOut.textContent = "—";
      msg.textContent = "오른쪽 이름 두 개를 눌러 보세요. 동그라미(분기점)를 누르면 그 가지가 돌아갑니다.";
    }
    draw();
  }

  function rotate(n) {
    n.kids.reverse(); order();
  }
  // 가지가 돌아갈 때 이름이 미끄러지듯 움직이게
  loop(cv, (dt) => {
    let moving = false;
    for (const t of tips) { const d = t.ty - t.y; if (Math.abs(d) > .002) { t.y += d * Math.min(1, dt * 10); moving = true; } else t.y = t.ty; }
    if (moving) draw();
  });

  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const hn = hits.find((q) => q.n && Math.hypot(q.x - x, q.y - y) < q.r);
    if (hn) { rotate(hn.n); if (NM.reduce) tips.forEach((t) => { t.y = t.ty; }); update(); return; }
    const ht = hits.find((q) => q.t && x >= q.x0 && x <= q.x1 && y >= q.y0 && y <= q.y1);
    if (ht) {
      if (sel.includes(ht.t)) sel = sel.filter((s) => s !== ht.t);
      else { sel.push(ht.t); if (sel.length > 2) sel.shift(); }
      update();
    }
  });
  $(".shuffle").addEventListener("click", () => {
    nodes.forEach((n) => { if (Math.random() < .5) n.kids.reverse(); }); order();
    if (NM.reduce) tips.forEach((t) => { t.y = t.ty; });
    update();
  });
  root.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => {
    sel = b.dataset.pick.split(",").map((nm) => tips.find((t) => t.name === nm)); update();
  }));
  update();
})();
