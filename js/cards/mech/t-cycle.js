/* 카드: 한 바퀴 돌 때 열기관은 얼마만큼 일을 할까? — 네모 순환(정적·정압)의 P–V 넓이, 열효율, 카르노 한계 */
(() => {
  const root = document.getElementById("card-mech-cycle");
  if (!root) return;
  const { C, F, fit, loop } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sP = $(".p"), sV = $(".v"), oP = $(".p-out"), oV = $(".v-out");
  const nW = $(".n-w"), nQin = $(".n-qin"), nE = $(".n-e"), nC = $(".n-c");
  const R = 8.314, P1 = 1e5, V1 = 0.0249;
  let ph = 0;
  function solve() {
    const P2 = P1 * +sP.value, V2 = V1 * +sV.value;
    const W = (P2 - P1) * (V2 - V1);
    const Qab = 1.5 * V1 * (P2 - P1), Qbc = 2.5 * P2 * (V2 - V1);
    const Qin = Qab + Qbc, Tmin = P1 * V1 / R, Tmax = P2 * V2 / R;
    return { P2, V2, W, Qin, e: W / Qin, carnot: 1 - Tmin / Tmax, Tmin, Tmax };
  }
  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = solve(), gx = 56, gy = h - 34, gw = w - gx - 130, gh = h - 60;
    const X = (V) => gx + V / 0.105 * gw, Y = (P) => gy - P / 5.5e5 * gh;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right"; [0, 100, 200, 300, 400, 500].forEach((p) => ctx.fillText(`${p}`, gx - 5, Y(p * 1000) + 3));
    ctx.textAlign = "center"; [0, 20, 40, 60, 80, 100].forEach((v) => ctx.fillText(`${v}`, X(v / 1000), gy + 13));
    ctx.fillText("부피 (L)", gx + gw / 2, gy + 26); ctx.textAlign = "left"; ctx.fillText("압력 (kPa)", gx + 4, gy - gh + 2);
    const A = [V1, P1], B = [V1, s.P2], Cc = [s.V2, s.P2], D = [s.V2, P1];
    ctx.fillStyle = "rgba(59,124,42,.2)"; ctx.fillRect(X(V1), Y(s.P2), X(s.V2) - X(V1), Y(P1) - Y(s.P2));
    const seg = (a, b, col, label, lx, ly) => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(a[0]), Y(a[1])); ctx.lineTo(X(b[0]), Y(b[1])); ctx.stroke(); ctx.fillStyle = col; ctx.font = `10.5px ${F.sans}`; ctx.fillText(label, lx, ly); };
    ctx.textAlign = "left";
    seg(A, B, "#b5532f", "열 받음", X(V1) - 50, (Y(P1) + Y(s.P2)) / 2);
    seg(B, Cc, "#b5532f", "열 받음 + 팽창", (X(V1) + X(s.V2)) / 2 - 36, Y(s.P2) - 7);
    seg(Cc, D, "#3f6fa3", "열 내보냄", X(s.V2) + 6, (Y(P1) + Y(s.P2)) / 2);
    seg(D, A, "#3f6fa3", "열 내보냄 + 압축", (X(V1) + X(s.V2)) / 2 - 40, Y(P1) + 16);
    [["A", A], ["B", B], ["C", Cc], ["D", D]].forEach(([n, p]) => { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3.5, 0, Math.PI * 2); ctx.fill(); ctx.font = `600 11px ${F.mono}`; ctx.fillText(n, X(p[0]) + (n === "A" || n === "B" ? -14 : 6), Y(p[1]) + (n === "A" || n === "D" ? 12 : -4)); });
    ctx.fillStyle = "#3b7c2a"; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(`넓이 = 일 ${s.W.toFixed(0)} J`, (X(V1) + X(s.V2)) / 2, (Y(P1) + Y(s.P2)) / 2 + 4);
    // 도는 점
    const per = [[A, B], [B, Cc], [Cc, D], [D, A]], k = Math.floor(ph % 4), f = ph % 1, [p, q] = per[k];
    const cx = X(p[0] + (q[0] - p[0]) * f), cy = Y(p[1] + (q[1] - p[1]) * f);
    ctx.fillStyle = "#e0a02a"; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    // 오른쪽: 에너지 흐름
    const ex = w - 118, ey = 30, ew = 100;
    ctx.textAlign = "center"; ctx.font = `600 11px ${F.sans}`;
    ctx.fillStyle = "#b5532f"; ctx.fillRect(ex, ey, ew, 22); ctx.fillStyle = "#fff"; ctx.fillText(`고온 ${s.Tmax.toFixed(0)} K`, ex + ew / 2, ey + 15);
    ctx.fillStyle = "#3f6fa3"; ctx.fillRect(ex, h - 52, ew, 22); ctx.fillStyle = "#fff"; ctx.fillText(`저온 ${s.Tmin.toFixed(0)} K`, ex + ew / 2, h - 37);
    const mid = (ey + 22 + h - 52) / 2, thick = (v) => Math.max(2, v / s.Qin * 34);
    ctx.fillStyle = "rgba(181,83,47,.7)"; ctx.fillRect(ex + ew / 2 - thick(s.Qin) / 2, ey + 22, thick(s.Qin), mid - ey - 22);
    ctx.fillStyle = "rgba(63,111,163,.7)"; ctx.fillRect(ex + ew / 2 - thick(s.Qin - s.W) / 2, mid, thick(s.Qin - s.W), h - 52 - mid);
    ctx.fillStyle = "rgba(59,124,42,.8)"; ctx.fillRect(ex + ew / 2, mid - thick(s.W) / 2, ew / 2 + 6, thick(s.W));
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(ex + ew / 2, mid, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = `600 10px ${F.sans}`; ctx.fillText("기관", ex + ew / 2, mid + 4);
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.fillText("일", ex + ew + 2, mid - thick(s.W) / 2 - 4);
  }
  function update() {
    oP.textContent = (+sP.value).toFixed(1); oV.textContent = (+sV.value).toFixed(1);
    const s = solve();
    nW.textContent = `${s.W.toFixed(0)} J`; nQin.textContent = `${s.Qin.toFixed(0)} J`;
    nE.textContent = `${(s.e * 100).toFixed(1)} %`; nC.textContent = `${(s.carnot * 100).toFixed(1)} %`;
    draw();
  }
  [sP, sV].forEach((el) => el.addEventListener("input", update));
  loop(cv, (dt) => { ph += dt * 0.6; draw(); });
  update();
})();
