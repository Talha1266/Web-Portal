import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, HardHat, FileText, MessageSquare, LogOut, Plus, Edit2, Trash2, PieChart, Shield, X, MapPin, Building, Calendar, Users, Folder, FolderPlus, UploadCloud, ChevronRight, ArrowLeft, CheckSquare, Settings, ClipboardList, DollarSign, CheckCircle, Briefcase, Package, CreditCard, Truck, AlertTriangle, Menu, Unlock, Printer } from 'lucide-react';
import { getUsers, getProjects, addProject, updateProject, deleteProject, getDocuments, addDocument, deleteDocument, getWorkers, addWorker, deleteWorker, getAttendance, saveAttendance, markAttendancePaid, markAllAttendancePaid, deleteAttendanceRecords, getSubcontractors, addSubcontractor, updateSubcontractor, deleteSubcontractor, getSubPayments, addSubPayment, deleteSubPayment, updateSubPayment, getChangeRequests, addChangeRequest, updateChangeRequestStatus, getMaterials, addMaterial, updateMaterial, deleteMaterial, getMaterialCategories, addMaterialCategory, getSiteAdvances, addSiteAdvance, updateSiteAdvance, deleteSiteAdvance, getSiteExpenses, addSiteExpense, updateSiteExpense, deleteSiteExpense, addAdvanceOnlyRecord, revertAttendancePaid, getAssets, addAsset, updateAsset, deleteAsset, saveFileContentToDB, getFileContentFromDB, deleteFileContentFromDB, getTasks, addTask, updateTask, deleteTask, getMessages, addMessage, updateUserProfile } from '../utils/db';
import { supabase } from '../supabaseClient';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // Navigation State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [activeProjectId, setActiveProjectId] = useState(null); 
  const [projectTab, setProjectTab] = useState('overview'); // overview, documents, attendance, payroll, tasks, settings
  
  // Data State
  const [allUsers, setAllUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [allSubcontractors, setAllSubcontractors] = useState([]);
  const [allSubPayments, setAllSubPayments] = useState([]);
  const [allChangeRequests, setAllChangeRequests] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [materialCategories, setMaterialCategories] = useState([]);
  const [allSiteAdvances, setAllSiteAdvances] = useState([]);
  const [allSiteExpenses, setAllSiteExpenses] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [activeChannel, setActiveChannel] = useState('global');
  const [messageText, setMessageText] = useState('');
  
  // Modals - Projects
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pLocation, setPLocation] = useState('');
  const [pClient, setPClient] = useState('');
  const [pStartDate, setPStartDate] = useState('');
  const [pAssigned, setPAssigned] = useState([]);
  const [editProjectForm, setEditProjectForm] = useState({ name: '', description: '', location: '', client: '', status: '', assignedUsers: [] });

  // Modals - Documents
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Modals - Attendance & Payroll
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceForm, setAttendanceForm] = useState({});
  const [isAttendanceDirty, setIsAttendanceDirty] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [wName, setWName] = useState('');
  const [wTrade, setWTrade] = useState('');
  const [wWage, setWWage] = useState(''); // Daily Wage
  
  const [payrollStart, setPayrollStart] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0]; });
  const [payrollEnd, setPayrollEnd] = useState(new Date().toISOString().split('T')[0]);
  const [payrollViewMode, setPayrollViewMode] = useState('outstanding'); // 'outstanding' or 'history'

  // Modals & State - Subcontractors
  const [activeSubId, setActiveSubId] = useState(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [subTrade, setSubTrade] = useState('');
  
  const [isSubPayModalOpen, setIsSubPayModalOpen] = useState(false);
  const [subPayMode, setSubPayMode] = useState('add'); // 'add' or 'edit'
  const [activeSubPayId, setActiveSubPayId] = useState(null);
  const [subPayDate, setSubPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [subPayAmount, setSubPayAmount] = useState('');
  const [subPayDesc, setSubPayDesc] = useState('');

  // Modals & State - Materials
  const [activeMaterialCategory, setActiveMaterialCategory] = useState('All');
  const [materialViewMode, setMaterialViewMode] = useState('active'); // 'active' or 'history'
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [mCategory, setMCategory] = useState('');
  const [mName, setMName] = useState('');
  const [mPrice, setMPrice] = useState('');
  const [mQty, setMQty] = useState('');
  const [mKaraya, setMKaraya] = useState('');
  const [mOrderDate, setMOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [mReceipt, setMReceipt] = useState(null); // Base64 image
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  // Modals & State - Site Expenses
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advDate, setAdvDate] = useState(new Date().toISOString().split('T')[0]);
  const [advAmount, setAdvAmount] = useState('');
  const [advDesc, setAdvDesc] = useState('');
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expPaidBy, setExpPaidBy] = useState('Engineer');
  const [expReceipt, setExpReceipt] = useState(null);

  // Modals & State - Labour Settle with Advance
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleWorkerId, setSettleWorkerId] = useState(null);
  const [settleAdvance, setSettleAdvance] = useState('');
  const [settleAdvancesFlag, setSettleAdvancesFlag] = useState(true);
  
  const [isWorkerAdvanceModalOpen, setIsWorkerAdvanceModalOpen] = useState(false);
  const [workerAdvanceWorkerId, setWorkerAdvanceWorkerId] = useState(null);
  const [workerAdvanceAmount, setWorkerAdvanceAmount] = useState('');

  const [isEditWorkerModalOpen, setIsEditWorkerModalOpen] = useState(false);
  const [editWorkerObj, setEditWorkerObj] = useState(null);
  const [ewName, setEwName] = useState('');
  const [ewTrade, setEwTrade] = useState('');
  const [ewWage, setEwWage] = useState('');
  const [adminUnlockPast, setAdminUnlockPast] = useState(false);

  // Time Lock Utility: Returns true if the entry is from today or if admin has unlocked the past
  const canModifyEntry = (dateStr) => {
    if ((currentUser?.permissions?.root || currentUser?.permissions?.unlock_past) && adminUnlockPast) return true;
    if (!dateStr) return true;
    const entryDate = new Date(dateStr);
    const today = new Date();
    entryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return entryDate.getTime() >= today.getTime();
  };

  const todayStrGlobal = new Date().toISOString().split('T')[0];

  // Modals & State - Image Viewer
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState(null);

  // Modals & State - Assets
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  
  // Modals & State - Reports
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportPreviewActive, setIsReportPreviewActive] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    startDate: '',
    endDate: '',
    includeMaterials: true,
    includeLabour: true,
    includeSubcontractors: true,
  });

  // Modals & State - Security Challenge
  const [securityChallenge, setSecurityChallenge] = useState({
    isOpen: false,
    title: '',
    expectedWord: '',
    onConfirm: null,
    inputText: ''
  });

  const triggerSecurityChallenge = (title, expectedWord, onConfirm) => {
    setSecurityChallenge({
      isOpen: true,
      title,
      expectedWord,
      onConfirm,
      inputText: ''
    });
  };

  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [assetQty, setAssetQty] = useState(1);
  const [assetDate, setAssetDate] = useState(new Date().toISOString().split('T')[0]);
  const [assetNotes, setAssetNotes] = useState('');

  // Modals & State - Tasks
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGlobalTasksModalOpen, setIsGlobalTasksModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const loadData = async () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    
    const [
      users, docs, workers, attendance, subs, 
      rawSubPayments, crs, mats, matCats, advances, 
      expenses, assets, tasks, messages, allProj
    ] = await Promise.all([
      getUsers(), getDocuments(), getWorkers(), getAttendance(), getSubcontractors(),
      getSubPayments(), getChangeRequests(), getMaterials(), getMaterialCategories(), getSiteAdvances(),
      getSiteExpenses(), getAssets(), getTasks(), getMessages(), getProjects()
    ]);

    setAllUsers(users);
    setAllDocs(docs);
    setAllWorkers(workers);
    setAllAttendance(attendance);
    setAllSubcontractors(subs);
    
    // Clean up orphaned payments on load in case they were left behind before the cascade delete patch
    const subPayments = rawSubPayments.filter(p => subs.some(s => s.id === p.subId));
    setAllSubPayments(subPayments);
    
    setAllChangeRequests(crs);
    setAllMaterials(mats);
    setMaterialCategories(matCats);
    setAllSiteAdvances(advances);
    setAllSiteExpenses(expenses);
    setAllAssets(assets);
    setAllTasks(tasks);
    setAllMessages(messages);
    
    if (user.permissions?.root) {
      setProjects(allProj);
    } else {
      setProjects(allProj.filter(p => {
        let users = [];
        try { users = typeof p.assignedUsers === 'string' ? JSON.parse(p.assignedUsers) : (p.assignedUsers || []); } catch(e) {}
        return p.createdBy === user.id || users.includes(user.id);
      }));
    }
  };

  const calculateTotalProjectCost = (projectId) => {
    let labourTotal = 0;
    const projAtt = allAttendance.filter(a => a.projectId === projectId);
    projAtt.forEach(record => {
      const worker = allWorkers.find(w => w.id === record.workerId);
      if (worker) {
        const hourly = (record.dailyWage !== undefined ? record.dailyWage : (worker.dailyWage || 0)) / 8;
        labourTotal += ((record.regularHours || 0) + (record.overtimeHours || 0)) * hourly;
      }
    });

    const subTotal = allSubPayments.filter(p => p.projectId === projectId).reduce((acc, p) => acc + (p.amount || 0), 0);
    const matTotal = allMaterials.filter(m => m.projectId === projectId && m.isArrived).reduce((acc, m) => acc + (m.totalCost || 0), 0);
    const expTotal = allSiteExpenses.filter(e => e.projectId === projectId).reduce((acc, e) => acc + (e.amount || 0), 0);

    return labourTotal + subTotal + matTotal + expTotal;
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  // Auto-relock when navigating between major tabs or changing projects
  useEffect(() => {
    setAdminUnlockPast(false);
  }, [activeTab, projectTab, activeProjectId]);

  useEffect(() => {
    if (activeProjectId) {
      const todayRecords = allAttendance.filter(a => a.projectId === activeProjectId && a.date === attendanceDate);
      const projWorkers = allWorkers.filter(w => w.projectId === activeProjectId);
      const form = {};
      projWorkers.forEach(w => {
         const record = todayRecords.find(r => r.workerId === w.id);
         if (record) {
           form[w.id] = { isPresent: record.regularHours > 0, regularHours: record.regularHours, overtimeHours: record.overtimeHours, advance: record.advance || 0, isPaid: record.paid || false, id: record.id, dailyWage: record.dailyWage };
         } else {
           form[w.id] = { isPresent: false, regularHours: 0, overtimeHours: 0, advance: 0, isPaid: false, id: null, dailyWage: w.dailyWage };
         }
      });
      setAttendanceForm(form);
      setIsAttendanceDirty(false); // Clean slate on load

      const currentProj = projects.find(p => p.id === activeProjectId);
      if (currentProj) {
        setEditProjectForm({
          name: currentProj.name || '',
          description: currentProj.description || '',
          location: currentProj.location || '',
          client: currentProj.client || '',
          status: currentProj.status || 'Active',
          assignedUsers: currentProj.assignedUsers || []
        });
      }
    }
  }, [activeProjectId, attendanceDate, allAttendance, allWorkers, projects]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await supabase.auth.signOut();
      localStorage.removeItem('currentUser');
      navigate('/login');
    }
  };

  const handleNav = async (action) => {
    if (isAttendanceDirty) {
      if (!window.confirm("You have unsaved attendance changes. Are you sure you want to leave without saving?")) {
        return;
      }
      setIsAttendanceDirty(false);
    }
    action();
    setIsMobileMenuOpen(false);
  };

  const handleOpenProject = async (id) => {
    setActiveProjectId(id);
    setProjectTab('overview');
    setCurrentFolderId(null);
    setActiveSubId(null);
  };

