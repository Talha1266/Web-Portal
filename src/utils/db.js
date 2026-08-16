import { supabase } from '../supabaseClient';
import { queueOfflineMutation, getOfflineMutations } from './offlineSync';

const mergeOffline = async (table, data) => {
  let results = [...(data || [])];
  try {
    const queue = await getOfflineMutations();
    const tableQueue = queue.filter(q => q.table === table);
    
    // Apply inserts
    const inserts = tableQueue.filter(q => q.action === 'INSERT').map(q => ({...q.payload, _isOffline: true}));
    results = [...results, ...inserts];
    
    // Apply updates
    const updates = tableQueue.filter(q => q.action === 'UPDATE');
    updates.forEach(u => {
      const idx = results.findIndex(r => r.id === u.recordId);
      if (idx !== -1) results[idx] = { ...results[idx], ...u.payload, _isOffline: true };
    });
    
    // Apply deletes
    const deletes = tableQueue.filter(q => q.action === 'DELETE').map(q => q.recordId);
    results = results.filter(r => !deletes.includes(r.id));
  } catch (e) { console.error("Offline merge error:", e); }
  return results;
};

const executeMutation = async (table, action, payload, recordId) => {
  if (!navigator.onLine) {
    await queueOfflineMutation(table, action, payload, recordId);
    return;
  }
  try {
    let result;
    if (action === 'INSERT') result = await supabase.from(table).insert(payload);
    else if (action === 'UPDATE') result = await supabase.from(table).update(payload).eq('id', recordId);
    else if (action === 'DELETE') result = await supabase.from(table).delete().eq('id', recordId);
    else if (action === 'UPSERT') result = await supabase.from(table).upsert(payload, { onConflict: 'id' });
    
    if (result.error) {
      if (result.error.message.includes('Failed to fetch') || result.error.message.includes('fetch')) {
        await queueOfflineMutation(table, action, payload, recordId);
        return;
      }
      throw new Error(result.error.message);
    }
  } catch (err) {
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('fetch'))) {
      await queueOfflineMutation(table, action, payload, recordId);
      return;
    }
    throw err;
  }
};


export const initializeDB = () => {};

export const getUsers = async () => { const { data } = await supabase.from('users').select('*'); return await mergeOffline('users', data); };
export const addUser = async (u) => { const payload = { ...u, id: u.id || Date.now().toString(), createdAt: new Date().toISOString() }; await executeMutation('users', 'INSERT', payload, payload.id); };
export const updateUser = async (id, updates) => { await executeMutation('users', 'UPDATE', updates, id); };
export const deleteUser = async (id) => { await executeMutation('users', 'DELETE', null, id); };
export const removeUser = deleteUser;
export const updateUserPermissions = async (id, perms) => {  const { error } = await supabase.from('users').update({ permissions: perms }).eq('id', id); if (error) throw new Error(error.message); };

export const DEFAULT_PERMISSIONS = {
  overview: false,
  attendance: false,
  payroll: false,
  subcontractors: false,
  materials: false,
  site_expenses: false,
  assets: false,
  documents: false,
  tasks: false
};

