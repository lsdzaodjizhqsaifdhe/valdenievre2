@@ .. @@
       key: "class_id",
       label: "Classe",
       render: (classId: number) => {
         const classItem = classes.find((c) => c.id === classId)
         return classItem ? classItem.name : "Non assignée"
       },
     },