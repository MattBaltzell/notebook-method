-- base users
INSERT INTO users (username, email, password, first_name, last_name, avatar_url, join_at, user_type_id) 
    VALUES  (
        'mattb', 
        'mattb@gmail.com', 
        '$2b$12$2lvTCDkGBNjJztPS59EVReDtuYujhpPW71SJImygh/DRQuG7ZnlcC',
        'Matt',
        'Baltzell', 
        '', 
        CURRENT_TIMESTAMP, 
        2),
        (
        'ardenb', 
        'ardenb@gmail.com', 
        '$2b$12$2lvTCDkGBNjJztPS59EVReDtuYujhpPW71SJImygh/DRQuG7ZnlcC',
        'Arden',
        'Baltzell', 
        '', 
        CURRENT_TIMESTAMP, 
        2),
        (
        'cambrieb', 
        'cambrieb@gmail.com', 
        '$2b$12$2lvTCDkGBNjJztPS59EVReDtuYujhpPW71SJImygh/DRQuG7ZnlcC',
        'Cambrie',
        'Baltzell', 
        '', 
        CURRENT_TIMESTAMP, 
        3),
        (
        'drewb', 
        'drewb@gmail.com', 
        '$2b$12$2lvTCDkGBNjJztPS59EVReDtuYujhpPW71SJImygh/DRQuG7ZnlcC',
        'Drew',
        'Baltzell', 
        '', 
        CURRENT_TIMESTAMP, 
        3),
        (
        'shilohb', 
        'shilohb@gmail.com', 
        '$2b$12$2lvTCDkGBNjJztPS59EVReDtuYujhpPW71SJImygh/DRQuG7ZnlcC',
        'Shiloh',
        'Baltzell', 
        '', 
        CURRENT_TIMESTAMP, 
        3);


-- base teachers
INSERT INTO teachers (user_id) 
    VALUES  (1),(2);


-- base students
INSERT INTO students (user_id, teacher_id, grade) 
    VALUES  (3, 2, '3'),
            (4, 2, '1'),
            (5, 1, 'K3');