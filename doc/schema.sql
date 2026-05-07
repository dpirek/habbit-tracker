-- USERS
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

---------------------------------------------------

-- HABIT CATEGORIES
CREATE TABLE habit_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------

-- HABITS
CREATE TABLE habits (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id BIGINT NOT NULL,
    category_id BIGINT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- daily / weekly / monthly
    frequency ENUM('daily', 'weekly', 'monthly') NOT NULL,

    -- target number
    target_count INT DEFAULT 1,

    -- unit example:
    -- glasses, minutes, pages, workouts
    unit VARCHAR(50),

    is_active BOOLEAN DEFAULT TRUE,

    start_date DATE,
    end_date DATE NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (category_id) REFERENCES habit_categories(id)
        ON DELETE SET NULL
);

---------------------------------------------------

-- HABIT TEMPLATES
CREATE TABLE habit_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    frequency ENUM('daily', 'weekly', 'monthly') NOT NULL,
    target_count INT DEFAULT 1,
    unit VARCHAR(50),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------

-- HABIT CHECK-INS / COMPLETIONS
CREATE TABLE habit_entries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    habit_id BIGINT NOT NULL,

    entry_date DATE NOT NULL,

    -- amount completed
    value DECIMAL(10,2) DEFAULT 1,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (habit_id) REFERENCES habits(id)
        ON DELETE CASCADE,

    UNIQUE(habit_id, entry_date)
);

---------------------------------------------------

-- HABIT STREAKS
CREATE TABLE habit_streaks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    habit_id BIGINT NOT NULL,

    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,

    last_completed_date DATE,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (habit_id) REFERENCES habits(id)
        ON DELETE CASCADE,

    UNIQUE(habit_id)
);

---------------------------------------------------

-- REMINDERS
CREATE TABLE habit_reminders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    habit_id BIGINT NOT NULL,

    reminder_time TIME NOT NULL,

    -- monday-sunday
    weekday ENUM(
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
    ) NULL,

    is_enabled BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (habit_id) REFERENCES habits(id)
        ON DELETE CASCADE
);

---------------------------------------------------

-- TAGS
CREATE TABLE tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

---------------------------------------------------

-- HABIT TAG RELATION
CREATE TABLE habit_tags (
    habit_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,

    PRIMARY KEY (habit_id, tag_id),

    FOREIGN KEY (habit_id) REFERENCES habits(id)
        ON DELETE CASCADE,

    FOREIGN KEY (tag_id) REFERENCES tags(id)
        ON DELETE CASCADE
);
