CREATE TABLE "user" (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'consultant'
        CHECK (role IN ('consultant', 'manager', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    FOREIGN KEY (updated_by) REFERENCES "user"(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_role ON "user"(role);
CREATE INDEX idx_user_active ON "user"(email) WHERE is_active = TRUE;

CREATE TABLE division (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    label VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subject (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    label VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE community (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    label VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consultation (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    label VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_division_active ON division(label) WHERE is_active = TRUE;
CREATE INDEX idx_subject_active ON subject(label) WHERE is_active = TRUE;
CREATE INDEX idx_community_active ON community(label) WHERE is_active = TRUE;
CREATE INDEX idx_consultation_active ON consultation(label) WHERE is_active = TRUE;

CREATE TABLE tender (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    division_id INTEGER,
    community_id INTEGER,
    subject_id INTEGER,
    consultation_id INTEGER NOT NULL,
    consultation_detail VARCHAR(255),

    send_date DATE NOT NULL,
    return_date DATE,
    quote_price DECIMAL(12, 2) CHECK (quote_price > 0),
    result VARCHAR(50) CHECK (result IN ('Remportée', 'Perdue', 'En cours', 'En suspens')),

    price_position TEXT,
    tech_position TEXT,
    note TEXT,

    win_price DECIMAL(12, 2),
    winner_name VARCHAR(255),

    discount DECIMAL(5, 2) CHECK (discount IS NULL OR (discount >= 0 AND discount <= 100)),
    final_amount DECIMAL(12, 2),

    creator_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    FOREIGN KEY (creator_id) REFERENCES "user"(id) ON DELETE RESTRICT,
    FOREIGN KEY (updated_by) REFERENCES "user"(id) ON DELETE SET NULL,
    FOREIGN KEY (consultation_id) REFERENCES consultation(id) ON DELETE RESTRICT,
    FOREIGN KEY (division_id) REFERENCES division(id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE RESTRICT,
    FOREIGN KEY (community_id) REFERENCES community(id) ON DELETE RESTRICT,

    CONSTRAINT chk_winner_consistency CHECK (
        (result = 'Remportée' AND winner_name = 'SPQR' AND win_price IS NULL)
     OR (result = 'Perdue')
     OR ((result IS NULL OR result IN ('En cours', 'En suspens')) AND winner_name IS NULL AND win_price IS NULL)
    ),

    CONSTRAINT chk_return_date_result CHECK (
        (return_date IS NOT NULL) = (result IS NOT NULL AND result IN ('Remportée', 'Perdue'))
    )
);

CREATE INDEX idx_tender_division ON tender(division_id);
CREATE INDEX idx_tender_consultation ON tender(consultation_id);
CREATE INDEX idx_tender_subject ON tender(subject_id);
CREATE INDEX idx_tender_community ON tender(community_id);
CREATE INDEX idx_tender_result ON tender(result);
CREATE INDEX idx_tender_creator ON tender(creator_id);
CREATE INDEX idx_tender_visible ON tender(created_at DESC) WHERE is_active = TRUE;

CREATE TABLE assignment (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    tender_id INTEGER NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (statut IN ('active', 'inactive')),

    assigned_by INTEGER NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE RESTRICT,
    FOREIGN KEY (tender_id) REFERENCES tender(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_by) REFERENCES "user"(id) ON DELETE RESTRICT,

    CONSTRAINT uq_assignment_user_tender UNIQUE (user_id, tender_id)
);

CREATE INDEX idx_assignment_user_active ON assignment(user_id) WHERE statut = 'active';
CREATE INDEX idx_assignment_tender_active ON assignment(tender_id) WHERE statut = 'active';

CREATE TABLE comment (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    tender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE RESTRICT,
    FOREIGN KEY (tender_id) REFERENCES tender(id) ON DELETE RESTRICT
);

CREATE INDEX idx_comment_tender ON comment(tender_id) WHERE is_active = TRUE;
CREATE INDEX idx_comment_user ON comment(user_id);

CREATE TABLE request (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tender_id INTEGER NOT NULL,
    requested_by_id INTEGER NOT NULL,
    reviewed_by_id INTEGER,
    request_type VARCHAR(20) NOT NULL DEFAULT 'update'
        CHECK (request_type IN ('update', 'delete')),

    new_division_id INTEGER,
    new_subject_id INTEGER,
    new_community_id INTEGER,
    new_consultation_id INTEGER,
    new_consultation_detail VARCHAR(255),
    new_send_date DATE,
    new_return_date DATE,
    new_quote_price DECIMAL(12, 2) CHECK (new_quote_price IS NULL OR new_quote_price > 0),
    new_result VARCHAR(50) CHECK (new_result IS NULL OR new_result IN ('Remportée', 'Perdue', 'En cours', 'En suspens')),
    new_price_position TEXT,
    new_tech_position TEXT,
    new_note TEXT,
    new_win_price DECIMAL(12, 2),
    new_winner_name VARCHAR(255),
    new_discount DECIMAL(5, 2) CHECK (new_discount IS NULL OR (new_discount >= 0 AND new_discount <= 100)),

    request_reason TEXT NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (statut IN ('pending', 'approved', 'rejected')),
    review_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ,

    FOREIGN KEY (tender_id) REFERENCES tender(id) ON DELETE RESTRICT,
    FOREIGN KEY (requested_by_id) REFERENCES "user"(id) ON DELETE RESTRICT,
    FOREIGN KEY (reviewed_by_id) REFERENCES "user"(id) ON DELETE RESTRICT,
    FOREIGN KEY (new_division_id) REFERENCES division(id) ON DELETE RESTRICT,
    FOREIGN KEY (new_subject_id) REFERENCES subject(id) ON DELETE RESTRICT,
    FOREIGN KEY (new_community_id) REFERENCES community(id) ON DELETE RESTRICT,
    FOREIGN KEY (new_consultation_id) REFERENCES consultation(id) ON DELETE RESTRICT,

    CONSTRAINT chk_request_content CHECK (
        (request_type = 'update' AND num_nonnulls(
            new_division_id, new_subject_id, new_community_id, new_consultation_id,
            new_consultation_detail, new_send_date, new_return_date, new_quote_price, new_result,
            new_price_position, new_tech_position, new_note, new_win_price,
            new_winner_name, new_discount) > 0)
     OR (request_type = 'delete' AND num_nonnulls(
            new_division_id, new_subject_id, new_community_id, new_consultation_id,
            new_consultation_detail, new_send_date, new_return_date, new_quote_price, new_result,
            new_price_position, new_tech_position, new_note, new_win_price,
            new_winner_name, new_discount) = 0)
    ),
    CONSTRAINT chk_request_review CHECK (
        (statut = 'pending'  AND reviewed_by_id IS NULL     AND reviewed_at IS NULL)
     OR (statut <> 'pending' AND reviewed_by_id IS NOT NULL AND reviewed_at IS NOT NULL)
    )
);

CREATE INDEX idx_request_statut ON request(statut) WHERE statut = 'pending';
CREATE INDEX idx_request_tender ON request(tender_id);
CREATE INDEX idx_request_requested_by ON request(requested_by_id);

CREATE UNIQUE INDEX idx_request_unique_pending
    ON request(tender_id, requested_by_id, request_type)
    WHERE statut = 'pending';

CREATE TABLE notification (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipient_id INTEGER NOT NULL,
    author_id INTEGER,
    tender_id INTEGER NOT NULL,
    assignment_id INTEGER,
    comment_id INTEGER,
    request_id INTEGER,

    type VARCHAR(40) NOT NULL CHECK (type IN (
        'assignment',
        'assignment_deactivated',
        'assignment_reactivated',
        'request_submitted',
        'request_approved',
        'request_rejected',
        'new_comment'
    )),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ,

    FOREIGN KEY (recipient_id) REFERENCES "user"(id) ON DELETE RESTRICT,
    FOREIGN KEY (author_id) REFERENCES "user"(id) ON DELETE SET NULL,
    FOREIGN KEY (tender_id) REFERENCES tender(id) ON DELETE RESTRICT,
    FOREIGN KEY (assignment_id) REFERENCES assignment(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comment(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE,

    CONSTRAINT chk_notification_read CHECK (
        (is_read = FALSE AND read_at IS NULL) OR (is_read = TRUE AND read_at IS NOT NULL)
    )
);

CREATE INDEX idx_notification_recipient_unread
    ON notification(recipient_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_notification_tender ON notification(tender_id);
