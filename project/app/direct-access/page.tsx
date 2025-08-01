"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function DirectAccess() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setMessage("Token manquant dans l'URL")
      return
    }

    // Vérifier le token
    const storedApiKey = localStorage.getItem("adminApiKey")

    if (token === storedApiKey) {
      // Token valide, créer une session admin
      const adminUser = {
        id: 1,
        username: "DirectAccess",
        role: "admin",
        name: "Accès Direct Admin",
      }

      localStorage.setItem("currentUser", JSON.stringify(adminUser))

      // Enregistrer la connexion
      const connectionLog = {
        userId: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        loginTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: "direct-access",
        method: "direct-token",
      }

      const existingLogs = JSON.parse(localStorage.getItem("connectionLogs") || "[]")
      existingLogs.push(connectionLog)
      localStorage.setItem("connectionLogs", JSON.stringify(existingLogs))

      setStatus("success")
      setMessage("Connexion réussie ! Redirection en cours...")

      setTimeout(() => {
        router.push("/admin")
      }, 2000)
    } else {
      setStatus("error")
      setMessage("Token invalide ou expiré")
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />}
            {status === "success" && <CheckCircle className="w-12 h-12 text-green-600" />}
            {status === "error" && <XCircle className="w-12 h-12 text-red-600" />}
          </div>
          <CardTitle>
            {status === "loading" && "Vérification en cours..."}
            {status === "success" && "Connexion réussie !"}
            {status === "error" && "Erreur de connexion"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "error" && (
            <div className="space-y-4">
              <Button onClick={() => router.push("/")} className="w-full">
                Retour à la connexion
              </Button>
            </div>
          )}
          {status === "success" && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Vous allez être redirigé vers le tableau de bord administrateur...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
