import os

with open('materials_block.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the opening and closing wrapper
start_prefix = "{projectTab === 'materials' && (() => {"
if content.startswith(start_prefix):
    content = content[len(start_prefix):].strip()

if content.endswith('})()}'):
    content = content[:-5].strip()
elif content.endswith('})()} '):
    content = content[:-6].strip()
elif content.endswith('})()}\n'):
    content = content[:-6].strip()

# Create the React component
component_code = f"""import React from 'react';
import {{ Package, Settings, FileText, Trash2, Edit2 }} from 'lucide-react';

export default function MaterialsTab({{
  materialCategories, activeProjectId, allMaterials, activeMaterialCategory, 
  setIsCategoryModalOpen, setIsVendorBillModalOpen, setIsMaterialModalOpen, 
  setActiveMaterialCategory, materialViewMode, setMaterialViewMode, 
  triggerSecurityChallenge, handleDeleteMaterialCategory, canModifyEntry, 
  setArrivalMaterialObj, setArrivalQty, setIsArrivalModalOpen, 
  handleToggleMaterial, setPaymentMaterialObj, setPaymentDate, 
  setIsPaymentModalOpen, setEditMaterialObj, setIsEditMaterialModalOpen, 
  handleDeleteMaterial
}}) {{
  {content}
}}
"""

with open('src/components/tabs/MaterialsTab.jsx', 'w', encoding='utf-8') as f:
    f.write(component_code)

print("Created src/components/tabs/MaterialsTab.jsx")
