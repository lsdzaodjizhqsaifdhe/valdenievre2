-- Script pour ajouter des données supplémentaires à la base ValNote
-- Exécuter après init-database.sql

USE valnote_db;

-- Ajouter plus d'élèves
INSERT INTO users (username, password, role, name, email, avatar, phone, address, birth_date, preferences) VALUES
('eleve.bernard', 'Eleve303!', 'eleve', 'Emma Bernard', 'emma.bernard@valnote.fr', '/placeholder.svg?height=40&width=40', '06 67 78 89 01', '101 Rue de la Liberté, 75009 Paris', '2008-03-12', '{"theme": "light", "notifications": true, "language": "fr"}'),
('eleve.rousseau', 'Eleve404!', 'eleve', 'Thomas Rousseau', 'thomas.rousseau@valnote.fr', '/placeholder.svg?height=40&width=40', '06 78 89 01 23', '202 Avenue de la République, 75010 Paris', '2008-07-28', '{"theme": "dark", "notifications": true, "language": "fr"}'),
('eleve.garcia', 'Eleve505!', 'eleve', 'Léa Garcia', 'lea.garcia@valnote.fr', '/placeholder.svg?height=40&width=40', '06 89 01 23 45', '303 Boulevard Saint-Germain, 75011 Paris', '2008-09-14', '{"theme": "light", "notifications": true, "language": "fr"}'),
('eleve.martinez', 'Eleve606!', 'eleve', 'Hugo Martinez', 'hugo.martinez@valnote.fr', '/placeholder.svg?height=40&width=40', '06 90 12 34 56', '404 Rue de Rivoli, 75012 Paris', '2008-12-03', '{"theme": "light", "notifications": true, "language": "fr"}');

-- Ajouter plus de professeurs
INSERT INTO users (username, password, role, name, email, avatar, phone, address, birth_date, preferences) VALUES
('prof.leroy', 'Prof101!', 'prof', 'Mme Leroy', 'leroy@valnote.fr', '/placeholder.svg?height=40&width=40', '06 11 33 55 77', '505 Rue des Sciences, 75013 Paris', '1978-11-20', '{"theme": "light", "notifications": true, "language": "fr"}'),
('prof.moreau', 'Prof202!', 'prof', 'M. Moreau', 'moreau@valnote.fr', '/placeholder.svg?height=40&width=40', '06 22 44 66 88', '606 Avenue des Arts, 75014 Paris', '1983-04-17', '{"theme": "dark", "notifications": true, "language": "fr"}');

-- Ajouter plus de classes
INSERT INTO classes (name, level, subject, room, color, description, max_students) VALUES
('3ème E', '3ème', 'Sciences', '301', '#fa709a', 'Classe de sciences niveau 3ème', 22),
('2nde F', '2nde', 'Anglais', '401', '#a8edea', 'Classe d\'anglais niveau 2nde', 28),
('1ère G', '1ère', 'Philosophie', '501', '#ffecd2', 'Classe de philosophie niveau 1ère', 24);

-- Liaison nouveaux élèves-classes
INSERT INTO student_classes (student_id, class_id) VALUES
(12, 1), (13, 1), (14, 2), (15, 2), -- Nouveaux élèves dans les classes existantes
(12, 5), (13, 5), (14, 6), (15, 7); -- Nouveaux élèves dans les nouvelles classes

-- Liaison nouveaux professeurs-classes
INSERT INTO teacher_classes (teacher_id, class_id, is_main_teacher) VALUES
(16, 5, TRUE),  -- Mme Leroy professeur principal de 3ème E
(17, 6, TRUE),  -- M. Moreau professeur principal de 2nde F
(16, 7, TRUE);  -- Mme Leroy professeur principal de 1ère G

