"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Globe, Send, Activity, CheckCircle } from "lucide-react"

export default function WebhookPage() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testWebhook = async () => {
    if (!webhookUrl) return

    setIsLoading(true)

    try {
      const testData = {
        event: "user_login",
        timestamp: new Date().toISOString(),
        data: {
          username: "test_user",
          role: "prof",
          ip: "192.168.1.1",
        },
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ValNote-Signature": "test_signature",
        },
        body: JSON.stringify(testData),
      })

      if (response.ok) {
        setTestResult("success")
      } else {
        setTestResult("error")
      }
    } catch (error) {
      setTestResult("error")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">VN</span>
          </div>
          <h1 className="text-2xl font-semibold">ValNote - Webhooks</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Configuration Webhook
            </CardTitle>
            <CardDescription>Configurez des webhooks pour recevoir des notifications en temps réel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL du Webhook</Label>
              <Input
                id="webhook-url"
                placeholder="https://votre-site.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={testWebhook} disabled={!webhookUrl || isLoading}>
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? "Test en cours..." : "Tester"}
              </Button>

              {testResult && (
                <Badge variant={testResult === "success" ? "default" : "destructive"}>
                  {testResult === "success" ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Succès
                    </>
                  ) : (
                    "Échec"
                  )}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Événements Disponibles
            </CardTitle>
            <CardDescription>Types d'événements que vous pouvez recevoir via webhook</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { event: "user_login", description: "Connexion d'un utilisateur" },
                { event: "user_created", description: "Création d'un nouvel utilisateur" },
                { event: "grade_added", description: "Nouvelle note ajoutée" },
                { event: "homework_assigned", description: "Devoir assigné" },
                { event: "absence_recorded", description: "Absence enregistrée" },
                { event: "message_sent", description: "Message envoyé" },
              ].map((item, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">{item.event}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exemple de Payload</CardTitle>
            <CardDescription>Structure des données envoyées à votre webhook</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {`{
  "event": "user_login",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "user_id": 123,
    "username": "prof.martin",
    "role": "prof",
    "name": "M. Martin",
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0..."
  },
  "signature": "sha256=abc123..."
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
