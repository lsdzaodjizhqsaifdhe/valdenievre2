-- Script de migration et mise à jour des données ValNote
-- Gestion des versions et migration des données existantes

USE valnote_db;

-- Table de versioning pour suivre les migrations
CREATE TABLE IF NOT EXISTS schema_versions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    version VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rollback_script TEXT
);

-- Insérer la version actuelle
INSERT IGNORE INTO schema_versions (version, description) 
VALUES ('2.0.0', 'Version complète avec nouvelles fonctionnalités avancées');

-- Migration des données existantes vers le nouveau format

-- 1. Mise à jour des utilisateurs avec les nouveaux champs
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) DEFAULT '/placeholder.svg?height=40&width=40',
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS preferences JSON DEFAULT '{"theme": "light", "notifications": true, "language": "fr"}',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Mise à jour des classes avec les nouveaux champs
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#667eea',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS max_students INT DEFAULT 30,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. Mise à jour des cours avec les nouveaux champs
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS status ENUM('scheduled', 'cancelled', 'completed', 'in_progress') DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 4. Mise à jour des devoirs avec les nouveaux champs
ALTER TABLE homework
ADD COLUMN IF NOT EXISTS priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS status ENUM('assigned', 'submitted', 'graded') DEFAULT 'assigned',
ADD COLUMN IF NOT EXISTS attachments JSON;

-- 5. Mise à jour des notes avec les nouveaux champs
ALTER TABLE grades
ADD COLUMN IF NOT EXISTS type ENUM('test', 'homework', 'participation', 'project') DEFAULT 'test',
ADD COLUMN IF NOT EXISTS coefficient DECIMAL(3,2) DEFAULT 1.00;

-- 6. Mise à jour des punitions avec les nouveaux champs
ALTER TABLE punishments
ADD COLUMN IF NOT EXISTS severity ENUM('low', 'medium', 'high') DEFAULT 'medium';

-- Procédure de migration des données
DELIMITER //
CREATE PROCEDURE MigrateToVersion2()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE user_id INT;
    DECLARE user_cursor CURSOR FOR SELECT id FROM users;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Mettre à jour les couleurs des classes existantes
    UPDATE classes SET color = '#667eea' WHERE id = 1;
    UPDATE classes SET color = '#f093fb' WHERE id = 2;
    UPDATE classes SET color = '#4facfe' WHERE id = 3;
    UPDATE classes SET color = '#43e97b' WHERE id = 4;
    
    -- Mettre à jour les préférences des utilisateurs existants
    OPEN user_cursor;
    read_loop: LOOP
        FETCH user_cursor INTO user_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        UPDATE users 
        SET preferences = '{"theme": "light", "notifications": true, "language": "fr"}'
        WHERE id = user_id AND preferences IS NULL;
    END LOOP;
    CLOSE user_cursor;
    
    -- Créer des notifications de bienvenue pour les utilisateurs existants
    INSERT IGNORE INTO notifications (user_id, title, message, type, read_status)
    SELECT 
        id,
        'Mise à jour ValNote 2.0',
        'Découvrez les nouvelles fonctionnalités de ValNote ! Messagerie, bulletins automatiques, et bien plus.',
        'info',
        FALSE
    FROM users;
    
    SELECT 'Migration vers la version 2.0 terminée' as status;
END //
DELIMITER ;

