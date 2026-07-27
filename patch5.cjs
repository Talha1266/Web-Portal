const fs = require('fs');

// --- 1. Patch AdminDashboard.jsx ---
let adminContent = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const permTarget = `    const PERMISSION_LABELS = {
      root: "Admin Access (Manage Users)",
      overview: "Overview",
      attendance: "Attendance",
      payroll: "Payroll & Wages",
      subcontractors: "Subcontractors",
      materials: "Materials",
      site_expenses: "Site Expenses",
      assets: "Assets",
      documents: "Documents",
      tasks: "Tasks"
    };`;

const permReplace = `    const PERMISSION_LABELS = {
      root: "Admin Access (Manage Users)",
      unlock_past: "Unlock Past Records",
      overview: "Overview",
      attendance: "Attendance",
      payroll: "Payroll & Wages",
      subcontractors: "Subcontractors",
      materials: "Materials",
      site_expenses: "Site Expenses",
      assets: "Assets",
      documents: "Documents",
      tasks: "Tasks"
    };`;

adminContent = adminContent.replace(permTarget, permReplace);
fs.writeFileSync('src/pages/AdminDashboard.jsx', adminContent);
console.log("Patched AdminDashboard.jsx");

// --- 2. Patch UserDashboard.jsx ---
let userContent = fs.readFileSync('src/pages/UserDashboard.jsx', 'utf8');

// Fix canModifyEntry
userContent = userContent.replace(
  "if (currentUser?.permissions?.root && adminUnlockPast) return true;",
  "if ((currentUser?.permissions?.root || currentUser?.permissions?.unlock_past) && adminUnlockPast) return true;"
);

// Fix Unlock Past button display in Header
userContent = userContent.replace(
  "{currentUser?.permissions?.root && (\\n                      <button \\n                        onClick={() => setAdminUnlockPast(!adminUnlockPast)}",
  "{(currentUser?.permissions?.root || currentUser?.permissions?.unlock_past) && (\\n                      <button \\n                        onClick={() => setAdminUnlockPast(!adminUnlockPast)}"
);

// We need to use regex for the header button because of whitespace
const headerRegex = /\{currentUser\?\.permissions\?\.root && \(\s*<button \s*onClick=\{\(\) => setAdminUnlockPast\(!adminUnlockPast\)\}/;
userContent = userContent.replace(headerRegex, "{(currentUser?.permissions?.root || currentUser?.permissions?.unlock_past) && (\n                      <button \n                        onClick={() => setAdminUnlockPast(!adminUnlockPast)}");

// Fix Unlock to Edit button in Attendance
const attendanceUnlockRegex = /\{!canModify && perms\.root && \(\s*<button className="btn btn-warning"/;
userContent = userContent.replace(attendanceUnlockRegex, "{!canModify && (perms.root || perms.unlock_past) && (\n                       <button className=\"btn btn-warning\"");

fs.writeFileSync('src/pages/UserDashboard.jsx', userContent);
console.log("Patched UserDashboard.jsx");
