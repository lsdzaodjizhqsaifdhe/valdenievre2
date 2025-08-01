"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Eye,
  EyeOff,
  LogIn,
  Shield,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Star,
  Zap,
  Globe,
  Lock,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/database"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const user = await db.authenticateUser(username, password)
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user))

        // Redirection selon le rôle
        switch (user.role) {
          case "admin":
            router.push("/admin")
            break
          case "prof":
            router.push("/prof")
            break
          case "eleve":
            router.push("/eleve")
            break
          default:
            router.push("/")
        }
      } else {
        setError("Identifiants incorrects")
      }
    } catch (error) {
      setError("Erreur de connexion")
      console.error("Erreur login:", error)
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (role: string, user: string, pass: string) => {
    setUsername(user)
    setPassword(pass)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Section gauche - Présentation */}
        <div className="space-y-8 animate-slide-in">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">VN</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ValNote
                </h1>
                <p className="text-gray-600 text-sm">Votre plateforme éducative moderne</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bienvenue dans l'avenir de l'éducation</h2>
            <p className="text-lg text-gray-600 mb-8">
              Une plateforme complète pour gérer votre établissement scolaire avec style et efficacité.
            </p>
          </div>

          {/* Fonctionnalités */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl hover-lift">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gestion des utilisateurs</h3>
                <p className="text-sm text-gray-600">Admins, profs, élèves</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl hover-lift">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cours & Devoirs</h3>
                <p className="text-sm text-gray-600">Planning intelligent</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl hover-lift">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Notes & Statistiques</h3>
                <p className="text-sm text-gray-600">Suivi personnalisé</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl hover-lift">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Appel & Présences</h3>
                <p className="text-sm text-gray-600">Suivi en temps réel</p>
              </div>
            </div>
          </div>

          {/* Badges de fonctionnalités */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Zap className="w-3 h-3 mr-1" />
              Temps réel
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
              <Globe className="w-3 h-3 mr-1" />
              Multi-plateforme
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
              <Lock className="w-3 h-3 mr-1" />
              Sécurisé
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
              <Star className="w-3 h-3 mr-1" />
              Intuitif
            </Badge>
          </div>
        </div>

        {/* Section droite - Connexion */}
        <div className="animate-slide-in">
          <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Connexion</CardTitle>
              <CardDescription className="text-gray-600">Accédez à votre espace personnel</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Identifiant
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Votre identifiant"
                    required
                    className="h-11 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      required
                      className="h-11 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connexion...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Se connecter
                    </div>
                  )}
                </Button>
              </form>

              {/* Connexions rapides */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center mb-4">Connexions rapides pour test :</p>

                <Tabs defaultValue="admin" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                    <TabsTrigger value="admin" className="text-xs">
                      Admin
                    </TabsTrigger>
                    <TabsTrigger value="prof" className="text-xs">
                      Prof
                    </TabsTrigger>
                    <TabsTrigger value="eleve" className="text-xs">
                      Élève
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="admin" className="space-y-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-red-50 border-red-200 hover:bg-red-100"
                      onClick={() => quickLogin("admin", "Wayzzedev", "Admin2024!Secure")}
                    >
                      <Shield className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-red-700">Wayze Dev (Admin)</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-red-50 border-red-200 hover:bg-red-100"
                      onClick={() => quickLogin("admin", "test", "test")}
                    >
                      <Shield className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-red-700">Test Admin</span>
                    </Button>
                  </TabsContent>

                  <TabsContent value="prof" className="space-y-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-blue-50 border-blue-200 hover:bg-blue-100"
                      onClick={() => quickLogin("prof", "prof.martin", "Prof123!")}
                    >
                      <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-blue-700">M. Martin (Prof)</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-blue-50 border-blue-200 hover:bg-blue-100"
                      onClick={() => quickLogin("prof", "prof.dubois", "Prof456!")}
                    >
                      <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-blue-700">Mme Dubois (Prof)</span>
                    </Button>
                  </TabsContent>

                  <TabsContent value="eleve" className="space-y-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-green-50 border-green-200 hover:bg-green-100"
                      onClick={() => quickLogin("eleve", "eleve.dupont", "Eleve123!")}
                    >
                      <Users className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-green-700">Jean Dupont (Élève)</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-green-50 border-green-200 hover:bg-green-100"
                      onClick={() => quickLogin("eleve", "eleve.martin", "Eleve456!")}
                    >
                      <Users className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-green-700">Marie Martin (Élève)</span>
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
