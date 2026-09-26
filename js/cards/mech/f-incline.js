/* 카드: 빗면 위의 상자는 어느 쪽으로 움직일까? — 빗면 위 상자(m1)와 도르래에 매단 추(m2), 마찰 μ. 힘을 빗면 방향·수직 방향 성분으로 나눠 더한다 */
(() => {
  const root = document.getElementById("card-mech-incline");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sTh = $(".th"), sMu = $(".mu"), sM1 = $(".m1"), sM2 = $(".m2"), comp = $(".comp");
  const oTh = $(".th-out"), oMu = $(".mu-out"), oM1 = $(".m1-out"), oM2 = $(".m2-out");
  const nState = $(".n-state"), nA = $(".n-a"), nT = $(".n-t");
  const g = 9.8;
  const COL = { g: "#5d5d61", n: "#3f6fa3", f: "#b5532f", t: "#3b7c2a", net: "#8a4fb0" };

  function solve() {
    const th = +sTh.value * Math.PI / 180, mu = +sMu.value, m1 = +sM1.value, m2 = +sM2.value;
    const N = m1 * g * Math.cos(th), fmax = mu * N;
    const drive = m2 * g - m1 * g * Math.sin(th);   // +: 상자를 빗면 위로 끄는 쪽
    let a = 0, dir = 0, f, T;
    if (Math.abs(drive) <= fmax + 1e-9) { f = -drive; T = m2 * g; }           // 정지: 마찰이 필요한 만큼만
    else { dir = Math.sign(drive); f = -dir * fmax; a = (Math.abs(drive) - fmax) / (m1 + m2); T = m2 * (g - dir * a); }
    return { th, mu, m1, m2, N, f, T, a, dir, fmax, drive };
  }

  function arrow(ctx, x, y, dx, dy, col, label, lw = 2.6) {
    const L = Math.hypot(dx, dy); if (L < 2) return;
    const ux = dx / L, uy = dy / L, h = Math.min(10, L * 0.4);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx - ux * h * 0.8, y + dy - uy * h * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + dx, y + dy); ctx.lineTo(x + dx - ux * h - uy * h * 0.5, y + dy - uy * h + ux * h * 0.5); ctx.lineTo(x + dx - ux * h + uy * h * 0.5, y + dy - uy * h - ux * h * 0.5); ctx.closePath(); ctx.fill();
    if (label) { ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(label, x + dx + ux * 13, y + dy + uy * 13 + 4); }
  }

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const s = solve();
    // 빗면: 왼쪽 아래 → 오른쪽 위, 꼭대기에 도르래
    const base = h * 0.9, x0 = w * 0.04, x1 = w * 0.76;
    const run = x1 - x0, rise = Math.min(Math.tan(s.th) * run, h * 0.62), topY = base - rise;
    const th = Math.atan2(rise, run);   // 화면에 그리는 각(높이 제한 때문에 60°에서 조금 눌림)
    ctx.fillStyle = "#ebece5"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0, base); ctx.lineTo(x1, base); ctx.lineTo(x1, topY); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `12px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText(`${sTh.value}°`, x0 + 38, base - 6);
    const k = Math.min(3, h * 0.22 / Math.max(1, s.m1 * g));   // 1 N = k px
    // 도르래와 추
    const px = x1 + 10, py = topY - 10;
    ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.strokeStyle = C.ink; ctx.stroke();
    const hangY = Math.min(base - 30, py + 60 + 30 * (s.dir > 0 ? 1 : s.dir < 0 ? -0.5 : 0));
    // 상자: 빗면의 60% 지점
    const ux = Math.cos(th), uy = -Math.sin(th);   // 빗면 위쪽 방향 (화면 좌표)
    const nx = -uy, ny = ux;                      // 빗면에서 바깥(위)쪽 법선 → 화면에선 (sin, -cos)을 쓰자
    const onx = Math.sin(th), ony = -Math.cos(th);
    const bw = 64, bh = 42, t = 0.5;
    const cx = x0 + run * t + onx * bh / 2, cy = base - rise * t + ony * bh / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-th);
    ctx.fillStyle = "#e6d3b3"; ctx.strokeStyle = C.ink; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
    ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("m₁", 0, 4);
    ctx.restore();
    // 줄
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2;
    const rx = cx + ux * bw / 2, ry = cy + uy * bw / 2;
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(px - 10 * onx, py - 10 * ony); ctx.stroke();
    if (s.m2 > 0) {
      ctx.beginPath(); ctx.moveTo(px + 10, py); ctx.lineTo(px + 10, hangY); ctx.stroke();
      const sz = 16 + 3 * Math.sqrt(s.m2);
      ctx.fillStyle = "#c9ccd4"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.fillRect(px + 10 - sz / 2, hangY, sz, sz); ctx.strokeRect(px + 10 - sz / 2, hangY, sz, sz);
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("m₂", px + 10, hangY + sz / 2 + 4);
      arrow(ctx, px + 10, hangY + sz + 2, 0, Math.min(base - hangY - sz + 20, s.m2 * g * k * 0.5), COL.g, "m₂g", 2);
      if (s.dir !== 0) { ctx.fillStyle = COL.net; ctx.font = `12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(s.dir > 0 ? "↓ 내려감" : "↑ 올라감", px + 30, hangY + 14); }
    }
    // 힘 화살표 (상자 중심에서)
    const mg = s.m1 * g * k;
    arrow(ctx, cx, cy, 0, mg, COL.g, "m₁g");
    if (comp.checked) {
      ctx.setLineDash([4, 4]);
      arrow(ctx, cx, cy, -ux * mg * Math.sin(s.th), -uy * mg * Math.sin(s.th), "rgba(93,93,97,.8)", "", 1.6);
      arrow(ctx, cx, cy, -onx * mg * Math.cos(s.th), -ony * mg * Math.cos(s.th), "rgba(93,93,97,.8)", "", 1.6);
      ctx.setLineDash([]);
    }
    arrow(ctx, cx, cy, onx * s.N * k, ony * s.N * k, COL.n, "N");
    if (s.T > 0.01 && s.m2 > 0) arrow(ctx, rx, ry, ux * s.T * k, uy * s.T * k, COL.t, "T");
    if (Math.abs(s.f) > 0.05) arrow(ctx, cx - onx * bh / 2, cy - ony * bh / 2, ux * s.f * k, uy * s.f * k, COL.f, "f");
    // 범례
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    [["중력", COL.g], ["수직항력", COL.n], ["마찰력", COL.f], ["장력", COL.t]].forEach(([n, c], i) => { ctx.fillStyle = c; ctx.fillRect(10 + i * 70, 12, 10, 3); ctx.fillStyle = C.ink2; ctx.fillText(n, 24 + i * 70, 17); });
    // 빗면 방향 힘의 합 막대
    const bx = 10, by = 34, bwid = Math.min(w - 20, 300);
    const up = s.m2 * g, down = s.m1 * g * Math.sin(s.th), net = (s.m1 + s.m2) * s.a * s.dir;
    ctx.fillStyle = C.ink3; ctx.fillText(`빗면 방향 — 위로: 장력 쪽 ${up.toFixed(1)} N, 아래로: m₁g sinθ ${down.toFixed(1)} N`, bx, by + 4);
    ctx.fillText(`마찰력 ${Math.abs(s.f).toFixed(1)} N → 알짜힘 ${Math.abs(net).toFixed(1)} N`, bx, by + 20);
  }

  function update() {
    oTh.textContent = sTh.value; oMu.textContent = (+sMu.value).toFixed(2); oM1.textContent = (+sM1.value).toFixed(1); oM2.textContent = (+sM2.value).toFixed(1);
    const s = solve();
    nState.textContent = s.dir > 0 ? "빗면을 올라감" : s.dir < 0 ? "빗면을 내려감" : "정지";
    nState.classList.toggle("bad", s.dir < 0);
    nA.textContent = `${s.a.toFixed(2)} m/s²`;
    nT.textContent = s.m2 > 0 ? `${s.T.toFixed(1)} N` : "—";
    draw();
  }
  [sTh, sMu, sM1, sM2].forEach((el) => el.addEventListener("input", update));
  comp.addEventListener("change", update);
  update();
})();
