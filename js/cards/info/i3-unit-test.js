/* 카드: 어떤 테스트를 넣어야 숨은 버그가 드러날까? — 테스트 실행기와 한 줄씩 추적 */
(() => {
  const root = document.getElementById("card-info-unit-test");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const pre = $("pre.code");
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  class PyErr { constructor(name) { this.name = name; } }
  const py = (v) => v instanceof PyErr ? v.name : v === true ? "True" : v === false ? "False" : Array.isArray(v) ? "[" + v.map(py).join(", ") + "]" : String(v);
  const same = (a, b) => (a instanceof PyErr || b instanceof PyErr) ? (a instanceof PyErr && b instanceof PyErr && a.name === b.name) : a === b;

  /* 함수마다: 명세, 버그 코드, 고친 코드, 바뀐 줄, 기준 답, 추적 함수(입력, 고침 여부) → [{l, v, ret}] */
  const FNS = {
    leap: {
      spec: "명세: 그레고리력에서 year가 윤년이면 True, 아니면 False를 돌려준다.",
      bug: ["def is_leap(year):", "    if year % 4 == 0 and year % 100 != 0:", "        return True", "    return False"],
      fixed: ["def is_leap(year):", "    if (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:", "        return True", "    return False"],
      fixLines: [1],
      ref: (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0,
      pool: [[2024, "평범"], [2023, "평범"], [1900, "경계: 100의 배수"], [2000, "경계: 400의 배수"], [2100, "경계: 100의 배수"], [4, "작은 값"]],
      parse: (s) => { const v = parseInt(s, 10); if (!Number.isFinite(v)) throw 0; return v; },
      show: (y) => `is_leap(${y})`,
      hint: "예: 2400",
      trace(y, fx) {
        const t = [{ l: 0, v: `year = ${y}` }];
        const c = (y % 4 === 0 && y % 100 !== 0) || (fx && y % 400 === 0);
        t.push({ l: 1, v: `year % 4 = ${y % 4}, year % 100 = ${y % 100}${fx ? ", year % 400 = " + (y % 400) : ""} → 조건 ${c ? "True" : "False"}` });
        t.push(c ? { l: 2, v: "return True", ret: true } : { l: 3, v: "return False", ret: false });
        return t;
      },
    },
    bin: {
      spec: "명세: 오름차순 리스트 a에서 x의 위치(인덱스)를, 없으면 -1을 돌려준다.",
      bug: ["def binary_search(a, x):", "    lo, hi = 0, len(a) - 1", "    while lo < hi:", "        mid = (lo + hi) // 2", "        if a[mid] == x:", "            return mid", "        elif a[mid] < x:", "            lo = mid + 1", "        else:", "            hi = mid - 1", "    return -1"],
      fixed: ["def binary_search(a, x):", "    lo, hi = 0, len(a) - 1", "    while lo <= hi:", "        mid = (lo + hi) // 2", "        if a[mid] == x:", "            return mid", "        elif a[mid] < x:", "            lo = mid + 1", "        else:", "            hi = mid - 1", "    return -1"],
      fixLines: [2],
      ref: ([a, x]) => a.indexOf(x),
      pool: [[[[1, 3, 5, 7, 9], 5], "평범"], [[[1, 3, 5, 7, 9], 4], "평범: 없는 값"], [[[1, 3, 5, 7, 9], 1], "경계: 맨 앞"], [[[1, 3, 5, 7, 9], 9], "경계: 맨 끝"], [[[], 1], "예외: 빈 리스트"], [[[7], 7], "예외: 원소 하나"]],
      parse: (s) => { const v = JSON.parse("[" + s + "]"); if (!Array.isArray(v[0]) || typeof v[1] !== "number") throw 0; return [v[0].slice().sort((p, q) => p - q), v[1]]; },
      show: ([a, x]) => `binary_search(${py(a)}, ${x})`,
      hint: "예: [2, 4, 6, 8], 8",
      trace([a, x], fx) {
        const t = [{ l: 0, v: `a = ${py(a)}, x = ${x}` }];
        let lo = 0, hi = a.length - 1;
        t.push({ l: 1, v: `lo = ${lo}, hi = ${hi}` });
        for (let guard = 0; guard < 40; guard++) {
          const ok = fx ? lo <= hi : lo < hi;
          t.push({ l: 2, v: `lo = ${lo}, hi = ${hi} → ${fx ? "lo <= hi" : "lo < hi"} 는 ${ok ? "True" : "False"}` });
          if (!ok) break;
          const mid = (lo + hi) >> 1;
          t.push({ l: 3, v: `mid = (${lo} + ${hi}) // 2 = ${mid}` });
          t.push({ l: 4, v: `a[${mid}] = ${a[mid]}, x = ${x}` });
          if (a[mid] === x) { t.push({ l: 5, v: `return ${mid}`, ret: mid }); return t; }
          if (a[mid] < x) { t.push({ l: 6, v: `${a[mid]} < ${x} → True` }); lo = mid + 1; t.push({ l: 7, v: `lo = ${lo}` }); }
          else { t.push({ l: 6, v: `${a[mid]} < ${x} → False` }); hi = mid - 1; t.push({ l: 9, v: `hi = ${hi}` }); }
        }
        t.push({ l: 10, v: "return -1", ret: -1 });
        return t;
      },
    },
    med: {
      spec: "명세: 수 리스트의 중앙값을 돌려준다. 개수가 짝수이면 가운데 두 수의 평균, 빈 리스트이면 ValueError를 낸다.",
      bug: ["def median(nums):", "    nums = sorted(nums)", "    n = len(nums)", "    return nums[n // 2]"],
      fixed: ["def median(nums):", "    nums = sorted(nums)", "    n = len(nums)", "    if n == 0:", "        raise ValueError(\"빈 리스트\")", "    if n % 2 == 0:", "        return (nums[n // 2 - 1] + nums[n // 2]) / 2", "    return nums[n // 2]"],
      fixLines: [3, 4, 5, 6],
      ref: (v) => { if (!v.length) return new PyErr("ValueError"); const s = v.slice().sort((p, q) => p - q), n = s.length; return n % 2 ? s[n >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2; },
      pool: [[[3, 1, 2], "평범: 홀수 개"], [[5, 9, 7, 1, 3], "평범: 홀수 개"], [[5], "예외: 원소 하나"], [[4, 1, 3, 2], "짝수 개"], [[2, 2], "짝수 개, 같은 값"], [[], "예외: 빈 리스트"]],
      parse: (s) => { const v = JSON.parse(s); if (!Array.isArray(v) || v.some((q) => typeof q !== "number")) throw 0; return v; },
      show: (v) => `median(${py(v)})`,
      hint: "예: [10, 20, 30, 40]",
      trace(v, fx) {
        const s = v.slice().sort((p, q) => p - q), n = s.length;
        const t = [{ l: 0, v: `nums = ${py(v)}` }, { l: 1, v: `nums = ${py(s)}` }, { l: 2, v: `n = ${n}` }];
        if (!fx) {
          if (!n) t.push({ l: 3, v: `nums[0] → IndexError: list index out of range`, ret: new PyErr("IndexError") });
          else t.push({ l: 3, v: `n // 2 = ${n >> 1}, return nums[${n >> 1}] = ${s[n >> 1]}`, ret: s[n >> 1] });
          return t;
        }
        t.push({ l: 3, v: `n == 0 → ${n ? "False" : "True"}` });
        if (!n) { t.push({ l: 4, v: "raise ValueError", ret: new PyErr("ValueError") }); return t; }
        t.push({ l: 5, v: `n % 2 = ${n % 2} → ${n % 2 ? "False" : "True"}` });
        if (n % 2 === 0) { const r = (s[n / 2 - 1] + s[n / 2]) / 2; t.push({ l: 6, v: `(${s[n / 2 - 1]} + ${s[n / 2]}) / 2 = ${fmtF(r)}`, ret: r }); }
        else t.push({ l: 7, v: `return nums[${n >> 1}] = ${s[n >> 1]}`, ret: s[n >> 1] });
        return t;
      },
    },
  };
  /* 파이썬의 / 는 언제나 실수를 돌려준다 */
  const fmtF = (r) => Number.isInteger(r) ? r.toFixed(1) : String(r);

  let fn = "leap", fixed = false, extra = [], results = [], tr = null, tk = 0;
  const F = () => FNS[fn];
  const run1 = (inp) => { const t = F().trace(inp, fixed); return t[t.length - 1].ret; };

  function code(hlLine) {
    const lines = fixed ? F().fixed : F().bug;
    pre.innerHTML = lines.map((l, i) => `<span class="l${i === hlLine ? " on" : ""}${fixed && F().fixLines.includes(i) ? " fix" : ""}">${esc(l)}</span>`).join("");
  }

  function buildPool() {
    $(".spec").textContent = F().spec;
    $(".own-in").placeholder = F().hint;
    const items = F().pool.map((p, i) => [p[0], p[1], i < 2]).concat(extra.map((e) => [e, "직접 넣음", true]));
    $(".pool").innerHTML = items.map(([inp, tag, on], i) => `<label><input type="checkbox" data-i="${i}"${on ? " checked" : ""}><span><code>${esc(F().show(inp))}</code> <small>${tag}</small></span></label>`).join("");
    $(".pool")._items = items;
  }

  function runTests() {
    const items = $(".pool")._items;
    const on = [...root.querySelectorAll(".pool input")].filter((c) => c.checked).map((c) => items[+c.dataset.i][0]);
    results = on.map((inp) => {
      const exp = F().ref(inp), got = run1(inp);
      return { inp, exp, got, ok: same(exp, got) };
    });
    /* 짝수 개의 중앙값은 / 로 구하므로 파이썬에서는 2.0처럼 실수로 나온다 */
    const fmt = (v, inp, isExp) => fn === "med" && typeof v === "number" && inp.length % 2 === 0 && (isExp || fixed) ? fmtF(v) : py(v);
    $(".res").innerHTML = results.length ? `<table><thead><tr><th>테스트</th><th>기대값</th><th>실제</th><th>결과</th><th></th></tr></thead><tbody>${
      results.map((r, i) => `<tr><td>${esc(F().show(r.inp))}</td><td>${esc(fmt(r.exp, r.inp, true))}</td><td>${esc(fmt(r.got, r.inp, false))}</td><td class="${r.ok ? "pass" : "fail"}">${r.ok ? "통과" : "실패"}</td><td><button type="button" data-t="${i}">추적</button></td></tr>`).join("")}</tbody></table>` : "";
    $(".n-run").textContent = results.length;
    $(".n-pass").textContent = results.filter((r) => r.ok).length;
    const nf = results.filter((r) => !r.ok).length;
    $(".n-fail").textContent = nf; $(".n-fail").className = "n-fail" + (nf ? " bad" : "");
  }

  function startTrace(inp) { tr = F().trace(inp, fixed); tk = 0; showTrace(); }
  function showTrace() {
    if (!tr) { code(-1); $(".vars").textContent = ""; $(".b-prev").disabled = $(".b-next").disabled = true; return; }
    const s = tr[tk];
    code(s.l);
    $(".vars").textContent = `[${tk + 1}/${tr.length}] ${s.v}`;
    $(".b-prev").disabled = tk === 0; $(".b-next").disabled = tk === tr.length - 1;
  }

  function reset() { tr = null; results = []; buildPool(); showTrace(); runTests(); }

  root.querySelectorAll(".fn .chip").forEach((b) => b.addEventListener("click", () => {
    root.querySelectorAll(".fn .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    fn = b.dataset.f; fixed = false; extra = []; $(".b-fix").setAttribute("aria-pressed", "false"); reset();
  }));
  $(".b-fix").addEventListener("click", () => {
    fixed = !fixed; $(".b-fix").setAttribute("aria-pressed", String(fixed));
    tr = null; showTrace(); runTests();
  });
  $(".b-run").addEventListener("click", runTests);
  $(".b-add").addEventListener("click", () => {
    const inp = $(".own-in");
    try { extra.push(F().parse(inp.value)); inp.value = ""; inp.style.borderColor = ""; }
    catch (e) { inp.style.borderColor = "var(--warn)"; return; }
    const keep = [...root.querySelectorAll(".pool input")].map((c) => c.checked);
    buildPool();
    root.querySelectorAll(".pool input").forEach((c, i) => { c.checked = i < keep.length ? keep[i] : true; });
    runTests();
  });
  $(".res").addEventListener("click", (e) => { const b = e.target.closest("button[data-t]"); if (b) startTrace(results[+b.dataset.t].inp); });
  $(".b-prev").addEventListener("click", () => { if (tk > 0) { tk--; showTrace(); } });
  $(".b-next").addEventListener("click", () => { if (tr && tk < tr.length - 1) { tk++; showTrace(); } });

  reset();
  if (window.NMLab && NMLab.demo) {
    fn = "bin";
    root.querySelectorAll(".fn .chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.f === "bin")));
    reset();
    root.querySelectorAll(".pool input").forEach((c, i) => { c.checked = i !== 1; });
    runTests();
    startTrace(F().pool[3][0]); tk = tr.length - 2; showTrace();
  }
})();
