/* 카드: 질문 몇 개로 처음 보는 생물의 문(門)을 알아낼 수 있을까? — 두 갈래 분류 검색표, 형질 카드로 직접 분류, 틀린 답이 이끄는 곳 */
(() => {
  const root = document.getElementById("card-bio-key");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const demo = /[?&]demo\b/.test(location.search);

  /* 질문: [번호, 짧은 이름, 전체 질문] */
  const Q = {
    p1: [1, "관다발", "관다발(물관·체관)이 있나요?"],
    p2: [2, "씨", "씨를 만들어 번식하나요?"],
    p3: [3, "씨방", "밑씨가 씨방 속에 들어 있나요?"],
    p4: [4, "떡잎 2장", "떡잎이 2장인가요?"],
    a1: [1, "조직", "세포들이 모여 진정한 조직을 이루나요?"],
    a2: [2, "3배엽", "발생할 때 배엽이 3개(삼배엽성)인가요?"],
    a3: [3, "후구", "발생할 때 원구가 항문이 되나요(후구동물)?"],
    a4: [4, "척삭", "척삭이 있나요?"],
    a5: [5, "탈피", "자라면서 탈피를 하나요?"],
    a6: [6, "외골격", "키틴질 외골격과 마디가 있는 다리가 있나요?"],
    a7: [7, "체절", "몸이 같은 마디(체절)가 되풀이되는 구조인가요?"],
    a8: [8, "외투막", "외투막이 내장을 감싸고 있나요?"],
  };
  const N = (q, no, yes) => ({ q, no, yes });
  const L = (leaf, ex) => ({ leaf, ex });
  const KEYS = {
    plant: N("p1", L("선태식물", "우산이끼"), N("p2", L("양치식물", "고사리"), N("p3", L("겉씨식물", "소나무·은행나무"), N("p4", L("외떡잎식물", "벼"), L("쌍떡잎식물", "장미"))))),
    animal: N("a1", L("해면동물", "해면"), N("a2", L("자포동물", "해파리"), N("a3",
      N("a5", N("a7", N("a8", L("편형동물", "플라나리아"), L("연체동물", "달팽이")), L("환형동물", "지렁이")), N("a6", L("선형동물", "회충"), L("절지동물", "거미"))),
      N("a4", L("극피동물", "불가사리"), L("척삭동물", "개구리"))))),
  };
  /* 형질 카드: [질문, 답, 문장]. 질문이 null이면 참고 형질 */
  const T = (q, a, s) => [q, a, s];
  const tis = T("a1", true, "여러 세포가 모여 조직과 기관을 이룬다");
  const tri = T("a2", true, "외배엽·중배엽·내배엽 세 층에서 몸이 만들어진다");
  const pro = T("a3", false, "원구가 입이 되는 선구동물이다");
  const vas = T("p1", true, "뿌리·줄기·잎에 물관과 체관(관다발)이 있다");
  const seed = T("p2", true, "꽃가루받이 뒤 씨를 만들어 번식한다");
  const SPECS = {
    plant: [
      ["우산이끼", "선태식물", [T("p1", false, "물관·체관이 없고, 헛뿌리로 땅에 붙어 몸 표면으로 물을 흡수한다"), T("p2", false, "씨를 만들지 않고 포자로 번식한다"), T(null, null, "그늘지고 축축한 곳에 납작하게 자란다")]],
      ["고사리", "양치식물", [vas, T("p2", false, "씨가 없고, 잎 뒷면의 포자낭에서 포자를 만든다"), T(null, null, "어린잎이 돌돌 말린 채로 나온다")]],
      ["소나무", "겉씨식물", [vas, seed, T("p3", false, "씨방이 없고, 밑씨가 솔방울 비늘 위에 드러나 있다"), T(null, null, "바늘 모양 잎이 두 개씩 묶여 난다")]],
      ["은행나무", "겉씨식물", [vas, seed, T("p3", false, "씨방이 없고 밑씨가 드러나 있다. 열매처럼 보이는 노란 부분은 씨껍질이다"), T(null, null, "부채 모양 잎에 잎맥이 두 갈래로 갈라진다")]],
      ["벼", "외떡잎식물", [vas, seed, T("p3", true, "밑씨가 씨방 속에 있고, 씨방이 자라 낟알(열매)이 된다"), T("p4", false, "떡잎이 1장이고, 잎맥이 나란하며 수염뿌리가 난다")]],
      ["장미", "쌍떡잎식물", [vas, seed, T("p3", true, "밑씨가 씨방 속에 있고, 씨방이 자라 열매가 된다"), T("p4", true, "떡잎이 2장이고, 잎맥이 그물 모양이며 원뿌리와 곁뿌리가 있다")]],
    ],
    animal: [
      ["해면", "해면동물", [T("a1", false, "깃세포 등 여러 세포가 있지만 진정한 조직과 기관은 없다"), T(null, null, "몸의 작은 구멍으로 물을 빨아들여 먹이를 거른다"), T(null, null, "어른이 되면 바위에 붙어 움직이지 않는다")]],
      ["해파리", "자포동물", [tis, T("a2", false, "외배엽과 내배엽 두 층으로 된 몸(2배엽성)이다"), T(null, null, "몸이 방사 대칭이고 촉수에 쏘는 세포(자포)가 있다"), T(null, null, "입은 있지만 항문은 없다")]],
      ["플라나리아", "편형동물", [tis, tri, pro, T("a5", false, "탈피하지 않는다"), T("a7", false, "체절이 없고 몸이 납작하다"), T("a8", false, "외투막이 없다"), T(null, null, "좌우 대칭이며, 입은 있지만 항문은 없다")]],
      ["회충", "선형동물", [tis, tri, pro, T("a5", true, "자라면서 바깥 껍질(큐티클)을 벗는다(탈피)"), T("a6", false, "외골격도 다리도 없는 가늘고 긴 원통형 몸이다"), T(null, null, "체절이 없고, 사람의 작은창자에 기생한다")]],
      ["달팽이", "연체동물", [tis, tri, pro, T("a5", false, "탈피하지 않는다"), T("a7", false, "체절이 없다"), T("a8", true, "외투막이 내장을 감싸고, 외투막이 만든 껍데기가 있다"), T(null, null, "근육질 발로 기어 다닌다")]],
      ["지렁이", "환형동물", [tis, tri, pro, T("a5", false, "탈피하지 않는다"), T("a7", true, "고리 모양의 체절이 100개 넘게 이어져 있다"), T(null, null, "짧은 강모로 흙을 짚고 기어가며, 피부로 호흡한다")]],
      ["거미", "절지동물", [tis, tri, pro, T("a5", true, "자라면서 탈피한다"), T("a6", true, "키틴질 외골격과 마디가 있는 다리 8개가 있다"), T(null, null, "몸이 머리가슴과 배로 나뉘고, 체절이 있다")]],
      ["불가사리", "극피동물", [tis, tri, T("a3", true, "원구가 항문이 되는 후구동물이다"), T("a4", false, "척삭이 없다"), T(null, null, "어른은 5방사 대칭이지만 유생은 좌우 대칭이다"), T(null, null, "관족과 수관계로 움직이고, 피부에 석회질 가시가 있다")]],
      ["개구리", "척삭동물", [tis, tri, T("a3", true, "원구가 항문이 되는 후구동물이다"), T("a4", true, "발생 초기에 척삭이 생기고, 자라면서 척추가 그 자리를 대신한다"), T(null, null, "등 쪽에 속이 빈 신경관이 있다")]],
    ],
  };
  /* 배치: 잎(무리)은 줄 번호, 질문은 깊이 */
  const META = {};
  for (const k in KEYS) {
    let row = 0, maxD = 0;
    const lay = (n, d) => { n.d = d; maxD = Math.max(maxD, d); if (n.leaf) { n.row = row++; return; } lay(n.no, d + 1); lay(n.yes, d + 1); };
    lay(KEYS[k], 0);
    META[k] = { rows: row, maxD };
  }

  let key = "plant", si = 2, mode = "hint", path = [], reveal = false;
  const spec = () => SPECS[key][si];
  const truth = (q) => { const t = spec()[2].find((x) => x[0] === q); return t ? t[1] : undefined; };
  const walk = (p) => { let n = KEYS[key]; for (const s of p) n = s.a ? n.yes : n.no; return n; };
  function rightPath() {
    const p = []; let n = KEYS[key];
    while (!n.leaf) { const t = truth(n.q); if (t === undefined) break; p.push({ q: n.q, a: t }); n = t ? n.yes : n.no; }
    return p;
  }
  const { ctx, size } = fit($("canvas"), () => draw());
  const eun = (w) => w + ((w.charCodeAt(w.length - 1) - 0xac00) % 28 ? "은" : "는");
  const circ = (i) => "①②③④⑤⑥⑦⑧⑨"[i - 1];

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const M = META[key], top = 12, bot = h - 8, rowH = (bot - top) / M.rows;
    const x0 = 24, leafX = w - 112, dx = (leafX - x0) / M.maxD;
    const X = (n) => (n.leaf ? leafX : x0 + n.d * dx);
    const Y = (n) => (n.leaf ? top + (n.row + 0.5) * rowH : (Y(n.no) + Y(n.yes)) / 2);
    const cur = walk(path), done = !!cur.leaf;
    const user = new Map(path.map((s) => [s.q + (s.a ? "y" : "n"), s.ok]));
    const good = new Set(rightPath().map((s) => s.q + (s.a ? "y" : "n")));
    const showGood = reveal || (done && cur.leaf !== spec()[1]);
    const edge = (p, c) => { ctx.beginPath(); ctx.moveTo(X(p), Y(p)); ctx.lineTo(X(p), Y(c)); ctx.lineTo(X(c), Y(c)); ctx.stroke(); };
    const each = (n, f) => { if (n.leaf) return; f(n, n.no, false); f(n, n.yes, true); each(n.no, f); each(n.yes, f); };
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1.4;
    each(KEYS[key], (p, c) => edge(p, c));
    if (showGood) {
      ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      each(KEYS[key], (p, c, a) => { if (good.has(p.q + (a ? "y" : "n"))) edge(p, c); });
      ctx.setLineDash([]);
    }
    ctx.lineWidth = 3.2;
    each(KEYS[key], (p, c, a) => {
      const k = p.q + (a ? "y" : "n"); if (!user.has(k)) return;
      const ok = user.get(k); ctx.strokeStyle = ok === false ? C.warn : ok === null ? C.ink2 : C.leaf; edge(p, c);
    });
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    each(KEYS[key], (p, c, a) => { ctx.fillText(a ? "예" : "아니요", X(p) + 5, Y(c) + (a ? 12 : -5)); });
    const nodes = []; const coll = (n) => { nodes.push(n); if (!n.leaf) { coll(n.no); coll(n.yes); } }; coll(KEYS[key]);
    for (const n of nodes) {
      const x = X(n), y = Y(n);
      if (n.leaf) {
        const here = done && cur === n, isAns = n.leaf === spec()[1] && (done || reveal);
        ctx.fillStyle = here ? (n.leaf === spec()[1] ? C.forest : C.warn) : isAns ? C.forest : C.ink3;
        ctx.beginPath(); ctx.arc(x, y, here ? 5 : 3, 0, Math.PI * 2); ctx.fill();
        ctx.font = `${here || isAns ? 700 : 600} 12px ${F.sans}`; ctx.fillStyle = here ? (n.leaf === spec()[1] ? C.forest : C.warn) : isAns ? C.forest : C.ink;
        ctx.fillText(n.leaf, x + 9, y + 3);
        ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText(n.ex, x + 9, y + 15);
      } else {
        const on = n === cur;
        if (on) { ctx.fillStyle = "rgba(224,160,42,.3)"; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = on ? C.amber : C.card; ctx.strokeStyle = on ? C.amber : C.ink2; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = on ? "#fff" : C.ink; ctx.font = `600 10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(Q[n.q][0], x, y + 3.5);
        ctx.textAlign = "left"; ctx.font = `${on ? 700 : 500} 10.5px ${F.sans}`; ctx.fillStyle = on ? C.ink : C.ink2; ctx.fillText(Q[n.q][1], x + 12, y + 4);
      }
    }
  }

  function update() {
    const s = spec(), cur = walk(path), done = !!cur.leaf;
    $(".sp-name").textContent = s[0];
    $(".traits").innerHTML = s[2].map((t) => `<li${mode === "hint" && !done && t[0] === cur.q ? ' class="hint"' : ""}>${t[2]}</li>`).join("");
    $(".qnow").textContent = done ? `도착: ${cur.leaf}` : `${circ(Q[cur.q][0])} ${Q[cur.q][2]}`;
    $(".yes").disabled = $(".no").disabled = done;
    $(".back").disabled = !path.length;
    const bad = path.filter((p) => p.ok === false).length;
    $(".n-ans").textContent = path.length;
    $(".n-bad").textContent = bad; $(".n-bad").className = "n-bad " + (bad ? "bad" : "");
    $(".n-end").textContent = done ? cur.leaf : "—";
    $(".n-end").className = "n-end " + (done ? (cur.leaf === s[1] ? "good" : "bad") : "");
    const v = $(".verdict"), last = path[path.length - 1];
    let msg = "", cls = "";
    if (done && cur.leaf === s[1]) { msg = `${eun(s[0])} ${s[1]}입니다. ${bad ? "중간에 틀린 답이 있었지만 우연히 같은 곳에 닿았습니다." : `질문 ${path.length}개로 문을 찾았습니다.`}`; cls = "good"; }
    else if (done) {
      const first = path.find((p) => p.ok !== true);
      msg = `${cur.leaf}에 도착했지만 ${eun(s[0])} ${s[1]}입니다. ${first ? `${circ(Q[first.q][0])}에서 길이 갈라졌습니다.` : ""} 점선이 맞는 길입니다.`; cls = "bad";
    } else if (last && last.ok === false) {
      const t = s[2].find((x) => x[0] === last.q);
      msg = `${circ(Q[last.q][0])}의 답은 ‘${t[1] ? "예" : "아니요"}’입니다. 형질 카드: “${t[2]}” 이대로 계속 가면 어디에 닿는지 보세요.`; cls = "bad";
    } else if (last && last.ok === null) {
      msg = "형질 카드에 이 질문의 답이 없습니다. 이 생물에게 맞지 않는 질문이 나왔다는 것은 앞에서 길을 잘못 들었다는 신호입니다."; cls = "bad";
    } else if (mode === "hint" && !path.length) msg = "형질 카드에서 굵게 표시된 줄이 지금 질문의 답을 알려 줍니다.";
    else if (mode === "self" && !path.length) msg = "형질 카드만 보고 답하세요. 틀린 답도 끝까지 따라가 볼 수 있습니다.";
    v.textContent = msg; v.className = "verdict small " + cls;
    root.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === key)));
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === mode)));
    root.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.s === si)));
    draw();
  }
  function specChips() {
    const host = $(".specs");
    host.querySelectorAll("[data-s]").forEach((b) => b.remove());
    host.insertAdjacentHTML("beforeend", SPECS[key].map((s, i) => `<button class="chip" data-s="${i}" aria-pressed="false">${s[0]}</button>`).join(""));
  }
  function answer(a) {
    const n = walk(path); if (n.leaf) return;
    const t = truth(n.q);
    path.push({ q: n.q, a, ok: t === undefined ? null : t === a });
    update();
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b || b.classList.contains("opt")) return;
    if (b.dataset.k) { key = b.dataset.k; si = 0; path = []; reveal = false; specChips(); }
    else if (b.dataset.s) { si = +b.dataset.s; path = []; reveal = false; }
    else if (b.dataset.m) { mode = b.dataset.m; path = []; reveal = false; }
    else if (b.classList.contains("yes")) return answer(true);
    else if (b.classList.contains("no")) return answer(false);
    else if (b.classList.contains("back")) path.pop();
    else if (b.classList.contains("show")) reveal = !reveal;
    else if (b.classList.contains("reset")) { path = []; reveal = false; }
    else return;
    update();
  });
  specChips();
  if (demo) {
    key = "animal"; mode = "self"; specChips(); si = 6;
    [true, true, false, false, true].forEach((a) => answer(a));
  }
  update();
})();