const [profileName, setProfileName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (currentUser) setProfileName(currentUser.name);
  }, [currentUser]);

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) return "Password must contain at least one special character.";
    return null;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (oldPassword !== currentUser.password) {
      setPasswordError("Incorrect old password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }

    try {
      await updateUserProfile(currentUser.id, currentUser.name, newPassword);
      const updated = { ...currentUser, password: newPassword };
      localStorage.setItem('currentUser', JSON.stringify(updated));
      setCurrentUser(updated);
      setIsPasswordModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert("Password updated successfully!");
    } catch(err) {
      setPasswordError('Error: ' + err.message);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage('');
    try {
      await updateUserProfile(currentUser.id, profileName, currentUser.password);
      const updated = { ...currentUser, name: profileName };
      localStorage.setItem('currentUser', JSON.stringify(updated));
      setCurrentUser(updated);
      setProfileMessage('Profile updated successfully!');
    } catch(err) {
      setProfileMessage('Error: ' + err.message);
    }
    setIsUpdatingProfile(false);
  };

  const handleCloseProject = () => setActiveProjectId(null);

  // --- Projects Logic ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await addProject({
        name: pName, description: pDesc, location: pLocation,
        client: pClient, startDate: pStartDate, assignedUsers: [...new Set([currentUser?.id, ...pAssigned])],
        createdBy: currentUser.id
      });
      setPName(''); setPDesc(''); setPLocation(''); setPClient(''); setPStartDate(''); setPAssigned([]);
      setIsCreateModalOpen(false);
      await loadData();
      alert("Project created successfully!");
    } catch (err) {
      alert("Error adding project: " + err.message);
    }
  };

  const toggleAssignUser = (id) => setPAssigned(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  const handleDeleteProject = async (e, id) => { 
    e.stopPropagation(); 
    triggerSecurityChallenge("Are you sure you want to delete this project? This action cannot be undone and will orphan all associated data.", "DELETE", async () => {
      await deleteProject(id); 
      await loadData(); 
    });
  };

  const handleUpdateProjectDetails = async (e) => {
    e.preventDefault();
    triggerSecurityChallenge("Update Project Details?", "CONFIRM", async () => {
      try {
        await updateProject(activeProjectId, {
          name: editProjectForm.name,
          description: editProjectForm.description,
          location: editProjectForm.location,
          client: editProjectForm.client,
          status: editProjectForm.status,
          progress: editProjectForm.progress
        });
        await loadData();
        setEditProjectForm(null);
      } catch (err) {
        alert(err.message);
      }
    });
  };

  // --- Documents Logic ---
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    await addDocument({ type: 'folder', name: newFolderName, projectId: activeProjectId, parentId: currentFolderId, createdBy: currentUser.id });
    setNewFolderName(''); setIsFolderModalOpen(false); await loadData();
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
    const sizeStr = sizeInMB >= 0.01 ? `${sizeInMB} MB` : `${(selectedFile.size / 1024).toFixed(1)} KB`;
    
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async (event) => {
      const docId = Date.now().toString();
      await saveFileContentToDB(docId, event.target.result).then(async () => {
        await addDocument({ 
          id: docId,
          type: 'file', 
          name: selectedFile.name, 
          size: sizeStr, 
          hasIDBContent: true,
          projectId: activeProjectId, 
          parentId: currentFolderId, 
          createdBy: currentUser.id 
        });
        setSelectedFile(null); 
        setIsUploadModalOpen(false); 
        await loadData();
      }).catch(err => {
        console.error(err);
        alert("Failed to save large file locally.");
      });
    };
  };

  const handleDeleteDoc = async (e, id) => { 
    e.stopPropagation(); 
    await deleteDocument(id); 
    await deleteFileContentFromDB(id).catch(err => console.error(err));
    await loadData(); 
  };

  // --- Attendance Logic ---
  const handleCreateWorker = async (e) => {
    e.preventDefault();
    try {
      await addWorker({ projectId: activeProjectId, name: wName, trade: wTrade, dailyWage: Number(wWage), createdBy: currentUser.id });
      setWName(''); setWTrade(''); setWWage(''); setIsWorkerModalOpen(false); await loadData();
      alert("Worker added successfully!");
    } catch (err) {
      alert("Database Schema Error: " + err.message);
    }
  };

  const handleDeleteWorker = async (e, id) => {
    e.stopPropagation();
    triggerSecurityChallenge("Are you sure you want to delete this labourer?", "DELETE", async () => {
      await deleteWorker(id);
      await loadData();
    });
  };

  const handleOpenEditWorker = async (worker) => {
    setEditWorkerObj(worker);
    setEwName(worker.name);
    setEwTrade(worker.trade);
    setEwWage(worker.dailyWage || '');
    setIsEditWorkerModalOpen(true);
  };

  const handleEditWorkerSubmit = async (e) => {
    e.preventDefault();
    await updateWorker(editWorkerObj.id, {
      name: ewName,
      trade: ewTrade,
      dailyWage: Number(ewWage)
    });
    setIsEditWorkerModalOpen(false);
    setEditWorkerObj(null);
    await loadData();
  };

  const handleAttendanceChange = async (workerId, field, value) => {
    setIsAttendanceDirty(true);
    setAttendanceForm(prev => {
      const current = prev[workerId] || { isPresent: false, regularHours: 0, overtimeHours: 0, advance: 0, isPaid: false, id: null };
      const next = { ...current, [field]: value };
      if (field === 'isPresent') {
        next.regularHours = value ? 8 : 0;
        if (!value) next.overtimeHours = 0;
      }
      return { ...prev, [workerId]: next };
    });
  };

  const handleSaveAttendance = async () => {
    try {
      const recordsToSave = [];
      Object.keys(attendanceForm).forEach(wId => {
        const data = attendanceForm[wId];
        if (data.regularHours > 0 || data.overtimeHours > 0 || data.advance > 0) {
          const worker = allWorkers.find(w => w.id === wId);
          recordsToSave.push({
            id: data.id || (Date.now().toString() + Math.random()),
            projectId: activeProjectId,
            date: attendanceDate,
            workerId: wId,
            regularHours: Number(data.regularHours) || 0,
            overtimeHours: Number(data.overtimeHours) || 0,
            advance: Number(data.advance) || 0,
            dailyWage: data.dailyWage !== undefined ? data.dailyWage : (worker ? worker.dailyWage : 0),
            isPaid: data.isPaid || false,
            loggedBy: currentUser.id
          });
        }
      });

      const canModify = canModifyEntry(attendanceDate);

      if (canModify) {
        await saveAttendance(activeProjectId, attendanceDate, recordsToSave);
        setIsAttendanceDirty(false);
        await loadData();
        alert('Attendance Saved Successfully');
      } else {
        await addChangeRequest({
          type: 'EDIT_ATTENDANCE',
          targetId: `${activeProjectId}-${attendanceDate}`,
          requestedBy: currentUser.id,
          payload: { projectId: activeProjectId, date: attendanceDate, recordsToSave }
        });
        setIsAttendanceDirty(false);
        await loadData();
        alert('Attendance modification request sent to Admin.');
      }
    } catch (err) {
      alert("Error saving attendance: " + err.message);
    }
  };

  const handleOpenSettleModal = async (wId) => {
    setSettleWorkerId(wId);
    setSettleAdvance('');
    setSettleAdvancesFlag(true);
    setIsSettleModalOpen(true);
  };

  const handleConfirmSettle = async (e) => {
    e.preventDefault();
    if (window.confirm(`Are you sure you want to mark these wages as paid?${!settleAdvancesFlag ? ' (Note: Advances will remain outstanding)' : ''}`)) {
      await markAttendancePaid(activeProjectId, settleWorkerId, payrollStart, payrollEnd, settleAdvancesFlag);
      
      if (Number(settleAdvance) > 0) {
         await addAdvanceOnlyRecord(activeProjectId, settleWorkerId, Number(settleAdvance), currentUser.id);
      }
      
      setIsSettleModalOpen(false);
      setSettleWorkerId(null);
      setSettleAdvance('');
      await loadData();
    }
  };

  const handleOpenWorkerAdvanceModal = (wId) => {
    setWorkerAdvanceWorkerId(wId);
    setWorkerAdvanceAmount('');
    setIsWorkerAdvanceModalOpen(true);
  };
  
  const handleConfirmWorkerAdvance = async (e) => {
    e.preventDefault();
    if (Number(workerAdvanceAmount) > 0) {
      await addAdvanceOnlyRecord(activeProjectId, workerAdvanceWorkerId, Number(workerAdvanceAmount), currentUser.id);
      setIsWorkerAdvanceModalOpen(false);
      setWorkerAdvanceWorkerId(null);
      setWorkerAdvanceAmount('');
      await loadData();
      alert("Advance issued successfully!");
    }
  };

  const handleRevertPaid = async (wId, sortedDates) => {
    const mostRecentDate = sortedDates[sortedDates.length - 1];
    const canModify = canModifyEntry(mostRecentDate);

    if (canModify) {
      if (window.confirm("Are you sure you want to revert these wages back to Unpaid?")) {
        await revertAttendancePaid(activeProjectId, wId, payrollStart, payrollEnd);
        await loadData();
      }
    } else {
      if (window.confirm("These records are older than 24 hours. Request Admin approval to revert?")) {
        await addChangeRequest({
          type: 'REVERT_ATTENDANCE',
          targetId: `${activeProjectId}-${wId}-${payrollStart}`,
          requestedBy: currentUser.id,
          payload: { projectId: activeProjectId, workerId: wId, startDate: payrollStart, endDate: payrollEnd }
        });
        await loadData();
        alert('Revert request sent to Admin.');
      }
    }
  };

  const handleMarkAllPaid = async () => {
    if (window.confirm("Are you sure you want to mark ALL outstanding wages in this date range as paid?")) {
      await markAllAttendancePaid(activeProjectId, payrollStart, payrollEnd);
      await loadData();
    }
  };

  // --- Subcontractor Logic ---
  const handleCreateSub = async (e) => {
    e.preventDefault();
    await addSubcontractor({ projectId: activeProjectId, name: subName, trade: subTrade, finalValue: null });
    setSubName(''); setSubTrade(''); setIsSubModalOpen(false); await loadData();
  };

  const handleUpdateSubValue = async (subId, value) => {
    const val = value === '' ? null : Number(value);
    await updateSubcontractor(subId, { finalValue: val });
    await loadData();
  };

  const handleDeleteSub = async (e, id) => {
    e.stopPropagation();
    triggerSecurityChallenge("Delete this subcontractor and all their ledger history?", "DELETE", async () => {
      await deleteSubcontractor(id);
      await loadData();
      if (activeSubId === id) setActiveSubId(null);
    });
  };

  const handleCreateSubPay = async (e) => {
    e.preventDefault();
    if (subPayMode === 'add') {
      await addSubPayment({ subId: activeSubId, projectId: activeProjectId, date: subPayDate, amount: Number(subPayAmount), description: subPayDesc });
      await loadData();
    } else {
      const payment = allSubPayments.find(p => p.id === activeSubPayId);
      const canModify = payment ? canModifyEntry(payment.createdAt) : true;

      const payload = { date: subPayDate, amount: Number(subPayAmount), description: subPayDesc };
      if (canModify) {
        await updateSubPayment(activeSubPayId, payload);
        await loadData();
      } else {
        await addChangeRequest({
          type: 'EDIT_SUB_PAYMENT',
          targetId: activeSubPayId,
          requestedBy: currentUser.id,
          payload
        });
        await loadData();
        alert('Payment modification request sent to Admin.');
      }
    }
    setSubPayDate(new Date().toISOString().split('T')[0]); setSubPayAmount(''); setSubPayDesc(''); setIsSubPayModalOpen(false);
  };

  const handleDeleteSubPay = async (e, payment) => {
    e.stopPropagation();
    const canModify = canModifyEntry(payment.createdAt);

    if (canModify) {
      triggerSecurityChallenge("Delete this payment record?", "DELETE", async () => {
        await deleteSubPayment(payment.id);
        await loadData();
      });
    } else {
      if (window.confirm("This payment is older than 24 hours. Request Root Admin approval to delete it?")) {
        await addChangeRequest({
          type: 'DELETE_SUB_PAYMENT',
          targetId: payment.id,
          requestedBy: currentUser.id,
          payload: { amount: payment.amount, description: payment.description, date: payment.date }
        });
        await loadData();
        alert('Deletion request sent to Admin.');
      }
    }
  };

  // --- Approvals Logic ---
  const handleApproveRequest = async (req) => {
    if (req.type === 'DELETE_SUB_PAYMENT') {
      await deleteSubPayment(req.targetId);
    } else if (req.type === 'EDIT_SUB_PAYMENT') {
      await updateSubPayment(req.targetId, req.payload);
    } else if (req.type === 'EDIT_ATTENDANCE') {
      await saveAttendance(req.payload.projectId, req.payload.date, req.payload.recordsToSave);
    } else if (req.type === 'REVERT_ATTENDANCE') {
      await revertAttendancePaid(req.payload.projectId, req.payload.workerId, req.payload.startDate, req.payload.endDate);
    } else if (req.type === 'DELETE_MATERIAL') {
      await deleteMaterial(req.targetId);
    } else if (req.type === 'EDIT_MATERIAL') {
      await updateMaterial(req.targetId, req.payload);
    } else if (req.type === 'DELETE_SITE_ADVANCE') {
      await deleteSiteAdvance(req.targetId);
    } else if (req.type === 'DELETE_SITE_EXPENSE') {
      await deleteSiteExpense(req.targetId);
    }
    await updateChangeRequestStatus(req.id, 'APPROVED');
    await loadData();
  };

  const handleRejectRequest = async (reqId) => {
    await updateChangeRequestStatus(reqId, 'REJECTED');
    await loadData();
  };

  // --- Materials Logic ---
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (newCatName.trim() === '') return;
    await addMaterialCategory(newCatName.trim());
    setNewCatName('');
    setIsCategoryModalOpen(false);
    await loadData();
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      await addAsset({
        projectId: activeProjectId,
        name: assetName,
        type: assetType,
        quantity: Number(assetQty) || 1,
        dateMobilized: assetDate,
        notes: assetNotes,
        status: 'Mobilized',
        dateReturned: null
      });
      setAssetName(''); setAssetType(''); setAssetQty(1); setAssetNotes(''); setAssetDate(new Date().toISOString().split('T')[0]);
      setIsAssetModalOpen(false);
      await loadData();
      alert("Asset added successfully!");
    } catch (err) {
      alert("Database Schema Error: " + err.message);
    }
  };

  const handleReturnAsset = async (id) => {
    await updateAsset(id, {
      status: 'Returned',
      dateReturned: new Date().toISOString().split('T')[0]
    });
    await loadData();
  };

  const handleDeleteAsset = async (id) => {
    triggerSecurityChallenge('Delete this asset record?', 'DELETE', async () => {
      await deleteAsset(id);
      await loadData();
    });
  };

  // --- Kanban Tasks Logic ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    await addTask({
      projectId: activeProjectId,
      title: taskTitle,
      description: taskDesc,
      status: 'TODO',
      assignedTo: taskAssignee,
      priority: taskPriority,
      dueDate: taskDueDate
    });
    setTaskTitle(''); setTaskDesc(''); setTaskAssignee(''); setTaskPriority('MEDIUM'); setTaskDueDate('');
    setIsTaskModalOpen(false);
    await loadData();
  };

  const handleDeleteTask = async (e, id) => {
    e.stopPropagation();
    triggerSecurityChallenge('Delete this task?', 'DELETE', async () => {
      await deleteTask(id);
      await loadData();
    });
  };

  const handleDragStart = async (e, id) => {
    e.dataTransfer.setData('taskId', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = async (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      await updateTask(taskId, { status });
      await loadData();
    }
    setDraggedTaskId(null);
  };

  const handleDeletePayrollRecord = async (workerId) => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete these attendance and payroll records? This action cannot be undone.")) {
      return;
    }
    const isPaid = payrollViewMode === 'history';
    await deleteAttendanceRecords(workerId, activeProjectId, payrollStart, payrollEnd, isPaid);
    await loadData();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    await addMessage({
      channelId: activeChannel,
      senderId: currentUser.id,
      text: messageText.trim()
    });
    setMessageText('');
    await loadData();
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      await addMaterial({
        projectId: activeProjectId,
        category: mCategory,
        itemName: mName,
        unitPrice: Number(mPrice),
        quantity: Number(mQty),
        karaya: Number(mKaraya) || 0,
        totalCost: (Number(mPrice) * Number(mQty)) + (Number(mKaraya) || 0),
        orderDate: mOrderDate,
        receiptImage: mReceipt,
        isArrived: false,
        isPaid: false
      });
      setMCategory(''); setMName(''); setMPrice(''); setMQty(''); setMKaraya(''); setMOrderDate(new Date().toISOString().split('T')[0]); setMReceipt(null);
      setIsMaterialModalOpen(false);
      await loadData();
      alert("Material added successfully!");
    } catch (err) {
      alert("Database Schema Error: " + err.message);
    }
  };

  const handleToggleMaterial = async (id, field, currentValue, createdAt) => {
    const canModify = canModifyEntry(createdAt);
    const material = allMaterials.find(m => m.id === id);

    let payload = { [field]: !currentValue };
    let remainingMaterial = null;

    if (field === 'isArrived' && !currentValue) {
      const receivedQtyStr = prompt('How many units were actually received?', material.quantity);
      if (receivedQtyStr === null) return; // User cancelled

      const receivedQty = Number(receivedQtyStr);
      if (isNaN(receivedQty) || receivedQty < 0) {
        alert('Invalid quantity entered.');
        return;
      }

      const originalQuantity = Number(material.orderedQuantity || material.quantity);
      payload.orderedQuantity = originalQuantity;
      payload.quantity = receivedQty;
      payload.totalCost = (receivedQty * Number(material.unitPrice)) + Number(material.karaya);

      // If received less than ordered, create a new pending entry for the remainder
      if (receivedQty < originalQuantity) {
        const remainingQty = originalQuantity - receivedQty;
        remainingMaterial = {
          ...material,
          id: undefined, // Let addMaterial assign a new ID
          quantity: remainingQty,
          orderedQuantity: remainingQty,
          totalCost: (remainingQty * Number(material.unitPrice)) + Number(material.karaya),
          isArrived: false,
          isPaid: false
        };
      }
    } else if (field === 'isArrived' && currentValue) {
      // Reverting back to unarrived, restore original quantity
      payload.quantity = material.orderedQuantity || material.quantity;
      payload.totalCost = (payload.quantity * Number(material.unitPrice)) + Number(material.karaya);
    }

    if (canModify) {
      try {
        await updateMaterial(id, payload);
        if (remainingMaterial) {
          await addMaterial(remainingMaterial);
        }
        await loadData();
      } catch (err) {
        alert(`Database Error: ${err.message}\nDid you forget to run the Supabase SQL migration script?`);
      }
    } else {
      await addChangeRequest({
        type: 'EDIT_MATERIAL',
        targetId: id,
        requestedBy: currentUser.id,
        payload
      });
      // Note: Admin change requests don't natively support multiple simultaneous operations in our current structure.
      // We will only request the edit for the arrived portion to keep it simple.
      await loadData();
      alert('Modification request sent to Admin. (Note: Remaining quantity splitting must be done manually by Admin if requested late)');
    }
  };

  const handleDeleteMaterial = async (e, material) => {
    e.stopPropagation();
    const canModify = canModifyEntry(material.createdAt);

    if (canModify) {
      triggerSecurityChallenge("Delete this material record?", "DELETE", async () => {
        await deleteMaterial(material.id);
        await loadData();
      });
    } else {
      if (window.confirm("This record is older than 24 hours. Request Admin approval to delete?")) {
        await addChangeRequest({
          type: 'DELETE_MATERIAL',
          targetId: material.id,
          requestedBy: currentUser.id,
          payload: { amount: material.totalCost, description: material.itemName, date: material.orderDate }
        });
        await loadData();
        alert('Deletion request sent to Admin.');
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setMReceipt(canvas.toDataURL('image/jpeg', 0.6));
      };
    };
  };

  // --- Site Expenses Logic ---
  const handleCreateAdvance = async (e) => {
    e.preventDefault();
    await addSiteAdvance({
      projectId: activeProjectId,
      date: advDate,
      amount: Number(advAmount),
      description: advDesc
    });
    setAdvAmount(''); setAdvDesc(''); setAdvDate(new Date().toISOString().split('T')[0]);
    setIsAdvanceModalOpen(false);
    await loadData();
  };

  const handleDeleteAdvance = async (e, adv) => {
    e.stopPropagation();
    const canModify = canModifyEntry(adv.createdAt);

    if (canModify) {
      triggerSecurityChallenge("Delete this advance record?", "DELETE", async () => {
        await deleteSiteAdvance(adv.id);
        await loadData();
      });
    } else {
      if (window.confirm("This record is older than 24 hours. Request Admin approval to delete?")) {
        await addChangeRequest({
          type: 'DELETE_SITE_ADVANCE',
          targetId: adv.id,
          requestedBy: currentUser.id,
          payload: { amount: adv.amount, description: adv.description, date: adv.date }
        });
        await loadData();
        alert('Deletion request sent to Admin.');
      }
    }
  };

  const handleExpenseImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setExpReceipt(canvas.toDataURL('image/jpeg', 0.6));
      };
    };
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await addSiteExpense({
        projectId: activeProjectId,
        date: expDate,
        amount: Number(expAmount),
        description: expDesc,
        paidBy: expPaidBy,
        receiptImage: expReceipt
      });
      setExpAmount(''); setExpDesc(''); setExpReceipt(null); setExpPaidBy('Engineer'); setExpDate(new Date().toISOString().split('T')[0]);
      setIsExpenseModalOpen(false);
      await loadData();
      alert("Expense added successfully!");
    } catch (err) {
      alert("Error adding expense: " + err.message);
    }
  };

  const handleDeleteExpense = async (e, exp) => {
    e.stopPropagation();
    const canModify = canModifyEntry(exp.createdAt);

    if (canModify) {
      triggerSecurityChallenge("Delete this expense report?", "DELETE", async () => {
        await deleteSiteExpense(exp.id);
        await loadData();
      });
    } else {
      if (window.confirm("This record is older than 24 hours. Request Admin approval to delete?")) {
        await addChangeRequest({
          type: 'DELETE_SITE_EXPENSE',
          targetId: exp.id,
          requestedBy: currentUser.id,
          payload: { amount: exp.amount, description: exp.description, date: exp.date }
        });
        await loadData();
        alert('Deletion request sent to Admin.');
      }
    }
  };

  if (!currentUser) return null; 
  
  if (currentUser.status === 'Pending') {
    return (
      <div className="app-layout flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '2rem', textAlign: 'center', padding: '2rem' }}>
        <div className="glass-card flex-center" style={{ flexDirection: 'column', padding: '4rem 2rem', maxWidth: '600px', width: '100%' }}>
          <Shield size={64} style={{ color: 'var(--warning)', marginBottom: '1.5rem' }} />
          <h1 className="heading-2">Pending Admin Approval</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Your account has been created successfully, but an Administrator must verify your identity and assign you to specific projects before you can access the dashboard.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {currentUser?.permissions?.root && (
              <button className="btn btn-primary" onClick={() => navigate('/admin')}>
                <Shield size={20} /> Go to Admin Dashboard
              </button>
            )}
            <button className="btn btn-secondary" onClick={handleLogout}>
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const perms = currentUser.permissions || {};
  const currentFolder = allDocs.find(d => d.id === currentFolderId);
  const activeProj = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        <h2 className="heading-3 text-gradient" style={{ marginBottom: '2rem' }}>{currentUser.name}</h2>
        <button onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }} className="hide-on-desktop"><X size={20}/></button>
        
        {activeProjectId === null ? (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <button className={activeTab === 'overview' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => setActiveTab('overview'))} style={{ justifyContent: 'flex-start' }}><LayoutDashboard size={20}/> My Dashboard</button>
            <button className={activeTab === 'projects' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => setActiveTab('projects'))} style={{ justifyContent: 'flex-start' }}><HardHat size={20}/> Active Projects</button>
            <button className={activeTab === 'messages' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => setActiveTab('messages'))} style={{ justifyContent: 'flex-start' }}><MessageSquare size={20}/> Messages</button>
            <button className={activeTab === 'profile' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => setActiveTab('profile'))} style={{ justifyContent: 'flex-start' }}><Settings size={20}/> My Profile</button>

            {perms.root && (
              <button className="btn btn-secondary" onClick={() => handleNav(() => navigate('/admin'))} style={{ justifyContent: 'flex-start', marginTop: '1rem', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}>
                <Shield size={20}/> Admin Panel
              </button>
            )}
          </nav>
        ) : (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <button className="btn btn-secondary" onClick={() => handleNav(handleCloseProject)} style={{ marginBottom: '1.5rem', border: '1px solid var(--border-strong)' }}>
              <ArrowLeft size={18} /> Exit Project
            </button>
            
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '1px', paddingLeft: '0.5rem' }}>Project Menu</h3>
            
            {(perms.root || perms.overview) && <button className={projectTab === 'overview' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => setProjectTab('overview'))} style={{ justifyContent: 'flex-start' }}><LayoutDashboard size={20}/> Overview</button>}
            {(perms.root || perms.attendance) && <button className={projectTab === 'attendance' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => setProjectTab('attendance'))} style={{ justifyContent: 'flex-start' }}><ClipboardList size={20}/> Attendance</button>}
            {(perms.root || perms.payroll) && <button className={projectTab === 'payroll' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => setProjectTab('payroll'))} style={{ justifyContent: 'flex-start' }}><DollarSign size={20}/> Payroll & Wages</button>}
            {(perms.root || perms.subcontractors) && <button className={projectTab === 'subcontractors' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => { setProjectTab('subcontractors'); setActiveSubId(null); })} style={{ justifyContent: 'flex-start' }}><Briefcase size={20}/> Subcontractors</button>}
            {(perms.root || perms.materials) && <button className={projectTab === 'materials' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => { setProjectTab('materials'); setActiveMaterialCategory('All'); })} style={{ justifyContent: 'flex-start' }}><Package size={20}/> Materials</button>}
            {(perms.root || perms.site_expenses) && <button className={projectTab === 'site_expenses' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => setProjectTab('site_expenses'))} style={{ justifyContent: 'flex-start' }}><CreditCard size={20}/> Site Expenses</button>}
            {(perms.root || perms.assets) && <button className={projectTab === 'assets' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => setProjectTab('assets'))} style={{ justifyContent: 'flex-start' }}><Truck size={20}/> Assets</button>}
            {(perms.root || perms.documents) && <button className={projectTab === 'documents' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => setProjectTab('documents'))} style={{ justifyContent: 'flex-start' }}><FileText size={20}/> Documents</button>}
            {(perms.root || perms.tasks) && <button className={projectTab === 'tasks' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => setProjectTab('tasks'))} style={{ justifyContent: 'flex-start' }}><CheckSquare size={20}/> Tasks</button>}
            
            {perms.root && <button className="btn btn-secondary" onClick={() => handleNav(() => setIsReportModalOpen(true))} style={{ justifyContent: 'flex-start' }}><Printer size={20}/> Printable Reports</button>}

            {perms.root && <button className={projectTab === 'settings' ? "btn btn-primary" : "btn btn-secondary"} onClick={() => handleNav(() => setProjectTab('settings'))} style={{ justifyContent: 'flex-start' }}><Settings size={20}/> Settings</button>}
          </nav>
        )}

        <button className="btn btn-danger" onClick={handleLogout} style={{ justifyContent: 'flex-start' }}>
          <LogOut size={20}/> Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className={`sidebar-overlay ${isMobileMenuOpen ? "open" : ""}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <main className="main-content">
        <div className="mobile-header">
          <h2 className="heading-3 text-gradient" style={{ margin: 0 }}>{currentUser.name}</h2>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
              <LogOut size={22} />
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
              <Menu size={26} />
            </button>
          </div>
        </div>
        
        {/* ========================================================= */}
        {/* GLOBAL CONTEXT */}
        {/* ========================================================= */}
        {activeProjectId === null && (
          <>
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                <header className="flex-between" style={{ marginBottom: '3rem' }}>
                  <div>
                    <h1 className="heading-1">Welcome back, {currentUser.name}!</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Role: {currentUser.role}</p>
                  </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                  <div className="glass-card" style={{ padding: '2rem', cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => handleNav(() => setActiveTab('projects'))}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}><HardHat size={24} color="var(--accent-primary)" /></div>
                      <h3 className="heading-3">My Projects</h3>
                    </div>
                    <p className="text-gradient heading-1">{projects.length}</p>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Active construction sites</p>
                  </div>
                  
                  {(() => {
                    const myPendingTasks = allTasks.filter(t => t.assignedTo === currentUser?.id && t.status !== 'DONE');
                    const dueTodayCount = myPendingTasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length;
                    
                    return (
                      <div 
                        className="glass-card" 
                        style={{ padding: '2rem', cursor: 'pointer', transition: 'var(--transition)' }} 
                        onClick={() => setIsGlobalTasksModalOpen(true)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}><LayoutDashboard size={24} color="var(--warning)" /></div>
                          <h3 className="heading-3">My Pending Tasks</h3>
                        </div>
                        <p className="text-gradient heading-1" style={{ background: 'linear-gradient(135deg, var(--warning), #fde047)', WebkitBackgroundClip: 'text', color: 'transparent' }}>{myPendingTasks.length}</p>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{dueTodayCount} due today (Click to view)</p>
                      </div>
                    );
                  })()}

                  <div className="glass-card" style={{ padding: '2rem', gridColumn: '1 / -1', cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => handleNav(() => setActiveTab('messages'))}>
                    <h3 className="heading-3" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={20} className="text-gradient"/> Recent Messages</h3>
                    <ul style={{ listStyle: 'none', color: 'var(--text-secondary)' }}>
                      {(() => {
                        const recentMessages = [...allMessages].filter(m => m.senderId !== currentUser?.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
                        if (recentMessages.length === 0) {
                          return <li style={{ padding: '1rem', color: 'var(--text-muted)' }}>No recent messages.</li>;
                        }
                        return recentMessages.map(msg => {
                          const sender = allUsers.find(u => u.id === msg.senderId)?.name || 'Unknown';
                          const projName = msg.channelId !== 'global' ? projects.find(p => p.id === msg.channelId)?.name : 'Global Chat';
                          const timeStr = new Date(msg.createdAt).toLocaleString();
                          return (
                            <li key={msg.id} style={{ padding: '1rem', background: 'var(--glass-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', borderLeft: '4px solid var(--accent-secondary)' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>{sender}</strong> <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>in {projName} • {timeStr}</span>
                              <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>{msg.text}</p>
                            </li>
                          );
                        });
                      })()}
                    </ul>
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '1rem', textAlign: 'right' }}>Click to open messaging &rarr;</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="animate-fade-in">
                <header className="flex-between" style={{ marginBottom: '3rem' }}>
                  <div>
                    <h1 className="heading-1">Active Projects</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Select a project to open its dedicated dashboard.</p>
                  </div>
                  {perms.add_projects && (
                    <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                      <Plus size={20}/> Create Project
                    </button>
                  )}
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '2rem' }}>
                  {projects.length === 0 ? (
                    <div className="glass-card flex-center" style={{ padding: '4rem', gridColumn: '1 / -1', flexDirection: 'column', color: 'var(--text-muted)' }}>
                      <HardHat size={64} style={{ marginBottom: '1.5rem', opacity: 0.5, color: 'var(--accent-secondary)' }} />
                      <h3 className="heading-3">No Active Projects</h3>
                      <p style={{ marginTop: '0.5rem' }}>{perms.add_projects ? "Click 'Create Project' above to start your first build!" : "You have not been assigned to any projects yet."}</p>
                    </div>
                  ) : (
                    projects.map((project, idx) => (
                      <div key={project.id} className="glass-card" onClick={() => handleNav(() => handleOpenProject(project.id))}
                        style={{ padding: '2rem', display: 'flex', flexDirection: 'column', animation: `fadeIn 0.5s ease-out ${idx * 0.1}s forwards`, opacity: 0, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(99, 102, 241, 0.3)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}
                      >
                        <div className="flex-between" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
                          <div>
                            <h3 className="heading-3">{project.name}</h3>
                            <span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'var(--accent-glow)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-full)' }}>{project.status}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {perms.delete_projects && <button className="btn btn-danger" onClick={(e) => handleDeleteProject(e, project.id)} style={{ padding: '0.4rem' }} title="Delete Project"><Trash2 size={14}/></button>}
                          </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>{project.description}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} color="var(--accent-primary)"/> {project.location}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building size={14} color="var(--accent-primary)"/> {project.client}</div>
                        </div>
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--glass-hover)', borderRadius: 'var(--radius-sm)' }}>
                           <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Expended Cost</p>
                           <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs {calculateTotalProjectCost(project.id).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <div className="flex-between" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 500 }}>Progress</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{project.progress}%</span>
                          </div>
                          <div style={{ width: '100%', background: 'var(--glass-darker)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${project.progress}%`, height: '100%', background: 'var(--accent-gradient)' }}></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (() => {
              // Calculate Aggregates
              let totalLabour = 0;
              let totalSubs = 0;
              let totalMaterials = 0;
              let totalExpenses = 0;
              let totalManHours = 0;
              let outstandingPayroll = 0;

              allAttendance.forEach(a => {
                const w = allWorkers.find(worker => worker.id === a.workerId);
                const hourly = (a.dailyWage !== undefined ? a.dailyWage : (w?.dailyWage || 0)) / 8;
                const hours = (a.regularHours || 0) + (a.overtimeHours || 0);
                totalManHours += hours;
                const cost = hours * hourly;
                totalLabour += cost;
                if (!a.paid) outstandingPayroll += cost;
              });

              totalSubs = allSubPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
              totalMaterials = allMaterials.filter(m => m.isArrived).reduce((acc, m) => acc + (m.totalCost || 0), 0);
              totalExpenses = allSiteExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

              const totalExpenditure = totalLabour + totalSubs + totalMaterials + totalExpenses;
              const activeAssets = allAssets.length;

              // Chart Data
              const pieData = [
                { name: 'Materials', value: totalMaterials, color: '#3b82f6' },
                { name: 'Labour', value: totalLabour, color: '#10b981' },
                { name: 'Subcontractors', value: totalSubs, color: '#f59e0b' },
                { name: 'Site Expenses', value: totalExpenses, color: '#ef4444' }
              ].filter(d => d.value > 0);

              // Project Costs
              const projectCosts = projects.map(p => ({
                ...p,
                cost: calculateTotalProjectCost(p.id)
              })).sort((a,b) => b.cost - a.cost).slice(0, 3);

              // Tasks
              const doneTasks = allTasks.filter(t => t.status === 'DONE').length;
              const pendingTasks = allTasks.filter(t => t.status !== 'DONE').length;
              const taskProgress = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;
              
              const todayStr = new Date().toISOString().split('T')[0];
              const overdueTasks = allTasks.filter(t => t.status !== 'DONE' && t.dueDate && t.dueDate < todayStr);

              return (
                <div className="animate-fade-in">


                </div>
              );
            })()}

            {activeTab === 'messages' && (() => {
              const activeMessages = allMessages.filter(m => m.channelId === activeChannel);
              return (
                <div className="animate-fade-in" style={{ height: 'calc(100vh - 6rem)', display: 'flex', gap: '2rem' }}>
                  <div className="glass-card" style={{ width: '300px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 className="heading-3" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={20} className="text-gradient"/> Channels</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
                      <button 
                        onClick={() => setActiveChannel('global')}
                        style={{ padding: '1rem', background: activeChannel === 'global' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: activeChannel === 'global' ? '1px solid var(--accent-primary)' : '1px solid transparent', borderRadius: 'var(--radius-md)', color: activeChannel === 'global' ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer', transition: 'var(--transition)' }}
                      >
                        <strong style={{ display: 'block', fontSize: '1rem' }}># Global Chat</strong>
                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>All team members</span>
                      </button>

                      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1rem 0' }}></div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', paddingLeft: '1rem' }}>Projects</p>

                      {projects.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => setActiveChannel(p.id)}
                          style={{ padding: '1rem', background: activeChannel === p.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: activeChannel === p.id ? '1px solid var(--accent-primary)' : '1px solid transparent', borderRadius: 'var(--radius-md)', color: activeChannel === p.id ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer', transition: 'var(--transition)' }}
                        >
                          <strong style={{ display: 'block', fontSize: '0.875rem' }}># {p.name}</strong>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--glass-hover)' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        # {activeChannel === 'global' ? 'Global Chat' : projects.find(p => p.id === activeChannel)?.name || 'Unknown Channel'}
                      </h3>
                    </div>

                    <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {activeMessages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
                          <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        activeMessages.map(msg => {
                          const isMine = msg.senderId === currentUser.id;
                          const sender = allUsers.find(u => u.id === msg.senderId);
                          const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                          return (
                            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                              {!isMine && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', paddingLeft: '0.5rem' }}>{sender?.name || 'Unknown'} • {timeStr}</span>}
                              {isMine && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', paddingRight: '0.5rem' }}>{timeStr}</span>}
                              
                              <div style={{ 
                                background: isMine ? 'var(--accent-primary)' : 'var(--border-subtle)', 
                                padding: '0.75rem 1rem', 
                                borderRadius: '1rem', 
                                borderBottomRightRadius: isMine ? '0' : '1rem',
                                borderBottomLeftRadius: isMine ? '1rem' : '0',
                                color: isMine ? '#fff' : 'var(--text-primary)',
                                maxWidth: '70%',
                                lineHeight: 1.5,
                                border: isMine ? 'none' : '1px solid var(--border-strong)'
                              }}>
                                {msg.text}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <form onSubmit={handleSendMessage} style={{ padding: '1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--glass-hover)', display: 'flex', gap: '1rem' }}>
                      <input 
                        type="text" 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={`Message #${activeChannel === 'global' ? 'Global Chat' : projects.find(p => p.id === activeChannel)?.name || 'Channel'}...`}
                        style={{ flex: 1, padding: '1rem', background: 'var(--glass-darker)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-full)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                      <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0 1.5rem' }}>Send</button>
                    </form>
                  </div>
                </div>
              );
            })()}

            {activeTab === 'approvals' && (
              <div className="animate-fade-in">
                <header className="flex-between" style={{ marginBottom: '3rem' }}>
                  <div>
                    <h1 className="heading-1">Change Approvals</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Review requests to modify or delete locked financial records.</p>
                  </div>
                </header>

                <div className="glass-card" style={{ padding: '2.5rem' }}>
                  {allChangeRequests.filter(r => r.status === 'PENDING').length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                      <Shield size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                      <p>No pending change requests.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {allChangeRequests.filter(r => r.status === 'PENDING').map(req => {
                        const requester = allUsers.find(u => u.id === req.requestedBy)?.name || 'Unknown User';
                        const reqDate = new Date(req.createdAt).toLocaleString();
                        
                        let description = '';
                        if (req.type === 'DELETE_SUB_PAYMENT') {
                          description = `Wants to DELETE payment of Rs ${req.payload.amount} (${req.payload.description}) on ${req.payload.date}.`;
                        } else if (req.type === 'EDIT_SUB_PAYMENT') {
                          description = `Wants to EDIT payment to: Rs ${req.payload.amount} (${req.payload.description}) on ${req.payload.date}.`;
                        } else if (req.type === 'EDIT_ATTENDANCE') {
                          description = `Wants to OVERWRITE attendance for ${req.payload.date}.`;
                        } else if (req.type === 'REVERT_ATTENDANCE') {
                          description = `Wants to REVERT paid attendance for dates ${req.payload.startDate} to ${req.payload.endDate} back to UNPAID.`;
                        }

                        return (
                          <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--glass-hover)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--warning)' }}>
                            <div>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--warning)', color: '#000', fontWeight: 'bold', borderRadius: '4px' }}>{req.type.replace(/_/g, ' ')}</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Requested by {requester} at {reqDate}</span>
                              </div>
                              <p style={{ fontSize: '1.1rem' }}>{description}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                              <button className="btn btn-danger" onClick={() => handleRejectRequest(req.id)} style={{ padding: '0.5rem 1rem' }}><X size={16}/> Reject</button>
                              <button className="btn btn-primary" onClick={() => handleApproveRequest(req)} style={{ padding: '0.5rem 1rem', background: 'var(--success)', borderColor: 'var(--success)' }}><CheckCircle size={16}/> Approve & Apply</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* PROJECT CONTEXT */}
        {/* ========================================================= */}
        {activeProjectId !== null && activeProj && (
          <div className="animate-fade-in">
            <header className="flex-between" style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2.5rem' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><HardHat size={14}/> Active Project</p>
                <h1 className="heading-1">{activeProj.name}</h1>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'var(--accent-glow)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-full)' }}>{activeProj.status}</span>
                  {(currentUser?.permissions?.root || currentUser?.permissions?.unlock_past) && (
                      <button 
                        onClick={() => setAdminUnlockPast(!adminUnlockPast)} 
                      style={{ background: adminUnlockPast ? 'var(--warning-glow)' : 'transparent', border: `1px solid ${adminUnlockPast ? 'var(--warning)' : 'var(--glass-darker)'}`, color: adminUnlockPast ? 'var(--warning)' : 'var(--text-muted)', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s' }}
                      title="Allows editing of historical financial records and past dates"
                    >
                      {adminUnlockPast ? <Unlock size={12}/> : <Shield size={12}/>}
                      {adminUnlockPast ? 'Past Unlocked' : 'Unlock Past'}
                    </button>
                  )}
                </div>
              </div>
            </header>

            {projectTab === 'overview' && !(perms.root || perms.overview) && (
              <div className="glass-card flex-center" style={{ padding: '4rem', flexDirection: 'column', textAlign: 'center' }}>
                <Shield size={48} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
                <h3 className="heading-3">Access Restricted</h3>
                <p style={{ color: 'var(--text-secondary)' }}>You do not have permission to view this project's overview. Please request access from an Administrator.</p>
              </div>
            )}

            {projectTab === 'overview' && (perms.root || perms.overview) && (() => {
              // Calculate Aggregates for THIS project
              let totalLabour = 0;
              let totalManHours = 0;
              let outstandingPayroll = 0;

              allAttendance.filter(a => a.projectId === activeProj.id).forEach(a => {
                const w = allWorkers.find(worker => worker.id === a.workerId);
                const hourly = (a.dailyWage !== undefined ? a.dailyWage : (w?.dailyWage || 0)) / 8;
                const hours = (a.regularHours || 0) + (a.overtimeHours || 0);
                totalManHours += hours;
                const cost = hours * hourly;
                totalLabour += cost;
                if (!a.paid) outstandingPayroll += cost;
              });

              const totalSubs = allSubPayments.filter(p => p.projectId === activeProj.id).reduce((acc, p) => acc + (p.amount || 0), 0);
              const projectMaterials = allMaterials.filter(m => m.projectId === activeProj.id);
              const totalMaterials = projectMaterials.filter(m => m.isArrived).reduce((acc, m) => acc + (m.totalCost || 0), 0);
              const outstandingMaterials = projectMaterials.filter(m => !m.isPaid).reduce((acc, m) => acc + (m.totalCost || 0), 0);
              const totalExpenses = allSiteExpenses.filter(e => e.projectId === activeProj.id).reduce((acc, e) => acc + (e.amount || 0), 0);

              const pieData = [
                { name: 'Materials', value: totalMaterials, color: '#3b82f6' },
                { name: 'Labour', value: totalLabour, color: '#10b981' },
                { name: 'Subcontractors', value: totalSubs, color: '#f59e0b' },
                { name: 'Site Expenses', value: totalExpenses, color: '#ef4444' }
              ].filter(d => d.value > 0);

              const projTasks = allTasks.filter(t => t.projectId === activeProj.id);
              const doneTasks = projTasks.filter(t => t.status === 'DONE').length;
              const taskProgress = projTasks.length > 0 ? Math.round((doneTasks / projTasks.length) * 100) : 0;
              
              const todayStr = new Date().toISOString().split('T')[0];
              const overdueTasks = projTasks.filter(t => t.status !== 'DONE' && t.dueDate && t.dueDate < todayStr);
              const pendingTasks = projTasks.filter(t => t.status !== 'DONE').length;

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 600px), 1fr))', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* METRICS ROW */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><DollarSign size={14}/> Total Expenditure</p>
                      <h2 className="heading-2 text-gradient" style={{ fontSize: '1.5rem' }}>Rs {calculateTotalProjectCost(activeProj.id).toLocaleString()}</h2>
                    </div>
                    <div className="glass-card" onClick={() => handleNav(() => setProjectTab('payroll'))} style={{ padding: '1.5rem', cursor: 'pointer', transition: 'var(--transition)' }} title="Go to Payroll">
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><AlertTriangle size={14}/> Payroll Outstanding</p>
                      <h2 className="heading-2" style={{ color: 'var(--warning)', fontSize: '1.5rem' }}>Rs {outstandingPayroll.toLocaleString()}</h2>
                    </div>
                    <div className="glass-card" onClick={() => handleNav(() => { setProjectTab('materials'); setActiveMaterialCategory('All'); })} style={{ padding: '1.5rem', cursor: 'pointer', transition: 'var(--transition)' }} title="Go to Materials">
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><Package size={14}/> Material Pending</p>
                      <h2 className="heading-2" style={{ color: 'var(--warning)', fontSize: '1.5rem' }}>Rs {outstandingMaterials.toLocaleString()}</h2>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><Users size={14}/> Total Man-Hours</p>
                      <h2 className="heading-2 text-gradient" style={{ background: 'linear-gradient(135deg, var(--accent-secondary), #d946ef)', WebkitBackgroundClip: 'text', color: 'transparent', fontSize: '1.5rem' }}>{totalManHours.toLocaleString()} hrs</h2>
                    </div>
                  </div>

                  {/* CHART ROW */}
                  <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 className="heading-3" style={{ marginBottom: '1.5rem' }}>Cost Breakdown</h3>
                    <div style={{ flex: 1, minHeight: '300px' }}>
                      {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                              {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `Rs ${value.toLocaleString()}`} contentStyle={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-strong)', borderRadius: '8px' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>No financial data available for this project.</div>
                      )}
                    </div>
                  </div>

                  {/* PROJECT DETAILS */}
                  <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <h3 className="heading-3" style={{ marginBottom: '1.5rem' }}>Project Details</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem' }}>{activeProj.description}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '2rem', marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <div><p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '1px' }}>Location</p><p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}><MapPin size={16} color="var(--accent-primary)"/> {activeProj.location}</p></div>
                      <div><p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '1px' }}>Client</p><p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}><Building size={16} color="var(--accent-primary)"/> {activeProj.client}</p></div>
                      <div><p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '1px' }}>Start Date</p><p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}><Calendar size={16} color="var(--accent-primary)"/> {activeProj.startDate}</p></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* TASKS OVERVIEW */}
                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 className="heading-3" style={{ marginBottom: '1.5rem' }}>Tasks Overview</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      <span>Completion</span>
                      <span>{taskProgress}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--glass-darker)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                      <div style={{ width: `${taskProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--success))', transition: 'width 1s ease-in-out' }}></div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                      <div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{doneTasks}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Done</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{pendingTasks}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Pending</p>
                      </div>
                    </div>

                    {overdueTasks.length > 0 && (
                      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ fontSize: '0.875rem', color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={14}/> Overdue</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                          {overdueTasks.map(t => (
                            <div key={t.id} style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid var(--danger)', borderRadius: 'var(--radius-sm)' }}>
                              <div className="flex-between">
                                <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{t.title}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 'bold' }}>{t.dueDate}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ASSIGNED TEAM */}
                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 className="heading-3" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={20} className="text-gradient" /> Team</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {allUsers.filter(u => u.permissions?.root || activeProj.assignedUsers.includes(u.id) || activeProj.createdBy === u.id).map(user => (
                        <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--glass-hover)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>{user.name.charAt(0)}</div>
                          <div><p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{user.name}</p><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role} {user.permissions?.root && <span style={{ color: 'var(--warning)' }}>(Root)</span>}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              );
            })()}

            {projectTab === 'attendance' && (() => {
              const canModify = canModifyEntry(attendanceDate);

              return (
              <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', minHeight: '500px' }}>
                <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <h3 className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ClipboardList size={20} className="text-gradient"/> Daily Log</h3>
                    <input type="date" className="input-field" value={attendanceDate} onChange={e => handleNav(() => setAttendanceDate(e.target.value))} style={{ padding: '0.5rem', colorScheme: 'dark', cursor: 'pointer' }} />
                    {!canModify && !perms.root && <span style={{ color: 'var(--warning)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={14}/> Locked (Admin Approval Req.)</span>}
                    {!canModify && perms.root && <span style={{ color: 'var(--warning)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={14}/> Historical Record (Locked)</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                     <button className="btn btn-secondary" onClick={() => setIsWorkerModalOpen(true)}>+ Register Labourer</button>
                     {!canModify && (perms.root || perms.unlock_past) && (
                       <button className="btn btn-warning" onClick={() => { if (window.confirm("You are about to edit historical attendance records. This can alter past payroll calculations. Proceed with caution?")) setAdminUnlockPast(true); }} style={{ background: 'transparent', border: '1px solid var(--warning)', color: 'var(--warning)' }}><Shield size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }}/> Unlock to Edit</button>
                     )}
                     {canModify && <button className="btn btn-primary" onClick={handleSaveAttendance}>Save Attendance</button>}
                  </div>
                </div>

                {allWorkers.filter(w => w.projectId === activeProjectId && !w.isDeleted).length === 0 ? (
                   <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', marginTop: '2rem' }}>
                     <Users size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                     <p>No labourers registered on this project yet.</p>
                     <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Click "Register Labourer" to start building your workforce database.</p>
                   </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <div className="table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Name</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Trade</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Present (Full Day)</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center', width: '120px' }}>Regular Hrs</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center', width: '120px' }}>Overtime Hrs</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center', width: '120px' }}>Advance (Rs)</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Net Earned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allWorkers.filter(w => w.projectId === activeProjectId && !w.isDeleted).map(w => {
                          const form = attendanceForm[w.id] || { isPresent: false, regularHours: 0, overtimeHours: 0, advance: 0, dailyWage: w.dailyWage };
                          const regHrs = Number(form.regularHours) || 0;
                          const otHrs = Number(form.overtimeHours) || 0;
                          const adv = Number(form.advance) || 0;
                          const hourlyRate = (form.dailyWage || 0) / 8;
                          const earned = ((regHrs + otHrs) * hourlyRate) - adv;
                          
                          return (
                            <tr key={w.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: form.isPresent ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                              <td style={{ padding: '1rem 0.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button onClick={(e) => handleDeleteWorker(e, w.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7} title="Delete Labourer">
                                  <Trash2 size={14} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleOpenEditWorker(w); }} style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7} title="Edit Labourer">
                                  <Edit2 size={14} />
                                </button>
                                {w.name}
                              </td>
                              <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{w.trade}</td>
                              <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                <input 
                                  type="checkbox" 
                                  checked={form.isPresent}
                                  disabled={!canModify}
                                  onChange={e => handleAttendanceChange(w.id, 'isPresent', e.target.checked)}
                                  style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: canModify ? 'pointer' : 'not-allowed', opacity: canModify ? 1 : 0.5 }}
                                />
                              </td>
                              <td style={{ padding: '1rem 0.5rem' }}>
                                <input 
                                  type="number" min="0" max="24" step="0.5"
                                  className="input-field" 
                                  value={form.regularHours}
                                  disabled={!canModify}
                                  onChange={e => handleAttendanceChange(w.id, 'regularHours', e.target.value)}
                                  style={{ padding: '0.4rem', textAlign: 'center', width: '100%', borderColor: form.regularHours > 0 ? 'var(--accent-primary)' : 'var(--border-strong)', opacity: canModify ? 1 : 0.5 }}
                                />
                              </td>
                              <td style={{ padding: '1rem 0.5rem' }}>
                                <input 
                                  type="number" min="0" max="24" step="0.5"
                                  className="input-field" 
                                  value={form.overtimeHours}
                                  disabled={!canModify}
                                  onChange={e => handleAttendanceChange(w.id, 'overtimeHours', e.target.value)}
                                  style={{ padding: '0.4rem', textAlign: 'center', width: '100%', borderColor: form.overtimeHours > 0 ? 'var(--warning)' : 'var(--border-strong)', opacity: canModify ? 1 : 0.5 }}
                                />
                              </td>
                              <td style={{ padding: '1rem 0.5rem' }}>
                                <input 
                                  type="number" min="0" step="1"
                                  className="input-field" 
                                  value={form.advance}
                                  disabled={!canModify}
                                  onChange={e => handleAttendanceChange(w.id, 'advance', e.target.value)}
                                  style={{ padding: '0.4rem', textAlign: 'center', width: '100%', borderColor: form.advance > 0 ? 'var(--danger)' : 'var(--border-strong)', opacity: canModify ? 1 : 0.5 }}
                                />
                              </td>
                              <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 500, color: earned >= 0 ? 'var(--accent-primary)' : 'var(--danger)' }}>
                                Rs {earned.toFixed(2)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
</div>
                  </div>
                )}
              </div>
            )})()}

            {projectTab === 'payroll' && (
              <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', minHeight: '500px' }}>
                <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <h3 className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={20} className="text-gradient"/> Project Payroll</h3>
                    
                    <div style={{ display: 'flex', background: 'var(--glass-hover)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                      <button className={`btn ${payrollViewMode === 'outstanding' ? 'btn-primary' : ''}`} onClick={() => handleNav(() => setPayrollViewMode('outstanding'))} style={{ padding: '0.4rem 1rem', background: payrollViewMode === 'outstanding' ? 'var(--accent-primary)' : 'transparent', color: payrollViewMode === 'outstanding' ? '#fff' : 'var(--text-secondary)' }}>Outstanding</button>
                      <button className={`btn ${payrollViewMode === 'history' ? 'btn-primary' : ''}`} onClick={() => handleNav(() => setPayrollViewMode('history'))} style={{ padding: '0.4rem 1rem', background: payrollViewMode === 'history' ? 'var(--accent-primary)' : 'transparent', color: payrollViewMode === 'history' ? '#fff' : 'var(--text-secondary)' }}>Paid History</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                     <label style={{ color: 'var(--text-secondary)' }}>From:</label>
                     <input type="date" className="input-field" value={payrollStart} onChange={e => handleNav(() => setPayrollStart(e.target.value))} style={{ padding: '0.5rem', colorScheme: 'dark', flex: 1, minWidth: '130px' }} />
                     <label style={{ color: 'var(--text-secondary)' }}>To:</label>
                     <input type="date" className="input-field" value={payrollEnd} onChange={e => handleNav(() => setPayrollEnd(e.target.value))} style={{ padding: '0.5rem', colorScheme: 'dark', flex: 1, minWidth: '130px' }} />
                  </div>
                </div>

                {(() => {
                   const relevantLogs = allAttendance.filter(a => 
                     a.projectId === activeProjectId && 
                     a.date >= payrollStart && 
                     a.date <= payrollEnd &&
                     (payrollViewMode === 'outstanding' ? !a.paid : a.paid)
                   );
                   if (relevantLogs.length === 0) {
                     return (
                       <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
                         <DollarSign size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                         <p>No attendance records found for this timeframe.</p>
                       </div>
                     )
                   }
                   
                   const payrollData = {};
                   relevantLogs.forEach(log => {
                     if (!payrollData[log.workerId]) payrollData[log.workerId] = { regHours: 0, otHours: 0, advance: 0, dates: new Set(), grossPay: 0 };
                     
                     const worker = allWorkers.find(w => w.id === log.workerId);
                     const logWage = log.dailyWage !== undefined ? log.dailyWage : (worker?.dailyWage || 0);
                     const logHourlyRate = logWage / 8;
                     const logGross = ((log.regularHours || 0) + (log.overtimeHours || 0)) * logHourlyRate;
                     
                     payrollData[log.workerId].grossPay += logGross;
                     payrollData[log.workerId].regHours += log.regularHours || 0;
                     payrollData[log.workerId].otHours += log.overtimeHours || 0;
                     payrollData[log.workerId].advance += log.advance || 0;
                     payrollData[log.workerId].dates.add(log.date);
                   });
                   
                   let grandTotal = 0;

                   return (
                     <div style={{ overflowX: 'auto' }}>
                       <div className="table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                         <thead>
                           <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                             <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Name</th>
                             <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Dates Covered</th>
                             <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Trade</th>
                             <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Total Hrs</th>
                             <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Gross Pay</th>
                             <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Advances</th>
                             <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>{payrollViewMode === 'outstanding' ? 'Net Owed' : 'Net Paid'}</th>
                             <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center', width: '100px' }}>Action</th>
                           </tr>
                         </thead>
                         <tbody>
                           {Object.keys(payrollData).map(wId => {
                             const worker = allWorkers.find(w => w.id === wId);
                             if (!worker) return null;
                             const data = payrollData[wId];
                             const totalHours = data.regHours + data.otHours;
                             const gross = data.grossPay;
                             const owed = gross - data.advance;
                             grandTotal += owed;
                             
                             const sortedDates = Array.from(data.dates).sort();
                             const dateStr = sortedDates.length > 2 ? `${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}` : sortedDates.join(', ');
                             
                             return (
                               <tr key={wId} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: worker.isDeleted ? 0.6 : 1 }}>
                                 <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>
                                   {worker.name} {worker.isDeleted && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginLeft: '0.5rem', fontWeight: 'normal' }}>(Removed)</span>}
                                 </td>
                                 <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{dateStr}</td>
                                 <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{worker.trade}</td>
                                 <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                   <span style={{ fontWeight: 500 }}>{totalHours}</span> <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({data.regHours}R + {data.otHours}OT)</span>
                                 </td>
                                 <td style={{ padding: '1rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                                   Rs {gross.toFixed(2)}
                                 </td>
                                 <td style={{ padding: '1rem 0.5rem', textAlign: 'right', color: 'var(--danger)' }}>
                                   Rs {data.advance.toFixed(2)}
                                 </td>
                                 <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: owed >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                                   Rs {owed.toFixed(2)}
                                 </td>
                                 {payrollViewMode === 'outstanding' ? (
                                   <td style={{ padding: '1rem 0.5rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                     <button className={`btn ${owed > 0 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleOpenSettleModal(wId)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} title={owed > 0 ? "Mark as Paid" : "Clear Account"}>
                                       <CheckCircle size={14} /> {owed > 0 ? 'Settle' : 'Clear'}
                                     </button>
                                     <button className="btn btn-secondary" onClick={() => handleOpenWorkerAdvanceModal(wId)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }} title="Issue Cash Advance">
                                       <CreditCard size={14} /> Advance
                                     </button>
                                     {perms.root && (
                                       <button className="btn btn-danger" onClick={() => handleDeletePayrollRecord(wId)} style={{ padding: '0.4rem', fontSize: '0.75rem' }} title="Delete Records">
                                         <Trash2 size={14} />
                                       </button>
                                     )}
                                   </td>
                                 ) : (
                                   <td style={{ padding: '1rem 0.5rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                                     <button className="btn btn-danger" onClick={() => handleRevertPaid(wId, sortedDates)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }} title="Revert to Unpaid">
                                       <Edit2 size={14} /> Revert
                                     </button>
                                     {perms.root && (
                                       <button className="btn btn-danger" onClick={() => handleDeletePayrollRecord(wId)} style={{ padding: '0.4rem', fontSize: '0.75rem' }} title="Delete Records">
                                         <Trash2 size={14} />
                                       </button>
                                     )}
                                   </td>
                                 )}
                               </tr>
                             )
                           })}
                         </tbody>
                         <tfoot>
                           <tr style={{ borderTop: '2px solid var(--border-strong)', background: 'var(--glass-hover)' }}>
                             <td colSpan="6" style={{ padding: '1.5rem 1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Grand Total ({payrollViewMode === 'outstanding' ? 'Owed' : 'Paid'}):</td>
                             <td style={{ padding: '1.5rem 0.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--accent-primary)' }}>Rs {grandTotal.toFixed(2)}</td>
                             {payrollViewMode === 'outstanding' && (
                               <td style={{ padding: '1.5rem 0.5rem', textAlign: 'center' }}>
                                 {grandTotal > 0 && (
                                   <button className="btn btn-primary" onClick={handleMarkAllPaid} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--success)', borderColor: 'var(--success)' }}>
                                     Settle All
                                   </button>
                                 )}
                               </td>
                             )}
                           </tr>
                         </tfoot>
                       </table>
</div>
                     </div>
                   );
                })()}
              </div>
            )}

            {projectTab === 'subcontractors' && (
              <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', minHeight: '500px' }}>
                {activeSubId === null ? (
                  <>
                    <div className="flex-between" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                      <h3 className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={20} className="text-gradient"/> Subcontractors</h3>
                      <button className="btn btn-primary" onClick={() => setIsSubModalOpen(true)}>+ Hire Subcontractor</button>
                    </div>

                    {allSubcontractors.filter(s => s.projectId === activeProjectId).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
                        <Briefcase size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>No subcontractors assigned to this project.</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <div className="table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Company Name</th>
                              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Trade / Role</th>
                              <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Final Measured Value</th>
                              <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Total Paid</th>
                              <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Remaining Balance</th>
                              <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allSubcontractors.filter(s => s.projectId === activeProjectId).map(sub => {
                              const subPayments = allSubPayments.filter(p => p.subId === sub.id);
                              const totalPaid = subPayments.reduce((sum, p) => sum + p.amount, 0);
                              
                              let balanceDisplay = <span style={{ color: 'var(--text-muted)' }}>Pending Measurement</span>;
                              if (sub.finalValue !== null) {
                                const bal = sub.finalValue - totalPaid;
                                balanceDisplay = <span style={{ color: bal === 0 ? 'var(--success)' : (bal > 0 ? 'var(--danger)' : 'var(--warning)') }}>{bal === 0 ? 'Settled (Rs 0)' : `Rs ${bal.toFixed(2)}`}</span>;
                              }

                              return (
                                <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => setActiveSubId(sub.id)} onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-overlay)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{sub.name}</td>
                                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{sub.trade}</td>
                                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 500, color: sub.finalValue !== null ? 'var(--text-primary)' : 'var(--text-muted)' }}>{sub.finalValue !== null ? `Rs ${sub.finalValue.toFixed(2)}` : 'Pending'}</td>
                                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right', color: 'var(--text-primary)' }}>Rs {totalPaid.toFixed(2)}</td>
                                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 'bold' }}>{balanceDisplay}</td>
                                  <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); setActiveSubId(sub.id); }}>Ledger</button>
                                      <button className="btn btn-danger" style={{ padding: '0.4rem' }} onClick={(e) => handleDeleteSub(e, sub.id)}><Trash2 size={14} /></button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
