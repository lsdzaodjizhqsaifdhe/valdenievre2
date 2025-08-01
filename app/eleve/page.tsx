@@ .. @@
   const [homework, setHomework] = useState<any[]>([])
   const [grades, setGrades] = useState<any[]>([])
   const [loading, setLoading] = useState(true)
+  const [messages, setMessages] = useState<any[]>([])
   const router = useRouter()
 
   useEffect(() => {
@@ .. @@
       // Charger les notes récentes
       const allGrades = await db.getGrades()
       const studentGrades = allGrades.filter((g) => g.student_id === studentId)
       setGrades(studentGrades.slice(-5)) // 5 dernières notes
+
+      // Charger les messages (simulé)
+      setMessages([
+        { id: 1, sender: 'M. Martin', subject: 'Félicitations', content: 'Excellent travail ce trimestre !', date: new Date().toISOString(), read: false },
+        { id: 2, sender: 'Administration', subject: 'Sortie pédagogique', content: 'Sortie au musée prévue le 15 mars', date: new Date().toISOString(), read: true }
+      ])
     } catch (error) {
       console.error("Erreur lors du chargement des données:", error)
     } finally {
@@ .. @@
             <TabsList className="grid w-full grid-cols-5">
               <TabsTrigger value="dashboard">Accueil</TabsTrigger>
               <TabsTrigger value="schedule">Emploi du temps</TabsTrigger>
               <TabsTrigger value="grades">Notes</TabsTrigger>
               <TabsTrigger value="homework">Devoirs</TabsTrigger>
-              <TabsTrigger value="absences">Vie scolaire</TabsTrigger>
+              <TabsTrigger value="messages">Messages</TabsTrigger>
             </TabsList>
@@ .. @@
             </TabsContent>

-            <TabsContent value="absences">
+            <TabsContent value="messages">
+              <Card>
+                <CardHeader>
+                  <CardTitle>Messagerie</CardTitle>
+                </CardHeader>
+                <CardContent>
+                  <div className="space-y-4">
+                    {messages.map((message) => (
+                      <div key={message.id} className={`p-4 border rounded-lg ${!message.read ? 'bg-blue-50 border-blue-200' : ''}`}>
+                        <div className="flex items-center justify-between mb-2">
+                          <div className="font-medium">{message.subject}</div>
+                          <div className="text-sm text-gray-500">{message.sender}</div>
+                        </div>
+                        <div className="text-sm text-gray-700 mb-2">{message.content}</div>
+                        <div className="text-xs text-gray-400">
+                          {new Date(message.date).toLocaleDateString('fr-FR')}
+                        </div>
+                      </div>
+                    ))}
+                  </div>
+                </CardContent>
+              </Card>
+            </TabsContent>
+          </Tabs>
+        </div>
+      </div>
+
+      {/* Modal pour les absences et vie scolaire */}
+      <div className="fixed bottom-4 right-4">
+        <Card className="w-80">
+          <CardHeader className="pb-3">
+            <CardTitle className="text-sm">Vie scolaire</CardTitle>
+          </CardHeader>
+          <CardContent>
+            <div className="space-y-3">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card>
                   <CardHeader>
@@ .. @@
                   </CardContent>
                 </Card>
               </div>
-            </TabsContent>
-          </Tabs>
+            </div>
+          </CardContent>
+        </Card>
+      </div>
         </div>
       </div>
     </div>