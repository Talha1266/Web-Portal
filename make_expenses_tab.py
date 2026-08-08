import os

with open('expenses_block.txt', 'r', encoding='utf-8') as f:
    content = f.read()

start_prefix = "{projectTab === 'site_expenses' && (() => {"
if content.startswith(start_prefix):
    content = content[len(start_prefix):].strip()

if content.endswith('})()}'):
    content = content[:-5].strip()
elif content.endswith('})()} '):
    content = content[:-6].strip()
elif content.endswith('})()}\n'):
    content = content[:-6].strip()

component_code = f"""import React from 'react';
import {{ CreditCard, Filter, CheckCircle, Clock, Trash2 }} from 'lucide-react';

export default function ExpensesTab({{
  allExpenses, activeProjectId, expenseViewMode, setExpenseViewMode,
  setIsExpenseModalOpen, triggerSecurityChallenge, handleDeleteExpense,
  canModifyEntry, handleToggleExpenseStatus, handleEditExpense,
  setExpenseReceiptObj, setIsExpenseReceiptModalOpen
}}) {{
  {content}
}}
"""

with open('src/components/tabs/ExpensesTab.jsx', 'w', encoding='utf-8') as f:
    f.write(component_code)

print("Created src/components/tabs/ExpensesTab.jsx")
