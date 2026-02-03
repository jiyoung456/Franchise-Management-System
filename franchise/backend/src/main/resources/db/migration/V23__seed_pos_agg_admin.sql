NSERT INTO pos_period_agg (
  store_id, period_type, period_start, period_end,
  sales_amount, order_count, aov,
  cogs_amount, margin_amount, margin_rate,
  sales_change_rate, order_change_rate, aov_change_rate,
  created_at
) VALUES
(
  4, 'MONTH', '2025-04-01', '2025-04-30',
  52000000.00, 3600, 14444.44,
  34000000.00, 18000000.00, 0.3462,
  NULL, NULL, NULL,
  NOW()
),
(
  5, 'MONTH', '2025-04-01', '2025-04-30',
  70000000.00, 4500, 15555.56,
  46000000.00, 24000000.00, 0.3429,
  NULL, NULL, NULL,
  NOW()
);
