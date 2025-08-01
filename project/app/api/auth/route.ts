import { type NextRequest, NextResponse } from "next/server"

// API pour l'authentification directe avec token
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 400 })
  }

  // Vérifier si le token correspond à une clé API admin valide
  // En production, vérifier dans une vraie base de données
  const validTokens = ["vn_admin_direct_access", token] // Le token dynamique sera vérifié côté client

  return NextResponse.json({
    valid: true,
    message: "Token valide",
    redirectUrl: "/admin",
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, password, apiKey } = body

  // Simulation d'authentification API
  const users = [
    { id: 1, username: "Wayzzedev", password: "Admin2024!Secure", role: "admin", name: "Wayze Dev" },
    { id: 2, username: "zerkaidev", password: "ZerkAi2024!Admin", role: "admin", name: "Zerkai Dev" },
    { id: 3, username: "prof.martin", password: "Prof123!", role: "prof", name: "M. Martin" },
    { id: 4, username: "prof.dubois", password: "Prof456!", role: "prof", name: "Mme Dubois" },
    { id: 5, username: "prof.bernard", password: "Prof789!", role: "prof", name: "M. Bernard" },
  ]

  const user = users.find((u) => u.username === username && u.password === password)

  if (user) {
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
      token: `vn_${user.id}_${Date.now()}`,
    })
  }

  return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
}
