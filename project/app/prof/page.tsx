"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, FileText, MessageSquare, LogOut, Users, GraduationCap, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
// Ajouter l'import pour l'appel
import { db, type User, type Class, type Course, type Homework } from "@/lib/database"

export default function ProfDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [homework, setHomework] = useState<Homework[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // États pour les modales
  const [isHomeworkDialogOpen, setIsHomeworkDialogOpen] = useState(false)
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  // Ajouter les états pour l'appel
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<
    Array<{
      student_id: number
      student_name: string
      status: "present" | "absent" | "late" | "excused"
      notes: string
    }>
  >([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)

  // États pour les formulaires
  const [newHomework, setNewHomework] = useState({
    title: "",
    description: "",
    subject: "",
    due_date: "",
    class_id: 0,
  })

  const [newGrade, setNewGrade] = useState({
    student_id: 0,
    subject: "",
    grade: "",
    description: "",
    class_id: 0,
  })

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      const parsedUser = JSON.parse(user)
      if (parsedUser.role !== "prof") {
        router.push("/")
        return
      }
      setCurrentUser(parsedUser)
      loadProfessorData(parsedUser.id)
    } else {
      router.push("/")
    }
  }, [router])

  const loadProfessorData = async (teacherId: number) => {
    try {
      // Charger les classes du professeur
      const classesData = await db.getClassesByTeacher(teacherId)
      setClasses(classesData)

      // Charger les cours du professeur
      const coursesData = await db.getCoursesByTeacher(teacherId)
      setCourses(coursesData.filter((c) => c.date >= new Date().toISOString().split("T")[0]))

      // Charger les devoirs du professeur
      const homeworkData = await db.getHomeworkByTeacher(teacherId)
      setHomework(homeworkData)

      // Charger les élèves des classes du professeur
      const allStudents: User[] = []
      classesData.forEach((classe) => {
        const classStudents = db.getStudentsByClass(classe.id)
        allStudents.push(...classStudents)
      })
      // Supprimer les doublons
      const uniqueStudents = allStudents.filter(
        (student, index, self) => index === self.findIndex((s) => s.id === student.id),
      )
      setStudents(uniqueStudents)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const cancelCourse = async (courseId: number, reason: string) => {
    try {
      await db.updateCourse(courseId, {
        status: "cancelled",
        cancellation_reason: reason,
      })
      if (currentUser) {
        loadProfessorData(currentUser.id)
      }
    } catch (error) {
      console.error("Erreur lors de l'annulation du cours:", error)
    }
  }

  const createHomework = async () => {
    if (!currentUser || !newHomework.title || !newHomework.class_id) return

    try {
      await db.createHomework({
        ...newHomework,
        teacher_id: currentUser.id,
      })
      setIsHomeworkDialogOpen(false)
      setNewHomework({
        title: "",
        description: "",
        subject: "",
        due_date: "",
        class_id: 0,
      })
      loadProfessorData(currentUser.id)
    } catch (error) {
      console.error("Erreur lors de la création du devoir:", error)
    }
  }

  const addGrade = async () => {
    if (!currentUser || !newGrade.student_id || !newGrade.grade) return

    try {
      await db.createGrade({
        ...newGrade,
        teacher_id: currentUser.id,
        grade: Number.parseFloat(newGrade.grade),
        max_grade: 20,
        date: new Date().toISOString().split("T")[0],
      })
      setIsGradeDialogOpen(false)
      setNewGrade({
        student_id: 0,
        subject: "",
        grade: "",
        description: "",
        class_id: 0,
      })
    } catch (error) {
      console.error("Erreur lors de l'ajout de la note:", error)
    }
  }

  const getStudentsByClass = (classId: number) => {
    return db.getStudentsByClass(classId)
  }

  // Ajouter une fonction pour ouvrir l'appel
  const openAttendance = async (course: Course) => {
    setSelectedCourse(course)
    const classStudents = getStudentsByClass(course.class_id)

    // Charger l'appel existant pour aujourd'hui
    const today = new Date().toISOString().split("T")[0]
    const existingAttendance = await db.getAttendanceByClass(course.class_id, today)

    const records = classStudents.map((student) => {
      const existing = existingAttendance.find((a) => a.student_id === student.id && a.course_id === course.id)
      return {
        student_id: student.id,
        student_name: student.name,
        status: existing?.status || ("present" as "present" | "absent" | "late" | "excused"),
        notes: existing?.notes || "",
      }
    })

    setAttendanceRecords(records)
    setIsAttendanceDialogOpen(true)
  }

  // Fonction pour sauvegarder l'appel
  const saveAttendance = async () => {
    if (!selectedCourse || !currentUser) return

    try {
      await db.recordClassAttendance(
        selectedCourse.class_id,
        selectedCourse.id,
        currentUser.id,
        attendanceRecords.map((r) => ({
          student_id: r.student_id,
          status: r.status,
          notes: r.notes,
        })),
      )

      setIsAttendanceDialogOpen(false)
      setSelectedCourse(null)
      setAttendanceRecords([])

      // Optionnel: recharger les données
      loadProfessorData(currentUser.id)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'appel:", error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  if (!currentUser) {
    return <div>Erreur de chargement</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-700 text-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">VN</span>
              </div>
              <span className="font-medium">ESPACE PROFESSEUR</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm">Espace Professeur - {currentUser.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-gray-300">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-2">Tableau de bord professeur</h1>
            <p className="text-gray-600">Bienvenue {currentUser.name}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mes Classes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classes.length}</div>
                <p className="text-xs text-muted-foreground">{students.length} élèves au total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cours à venir</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.filter((c) => c.status === "scheduled").length}</div>
                <p className="text-xs text-muted-foreground">Cette semaine</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Devoirs donnés</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{homework.length}</div>
                <p className="text-xs text-muted-foreground">En cours</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Non lus</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="courses" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="courses">Cours</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="homework">Devoirs</TabsTrigger>
              <TabsTrigger value="grades">Notes</TabsTrigger>
              <TabsTrigger value="students">Élèves</TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Mes cours</CardTitle>
                  <CardDescription>Gérez vos cours à venir</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Modifier l'affichage des cours pour ajouter le bouton d'appel */}
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium text-blue-700">
                            {new Date(course.date).toLocaleDateString("fr-FR")} - {course.start_time}
                          </div>
                          <div>
                            <div className="font-medium">{course.subject}</div>
                            <div className="text-sm text-gray-600">
                              {course.class?.name} - Salle {course.room}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={course.status === "cancelled" ? "destructive" : "default"}>
                            {course.status === "cancelled" ? "Annulé" : "Programmé"}
                          </Badge>
                          {course.status === "scheduled" && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => openAttendance(course)}>
                                <Users className="w-4 h-4 mr-1" />
                                Appel
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const reason = prompt("Raison de l'annulation:")
                                  if (reason) cancelCourse(course.id, reason)
                                }}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Annuler
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classes">
              <Card>
                <CardHeader>
                  <CardTitle>Mes classes</CardTitle>
                  <CardDescription>Vue d'ensemble de vos classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((classe) => (
                      <Card key={classe.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{classe.name}</CardTitle>
                          <CardDescription>{classe.subject}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Niveau:</span>
                              <Badge variant="secondary">{classe.level}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Salle:</span>
                              <span>{classe.room}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Élèves:</span>
                              <span>{getStudentsByClass(classe.id).length}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="homework">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Devoirs donnés</CardTitle>
                      <CardDescription>Gérez les devoirs de vos classes</CardDescription>
                    </div>
                    <Dialog open={isHomeworkDialogOpen} onOpenChange={setIsHomeworkDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Nouveau devoir
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Créer un nouveau devoir</DialogTitle>
                          <DialogDescription>Ajoutez un devoir pour une de vos classes</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="homework-class">Classe</Label>
                            <Select
                              value={newHomework.class_id.toString()}
                              onValueChange={(value) =>
                                setNewHomework({ ...newHomework, class_id: Number.parseInt(value) })
                              }
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
                            <Label htmlFor="homework-title">Titre</Label>
                            <Input
                              id="homework-title"
                              value={newHomework.title}
                              onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                              placeholder="Titre du devoir"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="homework-subject">Matière</Label>
                            <Input
                              id="homework-subject"
                              value={newHomework.subject}
                              onChange={(e) => setNewHomework({ ...newHomework, subject: e.target.value })}
                              placeholder="Matière"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="homework-description">Description</Label>
                            <Textarea
                              id="homework-description"
                              value={newHomework.description}
                              onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                              placeholder="Description du devoir"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="homework-due-date">Date limite</Label>
                            <Input
                              id="homework-due-date"
                              type="date"
                              value={newHomework.due_date}
                              onChange={(e) => setNewHomework({ ...newHomework, due_date: e.target.value })}
                            />
                          </div>
                          <Button onClick={createHomework} className="w-full">
                            Créer le devoir
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {homework.map((hw) => (
                      <div key={hw.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{hw.title}</div>
                          <Badge variant="outline">{new Date(hw.due_date).toLocaleDateString("fr-FR")}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {hw.class?.name} - {hw.subject}
                        </div>
                        {hw.description && <div className="text-sm text-gray-700">{hw.description}</div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestion des notes</CardTitle>
                      <CardDescription>Saisissez et gérez les notes de vos élèves</CardDescription>
                    </div>
                    <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Nouvelle note
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter une note</DialogTitle>
                          <DialogDescription>Saisissez une note pour un élève</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="grade-class">Classe</Label>
                            <Select
                              value={newGrade.class_id.toString()}
                              onValueChange={(value) => setNewGrade({ ...newGrade, class_id: Number.parseInt(value) })}
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
                            <Label htmlFor="grade-student">Élève</Label>
                            <Select
                              value={newGrade.student_id.toString()}
                              onValueChange={(value) =>
                                setNewGrade({ ...newGrade, student_id: Number.parseInt(value) })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un élève" />
                              </SelectTrigger>
                              <SelectContent>
                                {students.map((student) => (
                                  <SelectItem key={student.id} value={student.id.toString()}>
                                    {student.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="grade-subject">Matière</Label>
                            <Input
                              id="grade-subject"
                              value={newGrade.subject}
                              onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })}
                              placeholder="Matière"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="grade-value">Note (/20)</Label>
                            <Input
                              id="grade-value"
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={newGrade.grade}
                              onChange={(e) => setNewGrade({ ...newGrade, grade: e.target.value })}
                              placeholder="Note sur 20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="grade-description">Description</Label>
                            <Input
                              id="grade-description"
                              value={newGrade.description}
                              onChange={(e) => setNewGrade({ ...newGrade, description: e.target.value })}
                              placeholder="Contrôle, devoir, etc."
                            />
                          </div>
                          <Button onClick={addGrade} className="w-full">
                            Ajouter la note
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">Fonctionnalité de consultation des notes à venir</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Mes élèves</CardTitle>
                  <CardDescription>Liste de tous vos élèves par classe</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {classes.map((classe) => (
                      <div key={classe.id}>
                        <h3 className="font-medium text-lg mb-3">
                          {classe.name} - {classe.subject}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getStudentsByClass(classe.id).map((student) => (
                            <Card key={student.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{student.name}</div>
                                    <div className="text-sm text-gray-500">@{student.username}</div>
                                  </div>
                                  <Badge variant="secondary">Élève</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* Modal Appel */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Faire l'appel</DialogTitle>
            <DialogDescription>
              {selectedCourse && (
                <>
                  {selectedCourse.subject} - {selectedCourse.class?.name} - {selectedCourse.room}
                  <br />
                  {new Date(selectedCourse.date).toLocaleDateString("fr-FR")} à {selectedCourse.start_time}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
              <div>Élève</div>
              <div>Statut</div>
              <div>Notes</div>
              <div></div>
            </div>
            {attendanceRecords.map((record, index) => (
              <div key={record.student_id} className="grid grid-cols-4 gap-2 items-center">
                <div className="font-medium">{record.student_name}</div>
                <Select
                  value={record.status}
                  onValueChange={(value: "present" | "absent" | "late" | "excused") => {
                    const newRecords = [...attendanceRecords]
                    newRecords[index].status = value
                    setAttendanceRecords(newRecords)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Présent
                      </span>
                    </SelectItem>
                    <SelectItem value="absent">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Absent
                      </span>
                    </SelectItem>
                    <SelectItem value="late">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Retard
                      </span>
                    </SelectItem>
                    <SelectItem value="excused">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Excusé
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Notes..."
                  value={record.notes}
                  onChange={(e) => {
                    const newRecords = [...attendanceRecords]
                    newRecords[index].notes = e.target.value
                    setAttendanceRecords(newRecords)
                  }}
                  className="text-sm"
                />
                <div className="flex justify-center">
                  {record.status === "present" && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                  {record.status === "absent" && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
                  {record.status === "late" && <div className="w-3 h-3 bg-orange-500 rounded-full"></div>}
                  {record.status === "excused" && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={saveAttendance} className="flex-1">
                Sauvegarder l'appel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAttendanceDialogOpen(false)
                  setSelectedCourse(null)
                  setAttendanceRecords([])
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
