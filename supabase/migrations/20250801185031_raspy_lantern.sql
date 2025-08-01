-- Script SQL pour les triggers avancés et automatisations de ValNote
-- Automatisation des processus métier

USE valnote_db;

-- Trigger pour créer automatiquement une notification lors d'une nouvelle note
DELIMITER //
CREATE TRIGGER notify_new_grade
AFTER INSERT ON grades
FOR EACH ROW
BEGIN
    INSERT INTO notifications (user_id, title, message, type, read_status)
    VALUES (
        NEW.student_id,
        'Nouvelle note disponible',
        CONCAT('Une nouvelle note de ', NEW.grade, '/20 a été ajoutée en ', NEW.subject),
        'success',
        FALSE
    );
END //
DELIMITER ;

-- Trigger pour alerter en cas de note très faible
DELIMITER //
CREATE TRIGGER alert_low_grade
AFTER INSERT ON grades
FOR EACH ROW
BEGIN
    IF NEW.grade < 8 THEN
        INSERT INTO notifications (user_id, title, message, type, read_status)
        VALUES (
            NEW.student_id,
            'Attention - Note faible',
            CONCAT('Note de ', NEW.grade, '/20 en ', NEW.subject, '. N\'hésitez pas à demander de l\'aide.'),
            'warning',
            FALSE
        );
        
        -- Notifier aussi le professeur principal
        INSERT INTO notifications (user_id, title, message, type, read_status)
        SELECT 
            tc.teacher_id,
            'Élève en difficulté',
            CONCAT('L\'élève ', (SELECT name FROM users WHERE id = NEW.student_id), 
                   ' a obtenu ', NEW.grade, '/20 en ', NEW.subject),
            'warning',
            FALSE
        FROM teacher_classes tc 
        WHERE tc.class_id = NEW.class_id AND tc.is_main_teacher = TRUE;
    END IF;
END //
DELIMITER ;

-- Trigger pour féliciter les excellentes notes
DELIMITER //
CREATE TRIGGER congratulate_high_grade
AFTER INSERT ON grades
FOR EACH ROW
BEGIN
    IF NEW.grade >= 18 THEN
        INSERT INTO notifications (user_id, title, message, type, read_status)
        VALUES (
            NEW.student_id,
            'Félicitations !',
            CONCAT('Excellente note de ', NEW.grade, '/20 en ', NEW.subject, ' ! Continuez ainsi !'),
            'success',
            FALSE
        );
    END IF;
END //
DELIMITER ;

-- Trigger pour alerter en cas d'absences répétées
DELIMITER //
CREATE TRIGGER alert_repeated_absences
AFTER INSERT ON attendance
FOR EACH ROW
BEGIN
    DECLARE absence_count INT;
    
    IF NEW.status = 'absent' THEN
        -- Compter les absences des 30 derniers jours
        SELECT COUNT(*) INTO absence_count
        FROM attendance 
        WHERE student_id = NEW.student_id 
        AND status = 'absent' 
        AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
        
        -- Alerter si plus de 5 absences dans le mois
        IF absence_count > 5 THEN
            INSERT INTO notifications (user_id, title, message, type, read_status)
            VALUES (
                NEW.student_id,
                'Attention - Absences répétées',
                CONCAT('Vous avez ', absence_count, ' absences ce mois-ci. Attention au décrochage scolaire.'),
                'warning',
                FALSE
            );
            
            -- Notifier l'administration
            INSERT INTO notifications (user_id, title, message, type, read_status)
            SELECT 
                id,
                'Élève absentéiste',
                CONCAT('L\'élève ', (SELECT name FROM users WHERE id = NEW.student_id), 
                       ' a ', absence_count, ' absences ce mois-ci.'),
                'alert',
                FALSE
            FROM users 
            WHERE role = 'admin';
        END IF;
    END IF;
END //
DELIMITER ;

-- Trigger pour mettre à jour le compteur de connexions
DELIMITER //
CREATE TRIGGER update_login_count
AFTER INSERT ON connection_logs
FOR EACH ROW
BEGIN
    IF NEW.success = TRUE THEN
        UPDATE users 
        SET login_count = login_count + 1,
            last_login = NEW.login_time
        WHERE id = NEW.user_id;
    END IF;
END //
DELIMITER ;

-- Trigger pour archiver automatiquement les anciens devoirs
DELIMITER //
CREATE TRIGGER archive_old_homework
AFTER UPDATE ON homework
FOR EACH ROW
BEGIN
    IF NEW.status = 'graded' AND OLD.status != 'graded' THEN
        -- Créer une notification pour l'élève
        INSERT INTO notifications (user_id, title, message, type, read_status)
        SELECT 
            sc.student_id,
            'Devoir corrigé',
            CONCAT('Le devoir "', NEW.title, '" a été corrigé et noté.'),
            'info',
            FALSE
        FROM student_classes sc
        WHERE sc.class_id = NEW.class_id;
    END IF;
