import re

with open('C:\\Users\\Talha\\OneDrive\\Desktop\\Web App\\src\\pages\\UserDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. State Variables
state_vars = '''
  const [profileName, setProfileName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
'''
code = re.sub(r'  const \[profileName, setProfileName\] = useState\(\'\'\);\n  const \[profilePassword, setProfilePassword\] = useState\(\'\'\);\n  const \[isUpdatingProfile, setIsUpdatingProfile\] = useState\(false\);\n  const \[profileMessage, setProfileMessage\] = useState\(\'\'\);', state_vars.strip(), code)


# 2. handleUpdateProfile (Remove profilePassword logic)
update_profile = '''
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
'''

# Find the old handleUpdateProfile up to the closing brace
code = re.sub(r'  const handleUpdateProfile = async \(e\) => \{.*?\setIsUpdatingProfile\(false\);\n  \};', update_profile.strip("\n"), code, flags=re.DOTALL)


# 3. Settings UI: Replace input with button
settings_ui = '''
                <div className="input-group">
                  <label className="input-label">Security</label>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsPasswordModalOpen(true)}>Change Password</button>
                </div>
'''
code = re.sub(r'                <div className="input-group">\n                  <label className="input-label">New Password \(leave blank to keep current\)</label>\n                  <input type="password" className="input-field" value=\{profilePassword\} onChange=\{\(e\) => setProfilePassword\(e\.target\.value\)\} placeholder="Enter new password\.\.\." />\n                </div>', settings_ui.strip('\n'), code)


# 4. Add Password Modal to the end of <main>
modal_ui = '''
      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', position: 'relative' }}>
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
'''
code = code.replace("      </main>", modal_ui.strip("\n"))

with open('C:\\Users\\Talha\\OneDrive\\Desktop\\Web App\\src\\pages\\UserDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated UserDashboard successfully")
