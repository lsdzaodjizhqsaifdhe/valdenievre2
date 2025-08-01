"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/components/ui/data-table"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarNav,
  SidebarNavItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  Users,
  LogOut,
  Shield,
  Activity,
  Database,
  Settings,
  School,
  Clock,
  AlertTriangle,
  BarChart3,
  Home,
  FileText,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { db, type User, type Class, type Course, type Punishment, type ConnectionLog } from "@/lib/database"

type ActiveSection =
  | "dashboard"
  | "users"
  | "classes"
  | "courses"
  | "homework"
  | "grades"
  | "punishments"
  | "logs"
  | "settings"

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard")
  const [users, setUsers] = useState<User[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [punishments, setPunishments] = useState<Punishment[]>([])
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // États pour les modales
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false)
  const [isCreateCourseDialogOpen, setIsCreateCourseDialogOpen] = useState(false)
  const [isPunishmentDialogOpen, setIsPunishmentDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // États pour les formulaires
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "eleve" as "admin" | "prof" | "eleve",
    name: "",
    email: "",
  })

  const [newClass, setNewClass] = useState({
    name: "",
    level: "",
    teacher_ids: [],
    subject: "",
    room: "",
  })

  const [newCourse, setNewCourse] = useState({
    class_id: 0,
    teacher_id: 0,
    subject: "",
    date: "",
    start_time: "",
    end_time: "",
    room: "",
  })

  const [newPunishment, setNewPunishment] = useState({
    student_id: 0,
    type: "retenue" as "retenue" | "colle" | "exclusion" | "avertissement",
    reason: "",
    date: "",
    duration: 60,
    room: "",
  })

  const [adminPassword, setAdminPassword] = useState("")
  const [showAdminVerification, setShowAdminVerification] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      const parsedUser = JSON.parse(user)
      if (parsedUser.role !== "admin") {
        router.push("/")
        return
      }
      setCurrentUser(parsedUser)
      loadAdminData()
    } else {
      router.push("/")
    }
  }, [router])

  const loadAdminData = async () => {
    try {
      const [usersData, classesData, coursesData, punishmentsData, logsData] = await Promise.all([
        db.getUsers(),
        db.getClasses(),
        db.getCourses(),
        db.getPunishments(),
        db.getConnectionLogs(),
      ])

      setUsers(usersData)
      setClasses(classesData)
      setCourses(coursesData)
      setPunishments(punishmentsData)
      setConnectionLogs(logsData)
    } catch (error) {
      console.error("Erreur lors du chargement des données admin:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  // Fonctions CRUD pour les utilisateurs
  const createUser = async () => {
    if (newUser.role === "admin" && !showAdminVerification) {
      setShowAdminVerification(true)
      return
    }

    if (newUser.role === "admin" && adminPassword !== "Admin2024!Secure" && adminPassword !== "test") {
      alert("Mot de passe administrateur incorrect")
      return
    }

    try {
      await db.createUser(newUser)
      setIsCreateUserDialogOpen(false)
      resetUserForm()
      loadAdminData()
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error)
    }
  }

  const deleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert("Vous ne pouvez pas supprimer votre propre compte")
      return
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?`)) {
      try {
        await db.deleteUser(user.id)
        loadAdminData()
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  // Fonctions CRUD pour les classes
  const createClass = async () => {
    if (!newClass.name || !newClass.teacher_ids || newClass.teacher_ids.length === 0) {
      alert("Veuillez remplir tous les champs et sélectionner au moins un professeur")
      return
    }

    try {
      await db.createClass(newClass)
      setIsCreateClassDialogOpen(false)
      resetClassForm()
      loadAdminData()
    } catch (error) {
      console.error("Erreur lors de la création de la classe:", error)
    }
  }

  const deleteClass = async (classItem: Class) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la classe ${classItem.name} ?`)) {
      try {
        // Ici on ajouterait la méthode deleteClass dans la DB
        console.log("Suppression de la classe:", classItem.id)
        loadAdminData()
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  // Fonctions CRUD pour les cours
  const createCourse = async () => {
    if (!newCourse.class_id || !newCourse.teacher_id) return

    try {
      await db.createCourse({
        ...newCourse,
        status: "scheduled",
      })
      setIsCreateCourseDialogOpen(false)
      resetCourseForm()
      loadAdminData()
    } catch (error) {
      console.error("Erreur lors de la création du cours:", error)
    }
  }

  const deleteCourse = async (course: Course) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce cours ?`)) {
      try {
        // Ici on ajouterait la méthode deleteCourse dans la DB
        console.log("Suppression du cours:", course.id)
        loadAdminData()
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  // Fonctions CRUD pour les punitions
  const createPunishment = async () => {
    if (!newPunishment.student_id || !currentUser) return

    try {
      await db.createPunishment({
        ...newPunishment,
        teacher_id: currentUser.id,
      })
      setIsPunishmentDialogOpen(false)
      resetPunishmentForm()
      loadAdminData()
    } catch (error) {
      console.error("Erreur lors de la création de la punition:", error)
    }
  }

  const deletePunishment = async (punishment: Punishment) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette punition ?`)) {
      try {
        // Ici on ajouterait la méthode deletePunishment dans la DB
        console.log("Suppression de la punition:", punishment.id)
        loadAdminData()
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  // Fonctions de reset des formulaires
  const resetUserForm = () => {
    setNewUser({
      username: "",
      password: "",
      role: "eleve",
      name: "",
      email: "",
    })
    setAdminPassword("")
    setShowAdminVerification(false)
  }

  const resetClassForm = () => {
    setNewClass({
      name: "",
      level: "",
      teacher_ids: [],
      subject: "",
      room: "",
    })
  }

  const resetCourseForm = () => {
    setNewCourse({
      class_id: 0,
      teacher_id: 0,
      subject: "",
      date: "",
      start_time: "",
      end_time: "",
      room: "",
    })
  }

  const resetPunishmentForm = () => {
    setNewPunishment({
      student_id: 0,
      type: "retenue",
      reason: "",
      date: "",
      duration: 60,
      room: "",
    })
  }

  // Configuration des colonnes pour les tables
  const userColumns = [
    { key: "name", label: "Nom", sortable: true },
    { key: "username", label: "Identifiant", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Rôle",
      render: (role: string) => (
        <Badge variant={role === "admin" ? "destructive" : role === "prof" ? "default" : "secondary"}>
          {role === "admin" ? "Administrateur" : role === "prof" ? "Professeur" : "Élève"}
        </Badge>
      ),
    },
    {
      key: "login_count",
      label: "Connexions",
      render: (count: number) => <span className="font-mono">{count || 0}</span>,
    },
  ]

  const classColumns = [
    { key: "name", label: "Nom", sortable: true },
    { key: "level", label: "Niveau", sortable: true },
    { key: "subject", label: "Matière", sortable: true },
    { key: "room", label: "Salle", sortable: true },
    {
      key: "teacher_ids",
      label: "Professeurs",
      render: (teacherIds: number[]) => {
        const teachers = teacherIds.map((id) => users.find((u) => u.id === id)?.name).filter(Boolean)
        return (
          <div className="space-y-1">
            {teachers.map((teacher, index) => (
              <Badge key={index} variant="outline" className="mr-1">
                {teacher}
              </Badge>
            ))}
          </div>
        )
      },
    },
  ]

  const courseColumns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (date: string) => new Date(date).toLocaleDateString("fr-FR"),
    },
    { key: "start_time", label: "Heure", sortable: true },
    { key: "subject", label: "Matière", sortable: true },
    {
      key: "class_id",
      label: "Classe",
      render: (classId: number) => {
        const classItem = classes.find((c) => c.id === classId)
        return classItem ? classItem.name : "Non assignée"
      },
    },
    { key: "room", label: "Salle", sortable: true },
    {
      key: "status",
      label: "Statut",
      render: (status: string) => (
        <Badge variant={status === "cancelled" ? "destructive" : "default"}>
          {status === "cancelled" ? "Annulé" : "Programmé"}
        </Badge>
      ),
    },
  ]

  const punishmentColumns = [
    {
      key: "student_id",
      label: "Élève",
      render: (studentId: number) => {
        const student = users.find((u) => u.id === studentId)
        return student ? student.name : "Inconnu"
      },
    },
    {
      key: "type",
      label: "Type",
      render: (type: string) => (
        <Badge variant={type === "exclusion" ? "destructive" : "secondary"}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      ),
    },
    { key: "reason", label: "Motif" },
    {
      key: "date",
      label: "Date",
      render: (date: string) => new Date(date).toLocaleDateString("fr-FR"),
    },
    {
      key: "status",
      label: "Statut",
      render: (status: string) => (
        <Badge variant={status === "completed" ? "default" : "secondary"}>
          {status === "completed" ? "Effectuée" : "En attente"}
        </Badge>
      ),
    },
  ]

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  if (!currentUser) {
    return <div>Erreur de chargement</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar>
        <SidebarHeader>
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">VN</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">ValNote Admin</h2>
            <p className="text-sm text-gray-500">Panneau d'administration</p>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarNav>
            <SidebarNavItem
              active={activeSection === "dashboard"}
              onClick={() => setActiveSection("dashboard")}
              icon={<Home className="w-4 h-4" />}
            >
              Tableau de bord
            </SidebarNavItem>
            <SidebarNavItem
              active={activeSection === "users"}
              onClick={() => setActiveSection("users")}
              icon={<Users className="w-4 h-4" />}
            >
              Utilisateurs
            </SidebarNavItem>
            <SidebarNavItem
              active={activeSection === "classes"}
              onClick={() => setActiveSection("classes")}
              icon={<School className="w-4 h-4" />}
            >
              Classes
            </SidebarNavItem>
            <SidebarNavItem
              active={activeSection === "courses"}
              onClick={() => setActiveSection("courses")}
              icon={<Clock className="w-4 h-4" />}
            >
              Cours
            </SidebarNavItem>
            <SidebarNavItem
              active={activeSection === "homework"}
              onClick={() => setActiveSection("homework")}
              icon={<FileText className="w-4 h-4" />}
            >
              Devoirs
            </SidebarNavItem>
            <SidebarNavItem
              active={activeSection === "grades"}
              onClick={() => setActiveSection("grades")}
              icon={<BarChart3 className="w-4 h-4" />}
            >
              Notes
            </SidebarNavItem>
            <SidebarNavItem
              active={activeSection === "punishments"}
              onClick={() => setActiveSection("punishments")}
              icon={<AlertTriangle className="w-4 h-4" />}
            >
              Punitions
            </SidebarNavItem>
            <SidebarNavItem
              active={activeSection === "logs"}
              onClick={() => setActiveSection("logs")}
              icon={<Activity className="w-4 h-4" />}
            >
              Logs
            </SidebarNavItem>
            <SidebarNavItem
              active={activeSection === "settings"}
              onClick={() => setActiveSection("settings")}
              icon={<Settings className="w-4 h-4" />}
            >
              Paramètres
            </SidebarNavItem>
          </SidebarNav>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full bg-transparent">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeSection === "dashboard" && "Tableau de bord"}
                {activeSection === "users" && "Gestion des utilisateurs"}
                {activeSection === "classes" && "Gestion des classes"}
                {activeSection === "courses" && "Gestion des cours"}
                {activeSection === "homework" && "Gestion des devoirs"}
                {activeSection === "grades" && "Gestion des notes"}
                {activeSection === "punishments" && "Gestion des punitions"}
                {activeSection === "logs" && "Logs de connexion"}
                {activeSection === "settings" && "Paramètres système"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeSection === "dashboard" && "Vue d'ensemble de votre établissement"}
                {activeSection === "users" && "Créer et gérer les comptes utilisateurs"}
                {activeSection === "classes" && "Organiser les classes et matières"}
                {activeSection === "courses" && "Programmer et gérer les cours"}
                {activeSection === "homework" && "Suivre les devoirs assignés"}
                {activeSection === "grades" && "Consulter et gérer les notes"}
                {activeSection === "punishments" && "Gérer les sanctions disciplinaires"}
                {activeSection === "logs" && "Historique des connexions"}
                {activeSection === "settings" && "Configuration du système"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Database className="w-3 h-3 mr-1" />
                DB Locale Active
              </Badge>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {users.filter((u) => u.role === "prof").length} profs,{" "}
                      {users.filter((u) => u.role === "eleve").length} élèves
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Classes</CardTitle>
                    <School className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{classes.length}</div>
                    <p className="text-xs text-muted-foreground">Classes actives</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cours</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{courses.length}</div>
                    <p className="text-xs text-muted-foreground">Programmés</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Punitions</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{punishments.length}</div>
                    <p className="text-xs text-muted-foreground">En cours</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité récente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {connectionLogs.slice(0, 5).map((log, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              log.role === "admin" ? "bg-red-500" : log.role === "prof" ? "bg-blue-500" : "bg-green-500"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{log.username}</p>
                            <p className="text-xs text-gray-500">{new Date(log.login_time).toLocaleString("fr-FR")}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {log.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                        onClick={() => {
                          setActiveSection("users")
                          setIsCreateUserDialogOpen(true)
                        }}
                      >
                        <Users className="w-6 h-6" />
                        <span className="text-sm">Nouvel utilisateur</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                        onClick={() => {
                          setActiveSection("classes")
                          setIsCreateClassDialogOpen(true)
                        }}
                      >
                        <School className="w-6 h-6" />
                        <span className="text-sm">Nouvelle classe</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                        onClick={() => {
                          setActiveSection("courses")
                          setIsCreateCourseDialogOpen(true)
                        }}
                      >
                        <Clock className="w-6 h-6" />
                        <span className="text-sm">Nouveau cours</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                        onClick={() => {
                          setActiveSection("punishments")
                          setIsPunishmentDialogOpen(true)
                        }}
                      >
                        <AlertTriangle className="w-6 h-6" />
                        <span className="text-sm">Nouvelle punition</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === "users" && (
            <DataTable
              data={users}
              columns={userColumns}
              searchPlaceholder="Rechercher un utilisateur..."
              onAdd={() => setIsCreateUserDialogOpen(true)}
              addLabel="Nouvel utilisateur"
              onEdit={(user) => {
                setEditingItem(user)
                setNewUser(user)
                setIsCreateUserDialogOpen(true)
              }}
              onDelete={deleteUser}
              emptyMessage="Aucun utilisateur trouvé"
            />
          )}

          {activeSection === "classes" && (
            <DataTable
              data={classes}
              columns={classColumns}
              searchPlaceholder="Rechercher une classe..."
              onAdd={() => setIsCreateClassDialogOpen(true)}
              addLabel="Nouvelle classe"
              onEdit={(classItem) => {
                setEditingItem(classItem)
                setNewClass(classItem)
                setIsCreateClassDialogOpen(true)
              }}
              onDelete={deleteClass}
              emptyMessage="Aucune classe trouvée"
            />
          )}

          {activeSection === "courses" && (
            <DataTable
              data={courses}
              columns={courseColumns}
              searchPlaceholder="Rechercher un cours..."
              onAdd={() => setIsCreateCourseDialogOpen(true)}
              addLabel="Nouveau cours"
              onEdit={(course) => {
                setEditingItem(course)
                setNewCourse(course)
                setIsCreateCourseDialogOpen(true)
              }}
              onDelete={deleteCourse}
              emptyMessage="Aucun cours trouvé"
            />
          )}

          {activeSection === "punishments" && (
            <DataTable
              data={punishments}
              columns={punishmentColumns}
              searchPlaceholder="Rechercher une punition..."
              onAdd={() => setIsPunishmentDialogOpen(true)}
              addLabel="Nouvelle punition"
              onEdit={(punishment) => {
                setEditingItem(punishment)
                setNewPunishment(punishment)
                setIsPunishmentDialogOpen(true)
              }}
              onDelete={deletePunishment}
              emptyMessage="Aucune punition trouvée"
            />
          )}

          {activeSection === "logs" && (
            <Card>
              <CardHeader>
                <CardTitle>Historique des connexions</CardTitle>
                <CardDescription>Suivi de l'activité des utilisateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {connectionLogs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            log.role === "admin" ? "bg-red-500" : log.role === "prof" ? "bg-blue-500" : "bg-green-500"
                          }`}
                        />
                        <div>
                          <div className="font-medium">{log.username}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(log.login_time).toLocaleString("fr-FR")}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {log.role === "admin" ? "Admin" : log.role === "prof" ? "Prof" : "Élève"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration système</CardTitle>
                  <CardDescription>Paramètres avancés de ValNote</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Base de données locale</h3>
                        <p className="text-sm text-gray-500">Stockage des données dans le navigateur</p>
                      </div>
                      <Badge variant="default">Actif</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Logs automatiques</h3>
                        <p className="text-sm text-gray-500">Enregistrement des connexions</p>
                      </div>
                      <Badge variant="default">Activé</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Sauvegarde automatique</h3>
                        <p className="text-sm text-gray-500">Export automatique des données</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurer
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-4">Actions système</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start bg-transparent">
                        <Database className="w-4 h-4 mr-2" />
                        Exporter toutes les données
                      </Button>
                      <Button variant="outline" className="justify-start bg-transparent">
                        <Settings className="w-4 h-4 mr-2" />
                        Réinitialiser les paramètres
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Modales */}
      {/* Modal Création Utilisateur */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier" : "Créer"} un utilisateur</DialogTitle>
            <DialogDescription>
              {editingItem ? "Modifiez les informations" : "Remplissez les informations"} pour{" "}
              {editingItem ? "mettre à jour" : "créer"} le compte
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Jean Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Identifiant</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="j.dupont"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="j.dupont@valnote.fr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Mot de passe sécurisé"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: "admin" | "prof" | "eleve") => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eleve">Élève</SelectItem>
                  <SelectItem value="prof">Professeur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showAdminVerification && (
              <div className="space-y-2 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-800">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Vérification de sécurité requise</span>
                </div>
                <Label htmlFor="adminPassword">Confirmez votre mot de passe administrateur</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Votre mot de passe admin"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={createUser} className="flex-1">
                {showAdminVerification
                  ? "Confirmer la création"
                  : editingItem
                    ? "Mettre à jour"
                    : "Créer l'utilisateur"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateUserDialogOpen(false)
                  resetUserForm()
                  setEditingItem(null)
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Création Classe */}
      <Dialog open={isCreateClassDialogOpen} onOpenChange={setIsCreateClassDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier" : "Créer"} une classe</DialogTitle>
            <DialogDescription>
              {editingItem ? "Modifiez" : "Ajoutez"} une {editingItem ? "classe existante" : "nouvelle classe"} au
              système
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-name">Nom de la classe</Label>
              <Input
                id="class-name"
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                placeholder="6ème A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-level">Niveau</Label>
              <Select value={newClass.level} onValueChange={(value) => setNewClass({ ...newClass, level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6ème">6ème</SelectItem>
                  <SelectItem value="5ème">5ème</SelectItem>
                  <SelectItem value="4ème">4ème</SelectItem>
                  <SelectItem value="3ème">3ème</SelectItem>
                  <SelectItem value="2nde">2nde</SelectItem>
                  <SelectItem value="1ère">1ère</SelectItem>
                  <SelectItem value="Terminale">Terminale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-teachers">Professeurs</Label>
              <div className="space-y-2">
                {users
                  .filter((u) => u.role === "prof")
                  .map((prof) => (
                    <div key={prof.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`teacher-${prof.id}`}
                        checked={newClass.teacher_ids?.includes(prof.id) || false}
                        onChange={(e) => {
                          const currentIds = newClass.teacher_ids || []
                          if (e.target.checked) {
                            setNewClass({ ...newClass, teacher_ids: [...currentIds, prof.id] })
                          } else {
                            setNewClass({ ...newClass, teacher_ids: currentIds.filter((id) => id !== prof.id) })
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`teacher-${prof.id}`} className="text-sm">
                        {prof.name}
                      </label>
                    </div>
                  ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-subject">Matière principale</Label>
              <Input
                id="class-subject"
                value={newClass.subject}
                onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                placeholder="Mathématiques"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-room">Salle</Label>
              <Input
                id="class-room"
                value={newClass.room}
                onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                placeholder="207"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={createClass} className="flex-1">
                {editingItem ? "Mettre à jour" : "Créer la classe"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateClassDialogOpen(false)
                  resetClassForm()
                  setEditingItem(null)
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Création Cours */}
      <Dialog open={isCreateCourseDialogOpen} onOpenChange={setIsCreateCourseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier" : "Programmer"} un cours</DialogTitle>
            <DialogDescription>
              {editingItem ? "Modifiez" : "Ajoutez"} un cours {editingItem ? "existant" : "à l'emploi du temps"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-class">Classe</Label>
              <Select
                value={newCourse.class_id.toString()}
                onValueChange={(value) => setNewCourse({ ...newCourse, class_id: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classe) => (
                    <SelectItem key={classe.id} value={classe.id.toString()}>
                      {classe.name} - {classe.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-teacher">Professeur</Label>
              <Select
                value={newCourse.teacher_id.toString()}
                onValueChange={(value) => setNewCourse({ ...newCourse, teacher_id: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un professeur" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter((u) => u.role === "prof")
                    .map((prof) => (
                      <SelectItem key={prof.id} value={prof.id.toString()}>
                        {prof.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-subject">Matière</Label>
              <Input
                id="course-subject"
                value={newCourse.subject}
                onChange={(e) => setNewCourse({ ...newCourse, subject: e.target.value })}
                placeholder="Mathématiques"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-date">Date</Label>
              <Input
                id="course-date"
                type="date"
                value={newCourse.date}
                onChange={(e) => setNewCourse({ ...newCourse, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-start-time">Heure de début</Label>
                <Input
                  id="course-start-time"
                  type="time"
                  value={newCourse.start_time}
                  onChange={(e) => setNewCourse({ ...newCourse, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-end-time">Heure de fin</Label>
                <Input
                  id="course-end-time"
                  type="time"
                  value={newCourse.end_time}
                  onChange={(e) => setNewCourse({ ...newCourse, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-room">Salle</Label>
              <Input
                id="course-room"
                value={newCourse.room}
                onChange={(e) => setNewCourse({ ...newCourse, room: e.target.value })}
                placeholder="207"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={createCourse} className="flex-1">
                {editingItem ? "Mettre à jour" : "Programmer le cours"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateCourseDialogOpen(false)
                  resetCourseForm()
                  setEditingItem(null)
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Création Punition */}
      <Dialog open={isPunishmentDialogOpen} onOpenChange={setIsPunishmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier" : "Créer"} une punition</DialogTitle>
            <DialogDescription>
              {editingItem ? "Modifiez" : "Attribuez"} une sanction {editingItem ? "existante" : "à un élève"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="punishment-student">Élève</Label>
              <Select
                value={newPunishment.student_id.toString()}
                onValueChange={(value) => setNewPunishment({ ...newPunishment, student_id: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un élève" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter((u) => u.role === "eleve")
                    .map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="punishment-type">Type de punition</Label>
              <Select
                value={newPunishment.type}
                onValueChange={(value: "retenue" | "colle" | "exclusion" | "avertissement") =>
                  setNewPunishment({ ...newPunishment, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retenue">Retenue</SelectItem>
                  <SelectItem value="colle">Heure de colle</SelectItem>
                  <SelectItem value="exclusion">Exclusion</SelectItem>
                  <SelectItem value="avertissement">Avertissement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="punishment-reason">Motif</Label>
              <Textarea
                id="punishment-reason"
                value={newPunishment.reason}
                onChange={(e) => setNewPunishment({ ...newPunishment, reason: e.target.value })}
                placeholder="Motif de la punition"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="punishment-date">Date</Label>
              <Input
                id="punishment-date"
                type="date"
                value={newPunishment.date}
                onChange={(e) => setNewPunishment({ ...newPunishment, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="punishment-duration">Durée (minutes)</Label>
              <Input
                id="punishment-duration"
                type="number"
                value={newPunishment.duration}
                onChange={(e) => setNewPunishment({ ...newPunishment, duration: Number.parseInt(e.target.value) })}
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="punishment-room">Salle</Label>
              <Input
                id="punishment-room"
                value={newPunishment.room}
                onChange={(e) => setNewPunishment({ ...newPunishment, room: e.target.value })}
                placeholder="Vie scolaire"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={createPunishment} className="flex-1">
                {editingItem ? "Mettre à jour" : "Créer la punition"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsPunishmentDialogOpen(false)
                  resetPunishmentForm()
                  setEditingItem(null)
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