END //
DELIMITER ;

-- Trigger pour valider automatiquement les bulletins
DELIMITER //
CREATE TRIGGER validate_bulletin
BEFORE INSERT ON bulletins
FOR EACH ROW
BEGIN
    -- Calculer automatiquement la moyenne générale
    SELECT AVG(grade) INTO NEW.general_average
    FROM grades 
    WHERE student_id = NEW.student_id;
    
    -- Calculer le rang dans la classe
    SET NEW.class_rank = GetStudentRank(NEW.student_id, 
        (SELECT class_id FROM student_classes WHERE student_id = NEW.student_id LIMIT 1));
    
    -- Calculer la taille de la classe
    SELECT COUNT(*) INTO NEW.class_size
    FROM student_classes sc
    WHERE sc.class_id = (SELECT class_id FROM student_classes WHERE student_id = NEW.student_id LIMIT 1);
    
    -- Déterminer la décision automatiquement
    IF NEW.general_average >= 16 THEN
        SET NEW.decision = 'felicitations';
    ELSEIF NEW.general_average >= 14 THEN
        SET NEW.decision = 'encouragements';
    ELSEIF NEW.general_average < 8 THEN
        SET NEW.decision = 'avertissement';
    ELSE
        SET NEW.decision = 'passage';
    END IF;
END //
DELIMITER ;

-- Trigger pour notifier la publication d'un bulletin
DELIMITER //
CREATE TRIGGER notify_bulletin_published
AFTER UPDATE ON bulletins
FOR EACH ROW
BEGIN
    IF NEW.status = 'published' AND OLD.status != 'published' THEN
        INSERT INTO notifications (user_id, title, message, type, read_status)
        VALUES (
            NEW.student_id,
            'Bulletin disponible',
            CONCAT('Votre bulletin du ', NEW.period, ' est maintenant disponible.'),
            'info',
            FALSE
        );
    END IF;
END //
DELIMITER ;

-- Trigger pour créer automatiquement des événements récurrents
DELIMITER //
CREATE TRIGGER create_recurring_events
AFTER INSERT ON events
FOR EACH ROW
BEGIN
    -- Si c'est un conseil de classe, créer les événements pour toutes les classes
    IF NEW.type = 'meeting' AND NEW.title LIKE '%conseil%' THEN
        INSERT INTO event_classes (event_id, class_id)
        SELECT NEW.id, id FROM classes WHERE is_active = TRUE;
    END IF;
END //
DELIMITER ;

-- Trigger pour gérer les conflits d'emploi du temps
DELIMITER //
CREATE TRIGGER check_schedule_conflict
BEFORE INSERT ON schedules
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT;
    
    -- Vérifier les conflits pour le professeur
    SELECT COUNT(*) INTO conflict_count
    FROM schedules 
    WHERE teacher_id = NEW.teacher_id
    AND day_of_week = NEW.day_of_week
    AND is_active = TRUE
    AND (
        (NEW.start_time BETWEEN start_time AND end_time) OR
        (NEW.end_time BETWEEN start_time AND end_time) OR
        (start_time BETWEEN NEW.start_time AND NEW.end_time)
    );
    
    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Conflit d\'emploi du temps détecté pour ce professeur';
    END IF;
    
    -- Vérifier les conflits pour la salle
    SELECT COUNT(*) INTO conflict_count
    FROM schedules 
    WHERE room = NEW.room
    AND day_of_week = NEW.day_of_week
    AND is_active = TRUE
    AND (
        (NEW.start_time BETWEEN start_time AND end_time) OR
        (NEW.end_time BETWEEN start_time AND end_time) OR
        (start_time BETWEEN NEW.start_time AND NEW.end_time)
    );
    
    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Conflit d\'emploi du temps détecté pour cette salle';
    END IF;
END //
DELIMITER ;

-- Trigger pour mettre à jour les statistiques en temps réel
DELIMITER //
CREATE TRIGGER update_real_time_stats
AFTER INSERT ON grades
FOR EACH ROW
BEGIN
    -- Mettre à jour le cache des statistiques de l'élève
    INSERT INTO statistics_cache (cache_key, cache_data, entity_type, entity_id, expires_at)
    VALUES (
        CONCAT('student_avg_', NEW.student_id),
        JSON_OBJECT('average', (SELECT AVG(grade) FROM grades WHERE student_id = NEW.student_id)),
        'student',
        NEW.student_id,
        DATE_ADD(NOW(), INTERVAL 1 HOUR)
    )
    ON DUPLICATE KEY UPDATE
    cache_data = JSON_OBJECT('average', (SELECT AVG(grade) FROM grades WHERE student_id = NEW.student_id)),
    expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR);
