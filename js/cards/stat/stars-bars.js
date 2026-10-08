/* 카드: 종류마다 몇 개씩 고를지는 몇 가지로 정할 수 있을까? — 공 r개 + 칸막이 n−1개 배열, nHr = n+r−1Cr */
(() => {
  const root = document.getElementById("card-stat-stars-bars");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sn = $(".n"), sr = $(".r");
  const NAMES = ["사과", "배", "감", "귤", "밤"], COLS = [C.apple, C.leaf, C.amber, C.warn, C.ink2];
  const Cn = (n, k) => { if (k < 0 || k > n) return 0; let v = 1; for (let i = 1; i <= k; i++) v = v * (n - k + i) / i; return Math.round(v); };
  let bars = [], dragJ = -1;
  const { ctx, size } = fit(cv, () => draw());
  const L = () => +sr.value + +sn.value - 1;
  const counts = () => {
    const n = +sn.value, out = [];
    for (let j = 0; j < n; j++) out.push((j === n - 1 ? L() : bars[j]) - (j === 0 ? 0 : bars[j - 1] + 1));
    return out;
  };
  const geo = () => {
    const { w } = size, len = L(), sw = Math.min(40, (w - 20) / len);
    return { sw, x0: (w - sw * len) / 2, y: 46 };
  };
  const rank = () => {
    const k = bars.length, len = L();
    let r = 0, prev = -1;
    bars.forEach((b, i) => { for (let s = prev + 1; s < b; s++) r += Cn(len - 1 - s, k - 1 - i); prev = b; });
    return r + 1;
  };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, len = L(), { sw, x0, y } = geo(), c = counts();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    let kind = 0;
    for (let s = 0; s < len; s++) {
      const cx = x0 + (s + 0.5) * sw;
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.strokeRect(x0 + s * sw + 1, y - 20, sw - 2, 40);
      const bj = bars.indexOf(s);
      if (bj >= 0) {
        ctx.fillStyle = bj === dragJ ? C.warn : C.ink; ctx.fillRect(cx - 3, y - 22, 6, 44);
        kind++;
      } else {
        ctx.fillStyle = COLS[kind]; ctx.beginPath(); ctx.arc(cx, y, Math.min(11, sw * 0.32), 0, 7); ctx.fill();
      }
      ctx.fillStyle = C.ink3; ctx.font = `9.5px ${F.mono}`; ctx.fillText(s + 1, cx, y + 30);
    }
    ctx.fillStyle = C.ink2; ctx.font = `11px ${F.sans}`;
    ctx.fillText(`자리 ${len}개 = 공 ${+sr.value}개 + 칸막이 ${n - 1}개`, w / 2, 12);
    const by = y + 52, bh = h - by - 26, bw = Math.min(70, (w - 20) / n), bx0 = (w - bw * n) / 2, R = Math.min(8, bh / 18);
    for (let j = 0; j < n; j++) {
      const bx = bx0 + j * bw;
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx + 6, by); ctx.lineTo(bx + 6, by + bh); ctx.lineTo(bx + bw - 6, by + bh); ctx.lineTo(bx + bw - 6, by); ctx.stroke();
      for (let k = 0; k < c[j]; k++) {
        const col = k % 2, row = Math.floor(k / 2);
        ctx.fillStyle = COLS[j]; ctx.beginPath(); ctx.arc(bx + bw / 2 + (col ? R + 1 : -R - 1), by + bh - R - 2 - row * (2 * R + 2), R, 0, 7); ctx.fill();
      }
      ctx.fillStyle = C.ink; ctx.font = `600 11.5px ${F.sans}`; ctx.fillText(`${NAMES[j]} ${c[j]}`, bx + bw / 2, by + bh + 13);
    }
  }

  function update() {
    const n = +sn.value, r = +sr.value;
    $(".n-out").textContent = n; $(".r-out").textContent = r;
    const c = counts();
    $(".msg").textContent = c.map((v, j) => `${NAMES[j]} ${v}개`).join(" · ");
    $(".d-h").innerHTML = `<sub>${n}</sub>H<sub>${r}</sub> = <sub>${n + r - 1}</sub>C<sub>${r}</sub>`;
    $(".n-h").textContent = Cn(n + r - 1, r);
    $(".n-k").textContent = `${rank()}번째 / ${Cn(n + r - 1, r)}`;
    $(".d-c").innerHTML = `<sub>${n}</sub>C<sub>${r}</sub> (종류마다 하나까지)`;
    $(".n-c").textContent = r > n ? "0 (r > n이면 불가능)" : Cn(n, r);
    $(".d-pi").innerHTML = `<sub>${n}</sub>Π<sub>${r}</sub> (고르는 순서도 구별)`;
    $(".n-pi").textContent = n ** r;
    draw();
  }
  function reset() {
    const n = +sn.value, r = +sr.value, base = Math.floor(r / n), extra = r % n;
    bars = []; let pos = -1;
    for (let j = 0; j < n - 1; j++) { pos += base + (j < extra ? 1 : 0) + 1; bars.push(pos); }
    update();
  }
  $(".go-first").addEventListener("click", () => { bars = bars.map((_, i) => i); update(); });
  $(".go-next").addEventListener("click", () => {
    const k = bars.length, len = L();
    let i = k - 1;
    while (i >= 0 && bars[i] === len - k + i) i--;
    if (i < 0) bars = bars.map((_, j) => j);
    else { bars[i]++; for (let j = i + 1; j < k; j++) bars[j] = bars[j - 1] + 1; }
    update();
  });
  const slotAt = (e) => { const b = cv.getBoundingClientRect(), { sw, x0 } = geo(); return Math.floor((e.clientX - b.left - x0) / sw); };
  cv.addEventListener("pointerdown", (e) => {
    const s = slotAt(e), b = cv.getBoundingClientRect(), y = e.clientY - b.top;
    if (y > geo().y + 30) return;
    let best = -1, bd = 1e9;
    bars.forEach((p, j) => { const d = Math.abs(p - s); if (d < bd) { bd = d; best = j; } });
    if (best < 0 || bd > 1) return;
    dragJ = best; cv.setPointerCapture(e.pointerId); draw();
  });
  cv.addEventListener("pointermove", (e) => {
    if (dragJ < 0) return;
    const lo = dragJ ? bars[dragJ - 1] + 1 : 0, hi = dragJ < bars.length - 1 ? bars[dragJ + 1] - 1 : L() - 1;
    const s = Math.max(lo, Math.min(hi, slotAt(e)));
    if (s !== bars[dragJ]) { bars[dragJ] = s; update(); }
  });
  cv.addEventListener("pointerup", () => { dragJ = -1; draw(); });
  [sn, sr].forEach((s) => s.addEventListener("input", reset));
  reset();
})();