export const getProjects = async () => { const { data } = await supabase.from('projects').select('*'); return await mergeOffline('projects', data); };
export const addProject = async (p) => { const payload = { ...p, id: p.id || Date.now().toString(), progress: 0, createdAt: new Date().toISOString() }; await executeMutation('projects', 'INSERT', payload, payload.id); };
export const updateProject = async (id, updates) => { await executeMutation('projects', 'UPDATE', updates, id); };
export const deleteProject = async (id) => {
  // Cascading deletes to prevent orphaned data
  await Promise.all([
    supabase.from('attendance').delete().eq('projectId', id),
    supabase.from('subcontractors').delete().eq('projectId', id),
    supabase.from('sub_payments').delete().eq('projectId', id),
    supabase.from('materials').delete().eq('projectId', id),
    supabase.from('material_categories').delete().eq('projectId', id),
    supabase.from('vendors').delete().eq('projectId', id),
    supabase.from('site_advances').delete().eq('projectId', id),
    supabase.from('site_expenses').delete().eq('projectId', id),
    supabase.from('assets').delete().eq('projectId', id),
    supabase.from('tasks').delete().eq('projectId', id),
    supabase.from('documents').delete().eq('projectId', id),
    supabase.from('messages').delete().eq('projectId', id),
    supabase.from('activity_logs').delete().eq('projectId', id),
  ]);
  
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const getWorkers = async () => { const { data } = await supabase.from('workers').select('*'); return await mergeOffline('workers', data); };
export const addWorker = async (w) => { const payload = { ...w, id: w.id || Date.now().toString(), createdAt: new Date().toISOString() }; await executeMutation('workers', 'INSERT', payload, payload.id); };
export const updateWorker = async (id, updates) => { await executeMutation('workers', 'UPDATE', updates, id); };
export const deleteWorker = async (id) => {  const { error } = await supabase.from('workers').update({ isDeleted: true }).eq('id', id); if (error) throw new Error(error.message); };

export const getAttendance = async () => { const { data } = await supabase.from('attendance').select('*'); return await mergeOffline('attendance', data); };
export const addAttendanceRecord = async (r) => {  const { error } = await supabase.from('attendance').insert({ ...r, id: r.id || Date.now().toString(), createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateAttendanceRecord = async (id, updates) => {  const { error } = await supabase.from('attendance').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteAttendanceRecords = async (workerId, projectId, startDate, endDate, isPaid) => {
  let query = supabase.from('attendance').delete().eq('workerId', workerId);
  if (projectId) query = query.eq('projectId', projectId);
  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);
  if (isPaid !== undefined) query = query.eq('paid', isPaid);
  const { error } = await query;
  if (error) throw new Error(error.message);
};

export const getSubcontractors = async () => { const { data } = await supabase.from('subcontractors').select('*'); return await mergeOffline('subcontractors', data); };
export const addSubcontractor = async (s) => { const payload = { ...s, id: s.id || Date.now().toString(), createdAt: new Date().toISOString() }; await executeMutation('subcontractors', 'INSERT', payload, payload.id); };
export const updateSubcontractor = async (id, updates) => { await executeMutation('subcontractors', 'UPDATE', updates, id); };
export const deleteSubcontractor = async (id) => { 
  await supabase.from('subcontractors').delete().eq('id', id); 
  await supabase.from('sub_payments').delete().eq('subId', id); 
};

export const getSubPayments = async () => { const { data } = await supabase.from('sub_payments').select('*'); return await mergeOffline('sub_payments', data); };
export const addSubPayment = async (p) => { const payload = { ...p, id: p.id || Date.now().toString(), createdAt: new Date().toISOString() }; await executeMutation('sub_payments', 'INSERT', payload, payload.id); };
export const updateSubPayment = async (id, updates) => { await executeMutation('sub_payments', 'UPDATE', updates, id); };
export const deleteSubPayment = async (id) => { await executeMutation('sub_payments', 'DELETE', null, id); };

export const getChangeRequests = async () => { const { data } = await supabase.from('change_requests').select('*'); return await mergeOffline('change_requests', data); };
export const addChangeRequest = async (r) => {  const { error } = await supabase.from('change_requests').insert({ ...r, id: r.id || Date.now().toString(), status: 'pending', createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateChangeRequest = async (id, updates) => {  const { error } = await supabase.from('change_requests').update(updates).eq('id', id); if (error) throw new Error(error.message); };

export const getMaterials = async () => { const { data } = await supabase.from('materials').select('*'); return await mergeOffline('materials', data); };
export const addMaterial = async (m) => {  const { error } = await supabase.from('materials').insert({ ...m, id: m.id || Date.now().toString(), status: 'Pending Approval', createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateMaterial = async (id, updates) => { await executeMutation('materials', 'UPDATE', updates, id); };
export const deleteMaterial = async (id) => { await executeMutation('materials', 'DELETE', null, id); };

export const getMaterialCategories = async () => { const { data } = await supabase.from('material_categories').select('*'); return await mergeOffline('material_categories', data); };
export const addMaterialCategory = async (name, projectId) => {  const { error } = await supabase.from('material_categories').insert({ id: Date.now().toString(), name, projectId }); if (error) throw new Error(error.message); };
export const updateMaterialCategory = async (oldName, newName, projectId) => {
  // Update all materials referencing this category in this project
  await supabase.from('materials').update({ category: newName }).eq('category', oldName).eq('projectId', projectId);
  // Update the category itself
  const { error } = await supabase.from('material_categories').update({ name: newName }).eq('name', oldName).eq('projectId', projectId);
  if (error) throw new Error(error.message);
};
export const deleteMaterialCategory = async (name, projectId) => {  const { error } = await supabase.from('material_categories').delete().eq('name', name).eq('projectId', projectId); if (error) throw new Error(error.message); };

export const getVendors = async () => { const { data } = await supabase.from('vendors').select('*'); return await mergeOffline('vendors', data); };
export const addVendor = async (name, projectId, categoryName) => {  const { error } = await supabase.from('vendors').insert({ name, projectId, categoryName }); if (error) throw new Error(error.message); };
export const updateVendor = async (id, newName, projectId) => {
  const { data: oldVendor } = await supabase.from('vendors').select('name, categoryName').eq('id', id).single();
  if (oldVendor) await supabase.from('materials').update({ vendorName: newName }).eq('vendorName', oldVendor.name).eq('category', oldVendor.categoryName).eq('projectId', projectId);
  const { error } = await supabase.from('vendors').update({ name: newName }).eq('id', id).eq('projectId', projectId);
  if (error) throw new Error(error.message);
};
export const deleteVendor = async (id, projectId) => {  const { error } = await supabase.from('vendors').delete().eq('id', id).eq('projectId', projectId); if (error) throw new Error(error.message); };

export const getSiteAdvances = async () => { const { data } = await supabase.from('site_advances').select('*'); return await mergeOffline('site_advances', data); };
export const addSiteAdvance = async (a) => { const payload = { ...a, id: a.id || Date.now().toString(), createdAt: new Date().toISOString() }; await executeMutation('site_advances', 'INSERT', payload, payload.id); };
export const updateSiteAdvance = async (id, updates) => { await executeMutation('site_advances', 'UPDATE', updates, id); };
export const deleteSiteAdvance = async (id) => { await executeMutation('site_advances', 'DELETE', null, id); };

export const getSiteExpenses = async () => { const { data } = await supabase.from('site_expenses').select('*'); return await mergeOffline('site_expenses', data); };
export const addSiteExpense = async (e) => { const payload = { ...e, id: e.id || Date.now().toString(), createdAt: new Date().toISOString() }; await executeMutation('site_expenses', 'INSERT', payload, payload.id); };
export const updateSiteExpense = async (id, updates) => { await executeMutation('site_expenses', 'UPDATE', updates, id); };
export const deleteSiteExpense = async (id) => { await executeMutation('site_expenses', 'DELETE', null, id); };

export const getAssets = async () => { const { data } = await supabase.from('assets').select('*'); return await mergeOffline('assets', data); };
export const addAsset = async (a) => { const payload = { ...a, id: a.id || Date.now().toString(), createdAt: new Date().toISOString() }; await executeMutation('assets', 'INSERT', payload, payload.id); };
export const updateAsset = async (id, updates) => { await executeMutation('assets', 'UPDATE', updates, id); };
export const deleteAsset = async (id) => { await executeMutation('assets', 'DELETE', null, id); };

export const getTasks = async () => { const { data } = await supabase.from('tasks').select('*'); return await mergeOffline('tasks', data); };
export const addTask = async (t) => { const payload = { ...t, id: t.id || Date.now().toString(), createdAt: new Date().toISOString() }; await executeMutation('tasks', 'INSERT', payload, payload.id); };
export const updateTask = async (id, updates) => { await executeMutation('tasks', 'UPDATE', updates, id); };
export const deleteTask = async (id) => { await executeMutation('tasks', 'DELETE', null, id); };

export const getMessages = async () => { const { data } = await supabase.from('messages').select('*'); return await mergeOffline('messages', data); };
export const addMessage = async (m) => { const payload = { ...m, id: m.id || Date.now().toString(), createdAt: new Date().toISOString() }; await executeMutation('messages', 'INSERT', payload, payload.id); };

export const getDocuments = async () => { const { data } = await supabase.from('documents').select('*'); return await mergeOffline('documents', data); };
export const addDocument = async (d) => { const payload = { ...d, id: d.id || Date.now().toString(), createdAt: new Date().toISOString() }; await executeMutation('documents', 'INSERT', payload, payload.id); };
export const updateDocument = async (id, updates) => {  const { error } = await supabase.from('documents').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteDocument = async (id) => { await executeMutation('documents', 'DELETE', null, id); };

// ==========================================
// MIGRATION SCRIPT
// ==========================================


export const migrateDataToCloud = async () => {
  const SCHEMAS = {
    users: ['id', 'email', 'password', 'name', 'role', 'permissions', 'isDeleted', 'createdAt'],
    projects: ['id', 'name', 'description', 'location', 'client', 'startDate', 'status', 'progress', 'assignedUsers', 'createdBy', 'createdAt'],
    workers: ['id', 'name', 'cnic', 'phone', 'trade', 'dailyWage', 'isDeleted', 'createdAt'],
    attendance: ['id', 'workerId', 'projectId', 'date', 'regularHours', 'overtimeHours', 'advance', 'paid', 'createdAt'],
    subcontractors: ['id', 'name', 'phone', 'trade', 'isDeleted', 'createdAt'],
    sub_payments: ['id', 'subId', 'projectId', 'amount', 'date', 'description', 'createdAt'],
    materials: ['id', 'projectId', 'name', 'category', 'quantity', 'unit', 'unitPrice', 'totalCost', 'karaya', 'isArrived', 'arrivalDate', 'status', 'createdAt'],
    site_advances: ['id', 'projectId', 'amount', 'date', 'description', 'givenTo', 'status', 'createdAt'],
    site_expenses: ['id', 'projectId', 'amount', 'category', 'date', 'description', 'paidBy', 'status', 'createdAt', 'receiptImage'],
    assets: ['id', 'name', 'quantity', 'category', 'status', 'location', 'createdAt'],
    tasks: ['id', 'projectId', 'title', 'description', 'assignedTo', 'priority', 'status', 'dueDate', 'columnId', 'position', 'createdAt'],
    messages: ['id', 'channelId', 'senderId', 'text', 'timestamp', 'createdAt'],
    documents: ['id', 'name', 'type', 'size', 'url', 'parentId', 'projectId', 'hasIDBContent', 'createdBy', 'createdAt'],
    change_requests: ['id', 'collection', 'recordId', 'changes', 'requestedBy', 'status', 'createdAt'],
    material_categories: ['id', 'name']
  };

  const getLocal = (key, table) => {
    try {
      const d = localStorage.getItem(key);
      const arr = d ? JSON.parse(d) : [];
      const keys = SCHEMAS[table];
      if (!keys) return arr;
      return arr.map(obj => {
        const newObj = {};
        for (let k of keys) {
          if (obj[k] !== undefined) newObj[k] = obj[k];
        }
        return newObj;
      });
    } catch(e) { return []; }
  };
  
  const checkErr = (err, name) => {
    if (err) throw new Error('Failed at ' + name + ': ' + err.message);
  };

  const usersRaw = getLocal('const_manage_users', 'users');
  if(usersRaw.length) {
    const uniqueUsers = [];
    const seen = new Set();
    for(let u of usersRaw) {
      if(u.email) {
        let e = u.email.toLowerCase();
        if(!seen.has(e)) { seen.add(e); uniqueUsers.push(u); }
      } else { uniqueUsers.push(u); }
    }
    const { error } = await supabase.from('users').upsert(uniqueUsers); checkErr(error, 'users'); 
  }

  const projects = getLocal('const_manage_projects', 'projects');
  if(projects.length) { const { error } = await supabase.from('projects').upsert(projects); checkErr(error, 'projects'); }

  const workers = getLocal('const_manage_workers', 'workers');
  if(workers.length) { const { error } = await supabase.from('workers').upsert(workers); checkErr(error, 'workers'); }

  const attendance = getLocal('const_manage_attendance', 'attendance');
  if(attendance.length) { const { error } = await supabase.from('attendance').upsert(attendance); checkErr(error, 'attendance'); }

  const subcontractors = getLocal('const_manage_subcontractors', 'subcontractors');
  if(subcontractors.length) { const { error } = await supabase.from('subcontractors').upsert(subcontractors); checkErr(error, 'subcontractors'); }

  const subPayments = getLocal('const_manage_sub_payments', 'sub_payments');
  if(subPayments.length) { const { error } = await supabase.from('sub_payments').upsert(subPayments); checkErr(error, 'sub_payments'); }

  const materials = getLocal('const_manage_materials', 'materials');
  if(materials.length) { const { error } = await supabase.from('materials').upsert(materials); checkErr(error, 'materials'); }

  const siteAdvances = getLocal('const_manage_site_advances', 'site_advances');
  if(siteAdvances.length) { const { error } = await supabase.from('site_advances').upsert(siteAdvances); checkErr(error, 'site_advances'); }

  const siteExpenses = getLocal('const_manage_site_expenses', 'site_expenses');
  if(siteExpenses.length) { const { error } = await supabase.from('site_expenses').upsert(siteExpenses); checkErr(error, 'site_expenses'); }

  const assets = getLocal('const_manage_assets', 'assets');
  if(assets.length) { const { error } = await supabase.from('assets').upsert(assets); checkErr(error, 'assets'); }

  const tasks = getLocal('const_manage_tasks', 'tasks');
  if(tasks.length) { const { error } = await supabase.from('tasks').upsert(tasks); checkErr(error, 'tasks'); }

  const messages = getLocal('const_manage_messages', 'messages');
  if(messages.length) { const { error } = await supabase.from('messages').upsert(messages); checkErr(error, 'messages'); }

  const documents = getLocal('const_manage_documents', 'documents');
  if(documents.length) { const { error } = await supabase.from('documents').upsert(documents); checkErr(error, 'documents'); }

  const changeRequests = getLocal('const_manage_change_requests', 'change_requests');
  if(changeRequests.length) { const { error } = await supabase.from('change_requests').upsert(changeRequests); checkErr(error, 'change_requests'); }

  const materialCategories = getLocal('const_manage_material_categories', 'material_categories');
  if(materialCategories.length) {
    const cats = materialCategories.map(c => ({ id: c, name: c }));
    const { error } = await supabase.from('material_categories').upsert(cats); checkErr(error, 'material_categories');
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
export const saveAttendance = async (projectId, date, records) => {
  const payload = records.map(r => ({
    id: r.id,
    projectId: projectId,
    workerId: r.workerId,
    date: date,
    regularHours: r.regularHours,
    overtimeHours: r.overtimeHours,
    advance: r.advance,
    paid: r.isPaid || false
  }));

  if (payload.length > 0) {
    await executeMutation('attendance', 'UPSERT', payload, null);
  }
};

export const markAttendancePaid = async (projectId, workerId, startDate, endDate, settleAdvances) => {
   const { error } = await supabase.from('attendance')
     .update({ paid: true })
     .eq('projectId', projectId)
     .eq('workerId', workerId)
     .gte('date', startDate)
     .lte('date', endDate);
   if (error) throw new Error(error.message);
};
export const markAllAttendancePaid = async (projectId, startDate, endDate) => {
   const { error } = await supabase.from('attendance')
     .update({ paid: true })
     .eq('projectId', projectId)
     .gte('date', startDate)
     .lte('date', endDate);
   if (error) throw new Error(error.message);
};
export const revertAttendancePaid = async (projectId, workerId, startDate, endDate) => {
   const { error } = await supabase.from('attendance')
     .update({ paid: false })
     .eq('projectId', projectId)
     .eq('workerId', workerId)
     .gte('date', startDate)
     .lte('date', endDate);
   if (error) throw new Error(error.message);
};
export const addAdvanceOnlyRecord = async (projectId, workerId, amount, userId) => {
   const { error } = await supabase.from('attendance').insert({
    projectId, workerId, date: new Date().toISOString().split('T')[0], regularHours: 0, overtimeHours: 0, advance: amount, paid: false, id: Date.now().toString()
   });
   if (error) throw new Error(error.message);
};

export const updateChangeRequestStatus = async (id, status) => {
   const { error } = await supabase.from('change_requests').update({ status }).eq('id', id); if (error) throw new Error(error.message);
};

export const resetDB = async () => {};

export const loginUser = async (email, password) => {
  // If explicitly offline, skip Supabase Auth and jump to local fallback
  if (!navigator.onLine) {
    return _localOfflineLogin(email, password);
  }

  // Try Supabase Auth first
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  
  if (authError) {
    // If it's a network error, try offline login
    if (authError.message.includes('fetch') || authError.message.includes('Network')) {
      return _localOfflineLogin(email, password);
    }
    throw new Error(authError.message);
  }

  if (authData?.user) {
    let { data: profile } = await supabase.from('users').select('*').eq('email', authData.user.email).single();
    
    if (profile && profile.id !== authData.user.id) {
       await supabase.from('users').update({ id: authData.user.id }).eq('email', authData.user.email);
       profile.id = authData.user.id;
    }

    if (!profile) {
      const isRoot = authData.user.email === 'admin@admin.com';
      profile = {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.email.split('@')[0],
        role: isRoot ? 'Super Admin' : 'User',
        permissions: isRoot ? { root: true } : {},
        status: isRoot ? 'Active' : 'Pending'
      };
      const { error } = await supabase.from('users').insert(profile);
      if (error) console.error("Auto-create profile error:", error);
    }
    
    // Save credentials for offline fallback
    _cacheCredentialsLocally(email, password, profile);
    return profile;
  }

  throw new Error("Invalid email or password.");
};

const _localOfflineLogin = (email, password) => {
  try {
    const local = localStorage.getItem('const_manage_users');
    if (local) {
      const users = JSON.parse(local);
      const matched = users.find(u => u.email === email && u.password === password);
      if (matched) return matched;
    }
  } catch(e) {}
  throw new Error("Network error. Please connect to the internet for first-time login.");
};

const _cacheCredentialsLocally = (email, password, profile) => {
  try {
    const local = localStorage.getItem('const_manage_users');
    let users = local ? JSON.parse(local) : [];
    const idx = users.findIndex(u => u.email === email);
    const userToCache = { ...profile, password };
    if (idx !== -1) users[idx] = userToCache;
    else users.push(userToCache);
    localStorage.setItem('const_manage_users', JSON.stringify(users));
  } catch(e) { console.error("Failed to cache offline credentials", e); }
};

export const registerUser = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });
  if (error) throw new Error(error.message);

  if (data?.user) {
    const isRoot = email === 'admin@admin.com';
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        name: name || email.split('@')[0],
        role: isRoot ? 'Super Admin' : 'User',
        permissions: isRoot ? { root: true } : {},
        status: isRoot ? 'Active' : 'Pending'
      });
    // Ignore duplicate key errors if the user was already created
    if (insertError && insertError.code !== '23505') {
      console.error("Failed to create profile:", insertError.message);
    }
  }
  return data;
};

export const sendPasswordResetEmail = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error(error.message);
};

export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
};

export const updateUserProfile = async (id, name, password) => { 
  const updateData = { name };
  if (password) updateData.password = password;
  const { error } = await supabase.from('users').update(updateData).eq('id', id); 
  if (error) throw new Error(error.message); 
};

export const updateUserAdminFields = async (id, updates) => {
  const { error } = await supabase.from('users').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
};

export const getActivityLogs = async () => {
  const { data } = await supabase.from('activity_logs').select('*').order('createdAt', { ascending: false }).limit(200);
  return data || [];
};

export const addActivityLog = async (logData) => {
  const { error } = await supabase.from('activity_logs').insert({
    ...logData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  });
  if (error) throw new Error(error.message);
};
