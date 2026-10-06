/* 카드: 숲과 잔디밭의 지표 곤충 군집 — 함정 트랩, 분류군별 개체 수, 종 풍부도, H′, 균등도, 채집 노력 곡선 (가상 자료) */
(() => {
  const root = document.getElementById("card-labbio-pitfall");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const [cvA, cvP] = root.querySelectorAll("canvas");
  const HAB = ["숲 바닥", "잔디밭"];
  const HC = [C.forest, C.amber];
  /* 분류군: 이름, 트랩 하나·하루당 평균 포획 수 [숲, 잔디밭] (교육용 가상값) */
  const TX = [
    ["먼지벌레류", [0.9, 0.35]], ["반날개류", [0.45, 0.12]], ["송장벌레류", [0.18, 0]],
    ["곰개미류", [1.0, 3.6]], ["일본왕개미", [0.3, 0.5]], ["늑대거미류", [0.45, 0.7]],
    ["접시거미류", [0.3, 0.05]], ["톡토기류", [1.6, 1.9]], ["노래기류", [0.3, 0.01]],
    ["쥐며느리류", [0.4, 0.08]], ["꼽등이류", [0.22, 0]], ["귀뚜라미류", [0.05, 0.35]],
  ];
  const NT = TX.length;
  let hab = 0, last = [null, null];
  const trapF = [[], []];   /* 트랩 자리마다 고정된 미소 서식지 효과 */
  for (let h = 0; h < 2; h++) for (let i = 0; i < 10; i++) trapF[h].push(Math.exp(0.55 * L.gauss() - 0.15));
  const cum = [new Array(NT).fill(0), new Array(NT).fill(0)];
  const effort = [[], []];   /* [누적 트랩·일, 누적 분류군 수] */

  function poisson(lam) {
    if (lam <= 0) return 0;
    if (lam > 30) return Math.max(0, Math.round(lam + Math.sqrt(lam) * L.gauss()));
    const e = Math.exp(-lam); let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > e);
    return k - 1;
  }
  const div = (cnt) => {
    const N = cnt.reduce((s, x) => s + x, 0), S = cnt.filter((x) => x > 0).length;
    const H = N ? -cnt.reduce((s, x) => (x ? s + (x / N) * Math.log(x / N) : s), 0) : NaN;
    return { N, S, H, J: S > 1 ? H / Math.log(S) : NaN };
  };

  const art = fit(cvA, () => drawArt());
  const pl = fit(cvP, () => drawPlot());
  const tbl = L.table($(".tbl-host"), [
    { key: "hab", label: "서식지" }, { key: "day", label: "일차" }, { key: "n", label: "트랩" },
    { key: "N", label: "개체 수" }, { key: "S", label: "분류군 S" }, { key: "H", label: "H′", res: 0.01 }, { key: "J", label: "J′", res: 0.01 },
  ], () => rebuild());

  function rebuild() {
    cum[0].fill(0); cum[1].fill(0); effort[0] = []; effort[1] = [];
    const te = [0, 0];
    tbl.rows.forEach((r) => {
      const h = r.h;
      r.cnt.forEach((c, i) => { cum[h][i] += c; });
      te[h] += r.n;
      effort[h].push([te[h], cum[h].filter((x) => x > 0).length]);
    });
    if (!tbl.rows.length) last = [null, null];
    drawSum(); drawPlot(); drawArt();
  }

  function drawSum() {
    const d = cum.map(div);
    const body = TX.map(([n], i) => `<tr><td>${n}</td><td>${cum[0][i]}</td><td>${cum[1][i]}</td></tr>`).join("");
    const f = (x, r) => (Number.isFinite(x) ? x.toFixed(r) : "—");
    $(".pf-sum").innerHTML = `<table><thead><tr><th>분류군 (누적)</th><th>숲 바닥</th><th>잔디밭</th></tr></thead><tbody>${body}
      <tr class="pf-foot"><td>개체 수 N</td><td>${d[0].N}</td><td>${d[1].N}</td></tr>
      <tr><td>분류군 수 S</td><td>${d[0].S}</td><td>${d[1].S}</td></tr>
      <tr><td>H′ <span class="dim">(다양도)</span></td><td>${f(d[0].H, 2)}</td><td>${f(d[1].H, 2)}</td></tr>
      <tr><td>J′ <span class="dim">(균등도)</span></td><td>${f(d[0].J, 2)}</td><td>${f(d[1].J, 2)}</td></tr></tbody></table>`;
  }

  function drawArt() {
    const { ctx } = art, { w, h } = art.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +$(".ntrap").value, gap = 10, pw = (w - gap) / 2;
    for (let k = 0; k < 2; k++) {
      const x0 = k * (pw + gap), y0 = 22, ph = h - 30;
      ctx.fillStyle = k ? "#cfe0b4" : "#c9b98f"; ctx.fillRect(x0, y0, pw, ph);
      /* 바탕 무늬: 숲은 낙엽과 나무, 잔디밭은 풀잎 */
      let s = 11 + k * 97;
      const R = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      if (!k) {
        for (let i = 0; i < 60; i++) { ctx.fillStyle = ["#b39a66", "#a5884f", "#c7ad74"][i % 3]; ctx.beginPath(); ctx.ellipse(x0 + R() * pw, y0 + R() * ph, 5, 2.5, R() * 3, 0, Math.PI * 2); ctx.fill(); }
        for (let i = 0; i < 4; i++) { const tx = x0 + pw * (0.12 + 0.25 * i), ty = y0 + (i % 2 ? ph * 0.22 : ph * 0.8); ctx.fillStyle = "rgba(59,124,42,.55)"; ctx.beginPath(); ctx.arc(tx, ty, 17, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#6b4f2a"; ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fill(); }
      } else {
        ctx.strokeStyle = "#8fb46e"; ctx.lineWidth = 1;
        for (let i = 0; i < 160; i++) { const gx = x0 + R() * pw, gy = y0 + 4 + R() * (ph - 4); ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + (R() - 0.5) * 3, gy - 4); ctx.stroke(); }
      }
      if (k === hab) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(x0 + 1, y0 + 1, pw - 2, ph - 2); }
      ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left";
      ctx.fillText(HAB[k], x0 + 2, 14);
      const days = tbl.rows.filter((r) => r.h === k).length;
      ctx.font = `11px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
      ctx.fillText(`수거 ${days}회`, x0 + pw - 2, 14);
      /* 트랩 */
      const lr = last[k], nn = lr ? lr.n : n, cy = y0 + ph * 0.5, rr = Math.min(12, pw / (nn * 2.6));
      for (let i = 0; i < nn; i++) {
        const cx = x0 + pw * (i + 0.5) / nn;
        ctx.fillStyle = "#f4f4ef"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#e6e2d6"; ctx.beginPath(); ctx.arc(cx, cy, rr * 0.6, 0, Math.PI * 2); ctx.fill();
        if (lr) {
          const c = lr.per[i];
          const m = Math.min(c, 14);
          for (let j = 0; j < m; j++) { const a = j * 2.4, d = rr * 0.45 * Math.sqrt((j + 0.5) / 14); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.4, 0, Math.PI * 2); ctx.fill(); }
          ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center";
          ctx.fillText(String(c), cx, cy + rr + 14);
        }
      }
      if (!lr) { ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("아직 수거 전", x0 + pw / 2, cy + rr + 16); }
    }
  }

  function drawPlot() {
    const { ctx } = pl, { w, h } = pl.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const xm = Math.max(10, ...effort.flat().map((p) => p[0])) * 1.05;
    const box = { x0: 40, y0: 34, w: w - 54, h: h - 68 };
    const g = L.plot(ctx, box, { pts: [], xr: [0, xm], yr: [0, NT + 0.5], xlabel: "누적 트랩·일", ylabel: "누적 분류군 수" });
    effort.forEach((e, k) => {
      if (!e.length) return;
      ctx.strokeStyle = HC[k]; ctx.fillStyle = HC[k]; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(g.X(0), g.Y(0)); e.forEach(([x, y]) => ctx.lineTo(g.X(x), g.Y(y))); ctx.stroke();
      e.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(g.X(x), g.Y(y), 3.2, 0, Math.PI * 2); ctx.fill(); });
    });
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    HAB.forEach((n, k) => { const lx = box.x0 + 110 + k * 80; ctx.fillStyle = HC[k]; ctx.fillRect(lx, 10, 10, 10); ctx.fillStyle = C.ink2; ctx.fillText(n, lx + 14, 19); });
  }

  function collect() {
    const n = +$(".ntrap").value, rim = $(".rim").checked ? 0.3 : 1;
    const cnt = new Array(NT).fill(0), per = [];
    for (let i = 0; i < n; i++) {
      const f = trapF[hab][i] * Math.exp(0.3 * L.gauss() - 0.045) * rim;
      let tot = 0;
      TX.forEach(([, r], j) => { const c = poisson(r[hab] * f); cnt[j] += c; tot += c; });
      per.push(tot);
    }
    last[hab] = { n, per };
    const d = div(cnt), day = tbl.rows.filter((r) => r.h === hab).length + 1;
    tbl.add({ h: hab, hab: HAB[hab], day, n, N: d.N, S: d.S, H: d.H, J: d.J, cnt });
  }

  $(".hab").addEventListener("click", (e) => {
    const b = e.target.closest("[data-h]"); if (!b) return;
    hab = +b.dataset.h; root.querySelectorAll("[data-h]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawArt();
  });
  $(".ntrap").addEventListener("input", () => { $(".n-out").textContent = $(".ntrap").value; drawArt(); });
  $(".col").addEventListener("click", collect);
  $(".clear").addEventListener("click", () => tbl.clear());
  drawSum();
  if (L.demo) {
    for (let d = 0; d < 3; d++) { hab = 0; collect(); hab = 1; collect(); }
    hab = 0;
  }
})();
