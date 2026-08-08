import sys

with open('src/pages/UserDashboard.jsx', 'r', encoding='utf-8') as f:
    dashboard = f.read()

with open('assets_block.txt', 'r', encoding='utf-8') as f:
    block = f.read()

replacement = """{projectTab === 'assets' && (
              <AssetsTab 
                allAssets={allAssets} activeProjectId={activeProjectId} 
                setIsAssetModalOpen={setIsAssetModalOpen} triggerSecurityChallenge={triggerSecurityChallenge}
                handleDeleteAsset={handleDeleteAsset} canModifyEntry={canModifyEntry}
                handleToggleAssetStatus={handleToggleAssetStatus}
              />
            )}"""

dashboard = dashboard.replace(block, replacement)

import_str = "import AssetsTab from '../components/tabs/AssetsTab';\n"
if "import AssetsTab" not in dashboard:
    parts = dashboard.split("import ExpensesTab", 1)
    if len(parts) == 2:
        dashboard = parts[0] + import_str + "import ExpensesTab" + parts[1]
    else:
        dashboard = import_str + dashboard

with open('src/pages/UserDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(dashboard)

print("Updated UserDashboard.jsx for AssetsTab")
