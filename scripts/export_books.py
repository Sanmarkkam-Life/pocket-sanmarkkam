"""Export the PUBLISHED books in ..\\04 Publications into one clean data file per book.

    py scripts\\export_books.py            # export every book in scripts\\books.json
    py scripts\\export_books.py book-3     # export one book

Reads each book's finished Word file (read only: nothing in 04 Publications is
ever changed) and writes, inside this folder:

    public/data/books/<id>.json   the whole book: introductions, works, sections,
                                  passages (number, Tamil lines, transliteration,
                                  translation, commentary), tables, glossary
    public/data/catalog.json      the list of books with counts and edition
    public/data/daily.json        short passages for the verse of the day
    public/data/search.json       compact text of every passage, for search
    scripts/export-report.md      what was exported, and anything odd to check

Only the Python standard library is used, so nothing has to be installed.
A book is refused if its edition line is missing, below 1.0, or says Review
Draft, or if its file name says DRAFT (unless books.json explains why with
"allowDraftName"). Books marked "pending" in books.json are skipped.
"""
import html
import json
import re
import sys
import zipfile
from datetime import date
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
PUBS = ROOT.parent / "04 Publications"
OUT = ROOT / "public" / "data"
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

TAMIL = re.compile(r"[஀-௿]")
LATIN = re.compile(r"[A-Za-zÀ-ɏḀ-ỿ]")
LABEL = re.compile(r"^\s*(TRANSLATION|COMMENTARY|EDITOR'S NOTE|NOTE)\s*[–—-]\s*", re.I)
EDITION = re.compile(r"Edition (\d+)\.(\d+),\s*([A-Z][a-z]+ \d{4})")
SKIP_H1 = re.compile(r"^(DISCLAIMER|ABOUT THE AUTHOR|CONTENTS)$", re.I)
END_H1 = re.compile(r"^ABOUT SANMARKKAM LIFE", re.I)
SMALL = {"a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into", "of", "on", "or", "the", "to", "with", "without", "not", "nor", "so", "yet", "upon"}


# ---------- reading the Word file ----------

def para_style(p):
    st = p.find(f"{W}pPr/{W}pStyle")
    return st.get(f"{W}val") if st is not None else ""


def run_flags(r):
    rp = r.find(f"{W}rPr")
    if rp is None:
        return False, False

    def on(tag):
        el = rp.find(W + tag)
        return el is not None and el.get(f"{W}val") not in ("0", "false")

    return on("i"), on("b")


def para_runs(p):
    """[(text, italic, bold)] for a paragraph, tabs and breaks as spaces."""
    runs = []
    for r in p.iter(f"{W}r"):
        parts = []
        for ch in r:
            if ch.tag == f"{W}t":
                parts.append(ch.text or "")
            elif ch.tag in (f"{W}tab", f"{W}br"):
                parts.append(" ")
        t = "".join(parts)
        if t:
            it, b = run_flags(r)
            runs.append((t, it, b))
    return runs


def plain(runs):
    return re.sub(r"\s+", " ", "".join(t for t, _, _ in runs)).strip()


def to_html(runs, strip_label=False):
    """Escape text and keep italics as <i>. Bold is dropped (only labels use it)."""
    out, open_i = [], False
    text_runs = list(runs)
    if strip_label:
        # drop the "TRANSLATION – " label, which may span several runs
        joined = "".join(t for t, _, _ in text_runs)
        m = LABEL.match(joined)
        cut = m.end() if m else 0
        trimmed = []
        for t, i, b in text_runs:
            if cut >= len(t):
                cut -= len(t)
                continue
            trimmed.append((t[cut:], i, b))
            cut = 0
        text_runs = trimmed
    for t, i, _ in text_runs:
        if i and not open_i:
            out.append("<i>")
            open_i = True
        elif not i and open_i:
            if t.strip() == "":  # keep a space inside the italic span
                out.append(html.escape(t))
                continue
            out.append("</i>")
            open_i = False
        out.append(html.escape(t))
    if open_i:
        out.append("</i>")
    s = re.sub(r"\s+", " ", "".join(out)).strip()
    s = s.replace("<i></i>", "").replace("<i> </i>", " ")
    return s


def is_tamil_para(text):
    t, l = len(TAMIL.findall(text)), len(LATIN.findall(text))
    return t > 0 and t >= 2 * l


