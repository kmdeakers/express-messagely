\connect messagely

INSERT INTO users (username, password, first_name, last_name, phone, join_at)
    VALUES 
    ('joel', 'password', 'Joel', 'Burton', '+14155551212', '1970-01-01 00:00:01');


INSERT INTO users (username, password, first_name, last_name, phone, join_at)
    VALUES 
    ('kevin', 'password', 'kevin', 'Burton', '+14155551213', '1970-01-01 00:00:01');


INSERT INTO messages (from_username, to_username, body, sent_at)
        VALUES
            ('kevin', 'joel', 'hey', '1970-01-01 00:00:01');