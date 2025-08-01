// Base de données locale simulée pour ValNote avec nouvelles fonctionnalités
export interface User {
  id: number
  username: string
  password: string
  role: "admin" | "prof" | "eleve"
  name: string
  email?: string
  avatar?: string
  phone?: string
  address?: string
  birth_date?: string
  created_at: string
  last_login?: string
  login_count: number
  preferences?: {
    theme: "light" | "dark"
    notifications: boolean
    language: string
  }
}

export interface Class {
  id: number
  name: string
  level: string
  teacher_ids: number[]
  subject: string
  room: string
  color: string // Nouvelle propriété pour la couleur de la classe
  description?: string
  max_students?: number
  created_at: string
}

export interface Attendance {
  id: number
  class_id: number
  student_id: number
  course_id: number
  date: string
  status: "present" | "absent" | "late" | "excused"
  teacher_id: number
  notes?: string
  created_at: string
}

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

export interface Punishment {
  id: number
  student_id: number
  teacher_id: number
  type: "retenue" | "colle" | "exclusion" | "avertissement"
  reason: string
  date: string
  duration?: number
  room?: string
  status: "pending" | "completed" | "cancelled"
  severity: "low" | "medium" | "high"
  created_at: string
}

export interface ConnectionLog {
  id: number
  user_id: number
  username: string
  role: string
  login_time: string
  logout_time?: string
  ip_address: string
  user_agent: string
  success: boolean
  session_duration?: number
}

// Nouvelle interface pour les notifications
export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at: string
  action_url?: string
}

// Nouvelle interface pour les événements
export interface Event {
  id: number
  title: string
  description?: string
  date: string
  start_time: string
  end_time: string
  type: "exam" | "meeting" | "holiday" | "event"
  class_ids?: number[]
  created_by: number
  created_at: string
}

// Couleurs prédéfinies pour les classes
const CLASS_COLORS = [
  "#667eea", // Violet-bleu
  "#f093fb", // Rose-violet
  "#4facfe", // Bleu clair
  "#43e97b", // Vert
  "#fa709a", // Rose-orange
  "#a8edea", // Turquoise
  "#ffecd2", // Pêche
  "#fcb69f", // Orange doux
  "#667eea", // Violet (répétition pour plus de classes)
  "#764ba2", // Violet foncé
]

