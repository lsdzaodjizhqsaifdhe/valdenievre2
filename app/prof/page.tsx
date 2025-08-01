@@ .. @@
                         <div className="text-sm text-gray-600 mb-2">
-                          {hw.class?.name} - {hw.subject}
+                          {classes.find(c => c.id === hw.class_id)?.name} - {hw.subject}
                         </div>