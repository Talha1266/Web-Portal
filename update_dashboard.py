import sys

with open('src/pages/UserDashboard.jsx', 'r', encoding='utf-8') as f:
    dashboard = f.read()

with open('attendance_block.txt', 'r', encoding='utf-8') as f:
    block = f.read()

replacement = """{projectTab === 'attendance' && (
              <AttendanceTab 
                attendanceDate={attendanceDate} setAttendanceDate={setAttendanceDate} 
                allAttendance={allAttendance} activeProjectId={activeProjectId} 
                allWorkers={allWorkers} handleToggleAttendance={handleToggleAttendance} 
                triggerSecurityChallenge={triggerSecurityChallenge} handleDeleteAttendance={handleDeleteAttendance} 
                setIsWorkerModalOpen={setIsWorkerModalOpen}
              />
            )}"""

dashboard = dashboard.replace(block, replacement)

import_str = "import AttendanceTab from '../components/tabs/AttendanceTab';\n"
if "import AttendanceTab" not in dashboard:
    parts = dashboard.split("import MaterialsTab", 1)
    if len(parts) == 2:
        dashboard = parts[0] + import_str + "import MaterialsTab" + parts[1]
    else:
        dashboard = import_str + dashboard

with open('src/pages/UserDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(dashboard)

print("Updated UserDashboard.jsx for AttendanceTab")
