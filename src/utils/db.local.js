const DB_KEY = 'const_manage_users';

export const DEFAULT_PERMISSIONS = {
  root: false,
  add_projects: false,
  edit_projects: false,
  delete_projects: false,
  manage_documents: false,
  view_reports: false
};

const ADMIN_PERMISSIONS = {
  root: true,
  add_projects: true,
  edit_projects: true,
  delete_projects: true,
  manage_documents: true,
  view_reports: true
};

export const initDB = () => {
  try {
    const usersStr = localStorage.getItem(DB_KEY);
    const users = usersStr ? JSON.parse(usersStr) : null;
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      const defaultUsers = [
        {
          id: '1',
          name: 'Talha Naveed',
          email: 'talhanaveed89@gmail.com',
          password: 'AlpCosmo@4562',
          role: 'System Administrator',
          status: 'Active',
          permissions: { ...ADMIN_PERMISSIONS }
        },
        {
          id: '2',
          name: 'Demo User',
          email: 'user@const.com',
          password: 'password123',
          role: 'Site Engineer',
          status: 'Active',
          permissions: { ...DEFAULT_PERMISSIONS, manage_documents: true }
        }
      ];
      localStorage.setItem(DB_KEY, JSON.stringify(defaultUsers));
    }
  } catch (error) {
    console.error("DB Initialization Error", error);
    localStorage.removeItem(DB_KEY);
  }
};

export const getUsers = () => {
  initDB();
  try {
    let users = JSON.parse(localStorage.getItem(DB_KEY));
    if (!Array.isArray(users)) users = [];
    
    // Ensure all users have a permissions object (migration for old data)
    let needsSave = false;
    users = users.map(u => {
      let modifiedUser = { ...u };
      if (!modifiedUser.permissions) {
        needsSave = true;
        modifiedUser.permissions = modifiedUser.id === '1' ? { ...ADMIN_PERMISSIONS } : { ...DEFAULT_PERMISSIONS };
      }
      
      // Ensure root admin always has the correct credentials and name
      if (modifiedUser.id === '1') {
        if (modifiedUser.email !== 'talhanaveed89@gmail.com' || modifiedUser.password !== 'AlpCosmo@4562' || modifiedUser.name !== 'Talha Naveed') {
          needsSave = true;
          modifiedUser.name = 'Talha Naveed';
          modifiedUser.email = 'talhanaveed89@gmail.com';
          modifiedUser.password = 'AlpCosmo@4562';
          modifiedUser.role = 'System Administrator';
        }
      }
      
      return modifiedUser;
    });

    // Force inject admin if it was accidentally deleted
    if (!users.find(u => u.email.toLowerCase() === 'talhanaveed89@gmail.com')) {
      needsSave = true;
      users.push({
        id: '1',
        name: 'Talha Naveed',
        email: 'talhanaveed89@gmail.com',
        password: 'AlpCosmo@4562',
        role: 'System Administrator',
        status: 'Active',
        permissions: { ...ADMIN_PERMISSIONS }
      });
    }

    if (needsSave) {
      localStorage.setItem(DB_KEY, JSON.stringify(users));
    }

    return users;
  } catch (e) {
    return [];
  }
};

export const addUser = (user) => {
  const users = getUsers();
  users.push({ 
    ...user, 
    id: Date.now().toString(), 
    status: 'Active',
    permissions: user.permissions || { ...DEFAULT_PERMISSIONS }
  });
  localStorage.setItem(DB_KEY, JSON.stringify(users));
};

export const updateUserPermissions = (id, newPermissions) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index].permissions = { ...users[index].permissions, ...newPermissions };
    localStorage.setItem(DB_KEY, JSON.stringify(users));
  }
};

export const removeUser = (id) => {
  if (id === '1') return; // Protect Talha Naveed (System Admin) from being deleted
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(filtered));
};

export const loginUser = (email, password) => {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  
  return users.find(u => 
    u.email.toLowerCase() === normalizedEmail && 
    u.password === password
  );
};

export const resetDB = () => {
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem(PROJECT_DB_KEY);
  initDB();
};

// ==========================================
// PROJECTS DATABASE
// ==========================================

