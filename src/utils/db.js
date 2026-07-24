import { supabase } from '../supabaseClient';

export const initializeDB = () => {};

export const getUsers = async () => { const { data } = await supabase.from('users').select('*'); return data || []; };
export const addUser = async (u) => { await supabase.from('users').insert({ ...u, id: u.id || Date.now().toString(), createdAt: new Date().toISOString() }); };
export const updateUser = async (id, updates) => { await supabase.from('users').update(updates).eq('id', id); };
export const deleteUser = async (id) => { await supabase.from('users').delete().eq('id', id); };
export const removeUser = deleteUser;
export const updateUserPermissions = async (id, perms) => { await supabase.from('users').update({ permissions: perms }).eq('id', id); };

export const DEFAULT_PERMISSIONS = {
  view_reports: true,
  manage_workers: false,
  manage_subcontractors: false,
  manage_payroll: false,
  manage_finances: false,
  manage_tasks: false,
  manage_inventory: false
};

export const getProjects = async () => { const { data } = await supabase.from('projects').select('*'); return data || []; };
export const addProject = async (p) => { await supabase.from('projects').insert({ ...p, id: p.id || Date.now().toString(), progress: 0, createdAt: new Date().toISOString() }); };
export const updateProject = async (id, updates) => { await supabase.from('projects').update(updates).eq('id', id); };
export const deleteProject = async (id) => { await supabase.from('projects').delete().eq('id', id); };

export const getWorkers = async () => { const { data } = await supabase.from('workers').select('*'); return data || []; };
export const addWorker = async (w) => { await supabase.from('workers').insert({ ...w, id: w.id || Date.now().toString(), createdAt: new Date().toISOString() }); };
export const updateWorker = async (id, updates) => { await supabase.from('workers').update(updates).eq('id', id); };
export const deleteWorker = async (id) => { await supabase.from('workers').update({ isDeleted: true }).eq('id', id); };

export const getAttendance = async () => { const { data } = await supabase.from('attendance').select('*'); return data || []; };
export const addAttendanceRecord = async (r) => { await supabase.from('attendance').insert({ ...r, id: r.id || Date.now().toString(), createdAt: new Date().toISOString() }); };
export const updateAttendanceRecord = async (id, updates) => { await supabase.from('attendance').update(updates).eq('id', id); };
export const deleteAttendanceRecords = async (workerId) => { await supabase.from('attendance').delete().eq('workerId', workerId); };

export const getSubcontractors = async () => { const { data } = await supabase.from('subcontractors').select('*'); return data || []; };
export const addSubcontractor = async (s) => { await supabase.from('subcontractors').insert({ ...s, id: s.id || Date.now().toString(), createdAt: new Date().toISOString() }); };
export const updateSubcontractor = async (id, updates) => { await supabase.from('subcontractors').update(updates).eq('id', id); };
export const deleteSubcontractor = async (id) => { 
  await supabase.from('subcontractors').delete().eq('id', id); 
  await supabase.from('sub_payments').delete().eq('subId', id); 
};

export const getSubPayments = async () => { const { data } = await supabase.from('sub_payments').select('*'); return data || []; };
export const addSubPayment = async (p) => { await supabase.from('sub_payments').insert({ ...p, id: p.id || Date.now().toString(), createdAt: new Date().toISOString() }); };
export const updateSubPayment = async (id, updates) => { await supabase.from('sub_payments').update(updates).eq('id', id); };
export const deleteSubPayment = async (id) => { await supabase.from('sub_payments').delete().eq('id', id); };

export const getChangeRequests = async () => { const { data } = await supabase.from('change_requests').select('*'); return data || []; };
export const addChangeRequest = async (r) => { await supabase.from('change_requests').insert({ ...r, id: r.id || Date.now().toString(), status: 'pending', createdAt: new Date().toISOString() }); };
export const updateChangeRequest = async (id, updates) => { await supabase.from('change_requests').update(updates).eq('id', id); };