def all_italic(runs):
    visible = [(t, i) for t, i, _ in runs if t.strip()]
    return bool(visible) and all(i for _, i in visible)


def all_bold(runs):
    visible = [(t, b) for t, _, b in runs if t.strip()]
    return bool(visible) and all(b for _, b in visible)


def body_items(doc):
    """Top-level paragraphs and tables, in order."""
    body = doc.find(f"{W}body")
    for el in body:
        if el.tag == f"{W}p":
            yield ("p", el)
        elif el.tag == f"{W}tbl":
            yield ("tbl", el)
        elif el.tag == f"{W}sdt":  # content controls (e.g. a table of contents)
            for p in el.iter(f"{W}p"):
                yield ("p", p)


def table_rows(tbl):
    rows = []
    for tr in tbl.iter(f"{W}tr"):
        cells = []
        for tc in tr.findall(f"{W}tc"):
            paras = [to_html(para_runs(p)) for p in tc.iter(f"{W}p")]
            cells.append("<br>".join(x for x in paras if x))
        rows.append(cells)
    return rows


# ---------- titles ----------

def title_case(s):
    if not s or s != s.upper():
        return s
    words = s.lower().split(" ")
    out = []
    for i, w in enumerate(words):
        if i and w in SMALL and not out[-1].endswith((":", "–", "-")):
            out.append(w)
        else:
            out.append(re.sub(r"^([\"'“‘(]?)(\w)", lambda m: m.group(1) + m.group(2).upper(), w))
    s = " ".join(out)
    # keep roman numerals upper case
    return re.sub(r"\b(i{1,3}|iv|v|vi{0,3}|ix|x)\b", lambda m: m.group(1).upper(), s, flags=re.I)


def split_heading(text):
    """'001. THE TITLE - Translit - தமிழ்' -> number, title, translit, tamil."""
    text = text.replace("–", "-").strip()
    text = re.sub(r"\s*-\s*INTRODUCTION\s*$", "", text, flags=re.I)
    parts = [x.strip() for x in re.split(r"\s+-\s+", text) if x.strip()]
    # Tamil in brackets inside an English part: "4. DWELLING IN IGNORANCE (அஞ்ஞானத்திற் பயின்று)"
    bracketed = []
    for i, x in enumerate(parts):
        m = re.search(r"\s*\(([^)]*[஀-௿][^)]*)\)\s*$", x)
        if m and LATIN.search(x[: m.start()]):
            bracketed.append(m.group(1).strip())
            parts[i] = x[: m.start()].strip()
    # "PART I - TITLE" and "SONGS OF GRACE - BOOK III" belong together
    if len(parts) > 1 and re.fullmatch(r"PART [IVXLC]+", parts[0], re.I):
        parts[0:2] = [f"{title_case(parts[0])}: {title_case(parts[1])}"]
    elif len(parts) > 1 and re.match(r"SONGS OF GRACE$", parts[0], re.I) and re.match(r"BOOK [IVX]+$", parts[1], re.I):
        parts[0:2] = [f"Songs of Grace, Book {parts[1].split()[-1].upper()}"]
    tamil = " ".join([x for x in parts if TAMIL.search(x)] + bracketed)
    rest = [x for x in parts if not TAMIL.search(x)]
    number = ""
    if rest:
        m = re.match(r"^(\d+)\.\s*(.*)$", rest[0])
        if m:
            number, rest[0] = m.group(1), m.group(2)
    title = title_case(rest[0]) if rest else ""
    translit = " - ".join(rest[1:])
    return number, title, translit, tamil


# ---------- the parser ----------

class Book:
    def __init__(self, meta):
        self.meta = meta
        self.intro = []      # [{title, paras:[html]}]
        self.works = []      # [{title, translit, tamil, sections:[...]}]
        self.glossary = []
        self.edition = None
        self.warnings = []


