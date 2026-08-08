import os

with open('assets_block.txt', 'r', encoding='utf-8') as f:
    content = f.read()

start_prefix = "{projectTab === 'assets' && ("
if content.startswith(start_prefix):
    content = content[len(start_prefix):].strip()

if content.endswith(')}'):
    content = content[:-2].strip()

component_code = f"""import React from 'react';
import {{ Truck, Plus, CheckCircle, Clock, Trash2 }} from 'lucide-react';

export default function AssetsTab({{
  allAssets, activeProjectId, setIsAssetModalOpen, triggerSecurityChallenge,
  handleDeleteAsset, canModifyEntry, handleToggleAssetStatus
}}) {{
  return (
    {content}
  );
}}
"""

with open('src/components/tabs/AssetsTab.jsx', 'w', encoding='utf-8') as f:
    f.write(component_code)

print("Created src/components/tabs/AssetsTab.jsx")
