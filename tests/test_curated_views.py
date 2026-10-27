import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
case=json.loads((ROOT/'cases/pushkin/casebook.json').read_text(encoding='utf-8'))
views=json.loads((ROOT/'cases/pushkin/curated_views.json').read_text(encoding='utf-8'))
stories=json.loads((ROOT/'cases/pushkin/stories.json').read_text(encoding='utf-8'))

class CuratedViewTests(unittest.TestCase):
    def test_editorial_versions_have_meaningful_questions(self):
        self.assertEqual(len(views['views']),4)
        ids={h['id'] for h in case['hypotheses']}
        for v in views['views']:
            self.assertTrue(all(x in ids for x in v['hypothesis_ids']))
            self.assertTrue(len(v['open_question'])>40)
            self.assertTrue(len(v['summary'])>65)
        self.assertTrue(any(not v['hypothesis_ids'] for v in views['views']))

    def test_reader_never_asserts_hypothesis_is_documented(self):
        for scene in stories['scenes']:
            for key in scene['branches']:
                self.assertIn(key,{h['id'] for h in case['hypotheses']})
        self.assertIn('not found facts',stories['editorial_policy'])

    def test_no_on_demand_public_story_endpoint(self):
        self.assertFalse((ROOT/'tools/generate_narrative.py').exists())
        self.assertFalse((ROOT/'.github/workflows/story-generate.yml').exists())

if __name__=='__main__':
    unittest.main()
