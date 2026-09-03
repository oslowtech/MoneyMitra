DELETE FROM public.impact_transactions duplicate_row
USING public.impact_transactions original_row
WHERE duplicate_row.evidence_url IS NOT NULL
  AND original_row.evidence_url IS NOT NULL
  AND lower(trim(duplicate_row.evidence_url)) = lower(trim(original_row.evidence_url))
  AND duplicate_row.id > original_row.id;

DROP INDEX IF EXISTS idx_impact_transactions_unique_evidence;
CREATE UNIQUE INDEX IF NOT EXISTS idx_impact_transactions_unique_evidence
  ON public.impact_transactions (lower(trim(evidence_url)))
  WHERE evidence_url IS NOT NULL;
