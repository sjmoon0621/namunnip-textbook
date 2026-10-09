/* 목차 화면: 메인(<body data-view="home">)과 과목(<body data-view="course" data-course="is1">) — toc.js에서 그린다 */
(() => {
  "use strict";
  const view = document.body.dataset.view;
  if (!view || !window.TOC) return;
  const R = ["", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"];
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const count = (c) => {
    let sec = 0, open = 0, cards = 0, vids = 0;   // 읽기(text) 블록은 카드와 함께 센다
    c.chapters.forEach((ch) => ch.sections.forEach((s) => {
      sec++; if (s.page) open++;
      s.items.forEach((it) => (it.kind === "video" ? vids++ : cards++));
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
    const box = (c) => {
      const n = count(c), l = learn(c);
      return `<a class="tbox${n.open ? "" : " soon"}" href="${base}${c.id}/" data-track="${c.track}" data-cid="${c.id}">
        <span class="lv mono">${LV[c.level]}</span><b>${esc(c.name)}</b>
        <span class="pg mono">${n.open ? `절 ${n.open} · 학습 <span class="lp-n">${pct(l)}</span>` : `준비 중 · 절 ${n.sec}`}</span>
        ${n.open ? `<span class="lp" aria-hidden="true"><i style="--p:${l.p.toFixed(3)}"></i></span>` : ""}</a>`;
    };
    const pick = (f) => TOC.filter(f).sort((a, b) => RANK.indexOf(a.level) - RANK.indexOf(b.level));
    const tree = document.getElementById("tree");
    if (tree) tree.innerHTML = `
      <div class="tree-head"><h2>과목 체계도</h2><p class="mono small dim">열마다 위에서 아래로 일반선택 → 진로선택 → 고급 → 실험. 흐린 상자는 아직 준비 중입니다.</p></div>
      <div class="tree-band" data-track="common"><span class="band-lb mono">공통</span><div>${pick((c) => c.track === "common").map(box).join("")}</div></div>
      <div class="tree-cols">${TRACKS.map(([t, nm]) => `
        <div class="tree-col" data-track="${t}"><h3>${nm}</h3>${pick((c) => c.track === t).map(box).join("")}</div>`).join("")}
      </div>
      <div class="tree-band" data-track="fusion"><span class="band-lb mono">융합</span><div>${pick((c) => c.track === "fusion").map(box).join("")}</div></div>
      <div class="tree-band" data-track="math"><span class="band-lb mono">수학</span><div>${pick((c) => c.track === "math").map(box).join("")}</div></div>`;
    host.innerHTML = TOC.map((c) => {
      const n = count(c), l = learn(c);
      const chapters = c.chapters.map((ch) => `
        <div class="chapter">
          <h3><span class="mono">${R[ch.n]}</span>${esc(ch.title)}</h3>
          <ol>${ch.sections.map((s) => {
            const nv = s.items.filter((i) => i.kind === "video").length, nc = s.items.length - nv;
            const hay = esc([s.title, s.code, ...s.items.map((i) => i.title)].join(" ").toLowerCase());
            const label = `<span class="mono">${ch.n}.${s.n}</span><span class="t">${esc(s.title)}</span>`;
            const tail = s.page ? `<span class="cnt mono">${nc}${nv ? `+${nv}` : ""}</span>` : `<span class="cnt mono dim">준비 중</span>`;
            const hits = `<ul class="hits">${s.items.map((i) => `<li data-hay="${esc(i.title.toLowerCase())}">${i.kind === "video" ? "영상 · " : i.kind === "text" ? "읽기 · " : ""}${esc(i.title)}</li>`).join("")}</ul>`;
            return s.page
              ? `<li data-hay="${hay}"><a href="${base}${c.id}/${ch.n}-${s.n}.html">${label}${tail}</a>${hits}</li>`
              : `<li data-hay="${hay}" class="soon"><div>${label}${tail}</div></li>`;
          }).join("")}</ol>
        </div>`).join("");
      return `
      <section class="course" data-course="${c.id}" data-track="${c.track}">
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
    const total = TOC.reduce((a, c) => { const n = count(c); a.cards += n.cards; a.vids += n.vids; a.open += n.open; return a; }, { cards: 0, vids: 0, open: 0 });
    const stat = document.getElementById("stat");
    const live = TOC.filter((c) => c.id !== "extra" && count(c).open).length;
    if (stat) stat.textContent = `과목 ${live}/${TOC.length - 1} · 절 ${total.open} · 카드 ${total.cards} · 영상 ${total.vids}`;
  }

  /* ───── 과목 목차 ───── */
  if (view === "course") {
    const c = TOC.find((x) => x.id === document.body.dataset.course);
    if (!c) return;
    const n = count(c);
    document.title = `${c.name} — 나뭇잎 디지털 교과서`;
    document.getElementById("c-meta").textContent = c.meta;
    document.getElementById("c-name").textContent = c.name;
    document.getElementById("c-stat").textContent = `대단원 ${c.chapters.length} · 절 ${n.open}/${n.sec} · 카드 ${n.cards} · 영상 ${n.vids}`;
    const crumbs = document.querySelector(".crumbs");
    if (crumbs) crumbs.innerHTML = `<span aria-hidden="true">/</span><b>${esc(c.name)}</b>`;
    document.getElementById("c-body").innerHTML = c.chapters.map((ch) => `
      <section class="c-chapter">
        <h2><span class="mono">${R[ch.n]}</span>${esc(ch.title)}</h2>
        <ol>${ch.sections.map((s) => {
          const items = s.items.map((i) => `<li class="${i.kind}"><a href="${ch.n}-${s.n}.html#${i.id}">${i.kind === "video" ? '<span class="mono">영상</span>' : i.kind === "text" ? '<span class="mono">읽기</span>' : ""}${esc(i.title)}</a></li>`).join("");
          return `<li class="c-sec${s.page ? "" : " soon"}">
            <div class="c-sec-head">
              <span class="mono num">${ch.n}.${s.n}</span>
              ${s.page ? `<a href="${ch.n}-${s.n}.html"><b>${esc(s.title)}</b></a>` : `<b>${esc(s.title)}</b>`}
              <span class="mono code">${/\d/.test(s.code) ? `[${esc(s.code)}]` : ""}</span>
            </div>
            ${s.page ? `<ul class="c-items">${items}</ul>` : `<p class="dim small">준비 중</p>`}
          </li>`;
        }).join("")}</ol>
      </section>`).join("");
  }
})();
