/* 목차 화면: 메인(<body data-view="home">)과 과목(<body data-view="course" data-course="is1">) — toc.js에서 그린다 */
(() => {
  "use strict";
  const view = document.body.dataset.view;
  if (!view || !window.TOC) return;
  const R = ["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"];
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  /* 카드 수는 서로 다른 카드만 센다(여러 절·과목에 함께 실린 카드는 한 번). 읽기(text) 블록은 카드와 함께 센다.
     seen을 넘기면 과목을 넘어서도 중복을 뺀다(첫 화면 합계 = 내 노트의 '본 카드·읽기' 분모) */
  const count = (c, seen = new Set()) => {
    let sec = 0, open = 0, cards = 0, vids = 0;
    c.chapters.forEach((ch) => ch.sections.forEach((s) => {
      sec++; if (s.page) open++;
      s.items.forEach((it) => {
        if (seen.has(it.id)) return;
        seen.add(it.id);
        if (it.kind === "video") vids++; else cards++;
      });
    }));
    return { sec, open, cards, vids };
  };

  /* ───── 메인 ───── */
  if (view === "home") {
    const host = document.getElementById("courses-list");
    const base = "c/";

    /* 체계도: 위 공통 띠 · 물리/화학/생명/지구 4열(일반 → 진로 → 고급 → 실험) · 아래 융합 띠 */
    const TRACKS = [["phy", "물리"], ["chem", "화학"], ["bio", "생명과학"], ["earth", "지구과학"]];
    const LV = { 공통: "공통", 일반: "일반선택", 진로: "진로선택", 고급: "과학계열 진로", 실험: "과학계열 융합", 융합: "융합선택" };
    const RANK = ["공통", "일반", "진로", "고급", "실험", "융합"];
    /* 학습률: 이 브라우저 기록(NMStore)에서 본(seen) 카드·읽기·영상 수 ÷ 전체 */
    const S = window.NMStore;
    const learn = (c) => {
      const ids = c.chapters.flatMap((ch) => ch.sections.flatMap((s) => s.items.map((i) => i.id)));
      const seen = S ? ids.filter((id) => (S.get(id) || {}).seen).length : 0;
      return { seen, total: ids.length, p: ids.length ? seen / ids.length : 0 };
    };
    const pct = (l) => `${Math.round(l.p * 100)}%`;
    const box = (c, bare) => {
      const n = count(c), l = learn(c);
      return `<a class="tbox${n.open ? "" : " soon"}" href="${base}${c.id}/" data-track="${c.track}" data-cid="${c.id}">
        ${bare ? "" : `<span class="lv mono">${c.track === "math" && c.level === "고급" ? "과학계열 선택" : LV[c.level]}</span>`}<b>${esc(c.name)}</b>
        <span class="pg mono">${n.open ? `절 ${n.open} · 학습 <span class="lp-n">${pct(l)}</span>` : `준비 중 · 절 ${n.sec}`}</span>
        ${n.open ? `<span class="lp" aria-hidden="true"><i style="--p:${l.p.toFixed(3)}"></i></span>` : ""}</a>`;
    };
    const pick = (f) => TOC.filter(f).sort((a, b) => RANK.indexOf(a.level) - RANK.indexOf(b.level));
    const tree = document.getElementById("tree");
    /* 과학: 공통 과목 행(선택 과목 행과 같은 꼴) 아래에 교과(행) × 선택 구분(열) 표. 일반·진로·융합선택은 나란히 고르는 구분이고,
       과학계열 과목은 과학고·영재학교 등에서 여는 과목이라 맨 오른쪽 열에 둔다 */
    const SCI_COLS = [["일반", "일반선택", "교과의 기본"], ["진로", "진로선택", "심화·진로"], ["융합", "융합선택", "교과 융합·실생활"],
      ["고급", "과학계열 진로선택", "과학고·영재학교"], ["실험", "과학계열 융합선택", "과학고·영재학교"]];
    const SCI_ROWS = [...TRACKS, ["fusion", "교과 공통"]];
    const cell = (t, lv) => pick((c) => c.track === t && c.level === lv).map((c) => box(c, true)).join("");
    /* 수학: 분야로 행을 나누지 않고 선택 구분 열에 과목을 늘어놓는다(행 이름 칸 없음) */
    const MATH_COLS2 = [["일반", "일반선택", "수학의 기본"], ["진로", "진로선택", "심화·진로"], ["융합", "융합선택", "교과 융합·실생활"], ["고급", "과학계열 선택", "과학고·영재학교"]];
    const matrix = (cls, label, cols, rows) => `
      <div class="mx ${cls}" role="table" aria-label="${label}">
        <div class="mx-row mx-head" role="row"><span role="columnheader"></span>${cols.map(([lv, nm, d]) => `<span class="mx-h" role="columnheader" data-lv="${lv}">${nm}<small>${d}</small></span>`).join("")}</div>
        ${rows.map(([t, nm, get]) => {
          const hs = cols.map(([lv]) => get(lv));
          const advOnly = cols.every(([lv], i) => lv === "고급" || lv === "실험" || lv === "융합" || !hs[i]);   // 과학계열 과목만 있는 행은 일반 보기에서 숨긴다
          return `<div class="mx-row" data-track="${t}" role="row"${advOnly ? " data-adv" : ""}><span class="mx-lb" role="rowheader">${nm}</span>${cols.map(([lv, cn], i) =>
            `<div class="mx-cell${hs[i] ? "" : " empty"}" role="cell" data-col="${cn}" data-lv="${lv}">${hs[i]}</div>`).join("")}</div>`;
        }).join("")}
      </div>`;
    /* 과학 표: 열 = 교과(물리·화학·생명과학·지구과학·교과 공통), 행 = 선택 구분 */
    const sciMatrix = () => `
      <div class="mx sci-mx" role="table" aria-label="과학 선택 과목: 선택 구분별, 교과별">
        <div class="mx-row mx-head" role="row"><span role="columnheader"></span>${SCI_ROWS.map(([t, nm]) => `<span class="mx-h mx-tk" role="columnheader" data-track="${t}" data-tk="${t}">${nm}</span>`).join("")}</div>
        ${SCI_COLS.map(([lv, nm, d]) => `<div class="mx-row" role="row" data-lv="${lv}"><span class="mx-lb mx-lv" role="rowheader">${nm}<small>${d}</small></span>${SCI_ROWS.map(([t, tn]) => {
          const h = cell(t, lv);
          return `<div class="mx-cell${h ? "" : " empty"}" role="cell" data-col="${tn}" data-tk="${t}" data-track="${t}">${h}</div>`;
        }).join("")}</div>`).join("")}
      </div>`;
    /* 수학 표: 행 = 선택 구분, 행 안에서 과목 상자를 같은 폭으로 옆으로 늘어놓는다 */
    const mathMatrix = () => `
      <div class="mx math-mx" role="table" aria-label="수학 선택 과목: 선택 구분별">
        ${MATH_COLS2.map(([lv, nm, d]) => { const h = cell("math", lv); return h ? `<div class="mx-row mx-flowrow" role="row" data-lv="${lv}" data-track="math"><span class="mx-lb mx-lv" role="rowheader">${nm}<small>${d}</small></span><div class="mx-cell mx-flow" role="cell" data-col="${nm}">${h}</div></div>` : ""; }).join("")}
      </div>`;
    /* 보기 범위: 기본(일반·진로선택) / 전체(융합선택·과학계열 과목까지) */
    const ADV = (c) => c.level === "고급" || c.level === "실험" || c.level === "융합";   // 기본 보기에서 숨기는 과목
    const cnt2 = (f) => `<span class="for-basic">${TOC.filter((c) => f(c) && !ADV(c)).length}</span><span class="for-all">${TOC.filter(f).length}</span>`;
    const nSci = cnt2((c) => c.track !== "math" && c.track !== "extra"), nMath = cnt2((c) => c.track === "math");
    if (tree) tree.innerHTML = `
      <div class="tree-head"><h2>과목 체계도</h2>
        <button type="button" class="tree-tg" aria-expanded="false" aria-controls="tree-body"><span class="for-sci">과학 ${nSci}과목</span><span class="for-math">수학 ${nMath}과목</span> · <span class="tg-t">펼치기</span></button>
        <span class="scope-seg" role="group" aria-label="보기 범위"><button type="button" data-scope="basic" aria-pressed="true">일반·진로선택</button><button type="button" data-scope="all" aria-pressed="false">전체 과목</button></span>
        <p class="mono small dim tree-note">공통 과목을 배운 뒤 선택 과목을 고릅니다. <span class="for-sci">열은 교과, 행은 선택 구분입니다.</span><span class="for-math">행은 선택 구분입니다.</span> 흐린 상자는 아직 준비 중입니다.</p></div>
      <div class="tree-body" id="tree-body">
      <div class="tree-sci">
        <div class="mx" role="table" aria-label="공통 과목"><div class="mx-row mx-flowrow" role="row" data-track="common"><span class="mx-lb mx-lv" role="rowheader">공통<small>고1 공통 과목</small></span><div class="mx-cell mx-flow" role="cell" data-col="공통">${pick((c) => c.track === "common").map((c) => box(c)).join("")}</div></div></div>
        <p class="mx-arrow mono small dim" aria-hidden="true">↓ 선택 과목</p>
        ${sciMatrix()}
      </div>
      <div class="tree-mth">
        <div class="mx" role="table" aria-label="공통 과목"><div class="mx-row mx-flowrow" role="row" data-track="math"><span class="mx-lb mx-lv" role="rowheader">공통<small>고1 공통 과목</small></span><div class="mx-cell mx-flow" role="cell" data-col="공통">${pick((c) => c.track === "math" && c.level === "공통").map((c) => box(c)).join("")}</div></div></div>
        <p class="mx-arrow mono small dim" aria-hidden="true">↓ 선택 과목</p>
        ${mathMatrix()}
      </div>
      </div>`;
    /* 체계도 접기: 처음엔 접힌 채로, 펼친 상태는 이 브라우저에 기억한다 */
    if (tree) {
      const TREE_KEY = "namunnip-tree-open", tg = tree.querySelector(".tree-tg");
      const setOpen = (open, save) => {
        tree.classList.toggle("open", open);
        tg.setAttribute("aria-expanded", String(open));
        tg.querySelector(".tg-t").textContent = open ? "접기" : "펼치기";
        if (save) try { localStorage.setItem(TREE_KEY, open ? "1" : "0"); } catch (e) { /* 저장 못 해도 동작은 한다 */ }
      };
      let open = false;
      try { open = localStorage.getItem(TREE_KEY) !== "0"; } catch (e) { open = true; }   // 처음에는 펼쳐 둔다(메인의 과목 고르기 자리)
      setOpen(open, false);
      tg.addEventListener("click", () => setOpen(!tree.classList.contains("open"), true));
      /* 보기 범위: 기본은 일반·진로선택만. 융합선택·과학계열 열과 과목 목록의 해당 과목을 숨긴다 */
      const SCOPE_KEY = "namunnip-scope";
      const setScope = (sc, save) => {
        document.body.dataset.scope = sc === "all" ? "all" : "basic";
        tree.querySelectorAll("[data-scope]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.scope === document.body.dataset.scope)));
        if (save) try { localStorage.setItem(SCOPE_KEY, document.body.dataset.scope); } catch (e) { /* 무시 */ }
      };
      let sc0 = "basic";
      try { sc0 = localStorage.getItem(SCOPE_KEY) || "basic"; } catch (e) { sc0 = "basic"; }
      setScope(sc0, false);
      tree.querySelector(".scope-seg").addEventListener("click", (e) => { const b = e.target.closest("[data-scope]"); if (b) setScope(b.dataset.scope, true); });
    }
    /* 대단원을 순서대로 k단에 나눈다: 각 단 높이(절 수 + 머리 2줄)의 최댓값이 가장 작게(연속 분할) */
    const split = (chs, k) => {
      const w = chs.map((ch) => ch.sections.length + 2), n = w.length;
      k = Math.min(k, n);
      const pre = [0]; w.forEach((x) => pre.push(pre.at(-1) + x));
      const best = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(Infinity)), cut = best.map(() => new Array(n + 1).fill(0));
      best[0][0] = 0;
      for (let j = 1; j <= k; j++) for (let i = 1; i <= n; i++) for (let p = j - 1; p < i; p++) {
        const v = Math.max(best[j - 1][p], pre[i] - pre[p]); if (v < best[j][i]) { best[j][i] = v; cut[j][i] = p; }
      }
      const cols = []; let i = n;
      for (let j = k; j > 0; j--) { const p = cut[j][i]; cols.unshift(chs.slice(p, i)); i = p; }
      return cols;
    };
    host.innerHTML = TOC.map((c) => {
      const n = count(c), l = learn(c);
      const chapterHtml = (ch) => `
        <div class="chapter">
          <h3><span class="mono">${R[ch.n]}</span>${esc(ch.title)}</h3>
          <ol>${ch.sections.map((s) => {
            const nv = s.items.filter((i) => i.kind === "video").length, nc = s.items.length - nv;
            const hay = esc([s.title, s.code, ...s.items.map((i) => i.title)].join(" ").toLowerCase());
            const label = `<span class="mono">${ch.n}.${s.n}</span><span class="t">${esc(s.title)}</span>`;
            const tail = s.page ? `<span class="cnt mono">카드 ${nc}${nv ? ` · 영상 ${nv}` : ""}</span>` : `<span class="cnt mono dim">준비 중</span>`;
            const hits = `<ul class="hits">${s.items.map((i) => `<li data-hay="${esc(i.title.toLowerCase())}">${i.kind === "video" ? "영상 · " : i.kind === "text" ? "읽기 · " : ""}${esc(i.title)}</li>`).join("")}</ul>`;
            return s.page
              ? `<li data-hay="${hay}"><a href="${base}${c.id}/${ch.n}-${s.n}.html">${label}${tail}</a>${hits}</li>`
              : `<li data-hay="${hay}" class="soon"><div>${label}${tail}</div></li>`;
          }).join("")}</ol>
        </div>`;
      const chapters = split(c.chapters, 3).map((col) => `<div class="ch-col">${col.map(chapterHtml).join("")}</div>`).join("");
      return `
      <section class="course" data-course="${c.id}" data-track="${c.track}"${ADV(c) ? ' data-adv="1"' : ""}>
        <div class="course-head">
          <span class="mono">${esc(c.meta)}</span>
          <h2><a href="${base}${c.id}/">${esc(c.name)}</a></h2>
          <p class="count mono dim">절 ${n.open}/${n.sec} · 카드 ${n.cards} · 영상 ${n.vids}</p>
          <p class="learn mono small" data-cid="${c.id}"><span class="lp" aria-hidden="true"><i style="--p:${l.p.toFixed(3)}"></i></span>학습 <span class="lp-n">${pct(l)}</span> <span class="dim lp-c">(${l.seen}/${l.total})</span></p>
          <p><a class="link" href="${base}${c.id}/">과목 목차 →</a></p>
        </div>
        <div class="chapters">${chapters}</div>
      </section>`;
    }).join("");

    const chips = document.getElementById("chips");
    /* 분야 탭(과학/수학): 체계도·과목 목록·칩을 그 분야만 보인다. 마지막 탭은 localStorage에 둔다(?tab=은 스크린샷용) */
    const domainOf = (track) => (track === "math" ? "math" : "sci");
    const TAB_KEY = "namunnip-home-tab";
    chips.innerHTML = `<button class="chip" data-course="all" aria-pressed="true">전체</button>` +
      [...TRACKS, ["common", "공통"], ["fusion", "융합"]].map(([t, nm]) => `<button class="chip" data-course="${t}" aria-pressed="false">${nm}</button>`).join("");
    const q = document.getElementById("q"), empty = document.getElementById("empty");
    const tabs = document.getElementById("dom-tabs");
    const HINT = { sci: "절·카드 찾기 — 예: 중력, 스펙트럼, pH", math: "절·카드 찾기 — 예: 이차방정식, 미분, 확률" };
    let course = "all", domain = "sci";
    function apply() {
      const term = q.value.trim().toLowerCase();
      document.body.classList.toggle("searching", !!term);
      let shown = 0;
      host.querySelectorAll("section.course").forEach((sec) => {
        let any = false;
        sec.querySelectorAll(".chapter").forEach((ch) => {
          let chAny = false;
          ch.querySelectorAll(":scope > ol > li").forEach((li) => {
            const hit = !term || li.dataset.hay.includes(term);
            li.hidden = !hit; if (hit) chAny = true;
            li.querySelectorAll(".hits li").forEach((h) => { h.hidden = !term || !h.dataset.hay.includes(term); });
          });
          ch.hidden = !chAny; if (chAny) any = true;
        });
        sec.hidden = !(any && domainOf(sec.dataset.track) === domain && (course === "all" || sec.dataset.track === course));
        if (!sec.hidden) shown++;
      });
      empty.style.display = shown ? "none" : "block";
    }
    chips.addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      course = b.dataset.course;
      chips.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === b));
      apply();
    });
    q.addEventListener("input", apply);
    function setDomain(d, save) {
      domain = d === "math" ? "math" : "sci";
      document.body.dataset.domain = domain;
      tabs.querySelectorAll("[role=tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.domain === domain)));
      if (domain === "math" && course !== "all") {
        course = "all";
        chips.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.course === "all")));
      }
      q.placeholder = HINT[domain];
      if (save) try { localStorage.setItem(TAB_KEY, domain); } catch (e) { console.warn("탭을 저장하지 못함", e); }
      apply();
    }
    tabs.addEventListener("click", (e) => { const b = e.target.closest("[role=tab]"); if (b) setDomain(b.dataset.domain, true); });
    tabs.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      setDomain(domain === "sci" ? "math" : "sci", true);
      tabs.querySelector("[aria-selected=true]").focus();
    });
    /* 다른 탭에서 카드를 보면(storage 이벤트) 학습률을 다시 적는다 */
    if (S) S.onChange(() => TOC.forEach((c) => {
      const l = learn(c);
      document.querySelectorAll(`[data-cid="${c.id}"]`).forEach((el) => {
        const i = el.querySelector(".lp i"), nEl = el.querySelector(".lp-n"), cEl = el.querySelector(".lp-c");
        if (i) i.style.setProperty("--p", l.p.toFixed(3));
        if (nEl) nEl.textContent = pct(l);
        if (cEl) cEl.textContent = `(${l.seen}/${l.total})`;
      });
    }));
    let saved = new URLSearchParams(location.search).get("tab");
    if (!saved) try { saved = localStorage.getItem(TAB_KEY); } catch (e) { saved = null; }
    setDomain(saved, false);
    const seenAll = new Set();
    const total = TOC.reduce((a, c) => { const n = count(c, seenAll); a.cards += n.cards; a.vids += n.vids; a.open += n.open; return a; }, { cards: 0, vids: 0, open: 0 });
    const stat = document.getElementById("stat");
    const live = TOC.filter((c) => c.id !== "extra" && count(c).open).length;
    if (stat) stat.textContent = `과목 ${live}/${TOC.length - 1} · 절 ${total.open} · 카드 ${total.cards} · 영상 ${total.vids}`;

    /* 소개 아래 한 줄: 마지막으로 본 카드의 과목에서 아직 안 본 다음 카드로. 기록이 없으면 비워 둔다 */
    const go = document.getElementById("dash-go");
    function dash() {
      if (!go) return;
      const at = new Map();   // 카드 id → { c, ch, s, i }
      TOC.forEach((c) => c.chapters.forEach((ch) => ch.sections.forEach((s) => { if (s.page) s.items.forEach((i) => at.set(i.id, { c, ch, s, i })); })));
      const blocks = S ? S.all().blocks : {};
      let last = null, lastT = 0;
      for (const [id, b] of Object.entries(blocks)) {
        const w = at.get(id), t = (b && b.seen) || 0;
        if (!w || !t) continue;
        if (t > lastT) { lastT = t; last = w; }
      }
      const href = (w) => `${base}${w.c.id}/${w.ch.n}-${w.s.n}.html#${w.i.id}`;
      if (!last) { go.innerHTML = ""; return; }
      /* 같은 과목에서 마지막으로 본 카드 뒤의 첫 안 본 카드(없으면 과목 처음부터 첫 안 본 카드) */
      const seq = [...at.values()].filter((w) => w.c === last.c);
      const k = seq.findIndex((w) => w.i.id === last.i.id);
      const unseen = (w) => !(blocks[w.i.id] || {}).seen;
      const next = seq.slice(k + 1).find(unseen) || seq.find(unseen);
      go.innerHTML = next
        ? `<a class="dash-next" href="${href(next)}"><span class="mono">이어서 공부하기 · ${esc(next.c.name)}</span><b>${next.ch.n}.${next.s.n} ${esc(next.s.title)}</b><span class="dim small">다음 카드: ${esc(next.i.title)}</span></a>`
        : `<a class="dash-next" href="${base}${last.c.id}/"><span class="mono">${esc(last.c.name)}</span><b>모든 카드를 공부했습니다</b><span class="dim small">과목 목차에서 복습하기</span></a>`;
    }
    dash();
    if (S) S.onChange(dash);
  }

  /* ───── 과목 목차(책 목차형): 왼쪽에 과목 정보·진도·선수/다음 과목, 오른쪽에 대단원 → 절 → 카드 ───── */
  if (view === "course") {
    const c = TOC.find((x) => x.id === document.body.dataset.course);
    if (!c) return;
    const S = window.NMStore;
    const n = count(c);
    const seen = (id) => !!(S && (S.get(id) || {}).seen);
    /* 2022 개정 교육과정의 과목 위계(선택 과목의 권장 선수 과목). 다음 과목은 이 표를 뒤집어 구한다 */
    const PRE = {
      phy: ["is1", "is2"], chem: ["is1", "is2"], bio: ["is1", "is2"], earth: ["is1", "is2"],
      mech: ["phy"], emq: ["phy"], mateng: ["chem"], rxn: ["chem"], cell: ["bio"], gene: ["bio"], esys: ["earth"], space: ["earth"],
      hist: ["is1", "is2"], clim: ["is1", "is2"], fusi: ["is1", "is2"],
      adphy: ["mech", "emq"], adchem: ["mateng", "rxn"], adbio: ["cell", "gene"], adearth: ["esys", "space"],
      resr: ["sie1", "sie2"], labphy: ["phy"], labchem: ["chem"], labbio: ["bio"], labearth: ["earth"],
      alg: ["cm1", "cm2"], stat: ["cm1", "cm2"], calc1: ["alg"], calc2: ["calc1"], geo: ["cm1", "cm2"],
      pmath: ["alg", "calc1"], adcalc: ["calc2"], adalg: ["alg"], dmath: ["cm1", "cm2"], adgeo: ["geo"],
      econ: ["alg", "calc1"], aimath: ["alg", "stat"], jmath: ["cm1", "cm2"], mcult: ["cm1", "cm2"], pstat: ["cm1", "cm2"], mres: ["cm1", "cm2"],
    };
    const FIRST = { is1: "중학교 과학", is2: "중학교 과학", sie1: "중학교 과학", sie2: "중학교 과학", cm1: "중학교 수학", cm2: "중학교 수학", info: "중학교 정보" };
    const byId = (id) => TOC.find((x) => x.id === id);
    const pre = (PRE[c.id] || []).map(byId).filter(Boolean);
    const next = Object.keys(PRE).filter((k) => PRE[k].includes(c.id)).map(byId).filter(Boolean);
    const link = (x) => `<a href="../${x.id}/">${esc(x.name)}</a>`;
    const items = c.chapters.flatMap((ch) => ch.sections.filter((s) => s.page).flatMap((s) => s.items.map((i) => ({ ch, s, i }))));
    const done = items.filter((x) => seen(x.i.id)).length;
    const nextUp = items.find((x) => !seen(x.i.id));
    const code = (c.chapters.flatMap((ch) => ch.sections).find((s) => /\d/.test(s.code || "")) || {}).code || "";
    /* 성취기준 코드에서 과목 약칭만: 10공수1-01-01 → 10공수1, 12물리01-01 → 12물리 */
    const subj = (k) => { const p = k.split("-"); return p.length === 2 ? p[0].replace(/\d{2}$/, "") : p[0]; };
    const info = [["구분", c.meta], ["구성", `대단원 ${c.chapters.length} · 절 ${n.open}/${n.sec} · 카드 ${n.cards}${n.vids ? ` · 영상 ${n.vids}` : ""}`],
      ["교육과정", code ? `2022 개정 [${subj(code)}]` : "교육과정 밖 교양"]];
    const nAi = c.chapters.reduce((t, ch) => t + ch.sections.reduce((u, s) => u + (s.ai || 0), 0), 0);   // AI 출제 연습 문항(bank.html)
    const kindLb = (i) => (i.kind === "video" ? '<span class="cx-k mono">영상</span>' : i.kind === "text" ? '<span class="cx-k mono">읽기</span>' : "");

    document.title = `${c.name} — 나뭇잎 디지털 교과서`;
    const crumbs = document.querySelector(".crumbs");
    if (crumbs) crumbs.innerHTML = `<span aria-hidden="true">/</span><b>${esc(c.name)}</b>`;
    const hero = document.querySelector(".course-hero"); if (hero) hero.hidden = true;
    const pct = items.length ? Math.round((100 * done) / items.length) : 0;
    document.getElementById("c-body").innerHTML = `
      <div class="cx">
        <aside class="cx-side">
          <span class="cx-pill">${esc(c.meta)}</span>
          <h1>${esc(c.name)}</h1>
          <p class="cx-lead">${c.chapters.map((ch) => esc(ch.title)).join(" · ")}</p>
          <div class="cx-prog" aria-hidden="true"><i style="width:${pct}%"></i></div>
          <p class="cx-prog-t mono small">카드 <span class="cx-done">${done}</span>/${items.length} 공부함 (<span class="cx-pct">${pct}</span>%)</p>
          ${nextUp ? `<a class="cx-go" href="${nextUp.ch.n}-${nextUp.s.n}.html#${nextUp.i.id}">${done ? "이어서 공부하기" : "처음부터 공부하기"} · ${nextUp.ch.n}.${nextUp.s.n} ${esc(nextUp.s.title)}</a>` : items.length ? `<p class="cx-all small">모든 카드를 공부했습니다.</p>` : ""}
          ${nAi ? `<a class="cx-bank" href="../../bank.html?c=${c.id}"><b>연습 시험 풀기</b><span class="dim">중간고사·기말고사 범위 시험지 · AI 출제 ${nAi}문항</span></a>` : ""}
          <dl class="cx-info">${info.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
          <div class="cx-path small">
            <p><span class="dim">먼저 공부할 과목</span>${pre.length ? pre.map(link).join(" · ") : esc(FIRST[c.id] || "따로 없음")}</p>
            ${next.length ? `<p><span class="dim">이어지는 과목</span>${next.map(link).join(" · ")}</p>` : ""}
          </div>
        </aside>
        <div class="cx-main">${c.chapters.map((ch) => {
          const its = ch.sections.filter((s) => s.page).flatMap((s) => s.items), dn = its.filter((i) => seen(i.id)).length;
          return `
          <section class="cx-ch">
            <div class="cx-ch-head"><span class="cx-no">${R[ch.n] || ch.n}</span><h2>${esc(ch.title)}</h2><span class="cx-meta mono">절 ${ch.sections.length} · 카드 ${dn}/${its.length}</span></div>
            ${ch.sections.map((s) => {
              const sd = s.items.filter((i) => seen(i.id)).length, all = s.page && s.items.length && sd === s.items.length;
              const head = s.page ? `<a href="${ch.n}-${s.n}.html">${esc(s.title)}</a>` : esc(s.title);
              return `
            <div class="cx-sec${s.page ? "" : " soon"}">
              <span class="cx-n mono">${ch.n}.${s.n}</span>
              <div class="cx-t"><b>${head}</b>${/\d/.test(s.code || "") ? `<span class="cx-code mono">[${esc(s.code)}]</span>` : ""}</div>
              <span class="cx-badge mono${all ? " ok" : ""}">${!s.page ? "준비 중" : all ? "완료" : `${sd}/${s.items.length}`}</span>
              ${s.page ? `<ul class="cx-qs">${s.items.map((i) => `<li class="${seen(i.id) ? "done" : ""}"><a href="${ch.n}-${s.n}.html#${i.id}">${kindLb(i)}${esc(i.title)}</a></li>`).join("")}</ul>` : ""}
            </div>`;
            }).join("")}
          </section>`;
        }).join("")}</div>
      </div>`;
  }
})();
