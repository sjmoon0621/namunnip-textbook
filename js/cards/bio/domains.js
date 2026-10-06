/* 카드: 처음 보는 생물을 3역 6계 중 어디에 넣을까? — 특징을 질문으로 확인하고 역·계를 정한 뒤 계통 그림에 놓기 */
(() => {
  const root = document.getElementById("card-bio-domains");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const Q = ["핵막이 있나요?", "세포벽 성분은?", "세포 수와 몸의 분화는?", "영양 방식은?", "리보솜 RNA 계통은?"];
  const KN = { bac: "진정세균계", arc: "고세균계", pro: "원생생물계", pla: "식물계", fun: "균계", ani: "동물계" };
  const DN = { B: "세균역", A: "고세균역", E: "진핵생물역" };
  const DOM = { bac: "B", arc: "A", pro: "E", pla: "E", fun: "E", ani: "E" };
  const KRULE = {
    bac: "진정세균계는 핵막이 없고 세포벽에 펩티도글리칸이 있는 원핵생물입니다.",
    arc: "고세균계는 핵막이 없지만 세포벽에 펩티도글리칸이 없고, rRNA 서열이 세균과 다른 원핵생물입니다.",
    pro: "원생생물계는 핵막이 있지만 식물·균·동물 어디에도 들지 않는 생물로, 대부분 단세포이고 다세포라도 조직 분화가 거의 없습니다.",
    pla: "식물계는 셀룰로스 세포벽, 광합성, 다세포의 몸에 더해 배(embryo)를 만드는 생물입니다.",
    fun: "균계는 키틴이 든 세포벽을 갖고, 소화 효소를 내보낸 뒤 양분을 흡수하는 종속 영양 생물입니다.",
    ani: "동물계는 세포벽이 없고, 먹이를 몸속으로 섭취하는 다세포 종속 영양 생물입니다.",
  };
  const ORG = [
    ["ecoli", "대장균", "bac", ["없음 (원핵세포)", "펩티도글리칸", "단세포", "흡수 (종속 영양)", "세균 무리"], "사람의 큰창자에 사는 대표적인 세균입니다."],
    ["metha", "메테인 생성균", "arc", ["없음 (원핵세포)", "펩티도글리칸 없음 (단백질 등)", "단세포", "화학 합성 (H₂ + CO₂ → CH₄, 독립 영양)", "고세균 무리"], "소의 위, 논, 늪 바닥처럼 산소가 없는 곳에 사는 고세균입니다. 겉모습은 세균과 비슷하지만 rRNA 계통이 다릅니다."],
    ["amoeba", "아메바", "pro", ["있음", "없음", "단세포", "섭취 (위족으로 먹이를 감쌈)", "진핵생물 무리"], "움직이고 먹이를 먹지만 단세포라 동물계가 아닙니다."],
    ["param", "짚신벌레", "pro", ["있음 (대핵과 소핵)", "없음", "단세포", "섭취 (섬모로 먹이를 모음)", "진핵생물 무리"], "섬모로 헤엄치는 단세포 진핵생물입니다. 운동성만 보고 동물로 분류하면 안 됩니다."],
    ["spiro", "해캄", "pro", ["있음", "셀룰로스", "다세포 (실 모양, 조직 분화 없음)", "광합성", "진핵생물 무리"], "광합성을 하고 셀룰로스 세포벽이 있지만 배를 만들지 않고 조직이 분화하지 않아 원생생물계(녹조류)에 넣습니다. 계통으로는 식물과 가깝습니다."],
    ["yeast", "효모", "fun", ["있음", "키틴 포함 (글루칸이 주성분)", "단세포", "흡수 (발효)", "진핵생물 무리"], "단세포지만 키틴이 든 세포벽과 흡수 영양을 가진 균류입니다."],
    ["mush", "버섯 (표고)", "fun", ["있음", "키틴", "다세포 (균사, 조직 분화 없음)", "흡수 (죽은 나무를 분해)", "진핵생물 무리"], "식물처럼 땅에서 자라지만 광합성을 하지 않고 키틴 세포벽을 가진 균계입니다."],
    ["moss", "이끼 (솔이끼)", "pla", ["있음", "셀룰로스", "다세포 (배를 만들고, 헛뿌리·줄기·잎 모양 구분)", "광합성", "진핵생물 무리"], "관다발은 없지만 배를 만들어 땅 위 생활에 적응한 식물계입니다."],
    ["jelly", "해파리", "ani", ["있음", "없음", "다세포 (자포·신경망 등 조직 분화)", "섭취 (촉수로 먹이를 잡음)", "진핵생물 무리"], "몸이 대부분 물이고 뼈가 없어도 다세포 종속 영양 생물인 동물계(자포동물)입니다."],
    ["human", "사람", "ani", ["있음", "없음", "다세포 (기관계까지 분화)", "섭취", "진핵생물 무리"], "세포벽이 없고 먹이를 섭취하는 다세포 생물, 동물계입니다."],
  ];
  const st = {};
  let cur = "ecoli", gd = null, gk = null, firstOk = 0, flash = null;
  const fresh = () => { ORG.forEach((o) => (st[o[0]] = { rev: new Set(), ok: false, tries: 0 })); firstOk = 0; };
  fresh();
  const org = () => ORG.find((o) => o[0] === cur);

  $(".orgs").insertAdjacentHTML("beforeend", ORG.map((o) => `<button class="chip" type="button" data-o="${o[0]}" aria-pressed="false">${o[1]}</button>`).join(""));
  $(".feat").innerHTML = Q.map((q, i) => `<button class="chip" type="button" data-q="${i}">${q}</button><span class="ans" data-a="${i}">?</span>`).join("");

  const { ctx, size } = fit($("canvas"), () => draw());
  function box(x, y, bw, bh, label, o = {}) {
    ctx.fillStyle = o.fill || C.card; ctx.strokeStyle = o.stroke || C.rule; ctx.lineWidth = o.lw || 1;
    ctx.fillRect(x - bw / 2, y - bh / 2, bw, bh); ctx.strokeRect(x - bw / 2 + 0.5, y - bh / 2 + 0.5, bw - 1, bh - 1);
    ctx.fillStyle = o.ink || C.ink; ctx.font = `${o.bold ? "600 " : ""}11px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(label, x, y + 4);
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const pad = 8, cw = (w - 2 * pad) / 6, kx = (i) => pad + (i + 0.5) * cw;
    const yR = Math.max(20, h * 0.1), yAE = h * 0.22, yD = h * 0.38, yK = h * 0.58, kw = Math.min(cw - 6, 82);
    const xB = kx(0), xA = kx(1), xE = (kx(2) + kx(5)) / 2, xAE = (xA + xE) / 2, xR = (xB + xAE) / 2;
    ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.3; ctx.beginPath();
    ctx.moveTo(xB, yD - 10); ctx.lineTo(xB, yR); ctx.lineTo(xAE, yR); ctx.lineTo(xAE, yAE);
    ctx.moveTo(xA, yD - 10); ctx.lineTo(xA, yAE); ctx.lineTo(xE, yAE); ctx.lineTo(xE, yD - 10);
    ctx.moveTo(xB, yD + 10); ctx.lineTo(xB, yK - 11); ctx.moveTo(xA, yD + 10); ctx.lineTo(xA, yK - 11);
    ctx.moveTo(xE, yD + 10); ctx.lineTo(xE, yD + 22); ctx.moveTo(kx(2), yD + 22); ctx.lineTo(kx(5), yD + 22);
    for (let i = 2; i < 6; i++) { ctx.moveTo(kx(i), yD + 22); ctx.lineTo(kx(i), yK - 11); }
    ctx.stroke();
    ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("공통 조상", xR, yR - 6);
    const res = flash && flash.o === cur ? flash : null;
    const dOpt = (d) => {
      const right = res && DOM[org()[2]] === d, wrong = res && res.d === d && !right;
      return { bold: true, lw: gd === d ? 2.2 : 1, stroke: gd === d ? C.ink : C.rule, fill: right ? "#dcebd5" : wrong ? "#f3dcd2" : C.card };
    };
    box(xB, yD, kw, 20, "세균역", dOpt("B"));
    box(xA, yD, kw, 20, "고세균역", dOpt("A"));
    box(xE, yD, Math.min(kx(5) - kx(2) - 30, 120), 20, "진핵생물역", dOpt("E"));
    Object.keys(KN).forEach((k, i) => {
      const right = res && org()[2] === k, wrong = res && res.k === k && !right;
      box(kx(i), yK, kw, 22, KN[k], { lw: gk === k ? 2.2 : 1, stroke: gk === k ? C.ink : C.rule, fill: right ? "#dcebd5" : wrong ? "#f3dcd2" : C.card });
      const got = ORG.filter((o) => o[2] === k && st[o[0]].ok);
      ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.forest; ctx.textAlign = "center";
      got.forEach((o, j) => ctx.fillText(o[1].replace(/ \(.*\)/, ""), kx(i), yK + 28 + j * 15));
    });
    const o = org();
    ctx.textAlign = "left"; ctx.fillStyle = C.ink; ctx.font = `600 12px ${F.sans}`;
    ctx.fillText(`지금 분류할 생물: ${o[1]}`, pad, h - 8);
    ctx.textAlign = "right"; ctx.fillStyle = C.ink3; ctx.font = `10.5px ${F.mono}`;
    ctx.fillText(`확인한 특징 ${st[cur].rev.size}/5`, w - pad, h - 8);
  }
  function sync() {
    const o = org(), s = st[cur];
    root.querySelectorAll("[data-o]").forEach((b) => { b.setAttribute("aria-pressed", String(b.dataset.o === cur)); b.classList.toggle("done", st[b.dataset.o].ok); });
    root.querySelectorAll("[data-a]").forEach((a) => { const i = +a.dataset.a, on = s.rev.has(i); a.textContent = on ? o[3][i] : "?"; a.classList.toggle("on", on); });
    root.querySelectorAll("[data-d]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.d === gd)));
    root.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === gk)));
    $(".n-done").textContent = `${ORG.filter((x) => st[x[0]].ok).length} / ${ORG.length}`;
    $(".n-q").textContent = `${s.rev.size} / 5`;
    $(".n-first").textContent = firstOk;
    root.querySelectorAll("[data-row]").forEach((td) => { const g = ORG.filter((x) => x[2] === td.dataset.row && st[x[0]].ok).map((x) => x[1]); td.textContent = g.length ? g.join(", ") : "—"; });
    draw();
  }
  function say(t, cls) { const v = $(".verdict"); v.textContent = t; v.className = "verdict small " + (cls || ""); }
  function judge() {
    const o = org(), s = st[cur], kd = o[2], dd = DOM[kd];
    if (!gd || !gk) { say("역과 계를 하나씩 고르세요."); return; }
    if (DOM[gk] !== gd) { say(`${KN[gk]}는 ${DN[DOM[gk]]}에 속합니다. 고른 역과 계가 서로 맞지 않습니다.`, "bad"); return; }
    s.tries++; flash = { o: cur, d: gd, k: gk };
    if (gk === kd) {
      if (!s.ok && s.tries === 1) firstOk++;
      s.ok = true;
      say(`맞습니다. ${o[1]}: ${DN[dd]} ${KN[kd]}. ${o[4]} (질문 ${s.rev.size}개 사용)`, "good");
    } else {
      let why;
      if (gd !== dd) {
        if (dd === "E") why = "핵막이 있으므로 진핵생물입니다.";
        else if (gd === "E") why = "핵막이 없으므로 원핵생물(세균 또는 고세균)입니다.";
        else if (dd === "A") why = "핵막이 없는 점은 세균과 같지만, 세포벽에 펩티도글리칸이 없고 rRNA 계통이 고세균입니다.";
        else why = "세포벽에 펩티도글리칸이 있고 rRNA 계통이 세균입니다.";
      } else why = KRULE[kd];
      const hint = s.rev.size < 5 ? " 아직 확인하지 않은 특징을 물어보세요." : "";
      say(`아닙니다. ${why}${hint}`, "bad");
    }
    sync();
  }
  root.addEventListener("click", (e) => {
    const t = e.target.closest("button"); if (!t) return;
    const d = t.dataset;
    if (d.o) { cur = d.o; gd = null; gk = null; flash = null; say(""); }
    else if (d.q != null) st[cur].rev.add(+d.q);
    else if (d.d) { gd = d.d; if (gk && DOM[gk] !== gd) gk = null; }
    else if (d.k) { gk = d.k; gd = DOM[gk]; }
    else if (t.classList.contains("judge")) { judge(); return; }
    else if (t.classList.contains("reset")) { fresh(); cur = "ecoli"; gd = gk = null; flash = null; say(""); }
    else return;
    sync();
  });
  sync();
  if (/[?&]demo\b/.test(location.search)) {
    [["ecoli", [0, 1], "bac"], ["metha", [0, 1, 4], "arc"], ["amoeba", [0, 1, 2], "pro"], ["mush", [0, 1, 3], "fun"], ["human", [0, 1, 2], "ani"]].forEach(([o, qs, k]) => {
      cur = o; qs.forEach((i) => st[o].rev.add(i)); gk = k; gd = DOM[k]; judge();
    });
    cur = "spiro"; [0, 1, 3].forEach((i) => st.spiro.rev.add(i)); gk = "pla"; gd = "E"; judge();
  }
})();
