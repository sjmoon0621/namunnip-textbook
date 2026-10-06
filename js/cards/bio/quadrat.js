/* 카드: 방형구 몇 개면 이 초원의 우점종을 알 수 있을까? — 방형구법, 밀도·빈도·피도, 상대값, 중요치 (가상 초원) */
(() => {
  const root = document.getElementById("card-bio-quadrat");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const [cvF, cvP] = root.querySelectorAll("canvas");
  const FW = 12, FH = 9, AREA = FW * FH;   /* 초원 12 m × 9 m */
  /* 종: 이름, 색, 개체 수, 덩이 수(0이면 고르게 흩어짐), 덩이 퍼짐(m), 개체가 덮는 반지름(m) */
  const SP = [
    { n: "토끼풀", c: "#6fa86a", N: 450, k: 6, sd: 0.75, r: 0.09 },
    { n: "질경이", c: "#2f6b3a", N: 110, k: 0, sd: 0, r: 0.12 },
    { n: "민들레", c: "#e0b021", N: 55, k: 0, sd: 0, r: 0.10 },
    { n: "바랭이", c: "#a7b85a", N: 380, k: 4, sd: 0.55, r: 0.07 },
    { n: "쑥", c: "#5f8f8c", N: 40, k: 3, sd: 0.5, r: 0.28 },
  ];
  const NS = SP.length;
  let seed = 7, plants = [], bins = [], truth = null, reveal = false, last = null;

  function rng(s) { return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function grow() {
    const R = rng(seed * 9973 + 11);
    const g = () => { let u = 0, v = 0; while (!u) u = R(); v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    plants = [];
    SP.forEach((s, i) => {
      const cen = Array.from({ length: s.k }, () => [0.8 + R() * (FW - 1.6), 0.8 + R() * (FH - 1.6)]);
      for (let j = 0; j < s.N; j++) {
        let x, y;
        do {
          if (s.k) { const c = cen[Math.floor(R() * s.k)]; x = c[0] + g() * s.sd; y = c[1] + g() * s.sd; }
          else { x = R() * FW; y = R() * FH; }
        } while (x < 0 || y < 0 || x >= FW || y >= FH);
        plants.push({ x, y, s: i, ph: R() * 6.28 });
      }
    });
    bins = Array.from({ length: FW * FH }, () => []);
    plants.forEach((p) => bins[Math.floor(p.y) * FW + Math.floor(p.x)].push(p));
    truth = computeTruth(R);
  }
  /* 한 점 (x, y)를 덮는 종들 (비트) */
  function coverAt(x, y) {
    let m = 0;
    const cx = Math.floor(x), cy = Math.floor(y);
    for (let j = cy - 1; j <= cy + 1; j++) for (let i = cx - 1; i <= cx + 1; i++) {
      if (i < 0 || j < 0 || i >= FW || j >= FH) continue;
      for (const p of bins[j * FW + i]) { const r = SP[p.s].r; if ((p.x - x) ** 2 + (p.y - y) ** 2 < r * r) m |= 1 << p.s; }
    }
    return m;
  }
  /* 방형구 (x, y)~(x+1, y+1) 안의 개체 수와 실제 피도(%) */
  function inspect(x, y, countOnly) {
    const cnt = new Array(NS).fill(0), cov = new Array(NS).fill(0), G = 20;
    for (let j = Math.floor(y); j <= Math.floor(y + 1) && j < FH; j++) for (let i = Math.floor(x); i <= Math.floor(x + 1) && i < FW; i++)
      for (const p of bins[j * FW + i]) if (p.x >= x && p.x < x + 1 && p.y >= y && p.y < y + 1) cnt[p.s]++;
    if (countOnly) return { cnt, cov };
    for (let a = 0; a < G; a++) for (let b = 0; b < G; b++) { const m = coverAt(x + (a + 0.5) / G, y + (b + 0.5) / G); for (let s = 0; s < NS; s++) if (m & (1 << s)) cov[s]++; }
    return { cnt, cov: cov.map((c) => (c / (G * G)) * 100) };
  }
  function computeTruth(R) {
    const dens = SP.map((s) => s.N / AREA), cov = new Array(NS).fill(0), fr = new Array(NS).fill(0);
    const G = 0.05; let n = 0;
    for (let y = G / 2; y < FH; y += G) for (let x = G / 2; x < FW; x += G) { const m = coverAt(x, y); n++; for (let s = 0; s < NS; s++) if (m & (1 << s)) cov[s]++; }
    const M = 1500;
    for (let k = 0; k < M; k++) { const q = inspect(R() * (FW - 1), R() * (FH - 1), true); q.cnt.forEach((c, s) => { if (c) fr[s]++; }); }
    return derive(dens, fr.map((f) => f / M), cov.map((c) => (c / n) * 100));
  }
  /* 밀도·빈도·피도 → 상대값과 중요치 */
  function derive(D, Fq, Cv) {
    const sum = (a) => a.reduce((t, v) => t + v, 0) || 1;
    const sD = sum(D), sF = sum(Fq), sC = sum(Cv);
    const rD = D.map((v) => (v / sD) * 100), rF = Fq.map((v) => (v / sF) * 100), rC = Cv.map((v) => (v / sC) * 100);
    const iv = rD.map((v, i) => v + rF[i] + rC[i]);
    const top = iv.indexOf(Math.max(...iv));
    return { D, Fq, Cv, rD, rF, rC, iv, top };
  }
  function estimate(qs) {
    const n = qs.length; if (!n) return null;
    const D = SP.map((_, s) => qs.reduce((t, q) => t + q.cnt[s], 0) / n);
    const Fq = SP.map((_, s) => qs.filter((q) => q.cnt[s] > 0).length / n);
    const Cv = SP.map((_, s) => qs.reduce((t, q) => t + q.est[s], 0) / n);
    return derive(D, Fq, Cv);
  }

  const cols = [{ key: "pos", label: "위치 (m)" }].concat(SP.map((s, i) => ({ key: "s" + i, label: `${s.n}<br><span class="dim">개체·피도</span>` })));
  const tbl = L.table($(".tbl-host"), cols, () => update());
  const quads = () => tbl.rows.map((r) => r.q);
  function throwAt(x, y) {
    x = clamp(x, 0, FW - 1); y = clamp(y, 0, FH - 1);
    const t = inspect(x, y);
    /* 피도는 눈으로 5% 단위로 어림 (어림 오차 ±4%쯤). 있는데 5% 미만이면 1%로 적는다 */
    const est = t.cov.map((c, s) => { if (!t.cnt[s] && c < 0.5) return 0; const v = clamp(L.measure(c, { sd: 4, res: 5 }), 0, 100); return v || (c > 0 ? 1 : 0); });
    const q = { x, y, cnt: t.cnt, est };
    const row = { q, pos: `${x.toFixed(1)}, ${y.toFixed(1)}` };
    SP.forEach((_, s) => { row["s" + s] = `${t.cnt[s]}·${est[s]}%`; });
    last = q; tbl.add(row);
  }
  const R2 = rng(12345);
  function throwRandom(k) { for (let i = 0; i < k; i++) throwAt(Math.random() * (FW - 1), Math.random() * (FH - 1)); }

  const P1 = fit(cvF, () => drawField());
  const P2 = fit(cvP, () => drawPlot());
  let geo = null;
  function drawField() {
    const { ctx, size: { w, h } } = P1; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const m = 6, s = Math.min((h - 2 * m) / FH, (w * 0.74 - m) / FW), fx = m, fy = m;
    geo = { fx, fy, s };
    const X = (x) => fx + x * s, Y = (y) => fy + y * s;
    ctx.fillStyle = "#e9e4cf"; ctx.fillRect(fx, fy, FW * s, FH * s);
    for (const p of plants) { const sp = SP[p.s]; ctx.fillStyle = sp.c; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), Math.max(1.3, sp.r * s), 0, 6.283); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.strokeRect(fx + 0.5, fy + 0.5, FW * s - 1, FH * s - 1);
    quads().forEach((q) => { ctx.strokeStyle = q === last ? C.warn : "rgba(255,255,255,.95)"; ctx.lineWidth = q === last ? 2 : 1.4; ctx.strokeRect(X(q.x), Y(q.y), s, s); });
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillStyle = "rgba(251,251,248,.85)"; ctx.fillRect(fx + 1, fy + FH * s - 17, 66, 16);
    ctx.fillStyle = C.ink2; ctx.fillText("12 m × 9 m", fx + 5, fy + FH * s - 5);
    /* 오른쪽: 마지막 방형구 확대 + 범례 */
    const ix = fx + FW * s + 12, iw = Math.min(w - ix - 6, 110);
    if (iw < 60) return;
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.fillText(last ? "마지막 방형구 (1 m²)" : "방형구 1 m × 1 m", ix, fy + 10);
    const zy = fy + 18, zs = iw;
    ctx.fillStyle = "#e9e4cf"; ctx.fillRect(ix, zy, zs, zs);
    if (last) {
      ctx.save(); ctx.beginPath(); ctx.rect(ix, zy, zs, zs); ctx.clip();
      for (const p of plants) {
        if (p.x < last.x - 0.4 || p.x > last.x + 1.4 || p.y < last.y - 0.4 || p.y > last.y + 1.4) continue;
        const sp = SP[p.s]; ctx.fillStyle = sp.c; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.arc(ix + (p.x - last.x) * zs, zy + (p.y - last.y) * zs, sp.r * zs, 0, 6.283); ctx.fill();
        const inside = p.x >= last.x && p.x < last.x + 1 && p.y >= last.y && p.y < last.y + 1;
        if (inside) { ctx.globalAlpha = 1; ctx.fillStyle = C.ink; ctx.fillRect(ix + (p.x - last.x) * zs - 1, zy + (p.y - last.y) * zs - 1, 2, 2); }
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5; ctx.strokeRect(ix + 0.5, zy + 0.5, zs - 1, zs - 1);
    let ly = zy + zs + 16;
    ctx.font = `11px ${F.sans}`;
    SP.forEach((sp, i) => {
      if (ly > h - 2) return;
      ctx.fillStyle = sp.c; ctx.beginPath(); ctx.arc(ix + 5, ly - 4, 4.5, 0, 6.283); ctx.fill();
      ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(sp.n, ix + 14, ly);
      if (last) { ctx.textAlign = "right"; ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(`${last.cnt[i]}·${last.est[i]}%`, ix + iw, ly); ctx.font = `11px ${F.sans}`; }
      ly += Math.min(17, (h - zy - zs - 16) / NS);
    });
    ctx.textAlign = "left";
  }
  const hist = () => { const qs = quads(), out = []; for (let k = 1; k <= qs.length; k++) out.push(estimate(qs.slice(0, k))); return out; };
  function drawPlot() {
    const { ctx, size: { w, h } } = P2; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const H = hist(), n = H.length;
    const x0 = 40, y0 = 34, pw = w - x0 - 64, ph = h - y0 - 36;
    const nmax = Math.max(10, Math.ceil(n / 10) * 10);
    let ymax = 150; H.forEach((e) => e.iv.forEach((v) => { if (v > ymax) ymax = Math.ceil(v / 50) * 50; }));
    const X = (k) => x0 + (k / nmax) * pw, Y = (v) => y0 + ph - (v / ymax) * ph;
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: L.ticks(0, nmax, 5).map((v) => [v, String(v)]), yt: L.ticks(0, ymax, 3).map((v) => [v, String(v)]), xlabel: "던진 방형구 수", ylabel: "중요치 추정값" });
    ctx.font = `600 11.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText(reveal ? "방형구가 늘수록 추정값은 참값(점선)에 가까워질까?" : "방형구를 던질 때마다 다시 계산한 중요치", x0, 14);
    const lab = [];
    SP.forEach((sp, s) => {
      if (reveal) { ctx.setLineDash([4, 4]); ctx.strokeStyle = sp.c; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, Y(truth.iv[s])); ctx.lineTo(x0 + pw, Y(truth.iv[s])); ctx.stroke(); ctx.setLineDash([]); }
      if (!n) return;
      ctx.strokeStyle = sp.c; ctx.lineWidth = 2; ctx.beginPath();
      H.forEach((e, k) => { const px = X(k + 1), py = Y(e.iv[s]); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
      ctx.stroke();
      if (n === 1) { ctx.fillStyle = sp.c; ctx.beginPath(); ctx.arc(X(1), Y(H[0].iv[s]), 3, 0, 6.283); ctx.fill(); }
      lab.push({ y: Y(H[n - 1].iv[s]), s });
    });
    if (!n && reveal) SP.forEach((sp, s) => lab.push({ y: Y(truth.iv[s]), s }));
    lab.sort((a, b) => a.y - b.y);
    for (let i = 1; i < lab.length; i++) if (lab[i].y - lab[i - 1].y < 12) lab[i].y = lab[i - 1].y + 12;
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    lab.forEach((l) => { ctx.fillStyle = SP[l.s].c; ctx.fillText(SP[l.s].n, x0 + pw + 6, l.y + 4); });
    if (!n) { ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.fillText("초원을 눌러 방형구를 놓거나, 무작위로 던져 보세요", x0 + pw / 2, y0 + ph / 2); }
  }
  const f1 = (v) => (v >= 10 ? v.toFixed(0) : v.toFixed(1));
  function summary() {
    const e = estimate(quads()), host = $(".sum-host");
    const t = truth;
    const cell = (a, b, d) => `<td>${a == null ? "—" : d(a)}${reveal ? `<br><span class="dim">${d(b)}</span>` : ""}</td>`;
    host.innerHTML = `<table><thead><tr><th>종</th><th>밀도<br>/m²</th><th>빈도</th><th>피도<br>%</th><th>상대<br>밀도</th><th>상대<br>빈도</th><th>상대<br>피도</th><th>중요치</th></tr></thead><tbody>${SP.map((sp, s) =>
      `<tr${e && e.top === s ? ' class="qd-best"' : ""}><td>${sp.n}</td>${cell(e && e.D[s], t.D[s], f1)}${cell(e && e.Fq[s], t.Fq[s], (v) => v.toFixed(2))}${cell(e && e.Cv[s], t.Cv[s], f1)}${cell(e && e.rD[s], t.rD[s], f1)}${cell(e && e.rF[s], t.rF[s], f1)}${cell(e && e.rC[s], t.rC[s], f1)}${cell(e && e.iv[s], t.iv[s], f1)}</tr>`).join("")}</tbody></table>`;
    return e;
  }
  function update() {
    const qs = quads();
    if (last && !qs.includes(last)) last = qs[qs.length - 1] || null;
    const e = summary();
    $(".n-q").textContent = `${qs.length}개 (${qs.length} m²)`;
    $(".n-top").textContent = e ? `${SP[e.top].n} (${e.iv[e.top].toFixed(0)})` : "—";
    const err = e ? e.iv.reduce((t, v, s) => t + Math.abs(v - truth.iv[s]), 0) / NS : null;
    $(".n-err").textContent = !reveal ? "참값 보기 전" : e ? `±${err.toFixed(0)}` : "—";
    const v = $(".verdict");
    if (reveal && e) {
      const ok = e.top === truth.top;
      v.textContent = ok ? `추정한 우점종(${SP[e.top].n})이 참 우점종과 같습니다. 방형구 ${qs.length}개로 순위는 맞혔지만, 중요치 값은 평균 ${err.toFixed(0)}만큼 어긋나 있습니다.` : `추정한 우점종은 ${SP[e.top].n}이지만 참 우점종은 ${SP[truth.top].n}입니다. 방형구가 덩이로 모여 사는 종의 무리에 몰렸거나 피해 갔을 수 있습니다. 더 던져 보세요.`;
      v.className = "verdict small " + (ok ? "good" : "bad");
    } else if (reveal) { v.textContent = `참 우점종은 ${SP[truth.top].n}(중요치 ${truth.iv[truth.top].toFixed(0)})입니다.`; v.className = "verdict small"; }
    else { v.textContent = ""; v.className = "verdict small"; }
    $(".reveal").setAttribute("aria-pressed", String(reveal));
    drawField(); drawPlot();
  }
  cvF.addEventListener("click", (ev) => {
    if (!geo) return;
    const r = cvF.getBoundingClientRect(), x = (ev.clientX - r.left - geo.fx) / geo.s, y = (ev.clientY - r.top - geo.fy) / geo.s;
    if (x < 0 || y < 0 || x > FW || y > FH) return;
    throwAt(x - 0.5, y - 0.5);
  });
  root.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => throwRandom(+b.dataset.n)));
  $(".clear").addEventListener("click", () => { last = null; tbl.clear(); });
  $(".reveal").addEventListener("click", () => { reveal = !reveal; update(); });
  $(".newf").addEventListener("click", () => { seed = 1 + Math.floor(R2() * 1e6); last = null; reveal = false; grow(); tbl.clear(); });
  grow();
  update();
  if (L.demo) { throwRandom(20); reveal = true; update(); }
})();
