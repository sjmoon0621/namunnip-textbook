/* 카드: 약물은 시냅스의 어느 단계에 끼어들까? — 시냅스 틈의 신경 전달 물질 농도와 반응 (모식 모형, 상대값) */
(() => {
  const root = document.getElementById("card-bio-syndrug");
  if (!root) return;
  const { C, F, fit, clamp } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const S = { rel: $(".b-rel"), rec: $(".b-rec"), up: $(".b-up"), enz: $(".b-enz") };
  const O = { rel: $(".b-rel-out"), rec: $(".b-rec-out"), up: $(".b-up-out"), enz: $(".b-enz-out") };
  const nPeak = $(".c-peak"), nStay = $(".c-stay"), nResp = $(".c-resp"), msg = $(".drug-msg"), tName = $(".tr-name");

  // 신경 전달 물질마다 틈에서 없어지는 주된 길이 다르다 (재흡수 kr, 분해 kd; 상대값)
  const TR = {
    ach: { name: "아세틸콜린", kr: 0.03, kd: 0.6, where: "운동 뉴런과 근육 사이" },
    da: { name: "도파민", kr: 0.5, kd: 0.05, where: "뇌의 보상 회로" },
    ade: { name: "아데노신", kr: 0.3, kd: 0.2, where: "뇌 (깨어 있는 동안 쌓임)" },
  };
  const DRUG = {
    none: { tr: null, rel: 0, rec: 0, up: 0, enz: 0, text: "" },
    caffeine: { tr: "ade", rel: 0, rec: 50, up: 0, enz: 0, text: "카페인은 아데노신과 모양이 비슷해 아데노신 수용체에 먼저 붙지만 수용체를 작동시키지는 않습니다. 졸음 신호가 덜 전해집니다." },
    curare: { tr: "ach", rel: 0, rec: 95, up: 0, enz: 0, text: "쿠라레(남아메리카의 화살 독)는 근육의 아세틸콜린 수용체를 막습니다. 운동 뉴런이 흥분해도 근육이 수축하지 못해 마비가 옵니다." },
    cocaine: { tr: "da", rel: 0, rec: 0, up: 90, enz: 0, text: "코카인은 도파민 재흡수 운반체를 막습니다. 도파민이 틈에 오래 남아 수용체를 계속 자극합니다. 반복하면 뇌가 수용체를 줄이는 쪽으로 적응해 의존이 생깁니다." },
    op: { tr: "ach", rel: 0, rec: 0, up: 0, enz: 95, text: "유기 인계 살충제나 신경 작용제는 아세틸콜린 분해 효소를 막습니다. 아세틸콜린이 없어지지 않아 근육이 계속 자극받아 경련과 호흡 곤란이 생깁니다." },
    botox: { tr: "ach", rel: 90, rec: 0, up: 0, enz: 0, text: "보툴리눔 독소는 시냅스 소포가 막과 합쳐지지 못하게 해 아세틸콜린 분비를 막습니다. 아주 적은 양을 근육에 주사하면 그 근육만 풀리게 할 수 있어 의료에도 씁니다." },
  };
  let tr = "da", drug = "none";

  const TMAX = 40, DT = 0.02, PULSES = [4, 14, 24];
  function run(b) {
    const t0 = TR[tr], out = [];
    let c = 0;
    for (let t = 0; t <= TMAX; t += DT) {
      for (const p of PULSES) if (t <= p && t + DT > p) c += 1 * (1 - b.rel / 100);
      const k = t0.kr * (1 - b.up / 100) + t0.kd * (1 - b.enz / 100) + 0.01;
      c -= k * c * DT;
      const r = (1 - b.rec / 100) * c / (c + 0.6);
      out.push({ t, c, r });
    }
    return out;
  }
  const val = () => ({ rel: +S.rel.value, rec: +S.rec.value, up: +S.up.value, enz: +S.enz.value });
  const stats = (d) => {
    const pk = Math.max(...d.map((x) => x.c));
    const resp = d.reduce((s, x) => s + x.r, 0) * DT;
    const stay = d.filter((x) => x.c > 0.1).length * DT;
    return { pk, resp, stay };
  };

  const { ctx, size } = fit(cv, () => draw());
  let cur = null, base = null;

  function draw() {
    const { w, h } = size;
    if (!w || !cur) return;
    ctx.clearRect(0, 0, w, h);
    const stack = w < 560;
    const sb = stack ? { x: 0, y: 0, w, h: h * 0.4 } : { x: 0, y: 0, w: w * 0.4, h };
    const gb = stack ? { x: 36, y: h * 0.4 + 26, w: w - 46, h: h * 0.6 - 60 } : { x: w * 0.4 + 36, y: 24, w: w * 0.6 - 46, h: h - 58 };
    drawSyn(sb);
    // 그래프 두 칸: 위 농도, 아래 반응
    const gh = (gb.h - 20) / 2;
    const X = (t) => gb.x + t / TMAX * gb.w;
    const cmax = Math.max(2.2, ...cur.map((d) => d.c), ...base.map((d) => d.c)) * 1.05;
    const panel = (y0, key, ymax, label, col) => {
      const Y = (v) => y0 + (1 - v / ymax) * gh;
      NM.axes(ctx, { x0: gb.x, y0, w: gb.w, h: gh, X, Y, xt: [], yt: [[0, "0"]], ylabel: label });
      const line = (d, dash, c, lw) => { ctx.setLineDash(dash); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); d.forEach((p, i) => i ? ctx.lineTo(X(p.t), Y(p[key])) : ctx.moveTo(X(p.t), Y(p[key]))); ctx.stroke(); ctx.setLineDash([]); };
      line(base, [5, 4], C.ink3, 1.3);
      line(cur, [], col, 2.2);
    };
    panel(gb.y, "c", cmax, "시냅스 틈의 농도 (상대값)", C.forest);
    panel(gb.y + gh + 20, "r", 1, "시냅스 이후 뉴런의 반응 (상대값)", C.warn);
    ctx.font = `10.5px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "center";
    PULSES.forEach((p) => { ctx.fillText("↑", X(p), gb.y + 2 * gh + 34); });
    ctx.textAlign = "right"; ctx.fillText("↑ 흥분 도착 · 시간 →", gb.x + gb.w, gb.y + 2 * gh + 48);
  }

  function drawSyn(b) {
    const { x, y, w, h } = b, v = val();
    ctx.save();
    ctx.fillStyle = "#f6f1e4"; ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
    const cx = x + w / 2, gapY = y + h * 0.52, g = Math.max(12, h * 0.07);
    // 위: 시냅스 이전 말단, 아래: 시냅스 이후 막
    ctx.fillStyle = "#eee6cf"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(x + w * 0.12, y + 12, w * 0.76, gapY - g / 2 - y - 12, [4, 4, 30, 30]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#e9eee3";
    ctx.beginPath(); ctx.roundRect(x + w * 0.06, gapY + g / 2, w * 0.88, y + h - 12 - gapY - g / 2, [8, 8, 4, 4]); ctx.fill(); ctx.stroke();
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
    ctx.fillText("시냅스 이전", x + w * 0.12 + 6, y + 25);
    ctx.fillText("시냅스 이후", x + w * 0.06 + 6, y + h - 18);
    // 소포
    const vr = Math.max(6, Math.min(10, h * 0.045));
    [[0.4, 0.5], [0.52, 0.42], [0.64, 0.52]].forEach(([fx, fy]) => {
      ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x + w * fx, y + (gapY - y) * fy + 8, vr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    // 틈의 분자 수: 첫 흥분 직후 농도에 비례
    const c1 = cur[Math.round(5 / DT)].c, nMol = Math.round(clamp(c1, 0, 3) * 7);
    for (let i = 0; i < nMol; i++) {
      ctx.fillStyle = C.forest; ctx.beginPath();
      ctx.arc(x + w * (0.25 + ((i * 29) % 50) / 100), gapY + (((i * 17) % 10) / 10 - 0.5) * g * 0.8, 2.3, 0, Math.PI * 2); ctx.fill();
    }
    // 네 곳: ① 분비 ② 수용체 ③ 재흡수 운반체 ④ 분해 효소
    const site = (px, py, lab, block, key) => {
      const on = block > 0;
      ctx.fillStyle = on ? C.warn : C.ink2; ctx.font = `600 11px ${F.sans}`; ctx.textAlign = "center";
      ctx.fillText(on ? `${lab} ${block}% 억제` : lab, px, py);
    };
    // 분비
    ctx.fillStyle = v.rel ? C.warn : C.ink3; ctx.beginPath(); ctx.arc(cx, gapY - g / 2 - 2, 4, 0, Math.PI * 2); ctx.fill();
    site(x + w * 0.56, y + 26, "① 분비", v.rel);
    // 수용체
    [0.3, 0.45, 0.6, 0.75].forEach((f) => { ctx.fillStyle = v.rec ? C.warn : "#6e8a5f"; ctx.fillRect(x + w * f - 5, gapY + g / 2, 10, 7); if (v.rec) { ctx.fillStyle = "#7a5aa6"; ctx.beginPath(); ctx.arc(x + w * f, gapY + g / 2 - 1, 3, 0, Math.PI * 2); ctx.fill(); } });
    site(x + w * 0.5, gapY + g / 2 + 24, "② 수용체", v.rec);
    // 재흡수 운반체 (시냅스 이전 막 가장자리)
    ctx.fillStyle = v.up ? C.warn : "#3f6f9f"; ctx.fillRect(x + w * 0.8 - 4, gapY - g / 2 - 9, 8, 9);
    site(x + w * 0.74, gapY - g / 2 - 10, "③ 재흡수", v.up);
    // 분해 효소 (틈 안)
    ctx.fillStyle = v.enz ? C.warn : "#8a6b3a"; ctx.beginPath(); ctx.moveTo(x + w * 0.16, gapY - 5); ctx.lineTo(x + w * 0.16 + 9, gapY); ctx.lineTo(x + w * 0.16, gapY + 5); ctx.fill();
    site(x + w * 0.3, gapY - g / 2 - 10, "④ 분해", v.enz);
    ctx.restore();
  }

  function update() {
    for (const k in S) O[k].textContent = S[k].value;
    const b = val();
    cur = run(b); base = run({ rel: 0, rec: 0, up: 0, enz: 0 });
    const s = stats(cur), s0 = stats(base);
    nPeak.textContent = `× ${(s.pk / s0.pk).toFixed(1)}`;
    nStay.textContent = `× ${(s.stay / s0.stay).toFixed(1)}`;
    nResp.textContent = `${Math.round(s.resp / s0.resp * 100)}%`;
    nResp.className = "c-resp" + (s.resp / s0.resp > 1.3 ? " bad" : s.resp / s0.resp < 0.7 ? " bad" : "");
    tName.textContent = `${TR[tr].name} · ${TR[tr].where}`;
    msg.textContent = DRUG[drug].text || "점선은 약물이 없을 때입니다. 슬라이더로 한 단계씩 막아 보고 곡선이 어떻게 달라지는지 비교하세요.";
    draw();
  }
  for (const k in S) S[k].addEventListener("input", () => { drug = "none"; mark(); update(); });
  const mark = () => {
    root.querySelectorAll("[data-drug]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.drug === drug ? "true" : "false"));
    root.querySelectorAll("[data-tr]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.tr === tr ? "true" : "false"));
  };
  root.querySelectorAll("[data-drug]").forEach((b) => b.addEventListener("click", () => {
    drug = b.dataset.drug; const d = DRUG[drug];
    if (d.tr) tr = d.tr;
    S.rel.value = d.rel; S.rec.value = d.rec; S.up.value = d.up; S.enz.value = d.enz;
    mark(); update();
  }));
  root.querySelectorAll("[data-tr]").forEach((b) => b.addEventListener("click", () => { tr = b.dataset.tr; mark(); update(); }));
  mark(); update();
})();
