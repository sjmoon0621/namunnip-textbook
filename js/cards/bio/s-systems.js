/* 카드: 먹은 밥은 어떻게 근육의 에너지가 될까? — 물질 하나를 골라 기관계 사이의 길을 따라가기 (모식도) */
(() => {
  const root = document.getElementById("card-bio-systems");
  if (!root) return;
  const { C, F, fit, loop, reduce } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas"), stopSel = $(".stop"), route = $(".route"), msg = $(".msg");
  const VW = 400, VH = 300;

  const SYS = {
    dig: { name: "소화계", c: "#a8702e" }, resp: { name: "호흡계", c: "#4a78b5" },
    circ: { name: "순환계", c: "#c9444a" }, excr: { name: "배설계", c: "#7d4f8f" },
  };
  const N = {
    food: [62, 10], air: [338, 10], out: [330, 294],
    dig: [62, 62], liver: [62, 150], heart: [200, 150], lung: [338, 62], muscle: [96, 250], kid: [330, 240],
  };
  // 세그먼트: [출발, 도착, 기관계, 설명]
  const SUB = {
    glu: { name: "포도당", c: C.amber, seg: [
      ["food", "dig", "dig", "밥의 녹말이 입과 소장에서 포도당으로 분해되고, 소장 융털의 모세 혈관으로 흡수됩니다."],
      ["dig", "liver", "dig", "흡수된 포도당은 간문맥을 따라 먼저 간을 지납니다. 남는 포도당은 간에 글리코젠으로 저장됩니다."],
      ["liver", "heart", "circ", "간을 나온 혈액이 정맥을 따라 심장으로 갑니다."],
      ["heart", "muscle", "circ", "심장이 동맥으로 혈액을 내보내고, 포도당이 모세 혈관에서 근육 세포로 들어가 세포 호흡에 쓰입니다."]] },
    o2: { name: "산소", c: "#4a78b5", seg: [
      ["air", "lung", "resp", "들숨으로 폐포까지 들어온 O₂가 폐포를 둘러싼 모세 혈관으로 확산합니다."],
      ["lung", "heart", "circ", "폐정맥을 따라 심장(좌심방)으로 갑니다. 적혈구의 헤모글로빈이 O₂를 싣고 있습니다."],
      ["heart", "muscle", "circ", "대동맥을 거쳐 근육의 모세 혈관에서 세포로 확산하고, 세포 호흡에 쓰입니다."]] },
    co2: { name: "이산화 탄소", c: C.ink3, seg: [
      ["muscle", "heart", "circ", "세포 호흡으로 생긴 CO₂가 모세 혈관으로 확산해 정맥을 따라 심장(우심방)으로 갑니다."],
      ["heart", "lung", "circ", "폐동맥을 따라 폐로 갑니다."],
      ["lung", "air", "resp", "폐포로 확산해 날숨으로 나갑니다."]] },
    urea: { name: "요소", c: "#7d4f8f", seg: [
      ["food", "dig", "dig", "단백질이 아미노산으로 분해되어 흡수됩니다."],
      ["dig", "liver", "dig", "아미노산이 에너지원으로 분해될 때 독성이 강한 암모니아가 생기고, 간이 이를 덜 해로운 요소로 바꿉니다."],
      ["liver", "heart", "circ", "요소가 혈액에 녹아 심장으로 갑니다."],
      ["heart", "kid", "circ", "동맥을 따라 콩팥으로 갑니다."],
      ["kid", "out", "excr", "콩팥에서 걸러져 오줌으로 나갑니다."]] },
    h2o: { name: "물", c: "#6fa8c9", seg: [
      ["muscle", "heart", "circ", "세포 호흡에서도 물이 생깁니다. 혈액으로 들어가 심장으로 갑니다."],
      ["heart", "kid", "circ", "혈액을 따라 콩팥으로 갑니다."],
      ["kid", "out", "excr", "여분의 물은 오줌으로 나갑니다. 날숨의 수증기와 땀으로도 나갑니다."]] },
  };
  const STOP = {
    none: "",
    dig: "소화계가 멈추면 포도당과 아미노산이 흡수되지 않습니다. 한동안은 간의 글리코젠과 몸의 지방을 꺼내 쓰지만 오래가지 못합니다.",
    resp: "호흡계가 멈추면 O₂가 들어오지 못하고 CO₂가 나가지 못합니다. 전자 전달계가 멈추어 몇 분 안에 ATP가 바닥납니다.",
    circ: "순환계가 멈추면 모든 물질의 길이 끊깁니다. 흡수도, 공급도, 배출도 순환계를 거쳐야 하기 때문입니다.",
    excr: "배설계가 멈추면 요소와 여분의 물, 무기 염류가 혈액에 쌓입니다. 콩팥 기능이 크게 떨어진 사람이 투석을 받는 까닭입니다.",
  };
  let sub = "glu", pos = 0;

  const segLen = (a, b) => Math.hypot(N[b][0] - N[a][0], N[b][1] - N[a][1]);
  const blockAt = () => { const st = stopSel.value; return SUB[sub].seg.findIndex((s) => s[2] === st); };

  const { ctx, size } = fit(cv, () => draw());
  function txt(s, x, y, o = {}) {
    ctx.font = `${o.w || 500} ${o.size || 12}px ${o.mono ? F.mono : F.sans}`;
    ctx.textAlign = o.align || "center"; ctx.fillStyle = o.c || C.ink; ctx.fillText(s, x, y); ctx.textAlign = "left";
  }
  function box(key, w, h, sys, l1, l2) {
    const [x, y] = N[key], dead = stopSel.value === sys;
    ctx.fillStyle = dead ? "#f3e3dc" : "#fff"; ctx.strokeStyle = SYS[sys].c; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 8); ctx.fill(); ctx.stroke();
    txt(l1, x, y + (l2 ? -3 : 4), { w: 700, c: SYS[sys].c, size: 12.5 });
    if (l2) txt(l2, x, y + 12, { size: 10.5, c: C.ink2 });
    if (dead) { ctx.strokeStyle = C.warn; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - w / 2 + 6, y - h / 2 + 6); ctx.lineTo(x + w / 2 - 6, y + h / 2 - 6); ctx.moveTo(x + w / 2 - 6, y - h / 2 + 6); ctx.lineTo(x - w / 2 + 6, y + h / 2 - 6); ctx.stroke(); }
  }

  function draw() {
    const { w, h } = size;
    if (!w) return;
    const dpr = cv.width / w, s = Math.min(w / VW, h / VH);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (w - VW * s) / 2, 0);
    // 기본 혈관 연결망
    const net = [["liver", "heart"], ["heart", "muscle"], ["heart", "lung"], ["heart", "kid"], ["dig", "liver"]];
    ctx.strokeStyle = "rgba(201,68,74,.22)"; ctx.lineWidth = 6; ctx.lineCap = "round";
    net.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(...N[a]); ctx.lineTo(...N[b]); ctx.stroke(); });
    ctx.lineCap = "butt";
    // 고른 물질의 길
    const S = SUB[sub], bi = blockAt();
    S.seg.forEach(([a, b], k) => {
      const blocked = bi >= 0 && k >= bi;
      ctx.strokeStyle = blocked ? C.warn : S.c; ctx.lineWidth = 2.2; ctx.setLineDash(blocked ? [4, 4] : []);
      ctx.beginPath(); ctx.moveTo(...N[a]); ctx.lineTo(...N[b]); ctx.stroke(); ctx.setLineDash([]);
    });
    txt("음식", N.food[0] + 30, 16, { size: 10.5, c: C.ink3, mono: 1 });
    txt("공기", N.air[0] - 30, 16, { size: 10.5, c: C.ink3, mono: 1 });
    txt("오줌", N.out[0] - 30, 294, { size: 10.5, c: C.ink3, mono: 1 });
    box("dig", 96, 40, "dig", "소화계", "소장"); box("liver", 70, 34, "dig", "간");
    box("lung", 96, 40, "resp", "호흡계", "폐"); box("kid", 96, 40, "excr", "배설계", "콩팥");
    box("heart", 92, 44, "circ", "순환계", "심장 · 혈관");
    const [mx, my] = N.muscle;
    ctx.fillStyle = "#fbe9e7"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(mx - 62, my - 22, 124, 44, 8); ctx.fill(); ctx.stroke();
    txt("근육 세포", mx, my - 3, { w: 700 }); txt("세포 호흡 → ATP", mx, my + 12, { size: 10.5, c: C.ink2 });
    // 움직이는 물질
    let rem = pos, k = 0;
    const lens = S.seg.map(([a, b]) => segLen(a, b));
    while (k < lens.length - 1 && rem > lens[k]) { rem -= lens[k]; k++; }
    const [a, b] = S.seg[k], f = Math.min(1, rem / lens[k]);
    const px = N[a][0] + (N[b][0] - N[a][0]) * f, py = N[a][1] + (N[b][1] - N[a][1]) * f;
    ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fillStyle = S.c; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    // 현재 단계 표시
    route.querySelectorAll("li").forEach((li, j) => li.classList.toggle("on", j === k));
  }

  function total() {
    const S = SUB[sub], bi = blockAt();
    const n = bi >= 0 ? bi : S.seg.length;
    return S.seg.slice(0, n).reduce((s, [a, b]) => s + segLen(a, b), 0);
  }
  function update() {
    const S = SUB[sub], bi = blockAt();
    root.querySelectorAll("[data-sub]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.sub === sub));
    route.innerHTML = S.seg.map(([, , sys, t], j) => `<li class="${bi >= 0 && j >= bi ? "cut" : ""}"><span class="mono" style="color:${SYS[sys].c}">${SYS[sys].name}</span>${t}</li>`).join("");
    const st = stopSel.value;
    msg.textContent = st === "none" ? "기관계 하나를 멈춰 보세요. 이 물질이 어디에서 막히는지 보입니다." :
      (bi >= 0 ? `${S.name}: ${SYS[st].name}에서 막힙니다. ` : `${S.name}: 이 길에는 ${SYS[st].name}가 없어 지나갑니다. `) + STOP[st];
    msg.classList.toggle("bad", st !== "none" && bi >= 0);
    pos = 0; draw();
  }
  root.querySelectorAll("[data-sub]").forEach((b) => b.addEventListener("click", () => { sub = b.dataset.sub; update(); }));
  stopSel.addEventListener("change", update);
  if (reduce) pos = 60;
  else loop(cv, (dt) => {
    const T = total(), full = SUB[sub].seg.reduce((s, [a, b]) => s + segLen(a, b), 0);
    pos += dt * 70;
    if (pos > T + (T < full ? 40 : 30)) pos = 0;
    if (pos > T) { const keep = pos; pos = T; draw(); pos = keep; return; }
    draw();
  });
  update();
})();
