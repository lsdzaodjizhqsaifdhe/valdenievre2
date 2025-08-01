-- Script SQL pour initialiser la base de données ValNote
-- Version complète avec toutes les nouvelles fonctionnalités

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS valnote_db;
USE valnote_db;

-- Table des utilisateurs avec informations étendues
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'prof', 'eleve') NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    avatar VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    birth_date DATE,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    login_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table des classes avec couleurs et descriptions
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    room VARCHAR(20) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Code couleur hexadécimal
    description TEXT,
    max_students INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table de liaison professeurs-classes (relation many-to-many)
CREATE TABLE teacher_classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    is_main_teacher BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_class (teacher_id, class_id)
);

-- Table de liaison élèves-classes (relation many-to-many)
CREATE TABLE student_classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_class (student_id, class_id)
);

-- Table des cours avec statuts étendus
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(20) NOT NULL,
    status ENUM('scheduled', 'cancelled', 'completed', 'in_progress') DEFAULT 'scheduled',
    cancellation_reason TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des devoirs avec priorités et statuts
CREATE TABLE homework (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(50) NOT NULL,
    due_date DATE NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('assigned', 'submitted', 'graded') DEFAULT 'assigned',
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des notes avec types et coefficients
CREATE TABLE grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    grade DECIMAL(4,2) NOT NULL,
    max_grade DECIMAL(4,2) DEFAULT 20.00,
    description VARCHAR(200),
    date DATE NOT NULL,
    type ENUM('test', 'homework', 'participation', 'project') DEFAULT 'test',
    coefficient DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Table des punitions avec sévérité
CREATE TABLE punishments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    type ENUM('retenue', 'colle', 'exclusion', 'avertissement') NOT NULL,
    reason TEXT NOT NULL,
    date DATE NOT NULL,
    duration INT, -- en minutes
    room VARCHAR(20),
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des présences/appels
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    teacher_id INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (class_id, student_id, course_id, date)
);

-- Table des logs de connexion
CREATE TABLE connection_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    session_duration INT, -- en secondes
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    read_status BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des événements
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type ENUM('exam', 'meeting', 'holiday', 'event') NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Table de liaison événements-classes
CREATE TABLE event_classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    class_id INT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_class (event_id, class_id)
);

-- Index pour optimiser les performances
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_courses_date ON courses(date);
CREATE INDEX idx_courses_teacher ON courses(teacher_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_date ON grades(date);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_status);

-- Insertion des données initiales
-- Utilisateurs administrateurs
INSERT INTO users (username, password, role, name, email, avatar, phone, preferences) VALUES
('Wayzzedev', 'Admin2024!Secure', 'admin', 'Wayze Dev', 'wayze@valnote.fr', '/placeholder.svg?height=40&width=40', '06 12 34 56 78', '{"theme": "light", "notifications": true, "language": "fr"}'),
('zerkaidev', 'ZerkAi2024!Admin', 'admin', 'Zerkai Dev', 'zerkai@valnote.fr', '/placeholder.svg?height=40&width=40', '06 98 76 54 32', '{"theme": "dark", "notifications": true, "language": "fr"}'),
('test', 'test', 'admin', 'Test Admin', 'test@valnote.fr', '/placeholder.svg?height=40&width=40', NULL, '{"theme": "light", "notifications": true, "language": "fr"}');

-- Utilisateurs professeurs
INSERT INTO users (username, password, role, name, email, avatar, phone, address, birth_date, preferences) VALUES
('prof.martin', 'Prof123!', 'prof', 'M. Martin', 'martin@valnote.fr', '/placeholder.svg?height=40&width=40', '06 11 22 33 44', '123 Rue de l\'École, 75001 Paris', '1980-05-15', '{"theme": "light", "notifications": true, "language": "fr"}'),
('prof.dubois', 'Prof456!', 'prof', 'Mme Dubois', 'dubois@valnote.fr', '/placeholder.svg?height=40&width=40', '06 55 66 77 88', '456 Avenue des Professeurs, 75002 Paris', '1975-09-22', '{"theme": "light", "notifications": true, "language": "fr"}'),
('prof.bernard', 'Prof789!', 'prof', 'M. Bernard', 'bernard@valnote.fr', '/placeholder.svg?height=40&width=40', '06 99 88 77 66', '789 Boulevard de l\'Éducation, 75003 Paris', '1982-03-10', '{"theme": "dark", "notifications": true, "language": "fr"}');

