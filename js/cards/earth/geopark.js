/* 카드: 국가지질공원에서는 무엇을 보고, 왜 지켜야 할까? — 국가지질공원 지도, 대표 명소, 답사 활동지, 지질공원 판단하기 */
(() => {
  const root = document.getElementById("card-earth-geopark");
  if (!root || !window.NMGeoparkLand) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const ERA = {
    pt: ["원생대", "#8a5a9e"],
    pz: ["고생대", "#3a62b0"],
    mz: ["중생대", "#3f9a5a"],
    cz: ["신생대", "#d0782a"],
  };
  /* 위치는 공원 안 대표 명소 부근의 어림 좌표 [경도, 위도] */
  const P = [
    { k: "jeju", name: "제주도", u: true, at: [126.17, 33.30], era: "cz", site: "수월봉",
      rock: "응회암(화산재·화산력이 쌓여 굳은 암석)",
      st: "마그마가 물과 만나 터지며 쌓인 응회환의 얇은 층리, 화산탄이 떨어져 아래층이 휘어진 탄낭 구조",
      age: "신생대 제4기 (약 1만 8천 년 전)",
      also: "성산일출봉(응회구), 중문·대포 주상 절리(현무암)",
      look: ["층리가 어느 쪽으로 기울었는지 보고, 화구가 있던 방향을 짐작하기", "탄낭 구조를 찾아 화산탄 크기와 휘어진 층의 깊이를 사진으로 기록하기", "위아래 층의 알갱이 크기 비교하기"],
      safe: "해안 절벽 아래는 낙석 위험이 있어 오래 머물지 않습니다. 물때와 파도를 확인합니다." },
    { k: "hantan", name: "한탄강", u: true, at: [127.20, 38.05], era: "cz", site: "아우라지 베개용암 · 비둘기낭 폭포",
      rock: "현무암",
      st: "현무암 주상 절리, 용암이 물속에서 식어 생긴 둥근 베개용암, 용암 아래에 깔린 옛 강바닥 퇴적층",
      age: "신생대 제4기 (용암이 옛 골짜기를 메운 뒤 강이 다시 깎음)",
      also: "재인 폭포, 고석정",
      look: ["기둥 단면이 몇 각형인지 세어 보기", "기둥이 뻗은 방향과 용암이 식은 면(위·아래)의 관계 찾기", "베개용암 덩어리의 겉껍질과 속을 비교하기"],
      safe: "협곡 가장자리 난간 밖으로 나가지 않습니다. 비가 온 뒤에는 물이 갑자기 불어납니다." },
    { k: "mudeung", name: "무등산권", u: true, at: [126.99, 35.13], era: "mz", site: "서석대 · 입석대 주상절리대",
      rock: "응회암(뜨거운 화산재가 쌓여 굳은 암석)",
      st: "굵은 주상 절리 기둥, 기둥이 무너져 비탈에 쌓인 돌무더기(너덜겅)",
      age: "중생대 백악기 후기",
      also: "화순 적벽, 담양 일대",
      look: ["기둥 굵기를 한탄강 현무암 기둥과 비교하기 (식는 속도와 연결)", "선 기둥, 기울어진 기둥, 무너진 돌을 차례로 찾아 풍화 순서 그리기"],
      safe: "산 위는 날씨가 빨리 바뀝니다. 기둥 위로 오르지 않습니다." },
    { k: "cheongsong", name: "청송", u: true, at: [129.17, 36.40], era: "mz", site: "주왕산 용추협곡",
      rock: "응회암(화산재가 엉겨 붙어 굳은 용결 응회암)",
      st: "세로 절리를 따라 깎인 좁은 협곡과 폭포, 수직 절벽",
      age: "중생대 백악기",
      also: "신성리 공룡 발자국, 얼음골",
      look: ["절리 간격과 협곡·폭포가 생긴 자리의 관계 찾기", "절벽 표면의 세로 금(절리) 방향 기록하기"],
      safe: "계곡 바위는 미끄럽고 낙석이 있습니다. 탐방로를 벗어나지 않습니다." },
    { k: "busan", name: "부산", at: [129.12, 35.11], era: "mz", site: "이기대 해안",
      rock: "화산 쇄설암(화산 활동으로 쌓인 암석)",
      st: "파도가 깎은 해식애, 해식애 앞의 평평한 바위 바닥(파식대)",
      age: "중생대 백악기",
      also: "태종대, 몰운대",
      look: ["해식애와 파식대의 높이 차이로 파도가 깎는 높이 짐작하기", "암석 속 크고 작은 각진 조각(화산 쇄설물) 찾기"],
      safe: "젖은 파식대는 미끄럽고, 큰 파도가 갑자기 칩니다." },
    { k: "paleo", name: "강원 고생대", at: [128.98, 37.13], era: "pz", site: "태백 구문소",
      rock: "석회암(얕은 바다에 쌓인 조선 누층군)",
      st: "강물이 석회암을 녹이고 깎아 뚫은 구멍, 삼엽충 화석과 물결 자국 같은 퇴적 구조",
      age: "고생대 전기",
      also: "영월 한반도 지형, 정선 화암동굴, 평창 백룡동굴",
      look: ["층리가 기울어진 방향 기록하기", "화석은 떼지 말고 사진과 스케치로 남기기", "석회암이 물에 녹아 생긴 지형 찾기"],
      safe: "구문소 옆은 찻길입니다. 차가 다니는 쪽에 서지 않습니다." },
    { k: "danyang", name: "단양", at: [128.37, 36.98], era: "pz", site: "고수동굴 · 도담삼봉",
      rock: "석회암",
      st: "석회 동굴의 종유석·석순, 석회암이 녹아 생긴 카르스트 지형",
      age: "고생대 전기",
      also: "구담봉, 온달동굴",
      look: ["종유석과 석순이 자라는 방향 비교하기", "동굴 벽에서 물이 스며 나오는 자리 찾기"],
      safe: "동굴 바닥은 미끄럽습니다. 종유석은 손대지 않습니다(손의 기름이 자람을 막습니다)." },
    { k: "ulleung", name: "울릉도 · 독도", at: [130.87, 37.52], era: "cz", site: "나리분지 · 독도",
      rock: "조면암·현무암 등 화산암",
      st: "화산이 분출한 뒤 꺼져 생긴 칼데라 안의 평지(나리분지), 해식애와 해식 동굴",
      age: "신생대 (독도가 울릉도보다 먼저 만들어짐)",
      also: "관음도, 태하 해안",
      look: ["나리분지를 둘러싼 산의 모양으로 칼데라 경계 찾기", "용암층과 화산 쇄설층이 번갈아 쌓인 해안 절벽 그리기"],
      safe: "해안 산책로는 낙석 통제가 잦습니다. 통제 구간에 들어가지 않습니다." },
    { k: "gbeast", name: "경북 동해안", at: [129.48, 35.72], era: "cz", site: "경주 양남 주상절리군",
      rock: "현무암",
      st: "부채꼴로 펼쳐진 주상 절리, 옆으로 누운 주상 절리",
      age: "신생대 제3기",
      also: "포항·영덕·울진 해안",
      look: ["기둥이 누운 방향과 서 있는 방향을 지도에 화살표로 그리기 (식은 면은 기둥에 수직)"],
      safe: "해안 바위는 미끄럽고 파도가 셉니다." },
    { k: "jbwest", name: "전북 서해안", at: [126.48, 35.68], era: "mz", site: "부안 채석강",
      rock: "퇴적암(역암·사암·이암)",
      st: "책을 쌓은 듯한 층리, 해식애, 해식 동굴",
      age: "중생대 백악기",
      also: "부안 적벽강, 고창 일대",
      look: ["층마다 알갱이 크기를 비교해 물이 빠르게·느리게 흐른 때 구분하기", "층리가 끊기거나 휘어진 곳 찾기"],
      safe: "물이 들어오는 시간을 먼저 확인합니다. 채석강은 밀물 때 길이 잠깁니다." },
    { k: "baek", name: "백령 · 대청", at: [124.66, 37.97], era: "pt", site: "백령도 두무진",
      rock: "규암(모래가 쌓인 사암이 변성된 암석)",
      st: "해식애와 촛대처럼 남은 바위(시 스택), 층리",
      age: "원생대",
      also: "소청도 스트로마톨라이트, 대청도 해안",
      look: ["층리 방향과 절벽이 갈라진 방향 비교하기", "규암이 왜 깎이지 않고 높은 절벽으로 남았는지 생각해 보기"],
      safe: "배에서 보는 곳이 많습니다. 갯바위에 오를 때는 물때를 확인합니다." },
    { k: "jinan", name: "진안 · 무주", at: [127.42, 35.76], era: "mz", site: "진안 마이산",
      rock: "역암(자갈이 굳은 퇴적암)",
      st: "바위 표면에 벌집처럼 파인 풍화 구멍(타포니)",
      age: "중생대 백악기",
      also: "무주 일대",
      look: ["자갈의 크기와 둥근 정도로 운반 거리 짐작하기", "타포니 구멍 크기를 손바닥과 비교해 사진 찍기"],
      safe: "표면이 부스러지기 쉽습니다. 자갈을 빼내거나 긁지 않습니다." },
    { k: "peace", name: "강원 평화지역", at: [128.0, 38.27], era: "mz", site: "양구 펀치볼(해안 분지)",
      rock: "화강암(분지 바닥)과 변성암(둘레 산지)",
      st: "약한 화강암이 더 빨리 깎여 생긴 그릇 모양 분지(차별 침식)",
      age: "중생대 (화강암 관입)",
      also: "철원·화천·인제·고성 일대",
      look: ["분지 바닥과 둘레 산지의 암석 비교하기", "왜 단단한 암석이 둘레에 남았는지 설명하기"],
      safe: "접경 지역이라 출입이 제한된 곳이 있습니다. 안내를 따릅니다." },
    { k: "uiseong", name: "의성", at: [128.67, 36.30], era: "mz", site: "금성산",
      rock: "화산암",
      st: "백악기 화산 활동 뒤 꺼져 생긴 칼데라",
      age: "중생대 백악기",
      also: "제오리 공룡 발자국",
      look: ["산 둘레를 돌며 화산암과 퇴적암의 경계 찾기"],
      safe: "산행 기본 수칙을 지킵니다." },
  ];
  /* 지질공원에서 해도 될까? [행동, 판정(1 좋음, 0 안 됨), 설명] */
  const ACT = [
    ["해설사와 탐방로를 따라 걷고 스케치하기", 1, "교육: 지질공원의 첫째 쓰임입니다. 보는 사람이 많아질수록 지켜야 할 까닭도 널리 알려집니다."],
    ["주상 절리 조각을 망치로 떼어 기념품으로 가져가기", 0, "보전: 명소의 노두는 한번 깨지면 되돌릴 수 없습니다. 지질 명소의 훼손은 금지되어 있습니다. 표본은 사진과 스케치로 대신합니다."],
    ["지역 숙소·특산물과 묶은 지질 관광 코스 만들기", 1, "지역 경제: 지질 관광으로 주민이 소득을 얻으면 명소를 지킬 동기가 생깁니다. 지질공원이 노리는 지속 가능한 발전입니다."],
    ["지질공원이니 주민이 살거나 농사를 지으면 안 된다", 0, "오해: 지질공원은 사람을 내보내는 보호구역이 아닙니다. 주민이 살며 명소를 함께 지키고 활용하는 제도입니다. 엄격한 개발 제한은 따로 지정된 보호구역(천연기념물, 국립공원 핵심 지역 등)에 적용됩니다."],
    ["탐방로 밖 해식애 아래로 내려가 화석 찾기", 0, "안전과 보전: 해식애 아래는 낙석 위험이 크고, 탐방로 밖을 밟으면 노두가 상합니다."],
  ];
  let sel = "hantan", era = "all";
  const { ctx, size } = fit($("canvas"), () => draw());
  $(".gp-parks").insertAdjacentHTML("beforeend", P.map((p) => `<button class="chip" type="button" data-p="${p.k}" aria-pressed="false">${p.name}</button>`).join(""));
  $(".gp-acts").insertAdjacentHTML("beforeend", ACT.map((a, i) => `<button class="chip" type="button" data-a="${i}" aria-pressed="false">${a[0]}</button>`).join(""));
  const LON = [124.0, 132.2], LAT = [32.6, 38.9];
  let proj = null;
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const k = Math.cos(36 * Math.PI / 180), sx = w / ((LON[1] - LON[0]) * k), sy = h / (LAT[1] - LAT[0]), s = Math.min(sx, sy);
    const ox = (w - (LON[1] - LON[0]) * k * s) / 2, oy = (h - (LAT[1] - LAT[0]) * s) / 2;
    const X = (lon) => ox + (lon - LON[0]) * k * s, Y = (lat) => oy + (LAT[1] - lat) * s;
    proj = { X, Y };
    ctx.fillStyle = "#dfe7ef"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f4f1e8"; ctx.strokeStyle = "#b9b3a2"; ctx.lineWidth = 0.7;
    NMGeoparkLand.forEach((p) => { ctx.beginPath(); for (let i = 0; i < p.length; i += 2) { const x = X(p[i]), y = Y(p[i + 1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.fill(); ctx.stroke(); });
    /* 독도: 50m 해안선에 없을 만큼 작아 점으로 표시 */
    ctx.fillStyle = "#b9b3a2"; ctx.beginPath(); ctx.arc(X(131.87), Y(37.24), 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.font = `10px ${F.sans}`; ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("독도", X(131.87) - 10, Y(37.24) + 13);
    P.forEach((p) => {
      const on = era === "all" || era === p.era, x = X(p.at[0]), y = Y(p.at[1]);
      ctx.globalAlpha = on ? 1 : 0.18;
      ctx.fillStyle = ERA[p.era][1];
      ctx.beginPath(); ctx.arc(x, y, p.k === sel ? 8 : 6, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = p.u ? 2.4 : 1.2; ctx.strokeStyle = p.u ? C.ink : "#fff"; ctx.stroke();
      if (p.k === sel) { ctx.lineWidth = 1.5; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke(); }
    });
    ctx.globalAlpha = 1;
    const p = P.find((q) => q.k === sel);
    if (p) {
      const x = X(p.at[0]), y = Y(p.at[1]), t = p.name + (p.u ? " · 유네스코" : "");
      ctx.font = `600 12px ${F.sans}`; const tw = ctx.measureText(t).width + 12;
      let bx = x + 15, by = y - 10;
      if (bx + tw > w - 4) bx = x - 15 - tw;
      ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.fillRect(bx, by, tw, 20); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(bx + .5, by + .5, tw - 1, 19);
      ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(t, bx + 6, by + 14);
    }
    /* 범례: 아래쪽 띠 */
    ctx.font = `11px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillRect(0, h - 22, w, 22);
    let lx = 10;
    const ly = h - 11;
    Object.values(ERA).forEach(([n, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(lx + 5, ly, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.ink2; ctx.fillText(n, lx + 14, ly + 4); lx += 22 + ctx.measureText(n).width; });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(lx + 9, ly, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.ink2; ctx.fillText("굵은 테 = 유네스코", lx + 18, ly + 4);
  }
  function show() {
    const p = P.find((q) => q.k === sel);
    root.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === sel)));
    $(".gp-name").textContent = `${p.name} 국가지질공원${p.u ? " (유네스코 세계지질공원)" : ""} — ${p.site}`;
    $(".gp-rock").textContent = p.rock;
    $(".gp-st").textContent = p.st;
    $(".gp-age").textContent = p.age;
    $(".gp-also").textContent = p.also;
    $(".gp-look").innerHTML = p.look.map((t) => `<li>${t}</li>`).join("") + "<li>크기를 알 수 있게 자나 손을 함께 넣어 사진 찍기</li>";
    $(".gp-safe").textContent = p.safe + " 암석·화석은 채집하지 않고 기록으로 남깁니다.";
    draw();
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"), r = e.target.closest("[data-r]"), a = e.target.closest("[data-a]");
    if (b) { sel = b.dataset.p; show(); }
    if (r) { era = r.dataset.r; root.querySelectorAll("[data-r]").forEach((x) => x.setAttribute("aria-pressed", String(x === r))); draw(); }
    if (a) {
      const it = ACT[+a.dataset.a];
      root.querySelectorAll("[data-a]").forEach((x) => x.setAttribute("aria-pressed", String(x === a)));
      const v = $(".verdict");
      v.textContent = (it[1] ? "지질공원이 바라는 일입니다. " : "지질공원에서는 하지 않습니다. ") + it[2];
      v.className = "verdict small " + (it[1] ? "good" : "bad");
    }
  });
  $("canvas").addEventListener("click", (e) => {
    if (!proj) return;
    const rc = e.currentTarget.getBoundingClientRect(), mx = e.clientX - rc.left, my = e.clientY - rc.top;
    let best = null, bd = 18;
    P.forEach((p) => { const d = Math.hypot(proj.X(p.at[0]) - mx, proj.Y(p.at[1]) - my); if (d < bd) { bd = d; best = p; } });
    if (best) { sel = best.k; show(); }
  });
  show();
  if (/[?&]demo\b/.test(location.search)) { root.querySelector('[data-r="cz"]').click(); root.querySelector('[data-a="1"]').click(); }
})();
