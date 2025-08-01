-- Script SQL pour les rapports et analyses avancées de ValNote
-- Requêtes pour générer des statistiques et rapports détaillés

USE valnote_db;

-- Vue pour les statistiques par élève
CREATE OR REPLACE VIEW student_statistics AS
SELECT 
    u.id,
    u.name,
    u.username,
    c.name as class_name,
    COUNT(DISTINCT g.id) as total_grades,
    ROUND(AVG(g.grade), 2) as average_grade,
    COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.id END) as total_absences,
    COUNT(DISTINCT CASE WHEN a.status = 'absent' AND a.notes IS NULL THEN a.id END) as unjustified_absences,
    COUNT(DISTINCT h.id) as total_homework,
    COUNT(DISTINCT p.id) as total_punishments
FROM users u
LEFT JOIN student_classes sc ON u.id = sc.student_id
LEFT JOIN classes c ON sc.class_id = c.id
LEFT JOIN grades g ON u.id = g.student_id
LEFT JOIN attendance a ON u.id = a.student_id
LEFT JOIN homework h ON sc.class_id = h.class_id
LEFT JOIN punishments p ON u.id = p.student_id
WHERE u.role = 'eleve'
GROUP BY u.id, u.name, u.username, c.name;

-- Vue pour les statistiques par classe
CREATE OR REPLACE VIEW class_statistics AS
SELECT 
    c.id,
    c.name,
    c.level,
    c.subject,
    COUNT(DISTINCT sc.student_id) as student_count,
    COUNT(DISTINCT tc.teacher_id) as teacher_count,
    COUNT(DISTINCT g.id) as total_grades,
    ROUND(AVG(g.grade), 2) as class_average,
    COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.id END) as total_absences,
    ROUND(
        (COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0) / 
        NULLIF(COUNT(DISTINCT a.id), 0), 2
    ) as attendance_rate
FROM classes c
LEFT JOIN student_classes sc ON c.id = sc.class_id
LEFT JOIN teacher_classes tc ON c.id = tc.class_id
LEFT JOIN grades g ON c.id = g.class_id
LEFT JOIN attendance a ON c.id = a.class_id
GROUP BY c.id, c.name, c.level, c.subject;

-- Vue pour les statistiques par professeur
CREATE OR REPLACE VIEW teacher_statistics AS
SELECT 
    u.id,
    u.name,
    u.username,
    COUNT(DISTINCT tc.class_id) as classes_taught,
    COUNT(DISTINCT sc.student_id) as total_students,
    COUNT(DISTINCT g.id) as grades_given,
    ROUND(AVG(g.grade), 2) as average_grade_given,
    COUNT(DISTINCT co.id) as courses_scheduled,
    COUNT(DISTINCT CASE WHEN co.status = 'cancelled' THEN co.id END) as courses_cancelled
FROM users u
LEFT JOIN teacher_classes tc ON u.id = tc.teacher_id
LEFT JOIN student_classes sc ON tc.class_id = sc.class_id
LEFT JOIN grades g ON u.id = g.teacher_id
LEFT JOIN courses co ON u.id = co.teacher_id
WHERE u.role = 'prof'
GROUP BY u.id, u.name, u.username;

-- Procédure stockée pour générer un rapport de classe détaillé
DELIMITER //
CREATE PROCEDURE GenerateClassReport(IN class_id INT)
BEGIN
    DECLARE class_name VARCHAR(50);
    DECLARE class_level VARCHAR(20);
    
    -- Récupérer les informations de base de la classe
    SELECT name, level INTO class_name, class_level 
    FROM classes WHERE id = class_id;
    
    -- Informations générales de la classe
    SELECT 
        class_name as 'Classe',
        class_level as 'Niveau',
        COUNT(DISTINCT sc.student_id) as 'Nombre d\'élèves',
        COUNT(DISTINCT tc.teacher_id) as 'Nombre de professeurs'
    FROM classes c
    LEFT JOIN student_classes sc ON c.id = sc.class_id
    LEFT JOIN teacher_classes tc ON c.id = tc.class_id
    WHERE c.id = class_id;
    
    -- Liste des élèves avec leurs moyennes
    SELECT 
        u.name as 'Élève',
        COUNT(g.id) as 'Nombre de notes',
        ROUND(AVG(g.grade), 2) as 'Moyenne générale',
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as 'Absences'
    FROM users u
    JOIN student_classes sc ON u.id = sc.student_id
    LEFT JOIN grades g ON u.id = g.student_id AND g.class_id = class_id
    LEFT JOIN attendance a ON u.id = a.student_id AND a.class_id = class_id
    WHERE sc.class_id = class_id
    GROUP BY u.id, u.name
    ORDER BY AVG(g.grade) DESC;
    
    -- Statistiques par matière
    SELECT 
        g.subject as 'Matière',
        COUNT(g.id) as 'Nombre de notes',
        ROUND(AVG(g.grade), 2) as 'Moyenne de classe',
        ROUND(MIN(g.grade), 2) as 'Note minimale',
        ROUND(MAX(g.grade), 2) as 'Note maximale'
    FROM grades g
    WHERE g.class_id = class_id
    GROUP BY g.subject
    ORDER BY AVG(g.grade) DESC;
    
