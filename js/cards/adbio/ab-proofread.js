/* 카드: DNA 복제의 교정과 뉴클레오타이드 절제 수선 (모식, 오류율은 자릿수 대략값) */
(() => {
  const root = document.getElementById("card-adbio-proofread");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const cv = $("canvas");
  const S = { mode: "fix", g: 4.6e6, step: 0 };
  /* 대장균 기준 대략값: 염기 선택 1e-5, 교정 1e-2배, 불일치 수선 1e-3배 */
  const R0 = 1e-5, EXO = 1e-2, MMR = 1e-3;
  const TOP = "ATGCAGCGCATTAGCCTACGGATC";
  const COMP = { A: "T", T: "A", G: "C", C: "G" };
  const BOT = [...TOP].map((b) => COMP[b]).join("");
  const D0 = 10, D1 = 11, CUT0 = 3, CUT1 = 15;
  const STEPS = [
    ["0 · 손상", "—", "—", "티민 이량체: 이중 나선이 휨"],
    ["1 · 인식", "UvrA·UvrB (사람: XPC 등)", "—", "휘어진 자리를 찾아 붙음"],
    ["2 · 양쪽 절단", "UvrC (핵산 내부 가수 분해 효소)", "—", "손상 양쪽 골격이 끊김"],
    ["3 · 조각 제거", "UvrD (헬리케이스)", "—", "13 nt 빈자리, 반대 가닥만 남음"],
    ["4 · 틈 메우기", "DNA 중합 효소 Ⅰ", "반대쪽 온전한 가닥", "새 뉴클레오타이드로 채움"],
    ["5 · 연결", "DNA 연결 효소", "—", "골격이 이어져 수선 완료"],
  ];
  const { ctx, size } = fit(cv, () => draw());
  const sup = (n) => String(n).replace(/-/g, "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  const fmt = (x) => {
    if (x >= 100) return Math.round(x).toLocaleString();
    if (x >= 1) return x.toFixed(1);
    const e = Math.floor(Math.log10(x)), m = x / 10 ** e;
    return `${m.toFixed(1)} × 10${sup(e)}`;
  };
  function rates() {
    const a = R0, b = $(".t-exo").checked ? a * EXO : a, c = $(".t-mmr").checked ? b * MMR : b;
    return [a, b, c];
  }
  function box(x, y, s, ch, fill, stroke, txt) {
    ctx.fillStyle = fill; ctx.fillRect(x, y, s - 1, s - 1);
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, y + 0.5, s - 2, s - 2); }
    ctx.fillStyle = txt || C.ink; ctx.font = `${Math.round(s * 0.55)}px ${F.mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(ch, x + s / 2, y + s / 2 + 1); ctx.textBaseline = "alphabetic";
  }
  function drawFix(w, h) {
    /* 위: 교정 모식 */
    const n = 16, s = Math.min(20, (w - 60) / n), x0 = 30, yT = 64, yN = yT - s - 3;
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("3′", x0 - 4, yT + s * 0.7); ctx.fillText("5′", x0 - 4, yN + s * 0.7);
    ctx.textAlign = "left"; ctx.fillText("주형 가닥", x0 + n * s + 4, yT + s * 0.7);
    for (let i = 0; i < n; i++) box(x0 + i * s, yT, s, BOT[i], "#e9ebe4", null, C.ink2);
    const exo = $(".t-exo").checked, k = 10;
    for (let i = 0; i < k; i++) {
      const bad = i === k - 1;
      box(x0 + i * s, yN, s, bad ? "G" : TOP[i], bad ? "#f3d2c8" : "#d5e8cf", bad ? C.warn : null, bad ? C.warn : C.ink);
    }
    const px = x0 + (k - 1) * s + s / 2;
    ctx.strokeStyle = "rgba(63,111,163,.8)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(px + s * 0.8, yN + s * 0.6, s * 2.6, s * 1.6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#3f6fa3"; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText("DNA 중합 효소", px + s * 3.6, yN - 4);
    ctx.fillStyle = exo ? C.forest : C.warn;
    ctx.fillText(exo ? "3′ 끝 G–T 어긋남 → 되돌아가 잘라 냄" : "교정 없음 → 틀린 G를 두고 계속 합성", x0, 16);
    if (exo) {
      ctx.strokeStyle = C.forest; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.arc(px, yN - 6, s * 0.9, Math.PI * 0.05, Math.PI * 0.95, true); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - s * 0.9, yN - 5); ctx.lineTo(px - s * 0.9 - 3, yN - 11); ctx.lineTo(px - s * 0.9 + 4, yN - 10); ctx.fill();
    }
    /* 아래: 단계별 오류율 (로그) */
    const r = rates(), gx0 = 58, gx1 = w - 14, gy0 = h - 30, gy1 = 118;
    const L0 = -11, L1 = -4, Y = (v) => gy0 - (Math.log10(v) - L0) / (L1 - L0) * (gy0 - gy1);
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.textAlign = "right";
    for (let e = L0; e <= L1; e++) {
      const y = Math.round(Y(10 ** e)) + 0.5;
      ctx.beginPath(); ctx.moveTo(gx0, y); ctx.lineTo(gx1, y); ctx.stroke();
      if ((e - L0) % 2 === 1 || e === L1) ctx.fillText(`10${sup(e)}`, gx0 - 5, y + 3);
    }
    ctx.textAlign = "left"; ctx.fillText("염기쌍당 오류율 (로그 눈금)", gx0, gy1 - 8);
    const labs = ["염기 선택", "+ 교정", "+ 불일치 수선"], on = [true, $(".t-exo").checked, $(".t-mmr").checked];
    const bw = (gx1 - gx0) / 3;
    r.forEach((v, i) => {
      const x = gx0 + i * bw + bw * 0.2, y = Y(v);
      ctx.fillStyle = on[i] ? (i === 2 ? C.forest : i === 1 ? C.leaf : "#9aa59a") : "#d9dad2";
      ctx.fillRect(x, y, bw * 0.6, gy0 - y);
      ctx.fillStyle = C.ink; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center";
      ctx.fillText(`10${sup(Math.round(Math.log10(v)))}`, x + bw * 0.3, y - 4);
      ctx.fillStyle = on[i] ? C.ink2 : C.ink3; ctx.font = `10.5px ${F.sans}`;
      ctx.fillText(on[i] ? labs[i] : labs[i] + " (끔)", x + bw * 0.3, gy0 + 14);
    });
    const yl = Y(1 / S.g);
    ctx.strokeStyle = C.warn; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(gx0, yl); ctx.lineTo(gx1, yl); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.warn; ctx.font = `10px ${F.sans}`; ctx.textAlign = "right";
    ctx.fillText("이 선 아래 = 복제 1회에 오류 1개 미만", gx1, yl - 4);
  }
  function drawNer(w, h) {
    const n = TOP.length, s = Math.min(17, (w - 50) / n), x0 = (w - n * s) / 2, yT = h * 0.5, yB = yT + s + 3;
    const st = S.step, both = $(".t-both").checked, lig = $(".t-lig").checked;
    const stuck = both && st >= 4;
    ctx.font = `10px ${F.mono}`; ctx.fillStyle = C.ink3; ctx.textAlign = "right";
    ctx.fillText("5′", x0 - 4, yT + s * 0.7); ctx.fillText("3′", x0 - 4, yB + s * 0.7);
    ctx.textAlign = "left"; ctx.fillText("3′", x0 + n * s + 4, yT + s * 0.7); ctx.fillText("5′", x0 + n * s + 4, yB + s * 0.7);
    const inFrag = (i) => i >= CUT0 && i <= CUT1;
    for (let i = 0; i < n; i++) {
      const dmg = i === D0 || i === D1;
      if (st >= 3 && inFrag(i)) {
        if (st >= 4 && !stuck) box(x0 + i * s, yT, s, TOP[i], "#cfe3f5", "#3f6fa3", C.ink);
        else { ctx.strokeStyle = C.rule; ctx.setLineDash([2, 2]); ctx.strokeRect(x0 + i * s + 0.5, yT + 0.5, s - 2, s - 2); ctx.setLineDash([]); }
      } else box(x0 + i * s, yT, s, TOP[i], dmg ? "#f3d2c8" : "#e9ebe4", dmg ? C.warn : null, dmg ? C.warn : C.ink);
      const bd = both && (i === D0 || i === D1);
      box(x0 + i * s, yB, s, BOT[i], bd ? "#f3d2c8" : "#e9ebe4", bd ? C.warn : null, bd ? C.warn : C.ink2);
    }
    /* 티민 이량체 표시 */
    if (st < 3) {
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(x0 + D0 * s + s / 2, yT - 3); ctx.lineTo(x0 + D0 * s + s / 2, yT - 8); ctx.lineTo(x0 + D1 * s + s / 2, yT - 8); ctx.lineTo(x0 + D1 * s + s / 2, yT - 3); ctx.stroke();
    }
    ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center";
    if (st === 0) { ctx.fillStyle = C.warn; ctx.fillText("자외선 → 이웃한 T 두 개가 공유 결합 (티민 이량체)", w / 2, yT - 18); }
    if (st === 1) {
      ctx.strokeStyle = "#3f6fa3"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x0 + (D0 + 1) * s, yT + s, s * 3.2, s * 1.8, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#3f6fa3"; ctx.fillText("인식 단백질이 휘어진 자리에 붙음", w / 2, yT - 30);
    }
    if (st >= 2) {
      const cuts = [CUT0, CUT1 + 1];
      cuts.forEach((c, j) => {
        const x = x0 + c * s - 0.5, sealed = j === 0 ? st >= 4 && !stuck : st >= 5 && !lig && !stuck;
        if (st === 2 || (st >= 4 && !sealed && !stuck)) {
          ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, yT - 6); ctx.lineTo(x, yT + s + 1); ctx.stroke();
        }
      });
      if (st === 2) { ctx.fillStyle = C.warn; ctx.fillText("손상 양쪽의 당–인산 골격을 자름 (13 nt 조각)", w / 2, yT - 18); }
    }
    if (st >= 3) {
      const fy = h * 0.16;
      for (let i = CUT0; i <= CUT1; i++) {
        const dmg = i === D0 || i === D1;
        box(x0 + i * s, fy, s, TOP[i], dmg ? "#f3d2c8" : "#eeeeea", dmg ? C.warn : null, dmg ? C.warn : C.ink3);
      }
      ctx.fillStyle = C.ink3; ctx.fillText("떼어 낸 조각 (분해됨)", w / 2, fy - 6);
    }
    let msg = "", col = C.ink2;
    if (st === 4) msg = stuck ? "주형이 망가져 무엇을 넣을지 알 수 없음" : "온전한 반대 가닥을 주형으로 5′→3′ 합성";
    if (st === 5) msg = stuck ? "수선 실패: 다른 경로가 필요" : lig ? "연결 효소가 없어 틈(nick)이 남음" : "골격이 이어져 원래 서열로 복구";
    if (st >= 4) { col = stuck || (st === 5 && lig) ? C.warn : C.forest; ctx.fillStyle = col; ctx.fillText(msg, w / 2, yB + s + 24); }
    ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.fillText("위: 손상된 가닥 · 아래: 반대쪽 가닥", w / 2, h - 10);
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (S.mode === "fix") drawFix(w, h); else drawNer(w, h);
  }
  function update() {
    root.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === S.mode)));
    root.querySelectorAll("[data-g]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.g === S.g)));
    root.querySelectorAll(".pr-mode").forEach((p) => { p.hidden = p.dataset.p !== S.mode; });
    const r = rates(), full = R0 * EXO * MMR;
    $(".n-r").textContent = `10${sup(Math.round(Math.log10(r[2])))}`;
    const e = r[2] * S.g, ne = $(".n-e");
    ne.textContent = `약 ${fmt(e)}개`; ne.className = e >= 1 ? "n-e bad" : "n-e good";
    $(".n-x").textContent = `${Math.round(r[2] / full).toLocaleString()}배`;
    const st = S.step, both = $(".t-both").checked, lig = $(".t-lig").checked, row = STEPS[st];
    $(".pr-lab").textContent = row[0];
    $(".n-w").textContent = st === 5 && lig ? "(연결 효소 없음)" : row[1];
    $(".n-t").textContent = st === 4 && both ? "없음 (양쪽 손상)" : row[2];
    let state = row[3];
    if (both && st >= 4) state = "틈을 메우지 못함";
    else if (st === 5 && lig) state = "틈(nick) 1곳이 남음";
    const ns = $(".n-s"); ns.textContent = state;
    ns.className = (both && st >= 4) || (st === 5 && lig) ? "n-s bad" : st === 5 ? "n-s good" : "n-s";
    $(".pr-back").disabled = st === 0; $(".pr-fwd").disabled = st === STEPS.length - 1;
    draw();
  }
  root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { S.mode = b.dataset.m; update(); }));
  root.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => { S.g = +b.dataset.g; update(); }));
  root.querySelectorAll("input[type=checkbox]").forEach((c) => c.addEventListener("change", update));
  $(".pr-back").addEventListener("click", () => { S.step = Math.max(0, S.step - 1); update(); });
  $(".pr-fwd").addEventListener("click", () => { S.step = Math.min(STEPS.length - 1, S.step + 1); update(); });
  if (/[?&]demo/.test(location.search)) { S.mode = "ner"; S.step = 4; }
  update();
})();
