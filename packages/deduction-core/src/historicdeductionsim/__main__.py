"""Run as: PYTHONPATH=src python -m historicdeductionsim <command> <case>."""
import argparse
import json

from .core import load_case, timeline, compare, CaseValidationError


def main():
    parser = argparse.ArgumentParser(description="Historic Deduction Sim — evidence first")
    parser.add_argument("command", choices=["validate", "timeline", "compare", "graph"])
    parser.add_argument("case", help="Path to casebook JSON")
    args = parser.parse_args()
    try:
        data = load_case(args.case)
    except (OSError, ValueError, CaseValidationError) as exc:
        parser.exit(2, f"Validation failed: {exc}\n")
    if args.command == "validate":
        print(f"VALID: {data['case_id']} ({len(data['events'])} events, {len(data['sources'])} sources)")
    elif args.command == "timeline":
        for e in timeline(data):
            t = e.get("time")
            when = (t and t.get("original")) or "дата неизвестна"
            p = t and t.get("earliest")
            norm = (f"{p['year']:04d}-{p.get('month', 1):02d}-{p.get('day', 1):02d}" if p else "undated")
            print(f"{norm} | {when} | {e['title']} | claims: {', '.join(e['claim_ids'])}")
    elif args.command == "compare":
        print(json.dumps(compare(data), ensure_ascii=False, indent=2))
    elif args.command == "graph":
        print("graph LR")
        by_id = {x["id"]: x for x in data["entities"]}
        for entity in data["entities"]:
            label = entity["name"].replace('"', "'")
            print(f'    {entity["id"]}["{label}"]')
        for rel in data["relations"]:
            print(f'    {rel["from_id"]} -->|"{rel["type"]}"| {rel["to_id"]}')


if __name__ == "__main__":
    main()
