const fs = require('fs');

let content = fs.readFileSync('src/pages/UserDashboard.jsx', 'utf8');

// 1. Remove isMobileLayout hook (lines 14-19 approx)
content = content.replace(/const \[isMobileLayout, setIsMobileLayout\][\s\S]*?\}, \[\]\);\n\n/, '');

// 2. We need to revert the payrollData rendering block.
// The easiest way is to replace the whole block starting from `return (\n <div style={{ display: 'flex'` 
// up to the end of the mobile cards logic and just insert the table.

const replacement = `                   let grandTotal = 0;

                   return (
                     <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-md)' }}>
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
                   );`;

// We find the block starting with "let grandTotal = 0;" inside the payrollData map.
// Actually, earlier the file had:
// const sortedDates = Array.from(data.dates).sort();
// grandTotal += owed;
// We can just use the index array method.

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes("let grandTotal = 0;"));
const endIdx = lines.findIndex((l, idx) => idx > startIdx && l.includes(");") && lines[idx+1].includes("})()}"));

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find block", startIdx, endIdx);
    process.exit(1);
}

lines.splice(startIdx, endIdx - startIdx + 1, replacement);

fs.writeFileSync('src/pages/UserDashboard.jsx', lines.join('\n'));
console.log("Successfully reverted JSX");

// Now revert CSS
let cssContent = fs.readFileSync('src/index.css', 'utf8');

// Remove everything from /* MOBILE TABLE FIT FIXES (Appended by Patch)*/ to the end of the file.
const cssLines = cssContent.split('\n');
const cssStartIdx = cssLines.findIndex(l => l.includes("/* MOBILE TABLE FIT FIXES (Appended by Patch)*/"));
if (cssStartIdx !== -1) {
    cssLines.splice(cssStartIdx - 1, cssLines.length - cssStartIdx + 1);
    fs.writeFileSync('src/index.css', cssLines.join('\n'));
    console.log("Successfully reverted CSS");
} else {
    console.log("CSS block not found");
}

