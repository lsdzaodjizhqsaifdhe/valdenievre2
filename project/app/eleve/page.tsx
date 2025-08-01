"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Clock, FileText, LogOut, TrendingUp, Calendar, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { db, type User } from "@/lib/database"

interface StudentStats {
  totalGrades: number
  generalAverage: number
  subjectAverages: Array<{
    subject: string
    average: number
    gradeCount: number
    color: string
  }>
  totalAbsences: number
  unjustifiedAbsences: number
}

export default function EleveDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedule, setSchedule] = useState<any[]>([])
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [homework, setHomework] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      const parsedUser = JSON.parse(user)
      if (parsedUser.role !== "eleve") {
        router.push("/")
        return
      }
      setCurrentUser(parsedUser)
      loadStudentData(parsedUser.id)
    } else {
      router.push("/")
    }
  }, [router])

  const loadStudentData = async (studentId: number) => {
    try {
      // Charger les statistiques de l'élève
      const studentStats = await db.getStudentStats(studentId)
      setStats(studentStats)

      // Générer un emploi du temps pour la première classe de l'élève
      const studentClasses = db.getClassesByStudent(studentId)
      if (studentClasses.length > 0) {
        const fullSchedule = await db.generateFullSchedule(studentClasses[0].id)
        setSchedule(fullSchedule)
      }

      // Charger les devoirs
      const allHomework = await db.getHomework()
      setHomework(allHomework.slice(0, 5)) // Limiter à 5 devoirs

      // Charger les notes récentes
      const allGrades = await db.getGrades()
      const studentGrades = allGrades.filter((g) => g.student_id === studentId)
      setGrades(studentGrades.slice(-5)) // 5 dernières notes
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCurrentDaySchedule = () => {
    const today = new Date().getDay() - 1 // Lundi = 0
    return schedule.filter((item) => item.dayIndex === today)
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
              <span className="font-medium">ESPACE ÉLÈVE</span>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-gray-300">
                Mes données
              </a>
              <a href="#" className="hover:text-gray-300">
                Cahier de textes
              </a>
              <a href="#" className="hover:text-gray-300">
                Notes
              </a>
              <a href="#" className="hover:text-gray-300">
                Compétences
              </a>
              <a href="#" className="hover:text-gray-300">
                Résultats
              </a>
              <a href="#" className="hover:text-gray-300">
                Vie scolaire
              </a>
              <a href="#" className="hover:text-gray-300">
                Communication
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">VN</span>
              </div>
              <span className="text-sm">Espace Élèves - {currentUser.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-gray-300">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page d'accueil header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold mb-2">Tableau de bord élève</h1>
            <p className="text-gray-600">
              Bienvenue {currentUser.name} - {formatDate(new Date())}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moyenne générale</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats?.generalAverage || 0}/20</div>
                <p className="text-xs text-muted-foreground">{stats?.totalGrades || 0} notes au total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Devoirs à faire</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{homework.length}</div>
                <p className="text-xs text-muted-foreground">À rendre cette semaine</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absences</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.totalAbsences || 0}</div>
                <p className="text-xs text-muted-foreground">{stats?.unjustifiedAbsences || 0} non justifiées</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cours aujourd'hui</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{getCurrentDaySchedule().length}</div>
                <p className="text-xs text-muted-foreground">Cours programmés</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Accueil</TabsTrigger>
              <TabsTrigger value="schedule">Emploi du temps</TabsTrigger>
              <TabsTrigger value="grades">Notes</TabsTrigger>
              <TabsTrigger value="homework">Devoirs</TabsTrigger>
              <TabsTrigger value="absences">Vie scolaire</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Emploi du temps du jour */}
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Aujourd'hui</CardTitle>
                      <div className="text-sm text-gray-500">
                        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {getCurrentDaySchedule().map((cours, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div className="w-16 text-gray-500 text-xs">{cours.startTime}</div>
                        <div className={`flex-1 p-2 rounded text-xs text-white ${cours.color}`}>
                          <div className="font-medium">{cours.subject}</div>
                          <div className="opacity-90">{cours.room}</div>
                        </div>
                      </div>
                    ))}
                    {getCurrentDaySchedule().length === 0 && (
                      <p className="text-center text-gray-500 py-4">Aucun cours aujourd'hui</p>
                    )}
                  </CardContent>
                </Card>

                {/* Devoirs à faire */}
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-purple-700">Travail à faire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {homework.map((devoir, index) => (
                        <div key={index} className="border-l-4 border-purple-500 pl-3">
                          <div className="font-medium text-sm">{devoir.title}</div>
                          <div className="text-xs text-gray-600">{devoir.subject}</div>
                          <div className="text-xs text-purple-600">
                            Pour le {new Date(devoir.due_date).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      ))}
                      {homework.length === 0 && <p className="text-center text-gray-500">Aucun devoir à faire</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Dernières notes */}
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-orange-700">Dernières notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {grades.map((note, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{note.subject}</div>
                            <div className="text-xs text-gray-500">{note.description}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(note.date).toLocaleDateString("fr-FR")}
                            </div>
                          </div>
                          <div
                            className={`font-bold text-lg ${
                              note.grade >= 16
                                ? "text-green-600"
                                : note.grade >= 12
                                  ? "text-blue-600"
                                  : note.grade >= 8
                                    ? "text-orange-600"
                                    : "text-red-600"
                            }`}
                          >
                            {note.grade}/20
                          </div>
                        </div>
                      ))}
                      {grades.length === 0 && <p className="text-center text-gray-500">Aucune note récente</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Emploi du temps complet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-2 text-sm">
                    <div className="font-medium p-2"></div>
                    {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map((day) => (
                      <div key={day} className="font-medium p-2 text-center bg-gray-100 rounded">
                        {day}
                      </div>
                    ))}

                    {["08:00", "09:00", "10:15", "11:15", "13:30", "14:30", "15:45", "16:45"].map((time) => (
                      <div key={time} className="contents">
                        <div className="font-medium p-2 text-gray-600">{time}</div>
                        {[0, 1, 2, 3, 4].map((dayIndex) => {
                          const cours = schedule.find((s) => s.dayIndex === dayIndex && s.startTime === time)
                          return (
                            <div key={`${time}-${dayIndex}`} className="p-1">
                              {cours ? (
                                <div className={`p-2 rounded text-xs text-white ${cours.color}`}>
                                  <div className="font-medium">{cours.subject}</div>
                                  <div className="opacity-90">{cours.room}</div>
                                </div>
                              ) : (
                                <div className="p-2 h-12"></div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades">
              <div className="space-y-6">
                {/* Moyenne générale */}
                <Card>
                  <CardHeader>
                    <CardTitle>Résultats scolaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">{stats?.generalAverage || 0}/20</div>
                        <div className="text-gray-600">Moyenne générale</div>
                        <Progress value={(stats?.generalAverage || 0) * 5} className="mt-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Notes obtenues:</span>
                          <span className="font-medium">{stats?.totalGrades || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Matières évaluées:</span>
                          <span className="font-medium">{stats?.subjectAverages.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes par matière */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notes par matière</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.subjectAverages.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded ${subject.color}`}></div>
                            <div>
                              <div className="font-medium">{subject.subject}</div>
                              <div className="text-sm text-gray-500">{subject.gradeCount} note(s)</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-lg font-bold ${
                                subject.average >= 16
                                  ? "text-green-600"
                                  : subject.average >= 12
                                    ? "text-blue-600"
                                    : subject.average >= 8
                                      ? "text-orange-600"
                                      : "text-red-600"
                              }`}
                            >
                              {subject.average}/20
                            </div>
                            <Progress value={subject.average * 5} className="w-20 h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="homework">
              <Card>
                <CardHeader>
                  <CardTitle>Cahier de textes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {homework.map((devoir, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-lg">{devoir.title}</div>
                          <Badge variant="outline">{new Date(devoir.due_date).toLocaleDateString("fr-FR")}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">{devoir.subject}</span>
                        </div>
                        {devoir.description && (
                          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{devoir.description}</div>
                        )}
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline">
                            Marquer comme fait
                          </Button>
                          <Button size="sm" variant="outline">
                            Déposer un fichier
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="absences">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-700">Absences et retards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <div className="text-sm">
                          <div className="font-medium">Absence non justifiée</div>
                          <div className="text-xs text-gray-500">le 17 sept. de 8h00 à 18h00</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <div className="text-sm">
                          <div className="font-medium">Retard</div>
                          <div className="text-xs text-gray-500">le 21 sept. à 8h00</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <div className="text-sm">
                          <div className="font-medium">Retard</div>
                          <div className="text-xs text-gray-500">le 10 sept. à 8h00</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Informations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-sm">Élection des délégués</div>
                        <div className="text-xs text-gray-500">Le 28 septembre</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-sm">Sortie pédagogique</div>
                        <div className="text-xs text-gray-500">Musée d'histoire - 15 octobre</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="font-medium text-sm">Réunion parents-professeurs</div>
                        <div className="text-xs text-gray-500">20 octobre à 18h00</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
