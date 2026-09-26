/* 카드: 일식과 월식은 왜 매달 일어나지 않을까? — 달 궤도의 기울기와 식이 일어나는 철 */
(() => {
  const root = document.getElementById("card-earth-eclipse");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sN = $(".node"), oN = $(".node-out"), tilt = $(".tilt"), sD = $(".day"), oD = $(".day-out");
  const nSol = $(".sol"), nLun = $(".lun"), nBeta = $(".beta"), msg = $(".ec-msg");
  const YEAR = 365.25, SYN = 29.53, SID = 27.32, D2R = Math.PI / 180;
  const SOL_LIM = 1.5, LUN_LIM = 1.0;   // 식이 일어나는 달의 황위 한계 (대략, 도)

  // 1월 1일 = 0일. 태양의 황경은 춘분(약 79일)에 0°. 첫 삭은 5일로 둔다.
  const sunLon = (t) => (360 * (t - 79) / YEAR) % 360;
  const T0 = 5;
  const moonLon = (t) => sunLon(T0) + 360 * (t - T0) / SID;
  const beta = (t, inc, node) => Math.asin(Math.sin(inc * D2R) * Math.sin((moonLon(t) - node) * D2R)) / D2R;

  const { ctx, size } = fit(cv, () => draw());

  function events(inc, node) {
    const ev = [];
    for (let k = 0; k < 13; k++) {
      const tn = T0 + k * SYN, tf = tn + SYN / 2;
      if (tn <= YEAR) ev.push({ t: tn, kind: "new", b: beta(tn, inc, node) });
      if (tf <= YEAR) ev.push({ t: tf, kind: "full", b: beta(tf, inc, node) });
    }
    ev.forEach((e) => { e.ecl = Math.abs(e.b) < (e.kind === "new" ? SOL_LIM : LUN_LIM); });
    return ev;
  }

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const inc = tilt.checked ? 5.1 : 0, node = +sN.value, day = +sD.value;
    const x0 = 40, y0 = 22, pw = w - x0 - 10, ph = h * 0.58 - y0;
    const X = (t) => x0 + t / YEAR * pw, Y = (b) => y0 + ph / 2 - b / 6.5 * (ph / 2);
    NM.axes(ctx, { x0, y0, w: pw, h: ph, X, Y, xt: [[0, "1월"], [91, "4월"], [182, "7월"], [274, "10월"], [365, "12월 말"]], yt: [[-5, "−5°"], [0, "0°"], [5, "5°"]], ylabel: "달의 황위 (황도에서 벗어난 각)" });
    // 식이 일어날 수 있는 띠
    ctx.fillStyle = "rgba(224,160,42,.18)"; ctx.fillRect(x0, Y(SOL_LIM), pw, Y(-SOL_LIM) - Y(SOL_LIM));
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = "#9a6d12"; ctx.textAlign = "right"; ctx.fillText("삭이 이 띠 안 → 일식", x0 + pw - 4, Y(SOL_LIM) - 3);
    // 달의 황위 곡선
    ctx.beginPath(); for (let t = 0; t <= YEAR; t += 0.5) { const y = Y(beta(t, inc, node)); t ? ctx.lineTo(X(t), y) : ctx.moveTo(X(t), y); }
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1; ctx.stroke();
    // 삭(●)과 망(○)
    for (const e of events(inc, node)) {
      const x = X(e.t), y = Y(e.b);
      ctx.beginPath(); ctx.arc(x, y, e.ecl ? 6 : 4, 0, Math.PI * 2);
      if (e.kind === "new") { ctx.fillStyle = e.ecl ? C.warn : C.ink; ctx.fill(); }
      else { ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = e.ecl ? C.warn : C.ink; ctx.lineWidth = e.ecl ? 2.2 : 1.2; ctx.stroke(); }
    }
    // 선택한 날
    ctx.strokeStyle = C.forest; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(X(day), y0); ctx.lineTo(X(day), y0 + ph); ctx.stroke(); ctx.setLineDash([]);

    // 아래: 그날의 옆모습 (기울기 과장)
    const sy = h * 0.58 + 52, sh = h - sy - 8, cx = x0 + pw * 0.5;
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("그날의 옆모습 (크기·거리·기울기는 과장)", x0, sy - 12);
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, sy + sh / 2); ctx.lineTo(x0 + pw, sy + sh / 2); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.textAlign = "right"; ctx.fillText("황도면", x0 + pw, sy + sh / 2 - 4); ctx.textAlign = "left";
    const sunX = x0 + 24, earthX = cx, R = Math.min(pw * 0.28, 140);
    ctx.fillStyle = "#e0a02a"; ctx.beginPath(); ctx.arc(sunX, sy + sh / 2, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3f7fc4"; ctx.beginPath(); ctx.arc(earthX, sy + sh / 2, 8, 0, Math.PI * 2); ctx.fill();
    // 달: 태양 방향을 기준으로 한 이각
    const elong = ((moonLon(day) - sunLon(day)) % 360 + 360) % 360;
    const b = beta(day, inc, node);
    const mx = earthX - R * Math.cos(elong * D2R), my = sy + sh / 2 - b / 6.5 * (sh / 2 - 6);
    ctx.fillStyle = "#c9c9c2"; ctx.beginPath(); ctx.arc(mx, my, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(earthX, sy + sh / 2); ctx.lineTo(mx, my); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.textAlign = "center";
    const phase = elong < 12 || elong > 348 ? "삭 근처" : Math.abs(elong - 180) < 12 ? "망 근처" : elong < 180 ? "초승~상현 쪽" : "하현~그믐 쪽";
    ctx.fillText(`달: ${phase}`, mx, my - 10);
    ctx.textAlign = "left";
  }

  const DATE = (t) => { const d = new Date(2026, 0, 1 + Math.round(t)); return `${d.getMonth() + 1}월 ${d.getDate()}일`; };
  function update() {
    const inc = tilt.checked ? 5.1 : 0, node = +sN.value, day = +sD.value;
    oN.textContent = node; oD.textContent = DATE(day);
    const ev = events(inc, node);
    const sol = ev.filter((e) => e.kind === "new" && e.ecl), lun = ev.filter((e) => e.kind === "full" && e.ecl);
    nSol.textContent = `${sol.length}번`; nLun.textContent = `${lun.length}번`;
    nBeta.textContent = `${beta(day, inc, node).toFixed(1)}°`;
    msg.textContent = inc === 0 ? "달의 궤도가 황도면과 같다면, 삭마다 일식이, 망마다 월식이 일어납니다."
      : `식은 1년에 두 번 돌아오는 ‘식의 철’에 몰립니다: ${[...sol, ...lun].sort((a, b) => a.t - b.t).map((e) => `${DATE(e.t)} ${e.kind === "new" ? "일식" : "월식"}`).join(", ") || "이 설정에서는 없음"}.`;
    draw();
  }
  [sN, sD].forEach((el) => el.addEventListener("input", update)); tilt.addEventListener("change", update);
  update();
})();
