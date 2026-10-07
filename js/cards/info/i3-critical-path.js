/* 카드: 프로젝트는 어느 단계가 늦어지면 전체가 늦어질까? — 작업 분해, 위상 순서, 임계 경로 */
(() => {
  const root = document.getElementById("card-info-critical-path");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sD = $(".d");
  /* 위상 순서로 적은 작업 목록 (모식) */
  const T = [
    { name: "문제 분석", d: 2, pre: [], stage: "분석" },
    { name: "자료 수집", d: 4, pre: [0], stage: "분석" },
    { name: "알고리즘 설계", d: 3, pre: [0], stage: "설계" },
    { name: "화면 설계", d: 2, pre: [0], stage: "설계" },
    { name: "자료 정리", d: 2, pre: [1], stage: "구현" },
    { name: "프로그래밍", d: 5, pre: [2, 3], stage: "구현" },
    { name: "테스트·디버깅", d: 3, pre: [4, 5], stage: "검증" },
    { name: "평가·발표 준비", d: 2, pre: [6], stage: "공유" },
  ];
  let sel = 1;
  const host = $(".tasks");
  host.innerHTML = T.map((t, i) => `<button type="button" class="chip" data-t="${i}" aria-pressed="${i === sel}">${t.name}</button>`).join("");

  function compute() {
    const es = [], ef = [];
    T.forEach((t, i) => { es[i] = Math.max(0, ...t.pre.map((p) => ef[p])); ef[i] = es[i] + t.d; });
    const total = Math.max(...ef);
    const lf = Array(T.length).fill(total), ls = [];
    for (let i = T.length - 1; i >= 0; i--) {
      T.forEach((t, j) => { if (t.pre.includes(i)) lf[i] = Math.min(lf[i], ls[j]); });
      ls[i] = lf[i] - T[i].d;
    }
    const slack = T.map((t, i) => ls[i] - es[i]);
    return { es, ef, total, slack };
  }

  const cv = fit($("canvas"), () => draw());
  let R = compute();

  function update() {
    R = compute();
    $(".t-name").textContent = T[sel].name; $(".d-out").textContent = T[sel].d;
    $(".n-total").textContent = R.total + "일";
    $(".n-path").textContent = T.map((t, i) => (R.slack[i] === 0 ? t.name : null)).filter(Boolean).join(" → ");
    $(".n-slack").textContent = R.slack[sel] + "일";
    $(".n-slack").className = "n-slack" + (R.slack[sel] === 0 ? " bad" : " good");
    draw();
  }

  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lw = 96, top = 30, bot = 30, rows = T.length;
    const rh = (h - top - bot) / rows, span = Math.max(R.total, 14);
    const X = (d) => lw + d / span * (w - lw - 12);
    // 날짜 눈금
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillStyle = C.ink3; ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    const step = span > 24 ? 4 : 2;
    for (let d = 0; d <= span; d += step) {
      const x = Math.round(X(d)) + .5;
      ctx.beginPath(); ctx.moveTo(x, top - 4); ctx.lineTo(x, h - bot); ctx.stroke();
      ctx.fillText(String(d), x, h - bot + 13);
    }
    ctx.textAlign = "right"; ctx.fillText("일", w - 4, h - bot + 26);
    // 선행 관계
    ctx.strokeStyle = "#b9bab3"; ctx.lineWidth = 1;
    T.forEach((t, i) => t.pre.forEach((p) => {
      const x1 = X(R.ef[p]), y1 = top + p * rh + rh / 2, x2 = X(R.es[i]), y2 = top + i * rh + rh / 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + 4, y1); ctx.lineTo(x1 + 4, y2); ctx.lineTo(x2, y2); ctx.stroke();
    }));
    // 막대
    T.forEach((t, i) => {
      const y = top + i * rh + rh * 0.2, bh = rh * 0.6, crit = R.slack[i] === 0;
      ctx.fillStyle = i === sel ? C.ink : C.ink2; ctx.font = `${i === sel ? 600 : 400} 11.5px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText(t.name, lw - 8, y + bh / 2 + 4);
      if (R.slack[i] > 0) {
        ctx.fillStyle = "rgba(116,171,102,.18)"; ctx.fillRect(X(R.ef[i]), y + bh * 0.3, X(R.ef[i] + R.slack[i]) - X(R.ef[i]), bh * 0.4);
      }
      ctx.fillStyle = crit ? C.amber : C.leaf;
      ctx.fillRect(X(R.es[i]), y, X(R.ef[i]) - X(R.es[i]), bh);
      if (i === sel) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(X(R.es[i]) + 1, y + 1, X(R.ef[i]) - X(R.es[i]) - 2, bh - 2); }
      ctx.fillStyle = "#fff"; ctx.font = `600 10.5px ${F.mono}`; ctx.textAlign = "center";
      if (X(R.ef[i]) - X(R.es[i]) > 18) ctx.fillText(t.d + "일", (X(R.es[i]) + X(R.ef[i])) / 2, y + bh / 2 + 4);
    });
    // 범례
    ctx.textAlign = "left"; ctx.font = `11px ${F.sans}`;
    const leg = [[C.amber, "임계 경로"], [C.leaf, "여유 있는 작업"], ["rgba(116,171,102,.35)", "여유"]];
    let lx = lw;
    for (const [c, lab] of leg) {
      ctx.fillStyle = c; ctx.fillRect(lx, 9, 14, 9);
      ctx.fillStyle = C.ink2; ctx.fillText(lab, lx + 19, 17); lx += 30 + ctx.measureText(lab).width;
    }
  }

  host.addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    sel = +b.dataset.t;
    host.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    sD.value = T[sel].d; update();
  });
  sD.addEventListener("input", () => { T[sel].d = +sD.value; update(); });
  if (window.NMLab && NMLab.demo) { T[1].d = 7; }
  sD.value = T[sel].d;
  update();
})();
