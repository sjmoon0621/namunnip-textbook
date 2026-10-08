/* 카드: 같은 범위인데 원소가 몇 개인지가 왜 달라질까? — 정수/실수, 끝 포함 여부에 따른 n(A)와 유한·무한·공집합 */
(() => {
  const root = document.getElementById("card-cm2-set-interval");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSets;
  const $ = (s) => root.querySelector(s);
  const kb = [...root.querySelectorAll(".kind .chip")], eb = [...root.querySelectorAll(".ends .chip")];
  const sa = $(".a"), sb = $(".b");
  let t = "int", e = "cc";
  const { ctx, size } = fit($("canvas"), () => draw());

  function members() {
    const a = +sa.value, b = +sb.value, out = [];
    for (let k = -6; k <= 6; k++) if (e === "cc" ? a <= k && k <= b : a < k && k < b) out.push(k);
    return out;
  }
  function realKind() {
    const a = +sa.value, b = +sb.value;
    if (a < b) return "inf";
    if (a === b && e === "cc") return "one";
    return "empty";
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const a = +sa.value, b = +sb.value, y = h * 0.62;
    const X = S.line(ctx, { x0: 22, x1: w - 26, y, lo: -6, hi: 6, step: 1 });
    const mem = members();
    if (a <= b) S.seg(ctx, X, y - 22, a, b, t === "real" ? C.forest : C.leaf, e === "cc", e === "cc", [0, w]);
    if (t === "int") {
      for (let k = -6; k <= 6; k++) {
        const on = mem.includes(k);
        ctx.beginPath(); ctx.arc(X(k), y, on ? 6.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = on ? C.forest : C.ink3; ctx.fill();
      }
    } else if (a < b) {
      ctx.strokeStyle = C.forest; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(X(a), y); ctx.lineTo(X(b), y); ctx.stroke();
    } else if (a === b && e === "cc") {
      ctx.beginPath(); ctx.arc(X(a), y, 6.5, 0, Math.PI * 2); ctx.fillStyle = C.forest; ctx.fill();
    }
    ctx.font = `12px ${F.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    const empty = t === "int" ? !mem.length : realKind() === "empty";
    ctx.fillStyle = empty ? C.warn : C.ink2;
    const msg = empty ? (a > b ? "a > b: 조건을 만족하는 수가 없습니다" : "범위 안에 원소가 없습니다") : t === "int" ? "굵은 점 = 원소인 정수" : realKind() === "inf" ? "막대 위의 모든 실수가 원소입니다" : "점 하나만 원소입니다";
    ctx.fillText(msg, 8, 14);
  }

  function update() {
    const a = +sa.value, b = +sb.value;
    $(".a-out").textContent = S.n(a); $(".b-out").textContent = S.n(b);
    const rel = e === "cc" ? "≤" : "&lt;", cond = `${S.n(a)} ${rel} <i>x</i> ${rel} ${S.n(b)}`;
    let roster, cnt, kind;
    if (t === "int") {
      const m = members(); roster = S.fmt(m); cnt = String(m.length); kind = m.length ? "유한집합" : "공집합 ∅";
    } else {
      const r = realKind();
      roster = r === "inf" ? "원소를 모두 늘어놓을 수 없습니다" : r === "one" ? `{${S.n(a)}}` : "∅";
      cnt = r === "inf" ? "셀 수 없음(무한)" : r === "one" ? "1" : "0"; kind = r === "inf" ? "무한집합" : r === "one" ? "유한집합" : "공집합 ∅";
    }
    $(".eq").innerHTML = `A = {<i>x</i> | ${cond}, <i>x</i>는 ${t === "int" ? "정수" : "실수"}}<br>원소나열법: ${roster}`;
    $(".n-c").textContent = cnt; $(".n-k").textContent = kind; $(".n-d").textContent = S.n(b - a);
    draw();
  }
  const pick = (list, b, key) => { list.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); return b.dataset[key]; };
  kb.forEach((b) => b.addEventListener("click", () => { t = pick(kb, b, "t"); update(); }));
  eb.forEach((b) => b.addEventListener("click", () => { e = pick(eb, b, "e"); update(); }));
  [sa, sb].forEach((s) => s.addEventListener("input", update));
  update();
})();