// Base de données initiale avec plus d'utilisateurs et de données
const initialUsers: User[] = [
  {
    id: 1,
    username: "Wayzzedev",
    password: "Admin2024!Secure",
    role: "admin",
    name: "Wayze Dev",
    email: "wayze@valnote.fr",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "06 12 34 56 78",
    created_at: "2024-01-01T00:00:00Z",
    login_count: 0,
    preferences: {
      theme: "light",
      notifications: true,
      language: "fr",
    },
  },
  {
    id: 2,
    username: "zerkaidev",
    password: "ZerkAi2024!Admin",
    role: "admin",
    name: "Zerkai Dev",
    email: "zerkai@valnote.fr",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "06 98 76 54 32",
    created_at: "2024-01-01T00:00:00Z",
    login_count: 0,
    preferences: {
      theme: "dark",
      notifications: true,
      language: "fr",
    },
  },
  {
    id: 3,
    username: "prof.martin",
    password: "Prof123!",
    role: "prof",
    name: "M. Martin",
    email: "martin@valnote.fr",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "06 11 22 33 44",
    address: "123 Rue de l'École, 75001 Paris",
    birth_date: "1980-05-15",
    created_at: "2024-01-01T00:00:00Z",
    login_count: 0,
    preferences: {
      theme: "light",
      notifications: true,
      language: "fr",
    },
  },
  {
    id: 4,
    username: "prof.dubois",
    password: "Prof456!",
    role: "prof",
    name: "Mme Dubois",
    email: "dubois@valnote.fr",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "06 55 66 77 88",
    address: "456 Avenue des Professeurs, 75002 Paris",
    birth_date: "1975-09-22",
    created_at: "2024-01-01T00:00:00Z",
    login_count: 0,
    preferences: {
      theme: "light",
      notifications: true,
      language: "fr",
    },
  },
  {
    id: 5,
    username: "prof.bernard",
    password: "Prof789!",
    role: "prof",
    name: "M. Bernard",
    email: "bernard@valnote.fr",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "06 99 88 77 66",
    address: "789 Boulevard de l'Éducation, 75003 Paris",
    birth_date: "1982-03-10",
    created_at: "2024-01-01T00:00:00Z",
    login_count: 0,
    preferences: {
      theme: "dark",
      notifications: true,
      language: "fr",
    },
  },
  {
    id: 6,
    username: "eleve.dupont",
    password: "Eleve123!",
    role: "eleve",
    name: "Jean Dupont",
    email: "jean.dupont@valnote.fr",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "06 12 34 56 78",
    address: "12 Rue des Élèves, 75004 Paris",
    birth_date: "2008-06-15",
    created_at: "2024-01-01T00:00:00Z",
    login_count: 0,
    preferences: {
      theme: "light",
      notifications: true,
      language: "fr",
    },
  },
  {
    id: 7,
    username: "eleve.martin",
    password: "Eleve456!",
    role: "eleve",
    name: "Marie Martin",
    email: "marie.martin@valnote.fr",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "06 23 45 67 89",
    address: "34 Avenue des Étudiants, 75005 Paris",
    birth_date: "2008-08-22",
    created_at: "2024-01-01T00:00:00Z",
    login_count: 0,
    preferences: {
      theme: "light",
      notifications: true,
      language: "fr",
    },
  },
  {
    id: 8,
    username: "eleve.durand",
    password: "Eleve789!",
    role: "eleve",
    name: "Pierre Durand",
    email: "pierre.durand@valnote.fr",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "06 34 56 78 90",
    address: "56 Rue de la Jeunesse, 75006 Paris",
    birth_date: "2008-04-10",
    created_at: "2024-01-01T00:00:00Z",
    login_count: 0,
    preferences: {
      theme: "dark",
      notifications: true,
      language: "fr",
    },
  },
  {
    id: 9,
    username: "eleve.moreau",
    password: "Eleve101!",
    role: "eleve",
    name: "Sophie Moreau",
    email: "sophie.moreau@valnote.fr",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "06 45 67 89 01",
    address: "78 Boulevard de l'Avenir, 75007 Paris",
    birth_date: "2008-11-05",
    created_at: "2024-01-01T00:00:00Z",
    login_count: 0,
    preferences: {
      theme: "light",
      notifications: true,
      language: "fr",
    },
  },
  {
    id: 10,
    username: "eleve.petit",
    password: "Eleve202!",
    role: "eleve",
    name: "Lucas Petit",
    email: "lucas.petit@valnote.fr",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "06 56 78 90 12",
    address: "90 Place de l'École, 75008 Paris",
    birth_date: "2008-01-18",
    created_at: "2024-01-01T00:00:00Z",
    login_count: 0,
    preferences: {
      theme: "light",
      notifications: true,
      language: "fr",
    },
  },
  {
    id: 11,
    username: "test",
    password: "test",
    role: "admin",
    name: "Test Admin",
    email: "test@valnote.fr",
    avatar: "/placeholder.svg?height=40&width=40",
    created_at: "2024-01-01T00:00:00Z",
    login_count: 0,
    preferences: {
      theme: "light",
      notifications: true,
      language: "fr",
    },
  },
]

// Classes avec couleurs
const initialClasses: Class[] = [
  {
    id: 1,
    name: "6ème A",
    level: "6ème",
    teacher_ids: [3, 4],
    subject: "Mathématiques",
    room: "207",
    color: CLASS_COLORS[0],
    description: "Classe de mathématiques niveau 6ème avec M. Martin et Mme Dubois",
    max_students: 25,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "6ème B",
    level: "6ème",
    teacher_ids: [4, 5],
    subject: "Français",
    room: "105",
    color: CLASS_COLORS[1],
    description: "Classe de français niveau 6ème avec Mme Dubois et M. Bernard",
    max_students: 24,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "5ème C",
    level: "5ème",
    teacher_ids: [3],
    subject: "Mathématiques",
    room: "207",
    color: CLASS_COLORS[2],
    description: "Classe de mathématiques niveau 5ème avec M. Martin",
    max_students: 26,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    name: "4ème D",
    level: "4ème",
    teacher_ids: [5, 3],
    subject: "Histoire-Géographie",
    room: "206",
    color: CLASS_COLORS[3],
    description: "Classe d'histoire-géographie niveau 4ème avec M. Bernard et M. Martin",
    max_students: 23,
    created_at: "2024-01-01T00:00:00Z",
  },
]