def parse(meta, path):
    doc = ET.fromstring(zipfile.ZipFile(path).read("word/document.xml"))
    book = Book(meta)

    state = "front"        # front | essay | work | glossary | end
    essay = None
    work = None
    section = None
    passage = None
    field = None           # where follow-on plain paragraphs go: translation | commentary | None

    def new_section(title_html, raw):
        nonlocal section, passage, field
        number, title, translit, tamil = split_heading(raw)
        section = {"id": str(len(work["sections"]) + 1), "number": number, "title": title or raw,
                   "translit": translit, "tamil": tamil, "blocks": []}
        work["sections"].append(section)
        passage, field = None, None

    def ensure_section():
        if section is None:
            new_section("", "")

    def new_passage(number=""):
        nonlocal passage, field
        ensure_section()
        if passage is not None and passage["note"] and not (passage["tamil"] or passage["translit"]
                                                            or passage["translation"] or passage["commentary"]):
            # an editor's note waiting for its verse: keep it on this passage
            passage["n"] = passage["n"] or number
            field = None
            return
        passage = {"n": number, "note": [], "tamil": [], "translit": [], "translation": [], "commentary": []}
        section["blocks"].append({"type": "passage", **passage})
        passage = section["blocks"][-1]
        field = None

    for kind, el in body_items(doc):
        if state == "end":
            break
        if kind == "tbl":
            if state == "work":
                ensure_section()
                section["blocks"].append({"type": "table", "rows": table_rows(el)})
                passage, field = None, None
            continue

        p = el
        style = para_style(p)
        runs = para_runs(p)
        text = plain(runs)
        if not book.edition:
            m = EDITION.search(text)
            if m:
                book.edition = {"major": int(m.group(1)), "minor": int(m.group(2)), "date": m.group(3),
                                "line": text, "reviewDraft": "review draft" in text.lower()}
        if style.startswith("TOC"):
            continue

        if style == "Heading1":
            if not text:
                continue
            if END_H1.match(text):
                state = "end"
                continue
            if re.match(r"^GLOSSARY$", text, re.I):
                state = "glossary"
                continue
            if SKIP_H1.match(text):
                state = "front"
                continue
            number, title, translit, tamil = split_heading(text)
            is_intro = bool(re.search(r"INTRODUCTION\s*$|NOTE ON CONTEXT", text, re.I))
            if is_intro:
                label = "Introduction" if re.fullmatch(r"\s*INTRODUCTION\s*", text, re.I) else title_case(text.split(" - ")[0]) if "NOTE ON CONTEXT" in text.upper() else f"Introduction: {title}"
                essay = {"title": label, "paras": []}
                book.intro.append(essay)
                state = "essay"
            else:
                work = {"id": str(len(book.works) + 1), "title": title or text, "translit": translit,
                        "tamil": tamil, "sections": []}
                book.works.append(work)
                section, passage, field = None, None, None
                state = "work"
            continue

        if state == "front":
            continue

        if state == "glossary":
            if not text:
                continue
            m = re.match(r"^(.+?)\s*\(([^)]*[஀-௿][^)]*)\)\s*[:–—-]\s*(.+)$", text)
            if m:
                book.glossary.append({"term": m.group(1).strip(), "tamil": m.group(2).strip(), "def": m.group(3).strip()})
            else:
                m = re.match(r"^(.+?)\s*[:–—]\s+(.+)$", text)
                if m and len(m.group(1)) < 60:
                    book.glossary.append({"term": m.group(1).strip(), "tamil": "", "def": m.group(2).strip()})
                elif book.glossary:
                    book.glossary[-1]["def"] += " " + text
            continue

        if state == "essay":
            if style == "Heading2" and text:
                essay["paras"].append(f"<h3>{html.escape(title_case(text))}</h3>")
            elif text:
                essay["paras"].append(to_html(runs))
            continue

        # ----- state == "work" -----
        if style == "Heading2":
            if text:
                new_section(text, text)
            continue
        if style.startswith("Heading"):  # Heading3+ inside a section
            if text:
                ensure_section()
                section["blocks"].append({"type": "heading", "html": html.escape(title_case(text))})
                passage, field = None, None
            continue
        if not text:
            continue

        # a verse number on its own line, in bold
        if re.fullmatch(r"\d{1,4}[a-z]?\.?", text) and all_bold(runs):
            new_passage(text.rstrip("."))
            continue

        label = LABEL.match(text)
        if label:
            if passage is None:
                new_passage()
            kind_ = label.group(1).upper()
            body = to_html(runs, strip_label=True)
            if kind_ == "TRANSLATION":
                field = "translation"
            elif kind_ == "COMMENTARY":
                field = "commentary"
            else:
                passage["note"].append(body)
                field = None
                continue
            if body:
                passage[field].append(body)
            continue

        if is_tamil_para(text):
            # Tamil starts a passage, or adds a line to the one being built
            if passage is None or passage["translation"] or passage["commentary"]:
                new_passage()
            passage["tamil"].append(html.escape(text))
            field = None
            continue

        if all_italic(runs) and passage is not None and passage["tamil"] and not passage["translation"] \
                and not passage["commentary"] and len(passage["translit"]) < len(passage["tamil"]) \
                and not re.match(r"^(Editor|Note|To |From )", text):
            passage["translit"].append(html.escape(text))
            continue

        line = to_html(runs)
        if style == "ListParagraph":
            line = "• " + line

        if field and passage is not None:
            passage[field].append(line)
            continue

        if all_italic(runs) and (passage is None or passage["translation"] or passage["commentary"]):
            # an editor's note or a letter's heading: belongs to the next passage
            new_passage()
            passage["note"].append(line)
            continue
        if passage is not None and not passage["translation"] and not passage["commentary"]:
            passage["note"].append(line)
            continue

        ensure_section()
        section["blocks"].append({"type": "para", "html": line})
        passage, field = None, None

    return book


