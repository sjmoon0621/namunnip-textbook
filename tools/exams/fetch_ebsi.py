#!/usr/bin/env python3
"""EBSi 기출문제 PDF 수집 및 매니페스트 생성 크롤러.

고교 수학 및 과학 전 과목 기출문제(문제지, 해설지)를 수집하여
exams/manifest.json 및 exams/raw/<YYYYMMDD>-go<g>-<kind>/<slug>_{mun,hsj}.pdf 로 저장한다.
"""

import argparse
import datetime
import json
import os
import pathlib
import re
import ssl
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT_DIR = pathlib.Path(__file__).resolve().parents[2]
EXAMS_DIR = ROOT_DIR / "exams"
RAW_DIR = EXAMS_DIR / "raw"
MANIFEST_PATH = EXAMS_DIR / "manifest.json"
REPORT_PATH = EXAMS_DIR / "fetch_report.md"

BASE_LIST_URL = "https://www.ebsi.co.kr/ebs/xip/xipc/previousPaperListAjax.ajax"
CDN_BASE = "https://wdown.ebsi.co.kr/W61001/01exam"

SSL_CTX = ssl._create_unverified_context()
DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def parse_subject(title: str):
    """시험 제목에서 과목명, slug, 홀수/짝수 여부를 판별한다.
    
    Returns: (subject_name, subject_slug, is_even)
    """
    t = re.sub(r"\s+", " ", title).strip()
    is_even = "짝수형" in t
    t_clean = re.sub(r"\s*(홀수형|짝수형)\s*$", "", t).strip()

    # 수학 계열
    if re.search(r"(확률과\s*통계|확률과통계)$", t_clean):
        return ("확률과 통계", "math-prob-stat", is_even)
    elif re.search(r"미적분$", t_clean):
        return ("미적분", "math-calc", is_even)
    elif re.search(r"기하$", t_clean):
        return ("기하", "math-geo", is_even)
    elif re.search(r"(수학\s*가형|수학가형|수리\s*가형|수리가형|수학\(가\))$", t_clean):
        return ("수학가형", "math-ga", is_even)
    elif re.search(r"(수학\s*나형|수학나형|수리\s*나형|수리나형|수학\(나\))$", t_clean):
        return ("수학나형", "math-na", is_even)
    elif re.search(r"(수학\s*A형|수학A형|수학\s*A|수학A|수학\(A\))$", t_clean):
        return ("수학A", "math-a", is_even)
    elif re.search(r"(수학\s*B형|수학B형|수학\s*B|수학B|수학\(B\))$", t_clean):
        return ("수학B", "math-b", is_even)
    elif re.search(r"수학$", t_clean):
        return ("수학", "math", is_even)

    # 과학 계열
    elif re.search(r"(물리학Ⅱ|물리Ⅱ)$", t_clean):
        return ("물리학Ⅱ", "phy2", is_even)
    elif re.search(r"(물리학Ⅰ|물리Ⅰ)$", t_clean):
        return ("물리학Ⅰ", "phy1", is_even)
    elif re.search(r"물리$", t_clean):
        return ("물리", "phy", is_even)
    elif re.search(r"화학Ⅱ$", t_clean):
        return ("화학Ⅱ", "che2", is_even)
    elif re.search(r"화학Ⅰ$", t_clean):
        return ("화학Ⅰ", "che1", is_even)
    elif re.search(r"화학$", t_clean):
        return ("화학", "che", is_even)
    elif re.search(r"(생명과학Ⅱ|생물Ⅱ)$", t_clean):
        return ("생명과학Ⅱ", "bio2", is_even)
    elif re.search(r"(생명과학Ⅰ|생물Ⅰ)$", t_clean):
        return ("생명과학Ⅰ", "bio1", is_even)
    elif re.search(r"(생명과학|생물)$", t_clean):
        return ("생명과학", "bio", is_even)
    elif re.search(r"지구과학Ⅱ$", t_clean):
        return ("지구과학Ⅱ", "ear2", is_even)
    elif re.search(r"지구과학Ⅰ$", t_clean):
        return ("지구과학Ⅰ", "ear1", is_even)
    elif re.search(r"지구과학$", t_clean):
        return ("지구과학", "ear", is_even)
    elif re.search(r"통합과학$", t_clean):
        return ("통합과학", "sci", is_even)
    elif re.search(r"(사회·과학탐구|과학탐구|과학)$", t_clean):
        return ("과학", "sci", is_even)

    return (None, None, is_even)