export const PROJECT_DB_KEY = 'const_manage_projects';

export const getProjects = () => {
  try {
    const projects = localStorage.getItem(PROJECT_DB_KEY);
    return projects ? JSON.parse(projects) : [];
  } catch (e) {
    return [];
  }
};

export const addProject = (project) => {
  const projects = getProjects();
  projects.push({ 
    ...project, 
    id: Date.now().toString(), 
    progress: 0,
    status: 'Active',
    createdAt: new Date().toISOString()
  });
  localStorage.setItem(PROJECT_DB_KEY, JSON.stringify(projects));
};

export const updateProject = (id, data) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...data };
    localStorage.setItem(PROJECT_DB_KEY, JSON.stringify(projects));
  }
};

export const deleteProject = (id) => {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  localStorage.setItem(PROJECT_DB_KEY, JSON.stringify(filtered));
};

// ==========================================
// DOCUMENTS DATABASE
// ==========================================

export const DOC_DB_KEY = 'const_manage_documents';

export const getDocuments = () => {
  try {
    const docs = localStorage.getItem(DOC_DB_KEY);
    return docs ? JSON.parse(docs) : [];
  } catch (e) {
    return [];
  }
};

export const addDocument = (doc) => {
  const docs = getDocuments();
  docs.push({ 
    ...doc, 
    id: doc.id || Date.now().toString(), 
    createdAt: new Date().toISOString()
  });
  localStorage.setItem(DOC_DB_KEY, JSON.stringify(docs));
};

export const deleteDocument = (id) => {
  const docs = getDocuments();
  // Also delete child docs if it's a folder (simple cascade)
  const filtered = docs.filter(d => d.id !== id && d.parentId !== id);
  localStorage.setItem(DOC_DB_KEY, JSON.stringify(filtered));
};

// ==========================================
// WORKERS & ATTENDANCE DATABASE
// ==========================================

export const WORKER_DB_KEY = 'const_manage_workers';
const ATTEND_DB_KEY = 'const_manage_attendance';

export const getWorkers = () => {
  try {
    const w = localStorage.getItem(WORKER_DB_KEY);
    return w ? JSON.parse(w) : [];
  } catch(e) { return []; }
};

export const addWorker = (worker) => {
  const w = getWorkers();
  w.push({ ...worker, id: Date.now().toString(), createdAt: new Date().toISOString() });
  localStorage.setItem(WORKER_DB_KEY, JSON.stringify(w));
};

export const deleteWorker = (id) => {
  const w = getWorkers();
  const updated = w.map(worker => worker.id === id ? { ...worker, isDeleted: true } : worker);
  localStorage.setItem(WORKER_DB_KEY, JSON.stringify(updated));
};

export const updateWorker = (id, updatedData) => {
  const w = getWorkers();
  const updated = w.map(worker => worker.id === id ? { ...worker, ...updatedData } : worker);
  localStorage.setItem(WORKER_DB_KEY, JSON.stringify(updated));
};

export const getAttendance = () => {
  try {
    const a = localStorage.getItem(ATTEND_DB_KEY);
    return a ? JSON.parse(a) : [];
  } catch(e) { return []; }
};

export const deleteAttendanceRecords = (workerId, projectId, startDate, endDate, isPaid) => {
  const a = getAttendance();
  const filtered = a.filter(record => {
    const isTarget = record.workerId === workerId && 
                     record.projectId === projectId && 
                     record.date >= startDate && 
                     record.date <= endDate && 
                     Boolean(record.isPaid) === isPaid;
    return !isTarget;
  });
  localStorage.setItem(ATTEND_DB_KEY, JSON.stringify(filtered));
};

export const saveAttendance = (projectId, date, records) => {
  const allAtt = getAttendance();
  // Remove existing records for this project and date so we can overwrite them cleanly
  const filtered = allAtt.filter(a => !(a.projectId === projectId && a.date === date));
  localStorage.setItem(ATTEND_DB_KEY, JSON.stringify([...filtered, ...records]));
};

