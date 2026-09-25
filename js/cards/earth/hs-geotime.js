/* 카드: 지질 시대는 무엇을 기준으로 나눌까? — 지질 시대 눈금과 화석 기록 */
(() => {
  const root = document.getElementById("card-earth-geotime");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), sl = $(".t"), tOut = $(".t-out");
  const nDiv = $(".ndiv"), nClock = $(".nclock"), nEv = $(".nev");

  // 경계 나이(백만 년 전, Ma). 국제층서위원회 연대표(2023)를 따름
  const EON = [[4600, 4031, "명왕 누대"], [4031, 2500, "시생 누대"], [2500, 538.8, "원생 누대"], [538.8, 0, "현생 누대"]];
  const ERA = [[4600, 538.8, "선캄브리아 시대", "#b9b4c9"], [538.8, 251.9, "고생대", "#8fb7a2"], [251.9, 66.0, "중생대", "#9fc3d9"], [66.0, 0, "신생대", "#e8d27a"]];
  const PER = [
    [538.8, 485.4, "캄브리아기", "캄"], [485.4, 443.8, "오르도비스기", "오"], [443.8, 419.2, "실루리아기", "실"],
    [419.2, 358.9, "데본기", "데"], [358.9, 298.9, "석탄기", "석"], [298.9, 251.9, "페름기", "페"],
    [251.9, 201.4, "트라이아스기", "트"], [201.4, 145.0, "쥐라기", "쥐"], [145.0, 66.0, "백악기", "백"],
    [66.0, 23.03, "팔레오기", "팔"], [23.03, 2.58, "네오기", "네"], [2.58, 0, "제4기", "4"],
  ];
  // 대멸종 (대략적인 시기)
  const EXT = [443.8, 372, 251.9, 201.4, 66.0];
  // 화석 기록이 있는 대략적인 기간
  const RANGE = [["삼엽충", 521, 251.9, "#7c6a55"], ["암모나이트류", 409, 66.0, "#3f6d8f"], ["공룡 (조류 제외)", 233, 66.0, "#a0522d"]];
  const EV = [
    [4600, "지구 탄생"],
    [3500, "남세균 등이 만든 스트로마톨라이트 화석 (약 35억 년 전)"],
    [2400, "대기 중 산소가 늘기 시작 (약 24억 년 전)"],
    [570, "에디아카라 생물군: 몸이 부드러운 다세포 생물 (약 5.7억 년 전)"],
    [538.8, "단단한 껍데기를 가진 동물이 빠르게 늘어남, 삼엽충"],
    [470, "육상 식물 등장 (오르도비스기)"],
    [443.8, "오르도비스기 말 대멸종"],
    [375, "물 밖으로 나온 네발 동물(양서류) 등장"],
    [372, "데본기 후기 대멸종"],
    [320, "파충류 등장, 거대한 양치식물 숲 (석탄기)"],
    [251.9, "페름기 말 대멸종: 해양 생물 종의 대부분이 사라짐, 삼엽충 멸종"],
    [230, "공룡 등장, 뒤이어 최초의 포유류"],
    [201.4, "트라이아스기 말 대멸종"],
    [150, "시조새 (쥐라기 후기)"],
    [130, "속씨식물(꽃 피는 식물) 등장"],
    [66.0, "백악기 말 대멸종: 공룡(조류 제외)·암모나이트 멸종"],
    [2.58, "빙기와 간빙기가 반복됨"],
    [0.3, "호모 사피엔스 등장 (약 30만 년 전)"],
  ];

  let zoom = false;
  // 위치(0~1) ↔ 나이(Ma)
  const Z = 0.22; // 확대 모드에서 선캄브리아 시대가 차지하는 폭
  const pos = (t) => zoom ? (t >= 538.8 ? Z * (4600 - t) / (4600 - 538.8) : Z + (1 - Z) * (538.8 - t) / 538.8) : (4600 - t) / 4600;
  const age = (p) => zoom ? (p <= Z ? 4600 - p / Z * (4600 - 538.8) : 538.8 * (1 - (p - Z) / (1 - Z))) : 4600 * (1 - p);

  const fmtT = (t) => t >= 100 ? `${(t / 100).toFixed(t >= 1000 ? 1 : 2)}억 년 전` : t >= 1 ? `${(t * 100).toFixed(0)}만 년 전` : `${Math.round(t * 100)}만 년 전`;
  const find = (arr, t) => arr.find((a) => t <= a[0] && t >= a[1]);

  const { ctx, size } = fit(cv, () => draw());
  let L = 0, W = 0;

  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    L = 14; W = w - 28;
    const X = (t) => L + pos(t) * W;
    const t = age(+sl.value / 10000);
    const rows = { eon: 22, era: 50, per: 82, rng: 128 };
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left";
    ctx.fillText(zoom ? "현생 누대를 확대한 눈금 (왼쪽 22%에 선캄브리아 시대를 줄여 넣음)" : "실제 비율 눈금", L, 12);

    const box = (a, b, y, hh, fill, label, small) => {
      const x0 = X(a), x1 = X(b);
      ctx.fillStyle = fill; ctx.fillRect(x0, y, x1 - x0, hh);
      ctx.strokeStyle = C.card; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, y + .5, x1 - x0 - 1, hh - 1);
      if (!label) return;
      ctx.font = small ? `10.5px ${F.sans}` : `600 11.5px ${F.sans}`;
      const full = ctx.measureText(label[0]).width;
      const txt = full < x1 - x0 - 6 ? label[0] : label[1] && ctx.measureText(label[1]).width < x1 - x0 - 3 ? label[1] : "";
      if (!txt) return;
      ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.fillText(txt, (x0 + x1) / 2, y + hh / 2 + 4); ctx.textAlign = "left";
    };
    EON.forEach(([a, b, n], i) => box(a, b, rows.eon, 22, ["#dcd8e6", "#cfcadf", "#c3bdd6", "#cde2d4"][i], [n, n.replace(" 누대", "")]));
    ERA.forEach(([a, b, n, c]) => box(a, b, rows.era, 26, c, [n, n.replace(" 시대", "")]));
    PER.forEach(([a, b, n, s], i) => box(a, b, rows.per, 26, i % 2 ? "#e4e5de" : "#d6d8cf", [n, s], true));
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    // 선캄브리아 시대에는 '기' 구분을 이 그림에 넣지 않았다
    ctx.fillText("(기 구분 생략)", X(4600) + 4, rows.per + 17);

    // 화석 기록 막대
    RANGE.forEach(([n, a, b, c], i) => {
      const y = rows.rng + i * 17;
      ctx.fillStyle = c; ctx.fillRect(X(a), y, Math.max(2, X(b) - X(a)), 7);
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink2;
      const tx = X(a) - 6; ctx.textAlign = "right";
      if (tx - ctx.measureText(n).width < L) { ctx.textAlign = "left"; ctx.fillText(n, X(b) + 6, y + 7); }
      else ctx.fillText(n, tx, y + 7);
      ctx.textAlign = "left";
    });
    // 대멸종
    const ey = rows.rng + 3 * 17 + 8;
    EXT.forEach((e) => {
      const x = X(e);
      ctx.strokeStyle = "rgba(181,83,47,.45)"; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, rows.era); ctx.lineTo(x, ey); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(x, ey); ctx.lineTo(x - 5, ey + 9); ctx.lineTo(x + 5, ey + 9); ctx.closePath(); ctx.fill();
    });
    ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.warn;
    ctx.fillText("▲ 5대 대멸종", L, ey + 9);

    // 사건 점
    const vy = ey + 44;
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(L, vy); ctx.lineTo(L + W, vy); ctx.stroke();
    EV.forEach(([e]) => { ctx.fillStyle = C.ink3; ctx.beginPath(); ctx.arc(X(e), vy, 2.4, 0, Math.PI * 2); ctx.fill(); });
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    ctx.fillText("주요 사건", L, vy + 16);
    // 눈금
    const ticks = zoom ? [4600, 538.8, 400, 300, 200, 100, 0] : [4600, 3000, 2000, 1000, 0];
    ticks.forEach((k) => { ctx.textAlign = "center"; ctx.fillText(k === 0 ? "현재" : k >= 1000 ? `${k / 100}억` : `${Math.round(k / 10) / 10}억`, clamp(X(k), L + 14, L + W - 14), h - 6); });
    ctx.textAlign = "left";

    // 커서
    const x = X(t);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, rows.eon - 4); ctx.lineTo(x, vy + 4); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(x - 5, rows.eon - 10); ctx.lineTo(x + 5, rows.eon - 10); ctx.lineTo(x, rows.eon - 3); ctx.closePath(); ctx.fill();
  }

  function update() {
    const t = age(+sl.value / 10000);
    const eon = find(EON, t), era = find(ERA, t), per = t <= 538.8 ? find(PER, t) : null;
    tOut.textContent = t < 0.005 ? "현재" : fmtT(t);
    nDiv.textContent = [eon && eon[2], era && era[2] !== "선캄브리아 시대" ? era[2] : null, per && per[2]].filter(Boolean).join(" · ");
    const s = (1 - t / 4600) * 86400, hh = Math.floor(s / 3600), mm = Math.floor(s % 3600 / 60), ss = Math.floor(s % 60);
    nClock.textContent = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    // 가까운 사건 (눈금 위의 거리로 판단)
    let best = null, bd = 1e9;
    EV.forEach((e) => { const d = Math.abs(pos(e[0]) - pos(t)); if (d < bd) { bd = d; best = e; } });
    nEv.textContent = bd < 0.03 ? `${best[0] >= 1 ? fmtT(best[0]).replace(" 전", "") + " 전" : "약 30만 년 전"} · ${best[1]}` : "이 무렵의 표시된 사건 없음";
    draw();
  }
  function setZoom(z) {
    const t = age(+sl.value / 10000);
    zoom = z; sl.value = Math.round(pos(t) * 10000);
    root.querySelectorAll("[data-zoom]").forEach((b) => b.setAttribute("aria-pressed", (b.dataset.zoom === "1") === z ? "true" : "false"));
    update();
  }
  root.querySelectorAll("[data-zoom]").forEach((b) => b.addEventListener("click", () => setZoom(b.dataset.zoom === "1")));
  root.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => { sl.value = Math.round(pos(+b.dataset.go) * 10000); update(); }));
  sl.addEventListener("input", update);
  const drag = (e) => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left;
    sl.value = Math.round(clamp((x - L) / W, 0, 1) * 10000); update();
  };
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag(e); });
  cv.addEventListener("pointermove", (e) => { if (e.buttons) drag(e); });
  sl.value = Math.round(pos(251.9) * 10000);
  update();
})();
