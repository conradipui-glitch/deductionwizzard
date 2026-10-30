import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "deduction-core" / "src"))
from historicdeductionsim.core import load_case, compare, timeline

class GodsCaseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.case = load_case(ROOT / "cases" / "gods" / "casebook.json")

    def test_data_integrity(self):
        self.assertEqual(self.case["case_id"], "gods-002")
        self.assertEqual(len(self.case["sources"]), 9)
        self.assertEqual(len(self.case["claims"]), 11)
        self.assertEqual(len(self.case["hypotheses"]), 6)

    def test_speculation_is_not_attested(self):
        claims = {c["id"]: c for c in self.case["claims"]}
        for cid in ["c-yahweh-ruler", "c-ancient-tech"]:
            self.assertEqual(claims[cid]["status"], "unverified")
            self.assertEqual(claims[cid]["evidence"], [])

    def test_no_direct_support_for_speculative_explanations(self):
        results = {x["id"]: x for x in compare(self.case)}
        for hid in ["h-ancient-tech", "h-yahweh-human-ruler"]:
            self.assertEqual(results[hid]["assessments"]["supports"], 0)
            self.assertEqual(results[hid]["distinct_source_roots"]["supports"], [])

    def test_no_invented_myth_dates(self):
        events = {e["id"]: e for e in self.case["events"]}
        for eid in ["ev-pushpaka", "ev-etana"]:
            self.assertIsNone(events[eid]["time"])
        self.assertEqual(len(timeline(self.case)), len(self.case["events"]))

    def test_comparison_claim_links(self):
        data = json.loads((ROOT/"cases/gods/comparisons.json").read_text(encoding="utf-8"))
        ids = {c["id"] for c in self.case["claims"]}
        self.assertEqual(len(data["comparisons"]), 4)
        for c in data["comparisons"]:
            self.assertTrue(set(c["claim_ids"]).issubset(ids))
            self.assertEqual(c["status"], "candidate_not_proven")

if __name__ == "__main__":
    unittest.main()
