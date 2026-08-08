import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getUsers, getDocuments, getWorkers, getAttendance, getSubcontractors,
  getSubPayments, getChangeRequests, getMaterials, getMaterialCategories, 
  getVendors, getSiteAdvances, getSiteExpenses, getAssets, getTasks, 
  getMessages, getProjects 
} from '../utils/db';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  
  const [allUsers, setAllUsers] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [allSubcontractors, setAllSubcontractors] = useState([]);
  const [allSubPayments, setAllSubPayments] = useState([]);
  const [allChangeRequests, setAllChangeRequests] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [materialCategories, setMaterialCategories] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [allSiteAdvances, setAllSiteAdvances] = useState([]);
  const [allSiteExpenses, setAllSiteExpenses] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allMessages, setAllMessages] = useState([]);

  const loadData = async () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    if (window.OneSignal) {
      window.OneSignal.login(user.id);
    }
    
    const [
      users, docs, workers, attendance, subs, 
      rawSubPayments, crs, mats, matCats, vendors, advances, 
      expenses, assets, tasks, messages, allProj
    ] = await Promise.all([
      getUsers(), getDocuments(), getWorkers(), getAttendance(), getSubcontractors(),
      getSubPayments(), getChangeRequests(), getMaterials(), getMaterialCategories(), getVendors(), getSiteAdvances(),
      getSiteExpenses(), getAssets(), getTasks(), getMessages(), getProjects()
    ]);

    setAllUsers(users);
    setAllDocs(docs);
    setAllWorkers(workers);
    setAllAttendance(attendance);
    setAllSubcontractors(subs);
    
    const subPayments = rawSubPayments.filter(p => subs.some(s => s.id === p.subId));
    setAllSubPayments(subPayments);
    
    setAllChangeRequests(crs);
    setAllMaterials(mats);
    setMaterialCategories(matCats);
    setAllVendors(vendors);
    setAllSiteAdvances(advances);
    setAllSiteExpenses(expenses);
    setAllAssets(assets);
    setAllTasks(tasks);
    setAllMessages(messages);
    
    if (user.permissions?.root) {
      setProjects(allProj);
    } else {
      setProjects(allProj.filter(p => {
        let usersList = [];
        try { usersList = typeof p.assignedUsers === 'string' ? JSON.parse(p.assignedUsers) : (p.assignedUsers || []); } 
        catch(e) {}
        return p.createdBy === user.id || usersList.includes(user.id);
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

    const materialTotal = allMaterials.filter(m => m.projectId === projectId).reduce((acc, m) => acc + (m.totalCost || 0), 0);
    const subTotal = allSubcontractors.filter(s => s.projectId === projectId).reduce((acc, s) => acc + (s.finalContractValue || s.totalValue || 0), 0);
    const expenseTotal = allSiteExpenses.filter(e => e.projectId === projectId).reduce((acc, e) => acc + (e.amount || 0), 0);
    
    return labourTotal + materialTotal + subTotal + expenseTotal;
  };

  return (
    <DashboardContext.Provider value={{
      currentUser, setCurrentUser, projects, setProjects, activeProjectId, setActiveProjectId,
      allUsers, setAllUsers, allDocs, setAllDocs, allWorkers, setAllWorkers, allAttendance, setAllAttendance,
      allSubcontractors, setAllSubcontractors, allSubPayments, setAllSubPayments, allChangeRequests, setAllChangeRequests,
      allMaterials, setAllMaterials, materialCategories, setMaterialCategories, allVendors, setAllVendors,
      allSiteAdvances, setAllSiteAdvances, allSiteExpenses, setAllSiteExpenses, allAssets, setAllAssets,
      allTasks, setAllTasks, allMessages, setAllMessages,
      loadData, calculateTotalProjectCost
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
