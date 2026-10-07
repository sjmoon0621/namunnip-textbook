/* 카드: 두 사람이 같은 파일을 고치면 git은 어떻게 합칠까? — 줄 단위 3-way merge와 충돌 */
(() => {
  const root = document.getElementById("card-info-git-merge");
  if (!root) return;
  const { C, F, fit } = NM;
  const $ = (s) => root.querySelector(s);
  const pre = $("pre.code");
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const BLUE = "#3f74b5";

  const BASE = [
    "def average(scores):",
    "    total = 0",
    "    for s in scores:",
    "        total += s",
    "    return total / len(scores)",
    "",
    "print(average([80, 90, 100]))",
  ];
  const EA = [
    { line: 0, text: "def average(scores: list) -> float:", lab: "1줄: 자료형 힌트 붙이기" },
    { line: 4, text: "    return round(total / len(scores), 1)", lab: "5줄: 소수 첫째 자리로 반올림" },
    { line: 6, text: "print(average([80, 90, 100, 75]))", lab: "7줄: 예시 점수 추가" },
  ];
  const EB = [
    { line: 1, text: "    total = 0.0", lab: "2줄: total을 실수로" },
    { line: 4, text: "    return total / len(scores) if scores else 0.0", lab: "5줄: 빈 리스트면 0.0" },
    { line: 6, text: "print(average([]))", lab: "7줄: 빈 리스트로 시험" },
  ];
  /* 같은 줄을 양쪽이 고쳤을 때 사람이 두 의도를 살려 합친 결과 */
  const BOTH = {
    4: ["    return round(total / len(scores), 1) if scores else 0.0"],
    6: ["print(average([80, 90, 100, 75]))", "print(average([]))"],
  };
  const mk = (host, list, cls) => list.forEach((e, i) => {
    host.insertAdjacentHTML("beforeend", `<label><input type="checkbox" class="${cls}" data-i="${i}"><span>${e.lab}</span></label>`);
  });
  mk($(".sa"), EA, "ca"); mk($(".sb"), EB, "cb");

  let state = "edit", lines = [], conflicts = 0;

  const chosen = (cls, list) => [...root.querySelectorAll("." + cls)].filter((c) => c.checked).map((c) => list[+c.dataset.i]);

  function merge(resolve) {
    const A = new Map(chosen("ca", EA).map((e) => [e.line, e.text]));
    const B = new Map(chosen("cb", EB).map((e) => [e.line, e.text]));
    const out = []; let nConf = 0;
    let i = 0;
    while (i < BASE.length) {
      if (!A.has(i) && !B.has(i)) { out.push({ t: BASE[i] }); i++; continue; }
      let j = i; while (j < BASE.length && (A.has(j) || B.has(j))) j++;
      const run = []; for (let k = i; k < j; k++) run.push(k);
      const inA = run.some((k) => A.has(k)), inB = run.some((k) => B.has(k));
      const same = run.every((k) => !(A.has(k) && B.has(k)) || A.get(k) === B.get(k)) && !(inA && inB && run.some((k) => A.has(k) !== B.has(k)));
      if (!(inA && inB) || same) {
        for (const k of run) {
          if (A.has(k)) out.push({ t: A.get(k), c: "ok-a" }); else out.push({ t: B.get(k), c: "ok-b" });
        }
      } else if (!resolve) {
        nConf++;
        out.push({ t: "<<<<<<< HEAD", c: "mk" });
        for (const k of run) out.push({ t: A.has(k) ? A.get(k) : BASE[k], c: "a" });
        out.push({ t: "=======", c: "mk" });
        for (const k of run) out.push({ t: B.has(k) ? B.get(k) : BASE[k], c: "b" });
        out.push({ t: ">>>>>>> fix-empty", c: "mk" });
      } else {
        for (const k of run) {
          if (resolve === "a") out.push({ t: A.has(k) ? A.get(k) : BASE[k], c: "ok-a" });
          else if (resolve === "b") out.push({ t: B.has(k) ? B.get(k) : BASE[k], c: "ok-b" });
          else if (A.has(k) && B.has(k)) (BOTH[k] || [A.get(k), B.get(k)]).forEach((t) => out.push({ t, c: "ok-a ok-b" }));
          else if (A.has(k)) out.push({ t: A.get(k), c: "ok-a" });
          else out.push({ t: B.get(k), c: "ok-b" });
        }
      }
      i = j;
    }
    return { out, nConf, nA: A.size, nB: B.size };
  }

  function show(res) {
    lines = res.out;
    pre.innerHTML = lines.map((l) => `<span class="l ${l.c || ""}">${esc(l.t)}</span>`).join("");
  }

  function setStatus(html, bad) { const s = $(".status"); s.innerHTML = html; s.className = "status" + (bad ? " bad" : ""); }
  const resBtns = [...root.querySelectorAll(".b-res")];
  const enableRes = (on) => resBtns.forEach((b) => { b.disabled = !on; b.style.opacity = on ? "" : ".45"; });

  function doEdit() {
    state = "edit"; enableRes(false);
    show({ out: BASE.map((t) => ({ t })) });
    setStatus("공통 조상의 stats.py입니다. 브랜치마다 고칠 줄을 고른 뒤 병합하세요.");
    draw();
  }
  function doMerge() {
    const r = merge(null);
    conflicts = r.nConf; show(r);
    if (!r.nA || !r.nB) {
      state = "done"; enableRes(false);
      setStatus(`한쪽 브랜치에만 변경이 있어 충돌 없이 그대로 반영됩니다. 변경한 줄: main ${r.nA}개, fix-empty ${r.nB}개.`);
    } else if (r.nConf) {
      state = "conflict"; enableRes(true);
      setStatus(`<b>CONFLICT</b> — 충돌 ${r.nConf}곳. 표시된 부분을 고친 뒤 커밋해야 병합이 끝납니다.`, true);
    } else {
      state = "done"; enableRes(false);
      setStatus("충돌 없이 자동 병합되었습니다. 두 브랜치의 변경이 모두 들어갔습니다. 이제 테스트를 돌려 확인합니다.");
    }
    draw();
  }
  function doResolve(mode) {
    const r = merge(mode); show(r); state = "done"; enableRes(false);
    const msg = mode === "both" ? "두 변경의 의도를 살려 직접 고쳤습니다. git add 후 커밋하면 병합 커밋이 만들어집니다."
      : `${mode === "a" ? "main" : "fix-empty"} 쪽만 남겼습니다. 다른 쪽의 수정이 충돌 부분에서 사라졌는지 확인하세요.`;
    setStatus(msg, mode !== "both");
    draw();
  }

  const cv = fit($("canvas"), () => draw());
  function draw() {
    const { ctx } = cv, { w, h } = cv.size; if (!w) return;
    ctx.clearRect(0, 0, w, h);
    const yA = h * 0.36, yB = h * 0.74, x0 = 30, x1 = w - 30;
    const nA = chosen("ca", EA).length, nB = chosen("cb", EB).length;
    const dot = (x, y, col, lab, below) => {
      ctx.fillStyle = C.card; ctx.strokeStyle = col; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (lab) { ctx.fillStyle = C.ink2; ctx.font = `10.5px ${F.mono}`; ctx.textAlign = "center"; ctx.fillText(lab, x, below ? y + 22 : y - 13); }
    };
    const xs = x0 + 30, split = xs, xm = x1 - 40;
    const merged = state !== "edit";
    // main 선
    ctx.strokeStyle = BLUE; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, yA); ctx.lineTo(merged ? xm : xm - 40, yA); ctx.stroke();
    // 브랜치 선
    ctx.strokeStyle = C.amber;
    ctx.beginPath(); ctx.moveTo(split, yA); ctx.quadraticCurveTo(split + 20, yB, split + 50, yB); ctx.lineTo(xm - 60, yB);
    if (merged) ctx.quadraticCurveTo(xm - 20, yB, xm, yA);
    ctx.stroke();
    dot(split, yA, C.ink, "공통 조상");
    const pa = Math.max(nA, 1), pb = Math.max(nB, 1);
    for (let k = 0; k < nA; k++) dot(split + 50 + (k + 1) * (xm - split - 110) / (pa + 1), yA, BLUE, k === 0 ? "main" : "");
    for (let k = 0; k < nB; k++) dot(split + 50 + (k + 1) * (xm - split - 110) / (pb + 1), yB, C.amber, k === 0 ? "fix-empty" : "", true);
    if (merged) {
      const col = state === "conflict" ? C.warn : C.forest;
      dot(xm, yA, col, state === "conflict" ? "충돌 해결 중" : "병합 커밋");
    }
    ctx.textAlign = "left"; ctx.font = `10.5px ${F.sans}`; ctx.fillStyle = C.ink3;
    ctx.fillText("커밋 그래프 (왼쪽이 과거)", 4, 13);
  }

  root.querySelectorAll(".ca, .cb").forEach((c) => c.addEventListener("change", doEdit));
  $(".b-merge").addEventListener("click", doMerge);
  resBtns.forEach((b) => b.addEventListener("click", () => doResolve(b.dataset.r)));
  if (window.NMLab && NMLab.demo) {
    root.querySelector('.ca[data-i="1"]').checked = true; root.querySelector('.cb[data-i="1"]').checked = true;
    root.querySelector('.cb[data-i="2"]').checked = true;
    doMerge();
  } else doEdit();
})();
