import os

with open('payroll_block.txt', 'r', encoding='utf-8') as f:
    content = f.read()

start_prefix = "{projectTab === 'payroll' && ("
if content.startswith(start_prefix):
    content = content[len(start_prefix):].strip()

if content.endswith(')'):
    content = content[:-1].strip()

component_code = f"""import React from 'react';
import {{ DollarSign, FileText, CheckCircle, ChevronLeft, ChevronRight, Calculator }} from 'lucide-react';

export default function PayrollTab({{
  payrollStartDate, setPayrollStartDate, payrollEndDate, setPayrollEndDate,
  allWorkers, activeProjectId, workerTotals, setSettleWorkerId, 
  setIsSettleModalOpen, handleToggleAdvancePaid, setWorkerReceiptObj,
  setIsWorkerReceiptModalOpen
}}) {{
  return {content};
}}
"""

with open('src/components/tabs/PayrollTab.jsx', 'w', encoding='utf-8') as f:
    f.write(component_code)

print("Created src/components/tabs/PayrollTab.jsx")
