import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CASE=json.loads((ROOT/'cases/pushkin/casebook.json').read_text(encoding='utf-8'))
STORIES=json.loads((ROOT/'cases/pushkin/stories.json').read_text(encoding='utf-8'))

class StoryIntegrityTests(unittest.TestCase):
    def test_has_at_least_ten_editable_scenes(self):
        self.assertGreaterEqual(len(STORIES['scenes']),10)
        self.assertEqual(len(set(s['id'] for s in STORIES['scenes'])),len(STORIES['scenes']))

    def test_story_events_all_exist(self):
        existing={e['id'] for e in CASE['events']}
        for scene in STORIES['scenes']:
            self.assertIn(scene['event_id'],existing,scene['id'])

    def test_no_orphan_evidence(self):
        claims={c['id']:c for c in CASE['claims']}
        sources={s['id'] for s in CASE['sources']}
        for scene in STORIES['scenes']:
            self.assertTrue(scene['claim_ids'],scene['id'])
            for claim_id in scene['claim_ids']:
                self.assertIn(claim_id,claims,scene['id'])
                self.assertTrue(claims[claim_id]['evidence'],scene['id'])
                for e in claims[claim_id]['evidence']:
                    self.assertIn(e['source_id'],sources)

    def test_branches_only_reference_real_hypotheses(self):
        ids={h['id'] for h in CASE['hypotheses']}
        for scene in STORIES['scenes']:
            for hypothesis_id, conditional in scene['branches'].items():
                self.assertIn(hypothesis_id,ids)
                self.assertTrue(conditional.strip())

    def test_factual_section_is_explicitly_separated(self):
        self.assertIn('conditional',STORIES['editorial_policy'])
        for scene in STORIES['scenes']:
            self.assertTrue(scene['body'].strip())
            self.assertIn(scene['art'],{
                'letter','salon','palace','manuscript','anonymous','duel','wedding','candle','ball'
            })

if __name__=='__main__':unittest.main()
