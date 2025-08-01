-- Script SQL pour les nouvelles fonctionnalités avancées de ValNote
-- Version 2.0 avec messagerie, bulletins, rapports et plus

USE valnote_db;

-- Table des messages/communications
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('message', 'announcement', 'alert', 'system') DEFAULT 'message',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    read_status BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    parent_message_id INT NULL, -- Pour les réponses
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- Table des bulletins scolaires
CREATE TABLE IF NOT EXISTS bulletins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    period VARCHAR(50) NOT NULL, -- '1er trimestre', '2ème trimestre', etc.
    academic_year VARCHAR(10) NOT NULL, -- '2024-2025'
    general_average DECIMAL(4,2),
    class_rank INT,
    class_size INT,
    appreciation TEXT,
    decision ENUM('passage', 'redoublement', 'orientation', 'felicitations', 'encouragements', 'avertissement') NULL,
    generated_by INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('draft', 'published', 'sent') DEFAULT 'draft',
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_period (student_id, period, academic_year)
);

-- Table des appréciations par matière dans les bulletins
CREATE TABLE IF NOT EXISTS bulletin_subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bulletin_id INT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    average DECIMAL(4,2),
    coefficient DECIMAL(3,2) DEFAULT 1.00,
    appreciation TEXT,
    teacher_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bulletin_id) REFERENCES bulletins(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des emplois du temps
CREATE TABLE IF NOT EXISTS schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    day_of_week TINYINT NOT NULL, -- 1=Lundi, 2=Mardi, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(20) NOT NULL,
    week_type ENUM('A', 'B', 'all') DEFAULT 'all', -- Pour les semaines A/B
    effective_from DATE NOT NULL,
    effective_to DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des absences détaillées
CREATE TABLE IF NOT EXISTS detailed_absences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    type ENUM('maladie', 'rdv_medical', 'familial', 'autre') NOT NULL,
    justified BOOLEAN DEFAULT FALSE,
    justification_document VARCHAR(255),
    reason TEXT,
    reported_by INT,
    validated_by INT NULL,
    validated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des compétences/skills
CREATE TABLE IF NOT EXISTS skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    subject VARCHAR(50),
    level ENUM('debutant', 'intermediaire', 'avance', 'expert') DEFAULT 'debutant',
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table d'évaluation des compétences par élève
CREATE TABLE IF NOT EXISTS student_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    teacher_id INT NOT NULL,
    level_acquired ENUM('non_acquis', 'en_cours', 'acquis', 'expert') NOT NULL,
    evaluation_date DATE NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_skill_eval (student_id, skill_id, evaluation_date)
);

-- Table des ressources pédagogiques
CREATE TABLE IF NOT EXISTS resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('document', 'video', 'audio', 'link', 'exercise') NOT NULL,
    subject VARCHAR(50),
    level VARCHAR(20),
    file_path VARCHAR(500),
    file_size INT, -- en bytes
    mime_type VARCHAR(100),
    uploaded_by INT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    download_count INT DEFAULT 0,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Table de partage des ressources avec les classes
CREATE TABLE IF NOT EXISTS resource_shares (
    id INT PRIMARY KEY AUTO_INCREMENT,
    resource_id INT NOT NULL,
    class_id INT NOT NULL,
    shared_by INT NOT NULL,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_resource_class (resource_id, class_id)
);

-- Table des sondages/questionnaires
CREATE TABLE IF NOT EXISTS surveys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    target_audience ENUM('students', 'teachers', 'parents', 'all') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_anonymous BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des questions de sondage
CREATE TABLE IF NOT EXISTS survey_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    survey_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('text', 'multiple_choice', 'single_choice', 'rating', 'yes_no') NOT NULL,
    options JSON, -- Pour les choix multiples
    is_required BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

