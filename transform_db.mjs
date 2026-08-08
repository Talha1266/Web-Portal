import fs from 'fs';

let content = fs.readFileSync('src/utils/db.js', 'utf8');

// 1. Add imports at top
content = content.replace(
  "import { supabase } from '../supabaseClient';",
  `import { supabase } from '../supabaseClient';\nimport { queueOfflineMutation, getOfflineMutations } from './offlineSync';\n\nconst mergeOffline = async (table, data) => {\n  let results = [...(data || [])];\n  try {\n    const queue = await getOfflineMutations();\n    const tableQueue = queue.filter(q => q.table === table);\n    \n    // Apply inserts\n    const inserts = tableQueue.filter(q => q.action === 'INSERT').map(q => ({...q.payload, _isOffline: true}));\n    results = [...results, ...inserts];\n    \n    // Apply updates\n    const updates = tableQueue.filter(q => q.action === 'UPDATE');\n    updates.forEach(u => {\n      const idx = results.findIndex(r => r.id === u.recordId);\n      if (idx !== -1) results[idx] = { ...results[idx], ...u.payload, _isOffline: true };\n    });\n    \n    // Apply deletes\n    const deletes = tableQueue.filter(q => q.action === 'DELETE').map(q => q.recordId);\n    results = results.filter(r => !deletes.includes(r.id));\n  } catch (e) { console.error("Offline merge error:", e); }\n  return results;\n};\n\nconst executeMutation = async (table, action, payload, recordId) => {\n  if (!navigator.onLine) {\n    await queueOfflineMutation(table, action, payload, recordId);\n    return;\n  }\n  try {\n    let result;\n    if (action === 'INSERT') result = await supabase.from(table).insert(payload);\n    else if (action === 'UPDATE') result = await supabase.from(table).update(payload).eq('id', recordId);\n    else if (action === 'DELETE') result = await supabase.from(table).delete().eq('id', recordId);\n    \n    if (result.error) {\n      if (result.error.message.includes('Failed to fetch') || result.error.message.includes('fetch')) {\n        await queueOfflineMutation(table, action, payload, recordId);\n        return;\n      }\n      throw new Error(result.error.message);\n    }\n  } catch (err) {\n    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('fetch'))) {\n      await queueOfflineMutation(table, action, payload, recordId);\n      return;\n    }\n    throw err;\n  }\n};\n`
);

// Helper to replace standard getters
const replaceGetter = (funcName, table) => {
  const regex = new RegExp(`export const ${funcName} = async \\(\\) => \\{ const \\{ data \\} = await supabase\\.from\\('${table}'\\)\\.select\\('\\*'\\); return data \\|\\| \\[\\]; \\};`, 'g');
  content = content.replace(regex, `export const ${funcName} = async () => { const { data } = await supabase.from('${table}').select('*'); return await mergeOffline('${table}', data); };`);
};

// Helper to replace standard inserters
const replaceInserter = (funcName, table, varName) => {
  const regex = new RegExp(`export const ${funcName} = async \\(${varName}\\) => \\{\\s*const \\{ error \\} = await supabase\\.from\\('${table}'\\)\\.insert\\(\\{ \\.\\.\\.${varName}, id: ${varName}\\.id \\|\\| Date\\.now\\(\\)\\.toString\\(\\), createdAt: new Date\\(\\)\\.toISOString\\(\\) \\}\\); if \\(error\\) throw new Error\\(error\\.message\\); \\};`, 'g');
  content = content.replace(regex, `export const ${funcName} = async (${varName}) => { const payload = { ...${varName}, id: ${varName}.id || Date.now().toString(), createdAt: new Date().toISOString() }; await executeMutation('${table}', 'INSERT', payload, payload.id); };`);
};
const replaceInserterNoCreated = (funcName, table, varName) => {
  const regex = new RegExp(`export const ${funcName} = async \\(${varName}\\) => \\{\\s*const \\{ error \\} = await supabase\\.from\\('${table}'\\)\\.insert\\(\\{ \\.\\.\\.${varName}, id: ${varName}\\.id \\|\\| Date\\.now\\(\\)\\.toString\\(\\) \\}\\); if \\(error\\) throw new Error\\(error\\.message\\); \\};`, 'g');
  content = content.replace(regex, `export const ${funcName} = async (${varName}) => { const payload = { ...${varName}, id: ${varName}.id || Date.now().toString() }; await executeMutation('${table}', 'INSERT', payload, payload.id); };`);
};

// Helper to replace standard updaters
const replaceUpdater = (funcName, table) => {
  const regex = new RegExp(`export const ${funcName} = async \\(id, updates\\) => \\{\\s*const \\{ error \\} = await supabase\\.from\\('${table}'\\)\\.update\\(updates\\)\\.eq\\('id', id\\); if \\(error\\) throw new Error\\(error\\.message\\); \\};`, 'g');
  content = content.replace(regex, `export const ${funcName} = async (id, updates) => { await executeMutation('${table}', 'UPDATE', updates, id); };`);
};