# ---------- checks, output ----------

def check(book, path):
    errs = []
    name = path.name
    if "DRAFT" in name.upper() and not book.meta.get("allowDraftName"):
        errs.append(f"file name says DRAFT: {name}")
    ed = book.edition
    if not ed:
        errs.append("no edition line found")
    elif ed["major"] < 1 or ed["reviewDraft"]:
        errs.append(f"not a published edition: {ed['line']}")
    return errs


def clean_work(book):
    """Drop empty sections and empty fields; number passages without a number."""
    stats = {"passages": 0, "noTranslation": 0, "noCommentary": 0, "noTamil": 0, "tables": 0}
    for work in book.works:
        work["sections"] = [s for s in work["sections"] if s["blocks"]]
        for s in work["sections"]:
            k = 0
            for b in s["blocks"]:
                if b["type"] == "table":
                    stats["tables"] += 1
                if b["type"] != "passage":
                    continue
                k += 1
                stats["passages"] += 1
                if not b["n"]:
                    b["n"] = ""
                b["id"] = f"{work['id']}.{s['id']}.{k}"
                if not b["translation"]:
                    stats["noTranslation"] += 1
                if not b["commentary"]:
                    stats["noCommentary"] += 1
                if not b["tamil"]:
                    stats["noTamil"] += 1
                for f in ("note", "translation", "commentary"):
                    if not b[f]:
                        del b[f]
                if not b["translit"]:
                    del b["translit"]
    book.works = [w for w in book.works if w["sections"]]
    return stats


TAG = re.compile(r"<[^>]+>")

# The verse of the day is read with no context, so skip passages that lean on what came before
# ("But he…", "This is why…") or that are only a date, an address or a signature.
LEANS = re.compile(r"^(but|and|so|or|nor|yet|then|thus|therefore|hence|for|this|that|these|those|such|he|she|it|they|them|his|her|its|their|here|there|again|also|likewise|the same|in the same way|as for|o friend|my friend|to |from |dear |chiranjeevi)", re.I)


def stands_alone(text):
    t = text.strip().lstrip("“\"'(")
    if LEANS.match(t) or re.search(r"(18|19)\d\d|the above|as said", t):
        return False
    return t[:1].isupper() and t.rstrip().endswith((".", "!", "?", "”", "’", "\""))


def strip(s):
    return html.unescape(TAG.sub("", s))