-- Procédure de rollback
DELIMITER //
CREATE PROCEDURE RollbackToVersion1()
BEGIN
    -- Supprimer les nouvelles tables
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS bulletins;
    DROP TABLE IF EXISTS bulletin_subjects;
    DROP TABLE IF EXISTS schedules;
    DROP TABLE IF EXISTS detailed_absences;
    DROP TABLE IF EXISTS skills;
    DROP TABLE IF EXISTS student_skills;
    DROP TABLE IF EXISTS resources;
    DROP TABLE IF EXISTS resource_shares;
    DROP TABLE IF EXISTS surveys;
    DROP TABLE IF EXISTS survey_questions;
    DROP TABLE IF EXISTS survey_responses;
    DROP TABLE IF EXISTS meetings;
    DROP TABLE IF EXISTS meeting_participants;
    DROP TABLE IF EXISTS liaison_book;
    DROP TABLE IF EXISTS statistics_cache;
    DROP TABLE IF EXISTS system_settings;
    DROP TABLE IF EXISTS system_logs;
    
    -- Supprimer les nouvelles colonnes
    ALTER TABLE users 
    DROP COLUMN IF EXISTS avatar,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS address,
    DROP COLUMN IF EXISTS birth_date,
    DROP COLUMN IF EXISTS preferences,
    DROP COLUMN IF EXISTS last_login,
    DROP COLUMN IF EXISTS login_count,
    DROP COLUMN IF EXISTS is_active;
    
    ALTER TABLE classes
    DROP COLUMN IF EXISTS color,
    DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS max_students,
    DROP COLUMN IF EXISTS is_active;
    
    ALTER TABLE courses
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS cancellation_reason,
    DROP COLUMN IF EXISTS description;
    
    ALTER TABLE homework
    DROP COLUMN IF EXISTS priority,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS attachments;
    
    ALTER TABLE grades
    DROP COLUMN IF EXISTS type,
    DROP COLUMN IF EXISTS coefficient;
    
    ALTER TABLE punishments
    DROP COLUMN IF EXISTS severity;
    
    SELECT 'Rollback vers la version 1.0 terminé' as status;
END //
DELIMITER ;

-- Procédure de sauvegarde complète
DELIMITER //
CREATE PROCEDURE BackupAllData()
BEGIN
    DECLARE backup_date VARCHAR(20);
    SET backup_date = DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s');
    
    -- Créer les tables de sauvegarde
    SET @sql = CONCAT('CREATE TABLE backup_users_', backup_date, ' AS SELECT * FROM users');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SET @sql = CONCAT('CREATE TABLE backup_classes_', backup_date, ' AS SELECT * FROM classes');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SET @sql = CONCAT('CREATE TABLE backup_grades_', backup_date, ' AS SELECT * FROM grades');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SET @sql = CONCAT('CREATE TABLE backup_attendance_', backup_date, ' AS SELECT * FROM attendance');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SELECT CONCAT('Sauvegarde créée avec le suffixe: ', backup_date) as status;
END //
DELIMITER ;

