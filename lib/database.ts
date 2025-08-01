@@ .. @@
 export interface Course {
   id: number
   class_id: number
   teacher_id: number
   subject: string
   date: string
   start_time: string
   end_time: string
   room: string
   status: "scheduled" | "cancelled" | "completed" | "in_progress"
   cancellation_reason?: string
   description?: string
   created_at: string
+  class?: Class
 }
 
 export interface Homework {
   id: number
   class_id: number
   teacher_id: number
   title: string
   description?: string
   subject: string
   due_date: string
   priority: "low" | "medium" | "high"
   attachments?: string[]
   status: "assigned" | "submitted" | "graded"
   created_at: string
+  class?: Class
 }
 
 export interface Grade {
   id: number
   student_id: number
   teacher_id: number
   class_id: number
   subject: string
   grade: number
   max_grade: number
   description?: string
   date: string
   type: "test" | "homework" | "participation" | "project"
   coefficient: number
   created_at: string
 }
@@ .. @@
   async getCoursesByTeacher(teacherId: number): Promise<Course[]> {
-    return this.courses.filter((c) => c.teacher_id === teacherId)
+    const teacherCourses = this.courses.filter((c) => c.teacher_id === teacherId)
+    return teacherCourses.map(course => ({
+      ...course,
+      class: this.classes.find(c => c.id === course.class_id)
+    }))
   }
 
   async createCourse(courseData: Omit<Course, "id" | "created_at">): Promise<Course> {
@@ .. @@
   async getHomeworkByTeacher(teacherId: number): Promise<Homework[]> {
-    return this.homework.filter((h) => h.teacher_id === teacherId)
+    const teacherHomework = this.homework.filter((h) => h.teacher_id === teacherId)
+    return teacherHomework.map(hw => ({
+      ...hw,
+      class: this.classes.find(c => c.id === hw.class_id)
+    }))
   }
 
   async createHomework(homeworkData: Omit<Homework, "id" | "created_at">): Promise<Homework> {
@@ .. @@
   async getGrades(): Promise<Grade[]> {
     return this.grades
   }
 
+  async getGradesByStudent(studentId: number): Promise<Grade[]> {
+    return this.grades.filter((g) => g.student_id === studentId)
+  }
+
+  async getGradesByTeacher(teacherId: number): Promise<Grade[]> {
+    return this.grades.filter((g) => g.teacher_id === teacherId)
+  }
+
   async createGrade(gradeData: Omit<Grade, "id" | "created_at">): Promise<Grade> {
@@ .. @@
   // Méthodes avancées pour les statistiques
   async getStudentStats(studentId: number) {
     const grades = await this.getGrades()
     const studentGrades = grades.filter((g) => g.student_id === studentId)
 
     const subjectAverages = [
       "Mathématiques",
       "Français",
       "Histoire-Géographie",
       "Anglais",
       "Espagnol",
       "Sciences de la Vie et de la Terre",
       "Physique-Chimie",
       "EPS",
       "Arts Plastiques",
       "Musique",
     ]
       .map((subject) => {
         const subjectGrades = studentGrades.filter((g) => g.subject === subject)
         const average =
           subjectGrades.length > 0 ? subjectGrades.reduce((sum, g) => sum + g.grade, 0) / subjectGrades.length : null
         return {
           subject,
           average: average ? Math.round(average * 100) / 100 : null,
           gradeCount: subjectGrades.length,
           color: this.getSubjectColor(subject),
         }
       })
       .filter((s) => s.average !== null)
 
     return {
       totalGrades: studentGrades.length,
       generalAverage:
         subjectAverages.length > 0
           ? Math.round((subjectAverages.reduce((sum, s) => sum + (s.average || 0), 0) / subjectAverages.length) * 100) /
             100
           : 0,
       subjectAverages,
       totalAbsences: this.attendance.filter((a) => a.student_id === studentId && a.status === "absent").length,
       unjustifiedAbsences: this.attendance.filter(
         (a) => a.student_id === studentId && a.status === "absent" && !a.notes,
       ).length,
     }
   }
+
+  // Nouvelles méthodes pour les statistiques avancées
+  async getClassStats(classId: number) {
+    const students = this.getStudentsByClass(classId)
+    const classGrades = this.grades.filter(g => g.class_id === classId)
+    const classAttendance = this.attendance.filter(a => a.class_id === classId)
+    
+    const averageGrade = classGrades.length > 0 
+      ? classGrades.reduce((sum, g) => sum + g.grade, 0) / classGrades.length 
+      : 0
+    
+    const attendanceRate = classAttendance.length > 0
+      ? (classAttendance.filter(a => a.status === 'present').length / classAttendance.length) * 100
+      : 100
+    
+    return {
+      studentCount: students.length,
+      averageGrade: Math.round(averageGrade * 100) / 100,
+      attendanceRate: Math.round(attendanceRate * 100) / 100,
+      totalGrades: classGrades.length,
+      totalAbsences: classAttendance.filter(a => a.status === 'absent').length
+    }
+  }
+
+  async getTeacherStats(teacherId: number) {
+    const teacherClasses = await this.getClassesByTeacher(teacherId)
+    const teacherGrades = this.grades.filter(g => g.teacher_id === teacherId)
+    const teacherCourses = this.courses.filter(c => c.teacher_id === teacherId)
+    
+    const totalStudents = teacherClasses.reduce((sum, classe) => {
+      return sum + this.getStudentsByClass(classe.id).length
+    }, 0)
+    
+    return {
+      classCount: teacherClasses.length,
+      studentCount: totalStudents,
+      totalGrades: teacherGrades.length,
+      totalCourses: teacherCourses.length,
+      averageGrade: teacherGrades.length > 0 
+        ? Math.round((teacherGrades.reduce((sum, g) => sum + g.grade, 0) / teacherGrades.length) * 100) / 100
+        : 0
+    }
+  }
 
   private getSubjectColor(subject: string): string {
@@ .. @@
   // Méthode pour générer un emploi du temps complet
   async generateFullSchedule(classId: number) {
     const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
     const times = ["08:00", "09:00", "10:15", "11:15", "13:30", "14:30", "15:45", "16:45"]
     const subjects = ["Mathématiques", "Français", "Histoire-Géo", "Anglais", "Sciences", "EPS", "Arts", "Musique"]
     const rooms = ["101", "102", "103", "104", "105", "Gymnase", "Labo", "Salle Arts"]
     const colors = [
       "bg-blue-500",
       "bg-red-500",
       "bg-green-500",
       "bg-yellow-500",
       "bg-purple-500",
       "bg-cyan-500",
       "bg-pink-500",
       "bg-indigo-500",
     ]
 
     const schedule = []
     for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
       for (let timeIndex = 0; timeIndex < times.length; timeIndex++) {
         if (Math.random() > 0.3) {
           // 70% de chance d'avoir un cours
           const subjectIndex = Math.floor(Math.random() * subjects.length)
           schedule.push({
             dayIndex,
             day: days[dayIndex],
             startTime: times[timeIndex],
             subject: subjects[subjectIndex],
             room: rooms[subjectIndex],
             color: colors[subjectIndex],
           })
         }
       }
     }
     return schedule
   }
+
+  // Nouvelles méthodes pour la messagerie
+  async createMessage(messageData: {
+    sender_id: number
+    recipient_id: number
+    subject: string
+    content: string
+    type: 'message' | 'announcement' | 'alert'
+  }) {
+    const messages = this.loadFromStorage('valnote_messages', [])
+    const newMessage = {
+      ...messageData,
+      id: Math.max(...messages.map((m: any) => m.id), 0) + 1,
+      read: false,
+      created_at: new Date().toISOString()
+    }
+    messages.push(newMessage)
+    this.saveToStorage('valnote_messages', messages)
+    return newMessage
+  }
+
+  async getMessagesByUser(userId: number) {
+    const messages = this.loadFromStorage('valnote_messages', [])
+    return messages.filter((m: any) => m.recipient_id === userId || m.sender_id === userId)
+  }
+
+  // Nouvelles méthodes pour les bulletins
+  async generateBulletin(studentId: number, period: string) {
+    const student = this.users.find(u => u.id === studentId)
+    const studentGrades = this.grades.filter(g => g.student_id === studentId)
+    const studentStats = await this.getStudentStats(studentId)
+    
+    return {
+      student,
+      period,
+      grades: studentGrades,
+      stats: studentStats,
+      generated_at: new Date().toISOString()
+    }
+  }
+
+  // Nouvelles méthodes pour les rapports
+  async generateClassReport(classId: number) {
+    const classe = this.classes.find(c => c.id === classId)
+    const students = this.getStudentsByClass(classId)
+    const classStats = await this.getClassStats(classId)
+    
+    return {
+      class: classe,
+      students,
+      stats: classStats,
+      generated_at: new Date().toISOString()
+    }
+  }
 }
 
 // Instance globale de la base de données
 export const db = new LocalDatabase()