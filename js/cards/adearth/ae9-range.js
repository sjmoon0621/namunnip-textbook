/* 카드: 화석 생존 범위 겹치기(생층서).
   기 경계: ICS International Chronostratigraphic Chart v2023/09.
   생존 범위: 처음·마지막 화석 기록의 대략값(반올림). 시료 A~D는 가상 시료. */
(() => {
  const root = document.getElementById("card-adearth-range");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), box = $(".rg-taxa"), desc = $(".rg-desc"), nR = $(".n-r"), nP = $(".n-p"), nE = $(".n-e");
  const PER = [
    ["캄브리아기", "캄", 538.8, 486.85], ["오르도비스기", "오", 486.85, 443.1], ["실루리아기", "실", 443.1, 419.62],
    ["데본기", "데", 419.62, 358.86], ["석탄기", "석", 358.86, 298.9], ["페름기", "페", 298.9, 251.902],
    ["트라이아스기", "트", 251.902, 201.4], ["쥐라기", "쥐", 201.4, 143.1], ["백악기", "백", 143.1, 66.0],
    ["팔레오기", "팔", 66.0, 23.04], ["네오기", "네", 23.04, 2.58], ["제4기", "", 2.58, 0],
  ];
  const ERA = [["고생대", 538.8, 251.902, "#e3ead6"], ["중생대", 251.902, 66.0, "#dfe6ef"], ["신생대", 66.0, 0, "#f1e6d2"]];
  const EXT = [[445, "오르도비스기 말"], [372, "데본기 후기"], [251.9, "페름기 말"], [201.4, "트라이아스기 말"], [66.0, "백악기 말"]];
  /* [이름, 처음, 마지막(Ma), 서식, 환경 설명] */
  const TX = [
    ["삼엽충", 521, 251.9, "sea", "바다 바닥"],
    ["부유성 필석", 486, 400, "sea", "넓은 바다(물에 떠서 삶)"],
    ["사방산호", 460, 251.9, "reef", "따뜻하고 얕은 맑은 바다"],
    ["관다발 식물", 433, 0, "land", "육지"],
    ["암모나이트류", 410, 66, "sea", "바다"],
    ["방추충", 330, 251.9, "reef", "따뜻하고 얕은 바다"],
    ["육방산호", 241, 0, "reef", "따뜻하고 얕은 맑은 바다"],
    ["공룡(조류 제외)", 233, 66, "land", "육지(물가)"],
    ["속씨식물", 130, 0, "land", "육지"],
    ["매머드속", 5, 0.004, "land", "육지(초원)"],
  ];
  const P = {
    a: [[1, 0], "검은 셰일. 얇은 층리가 잘 발달하고 화석이 납작하게 눌려 있으며 황철석 알갱이가 흩어져 있습니다."],
    b: [[0, 2, 5], "회색 석회암. 화석 껍데기 조각이 많고 산호 군체가 자란 자세 그대로 묻혀 있습니다."],
    c: [[7, 8, 3], "붉은 이암과 사암이 번갈아 쌓임. 연흔과 건열이 보이고 같은 층에 발자국이 찍혀 있습니다."],
    d: [[4, 6], "밝은 석회암. 산호와 조개 화석이 많습니다."],
    x: [[], "아래에서 화석을 직접 골라 보세요. 여러 개를 고를 수 있습니다."],
  };
  let pre = "a", sel = new Set(P.a[0]);
  TX.forEach((t, i) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.t = i; b.textContent = t[0];
    b.addEventListener("click", () => { pre = "x"; sel.has(i) ? sel.delete(i) : sel.add(i); update(); });
    box.appendChild(b);
  });
  const overlap = () => {
    if (!sel.size) return null;
    const a = [...sel].map((i) => TX[i]);
    return [Math.min(...a.map((t) => t[1])), Math.max(...a.map((t) => t[2]))];
  };

  const { ctx, size } = fit(cv, () => draw());
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const lx = 104, x0 = lx, x1 = w - 12, T0 = 560;
    const X = (t) => x0 + (T0 - t) / T0 * (x1 - x0);
    const ye = 6, yp = 26, yr = 50, rowH = Math.max(18, Math.min(26, (h - yr - 40) / TX.length)), yb = yr + rowH * TX.length;
    /* 대·기 띠 */
    ERA.forEach(([n, a, b, col]) => {
      ctx.fillStyle = col; ctx.fillRect(X(a), ye, X(b) - X(a), 18);
      ctx.fillStyle = C.ink; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(n, (X(a) + X(b)) / 2, ye + 13);
    });
    ctx.fillStyle = C.ink2; ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("선캄브리아", 4 + x0 - 100, ye + 13);
    PER.forEach(([n, s, a, b], i) => {
      ctx.fillStyle = i % 2 ? "#f3f2ec" : "#e9e8e0"; ctx.fillRect(X(a), yp, X(b) - X(a), 18);
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
      if (X(b) - X(a) > 12 && s) ctx.fillText(s, (X(a) + X(b)) / 2, yp + 13);
    });
    /* 겹치는 구간 */
    const ov = overlap();
    if (ov && ov[0] > ov[1]) {
      ctx.fillStyle = "rgba(116,171,102,.22)"; ctx.fillRect(X(ov[0]), yp, Math.max(2, X(ov[1]) - X(ov[0])), yb - yp + 4);
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.strokeRect(X(ov[0]) + .5, yp + .5, Math.max(2, X(ov[1]) - X(ov[0])), yb - yp + 3);
    }
    /* 대멸종 */
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1;
    EXT.forEach(([t]) => { ctx.beginPath(); ctx.moveTo(X(t) + .5, yr - 4); ctx.lineTo(X(t) + .5, yb + 6); ctx.stroke(); });
    ctx.setLineDash([]);
    /* 생존 범위 막대 */
    TX.forEach(([n, a, b, hab], i) => {
      const y = yr + i * rowH, on = sel.has(i);
      ctx.fillStyle = on ? C.ink : C.ink3; ctx.font = `${on ? 600 : 400} 11.5px ${F.sans}`; ctx.textAlign = "right";
      ctx.fillText(n, lx - 8, y + rowH / 2 + 4);
      const col = hab === "land" ? "#8a6a3a" : hab === "reef" ? "#d4493a" : "#3f6fa3";
      ctx.fillStyle = on ? col : "rgba(141,141,146,.35)";
      const bh = on ? 9 : 6; ctx.fillRect(X(a), y + rowH / 2 - bh / 2, Math.max(3, X(b) - X(a)), bh);
      ctx.strokeStyle = "rgba(217,218,210,.7)"; ctx.beginPath(); ctx.moveTo(x0 - 100, y + rowH + .5); ctx.lineTo(x1, y + rowH + .5); ctx.stroke();
    });
    /* 시간 축 */
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, yb + 6.5); ctx.lineTo(x1, yb + 6.5); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    for (let t = 500; t >= 0; t -= 100) { const x = X(t); ctx.beginPath(); ctx.moveTo(x, yb + 6); ctx.lineTo(x, yb + 10); ctx.stroke(); ctx.fillText(t, x, yb + 21); }
    ctx.textAlign = "right"; ctx.fillText("백만 년 전", x1, yb + 34);
    ctx.textAlign = "left"; ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.fillText("┆ 5대 대멸종", x0, yb + 34);
    /* 범례 */
    const lg = [["#3f6fa3", "바다"], ["#d4493a", "얕고 따뜻한 바다"], ["#8a6a3a", "육지"]];
    let lxp = x0 + 80; ctx.font = `10px ${F.sans}`;
    lg.forEach(([c, s]) => { ctx.fillStyle = c; ctx.fillRect(lxp, yb + 27, 10, 7); ctx.fillStyle = C.ink2; ctx.fillText(s, lxp + 13, yb + 34); lxp += ctx.measureText(s).width + 26; });
  }
  function update() {
    if (pre !== "x") sel = new Set(P[pre][0]);
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === pre)));
    root.querySelectorAll("[data-t]").forEach((b) => b.setAttribute("aria-pressed", String(sel.has(+b.dataset.t))));
    desc.textContent = (pre === "x" ? "" : "암상: ") + P[pre][1];
    const ov = overlap();
    if (!ov) { nR.textContent = "화석을 고르세요"; nP.textContent = "—"; nE.textContent = "—"; }
    else if (ov[0] <= ov[1]) {
      nR.textContent = "겹치는 기간 없음"; nR.className = "n-r bad";
      nP.textContent = "함께 살 수 없는 조합"; nE.textContent = "재퇴적 화석이나 지층 뒤집힘을 의심";
    } else {
      nR.className = "n-r";
      const f = (t) => (t < 10 ? t.toFixed(t < 1 ? 3 : 1) : Math.round(t));
      nR.textContent = `약 ${f(ov[0])} ~ ${f(ov[1])}백만 년 전 (${f(ov[0] - ov[1])}백만 년)`;
      const ps = PER.filter(([, , a, b]) => a > ov[1] && b < ov[0]).map((p) => p[0]);
      nP.textContent = ps.length > 3 ? `${ps[0]} ~ ${ps[ps.length - 1]} (${ps.length}개 기)` : ps.join(", ");
      const a = [...sel].map((i) => TX[i]), sea = a.some((t) => t[3] !== "land"), land = a.some((t) => t[3] === "land"), reef = a.some((t) => t[3] === "reef");
      nE.textContent = sea && land ? "바다와 육지 화석이 섞임: 연안·삼각주이거나 운반된 화석" : reef ? "따뜻하고 얕은 바다" : sea ? "바다" : "육지";
    }
    draw();
  }
  root.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { pre = b.dataset.p; if (pre === "x") sel = new Set(); update(); }));
  update();
})();
