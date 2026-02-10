-- UP
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'suspended', 'trial')) NOT NULL DEFAULT 'trial',
    subscription_plan VARCHAR(20) CHECK (subscription_plan IN ('free', 'pro', 'enterprise')) NOT NULL DEFAULT 'free',
    max_users INTEGER NOT NULL DEFAULT 5,
    max_projects INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DOWN
-- DROP TABLE IF EXISTS tenants;
