import os

with open('tasks_block.txt', 'r', encoding='utf-8') as f:
    content = f.read()

start_prefix = "{projectTab === 'tasks' && (() => {"
if content.startswith(start_prefix):
    content = content[len(start_prefix):].strip()

if content.endswith('})()}'):
    content = content[:-5].strip()
elif content.endswith('})()} '):
    content = content[:-6].strip()
elif content.endswith('})()}\n'):
    content = content[:-6].strip()

component_code = f"""import React from 'react';
import {{ CheckSquare, Plus, CheckCircle, Clock, Trash2, Check }} from 'lucide-react';

export default function TasksTab({{
  allTasks, activeProjectId, setIsTaskModalOpen, triggerSecurityChallenge,
  handleDeleteTask, handleToggleTaskStatus
}}) {{
  {content}
}}
"""

with open('src/components/tabs/TasksTab.jsx', 'w', encoding='utf-8') as f:
    f.write(component_code)

print("Created src/components/tabs/TasksTab.jsx")