def main():
    manifest = json.loads((ROOT / "scripts" / "books.json").read_text(encoding="utf-8"))
    only = set(sys.argv[1:])
    (OUT / "books").mkdir(parents=True, exist_ok=True)
    catalog, daily, search, report = [], [], [], []
    report.append(f"# Book export report, {date.today().isoformat()}\n")
    report.append("Source: `..\\04 Publications` (read only). Output: `public\\data\\`.\n")

    for meta in manifest["books"]:
        if only and meta["id"] not in only:
            continue
        if meta.get("pending"):
            report.append(f"- **{meta['title']}**: SKIPPED (pending: {meta['pending']})")
            continue
        path = PUBS / meta["source"]
        if not path.exists():
            report.append(f"- **{meta['title']}**: MISSING FILE `{meta['source']}`")
            continue
        book = parse(meta, path)
        errs = check(book, path)
        if errs:
            report.append(f"- **{meta['title']}**: REFUSED ({'; '.join(errs)})")
            continue
        stats = clean_work(book)
        data = {
            "id": meta["id"], "collection": meta["collection"], "title": meta["title"], "short": meta["short"],
            "tamilTitle": meta["tamilTitle"], "romanTitle": meta["romanTitle"], "page": meta["page"],
            "edition": f"Edition {book.edition['major']}.{book.edition['minor']}, {book.edition['date']}",
            "exported": date.today().isoformat(),
            "intro": book.intro, "works": book.works, "glossary": book.glossary,
        }
        (OUT / "books" / f"{meta['id']}.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

        toc = []
        for w in book.works:
            toc.append({"id": w["id"], "title": w["title"], "translit": w["translit"], "tamil": w["tamil"],
                        "sections": [{"id": s["id"], "number": s["number"], "title": s["title"], "translit": s["translit"], "tamil": s["tamil"],
                                      "count": sum(1 for b in s["blocks"] if b["type"] == "passage")} for s in w["sections"]]})
        catalog.append({k: data[k] for k in ("id", "collection", "title", "short", "tamilTitle", "romanTitle", "page", "edition")}
                       | {"passages": stats["passages"], "hasIntro": bool(book.intro), "glossary": len(book.glossary), "toc": toc})

        for w in book.works:
            for s in w["sections"]:
                for b in s["blocks"]:
                    if b["type"] != "passage":
                        continue
                    tr = strip(" ".join(b.get("translation", [])))
                    ref = f"{meta['short']}, {w['title'] if len(book.works) > 1 else ''}{' · ' if len(book.works) > 1 else ''}{s['title']}{(' ' + b['n']) if b['n'] else ''}"
                    search.append([meta["id"], b["id"], ref, tr, " ".join(strip(x) for x in b["tamil"])])
                    prose = meta["collection"] != "Thiru Arutpa"
                    first = b["id"].endswith(".1") and sum(1 for x in s["blocks"] if x["type"] == "passage") > 1
                    if b["tamil"] and (120 if prose else 60) <= len(tr) <= 420 and b.get("commentary") \
                            and stands_alone(tr) and not (prose and first) and "[" not in tr \
                            and not re.search(r"Tiruchitrambalam|Thiru Chitrambalam|Sivamayam|^Part |Commentary on", tr):
                        daily.append({"book": meta["id"], "id": b["id"], "ref": ref, "tamil": b["tamil"],
                                      "translit": b.get("translit", []), "translation": tr})

        size = (OUT / "books" / f"{meta['id']}.json").stat().st_size
        report.append(f"- **{meta['title']}** ({data['edition']}): {len(book.works)} work(s), "
                      f"{sum(len(w['sections']) for w in book.works)} sections, {stats['passages']} passages, "
                      f"{stats['tables']} tables, {len(book.glossary)} glossary entries, {len(book.intro)} intro(s), "
                      f"{size // 1024} KB. Without translation: {stats['noTranslation']}, without commentary: "
                      f"{stats['noCommentary']}, without Tamil: {stats['noTamil']}.")

    if not only:
        (OUT / "catalog.json").write_text(json.dumps({"generated": date.today().isoformat(), "books": catalog},
                                                     ensure_ascii=False, indent=1), encoding="utf-8")
        # an even spread across the books, so the verse of the day is not always from the longest one
        by_book = {}
        for d in daily:
            by_book.setdefault(d["book"], []).append(d)
        spread, i = [], 0
        while any(by_book.values()):
            for k in list(by_book):
                lst = by_book[k]
                if lst:
                    step = max(1, len(lst) // 40)
                    spread.append(lst.pop(0))
                    del lst[:step - 1]
            i += 1
        spread = spread[:366]  # a year of days, balanced across the books
        (OUT / "daily.json").write_text(json.dumps(spread, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        (OUT / "search.json").write_text(json.dumps(search, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        report.append(f"\nVerse-of-the-day pool: {len(spread)} passages. Search index: {len(search)} passages, "
                      f"{(OUT / 'search.json').stat().st_size // 1024} KB.")
        report.append("\nLeft out on purpose (books.json \"excluded\"):")
        for k, v in manifest.get("excluded", {}).items():
            report.append(f"- {k}: {v}")
        (ROOT / "scripts" / "export-report.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    print("\n".join(report))


if __name__ == "__main__":
    main()