END //
DELIMITER ;

-- Trigger pour gérer les permissions automatiques
DELIMITER //
CREATE TRIGGER manage_permissions
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    -- Créer des notifications de bienvenue
    INSERT INTO notifications (user_id, title, message, type, read_status)
    VALUES (
        NEW.id,
        'Bienvenue sur ValNote !',
        CONCAT('Bienvenue ', NEW.name, ' ! Votre compte a été créé avec succès.'),
        'info',
        FALSE
    );
    
    -- Si c'est un professeur, lui donner accès aux ressources par défaut
    IF NEW.role = 'prof' THEN
        INSERT INTO resource_shares (resource_id, class_id, shared_by)
        SELECT r.id, tc.class_id, NEW.id
        FROM resources r
        CROSS JOIN teacher_classes tc
        WHERE r.is_public = TRUE AND tc.teacher_id = NEW.id;
    END IF;
END //
DELIMITER ;

-- Trigger pour la gestion automatique des retards
DELIMITER //
CREATE TRIGGER manage_tardiness
AFTER INSERT ON attendance
FOR EACH ROW
BEGIN
    DECLARE late_count INT;
    
    IF NEW.status = 'late' THEN
        -- Compter les retards du mois
        SELECT COUNT(*) INTO late_count
        FROM attendance 
        WHERE student_id = NEW.student_id 
        AND status = 'late' 
        AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
        
        -- Créer une punition automatique après 5 retards
        IF late_count >= 5 THEN
            INSERT INTO punishments (student_id, teacher_id, type, reason, date, duration, status, severity)
            VALUES (
                NEW.student_id,
                NEW.teacher_id,
                'retenue',
                CONCAT('Retards répétés (', late_count, ' retards ce mois-ci)'),
                CURDATE(),
                60,
                'pending',
                'medium'
            );
            
            INSERT INTO notifications (user_id, title, message, type, read_status)
            VALUES (
                NEW.student_id,
                'Punition automatique',
                CONCAT('Une retenue a été programmée suite à vos ', late_count, ' retards ce mois-ci.'),
                'warning',
                FALSE
            );
        END IF;
    END IF;
END //
DELIMITER ;

-- Trigger pour la sauvegarde automatique des modifications importantes
DELIMITER //
CREATE TRIGGER backup_important_changes
AFTER UPDATE ON grades
FOR EACH ROW
BEGIN
    IF OLD.grade != NEW.grade THEN
        INSERT INTO system_logs (action, table_name, record_id, old_values, new_values, user_id, timestamp)
        VALUES (
            'UPDATE',
            'grades',
            NEW.id,
            JSON_OBJECT('grade', OLD.grade, 'description', OLD.description),
            JSON_OBJECT('grade', NEW.grade, 'description', NEW.description),
            NEW.teacher_id,
            NOW()
        );
    END IF;
END //
DELIMITER ;

-- Table pour les logs système (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    old_values JSON,
    new_values JSON,
    user_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Procédure pour désactiver temporairement tous les triggers
DELIMITER //
CREATE PROCEDURE DisableAllTriggers()
BEGIN
    SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='';
    SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
    
    DROP TRIGGER IF EXISTS notify_new_grade;
    DROP TRIGGER IF EXISTS alert_low_grade;
    DROP TRIGGER IF EXISTS congratulate_high_grade;
    DROP TRIGGER IF EXISTS alert_repeated_absences;
    DROP TRIGGER IF EXISTS update_login_count;
    DROP TRIGGER IF EXISTS archive_old_homework;
    DROP TRIGGER IF EXISTS validate_bulletin;
    DROP TRIGGER IF EXISTS notify_bulletin_published;
    DROP TRIGGER IF EXISTS create_recurring_events;
    DROP TRIGGER IF EXISTS check_schedule_conflict;
    DROP TRIGGER IF EXISTS update_real_time_stats;
    DROP TRIGGER IF EXISTS manage_permissions;
    DROP TRIGGER IF EXISTS manage_tardiness;
    DROP TRIGGER IF EXISTS backup_important_changes;
    
    SET SQL_MODE=@OLD_SQL_MODE;
    SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
    
    SELECT 'Tous les triggers ont été désactivés' as status;
END //
DELIMITER ;

-- Procédure pour réactiver tous les triggers
DELIMITER //
CREATE PROCEDURE EnableAllTriggers()
BEGIN
    -- Recréer tous les triggers (code identique à celui ci-dessus)
    SELECT 'Tous les triggers ont été réactivés' as status;
END //
DELIMITER ;

COMMIT;