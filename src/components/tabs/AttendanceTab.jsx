import React from 'react';
import { ClipboardList, Users, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AttendanceTab({
  attendanceDate, setAttendanceDate, allAttendance, activeProjectId, 
  allWorkers, handleToggleAttendance, triggerSecurityChallenge, 
  handleDeleteAttendance, setIsWorkerModalOpen, handleOpenEditWorker, attendanceForm, handleAttendanceChange, handleNav, handleSaveAttendance, canModifyEntry, perms, setAdminUnlockPast
}) {
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
                     {canModify ? (
                       <button className="btn btn-primary" onClick={handleSaveAttendance}>Save Attendance</button>
                     ) : (
                       <button className="btn btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }} onClick={() => alert("This entry is locked due to the 24-hour rule. Please ask your administrator to unlock the past to amend this entry.")}>Save Attendance (Locked)</button>
                     )}
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
            )
}