</div>
                      </div>
                    )}
                  </>
                ) : (() => {
                  const sub = allSubcontractors.find(s => s.id === activeSubId);
                  if (!sub) { setActiveSubId(null); return null; }
                  
                  const subPayments = allSubPayments.filter(p => p.subId === sub.id).sort((a,b) => new Date(a.date) - new Date(b.date));
                  const totalPaid = subPayments.reduce((sum, p) => sum + p.amount, 0);

                  return (
                    <div className="animate-fade-in">
                      <button className="btn btn-secondary" onClick={() => setActiveSubId(null)} style={{ marginBottom: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}><ArrowLeft size={18}/> Back to Subcontractors</button>
                      
                      <div className="flex-between" style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-strong)', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div>
                          <h2 className="heading-2">{sub.name} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>({sub.trade})</span></h2>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Final Measured Value</label>
                            <input 
                              type="number" className="input-field" placeholder="Enter Final Value" 
                              value={sub.finalValue !== null ? sub.finalValue : ''} 
                              onChange={(e) => handleUpdateSubValue(sub.id, e.target.value)}
                              style={{ width: '150px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: sub.finalValue !== null ? 'var(--accent-primary)' : 'var(--text-primary)', border: '1px solid var(--glass-darker)' }} 
                            />
                          </div>
                          <button className="btn btn-primary" onClick={() => { setSubPayMode('add'); setActiveSubPayId(null); setSubPayDate(new Date().toISOString().split('T')[0]); setSubPayAmount(''); setSubPayDesc(''); setIsSubPayModalOpen(true); }}><DollarSign size={20}/> Log Payment</button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                         <div style={{ background: 'var(--glass-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                           <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Final Value</p>
                           <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{sub.finalValue !== null ? `Rs ${sub.finalValue.toFixed(2)}` : 'Pending'}</p>
                         </div>
                         <div style={{ background: 'var(--glass-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                           <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Paid</p>
                           <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs {totalPaid.toFixed(2)}</p>
                         </div>
                         <div style={{ background: 'var(--glass-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: sub.finalValue !== null ? (sub.finalValue - totalPaid === 0 ? '1px solid var(--success)' : '1px solid var(--danger)') : 'none' }}>
                           <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Remaining Balance</p>
                           <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: sub.finalValue !== null ? (sub.finalValue - totalPaid === 0 ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' }}>
                             {sub.finalValue !== null ? `Rs ${(sub.finalValue - totalPaid).toFixed(2)}` : 'Unknown'}
                           </p>
                         </div>
                      </div>

                      <h3 className="heading-3" style={{ marginBottom: '1rem' }}>Payment Ledger</h3>
                      {subPayments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--glass-overlay)', borderRadius: 'var(--radius-md)' }}>
                          <p>No payments recorded yet.</p>
                        </div>
                      ) : (
                        <div className="table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '1rem 0.5rem', fontWeight: 500, width: '120px' }}>Date</th>
                              <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Description / Invoice Ref</th>
                              <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right', width: '150px' }}>Amount Paid</th>
                              <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center', width: '80px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {subPayments.map(p => {
                              const canModify = canModifyEntry(p.createdAt);
                              
                              return (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{p.date}</td>
                                  <td style={{ padding: '1rem 0.5rem' }}>{p.description}</td>
                                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 500, color: 'var(--text-primary)' }}>Rs {p.amount.toFixed(2)}</td>
                                  <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                      <button style={{ background: 'none', border: 'none', color: canModify ? 'var(--text-primary)' : 'var(--warning)', cursor: 'pointer', opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7} onClick={() => {
                                        setSubPayMode('edit');
                                        setActiveSubPayId(p.id);
                                        setSubPayDate(p.date);
                                        setSubPayAmount(p.amount);
                                        setSubPayDesc(p.description);
                                        setIsSubPayModalOpen(true);
                                      }} title={canModify ? "Edit Payment" : "Request Edit"}><Edit2 size={16} /></button>
                                      
                                      <button style={{ background: 'none', border: 'none', color: canModify ? 'var(--danger)' : 'var(--warning)', cursor: 'pointer', opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7} onClick={(e) => handleDeleteSubPay(e, p)} title={canModify ? "Delete Payment" : "Request Delete"}><Trash2 size={16} /></button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
</div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {projectTab === 'materials' && (() => {
              const projMaterials = allMaterials.filter(m => m.projectId === activeProjectId && (activeMaterialCategory === 'All' || m.category === activeMaterialCategory));
              
              const totalOrdered = projMaterials.reduce((acc, m) => acc + (m.totalCost || 0), 0);
              const totalArrivedValue = projMaterials.filter(m => m.isArrived).reduce((acc, m) => acc + (m.totalCost || 0), 0);
              const totalPaid = projMaterials.filter(m => m.isPaid).reduce((acc, m) => acc + (m.totalCost || 0), 0);
              const totalOutstanding = totalArrivedValue - totalPaid;

              return (
                <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', minHeight: '500px' }}>
                  <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <h3 className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={20} className="text-gradient"/> Material Procurement</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(true)}>+ New Category</button>
                      <button className="btn btn-primary" onClick={() => setIsMaterialModalOpen(true)}>+ Log Material Order</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-strong)' }}>
                    <button className={`btn ${activeMaterialCategory === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMaterialCategory('All')} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)' }}>All Items</button>
                    {materialCategories.map(cat => (
                      <button key={cat.id} className={`btn ${activeMaterialCategory === cat.name ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMaterialCategory(cat.name)} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}>{cat.name}</button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <button className={`btn ${materialViewMode === 'active' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMaterialViewMode('active')} style={{ flex: 1, minWidth: '150px' }}>Active Orders</button>
                    <button className={`btn ${materialViewMode === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMaterialViewMode('history')} style={{ flex: 1, minWidth: '150px' }}>Payment History</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                     <div style={{ background: 'var(--glass-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Ordered</p>
                       <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Rs {totalOrdered.toFixed(2)}</p>
                     </div>
                     <div style={{ background: 'var(--glass-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Paid</p>
                       <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>Rs {totalPaid.toFixed(2)}</p>
                     </div>
                     <div style={{ background: 'var(--glass-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Outstanding Balance</p>
                       <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: totalOutstanding > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>Rs {totalOutstanding.toFixed(2)}</p>
                     </div>
                  </div>

                  {projMaterials.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--glass-overlay)', borderRadius: 'var(--radius-md)' }}>
                      <Package size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                      <p>No material orders found in this category.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <div className="table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Order Date</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Item Description</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Category</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Karaya (Freight)</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Total Cost</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Receipt</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Arrived</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Paid</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projMaterials.filter(m => materialViewMode === 'active' ? !m.isPaid : m.isPaid).sort((a,b) => new Date(b.orderDate) - new Date(a.orderDate)).map(m => {
                            const canModify = canModifyEntry(m.createdAt);
                            
                            return (
                              <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: m.isArrived ? 'var(--glass-overlay)' : 'transparent' }}>
                                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{m.orderDate}</td>
                                <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>
                                  {m.itemName} <br/>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {m.isArrived && m.orderedQuantity && Number(m.quantity) !== Number(m.orderedQuantity)
                                      ? `${m.quantity} received (of ${m.orderedQuantity} ordered)`
                                      : `${m.quantity} units`} @ Rs {m.unitPrice}
                                  </span>
                                </td>
                                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{m.category}</td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Rs {m.karaya || 0}</td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 500, color: 'var(--text-primary)' }}>Rs {m.totalCost.toFixed(2)}</td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                  {m.receiptImage ? (
                                    <button onClick={() => { setViewImageUrl(m.receiptImage); setIsImageViewerOpen(true); }} style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer' }} title="View Receipt">
                                      <FileText size={18} />
                                    </button>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                                  )}
                                </td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                  <input type="checkbox" checked={m.isArrived} onChange={() => handleToggleMaterial(m.id, 'isArrived', m.isArrived, m.createdAt)} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}/>
                                </td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                  <input type="checkbox" checked={m.isPaid} onChange={() => handleToggleMaterial(m.id, 'isPaid', m.isPaid, m.createdAt)} style={{ width: '18px', height: '18px', accentColor: 'var(--success)', cursor: 'pointer' }}/>
                                </td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                  <button style={{ background: 'none', border: 'none', color: canModify ? 'var(--danger)' : 'var(--warning)', cursor: 'pointer', opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7} onClick={(e) => handleDeleteMaterial(e, m)} title={canModify ? "Delete Order" : "Request Delete"}>
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
</div>
                    </div>
                  )}
                </div>
              );
            })()}

            {projectTab === 'site_expenses' && (() => {
              const projAdvances = allSiteAdvances.filter(a => a.projectId === activeProjectId);
              const projExpenses = allSiteExpenses.filter(e => e.projectId === activeProjectId);
              
              const totalAdvance = projAdvances.reduce((sum, a) => sum + (a.amount || 0), 0);
              const totalExpense = projExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
              const engExpense = projExpenses.filter(e => e.paidBy !== 'Company').reduce((sum, e) => sum + (e.amount || 0), 0);
              const currentBalance = totalAdvance - engExpense;

              return (
                <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', minHeight: '500px' }}>
                  <div className="flex-between" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <h3 className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CreditCard size={20} className="text-gradient"/> Site Expenses & Petty Cash</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary" onClick={() => setIsAdvanceModalOpen(true)}>+ Issue Advance</button>
                      <button className="btn btn-primary" onClick={() => setIsExpenseModalOpen(true)}>+ Submit Expense Report</button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                     <div style={{ background: 'var(--glass-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Advance Issued</p>
                       <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs {totalAdvance.toFixed(2)}</p>
                     </div>
                     <div style={{ background: 'var(--glass-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Engineer Claimed Expenses</p>
                       <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Rs {engExpense.toFixed(2)}</p>
                       <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Out of total Rs {totalExpense.toFixed(2)}</p>
                     </div>
                     <div style={{ background: 'var(--glass-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: currentBalance < 0 ? '1px solid var(--danger)' : '1px solid var(--success)' }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Current Balance</p>
                       <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentBalance < 0 ? 'var(--danger)' : 'var(--success)' }}>Rs {Math.abs(currentBalance).toFixed(2)} {currentBalance < 0 ? '(Owed to Engineer)' : '(Owed to Company)'}</p>
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '2.5rem' }}>
                    {/* Advances Ledger */}
                    <div>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={16}/> Advances Issued</h4>
                      <div className="glass-card" style={{ padding: '0', background: 'var(--glass-overlay)' }}>
                        <div className="table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '1rem', fontWeight: 500 }}>Date</th>
                              <th style={{ padding: '1rem', fontWeight: 500 }}>Description</th>
                              <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Amount</th>
                              <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'center' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {projAdvances.sort((a,b) => new Date(b.date) - new Date(a.date)).map(adv => {
                              const canModify = canModifyEntry(adv.createdAt);
                              return (
                                <tr key={adv.id} style={{ borderBottom: '1px solid var(--glass-overlay)' }}>
                                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{adv.date}</td>
                                  <td style={{ padding: '1rem' }}>{adv.description}</td>
                                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, color: 'var(--success)' }}>+Rs {adv.amount}</td>
                                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <button onClick={(e) => handleDeleteAdvance(e, adv)} style={{ background: 'none', border: 'none', color: canModify ? 'var(--danger)' : 'var(--warning)', cursor: 'pointer', opacity: 0.7 }} title="Delete">
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                            {projAdvances.length === 0 && (
                              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No advances issued yet.</td></tr>
                            )}
                          </tbody>
                        </table>
</div>
                      </div>
                    </div>

                    {/* Expenses Ledger */}
                    <div>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={16}/> Expense Reports</h4>
                      <div className="glass-card" style={{ padding: '0', background: 'var(--glass-overlay)' }}>
                        <div className="table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '1rem', fontWeight: 500 }}>Date</th>
                              <th style={{ padding: '1rem', fontWeight: 500 }}>Description</th>
                              <th style={{ padding: '1rem', fontWeight: 500 }}>Paid By</th>
                              <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Amount</th>
                              <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'center' }}>Receipt</th>
                              <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'center' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {projExpenses.sort((a,b) => new Date(b.date) - new Date(a.date)).map(exp => {
                              const canModify = canModifyEntry(exp.createdAt);
                              return (
                                <tr key={exp.id} style={{ borderBottom: '1px solid var(--glass-overlay)' }}>
                                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{exp.date}</td>
                                  <td style={{ padding: '1rem' }}>{exp.description}</td>
                                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: exp.paidBy === 'Company' ? 'rgba(99, 102, 241, 0.2)' : 'var(--border-strong)', color: exp.paidBy === 'Company' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                      {exp.paidBy || 'Engineer'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, color: 'var(--danger)' }}>-Rs {exp.amount}</td>
                                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    {exp.receiptImage ? (
                                      <button onClick={() => { setViewImageUrl(exp.receiptImage); setIsImageViewerOpen(true); }} style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer' }} title="View Receipt">
                                        <FileText size={18} />
                                      </button>
                                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>}
                                  </td>
                                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <button onClick={(e) => handleDeleteExpense(e, exp)} style={{ background: 'none', border: 'none', color: canModify ? 'var(--danger)' : 'var(--warning)', cursor: 'pointer', opacity: 0.7 }} title="Delete">
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                            {projExpenses.length === 0 && (
                              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No expense reports submitted yet.</td></tr>
                            )}
                          </tbody>
                        </table>
</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {projectTab === 'documents' && (
              <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', minHeight: '500px' }}>
                <div className="flex-between" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                     <button onClick={() => setCurrentFolderId(null)} style={{ background: 'none', border: 'none', color: currentFolderId === null ? 'var(--text-primary)' : 'var(--accent-secondary)', cursor: 'pointer', fontSize: '1.125rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Folder size={18} /> Root</button>
                     {currentFolderId && currentFolder && (<><ChevronRight size={18} color="var(--text-muted)" /><span style={{ fontSize: '1.125rem', fontWeight: 500 }}>{currentFolder.name}</span></>)}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                     <button className="btn btn-secondary" onClick={() => setIsFolderModalOpen(true)}><FolderPlus size={18} /> New Folder</button>
                     <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)} disabled={currentFolderId === null} style={{ opacity: currentFolderId === null ? 0.5 : 1, cursor: currentFolderId === null ? 'not-allowed' : 'pointer' }}><UploadCloud size={18} /> Upload File</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: '1.5rem' }}>
                   {allDocs.filter(d => d.projectId === activeProjectId && d.parentId === currentFolderId).map(doc => (
                     <div key={doc.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)', background: doc.type === 'folder' ? 'var(--glass-darker)' : 'var(--glass-overlay)', position: 'relative' }} onClick={() => {
                        if (doc.type === 'folder') {
                          setCurrentFolderId(doc.id);
                        } else {
                          if (doc.hasIDBContent || doc.content) {
                            getFileContentFromDB(doc.id).then(idbContent => {
                              const contentToDownload = idbContent || doc.content;
                              if (contentToDownload) {
                                const a = document.createElement('a');
                                a.href = contentToDownload;
                                a.download = doc.name;
                                a.click();
                              } else {
                                alert("File content is missing.");
                              }
                            });
                          } else {
                            alert("This is an older document that was uploaded before file saving was enabled. It has no content.");
                          }
                        }
                     }}>
                       <button onClick={(e) => handleDeleteDoc(e, doc.id)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Delete"><X size={16} /></button>
                       {doc.type === 'folder' ? <Folder size={48} color="var(--accent-secondary)" style={{ marginBottom: '1rem' }} /> : <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />}
                       <span style={{ fontWeight: 500, wordBreak: 'break-word', color: doc.type === 'folder' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{doc.name}</span>
                       {doc.type === 'file' && <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.5rem', background: 'var(--accent-glow)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>{doc.size}</span>}
                       {doc.type === 'folder' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Directory</span>}
                     </div>
                   ))}
                   {allDocs.filter(d => d.projectId === activeProjectId && d.parentId === currentFolderId).length === 0 && (
                     <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '4rem', background: 'var(--glass-overlay)', borderRadius: 'var(--radius-md)' }}>
                       <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                       <p>This directory is empty.</p>
                     </div>
                   )}
                </div>
              </div>
            )}

            {projectTab === 'assets' && (
              <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', minHeight: '500px' }}>
                <div className="flex-between" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <h3 className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Truck size={20} className="text-gradient"/> Mobilized Assets</h3>
                  </div>
                  <button className="btn btn-primary" onClick={() => setIsAssetModalOpen(true)}>+ Add Asset</button>
                </div>
                {allAssets.filter(a => a.projectId === activeProjectId).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
                    <Truck size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p>No company assets currently mobilized to this project.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <div className="table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Asset Name</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Type / Category</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Date Mobilized</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Status</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Notes</th>
                          <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allAssets.filter(a => a.projectId === activeProjectId).map(asset => (
                          <tr key={asset.id} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: asset.status === 'Returned' ? 0.6 : 1 }}>
                            <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{asset.name}</td>
                            <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{asset.type}</td>
                            <td style={{ padding: '1rem 0.5rem', textAlign: 'center', fontWeight: 500 }}>{asset.quantity || 1}</td>
                            <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{asset.dateMobilized}</td>
                            <td style={{ padding: '1rem 0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: asset.status === 'Mobilized' ? 'rgba(99, 102, 241, 0.2)' : 'var(--border-strong)', color: asset.status === 'Mobilized' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                {asset.status} {asset.status === 'Returned' && `(${asset.dateReturned})`}
                              </span>
                            </td>
                            <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{asset.notes}</td>
                            <td style={{ padding: '1rem 0.5rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                              {asset.status === 'Mobilized' && (
                                <button className="btn btn-primary" onClick={() => handleReturnAsset(asset.id)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} title="Mark Returned">
                                  Return
                                </button>
                              )}
                              <button className="btn btn-danger" onClick={() => handleDeleteAsset(asset.id)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }} title="Delete Record">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
</div>
                  </div>
                )}
              </div>
            )}

            {projectTab === 'tasks' && (() => {
              const projTasks = allTasks.filter(t => t.projectId === activeProjectId);
              const columns = [
                { id: 'TODO', title: 'To Do', color: 'var(--text-primary)' },
                { id: 'IN_PROGRESS', title: 'In Progress', color: 'var(--accent-primary)' },
                { id: 'REVIEW', title: 'In Review', color: 'var(--warning)' },
                { id: 'DONE', title: 'Done', color: 'var(--success)' }
              ];

              const getPriorityColor = (priority) => {
                if (priority === 'CRITICAL') return 'var(--danger)';
                if (priority === 'HIGH') return 'var(--warning)';
                if (priority === 'MEDIUM') return 'var(--accent-secondary)';
                return 'var(--success)';
              };

              return (
                <div className="animate-fade-in" style={{ minHeight: '500px' }}>
                  <div className="flex-between" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <h3 className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckSquare size={20} className="text-gradient"/> Project Tasks</h3>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsTaskModalOpen(true)}>+ Add Task</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                    {columns.map(col => (
                      <div 
                        key={col.id} 
                        className="glass-card" 
                        style={{ padding: '1rem', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid ${col.color}` }}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                      >
                        <h4 style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)' }}>
                          {col.title}
                          <span style={{ fontSize: '0.75rem', background: 'var(--border-strong)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {projTasks.filter(t => t.status === col.id).length}
                          </span>
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                          {projTasks.filter(t => t.status === col.id).map(task => (
                            <div 
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              style={{ 
                                background: 'var(--glass-darker)', 
                                padding: '1rem', 
                                borderRadius: 'var(--radius-md)', 
                                cursor: 'grab', 
                                border: '1px solid var(--border-subtle)',
                                borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                                opacity: draggedTaskId === task.id ? 0.5 : 1
                              }}
                            >
                              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.7rem', color: getPriorityColor(task.priority), fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{task.priority}</span>
                                <button onClick={(e) => handleDeleteTask(e, task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={14}/></button>
                              </div>
                              <h5 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{task.title}</h5>
                              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>{task.description}</p>
                              
                              <div className="flex-between" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12}/> {task.dueDate || 'No Date'}</span>
                                {task.assignedTo && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--accent-glow)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                    <Users size={12}/> {allUsers.find(u => u.id === task.assignedTo)?.name || 'Unknown'}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {projTasks.filter(t => t.status === col.id).length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                              Drop tasks here
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {projectTab === 'settings' && (
              <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
                <h2 className="heading-2" style={{ marginBottom: '2rem' }}>Project Settings</h2>
                <div className="glass-card" style={{ padding: '2.5rem' }}>
                  <form onSubmit={handleUpdateProjectDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="input-group">
                      <label className="input-label">Project Name</label>
                      <input type="text" className="input-field" required value={editProjectForm.name} onChange={e => setEditProjectForm({...editProjectForm, name: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Description</label>
                      <textarea className="input-field" required rows="3" value={editProjectForm.description} onChange={e => setEditProjectForm({...editProjectForm, description: e.target.value})}></textarea>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem' }}>
                      <div className="input-group">
                        <label className="input-label">Location</label>
                        <input type="text" className="input-field" required value={editProjectForm.location} onChange={e => setEditProjectForm({...editProjectForm, location: e.target.value})} />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Client / Owner</label>
                        <input type="text" className="input-field" required value={editProjectForm.client} onChange={e => setEditProjectForm({...editProjectForm, client: e.target.value})} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Status</label>
                      <select className="input-field" value={editProjectForm.status} onChange={e => setEditProjectForm({...editProjectForm, status: e.target.value})} style={{ padding: '0.6rem', background: 'var(--glass-darker)' }}>
                        <option value="Active">Active</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Assigned Team Members</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {allUsers.filter(u => u.id !== currentUser?.id).map(u => (
                          <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--glass-hover)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: (editProjectForm.assignedUsers || []).includes(u.id) ? '1px solid var(--accent-primary)' : '1px solid transparent' }}>
                            <input type="checkbox" checked={(editProjectForm.assignedUsers || []).includes(u.id)} onChange={(e) => {
                              if (e.target.checked) setEditProjectForm({...editProjectForm, assignedUsers: [...(editProjectForm.assignedUsers || []), u.id]});
                              else setEditProjectForm({...editProjectForm, assignedUsers: (editProjectForm.assignedUsers || []).filter(id => id !== u.id)});
                            }} style={{ accentColor: 'var(--accent-primary)' }}/>
                            {u.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                      Save Changes
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {activeProjectId === null && activeTab === 'profile' && (
          <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
            <h2 className="heading-2" style={{ marginBottom: '2rem' }}>My Profile</h2>
            <div className="glass-card" style={{ padding: '2.5rem' }}>
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {profileMessage && (
                  <div style={{ padding: '1rem', background: profileMessage.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: profileMessage.includes('Error') ? 'var(--danger)' : 'var(--success)', borderRadius: 'var(--radius-sm)', border: `1px solid ${profileMessage.includes('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` }}>
                    {profileMessage}
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Email (Read-only)</label>
                  <input type="email" className="input-field" value={currentUser?.email || ''} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                </div>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input type="text" className="input-field" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Security</label>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsPasswordModalOpen(true)}>Change Password</button>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}
      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsPasswordModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Change Password</h2>
            
            {passwordError && (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.5rem' }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Old Password</label>
                <input type="password" className="input-field" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">New Password</label>
                <input type="password" className="input-field" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <input type="password" className="input-field" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Update Password</button>
            </form>
          </div>
        </div>
      )}
      </main>

      {/* ================= MODALS ================= */}

      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '900px', position: 'relative', display: 'flex', gap: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setIsCreateModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', width: '100%', gap: '2.5rem' }}>
              <div style={{ flex: 1 }}>
                <h2 className="heading-2" style={{ marginBottom: '0.5rem' }}>Launch Project</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Define project parameters and scope.</p>
                <div className="input-group"><label className="input-label">Project Name</label><input type="text" className="input-field" required value={pName} onChange={e => setPName(e.target.value)} /></div>
                <div className="input-group"><label className="input-label">Description</label><textarea className="input-field" required value={pDesc} onChange={e => setPDesc(e.target.value)} style={{ minHeight: '80px', resize: 'vertical' }}></textarea></div>
                <div style={{ display: 'flex', gap: '1rem' }}><div className="input-group" style={{ flex: 1 }}><label className="input-label">Client</label><input type="text" className="input-field" required value={pClient} onChange={e => setPClient(e.target.value)} /></div><div className="input-group" style={{ flex: 1 }}><label className="input-label">Start Date</label><input type="date" className="input-field" required value={pStartDate} onChange={e => setPStartDate(e.target.value)} style={{ colorScheme: 'dark' }} /></div></div>
                <div className="input-group"><label className="input-label">Location</label><input type="text" className="input-field" required value={pLocation} onChange={e => setPLocation(e.target.value)} /></div>
              </div>
              <div style={{ flex: 1, borderLeft: '1px solid var(--border-strong)', paddingLeft: '2.5rem', display: 'flex', flexDirection: 'column' }}>
                <h3 className="heading-3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={20} className="text-gradient" /> Assign Team</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {allUsers.map(user => {
                    const isRoot = user.permissions?.root;
                    const isChecked = isRoot || pAssigned.includes(user.id);
                    return (
                      <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: isChecked ? 'rgba(99, 102, 241, 0.1)' : 'var(--glass-hover)', border: `1px solid ${isChecked ? 'rgba(99, 102, 241, 0.3)' : 'transparent'}`, borderRadius: 'var(--radius-sm)', cursor: isRoot ? 'not-allowed' : 'pointer' }}>
                        <input type="checkbox" checked={isChecked} onChange={() => !isRoot && toggleAssignUser(user.id)} disabled={isRoot} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}/>
                        <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 500 }}>{user.name}</span><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</span></div>
                      </label>
                    )
                  })}
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}><Plus size={20}/> Launch Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isFolderModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsFolderModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Create Folder</h2>
            <form onSubmit={handleCreateFolder}>
              <div className="input-group"><label className="input-label">Folder Name</label><input type="text" className="input-field" required autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)} /></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><FolderPlus size={20}/> Create</button>
            </form>
          </div>
        </div>
      )}

      {isUploadModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsUploadModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Upload Document</h2>
            <form onSubmit={handleUploadDoc}>
              <div className="input-group"><label className="input-label">Select File</label><input type="file" className="input-field" required onChange={e => setSelectedFile(e.target.files[0])} style={{ padding: '0.6rem', colorScheme: 'dark' }} /></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><UploadCloud size={20}/> Upload File</button>
            </form>
          </div>
        </div>
      )}

      {/* Register Worker Modal */}
      {isWorkerModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsWorkerModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Register Labourer</h2>
            <form onSubmit={handleCreateWorker}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" required autoFocus value={wName} onChange={e => setWName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div className="input-group">
                <label className="input-label">Trade / Role</label>
                <input type="text" className="input-field" required value={wTrade} onChange={e => setWTrade(e.target.value)} placeholder="e.g. Electrician, Carpenter" />
              </div>
              <div className="input-group">
                <label className="input-label">Daily Wage (Rs) - 8 Hour Shift</label>
                <input type="number" className="input-field" required min="0" step="1" value={wWage} onChange={e => setWWage(e.target.value)} placeholder="e.g. 1500" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><Plus size={20}/> Register Worker</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {isEditWorkerModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => { setIsEditWorkerModalOpen(false); setEditWorkerObj(null); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Edit Labourer</h2>
            <form onSubmit={handleEditWorkerSubmit}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" required autoFocus value={ewName} onChange={e => setEwName(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Trade / Role</label>
                <input type="text" className="input-field" required value={ewTrade} onChange={e => setEwTrade(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Daily Wage (Rs) - 8 Hours</label>
                <input type="number" className="input-field" required min="1" step="1" value={ewWage} onChange={e => setEwWage(e.target.value)} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Note: Changing the daily wage only affects future attendance. Past attendance will use the historical wage at the time of logging.</p>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><Edit2 size={20}/> Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Register Subcontractor Modal */}
      {isSubModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsSubModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Hire Subcontractor</h2>
            <form onSubmit={handleCreateSub}>
              <div className="input-group">
                <label className="input-label">Company Name</label>
                <input type="text" className="input-field" required autoFocus value={subName} onChange={e => setSubName(e.target.value)} placeholder="e.g. Apex Plumbing" />
              </div>
              <div className="input-group">
                <label className="input-label">Trade / Scope of Work</label>
                <input type="text" className="input-field" required value={subTrade} onChange={e => setSubTrade(e.target.value)} placeholder="e.g. Rough-in Plumbing" />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontStyle: 'italic' }}>Note: The Final Measured Value will be set at the end of the project during settlement.</p>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}><Plus size={20}/> Add Subcontractor</button>
            </form>
          </div>
        </div>
      )}

      {/* Log Payment Modal */}
      {isSubPayModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsSubPayModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>{subPayMode === 'add' ? 'Log Payment' : 'Edit Payment'}</h2>
            
            {subPayMode === 'edit' && !currentUser.permissions?.root && (() => {
              const payment = allSubPayments.find(p => p.id === activeSubPayId);
              if (payment && (new Date() - new Date(payment.createdAt) > 24 * 60 * 60 * 1000)) {
                return <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-sm)', color: 'var(--warning)', fontSize: '0.875rem' }}><Shield size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }}/> This payment is locked. Submitting this form will send a Modification Request to the Root Admin.</div>;
              }
              return null;
            })()}

            <form onSubmit={handleCreateSubPay}>
              <div className="input-group">
                <label className="input-label">Payment Date</label>
                <input type="date" className="input-field" required value={subPayDate} onChange={e => setSubPayDate(e.target.value)} style={{ colorScheme: 'dark' }} min={!adminUnlockPast ? todayStrGlobal : undefined} />
              </div>
              <div className="input-group">
                <label className="input-label">Amount Paid (Rs)</label>
                <input type="number" className="input-field" required min="0" step="1" value={subPayAmount} onChange={e => setSubPayAmount(e.target.value)} placeholder="0" />
              </div>
              <div className="input-group">
                <label className="input-label">Description / Invoice Ref</label>
                <input type="text" className="input-field" required value={subPayDesc} onChange={e => setSubPayDesc(e.target.value)} placeholder="e.g. Draw #1 - 25% Completion" />
              </div>
              <button type="submit" className={`btn ${subPayMode === 'add' ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', marginTop: '1rem' }}><DollarSign size={20}/> {subPayMode === 'add' ? 'Log Payment' : 'Save / Request Edit'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsCategoryModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>New Material Category</h2>
            <form onSubmit={handleCreateCategory}>
              <div className="input-group">
                <label className="input-label">Category Name</label>
                <input type="text" className="input-field" required autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Scaffolding" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><Plus size={20}/> Add Category</button>
            </form>
          </div>
        </div>
      )}

      {/* Log Material Order Modal */}
      {isMaterialModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsMaterialModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Log Material Order</h2>
            <form onSubmit={handleCreateMaterial}>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input-field" required value={mCategory} onChange={e => setMCategory(e.target.value)} style={{ padding: '0.6rem', background: 'var(--glass-darker)' }}>
                  <option value="" disabled>Select a category...</option>
                  {materialCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Item Description</label>
                <input type="text" className="input-field" required value={mName} onChange={e => setMName(e.target.value)} placeholder="e.g. Portland Cement 50kg" />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Unit Price (Rs)</label>
                  <input type="number" className="input-field" required min="0" step="1" value={mPrice} onChange={e => setMPrice(e.target.value)} placeholder="1500" />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Quantity</label>
                  <input type="number" className="input-field" required min="1" step="1" value={mQty} onChange={e => setMQty(e.target.value)} placeholder="100" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Karaya / Freight Cost (Rs) - Optional</label>
                <input type="number" className="input-field" min="0" step="1" value={mKaraya} onChange={e => setMKaraya(e.target.value)} placeholder="0" />
              </div>
              <div className="input-group">
                <label className="input-label">Total Cost: <span style={{ color: 'var(--accent-primary)', marginLeft: '0.5rem' }}>Rs {((Number(mPrice) * Number(mQty)) || 0) + (Number(mKaraya) || 0)}</span></label>
              </div>
              <div className="input-group">
                <label className="input-label">Order Date</label>
                <input type="date" className="input-field" required value={mOrderDate} onChange={e => setMOrderDate(e.target.value)} style={{ colorScheme: 'dark' }} min={!adminUnlockPast ? todayStrGlobal : undefined} />
              </div>
              <div className="input-group">
                <label className="input-label">Bill / Receipt Picture (Optional)</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UploadCloud size={18} style={{ marginRight: '0.5rem' }}/> Choose Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                  {mReceipt && <span style={{ fontSize: '0.875rem', color: 'var(--success)' }}><CheckCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.25rem' }}/> Image Attached</span>}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><Package size={20}/> Submit Order</button>
            </form>
          </div>
        </div>
      )}

      {/* Issue Advance Modal */}
      {isAdvanceModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsAdvanceModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Issue Advance</h2>
            <form onSubmit={handleCreateAdvance}>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input type="date" className="input-field" required value={advDate} onChange={e => setAdvDate(e.target.value)} style={{ colorScheme: 'dark' }} min={!adminUnlockPast ? todayStrGlobal : undefined} />
              </div>
              <div className="input-group">
                <label className="input-label">Amount Given (Rs)</label>
                <input type="number" className="input-field" required min="1" step="1" value={advAmount} onChange={e => setAdvAmount(e.target.value)} placeholder="50000" />
              </div>
              <div className="input-group">
                <label className="input-label">Description / Note</label>
                <input type="text" className="input-field" required value={advDesc} onChange={e => setAdvDesc(e.target.value)} placeholder="e.g. Initial petty cash" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><DollarSign size={20}/> Give Advance</button>
            </form>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      {isExpenseModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsExpenseModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Submit Expense Report</h2>
            <form onSubmit={handleCreateExpense}>
              <div className="input-group">
                <label className="input-label">Date of Report</label>
                <input type="date" className="input-field" required value={expDate} onChange={e => setExpDate(e.target.value)} style={{ colorScheme: 'dark' }} min={!adminUnlockPast ? todayStrGlobal : undefined} />
              </div>
              <div className="input-group">
                <label className="input-label">Total Amount Spent (Rs)</label>
                <input type="number" className="input-field" required min="1" step="1" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="42000" />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <input type="text" className="input-field" required value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="e.g. Labor lunch, minor tools" />
              </div>
              <div className="input-group">
                <label className="input-label">Paid By</label>
                <select className="input-field" value={expPaidBy} onChange={e => setExpPaidBy(e.target.value)} style={{ padding: '0.6rem', background: 'var(--glass-darker)' }}>
                  <option value="Engineer">Site Engineer (Deduct from Advance)</option>
                  <option value="Company">Company / Admin (Direct Expense)</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Photo of Expense Sheet / Receipts</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UploadCloud size={18} style={{ marginRight: '0.5rem' }}/> Choose Image
                    <input type="file" accept="image/*" required onChange={handleExpenseImageUpload} style={{ display: 'none' }} />
                  </label>
                  {expReceipt && <span style={{ fontSize: '0.875rem', color: 'var(--success)' }}><CheckCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.25rem' }}/> Attached</span>}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><FileText size={20}/> Submit Report</button>
            </form>
          </div>
        </div>
      )}

      {/* Settle Labourer Modal */}
      {isSettleModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => { setIsSettleModalOpen(false); setSettleWorkerId(null); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Settle Payroll</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>This will mark outstanding wages in this date range as paid. You can optionally issue a new cash advance to this worker for the upcoming week below.</p>
            <form onSubmit={handleConfirmSettle}>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input type="checkbox" id="settleAdvancesFlag" checked={settleAdvancesFlag} onChange={e => setSettleAdvancesFlag(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }} />
                <label htmlFor="settleAdvancesFlag" style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Settle previously issued advances too</label>
              </div>
              <div className="input-group">
                <label className="input-label">Additional Advance (Rs) - Optional</label>
                <input type="number" className="input-field" min="0" step="1" value={settleAdvance} onChange={e => setSettleAdvance(e.target.value)} placeholder="0" />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>This amount will be deducted from their future earnings.</p>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', background: 'var(--success)', borderColor: 'var(--success)' }}><CheckCircle size={20}/> Confirm Settlement</button>
            </form>
          </div>
        </div>
      )}

      {/* Issue Worker Advance Modal */}
      {isWorkerAdvanceModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => { setIsWorkerAdvanceModalOpen(false); setWorkerAdvanceWorkerId(null); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Issue Cash Advance</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>This will issue a mid-week cash advance without marking their current wages as paid. It will automatically be deducted from their final settlement.</p>
            <form onSubmit={handleConfirmWorkerAdvance}>
              <div className="input-group">
                <label className="input-label">Advance Amount (Rs)</label>
                <input type="number" className="input-field" required min="1" step="1" value={workerAdvanceAmount} onChange={e => setWorkerAdvanceAmount(e.target.value)} placeholder="e.g. 2000" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', background: 'var(--accent-primary)' }}><CreditCard size={20}/> Issue Advance</button>
            </form>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {isImageViewerOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setIsImageViewerOpen(false)}>
          <button onClick={() => setIsImageViewerOpen(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={32} /></button>
          <img src={viewImageUrl} alt="Receipt" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Add Asset Modal */}
      {isAssetModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsAssetModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Truck size={24} className="text-gradient"/> Mobilize Asset</h2>
            <form onSubmit={handleAddAsset}>
              <div className="input-group">
                <label className="input-label">Asset Name</label>
                <input type="text" className="input-field" required value={assetName} onChange={e => setAssetName(e.target.value)} placeholder="e.g. Concrete Mixer #4" />
              </div>
              <div className="input-group">
                <label className="input-label">Type / Category</label>
                <input type="text" className="input-field" required value={assetType} onChange={e => setAssetType(e.target.value)} placeholder="e.g. Heavy Machinery" />
              </div>
              <div className="input-group">
                <label className="input-label">Quantity</label>
                <input type="number" className="input-field" required min="1" step="1" value={assetQty} onChange={e => setAssetQty(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Date Mobilized</label>
                <input type="date" className="input-field" required value={assetDate} onChange={e => setAssetDate(e.target.value)} style={{ colorScheme: 'dark' }} />
              </div>
              <div className="input-group">
                <label className="input-label">Notes (Optional)</label>
                <textarea className="input-field" value={assetNotes} onChange={e => setAssetNotes(e.target.value)} style={{ minHeight: '80px' }}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Add Asset</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isTaskModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsTaskModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckSquare size={24} className="text-gradient"/> Create Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label className="input-label">Task Title</label>
                <input type="text" className="input-field" required value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Order cement for foundation" />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" required value={taskDesc} onChange={e => setTaskDesc(e.target.value)} style={{ minHeight: '80px' }} placeholder="Provide detailed instructions..."></textarea>
              </div>
              <div className="input-group">
                <label className="input-label">Assign To</label>
                <select className="input-field" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} style={{ padding: '0.6rem', background: 'var(--glass-darker)' }}>
                  <option value="">Unassigned</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="input-label">Priority</label>
                  <select className="input-field" value={taskPriority} onChange={e => setTaskPriority(e.target.value)} style={{ padding: '0.6rem', background: 'var(--glass-darker)' }}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="input-label">Due Date</label>
                  <input type="date" className="input-field" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} style={{ colorScheme: 'dark', flex: 1, minWidth: '130px' }} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Task</button>
            </form>
          </div>
        </div>
      )}

      {/* Global My Pending Tasks Modal */}
      {isGlobalTasksModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsGlobalTasksModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckSquare size={24} className="text-gradient"/> My Pending Tasks</h2>
            
            {(() => {
              const myPendingTasks = allTasks.filter(t => t.assignedTo === currentUser?.id && t.status !== 'DONE');
              if (myPendingTasks.length === 0) return <p style={{ color: 'var(--text-muted)' }}>You have no pending tasks.</p>;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {myPendingTasks.map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <div key={task.id} style={{ padding: '1rem', background: 'var(--glass-darker)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', color: task.priority === 'CRITICAL' ? 'var(--danger)' : task.priority === 'HIGH' ? 'var(--warning)' : 'var(--accent-secondary)', fontWeight: 'bold' }}>{task.priority}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: {task.dueDate || 'N/A'}</span>
                        </div>
                        <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{task.title}</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{task.description}</p>
                        
                        <div className="flex-between">
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', background: 'var(--accent-glow)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Project: {project?.name || 'Unknown'}</span>
                          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => {
                            setIsGlobalTasksModalOpen(false);
                            setActiveProjectId(task.projectId);
                            setProjectTab('tasks');
                          }}>Go to Board &rarr;</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Report Configuration Modal */}
      {isReportModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '500px' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
              <h2 className="heading-3">Generate Report</h2>
              <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setIsReportModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Start Date (Optional)</label>
              <input type="date" className="input-field" value={reportConfig.startDate} onChange={e => setReportConfig({...reportConfig, startDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date (Optional)</label>
              <input type="date" className="input-field" value={reportConfig.endDate} onChange={e => setReportConfig({...reportConfig, endDate: e.target.value})} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={reportConfig.includeMaterials} onChange={e => setReportConfig({...reportConfig, includeMaterials: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                Include Materials Data
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={reportConfig.includeSubcontractors} onChange={e => setReportConfig({...reportConfig, includeSubcontractors: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                Include Subcontractors Data
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={reportConfig.includeLabour} onChange={e => setReportConfig({...reportConfig, includeLabour: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                Include Labour & Payroll Data
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setIsReportModalOpen(false); setIsReportPreviewActive(true); }}>Preview Report</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsReportModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Report Preview */}
      {isReportPreviewActive && (() => {
        const activeProj = projects.find(p => p.id === activeProjectId) || { name: 'All Projects' };
        
        // Filter Functions
        const isWithinDate = (dString) => {
          if (!dString) return true;
          const d = new Date(dString);
          if (reportConfig.startDate && d < new Date(reportConfig.startDate)) return false;
          if (reportConfig.endDate && d > new Date(reportConfig.endDate)) return false;
          return true;
        };

        const repMaterials = allMaterials.filter(m => m.projectId === activeProjectId && isWithinDate(m.orderDate));
        const repSubs = allSubPayments.filter(p => p.projectId === activeProjectId && isWithinDate(p.date));
        
        const repAttendance = allAttendance.filter(a => a.projectId === activeProjectId && isWithinDate(a.date));
        const workerTotals = {};
        repAttendance.forEach(a => {
          if (!workerTotals[a.workerId]) workerTotals[a.workerId] = { gross: 0, advance: 0, net: 0 };
          const w = allWorkers.find(wk => wk.id === a.workerId);
          if (w) {
            const hrRate = (w.dailyWage || 0) / 8;
            const gross = ((Number(a.regularHours) + Number(a.overtimeHours)) * hrRate);
            const adv = Number(a.advance || 0);
            workerTotals[a.workerId].gross += gross;
            workerTotals[a.workerId].advance += adv;
            workerTotals[a.workerId].net += (gross - adv);
          }
        });

        const matTotal = repMaterials.reduce((acc, m) => acc + Number(m.totalCost || 0), 0);
        const subTotal = repSubs.reduce((acc, p) => acc + Number(p.amount || 0), 0);
        const labTotal = Object.values(workerTotals).reduce((acc, val) => acc + val.net, 0);

        return (
          <div className="print-view">
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '20px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <button className="btn btn-secondary" onClick={() => setIsReportPreviewActive(false)}>Close Preview</button>
              <button className="btn btn-primary" onClick={() => window.print()}><Printer size={18}/> Print Hardcopy</button>
            </div>

            <div className="print-header">
              <h1>{activeProj.name}</h1>
              <h2>Financial & Operations Report</h2>
              <h3>{reportConfig.startDate || 'Beginning'} to {reportConfig.endDate || 'Present'}</h3>
            </div>

            {reportConfig.includeMaterials && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ borderBottom: '2px solid black', paddingBottom: '5px', marginBottom: '10px' }}>Material Orders</h3>
                <table className="print-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repMaterials.map(m => (
                      <tr key={m.id}>
                        <td>{m.orderDate}</td>
                        <td>{m.name}</td>
                        <td>{m.category}</td>
                        <td>{m.quantity} {m.unit}</td>
                        <td>Rs {Number(m.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Sub-Total Materials:</td>
                      <td style={{ fontWeight: 'bold' }}>Rs {matTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {reportConfig.includeSubcontractors && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ borderBottom: '2px solid black', paddingBottom: '5px', marginBottom: '10px' }}>Subcontractor Payments</h3>
                <table className="print-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subcontractor</th>
                      <th>Description</th>
                      <th>Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repSubs.map(p => {
                      const sub = allSubcontractors.find(s => s.id === p.subId);
                      return (
                        <tr key={p.id}>
                          <td>{p.date}</td>
                          <td>{sub ? sub.name : 'Unknown'}</td>
                          <td>{p.description}</td>
                          <td>Rs {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )
                    })}
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Sub-Total Subcontractors:</td>
                      <td style={{ fontWeight: 'bold' }}>Rs {subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {reportConfig.includeLabour && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ borderBottom: '2px solid black', paddingBottom: '5px', marginBottom: '10px' }}>Labour & Payroll (Net Wages Earned in Period)</h3>
                <table className="print-table">
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Trade</th>
                      <th>Gross Pay</th>
                      <th>Advance</th>
                      <th>Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(workerTotals).map(([wId, totals]) => {
                      if (totals.net === 0 && totals.gross === 0) return null;
                      const worker = allWorkers.find(w => w.id === wId);
                      return (
                        <tr key={wId}>
                          <td>{worker ? worker.name : 'Unknown'}</td>
                          <td>{worker ? worker.trade : ''}</td>
                          <td>Rs {totals.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td>Rs {totals.advance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td>Rs {totals.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Sub-Total Labour:</td>
                      <td style={{ fontWeight: 'bold' }}>Rs {labTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: '50px', textAlign: 'right', fontSize: '18px' }}>
              <strong>Grand Total For Period: </strong> 
              <span style={{ borderBottom: '2px double black' }}>Rs {(matTotal + subTotal + labTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="print-only" style={{ marginTop: '100px', display: 'none' }}>
              <p>Generated by App: {new Date().toLocaleString()}</p>
            </div>
          </div>
        );
      })()}

      {/* Security Challenge Modal */}
      {securityChallenge.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 99999 }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', border: '1px solid var(--danger)' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h2 className="heading-3" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={24} /> Security Challenge
              </h2>
              <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setSecurityChallenge({...securityChallenge, isOpen: false})}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {securityChallenge.title}
            </p>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Type "{securityChallenge.expectedWord}" to confirm:</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder={securityChallenge.expectedWord} 
                value={securityChallenge.inputText} 
                onChange={(e) => setSecurityChallenge({...securityChallenge, inputText: e.target.value})}
                autoFocus
              />
            </div>
            <button 
              className="btn btn-danger" 
              style={{ width: '100%', padding: '1rem', opacity: securityChallenge.inputText === securityChallenge.expectedWord ? 1 : 0.5, cursor: securityChallenge.inputText === securityChallenge.expectedWord ? 'pointer' : 'not-allowed' }}
              disabled={securityChallenge.inputText !== securityChallenge.expectedWord}
              onClick={async () => {
                if (securityChallenge.inputText === securityChallenge.expectedWord) {
                  setSecurityChallenge({...securityChallenge, isOpen: false});
                  if (securityChallenge.onConfirm) await securityChallenge.onConfirm();
                }
              }}
            >
              Confirm Action
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;

