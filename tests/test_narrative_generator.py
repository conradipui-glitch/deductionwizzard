import importlib.util
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('generator',ROOT/'tools/generate_narrative.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class StoryGeneratorTests(unittest.TestCase):
    def setUp(self):
        self.request={'hypotheses':['h-idalia','h-heckern'],
            'custom_hypotheses':['Версия о посреднике в окружении Геккерна'],
            'scenes':['s-1833-idalia','s-1836-pasquille','s-1837-duel'],
            'note':'Проверить роль анонимной рассылки.'}
    def test_owner_issue_payload_parses(self):
        body='DW_STORY_REQUEST: '+json.dumps(self.request,ensure_ascii=False)
        config=module.config_from_issue(body)
        self.assertEqual(config['scenes'],self.request['scenes'])
        self.assertEqual(len(config['custom_hypotheses']),1)
    def test_unknown_hypothesis_rejected(self):
        request=dict(self.request,hypotheses=['secret-person'])
        with self.assertRaises(ValueError):
            module.config_from_issue('DW_STORY_REQUEST: '+json.dumps(request))
    def test_unknown_scene_rejected(self):
        request=dict(self.request,scenes=['unknown','s-1837-duel'])
        with self.assertRaises(ValueError):
            module.config_from_issue('DW_STORY_REQUEST: '+json.dumps(request))
    def test_note_limit_prevents_unbounded_prompts(self):
        request=dict(self.request,note='x'*400)
        with self.assertRaises(ValueError):
            module.config_from_issue('DW_STORY_REQUEST: '+json.dumps(request))
    def test_actual_claim_sources_are_provided(self):
        config=module.config_from_issue('DW_STORY_REQUEST: '+json.dumps(self.request))
        evidence=module.evidence_for(config)
        self.assertEqual(evidence['scenes'][1]['scene_id'],'s-1836-pasquille')
        self.assertTrue(evidence['scenes'][1]['sources'])
    def test_custom_hypotheses_do_not_enter_curated_casebook(self):
        self.assertNotIn('custom_hypotheses',module.book)
        self.assertIn('new_unreviewed_hypotheses',module.evidence_for(self.request))

if __name__=='__main__':unittest.main()
