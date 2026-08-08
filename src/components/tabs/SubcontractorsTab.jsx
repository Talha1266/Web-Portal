import React from 'react';
import { Briefcase, Calculator, Plus, Eye, ChevronRight, FileText, Trash2 } from 'lucide-react';

export default function SubcontractorsTab({
  allSubcontractors, activeProjectId, activeSubId, setActiveSubId,
  setIsSubcontractorModalOpen, handleDeleteSubcontractor, canModifyEntry,
  triggerSecurityChallenge, allSubcontractorLedger, handleSaveFinalValue,
  setIsSubLedgerModalOpen, setIsSubLedgerReceiptModalOpen, setSubLedgerReceiptObj, handleUpdateSubValue, setSubPayAmount, setSubPayMode, setIsSubPayModalOpen, setSubPayDate, setActiveSubPayId, handleDeleteSubPay, handleDeleteSub, setSubPayDesc, setIsSubModalOpen, allSubPayments
}) {
  return (
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
                              key={`final-val-${sub.id}`}
                              type="number" className="input-field" placeholder="Enter Final Value" 
                              defaultValue={sub.finalValue !== null ? sub.finalValue : ''} 
                              onBlur={(e) => {
                                const newVal = e.target.value === '' ? null : Number(e.target.value);
                                if (newVal !== sub.finalValue) handleUpdateSubValue(sub.id, e.target.value);
                              }}
                              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
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
  );
}