-- Table des réponses aux sondages
CREATE TABLE IF NOT EXISTS survey_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    survey_id INT NOT NULL,
    question_id INT NOT NULL,
    user_id INT NULL, -- NULL si anonyme
    response_text TEXT,
    response_value INT, -- Pour les ratings
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des réunions/rendez-vous
CREATE TABLE IF NOT EXISTS meetings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    organizer_id INT NOT NULL,
    meeting_type ENUM('conseil_classe', 'parent_prof', 'equipe_pedagogique', 'autre') NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    location VARCHAR(100),
    max_participants INT,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    meeting_link VARCHAR(500), -- Pour les visioconférences
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des participants aux réunions
CREATE TABLE IF NOT EXISTS meeting_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    meeting_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('invited', 'accepted', 'declined', 'attended') DEFAULT 'invited',
    response_date TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_meeting_participant (meeting_id, user_id)
);

-- Table des carnets de liaison (pour les parents)
CREATE TABLE IF NOT EXISTS liaison_book (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    author_id INT NOT NULL, -- Qui a écrit (prof, parent, admin)
    message TEXT NOT NULL,
    type ENUM('info', 'demande', 'justification', 'felicitation', 'remarque') NOT NULL,
    requires_response BOOLEAN DEFAULT FALSE,
    parent_signature BOOLEAN DEFAULT FALSE,
    signature_date TIMESTAMP NULL,
    is_urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des statistiques avancées (cache)
CREATE TABLE IF NOT EXISTS statistics_cache (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cache_key VARCHAR(100) NOT NULL,
    cache_data JSON NOT NULL,
    entity_type ENUM('student', 'class', 'teacher', 'global') NOT NULL,
    entity_id INT NULL,
    period_start DATE,
    period_end DATE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    UNIQUE KEY unique_cache_key (cache_key, entity_type, entity_id)
);

-- Table des paramètres système
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE, -- Visible par tous ou admin seulement
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Index pour optimiser les performances
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_read ON messages(read_status);
CREATE INDEX idx_bulletins_student ON bulletins(student_id);
CREATE INDEX idx_bulletins_period ON bulletins(period, academic_year);
CREATE INDEX idx_schedules_class ON schedules(class_id);
CREATE INDEX idx_schedules_teacher ON schedules(teacher_id);
CREATE INDEX idx_schedules_day ON schedules(day_of_week);
CREATE INDEX idx_absences_student ON detailed_absences(student_id);
CREATE INDEX idx_absences_date ON detailed_absences(start_datetime);
CREATE INDEX idx_student_skills_student ON student_skills(student_id);
CREATE INDEX idx_resources_subject ON resources(subject);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_meetings_organizer ON meetings(organizer_id);
CREATE INDEX idx_meetings_date ON meetings(start_datetime);
CREATE INDEX idx_liaison_student ON liaison_book(student_id);
CREATE INDEX idx_statistics_cache_key ON statistics_cache(cache_key);

-- Insertion des données d'exemple pour les nouvelles fonctionnalités

-- Messages d'exemple
INSERT INTO messages (sender_id, recipient_id, subject, content, type, priority) VALUES
(4, 7, 'Félicitations pour votre travail', 'Bonjour Jean, je tenais à vous féliciter pour votre excellent travail en mathématiques ce trimestre.', 'message', 'normal'),
(1, 4, 'Réunion équipe pédagogique', 'Réunion prévue vendredi 15h en salle des professeurs pour faire le point sur les résultats du trimestre.', 'announcement', 'high'),
(5, 8, 'Devoir non rendu', 'Bonjour Marie, je constate que vous n\'avez pas rendu votre devoir de français. Merci de me voir après le cours.', 'alert', 'normal');

-- Compétences d'exemple
INSERT INTO skills (name, description, subject, level, category) VALUES
('Résolution d\'équations du 1er degré', 'Capacité à résoudre des équations simples à une inconnue', 'Mathématiques', 'intermediaire', 'Algèbre'),
('Expression écrite', 'Rédaction de textes structurés et cohérents', 'Français', 'intermediaire', 'Communication'),
('Analyse de documents historiques', 'Capacité à analyser et critiquer des sources historiques', 'Histoire-Géographie', 'avance', 'Analyse'),
('Conversation en anglais', 'Expression orale fluide en anglais', 'Anglais', 'intermediaire', 'Communication'),
('Expérimentation scientifique', 'Conception et réalisation d\'expériences', 'Sciences', 'avance', 'Pratique');

-- Évaluation des compétences
INSERT INTO student_skills (student_id, skill_id, teacher_id, level_acquired, evaluation_date, comments) VALUES
(7, 1, 4, 'acquis', CURDATE(), 'Très bonne maîtrise des équations simples'),
(7, 2, 5, 'en_cours', CURDATE(), 'Progrès notable, continue tes efforts'),
(8, 1, 4, 'acquis', CURDATE(), 'Excellente compréhension'),
(8, 3, 6, 'expert', CURDATE(), 'Analyse très fine des documents'),
(9, 4, 5, 'en_cours', CURDATE(), 'Bon niveau mais manque de confiance à l\'oral');

-- Ressources pédagogiques
INSERT INTO resources (title, description, type, subject, level, uploaded_by, is_public, tags) VALUES
('Cours sur les fractions', 'Support de cours complet sur les fractions avec exercices', 'document', 'Mathématiques', '6ème', 4, TRUE, '["fractions", "cours", "exercices"]'),
('Vidéo : La Révolution française', 'Documentaire de 20 minutes sur les causes de la Révolution', 'video', 'Histoire-Géographie', '4ème', 6, TRUE, '["révolution", "histoire", "documentaire"]'),
('Exercices d\'anglais interactifs', 'Série d\'exercices en ligne pour améliorer la grammaire', 'exercise', 'Anglais', '5ème', 5, FALSE, '["grammaire", "exercices", "interactif"]');

-- Partage de ressources avec les classes
INSERT INTO resource_shares (resource_id, class_id, shared_by) VALUES
(1, 1, 4), -- Cours fractions partagé avec 6ème A
(2, 4, 6), -- Vidéo révolution partagée avec 4ème D
(3, 2, 5); -- Exercices anglais partagés avec 6ème B

-- Emplois du temps d'exemple
INSERT INTO schedules (class_id, teacher_id, subject, day_of_week, start_time, end_time, room, effective_from) VALUES
(1, 4, 'Mathématiques', 1, '08:00:00', '09:00:00', '207', CURDATE()), -- Lundi 8h-9h
(1, 5, 'Français', 1, '09:00:00', '10:00:00', '105', CURDATE()), -- Lundi 9h-10h
(1, 6, 'Histoire-Géographie', 1, '10:15:00', '11:15:00', '206', CURDATE()), -- Lundi 10h15-11h15
(2, 5, 'Français', 2, '08:00:00', '09:00:00', '105', CURDATE()), -- Mardi 8h-9h
(2, 4, 'Mathématiques', 2, '09:00:00', '10:00:00', '207', CURDATE()); -- Mardi 9h-10h

-- Sondages d'exemple
INSERT INTO surveys (title, description, created_by, target_audience, start_date, end_date) VALUES
('Satisfaction cantine scolaire', 'Enquête sur la qualité des repas servis à la cantine', 1, 'students', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
('Évaluation des cours en ligne', 'Retour d\'expérience sur les cours dispensés en distanciel', 1, 'all', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY));

-- Questions de sondage
INSERT INTO survey_questions (survey_id, question_text, question_type, options, is_required, order_index) VALUES
(1, 'Comment évaluez-vous la qualité des repas ?', 'rating', '{"min": 1, "max": 5}', TRUE, 1),
(1, 'Quels plats aimeriez-vous voir au menu ?', 'text', NULL, FALSE, 2),
(2, 'Les cours en ligne sont-ils efficaces ?', 'single_choice', '["Très efficaces", "Efficaces", "Peu efficaces", "Pas du tout efficaces"]', TRUE, 1);

-- Réunions d'exemple
INSERT INTO meetings (title, description, organizer_id, meeting_type, start_datetime, end_datetime, location) VALUES
('Conseil de classe 6ème A', 'Conseil de classe du 1er trimestre pour la 6ème A', 1, 'conseil_classe', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7 DAY), INTERVAL 2 HOUR), 'Salle de réunion'),
('Rencontre parents-professeurs', 'Rencontre individuelle avec les parents d\'élèves', 4, 'parent_prof', DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 14 DAY), INTERVAL 3 HOUR), 'Salle 207');

