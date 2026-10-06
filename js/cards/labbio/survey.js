/* 카드: 우리 반과 가족을 조사하면 사람 형질의 유전 방식을 알 수 있을까? — 가상 설문(본인·부모), 성별 비율, 부모 조합별 자녀 비율, 표본 크기 */
(() => {
  const root = document.getElementById("card-labbio-survey");
  if (!root) return;
  const { C, F, fit } = NM;
  const L = NMLab;
  const $ = (s) => root.querySelector(s);
  const g = L.gauss;
  const pct = (k, n) => (n ? (100 * k / n).toFixed(1) + "%" : "—");

  /* 다인자 모식 모형: 부모 성향 lm, lf ~ N(0,1), 자녀 = 0.45(lm+lf) + 0.77·N(0,1) (분산 1 유지) */
  const child = (lm, lf) => 0.45 * (lm + lf) + 0.771 * g();
  const ABO_P = { A: 0.26, B: 0.21, O: 0.53 };
  const allele = () => { const r = Math.random(); return r < ABO_P.A ? "A" : r < ABO_P.A + ABO_P.B ? "B" : "O"; };
  const aboType = (a, b) => (a === b ? (a === "O" ? "O" : a) : a === "O" ? b : b === "O" ? a : "AB");
  const pick = (gt) => gt[Math.random() < 0.5 ? 0 : 1];
  const Q = 0.059;   // 적록 색각 이상 대립유전자 빈도 (남자 비율과 같음)

  function person() {
    const sex = Math.random() < 0.5 ? "m" : "f";
    const lm = g(), lf = g(), lc = child(lm, lf);
    const em = g(), ef = g(), ec = child(em, ef);
    const ear = (l) => (l > 0 ? "free" : l < -0.4 ? "att" : "amb");
    const mom = [allele(), allele()], dad = [allele(), allele()], me = [pick(mom), pick(dad)];
    const mx = [Math.random() < Q, Math.random() < Q], dx = Math.random() < Q;
    const myx = sex === "m" ? [pick(mx)] : [pick(mx), dx];
    return {
      sex,
      tongue: { me: lc > -0.524, m: lm > -0.524, f: lf > -0.524 },
      ear: { me: ear(ec), m: ear(em), f: ear(ef) },
      abo: { me: aboType(...me), m: aboType(...mom), f: aboType(...dad) },
      cvd: { me: myx.every(Boolean), m: mx[0] && mx[1], f: dx },
    };
  }

  /* 형질별 요약: 왼쪽·오른쪽 막대, 수치 세 칸, 표 한 줄 */
  const TR = {
    tongue: {
      name: "혀 말기",
      sum(S) {
        const sx = (s) => S.filter((p) => p.sex === s), k = (a) => a.filter((p) => p.tongue.me).length;
        const fam = (a, b) => S.filter((p) => p.tongue.m + p.tongue.f === a + b);
        const nn = fam(0, 0), ny = fam(1, 0), yy = fam(1, 1);
        const kn = k(nn);
        return {
          lt: "본인이 혀를 말 수 있는 비율", left: [{ label: "남", k: k(sx("m")), n: sx("m").length }, { label: "여", k: k(sx("f")), n: sx("f").length }],
          rt: "부모 조합별: 자녀가 말 수 있는 비율", right: [{ label: "둘 다 가능", k: k(yy), n: yy.length }, { label: "한 명만", k: k(ny), n: ny.length }, { label: "둘 다 불가", k: kn, n: nn.length, warn: true }],
          nums: [["전체 중 가능", pct(k(S), S.length)], ["둘 다 불가 부모의 자녀 중 가능", nn.length ? `${kn}/${nn.length}명` : "해당 없음"], ["단순 우성 모형", nn.length < 5 ? "판단 보류 (가족 수 적음)" : kn > 0 ? "모순 (불가×불가 → 가능)" : "아직 모순 없음", nn.length >= 5 && kn > 0 ? "bad" : ""]],
          fam: nn.length ? `불가×불가 → 가능 ${pct(kn, nn.length)}` : "—",
          msg: kn ? `둘 다 혀를 말지 못하는 부모에게서 <b>혀를 말 수 있는 자녀 ${kn}명</b>이 나왔습니다. 단순 우성이라면 일어날 수 없는 일입니다.` : "‘둘 다 불가’ 가족에서 아직 혀를 말 수 있는 자녀가 나오지 않았습니다. 가족 수가 충분한가요?",
        };
      },
    },
    ear: {
      name: "귓불 모양",
      sum(S) {
        const sx = (s) => S.filter((p) => p.sex === s), k = (a, v = "att") => a.filter((p) => p.ear.me === v).length;
        const aa = S.filter((p) => p.ear.m === "att" && p.ear.f === "att"), ff = S.filter((p) => p.ear.m === "free" && p.ear.f === "free");
        const kf = k(aa, "free");
        return {
          lt: "본인 귓불 응답 비율", left: [{ label: "분리형", k: k(S, "free"), n: S.length }, { label: "애매함", k: k(S, "amb"), n: S.length, warn: true }, { label: "부착형", k: k(S), n: S.length }],
          rt: "부모 조합별: 자녀가 분리형인 비율", right: [{ label: "분리×분리", k: k(ff, "free"), n: ff.length }, { label: "부착×부착", k: kf, n: aa.length, warn: true }],
          nums: [["‘판단 어려움’ 응답", pct(k(S, "amb"), S.length)], ["부착×부착 부모의 자녀 중 분리형", aa.length ? `${kf}/${aa.length}명` : "해당 없음"], ["부착형 = 단순 열성 모형", aa.length < 5 ? "판단 보류 (가족 수 적음)" : kf > 0 ? "모순 (부착×부착 → 분리)" : "아직 모순 없음", aa.length >= 5 && kf > 0 ? "bad" : ""]],
          fam: aa.length ? `부착×부착 → 분리형 ${pct(kf, aa.length)}` : "—",
          msg: `${pct(k(S, "amb"), S.length)}가 두 유형 중 하나로 고르기 어렵다고 답했습니다. 형질이 두 가지로 딱 나뉘지 않고 연속적이라는 신호입니다.`,
        };
      },
    },
    abo: {
      name: "ABO식 혈액형",
      sum(S) {
        const T = ["A", "B", "O", "AB"], REF = { A: 0.34, B: 0.27, O: 0.28, AB: 0.11 };
        const k = (a, t) => a.filter((p) => p.abo.me === t).length, n = S.length;
        const ab = S.filter((p) => (p.abo.m === "A" && p.abo.f === "B") || (p.abo.m === "B" && p.abo.f === "A"));
        const oo = S.filter((p) => p.abo.m === "O" && p.abo.f === "O");
        const fO = k(S, "O") / n, fA = k(S, "A") / n, fB = k(S, "B") / n;
        const r = Math.sqrt(fO), p = 1 - Math.sqrt(fB + fO), q = 1 - Math.sqrt(fA + fO);
        const ooBad = oo.filter((x) => x.abo.me !== "O").length;
        return {
          lt: "혈액형 비율 (선 = 우리나라 대략값)", left: T.map((t) => ({ label: t + "형", k: k(S, t), n, ref: REF[t] })),
          rt: `A × B 부모의 자녀 (${ab.length}가족)`, right: T.map((t) => ({ label: t + "형", k: k(ab, t), n: ab.length })),
          nums: [["대립유전자 빈도 추정 A · B · O", n ? `${p.toFixed(2)} · ${q.toFixed(2)} · ${r.toFixed(2)}` : "—"], ["O × O 부모의 자녀", oo.length ? `${oo.length}명 중 O형 ${oo.length - ooBad}명` : "해당 없음"], ["A × B 부모에서 O형 자녀", ab.length ? `${k(ab, "O")}명` : "해당 없음"]],
          fam: ab.length ? `A×B → O형 ${k(ab, "O")}명/${ab.length}` : "—",
          msg: "A × B 부모에게서 O형 자녀가 나오면 부모가 각각 AO, BO라는 뜻입니다. 대립유전자 빈도는 O형 비율의 제곱근으로 O를 먼저 구하고(r = √O), 하디·바인베르크 평형을 가정해 A, B를 구했습니다.",
        };
      },
    },
    cvd: {
      name: "적록 색각 이상",
      sum(S) {
        const sx = (s) => S.filter((p) => p.sex === s), k = (a) => a.filter((p) => p.cvd.me).length;
        const sons = sx("m"), fa = sons.filter((p) => p.cvd.f), fn = sons.filter((p) => !p.cvd.f), mo = sons.filter((p) => p.cvd.m);
        return {
          ltop: 0.12, lt: "본인 색각 이상 비율 (선 = 남 6%, 여 0.4%)", left: [{ label: "남", k: k(sons), n: sons.length, ref: Q }, { label: "여", k: k(sx("f")), n: sx("f").length, ref: Q * Q }],
          rt: "아들이 색각 이상인 비율", right: [{ label: "아버지 이상", k: k(fa), n: fa.length }, { label: "아버지 정상", k: k(fn), n: fn.length }, { label: "어머니 이상", k: k(mo), n: mo.length, warn: true }],
          nums: [["남 · 여 비율", `${pct(k(sons), sons.length)} · ${pct(k(sx("f")), sx("f").length)}`], ["색각 이상 학생 수", `남 ${k(sons)} · 여 ${k(sx("f"))}`], ["아버지 이상 / 정상일 때 아들", `${pct(k(fa), fa.length)} / ${pct(k(fn), fn.length)}`]],
          fam: `남 ${pct(k(sons), sons.length)}, 여 ${pct(k(sx("f")), sx("f").length)}`,
          msg: S.length < 100 ? "30명 표본에서는 색각 이상 학생이 0~2명뿐이라 남녀 차이를 말하기 어렵습니다. 범위를 넓혀 보세요." : "아들의 색각 이상 비율은 아버지가 이상이든 정상이든 비슷합니다. 아들은 아버지에게서 X가 아니라 Y를 받기 때문입니다.",
        };
      },
    },
  };

  let trait = "tongue", N = 30, sample = [], cur = null;
  const tbl = L.table($(".tbl-host"), [{ key: "t", label: "형질" }, { key: "n", label: "인원", res: 1 }, { key: "fam", label: "핵심 결과" }]);
  function run() {
    sample = Array.from({ length: N }, person);
    cur = TR[trait].sum(sample);
    const s = cur;
    ["a", "b", "c"].forEach((x, i) => { $(".t-" + x).textContent = s.nums[i][0]; $(".n-" + x).textContent = s.nums[i][1]; $(".n-" + x).className = "n-" + x + " " + (s.nums[i][2] || ""); });
    $(".sv-obs").innerHTML = s.msg;
    tbl.add({ t: TR[trait].name, n: N, fam: s.fam });
    draw();
  }

  const { ctx, size } = fit($("canvas"), () => draw());
  function bars(x0, y0, bw, bh, title, items, top = 1) {
    ctx.fillStyle = C.ink; ctx.font = `600 11.5px ${F.sans}`; ctx.textAlign = "left";
    ctx.fillText(title, x0 - 26, y0 - 12);
    ctx.font = `10px ${F.mono}`; ctx.textAlign = "right";
    for (let v = 0; v <= top * 1.0001; v += top / 4) { const y = y0 + bh - v / top * bh; ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + bw, y); ctx.stroke(); ctx.fillStyle = C.ink3; ctx.fillText(+(v * 100).toFixed(1) + "%", x0 - 3, y + 3); }
    const Yp = (p) => y0 + bh - Math.min(1, p / top) * bh;
    const cw = bw / items.length;
    items.forEach((it, i) => {
      const cx = x0 + cw * (i + 0.5), wb = Math.min(34, cw * 0.55);
      if (it.n) {
        const p = it.k / it.n, e = 1.96 * Math.sqrt(Math.max(p * (1 - p), 0.25 / it.n) / it.n);
        ctx.fillStyle = it.warn ? C.amber : C.sprout; ctx.fillRect(cx - wb / 2, Yp(p), wb, y0 + bh - Yp(p));
        ctx.strokeStyle = C.ink2; ctx.beginPath(); ctx.moveTo(cx, Yp(Math.min(1, p + e))); ctx.lineTo(cx, Yp(Math.max(0, p - e))); ctx.stroke();
        ctx.fillStyle = C.ink2; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center";
        ctx.fillText(`${it.k}/${it.n}`, cx, y0 + bh + 26);
      } else { ctx.fillStyle = C.ink3; ctx.font = `10px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText("0명", cx, y0 + bh + 26); }
      if (it.ref != null) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; const y = Yp(it.ref); ctx.beginPath(); ctx.moveTo(cx - wb / 2 - 4, y); ctx.lineTo(cx + wb / 2 + 4, y); ctx.stroke(); ctx.lineWidth = 1; }
      ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText(it.label, cx, y0 + bh + 13);
    });
  }
  function draw() {
    const { w, h } = size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    if (!cur) { ctx.fillStyle = C.ink3; ctx.font = `12px ${F.sans}`; ctx.textAlign = "center"; ctx.fillText("설문 조사하기를 누르면 결과가 여기 그려집니다.", w / 2, h / 2); return; }
    const y0 = 30, bh = h - y0 - 36, half = w / 2;
    bars(34, y0, half - 48, bh, cur.lt, cur.left, cur.ltop || 1);
    bars(half + 30, y0, half - 38, bh, cur.rt, cur.right);
    ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(half, 6); ctx.lineTo(half, h - 6); ctx.stroke();
  }

  const press = (sel, attr, fn) => $(sel).addEventListener("click", (e) => {
    const b = e.target.closest(`[${attr}]`); if (!b) return;
    root.querySelectorAll(`${sel} [${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    fn(b.getAttribute(attr));
  });
  press(".trait", "data-t", (v) => { trait = v; cur = null; $(".sv-obs").textContent = "형질과 조사 범위를 고르고 조사하세요."; draw(); });
  press(".size", "data-n", (v) => { N = +v; });
  $(".run").addEventListener("click", run);
  $(".clear").addEventListener("click", () => tbl.clear());
  draw();
  if (L.demo) {
    [["abo", 3000], ["cvd", 30], ["cvd", 3000], ["tongue", 3000]].forEach(([t, n]) => { trait = t; N = n; run(); });
    root.querySelector('[data-t="tongue"]').setAttribute("aria-pressed", "true");
    root.querySelector('[data-n="30"]').setAttribute("aria-pressed", "false");
    root.querySelector('[data-n="3000"]').setAttribute("aria-pressed", "true");
  }
})();
