const fs = require('fs');

let content = fs.readFileSync('src/pages/UserDashboard.jsx', 'utf8');

const startStr = "                   return (\n                     <div style={{ overflowX: 'auto' }}>\n                       <div className=\"table-wrapper\">";
const endStr = "                     </div>\n                   );\n                })()}\n              </div>\n            )}";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find start or end index.");
    console.log("Start: ", startIndex);
    console.log("End: ", endIndex);
    process.exit(1);
}

const target = content.substring(startIndex, endIndex + "                     </div>\n                   );".length);

const replacement = `                   return (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       
                       {/* DESKTOP TABLE VIEW */}
                       <div className="desktop-only" style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-md)' }}>
                         <div className="table-wrapper">
                           <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                             <thead>
                               <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                                 <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Name</th>
                                 <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Dates Covered</th>
                                 <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Trade</th>
                                 <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Total Hrs</th>
                                 <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Gross Pay</th>
                                 <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Advances</th>
                                 <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>{payrollViewMode === 'outstanding' ? 'Net Owed' : 'Net Paid'}</th>
                                 <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center', width: '100px' }}>Action</th>
                               </tr>
                             </thead>
                             <tbody>
                               {Object.keys(payrollData).map(wId => {
                                 const data = payrollData[wId];
                                 const worker = allWorkers.find(w => w.id === wId);
                                 if (!worker) return null;
                                 
                                 const totalHours = data.regHours + data.otHours;
                                 const gross = data.grossPay;
                                 const owed = gross - data.advance;
                                 grandTotal += owed;
                                 const sortedDates = Array.from(data.dates).sort();

                                 return (
                                   <tr key={wId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                     <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>
                                       {worker ? worker.name : 'Unknown Worker'}
                                       <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{worker ? worker.phone : ''}</div>
                                     </td>
                                     <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                                       <div style={{ fontSize: '0.85rem' }}>{Array.from(data.dates).map(d => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })).join(', ')}</div>
                                     </td>
                                     <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{worker.trade}</td>
                                     <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                       <span style={{ fontWeight: 500 }}>{totalHours}</span> <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({data.regHours}R + {data.otHours}OT)</span>
                                     </td>
                                     <td style={{ padding: '1rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                                       Rs {gross.toFixed(2)}
                                     </td>
                                     <td style={{ padding: '1rem 0.5rem', textAlign: 'right', color: 'var(--danger)' }}>
                                       Rs {data.advance.toFixed(2)}
                                     </td>
                                     <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 'bold', color: owed >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                                       Rs {owed.toFixed(2)}
                                     </td>
                                     {payrollViewMode === 'outstanding' ? (
                                       <td style={{ padding: '1rem 0.5rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                         <button className={\`btn \${owed > 0 ? 'btn-primary' : 'btn-secondary'}\`} onClick={() => handleOpenSettleModal(wId)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} title={owed > 0 ? "Mark as Paid" : "Clear Account"}>
                                           <CheckCircle size={14} /> {owed > 0 ? 'Settle' : 'Clear'}
                                         </button>
                                         <button className="btn btn-secondary" onClick={() => handleOpenWorkerAdvanceModal(wId)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }} title="Issue Cash Advance">
                                           <CreditCard size={14} /> Advance
                                         </button>
                                         {perms.root && (
                                           <button className="btn btn-danger" onClick={() => handleDeletePayrollRecord(wId)} style={{ padding: '0.4rem', fontSize: '0.75rem' }} title="Delete Records">
                                             <Trash2 size={14} />
                                           </button>
                                         )}
                                       </td>
                                     ) : (
                                       <td style={{ padding: '1rem 0.5rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                                         <button className="btn btn-danger" onClick={() => handleRevertPaid(wId, sortedDates)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }} title="Revert to Unpaid">
                                           <Edit2 size={14} /> Revert
                                         </button>
                                         {perms.root && (
                                           <button className="btn btn-danger" onClick={() => handleDeletePayrollRecord(wId)} style={{ padding: '0.4rem', fontSize: '0.75rem' }} title="Delete Records">
                                             <Trash2 size={14} />
                                           </button>
                                         )}
                                       </td>
                                     )}
                                   </tr>
                                 )
                               })}
                             </tbody>
                             <tfoot>
                               <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                                 <td colSpan="6" style={{ padding: '1.5rem 1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Grand Total ({payrollViewMode === 'outstanding' ? 'Owed' : 'Paid'}):</td>
                                 <td style={{ padding: '1.5rem 0.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--accent-primary)' }}>Rs {grandTotal.toFixed(2)}</td>
                                 {payrollViewMode === 'outstanding' && (
                                   <td style={{ padding: '1.5rem 0.5rem', textAlign: 'center' }}>
                                     {grandTotal > 0 && (
                                       <button className="btn btn-primary" onClick={handleMarkAllPaid} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'var(--success)', borderColor: 'var(--success)' }}>
                                         Settle All
                                       </button>
                                     )}
                                   </td>
                                 )}
                               </tr>
                             </tfoot>
                           </table>
                         </div>
                       </div>
                       
                       {/* MOBILE CARD VIEW */}
                       <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                         {Object.keys(payrollData).map(wId => {
                           const data = payrollData[wId];
                           const worker = allWorkers.find(w => w.id === wId);
                           if (!worker) return null;
                           
                           const totalHours = data.regHours + data.otHours;
                           const gross = data.grossPay;
                           const owed = gross - data.advance;
                           const sortedDates = Array.from(data.dates).sort();

                           return (
                             <div key={\`mobile-\${wId}\`} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                 <div>
                                   <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>{worker.name}</h4>
                                   <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '1rem', display: 'inline-block', marginTop: '0.5rem' }}>{worker.trade}</span>
                                 </div>
                                 <div style={{ textAlign: 'right' }}>
                                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net {payrollViewMode === 'outstanding' ? 'Owed' : 'Paid'}</div>
                                   <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: owed >= 0 ? 'var(--accent-primary)' : 'var(--danger)' }}>Rs {owed.toFixed(2)}</div>
                                 </div>
                               </div>
                               
                               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                                 <div>
                                   <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Total Hrs</div>
                                   <div style={{ fontWeight: 500 }}>{totalHours} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({data.regHours}R + {data.otHours}OT)</span></div>
                                 </div>
                                 <div>
                                   <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Gross Pay</div>
                                   <div style={{ fontWeight: 500 }}>Rs {gross.toFixed(2)}</div>
                                 </div>
                                 <div>
                                   <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Advances</div>
                                   <div style={{ fontWeight: 500, color: 'var(--danger)' }}>Rs {data.advance.toFixed(2)}</div>
                                 </div>
                                 <div>
                                   <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Dates Covered</div>
                                   <div style={{ fontWeight: 500, fontSize: '0.75rem' }}>{Array.from(data.dates).length} days</div>
                                 </div>
                               </div>
                               
                               <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                 {payrollViewMode === 'outstanding' ? (
                                   <>
                                     <button className={\`btn \${owed > 0 ? 'btn-primary' : 'btn-secondary'}\`} onClick={() => handleOpenSettleModal(wId)} style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', justifyContent: 'center' }}>
                                       <CheckCircle size={16} /> {owed > 0 ? 'Settle' : 'Clear'}
                                     </button>
                                     <button className="btn btn-secondary" onClick={() => handleOpenWorkerAdvanceModal(wId)} style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', justifyContent: 'center' }}>
                                       <CreditCard size={16} /> Advance
                                     </button>
                                     {perms.root && (
                                       <button className="btn btn-danger" onClick={() => handleDeletePayrollRecord(wId)} style={{ padding: '0.6rem', display: 'flex', justifyContent: 'center' }}>
                                         <Trash2 size={16} />
                                       </button>
                                     )}
                                   </>
                                 ) : (
                                   <>
                                     <button className="btn btn-danger" onClick={() => handleRevertPaid(wId, sortedDates)} style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', justifyContent: 'center' }}>
                                       <Edit2 size={16} /> Revert to Unpaid
                                     </button>
                                     {perms.root && (
                                       <button className="btn btn-danger" onClick={() => handleDeletePayrollRecord(wId)} style={{ padding: '0.6rem', display: 'flex', justifyContent: 'center' }}>
                                         <Trash2 size={16} />
                                       </button>
                                     )}
                                   </>
                                 )}
                               </div>
                             </div>
                           );
                         })}
                         
                         {/* Mobile Grand Total Card */}
                         <div style={{ background: 'linear-gradient(135deg, rgba(37,41,54,0.9), rgba(0,0,0,0.8))', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                           <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Grand Total ({payrollViewMode === 'outstanding' ? 'Owed' : 'Paid'})</div>
                           <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Rs {grandTotal.toFixed(2)}</div>
                           {payrollViewMode === 'outstanding' && grandTotal > 0 && (
                             <button className="btn btn-primary" onClick={handleMarkAllPaid} style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', background: 'var(--success)', borderColor: 'var(--success)', justifyContent: 'center', marginTop: '0.5rem' }}>
                               Settle All Accounts
                             </button>
                           )}
                         </div>
                       </div>
                     </div>
                   );`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/UserDashboard.jsx', content);
console.log("Successfully replaced table rendering with dual layout.");