// Données initiales étendues
const initialAttendance: Attendance[] = [
  {
    id: 1,
    class_id: 1,
    student_id: 6,
    course_id: 1,
    date: new Date().toISOString().split("T")[0],
    status: "present",
    teacher_id: 3,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    class_id: 1,
    student_id: 7,
    course_id: 1,
    date: new Date().toISOString().split("T")[0],
    status: "absent",
    teacher_id: 3,
    notes: "Maladie",
    created_at: "2024-01-01T00:00:00Z",
  },
]

const initialCourses: Course[] = [
  {
    id: 1,
    class_id: 1,
    teacher_id: 3,
    subject: "Mathématiques",
    date: new Date().toISOString().split("T")[0],
    start_time: "08:00",
    end_time: "09:00",
    room: "207",
    status: "scheduled",
    description: "Cours sur les fractions",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    class_id: 1,
    teacher_id: 3,
    subject: "Mathématiques",
    date: new Date().toISOString().split("T")[0],
    start_time: "10:00",
    end_time: "11:00",
    room: "207",
    status: "scheduled",
    description: "Exercices pratiques",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    class_id: 2,
    teacher_id: 4,
    subject: "Français",
    date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "10:00",
    room: "105",
    status: "scheduled",
    description: "Étude de texte",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    class_id: 3,
    teacher_id: 3,
    subject: "Mathématiques",
    date: new Date().toISOString().split("T")[0],
    start_time: "14:00",
    end_time: "15:00",
    room: "207",
    status: "scheduled",
    description: "Géométrie",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    class_id: 1,
    teacher_id: 3,
    subject: "Mathématiques",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    start_time: "08:00",
    end_time: "09:00",
    room: "207",
    status: "cancelled",
    cancellation_reason: "Professeur absent",
    created_at: "2024-01-01T00:00:00Z",
  },
]

const initialHomework: Homework[] = [
  {
    id: 1,
    class_id: 1,
    teacher_id: 3,
    title: "Exercices page 27",
    description: "Faire les exercices n°2 à 8 page 27",
    subject: "Mathématiques",
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    priority: "medium",
    status: "assigned",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    class_id: 2,
    teacher_id: 4,
    title: "Rédaction",
    description: "Rédiger un texte de 300 mots sur les vacances",
    subject: "Français",
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    priority: "high",
    status: "assigned",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    class_id: 3,
    teacher_id: 3,
    title: "DM Équations",
    description: "Devoir maison sur les équations du premier degré",
    subject: "Mathématiques",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    priority: "high",
    status: "assigned",
    created_at: "2024-01-01T00:00:00Z",
  },
]

const initialGrades: Grade[] = [
  {
    id: 1,
    student_id: 6,
    teacher_id: 3,
    class_id: 1,
    subject: "Mathématiques",
    grade: 14.5,
    max_grade: 20,
    description: "Contrôle fractions",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    type: "test",
    coefficient: 2,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    student_id: 7,
    teacher_id: 3,
    class_id: 1,
    subject: "Mathématiques",
    grade: 16.0,
    max_grade: 20,
    description: "Contrôle fractions",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    type: "test",
    coefficient: 2,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    student_id: 8,
    teacher_id: 3,
    class_id: 1,
    subject: "Mathématiques",
    grade: 12.0,
    max_grade: 20,
    description: "Contrôle fractions",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    type: "test",
    coefficient: 2,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    student_id: 9,
    teacher_id: 4,
    class_id: 2,
    subject: "Français",
    grade: 15.5,
    max_grade: 20,
    description: "Dictée",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    type: "test",
    coefficient: 1,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    student_id: 10,
    teacher_id: 4,
    class_id: 2,
    subject: "Français",
    grade: 13.0,
    max_grade: 20,
    description: "Dictée",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    type: "test",
    coefficient: 1,
    created_at: "2024-01-01T00:00:00Z",
  },
]