-- Utilisateurs élèves
INSERT INTO users (username, password, role, name, email, avatar, phone, address, birth_date, preferences) VALUES
('eleve.dupont', 'Eleve123!', 'eleve', 'Jean Dupont', 'jean.dupont@valnote.fr', '/placeholder.svg?height=40&width=40', '06 12 34 56 78', '12 Rue des Élèves, 75004 Paris', '2008-06-15', '{"theme": "light", "notifications": true, "language": "fr"}'),
('eleve.martin', 'Eleve456!', 'eleve', 'Marie Martin', 'marie.martin@valnote.fr', '/placeholder.svg?height=40&width=40', '06 23 45 67 89', '34 Avenue des Étudiants, 75005 Paris', '2008-08-22', '{"theme": "light", "notifications": true, "language": "fr"}'),
('eleve.durand', 'Eleve789!', 'eleve', 'Pierre Durand', 'pierre.durand@valnote.fr', '/placeholder.svg?height=40&width=40', '06 34 56 78 90', '56 Rue de la Jeunesse, 75006 Paris', '2008-04-10', '{"theme": "dark", "notifications": true, "language": "fr"}'),
('eleve.moreau', 'Eleve101!', 'eleve', 'Sophie Moreau', 'sophie.moreau@valnote.fr', '/placeholder.svg?height=40&width=40', '06 45 67 89 01', '78 Boulevard de l\'Avenir, 75007 Paris', '2008-11-05', '{"theme": "light", "notifications": true, "language": "fr"}'),
('eleve.petit', 'Eleve202!', 'eleve', 'Lucas Petit', 'lucas.petit@valnote.fr', '/placeholder.svg?height=40&width=40', '06 56 78 90 12', '90 Place de l\'École, 75008 Paris', '2008-01-18', '{"theme": "light", "notifications": true, "language": "fr"}');

-- Classes avec couleurs
INSERT INTO classes (name, level, subject, room, color, description, max_students) VALUES
('6ème A', '6ème', 'Mathématiques', '207', '#667eea', 'Classe de mathématiques niveau 6ème', 25),
('6ème B', '6ème', 'Français', '105', '#f093fb', 'Classe de français niveau 6ème', 24),
('5ème C', '5ème', 'Mathématiques', '207', '#4facfe', 'Classe de mathématiques niveau 5ème', 26),
('4ème D', '4ème', 'Histoire-Géographie', '206', '#43e97b', 'Classe d\'histoire-géographie niveau 4ème', 23);

-- Liaison professeurs-classes
INSERT INTO teacher_classes (teacher_id, class_id, is_main_teacher) VALUES
(4, 1, TRUE),   -- M. Martin professeur principal de 6ème A
(5, 1, FALSE),  -- Mme Dubois aussi en 6ème A
(5, 2, TRUE),   -- Mme Dubois professeur principal de 6ème B
(6, 2, FALSE),  -- M. Bernard aussi en 6ème B
(4, 3, TRUE),   -- M. Martin professeur principal de 5ème C
(6, 4, TRUE),   -- M. Bernard professeur principal de 4ème D
(4, 4, FALSE);  -- M. Martin aussi en 4ème D

-- Liaison élèves-classes
INSERT INTO student_classes (student_id, class_id) VALUES
(7, 1), (8, 1), (9, 1),  -- Jean, Marie, Pierre en 6ème A
(10, 2), (11, 2),        -- Sophie, Lucas en 6ème B
(7, 3), (8, 3);          -- Jean, Marie aussi en 5ème C

