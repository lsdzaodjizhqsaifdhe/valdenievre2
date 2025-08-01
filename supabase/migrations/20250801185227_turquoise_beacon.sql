-- Script d'optimisation des performances pour ValNote
-- Index, partitioning et optimisations avancées

USE valnote_db;

-- ============================================
-- OPTIMISATION DES INDEX
-- ============================================

-- Index composites pour les requêtes fréquentes
CREATE INDEX idx_grades_student_subject_date ON grades(student_id, subject, date DESC);
CREATE INDEX idx_attendance_student_date_status ON attendance(student_id, date DESC, status);
CREATE INDEX idx_courses_teacher_date ON courses(teacher_id, date, start_time);
CREATE INDEX idx_homework_class_due_date ON homework(class_id, due_date, status);
CREATE INDEX idx_messages_recipient_read ON messages(recipient_id, read_status, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_status, created_at DESC);

-- Index pour les recherches textuelles
CREATE FULLTEXT INDEX idx_messages_content ON messages(subject, content);
CREATE FULLTEXT INDEX idx_resources_search ON resources(title, description);
CREATE FULLTEXT INDEX idx_homework_search ON homework(title, description);

-- Index pour les statistiques
CREATE INDEX idx_connection_logs_user_time ON connection_logs(user_id, login_time DESC);
CREATE INDEX idx_bulletins_student_period ON bulletins(student_id, academic_year, period);
CREATE INDEX idx_student_skills_student_date ON student_skills(student_id, evaluation_date DESC);

-- ============================================
-- PARTITIONING DES GRANDES TABLES
-- ============================================

