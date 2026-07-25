import re

with open('C:\\Users\\Talha\\OneDrive\\Desktop\\Web App\\src\\pages\\AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. State Variables
state_vars = '''
  const [isEditPermsModalOpen, setIsEditPermsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  
  // Admin Password Modal State
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
'''
code = code.replace("  const [isEditPermsModalOpen, setIsEditPermsModalOpen] = useState(false);\n  const [userToEdit, setUserToEdit] = useState(null);", state_vars.strip())

# 2. handleSavePermissions (Remove password logic)
update_perms = '''
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
'''
code = re.sub(r'  const handleSavePermissions = async \(e\) => \{.*?    \} catch\(err\) \{\n      alert\("Error saving user: " \+ err\.message\);\n    \}\n  \};', update_perms.strip("\n"), code, flags=re.DOTALL)


# 3. Edit Permissions UI: Replace input with button
settings_ui = '''
                <div className="input-group">
                  <label className="input-label">Security</label>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsAdminPasswordModalOpen(true)}>Force Password Reset</button>
                </div>
'''
code = re.sub(r'                <div className="input-group">\n                  <label className="input-label">Reset Password</label>\n                  <input type="password" className="input-field" value=\{userToEdit\.password \|\| \'\'\} onChange=\{\(e\) => setUserToEdit\(\{\.\.\.userToEdit, password: e\.target\.value\}\)\} placeholder="Leave blank to keep unchanged" />\n                </div>', settings_ui.strip('\n'), code)


# 4. Add Password Modal to the end of component
modal_ui = '''
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
'''
code = code.replace("    </div>\n  );\n};", modal_ui.strip("\n"))

with open('C:\\Users\\Talha\\OneDrive\\Desktop\\Web App\\src\\pages\\AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated AdminDashboard successfully")