def get_kind(title: str) -> str:
    """시험 종류(csat, mock, hakp)를 판별한다."""
    if "대학수학능력시험" in title or "수능" in title:
        return "csat"
    elif "모의평가" in title or "모평" in title:
        return "mock"
    return "hakp"


def get_school_year(title: str, kind: str, year_admin: int):
    """대입 학년도를 계산한다."""
    m = re.search(r"(\d{4})학년도", title)
    if m:
        return int(m.group(1))
    if kind in ("csat", "mock"):
        return year_admin + 1
    return None


def fetch_list_page(target_cd: str, year: int, page: int = 1, delay: float = 0.3, retries: int = 3):
    """EBSi previousPaperListAjax.ajax 호출."""
    params = {
        "targetCd": target_cd,
        "yearList": str(year),
        "monthList": "03,04,05,06,07,08,09,10,11,12",
        "sort": "recent",
        "currentPage": str(page),
    }

    if target_cd == "D100":
        params.update({
            "arOrd": "2,6",
            "subjIdList": "110001,140073,sciPast",
            "sFormPartMath": ["110001"],
            "sFormPartSci": ["140073", "sciPast"],
        })
    elif target_cd == "D200":
        params.update({
            "arOrd": "2,6",
            "subjIdList": "140111,140221,140113,17042,17043,17041,sciPast",
            "sFormPartMath": ["140111"],
            "sFormPartSci": ["140221", "140113", "17042", "17043", "17041", "sciPast"],
        })
    elif target_cd == "D300":
        params.update({
            "arOrd": "2,6",
            "subjIdList": "140119,140120,140121,mathPast,140115,140116,156,157,158,159,154,155,sciPast",
            "sFormPartMath": ["140119", "140120", "140121", "mathPast"],
            "sFormPartSci": ["140115", "140116", "156", "157", "158", "159", "154", "155", "sciPast"],
        })

    data = urllib.parse.urlencode(params, doseq=True).encode("utf-8")
    req = urllib.request.Request(
        BASE_LIST_URL,
        data=data,
        headers={
            "User-Agent": DEFAULT_USER_AGENT,
            "Referer": f"https://www.ebsi.co.kr/ebs/xip/xipc/previousPaperList.ebs?targetCd={target_cd}",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
        },
    )

    last_err = None
    for attempt in range(retries):
        try:
            if delay > 0:
                time.sleep(delay)
            with urllib.request.urlopen(req, timeout=15, context=SSL_CTX) as resp:
                return resp.read().decode("utf-8", errors="ignore")
        except Exception as e:
            last_err = e
            time.sleep(1.0)
    raise RuntimeError(f"Failed to fetch {target_cd} {year} page {page} after {retries} retries: {last_err}")


def enumerate_grade(target_cd: str, start_year: int, end_year: int = 2026, delay: float = 0.3):
    """한 학년의 모든 연도 기출 목록을 수집한다."""
    grade = 1 if target_cd == "D100" else (2 if target_cd == "D200" else 3)
    exams = []

    print(f"[*] Enumerating {target_cd} (고{grade}) from {start_year} to {end_year}...")
    for yr in range(start_year, end_year + 1):
        page = 1
        year_exams = 0
        while True:
            html = fetch_list_page(target_cd, yr, page, delay=delay)
            boxes = re.findall(r'<div class="qus_box[^"]*">(.*?)</div>\s*</div>\s*</div>', html, re.DOTALL)
            if not boxes:
                break

            for b in boxes:
                tit_m = re.search(r'<div class="qus_tit">([^<]+)</div>', b)
                tit = tit_m.group(1).replace("&nbsp;", " ").strip() if tit_m else ""

                subj_name, subj_slug, is_even = parse_subject(tit)
                if not subj_name or is_even:
                    # 짝수형 또는 범위 외 과목은 건너뜀
                    continue

                p_m = re.search(r"goDownLoadP\('([^']+)'", b)
                h_m = re.search(r"goDownLoadH\('([^']+)'", b)
                p_url = p_m.group(1) if p_m else ""
                h_url = h_m.group(1) if h_m else ""

                # 날짜 YYYYMMDD 추출 (p_url 또는 h_url의 첫 디렉터리)
                dm = re.match(r"^/?(\d{8})", p_url) or re.match(r"^/?(\d{8})", h_url)
                if not dm:
                    continue
                date = dm.group(1)
                month = int(date[4:6])
                kind = get_kind(tit)
                school_year = get_school_year(tit, kind, yr)

                exam_id = f"{date}-go{grade}-{kind}-{subj_slug}"
                dir_name = f"{date}-go{grade}-{kind}"
                mun_path = f"exams/raw/{dir_name}/{subj_slug}_mun.pdf"
                hsj_path = f"exams/raw/{dir_name}/{subj_slug}_hsj.pdf"

                full_mun_url = (CDN_BASE + ("" if p_url.startswith("/") else "/") + p_url) if p_url else ""
                full_hsj_url = (CDN_BASE + ("" if h_url.startswith("/") else "/") + h_url) if h_url else ""

                exams.append({
                    "id": exam_id,
                    "date": date,
                    "year_admin": yr,
                    "school_year": school_year,
                    "grade": grade,
                    "month": month,
                    "kind": kind,
                    "subject": subj_name,
                    "subject_slug": subj_slug,
                    "mun_url": full_mun_url,
                    "hsj_url": full_hsj_url,
                    "mun_path": mun_path,
                    "hsj_path": hsj_path,
                    "status": "pending",
                    "note": "",
                })
                year_exams += 1

            if f"goPage({page+1})" not in html:
                break
            page += 1

        print(f"    - {yr}년 고{grade}: {year_exams}개 과목 시험지 발견")

    return exams