-- Participants aux réunions
INSERT INTO meeting_participants (meeting_id, user_id, status) VALUES
(1, 4, 'accepted'), -- M. Martin accepte le conseil de classe
(1, 5, 'invited'), -- Mme Dubois invitée
(2, 4, 'accepted'); -- M. Martin accepte la rencontre parents

-- Carnet de liaison
INSERT INTO liaison_book (student_id, author_id, message, type, requires_response) VALUES
(7, 4, 'Jean a fait d\'excellents progrès en mathématiques ce mois-ci. Félicitations !', 'felicitation', FALSE),
(8, 5, 'Marie semble fatiguée en cours. Y a-t-il un problème particulier à la maison ?', 'demande', TRUE),
(9, 6, 'Pierre a été absent hier. Merci de justifier cette absence.', 'justification', TRUE);

-- Paramètres système
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('school_name', 'Collège ValNote', 'string', 'Nom de l\'établissement', 'general', TRUE),
('academic_year', '2024-2025', 'string', 'Année scolaire en cours', 'general', TRUE),
('max_absence_rate', '10', 'number', 'Taux d\'absence maximum autorisé (%)', 'attendance', FALSE),
('enable_notifications', 'true', 'boolean', 'Activer les notifications push', 'notifications', FALSE),
('grade_scale', '20', 'number', 'Barème de notation (sur combien)', 'grades', TRUE),
('bulletin_periods', '["1er trimestre", "2ème trimestre", "3ème trimestre"]', 'json', 'Périodes d\'évaluation', 'grades', FALSE);

