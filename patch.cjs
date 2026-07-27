const fs = require('fs');
let content = fs.readFileSync('src/pages/UserDashboard.jsx', 'utf8');

// 1. Import Unlock
content = content.replace(
  "import { HardHat, Users, FileText, CheckSquare, ClipboardList, Briefcase, Plus, Package, Truck, Calendar, ArrowLeft, MoreVertical, DollarSign, Settings, MessageSquare, CreditCard, Camera, Trash2, Shield, Search, Filter, Share2, Upload, Maximize2, Download, RefreshCw, LogOut, CheckCircle, Clock, AlertTriangle, Edit2, Key, Link2, X, UploadCloud, Folder, Menu, LayoutDashboard } from 'lucide-react';",
  "import { HardHat, Users, FileText, CheckSquare, ClipboardList, Briefcase, Plus, Package, Truck, Calendar, ArrowLeft, MoreVertical, DollarSign, Settings, MessageSquare, CreditCard, Camera, Trash2, Shield, Search, Filter, Share2, Upload, Maximize2, Download, RefreshCw, LogOut, CheckCircle, Clock, AlertTriangle, Edit2, Key, Link2, X, UploadCloud, Folder, Menu, LayoutDashboard, Unlock } from 'lucide-react';"
);

// 2. Add canModifyEntry
const adminStateTarget = "const [adminUnlockPast, setAdminUnlockPast] = useState(false);";
const adminStateReplace = `const [adminUnlockPast, setAdminUnlockPast] = useState(false);

  // Time Lock Utility: Returns true if the entry is from today or if admin has unlocked the past
  const canModifyEntry = (dateStr) => {
    if (currentUser?.permissions?.root && adminUnlockPast) return true;
    if (!dateStr) return true;
    const entryDate = new Date(dateStr);
    const today = new Date();
    entryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return entryDate.getTime() >= today.getTime();
  };

  const todayStrGlobal = new Date().toISOString().split('T')[0];`;
content = content.replace(adminStateTarget, adminStateReplace);

// 3. Reset state on handleNav
const navTarget = `  const handleNav = async (action) => {
    if (isAttendanceDirty) {
      if (!window.confirm("You have unsaved attendance changes. Are you sure you want to leave without saving?")) {
        return;
      }
      setIsAttendanceDirty(false);
    }
    await action();
  };`;
const navReplace = `  const handleNav = async (action) => {
    if (isAttendanceDirty) {
      if (!window.confirm("You have unsaved attendance changes. Are you sure you want to leave without saving?")) {
        return;
      }
      setIsAttendanceDirty(false);
    }
    setAdminUnlockPast(false);
    await action();
  };`;
content = content.replace(navTarget, navReplace);

// 4. Header Admin Toggle
const headerTarget = `<span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'var(--accent-glow)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-full)' }}>{activeProj.status}</span>`;
const headerReplace = `<div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'var(--accent-glow)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-full)' }}>{activeProj.status}</span>
                  {currentUser?.permissions?.root && (
                    <button 
                      onClick={() => setAdminUnlockPast(!adminUnlockPast)} 
                      style={{ background: adminUnlockPast ? 'var(--warning-glow)' : 'transparent', border: \`1px solid \${adminUnlockPast ? 'var(--warning)' : 'rgba(255,255,255,0.2)'}\`, color: adminUnlockPast ? 'var(--warning)' : 'var(--text-muted)', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s' }}
                      title="Allows editing of historical financial records and past dates"
                    >
                      {adminUnlockPast ? <Unlock size={12}/> : <Shield size={12}/>}
                      {adminUnlockPast ? 'Past Unlocked' : 'Unlock Past'}
                    </button>
                  )}
                </div>`;
content = content.replace(headerTarget, headerReplace);

// 5. Replace ONE_DAY Logic blocks
content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const logDate = new Date\(attendanceDate\);\s*const isOld = \(new Date\(\) - logDate\) > ONE_DAY;\s*const canModify = currentUser\.permissions\?\.root \|\| !isOld;/g, 'const canModify = canModifyEntry(attendanceDate);');

content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const isOld = \(new Date\(\) - new Date\(mostRecentDate\)\) > ONE_DAY;\s*const canModify = currentUser\.permissions\?\.root \|\| !isOld;/g, 'const canModify = canModifyEntry(mostRecentDate);');