def compute_expected_gaps(collected_exams):
    """범위 내에 존재해야 하나 EBSi에 제공되지 않는 시험/과목 갭을 계산한다."""
    collected_keys = {(e["grade"], e["year_admin"], e["month"], e["kind"], e["subject"]) for e in collected_exams}
    gaps = []

    # 1. 2026년 하반기 미실시 시험 (현 시점 기준 아직 실시/공개되지 않음)
    # 고1 11월 학평 (2026)
    for subj in ["수학", "통합과학"]:
        gaps.append({
            "grade": 1,
            "year": 2026,
            "month": 11,
            "kind": "hakp",
            "subject": subj,
            "reason": "Not yet administered as of 2026-10 (scheduled for late 2026)",
        })

    # 고2 11월 학평 (2026)
    for subj in ["수학", "물리학Ⅰ", "화학Ⅰ", "생명과학Ⅰ", "지구과학Ⅰ"]:
        gaps.append({
            "grade": 2,
            "year": 2026,
            "month": 11,
            "kind": "hakp",
            "subject": subj,
            "reason": "Not yet administered as of 2026-10 (scheduled for late 2026)",
        })

    # 고3 10월 학평 (2026)
    for subj in ["확률과 통계", "미적분", "기하", "물리학Ⅰ", "물리학Ⅱ", "화학Ⅰ", "화학Ⅱ", "생명과학Ⅰ", "생명과학Ⅱ", "지구과학Ⅰ", "지구과학Ⅱ"]:
        gaps.append({
            "grade": 3,
            "year": 2026,
            "month": 10,
            "kind": "hakp",
            "subject": subj,
            "reason": "Not yet administered/released as of 2026-10 (scheduled for mid-October 2026)",
        })

    # 고3 11월 수능 (2026)
    for subj in ["확률과 통계", "미적분", "기하", "물리학Ⅰ", "물리학Ⅱ", "화학Ⅰ", "화학Ⅱ", "생명과학Ⅰ", "생명과학Ⅱ", "지구과학Ⅰ", "지구과학Ⅱ"]:
        gaps.append({
            "grade": 3,
            "year": 2026,
            "month": 11,
            "kind": "csat",
            "subject": subj,
            "reason": "Not yet administered as of 2026-10 (scheduled for November 2026)",
        })

    return gaps


def is_valid_pdf_file(path: pathlib.Path) -> bool:
    """파일이 존재하고 0바이트 초과이며 PDF 헤더로 시작하는지 검사."""
    if not path.is_file():
        return False
    try:
        if path.stat().st_size < 100:
            return False
        with open(path, "rb") as f:
            header = f.read(5)
            return header.startswith(b"%PDF")
    except OSError:
        return False