-- Ajouter plus de cours
INSERT INTO courses (class_id, teacher_id, subject, date, start_time, end_time, room, status, description) VALUES
(5, 16, 'Sciences', CURDATE(), '11:00:00', '12:00:00', '301', 'scheduled', 'Expériences de chimie'),
(6, 17, 'Anglais', CURDATE(), '13:30:00', '14:30:00', '401', 'scheduled', 'Conversation anglaise'),
(7, 16, 'Philosophie', CURDATE(), '15:00:00', '16:00:00', '501', 'scheduled', 'Introduction à la logique'),
(5, 16, 'Sciences', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '10:00:00', '301', 'scheduled', 'Cours de physique'),
(6, 17, 'Anglais', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:15:00', '11:15:00', '401', 'scheduled', 'Grammaire anglaise');

-- Ajouter plus de devoirs
INSERT INTO homework (class_id, teacher_id, title, description, subject, due_date, priority, status) VALUES
(5, 16, 'Rapport d\'expérience', 'Rédiger un rapport sur l\'expérience de chimie', 'Sciences', DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'high', 'assigned'),
(6, 17, 'Essay en anglais', 'Write a 500-word essay about your hobbies', 'Anglais', DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'medium', 'assigned'),
(7, 16, 'Dissertation', 'Dissertation sur le thème de la liberté', 'Philosophie', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'high', 'assigned');

-- Ajouter plus de notes
INSERT INTO grades (student_id, teacher_id, class_id, subject, grade, max_grade, description, date, type, coefficient) VALUES
(12, 16, 5, 'Sciences', 17.5, 20, 'TP Chimie', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'project', 1.5),
(13, 16, 5, 'Sciences', 15.0, 20, 'TP Chimie', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'project', 1.5),
(14, 17, 6, 'Anglais', 18.0, 20, 'Oral presentation', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'participation', 1.0),
(15, 17, 6, 'Anglais', 14.5, 20, 'Oral presentation', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'participation', 1.0);

-- Ajouter plus de notifications
INSERT INTO notifications (user_id, title, message, type, read_status) VALUES
(12, 'Excellente note !', 'Félicitations pour votre note de 17.5 en sciences', 'success', FALSE),
(13, 'Nouveau cours', 'Le cours de physique de demain est confirmé', 'info', FALSE),
(14, 'Rappel important', 'N\'oubliez pas votre présentation d\'anglais', 'warning', FALSE),
(15, 'Absence justifiée', 'Votre absence d\'hier a été justifiée', 'info', TRUE);

-- Ajouter plus d'événements
INSERT INTO events (title, description, date, start_time, end_time, type, created_by) VALUES
('Sortie pédagogique', 'Visite du musée des sciences', DATE_ADD(CURDATE(), INTERVAL 14 DAY), '09:00:00', '17:00:00', 'event', 16),
('Conseil de classe', 'Conseil de classe du 1er trimestre', DATE_ADD(CURDATE(), INTERVAL 21 DAY), '17:00:00', '19:00:00', 'meeting', 1),
('Portes ouvertes', 'Journée portes ouvertes de l\'établissement', DATE_ADD(CURDATE(), INTERVAL 30 DAY), '09:00:00', '17:00:00', 'event', 1);

-- Liaison événements-classes pour les nouveaux événements
INSERT INTO event_classes (event_id, class_id) VALUES
(4, 5), -- Sortie pédagogique pour 3ème E
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6), (5, 7); -- Conseil de classe pour toutes les classes

-- Ajouter plus de présences
INSERT INTO attendance (class_id, student_id, course_id, date, status, teacher_id, notes) VALUES
(5, 12, 6, CURDATE(), 'present', 16, NULL),
(5, 13, 6, CURDATE(), 'present', 16, NULL),
(6, 14, 7, CURDATE(), 'late', 17, 'Retard de 5 minutes'),
(6, 15, 7, CURDATE(), 'present', 17, NULL),
(7, 12, 8, CURDATE(), 'absent', 16, 'Rendez-vous médical'),
(2, 10, 3, CURDATE(), 'present', 5, NULL),
(2, 11, 3, CURDATE(), 'excused', 5, 'Dispense EPS');

-- Ajouter des logs de connexion d'exemple
INSERT INTO connection_logs (user_id, username, role, login_time, logout_time, ip_address, user_agent, success, session_duration) VALUES
(4, 'prof.martin', 'prof', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', TRUE, 3600),
(7, 'eleve.dupont', 'eleve', DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL, '192.168.1.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)', TRUE, NULL),
(1, 'Wayzzedev', 'admin', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, '192.168.1.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', TRUE, NULL);

-- Mettre à jour les compteurs de connexion
UPDATE users SET login_count = login_count + FLOOR(RAND() * 10) + 1 WHERE role IN ('prof', 'eleve');
UPDATE users SET login_count = login_count + FLOOR(RAND() * 20) + 5 WHERE role = 'admin';
