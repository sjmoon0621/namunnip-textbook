/* 카드: 밀물과 썰물은 왜 하루에 두 번일까? — 평형 조석: 달·태양 기조력, 적위, 위도, 위상 */
(() => {
  const root = document.getElementById("card-esys-tide");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), oP = $(".p-out"), sD = $(".d"), oD = $(".d-out"), sM = $(".m"), oM = $(".m-out"), oMN = $(".m-name"), nN = $(".n-n"), nR = $(".n-r"), nI = $(".n-i");
  const rad = Math.PI / 180, SUN = 0.46;
  // 한 천체의 평형 조석: cos²Z − 1/3, Z = 천정 거리
  const bulge = (phi, dec, H) => { const c = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H); return c * c - 1 / 3; };
  function eta(t) { // t: 시간(h), 달이 관측 지점 자오선에 있을 때 t = 0
    const phi = +sP.value * rad, dm = +sD.value * rad, age = +sM.value;
    const Hm = 2 * Math.PI * t / 24.84, Hs = 2 * Math.PI * t / 24 + 2 * Math.PI * age / 29.53;
    return bulge(phi, dm, Hm) + SUN * bulge(phi, 0, Hs);
  }
  const name = (a) => a < 1.5 || a > 28 ? "삭" : a < 6 ? "초승" : a < 9 ? "상현" : a < 13.3 ? "차는 달" : a < 16.3 ? "망" : a < 20.6 ? "기우는 달" : a < 23.6 ? "하현" : "그믐";
  let stats = {};
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const phi = +sP.value * rad, dm = +sD.value * rad;
    // 왼쪽: 옆에서 본 지구와 부푼 바다 (달 방향 = 오른쪽, 적위만큼 기울어짐)
    const cx = w * 0.19, cy = h * 0.5, R = Math.min(w * 0.1, h * 0.3);
    ctx.save(); ctx.translate(cx, cy);
    ctx.fillStyle = "rgba(110,164,230,.45)"; ctx.beginPath();
    for (let a = 0; a <= 360; a += 3) { const th = a * rad, r = R * (1 + 0.32 * (Math.cos(th + dm) ** 2 - 1 / 3)); ctx.lineTo(r * Math.cos(th), -r * Math.sin(th)); }
    ctx.fill();
    ctx.fillStyle = "#8fb47f"; ctx.beginPath(); ctx.arc(0, 0, R * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(-R * 1.25, 0); ctx.lineTo(R * 1.25, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -R * 1.25); ctx.lineTo(0, R * 1.25); ctx.stroke(); ctx.setLineDash([]);
    // 관측 지점이 도는 위도선 (옆에서 보면 수평선분)
    const yl = -R * 0.9 * Math.sin(phi), xl = R * 0.9 * Math.cos(phi);
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-xl, yl); ctx.lineTo(xl, yl); ctx.stroke();
    ctx.fillStyle = C.warn; ctx.beginPath(); ctx.arc(xl, yl, 4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-xl, yl, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("북극", 0, -R * 1.3); ctx.fillText("적도", -R * 1.45, -4);
    ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText("관측 지점이 하루 동안 도는 위도선", -R * 1.2, R * 1.45);
    ctx.restore();
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; const ax = cx + R * 1.3, ay = cy; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 30 * Math.cos(dm), ay - 30 * Math.sin(dm)); ctx.stroke();
    ctx.fillStyle = "#bdbdbd"; ctx.beginPath(); ctx.arc(ax + 38 * Math.cos(dm), ay - 38 * Math.sin(dm), 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText("달 쪽", ax + 38 * Math.cos(dm), ay - 38 * Math.sin(dm) - 12);
    // 오른쪽: 이틀 조석 곡선
    const gx0 = w * 0.52, gx1 = w - 12, gy0 = h - 30, gy1 = 24, mid = (gy0 + gy1) / 2, X = (t) => gx0 + t / 50 * (gx1 - gx0), Y = (v) => mid - v / 1.5 * (gy0 - gy1) / 2;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, mid); ctx.lineTo(gx1, mid); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; [0, 12, 24, 36, 48].forEach((t) => ctx.fillText(`${t} h`, X(t), gy0 + 13));
    ctx.save(); ctx.translate(gx0 - 10, mid); ctx.rotate(-Math.PI / 2); ctx.fillText("해수면 높이 (상대)", 0, 0); ctx.restore();
    const pts = []; for (let i = -10; i <= 510; i++) { const t = i / 10; pts.push([t, eta(t)]); }
    ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 2.2; ctx.beginPath(); pts.filter(([t]) => t >= 0 && t <= 50).forEach(([t, v], i) => (i ? ctx.lineTo(X(t), Y(v)) : ctx.moveTo(X(t), Y(v)))); ctx.stroke();
    // 만조·간조 찾기
    const hi = [], lo = []; for (let i = 1; i < pts.length - 1; i++) { if (pts[i][1] > pts[i - 1][1] && pts[i][1] >= pts[i + 1][1]) hi.push(pts[i]); if (pts[i][1] < pts[i - 1][1] && pts[i][1] <= pts[i + 1][1]) lo.push(pts[i]); }
    // 아주 작은 봉우리(인접한 간조보다 0.08 미만 높은 것)는 만조로 치지 않는다
    const prom = ([t, v]) => { const L = lo.filter(([u]) => u < t).pop(), Rr = lo.find(([u]) => u > t); return v - Math.max(L ? L[1] : -9, Rr ? Rr[1] : -9) > 0.08; };
    for (let i = hi.length - 1; i >= 0; i--) if (!prom(hi[i])) hi.splice(i, 1);
    const inR = ([t]) => t >= 0 && t <= 50;
    ctx.fillStyle = C.warn; hi.filter(inR).forEach(([t, v]) => { ctx.beginPath(); ctx.arc(X(t), Y(v), 3.5, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = "#3f6fa3"; lo.filter(inR).forEach(([t, v]) => { ctx.beginPath(); ctx.arc(X(t), Y(v), 3, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.warn; ctx.fillText("● 만조", gx0 + 6, gy1 - 8); ctx.fillStyle = "#3f6fa3"; ctx.fillText("● 간조", gx0 + 52, gy1 - 8);
    const vals = pts.map((p) => p[1]); let diff = 0; for (let i = 1; i < hi.length; i++) diff = Math.max(diff, Math.abs(hi[i][1] - hi[i - 1][1]));
    stats = { n: hi.filter(([t]) => t >= 0 && t < 48).length / 2, range: Math.max(...vals) - Math.min(...vals), diff };
  }
  function update() {
    oP.textContent = sP.value; oD.textContent = sD.value; oM.textContent = sM.value; oMN.textContent = name(+sM.value);
    draw();
    const ref = 1.46; // 적도, 적위 0, 사리일 때 조차
    nN.textContent = `하루 ${stats.n % 1 ? stats.n.toFixed(1) : stats.n}번`; nR.textContent = `${(stats.range / ref).toFixed(2)} (적도·사리 = 1)`;
    nI.textContent = stats.diff < 0.03 ? "거의 없음" : `${(stats.diff / ref).toFixed(2)} — 일조 부등`;
  }
  [sP, sD, sM].forEach((s) => s.addEventListener("input", update)); update();
})();