-- Partitioning de la table connection_logs par mois
ALTER TABLE connection_logs
PARTITION BY RANGE (YEAR(login_time) * 100 + MONTH(login_time)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    PARTITION p202404 VALUES LESS THAN (202405),
    PARTITION p202405 VALUES LESS THAN (202406),
    PARTITION p202406 VALUES LESS THAN (202407),
    PARTITION p202407 VALUES LESS THAN (202408),
    PARTITION p202408 VALUES LESS THAN (202409),
    PARTITION p202409 VALUES LESS THAN (202410),
    PARTITION p202410 VALUES LESS THAN (202411),
    PARTITION p202411 VALUES LESS THAN (202412),
    PARTITION p202412 VALUES LESS THAN (202501),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- ============================================
-- VUES MATÉRIALISÉES (SIMULÉES)
-- ============================================

-- Table pour stocker les statistiques précalculées
CREATE TABLE materialized_student_stats (
    student_id INT PRIMARY KEY,
    total_grades INT DEFAULT 0,
    general_average DECIMAL(4,2) DEFAULT 0,
    total_absences INT DEFAULT 0,
    unjustified_absences INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table pour les statistiques de classe
CREATE TABLE materialized_class_stats (
    class_id INT PRIMARY KEY,
    student_count INT DEFAULT 0,
    average_grade DECIMAL(4,2) DEFAULT 0,
    attendance_rate DECIMAL(5,2) DEFAULT 100,
    total_courses INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Procédure pour rafraîchir les statistiques des élèves
DELIMITER //
CREATE PROCEDURE RefreshStudentStats(IN target_student_id INT DEFAULT NULL)
BEGIN
    IF target_student_id IS NOT NULL THEN
        -- Rafraîchir pour un élève spécifique
        INSERT INTO materialized_student_stats (student_id, total_grades, general_average, total_absences, unjustified_absences)
        SELECT 
            u.id,
            COUNT(g.id),
            COALESCE(AVG(g.grade), 0),
            COUNT(CASE WHEN a.status = 'absent' THEN 1 END),
            COUNT(CASE WHEN a.status = 'absent' AND a.notes IS NULL THEN 1 END)
        FROM users u
        LEFT JOIN grades g ON u.id = g.student_id
        LEFT JOIN attendance a ON u.id = a.student_id
        WHERE u.id = target_student_id AND u.role = 'eleve'
        GROUP BY u.id
        ON DUPLICATE KEY UPDATE
            total_grades = VALUES(total_grades),
            general_average = VALUES(general_average),
            total_absences = VALUES(total_absences),
            unjustified_absences = VALUES(unjustified_absences),
            last_updated = CURRENT_TIMESTAMP;
    ELSE
        -- Rafraîchir pour tous les élèves
        INSERT INTO materialized_student_stats (student_id, total_grades, general_average, total_absences, unjustified_absences)
        SELECT 
            u.id,
            COUNT(g.id),
            COALESCE(AVG(g.grade), 0),
            COUNT(CASE WHEN a.status = 'absent' THEN 1 END),
            COUNT(CASE WHEN a.status = 'absent' AND a.notes IS NULL THEN 1 END)
        FROM users u
        LEFT JOIN grades g ON u.id = g.student_id
        LEFT JOIN attendance a ON u.id = a.student_id
        WHERE u.role = 'eleve'
        GROUP BY u.id
        ON DUPLICATE KEY UPDATE
            total_grades = VALUES(total_grades),
            general_average = VALUES(general_average),
            total_absences = VALUES(total_absences),
            unjustified_absences = VALUES(unjustified_absences),
            last_updated = CURRENT_TIMESTAMP;
    END IF;
END //
DELIMITER ;

-- Procédure pour rafraîchir les statistiques des classes
DELIMITER //
CREATE PROCEDURE RefreshClassStats(IN target_class_id INT DEFAULT NULL)
BEGIN
    IF target_class_id IS NOT NULL THEN
        INSERT INTO materialized_class_stats (class_id, student_count, average_grade, attendance_rate, total_courses)
        SELECT 
            c.id,
            COUNT(DISTINCT sc.student_id),
            COALESCE(AVG(g.grade), 0),
            COALESCE(
                (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0) / 
                NULLIF(COUNT(a.id), 0), 100
            ),
            COUNT(DISTINCT co.id)
        FROM classes c
        LEFT JOIN student_classes sc ON c.id = sc.class_id
        LEFT JOIN grades g ON c.id = g.class_id
        LEFT JOIN attendance a ON c.id = a.class_id
        LEFT JOIN courses co ON c.id = co.class_id
        WHERE c.id = target_class_id
        GROUP BY c.id
        ON DUPLICATE KEY UPDATE
            student_count = VALUES(student_count),
            average_grade = VALUES(average_grade),
            attendance_rate = VALUES(attendance_rate),
            total_courses = VALUES(total_courses),
            last_updated = CURRENT_TIMESTAMP;
    ELSE
        INSERT INTO materialized_class_stats (class_id, student_count, average_grade, attendance_rate, total_courses)
        SELECT 
            c.id,
            COUNT(DISTINCT sc.student_id),
            COALESCE(AVG(g.grade), 0),
            COALESCE(
                (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0) / 
                NULLIF(COUNT(a.id), 0), 100
            ),
            COUNT(DISTINCT co.id)
        FROM classes c
        LEFT JOIN student_classes sc ON c.id = sc.class_id
        LEFT JOIN grades g ON c.id = g.class_id
        LEFT JOIN attendance a ON c.id = a.class_id
        LEFT JOIN courses co ON c.id = co.class_id
        GROUP BY c.id
        ON DUPLICATE KEY UPDATE
            student_count = VALUES(student_count),
            average_grade = VALUES(average_grade),
            attendance_rate = VALUES(attendance_rate),
            total_courses = VALUES(total_courses),
            last_updated = CURRENT_TIMESTAMP;
    END IF;
END //
DELIMITER ;

-- ============================================
-- TRIGGERS POUR MAINTENIR LES STATS À JOUR
-- ============================================

-- Trigger pour mettre à jour les stats après insertion d'une note
DELIMITER //
CREATE TRIGGER update_stats_after_grade_insert
AFTER INSERT ON grades
FOR EACH ROW
BEGIN
    CALL RefreshStudentStats(NEW.student_id);
    CALL RefreshClassStats(NEW.class_id);
END //
DELIMITER ;

-- Trigger pour mettre à jour les stats après insertion d'une absence
DELIMITER //
CREATE TRIGGER update_stats_after_attendance_insert
AFTER INSERT ON attendance
FOR EACH ROW
BEGIN
    CALL RefreshStudentStats(NEW.student_id);
    CALL RefreshClassStats(NEW.class_id);
END //
DELIMITER ;

-- ============================================
-- PROCÉDURES D'OPTIMISATION
-- ============================================

-- Procédure pour analyser les performances des requêtes
DELIMITER //
CREATE PROCEDURE AnalyzeQueryPerformance()
BEGIN
    -- Activer le profiling
    SET profiling = 1;
    
    -- Requêtes de test
    SELECT COUNT(*) FROM grades WHERE student_id = 1;
    SELECT AVG(grade) FROM grades WHERE class_id = 1;
    SELECT COUNT(*) FROM attendance WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
    
    -- Afficher les résultats du profiling
    SHOW PROFILES;
    
    -- Désactiver le profiling
    SET profiling = 0;
END //
DELIMITER ;

-- Procédure pour optimiser automatiquement les tables
DELIMITER //
CREATE PROCEDURE AutoOptimizeTables()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name VARCHAR(255);
    DECLARE table_cursor CURSOR FOR 
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_TYPE = 'BASE TABLE';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN table_cursor;
    read_loop: LOOP
        FETCH table_cursor INTO table_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET @sql = CONCAT('OPTIMIZE TABLE ', table_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @sql = CONCAT('ANALYZE TABLE ', table_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END LOOP;
    CLOSE table_cursor;
    
    SELECT 'Optimisation automatique terminée' as status;
END //
DELIMITER ;

-- ============================================
-- CACHE DE REQUÊTES PERSONNALISÉ
-- ============================================

-- Table pour le cache de requêtes
CREATE TABLE query_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    cache_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    hit_count INT DEFAULT 0
);

-- Procédure pour gérer le cache
DELIMITER //
CREATE PROCEDURE GetCachedResult(
    IN cache_key VARCHAR(255),
    OUT cache_data JSON,
    OUT cache_hit BOOLEAN
)
BEGIN
    DECLARE cache_expires TIMESTAMP;
    
    SELECT cache_data, expires_at INTO cache_data, cache_expires
    FROM query_cache 
    WHERE cache_key = cache_key AND expires_at > NOW();
    
    IF cache_data IS NOT NULL THEN
        SET cache_hit = TRUE;
        UPDATE query_cache SET hit_count = hit_count + 1 WHERE cache_key = cache_key;
    ELSE
        SET cache_hit = FALSE;
    END IF;
END //
DELIMITER ;

-- Procédure pour mettre en cache un résultat
DELIMITER //
CREATE PROCEDURE SetCachedResult(
    IN cache_key VARCHAR(255),
    IN cache_data JSON,
    IN ttl_seconds INT DEFAULT 3600
)
BEGIN
    INSERT INTO query_cache (cache_key, cache_data, expires_at)
    VALUES (cache_key, cache_data, DATE_ADD(NOW(), INTERVAL ttl_seconds SECOND))
    ON DUPLICATE KEY UPDATE
        cache_data = VALUES(cache_data),
        expires_at = VALUES(expires_at),
        created_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- ============================================
-- MONITORING ET ALERTES
-- ============================================

-- Table pour les métriques de performance
CREATE TABLE performance_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metrics_name_time (metric_name, recorded_at)
);

-- Procédure pour enregistrer les métriques
DELIMITER //
CREATE PROCEDURE RecordMetric(
    IN metric_name VARCHAR(100),
    IN metric_value DECIMAL(10,2),
    IN metric_unit VARCHAR(20) DEFAULT NULL
)
BEGIN
    INSERT INTO performance_metrics (metric_name, metric_value, metric_unit)
    VALUES (metric_name, metric_value, metric_unit);
    
    -- Nettoyer les anciennes métriques (garder seulement 30 jours)
    DELETE FROM performance_metrics 
    WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
END //
DELIMITER ;

-- Procédure pour surveiller les performances
DELIMITER //
CREATE PROCEDURE MonitorPerformance()
BEGIN
    DECLARE slow_queries INT;
    DECLARE avg_query_time DECIMAL(10,2);
    DECLARE table_size_mb DECIMAL(10,2);
    
    -- Compter les requêtes lentes
    SELECT COUNT(*) INTO slow_queries
    FROM INFORMATION_SCHEMA.PROCESSLIST
    WHERE TIME > 5 AND COMMAND != 'Sleep';
    
    -- Calculer la taille totale des tables
    SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) INTO table_size_mb
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE();
    
    -- Enregistrer les métriques
    CALL RecordMetric('slow_queries', slow_queries, 'count');
    CALL RecordMetric('database_size', table_size_mb, 'MB');
    
    -- Alertes
    IF slow_queries > 10 THEN
        INSERT INTO notifications (user_id, title, message, type, read_status)
        SELECT 
            id,
            'Alerte Performance',
            CONCAT('Détection de ', slow_queries, ' requêtes lentes en cours'),
            'warning',
            FALSE
        FROM users WHERE role = 'admin';
    END IF;
    
    IF table_size_mb > 1000 THEN
        INSERT INTO notifications (user_id, title, message, type, read_status)
        SELECT 
            id,
            'Alerte Stockage',
            CONCAT('La base de données fait maintenant ', table_size_mb, ' MB'),
            'info',
            FALSE
        FROM users WHERE role = 'admin';
    END IF;
END //
DELIMITER ;

-- ============================================
-- ÉVÉNEMENTS PROGRAMMÉS
-- ============================================

-- Activer le scheduler d'événements
SET GLOBAL event_scheduler = ON;

-- Événement pour rafraîchir les statistiques toutes les heures
CREATE EVENT IF NOT EXISTS refresh_stats_hourly
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    CALL RefreshStudentStats();
    CALL RefreshClassStats();
END;

-- Événement pour nettoyer le cache expiré toutes les 6 heures
CREATE EVENT IF NOT EXISTS cleanup_cache
ON SCHEDULE EVERY 6 HOUR
DO
BEGIN
    DELETE FROM query_cache WHERE expires_at < NOW();
    DELETE FROM statistics_cache WHERE expires_at < NOW();
END;

-- Événement pour surveiller les performances quotidiennement
CREATE EVENT IF NOT EXISTS daily_performance_check
ON SCHEDULE EVERY 1 DAY
STARTS '2024-01-01 02:00:00'
DO
BEGIN
    CALL MonitorPerformance();
    CALL AutoOptimizeTables();
END;

-- Événement pour nettoyer les anciennes données chaque semaine
CREATE EVENT IF NOT EXISTS weekly_cleanup
ON SCHEDULE EVERY 1 WEEK
STARTS '2024-01-01 03:00:00'
DO
BEGIN
    CALL CleanOldData();
    CALL CleanOldBackups();
END;

-- ============================================
-- INITIALISATION
-- ============================================

-- Remplir les tables de statistiques matérialisées
CALL RefreshStudentStats();
CALL RefreshClassStats();

-- Enregistrer les métriques initiales
CALL MonitorPerformance();

SELECT 'Optimisation des performances terminée avec succès !' as status;

COMMIT;