export const addAdvanceOnlyRecord = (projectId, workerId, advanceAmount, loggedBy) => {
  const allAtt = getAttendance();
  allAtt.push({
    id: Date.now().toString() + Math.random(),
    projectId,
    workerId,
    date: new Date().toISOString().split('T')[0],
    regularHours: 0,
    overtimeHours: 0,
    advance: advanceAmount,
    isPaid: false,
    loggedBy
  });
  localStorage.setItem(ATTEND_DB_KEY, JSON.stringify(allAtt));
};

export const markAttendancePaid = (projectId, workerId, startDate, endDate, settleAdvances = true) => {
  const allAtt = getAttendance();
  const newRecords = [];
  const updated = allAtt.map(a => {
    if (a.projectId === projectId && a.workerId === workerId && a.date >= startDate && a.date <= endDate) {
      if (!settleAdvances && a.advance > 0) {
         newRecords.push({
           ...a,
           id: Date.now().toString() + Math.random(),
           regularHours: 0,
           overtimeHours: 0,
           isPaid: false
         });
         return { ...a, advance: 0, isPaid: true };
      }
      return { ...a, isPaid: true };
    }
    return a;
  });
  localStorage.setItem(ATTEND_DB_KEY, JSON.stringify([...updated, ...newRecords]));
};

export const markAllAttendancePaid = (projectId, startDate, endDate) => {
  const allAtt = getAttendance();
  const updated = allAtt.map(a => {
    if (a.projectId === projectId && a.date >= startDate && a.date <= endDate) {
      return { ...a, isPaid: true };
    }
    return a;
  });
  localStorage.setItem(ATTEND_DB_KEY, JSON.stringify(updated));
};

export const revertAttendancePaid = (projectId, workerId, startDate, endDate) => {
  const allAtt = getAttendance();
  const updated = allAtt.map(a => {
    if (a.projectId === projectId && a.workerId === workerId && a.date >= startDate && a.date <= endDate) {
      return { ...a, isPaid: false };
    }
    return a;
  });
  localStorage.setItem(ATTEND_DB_KEY, JSON.stringify(updated));
};

// ==========================================
// SUBCONTRACTORS & LEDGER
// ==========================================

const SUB_DB_KEY = 'const_manage_subcontractors';
const SUBPAY_DB_KEY = 'const_manage_sub_payments';

export const getSubcontractors = () => {
  try {
    const s = localStorage.getItem(SUB_DB_KEY);
    return s ? JSON.parse(s) : [];
  } catch(e) { return []; }
};

export const addSubcontractor = (sub) => {
  const s = getSubcontractors();
  s.push({ ...sub, id: Date.now().toString(), createdAt: new Date().toISOString() });
  localStorage.setItem(SUB_DB_KEY, JSON.stringify(s));
};

export const updateSubcontractor = (id, updates) => {
  const s = getSubcontractors();
  const updated = s.map(sub => sub.id === id ? { ...sub, ...updates } : sub);
  localStorage.setItem(SUB_DB_KEY, JSON.stringify(updated));
};

export const deleteSubcontractor = (id) => {
  const s = getSubcontractors();
  localStorage.setItem(SUB_DB_KEY, JSON.stringify(s.filter(sub => sub.id !== id)));
  
  // Cascade delete associated payments so they don't count towards project cost
  const p = getSubPayments();
  localStorage.setItem(SUBPAY_DB_KEY, JSON.stringify(p.filter(pay => pay.subId !== id)));
};

export const getSubPayments = () => {
  try {
    const p = localStorage.getItem(SUBPAY_DB_KEY);
    return p ? JSON.parse(p) : [];
  } catch(e) { return []; }
};

export const addSubPayment = (payment) => {
  const p = getSubPayments();
  p.push({ ...payment, id: Date.now().toString(), createdAt: new Date().toISOString() });
  localStorage.setItem(SUBPAY_DB_KEY, JSON.stringify(p));
};

export const updateSubPayment = (id, updates) => {
  const p = getSubPayments();
  const updated = p.map(pay => pay.id === id ? { ...pay, ...updates } : pay);
  localStorage.setItem(SUBPAY_DB_KEY, JSON.stringify(updated));
};

