"""Minimal, dependency-free validation and evidence views.

This engine intentionally does NOT infer probabilities, guilt, or causation.
The input casebook retains conflicting claims and late, dependent testimony.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any

KINDS = {"person", "group", "institution", "place", "culture", "deity", "text", "concept", "other"}
STANCES = {"supports", "contradicts", "compatible", "unknown"}
CLAIM_KINDS = {"event_report", "attribution", "interpretation", "identity_proposal"}
EVIDENCE_TYPES = {"primary", "secondary", "tertiary"}
DATE_PRECISIONS = {"day", "month", "year", "range", "approximate", "unknown"}


class CaseValidationError(ValueError):
    """The casebook fails structural or referential validation."""


def load_case(path: str | Path) -> dict[str, Any]:
    with Path(path).open(encoding="utf-8") as stream:
        data = json.load(stream)
    validate_case(data)
    return data


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise CaseValidationError(message)


def _point(value: dict | None, where: str) -> tuple[int, int, int] | None:
    if value is None:
        return None
    _require(isinstance(value, dict), f"{where}: expected date object")
    year = value.get("year")
    _require(type(year) is int and year != 0, f"{where}: integer year (nonzero) required; negative = BCE")
    month, day = value.get("month"), value.get("day")
    _require(month is None or (type(month) is int and 1 <= month <= 12), f"{where}: invalid month")
    _require(day is None or (type(day) is int and 1 <= day <= 31 and month is not None), f"{where}: invalid day")
    if day is not None:
        leap = (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0))
        days = (31, 29 if leap else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)
        _require(day <= days[month - 1], f"{where}: nonexistent calendar day")
    return (year, month or 1, day or 1)


def _items(data: dict, key: str) -> list[dict]:
    xs = data.get(key)
    _require(isinstance(xs, list), f"{key}: expected list")
    for i, value in enumerate(xs):
        _require(isinstance(value, dict), f"{key}[{i}]: expected object")
    return xs


def validate_case(data: dict[str, Any]) -> None:
    _require(isinstance(data, dict), "case must be an object")
    _require(data.get("schema_version") == "1.0", "unsupported schema_version (expected 1.0)")
    _require(isinstance(data.get("case_id"), str) and data["case_id"], "case_id required")
    categories = ("entities", "sources", "claims", "events", "relations", "hypotheses", "assessments")
    lists = {key: _items(data, key) for key in categories}
    seen: set[str] = set()
    indexes: dict[str, set[str]] = {}
    for key, items in lists.items():
        idx = set()
        for item in items:
            rid = item.get("id")
            _require(isinstance(rid, str) and rid.strip(), f"{key}: every record needs id")
            _require(rid not in seen, f"duplicate id: {rid}")
            seen.add(rid)
            idx.add(rid)
        indexes[key] = idx

    def ref(value: str, category: str, where: str) -> None:
        _require(value in indexes[category], f"{where}: unknown {category} ID '{value}'")

    for entity in lists["entities"]:
        _require(entity.get("kind") in KINDS, f"{entity['id']}: invalid entity kind")
        _require(bool(entity.get("name")), f"{entity['id']}: entity name missing")
    for source in lists["sources"]:
        _require(source.get("type") in EVIDENCE_TYPES, f"{source['id']}: invalid source type")
        _require(bool(source.get("title")), f"{source['id']}: missing title")
        _require(isinstance(source.get("locator"), str) and source["locator"], f"{source['id']}: locator required")
        for dep in source.get("derived_from", []):
            ref(dep, "sources", source["id"])
        if source.get("created") is not None:
            _point(source["created"], source["id"] + ".created")
    _check_source_cycles(lists["sources"])
    for claim in lists["claims"]:
        cid = claim["id"]
        _require(claim.get("kind") in CLAIM_KINDS, f"{cid}: invalid claim kind")
        _require(bool(claim.get("text")), f"{cid}: claim text missing")
        _require(claim.get("status") in {"attested", "contested", "unverified"}, f"{cid}: invalid status")
        for eid in claim.get("about", []):
            ref(eid, "entities", cid)
        evs = claim.get("evidence", [])
        _require(isinstance(evs, list), f"{cid}: evidence must be a list")
        for e in evs:
            ref(e.get("source_id"), "sources", cid)
            _require(e.get("stance") in {"supports", "contradicts"}, f"{cid}: invalid evidence stance")
            _require(bool(e.get("locator")), f"{cid}: source-specific locator needed")
        if claim["status"] == "attested":
            _require(any(e.get("stance") == "supports" for e in evs), f"{cid}: attested claims require supporting evidence")
    for event in lists["events"]:
        eid = event["id"]
        _require(bool(event.get("title")), f"{eid}: event title missing")
        for a in event.get("actors", []):
            ref(a, "entities", eid)
        for cid in event.get("claim_ids", []):
            ref(cid, "claims", eid)
        _require(len(event.get("claim_ids", [])) > 0, f"{eid}: at least one claim ID required")
        t = event.get("time")
        if t is not None:
            _require(isinstance(t, dict), f"{eid}: time must be object or null")
            _require(t.get("precision") in DATE_PRECISIONS, f"{eid}: invalid date precision")
            _require(bool(t.get("original")), f"{eid}: original date wording required")
            _require(bool(t.get("normalization")), f"{eid}: normalization method required")
            a = _point(t.get("earliest"), eid + ".earliest")
            b = _point(t.get("latest"), eid + ".latest")
            _require((a is None) == (b is None), f"{eid}: earliest and latest must both be present or absent")
            _require(a is None or a <= b, f"{eid}: reversed date interval")
    for relation in lists["relations"]:
        rid = relation["id"]
        ref(relation.get("from_id"), "entities", rid)
        ref(relation.get("to_id"), "entities", rid)
        _require(bool(relation.get("type")), f"{rid}: relation type missing")
        for cid in relation.get("claim_ids", []):
            ref(cid, "claims", rid)
        _require(relation.get("claim_ids"), f"{rid}: relation must point to an attributed claim")
    for h in lists["hypotheses"]:
        _require(bool(h.get("statement")), f"{h['id']}: hypothesis statement missing")
        _require(bool(h.get("discriminating_test")), f"{h['id']}: discriminating_test required")
        _require(isinstance(h.get("assumptions", []), list), f"{h['id']}: assumptions must be list")
    for a in lists["assessments"]:
        ref(a.get("hypothesis_id"), "hypotheses", a["id"])
        ref(a.get("claim_id"), "claims", a["id"])
        _require(a.get("stance") in STANCES, f"{a['id']}: invalid assessment stance")
        _require(bool(a.get("rationale")), f"{a['id']}: assessment requires rationale")


def _check_source_cycles(sources: list[dict]) -> None:
    graph = {s["id"]: s.get("derived_from", []) for s in sources}
    state: dict[str, int] = {}
    def visit(node: str) -> None:
        if state.get(node) == 1:
            raise CaseValidationError(f"cyclic source dependency at {node}")
        if state.get(node) == 2:
            return
        state[node] = 1
        for parent in graph[node]:
            visit(parent)
        state[node] = 2
    for key in graph:
        visit(key)


def root_sources(sources: list[dict], source_id: str) -> set[str]:
    """Collapse citations that trace back to the same quoted original."""
    graph = {s["id"]: s.get("derived_from", []) for s in sources}
    if not graph[source_id]:
        return {source_id}
    roots: set[str] = set()
    for parent in graph[source_id]:
        roots |= root_sources(sources, parent)
    return roots


def timeline(data: dict) -> list[dict]:
    """Chronology without inventing dates for unknown events."""
    def sortkey(event: dict) -> tuple:
        t = event.get("time")
        point = t and t.get("earliest")
        if not point:
            return (1, 999999, 1, 1, event["id"])
        return (0, point["year"], point.get("month", 1), point.get("day", 1), event["id"])
    return sorted(data["events"], key=sortkey)


def compare(data: dict) -> list[dict]:
    """Descriptive evidence matrix, NOT a probability or guilt ranking.

    Counting assessments alone double-counts derivative sources; expose independent
    provenance roots separately and refrain from making a composite numeric score.
    """
    claims = {c["id"]: c for c in data["claims"]}
    outcome = []
    for hypothesis in data["hypotheses"]:
        rows = [a for a in data["assessments"] if a["hypothesis_id"] == hypothesis["id"]]
        counts = Counter(r["stance"] for r in rows)
        grouped: dict[str, set[str]] = {"supports": set(), "contradicts": set()}
        for row in rows:
            if row["stance"] not in grouped:
                continue
            for ev in claims[row["claim_id"]].get("evidence", []):
                if ev["stance"] == "supports":
                    grouped[row["stance"]] |= root_sources(data["sources"], ev["source_id"])
        outcome.append({
            "id": hypothesis["id"],
            "statement": hypothesis["statement"],
            "assessments": {s: counts[s] for s in sorted(STANCES)},
            "distinct_source_roots": {s: sorted(roots) for s, roots in grouped.items()},
            "next_test": hypothesis["discriminating_test"],
        })
    return outcome
