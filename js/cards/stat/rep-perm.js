/* 카드: 같은 것을 여러 번 골라도 되면 경우의 수는 어떻게 될까? — r자리 칸, 단계마다 n갈래 수형도, nΠr = n^r */
(() => {
  const root = document.getElementById("card-stat-rep-perm");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sn = $(".n"), sr = $(".r"), cv = $("canvas");
  const MAXDOT = 81;
  let d = [0, 0, 0, 0];
  const { ctx, size } = fit(cv, () => draw());
  const geo = () => {
    const { w, h } = size, r = +sr.value, x0 = 46, gw = w - x0 - 12, bw = Math.min(46, gw / r - 8);
    return { w, h, r, x0, gw, bw, sx: (j) => x0 + gw / 2 + (j - (r - 1) / 2) * (bw + 8), top: 10, bh: 40 };
  };

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const n = +sn.value, { r, x0, gw, bw, sx, top, bh } = geo();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let j = 0; j < r; j++) {
      const x = sx(j) - bw / 2;
      ctx.fillStyle = C.card; ctx.fillRect(x, top, bw, bh);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 2; ctx.strokeRect(x, top, bw, bh);
      ctx.fillStyle = C.ink; ctx.font = `600 20px ${F.mono}`; ctx.fillText(d[j] + 1, sx(j), top + bh / 2 + 1);
      ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.fillText(`${j + 1}째 자리`, sx(j), top + bh + 11);
    }
    const ty = top + bh + 30, rowH = (h - ty - 10) / r;
    const posX = (k, i) => x0 + (i + 0.5) / n ** k * gw;
    const posY = (k) => ty + k * rowH;
    let pathIdx = 0;
    for (let k = 0; k <= r; k++) {
      const cnt = n ** k, y = posY(k), drawn = cnt <= MAXDOT;
      ctx.textAlign = "right"; ctx.fillStyle = k === r ? C.warn : C.ink2; ctx.font = `${k === r ? 600 : 400} 10.5px ${F.mono}`;
      ctx.fillText(cnt, x0 - 8, y);
      if (k > 0) pathIdx = pathIdx * n + d[k - 1];
      if (!drawn) {
        ctx.textAlign = "center"; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`;
        ctx.fillText(`${n ** (k - 1)}개의 점이 각각 ${n}갈래 → ${cnt}개`, x0 + gw / 2, y);
        continue;
      }
      if (k > 0 && n ** (k - 1) <= MAXDOT) {
        ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath();
        for (let i = 0; i < cnt; i++) { ctx.moveTo(posX(k - 1, Math.floor(i / n)), posY(k - 1)); ctx.lineTo(posX(k, i), y); }
        ctx.stroke();
        ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5; ctx.beginPath();
        ctx.moveTo(posX(k - 1, Math.floor(pathIdx / n)), posY(k - 1)); ctx.lineTo(posX(k, pathIdx), y); ctx.stroke();
      }
      const rad = cnt > 27 ? 1.8 : cnt > 9 ? 2.8 : 4;
      for (let i = 0; i < cnt; i++) {
        ctx.fillStyle = i === pathIdx ? C.warn : C.leaf;
        ctx.beginPath(); ctx.arc(posX(k, i), y, i === pathIdx ? rad + 1.5 : rad, 0, 7); ctx.fill();
      }
      if (k > 0 && cnt <= 9) {
        ctx.textAlign = "center"; ctx.font = `10px ${F.mono}`;
        for (let i = 0; i < cnt; i++) { ctx.fillStyle = i === pathIdx ? C.warn : C.ink3; ctx.fillText(i % n + 1, posX(k, i), y + 12); }
      }
    }
  }

  function update() {
    const n = +sn.value, r = +sr.value;
    d = Array.from({ length: r }, (_, j) => Math.min(d[j] || 0, n - 1));
    $(".n-out").textContent = n; $(".r-out").textContent = r;
    let P = 1; for (let i = 0; i < r; i++) P *= n - i;
    $(".d-pi").innerHTML = `<sub>${n}</sub>Π<sub>${r}</sub> = ${n}<sup>${r}</sup>`;
    $(".n-pi").textContent = n ** r;
    $(".d-p").innerHTML = `<sub>${n}</sub>P<sub>${r}</sub> (중복 없이)`;
    $(".n-p").textContent = r > n ? "0 (r > n이면 불가능)" : P;
    const k = d.reduce((a, v) => a * n + v, 0) + 1;
    $(".n-k").textContent = `${d.map((v) => v + 1).join("")} → ${k}번째 / ${n ** r}`;
    draw();
  }
  $(".go-next").addEventListener("click", () => {
    const n = +sn.value;
    for (let j = d.length - 1; j >= 0; j--) { d[j] = (d[j] + 1) % n; if (d[j] !== 0) break; }
    update();
  });
  $(".go-reset").addEventListener("click", () => { d = d.map(() => 0); update(); });
  cv.addEventListener("click", (e) => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top, { r, bw, sx, top, bh } = geo();
    if (y < top || y > top + bh) return;
    for (let j = 0; j < r; j++) if (Math.abs(x - sx(j)) <= bw / 2) { d[j] = (d[j] + 1) % +sn.value; update(); return; }
  });
  [sn, sr].forEach((s) => s.addEventListener("input", update));
  update();
})();
