/* 카드: 모래가 어떻게 단단한 사암이 될까? — 매몰 깊이에 따른 다짐·교결(속성 작용), 퇴적암 분류 활동 */
(() => {
  const root = document.getElementById("card-earth-sedrock");
  if (!root) return;
  const { C, F, fit, loop, clamp } = NM;
  const $ = (s) => root.querySelector(s);

  /* ── 1. 속성 작용 ──
     공극률 φ(z) = φ0·exp(−cz): 사암 φ0 = 0.49, c = 0.27 /km, 셰일 φ0 = 0.63, c = 0.51 /km
     (Sclater & Christie 1980, 북해 퇴적층의 평균 경향). 밀도 = (1−φ)·2.65 + φ·1.03 g/cm³. 지온 경사 25 °C/km 가정. */
  const SED = { sand: { p0: 0.49, c: 0.27, rock: "사암", sed: "모래" }, mud: { p0: 0.63, c: 0.51, rock: "셰일", sed: "진흙" } };
  const CEM = { cal: ["방해석", "#f3efe2"], sil: ["규질(석영)", "#e4eef3"] };
  let z = 0, sed = "sand", cem = "cal", play = false;
  const phi = (zz) => SED[sed].p0 * Math.exp(-SED[sed].c * zz);
  const rho = (zz) => (1 - phi(zz)) * 2.65 + phi(zz) * 1.03;
  const squeeze = (zz) => (1 - SED[sed].p0) / (1 - phi(zz));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const cement = (zz) => (sed === "sand" ? smooth(0.4, 3.2, zz) : 0.35 * smooth(1, 4, zz));
  const rnd = (i) => { const s = Math.sin(i * 91.7 + 17.3) * 43758.5453; return s - Math.floor(s); };
  /* 모래 알갱이: 겹치지 않게 무작위로 채움 (단위 정사각형) */
  const SAND = [];
  for (let k = 0; SAND.length < 34 && k < 4000; k++) {
    const r = 0.055 + rnd(k) * 0.03, x = r + rnd(k + 7e3) * (1 - 2 * r), y = r + rnd(k + 9e3) * (1 - 2 * r);
    if (SAND.every((g) => Math.hypot(g.x - x, g.y - y) > g.r + r + 0.012)) SAND.push({ x, y, r, t: rnd(k + 3) });
  }
  const MUD = [];
  for (let k = 0; k < 150; k++) MUD.push({ x: rnd(k * 3 + 1), y: rnd(k * 3 + 2), a: (rnd(k * 3 + 5) - 0.5) * Math.PI, t: rnd(k) });
  let drops = Array.from({ length: 10 }, (_, i) => ({ x: rnd(i + 40), y: rnd(i + 80) }));

  const cv1 = $(".cv-dia");
  const A = fit(cv1, () => draw1());
  function draw1() {
    const { ctx } = A, { w, h } = A.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    /* 왼쪽: 매몰 깊이 기둥 */
    const gx = 40, gw = w * 0.13, gt = 26, gb = h - 22, Z = (zz) => gt + zz / 5 * (gb - gt);
    ctx.fillStyle = "#cfe3ef"; ctx.fillRect(gx, gt - 12, gw, 12);
    const st = ["#eadbb3", "#d9c79c", "#cdb98d", "#bfa97f", "#b29c74"];
    for (let i = 0; i < 5; i++) { ctx.fillStyle = st[i]; ctx.fillRect(gx, Z(i), gw, Z(i + 1) - Z(i)); }
    ctx.fillStyle = sed === "sand" ? "#e6c66f" : "#8d8a80"; ctx.fillRect(gx - 4, Z(z) - 4, gw + 8, 8);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(gx - 4 + 0.5, Z(z) - 4 + 0.5, gw + 7, 7);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) ctx.fillText(`${i} km`, gx - 5, Z(i) + 3.5);
    ctx.textAlign = "center"; ctx.fillText("물·지표", gx + gw / 2, gt - 15);
    /* 오른쪽: 현미경 확대 상자 */
    const bx = gx + gw + 40, bw = Math.min(w - bx - 150, h - 70), by = 40, bh = bw;
    const s = squeeze(z), hh = bh * s, top = by + bh - hh;
    ctx.strokeStyle = C.ink3; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(gx + gw + 4, Z(z)); ctx.lineTo(bx, top); ctx.moveTo(gx + gw + 4, Z(z)); ctx.lineTo(bx, by + bh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#e9e4d6"; ctx.fillRect(bx, by, bw, bh - hh);
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
    if (bh - hh > 16) ctx.fillText("위에 쌓인 지층의 무게 ↓", bx + bw / 2, by + (bh - hh) / 2 + 4);
    ctx.save(); ctx.beginPath(); ctx.rect(bx, top, bw, hh); ctx.clip();
    ctx.fillStyle = "#b9d8ea"; ctx.fillRect(bx, top, bw, hh);
    const cm = cement(z), X = (x) => bx + x * bw, Y = (y) => top + y * hh;
    if (sed === "sand") {
      ctx.strokeStyle = CEM[cem][1]; ctx.lineCap = "round";
      if (cm > 0.01) SAND.forEach((g) => { ctx.lineWidth = cm * bw * 0.06; ctx.beginPath(); ctx.ellipse(X(g.x), Y(g.y), g.r * bw + ctx.lineWidth / 2, g.r * bw * Math.max(s, 0.75) + ctx.lineWidth / 2, 0, 0, 7); ctx.stroke(); });
      SAND.forEach((g) => { ctx.fillStyle = g.t < 0.75 ? "#e4cf96" : "#c8a882"; ctx.strokeStyle = "rgba(90,70,40,.55)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(X(g.x), Y(g.y), g.r * bw, g.r * bw * Math.max(s, 0.75), 0, 0, 7); ctx.fill(); ctx.stroke(); });
    } else {
      const al = smooth(0, 2.5, z);
      MUD.forEach((g) => { const a = g.a * (1 - al); ctx.save(); ctx.translate(X(g.x), Y(g.y)); ctx.rotate(a); ctx.fillStyle = g.t < 0.5 ? "#8f8a7c" : "#a59f8f"; ctx.fillRect(-bw * 0.035, -1.6, bw * 0.07, 3.2); ctx.restore(); });
      if (cm > 0.01) { ctx.fillStyle = `rgba(243,239,226,${cm * 0.6})`; ctx.fillRect(bx, top, bw, hh); }
    }
    /* 빠져나가는 물 */
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, top + 0.5, bw - 1, hh - 1);
    const rate = SED[sed].c * phi(z);
    ctx.fillStyle = "#3d7fb0";
    drops.forEach((d) => { if (d.y > rate * 4) return; ctx.beginPath(); ctx.arc(bx + d.x * bw, top - 6 - d.y * 26, 2.2, 0, 7); ctx.fill(); });
    ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.font = `10.5px ${F.sans}`;
    ctx.fillText(`확대 모식 (알갱이 지름 약 ${sed === "sand" ? "0.2 mm" : "0.002 mm 미만"})`, bx + bw / 2, by + bh + 16);
    /* 오른쪽 글 */
    const tx = bx + bw + 16;
    const stage = z < 0.25 ? ["느슨한 " + SED[sed].sed, "물이 알갱이 사이를 채움"] : cm < 0.35 ? ["다짐", "눌려서 틈이 줄고 물이 빠짐"] : ["다짐 + 교결", sed === "sand" ? `${CEM[cem][0]}이 틈에 자라 붙임` : "점토가 나란히 눌려 굳음"];
    if (z > 2 && cm > 0.6) stage[0] = `${SED[sed].rock} (단단한 암석)`;
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 13px ${F.sans}`; ctx.fillText(stage[0], tx, by + 12);
    ctx.font = `11.5px ${F.sans}`; ctx.fillStyle = C.ink2; ctx.fillText(stage[1], tx, by + 32);
    const leg = [["#b9d8ea", "공극(물)"], [sed === "sand" ? "#e4cf96" : "#8f8a7c", sed === "sand" ? "모래 알갱이" : "점토 알갱이"]];
    if (sed === "sand") leg.push([CEM[cem][1], `시멘트(${CEM[cem][0]})`]);
    leg.forEach(([c, t], i) => { const y = by + 60 + i * 20; ctx.fillStyle = c; ctx.fillRect(tx, y - 9, 12, 12); ctx.strokeStyle = C.ink3; ctx.strokeRect(tx + 0.5, y - 8.5, 11, 11); ctx.fillStyle = C.ink2; ctx.fillText(t, tx + 18, y + 1); });
    ctx.fillStyle = C.ink3; ctx.fillText(`층 두께 ${Math.round(s * 100)}%`, tx, by + bh - 4);
    $(".n-z").textContent = `${z.toFixed(1)} km`;
    $(".n-t").textContent = `${Math.round(15 + 25 * z)} °C`;
    $(".n-p").textContent = `${Math.round(phi(z) * 100)}%`;
    $(".n-r").textContent = `${rho(z).toFixed(2)}`;
    $(".z-out").textContent = z.toFixed(1);
  }
  loop(cv1, (dt) => {
    if (play) { z += dt * 0.6; if (z >= 5) { z = 5; play = false; $(".play").textContent = "매몰 재생"; } $(".z").value = z; }
    const v = SED[sed].c * phi(z);
    drops.forEach((d) => { d.y += dt * (0.25 + v); if (d.y > 1) { d.y = 0; d.x = Math.random(); } });
    draw1();
  });
  $(".z").addEventListener("input", (e) => { z = +e.target.value; play = false; $(".play").textContent = "매몰 재생"; draw1(); });
  $(".play").addEventListener("click", (e) => { play = !play; if (play && z >= 5) z = 0; e.target.textContent = play ? "멈춤" : "매몰 재생"; });
  const pick = (sel, key, fn) => $(sel).addEventListener("click", (e) => { const b = e.target.closest(`[data-${key}]`); if (!b) return; root.querySelectorAll(`${sel} [data-${key}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); fn(b.dataset[key]); });
  pick(".sed", "s", (v) => { sed = v; $(".cem").hidden = v !== "sand"; draw1(); });
  pick(".cem", "c", (v) => { cem = v; draw1(); });

  /* ── 2. 퇴적암 분류 ── gs: 대표 입자 지름(mm), 없으면 알갱이로 된 암석이 아님. hcl: 0 없음, 1 약함, 2 활발 */
  const ROCK = [
    { id: "cg", n: "역암", ok: ["cl"], gs: 20, hcl: 0, clue: ["입자: 둥근 자갈(지름 2 mm 이상) 사이를 모래가 채움", "성분: 여러 암석 조각, 석영", "특징: 자갈이 둥글어 오래 굴러 운반되었음"] },
    { id: "ss", n: "사암", ok: ["cl"], gs: 0.3, hcl: 1, clue: ["입자: 모래(1/16~2 mm), 손으로 문지르면 까끌까끌", "성분: 주로 석영, 장석", "염산: 알갱이는 반응 없음. 시멘트가 방해석이면 약하게 거품"] },
    { id: "sh", n: "셰일", ok: ["cl"], gs: 0.002, hcl: 0, clue: ["입자: 맨눈으로 보이지 않을 만큼 작음(점토)", "성분: 점토 광물", "특징: 얇은 판으로 잘 쪼개짐, 가끔 식물·물고기 화석"] },
    { id: "tf", n: "응회암", ok: ["cl"], gs: 0.5, hcl: 0, clue: ["입자: 2 mm보다 작은 각진 조각", "성분: 화산재(화산 유리), 날카로운 광물 조각", "특징: 가볍고 거친 느낌, 근처에 화산 활동 흔적"] },
    { id: "ls", n: "석회암", ok: ["ch", "or"], best: "or", gs: 0, hcl: 2, clue: ["입자: 알갱이가 거의 안 보이는 치밀한 덩어리", "성분: 방해석(CaCO₃)", "특징: 산호·조개 껍데기 조각이 많이 박혀 있음"] },
    { id: "rs", n: "암염", ok: ["ch"], gs: 0, hcl: 0, clue: ["입자: 정육면체 모양의 투명한 결정", "성분: 염화 나트륨(NaCl), 물에 잘 녹음", "특징: 석고와 함께, 바닷물이 마른 지층에서 나옴"] },
    { id: "gy", n: "석고", ok: ["ch"], gs: 0, hcl: 0, clue: ["입자: 흰 판·섬유 모양 결정", "성분: 황산 칼슘(CaSO₄·2H₂O)", "특징: 손톱으로 긁힘(굳기 2), 증발 환경"] },
    { id: "ct", n: "처트", ok: ["ch", "or"], gs: 0, hcl: 0, clue: ["입자: 보이지 않음, 매우 단단해 유리를 긁음", "성분: 규질(SiO₂)", "특징: 깨진 면이 조개껍데기처럼 매끈함, 현미경으로 방산충 껍데기가 보이기도 함"] },
    { id: "co", n: "석탄", ok: ["or"], gs: 0, hcl: 0, clue: ["입자: 알갱이 대신 눌린 식물 조직", "성분: 탄소가 많은 식물 유해", "특징: 검고 가벼우며 불에 탐, 잎·줄기 자국"] },
  ];
  const CAT = { cl: "쇄설성", ch: "화학적", or: "유기적" };
  const eun = (w) => w + ((w.charCodeAt(w.length - 1) - 0xac00) % 28 ? "은" : "는");
  let cur = 0, cat = null, name = null, acid = -1, done = new Set();
  $(".samp").insertAdjacentHTML("beforeend", ROCK.map((r, i) => `<button class="chip" data-k="${i}" aria-pressed="${i === 0}">표본 ${i + 1}</button>`).join(""));
  $(".names").insertAdjacentHTML("beforeend", ROCK.map((r) => r.n).sort((a, b) => a.localeCompare(b, "ko")).map((n) => `<button class="chip" data-n="${n}" aria-pressed="false">${n}</button>`).join(""));
  const cv2 = $(".cv-rock");
  const B = fit(cv2, () => draw2());

  function texture(ctx, id, x, y, w, h, k, seed) {
    const base = { cg: "#cdbb98", ss: "#d9c08f", sh: "#6f6e69", tf: "#cdc3b9", ls: "#c6c9c4", rs: "#efe9e3", gy: "#f3f1ec", ct: "#55504a", co: "#22201e" }[id];
    ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
    const n = (a) => rnd(seed + a);
    if (id === "cg") { const pc = ["#8d8478", "#b39f86", "#6f6a62", "#ddd3c3", "#9a8a72"]; for (let i = 0; i < 60; i++) { const r = (7 + n(i) * 9) * k; ctx.fillStyle = pc[i % 5]; ctx.beginPath(); ctx.ellipse(x + n(i + 100) * w, y + n(i + 200) * h, r * 1.25, r, n(i + 300) * 3, 0, 7); ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,.2)"; ctx.stroke(); } for (let i = 0; i < 300; i++) { ctx.fillStyle = "rgba(90,70,40,.35)"; ctx.fillRect(x + n(i + 500) * w, y + n(i + 900) * h, 1.2 * k, 1.2 * k); } }
    if (id === "ss") { for (let i = 0; i < 900 / k; i++) { ctx.fillStyle = n(i) < 0.7 ? "rgba(120,90,50,.35)" : "rgba(255,255,255,.5)"; ctx.beginPath(); ctx.arc(x + n(i + 100) * w, y + n(i + 2000) * h, 1.1 * k, 0, 7); ctx.fill(); } }
    if (id === "sh") { for (let yy = y; yy < y + h; yy += 3 * k + n(yy) * 3) { ctx.strokeStyle = n(yy + 1) < 0.5 ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.18)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy + 2); ctx.stroke(); } }
    if (id === "tf") { for (let i = 0; i < 260 / k; i++) { const px = x + n(i) * w, py = y + n(i + 700) * h, s = (1.5 + n(i + 50) * 2.5) * k; ctx.fillStyle = n(i + 9) < 0.5 ? "#f4f0ea" : "#8c847c"; ctx.beginPath(); ctx.moveTo(px, py - s); ctx.lineTo(px + s, py + s * 0.6); ctx.lineTo(px - s * 0.7, py + s * 0.4); ctx.fill(); } }
    if (id === "ls") { for (let i = 0; i < 40; i++) { ctx.strokeStyle = "#f1eee5"; ctx.lineWidth = 2 * k; const r = (4 + n(i) * 6) * k, a = n(i + 3) * 6; ctx.beginPath(); ctx.arc(x + n(i + 100) * w, y + n(i + 200) * h, r, a, a + 2.4); ctx.stroke(); } for (let i = 0; i < 400; i++) { ctx.fillStyle = "rgba(0,0,0,.08)"; ctx.fillRect(x + n(i + 600) * w, y + n(i + 1600) * h, 1.2, 1.2); } }
    if (id === "rs") { for (let i = 0; i < 30; i++) { const s = (8 + n(i) * 12) * k; ctx.strokeStyle = "rgba(170,140,140,.6)"; ctx.fillStyle = "rgba(255,240,240,.5)"; ctx.lineWidth = 1; ctx.fillRect(x + n(i + 10) * w, y + n(i + 20) * h, s, s); ctx.strokeRect(x + n(i + 10) * w, y + n(i + 20) * h, s, s); } }
    if (id === "gy") { for (let i = 0; i < 160; i++) { const px = x + n(i) * w, py = y + n(i + 77) * h; ctx.strokeStyle = "rgba(160,150,135,.45)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 3 * k, py - 14 * k); ctx.stroke(); } }
    if (id === "ct") { for (let i = 0; i < 9; i++) { ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1.2; const cx = x + n(i) * w, cy = y + n(i + 30) * h; for (let j = 1; j < 4; j++) { ctx.beginPath(); ctx.arc(cx, cy, j * 7 * k, 0.3, 2.2); ctx.stroke(); } } }
    if (id === "co") { for (let i = 0; i < 30; i++) { ctx.strokeStyle = "rgba(140,135,130,.35)"; ctx.lineWidth = 1.5; const yy = y + n(i) * h; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy + (n(i + 5) - 0.5) * 8); ctx.stroke(); } ctx.strokeStyle = "rgba(170,165,150,.55)"; ctx.lineWidth = 1.2; const lx = x + w * 0.55, ly = y + h * 0.5; ctx.beginPath(); ctx.moveTo(lx - 30 * k, ly + 10 * k); ctx.lineTo(lx + 30 * k, ly - 10 * k); ctx.stroke(); for (let j = -3; j <= 3; j++) { ctx.beginPath(); ctx.moveTo(lx + j * 8 * k, ly - j * 2.7 * k); ctx.lineTo(lx + j * 8 * k + 6 * k, ly - j * 2.7 * k + 9 * k); ctx.stroke(); } }
  }
  function draw2(t) {
    const { ctx } = B, { w, h } = B.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const r = ROCK[cur];
    /* 손 표본 */
    const sx = 18, sy = 26, sw = w * 0.5, sh = h - 92;
    ctx.save(); ctx.beginPath();
    for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, rr = 1 + (rnd(cur * 50 + i % 24) - 0.5) * 0.14; ctx.lineTo(sx + sw / 2 + Math.cos(a) * sw / 2 * rr * 0.95, sy + sh / 2 + Math.sin(a) * sh / 2 * rr * 0.92); }
    ctx.closePath(); ctx.clip();
    texture(ctx, r.id, sx - 10, sy - 10, sw + 20, sh + 20, 1, cur * 1000);
    if (acid >= 0 && r.hcl) {
      const age = (performance.now() - acid) / 1000, n = r.hcl === 2 ? 40 : 8;
      for (let i = 0; i < n; i++) { const ph = (age * (0.6 + rnd(i) * 0.6) + rnd(i + 9)) % 1; ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(sx + sw * 0.4 + (rnd(i + 3) - 0.5) * 60, sy + sh * 0.45 - ph * 14 + (rnd(i + 4) - 0.5) * 30, 1.5 + ph * 3, 0, 7); ctx.stroke(); }
    }
    if (acid >= 0) { ctx.fillStyle = "rgba(170,210,235,.35)"; ctx.beginPath(); ctx.ellipse(sx + sw * 0.4, sy + sh * 0.45, 34, 20, 0, 0, 7); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = C.ink2; ctx.font = `600 12px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText(`표본 ${cur + 1}${done.has(cur) ? ` · ${r.n}` : ""}`, sx, 16);
    if (acid >= 0) { ctx.font = `11px ${F.sans}`; ctx.fillStyle = r.hcl === 2 ? C.forest : C.ink2; ctx.fillText(r.hcl === 2 ? "묽은 염산: 거품이 활발히 남" : r.hcl === 1 ? "묽은 염산: 틈에서 거품이 약간" : "묽은 염산: 반응 없음", sx + 90, 16); }
    /* 돋보기 */
    const mx = w * 0.79, my = 26 + (h - 92) / 2, mr = Math.min(w * 0.17, (h - 92) / 2);
    ctx.save(); ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.clip(); texture(ctx, r.id, mx - mr, my - mr, mr * 2, mr * 2, 2.6, cur * 1000 + 5); ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("돋보기 (모식)", mx, my + mr + 14);
    /* 입자 크기 막대: 로그 눈금 1/256 ~ 64 mm */
    const bx = 18, bw = w - 36, by = h - 34, L = (d) => bx + (Math.log2(d) + 8) / 14 * bw;
    [[1 / 256, 1 / 16, "실트·점토", "#c9c4b6"], [1 / 16, 2, "모래", "#e4cf96"], [2, 64, "자갈", "#b9a58a"]].forEach(([a, b, t, c]) => { ctx.fillStyle = c; ctx.fillRect(L(a), by, L(b) - L(a), 10); ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(t, (L(a) + L(b)) / 2, by + 24); });
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3;
    [[1 / 16, "1/16 mm"], [2, "2 mm"]].forEach(([d, t]) => { ctx.fillRect(L(d) - 0.5, by - 3, 1, 16); ctx.fillText(t, L(d), by - 6); });
    if (r.gs) { const x = L(r.gs); ctx.fillStyle = C.warn; ctx.beginPath(); ctx.moveTo(x, by - 1); ctx.lineTo(x - 5, by - 10); ctx.lineTo(x + 5, by - 10); ctx.fill(); }
    else { ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left"; ctx.fillText("알갱이로 된 암석이 아님 (결정·유기물)", bx, by - 20); }
  }
  loop(cv2, () => { if (acid >= 0) draw2(); });
  function showSample() {
    const r = ROCK[cur];
    $(".clues").innerHTML = r.clue.map((c) => `<li>${c}</li>`).join("");
    cat = null; name = null; acid = -1;
    root.querySelectorAll(".cats [data-g], .names [data-n]").forEach((b) => b.setAttribute("aria-pressed", "false"));
    root.querySelectorAll(".samp [data-k]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.k === cur)));
    say(""); draw2();
  }
  const say = (t, cls) => { const v = $(".verdict"); v.textContent = t; v.className = "verdict small " + (cls || ""); };
  $(".samp").addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b) return; cur = +b.dataset.k; showSample(); });
  pick(".cats", "g", (v) => { cat = v; });
  pick(".names", "n", (v) => { name = v; });
  $(".b-acid").addEventListener("click", () => { acid = performance.now(); draw2(); });
  $(".b-next").addEventListener("click", () => { cur = (cur + 1) % ROCK.length; showSample(); });
  $(".b-judge").addEventListener("click", () => {
    const r = ROCK[cur];
    if (!cat || !name) { say("분류(쇄설성·화학적·유기적)와 암석 이름을 모두 고르세요."); return; }
    const okC = r.ok.includes(cat), okN = name === r.n;
    let msg;
    if (okC && okN) {
      done.add(cur);
      msg = `맞습니다. ${eun(r.n)} ${r.ok.map((k) => CAT[k]).join(" 또는 ")} 퇴적암입니다.`;
      if (r.id === "ls") msg += " 껍데기 조각이 많으니 생물이 만든 유기적 석회암으로 보는 것이 더 알맞습니다. 바닷물에서 방해석이 바로 가라앉아 생기면 화학적 석회암입니다.";
      if (r.id === "ct") msg += " 물에서 규질이 침전하면 화학적, 방산충·규조 껍데기가 쌓이면 유기적입니다.";
      if (r.id === "tf") msg += " 화산재 알갱이가 쌓여 굳었으므로 쇄설성(화산 쇄설성)으로 분류합니다.";
    } else if (okN && !okC) msg = `이름은 맞지만 분류가 다릅니다. ${eun(r.n)} ${r.ok.map((k) => CAT[k]).join(" 또는 ")} 퇴적암입니다. ${r.ok.includes("cl") ? "부서진 알갱이(쇄설물)가 쌓인 암석입니다." : r.ok.includes("or") && !r.ok.includes("ch") ? "생물의 몸이 쌓여 생겼습니다." : "물에 녹아 있던 물질이 가라앉아 생겼습니다."}`;
    else if (okC) msg = `분류는 맞았지만 이름이 다릅니다. ${r.gs ? "입자 크기 막대의 표시를 보세요. 자갈·모래·점토 경계는 2 mm와 1/16 mm입니다." : "성분과 특징을 다시 읽고, 묽은 염산도 떨어뜨려 보세요."}`;
    else msg = `둘 다 다릅니다. ${r.gs ? "알갱이 크기가 보이면 먼저 쇄설성을 떠올리세요." : "알갱이가 아니라 결정이나 생물 유해로 되어 있습니다."}`;
    say(msg, okC && okN ? "good" : "bad");
    $(".n-s").textContent = `${done.size} / ${ROCK.length}`;
    draw2();
  });
  showSample();
  draw1();
  if (/[?&]demo\b/.test(location.search)) {
    z = 3; $(".z").value = 3; draw1();
    cur = 4; showSample(); $(".b-acid").click();
    root.querySelector('[data-g="or"]').click(); root.querySelector('[data-n="석회암"]').click(); $(".b-judge").click();
  }
})();