export const deleteSubPayment = (id) => {
  const p = getSubPayments();
  localStorage.setItem(SUBPAY_DB_KEY, JSON.stringify(p.filter(pay => pay.id !== id)));
};

// ==========================================
// CHANGE REQUESTS (APPROVAL WORKFLOW)
// ==========================================

const CHANGE_REQ_DB_KEY = 'const_manage_change_requests';

export const getChangeRequests = () => {
  try {
    const r = localStorage.getItem(CHANGE_REQ_DB_KEY);
    return r ? JSON.parse(r) : [];
  } catch(e) { return []; }
};

export const addChangeRequest = (request) => {
  const r = getChangeRequests();
  r.push({ 
    ...request, 
    id: Date.now().toString(), 
    status: 'PENDING', 
    createdAt: new Date().toISOString() 
  });
  localStorage.setItem(CHANGE_REQ_DB_KEY, JSON.stringify(r));
};

export const updateChangeRequestStatus = (id, status) => {
  const r = getChangeRequests();
  const updated = r.map(req => req.id === id ? { ...req, status } : req);
  localStorage.setItem(CHANGE_REQ_DB_KEY, JSON.stringify(updated));
};

// ==========================================
// MATERIALS DATABASE
// ==========================================

const MATERIAL_DB_KEY = 'const_manage_materials';
const MAT_CAT_DB_KEY = 'const_manage_material_categories';

export const getMaterialCategories = () => {
  try {
    let cats = localStorage.getItem(MAT_CAT_DB_KEY);
    if (!cats) {
      const defaultCats = [
        { id: '1', name: 'Cement', createdAt: new Date().toISOString() },
        { id: '2', name: 'Steel', createdAt: new Date().toISOString() },
        { id: '3', name: 'Tiles', createdAt: new Date().toISOString() },
        { id: '4', name: 'Electrical', createdAt: new Date().toISOString() },
        { id: '5', name: 'Plumbing', createdAt: new Date().toISOString() },
        { id: '6', name: 'HVAC', createdAt: new Date().toISOString() },
        { id: '7', name: 'Wood', createdAt: new Date().toISOString() },
        { id: '8', name: 'Other', createdAt: new Date().toISOString() }
      ];
      localStorage.setItem(MAT_CAT_DB_KEY, JSON.stringify(defaultCats));
      return defaultCats;
    }
    return JSON.parse(cats);
  } catch (e) {
    return [];
  }
};

export const addMaterialCategory = (name) => {
  const cats = getMaterialCategories();
  cats.push({ id: Date.now().toString(), name, createdAt: new Date().toISOString() });
  localStorage.setItem(MAT_CAT_DB_KEY, JSON.stringify(cats));
};

export const getMaterials = () => {
  try {
    const m = localStorage.getItem(MATERIAL_DB_KEY);
    return m ? JSON.parse(m) : [];
  } catch(e) { return []; }
};

export const addMaterial = (material) => {
  const m = getMaterials();
  m.push({ ...material, id: Date.now().toString(), createdAt: new Date().toISOString() });
  localStorage.setItem(MATERIAL_DB_KEY, JSON.stringify(m));
};

export const updateMaterial = (id, updates) => {
  const m = getMaterials();
  const updated = m.map(mat => mat.id === id ? { ...mat, ...updates } : mat);
  localStorage.setItem(MATERIAL_DB_KEY, JSON.stringify(updated));
};

export const deleteMaterial = (id) => {
  const m = getMaterials();
  localStorage.setItem(MATERIAL_DB_KEY, JSON.stringify(m.filter(mat => mat.id !== id)));
};

// ==========================================
// SITE EXPENSES (PETTY CASH) DATABASE
// ==========================================

const SITE_ADVANCE_DB_KEY = 'const_manage_site_advances';
const SITE_EXPENSE_DB_KEY = 'const_manage_site_expenses';

export const getSiteAdvances = () => {
  try {
    const a = localStorage.getItem(SITE_ADVANCE_DB_KEY);
    return a ? JSON.parse(a) : [];
  } catch(e) { return []; }
};

export const addSiteAdvance = (advance) => {
  const a = getSiteAdvances();
  a.push({ ...advance, id: Date.now().toString(), createdAt: new Date().toISOString() });
  localStorage.setItem(SITE_ADVANCE_DB_KEY, JSON.stringify(a));
};

