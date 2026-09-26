/* 카드: 형질 표로 계통수 그려 보기 — 공유 파생 형질로 무리를 묶는다 */
(() => {
  const root = document.getElementById("card-bio-tree-build");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const chipsEl = $(".traits");
  const nAdd = $(".n-add"), nNode = $(".n-node"), nState = $(".n-state"), msg = $(".tb-msg");

  const TAXA = ["창고기", "칠성장어", "상어", "고등어", "개구리", "도마뱀", "사람"];
  // 각 형질을 가진 생물의 번호. trap: 무리를 나누는 데 쓸 수 없는 형질
  const TRAITS = [
    { id: "v", name: "척추", has: [1, 2, 3, 4, 5, 6] },
    { id: "j", name: "턱", has: [2, 3, 4, 5, 6] },
    { id: "b", name: "단단한 뼈(경골)", has: [3, 4, 5, 6] },
    { id: "l", name: "네 다리", has: [4, 5, 6] },
    { id: "a", name: "양막으로 싸인 알", has: [5, 6] },
    { id: "m", name: "털과 젖", has: [6] },
    { id: "w", name: "평생 물속에서 산다", has: [0, 1, 2, 3], trap: "외군인 창고기도 가진 오래된 형질입니다. 조상에게서 그대로 물려받은 형질은 누가 더 가까운지 알려 주지 못합니다." },
    { id: "s", name: "비늘", has: [2, 3, 5], trap: "상어·고등어의 비늘과 도마뱀의 비늘은 따로 생긴 구조입니다. 이름이 같다고 같은 기원의 형질은 아닙니다." },
  ];
  const on = new Set();

  const sub = (a, b) => a.every((x) => b.includes(x));
  const clash = (a, b) => a.some((x) => b.includes(x)) && !sub(a, b) && !sub(b, a);
  function status() {
    const act = TRAITS.filter((t) => on.has(t.id));
    const badL = act.filter((t) => t.trap && (t.has.includes(0) || act.some((b) => b !== t && clash(t.has, b.has))));
    const bad = new Set(badL.map((t) => t.id));
    return { act, bad, ok: act.filter((t) => !bad.has(t.id)) };
  }

  const { ctx, size } = fit(cv, () => draw());
  let rowHits = [];

  function build(sets) {
    // 포함 관계로 나무를 만든다. 반환: {taxa, kids, trait}
    const all = { has: TAXA.map((_, i) => i), kids: [], trait: null };
    const sorted = [...sets].sort((a, b) => b.has.length - a.has.length);
    const nodes = [all];
    for (const t of sorted) {
      const nd = { has: t.has, kids: [], trait: t };
      const par = nodes.filter((n) => sub(t.has, n.has)).sort((a, b) => a.has.length - b.has.length)[0];
      par.kids.push(nd); nodes.push(nd);
    }
    return all;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const { bad, ok } = status();
    // ── 위: 형질 표
    const labW = Math.min(150, w * .3), cw = (w - labW - 4) / TAXA.length, headH = 22;
    const rows = TRAITS.length, rh = Math.min(24, (h * .5 - headH) / rows);
    ctx.font = `600 ${w < 520 ? 10.5 : 12}px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink;
    TAXA.forEach((t, i) => ctx.fillText(t, labW + cw * (i + .5), 15));
    rowHits = [];
    TRAITS.forEach((t, r) => {
      const y = headH + r * rh, act = on.has(t.id), isBad = act && bad.has(t.id) && t.trap;
      ctx.fillStyle = isBad ? "#f7e4dc" : act ? "#e3efdd" : r % 2 ? C.card : "#f4f4ee";
      ctx.fillRect(0, y, w, rh);
      ctx.font = `${act ? 600 : 400} ${w < 520 ? 11 : 12.5}px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillStyle = isBad ? C.warn : act ? C.forest : C.ink2;
      ctx.fillText(t.name, 6, y + rh * .68);
      t.has.forEach((i) => {
        ctx.fillStyle = isBad ? C.warn : act ? C.forest : C.ink3;
        ctx.beginPath(); ctx.arc(labW + cw * (i + .5), y + rh / 2, Math.min(5, rh * .25), 0, Math.PI * 2); ctx.fill();
      });
      rowHits.push({ id: t.id, y0: y, y1: y + rh });
    });
    ctx.strokeStyle = C.rule; ctx.strokeRect(.5, headH + .5, w - 1, rows * rh);

    // ── 아래: 계통수 (뿌리가 위, 생물이 아래)
    const top = headH + rows * rh + 22, bot = h - 20;
    const tree = build(ok);
    const order = [];
    (function dfs(n) {
      const inKids = new Set(n.kids.flatMap((k) => k.has));
      n.has.filter((i) => !inKids.has(i)).forEach((i) => order.push(i));
      n.kids.forEach(dfs);
    })(tree);
    const tx = (i) => labW * .15 + (order.indexOf(i) + .5) * (w - labW * .3) / TAXA.length;
    let maxD = 0;
    (function dd(n, d) { n.d = d; maxD = Math.max(maxD, d); n.kids.forEach((k) => dd(k, d + 1)); })(tree, 0);
    const Y = (d) => top + d / (maxD + 1) * (bot - top - 14);
    const tipY = bot - 14;
    const nx = (n) => { const xs = n.has.map(tx); return (Math.min(...xs) + Math.max(...xs)) / 2; };
    ctx.lineWidth = 1.6; ctx.strokeStyle = C.ink;
    (function drawN(n) {
      const x = nx(n), y = Y(n.d);
      const inKids = new Set(n.kids.flatMap((k) => k.has));
      const ends = [...n.has.filter((i) => !inKids.has(i)).map((i) => [tx(i), tipY]), ...n.kids.map((k) => [nx(k), Y(k.d)])];
      const xs = ends.map((e) => e[0]);
      ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(Math.min(...xs), y); ctx.lineTo(Math.max(...xs), y); ctx.stroke();
      for (const [ex, ey] of ends) { ctx.beginPath(); ctx.moveTo(ex, y); ctx.lineTo(ex, ey); ctx.stroke(); }
      for (const k of n.kids) {
        const kx = nx(k), my = (y + Y(k.d)) / 2;
        ctx.fillStyle = C.forest; ctx.fillRect(kx - 6, my - 1.5, 12, 3);
        ctx.font = `${w < 520 ? 10 : 11}px ${F.sans}`; ctx.textAlign = "left";
        ctx.fillText(k.trait.name, kx + 9, my + 4);
        drawN(k);
      }
    })(tree);
    ctx.fillStyle = C.ink; ctx.font = `500 ${w < 520 ? 10.5 : 12.5}px ${F.sans}`; ctx.textAlign = "center";
    TAXA.forEach((t, i) => ctx.fillText(t, tx(i), bot));
    ctx.textAlign = "left";
  }

  function chips() {
    chipsEl.innerHTML = "";
    for (const t of TRAITS) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.textContent = t.name;
      b.setAttribute("aria-pressed", on.has(t.id) ? "true" : "false");
      b.addEventListener("click", () => toggle(t.id));
      chipsEl.appendChild(b);
    }
  }
  function toggle(id) { on.has(id) ? on.delete(id) : on.add(id); update(); }

  function update() {
    const { act, bad, ok } = status();
    chips();
    nAdd.textContent = `${act.length}개`;
    nNode.textContent = `${ok.length + 1}개`;
    const trapOn = act.find((t) => bad.has(t.id));
    nState.textContent = trapOn ? "어긋남" : act.length ? "모순 없음" : "—";
    nState.classList.toggle("bad", !!trapOn);
    msg.textContent = trapOn ? `‘${trapOn.name}’: ${trapOn.trap} 그래서 이 형질은 계통수에서 뺐습니다.`
      : ok.length === 6 && act.length === 6 ? "여섯 형질이 모두 겹치지 않고 안쪽으로 포개집니다. 넣은 순서를 바꿔도 같은 나무가 나오는지 확인해 보세요."
      : "형질을 눌러 하나씩 넣어 보세요. 같은 형질을 가진 생물들이 한 가지로 묶입니다.";
    draw();
  }
  cv.addEventListener("click", (e) => {
    const r = cv.getBoundingClientRect(), y = e.clientY - r.top;
    const hit = rowHits.find((q) => y >= q.y0 && y <= q.y1);
    if (hit) toggle(hit.id);
  });
  $(".tb-reset").addEventListener("click", () => { on.clear(); update(); });
  update();
})();
