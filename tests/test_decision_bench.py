import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("decision_bench", ROOT / "tools/decision_bench.py")
bench = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bench)

class DecisionBenchTests(unittest.TestCase):
    def setUp(self):
        self.cases = json.loads((ROOT / "benchmark/fixtures.json").read_text(encoding="utf-8"))

    def test_all_fixture_ids_unique(self):
        self.assertEqual(len(self.cases), len({c["id"] for c in self.cases}))

    def test_all_expected_labels_known(self):
        self.assertTrue(all(c["expected"] in bench.LABELS for c in self.cases))

    def test_payload_has_typed_questions(self):
        request = bench.make_payload(bench.DEFAULT_MODELS[0], self.cases[0])
        self.assertEqual(request["questions"]["evidence_relation"]["type"], "choice")
        self.assertEqual(request["questions"]["directly_supported"]["type"], "noul")
        self.assertNotIn("messages", request)

    def test_valid_response(self):
        item = {"answers": {"evidence_relation": {"choice": "accusation_only"}, "directly_supported": {"noul": 0.01}}}
        self.assertTrue(bench.validate_answer(item)["valid"])

    def test_invalid_response_is_rejected(self):
        for answer in ({}, {"answers": {"evidence_relation": {"choice": "wrong"}, "directly_supported": {"noul": 0.2}}}):
            self.assertFalse(bench.validate_answer(answer)["valid"])

    def test_label_probability_out_of_bounds(self):
        self.assertFalse(bench.validate_answer({"answers": {
            "evidence_relation": {"choice": "accusation_only"}, "directly_supported": {"noul": 3.2},
        }})["valid"])

if __name__ == "__main__":
    unittest.main()