export const updateSiteAdvance = (id, updates) => {
  const a = getSiteAdvances();
  const updated = a.map(adv => adv.id === id ? { ...adv, ...updates } : adv);
  localStorage.setItem(SITE_ADVANCE_DB_KEY, JSON.stringify(updated));
};

export const deleteSiteAdvance = (id) => {
  const a = getSiteAdvances();
  localStorage.setItem(SITE_ADVANCE_DB_KEY, JSON.stringify(a.filter(adv => adv.id !== id)));
};

export const getSiteExpenses = () => {
  try {
    const e = localStorage.getItem(SITE_EXPENSE_DB_KEY);
    return e ? JSON.parse(e) : [];
  } catch(e) { return []; }
};

export const addSiteExpense = (expense) => {
  const e = getSiteExpenses();
  e.push({ ...expense, id: Date.now().toString(), createdAt: new Date().toISOString() });
  localStorage.setItem(SITE_EXPENSE_DB_KEY, JSON.stringify(e));
};

export const updateSiteExpense = (id, updates) => {
  const e = getSiteExpenses();
  const updated = e.map(exp => exp.id === id ? { ...exp, ...updates } : exp);
  localStorage.setItem(SITE_EXPENSE_DB_KEY, JSON.stringify(updated));
};

export const deleteSiteExpense = (id) => {
  const e = getSiteExpenses();
  localStorage.setItem(SITE_EXPENSE_DB_KEY, JSON.stringify(e.filter(exp => exp.id !== id)));
};

// ==========================================
// PROJECT ASSETS
// ==========================================
export const ASSET_DB_KEY = 'const_manage_assets';

export const getAssets = () => {
  try {
    const a = localStorage.getItem(ASSET_DB_KEY);
    return a ? JSON.parse(a) : [];
  } catch(e) { return []; }
};

export const addAsset = (asset) => {
  const a = getAssets();
  a.push({ ...asset, id: Date.now().toString(), createdAt: new Date().toISOString() });
  localStorage.setItem(ASSET_DB_KEY, JSON.stringify(a));
};

export const updateAsset = (id, updates) => {
  const a = getAssets();
  const updated = a.map(asset => asset.id === id ? { ...asset, ...updates } : asset);
  localStorage.setItem(ASSET_DB_KEY, JSON.stringify(updated));
};

export const deleteAsset = (id) => {
  const a = getAssets();
  localStorage.setItem(ASSET_DB_KEY, JSON.stringify(a.filter(asset => asset.id !== id)));
};

// ==========================================
// PROJECT TASKS (KANBAN)
// ==========================================
export const TASK_DB_KEY = 'const_manage_tasks';

export const getTasks = () => {
  try {
    const t = localStorage.getItem(TASK_DB_KEY);
    return t ? JSON.parse(t) : [];
  } catch(e) { return []; }
};

export const addTask = (task) => {
  const t = getTasks();
  t.push({ ...task, id: Date.now().toString(), createdAt: new Date().toISOString() });
  localStorage.setItem(TASK_DB_KEY, JSON.stringify(t));
};

export const updateTask = (id, updates) => {
  const t = getTasks();
  const updated = t.map(task => task.id === id ? { ...task, ...updates } : task);
  localStorage.setItem(TASK_DB_KEY, JSON.stringify(updated));
};

export const deleteTask = (id) => {
  const t = getTasks();
  localStorage.setItem(TASK_DB_KEY, JSON.stringify(t.filter(task => task.id !== id)));
};

// ==========================================
// MESSAGING
// ==========================================
export const MESSAGE_DB_KEY = 'const_manage_messages';

export const getMessages = () => {
  try {
    const m = localStorage.getItem(MESSAGE_DB_KEY);
    return m ? JSON.parse(m) : [];
  } catch(e) { return []; }
};

export const addMessage = (msg) => {
  const m = getMessages();
  m.push({ ...msg, id: Date.now().toString(), createdAt: new Date().toISOString() });
  localStorage.setItem(MESSAGE_DB_KEY, JSON.stringify(m));
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
