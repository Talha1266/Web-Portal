const fs = require('fs');

let content = fs.readFileSync('src/pages/UserDashboard.jsx', 'utf8');

const target = `                      <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><AlertTriangle size={14}/> Payroll Outstanding</p>
                        <h2 className="heading-2" style={{ color: 'var(--warning)', fontSize: '1.5rem' }}>Rs {outstandingPayroll.toLocaleString()}</h2>
                      </div>
                      <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><Package size={14}/> Material Pending</p>
                        <h2 className="heading-2" style={{ color: 'var(--warning)', fontSize: '1.5rem' }}>Rs {outstandingMaterials.toLocaleString()}</h2>
                      </div>`;

const replacement = `                      <div className="glass-card" onClick={() => handleNav(() => setProjectTab('payroll'))} style={{ padding: '1.5rem', cursor: 'pointer', transition: 'var(--transition)', border: '1px solid rgba(255,255,255,0.05)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'} title="Go to Payroll">
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><AlertTriangle size={14}/> Payroll Outstanding</p>
                        <h2 className="heading-2" style={{ color: 'var(--warning)', fontSize: '1.5rem' }}>Rs {outstandingPayroll.toLocaleString()}</h2>
                      </div>
                      <div className="glass-card" onClick={() => handleNav(() => { setProjectTab('materials'); setActiveMaterialCategory('All'); })} style={{ padding: '1.5rem', cursor: 'pointer', transition: 'var(--transition)', border: '1px solid rgba(255,255,255,0.05)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'} title="Go to Materials">
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><Package size={14}/> Material Pending</p>
                        <h2 className="heading-2" style={{ color: 'var(--warning)', fontSize: '1.5rem' }}>Rs {outstandingMaterials.toLocaleString()}</h2>
                      </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/UserDashboard.jsx', content);
console.log("Patched UserDashboard.jsx summary cards!");
