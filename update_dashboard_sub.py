import sys

with open('src/pages/UserDashboard.jsx', 'r', encoding='utf-8') as f:
    dashboard = f.read()

with open('subcontractors_block.txt', 'r', encoding='utf-8') as f:
    block = f.read()

replacement = """{projectTab === 'subcontractors' && (
              <SubcontractorsTab 
                allSubcontractors={allSubcontractors} activeProjectId={activeProjectId} 
                activeSubId={activeSubId} setActiveSubId={setActiveSubId}
                setIsSubcontractorModalOpen={setIsSubcontractorModalOpen} 
                handleDeleteSubcontractor={handleDeleteSubcontractor} canModifyEntry={canModifyEntry}
                triggerSecurityChallenge={triggerSecurityChallenge} allSubcontractorLedger={allSubcontractorLedger}
                handleSaveFinalValue={handleSaveFinalValue} setIsSubLedgerModalOpen={setIsSubLedgerModalOpen}
                setIsSubLedgerReceiptModalOpen={setIsSubLedgerReceiptModalOpen} 
                setSubLedgerReceiptObj={setSubLedgerReceiptObj}
              />
            )}"""

dashboard = dashboard.replace(block, replacement)

import_str = "import SubcontractorsTab from '../components/tabs/SubcontractorsTab';\n"
if "import SubcontractorsTab" not in dashboard:
    parts = dashboard.split("import PayrollTab", 1)
    if len(parts) == 2:
        dashboard = parts[0] + import_str + "import PayrollTab" + parts[1]
    else:
        dashboard = import_str + dashboard

with open('src/pages/UserDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(dashboard)

print("Updated UserDashboard.jsx for SubcontractorsTab")
