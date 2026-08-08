import sys

with open('src/pages/UserDashboard.jsx', 'r', encoding='utf-8') as f:
    dashboard = f.read()

with open('payroll_block.txt', 'r', encoding='utf-8') as f:
    block = f.read()

replacement = """{projectTab === 'payroll' && (
              <PayrollTab 
                payrollStartDate={payrollStartDate} setPayrollStartDate={setPayrollStartDate} 
                payrollEndDate={payrollEndDate} setPayrollEndDate={setPayrollEndDate}
                allWorkers={allWorkers} activeProjectId={activeProjectId} 
                workerTotals={workerTotals} setSettleWorkerId={setSettleWorkerId} 
                setIsSettleModalOpen={setIsSettleModalOpen} handleToggleAdvancePaid={handleToggleAdvancePaid} 
                setWorkerReceiptObj={setWorkerReceiptObj} setIsWorkerReceiptModalOpen={setIsWorkerReceiptModalOpen}
              />
            )}"""

dashboard = dashboard.replace(block, replacement)

import_str = "import PayrollTab from '../components/tabs/PayrollTab';\n"
if "import PayrollTab" not in dashboard:
    parts = dashboard.split("import AttendanceTab", 1)
    if len(parts) == 2:
        dashboard = parts[0] + import_str + "import AttendanceTab" + parts[1]
    else:
        dashboard = import_str + dashboard

with open('src/pages/UserDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(dashboard)

print("Updated UserDashboard.jsx for PayrollTab")