END //
DELIMITER ;

-- Procédure pour générer un bulletin individuel
DELIMITER //
CREATE PROCEDURE GenerateBulletin(IN student_id INT, IN period_name VARCHAR(50))
BEGIN
    DECLARE student_name VARCHAR(100);
    DECLARE class_name VARCHAR(50);
    
    -- Récupérer les informations de l'élève
    SELECT u.name, c.name INTO student_name, class_name
    FROM users u
    JOIN student_classes sc ON u.id = sc.student_id
    JOIN classes c ON sc.class_id = c.id
    WHERE u.id = student_id
    LIMIT 1;
    
    -- En-tête du bulletin
    SELECT 
        student_name as 'Élève',
        class_name as 'Classe',
        period_name as 'Période',
        CURDATE() as 'Date d\'édition';
    
    -- Notes par matière
    SELECT 
        g.subject as 'Matière',
        COUNT(g.id) as 'Nb notes',
        ROUND(AVG(g.grade), 2) as 'Moyenne',
        ROUND(MIN(g.grade), 2) as 'Min',
        ROUND(MAX(g.grade), 2) as 'Max',
        GROUP_CONCAT(CONCAT(g.grade, '/20 (', g.description, ')') SEPARATOR '; ') as 'Détail des notes'
    FROM grades g
    WHERE g.student_id = student_id
    GROUP BY g.subject
    ORDER BY g.subject;
    
    -- Moyenne générale
    SELECT 
        COUNT(g.id) as 'Total des notes',
        ROUND(AVG(g.grade), 2) as 'Moyenne générale'
    FROM grades g
    WHERE g.student_id = student_id;
    
    -- Absences et retards
    SELECT 
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as 'Absences',
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as 'Retards',
        COUNT(CASE WHEN a.status = 'absent' AND a.notes IS NULL THEN 1 END) as 'Absences non justifiées'
    FROM attendance a
    WHERE a.student_id = student_id;
    
END //
DELIMITER ;

-- Fonction pour calculer le rang d'un élève dans sa classe
DELIMITER //
CREATE FUNCTION GetStudentRank(student_id INT, class_id INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE student_avg DECIMAL(4,2);
    DECLARE student_rank INT;
    
    -- Calculer la moyenne de l'élève
    SELECT AVG(grade) INTO student_avg
    FROM grades 
    WHERE student_id = student_id AND class_id = class_id;
    
    -- Calculer le rang
    SELECT COUNT(*) + 1 INTO student_rank
    FROM (
        SELECT AVG(g.grade) as avg_grade
        FROM grades g
        JOIN student_classes sc ON g.student_id = sc.student_id
        WHERE sc.class_id = class_id
        GROUP BY g.student_id
        HAVING avg_grade > student_avg
    ) as better_students;
    
    RETURN student_rank;
END //
DELIMITER ;

-- Vue pour le tableau de bord administrateur
CREATE OR REPLACE VIEW admin_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'eleve') as total_students,
    (SELECT COUNT(*) FROM users WHERE role = 'prof') as total_teachers,
    (SELECT COUNT(*) FROM classes) as total_classes,
    (SELECT COUNT(*) FROM courses WHERE date >= CURDATE()) as upcoming_courses,
    (SELECT COUNT(*) FROM grades WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as recent_grades,
    (SELECT COUNT(*) FROM attendance WHERE date >= CURDATE() AND status = 'absent') as today_absences,
    (SELECT COUNT(*) FROM punishments WHERE status = 'pending') as pending_punishments,
    (SELECT COUNT(*) FROM messages WHERE read_status = FALSE) as unread_messages;

-- Requête pour les élèves en difficulté (moyenne < 10)
CREATE OR REPLACE VIEW students_at_risk AS
SELECT 
    u.name as student_name,
    c.name as class_name,
    ROUND(AVG(g.grade), 2) as average_grade,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absences,
    COUNT(p.id) as punishments
FROM users u
JOIN student_classes sc ON u.id = sc.student_id
JOIN classes c ON sc.class_id = c.id
LEFT JOIN grades g ON u.id = g.student_id
LEFT JOIN attendance a ON u.id = a.student_id
LEFT JOIN punishments p ON u.id = p.student_id
WHERE u.role = 'eleve'
GROUP BY u.id, u.name, c.name
HAVING average_grade < 10 OR absences > 5 OR punishments > 0
ORDER BY average_grade ASC;

-- Requête pour l'évolution des notes par mois
CREATE OR REPLACE VIEW grade_evolution AS
SELECT 
    DATE_FORMAT(g.date, '%Y-%m') as month,
    g.subject,
    COUNT(g.id) as grade_count,
    ROUND(AVG(g.grade), 2) as average_grade,
    ROUND(MIN(g.grade), 2) as min_grade,
    ROUND(MAX(g.grade), 2) as max_grade
FROM grades g
WHERE g.date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(g.date, '%Y-%m'), g.subject
ORDER BY month DESC, subject;

-- Requête pour les statistiques d'assiduité par classe
CREATE OR REPLACE VIEW attendance_by_class AS
SELECT 
    c.name as class_name,
    COUNT(a.id) as total_records,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
    ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(a.id), 0), 2
    ) as attendance_rate
