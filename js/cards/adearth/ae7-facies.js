/* 카드: 변성상과 지온 구배. 온도 0~1000 °C, 압력 0~1.6 GPa.
   Al2SiO5 삼중점 501 °C, 0.376 GPa(Holdaway 1971). 경계선 기울기와 변성상 경계는 모식(대략의 교과서 값). */
(() => {
  const root = document.getElementById("card-adearth-facies");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sZ = $(".z"), oZ = $(".z-out"), nPT = $(".n-pt"), nFa = $(".n-fa"), nRk = $(".n-rk"), pMin = $(".fc-min");
  const KMP = 0.0275; /* GPa/km */
  let rock = "b", grad = 25, free = null;

  /* 모식 변성상 경계 */
  const bsLine = (T) => 0.45 + 0.0016 * (T - 150);   /* 청색 편암상 아래 경계 */
  const ecLine = (T) => 1.15 + 0.0004 * (T - 450);   /* 에클로자이트상 아래 경계 */
  const solidus = (T) => { /* 물 포화 화강암 고상선: P(GPa)를 넘는 T인지 판단용 */
    const pts = [[0, 760], [0.1, 715], [0.2, 690], [0.4, 665], [0.6, 650], [0.8, 642], [1.2, 640], [1.6, 648]];
    return pts;
  };
  const SOL = solidus();
  const solT = (P) => { for (let i = 1; i < SOL.length; i++) if (P <= SOL[i][0]) { const [p0, t0] = SOL[i - 1], [p1, t1] = SOL[i]; return t0 + (t1 - t0) * (P - p0) / (p1 - p0); } return 648; };
  const TP = [501, 0.376];
  const kySil = (T) => TP[1] + 0.0020 * (T - TP[0]);
  const andSil = (T) => TP[1] - 0.0015 * (T - TP[0]);
  const kyAnd = (T) => TP[1] + 0.0011 * (T - TP[0]);
  function al2sio5(T, P) {
    if (T < TP[0]) return P > kyAnd(T) ? "남정석" : "홍주석";
    if (P > kySil(T)) return "남정석";
    if (P < andSil(T)) return "홍주석";
    return "규선석";
  }

  function facies(T, P) {
    if (T < 450 && T >= 150 && P >= bsLine(T)) return "bs";
    if (T >= 450 && P >= ecLine(T)) return "ec";
    if (T < 150) return "di";
    if (P < 0.2 && T >= 380) return "hf";
    if (T < 250) return "ze";
    if (T < 330) return "pp";
    if (T < 500) return "gs";
    if (T < 720) return "am";
    return "gr";
  }
  const FA = {
    di: ["속성 작용", "#efede4"], ze: ["불석상", "#e6dec6"], pp: ["포도석–펌펠리석상", "#dbe5c4"], gs: ["녹색 편암상", "#c3dcae"],
    am: ["각섬암상", "#e6cfa4"], gr: ["백립암상", "#e8b89c"], bs: ["청색 편암상", "#b9c9e6"], ec: ["에클로자이트상", "#d2b8d8"], hf: ["혼펠스상", "#f0d6c0"],
  };
  const BAS = {
    di: ["화산암 그대로", "원래 광물이 거의 그대로 남음"], ze: ["약하게 변성된 현무암", "불석, 녹니석"],
    pp: ["약하게 변성된 현무암", "포도석, 펌펠리석, 녹니석"], gs: ["녹색 편암", "녹니석, 녹렴석, 양기석, 조장석"],
    am: ["각섬암", "보통각섬석, 사장석 ± 석류석"], gr: ["고철질 백립암", "사방휘석, 단사휘석, 사장석 ± 석류석"],
    bs: ["청색 편암", "남섬석, 로소나이트, 녹렴석"], ec: ["에클로자이트", "석류석, 옴파사이트(Na 휘석)"], hf: ["혼펠스", "사장석, 휘석 또는 각섬석"],
  };
  function pelite(T, P, f) {
    const al = al2sio5(T, P), melt = T >= solT(P);
    if (f === "di") return ["셰일", "점토 광물, 석영", ""];
    if (f === "hf") return ["혼펠스", `${T > 550 ? "근청석, " : ""}${al === "홍주석" ? "홍주석" : al}, 흑운모`, al === "홍주석" || T > 550 ? "홍주석·근청석대(접촉 변성)" : ""];
    if (f === "bs") return ["청색 편암대의 편암", "백운모(펜자이트), 녹니석, 로소나이트", ""];
    if (f === "ec") return ["고압 편암·편마암", `석류석, ${al}, 펜자이트${P > 2.6 ? ", 코사이트" : ""}`, ""];
    let zone, mins;
    if (T < 400) { zone = "녹니석대"; mins = "녹니석, 백운모, 석영"; }
    else if (T < 450) { zone = "흑운모대"; mins = "흑운모, 녹니석, 백운모"; }
    else if (T < 550) { zone = "석류석대"; mins = "석류석, 흑운모, 백운모"; }
    else if (T < 600 && al !== "홍주석") { zone = "십자석대"; mins = "십자석, 석류석, 흑운모"; }
    else { zone = `${al}대`; mins = `${al}, 석류석, 흑운모${T > 650 ? ", 정장석" : ", 백운모"}`; }
    const name = melt ? "미그마타이트" : T < 330 ? "점판암" : T < 420 ? "천매암" : T < 620 ? "편암" : "편마암";
    return [name, mins + (melt ? " + 녹은 화강암질 액체" : ""), zone];
  }

  const { ctx, size } = fit(cv, () => draw());
  let G = null;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const x0 = 42, x1 = w - 40, y0 = 30, y1 = h - 34;
    const X = (T) => x0 + T / 1000 * (x1 - x0), Y = (P) => y0 + P / 1.6 * (y1 - y0);
    const iT = (px) => (px - x0) / (x1 - x0) * 1000, iP = (py) => (py - y0) / (y1 - y0) * 1.6;
    G = { X, Y, iT, iP, x0, x1, y0, y1 };
    /* 변성상 칠하기 */
    const cs = 2;
    for (let px = x0; px < x1; px += cs) for (let py = y0; py < y1; py += cs) {
      ctx.fillStyle = FA[facies(iT(px + cs / 2), iP(py + cs / 2))][1]; ctx.fillRect(px, py, cs, cs);
    }
    /* 용융 영역 빗금 */
    ctx.save(); ctx.beginPath(); ctx.moveTo(X(solT(0)), Y(0));
    for (let P = 0; P <= 1.6; P += 0.05) ctx.lineTo(X(solT(P)), Y(P));
    ctx.lineTo(X(1000), Y(1.6)); ctx.lineTo(X(1000), Y(0)); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = "rgba(181,83,47,.28)"; ctx.lineWidth = 1;
    for (let k = -h; k < w; k += 7) { ctx.beginPath(); ctx.moveTo(k, y1); ctx.lineTo(k + (y1 - y0), y0); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath();
    for (let P = 0, i = 0; P <= 1.6001; P += 0.02, i++) { const x = X(solT(P)), y = Y(P); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    /* Al2SiO5 선 */
    ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.2; ctx.setLineDash([5, 3]);
    const seg = (f, a, b) => { ctx.beginPath(); ctx.moveTo(X(a), Y(f(a))); ctx.lineTo(X(b), Y(f(b))); ctx.stroke(); };
    seg(kyAnd, 200, 501); seg(kySil, 501, 1000); seg(andSil, 501, 501 + TP[1] / 0.0015);
    ctx.setLineDash([]);
    ctx.fillStyle = C.ink2; ctx.beginPath(); ctx.arc(X(TP[0]), Y(TP[1]), 3, 0, 7); ctx.fill();
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("Ky", X(380), Y(0.42)); ctx.fillText("And", X(420), Y(0.2)); ctx.fillText("Sil", X(610), Y(0.38));
    /* 변성상 이름 */
    ctx.font = `600 10.5px ${F.sans}`; ctx.fillStyle = "rgba(35,35,38,.72)"; ctx.textAlign = "center";
    const L = [["불석상", 200, 0.18], ["포도석–", 290, 0.30], ["펌펠리석상", 290, 0.36], ["녹색 편암상", 415, 0.62], ["각섬암상", 610, 0.88], ["백립암상", 860, 0.62],
      ["청색 편암상", 300, 1.10], ["에클로자이트상", 760, 1.45], ["혼펠스상", 650, 0.10], ["속성", 70, 0.5]];
    L.forEach(([s, T, P]) => ctx.fillText(s, X(T), Y(P)));
    ctx.fillStyle = C.warn; ctx.textAlign = "left"; ctx.font = `10px ${F.sans}`;
    ctx.fillText("부분 용융 →", X(700), Y(1.22)); ctx.fillText("(물 포화 화강암)", X(700), Y(1.22) + 13);
    /* 축 */
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, y0 + .5, x1 - x0, y1 - y0);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    for (let T = 0; T <= 1000; T += 200) { ctx.textAlign = "center"; ctx.fillText(T, X(T), y0 - 6); }
    ctx.textAlign = "left"; ctx.fillText("온도 (°C)", x0, y0 - 18);
    for (let P = 0; P <= 1.6001; P += 0.4) { ctx.textAlign = "right"; ctx.fillText(P.toFixed(1), x0 - 5, Y(P) + 3); }
    for (let z = 0; z <= 55; z += 10) { ctx.textAlign = "left"; ctx.fillText(z, x1 + 5, Y(z * KMP) + 3); }
    ctx.textAlign = "right"; ctx.fillText("압력 (GPa)", x0 + 50, y1 + 16);
    ctx.textAlign = "right"; ctx.fillText("깊이 (km)", x1 + 38, y1 + 16);
    /* 지온 구배선 */
    [8, 25, 60].forEach((g) => {
      const on = free == null && g === grad;
      ctx.strokeStyle = on ? C.ink : "rgba(35,35,38,.35)"; ctx.lineWidth = on ? 2.2 : 1.2;
      ctx.beginPath(); ctx.moveTo(X(10), Y(0));
      const zmax = Math.min(55, (1000 - 10) / g); ctx.lineTo(X(10 + g * zmax), Y(zmax * KMP)); ctx.stroke();
      ctx.font = `10px ${F.mono}`; ctx.fillStyle = on ? C.ink : C.ink3; ctx.textAlign = "left";
      const zl = g === 8 ? 52 : g === 25 ? 31 : 13; const tx = X(10 + g * zl) + 5, ty = Y(zl * KMP) + (g === 60 ? -4 : 4);
      ctx.fillText(`${g} °C/km`, Math.min(tx, x1 - 50), ty);
    });
    /* 현재 점 */
    const [T, P] = cur();
    ctx.fillStyle = C.ink; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(T), Y(P), 6, 0, 7); ctx.fill(); ctx.stroke();
  }
  function cur() {
    if (free) return free;
    const z = Math.min(+sZ.value, 990 / grad); return [10 + grad * z, z * KMP];
  }
  function update() {
    root.querySelectorAll("[data-rock]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rock === rock)));
    root.querySelectorAll("[data-g]").forEach((b) => b.setAttribute("aria-pressed", String(free == null && +b.dataset.g === grad)));
    const [T, P] = cur(); const z = P / KMP;
    oZ.textContent = z.toFixed(1);
    if (free == null) sZ.value = z;
    const f = facies(T, P), melt = T >= solT(P);
    nPT.textContent = `${Math.round(T)} °C · ${P.toFixed(2)} GPa (약 ${Math.round(z)} km)`;
    nFa.textContent = FA[f][0] + (melt ? " + 부분 용융" : "");
    if (rock === "b") {
      const [nm, mins] = BAS[f];
      nRk.textContent = nm;
      pMin.innerHTML = `<b>광물 조합</b> ${mins}${melt && f !== "ec" ? " · 물이 있으면 일부가 녹기 시작합니다" : ""}`;
    } else {
      const [nm, mins, zone] = pelite(T, P, f);
      nRk.textContent = nm;
      pMin.innerHTML = `<b>광물 조합</b> ${mins}${zone ? ` · <b>지수 광물대</b> ${zone}` : ""} · <b>Al₂SiO₅</b> ${T > 300 ? al2sio5(T, P) : "아직 생기지 않음"}`;
    }
    draw();
  }
  root.querySelectorAll("[data-rock]").forEach((b) => b.addEventListener("click", () => { rock = b.dataset.rock; update(); }));
  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { grad = +b.dataset.g; free = null; update(); }));
  sZ.addEventListener("input", () => { free = null; update(); });
  let drag = false;
  const pick = (e) => {
    if (!G) return; const r = cv.getBoundingClientRect();
    const T = clamp(G.iT(e.clientX - r.left), 0, 1000), P = clamp(G.iP(e.clientY - r.top), 0, 1.6);
    free = [T, P]; update();
  };
  cv.addEventListener("pointerdown", (e) => { drag = true; cv.setPointerCapture(e.pointerId); pick(e); });
  cv.addEventListener("pointermove", (e) => { if (drag) pick(e); });
  cv.addEventListener("pointerup", () => { drag = false; });
  if (/[?&]demo/.test(location.search)) { grad = 8; sZ.value = 45; }
  update();
})();