-- Cours programmés
INSERT INTO courses (class_id, teacher_id, subject, date, start_time, end_time, room, status, description) VALUES
(1, 4, 'Mathématiques', CURDATE(), '08:00:00', '09:00:00', '207', 'scheduled', 'Cours sur les fractions'),
(1, 4, 'Mathématiques', CURDATE(), '10:00:00', '11:00:00', '207', 'scheduled', 'Exercices pratiques'),
(2, 5, 'Français', CURDATE(), '09:00:00', '10:00:00', '105', 'scheduled', 'Étude de texte'),
(3, 4, 'Mathématiques', CURDATE(), '14:00:00', '15:00:00', '207', 'scheduled', 'Géométrie'),
(1, 4, 'Mathématiques', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '09:00:00', '207', 'cancelled', 'Cours annulé');

-- Devoirs
INSERT INTO homework (class_id, teacher_id, title, description, subject, due_date, priority, status) VALUES
(1, 4, 'Exercices page 27', 'Faire les exercices n°2 à 8 page 27', 'Mathématiques', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'medium', 'assigned'),
(2, 5, 'Rédaction', 'Rédiger un texte de 300 mots sur les vacances', 'Français', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'high', 'assigned'),
(3, 4, 'DM Équations', 'Devoir maison sur les équations du premier degré', 'Mathématiques', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'high', 'assigned');

-- Notes
INSERT INTO grades (student_id, teacher_id, class_id, subject, grade, max_grade, description, date, type, coefficient) VALUES
(7, 4, 1, 'Mathématiques', 14.5, 20, 'Contrôle fractions', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'test', 2.0),
(8, 4, 1, 'Mathématiques', 16.0, 20, 'Contrôle fractions', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'test', 2.0),
(9, 4, 1, 'Mathématiques', 12.0, 20, 'Contrôle fractions', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'test', 2.0),
(10, 5, 2, 'Français', 15.5, 20, 'Dictée', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'test', 1.0),
(11, 5, 2, 'Français', 13.0, 20, 'Dictée', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'test', 1.0);

-- Punitions
INSERT INTO punishments (student_id, teacher_id, type, reason, date, duration, room, status, severity) VALUES
(9, 4, 'retenue', 'Bavardage répété en cours', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 60, 'Vie scolaire', 'pending', 'medium'),
(11, 5, 'colle', 'Devoir non fait', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 120, '105', 'pending', 'low');

-- Notifications
INSERT INTO notifications (user_id, title, message, type, read_status) VALUES
(7, 'Nouveau devoir', 'Un nouveau devoir de mathématiques a été assigné', 'info', FALSE),
(8, 'Note disponible', 'Votre note de français est disponible', 'success', FALSE),
(10, 'Rappel', 'N\'oubliez pas votre devoir de français pour demain', 'warning', FALSE);

-- Événements
INSERT INTO events (title, description, date, start_time, end_time, type, created_by) VALUES
('Réunion parents-professeurs', 'Rencontre avec les parents d\'élèves', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '18:00:00', '20:00:00', 'meeting', 1),
('Contrôle de mathématiques', 'Évaluation sur les fractions', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '08:00:00', '09:00:00', 'exam', 4),
('Vacances de Noël', 'Période de vacances scolaires', '2024-12-21', '00:00:00', '23:59:59', 'holiday', 1);

-- Liaison événements-classes
INSERT INTO event_classes (event_id, class_id) VALUES
(2, 1), -- Contrôle de maths pour la 6ème A
(2, 3); -- Contrôle de maths pour la 5ème C

-- Présences d'exemple
INSERT INTO attendance (class_id, student_id, course_id, date, status, teacher_id, notes) VALUES
(1, 7, 1, CURDATE(), 'present', 4, NULL),
(1, 8, 1, CURDATE(), 'absent', 4, 'Maladie'),
(1, 9, 1, CURDATE(), 'late', 4, 'Retard de 10 minutes');
