/* 연습문제 화면 (practice.html?sec=<과목>-<대단원>-<절>): 그 절에 분류된 기출 문항을 풀고, 처음에 틀린 문항은 오답노트에 남긴다.
   문항 데이터: exams/sec/<sec>.json = { sec, items: [{ id, src, year, grade, kind, subject, no, pts, img, text, type: "mc"|"short", answer }] }
   기록: NMStore에 문항 id(ex-…)를 키로, extra = { src, sec, img, href } 와 함께 저장한다(js/notebook.js가 절별로 묶어 보여 준다). */
(() => {
  "use strict";
  const S = window.NMStore;
  const host = document.getElementById("px-list");
  if (!host || !window.TOC) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const CIRCLE = ["①", "②", "③", "④", "⑤"];
  const KIND = { csat: "수능", mock: "모의평가", hakp: "학력평가" };

  const sec = new URLSearchParams(location.search).get("sec") || "";
  const m = /^([a-z0-9]+)-(\d+)-(\d+)$/.exec(sec);
  const c = m && TOC.find((x) => x.id === m[1]);
  const ch = c && c.chapters.find((x) => x.n === +m[2]);
  const s = ch && ch.sections.find((x) => x.n === +m[3]);
  const head = document.getElementById("px-head");
  if (!s) { head.innerHTML = `<h1>연습문제</h1><p class="lead">절을 찾을 수 없습니다. <a href="./">전체 목차</a>에서 절을 고른 뒤 절 끝의 <b>연습문제</b> 버튼을 눌러 주세요.</p>`; return; }

  const secHref = `c/${c.id}/${ch.n}-${s.n}.html`;
  document.title = `연습문제 · ${s.title} — 나뭇잎 교과서`;
  document.querySelector(".crumbs").innerHTML = `<span aria-hidden="true">/</span><a href="c/${c.id}/">${esc(c.name)}</a><span aria-hidden="true">/</span><a href="${secHref}">${ch.n}.${s.n} ${esc(s.title)}</a><span aria-hidden="true">/</span><b>연습문제</b>`;
  head.innerHTML = `<span class="mono dim">${esc(c.name)} · ${ch.n}.${s.n}${/\d/.test(s.code) ? ` · [${esc(s.code)}]` : ""}</span>
    <h1>${esc(s.title)} <em>연습문제</em></h1>
    <p class="lead">이 절에 해당하는 수능·모의평가·학력평가 기출 문항입니다. 처음 풀 때 틀린 문항은 <a href="notes.html#wrong">오답노트</a>에 모입니다.</p>
    <p class="mono small dim" id="px-stat"></p>`;

  let items = [], filter = "all";
  const bar = document.getElementById("px-bar");

  function recOf(it) { const r = S && S.get(it.id); return r && r.quiz && r.quiz[0]; }
  function label(it) { return `${it.year}${it.kind === "hakp" ? "년" : "학년도"} ${it.grade ? `고${it.grade} ` : ""}${it.month ? `${it.month}월 ` : ""}${KIND[it.kind] || ""} ${it.subject} ${it.no}번`; }
  const shownAnswer = (it) => (it.type === "mc" ? CIRCLE[+it.answer - 1] || it.answer : it.answer);

  function render() {
    const list = items.filter((it) => filter === "all" ? true : filter === "wrong" ? (recOf(it) || {}).firstOk === false : it.kind === filter || (filter === "kice" && (it.kind === "csat" || it.kind === "mock")));
    const done = items.filter(recOf).length, wrong = items.filter((it) => (recOf(it) || {}).firstOk === false).length;
    document.getElementById("px-stat").textContent = `문항 ${items.length} · 푼 문항 ${done} · 처음에 틀린 문항 ${wrong}`;
    host.innerHTML = list.length ? list.map((it) => {
      const r = recOf(it);
      const state = r ? (r.firstOk ? "ok" : "bad") : "";
      const ans = it.type === "mc"
        ? (Array.isArray(it.choices) && it.choices.length === 5
          ? `<div class="px-opts long" role="group" aria-label="답 고르기">${CIRCLE.map((t, i) => `<button type="button" class="px-opt" data-v="${i + 1}"><span class="n">${t}</span><span class="c">${it.choices[i]}</span></button>`).join("")}</div>`
          : `<div class="px-opts" role="group" aria-label="답 고르기">${CIRCLE.map((t, i) => `<button type="button" class="px-opt" data-v="${i + 1}">${t}</button>`).join("")}</div>`)
        : `<form class="px-short"><input type="text" inputmode="numeric" aria-label="답 쓰기" placeholder="답"><button type="submit" class="btn">확인</button></form>`;
      return `<article class="px-item ${state}" id="${esc(it.id)}" data-id="${esc(it.id)}">
        <header><span class="mono">${esc(label(it))}</span>${it.pts ? `<span class="mono dim">${it.pts}점</span>` : ""}${r ? `<span class="mono px-prev ${state}">${r.firstOk ? "처음에 맞힘" : "오답노트에 있음"}</span>` : ""}</header>
        ${it.html ? textBody(it) : `<figure class="px-fig"><img src="${esc(it.img)}" alt="${esc(label(it))} 문항: ${esc((it.text || "").slice(0, 120))}" loading="lazy"></figure>`}
        ${ans}
        <p class="px-result" aria-live="polite"></p>
      </article>`;
    }).join("") : `<p class="px-empty">${items.length ? "조건에 맞는 문항이 없습니다." : "아직 이 절에 분류된 기출 문항이 없습니다."}</p>`;
    if (window.NMMath) NMMath.render(host);
  }

  /* 텍스트로 옮겨 쓴 문항(tools/exams/process.py publish가 html·choices·shared·figs를 넣음): 공통 지문 → 본문 → 그림. 수식은 NMMath가 그린다 */
  const figs = (fs, lab) => (fs || []).map((f) => `<figure class="px-figimg"><img src="${esc(f.src)}" alt="${esc(f.alt || lab)}" loading="lazy"></figure>`).join("");
  const textBody = (it) => `<div class="px-text">${it.shared ? `<div class="px-shared">${it.shared}${figs(it.sfigs, "공통 지문 그림")}</div>` : ""}<div class="px-stem">${it.html}</div>${figs(it.figs, label(it))}</div>`;

  function answer(card, chosen) {
    const it = items.find((x) => x.id === card.dataset.id);
    if (!it) return;
    const norm = (v) => String(v).replace(/\s+/g, "").replace(/^0+(?=\d)/, "");
    const ok = norm(chosen) === norm(it.answer);
    card.querySelectorAll(".px-opt").forEach((b) => {
      b.classList.toggle("right", b.dataset.v === String(it.answer));
      b.classList.toggle("wrong", !ok && b.dataset.v === String(chosen));
    });
    card.querySelector(".px-result").innerHTML = ok ? `<b>맞았습니다.</b> 정답 ${esc(shownAnswer(it))}` : `<b>틀렸습니다.</b> 고른 답 ${esc(it.type === "mc" ? CIRCLE[+chosen - 1] : chosen)} · 정답 ${esc(shownAnswer(it))}`;
    card.classList.toggle("bad", !ok); card.classList.toggle("ok", ok);
    if (S) {
      S.recordAnswer(it.id, 0, {
        ok, q: label(it), answer: shownAnswer(it), why: `${label(it)}의 정답입니다.`,
        chosen: it.type === "mc" ? CIRCLE[+chosen - 1] || String(chosen) : String(chosen), chosenWhy: "",
        extra: { src: label(it), sec, img: it.img, href: `practice.html?sec=${sec}#${it.id}`,
          ...(it.html ? { html: it.html, shared: it.shared || null, choices: it.choices || null, figs: [...(it.sfigs || []), ...(it.figs || [])].map((f) => f.src) } : {}) },
      });
      S.markSeen(it.id);
    }
  }

  host.addEventListener("click", (e) => {
    const b = e.target.closest(".px-opt"); if (!b) return;
    answer(b.closest(".px-item"), b.dataset.v);
  });
  host.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = e.target.querySelector("input").value.trim(); if (!v) return;
    answer(e.target.closest(".px-item"), v);
  });
  bar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-f]"); if (!b) return;
    filter = b.dataset.f;
    bar.querySelectorAll("[data-f]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    render();
  });
  document.getElementById("px-back").href = secHref;

  fetch(`exams/sec/${sec}.json`).then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] })).then((d) => {
    items = (d.items || []).slice().sort((a, b) => b.year - a.year || (a.no - b.no));
    render();
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  });
})();
