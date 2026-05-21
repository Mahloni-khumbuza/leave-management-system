CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    role        VARCHAR(32)  NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE'))
);

CREATE TABLE leave_requests (
    id            BIGSERIAL PRIMARY KEY,
    employee_id   BIGINT       NOT NULL REFERENCES users(id),
    start_date    DATE         NOT NULL,
    end_date      DATE         NOT NULL,
    reason        VARCHAR(1000) NOT NULL,
    status        VARCHAR(32)  NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    document_url  VARCHAR(1024),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    decision_at   TIMESTAMPTZ,
    decided_by    BIGINT REFERENCES users(id)
);

CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status   ON leave_requests(status);
