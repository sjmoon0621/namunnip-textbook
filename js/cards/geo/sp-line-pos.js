/* 카드: 만나지 않는 두 직선은 언제나 평행할까? — 정육면체 꼭짓점으로 두 직선을 골라 만남·평행·꼬인 위치 판별 */
(() => {
  const root = document.getElementById("card-geo-line-pos");
  if (!root) return;
  const { C } = NM;
  const S = NMSpace3, { sub, add, mul, dot, cross, len } = S;
  const $ = (s) => root.querySelector(s), btns = [...root.querySelectorAll(".presets .chip")];
  // 한 변 2인 정육면체 ABCD-EFGH (아랫면 ABCD, 윗면 EFGH)
  const V = { A: [0, 0, 0], B: [2, 0, 0], C: [2, 2, 0], D: [0, 2, 0], E: [0, 0, 2], F: [2, 0, 2], G: [2, 2, 2], H: [0, 2, 2] };
  const names = Object.keys(V);
  const sel = ["l1a", "l1b", "l2a", "l2b"].map((c) => $("." + c));
  sel.forEach((s) => { s.innerHTML = names.map((k) => `<option>${k}</option>`).join(""); s.addEventListener("change", () => { btns.forEach((b) => b.setAttribute("aria-pressed", "false")); update(); }); });
  const vw = S.view($("canvas"), () => draw(), { center: [1, 1, 1], span: 4.6, yaw: -0.42, pitch: 0.36 });
  const EPS = 1e-9;

  function rel() {
    const [a, b, c, d] = sel.map((s) => V[s.value]);
    const u = sub(b, a), v = sub(d, c), w = sub(c, a);
    if (len(u) < EPS || len(v) < EPS) return { bad: true };
    const cr = cross(u, v);
    if (len(cr) < EPS) return len(cross(w, u)) < EPS ? { kind: "same", a, b, c, d, u, v } : { kind: "par", a, b, c, d, u, v };
    if (Math.abs(dot(w, cr)) < EPS) {
      const t = dot(cross(w, v), cr) / dot(cr, cr);
      return { kind: "meet", a, b, c, d, u, v, X: add(a, mul(u, t)) };
    }
    return { kind: "skew", a, b, c, d, u, v };
  }

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const eye = vw.eye();
    // 모서리: 이웃한 두 면이 모두 뒤를 보면 숨은 선(점선)
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
      const p = V[names[i]], q = V[names[j]], df = sub(q, p);
      if (Math.abs(df[0]) + Math.abs(df[1]) + Math.abs(df[2]) !== 2) continue;
      const k = df.findIndex((x) => x !== 0);
      const faces = [0, 1, 2].filter((m) => m !== k).map((m) => { const nrm = [0, 0, 0]; nrm[m] = p[m] === 0 ? -1 : 1; return nrm; });
      const vis = faces.some((nrm) => dot(nrm, eye) > 0);
      vw.line(p, q, C.ink3, 1.1, vis ? null : [4, 4]);
    }
    const r = rel();
    const tags = () => names.forEach((k) => { const v = V[k], off = sub(v, [1, 1, 1]); const p = vw.P(add(v, mul(off, 0.16))), o = vw.P(v); vw.label(v, k, C.ink2, p.x - o.x, p.y - o.y, "center"); });
    if (r.bad) { tags(); return; }
    const ext = (a, b) => [add(a, mul(sub(b, a), -0.35)), add(b, mul(sub(b, a), 0.35))];
    const [l1, l1e] = ext(r.a, r.b), [l2, l2e] = ext(r.c, r.d);
    if (r.kind === "skew") {
      // m을 l 위의 점 a로 평행이동한 m′
      const v = mul(r.v, 1 / len(r.v));
      vw.line(add(r.a, mul(v, -1.3)), add(r.a, mul(v, 1.3)), C.warn, 1.6, [5, 4]);
      vw.label(add(r.a, mul(v, 1.3)), "m′", C.warn, 8, 0);
    }
    vw.line(l1, l1e, C.forest, 3); vw.line(l2, l2e, C.warn, 3);
    vw.label(l1e, "l", C.forest, 8, -4); vw.label(l2e, "m", C.warn, 8, -4);
    [r.a, r.b].forEach((p) => vw.dot(p, C.forest, 4)); [r.c, r.d].forEach((p) => vw.dot(p, C.warn, 4));
    if (r.kind === "meet") { vw.dot(r.X, C.ink, 6); }
    tags();
  }

  function update() {
    const r = rel(), pl = $(".n-plane"), rl = $(".n-rel"), an = $(".n-ang");
    if (r.bad) { pl.textContent = "—"; rl.textContent = "두 점을 다르게"; an.textContent = "—"; pl.className = rl.className = "n-plane"; draw(); return; }
    const kind = { same: "일치", par: "평행", meet: "한 점에서 만남", skew: "꼬인 위치" }[r.kind];
    pl.textContent = r.kind === "skew" ? "아니요" : "예";
    rl.textContent = kind; rl.className = `n-rel ${r.kind === "skew" ? "bad" : "good"}`;
    an.textContent = r.kind === "par" || r.kind === "same" ? "0°" : `${S.n(S.lineAngle(r.u, r.v), 1)}°${Math.abs(S.lineAngle(r.u, r.v) - 90) < 1e-6 ? " (수직)" : ""}`;
    draw();
  }
  const set = (s) => { const [p, q] = s.split(","); [p[0], p[1], q[0], q[1]].forEach((k, i) => { sel[i].value = k; }); };
  btns.forEach((b) => b.addEventListener("click", () => { set(b.dataset.l); btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  set("AB,HG"); update();
})();
