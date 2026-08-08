import React from 'react';
import { Package, Settings, FileText, Trash2, Edit2 } from 'lucide-react';

export default function MaterialsTab({
  materialCategories, activeProjectId, allMaterials, activeMaterialCategory, 
  setIsCategoryModalOpen, setIsVendorBillModalOpen, setIsMaterialModalOpen, 
  setActiveMaterialCategory, materialViewMode, setMaterialViewMode, 
  triggerSecurityChallenge, handleDeleteMaterialCategory, canModifyEntry, 
  setArrivalMaterialObj, setArrivalQty, setIsArrivalModalOpen, 
  handleToggleMaterial, setPaymentMaterialObj, setPaymentDate, 
  setIsPaymentModalOpen, setEditMaterialObj, setIsEditMaterialModalOpen, 
  handleDeleteMaterial, todayStrGlobal, setArrivalReceipt, setIsImageViewerOpen, setArrivalDate, setViewImageUrl, openEditMaterialModal
}) {
  const projCategories = materialCategories.filter(c => c.projectId === activeProjectId);
              const projMaterials = allMaterials.filter(m => m.projectId === activeProjectId && (activeMaterialCategory === 'All' || m.category === activeMaterialCategory));
              
              const totalOrdered = projMaterials.reduce((acc, m) => acc + (m.totalCost || 0), 0);
              const totalArrivedValue = projMaterials.filter(m => m.isArrived).reduce((acc, m) => acc + (m.totalCost || 0), 0);
              const totalPaid = projMaterials.filter(m => m.isPaid).reduce((acc, m) => acc + (m.totalCost || 0), 0);
              const totalOutstanding = totalArrivedValue - totalPaid;

              return (
                <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', minHeight: '500px' }}>
                  <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <h3 className="heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={20} className="text-gradient"/> Material Procurement</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(true)}><Settings size={16}/> Manage Categories</button>
                      <button className="btn btn-secondary" onClick={() => setIsVendorBillModalOpen(true)}><FileText size={16}/> Vendor Bills</button>
                      <button className="btn btn-primary" onClick={() => setIsMaterialModalOpen(true)}>+ Log Material Order</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-strong)' }}>
                    <button className={`btn ${activeMaterialCategory === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMaterialCategory('All')} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)' }}>All Items</button>
                    {projCategories.map(cat => (
                      <button key={cat.id} className={`btn ${activeMaterialCategory === cat.name ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveMaterialCategory(cat.name)} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}>{cat.name}</button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <button className={`btn ${materialViewMode === 'active' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMaterialViewMode('active')} style={{ flex: 1, minWidth: '150px' }}>Active Orders</button>
                    <button className={`btn ${materialViewMode === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMaterialViewMode('history')} style={{ flex: 1, minWidth: '150px' }}>Payment History</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                     <div style={{ background: 'var(--glass-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Ordered</p>
                       <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Rs {totalOrdered.toFixed(2)}</p>
                     </div>
                     <div style={{ background: 'var(--glass-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Paid</p>
                       <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>Rs {totalPaid.toFixed(2)}</p>
                     </div>
                     <div style={{ background: 'var(--glass-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Outstanding Balance</p>
                       <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: totalOutstanding > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>Rs {totalOutstanding.toFixed(2)}</p>
                     </div>
                  </div>

                  {projMaterials.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--glass-overlay)', borderRadius: 'var(--radius-md)' }}>
                      <Package size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                      <p>No material orders found in this category.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <div className="table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Order Date</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Item Description</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Category</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>Vendor</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Karaya (Freight)</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'right' }}>Total Cost</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Receipt</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Arrived</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Paid</th>
                            <th style={{ padding: '1rem 0.5rem', fontWeight: 500, textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projMaterials.filter(m => materialViewMode === 'active' ? (!m.isPaid && !m.isUndelivered) : (m.isPaid || m.isUndelivered)).sort((a,b) => new Date(b.orderDate) - new Date(a.orderDate)).map(m => {
                            const canModify = canModifyEntry(m.createdAt);
                            
                            return (
                              <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: m.isUndelivered ? 'rgba(239, 68, 68, 0.05)' : m.isArrived ? 'var(--glass-overlay)' : 'transparent' }}>
                                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
                                    <span><strong>Order:</strong> {m.orderDate}</span>
                                    {m.isArrived && m.arrivalDate && <span><strong>Arrived:</strong> {m.arrivalDate.split('T')[0]}</span>}
                                    {m.isPaid && m.paidDate && <span><strong>Paid:</strong> {m.paidDate.split('T')[0]}</span>}
                                  </div>
                                </td>
                                <td style={{ padding: '1rem 0.5rem', fontWeight: 500, color: m.isUndelivered ? 'var(--text-muted)' : 'inherit', textDecoration: m.isUndelivered ? 'line-through' : 'none' }}>
                                  {m.itemName} {m.isUndelivered && <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', marginLeft: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', display: 'inline-block', verticalAlign: 'middle' }}>Undelivered</span>} <br/>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-block' }}>
                                    {m.isArrived && m.orderedQuantity && Number(m.quantity) !== Number(m.orderedQuantity)
                                      ? `${m.quantity} received (of ${m.orderedQuantity} ordered)`
                                      : `${m.quantity} units`} @ Rs {m.unitPrice}
                                  </span>
                                </td>
                                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{m.category}</td>
                                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{m.vendorName || '-'}</td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Rs {m.karaya || 0}</td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 500, color: 'var(--text-primary)' }}>Rs {m.totalCost.toFixed(2)}</td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                  {m.receiptImage ? (
                                    <button onClick={() => { setViewImageUrl(m.receiptImage); setIsImageViewerOpen(true); }} style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer' }} title="View Receipt">
                                      <FileText size={18} />
                                    </button>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                                  )}
                                </td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => {
                                  if (!m.isArrived) {
                                    triggerSecurityChallenge("Mark this material as delivered?", 'MODIFY', () => {
                                      setArrivalMaterialObj(m);
                                      setArrivalQty(m.quantity);
                                      setArrivalDate(todayStrGlobal);
                                      setArrivalReceipt(null);
                                      setIsArrivalModalOpen(true);
                                    });
                                  } else {
                                    triggerSecurityChallenge("Mark this material as NOT delivered?", 'MODIFY', () => handleToggleMaterial(m.id, 'isArrived', m.isArrived, m.createdAt));
                                  }
                                }}>
                                  <input type="checkbox" checked={m.isArrived} readOnly style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', pointerEvents: 'none' }}/>
                                </td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => {
                                  if (!m.isPaid) {
                                    triggerSecurityChallenge("Mark this material as paid?", 'MODIFY', () => {
                                      setPaymentMaterialObj(m);
                                      setPaymentDate(new Date().toISOString().split('T')[0]);
                                      setIsPaymentModalOpen(true);
                                    });
                                  } else {
                                    triggerSecurityChallenge("Mark this material as unpaid?", 'MODIFY', () => handleToggleMaterial(m.id, 'isPaid', m.isPaid, m.createdAt));
                                  }
                                }}>
                                  <input type="checkbox" checked={m.isPaid} readOnly style={{ width: '18px', height: '18px', accentColor: 'var(--success)', pointerEvents: 'none' }}/>
                                </td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    <button style={{ background: 'none', border: 'none', color: m.isUndelivered ? 'var(--danger)' : 'var(--text-secondary)', cursor: 'pointer', opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7} onClick={() => { triggerSecurityChallenge(m.isUndelivered ? "Unmark this material as undelivered?" : "Mark this material as permanently undelivered?", 'MODIFY', () => handleToggleMaterial(m.id, 'isUndelivered', m.isUndelivered || false, m.createdAt)); }} title={m.isUndelivered ? "Unmark Undelivered" : "Mark Undelivered Permanently"}>
                                      <XCircle size={16} />
                                    </button>
                                    <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7} onClick={(e) => { e.stopPropagation(); openEditMaterialModal(m); }} title="Modify Order">
                                      <Edit2 size={16} />
                                    </button>
                                    <button style={{ background: 'none', border: 'none', color: canModify ? 'var(--danger)' : 'var(--warning)', cursor: 'pointer', opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7} onClick={(e) => handleDeleteMaterial(e, m)} title={canModify ? "Delete Order" : "Request Delete"}>
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
</div>
                    </div>
                  )}
                </div>
              );
}
