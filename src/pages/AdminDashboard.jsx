import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Settings, LayoutDashboard, Trash2, X, Shield, ShieldAlert, Crown, Menu, Briefcase } from 'lucide-react';
import { getUsers, removeUser, updateUserAdminFields, getProjects, updateProject, updateUserProfile } from '../utils/db';
import { supabase } from '../supabaseClient';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  
  // Modals
  const [isEditPermsModalOpen, setIsEditPermsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  
  // Admin Password Modal State
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      navigate('/login');
      return;
    }
    setCurrentUser(JSON.parse(userStr));
    
    const fetchData = async () => {
      setUsersList(await getUsers());
      setAllProjects(await getProjects());
    };
    fetchData();
  }, [navigate]);

  const handleNav = (action) => {
    setIsMobileMenuOpen(false);
    action();
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await supabase.auth.signOut();
      localStorage.removeItem('currentUser');
      navigate('/login');
    }
  };

  const handleRemoveUser = async (id) => {
    const userToDelete = usersList.find(u => u.id === id);
    if (userToDelete?.email === 'talhanaveed89@gmail.com' || id === '1') {
      alert("This user account is permanently protected and cannot be deleted.");
      return;
    }
    
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      try {
        await removeUser(id);
        setUsersList(await getUsers());
      } catch (e) {
        alert("Failed to delete user: " + e.message);
      }
    }
  };

  // --- Edit Permissions Handlers ---
  const openEditPerms = (user) => {
    setUserToEdit(JSON.parse(JSON.stringify(user))); // Deep copy
    const assigned = allProjects.filter(p => {
      let users = [];
      try { users = typeof p.assignedUsers === 'string' ? JSON.parse(p.assignedUsers) : (p.assignedUsers || []); } catch(e) {}
      return users.includes(user.id);
    }).map(p => p.id);
    setUserProjects(assigned);
    setIsEditPermsModalOpen(true);
  };

  const toggleEditPermission = (key) => {
    if (userToEdit.id === '1' && key === 'root') return;
    setUserToEdit(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
    }));
  };
  
  const toggleProject = (projectId) => {
    setUserProjects(prev => 
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSavePermissions = async (e) => {
    e.preventDefault();
    try {
      await updateUserAdminFields(userToEdit.id, {
         name: userToEdit.name,
         role: userToEdit.role,
         status: userToEdit.status,
         permissions: userToEdit.permissions
      });

      // Update project assignments
      for (const p of allProjects) {
        let users = [];
        try { users = typeof p.assignedUsers === 'string' ? JSON.parse(p.assignedUsers) : (p.assignedUsers || []); } catch(e) {}
        
        const isCurrentlyAssigned = users.includes(userToEdit.id);
        const shouldBeAssigned = userProjects.includes(p.id) || userToEdit.permissions.root;
        
        if (shouldBeAssigned && !isCurrentlyAssigned) {
          users.push(userToEdit.id);
          await updateProject(p.id, { assignedUsers: JSON.stringify(users) });
        } else if (!shouldBeAssigned && isCurrentlyAssigned) {
          users = users.filter(id => id !== userToEdit.id);
          await updateProject(p.id, { assignedUsers: JSON.stringify(users) });
        }
      }

      setUsersList(await getUsers());
      setAllProjects(await getProjects());
      setIsEditPermsModalOpen(false);
      setUserToEdit(null);
    } catch(err) {
      alert("Error saving user: " + err.message);
    }
  };

  const handleForcePasswordReset = async (e) => {
    e.preventDefault();
    setAdminPasswordError('');

    if (adminPassword !== currentUser.password) {
      setAdminPasswordError("Incorrect Admin password.");
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setAdminPasswordError("New passwords do not match.");
      return;
    }
    
    try {
      await updateUserProfile(userToEdit.id, userToEdit.name, newAdminPassword);
      setUsersList(await getUsers());
      setIsAdminPasswordModalOpen(false);
      setAdminPassword('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      alert(`Password for ${userToEdit.email} reset successfully!`);
    } catch(err) {
      setAdminPasswordError('Error: ' + err.message);
    }
  };

  const PERMISSION_LABELS = {
    root: "Admin Access (Manage Users)",
    overview: "Overview",
    attendance: "Attendance",
    payroll: "Payroll & Wages",
    subcontractors: "Subcontractors",
    materials: "Materials",
    site_expenses: "Site Expenses",
    assets: "Assets",
    documents: "Documents",
    tasks: "Tasks"
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        <button onClick={() => setIsMobileMenuOpen(false)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "transparent", border: "none", color: "var(--text-secondary)" }} className="hide-on-desktop"><X size={20}/></button>
        <h2 className="heading-3 text-gradient" style={{ marginBottom: '2rem' }}>{currentUser?.name || 'Admin'}</h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><LayoutDashboard size={20}/> Overview</button>
          <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }}><Users size={20}/> Manage Users</button>
          <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><Settings size={20}/> Settings</button>
          
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ justifyContent: 'flex-start', marginTop: '1rem', border: '1px solid var(--accent-secondary)' }}>
            <LayoutDashboard size={20}/> User Dashboard
          </button>
        </nav>

        <button className="btn btn-danger" onClick={() => handleNav(handleLogout)} style={{ justifyContent: 'flex-start' }}>
          <LogOut size={20}/> Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className={`sidebar-overlay ${isMobileMenuOpen ? "open" : ""}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <main className="main-content">
        <div className="mobile-header">
          <h2 className="heading-3 text-gradient" style={{ margin: 0 }}>{currentUser?.name || 'Admin'}</h2>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
              <LogOut size={22} />
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
              <Menu size={26} />
            </button>
          </div>
        </div>
        <header className="flex-between animate-fade-in mobile-stack" style={{ marginBottom: '3rem' }}>
          <div>
            <h1 className="heading-1">User Management</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Review pending users, assign roles, and manage access.</p>
          </div>
        </header>

        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', overflowX: 'auto', animationDelay: '0.1s' }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Access Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{user.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                    </td>
                    <td><span style={{ padding: '0.25rem 0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', fontSize: '0.875rem' }}>{user.role}</span></td>
                    <td>
                      {user.permissions?.root ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontSize: '0.875rem', fontWeight: 500 }}>
                          <Crown size={14} /> Root Admin
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-secondary)', fontSize: '0.875rem' }}>
                          <Shield size={14} /> Custom
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem',
                        color: user.status === 'Active' ? 'var(--success)' : 'var(--warning)'
                      }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', boxShadow: user.status === 'Pending' ? '0 0 8px currentColor' : 'none' }}></span>
                        {user.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEditPerms(user)} className="btn btn-secondary" style={{ padding: '0.5rem', background: 'var(--bg-primary)' }} title="Review & Assign">
                          <ShieldAlert size={16}/>
                        </button>
                        
                        {(user.id !== '1' && user.email !== 'talhanaveed89@gmail.com') ? (
                          <button onClick={() => handleRemoveUser(user.id)} className="btn btn-danger" style={{ padding: '0.5rem' }} title="Remove User">
                            <Trash2 size={16}/>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, padding: '0.5rem' }}>Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Permissions / Approval Modal */}
      {isEditPermsModalOpen && userToEdit && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem'
        }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '800px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setIsEditPermsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <h2 className="heading-2" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               User Approval & Access
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Managing settings for <strong>{userToEdit.email}</strong></p>
            
            <form onSubmit={handleSavePermissions} style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              
              {/* Left Column: Basic Info & Status */}
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="input-group">
                  <label className="input-label">Account Status</label>
                  <select className="input-field" value={userToEdit.status || 'Pending'} onChange={(e) => setUserToEdit({...userToEdit, status: e.target.value})} style={{ background: userToEdit.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: userToEdit.status === 'Active' ? 'var(--success)' : 'var(--warning)', fontWeight: 'bold' }}>
                    <option value="Pending">Pending Approval</option>
                    <option value="Active">Active</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Job Role</label>
                  <select className="input-field" value={userToEdit.role} onChange={e => setUserToEdit({...userToEdit, role: e.target.value})}>
                    <option value="User">User (No Access)</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Site Engineer">Site Engineer</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input type="text" className="input-field" value={userToEdit.name} onChange={(e) => setUserToEdit({...userToEdit, name: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Security</label>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsAdminPasswordModalOpen(true)}>Force Password Reset</button>
                </div>
              </div>

              {/* Right Column: Permissions & Projects */}
              <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 className="heading-3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                    <Shield size={18} className="text-gradient" /> System Permissions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                      <label key={key} style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(255,255,255,0.05)', cursor: userToEdit.id === '1' && key === 'root' ? 'not-allowed' : 'pointer',
                        opacity: userToEdit.id === '1' && key === 'root' ? 0.5 : 1
                      }}>
                        <span style={{ fontWeight: 500, color: userToEdit.permissions[key] ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {label}
                        </span>
                        <input 
                          type="checkbox" 
                          checked={userToEdit.permissions[key]}
                          onChange={() => toggleEditPermission(key)}
                          disabled={userToEdit.id === '1' && key === 'root'}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {!userToEdit.permissions.root && (
                  <div>
                    <h3 className="heading-3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                      <Briefcase size={18} className="text-gradient" /> Project Assignments
                    </h3>
                    {allProjects.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active projects found.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {allProjects.map(p => (
                           <label key={p.id} style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                            padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)',
                            border: userProjects.includes(p.id) ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer'
                          }}>
                            <span style={{ fontWeight: 500, color: userProjects.includes(p.id) ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.875rem' }}>
                              {p.name}
                            </span>
                            <input 
                              type="checkbox" 
                              checked={userProjects.includes(p.id)}
                              onChange={() => toggleProject(p.id)}
                              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ width: '100%', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Force Password Reset Modal */}
      {isAdminPasswordModalOpen && userToEdit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setIsAdminPasswordModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 className="heading-2" style={{ marginBottom: '0.5rem' }}>Force Password Reset</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Resetting password for <strong>{userToEdit.email}</strong></p>
            
            {adminPasswordError && (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.5rem' }}>
                {adminPasswordError}
              </div>
            )}

            <form onSubmit={handleForcePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Your Admin Password (to verify)</label>
                <input type="password" className="input-field" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">New Password for User</label>
                <input type="password" className="input-field" required value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <input type="password" className="input-field" required value={confirmAdminPassword} onChange={e => setConfirmAdminPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-danger" style={{ marginTop: '1rem' }}>Force Reset</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
