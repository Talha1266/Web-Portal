const fs = require('fs');
let content = fs.readFileSync('src/pages/UserDashboard.jsx', 'utf8');

// Fix 1: loadData
const loadDataTarget = `      // Initialize forms with historical wages from latest attendance
      const form = {};
      workers.forEach(w => {
        const workerLogs = logs.filter(l => l.workerId === w.id).sort((a,b) => new Date(b.date) - new Date(a.date));
        const latestLog = workerLogs.length > 0 ? workerLogs[0] : null;
        const historicalWage = latestLog?.dailyWage !== undefined ? latestLog.dailyWage : w.dailyWage;
        
        form[w.id] = {
          isPresent: false,
          regularHours: 0,
          overtimeHours: 0,
          advance: 0,
          isPaid: false,
          dailyWage: historicalWage
        };
      });
      setAttendanceForm(form);`;
const loadDataReplace = `      // Initialize forms using the worker's current master wage for new entries
      const form = {};
      workers.forEach(w => {
        form[w.id] = {
          isPresent: false,
          regularHours: 0,
          overtimeHours: 0,
          advance: 0,
          isPaid: false,
          dailyWage: w.dailyWage
        };
      });
      setAttendanceForm(form);`;
content = content.replace(loadDataTarget, loadDataReplace);

// Fix 2: useEffect
const useEffectTarget = `          // Find most recent past wage
          const pastLogs = allAttendance.filter(a => a.workerId === w.id && a.date < attendanceDate).sort((a,b) => new Date(b.date) - new Date(a.date));
          const historicalWage = pastLogs.length > 0 && pastLogs[0].dailyWage !== undefined ? pastLogs[0].dailyWage : w.dailyWage;
          form[w.id] = { isPresent: false, regularHours: 0, overtimeHours: 0, advance: 0, isPaid: false, dailyWage: historicalWage };`;
const useEffectReplace = `          // Use the worker's current master wage for new entries
          form[w.id] = { isPresent: false, regularHours: 0, overtimeHours: 0, advance: 0, isPaid: false, dailyWage: w.dailyWage };`;
content = content.replace(useEffectTarget, useEffectReplace);

fs.writeFileSync('src/pages/UserDashboard.jsx', content);
console.log("Patched 3 successfully!");