// Helper to replace standard deleters
const replaceDeleter = (funcName, table) => {
  const regex = new RegExp(`export const ${funcName} = async \\(id\\) => \\{\\s*const \\{ error \\} = await supabase\\.from\\('${table}'\\)\\.delete\\(\\)\\.eq\\('id', id\\); if \\(error\\) throw new Error\\(error\\.message\\); \\};`, 'g');
  content = content.replace(regex, `export const ${funcName} = async (id) => { await executeMutation('${table}', 'DELETE', null, id); };`);
};

// Apply standard replacements
['users', 'projects', 'workers', 'attendance', 'subcontractors', 'sub_payments', 'materials', 'material_categories', 'vendors', 'site_advances', 'site_expenses', 'assets', 'tasks', 'documents', 'messages', 'change_requests'].forEach(table => {
  // We handle custom logic differently for some tables, so use regex safely
  replaceGetter('get' + table.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''), table);
});
replaceGetter('getUsers', 'users');
replaceGetter('getProjects', 'projects');
replaceGetter('getWorkers', 'workers');
replaceGetter('getSubcontractors', 'subcontractors');
replaceGetter('getSubPayments', 'sub_payments');
replaceGetter('getMaterials', 'materials');
replaceGetter('getMaterialCategories', 'material_categories');
replaceGetter('getVendors', 'vendors');
replaceGetter('getSiteAdvances', 'site_advances');
replaceGetter('getSiteExpenses', 'site_expenses');
replaceGetter('getAssets', 'assets');
replaceGetter('getTasks', 'tasks');
replaceGetter('getDocuments', 'documents');
replaceGetter('getMessages', 'messages');
replaceGetter('getChangeRequests', 'change_requests');
replaceGetter('getAttendance', 'attendance');


replaceInserter('addUser', 'users', 'u');
replaceInserter('addProject', 'projects', 'p');
// addProject has progress: 0
content = content.replace(
  /export const addProject = async \(p\) => \{  const \{ error \} = await supabase\.from\('projects'\)\.insert\(\{ \.\.\.p, id: p\.id \|\| Date\.now\(\)\.toString\(\), progress: 0, createdAt: new Date\(\)\.toISOString\(\) \}\); if \(error\) throw new Error\(error\.message\); \};/g,
  `export const addProject = async (p) => { const payload = { ...p, id: p.id || Date.now().toString(), progress: 0, createdAt: new Date().toISOString() }; await executeMutation('projects', 'INSERT', payload, payload.id); };`
);

replaceInserter('addWorker', 'workers', 'w');
replaceInserter('addSubcontractor', 'subcontractors', 's');
replaceInserter('addSubPayment', 'sub_payments', 'p');
replaceInserter('addMaterial', 'materials', 'm');
replaceInserter('addMaterialCategory', 'material_categories', 'c');
replaceInserter('addVendor', 'vendors', 'v');
replaceInserter('addSiteAdvance', 'site_advances', 'a');
replaceInserter('addSiteExpense', 'site_expenses', 'e');
replaceInserter('addAsset', 'assets', 'a');
replaceInserter('addTask', 'tasks', 't');
replaceInserter('addDocument', 'documents', 'd');
replaceInserter('addMessage', 'messages', 'm');
replaceInserter('addChangeRequest', 'change_requests', 'r');

replaceUpdater('updateUser', 'users');
replaceUpdater('updateProject', 'projects');
replaceUpdater('updateWorker', 'workers');
replaceUpdater('updateSubcontractor', 'subcontractors');
replaceUpdater('updateSubPayment', 'sub_payments');
replaceUpdater('updateMaterial', 'materials');
replaceUpdater('updateMaterialCategory', 'material_categories');
replaceUpdater('updateVendor', 'vendors');
replaceUpdater('updateSiteAdvance', 'site_advances');
replaceUpdater('updateSiteExpense', 'site_expenses');
replaceUpdater('updateAsset', 'assets');
replaceUpdater('updateTask', 'tasks');

replaceDeleter('deleteUser', 'users');
// deleteProject is custom cascading
replaceDeleter('deleteWorker', 'workers');
replaceDeleter('deleteSubcontractor', 'subcontractors');
replaceDeleter('deleteSubPayment', 'sub_payments');
replaceDeleter('deleteMaterial', 'materials');
replaceDeleter('deleteMaterialCategory', 'material_categories');
replaceDeleter('deleteVendor', 'vendors');
replaceDeleter('deleteSiteAdvance', 'site_advances');
replaceDeleter('deleteSiteExpense', 'site_expenses');
replaceDeleter('deleteAsset', 'assets');
replaceDeleter('deleteTask', 'tasks');
replaceDeleter('deleteDocument', 'documents');

fs.writeFileSync('src/utils/db.js', content, 'utf8');
console.log('db.js transformed.');
