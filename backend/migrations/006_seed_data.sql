-- SEED DATA

-- 1. SUPER ADMIN (no tenant)
INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role, is_active
) VALUES (
    gen_random_uuid(),
    NULL,
    'superadmin@system.com',
    '$2b$10$M69Ej391Mwv/7bm3mpobAuJx9Dxz21KOwDQ1g.Aqd.Qri0h3IxBW6',
    'System Super Admin',
    'super_admin',
    true
);

-- 2. DEMO TENANT
INSERT INTO tenants (
    id, name, subdomain, status, subscription_plan, max_users, max_projects
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Demo Company',
    'demo',
    'active',
    'pro',
    25,
    15
);

-- 3. TENANT ADMIN
INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role, is_active
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'admin@demo.com',
    '$2b$10$gIFHw7INeoZNM0ctoxUfGOaKgV2zEXuLHIr0lSt.edOujHqvu87kO',
    'Demo Admin',
    'tenant_admin',
    true
);

-- 4. REGULAR USERS
INSERT INTO users (
    id, tenant_id, email, password_hash, full_name, role, is_active
) VALUES
(
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'user1@demo.com',
    '$2b$10$gIzxbGIGFWsEYsTbydYmu.qogCM1U95LLX5BYwWWOlEx4K8spQdRu',
    'Demo User One',
    'user',
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'user2@demo.com',
    '$2b$10$gIzxbGIGFWsEYsTbydYmu.qogCM1U95LLX5BYwWWOlEx4K8spQdRu',
    'Demo User Two',
    'user',
    true
);

-- 5. SAMPLE PROJECTS
INSERT INTO projects (
    id, tenant_id, name, description, status, created_by
) VALUES
(
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'Website Redesign',
    'Redesign corporate website',
    'active',
    '22222222-2222-2222-2222-222222222222'
),
(
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'Mobile App',
    'Develop customer mobile app',
    'active',
    '22222222-2222-2222-2222-222222222222'
);

-- 6. SAMPLE TASKS
INSERT INTO tasks (
    id, project_id, tenant_id, title, description, status, priority, assigned_to
) VALUES
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'Create wireframes',
    'Design UI wireframes',
    'in_progress',
    'high',
    '33333333-3333-3333-3333-333333333333'
),
(
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'Approve designs',
    'Review and approve UI',
    'todo',
    'medium',
    '22222222-2222-2222-2222-222222222222'
),
(
    gen_random_uuid(),
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'Setup backend',
    'Initialize backend APIs',
    'in_progress',
    'high',
    '33333333-3333-3333-3333-333333333333'
),
(
    gen_random_uuid(),
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'Frontend scaffolding',
    'Setup React project',
    'completed',
    'medium',
    '44444444-4444-4444-4444-444444444444'
),
(
    gen_random_uuid(),
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'Testing',
    'Write unit tests',
    'todo',
    'low',
    NULL
);