-- Bulletins d'exemple
INSERT INTO bulletins (student_id, period, academic_year, general_average, class_rank, class_size, appreciation, generated_by) VALUES
(7, '1er trimestre', '2024-2025', 14.5, 3, 25, 'Bon trimestre. Jean fait preuve de sérieux et de régularité dans son travail.', 1),
(8, '1er trimestre', '2024-2025', 16.2, 1, 25, 'Excellent trimestre ! Marie est une élève exemplaire qui mérite toutes nos félicitations.', 1);

-- Appréciations par matière dans les bulletins
INSERT INTO bulletin_subjects (bulletin_id, subject, average, coefficient, appreciation, teacher_id) VALUES
(1, 'Mathématiques', 14.5, 3.0, 'Très bon niveau. Continue ainsi !', 4),
(1, 'Français', 13.8, 3.0, 'Bon travail, peut encore progresser à l\'écrit.', 5),
(2, 'Mathématiques', 17.0, 3.0, 'Excellente élève, très rigoureuse.', 4),
(2, 'Français', 15.5, 3.0, 'Très bonne expression, continue tes efforts.', 5);

-- Absences détaillées
INSERT INTO detailed_absences (student_id, start_datetime, end_datetime, type, justified, reason, reported_by) VALUES
(7, '2024-01-15 08:00:00', '2024-01-15 18:00:00', 'maladie', TRUE, 'Grippe avec certificat médical', 4),
(8, '2024-01-20 14:00:00', '2024-01-20 16:00:00', 'rdv_medical', TRUE, 'Rendez-vous chez l\'orthodontiste', 5),
(9, '2024-01-22 08:00:00', '2024-01-22 10:00:00', 'autre', FALSE, 'Retard non justifié', 6);

COMMIT;