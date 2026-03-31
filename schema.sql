-- ============================================================================
-- Monitor Server — PostgreSQL Database Schema
-- ============================================================================
-- NOTE: Spring Boot JPA (ddl-auto=update) auto-creates these tables.
-- This file is provided for reference, manual setup, or CI/CD pipelines.
-- Database: monitor_db
-- ============================================================================

-- CREATE DATABASE monitor_db;  -- run manually if needed

-- ── Custom ENUM Types ───────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN','USER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE server_status AS ENUM ('ONLINE','OFFLINE','WARNING','CRITICAL','UNKNOWN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE metric_type AS ENUM (
        'CPU_USAGE','MEMORY_USAGE','MEMORY_TOTAL','MEMORY_AVAILABLE',
        'DISK_USAGE','DISK_TOTAL','DISK_AVAILABLE',
        'NETWORK_IN','NETWORK_OUT',
        'LOAD_AVERAGE','PROCESS_COUNT','UPTIME','CUSTOM'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE condition_operator AS ENUM (
        'GREATER_THAN','LESS_THAN','GREATER_THAN_OR_EQUAL',
        'LESS_THAN_OR_EQUAL','EQUALS','NOT_EQUALS'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE alert_severity AS ENUM ('INFO','WARNING','CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE alert_status AS ENUM ('ACTIVE','ACKNOWLEDGED','RESOLVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE report_format AS ENUM ('PDF','CSV','EXCEL','JSON');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Users ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id                         BIGSERIAL PRIMARY KEY,
    username                   VARCHAR(50)  NOT NULL UNIQUE,
    email                      VARCHAR(255) NOT NULL UNIQUE,
    password                   VARCHAR(255) NOT NULL,
    is_active                  BOOLEAN      DEFAULT TRUE,
    email_verified             BOOLEAN      DEFAULT FALSE,
    role                       user_role    NOT NULL DEFAULT 'USER',
    verification_token         VARCHAR(255),
    verification_token_expiry  TIMESTAMP,
    reset_token                VARCHAR(255),
    reset_token_expiry         TIMESTAMP,
    created_at                 TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                 TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Monitored Servers ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS monitored_servers (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    host_address      VARCHAR(255) NOT NULL,
    agent_key         VARCHAR(64)  NOT NULL UNIQUE,
    operating_system  VARCHAR(50),
    description       VARCHAR(500),
    status            server_status NOT NULL DEFAULT 'OFFLINE',
    last_heartbeat    TIMESTAMP,
    owner_id          BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    active_alerts     INT          DEFAULT 0,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_servers_owner ON monitored_servers(owner_id);
CREATE INDEX IF NOT EXISTS idx_servers_agent_key ON monitored_servers(agent_key);
CREATE INDEX IF NOT EXISTS idx_servers_status ON monitored_servers(status);

-- ── Metrics ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS metrics (
    id               BIGSERIAL PRIMARY KEY,
    server_id        BIGINT       NOT NULL REFERENCES monitored_servers(id) ON DELETE CASCADE,
    metric_type      metric_type  NOT NULL,
    value            DOUBLE PRECISION NOT NULL,
    unit             VARCHAR(20),
    timestamp        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    additional_info  VARCHAR(1000)
);

CREATE INDEX IF NOT EXISTS idx_metrics_server_time ON metrics(server_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_type_time ON metrics(metric_type, timestamp);

-- ── Alert Rules ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS alert_rules (
    id                 BIGSERIAL PRIMARY KEY,
    name               VARCHAR(100) NOT NULL,
    description        VARCHAR(500),
    server_id          BIGINT             NOT NULL REFERENCES monitored_servers(id) ON DELETE CASCADE,
    metric_type        metric_type        NOT NULL,
    threshold_value    DOUBLE PRECISION   NOT NULL,
    condition_operator condition_operator NOT NULL,
    duration_seconds   INT,
    severity           alert_severity     NOT NULL DEFAULT 'WARNING',
    is_enabled         BOOLEAN            DEFAULT TRUE,
    cooldown_minutes   INT                DEFAULT 5,
    created_at         TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alert_rules_server ON alert_rules(server_id);

-- ── Alerts ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS alerts (
    id              BIGSERIAL PRIMARY KEY,
    server_id       BIGINT           NOT NULL REFERENCES monitored_servers(id) ON DELETE CASCADE,
    alert_rule_id   BIGINT           REFERENCES alert_rules(id) ON DELETE SET NULL,
    title           VARCHAR(255)     NOT NULL,
    message         VARCHAR(2000),
    metric_value    DOUBLE PRECISION,
    threshold_value DOUBLE PRECISION,
    severity        alert_severity   NOT NULL,
    status          alert_status     NOT NULL DEFAULT 'ACTIVE',
    triggered_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    note            VARCHAR(1000),
    resolved_at     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_server_status ON alerts(server_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered ON alerts(triggered_at);

-- ── Notifications ───────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM ('EMAIL','WEBHOOK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM ('PENDING','SENT','FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS notifications (
    id              BIGSERIAL PRIMARY KEY,
    alert_id        BIGINT              NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    user_id         BIGINT              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel         notification_channel NOT NULL,
    subject         VARCHAR(255)        NOT NULL,
    content         TEXT,
    status          notification_status NOT NULL DEFAULT 'PENDING',
    sent_at         TIMESTAMP,
    error_message   VARCHAR(2000),
    retry_count     INT                 DEFAULT 0,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_alert ON notifications(alert_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- ── Notification Preferences ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notification_preferences (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT  NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_enabled       BOOLEAN DEFAULT TRUE,
    email_critical      BOOLEAN DEFAULT TRUE,
    email_warning       BOOLEAN DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start   INT,
    quiet_hours_end     INT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Scheduled Reports ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS scheduled_reports (
    id                BIGSERIAL PRIMARY KEY,
    owner_id          BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name              VARCHAR(100) NOT NULL,
    format            report_format DEFAULT 'PDF',
    timeframe         VARCHAR(10),
    frequency         VARCHAR(20),
    recipients        VARCHAR(2000),
    enabled           BOOLEAN      DEFAULT FALSE,
    last_generated_at TIMESTAMP,
    next_run_at       TIMESTAMP,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_owner ON scheduled_reports(owner_id);

-- Junction: Report → Server IDs
CREATE TABLE IF NOT EXISTS scheduled_report_servers (
    report_id  BIGINT NOT NULL REFERENCES scheduled_reports(id) ON DELETE CASCADE,
    server_id  BIGINT NOT NULL,
    PRIMARY KEY (report_id, server_id)
);

-- Junction: Report → Metric Types
CREATE TABLE IF NOT EXISTS scheduled_report_metric_types (
    report_id    BIGINT NOT NULL REFERENCES scheduled_reports(id) ON DELETE CASCADE,
    metric_type  metric_type NOT NULL,
    PRIMARY KEY (report_id, metric_type)
);

-- ── Agent Activity History ──────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE agent_event_type AS ENUM ('METRIC_INGEST','HEARTBEAT','CONNECTED','DISCONNECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS agent_activity (
    id              BIGSERIAL PRIMARY KEY,
    server_id       BIGINT           NOT NULL REFERENCES monitored_servers(id) ON DELETE CASCADE,
    event_type      agent_event_type NOT NULL,
    metrics_count   INT              DEFAULT 0,
    ip_address      VARCHAR(45),
    agent_version   VARCHAR(50),
    timestamp       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_activity_server_time ON agent_activity(server_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_activity_server_event ON agent_activity(server_id, event_type);

-- ── User Usage Stats ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_usage_stats (
    id                       BIGSERIAL PRIMARY KEY,
    user_id                  BIGINT    NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_servers            INT       DEFAULT 0,
    active_servers           INT       DEFAULT 0,
    total_metrics_received   BIGINT    DEFAULT 0,
    total_alerts_triggered   BIGINT    DEFAULT 0,
    total_agent_requests     BIGINT    DEFAULT 0,
    total_api_requests       BIGINT    DEFAULT 0,
    last_active_at           TIMESTAMP,
    created_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_usage_user ON user_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_active ON user_usage_stats(last_active_at);

-- ── Webhook Configs ─────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE webhook_type AS ENUM ('SLACK','DISCORD','GENERIC');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS webhook_configs (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name              VARCHAR(100) NOT NULL,
    url               VARCHAR(2000) NOT NULL,
    type              webhook_type NOT NULL DEFAULT 'GENERIC',
    enabled           BOOLEAN      DEFAULT TRUE,
    notify_critical   BOOLEAN      DEFAULT TRUE,
    notify_warning    BOOLEAN      DEFAULT TRUE,
    notify_info       BOOLEAN      DEFAULT FALSE,
    last_triggered_at TIMESTAMP,
    last_error        VARCHAR(2000),
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_configs_user ON webhook_configs(user_id);

-- ── API Keys ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_keys (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    prefix       VARCHAR(8)   NOT NULL UNIQUE,
    key_hash     VARCHAR(255) NOT NULL,
    active       BOOLEAN      DEFAULT TRUE,
    last_used_at TIMESTAMP,
    expires_at   TIMESTAMP,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(prefix);

-- ── Maintenance Windows ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS maintenance_windows (
    id          BIGSERIAL PRIMARY KEY,
    server_id   BIGINT       NOT NULL REFERENCES monitored_servers(id) ON DELETE CASCADE,
    created_by  BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason      VARCHAR(500) NOT NULL,
    start_time  TIMESTAMP    NOT NULL,
    end_time    TIMESTAMP    NOT NULL,
    active      BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maintenance_server ON maintenance_windows(server_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_time ON maintenance_windows(start_time, end_time);
