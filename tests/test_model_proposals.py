import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
book=json.loads((ROOT/'cases/pushkin/casebook.json').read_text(encoding='utf-8'))
proposed=json.loads((ROOT/'cases/pushkin/model_proposals.preview.json').read_text(encoding='utf-8'))

class ModelProposalTests(unittest.TestCase):
    def test_separate_unreviewed_layer(self):
        self.assertEqual(proposed['status'],'UNREVIEWED_MODEL_SUGGESTIONS')
        self.assertEqual(proposed['review_status'],'not_reviewed')
        self.assertEqual(len(proposed['evaluations']),18)
        self.assertTrue(all(x['review_status']=='not_reviewed' for x in proposed['evaluations']))

    def test_every_vote_has_known_entities(self):
        claims={c['id'] for c in book['claims']}
        hypotheses={h['id'] for h in book['hypotheses']}
        models={'perplexity/pplx-decider-v1.2','baseten/mammoth-1:free','baseten/elephant-1:free'}
        seen=set()
        for item in proposed['evaluations']:
            self.assertIn(item['claim_id'],claims)
            self.assertIn(item['hypothesis_id'],hypotheses)
            self.assertIn(item['model'],models)
            self.assertIn(item['suggested_label'],{'compatible','insufficient_data','supports','contradicts'})
            key=item['claim_id'],item['hypothesis_id'],item['model']
            self.assertNotIn(key,seen)
            seen.add(key)

if __name__=='__main__':unittest.main()
