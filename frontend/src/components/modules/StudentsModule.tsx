import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, Trash2, Search, GraduationCap, Phone, CheckCircle, FileSpreadsheet, Download, HelpCircle, Upload, X } from 'lucide-react';
import { SystemType } from '../../App';
import { Pagination } from '../common/Pagination';

interface Student {
  id: string;
  name: string;
  className: string;
  systemType: string;
  fatherName: string;
  phone: string;
  monthlyFee: number;
  joinedDate: string;
}

interface StudentsModuleProps {
  activeSystem: SystemType;
  activeSession: string;
}

export const StudentsModule: React.FC<StudentsModuleProps> = ({ activeSystem, activeSession }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Single Add Form State
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [className, setClassName] = useState('Nursery');
  const [systemType, setSystemType] = useState<string>('Matriculation');
  const [phone, setPhone] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('2500');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');


  // Bulk Excel state
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Fetch Students from Backend REST API
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const url = activeSystem !== 'All' 
        ? `/api/students?systemType=${encodeURIComponent(activeSystem)}&session=${encodeURIComponent(activeSession)}`
        : `/api/students?session=${encodeURIComponent(activeSession)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    setCurrentPage(1);
  }, [activeSystem, activeSession]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fatherName.trim()) {
      setFormError('Please enter Student Full Name and Father Name.');
      return;
    }
    setFormError('');

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          fatherName: fatherName.trim(),
          className,
          systemType,
          phone,
          monthlyFee: parseFloat(monthlyFee) || 2500,
          session: activeSession
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`Directly added student "${data.student.name}" to ${data.student.systemType} system!`);
        setName('');
        setFatherName('');
        setPhone('');
        setShowAddModal(false);
        fetchStudents();
      } else {
        setFormError(data.error || 'Failed to add student');
      }
    } catch (err) {
      console.error('Error adding student:', err);
      setFormError('Connection error while adding student.');
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length < 2) return;

      const parsed: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 2 && cols[0]) {
          parsed.push({
            name: cols[0],
            fatherName: cols[1] || 'N/A',
            className: cols[2] || (activeSystem === 'O-Levels' ? 'O-1 (Grade 9)' : 'Class 1'),
            systemType: cols[3] || (activeSystem === 'O-Levels' ? 'O-Levels' : 'Matriculation'),
            phone: cols[4] || '0332 0000000',
            monthlyFee: parseFloat(cols[5]) || 2500
          });
        }
      }
      setCsvPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleImportExcel = async () => {
    if (csvPreview.length === 0) return;

    try {
      const res = await fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: csvPreview, session: activeSession })
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`Successfully imported ${data.count} students via Excel/CSV!`);
        setCsvPreview([]);
        setCsvFile(null);
        setShowExcelModal(false);
        fetchStudents();
      }
    } catch (err) {
      console.error('Error importing Excel:', err);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Student Name,Father Name,Class Level,System,Contact Phone,Monthly Fee\n" +
      "Ali Ahmed,Ahmed Raza,Class 5,Matriculation,0332 1234567,2500\n" +
      "Zainab Faisal,Faisal Sheikh,O-1 (Grade 9),O-Levels,0300 9988776,5500\n" +
      "Bilal Hassan,Hassan Mahmood,Class 8,Matriculation,0321 4455667,2800";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Essani_Academy_Students_Sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteStudent = async (id: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to remove student "${studentName}"?`)) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage(`Removed student: ${studentName}`);
        fetchStudents();
      }
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Slice
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 24px 0' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', color: '#1E1B4B', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap color="#D4AF37" size={28} /> Student Management
          </h2>
          <p style={{ color: 'var(--card-subtext)', fontSize: '0.9rem', marginTop: '4px' }}>
            Showing records for: <span className="gold-badge">{activeSystem === 'All' ? 'Matriculation & O-Levels' : `${activeSystem} System`}</span>
            <span className="gold-badge" style={{ marginLeft: '8px', background: 'rgba(255, 215, 0, 0.1)', color: '#D4AF37' }}>Session {activeSession}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Excel Tooltip & Import Button */}
          <div className="tooltip-container">
            <button 
              onClick={() => setShowExcelModal(true)}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #10B981',
                color: '#047857',
                fontWeight: 700,
                padding: '11px 18px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}
            >
              <FileSpreadsheet size={18} color="#10B981" /> Import via Excel / CSV
            </button>
            <div className="tooltip-box">
              <strong style={{ color: '#FFD700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={14} /> Bulk Excel Import
              </strong>
              Upload any `.csv` or `.xlsx` spreadsheet with student names, father names, classes & fees to add hundreds of students at once.
            </div>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="gold-button"
            style={{ padding: '11px 20px', fontSize: '0.9rem' }}
          >
            <UserPlus size={18} /> + Direct Add Student
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10B981',
          color: '#065F46',
          padding: '12px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600
        }}>
          <CheckCircle size={20} color="#10B981" /> {message}
        </div>
      )}

      {/* Search Bar & Summary Stats */}
      <div className="white-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search size={18} color="#A0AEC0" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="custom-input"
              style={{ paddingLeft: '42px', padding: '10px 14px 10px 42px' }}
              placeholder="Search student name, father name, or class..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--bg-purple-main)' }}>
            <div>Total Active Students ({activeSystem}): <span style={{ color: '#D4AF37', fontWeight: 800 }}>{filteredStudents.length}</span></div>
          </div>
        </div>
      </div>

      {/* Excel / CSV Import Modal */}
      {showExcelModal && createPortal(
        <div className="modal-overlay" onClick={() => { setShowExcelModal(false); setCsvPreview([]); setCsvFile(null); }}>
          <div className="modal-card animate-fade-in" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <FileSpreadsheet color="#10B981" size={24} /> IMPORT STUDENTS VIA EXCEL / CSV
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => { setShowExcelModal(false); setCsvPreview([]); setCsvFile(null); }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--card-subtext)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.5 }}>
                Upload your school's Excel spreadsheet or CSV file to bulk import student records.
              </p>

              <div style={{
                border: '2px dashed #CBD5E0',
                borderRadius: '14px',
                padding: '24px',
                textAlign: 'center',
                background: '#F8FAFC',
                marginBottom: '20px'
              }}>
                <Upload size={36} color="#D4AF37" style={{ marginBottom: '10px' }} />
                <div style={{ fontWeight: 700, color: 'var(--bg-purple-main)', fontSize: '0.95rem' }}>
                  {csvFile ? csvFile.name : 'Select CSV / Excel Spreadsheet File'}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#718096', marginTop: '4px' }}>
                  Supported format: .csv (Comma-separated values)
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="gold-button"
                  style={{ marginTop: '14px', padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  Browse File
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  style={{
                    background: 'none', border: 'none', color: '#D4AF37',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Download size={16} /> Download Sample Excel Template
                </button>

                {csvPreview.length > 0 && (
                  <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 700 }}>
                    ✓ {csvPreview.length} Records Detected
                  </span>
                )}
              </div>

              {/* CSV Preview Table */}
              {csvPreview.length > 0 && (
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-purple-main)', color: '#FFF' }}>
                        <th style={{ padding: '8px 12px' }}>Name</th>
                        <th style={{ padding: '8px 12px' }}>Father Name</th>
                        <th style={{ padding: '8px 12px' }}>Class</th>
                        <th style={{ padding: '8px 12px' }}>Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 5).map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #EDF2F7' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{row.name}</td>
                          <td style={{ padding: '8px 12px' }}>{row.fatherName}</td>
                          <td style={{ padding: '8px 12px' }}>{row.className}</td>
                          <td style={{ padding: '8px 12px', color: '#10B981', fontWeight: 700 }}>Rs. {row.monthlyFee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => { setShowExcelModal(false); setCsvPreview([]); setCsvFile(null); }}
                style={{
                  padding: '10px 20px', borderRadius: '10px',
                  border: '1px solid #CBD5E0', background: '#EDF2F7', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportExcel}
                disabled={csvPreview.length === 0}
                className="gold-button"
                style={{ opacity: csvPreview.length === 0 ? 0.5 : 1, padding: '10px 22px' }}
              >
                Confirm Bulk Import ({csvPreview.length})
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}


      {/* Direct Add Student Modal */}
      {showAddModal && createPortal(
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setFormError(''); }}>
          <div className="modal-card animate-fade-in" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <div className="modal-header-title">
                <UserPlus color="#D4AF37" size={24} /> DIRECT ADD STUDENT
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => { setShowAddModal(false); setFormError(''); }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #EF4444',
                    color: '#B91C1C',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}>
                    ⚠️ {formError}
                  </div>
                )}

                <div className="custom-input-group">
                  <label className="custom-input-label">Academic System *</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => { setSystemType('Matriculation'); setClassName('Class 1'); }}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '10px',
                        border: systemType === 'Matriculation' ? 'none' : '1px solid #CBD5E0',
                        background: systemType === 'Matriculation' ? 'var(--gold-gradient)' : '#F1F5F9',
                        color: systemType === 'Matriculation' ? '#23022B' : '#475569',
                        fontWeight: 700, cursor: 'pointer',
                        boxShadow: systemType === 'Matriculation' ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none',
                        transition: 'all 0.2s', fontSize: '0.88rem'
                      }}
                    >
                      Matriculation System
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSystemType('O-Levels'); setClassName('O-1 (Grade 9)'); }}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '10px',
                        border: systemType === 'O-Levels' ? 'none' : '1px solid #CBD5E0',
                        background: systemType === 'O-Levels' ? 'var(--gold-gradient)' : '#F1F5F9',
                        color: systemType === 'O-Levels' ? '#23022B' : '#475569',
                        fontWeight: 700, cursor: 'pointer',
                        boxShadow: systemType === 'O-Levels' ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none',
                        transition: 'all 0.2s', fontSize: '0.88rem'
                      }}
                    >
                      O-Levels System
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="custom-input-group">
                    <label className="custom-input-label">Student Full Name *</label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="e.g. Ali Ahmed"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="custom-input-group">
                    <label className="custom-input-label">Father Name *</label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="e.g. Ahmed Raza"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="custom-input-group">
                    <label className="custom-input-label">Class Level</label>
                    <select
                      className="custom-input"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                    >
                      {systemType === 'Matriculation' ? (
                        <>
                          <option value="Nursery">Nursery</option>
                          <option value="KG / Prep">KG / Prep</option>
                          <option value="Class 1">Class 1</option>
                          <option value="Class 2">Class 2</option>
                          <option value="Class 3">Class 3</option>
                          <option value="Class 4">Class 4</option>
                          <option value="Class 5">Class 5</option>
                          <option value="Class 6">Class 6</option>
                          <option value="Class 7">Class 7</option>
                          <option value="Class 8">Class 8</option>
                          <option value="Class 9">Class 9</option>
                          <option value="Matric (Class 10)">Matric (Class 10)</option>
                        </>
                      ) : (
                        <>
                          <option value="Junior O-Levels (Grade 6)">Junior O-Levels (Grade 6)</option>
                          <option value="Pre O-Levels (Grade 7/8)">Pre O-Levels (Grade 7/8)</option>
                          <option value="O-1 (Grade 9)">O-1 (Grade 9)</option>
                          <option value="O-2 (Grade 10)">O-2 (Grade 10)</option>
                          <option value="O-3 (Grade 11)">O-3 (Grade 11)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="custom-input-group">
                    <label className="custom-input-label">Monthly Fee (PKR)</label>
                    <input
                      type="number"
                      className="custom-input"
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(e.target.value)}
                    />
                  </div>
                </div>

                <div className="custom-input-group" style={{ marginBottom: 0 }}>
                  <label className="custom-input-label">Contact Phone / WhatsApp</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. 0332 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setFormError(''); }}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    border: '1px solid #CBD5E0', background: '#EDF2F7', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="gold-button" style={{ padding: '10px 24px' }}>
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}


      {/* Student List Table & Pagination */}
      <div className="white-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-purple-main)', color: '#FFFFFF', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 20px' }}>Student Name</th>
              <th style={{ padding: '16px 20px' }}>Father Name</th>
              <th style={{ padding: '16px 20px' }}>System & Class</th>
              <th style={{ padding: '16px 20px' }}>Contact Phone</th>
              <th style={{ padding: '16px 20px' }}>Monthly Fee</th>
              <th style={{ padding: '16px 20px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#A0AEC0' }}>
                  Loading students from backend database...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#A0AEC0' }}>
                  No students found for system "{activeSystem}". Click "+ Direct Add Student" or "Import via Excel / CSV" above to add students.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #EDF2F7', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--bg-purple-main)' }}>
                    {s.name}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#4A5568' }}>{s.fatherName}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="gold-badge" style={{ background: s.systemType === 'O-Levels' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(59, 10, 69, 0.08)', color: 'var(--bg-purple-main)' }}>
                        {s.systemType}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#718096' }}>{s.className}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#4A5568', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="#D4AF37" /> {s.phone}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: '#059669' }}>
                    Rs. {s.monthlyFee.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteStudent(s.id, s.name)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#DC2626', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredStudents.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

    </div>
  );
};
