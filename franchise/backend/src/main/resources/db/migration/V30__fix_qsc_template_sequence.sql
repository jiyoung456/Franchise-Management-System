SELECT setval(
  'public.qsc_template_template_id_seq',
  (SELECT COALESCE(MAX(template_id), 0) FROM qsc_template) + 1,
  false
);