def download_single_file(url: str, dest_path: pathlib.Path, delay: float = 0.3, retries: int = 3):
    """단일 파일을 다운로드하고 원자적으로 저장한다."""
    if is_valid_pdf_file(dest_path):
        return True, "already_exists", dest_path.stat().st_size

    if not url:
        return False, "no_url", 0

    dest_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = dest_path.with_suffix(".tmp")

    last_err = None
    req = urllib.request.Request(url, headers={"User-Agent": DEFAULT_USER_AGENT})

    for attempt in range(retries):
        try:
            if delay > 0:
                time.sleep(delay)
            with urllib.request.urlopen(req, timeout=20, context=SSL_CTX) as resp:
                data = resp.read()
                if not data.startswith(b"%PDF"):
                    raise ValueError(f"Downloaded content from {url} is not a PDF (starts with {data[:20]!r})")
                with open(temp_path, "wb") as f:
                    f.write(data)
                os.replace(temp_path, dest_path)
                return True, "downloaded", len(data)
        except Exception as e:
            last_err = e
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except OSError:
                    pass
            time.sleep(1.0)

    return False, str(last_err), 0


def download_exam_pair(exam: dict, delay: float = 0.3, retries: int = 3):
    """문제지와 해설지를 다운로드하고 status를 반환한다."""
    mun_file = ROOT_DIR / exam["mun_path"]
    hsj_file = ROOT_DIR / exam["hsj_path"]

    mun_ok, mun_msg, mun_sz = download_single_file(exam["mun_url"], mun_file, delay=delay, retries=retries)
    hsj_ok, hsj_msg, hsj_sz = download_single_file(exam["hsj_url"], hsj_file, delay=delay, retries=retries)

    if mun_ok and hsj_ok:
        status = "ok"
        note = ""
    elif not mun_ok and not hsj_ok:
        status = "error"
        note = f"mun: {mun_msg}; hsj: {hsj_msg}"
    elif not mun_ok:
        status = "missing_mun"
        note = f"mun: {mun_msg}"
    else:
        status = "missing_hsj"
        note = f"hsj: {hsj_msg}"

    return exam["id"], status, note


