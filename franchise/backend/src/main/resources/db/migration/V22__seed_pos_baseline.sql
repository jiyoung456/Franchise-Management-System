INSERT INTO pos_baseline (store_id, period_type, metric, baseline_value, threshold_rate, version, effective_from, effective_to)
VALUES
(1, 'WEEK', 'SALES',       32000000, 0.10, 1, '2025-01-01', '2025-12-31'),
(1, 'WEEK', 'ORDER_COUNT',     1650, 0.10, 1, '2025-01-01', '2025-12-31'),
(1, 'WEEK', 'AOV',             19000, 0.10, 1, '2025-01-01', '2025-12-31');
