const fs = require('fs');
let content = fs.readFileSync('src/pages/UserDashboard.jsx', 'utf8');

// 1. Remove setAdminUnlockPast(false) from the attendanceDate useEffect
const relockTarget = `      setAttendanceForm(form);
      setIsAttendanceDirty(false); // Clean slate on load
      setAdminUnlockPast(false); // Relock on date change`;

const relockReplace = `      setAttendanceForm(form);
      setIsAttendanceDirty(false); // Clean slate on load`;

content = content.replace(relockTarget, relockReplace);

// 2. Add a new useEffect that auto-relocks when navigating between tabs/projects
const newUseEffectTarget = `  useEffect(() => {
    loadData();
  }, [currentUser]);`;

const newUseEffectReplace = `  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Auto-relock when navigating between major tabs or changing projects
  useEffect(() => {
    setAdminUnlockPast(false);
  }, [activeTab, projectTab, activeProjectId]);`;

content = content.replace(newUseEffectTarget, newUseEffectReplace);

fs.writeFileSync('src/pages/UserDashboard.jsx', content);
console.log("Patched 4 successfully!");
