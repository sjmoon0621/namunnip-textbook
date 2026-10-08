/* 카드: 전개된 식에서 구의 중심과 반지름을 되찾을 수 있을까? — 일반형을 완전제곱식으로 바꾸는 단계와 상수항 D에 따른 도형 */
(() => {
  const root = document.getElementById("card-geo-sphere-complete");
  if (!root) return;
  const { C, F } = NM;
  const S = NMSpace3;
  const $ = (s) => root.querySelector(s), exBtns = [...root.querySelectorAll(".ex .chip")];
  const sd = $(".d");
  let p = [-2, 4, -6], step = 0;
  const V = ["x", "y", "z"];
  const vw = S.view($("canvas"), () => draw(), { center: [1, -2, 3], span: 11.5, pitch: 0.38 });
  const it = (v) => `<i>${v}</i>`, sup2 = (s) => `${s}<sup>2</sup>`;
  const lin = (k, v) => (k === 0 ? "" : ` ${k > 0 ? "+" : "−"} ${Math.abs(k) === 1 ? "" : S.n(Math.abs(k))}${it(v)}`);
  const g1 = (v, k) => (k === 0 ? sup2(it(v)) : `(${sup2(it(v))}${lin(k, v)})`);
  const g2 = (v, k) => (k === 0 ? sup2(it(v)) : `(${sup2(it(v))}${lin(k, v)} <span class="on">+ ${S.n((k / 2) ** 2)}</span>)`);
  const g3 = (v, k) => (k === 0 ? sup2(it(v)) : sup2(`(${it(v)} ${k > 0 ? "+" : "−"} ${S.n(Math.abs(k / 2))})`));
  const state = () => { const D = +sd.value, K = (p[0] ** 2 + p[1] ** 2 + p[2] ** 2) / 4; return { D, K, r2: K - D, c: p.map((k) => -k / 2) }; };
  const root2 = (x) => { const s = Math.sqrt(x); return Math.abs(s - Math.round(s)) < 1e-9 ? `${Math.round(s)}` : `√${S.n(x)} ≈ ${S.n(s)}`; };

  function draw() {
    const { ctx, size } = vw; if (!size.w) return;
    ctx.clearRect(0, 0, size.w, size.h);
    const { r2, c } = state();
    vw.st.center = c;
    vw.axes(4.6, 3.4);
    if (r2 > 0) {
      const r = Math.sqrt(r2), q = vw.P(c);
      ctx.save(); ctx.fillStyle = C.leaf; ctx.globalAlpha = 0.14; ctx.beginPath(); ctx.arc(q.x, q.y, r * vw.scale(), 0, 7); ctx.fill(); ctx.restore();
      ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q.x, q.y, r * vw.scale(), 0, 7); ctx.stroke();
      vw.path(vw.circle(c, [1, 0, 0], [0, 1, 0], r), C.forest, 1, [4, 3]);
    }
    if (r2 >= 0) { vw.dot(c, r2 === 0 ? C.warn : C.ink, r2 === 0 ? 6.5 : 5); vw.label(c, `(${c.map((x) => S.n(x)).join(", ")})`, r2 === 0 ? C.warn : C.ink, 8, -8, "left", `600 11.5px ${F.mono}`); }
    else {
      ctx.save(); ctx.font = `600 13px ${F.sans}`; ctx.textAlign = "center"; ctx.fillStyle = C.warn;
      ctx.fillText("식을 만족하는 점이 없습니다", size.w / 2, 22); ctx.restore();
    }
  }

  function update() {
    const { D, K, r2, c } = state();
    $(".d-out").textContent = S.n(D);
    const L = [];
    L.push(`${V.map((v) => sup2(it(v))).join(" + ")}${V.map((v, i) => lin(p[i], v)).join("")}${D === 0 ? "" : ` ${D > 0 ? "+" : "−"} ${S.n(Math.abs(D))}`} = 0`);
    if (step >= 1) L.push(`${V.map((v, i) => g1(v, p[i])).join(" + ")} = ${S.n(-D)}`);
    if (step >= 2) L.push(`${V.map((v, i) => g2(v, p[i])).join(" + ")} = ${S.n(-D)}${p.filter((k) => k !== 0).map((k) => ` <span class="on">+ ${S.n((k / 2) ** 2)}</span>`).join("")}`);
    if (step >= 3) L.push(`${V.map((v, i) => g3(v, p[i])).join(" + ")} = ${S.n(K)} − ${D < 0 ? `(${S.n(D)})` : S.n(D)} = <b>${S.n(r2)}</b>`);
    $(".eq").innerHTML = L.join("<br>");
    const done = step >= 3;
    $(".n-c").textContent = done ? `(${c.map((x) => S.n(x)).join(", ")})` : "—";
    $(".n-r2").textContent = done ? S.n(r2) : "—";
    const f = $(".n-f");
    f.textContent = !done ? "—" : r2 > 0 ? `구 (r = ${root2(r2)})` : r2 === 0 ? "한 점" : "없음";
    f.className = `n-f ${done && r2 <= 0 ? "bad" : ""}`;
    $(".go-next").disabled = step >= 3;
    draw();
  }
  $(".go-next").addEventListener("click", () => { step = Math.min(3, step + 1); update(); });
  $(".go-reset").addEventListener("click", () => { step = 0; update(); });
  exBtns.forEach((b) => b.addEventListener("click", () => { p = b.dataset.p.split(",").map(Number); exBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); update(); }));
  sd.addEventListener("input", update);
  update();
})();
