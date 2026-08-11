import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Save, UserPlus, X } from 'lucide-react';
import { SystemType } from '../../App';
import { Pagination } from '../common/Pagination';

interface AttendanceRecord {
  id: string;
  name: string;
  role: 'Teacher' | 'Student';
  groupOrClass: string;
  systemType: string;
  status: 'Present' | 'Absent' | 'Leave';
}

interface AttendanceModuleProps {
  activeSystem: SystemType;
  activeSession: string;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({ activeSystem, activeSession }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [savedMsg, setSavedMsg] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form state for adding new attendance record
  const [name, setName] = useState('');
  const [groupOrClass, setGroupOrClass] = useState('');
  const [systemType, setSystemType] = useState<string>('Matriculation');

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams();
      if (activeSystem !== 'All') params.append('systemType', activeSystem);
      if (selectedDate) params.append('date', selectedDate);
      if (activeSession) params.append('session', activeSession);

      const url = `/api/attendance?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRecords(data.attendance);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
    setCurrentPage(1);
  }, [activeSystem, selectedDate, activeTab, activeSession]);

  const handleStatusChange = (id: string, newStatus: 'Present' | 'Absent' | 'Leave') => {
    setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      name,
      role: activeTab === 'student' ? 'Student' : 'Teacher',
      groupOrClass: groupOrClass || (activeTab === 'student' ? 'Class 1' : 'General Faculty'),
      systemType,
      status: 'Present'
    };

    setRecords([newRecord, ...records]);
    setName('');
    setGroupOrClass('');
    setShowModal(false);
  };

  const handleSaveAttendance = async () => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records, session: activeSession })
      });
      const data = await res.json();
      if (data.success) {
        setSavedMsg(`Attendance for ${activeTab === 'student' ? 'Students' : 'Teachers'} saved to backend for ${selectedDate}!`);
        setTimeout(() => setSavedMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error saving attendance:', err);
    }
  };

  const filtered = records.filter(r => {
    const roleMatch = activeTab === 'student' ? r.role === 'Student' : r.role === 'Teacher';
    const systemMatch = activeSystem === 'All' || r.systemType === activeSystem || r.systemType === 'All';
    return roleMatch && systemMatch;
  });

  const paginatedRecords = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const presentCount = filtered.filter(r => r.status === 'Present').length;
  const absentCount = filtered.filter(r => r.status === 'Absent').length;
  const leaveCount = filtered.filter(r => r.status === 'Leave').length;

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 24px 0' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', color: '#1E1B4B', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock color="#D4AF37" size={28} /> Teacher & Student Attendance
          </h2>
          <p style={{ color: 'var(--card-subtext)', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Attendance Filter: <span className="gold-badge">{activeSystem === 'All' ? 'Matriculation & O-Levels' : `${activeSystem} System`}</span>
            <span className="gold-badge" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#D4AF37', border: '1px solid #D4AF37' }}>
              Session: {activeSession}
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowModal(true)} style={{ background: '#FFFFFF', border: '1px solid #CBD5E0', color: 'var(--bg-purple-main)', fontWeight: 700, padding: '12px 18px', borderRadius: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} /> Add {activeTab === 'student' ? 'Student' : 'Teacher'} to Log
          </button>

          <button onClick={handleSaveAttendance} className="gold-button" style={{ padding: '12px 22px', fontSize: '0.9rem' }}>
            <Save size={18} /> Save Attendance Log
          </button>
        </div>
      </div>

      {savedMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10B981',
          color: '#065F46',
          padding: '12px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontWeight: 600
        }}>
          {savedMsg}
        </div>
      )}

      {/* Add Person Modal */}
      {showModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card animate-fade-in" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <Clock color="#D4AF37" size={22} /> ADD TO ATTENDANCE LOG ({activeTab.toUpperCase()})
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPerson} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="custom-input-group">
                  <label className="custom-input-label">Academic System</label>
                  <select
                    className="custom-input"
                    value={systemType}
                    onChange={(e) => setSystemType(e.target.value)}
                  >
                    <option value="Matriculation">Matriculation System</option>
                    <option value="O-Levels">O-Levels System</option>
                    <option value="All">All School General</option>
                  </select>
                </div>

                <div className="custom-input-group">
                  <label className="custom-input-label">{activeTab === 'student' ? 'Student Full Name *' : 'Teacher Name *'}</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder={activeTab === 'student' ? 'e.g. Bilal Ahmed' : 'e.g. Sir Tariq Mahmood'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="custom-input-group" style={{ marginBottom: 0 }}>
                  <label className="custom-input-label">{activeTab === 'student' ? 'Class Name' : 'Subject / Department'}</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder={activeTab === 'student' ? 'e.g. Class 9 / O-1' : 'e.g. Mathematics / Science'}
                    value={groupOrClass}
                    onChange={(e) => setGroupOrClass(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    border: '1px solid #CBD5E0', background: '#EDF2F7', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="gold-button" style={{ padding: '10px 22px' }}>
                  Add to Table
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}


      {/* Controls */}
      <div className="white-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('student')}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                border: activeTab === 'student' ? '2px solid var(--gold-primary)' : '1px solid #CBD5E0',
                background: activeTab === 'student' ? 'var(--bg-purple-main)' : '#F7FAFC',
                color: activeTab === 'student' ? '#FFD700' : '#4A5568',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
              }}
            >
              Student Attendance
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                border: activeTab === 'teacher' ? '2px solid var(--gold-primary)' : '1px solid #CBD5E0',
                background: activeTab === 'teacher' ? 'var(--bg-purple-main)' : '#F7FAFC',
                color: activeTab === 'teacher' ? '#FFD700' : '#4A5568',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
              }}
            >
              Teacher Attendance
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--card-subtext)' }}>Date:</label>
            <input
              type="date"
              className="custom-input"
              style={{ width: 'auto', padding: '8px 12px' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="white-card" style={{ padding: '16px', textAlign: 'center', borderTop: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700 }}>PRESENT</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981' }}>{presentCount}</div>
        </div>
        <div className="white-card" style={{ padding: '16px', textAlign: 'center', borderTop: '4px solid #EF4444' }}>
          <div style={{ fontSize: '0.8rem', color: '#B91C1C', fontWeight: 700 }}>ABSENT</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#EF4444' }}>{absentCount}</div>
        </div>
        <div className="white-card" style={{ padding: '16px', textAlign: 'center', borderTop: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 700 }}>LEAVE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F59E0B' }}>{leaveCount}</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="white-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-purple-main)', color: '#FFFFFF', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 20px' }}>Name</th>
              <th style={{ padding: '16px 20px' }}>System & Class</th>
              <th style={{ padding: '16px 20px', textAlign: 'center' }}>Mark Attendance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#A0AEC0' }}>
                  No {activeTab} attendance records logged for {selectedDate}. Click "+ Add {activeTab === 'student' ? 'Student' : 'Teacher'} to Log" above to mark attendance.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #EDF2F7', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--bg-purple-main)' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span className="gold-badge" style={{ background: 'rgba(59, 10, 69, 0.08)', color: 'var(--bg-purple-main)' }}>
                      {item.systemType} • {item.groupOrClass}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => handleStatusChange(item.id, 'Present')}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', border: 'none',
                          background: item.status === 'Present' ? '#10B981' : '#E2E8F0',
                          color: item.status === 'Present' ? '#FFFFFF' : '#4A5568',
                          fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                        }}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, 'Absent')}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', border: 'none',
                          background: item.status === 'Absent' ? '#EF4444' : '#E2E8F0',
                          color: item.status === 'Absent' ? '#FFFFFF' : '#4A5568',
                          fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                        }}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, 'Leave')}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', border: 'none',
                          background: item.status === 'Leave' ? '#F59E0B' : '#E2E2F0',
                          color: item.status === 'Leave' ? '#FFFFFF' : '#4A5568',
                          fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                        }}
                      >
                        Leave
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

    </div>
  );
};
