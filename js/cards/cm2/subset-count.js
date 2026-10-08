/* 카드: 원소가 하나 늘면 부분집합은 몇 개 늘까? — 원소마다 넣기/빼기를 정하며 2ⁿ개의 부분집합을 줄 단위로 본다 */
(() => {
  const root = document.getElementById("card-cm2-subset-count");
  if (!root) return;
  const { C, F, fit } = NM;
  const S = NMSets;
  const $ = (s) => root.querySelector(s), cv = $("canvas"), sn = $(".n");
  const st = [0, 0, 0, 0, 0];             // 0 자유, 1 반드시 넣기, 2 빼기
  let hits = [];
  const { ctx, size } = fit(cv, () => draw());
  const fits = (m, n) => { for (let i = 0; i < n; i++) { const on = m >> i & 1; if (st[i] === 1 && !on) return false; if (st[i] === 2 && on) return false; } return true; };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, N = 1 << n;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    hits = [];
    const gap = Math.min(64, (w - 40) / Math.max(n, 1));
    for (let i = 0; i < n; i++) {
      const x = w / 2 + (i - (n - 1) / 2) * gap, y = 26;
      hits.push({ x, y, i });
      ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = st[i] === 1 ? C.forest : C.card; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = st[i] === 2 ? C.warn : st[i] === 1 ? C.forest : C.ink3; ctx.stroke();
      ctx.font = `700 14px ${F.mono}`; ctx.fillStyle = st[i] === 1 ? C.card : st[i] === 2 ? C.warn : C.ink; ctx.fillText(String(i + 1), x, y);
      if (st[i] === 2) { ctx.strokeStyle = C.warn; ctx.beginPath(); ctx.moveTo(x - 12, y + 12); ctx.lineTo(x + 12, y - 12); ctx.stroke(); }
      ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.fillText(["자유", "넣기", "빼기"][st[i]], x, y + 27);
    }
    if (!n) { ctx.font = `12px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText("A = ∅ : 고를 원소가 없습니다", w / 2, 30); }
    const cols = N <= 4 ? N : N <= 16 ? 4 : 8, rows = Math.ceil(N / cols), top = 66, cw = (w - 16) / cols, rh = Math.min(52, (h - top - 4) / rows);
    const sq = Math.min(14, (cw - 14) / Math.max(n, 1) - 2), lab = rh >= 40;
    for (let m = 0; m < N; m++) {
      const c = m % cols, r = Math.floor(m / cols), ok = fits(m, n);
      const bx = 8 + c * cw + cw / 2, by = top + r * rh + (lab ? rh * 0.36 : rh / 2);
      ctx.globalAlpha = ok ? 1 : 0.22;
      if (!n) { ctx.font = `700 13px ${F.mono}`; ctx.fillStyle = C.forest; ctx.fillText("∅", bx, by); }
      const x0 = bx - (n * (sq + 2) - 2) / 2;
      for (let i = 0; i < n; i++) {
        const on = m >> i & 1, x = x0 + i * (sq + 2);
        ctx.fillStyle = on ? C.forest : C.card; ctx.fillRect(x, by - sq / 2, sq, sq);
        ctx.strokeStyle = on ? C.forest : C.ink3; ctx.lineWidth = 1; ctx.strokeRect(x + .5, by - sq / 2 + .5, sq - 1, sq - 1);
      }
      if (lab && n) {
        const a = []; for (let i = 0; i < n; i++) if (m >> i & 1) a.push(i + 1);
        ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = ok ? C.ink2 : C.ink3; ctx.fillText(S.fmt(a).replace(/, /g, ","), bx, by + sq / 2 + 11);
      }
      ctx.globalAlpha = 1;
    }
  }
  function update() {
    const n = +sn.value, N = 1 << n; $(".n-out").textContent = n;
    const free = Array.from({ length: n }, (_, i) => st[i]).filter((s) => s === 0).length;
    const ok = []; for (let m = 0; m < N; m++) if (fits(m, n)) { const a = []; for (let i = 0; i < n; i++) if (m >> i & 1) a.push(i + 1); ok.push(S.fmt(a)); }
    $(".eq").textContent = `조건에 맞는 부분집합: ${ok.join(", ")}`;
    $(".n-all").textContent = `2^${n} = ${N}`.replace(/\^(\d)/, (_, d) => "⁰¹²³⁴⁵"[d]);
    $(".n-ok").textContent = `2${"⁰¹²³⁴⁵"[free]} = ${ok.length}`;
    $(".n-pr").textContent = `${N} − 1 = ${N - 1}`;
    draw();
  }
  cv.addEventListener("pointerdown", (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = hits.find((p) => Math.hypot(p.x - x, p.y - y) < 20);
    if (hit) { st[hit.i] = (st[hit.i] + 1) % 3; update(); }
  });
  sn.addEventListener("input", () => { for (let i = +sn.value; i < 5; i++) st[i] = 0; update(); });
  update();
})();
