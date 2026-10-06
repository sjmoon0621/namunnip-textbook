/* 카드: 물을 많이 마시면 오줌은 왜 묽어질까? — ADH에 의한 삼투압 조절과 TRH→TSH→타이록신 음성 피드백 (교육용 모식 모형)
   삼투압 모드: 체수분 W(mL), 체내 용질 S(mOsm), 혈장 삼투압 P = S/W, ADH(pg/mL 어림), 오줌 생성량(mL/분), 오줌 농도(mOsm/kg)
   갑상샘 모드: 정상 = 1인 상대값의 정상 상태(평형) 계산 */
(() => {
  const root = document.getElementById("card-bio-hormone");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const ADHC = "#3f6f9f", URC = "#c99a1e", TSHC = "#7a55a8", T4C = "#c0602a";
  const demo = /[?&]demo\b/.test(location.search);
  let mode = "osm", act = "water", cas = "normal";

  /* ---------- 삼투압 조절 시뮬레이션 ---------- */
  const TMAX = 300, DT = 0.5, EV = 30;
  const W0 = 42000, P0 = 288, S0 = P0 * W0 / 1000, SX0 = 0.6;
  const adhSS = (P) => Math.max(0, 0.8 * (P - 285));
  const uosmOf = (A) => 50 + 1150 * A * A / (A * A + 6.25);
  const V0 = SX0 / uosmOf(adhSS(P0)) * 1000;
  function sim(a, di) {
    let W = W0, S = S0, A = di ? 0 : adhSS(P0), gw = 0, gs = 0;
    const out = [];
    for (let i = 0; i * DT <= TMAX + 1e-9; i++) {
      const t = i * DT;
      if (i === EV / DT) { if (a === "water") gw = 1000; if (a === "salt") gs = 200; }
      const aw = gw / 15, as = gs / 30;
      gw -= aw * DT; gs -= as * DT;
      const sweat = a === "sweat" && t >= EV && t < EV + 60 ? 20 : 0;
      const P = S / (W / 1000);
      const Ass = di ? 0 : adhSS(P);
      A += DT * (Ass - A) / 8;
      const Uo = uosmOf(A);
      const Sx = Math.max(0.2, SX0 + 0.004 * (S - S0));
      const V = Sx / Uo * 1000;
      W += DT * (aw + V0 - V - sweat);
      S += DT * (as + SX0 - Sx - sweat * 0.05);
      if (i % 2 === 0) out.push({ t, P, A, V, Uo });
    }
    return out;
  }

  /* ---------- 갑상샘 정상 상태 ---------- */
  const CASES = {
    normal: { k: 1, ab: 0, p: 1, grow: true },
    iodine: { k: 0.4, ab: 0, p: 1, grow: true },
    graves: { k: 1.6, ab: 8, p: 1, grow: true },
    hypo: { k: 0.15, ab: 0, p: 1, grow: false },
    pit: { k: 1, ab: 0, p: 0.2, grow: true },
  };
  function thyroid(c, dose) {
    const q = CASES[c];
    let T = 1, H = 1, S = 1, G = 1;
    for (let i = 0; i < 400; i++) {
      H = clamp(1 / T, 0.05, 20);
      S = clamp(q.p * H / T, 0.01, 40);
      const X = S + q.ab;
      G = q.k * 2 * X / (X + 1);
      T = 0.8 * T + 0.2 * Math.max(0.02, G + dose);
    }
    const X = S + q.ab;
    const vol = q.grow ? clamp(1 + 0.45 * (X - 1), 0.6, 3.2) : 0.7;
    return { H, S, T, G, vol, rate: Math.sqrt(T) };
  }

  let data = [], ref = [];
  const { ctx, size } = fit(cv, () => draw());
  const at = (t) => data[clamp(Math.round(t / (DT * 2)), 0, data.length - 1)];
  const hm = (t) => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, "0")}`;

  function box(cx, cy, bw, bh, lab, sub, col, fill) {
    ctx.fillStyle = fill || "#fff"; ctx.strokeStyle = col || C.ink2; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 6); ctx.fill(); ctx.stroke();
    ctx.textAlign = "center"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`;
    ctx.fillText(lab, cx, sub ? cy - 3 : cy + 4);
    if (sub) { ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(sub, cx, cy + 12); }
  }
  function arrow(pts, k, col, lab, lpos, dash, inhib) {
    const lw = 1 + 5 * clamp(k, 0, 1);
    ctx.save();
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.globalAlpha = 0.25 + 0.75 * clamp(k, 0.05, 1);
    ctx.setLineDash(dash ? [5, 4] : []);
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke(); ctx.setLineDash([]);
    const [xa, ya] = pts[pts.length - 2], [xb, yb] = pts[pts.length - 1], an = Math.atan2(yb - ya, xb - xa);
    ctx.translate(xb, yb); ctx.rotate(an);
    if (inhib) { ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, 7); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(-8, -4 - lw / 2); ctx.lineTo(-8, 4 + lw / 2); ctx.fill(); }
    ctx.restore();
    if (lab) { ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = col; ctx.textAlign = lpos[2] || "center"; ctx.fillText(lab, lpos[0], lpos[1]); }
  }

  function drawOsm(w, h) {
    const t = +$(".tcur").value, d = at(t);
    const sh = Math.round(h * 0.37);
    ctx.fillStyle = "#f6f1e4"; ctx.fillRect(2, 2, w - 4, sh - 6);
    const bw = Math.min(136, w * 0.25), bh = 42;
    const cx = [w * 0.17, w * 0.5, w * 0.83], y1 = sh * 0.24, y2 = sh * 0.7;
    box(cx[0], y1, bw, bh, "혈장 삼투압", `${d.P.toFixed(1)} mOsm/kg`, d.P > 290 ? C.warn : d.P < 284 ? ADHC : C.ink2);
    box(cx[1], y1, bw, bh, "시상 하부", "감지·ADH 합성");
    box(cx[2], y1, bw, bh, "뇌하수체 후엽", "ADH 분비");
    box(cx[2], y2, bw, bh, "콩팥 집합관", `물 재흡수 ${d.A > 2 ? "많음" : d.A > 0.8 ? "보통" : "적음"}`);
    // 오줌 컵
    const ux = cx[1] + 22, uy = y2, cw = 34, chh = 40;
    const conc = clamp((d.Uo - 50) / 1100, 0, 1);
    const lev = clamp(d.V / 14, 0.06, 1);
    ctx.fillStyle = `rgb(${Math.round(250 - 20 * conc)},${Math.round(246 - 70 * conc)},${Math.round(225 - 175 * conc)})`;
    ctx.fillRect(ux - cw / 2, uy + chh / 2 - chh * lev, cw, chh * lev);
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(ux - cw / 2, uy - chh / 2); ctx.lineTo(ux - cw / 2, uy + chh / 2); ctx.lineTo(ux + cw / 2, uy + chh / 2); ctx.lineTo(ux + cw / 2, uy - chh / 2); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.fillText("오줌", ux - cw / 2 - 8, uy - 10);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(`${d.V.toFixed(1)} mL/분`, ux - cw / 2 - 8, uy + 4); ctx.fillText(`${Math.round(d.Uo)} mOsm/kg`, ux - cw / 2 - 8, uy + 17);
    // 화살표
    const sens = clamp((d.P - 280) / 14, 0, 1);
    arrow([[cx[0] + bw / 2, y1], [cx[1] - bw / 2 - 2, y1]], sens, C.ink2, "감지", [(cx[0] + cx[1]) / 2, y1 - 9]);
    arrow([[cx[1] + bw / 2, y1], [cx[2] - bw / 2 - 2, y1]], d.A / 6, ADHC, "전달", [(cx[1] + cx[2]) / 2, y1 - 9]);
    arrow([[cx[2], y1 + bh / 2], [cx[2], y2 - bh / 2 - 2]], d.A / 6, ADHC, "ADH (혈액)", [cx[2] - 8, (y1 + y2) / 2 + 4, "right"]);
    arrow([[cx[2] - bw / 2, y2], [ux + cw / 2 + 4, y2]], d.V / 10, URC, "", null);
    arrow([[cx[2] - bw / 2 + 10, y2 + bh / 2], [cx[2] - bw / 2 + 10, sh - 12], [cx[0], sh - 12], [cx[0], y1 + bh / 2 + 2]], d.A / 5, C.forest, "재흡수된 물 → 혈액 (삼투압 ↓)", [cx[0] + 8, sh - 18, "left"], true);
    const evLab = { water: "물 1 L", sweat: "땀 1.2 L", salt: "소금 6 g", none: "" }[act];
    if (evLab) { ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.fillText(`30분: ${evLab}`, cx[0] + 8, y1 + bh / 2 + 18); }
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText(hm(t), w - 10, 14);

    // 그래프 세 칸
    const gx = 44, gw = w - gx - 12, top = sh + 24, gap = 34, gh = (h - top - 30 - gap * 2) / 3;
    const X = (tt) => gx + tt / TMAX * gw;
    const panel = (k, y0, lo, hi, ticks, lab, col, key, band) => {
      const Y = (v) => y0 + (1 - (clamp(v, lo, hi) - lo) / (hi - lo)) * gh;
      NM.axes(ctx, { x0: gx, y0, w: gw, h: gh, X, Y, xt: [], yt: ticks.map((v) => [v, String(v)]), ylabel: lab });
      if (band) { ctx.fillStyle = "rgba(116,171,102,.14)"; ctx.fillRect(gx, Y(band[1]), gw, Y(band[0]) - Y(band[1])); }
      if (act !== "none") { ctx.fillStyle = "rgba(181,83,47,.07)"; const e1 = act === "sweat" ? EV + 60 : EV + 2; ctx.fillRect(X(EV), y0, Math.max(2, X(e1) - X(EV)), gh); }
      const line = (dd, c, lw, dash) => { ctx.setLineDash(dash || []); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); dd.forEach((p, i) => (i ? ctx.lineTo(X(p.t), Y(p[key])) : ctx.moveTo(X(p.t), Y(p[key])))); ctx.stroke(); ctx.setLineDash([]); };
      if ($(".di").checked) line(ref, C.ink3, 1.2, [5, 4]);
      line(data, col, 2.2);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(t), Y(d[key]), 4, 0, Math.PI * 2); ctx.fill();
    };
    panel(0, top, 270, 315, [270, 285, 300, 315], "혈장 삼투압 (mOsm/kg)", C.ink, "P", [282, 295]);
    panel(1, top + gh + gap, 0, 10, [0, 5, 10], "ADH (pg/mL, 어림)", ADHC, "A");
    panel(2, top + (gh + gap) * 2, 0, 14, [0, 7, 14], "오줌 생성량 (mL/분)", URC, "V");
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
    const yb = top + gh * 3 + gap * 2;
    for (let m = 0; m <= TMAX; m += 60) ctx.fillText(`${m / 60}`, X(m), yb + 13);
    ctx.textAlign = "right"; ctx.fillText("시각 (시간)", gx + gw, yb + 26);
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Math.round(X(t)) + 0.5, top); ctx.lineTo(Math.round(X(t)) + 0.5, yb); ctx.stroke();

    $(".v0").textContent = `${d.P.toFixed(1)}`; $(".v0").className = "v0" + (d.P > 295 || d.P < 280 ? " bad" : "");
    $(".v1").textContent = `${d.A.toFixed(1)} pg/mL`;
    $(".v2").textContent = `${d.V.toFixed(1)} mL/분`;
    $(".v3").textContent = `${Math.round(d.Uo)} mOsm`;
    const di = $(".di").checked;
    $(".msg").textContent = di ? "ADH가 나오지 않으면 집합관이 물을 거의 거두지 못해, 무엇을 하든 묽은 오줌이 많이 나옵니다. 혈장 삼투압이 계속 올라가도 고리가 끊겨 되돌리지 못합니다. 실제 환자는 심한 갈증으로 물을 많이 마셔 버팁니다."
      : act === "water" ? "물이 흡수되면 혈장 삼투압이 내려가고 ADH가 줄어 집합관이 물을 덜 거둡니다. 그래서 30분~1시간 뒤부터 묽은 오줌이 많이 나오고, 여분의 물이 빠지면서 삼투압과 ADH가 제자리로 돌아옵니다."
      : act === "sweat" ? "땀으로 물을 잃으면(땀은 혈장보다 묽음) 혈장 삼투압이 오르고 ADH가 늘어 오줌이 적고 진해집니다. 잃은 물은 오줌을 줄여 아낄 뿐 채우지는 못하므로, 물을 마셔야 완전히 돌아옵니다."
      : act === "salt" ? "소금이 흡수되면 용질이 늘어 혈장 삼투압이 오르고 ADH가 늘어 오줌이 진해집니다. 남는 소금은 진한 오줌으로 천천히 빠져나갑니다. 짠 음식을 먹으면 목이 마른 것도 같은 감지에서 시작됩니다."
      : "아무것도 하지 않으면 들어오는 물과 나가는 물이 균형을 이루어 혈장 삼투압과 ADH, 오줌 생성량이 거의 일정합니다.";
  }

  function drawThy(w, h) {
    const dose = +$(".dose").value, r = thyroid(cas, dose), q = CASES[cas];
    const sh = Math.round(h * 0.56);
    ctx.fillStyle = "#f6f1e4"; ctx.fillRect(2, 2, w - 4, sh - 6);
    const bw = Math.min(150, w * 0.3), bh = 40, cx = w * 0.3;
    const y1 = sh * 0.13, y2 = sh * 0.43, y3 = sh * 0.78;
    box(cx, y1, bw, bh, "시상 하부", "TRH 분비");
    box(cx, y2, bw, bh, "뇌하수체 전엽", "TSH 분비", cas === "pit" ? C.warn : C.ink2);
    // 갑상샘 (나비 모양, 크기 = vol)
    const s = 13 * Math.sqrt(r.vol);
    ctx.fillStyle = cas === "hypo" ? "#d9b9a8" : "#e7a08a"; ctx.strokeStyle = "#a5553c"; ctx.lineWidth = 1.4;
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + sg * s * 1.05, y3, s, s * 1.5, sg * 0.25, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.fillRect(cx - s * 0.5, y3 - 4, s, 8);
    ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText("갑상샘", cx - s * 2.3 - 6, y3 + 2);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.fillText(`크기 ×${r.vol.toFixed(1)}`, cx - s * 2.3 - 6, y3 + 16);
    if (cas === "iodine" || cas === "hypo" || cas === "graves") {
      ctx.fillStyle = C.warn; ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
      ctx.fillText(cas === "iodine" ? "아이오딘 부족" : cas === "hypo" ? "갑상샘 세포 손상" : "TSH 수용체 자극 항체", cx - s * 2.3 - 6, y3 - 16);
    }
    if (cas === "graves") {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 1.5;
      for (const [ax, ay] of [[cx - s * 2.1, y3 + s * 0.9], [cx + s * 2.2, y3 - s * 0.9], [cx + s * 2.0, y3 + s * 1.1]]) { ctx.beginPath(); ctx.moveTo(ax, ay + 6); ctx.lineTo(ax, ay); ctx.lineTo(ax - 4, ay - 5); ctx.moveTo(ax, ay); ctx.lineTo(ax + 4, ay - 5); ctx.stroke(); }
    }
    // 온몸 세포
    const bx = w * 0.8;
    box(bx, y3, Math.min(130, w * 0.26), bh + 6, "온몸의 세포", `물질대사 ×${r.rate.toFixed(2)}`, r.rate > 1.25 ? C.warn : r.rate < 0.8 ? ADHC : C.ink2);
    const lk = (v) => clamp(Math.log2(v * 2) / 3, 0, 1);
    arrow([[cx, y1 + bh / 2], [cx, y2 - bh / 2 - 2]], lk(r.H), C.ink2, `TRH ×${r.H.toFixed(1)}`, [cx + 10, (y1 + y2) / 2 + 4, "left"]);
    arrow([[cx, y2 + bh / 2], [cx, y3 - s * 1.5 - 4]], lk(r.S), TSHC, `TSH ×${r.S.toFixed(1)}`, [cx + 10, (y2 + y3) / 2 - 2, "left"]);
    const bx0 = bx - Math.min(130, w * 0.26) / 2;
    arrow([[cx + s * 2.2, y3], [bx0 - 2, y3]], lk(r.T), T4C, `타이록신 ×${r.T.toFixed(1)}`, [(cx + s * 2.2 + bx0) / 2, y3 - 10]);
    // 음성 피드백 (억제)
    const fx = w * 0.62;
    arrow([[fx, y3 - 6], [fx, y2], [cx + bw / 2 + 4, y2]], lk(r.T), T4C, "", null, true, true);
    arrow([[fx, y2], [fx, y1], [cx + bw / 2 + 4, y1]], lk(r.T), T4C, "억제 (음성 피드백)", [fx + 6, (y1 + y2) / 2 + 4, "left"], true, true);
    if (dose > 0) {
      ctx.fillStyle = "#fff"; ctx.strokeStyle = T4C; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.roundRect(fx - 26, y3 + 22, 52, 16, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = T4C; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(`약 ${dose.toFixed(2)}`, fx, y3 + 34);
      ctx.strokeStyle = T4C; ctx.beginPath(); ctx.moveTo(fx, y3 + 22); ctx.lineTo(fx, y3 + 6); ctx.stroke();
    }

    // 막대 (로그 눈금, 정상 = 1)
    const bars = [["TRH", r.H, C.ink2], ["TSH", r.S, TSHC], ["타이록신", r.T, T4C], ["갑상샘 크기", r.vol, "#a5553c"]];
    const lx = 86, gw = w - lx - 56, top = sh + 34, rowh = (h - top - 34) / bars.length;
    const L0 = Math.log(0.1), L1 = Math.log(20), Xv = (v) => lx + (Math.log(clamp(v, 0.1, 20)) - L0) / (L1 - L0) * gw;
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("정상 = 1 인 상대값 (로그 눈금)", lx, top - 16);
    ctx.fillStyle = "rgba(116,171,102,.16)"; ctx.fillRect(Xv(0.7), top - 6, Xv(1.4) - Xv(0.7), rowh * bars.length);
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.textAlign = "center";
    for (const v of [0.1, 0.3, 1, 3, 10, 20]) { const x = Math.round(Xv(v)) + 0.5; ctx.beginPath(); ctx.moveTo(x, top - 6); ctx.lineTo(x, top - 6 + rowh * bars.length); ctx.stroke(); ctx.fillStyle = C.ink3; ctx.fillText(`×${v}`, x, top + rowh * bars.length + 8); }
    bars.forEach(([lab, v, col], i) => {
      const y = top + i * rowh, bh2 = Math.min(18, rowh * 0.5);
      ctx.fillStyle = C.ink; ctx.font = `12px ${F.sans}`; ctx.textAlign = "right"; ctx.fillText(lab, lx - 8, y + bh2 / 2 + 4);
      const x1 = Xv(v), x0 = Xv(1);
      ctx.fillStyle = col; ctx.globalAlpha = 0.85; ctx.fillRect(Math.min(x0, x1), y, Math.max(2, Math.abs(x1 - x0)), bh2); ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink; ctx.fillRect(Math.round(x0), y - 3, 1.5, bh2 + 6);
      ctx.font = `11px ${F.mono}`; ctx.textAlign = "left"; ctx.fillStyle = col;
      ctx.fillText(`×${v < 10 ? v.toFixed(2) : v.toFixed(1)}`, Math.max(x0, x1) + 6, y + bh2 / 2 + 4);
    });

    const fmt = (v) => `×${v < 10 ? v.toFixed(2) : v.toFixed(1)}`;
    const cls = (v) => (v > 1.4 || v < 0.7 ? " bad" : "");
    $(".v0").textContent = fmt(r.H); $(".v0").className = "v0" + cls(r.H);
    $(".v1").textContent = fmt(r.S); $(".v1").className = "v1" + cls(r.S);
    $(".v2").textContent = fmt(r.T); $(".v2").className = "v2" + cls(r.T);
    $(".v3").textContent = fmt(r.vol); $(".v3").className = "v3" + (r.vol > 1.4 ? " bad" : "");
    const M = {
      normal: "타이록신이 정상이면 시상 하부와 뇌하수체 전엽이 적당히 억제되어 TRH·TSH도 정상 범위에 머뭅니다.",
      iodine: "아이오딘이 모자라면 갑상샘이 타이록신을 충분히 만들지 못합니다. 억제가 풀려 TRH·TSH가 늘고, TSH의 계속된 자극으로 갑상샘이 커집니다(갑상샘종).",
      graves: "TSH 수용체를 자극하는 항체가 TSH 대신 갑상샘을 계속 자극합니다. 타이록신이 많아져 TRH·TSH는 강하게 억제되지만, 항체는 피드백을 받지 않으므로 타이록신이 줄지 않습니다.",
      hypo: "갑상샘 세포가 손상되면 TSH가 아무리 늘어도 타이록신을 만들지 못합니다. TSH가 매우 높은 것은 뇌하수체가 고장 나서가 아니라 피드백이 정상으로 작동한 결과입니다.",
      pit: "뇌하수체 전엽이 TSH를 충분히 내지 못하면 갑상샘은 멀쩡해도 자극을 받지 못해 타이록신이 줄어듭니다. 이때는 TSH와 타이록신이 함께 낮고, 억제가 풀린 TRH는 높습니다.",
    }[cas];
    $(".msg").textContent = M + (dose > 0 ? ` 약으로 타이록신을 보충하면 혈중 타이록신이 늘어 TRH·TSH가 억제됩니다${q.k < 0.5 ? ". 알맞은 양에서 TSH가 정상으로 돌아옵니다" : ". 이미 충분한데 더 먹으면 TSH가 정상보다 낮아집니다"}.` : "");
  }

  function draw() {
    const { w, h } = size;
    if (!w || !data.length) return;
    ctx.clearRect(0, 0, w, h);
    if (mode === "osm") drawOsm(w, h); else drawThy(w, h);
  }

  const DT0 = { osm: ["혈장 삼투압", "ADH", "오줌 생성량", "오줌 농도"], thy: ["TRH", "TSH", "타이록신", "갑상샘 크기"] };
  function update() {
    data = sim(act, $(".di").checked);
    ref = sim(act, false);
    $(".t-out").textContent = hm(+$(".tcur").value);
    $(".dose-out").textContent = (+$(".dose").value).toFixed(2);
    root.querySelectorAll(".grp").forEach((g) => { g.hidden = !g.classList.contains("grp-" + mode); });
    DT0[mode].forEach((s, i) => { $(".d" + i).textContent = s; });
    draw();
  }
  const press = (sel, attr, val) => root.querySelectorAll(sel).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[attr] === val)));
  root.addEventListener("click", (e) => {
    const m = e.target.closest("[data-m]"), a = e.target.closest("[data-a]"), c = e.target.closest("[data-c]");
    if (m) { mode = m.dataset.m; press("[data-m]", "m", mode); update(); }
    if (a) { act = a.dataset.a; press("[data-a]", "a", act); update(); }
    if (c) { cas = c.dataset.c; press("[data-c]", "c", cas); $(".dose").value = 0; update(); }
  });
  $(".di").addEventListener("change", update);
  $(".tcur").addEventListener("input", () => { $(".t-out").textContent = hm(+$(".tcur").value); draw(); });
  $(".dose").addEventListener("input", () => { $(".dose-out").textContent = (+$(".dose").value).toFixed(2); draw(); });
  if (demo) {
    if (/[?&]thy\b/.test(location.search)) { mode = "thy"; cas = "iodine"; press("[data-m]", "m", mode); press("[data-c]", "c", cas); }
    else { $(".tcur").value = 75; }
  }
  update();
})();
