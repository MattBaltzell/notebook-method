-- establish initial user types

INSERT INTO user_types (type) 
    VALUES ('unassigned'), ('teacher'), ('student');

-- base school subjects
INSERT INTO subjects (code, grade, title, description) 
    VALUES  ('MATH1', '1', 'Math 1','1st Grade Mathematics'), 
            ('LANG1', '1', 'Language Arts 1','1st Grade Language Arts'),
            ('HAND1', '1', 'Handwriting 1','1st Grade Handwriting'),
            ('SCI1', '1', 'Science 1','1st Grade Science'),
            ('HIST1', '1', 'History 1','1st Grade History'),
            ('PE1', '1', 'P.E. 1','1st Grade Physical Education'),
            ('HEALTH1', '1', 'Health 1','1st Grade Health Education'),
            ('BIBLE1', '1', 'Bible 1','1st Grade Bible Studies'),            
            ('FORLANG1', '1', 'Foreign Language 1','1st Grade Foreign Language'),            
            
            ('MATH3', '3', 'Math 3','3rd Grade Mathematics'), 
            ('LANG3', '3', 'Language Arts 3','3rd Grade Language Arts'),
            ('HAND3', '3', 'Handwriting 3','3rd Grade Handwriting'),
            ('SCI3', '3', 'Science 3','3rd Grade Science'),
            ('HIST3', '3', 'History 3','3rd Grade History'),
            ('PE3', '3', 'P.E. 3','3rd Grade Physical Education'),
            ('HEALTH3', '3', 'Health 3','3rd Grade Health Education'),
            ('BIBLE3', '3', 'Bible 3','3rd Grade Bible Studies'),            
            ('FORLANG3', '3', 'Foreign Language 3','3rd Grade Foreign Language'),

            ('ELECTIVE', 'all', 'Free Elective','Free Elective for Any Grades');