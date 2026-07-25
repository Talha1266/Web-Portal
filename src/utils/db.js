import { supabase } from '../supabaseClient';

export const initializeDB = () => {};

export const getUsers = async () => { const { data } = await supabase.from('users').select('*'); return data || []; };
export const addUser = async (u) => {  const { error } = await supabase.from('users').insert({ ...u, id: u.id || Date.now().toString(), createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateUser = async (id, updates) => {  const { error } = await supabase.from('users').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteUser = async (id) => {  const { error } = await supabase.from('users').delete().eq('id', id); if (error) throw new Error(error.message); };
export const removeUser = deleteUser;
export const updateUserPermissions = async (id, perms) => {  const { error } = await supabase.from('users').update({ permissions: perms }).eq('id', id); if (error) throw new Error(error.message); };

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
export const addProject = async (p) => {  const { error } = await supabase.from('projects').insert({ ...p, id: p.id || Date.now().toString(), progress: 0, createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateProject = async (id, updates) => {  const { error } = await supabase.from('projects').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteProject = async (id) => {  const { error } = await supabase.from('projects').delete().eq('id', id); if (error) throw new Error(error.message); };

export const getWorkers = async () => { const { data } = await supabase.from('workers').select('*'); return data || []; };
export const addWorker = async (w) => {  const { error } = await supabase.from('workers').insert({ ...w, id: w.id || Date.now().toString(), createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateWorker = async (id, updates) => {  const { error } = await supabase.from('workers').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteWorker = async (id) => {  const { error } = await supabase.from('workers').update({ isDeleted: true }).eq('id', id); if (error) throw new Error(error.message); };

export const getAttendance = async () => { const { data } = await supabase.from('attendance').select('*'); return data || []; };
export const addAttendanceRecord = async (r) => {  const { error } = await supabase.from('attendance').insert({ ...r, id: r.id || Date.now().toString(), createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateAttendanceRecord = async (id, updates) => {  const { error } = await supabase.from('attendance').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteAttendanceRecords = async (workerId) => {  const { error } = await supabase.from('attendance').delete().eq('workerId', workerId); if (error) throw new Error(error.message); };

export const getSubcontractors = async () => { const { data } = await supabase.from('subcontractors').select('*'); return data || []; };
export const addSubcontractor = async (s) => {  const { error } = await supabase.from('subcontractors').insert({ ...s, id: s.id || Date.now().toString(), createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateSubcontractor = async (id, updates) => {  const { error } = await supabase.from('subcontractors').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteSubcontractor = async (id) => { 
  await supabase.from('subcontractors').delete().eq('id', id); 
  await supabase.from('sub_payments').delete().eq('subId', id); 
};

export const getSubPayments = async () => { const { data } = await supabase.from('sub_payments').select('*'); return data || []; };
export const addSubPayment = async (p) => {  const { error } = await supabase.from('sub_payments').insert({ ...p, id: p.id || Date.now().toString(), createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateSubPayment = async (id, updates) => {  const { error } = await supabase.from('sub_payments').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteSubPayment = async (id) => {  const { error } = await supabase.from('sub_payments').delete().eq('id', id); if (error) throw new Error(error.message); };

export const getChangeRequests = async () => { const { data } = await supabase.from('change_requests').select('*'); return data || []; };
export const addChangeRequest = async (r) => {  const { error } = await supabase.from('change_requests').insert({ ...r, id: r.id || Date.now().toString(), status: 'pending', createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateChangeRequest = async (id, updates) => {  const { error } = await supabase.from('change_requests').update(updates).eq('id', id); if (error) throw new Error(error.message); };

export const getMaterials = async () => { const { data } = await supabase.from('materials').select('*'); return data || []; };
export const addMaterial = async (m) => {  const { error } = await supabase.from('materials').insert({ ...m, id: m.id || Date.now().toString(), status: 'Pending Approval', createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateMaterial = async (id, updates) => {  const { error } = await supabase.from('materials').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteMaterial = async (id) => {  const { error } = await supabase.from('materials').delete().eq('id', id); if (error) throw new Error(error.message); };

export const getMaterialCategories = async () => { const { data } = await supabase.from('material_categories').select('*'); return data ? data.map(d => d.name) : []; };
export const addMaterialCategory = async (name) => {  const { error } = await supabase.from('material_categories').insert({ name, id: name }); if (error) throw new Error(error.message); };
export const deleteMaterialCategory = async (name) => {  const { error } = await supabase.from('material_categories').delete().eq('name', name); if (error) throw new Error(error.message); };

export const getSiteAdvances = async () => { const { data } = await supabase.from('site_advances').select('*'); return data || []; };
export const addSiteAdvance = async (a) => {  const { error } = await supabase.from('site_advances').insert({ ...a, id: a.id || Date.now().toString(), createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateSiteAdvance = async (id, updates) => {  const { error } = await supabase.from('site_advances').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteSiteAdvance = async (id) => {  const { error } = await supabase.from('site_advances').delete().eq('id', id); if (error) throw new Error(error.message); };

export const getSiteExpenses = async () => { const { data } = await supabase.from('site_expenses').select('*'); return data || []; };
export const addSiteExpense = async (e) => {  const { error } = await supabase.from('site_expenses').insert({ ...e, id: e.id || Date.now().toString(), createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateSiteExpense = async (id, updates) => {  const { error } = await supabase.from('site_expenses').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteSiteExpense = async (id) => {  const { error } = await supabase.from('site_expenses').delete().eq('id', id); if (error) throw new Error(error.message); };

export const getAssets = async () => { const { data } = await supabase.from('assets').select('*'); return data || []; };
export const addAsset = async (a) => {  const { error } = await supabase.from('assets').insert({ ...a, id: a.id || Date.now().toString(), createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateAsset = async (id, updates) => {  const { error } = await supabase.from('assets').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteAsset = async (id) => {  const { error } = await supabase.from('assets').delete().eq('id', id); if (error) throw new Error(error.message); };

export const getTasks = async () => { const { data } = await supabase.from('tasks').select('*'); return data || []; };
export const addTask = async (t) => {  const { error } = await supabase.from('tasks').insert({ ...t, id: t.id || Date.now().toString(), createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateTask = async (id, updates) => {  const { error } = await supabase.from('tasks').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteTask = async (id) => {  const { error } = await supabase.from('tasks').delete().eq('id', id); if (error) throw new Error(error.message); };

export const getMessages = async () => { const { data } = await supabase.from('messages').select('*'); return data || []; };
export const addMessage = async (m) => {  const { error } = await supabase.from('messages').insert({ ...m, id: m.id || Date.now().toString(), createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };

export const getDocuments = async () => { const { data } = await supabase.from('documents').select('*'); return data || []; };
export const addDocument = async (d) => {  const { error } = await supabase.from('documents').insert({ ...d, id: d.id || Date.now().toString(), createdAt: new Date().toISOString() }); if (error) throw new Error(error.message); };
export const updateDocument = async (id, updates) => {  const { error } = await supabase.from('documents').update(updates).eq('id', id); if (error) throw new Error(error.message); };
export const deleteDocument = async (id) => {  const { error } = await supabase.from('documents').delete().eq('id', id); if (error) throw new Error(error.message); };

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
  const { data: existing } = await supabase.from('attendance')
    .select('id, workerId')
    .eq('projectId', projectId)
    .eq('date', date);

  const recordsWorkerIds = records.map(r => r.workerId);
  const toDelete = existing ? existing.filter(e => !recordsWorkerIds.includes(e.workerId)).map(e => e.id) : [];

  if (toDelete.length > 0) {
    await supabase.from('attendance').delete().in('id', toDelete);
  }

  const payload = records.map(r => {
    const existingRec = existing ? existing.find(e => e.workerId === r.workerId) : null;
    return {
      id: existingRec ? existingRec.id : r.id,
      projectId: projectId,
      workerId: r.workerId,
      date: date,
      regularHours: r.regularHours,
      overtimeHours: r.overtimeHours,
      advance: r.advance,
      paid: r.isPaid || false
    };
  });

  if (payload.length > 0) {
    const { error } = await supabase.from('attendance').upsert(payload, { onConflict: 'id' });
    if (error) throw new Error(error.message);
  }
};

export const markAttendancePaid = async (id) => {
   const { error } = await supabase.from('attendance').update({ paid: true }).eq('id', id); if (error) throw new Error(error.message);
};

export const revertAttendancePaid = async (id) => {
   const { error } = await supabase.from('attendance').update({ paid: false }).eq('id', id); if (error) throw new Error(error.message);
};

export const markAllAttendancePaid = async (projectId) => {
   const { error } = await supabase.from('attendance').update({ paid: true }).eq('projectId', projectId).eq('paid', false); if (error) throw new Error(error.message);
};

export const addAdvanceOnlyRecord = async (workerId, projectId, date, amount) => {
   const { error } = await supabase.from('attendance').insert({
    workerId, projectId, date, regularHours: 0, overtimeHours: 0, advance: amount, paid: false, id: Date.now().toString(), createdAt: new Date().toISOString()
  }); if (error) throw new Error(error.message);
};

export const updateChangeRequestStatus = async (id, status) => {
   const { error } = await supabase.from('change_requests').update({ status }).eq('id', id); if (error) throw new Error(error.message);
};

export const resetDB = async () => {};

export const loginUser = async (email, password) => {
  const { data } = await supabase.from('users').select('*').eq('email', email).eq('password', password).single();
  if (data) return data;

  try {
    const local = localStorage.getItem('const_manage_users');
    if (local) {
      const users = JSON.parse(local);
      return users.find(u => u.email === email && u.password === password);
    }
  } catch(e) {}

  return null;
};
export const updateUserProfile = async (id, name, password) => { 
  const updateData = { name };
  if (password) updateData.password = password;
  const { error } = await supabase.from('users').update(updateData).eq('id', id); 
  if (error) throw new Error(error.message); 
};