const initialPunishments: Punishment[] = [
  {
    id: 1,
    student_id: 8,
    teacher_id: 3,
    type: "retenue",
    reason: "Bavardage répété en cours",
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    duration: 60,
    room: "Vie scolaire",
    status: "pending",
    severity: "medium",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    student_id: 10,
    teacher_id: 4,
    type: "colle",
    reason: "Devoir non fait",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    duration: 120,
    room: "105",
    status: "pending",
    severity: "low",
    created_at: "2024-01-01T00:00:00Z",
  },
]

// Nouvelles données pour les notifications
const initialNotifications: Notification[] = [
  {
    id: 1,
    user_id: 6,
    title: "Nouveau devoir",
    message: "Un nouveau devoir de mathématiques a été assigné",
    type: "info",
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 7,
    title: "Note disponible",
    message: "Votre note de français est disponible",
    type: "success",
    read: false,
    created_at: new Date().toISOString(),
  },
]

// Nouvelles données pour les événements
const initialEvents: Event[] = [
  {
    id: 1,
    title: "Réunion parents-professeurs",
    description: "Rencontre avec les parents d'élèves",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    start_time: "18:00",
    end_time: "20:00",
    type: "meeting",
    created_by: 1,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    title: "Contrôle de mathématiques",
    description: "Évaluation sur les fractions",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    start_time: "08:00",
    end_time: "09:00",
    type: "exam",
    class_ids: [1],
    created_by: 3,
    created_at: "2024-01-01T00:00:00Z",
  },
]

// Liaison élèves-classes
const studentsClasses = [
  { student_id: 6, class_id: 1 },
  { student_id: 7, class_id: 1 },
  { student_id: 8, class_id: 1 },
  { student_id: 9, class_id: 2 },
  { student_id: 10, class_id: 2 },
  { student_id: 6, class_id: 3 },
  { student_id: 7, class_id: 3 },
]

// Classe de base de données locale étendue
class LocalDatabase {
  private users: User[] = []
  private classes: Class[] = []
  private courses: Course[] = []
  private homework: Homework[] = []
  private grades: Grade[] = []
  private punishments: Punishment[] = []
  private connectionLogs: ConnectionLog[] = []
  private attendance: Attendance[] = []
  private notifications: Notification[] = []
  private events: Event[] = []

  constructor() {
    this.initializeData()
  }

  private initializeData() {
    this.users = this.loadFromStorage("valnote_users", initialUsers)
    this.classes = this.loadFromStorage("valnote_classes", initialClasses)
    this.courses = this.loadFromStorage("valnote_courses", initialCourses)
    this.homework = this.loadFromStorage("valnote_homework", initialHomework)
    this.grades = this.loadFromStorage("valnote_grades", initialGrades)
    this.punishments = this.loadFromStorage("valnote_punishments", initialPunishments)
    this.connectionLogs = this.loadFromStorage("valnote_logs", [])
    this.attendance = this.loadFromStorage("valnote_attendance", initialAttendance)
    this.notifications = this.loadFromStorage("valnote_notifications", initialNotifications)
    this.events = this.loadFromStorage("valnote_events", initialEvents)

    console.log("✅ Base de données locale initialisée avec nouvelles fonctionnalités")
    console.log(`📊 ${this.users.length} utilisateurs, ${this.classes.length} classes, ${this.courses.length} cours`)
    console.log(`🔔 ${this.notifications.length} notifications, ${this.events.length} événements`)
  }

  private loadFromStorage<T>(key: string, defaultValue: T[]): T[] {
    if (typeof window === "undefined") return defaultValue
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  }

