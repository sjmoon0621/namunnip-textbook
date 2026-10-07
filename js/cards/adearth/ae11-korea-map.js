/* 카드: 한반도 지체 구조구 모식 지도. 경계는 일반적인 구분을 단순화한 모식(경도·위도 대략값). */
(() => {
  const root = document.getElementById("card-adearth-korea-map");
  if (!root || !window.NMKoreaTecto) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), pEra = $(".km-era"), pProv = $(".km-prov");
  const LAND = window.NMKoreaTecto.land;

  /* 구역: [id, 이름, 색, 다각형[lon,lat...], 라벨 위치, {시대: "m"(주요 암석) | "g"(화강암 관입)}, 설명] */
  const PV = [
    ["nr", "낭림 육괴", "#c9b8a6", [124.8, 40.5, 125.0, 40.0, 126.6, 39.85, 127.6, 39.9, 128.4, 40.2, 129.0, 40.7, 129.1, 41.5, 128.3, 41.95, 127.1, 41.75, 126.0, 41.3],
      [126.9, 40.8], { pc: "m", jr: "g" }, "원생 누대 초의 편마암·편암이 기반인 북부의 육괴입니다. 여러 차례 변성 작용과 화성 작용을 받았습니다."],
    ["pn", "평남 분지", "#d9cf9c", [124.8, 38.6, 125.6, 38.45, 126.6, 38.65, 127.3, 39.2, 127.6, 39.75, 126.6, 39.85, 125.6, 39.75, 125.0, 39.5],
      [126.1, 39.2], { p1: "m", p2: "m", jr: "m" }, "선캄브리아 기반 위에 신원생대 상원계, 고생대 전기 조선 누층군(해성 석회암), 고생대 후기~트라이아스기 전기 평안 누층군(석탄층), 쥐라기 대동 누층군이 차례로 쌓인 분지입니다."],
    ["ij", "임진강대", "#b9a3c4", [126.1, 38.15, 126.2, 37.9, 127.0, 37.95, 127.8, 38.3, 128.4, 38.6, 128.25, 38.85, 127.5, 38.6, 126.8, 38.35],
      [127.0, 38.2], { p2: "m" }, "경기 육괴와 평남 분지 사이의 좁은 띠입니다. 고생대 퇴적암이 트라이아스기에 강하게 변성·변형되었으며, 중국의 북중국·남중국 지괴가 충돌한 대륙 충돌대가 동쪽으로 이어진 것으로 보는 해석이 있습니다."],
    ["gg", "경기 육괴", "#e3c3a8", [125.8, 37.6, 125.9, 37.0, 126.1, 36.6, 126.5, 36.2, 127.0, 36.5, 127.6, 36.85, 128.0, 37.02, 128.6, 37.45, 129.2, 37.55, 129.0, 38.2, 128.4, 38.6, 127.8, 38.3, 127.0, 37.95, 126.2, 37.9],
      [127.35, 37.4], { pc: "m", jr: "g" }, "원생 누대 초(약 19억 년 전 안팎)의 편마암·편암이 기반입니다. 쥐라기 대보 화강암(서울 북한산 등)이 넓게 관입했고, 서해안 일대에는 쥐라기 대동 누층군이 작게 남아 있습니다."],
    ["oc", "옥천 변성대", "#bfcfb0", [126.4, 35.8, 126.5, 36.2, 127.0, 36.5, 127.6, 36.85, 128.0, 37.02, 128.0, 36.55, 127.5, 36.1, 127.0, 35.7, 126.6, 35.5],
      [127.15, 36.2], { jr: "g" }, "퇴적암이 변성된 편암·천매암이 북동–남서 방향으로 길게 놓인 띠입니다. 원래 퇴적암이 쌓인 시대(신원생대~고생대)는 아직 논란이 있습니다. 쥐라기 화강암이 관입했습니다."],
    ["tb", "태백산 분지", "#9fc3a0", [128.0, 37.02, 128.6, 37.45, 129.2, 37.55, 129.35, 37.1, 128.7, 36.85, 128.0, 36.55],
      [128.65, 37.13], { p1: "m", p2: "m" }, "고생대 전기 조선 누층군(얕은 바다의 석회암·셰일: 삼엽충, 완족류, 코노돈트)과 고생대 후기 평안 누층군(해안·늪지의 사암·셰일·석탄층: 방추충, 고사리류·인목류 등 식물)이 잘 드러난 곳입니다. 강원 남부의 석회석과 무연탄은 이 지층에서 나옵니다."],
    ["yn", "영남 육괴", "#e8d2b4", [126.3, 35.2, 126.5, 34.8, 127.0, 34.6, 127.6, 34.8, 127.75, 35.3, 128.0, 35.9, 128.4, 36.4, 128.9, 36.75, 129.4, 36.75, 129.35, 37.1, 128.7, 36.85, 128.0, 36.55, 127.5, 36.1, 127.0, 35.7, 126.6, 35.5],
      [127.45, 35.45], { pc: "m", p2: "g", jr: "g" }, "지리산·소백산 일대의 원생 누대 초 편마암·편암이 기반입니다. 트라이아스기~쥐라기 화강암이 관입했고, 전라남도 해남·화순 등지에는 백악기 호수 퇴적층과 화산암이 작은 분지를 이룹니다(공룡·익룡·새 발자국)."],
    ["gs", "경상 분지", "#e2a98f", [127.6, 34.8, 128.0, 34.7, 128.6, 34.7, 129.2, 35.1, 129.4, 35.5, 129.5, 36.2, 129.4, 36.75, 128.9, 36.75, 128.4, 36.4, 128.0, 35.9, 127.75, 35.3],
      [128.75, 35.75], { kr: "m" }, "백악기에 큰 호수와 하천이 있던 분지로, 경상 누층군(아래부터 신동층군, 하양층군, 유천층군 화산암)이 수 km 두께로 쌓였습니다. 공룡·익룡·새 발자국, 공룡알, 규화목, 민물 조개·물고기 화석이 나옵니다. 백악기 말~팔레오기 초에 불국사 화강암이 관입했습니다."],
    ["ph", "포항 분지", "#8fb7cf", [129.22, 35.88, 129.45, 35.92, 129.55, 36.2, 129.42, 36.3, 129.25, 36.12],
      [129.95, 36.05], { cz: "m" }, "동해가 열릴 때 생긴 마이오세의 해성 분지(연일층군)입니다. 나뭇잎, 물고기, 규조류 같은 화석이 나오며, 동해안을 따라 비슷한 신생대 분지가 몇 곳 있습니다."],
  ];
  /* 점으로 표시할 곳: [이름, lon, lat, 시대, 종류] */
  const SPOT = [
    ["제주도", 126.55, 33.38, "cz", "v"], ["울릉도", 130.87, 37.5, "cz", "v"], ["독도", 131.87, 37.24, "cz", "v"],
    ["한탄강", 127.2, 38.05, "cz", "v"], ["백두산", 128.06, 42.0, "cz", "v"],
    ["보령(남포층군)", 126.6, 36.33, "jr", "b"], ["김포", 126.7, 37.63, "jr", "b"],
    ["해남", 126.6, 34.57, "kr", "b"], ["화순", 126.99, 35.06, "kr", "b"],
  ];
  const ERA = {
    pc: ["선캄브리아 시대", "약 25억~18억 년 전(원생 누대 초)에 만들어진 편마암·편암이 경기·영남·낭림 육괴의 기반을 이룹니다. 이 무렵 여러 차례의 변성 작용과 화성 작용으로 한반도의 오래된 대륙 지각이 만들어졌습니다. 화석은 거의 없습니다."],
    p1: ["고생대 전기 (캄브리아기~오르도비스기)", "한반도 중부와 북부가 얕은 바다에 잠겨 조선 누층군의 석회암·셰일이 쌓였습니다(삼엽충, 완족류, 코노돈트). 오르도비스기 중기 뒤로 석탄기 전기까지는 땅이 솟아 퇴적이 거의 없었습니다(대결층)."],
    p2: ["고생대 후기~트라이아스기", "석탄기 후기부터 해안·늪지에 평안 누층군이 쌓였습니다. 아래쪽은 바다의 영향을 받은 지층(방추충), 위쪽은 육성층과 석탄층(양치식물·인목류 등)입니다. 트라이아스기에는 대륙 충돌과 관련된 송림 변동으로 습곡·변성 작용이 일어났습니다."],
    jr: ["쥐라기", "곳곳의 육지 분지에 하천·호수 퇴적층인 대동 누층군이 쌓였습니다(식물 화석, 석탄). 쥐라기 중후기에는 고태평양판(이자나기판)의 섭입과 관련된 대보 조산 운동으로 대보 화강암이 경기 육괴·옥천대·영남 육괴에 넓게 관입했습니다(+ 무늬)."],
    kr: ["백악기", "섭입하는 판 위의 대륙 가장자리에서 경상 분지 등 여러 분지가 생겨 경상 누층군이 쌓였습니다. 호숫가와 범람원에 공룡·익룡·새 발자국과 공룡알이 남았고, 후기에는 화산 활동(유천층군)이 활발했습니다. 백악기 말~팔레오기 초에 불국사 화강암이 관입했습니다(+ 무늬)."],
    cz: ["신생대", "약 2500만~1500만 년 전 동해가 열리며 일본 열도가 떨어져 나갔고, 동해안에 포항 분지 같은 해성 분지가 생겼습니다. 이후 독도(약 460만~250만 년 전), 울릉도, 제주도(약 180만 년 전부터), 한탄강 현무암(수십만 년 전), 백두산의 화산 활동이 있었습니다. 지금 한반도는 유라시아판 안쪽에 있고, 동쪽과 남쪽에서 태평양판과 필리핀해판이 섭입합니다."],
  };
  let era = "pc", sel = null;

  const { ctx, size } = fit(cv, () => draw());
  let G = null;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const L0 = 123.6, L1 = 132.1, B0 = 32.9, B1 = 43.1, k = Math.cos(38 * Math.PI / 180);
    const sc = Math.min((w - 8) / ((L1 - L0) * k), (h - 8) / (B1 - B0));
    const ox = (w - (L1 - L0) * k * sc) / 2, oy = 4;
    const X = (lo) => ox + (lo - L0) * k * sc, Y = (la) => oy + (B1 - la) * sc;
    G = { X, Y, sc, k, ox, oy, L0, B1 };
    ctx.fillStyle = "#e9eef2"; ctx.fillRect(X(L0), Y(B1), (L1 - L0) * k * sc, (B1 - B0) * sc);
    const ring = (r) => { ctx.beginPath(); for (let i = 0; i < r.length; i += 2) { const x = X(r[i]), y = Y(r[i + 1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); };
    /* 육지 */
    ctx.fillStyle = "#f4f3ee"; LAND.forEach((r) => { ring(r); ctx.fill(); });
    /* 구역(육지로 자름) */
    ctx.save(); ctx.beginPath();
    LAND.forEach((r) => { for (let i = 0; i < r.length; i += 2) { const x = X(r[i]), y = Y(r[i + 1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); });
    ctx.clip();
    PV.forEach((p) => {
      const role = p[5][era];
      ring(p[3]); ctx.globalAlpha = role === "m" ? 1 : 0.28; ctx.fillStyle = p[2]; ctx.fill(); ctx.globalAlpha = 1;
      if (role === "g") {
        ctx.save(); ring(p[3]); ctx.clip(); ctx.strokeStyle = "rgba(181,83,47,.75)"; ctx.lineWidth = 1.2;
        const st = 9;
        for (let x = 0; x < w; x += st) for (let y = 0; y < h; y += st) { const xx = x + ((y / st) % 2) * st / 2; ctx.beginPath(); ctx.moveTo(xx - 2.5, y); ctx.lineTo(xx + 2.5, y); ctx.moveTo(xx, y - 2.5); ctx.lineTo(xx, y + 2.5); ctx.stroke(); }
        ctx.restore();
      }
      ring(p[3]); ctx.strokeStyle = sel === p[0] ? C.ink : "rgba(35,35,38,.35)"; ctx.lineWidth = sel === p[0] ? 2.2 : 0.8; ctx.stroke();
    });
    ctx.restore();
    /* 해안선 */
    ctx.strokeStyle = "rgba(35,35,38,.55)"; ctx.lineWidth = 0.8; LAND.forEach((r) => { ring(r); ctx.stroke(); });
    /* 라벨 */
    PV.forEach((p) => {
      const role = p[5][era];
      ctx.font = `${role === "m" || sel === p[0] ? 600 : 400} 11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillStyle = role ? C.ink : C.ink3;
      const [lo, la] = p[4]; ctx.fillText(p[1], X(lo), Y(la) + 4);
      if (p[0] === "ph") { ctx.strokeStyle = C.ink3; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(X(129.5), Y(36.08)); ctx.lineTo(X(129.68), Y(36.06)); ctx.stroke(); }
    });
    SPOT.forEach(([n, lo, la, e, t]) => {
      const on = e === era, x = X(lo), y = Y(la);
      if (t === "v") { ctx.fillStyle = on ? C.apple : "rgba(141,141,146,.6)"; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 5.5, y + 4); ctx.lineTo(x - 5.5, y + 4); ctx.closePath(); ctx.fill(); }
      else { ctx.fillStyle = on ? "#3f6fa3" : "rgba(141,141,146,.6)"; ctx.fillRect(x - 4, y - 4, 8, 8); }
      if (on) { ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = lo > 130 ? "right" : "left"; ctx.fillText(n, x + (lo > 130 ? -8 : 8), y + 4); }
    });
    /* 범례 */
    ctx.font = `10px ${F.sans}`; ctx.textAlign = "left"; const lx = X(124.0), ly = Y(34.6);
    ctx.fillStyle = "rgba(244,243,238,.9)"; ctx.fillRect(lx - 4, ly - 12, 112, 58);
    ctx.fillStyle = C.ink2; ctx.fillText("진한 색: 그 시대 암석", lx, ly);
    ctx.strokeStyle = "rgba(181,83,47,.85)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(lx + 1, ly + 12); ctx.lineTo(lx + 7, ly + 12); ctx.moveTo(lx + 4, ly + 9); ctx.lineTo(lx + 4, ly + 15); ctx.stroke(); ctx.fillText("화강암 관입", lx + 12, ly + 15);
    ctx.fillStyle = C.apple; ctx.beginPath(); ctx.moveTo(lx + 4, ly + 21); ctx.lineTo(lx + 8, ly + 29); ctx.lineTo(lx, ly + 29); ctx.fill(); ctx.fillStyle = C.ink2; ctx.fillText("화산", lx + 12, ly + 29);
    ctx.fillStyle = "#3f6fa3"; ctx.fillRect(lx + 1, ly + 35, 7, 7); ctx.fillStyle = C.ink2; ctx.fillText("작은 퇴적 분지", lx + 12, ly + 42);
    /* 방위·축척 */
    ctx.fillStyle = C.ink; ctx.beginPath(); const nx = X(131.6), ny = Y(42.6); ctx.moveTo(nx, ny - 12); ctx.lineTo(nx - 5, ny); ctx.lineTo(nx + 5, ny); ctx.fill();
    ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("N", nx, ny + 13);
    const km = 100, px = km / 111.2 * sc; ctx.fillRect(X(130.3), Y(33.3), px, 3); ctx.font = `10px ${F.mono}`; ctx.textAlign = "left"; ctx.fillText("100 km", X(130.3), Y(33.3) - 4);
  }
  function inside(poly, lo, la) {
    let c = false;
    for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
      const xi = poly[i], yi = poly[i + 1], xj = poly[j], yj = poly[j + 1];
      if ((yi > la) !== (yj > la) && lo < (xj - xi) * (la - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function update() {
    root.querySelectorAll("[data-e]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.e === era)));
    pEra.innerHTML = `<b>${ERA[era][0]}</b> ${ERA[era][1]}`;
    const p = PV.find((q) => q[0] === sel);
    pProv.innerHTML = p ? `<b>${p[1]}</b> ${p[6]}` : "지도에서 구역을 누르면 그 구역의 암석과 화석이 나옵니다.";
    draw();
  }
  cv.addEventListener("click", (e) => {
    if (!G) return; const r = cv.getBoundingClientRect();
    const lo = G.L0 + (e.clientX - r.left - G.ox) / (G.k * G.sc), la = G.B1 - (e.clientY - r.top - G.oy) / G.sc;
    const hit = PV.slice().reverse().find((q) => inside(q[3], lo, la));
    sel = hit ? hit[0] : null; update();
  });
  root.querySelectorAll("[data-e]").forEach((b) => b.addEventListener("click", () => { era = b.dataset.e; update(); }));
  if (/[?&]demo/.test(location.search)) { era = "kr"; sel = "gs"; }
  update();
})();
