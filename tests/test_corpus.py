import json
import sys
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from build_corpus import get_anchors, create_cases, validate
class CorpusTests(unittest.TestCase):
 def test_anchors_unique(self):
  a=get_anchors();self.assertEqual(len(a),len({x['id'] for x in a}))
 def test_corpus_valid(self):
  data=json.loads((ROOT/'benchmark/historical_qa_88.json').read_text(encoding='utf-8'))
  self.assertTrue(validate(data))
 def test_reproducible(self):
  data=json.loads((ROOT/'benchmark/historical_qa_88.json').read_text(encoding='utf-8'))
  self.assertEqual(data['examples'],create_cases(get_anchors()))
 def test_provenance_present(self):
  for item in create_cases(get_anchors()):
   self.assertTrue(item['source_url'].startswith('https://'))
   self.assertFalse(item['human_gold_reviewed'])
if __name__=='__main__':unittest.main()