content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const payment = allSubPayments\.find\(p => p\.id === activeSubPayId\);\s*const isOld = payment \? \(new Date\(\) - new Date\(payment\.createdAt\) > ONE_DAY\) : false;\s*const canModify = currentUser\.permissions\?\.root \|\| !isOld;/g, 'const payment = allSubPayments.find(p => p.id === activeSubPayId);\n      const canModify = payment ? canModifyEntry(payment.createdAt) : true;');

content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const isOld = new Date\(\) - new Date\(payment\.createdAt\) > ONE_DAY;\s*const canModify = currentUser\.permissions\?\.root \|\| !isOld;/g, 'const canModify = canModifyEntry(payment.createdAt);');

content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const isOld = new Date\(\) - new Date\(createdAt\) > ONE_DAY;\s*const canModify = currentUser\.permissions\?\.root \|\| !isOld;/g, 'const canModify = canModifyEntry(createdAt);');

content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const isOld = new Date\(\) - new Date\(material\.createdAt\) > ONE_DAY;\s*const canModify = currentUser\.permissions\?\.root \|\| !isOld;/g, 'const canModify = canModifyEntry(material.createdAt);');

content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const isOld = new Date\(\) - new Date\(adv\.createdAt\) > ONE_DAY;\s*const canModify = currentUser\.permissions\?\.root \|\| !isOld;/g, 'const canModify = canModifyEntry(adv.createdAt);');

content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const isOld = new Date\(\) - new Date\(exp\.createdAt\) > ONE_DAY;\s*const canModify = currentUser\.permissions\?\.root \|\| !isOld;/g, 'const canModify = canModifyEntry(exp.createdAt);');

// 6. Replace UI Blocks
content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const logDate = new Date\(attendanceDate\);\s*const isOld = \(new Date\(\) - logDate\) > ONE_DAY;\s*const canModify = !isOld \|\| \(perms\.root && adminUnlockPast\);/g, 'const canModify = canModifyEntry(attendanceDate);');

content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const isOld = new Date\(\) - new Date\(p\.createdAt\) > ONE_DAY;\s*const canModify = perms\.root \|\| !isOld;/g, 'const canModify = canModifyEntry(p.createdAt);');

content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const isOld = new Date\(\) - new Date\(m\.createdAt\) > ONE_DAY;\s*const canModify = perms\.root \|\| !isOld;/g, 'const canModify = canModifyEntry(m.createdAt);');

content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const canModify = perms\.root \|\| \(new Date\(\) - new Date\(adv\.createdAt\) <= ONE_DAY\);/g, 'const canModify = canModifyEntry(adv.createdAt);');

content = content.replace(/const ONE_DAY = 24 \* 60 \* 60 \* 1000;\s*const canModify = perms\.root \|\| \(new Date\(\) - new Date\(exp\.createdAt\) <= ONE_DAY\);/g, 'const canModify = canModifyEntry(exp.createdAt);');

// 7. Update Inputs min
content = content.replace('<input type="date" className="input-field" required value={subPayDate} onChange={e => setSubPayDate(e.target.value)} style={{ colorScheme: \'dark\' }} />', '<input type="date" className="input-field" required value={subPayDate} onChange={e => setSubPayDate(e.target.value)} style={{ colorScheme: \'dark\' }} min={!adminUnlockPast ? todayStrGlobal : undefined} />');

content = content.replace('<input type="date" className="input-field" required value={mOrderDate} onChange={e => setMOrderDate(e.target.value)} style={{ colorScheme: \'dark\' }} />', '<input type="date" className="input-field" required value={mOrderDate} onChange={e => setMOrderDate(e.target.value)} style={{ colorScheme: \'dark\' }} min={!adminUnlockPast ? todayStrGlobal : undefined} />');

content = content.replace('<input type="date" className="input-field" required value={advDate} onChange={e => setAdvDate(e.target.value)} style={{ colorScheme: \'dark\' }} />', '<input type="date" className="input-field" required value={advDate} onChange={e => setAdvDate(e.target.value)} style={{ colorScheme: \'dark\' }} min={!adminUnlockPast ? todayStrGlobal : undefined} />');

content = content.replace('<input type="date" className="input-field" required value={expDate} onChange={e => setExpDate(e.target.value)} style={{ colorScheme: \'dark\' }} />', '<input type="date" className="input-field" required value={expDate} onChange={e => setExpDate(e.target.value)} style={{ colorScheme: \'dark\' }} min={!adminUnlockPast ? todayStrGlobal : undefined} />');

fs.writeFileSync('src/pages/UserDashboard.jsx', content);
console.log("Patched successfully!");
