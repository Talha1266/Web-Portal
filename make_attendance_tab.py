import os

with open('attendance_block.txt', 'r', encoding='utf-8') as f:
    content = f.read()

start_prefix = "{projectTab === 'attendance' && (() => {"
if content.startswith(start_prefix):
    content = content[len(start_prefix):].strip()

if content.endswith('})()}'):
    content = content[:-5].strip()
elif content.endswith('})()} '):
    content = content[:-6].strip()
elif content.endswith('})()}\n'):
    content = content[:-6].strip()

component_code = f"""import React from 'react';
import {{ ClipboardList, Users, Trash2, Edit2, ChevronLeft, ChevronRight }} from 'lucide-react';

export default function AttendanceTab({{
  attendanceDate, setAttendanceDate, allAttendance, activeProjectId, 
  allWorkers, handleToggleAttendance, triggerSecurityChallenge, 
  handleDeleteAttendance, setIsWorkerModalOpen
}}) {{
  {content}
}}
"""

with open('src/components/tabs/AttendanceTab.jsx', 'w', encoding='utf-8') as f:
    f.write(component_code)

print("Created src/components/tabs/AttendanceTab.jsx")