def generate_report(manifest_data: dict, output_path: pathlib.Path):
    """fetch_report.md 요약 보고서를 작성한다."""
    exams = manifest_data["exams"]
    gaps = manifest_data["gaps"]

    # 집계
    by_grade = {1: 0, 2: 0, 3: 0}
    by_year = {}
    by_kind = {"hakp": 0, "mock": 0, "csat": 0}
    by_status = {}

    total_files = 0
    total_bytes = 0

    for e in exams:
        g = e["grade"]
        y = e["year_admin"]
        k = e["kind"]
        st = e["status"]

        by_grade[g] = by_grade.get(g, 0) + 1
        by_year[y] = by_year.get(y, 0) + 1
        by_kind[k] = by_kind.get(k, 0) + 1
        by_status[st] = by_status.get(st, 0) + 1

        p_mun = ROOT_DIR / e["mun_path"]
        p_hsj = ROOT_DIR / e["hsj_path"]
        if is_valid_pdf_file(p_mun):
            total_files += 1
            total_bytes += p_mun.stat().st_size
        if is_valid_pdf_file(p_hsj):
            total_files += 1
            total_bytes += p_hsj.stat().st_size

    total_mb = total_bytes / (1024 * 1024)

    lines = [
        "# EBSi 고교 기출문제 PDF 수집 및 매니페스트 보고서",
        "",
        f"- **수집 시각:** {manifest_data['generated']}",
        f"- **수집 대상 과목:** 수학 전 종목 (가형/나형/A형/B형, 확통/미적분/기하, 공통) + 과학 전 종목 (통합과학, 물·화·생·지 Ⅰ·Ⅱ)",
        f"- **총 수집 시험 건수:** {len(exams)}회차 (각 회차별 문제지 + 해설지 세트)",
        f"- **디스크 저장 파일 수:** {total_files}개 PDF",
        f"- **총 용량:** {total_mb:.2f} MB ({total_bytes:,} 바이트)",
        "",
        "## 1. 학년별 수집 현황",
        "",
        "| 학년 | 시험 건수 (세트) | 문제지+해설지 파일 수 |",
        "| :--- | :---: | :---: |",
        f"| 고1 (D100, 2011~2026) | {by_grade.get(1, 0)} | {by_grade.get(1, 0)*2} |",
        f"| 고2 (D200, 2012~2026) | {by_grade.get(2, 0)} | {by_grade.get(2, 0)*2} |",
        f"| 고3 (D300, 2013~2026) | {by_grade.get(3, 0)} | {by_grade.get(3, 0)*2} |",
        f"| **합계** | **{len(exams)}** | **{len(exams)*2}** |",
        "",
        "## 2. 시험 구분별 현황",
        "",
        "| 시험 구분 (`kind`) | 세트 수 | 비고 |",
        "| :--- | :---: | :--- |",
        f"| 전국연합학력평가 (`hakp`) | {by_kind.get('hakp', 0)} | 시·도 교육청 주관 (3, 4, 6, 7, 9, 10, 11월) |",
        f"| 한국교육과정평가원 모의평가 (`mock`) | {by_kind.get('mock', 0)} | 평가원 주관 (6월, 9월) |",
        f"| 대학수학능력시험 (`csat`) | {by_kind.get('csat', 0)} | 수능 본시험 (11월, 홀수형 기준) |",
        "",
        "## 3. 연도별 수집 세트 추이",
        "",
        "| 시행 연도 | 세트 수 | 비고 |",
        "| :---: | :---: | :--- |",
    ]

    for y in sorted(by_year.keys()):
        notes = []
        if y == 2011:
            notes.append("고1 학평 수집 개시 (2011~)")
        elif y == 2012:
            notes.append("고2 학평 수집 개시 (2012~)")
        elif y == 2013:
            notes.append("고3 학평/모평/수능 수집 개시 (2013~)")
        elif y == 2026:
            notes.append("진행 중인 학년도 (9월 모평까지 반영)")
        lines.append(f"| {y}년 | {by_year[y]} | {', '.join(notes)} |")

    lines.extend([
        "",
        "## 4. 수집 상태 요약",
        "",
        "| 상태 (`status`) | 건수 | 설명 |",
        "| :--- | :---: | :--- |",
    ])
    for st, cnt in sorted(by_status.items()):
        desc = "문제지 및 해설지 정상 수집 완료" if st == "ok" else st
        lines.append(f"| `{st}` | {cnt} | {desc} |")

    lines.extend([
        "",
        "## 5. 범위 내 미제공 / 미시행 시험 갭 목록 (`gaps`)",
        "",
        "수집 대상 범위(고1 2011~2026, 고2 2012~2026, 고3 2013~2026) 중 EBSi에서 제공하지 않거나 미시행된 시험 내역입니다.",
        "",
        "| 학년 | 연도 | 월 | 구분 (`kind`) | 과목 | 사유 (`reason`) |",
        "| :---: | :---: | :---: | :---: | :--- | :--- |",
    ])

    for g in gaps:
        lines.append(f"| 고{g['grade']} | {g['year']} | {g['month']}월 | `{g['kind']}` | {g['subject']} | {g['reason']} |")

    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"[*] Report generated: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="EBSi 기출문제 수집기")
    parser.add_argument("--workers", type=int, default=4, help="다운로드 동시 작업자 수 (기본: 4)")
    parser.add_argument("--delay", type=float, default=0.3, help="요청 간 최소 지연 초 (기본: 0.3s)")
    parser.add_argument("--retries", type=int, default=3, help="실패 시 재시도 횟수 (기본: 3)")
    parser.add_argument("--manifest-only", action="store_true", help="다운로드를 생략하고 매니페스트만 생성")
    args = parser.parse_args()

    print("==================================================")
    print(" EBSi 고교 기출문제 크롤러 시작")
    print(f" - 출력 매니페스트: {MANIFEST_PATH}")
    print(f" - 저장 위치: {RAW_DIR}")
    print(f" - 워커 수: {args.workers}, 지연: {args.delay}s, 재시도: {args.retries}x")
    print("==================================================")

    # 1. EBSi 목록 열거
    all_exams = []
    all_exams.extend(enumerate_grade("D100", 2011, 2026, delay=args.delay))
    all_exams.extend(enumerate_grade("D200", 2012, 2026, delay=args.delay))
    all_exams.extend(enumerate_grade("D300", 2013, 2026, delay=args.delay))

    print(f"\n[*] 총 {len(all_exams)}개 정규 시험 세트 열거 완료.")

    # 2. 갭 계산
    gaps = compute_expected_gaps(all_exams)
    print(f"[*] 총 {len(gaps)}개 예상 갭(미시행/미제공) 식별 완료.")

    # 3. 디스크에 이미 존재하는 파일 검사
    already_ok = 0
    for e in all_exams:
        p_mun = ROOT_DIR / e["mun_path"]
        p_hsj = ROOT_DIR / e["hsj_path"]
        if is_valid_pdf_file(p_mun) and is_valid_pdf_file(p_hsj):
            e["status"] = "ok"
            already_ok += 1

    print(f"[*] 기존 디스크 보유 완료: {already_ok}/{len(all_exams)} 세트")

    # 4. 파일 다운로드 (manifest-only가 아닐 때)
    if not args.manifest_only:
        to_download = [e for e in all_exams if e["status"] != "ok"]
        print(f"[*] 다운로드 필요: {len(to_download)} 세트 ({len(to_download)*2}개 파일)")

        if to_download:
            t0 = time.time()
            done_count = 0
            with ThreadPoolExecutor(max_workers=args.workers) as executor:
                futures = [
                    executor.submit(download_exam_pair, e, delay=args.delay, retries=args.retries)
                    for e in to_download
                ]
                for fut in futures:
                    exam_id, status, note = fut.result()
                    # exam 객체 업데이트
                    for e in all_exams:
                        if e["id"] == exam_id:
                            e["status"] = status
                            e["note"] = note
                            break
                    done_count += 1
                    if done_count % 50 == 0 or done_count == len(to_download):
                        elapsed = time.time() - t0
                        rate = done_count / max(elapsed, 0.001)
                        print(f"    - 다운로드 진행률: {done_count}/{len(to_download)} ({done_count/len(to_download)*100:.1f}%) | {rate:.1f} sets/s")

            t1 = time.time()
            print(f"[*] 다운로드 완료! (소요 시간: {t1 - t0:.1f}초)")
        else:
            print("[*] 모든 파일이 이미 존재하므로 다운로드를 건너뜁니다.")

    # 5. 최종 상태 검증 및 매니페스트 저장
    actual_gaps = list(gaps)
    for e in all_exams:
        p_mun = ROOT_DIR / e["mun_path"]
        p_hsj = ROOT_DIR / e["hsj_path"]
        mun_exists = is_valid_pdf_file(p_mun)
        hsj_exists = is_valid_pdf_file(p_hsj)

        if mun_exists and hsj_exists:
            e["status"] = "ok"
        elif not args.manifest_only:
            # 다운로드를 시도했음에도 파일이 없는 경우만 에러 처리 및 gap 추가
            if not mun_exists and not hsj_exists:
                e["status"] = "error"
                if not e.get("note"):
                    e["note"] = "both mun and hsj missing on disk"
                actual_gaps.append({
                    "grade": e["grade"],
                    "year": e["year_admin"],
                    "month": e["month"],
                    "kind": e["kind"],
                    "subject": e["subject"],
                    "reason": f"Download failed or 404: {e['note']}",
                })
            elif not mun_exists:
                e["status"] = "missing_mun"
                if not e.get("note"):
                    e["note"] = "mun missing on disk"
                actual_gaps.append({
                    "grade": e["grade"],
                    "year": e["year_admin"],
                    "month": e["month"],
                    "kind": e["kind"],
                    "subject": e["subject"],
                    "reason": f"Download failed or 404: {e['note']}",
                })
            else:
                e["status"] = "missing_hsj"
                if not e.get("note"):
                    e["note"] = "hsj missing on disk"
                actual_gaps.append({
                    "grade": e["grade"],
                    "year": e["year_admin"],
                    "month": e["month"],
                    "kind": e["kind"],
                    "subject": e["subject"],
                    "reason": f"Download failed or 404: {e['note']}",
                })

    EXAMS_DIR.mkdir(parents=True, exist_ok=True)
    manifest_payload = {
        "generated": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "exams": all_exams,
        "gaps": actual_gaps,
    }

    MANIFEST_PATH.write_text(json.dumps(manifest_payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[*] Manifest written: {MANIFEST_PATH} ({len(all_exams)} exams, {len(actual_gaps)} gaps)")

    # 6. 보고서 생성
    generate_report(manifest_payload, REPORT_PATH)

    # 7. 검증 요약 출력
    ok_count = sum(1 for e in all_exams if e["status"] == "ok")
    print("\n================ 검증 요약 ================")
    print(f"총 시험 세트: {len(all_exams)}")
    print(f"정상 (status ok): {ok_count}/{len(all_exams)} ({ok_count/len(all_exams)*100:.1f}%)")
    for g in [1, 2, 3]:
        g_exams = [e for e in all_exams if e["grade"] == g]
        g_ok = sum(1 for e in g_exams if e["status"] == "ok")
        print(f"  고{g}: {g_ok}/{len(g_exams)} ok")
    print(f"총 gaps 항목: {len(actual_gaps)}")
    print("===========================================")


if __name__ == "__main__":
    main()