export const getMaterials = async () => { const { data } = await supabase.from('materials').select('*'); return data || []; };
export const addMaterial = async (m) => { await supabase.from('materials').insert({ ...m, id: m.id || Date.now().toString(), status: 'Pending Approval', createdAt: new Date().toISOString() }); };
export const updateMaterial = async (id, updates) => { await supabase.from('materials').update(updates).eq('id', id); };
export const deleteMaterial = async (id) => { await supabase.from('materials').delete().eq('id', id); };

export const getMaterialCategories = async () => { const { data } = await supabase.from('material_categories').select('*'); return data ? data.map(d => d.name) : []; };
export const addMaterialCategory = async (name) => { await supabase.from('material_categories').insert({ name, id: name }); };
export const deleteMaterialCategory = async (name) => { await supabase.from('material_categories').delete().eq('name', name); };

export const getSiteAdvances = async () => { const { data } = await supabase.from('site_advances').select('*'); return data || []; };
export const addSiteAdvance = async (a) => { await supabase.from('site_advances').insert({ ...a, id: a.id || Date.now().toString(), createdAt: new Date().toISOString() }); };
export const updateSiteAdvance = async (id, updates) => { await supabase.from('site_advances').update(updates).eq('id', id); };
export const deleteSiteAdvance = async (id) => { await supabase.from('site_advances').delete().eq('id', id); };

export const getSiteExpenses = async () => { const { data } = await supabase.from('site_expenses').select('*'); return data || []; };
export const addSiteExpense = async (e) => { await supabase.from('site_expenses').insert({ ...e, id: e.id || Date.now().toString(), createdAt: new Date().toISOString() }); };
export const updateSiteExpense = async (id, updates) => { await supabase.from('site_expenses').update(updates).eq('id', id); };
export const deleteSiteExpense = async (id) => { await supabase.from('site_expenses').delete().eq('id', id); };

export const getAssets = async () => { const { data } = await supabase.from('assets').select('*'); return data || []; };
export const addAsset = async (a) => { await supabase.from('assets').insert({ ...a, id: a.id || Date.now().toString(), createdAt: new Date().toISOString() }); };
export const updateAsset = async (id, updates) => { await supabase.from('assets').update(updates).eq('id', id); };
export const deleteAsset = async (id) => { await supabase.from('assets').delete().eq('id', id); };

export const getTasks = async () => { const { data } = await supabase.from('tasks').select('*'); return data || []; };
export const addTask = async (t) => { await supabase.from('tasks').insert({ ...t, id: t.id || Date.now().toString(), createdAt: new Date().toISOString() }); };
export const updateTask = async (id, updates) => { await supabase.from('tasks').update(updates).eq('id', id); };
export const deleteTask = async (id) => { await supabase.from('tasks').delete().eq('id', id); };

export const getMessages = async () => { const { data } = await supabase.from('messages').select('*'); return data || []; };
export const addMessage = async (m) => { await supabase.from('messages').insert({ ...m, id: m.id || Date.now().toString(), createdAt: new Date().toISOString() }); };

export const getDocuments = async () => { const { data } = await supabase.from('documents').select('*'); return data || []; };
export const addDocument = async (d) => { await supabase.from('documents').insert({ ...d, id: d.id || Date.now().toString(), createdAt: new Date().toISOString() }); };
export const updateDocument = async (id, updates) => { await supabase.from('documents').update(updates).eq('id', id); };
export const deleteDocument = async (id) => { await supabase.from('documents').delete().eq('id', id); };

