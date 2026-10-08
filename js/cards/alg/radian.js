/* 카드: 각을 길이로 잴 수 있을까? — 부채꼴의 호 길이 l과 반지름 r의 비 l/r이 반지름과 관계없이 중심각만으로 정해짐을 본다 */
(() => {
  const root = document.getElementById("card-alg-radian");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const sr = $(".r"), st = $(".t");
  const { ctx, size } = fit($("canvas"), () => draw());
  const n = (v, d = 2) => { const r = Math.round(v * 10 ** d) / 10 ** d; return String(r); };
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  function piStr(deg) {
    if (deg % 15) return null;
    let p = deg / 15, q = 12; const g = gcd(p, q) || 1; p /= g; q /= g;
    if (p === 0) return "0";
    return `${p === 1 ? "" : p}π${q === 1 ? "" : "/" + q}`;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = +sr.value, deg = +st.value, th = deg * Math.PI / 180;
    const cx = h * 0.5 + 4, cy = h / 2, u = h * 0.42 / 3;
    ctx.lineWidth = 1; ctx.strokeStyle = C.rule;
    [1, 2, 3].forEach((k) => { ctx.beginPath(); ctx.arc(cx, cy, k * u, 0, 7); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(cx - 3 * u - 4, cy); ctx.lineTo(cx + 3 * u + 4, cy); ctx.stroke();
    ctx.strokeStyle = C.sprout; ctx.lineWidth = 2;
    [1, 2, 3].forEach((k) => { if (Math.abs(k - r) > 1e-9 && th > 0) { ctx.beginPath(); ctx.arc(cx, cy, k * u, 0, -th, true); ctx.stroke(); } });
    const rp = r * u;
    if (th > 0) {
      ctx.globalAlpha = 0.35; ctx.fillStyle = C.sprout;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, rp, 0, -th, true); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, rp, 0, 7); ctx.stroke();
    ctx.strokeStyle = C.forest; ctx.lineWidth = 3.5;
    if (th > 0) { ctx.beginPath(); ctx.arc(cx, cy, rp, 0, -th, true); ctx.stroke(); }
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx + rp, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx + rp * Math.cos(th), cy - rp * Math.sin(th)); ctx.stroke();
    // 호 위에 반지름 길이마다(1라디안마다) 눈금
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = C.forest;
    for (let k = 1; k <= th + 1e-9; k++) {
      const c = Math.cos(k), s = Math.sin(k);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(cx + (rp - 6) * c, cy - (rp - 6) * s); ctx.lineTo(cx + (rp + 6) * c, cy - (rp + 6) * s); ctx.stroke();
      ctx.fillText(String(k), cx + (rp + 14) * c, cy - (rp + 14) * s);
    }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, 7); ctx.fill();

    const x1 = cx + 3 * u + 26, x2 = w - 14, av = x2 - x1, l = r * th;
    const sA = av / (2 * Math.PI * 3), sB = av / (2 * Math.PI);
    const bar = (y, len, col, label) => {
      ctx.font = `11px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(label, x1, y - 10);
      ctx.fillStyle = C.rule; ctx.fillRect(x1, y - 3, av, 6);
      ctx.fillStyle = col; ctx.fillRect(x1, y - 4, len, 8);
    };
    bar(h * 0.2, r * sA, C.warn, `반지름 r = ${n(r)}`);
    bar(h * 0.44, l * sA, C.forest, `호의 길이 l = ${n(l)}`);
    const y3 = h * 0.72;
    bar(y3, (l / r) * sB, C.ink, `l ÷ r (반지름 몇 개) = ${n(th, 3)}`);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
    for (let k = 0; k <= 6; k++) { const x = x1 + k * sB; ctx.beginPath(); ctx.moveTo(x, y3 + 5); ctx.lineTo(x, y3 + 9); ctx.stroke(); ctx.fillText(String(k), x, y3 + 11); }
    ctx.fillStyle = C.forest;
    [[Math.PI, "π"], [2 * Math.PI, "2π"]].forEach(([v, s]) => { const x = x1 + v * sB; ctx.fillRect(x - 0.5, y3 - 5, 1.5, 10); ctx.fillText(s, x, y3 + 23); });
  }

  function update() {
    const r = +sr.value, deg = +st.value, th = deg * Math.PI / 180, ps = piStr(deg);
    $(".r-out").textContent = n(r); $(".t-out").textContent = deg;
    $(".n-d").textContent = `${deg}°`;
    $(".n-rad").textContent = ps ? `${ps} ≈ ${n(th, 3)}` : `≈ ${n(th, 3)}`;
    $(".n-l").textContent = n(r * th);
    $(".n-s").textContent = n(r * r * th / 2);
    draw();
  }
  sr.addEventListener("input", update); st.addEventListener("input", update);
  update();
})();
