/* 카드: 인공지능은 처음 보는 광물을 어떻게 분류할까? — 밀도·모스 굳기로 하는 k-최근접 이웃 분류 */
(() => {
  const root = document.getElementById("card-fusi-knn");
  if (!root) return;
  const { C, F, fit, axes } = NM;
  const $ = (s) => root.querySelector(s);
  const sK = $(".k");

  const CLS = [
    { nm: "규산염", col: C.forest },
    { nm: "탄산염", col: C.amber },
    { nm: "황화물", col: C.apple },
    { nm: "산화물", col: "#4a6fa5" },
  ];
  /* [이름, 무리, 밀도 g/cm³, 모스 굳기] — 광물 도감 값 범위의 대표값 */
  const M = [
    ["석영", 0, 2.65, 7], ["정장석", 0, 2.56, 6], ["사장석", 0, 2.65, 6.25], ["감람석", 0, 3.32, 6.75], ["휘석", 0, 3.35, 5.75],
    ["각섬석", 0, 3.2, 5.5], ["백운모", 0, 2.83, 2.5], ["흑운모", 0, 3.0, 2.75], ["석류석", 0, 4.3, 7.25], ["황옥", 0, 3.55, 8],
    ["저어콘", 0, 4.65, 7.5], ["활석", 0, 2.75, 1], ["고령석", 0, 2.6, 2.25], ["녹주석", 0, 2.76, 7.75], ["전기석", 0, 3.15, 7.25],
    ["방해석", 1, 2.71, 3], ["백운석", 1, 2.85, 3.75], ["아라고나이트", 1, 2.95, 3.75], ["능철석", 1, 3.9, 4], ["마그네사이트", 1, 3.0, 4],
    ["공작석", 1, 3.9, 3.75], ["능망가니즈석", 1, 3.7, 3.75], ["능아연석", 1, 4.4, 4.25], ["백연석", 1, 6.55, 3.25], ["남동석", 1, 3.77, 3.75],
    ["황철석", 2, 5.0, 6.25], ["방연석", 2, 7.5, 2.5], ["섬아연석", 2, 4.05, 3.75], ["황동석", 2, 4.2, 3.75], ["진사", 2, 8.1, 2.25],
    ["휘수연석", 2, 4.7, 1.25], ["휘안석", 2, 4.6, 2], ["자류철석", 2, 4.6, 4], ["유비철석", 2, 6.1, 5.75], ["반동석", 2, 5.07, 3],
    ["백철석", 2, 4.9, 6.25], ["휘동석", 2, 5.65, 2.75],
    ["적철석", 3, 5.26, 6], ["자철석", 3, 5.18, 6], ["강옥", 3, 4.0, 9], ["석석", 3, 6.95, 6.5], ["금홍석", 3, 4.25, 6.25],
    ["티탄철석", 3, 4.72, 5.5], ["크로뮴철석", 3, 4.6, 5.5], ["첨정석", 3, 3.6, 8], ["적동석", 3, 6.1, 3.75], ["침철석", 3, 4.3, 5.25],
    ["금록석", 3, 3.7, 8.5],
  ];
  let train = "all", unit = 1, probe = null;

  const trainSet = () => {
    if (train === "nosulf") return M.filter((m) => m[1] !== 2);
    if (train === "few") return [0, 1, 2, 3].flatMap((c) => M.filter((m) => m[1] === c).filter((_, i) => i % 4 === 0).slice(0, 3));
    return M;
  };
  function classify(set, d, h, k, skip) {
    const nb = set.filter((m) => m !== skip).map((m) => [Math.hypot((m[2] - d) * unit, m[3] - h), m]).sort((a, b) => a[0] - b[0]).slice(0, k);
    const votes = [0, 0, 0, 0];
    nb.forEach(([dist, m], i) => { votes[m[1]] += 1 + 1e-6 * (k - i); });   /* 동점이면 더 가까운 이웃 쪽 */
    return { c: votes.indexOf(Math.max(...votes)), nb, votes };
  }

  const view = fit($("canvas"), () => draw());
  let bg = null, bgKey = "";
  const D0 = 2, D1 = 9, H0 = 0.5, H1 = 10;

  function draw() {
    const { ctx } = view, { w, h } = view.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const box = { x0: 34, y0: 16, w: w - 44, h: h - 50 };
    const X = (d) => box.x0 + (d - D0) / (D1 - D0) * box.w, Y = (v) => box.y0 + box.h - (v - H0) / (H1 - H0) * box.h;
    const set = trainSet(), k = Math.min(+sK.value, set.length);
    /* 배경: 예측 무리 (격자) */
    const key = `${train}|${unit}|${k}`;
    if (key !== bgKey) {
      const NX = 70, NY = 50; bg = { NX, NY, c: new Int8Array(NX * NY) };
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) bg.c[j * NX + i] = classify(set, D0 + (i + 0.5) / NX * (D1 - D0), H0 + (j + 0.5) / NY * (H1 - H0), k).c;
      bgKey = key;
    }
    const cw = box.w / bg.NX, ch = box.h / bg.NY;
    ctx.globalAlpha = 0.16;
    for (let j = 0; j < bg.NY; j++) for (let i = 0; i < bg.NX; i++) {
      ctx.fillStyle = CLS[bg.c[j * bg.NX + i]].col;
      ctx.fillRect(box.x0 + i * cw, box.y0 + box.h - (j + 1) * ch, cw + 0.5, ch + 0.5);
    }
    ctx.globalAlpha = 1;
    axes(ctx, { ...box, X, Y, xt: [2, 3, 4, 5, 6, 7, 8, 9].map((v) => [v, unit === 1 ? String(v) : String(v * 1000)]), yt: [1, 3, 5, 7, 9].map((v) => [v, String(v)]),
      xlabel: unit === 1 ? "밀도 (g/cm³)" : "밀도 (kg/m³)", ylabel: "모스 굳기" });
    /* 이웃 연결선 */
    if (probe) {
      const r = classify(set, probe[0], probe[1], k);
      ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      r.nb.forEach(([, m]) => { ctx.beginPath(); ctx.moveTo(X(probe[0]), Y(probe[1])); ctx.lineTo(X(m[2]), Y(m[3])); ctx.stroke(); });
      ctx.setLineDash([]);
    }
    /* 광물 점 */
    const inSet = new Set(set);
    M.forEach((m) => {
      const x = X(m[2]), y = Y(m[3]);
      ctx.beginPath(); ctx.arc(x, y, 4.2, 0, Math.PI * 2);
      if (inSet.has(m)) { ctx.fillStyle = CLS[m[1]].col; ctx.fill(); }
      else { ctx.strokeStyle = CLS[m[1]].col; ctx.lineWidth = 1.3; ctx.stroke(); }
    });
    if (probe) {
      const x = X(probe[0]), y = Y(probe[1]);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 7, y - 7); ctx.lineTo(x + 7, y + 7); ctx.moveTo(x + 7, y - 7); ctx.lineTo(x - 7, y + 7); ctx.stroke();
    }
    /* 범례 */
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    let lx = box.x0 + 6;
    CLS.forEach((c) => { ctx.fillStyle = c.col; ctx.beginPath(); ctx.arc(lx + 4, box.y0 + 8, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.fillText(c.nm, lx + 11, box.y0 + 12); lx += ctx.measureText(c.nm).width + 24; });
    if (set.length < M.length) { ctx.fillStyle = C.ink3; ctx.fillText("○ 학습에서 뺀 광물", lx, box.y0 + 12); }
    /* 하나씩 빼기 검증 (학습 데이터 안에서) + 학습에서 뺀 광물 */
    let right = 0; const miss = [];
    set.forEach((m) => { const r = classify(set, m[2], m[3], k, m); if (r.c === m[1]) right++; else miss.push(m[0]); });
    const out = M.filter((m) => !inSet.has(m));
    let outRight = 0; out.forEach((m) => { if (classify(set, m[2], m[3], k).c === m[1]) outRight++; });
    $(".acc").textContent = `${(right / set.length * 100).toFixed(0)} %` + (out.length ? ` · 뺀 광물 ${(outRight / out.length * 100).toFixed(0)} %` : "");
    $(".ntr").textContent = `${set.length}종`;
    $(".miss").textContent = miss.slice(0, 4).join(", ") + (miss.length > 4 ? ` 외 ${miss.length - 4}` : "") || "없음";
    view.map = { box, X, Y };
  }

  $("canvas").addEventListener("click", (e) => {
    if (!view.map) return;
    const r = $("canvas").getBoundingClientRect(), { box } = view.map;
    const d = D0 + (e.clientX - r.left - box.x0) / box.w * (D1 - D0), hv = H0 + (box.y0 + box.h - (e.clientY - r.top)) / box.h * (H1 - H0);
    if (d < D0 || d > D1 || hv < H0 || hv > H1) return;
    probe = [d, hv]; report(); draw();
  });
  function report() {
    if (!probe) return;
    const set = trainSet(), k = Math.min(+sK.value, set.length), r = classify(set, probe[0], probe[1], k);
    const v = r.votes.map((x, i) => [Math.round(x), CLS[i].nm]).filter(([x]) => x > 0).map(([x, n]) => `${n} ${x}`).join(", ");
    $(".kn-out").innerHTML = `밀도 ${(probe[0] * unit).toFixed(unit === 1 ? 2 : 0)} ${unit === 1 ? "g/cm³" : "kg/m³"}, 굳기 ${probe[1].toFixed(1)} → 예측: <b>${CLS[r.c].nm}</b> (투표: ${v})<br><span class="small dim">가까운 이웃: ${r.nb.map(([, m]) => m[0]).join(", ")}</span>`;
  }
  const sel = (grp, attr, set) => $(grp).addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`); if (!b) return;
    set(b.dataset[attr]); $(grp).querySelectorAll(`[data-${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); report(); draw();
  });
  sel(".tsel", "t", (x) => { train = x; });
  sel(".usel", "u", (x) => { unit = +x; });
  sK.addEventListener("input", () => { $(".k-out").textContent = sK.value; report(); draw(); });
  if (/[?&]demo\b/.test(location.search)) { probe = [7.4, 2.6]; report(); }
})();