-- Procédure de nettoyage des sauvegardes anciennes
DELIMITER //
CREATE PROCEDURE CleanOldBackups()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name VARCHAR(255);
    DECLARE backup_cursor CURSOR FOR 
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME LIKE 'backup_%'
        AND CREATE_TIME < DATE_SUB(NOW(), INTERVAL 30 DAY);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN backup_cursor;
    read_loop: LOOP
        FETCH backup_cursor INTO table_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET @sql = CONCAT('DROP TABLE ', table_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END LOOP;
    CLOSE backup_cursor;
    
    SELECT 'Anciennes sauvegardes supprimées' as status;
END //
DELIMITER ;

-- Procédure de vérification de l'intégrité des données
DELIMITER //
CREATE PROCEDURE CheckDataIntegrity()
BEGIN
    DECLARE integrity_issues INT DEFAULT 0;
    
    -- Vérifier les références orphelines
    SELECT COUNT(*) INTO @orphan_grades
    FROM grades g
    LEFT JOIN users u ON g.student_id = u.id
    WHERE u.id IS NULL;
    
    SELECT COUNT(*) INTO @orphan_attendance
    FROM attendance a
    LEFT JOIN users u ON a.student_id = u.id
    WHERE u.id IS NULL;
    
    SELECT COUNT(*) INTO @orphan_student_classes
    FROM student_classes sc
    LEFT JOIN users u ON sc.student_id = u.id
    WHERE u.id IS NULL;
    
    SET integrity_issues = @orphan_grades + @orphan_attendance + @orphan_student_classes;
    
    -- Rapport d'intégrité
    SELECT 
        'Vérification d\'intégrité terminée' as status,
        @orphan_grades as grades_orphelines,
        @orphan_attendance as attendance_orpheline,
        @orphan_student_classes as student_classes_orphelines,
        integrity_issues as total_problemes;
        
    -- Nettoyer les données orphelines si nécessaire
    IF integrity_issues > 0 THEN
        DELETE g FROM grades g
        LEFT JOIN users u ON g.student_id = u.id
        WHERE u.id IS NULL;
        
        DELETE a FROM attendance a
        LEFT JOIN users u ON a.student_id = u.id
        WHERE u.id IS NULL;
        
        DELETE sc FROM student_classes sc
        LEFT JOIN users u ON sc.student_id = u.id
        WHERE u.id IS NULL;
        
        SELECT 'Données orphelines nettoyées' as cleanup_status;
    END IF;
END //
DELIMITER ;

-- Procédure d'optimisation des performances
DELIMITER //
CREATE PROCEDURE OptimizeDatabase()
BEGIN
    -- Analyser les tables
    ANALYZE TABLE users, classes, grades, attendance, courses, homework, punishments;
    
    -- Optimiser les tables
    OPTIMIZE TABLE users, classes, grades, attendance, courses, homework, punishments;
    
    -- Reconstruire les index
    ALTER TABLE grades DROP INDEX IF EXISTS idx_grades_student;
    ALTER TABLE grades ADD INDEX idx_grades_student (student_id);
    
    ALTER TABLE attendance DROP INDEX IF EXISTS idx_attendance_student;
    ALTER TABLE attendance ADD INDEX idx_attendance_student (student_id);
    
    ALTER TABLE attendance DROP INDEX IF EXISTS idx_attendance_date;
    ALTER TABLE attendance ADD INDEX idx_attendance_date (date);
    
    -- Mettre à jour les statistiques
    UPDATE users SET login_count = (
        SELECT COUNT(*) FROM connection_logs 
        WHERE connection_logs.user_id = users.id AND success = TRUE
    );
    
    SELECT 'Optimisation de la base de données terminée' as status;
END //
DELIMITER ;

-- Exécuter la migration
CALL MigrateToVersion2();

-- Insérer des données d'exemple pour les nouvelles fonctionnalités
INSERT IGNORE INTO skills (name, description, subject, level, category) VALUES
('Calcul mental', 'Effectuer des calculs simples de tête', 'Mathématiques', 'debutant', 'Calcul'),
('Lecture fluide', 'Lire un texte avec fluidité et expression', 'Français', 'intermediaire', 'Lecture'),
('Raisonnement logique', 'Construire un raisonnement cohérent', 'Mathématiques', 'avance', 'Logique'),
('Expression orale', 'S\'exprimer clairement à l\'oral', 'Français', 'intermediaire', 'Communication'),
('Observation scientifique', 'Observer et décrire des phénomènes', 'Sciences', 'debutant', 'Observation');

-- Insérer des paramètres système par défaut
INSERT IGNORE INTO system_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('maintenance_mode', 'false', 'boolean', 'Mode maintenance activé', 'system', FALSE),
('max_file_size', '10485760', 'number', 'Taille maximale des fichiers (bytes)', 'uploads', FALSE),
('session_timeout', '3600', 'number', 'Durée de session en secondes', 'security', FALSE),
('backup_frequency', '24', 'number', 'Fréquence de sauvegarde en heures', 'backup', FALSE),
('notification_retention', '90', 'number', 'Durée de conservation des notifications (jours)', 'notifications', FALSE);

-- Créer des emplois du temps d'exemple
INSERT IGNORE INTO schedules (class_id, teacher_id, subject, day_of_week, start_time, end_time, room, effective_from) VALUES
(1, 4, 'Mathématiques', 1, '08:00:00', '09:00:00', '207', '2024-09-01'),
(1, 5, 'Français', 1, '09:00:00', '10:00:00', '105', '2024-09-01'),
(1, 6, 'Histoire-Géographie', 1, '10:15:00', '11:15:00', '206', '2024-09-01'),
(2, 5, 'Français', 2, '08:00:00', '09:00:00', '105', '2024-09-01'),
(2, 4, 'Mathématiques', 2, '09:00:00', '10:00:00', '207', '2024-09-01');

COMMIT;

SELECT 'Migration complète vers ValNote 2.0 terminée avec succès !' as final_status;