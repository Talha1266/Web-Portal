import sys

with open('src/pages/UserDashboard.jsx', 'r', encoding='utf-8') as f:
    dashboard = f.read()

with open('tasks_block.txt', 'r', encoding='utf-8') as f:
    block = f.read()

replacement = """{projectTab === 'tasks' && (
              <TasksTab 
                allTasks={allTasks} activeProjectId={activeProjectId} 
                setIsTaskModalOpen={setIsTaskModalOpen} triggerSecurityChallenge={triggerSecurityChallenge}
                handleDeleteTask={handleDeleteTask} handleToggleTaskStatus={handleToggleTaskStatus}
              />
            )}"""

dashboard = dashboard.replace(block, replacement)

import_str = "import TasksTab from '../components/tabs/TasksTab';\n"
if "import TasksTab" not in dashboard:
    parts = dashboard.split("import AssetsTab", 1)
    if len(parts) == 2:
        dashboard = parts[0] + import_str + "import AssetsTab" + parts[1]
    else:
        dashboard = import_str + dashboard

with open('src/pages/UserDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(dashboard)

print("Updated UserDashboard.jsx for TasksTab")
