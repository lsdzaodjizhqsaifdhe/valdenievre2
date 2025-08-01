"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  FileText,
  AlertCircle,
  LogOut,
  Phone,
  Mail,
  Clock,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { db, type User } from "@/lib/database"

export default function ParentDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedChild, setSelectedChild] = useState<User | null>(null)
  const [children, setChildren] = useState<User[]>([])
  const [childStats, setChildStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simuler un parent connecté
    const parentUser = {
      id: 100,
      name: "M. et Mme Dupont",
      email: "parents.dupont@email.com",
      phone: "06 12 34 56 78",
      role: "parent",
    }
    setCurrentUser(parentUser)
    loadParentData()
  }, [])

  const loadParentData = async () => {
    try {
      // Récupérer les enfants (simulé)
      const allUsers = await db.getUsers()
      const studentChildren = allUsers.filter((u) => u.role === "eleve" && u.name.includes("Dupont"))
      setChildren(studentChildren)

      if (studentChildren.length > 0) {
        setSelectedChild(studentChildren[0])
        loadChildStats(studentChildren[0].id)
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadChildStats = async (childId: number) => {
    try {
      const stats = await db.getStudentStats(childId)
      setChildStats(stats)
    } catch (error) {
      console.error("Erreur stats:", error)
    }
  }

  const handleChildChange = (childId: string) => {
    const child = children.find((c) => c.id.toString() === childId)
    if (child) {
      setSelectedChild(child)
      loadChildStats(child.id)
    }
  }

  const handleLogout = () => {
    router.push("/")
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
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
              <span className="font-medium">ESPACE PARENTS</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Espace Parents - {currentUser?.name}</span>
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
            <h1 className="text-xl font-semibold mb-2">Suivi scolaire</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Enfant :</span>
              <Select value={selectedChild?.id.toString()} onValueChange={handleChildChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Sélectionner un enfant" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedChild && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Moyenne générale</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{childStats?.generalAverage || 0}/20</div>
                    <p className="text-xs text-muted-foreground">{childStats?.totalGrades || 0} notes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Devoirs</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">5</div>
                    <p className="text-xs text-muted-foreground">À faire cette semaine</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Absences</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{childStats?.totalAbsences || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {childStats?.unjustifiedAbsences || 0} non justifiées
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">2</div>
                    <p className="text-xs text-muted-foreground">Non lus</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="results" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="results">Résultats</TabsTrigger>
                  <TabsTrigger value="schedule">Emploi du temps</TabsTrigger>
                  <TabsTrigger value="homework">Devoirs</TabsTrigger>
                  <TabsTrigger value="absences">Vie scolaire</TabsTrigger>
                  <TabsTrigger value="communication">Communication</TabsTrigger>
                </TabsList>

                <TabsContent value="results">
                  <div className="space-y-6">
                    {/* Évolution des résultats */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Résultats de {selectedChild.name}</CardTitle>
                        <CardDescription>Évolution des notes par matière</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {childStats?.subjectAverages.map((subject: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded ${subject.color}`}></div>
                                <div>
                                  <div className="font-medium">{subject.subject}</div>
                                  <div className="text-sm text-gray-500">{subject.gradeCount} note(s)</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-xl font-bold ${
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
                                <Progress value={subject.average * 5} className="w-24 h-2 mt-1" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Conseils et observations */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Observations des professeurs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 border-l-4 border-green-500">
                            <div className="font-medium text-green-800">Mathématiques - M. Martin</div>
                            <div className="text-sm text-green-700 mt-1">
                              "Excellent travail ce trimestre. {selectedChild.name} fait preuve de rigueur et de
                              logique."
                            </div>
                          </div>
                          <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                            <div className="font-medium text-blue-800">Français - Mme Dubois</div>
                            <div className="text-sm text-blue-700 mt-1">
                              "Bons résultats. Peut encore progresser en expression écrite."
                            </div>
                          </div>
                          <div className="p-4 bg-orange-50 border-l-4 border-orange-500">
                            <div className="font-medium text-orange-800">Histoire-Géographie - M. Bernard</div>
                            <div className="text-sm text-orange-700 mt-1">
                              "Élève sérieux mais doit participer davantage à l'oral."
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="schedule">
                  <Card>
                    <CardHeader>
                      <CardTitle>Emploi du temps de {selectedChild.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Emploi du temps disponible prochainement</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="homework">
                  <Card>
                    <CardHeader>
                      <CardTitle>Devoirs et travail à faire</CardTitle>
                      <CardDescription>Suivi des devoirs de {selectedChild.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">Exercices de mathématiques</div>
                            <Badge variant="outline">Pour demain</Badge>
                          </div>
                          <div className="text-sm text-gray-600">Page 27, exercices 2 à 8</div>
                          <div className="mt-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Fait
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">Rédaction en français</div>
                            <Badge variant="outline">Pour vendredi</Badge>
                          </div>
                          <div className="text-sm text-gray-600">Rédiger un texte de 300 mots sur les vacances</div>
                          <div className="mt-2">
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              En cours
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">Recherche en histoire</div>
                            <Badge variant="outline">Pour lundi</Badge>
                          </div>
                          <div className="text-sm text-gray-600">Rechercher des informations sur la Renaissance</div>
                          <div className="mt-2">
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              À faire
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="absences">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Absences et retards</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <div>
                              <div className="font-medium text-sm">Absence non justifiée</div>
                              <div className="text-xs text-gray-500">17 septembre - Journée complète</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <div>
                              <div className="font-medium text-sm">Retard</div>
                              <div className="text-xs text-gray-500">21 septembre - 8h00</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Sanctions et récompenses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="font-medium text-sm text-green-800">Félicitations</div>
                            <div className="text-xs text-green-600">Excellent travail en mathématiques</div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="font-medium text-sm text-blue-800">Encouragements</div>
                            <div className="text-xs text-blue-600">Progrès remarqués en français</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="communication">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Messages des professeurs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm">M. Martin - Mathématiques</div>
                              <Badge variant="secondary">Nouveau</Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              Bonjour, je souhaiterais vous rencontrer pour discuter des progrès de {selectedChild.name}
                              .
                            </div>
                            <div className="text-xs text-gray-400 mt-2">Il y a 2 heures</div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm">Mme Dubois - Français</div>
                              <Badge variant="outline">Lu</Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {selectedChild.name} a fait un excellent devoir cette semaine. Félicitations !
                            </div>
                            <div className="text-xs text-gray-400 mt-2">Hier</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Prendre rendez-vous</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-3 border rounded-lg">
                            <div className="font-medium text-sm mb-2">Professeur principal</div>
                            <div className="text-sm text-gray-600 mb-3">M. Martin - Mathématiques</div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Phone className="w-4 h-4 mr-1" />
                                Appeler
                              </Button>
                              <Button size="sm" variant="outline">
                                <Mail className="w-4 h-4 mr-1" />
                                Email
                              </Button>
                            </div>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="font-medium text-sm mb-2">Vie scolaire</div>
                            <div className="text-sm text-gray-600 mb-3">Pour les questions d'absences</div>
                            <Button size="sm" variant="outline" className="w-full bg-transparent">
                              Contacter la vie scolaire
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
