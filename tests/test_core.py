import copy
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'packages' / 'deduction-core' / 'src'))
from historicdeductionsim.core import (load_case, validate_case, timeline, compare,
                                       root_sources, CaseValidationError)

CASE_PATH = Path(__file__).resolve().parents[1] / 'cases/pushkin/casebook.json'


class CaseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.case = load_case(CASE_PATH)

    def test_valid_example(self):
        validate_case(self.case)
        self.assertEqual(len(self.case['events']), 7)

    def test_timeline_is_sorted_by_normalized_dates(self):
        rows = timeline(self.case)
        self.assertEqual(rows[0]['id'], 'event-pasquille')
        self.assertEqual(rows[-1]['id'], 'event-death')
        self.assertEqual(rows[0]['time']['earliest'], {'year':1836,'month':11,'day':16})

    def test_bce_ordering_and_unknown_end(self):
        case = copy.deepcopy(self.case)
        case['events'][0]['time'] = {
            'earliest': {'year':-1300}, 'latest':{'year':-1200},
            'precision':'range', 'original':'примерный диапазон в годах до н. э.',
            'normalization':'already normalized; negative years denote BCE without year 0'
        }
        case['events'][1]['time'] = None
        validate_case(case)
        self.assertEqual(timeline(case)[0]['id'], 'event-pasquille')
        self.assertEqual(timeline(case)[-1]['id'], 'event-challenge1')

    def test_unknown_source_is_rejected(self):
        case = copy.deepcopy(self.case)
        case['claims'][0]['evidence'][0]['source_id'] = 'invented'
        with self.assertRaises(CaseValidationError):
            validate_case(case)

    def test_claim_must_not_assert_documented_without_evidence(self):
        case = copy.deepcopy(self.case)
        case['claims'][0]['evidence'] = []
        with self.assertRaises(CaseValidationError):
            validate_case(case)

    def test_source_dependency_is_not_independent_corroboration(self):
        sources=self.case['sources']
        self.assertEqual(root_sources(sources, 'src-comment'), {'src-letter-1836'})
        self.assertEqual(root_sources(sources, 'src-letter-1836'), {'src-letter-1836'})

    def test_circular_source_dependencies_rejected(self):
        case=copy.deepcopy(self.case)
        case['sources'][0]['derived_from']=['src-comment']
        with self.assertRaises(CaseValidationError):
            validate_case(case)

    def test_compare_does_not_emit_probabilities_or_pretend_unknown_impact(self):
        result=compare(self.case)
        self.assertEqual(len(result), 3)
        heckern=next(x for x in result if x['id']=='h-heckern')
        self.assertEqual(heckern['assessments']['supports'], 1)
        self.assertEqual(heckern['distinct_source_roots']['supports'], ['src-letter-1836'])
        self.assertNotIn('probability', heckern)
        self.assertNotIn('score', heckern)

    def test_new_unproven_actor_cannot_be_added_as_documented_relation(self):
        case=copy.deepcopy(self.case)
        case['relations'].append({'id':'relation-new','from_id':'idalia',
                                   'to_id':'dantes','type':'secret_lover','claim_ids':['not-validated']})
        with self.assertRaises(CaseValidationError):
            validate_case(case)


if __name__ == '__main__':
    unittest.main()
