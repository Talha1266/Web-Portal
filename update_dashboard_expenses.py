import sys

with open('src/pages/UserDashboard.jsx', 'r', encoding='utf-8') as f:
    dashboard = f.read()

with open('expenses_block.txt', 'r', encoding='utf-8') as f:
    block = f.read()

replacement = """{projectTab === 'site_expenses' && (
              <ExpensesTab 
                allExpenses={allExpenses} activeProjectId={activeProjectId} 
                expenseViewMode={expenseViewMode} setExpenseViewMode={setExpenseViewMode}
                setIsExpenseModalOpen={setIsExpenseModalOpen} 
                triggerSecurityChallenge={triggerSecurityChallenge} handleDeleteExpense={handleDeleteExpense}
                canModifyEntry={canModifyEntry} handleToggleExpenseStatus={handleToggleExpenseStatus}
                handleEditExpense={handleEditExpense} setExpenseReceiptObj={setExpenseReceiptObj}
                setIsExpenseReceiptModalOpen={setIsExpenseReceiptModalOpen}
              />
            )}"""

dashboard = dashboard.replace(block, replacement)

import_str = "import ExpensesTab from '../components/tabs/ExpensesTab';\n"
if "import ExpensesTab" not in dashboard:
    parts = dashboard.split("import SubcontractorsTab", 1)
    if len(parts) == 2:
        dashboard = parts[0] + import_str + "import SubcontractorsTab" + parts[1]
    else:
        dashboard = import_str + dashboard

with open('src/pages/UserDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(dashboard)

print("Updated UserDashboard.jsx for ExpensesTab")