// ==========================================
// MIGRATION SCRIPT
// ==========================================
export const migrateDataToCloud = async () => {
  const getLocal = (key) => {
    try {
      const d = localStorage.getItem(key);
      return d ? JSON.parse(d) : [];
    } catch(e) { return []; }
  };

  const users = getLocal('const_manage_users');
  if(users.length) await supabase.from('users').upsert(users);

  const projects = getLocal('const_manage_projects');
  if(projects.length) await supabase.from('projects').upsert(projects);

  const workers = getLocal('const_manage_workers');
  if(workers.length) await supabase.from('workers').upsert(workers);

  const attendance = getLocal('const_manage_attendance');
  if(attendance.length) await supabase.from('attendance').upsert(attendance);

  const subcontractors = getLocal('const_manage_subcontractors');
  if(subcontractors.length) await supabase.from('subcontractors').upsert(subcontractors);

  const subPayments = getLocal('const_manage_sub_payments');
  if(subPayments.length) await supabase.from('sub_payments').upsert(subPayments);

  const materials = getLocal('const_manage_materials');
  if(materials.length) await supabase.from('materials').upsert(materials);

  const siteAdvances = getLocal('const_manage_site_advances');
  if(siteAdvances.length) await supabase.from('site_advances').upsert(siteAdvances);

  const siteExpenses = getLocal('const_manage_site_expenses');
  if(siteExpenses.length) await supabase.from('site_expenses').upsert(siteExpenses);

  const assets = getLocal('const_manage_assets');
  if(assets.length) await supabase.from('assets').upsert(assets);

  const tasks = getLocal('const_manage_tasks');
  if(tasks.length) await supabase.from('tasks').upsert(tasks);

  const messages = getLocal('const_manage_messages');
  if(messages.length) await supabase.from('messages').upsert(messages);

  const documents = getLocal('const_manage_docs');
  if(documents.length) await supabase.from('documents').upsert(documents);

  const changeRequests = getLocal('const_manage_cr');
  if(changeRequests.length) await supabase.from('change_requests').upsert(changeRequests);

  const materialCategories = getLocal('const_manage_mat_cats');
  if(materialCategories.length) {
    const cats = materialCategories.map(c => ({ id: c, name: c }));
    await supabase.from('material_categories').upsert(cats);
  }
};

// ==========================================
// INDEXEDDB FOR LARGE FILES
// ==========================================
const DB_NAME = 'ConstManageIDB';
const STORE_NAME = 'FileStore';

const initIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveFileContentToDB = async (id, base64) => {
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(base64, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

export const getFileContentFromDB = async (id) => {
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteFileContentFromDB = async (id) => {
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

export const loginUser = async (email, password) => {
  const { data } = await supabase.from('users').select('*').eq('email', email).eq('password', password).single();
  return data;
};

export const resetDB = async () => {
  console.warn('resetDB called on cloud DB - ignored for safety');
};

export const saveAttendance = async (workerId, projectId, date, present, regularHours, overtimeHours, advance, existingId) => {
  if (!present && advance === 0) {
    if (existingId) {
      await supabase.from('attendance').delete().eq('id', existingId);
    }
    return;
  }
  const payload = { workerId, projectId, date, regularHours, overtimeHours, advance, paid: false };
  if (existingId) {
    await supabase.from('attendance').update(payload).eq('id', existingId);
  } else {
    await supabase.from('attendance').insert({ ...payload, id: Date.now().toString(), createdAt: new Date().toISOString() });
  }
};

export const markAttendancePaid = async (id) => {
  await supabase.from('attendance').update({ paid: true }).eq('id', id);
};

export const revertAttendancePaid = async (id) => {
  await supabase.from('attendance').update({ paid: false }).eq('id', id);
};

export const markAllAttendancePaid = async (projectId) => {
  await supabase.from('attendance').update({ paid: true }).eq('projectId', projectId).eq('paid', false);
};

export const addAdvanceOnlyRecord = async (workerId, projectId, date, amount) => {
  await supabase.from('attendance').insert({
    workerId, projectId, date, regularHours: 0, overtimeHours: 0, advance: amount, paid: false, id: Date.now().toString(), createdAt: new Date().toISOString()
  });
};

export const updateChangeRequestStatus = async (id, status) => {
  await supabase.from('change_requests').update({ status }).eq('id', id);
};
