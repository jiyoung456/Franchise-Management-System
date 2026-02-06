CREATE TABLE store_risk (
    store_risk_id SERIAL PRIMARY KEY,
 
    store_id INT NOT NULL,
    snapshot_date DATE NOT NULL,
 
    risk_label_final INT NOT NULL CHECK (risk_label_final IN (0,1,2)),
 
    top_metric_1 VARCHAR(100),
    top_metric_1_shap FLOAT,
    top_metric_2 VARCHAR(100),
    top_metric_2_shap FLOAT,
    top_metric_3 VARCHAR(100),
    top_metric_3_shap FLOAT,
 
    comment TEXT,
 
    qsc_domain_pct FLOAT,
    pos_domain_pct FLOAT,
 
    qsc_clean_pct FLOAT,
    qsc_service_pct FLOAT,
    qsc_product_pct FLOAT,
 
    pos_sales_pct FLOAT,
    pos_aov_pct FLOAT,
    pos_margin_pct FLOAT,
 
    comment_domain VARCHAR(50),
    comment_focus VARCHAR(50),
 
    detail_comment TEXT,
    external_factor_comment TEXT,
 
    analysis_type VARCHAR(50),
 
    created_at TIMESTAMP DEFAULT NOW(),
 
    CONSTRAINT ux_store_risk UNIQUE (store_id, snapshot_date)
);