FROM classes c
LEFT JOIN attendance a ON c.id = a.class_id
WHERE a.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY c.id, c.name
ORDER BY attendance_rate DESC;

-- Procédure pour nettoyer les anciennes données
DELIMITER //
CREATE PROCEDURE CleanOldData()
BEGIN
    -- Supprimer les logs de connexion de plus de 6 mois
    DELETE FROM connection_logs 
    WHERE login_time < DATE_SUB(CURDATE(), INTERVAL 6 MONTH);
    
    -- Supprimer les notifications lues de plus de 3 mois
    DELETE FROM notifications 
    WHERE read_status = TRUE 
    AND created_at < DATE_SUB(CURDATE(), INTERVAL 3 MONTH);
    
    -- Supprimer les messages de plus d'un an
    DELETE FROM messages 
    WHERE created_at < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);
    
    -- Nettoyer le cache des statistiques expiré
    DELETE FROM statistics_cache 
    WHERE expires_at < NOW();
    
    SELECT 'Nettoyage terminé' as status;
END //
DELIMITER ;

-- Trigger pour mettre à jour automatiquement les statistiques
DELIMITER //
CREATE TRIGGER update_stats_after_grade
AFTER INSERT ON grades
FOR EACH ROW
BEGIN
    -- Invalider le cache des statistiques pour cet élève
    DELETE FROM statistics_cache 
    WHERE entity_type = 'student' AND entity_id = NEW.student_id;
    
    -- Invalider le cache des statistiques pour cette classe
    DELETE FROM statistics_cache 
    WHERE entity_type = 'class' AND entity_id = NEW.class_id;
END //
DELIMITER ;

-- Requête pour identifier les cours les plus populaires
CREATE OR REPLACE VIEW popular_subjects AS
SELECT 
    subject,
    COUNT(DISTINCT student_id) as student_count,
    COUNT(id) as grade_count,
    ROUND(AVG(grade), 2) as average_grade,
    COUNT(DISTINCT teacher_id) as teacher_count
FROM grades
GROUP BY subject
ORDER BY student_count DESC, average_grade DESC;

-- Requête pour les professeurs les plus actifs
CREATE OR REPLACE VIEW active_teachers AS
SELECT 
    u.name as teacher_name,
    COUNT(DISTINCT g.id) as grades_given,
    COUNT(DISTINCT co.id) as courses_taught,
    COUNT(DISTINCT h.id) as homework_assigned,
    COUNT(DISTINCT tc.class_id) as classes_managed
FROM users u
LEFT JOIN grades g ON u.id = g.teacher_id
LEFT JOIN courses co ON u.id = co.teacher_id
LEFT JOIN homework h ON u.id = h.teacher_id
LEFT JOIN teacher_classes tc ON u.id = tc.teacher_id
WHERE u.role = 'prof'
GROUP BY u.id, u.name
ORDER BY (grades_given + courses_taught + homework_assigned) DESC;

COMMIT;