  private saveToStorage<T>(key: string, data: T[]) {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error("Erreur sauvegarde:", error)
    }
  }

  // Méthodes existantes (authentification, utilisateurs, etc.)
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = this.users.find((u) => u.username === username && u.password === password)
    if (user) {
      user.last_login = new Date().toISOString()
      user.login_count = (user.login_count || 0) + 1

      this.connectionLogs.push({
        id: this.connectionLogs.length + 1,
        user_id: user.id,
        username: user.username,
        role: user.role,
        login_time: new Date().toISOString(),
        ip_address: "127.0.0.1",
        user_agent: navigator.userAgent,
        success: true,
      })

      this.saveToStorage("valnote_users", this.users)
      this.saveToStorage("valnote_logs", this.connectionLogs)
    }
    return user
  }

  async getUsers(): Promise<User[]> {
    return this.users
  }

  async createUser(userData: Omit<User, "id" | "created_at" | "login_count">): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Math.max(...this.users.map((u) => u.id), 0) + 1,
      created_at: new Date().toISOString(),
      login_count: 0,
    }
    this.users.push(newUser)
    this.saveToStorage("valnote_users", this.users)
    return newUser
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex((u) => u.id === userId)
    if (index > -1) {
      this.users[index] = { ...this.users[index], ...updates }
      this.saveToStorage("valnote_users", this.users)
      return this.users[index]
    }
    return null
  }

  async deleteUser(userId: number): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === userId)
    if (index > -1) {
      this.users.splice(index, 1)
      this.saveToStorage("valnote_users", this.users)
      return true
    }
    return false
  }

  // Méthodes pour les classes
  async getClasses(): Promise<Class[]> {
    return this.classes
  }

  async getClassesByTeacher(teacherId: number): Promise<Class[]> {
    return this.classes.filter((c) => c.teacher_ids.includes(teacherId))
  }

  async createClass(classData: Omit<Class, "id" | "created_at"> & { teacher_ids: number[] }): Promise<Class> {
    const newClass: Class = {
      ...classData,
      id: Math.max(...this.classes.map((c) => c.id), 0) + 1,
      color: CLASS_COLORS[this.classes.length % CLASS_COLORS.length],
      created_at: new Date().toISOString(),
    }
    this.classes.push(newClass)
    this.saveToStorage("valnote_classes", this.classes)
    return newClass
  }

  async updateClass(classId: number, updates: Partial<Class>): Promise<Class | null> {
    const index = this.classes.findIndex((c) => c.id === classId)
    if (index > -1) {
      this.classes[index] = { ...this.classes[index], ...updates }
      this.saveToStorage("valnote_classes", this.classes)
      return this.classes[index]
    }
    return null
  }

  async deleteClass(classId: number): Promise<boolean> {
    const index = this.classes.findIndex((c) => c.id === classId)
    if (index > -1) {
      this.classes.splice(index, 1)
      this.saveToStorage("valnote_classes", this.classes)
      return true
    }
    return false
  }

  // Méthodes pour les cours
  async getCourses(): Promise<Course[]> {
    return this.courses
  }

  async getCoursesByTeacher(teacherId: number): Promise<Course[]> {
    return this.courses.filter((c) => c.teacher_id === teacherId)
  }

  async createCourse(courseData: Omit<Course, "id" | "created_at">): Promise<Course> {
    const newCourse: Course = {
      ...courseData,
      id: Math.max(...this.courses.map((c) => c.id), 0) + 1,
      created_at: new Date().toISOString(),
    }
    this.courses.push(newCourse)
    this.saveToStorage("valnote_courses", this.courses)
    return newCourse
  }

  async updateCourse(courseId: number, updates: Partial<Course>): Promise<Course | null> {
    const index = this.courses.findIndex((c) => c.id === courseId)
    if (index > -1) {
      this.courses[index] = { ...this.courses[index], ...updates }
      this.saveToStorage("valnote_courses", this.courses)
      return this.courses[index]
    }
    return null
  }

  async deleteCourse(courseId: number): Promise<boolean> {
    const index = this.courses.findIndex((c) => c.id === courseId)
    if (index > -1) {
      this.courses.splice(index, 1)
      this.saveToStorage("valnote_courses", this.courses)
      return true
    }
    return false
  }

  // Méthodes pour les devoirs
  async getHomework(): Promise<Homework[]> {
    return this.homework
  }

  async getHomeworkByTeacher(teacherId: number): Promise<Homework[]> {
    return this.homework.filter((h) => h.teacher_id === teacherId)
  }

  async createHomework(homeworkData: Omit<Homework, "id" | "created_at">): Promise<Homework> {
    const newHomework: Homework = {
      ...homeworkData,
      id: Math.max(...this.homework.map((h) => h.id), 0) + 1,
      created_at: new Date().toISOString(),
    }
    this.homework.push(newHomework)
    this.saveToStorage("valnote_homework", this.homework)
    return newHomework
  }

  async updateHomework(homeworkId: number, updates: Partial<Homework>): Promise<Homework | null> {
    const index = this.homework.findIndex((h) => h.id === homeworkId)
    if (index > -1) {
      this.homework[index] = { ...this.homework[index], ...updates }
      this.saveToStorage("valnote_homework", this.homework)
      return this.homework[index]
    }
    return null
  }

  async deleteHomework(homeworkId: number): Promise<boolean> {
    const index = this.homework.findIndex((h) => h.id === homeworkId)
    if (index > -1) {
      this.homework.splice(index, 1)
      this.saveToStorage("valnote_homework", this.homework)
      return true
    }
    return false
  }

  // Méthodes pour les notes
  async getGrades(): Promise<Grade[]> {
    return this.grades
  }

  async createGrade(gradeData: Omit<Grade, "id" | "created_at">): Promise<Grade> {
    const newGrade: Grade = {
      ...gradeData,
      id: Math.max(...this.grades.map((g) => g.id), 0) + 1,
      created_at: new Date().toISOString(),
    }
    this.grades.push(newGrade)
    this.saveToStorage("valnote_grades", this.grades)
    return newGrade
  }

  async updateGrade(gradeId: number, updates: Partial<Grade>): Promise<Grade | null> {
    const index = this.grades.findIndex((g) => g.id === gradeId)
    if (index > -1) {
      this.grades[index] = { ...this.grades[index], ...updates }
      this.saveToStorage("valnote_grades", this.grades)
      return this.grades[index]
    }
    return null
  }

  async deleteGrade(gradeId: number): Promise<boolean> {
    const index = this.grades.findIndex((g) => g.id === gradeId)
    if (index > -1) {
      this.grades.splice(index, 1)
      this.saveToStorage("valnote_grades", this.grades)
      return true
    }
    return false
  }

  // Méthodes pour les punitions
  async getPunishments(): Promise<Punishment[]> {
    return this.punishments
  }

  async createPunishment(punishmentData: Omit<Punishment, "id" | "created_at">): Promise<Punishment> {
    const newPunishment: Punishment = {
      ...punishmentData,
      id: Math.max(...this.punishments.map((p) => p.id), 0) + 1,
      status: "pending",
      created_at: new Date().toISOString(),
    }
    this.punishments.push(newPunishment)
    this.saveToStorage("valnote_punishments", this.punishments)
    return newPunishment
  }

  async updatePunishment(punishmentId: number, updates: Partial<Punishment>): Promise<Punishment | null> {
    const index = this.punishments.findIndex((p) => p.id === punishmentId)
    if (index > -1) {
      this.punishments[index] = { ...this.punishments[index], ...updates }
      this.saveToStorage("valnote_punishments", this.punishments)
      return this.punishments[index]
    }
    return null
  }

  async deletePunishment(punishmentId: number): Promise<boolean> {
    const index = this.punishments.findIndex((p) => p.id === punishmentId)
    if (index > -1) {
      this.punishments.splice(index, 1)
      this.saveToStorage("valnote_punishments", this.punishments)
      return true
    }
    return false
  }

  // Méthodes pour les logs
  async getConnectionLogs(): Promise<ConnectionLog[]> {
    return this.connectionLogs.slice().reverse()
  }

  // Méthodes pour l'appel
  async getAttendance(): Promise<Attendance[]> {
    return this.attendance
  }

  async getAttendanceByClass(classId: number, date?: string): Promise<Attendance[]> {
    return this.attendance.filter((a) => a.class_id === classId && (!date || a.date === date))
  }

  async createAttendance(attendanceData: Omit<Attendance, "id" | "created_at">): Promise<Attendance> {
    const newAttendance: Attendance = {
      ...attendanceData,
      id: Math.max(...this.attendance.map((a) => a.id), 0) + 1,
      created_at: new Date().toISOString(),
    }
    this.attendance.push(newAttendance)
    this.saveToStorage("valnote_attendance", this.attendance)
    return newAttendance
  }

  async updateAttendance(attendanceId: number, updates: Partial<Attendance>): Promise<Attendance | null> {
    const index = this.attendance.findIndex((a) => a.id === attendanceId)
    if (index > -1) {
      this.attendance[index] = { ...this.attendance[index], ...updates }
      this.saveToStorage("valnote_attendance", this.attendance)
      return this.attendance[index]
    }
    return null
  }

  async recordClassAttendance(
    classId: number,
    courseId: number,
    teacherId: number,
    attendanceRecords: Array<{
      student_id: number
      status: "present" | "absent" | "late" | "excused"
      notes?: string
    }>,
  ): Promise<Attendance[]> {
    const date = new Date().toISOString().split("T")[0]
    const results: Attendance[] = []

    for (const record of attendanceRecords) {
      const existingIndex = this.attendance.findIndex(
        (a) =>
          a.class_id === classId && a.student_id === record.student_id && a.date === date && a.course_id === courseId,
      )

      if (existingIndex > -1) {
        this.attendance[existingIndex] = {
          ...this.attendance[existingIndex],
          status: record.status,
          notes: record.notes,
        }
        results.push(this.attendance[existingIndex])
      } else {
        const newAttendance = await this.createAttendance({
          class_id: classId,
          student_id: record.student_id,
          course_id: courseId,
          date,
          status: record.status,
          teacher_id: teacherId,
          notes: record.notes,
        })
        results.push(newAttendance)
      }
    }

    return results
  }

  // Nouvelles méthodes pour les notifications
  async getNotifications(): Promise<Notification[]> {
    return this.notifications
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return this.notifications.filter((n) => n.user_id === userId)
  }

  async createNotification(notificationData: Omit<Notification, "id" | "created_at">): Promise<Notification> {
    const newNotification: Notification = {
      ...notificationData,
      id: Math.max(...this.notifications.map((n) => n.id), 0) + 1,
      created_at: new Date().toISOString(),
    }
    this.notifications.push(newNotification)
    this.saveToStorage("valnote_notifications", this.notifications)
    return newNotification
  }

  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    const index = this.notifications.findIndex((n) => n.id === notificationId)
    if (index > -1) {
      this.notifications[index].read = true
      this.saveToStorage("valnote_notifications", this.notifications)
      return true
    }
    return false
  }

  // Nouvelles méthodes pour les événements
  async getEvents(): Promise<Event[]> {
    return this.events
  }

  async createEvent(eventData: Omit<Event, "id" | "created_at">): Promise<Event> {
    const newEvent: Event = {
      ...eventData,
      id: Math.max(...this.events.map((e) => e.id), 0) + 1,
      created_at: new Date().toISOString(),
    }
    this.events.push(newEvent)
    this.saveToStorage("valnote_events", this.events)
    return newEvent
  }

  // Méthodes pour les relations
  getStudentsByClass(classId: number): User[] {
    const studentIds = studentsClasses.filter((sc) => sc.class_id === classId).map((sc) => sc.student_id)
    return this.users.filter((u) => studentIds.includes(u.id))
  }

  getClassesByStudent(studentId: number): Class[] {
    const classIds = studentsClasses.filter((sc) => sc.student_id === studentId).map((sc) => sc.class_id)
    return this.classes.filter((c) => classIds.includes(c.id))
  }

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

  private getSubjectColor(subject: string): string {
    const colors: { [key: string]: string } = {
      Mathématiques: "bg-blue-500",
      Français: "bg-red-500",
      "Histoire-Géographie": "bg-yellow-500",
      Anglais: "bg-green-500",
      Espagnol: "bg-orange-500",
      "Sciences de la Vie et de la Terre": "bg-emerald-500",
      "Physique-Chimie": "bg-purple-500",
      EPS: "bg-cyan-500",
      "Arts Plastiques": "bg-pink-500",
      Musique: "bg-indigo-500",
    }
    return colors[subject] || "bg-gray-500"
  }

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
}

// Instance globale de la base de données
export const db = new LocalDatabase()
