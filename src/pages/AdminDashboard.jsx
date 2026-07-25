import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, LogOut, Settings, LayoutDashboard, Trash2, X, Shield, ShieldAlert, Crown, Menu } from 'lucide-react';
import { getUsers, removeUser, addUser, updateUserPermissions, DEFAULT_PERMISSIONS, updateUserProfile } from '../utils/db';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [isEditPermsModalOpen, setIsEditPermsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  
  // Admin Password Modal State
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  
  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Project Manager');
  const [newPermissions, setNewPermissions] = useState({ ...DEFAULT_PERMISSIONS });

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
    };
    fetchData();
  }, []);

  const handleNav = (action) => {
    setIsMobileMenuOpen(false);
    action();
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
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

  // --- Add User Handlers ---
  const toggleNewPermission = (key) => {
    setNewPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) return "Password must contain at least one special character.";
    return null;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      alert(pwdError);
      return;
    }
    await addUser({
      name: newName,
      email: newEmail,
      password: newPassword,
      role: newRole,
      permissions: newPermissions
    });
    setUsersList(await getUsers());
    setIsAddModalOpen(false);
    
    // Reset
    setNewName(''); setNewEmail(''); setNewPassword(''); setNewRole('Project Manager');
    setNewPermissions({ ...DEFAULT_PERMISSIONS });
  };

  // --- Edit Permissions Handlers ---
  const openEditPerms = (user) => {
    setUserToEdit(JSON.parse(JSON.stringify(user))); // Deep copy
    setIsEditPermsModalOpen(true);
  };

  const toggleEditPermission = (key) => {
    // If we are editing System Admin (id 1) and toggling root off, prevent it.
    if (userToEdit.id === '1' && key === 'root') return;

    setUserToEdit(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
    }));
  };

  const handleSavePermissions = async (e) => {
    e.preventDefault();
    try {
      await updateUserPermissions(userToEdit.id, userToEdit.permissions);
      await updateUserProfile(userToEdit.id, userToEdit.name, null);
      setUsersList(await getUsers());
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
    const pwdError = validatePassword(newAdminPassword);
    if (pwdError) {
      setAdminPasswordError(pwdError);
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
    root: "Root Power (Manage Users)",
    add_projects: "Create Projects",
    edit_projects: "Edit Projects",
    delete_projects: "Delete Projects",
    manage_documents: "Manage Documents",
    view_reports: "View Reports"
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
            <p style={{ color: 'var(--text-secondary)' }}>Add, remove, and manage platform users and their permissions.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <UserPlus size={20}/> Add New User
            </button>
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
                      color: user.status === 'Active' ? 'var(--success)' : 'var(--text-muted)'
                    }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditPerms(user)} className="btn btn-secondary" style={{ padding: '0.5rem', background: 'var(--bg-primary)' }} title="Edit Permissions">
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

      {/* ----------------- MODALS ----------------- */}

      {/* Add New User Modal */}
      {isAddModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 
        }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '800px', position: 'relative' }}>
            <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <form onSubmit={handleAddUser} className="mobile-stack" style={{ display: 'flex', width: '100%', gap: '2rem' }}>
              {/* Left Column: Basic Details */}
              <div style={{ flex: 1 }}>
                <h2 className="heading-2" style={{ marginBottom: '0.5rem' }}>Add New User</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Create account details.</p>
                
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input type="text" className="input-field" required value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input type="email" className="input-field" required value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Initial Password</label>
                  <input type="password" className="input-field" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Role Title</label>
                  <select className="input-field" value={newRole} onChange={e => setNewRole(e.target.value)}>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Site Engineer">Site Engineer</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Right Column: Permissions */}
              <div className="modal-right-col" style={{ flex: 1 }}>
                <h3 className="heading-3" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={20} className="text-gradient" /> Assign Permissions
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={newPermissions[key]}
                        onChange={() => toggleNewPermission(key)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                      />
                      <span style={{ color: newPermissions[key] ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '3rem' }}>
                  <UserPlus size={20}/> Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {isEditPermsModalOpen && userToEdit && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 
        }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', position: 'relative' }}>
            <button onClick={() => setIsEditPermsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <h2 className="heading-2" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               Edit User Profile
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Managing settings for <strong>{userToEdit.email}</strong></p>
            
            <form onSubmit={handleSavePermissions}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input type="text" className="input-field" value={userToEdit.name} onChange={(e) => setUserToEdit({...userToEdit, name: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Security</label>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsAdminPasswordModalOpen(true)}>Force Password Reset</button>
                </div>
                <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
                
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <label key={key} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255,255,255,0.05)', cursor: userToEdit.id === '1' && key === 'root' ? 'not-allowed' : 'pointer',
                    opacity: userToEdit.id === '1' && key === 'root' ? 0.5 : 1
                  }}>
                    <span style={{ fontWeight: 500, color: userToEdit.permissions[key] ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {label}
                    </span>
                    <input 
                      type="checkbox" 
                      checked={userToEdit.permissions[key]}
                      onChange={() => toggleEditPermission(key)}
                      disabled={userToEdit.id === '1' && key === 'root'}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                  </label>
                ))}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
                Save Permissions
              </button>
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
