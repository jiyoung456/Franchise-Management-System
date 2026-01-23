CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,

    user_name VARCHAR(100) NOT NULL,

    role VARCHAR(20) NOT NULL CHECK (
        role IN ('ADMIN', 'MANAGER', 'SUPERVISOR')
    ),

    login_id VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,

    department VARCHAR(100),

    email VARCHAR(255) UNIQUE,

    account_status BOOLEAN NOT NULL DEFAULT TRUE,

    last_login_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX ux_users_login_id ON users(login_id);


CREATE TABLE stores (
    store_id BIGSERIAL PRIMARY KEY,

    current_supervisor_id BIGINT,
    created_by_user_id BIGINT,
    updated_by_user_id BIGINT,

    store_name VARCHAR(255) NOT NULL,
    address TEXT,
    region_code VARCHAR(50),

    trade_area_type VARCHAR(20) CHECK (
        trade_area_type IN (
            'OFFICE', 'RESIDENTIAL', 'STATION',
            'UNIVERSITY', 'TOURISM', 'MIXED'
        )
    ),

    open_planned_at TIMESTAMP,

    store_operation_status VARCHAR(20) CHECK (
        store_operation_status IN ('OPEN', 'CLOSED')
    ),

    opened_at TIMESTAMP,
    closed_at TIMESTAMP,
    deleted_at TIMESTAMP,

    contract_type VARCHAR(20) CHECK (
        contract_type IN ('FRANCHISE', 'DIRECT')
    ),

    contract_end_date DATE,

    owner_name VARCHAR(100),
    owner_phone VARCHAR(50),

    current_state VARCHAR(20) NOT NULL CHECK (
        current_state IN ('NORMAL', 'WATCHLIST', 'RISK')
    ) DEFAULT 'NORMAL',

    current_state_score INTEGER,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_store_supervisor
        FOREIGN KEY (current_supervisor_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_store_created_by
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_store_updated_by
        FOREIGN KEY (updated_by_user_id)
        REFERENCES users(user_id)
);
