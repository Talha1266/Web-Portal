const fs = require('fs');
let code = fs.readFileSync('src/pages/UserDashboard.jsx', 'utf8');

// Inject notifyAdmins function
const notifyFunc = `
  const notifyAdmins = async (message, heading) => {
    try {
      await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, heading })
      });
    } catch (error) {
      console.error("Notification failed:", error);
    }
  };
`;
code = code.replace('const loadData = async () => {', notifyFunc + '\n  const loadData = async () => {');

// 1. handleAddMaterial
code = code.replace(
  /await loadData\(\);\s*alert\("Material added successfully!"\);/g,
  'await loadData();\n      notifyAdmins(`${currentUser?.name || "A user"} added ${mQty} ${mName} to ${activeProj?.name || "Project"}`, "Material Ordered");\n      alert("Material added successfully!");'
);

// 2. handleToggleMaterial
code = code.replace(
  /await updateMaterial\(id, payload\);\s*if \(remainingMaterial\)/g,
  `await updateMaterial(id, payload);
        if (field === 'isArrived' && payload.isArrived) notifyAdmins(\`\${currentUser?.name || "A user"} marked \${payload.quantity} \${material.name} as ARRIVED\`, "Material Arrived");
        if (field === 'isPaid' && payload.isPaid) notifyAdmins(\`\${currentUser?.name || "A user"} marked \${payload.quantity} \${material.name} as PAID\`, "Material Paid");
        if (remainingMaterial)`
);

// 3. handlePayAllVendorBills
code = code.replace(
  /await loadData\(\);\s*alert\("All outstanding bills marked as paid!"\);/g,
  'await loadData();\n          notifyAdmins(`${currentUser?.name || "A user"} paid all outstanding bills for ${vendorName}`, "Vendor Bill Paid");\n          alert("All outstanding bills marked as paid!");'
);

// 4. handleSaveAttendance
code = code.replace(
  /await loadData\(\);\s*alert\("Attendance saved successfully!"\);/g,
  'await loadData();\n      notifyAdmins(`${currentUser?.name || "A user"} marked attendance for ${activeProj?.name || "Project"}`, "Attendance Marked");\n      alert("Attendance saved successfully!");'
);

// 5. handleMarkAllPaid
code = code.replace(
  /await loadData\(\);\s*alert\("All outstanding wages marked as paid!"\);/g,
  'await loadData();\n          notifyAdmins(`${currentUser?.name || "A user"} marked all outstanding wages as PAID`, "Wages Paid");\n          alert("All outstanding wages marked as paid!");'
);

// 6. handleConfirmSettle
code = code.replace(
  /await loadData\(\);\s*alert\("Wages settled successfully!"\);/g,
  'await loadData();\n        notifyAdmins(`${currentUser?.name || "A user"} settled wages for a worker`, "Wages Settled");\n        alert("Wages settled successfully!");'
);

// 7. handleCreateSubPay
code = code.replace(
  /await loadData\(\);\s*alert\("Subcontractor payment added!"\);/g,
  'await loadData();\n      notifyAdmins(`${currentUser?.name || "A user"} added a subcontractor payment`, "Subcontractor Payment");\n      alert("Subcontractor payment added!");'
);

// 8. Admin Request Fallback
code = code.replace(
  /alert\('Modification request sent to Admin/g,
  'notifyAdmins(`${currentUser?.name || "A user"} submitted an Admin Edit Request`, "Admin Request");\n      alert(\'Modification request sent to Admin'
);

fs.writeFileSync('src/pages/UserDashboard.jsx', code);
console.log('Injection complete');
