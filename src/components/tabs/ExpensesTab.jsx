import React from 'react';
import { CreditCard, Filter, CheckCircle, Clock, Trash2 } from 'lucide-react';

export default function ExpensesTab({
  allExpenses, activeProjectId, expenseViewMode, setExpenseViewMode,
  setIsExpenseModalOpen, triggerSecurityChallenge, handleDeleteExpense,
  canModifyEntry, handleToggleExpenseStatus, handleEditExpense,
  setExpenseReceiptObj, setIsExpenseReceiptModalOpen, allSiteAdvances, handleDeleteAdvance, allSiteExpenses, setIsImageViewerOpen, setViewImageUrl, setIsAdvanceModalOpen
}) {
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
}
