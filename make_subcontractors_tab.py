import os

with open('subcontractors_block.txt', 'r', encoding='utf-8') as f:
    content = f.read()

start_prefix = "{projectTab === 'subcontractors' && ("
if content.startswith(start_prefix):
    content = content[len(start_prefix):].strip()

if content.endswith(')}'):
    content = content[:-2].strip()

component_code = f"""import React from 'react';
import {{ Briefcase, Calculator, Plus, Eye, ChevronRight, FileText, Trash2 }} from 'lucide-react';

export default function SubcontractorsTab({{
  allSubcontractors, activeProjectId, activeSubId, setActiveSubId,
  setIsSubcontractorModalOpen, handleDeleteSubcontractor, canModifyEntry,
  triggerSecurityChallenge, allSubcontractorLedger, handleSaveFinalValue,
  setIsSubLedgerModalOpen, setIsSubLedgerReceiptModalOpen, setSubLedgerReceiptObj
}}) {{
  return (
    {content}
  );
}}
"""

with open('src/components/tabs/SubcontractorsTab.jsx', 'w', encoding='utf-8') as f:
    f.write(component_code)

print("Created src/components/tabs/SubcontractorsTab.jsx")
