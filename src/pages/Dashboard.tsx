import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  institute_id: number;
  institute_name: string;
  role: string;
  member_name?: string;
  class_name?: string;
  member_code?: string;
}

interface SubjectRow {
  subject: string;
  marks: string;
  maxMarks: string;
}

interface ScheduleSlot {
  id: number;
  institute_id: number;
  teacher_unique_id: string;
  teacher_name: string;
  class_name: string;
  lecture_time: string;
  subject_name: string;
}

// Master Time-Table Periods
const PERIOD_COLUMNS = [
  { key: 'Period 1 (09:00 - 09:45)', label: 'Period 1 (09:00 - 09:45)' },
  { key: 'Period 2 (09:45 - 10:30)', label: 'Period 2 (09:45 - 10:30)' },
  { key: 'Period 3 (10:30 - 11:15)', label: 'Period 3 (10:30 - 11:15)' },
  { key: 'LUNCH_BREAK', label: '11:15 - 11:45', isLunch: true },
  { key: 'Period 4 (11:45 - 12:30)', label: 'Period 4 (11:45 - 12:30)' },
  { key: 'Period 5 (12:30 - 01:15)', label: 'Period 5 (12:30 - 01:15)' },
  { key: 'Period 6 (01:15 - 02:00)', label: 'Period 6 (01:15 - 02:00)' }
];

const LUNCH_LETTERS = ['L', 'U', 'N', 'C', 'H', 'BREAK', 'BREAK', 'BREAK'];

const createEmptySixSubjects = (): SubjectRow[] => [
  { subject: '', marks: '', maxMarks: '100' },
  { subject: '', marks: '', maxMarks: '100' },
  { subject: '', marks: '', maxMarks: '100' },
  { subject: '', marks: '', maxMarks: '100' },
  { subject: '', marks: '', maxMarks: '100' },
  { subject: '', marks: '', maxMarks: '100' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeNavTab = searchParams.get('tab') || 'overview';

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [adminCode, setAdminCode] = useState<string>('');
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [savingCreds, setSavingCreds] = useState(false);
  const [coAdmins, setCoAdmins] = useState<string[]>([]);
  const [newModEmail, setNewModEmail] = useState('');

  // DYNAMIC CLASSES STATE (Using campus_classes)
  const [classList, setClassList] = useState<any[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [selectedAdminClass, setSelectedAdminClass] = useState<string | null>(null);

  // Result Marksheet States
  const [selectedResultClass, setSelectedResultClass] = useState<string | null>(null);
  const [selectedResultStudent, setSelectedResultStudent] = useState<any | null>(null);
  const [marksheetRows, setMarksheetRows] = useState<SubjectRow[]>(createEmptySixSubjects());
  const [studentRankInput, setStudentRankInput] = useState<string>('1st');
  const [savingMarksheet, setSavingMarksheet] = useState(false);

  // Master Time-Table States
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [editingCell, setEditingCell] = useState<{ className: string; periodKey: string } | null>(null);
  const [cellTeacherId, setCellTeacherId] = useState<string>('');
  const [cellSubject, setCellSubject] = useState<string>('');

  // Teacher's Clicked Period Cell
  const [activeClickedPeriod, setActiveClickedPeriod] = useState<{
    className: string;
    periodKey: string;
    subjectName: string;
    teacherId: string;
  } | null>(null);

  const [teachers, setTeachers] = useState<any[]>([]);
  const [tName, setTName] = useState('');
  const [tUniqueId, setTUniqueId] = useState('');
  const [tPassword, setTPassword] = useState('');
  const [tClass, setTClass] = useState('');

  const [students, setStudents] = useState<any[]>([]);
  const [sName, setSName] = useState('');
  const [sRoll, setSRoll] = useState('');
  const [sSection, setSSection] = useState('A');
  const [sPosition, setSPosition] = useState('1st');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [savingAll, setSavingAll] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [myStudentData, setMyStudentData] = useState<any>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const savedSession = localStorage.getItem('campus_active_session');
      const activeSession = savedSession ? JSON.parse(savedSession) : null;

      if (!prof && !activeSession) return navigate('/onboarding');

      const finalProfile: Profile = {
        id: user.id,
        email: user.email || '',
        institute_id: activeSession?.institute_id || prof?.institute_id,
        institute_name: activeSession?.institute_name || prof?.institute_name,
        role: activeSession?.role || prof?.role || 'student',
        member_name: activeSession?.member_name || prof?.member_name,
        class_name: activeSession?.class_name || prof?.class_name,
        member_code: activeSession?.member_code || prof?.member_code
      };

      setProfile(finalProfile);

      const { data: instData } = await supabase
        .from('institutes')
        .select('admin_code, admin_username, admin_password, co_admins')
        .eq('id', finalProfile.institute_id)
        .single();

      if (instData) {
        setAdminCode(instData.admin_code || `ADM-${finalProfile.institute_id}01`);
        setAdminUsername(instData.admin_username || '');
        setAdminPassword(instData.admin_password || '');
        setCoAdmins(instData.co_admins || []);
      }

      const { data: pData } = await supabase.from('posts').select('*').eq('institute_id', finalProfile.institute_id).order('created_at', { ascending: false });
      
      // FETCH CAMPUS CLASSES FROM DATABASE
      const { data: cData } = await supabase.from('campus_classes').select('*').eq('institute_id', finalProfile.institute_id).order('class_name');
      
      const { data: tData } = await supabase.from('campus_teachers').select('*').eq('institute_id', finalProfile.institute_id);
      const { data: sData } = await supabase.from('campus_students').select('*').eq('institute_id', finalProfile.institute_id).order('roll_number', { ascending: true });
      const { data: aData } = await supabase.from('campus_attendance').select('*').eq('institute_id', finalProfile.institute_id).order('attendance_date', { ascending: false });
      const { data: schedData } = await supabase.from('campus_schedules').select('*').eq('institute_id', finalProfile.institute_id);

      if (pData) setPosts(pData);
      if (cData) setClassList(cData);
      if (tData) setTeachers(tData);
      if (aData) setAttendanceRecords(aData);
      if (schedData) setSchedules(schedData);

      if (sData) {
        setStudents(sData);
        if (finalProfile.role === 'student') {
          const found = sData.find((s: any) => s.roll_number === finalProfile.member_code || s.name.toLowerCase() === finalProfile.member_name?.toLowerCase());
          setMyStudentData(found || null);
        }
      }

      setLoading(false);
    };

    loadDashboard();
  }, [navigate]);

  const allClassOptions = classList.map(c => c.class_name);

  // ============================================================================
  // ADMIN & TEACHER FUNCTIONS
  // ============================================================================
  const handleAdminClickCell = (className: string, periodKey: string, existingSlot?: ScheduleSlot) => {
    setEditingCell({ className, periodKey });
    setCellTeacherId(existingSlot?.teacher_unique_id || (teachers[0]?.unique_id ?? 'T1'));
    setCellSubject(existingSlot?.subject_name || '');
  };

  const handleSaveTimeTableCell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !editingCell) return;

    const matchedTeacher = teachers.find(
      t => t.unique_id.toLowerCase() === cellTeacherId.trim().toLowerCase()
    );

    await supabase
      .from('campus_schedules')
      .delete()
      .eq('institute_id', profile.institute_id)
      .eq('class_name', editingCell.className)
      .eq('lecture_time', editingCell.periodKey);

    const payload = {
      institute_id: profile.institute_id,
      teacher_unique_id: cellTeacherId.trim(),
      teacher_name: matchedTeacher ? matchedTeacher.name : cellTeacherId.trim(),
      class_name: editingCell.className,
      lecture_time: editingCell.periodKey,
      subject_name: cellSubject.trim() || 'Lecture'
    };

    const { data, error } = await supabase.from('campus_schedules').insert([payload]).select();

    if (error) {
      alert('Error saving slot: ' + error.message);
    } else if (data) {
      const remaining = schedules.filter(
        s => !(s.class_name === editingCell.className && s.lecture_time === editingCell.periodKey)
      );
      setSchedules([...remaining, data[0]]);
      setEditingCell(null);
    }
  };

  const handleClearTimeTableCell = async () => {
    if (!profile || !editingCell) return;
    await supabase
      .from('campus_schedules')
      .delete()
      .eq('institute_id', profile.institute_id)
      .eq('class_name', editingCell.className)
      .eq('lecture_time', editingCell.periodKey);

    setSchedules(schedules.filter(
      s => !(s.class_name === editingCell.className && s.lecture_time === editingCell.periodKey)
    ));
    setEditingCell(null);
  };

  const handleSelectAttendanceLocal = (stu: any, status: 'P' | 'A') => {
    if (!profile || !activeClickedPeriod) return;
    const newRecord = {
      id: Date.now() + stu.id,
      institute_id: profile.institute_id,
      class_name: activeClickedPeriod.className,
      student_id: stu.id,
      roll_number: stu.roll_number,
      student_name: stu.name,
      attendance_date: selectedDate,
      lecture_name: activeLectureLabel,
      status: status,
      marked_by: `${profile.member_name || 'Teacher'} (${profile.member_code || ''})`
    };

    const filtered = attendanceRecords.filter(
      r => !(r.student_id === stu.id && r.attendance_date === selectedDate && r.lecture_name === activeLectureLabel)
    );
    setAttendanceRecords([newRecord, ...filtered]);
  };

  const handleSelectAllPresentLocal = (classStudents: any[]) => {
    if (!profile || !activeClickedPeriod || classStudents.length === 0) return;
    const newRecords = classStudents.map((stu, idx) => ({
      id: Date.now() + idx,
      institute_id: profile.institute_id,
      class_name: activeClickedPeriod.className,
      student_id: stu.id,
      roll_number: stu.roll_number,
      student_name: stu.name,
      attendance_date: selectedDate,
      lecture_name: activeLectureLabel,
      status: 'P',
      marked_by: `${profile.member_name || 'Teacher'} (${profile.member_code || ''})`
    }));

    const studentIds = classStudents.map(s => s.id);
    const remaining = attendanceRecords.filter(
      r => !(studentIds.includes(r.student_id) && r.attendance_date === selectedDate && r.lecture_name === activeLectureLabel)
    );
    setAttendanceRecords([...newRecords, ...remaining]);
  };

  const handleSaveEntireClassSheet = async (classStudents: any[]) => {
    if (!profile || !activeClickedPeriod || classStudents.length === 0) return;
    setSavingAll(true);

    const attendancePayloads: any[] = [];
    classStudents.forEach(stu => {
      const rec = attendanceRecords.find(
        r => r.student_id === stu.id && r.attendance_date === selectedDate && r.lecture_name === activeLectureLabel
      );
      if (rec) {
        attendancePayloads.push({
          institute_id: profile.institute_id,
          class_name: activeClickedPeriod.className,
          student_id: stu.id,
          roll_number: stu.roll_number,
          student_name: stu.name,
          attendance_date: selectedDate,
          lecture_name: activeLectureLabel,
          status: rec.status,
          marked_by: `${profile.member_name || 'Teacher'} (${profile.member_code || ''})`
        });
      }
    });

    if (attendancePayloads.length === 0) {
      alert('Please mark P or A for at least one student before saving!');
      setSavingAll(false);
      return;
    }

    const { error: attErr } = await supabase
      .from('campus_attendance')
      .upsert(attendancePayloads as any[], { onConflict: 'student_id,attendance_date,lecture_name' });

    setSavingAll(false);

    if (attErr) {
      alert('Error saving attendance: ' + attErr.message);
    } else {
      alert(`✅ Attendance Saved Successfully!\nClass: ${activeClickedPeriod.className}\nPeriod: ${activeLectureLabel}\nDate: ${selectedDate}`);
    }
  };

  const activeLectureLabel = activeClickedPeriod
    ? `${activeClickedPeriod.periodKey} - ${activeClickedPeriod.subjectName}`
    : 'General Lecture';

  const handleOpenStudentMarksheet = (stu: any) => {
    setSelectedResultStudent(stu);
    setStudentRankInput(stu.position || '1st');

    if (Array.isArray(stu.subject_marks) && stu.subject_marks.length > 0) {
      const existing = stu.subject_marks.map((r: any) => ({
        subject: r.subject || '',
        marks: r.marks !== undefined ? String(r.marks) : '',
        maxMarks: r.maxMarks !== undefined ? String(r.maxMarks) : '100'
      }));
      while (existing.length < 6) {
        existing.push({ subject: '', marks: '', maxMarks: '100' });
      }
      setMarksheetRows(existing.slice(0, 6));
    } else {
      setMarksheetRows(createEmptySixSubjects());
    }
  };

  const handleMarksheetRowChange = (index: number, field: keyof SubjectRow, value: string) => {
    const updated = [...marksheetRows];
    updated[index] = { ...updated[index], [field]: value };
    setMarksheetRows(updated);
  };

  const calculateMarksheetTotals = (rows: SubjectRow[]) => {
    let obtainedTotal = 0;
    let maxTotal = 0;
    let filledCount = 0;
    rows.forEach(r => {
      if (r.subject.trim() !== '' || r.marks.trim() !== '') {
        filledCount++;
        obtainedTotal += Number(r.marks) || 0;
        maxTotal += Number(r.maxMarks) || 100;
      }
    });
    const percentage = maxTotal > 0 ? Number(((obtainedTotal / maxTotal) * 100).toFixed(2)) : 0;
    return { obtainedTotal, maxTotal, percentage, filledCount };
  };

  const handleSaveStudentMarksheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResultStudent) return;
    setSavingMarksheet(true);

    const { obtainedTotal, maxTotal, percentage } = calculateMarksheetTotals(marksheetRows);
    const passStatus = percentage >= 33 ? 'PASS' : 'FAIL';
    const summaryText = `${passStatus} — ${obtainedTotal}/${maxTotal} (${percentage}%)`;

    const { error } = await supabase
      .from('campus_students')
      .update({
        subject_marks: marksheetRows,
        result_status: summaryText,
        position: studentRankInput || '1st'
      })
      .eq('id', selectedResultStudent.id);

    setSavingMarksheet(false);

    if (error) {
      alert('Error saving marksheet: ' + error.message);
    } else {
      const updatedStu = {
        ...selectedResultStudent,
        subject_marks: marksheetRows,
        result_status: summaryText,
        position: studentRankInput || '1st'
      };
      setStudents(students.map(s => s.id === selectedResultStudent.id ? updatedStu : s));
      setSelectedResultStudent(updatedStu);
      alert(`✅ Marksheet Saved for ${selectedResultStudent.name}!\nTotal: ${obtainedTotal}/${maxTotal} (${percentage}%)`);
    }
  };

  const handleSaveAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !adminUsername.trim() || !adminPassword.trim()) return;
    setSavingCreds(true);
    const { error } = await supabase
      .from('institutes')
      .update({ admin_username: adminUsername.trim(), admin_password: adminPassword })
      .eq('id', profile.institute_id);
    setSavingCreds(false);
    if (!error) alert('✅ Admin Username & Password saved!');
  };

  const handleAddModerator = async () => {
    if (!newModEmail.trim() || !profile) return;
    const updatedMods = [...coAdmins, newModEmail.trim()];
    const { error } = await supabase.from('institutes').update({ co_admins: updatedMods }).eq('id', profile.institute_id);
    if (!error) {
      setCoAdmins(updatedMods);
      setNewModEmail('');
    }
  };

  const handleRemoveModerator = async (emailToRemove: string) => {
    if (!profile) return;
    const updatedMods = coAdmins.filter(e => e !== emailToRemove);
    await supabase.from('institutes').update({ co_admins: updatedMods }).eq('id', profile.institute_id);
    setCoAdmins(updatedMods);
  };

  const handleAddClass = async () => {
    if (!newClassName.trim() || !profile) return;
    const { data, error } = await supabase
      .from('campus_classes')
      .insert([{ institute_id: profile.institute_id, class_name: newClassName.trim() }])
      .select();
    if (!error && data) {
      setClassList([...classList, data[0]]);
      setNewClassName('');
    } else {
      alert('Error adding class: ' + error?.message);
    }
  };

  const handleDeleteClass = async (e: React.MouseEvent, className: string) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`Kya aap sach mein "${className}" ko delete karna chahte hain?`);
    if (!confirmDelete || !profile) return;

    const { error } = await supabase
      .from('campus_classes')
      .delete()
      .eq('institute_id', profile.institute_id)
      .eq('class_name', className);
    
    if (error) {
      alert('Error deleting class: ' + error.message);
    } else {
      setClassList(classList.filter(c => c.class_name !== className));
      if (selectedAdminClass === className) setSelectedAdminClass(null);
      alert(`✅ ${className} deleted successfully!`);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !tClass) return;
    const { data, error } = await supabase
      .from('campus_teachers')
      .insert([{
        institute_id: profile.institute_id,
        name: tName.trim(),
        unique_id: tUniqueId.trim(),
        password: tPassword.trim(),
        assigned_class: tClass
      }])
      .select();
    if (!error && data) {
      setTeachers([...teachers, data[0]]);
      setTName(''); setTUniqueId(''); setTPassword(''); setTClass('');
      alert(`✅ Teacher added! Login ID: ${data[0].unique_id}`);
    }
  };

  const handleEditTeacherPassword = async (id: number, currentPass: string) => {
    const newPass = window.prompt('Enter new password for teacher:', currentPass);
    if (!newPass) return;
    const { error } = await supabase.from('campus_teachers').update({ password: newPass }).eq('id', id);
    if (!error) setTeachers(teachers.map(t => t.id === id ? { ...t, password: newPass } : t));
  };

  const handleDeleteTeacher = async (id: number) => {
    await supabase.from('campus_teachers').delete().eq('id', id);
    setTeachers(teachers.filter(t => t.id !== id));
  };

  const handleAddStudentToSelectedClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedAdminClass) return;

    const fullPayload = {
      institute_id: profile.institute_id,
      name: sName.trim(),
      roll_number: sRoll.trim(),
      class_name: selectedAdminClass,
      section: sSection || 'A',
      position: sPosition || '1st'
    };

    let { data, error } = await supabase.from('campus_students').insert([fullPayload]).select();

    if (error) {
      const basicPayload = {
        institute_id: profile.institute_id,
        name: sName.trim(),
        roll_number: sRoll.trim(),
        class_name: selectedAdminClass
      };
      const res = await supabase.from('campus_students').insert([basicPayload]).select();
      data = res.data;
      error = res.error;
    }

    if (error) {
      alert('Error adding student: ' + error.message);
    } else if (data) {
      setStudents([...students, data[0]]);
      setSName('');
      setSRoll('');
      alert(`✅ Student "${data[0].name}" added to ${selectedAdminClass}!`);
    }
  };

  const handleEditRollNumber = async (id: number, currentRoll: string) => {
    const newRoll = window.prompt('Edit Student Roll Number:', currentRoll);
    if (!newRoll) return;
    const { error } = await supabase.from('campus_students').update({ roll_number: newRoll }).eq('id', id);
    if (!error) setStudents(students.map(s => s.id === id ? { ...s, roll_number: newRoll } : s));
  };

  const handleDeleteStudent = async (id: number) => {
    await supabase.from('campus_students').delete().eq('id', id);
    setStudents(students.filter(s => s.id !== id));
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !profile) return;
    const authorDisplay = profile.member_name 
      ? `${profile.member_name} (${profile.member_code || profile.role})` 
      : profile.email;

    const { data } = await supabase
      .from('posts')
      .insert([{ 
        content: newPost, 
        author_email: authorDisplay, 
        author_role: profile.role, 
        institute_id: profile.institute_id 
      }])
      .select();

    if (data) {
      setPosts([data[0], ...posts]);
      setNewPost('');
      alert('📢 Announcement published successfully!');
    }
  };

  // ============================================================================
  // MASTER TIME-TABLE GRID RENDERER
  // ============================================================================
  const renderMasterTimeTableGrid = (mode: 'admin' | 'teacher') => {
    return (
      <div className="bg-[#0b0d13] text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
              {mode === 'admin' ? '🗓️ Admin Master Time-Table Builder' : '🗓️ Interactive Class Schedule'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
              Master Class & Period Time-Table
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'admin'
                ? 'Click on any Period cell below to assign a Teacher ID and Subject.'
                : `Logged in as ${profile?.member_name}. Click on any highlighted period below to mark attendance!`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-300 font-semibold">
                <th className="py-4 px-4 min-w-[140px]">Class / Section</th>
                {PERIOD_COLUMNS.map(col => (
                  <th key={col.key} className="py-4 px-4 min-w-[155px]">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allClassOptions.map((clsName, rowIdx) => {
                const classStudentCount = students.filter(s => s.class_name === clsName).length;
                return (
                  <tr key={clsName} className="border-b border-slate-800/90 hover:bg-white/[0.02] transition">
                    <td className="py-5 px-4 font-bold text-white">
                      <div>{clsName}</div>
                      <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                        ({classStudentCount} Students)
                      </div>
                    </td>

                    {PERIOD_COLUMNS.map(col => {
                      if (col.isLunch) {
                        const lunchText = LUNCH_LETTERS[rowIdx] || 'BREAK';
                        return (
                          <td key={col.key} className="py-5 px-4 font-black text-white tracking-widest select-none">
                            {lunchText}
                          </td>
                        );
                      }

                      const slot = schedules.find(
                        s => s.class_name === clsName && s.lecture_time === col.key
                      );

                      const isMyAssignedSlot =
                        slot &&
                        profile?.member_code &&
                        slot.teacher_unique_id.trim().toLowerCase() === profile.member_code.trim().toLowerCase();

                      const isCurrentlySelected =
                        activeClickedPeriod?.className === clsName &&
                        activeClickedPeriod?.periodKey === col.key;

                      if (mode === 'admin') {
                        return (
                          <td key={col.key} className="py-4 px-4">
                            <button
                              type="button"
                              onClick={() => handleAdminClickCell(clsName, col.key, slot)}
                              className={`w-full text-left py-2.5 px-3 rounded-xl border transition ${
                                slot
                                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100 font-semibold'
                                  : 'bg-slate-900/40 hover:bg-slate-800/60 border-dashed border-slate-800 text-slate-500 text-xs'
                              }`}
                            >
                              {slot ? (
                                <span>{slot.teacher_unique_id} ({slot.subject_name})</span>
                              ) : (
                                <span>+ Assign Period</span>
                              )}
                            </button>
                          </td>
                        );
                      }

                      return (
                        <td key={col.key} className="py-4 px-4">
                          {slot ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveClickedPeriod({
                                  className: clsName,
                                  periodKey: col.key,
                                  subjectName: slot.subject_name,
                                  teacherId: slot.teacher_unique_id
                                });
                                setTimeout(() => {
                                  document.getElementById('live-attendance-sheet')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              }}
                              className={`w-full text-left py-2.5 px-3 rounded-xl transition cursor-pointer ${
                                isCurrentlySelected
                                  ? 'bg-emerald-500 text-slate-950 font-black ring-4 ring-emerald-400/40 shadow-lg'
                                  : isMyAssignedSlot
                                  ? 'bg-emerald-950/90 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/60 font-bold shadow-sm'
                                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span>{slot.teacher_unique_id} ({slot.subject_name})</span>
                                {isMyAssignedSlot && <span className="text-[10px]">●</span>}
                              </div>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveClickedPeriod({
                                  className: clsName,
                                  periodKey: col.key,
                                  subjectName: 'General',
                                  teacherId: profile?.member_code || 'T1'
                                });
                                setTimeout(() => {
                                  document.getElementById('live-attendance-sheet')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              }}
                              className="w-full text-left py-2 px-3 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-slate-900 transition text-xs"
                            >
                              Free (Click to take)
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {mode === 'admin' && editingCell && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border-t-4 border-indigo-600">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-900">
                  🗓️ Assign Teacher & Subject
                </h3>
                <button onClick={() => setEditingCell(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xl">×</button>
              </div>

              <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs">
                <p><strong>Class:</strong> {editingCell.className}</p>
                <p className="mt-0.5"><strong>Period:</strong> {editingCell.periodKey}</p>
              </div>

              <form onSubmit={handleSaveTimeTableCell} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Select or Type Teacher ID (e.g. T1, T2) *
                  </label>
                  {teachers.length > 0 && (
                    <select
                      value={cellTeacherId}
                      onChange={(e) => setCellTeacherId(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-sm bg-slate-50 mb-2 font-semibold"
                    >
                      <option value="">-- Choose from Registered Teachers --</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.unique_id}>
                          {t.unique_id} — {t.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    required
                    placeholder="Or type Teacher Code (e.g. T1, T2)"
                    value={cellTeacherId}
                    onChange={(e) => setCellTeacherId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Subject Name (e.g. Maths, Eng, Sci) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maths"
                    value={cellSubject}
                    onChange={(e) => setCellSubject(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-bold"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={handleClearTimeTableCell}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    🗑️ Clear Slot
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCell(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md"
                    >
                      💾 Save Cell
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // REUSABLE 6-SUBJECT MARKSHEET MANAGER COMPONENT
  // ============================================================================
  const renderResultMarksheetManager = () => {
    const classStudentsForResult = selectedResultClass
      ? students.filter(s => s.class_name === selectedResultClass)
      : [];

    const { obtainedTotal, maxTotal, percentage } = calculateMarksheetTotals(marksheetRows);

    return (
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border-2 border-indigo-200">
        {!selectedResultClass && (
          <div>
            <span className="text-xs font-extrabold uppercase text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
              Result Portal • Step 1
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              📊 Select Class / Year to Prepare Student Results
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Choose a class below to view its students and create their 6-subject marksheet.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allClassOptions.map((clsName, idx) => {
                const count = students.filter(s => s.class_name === clsName).length;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedResultClass(clsName);
                      setSelectedResultStudent(null);
                    }}
                    className="cursor-pointer group p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 bg-gradient-to-br from-white to-slate-50 hover:to-indigo-50/40 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-900 font-black flex items-center justify-center text-sm">
                          📊
                        </span>
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-indigo-900 text-white">
                          {count} Students
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base mt-4 group-hover:text-indigo-700 transition">
                        {clsName}
                      </h4>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-between items-center text-xs font-bold text-indigo-700">
                      <span>Open Class Results</span>
                      <span className="group-hover:translate-x-1 transition">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedResultClass && !selectedResultStudent && (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => setSelectedResultClass(null)}
                className="text-xs font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-full mb-3 inline-flex items-center gap-1 transition"
              >
                ← Back to Class Selection
              </button>
              <h2 className="text-2xl font-black text-slate-900">
                👨‍🎓 Select Student from <span className="text-indigo-700">{selectedResultClass}</span>
              </h2>
            </div>

            {classStudentsForResult.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed">
                <p className="text-sm font-bold text-slate-500">No students registered in {selectedResultClass} yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classStudentsForResult.map(stu => {
                  const hasResult = Array.isArray(stu.subject_marks) && stu.subject_marks.some((r: any) => r.subject?.trim());
                  return (
                    <div
                      key={stu.id}
                      onClick={() => handleOpenStudentMarksheet(stu)}
                      className="cursor-pointer group p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 bg-white hover:bg-indigo-50/20 shadow-2xs hover:shadow-md transition flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-indigo-100 text-indigo-950 px-2.5 py-0.5 rounded-md">
                            Roll: {stu.roll_number}
                          </span>
                          {hasResult ? (
                            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                              ✓ {stu.result_status}
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                              ⏳ Pending Marksheet
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900 mt-1.5 group-hover:text-indigo-700">
                          {stu.name}
                        </h3>
                      </div>

                      <button className="bg-indigo-900 group-hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 transition">
                        Open Marksheet →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedResultClass && selectedResultStudent && (
          <form onSubmit={handleSaveStudentMarksheet} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedResultStudent(null)}
                  className="text-xs font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-full mb-2 inline-flex items-center gap-1 transition"
                >
                  ← Back to {selectedResultClass} Students List
                </button>
                <h2 className="text-2xl font-black text-slate-900">
                  📝 6-Subject Result Marksheet — <span className="text-indigo-700">{selectedResultStudent.name}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Roll No: <strong className="font-mono text-slate-800">{selectedResultStudent.roll_number}</strong> &nbsp;|&nbsp; Class: <strong>{selectedResultStudent.class_name}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
                <label className="text-xs font-extrabold text-amber-900 uppercase">Class Rank:</label>
                <input
                  type="text"
                  value={studentRankInput}
                  onChange={(e) => setStudentRankInput(e.target.value)}
                  className="w-20 border border-amber-300 bg-white rounded-lg p-1.5 text-xs font-extrabold text-center text-amber-950"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase">
                    <th className="p-3.5 w-16 text-center">S.No</th>
                    <th className="p-3.5">Subject Name (Write Subject)</th>
                    <th className="p-3.5 w-44 text-center">Obtained Marks</th>
                    <th className="p-3.5 w-44 text-center">Maximum Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {marksheetRows.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-3 text-center font-mono font-bold text-slate-500">0{index + 1}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder={`Enter Subject ${index + 1} Name...`}
                          value={row.subject}
                          onChange={(e) => handleMarksheetRowChange(index, 'subject', e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-semibold text-slate-900"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          placeholder="Marks"
                          value={row.marks}
                          onChange={(e) => handleMarksheetRowChange(index, 'marks', e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-extrabold text-center text-indigo-950 bg-indigo-50/40"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="1"
                          placeholder="100"
                          value={row.maxMarks}
                          onChange={(e) => handleMarksheetRowChange(index, 'maxMarks', e.target.value)}
                          className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-bold text-center text-slate-700 bg-slate-50"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gradient-to-r from-indigo-950 via-blue-950 to-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-md">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-[11px] uppercase text-indigo-300 font-bold">Grand Total</p>
                  <p className="text-2xl sm:text-3xl font-black font-mono">
                    {obtainedTotal} <span className="text-lg text-indigo-300 font-normal">/ {maxTotal}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase text-indigo-300 font-bold">Percentage</p>
                  <p className="text-2xl sm:text-3xl font-black text-amber-400">{percentage}%</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingMarksheet}
                className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg transition"
              >
                {savingMarksheet ? 'Saving...' : '💾 Save & Publish to Student Result'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  if (loading) return <div className="flex justify-center items-center h-screen font-bold text-blue-900">Loading Campus ERP...</div>;

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-[#eef4fb]">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="mb-6 p-4 bg-blue-950 text-white rounded-2xl shadow-sm">
            <h2 className="font-bold text-base leading-tight">{profile?.institute_name}</h2>
            <span className={`inline-block mt-2 text-xs font-bold uppercase px-2.5 py-0.5 rounded ${
              profile?.role === 'admin' ? 'bg-amber-500' : profile?.role === 'teacher' ? 'bg-emerald-600' : 'bg-blue-600'
            } text-white`}>
              {profile?.role} Portal
            </span>

            <div className="mt-3 pt-3 border-t border-blue-800 text-xs space-y-1">
              <p className="text-white font-semibold">👤 {profile?.member_name || profile?.email}</p>
              {profile?.role === 'admin' && <p className="font-mono text-amber-300">Admin ID: {adminCode}</p>}
              {profile?.role === 'teacher' && <p className="font-mono text-emerald-300">Teacher ID: {profile?.member_code}</p>}
              {profile?.role === 'student' && <p className="font-mono text-blue-300">Roll No: {profile?.member_code}</p>}
            </div>
          </div>

          <p className="text-[11px] font-bold uppercase text-slate-400 px-3 mb-2">Quick Navigation</p>
          <ul className="space-y-1.5 text-sm">
            <li>
              <button onClick={() => navigate('/dashboard?tab=overview')} className={`w-full text-left px-3.5 py-2 rounded-xl font-bold transition ${activeNavTab === 'overview' ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                📊 Complete View (All)
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/dashboard?tab=results')} className={`w-full text-left px-3.5 py-2 rounded-xl font-bold transition ${activeNavTab === 'results' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                📝 Result Marksheets
              </button>
            </li>
            <li>
              <button onClick={() => navigate(`/campus/${profile?.institute_id}`)} className="w-full text-left px-3.5 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold">
                🏫 Switch Role (Campus Home)
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/onboarding')} className="w-full text-left px-3.5 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold">
                🔄 Search Campuses
              </button>
            </li>
          </ul>
        </div>

        <button onClick={async () => { localStorage.removeItem('campus_active_session'); await supabase.auth.signOut(); navigate('/login'); }} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-sm transition">
          🚪 Log Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">

          {/* ========================================================= */}
          {/* 1. STUDENT DASHBOARD                                      */}
          {/* ========================================================= */}
          {profile?.role === 'student' && (() => {
            const myLogs = attendanceRecords.filter(
              r => r.roll_number === (myStudentData?.roll_number || profile.member_code)
            );
            const totalP = myLogs.filter(r => r.status === 'P').length;
            const totalA = myLogs.filter(r => r.status === 'A').length;
            const totalLectures = totalP + totalA;
            const percentage = totalLectures > 0 ? Math.round((totalP / totalLectures) * 100) : 100;

            const joinedDate = myStudentData?.created_at 
              ? new Date(myStudentData.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Active since Admission';

            const savedSubjectMarks: SubjectRow[] = Array.isArray(myStudentData?.subject_marks)
              ? myStudentData.subject_marks.filter((r: any) => r.subject?.trim() !== '' || r.marks?.trim() !== '')
              : [];

            const stuTotals = calculateMarksheetTotals(savedSubjectMarks);

            const showProfile = activeNavTab === 'overview' || activeNavTab === 'profile';
            const showAttendance = activeNavTab === 'overview' || activeNavTab === 'attendance';
            const showResults = activeNavTab === 'overview' || activeNavTab === 'results';
            const showNotices = activeNavTab === 'overview' || activeNavTab === 'notices';

            return (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider bg-blue-700 px-3 py-1 rounded-full">
                      🎓 Verified Student Portal • Joined: {joinedDate}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
                      {myStudentData?.name || profile.member_name || 'Student'}
                    </h1>
                    <p className="text-blue-200 text-sm">{profile.institute_name} • {myStudentData?.class_name || profile.class_name}</p>
                  </div>
                </div>

                {showProfile && (
                  <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200">
                    <h2 className="text-lg font-extrabold text-slate-900 border-b pb-3 mb-4">👤 Student Profile Details</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                      <div className="p-3.5 bg-slate-50 rounded-2xl border">
                        <p className="text-xs text-slate-500 uppercase font-bold">Full Name</p>
                        <p className="font-extrabold text-slate-900 mt-1">{myStudentData?.name || profile.member_name}</p>
                      </div>
                      <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-xs text-blue-600 uppercase font-bold">Roll Number</p>
                        <p className="font-mono font-extrabold text-blue-950 mt-1">{myStudentData?.roll_number || profile.member_code}</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-2xl border">
                        <p className="text-xs text-slate-500 uppercase font-bold">Class</p>
                        <p className="font-bold text-slate-900 mt-1">{myStudentData?.class_name || profile.class_name}</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-2xl border">
                        <p className="text-xs text-slate-500 uppercase font-bold">Section</p>
                        <p className="font-extrabold text-slate-900 mt-1">Sec - {myStudentData?.section || 'A'}</p>
                      </div>
                      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                        <p className="text-xs text-amber-800 uppercase font-bold">Rank</p>
                        <p className="font-extrabold text-amber-900 mt-1">🏆 {myStudentData?.position || '1st'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {showResults && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border-2 border-indigo-200 space-y-6">
                    <h2 className="text-xl font-black text-slate-900 border-b pb-3">📊 Official 6-Subject Result Marksheet</h2>
                    {savedSubjectMarks.length === 0 ? (
                      <p className="text-sm text-slate-500 py-6 text-center">Your result marksheet has not been published yet.</p>
                    ) : (
                      <>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="bg-slate-900 text-white text-xs uppercase">
                                <th className="p-3.5 w-16 text-center">S.No</th>
                                <th className="p-3.5">Subject Name</th>
                                <th className="p-3.5 text-center">Maximum Marks</th>
                                <th className="p-3.5 text-center">Marks Obtained</th>
                              </tr>
                            </thead>
                            <tbody>
                              {savedSubjectMarks.map((item, idx) => (
                                <tr key={idx} className="border-b">
                                  <td className="p-3.5 text-center font-mono font-bold text-slate-500">0{idx + 1}</td>
                                  <td className="p-3.5 font-extrabold text-slate-900">{item.subject}</td>
                                  <td className="p-3.5 text-center font-semibold text-slate-600">{item.maxMarks || 100}</td>
                                  <td className="p-3.5 text-center font-mono font-black text-indigo-950 bg-indigo-50/40">{item.marks || 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap justify-between items-center gap-6">
                          <div>
                            <p className="text-xs uppercase text-indigo-300 font-bold">Grand Total</p>
                            <p className="text-2xl font-black font-mono">{stuTotals.obtainedTotal} / {stuTotals.maxTotal}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-indigo-300 font-bold">Percentage</p>
                            <p className="text-2xl font-black text-amber-400">{stuTotals.percentage}%</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {showAttendance && (
                  <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200">
                    <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-4 gap-4">
                      <h2 className="text-lg font-extrabold text-slate-900">📅 Complete Attendance Register</h2>
                      <div className="flex gap-2 text-xs font-bold">
                        <span className="px-3 py-1.5 rounded-xl bg-green-100 text-green-800">Present (P): {totalP}</span>
                        <span className="px-3 py-1.5 rounded-xl bg-red-100 text-red-800">Absent (A): {totalA}</span>
                        <span className="px-3 py-1.5 rounded-xl bg-blue-900 text-white">Overall: {percentage}%</span>
                      </div>
                    </div>

                    {myLogs.length === 0 ? (
                      <p className="text-sm text-slate-400 py-8 text-center">No attendance marked yet.</p>
                    ) : (
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 border-b text-xs uppercase">
                            <th className="p-3">Date</th>
                            <th className="p-3">Period & Subject</th>
                            <th className="p-3">Marked By</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myLogs.map(log => (
                            <tr key={log.id} className="border-b">
                              <td className="p-3 font-mono font-bold">{log.attendance_date}</td>
                              <td className="p-3 font-semibold text-blue-950">{log.lecture_name}</td>
                              <td className="p-3 text-xs text-slate-500">{log.marked_by}</td>
                              <td className="p-3 text-center">
                                <span className={`inline-block w-8 h-8 leading-8 rounded-lg text-white font-extrabold text-sm ${log.status === 'P' ? 'bg-green-600' : 'bg-red-600'}`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {showNotices && (
                  <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200">
                    <h2 className="text-lg font-extrabold text-slate-900 border-b pb-3 mb-4">📢 Official Announcements</h2>
                    <div className="space-y-3">
                      {posts.map(post => (
                        <div key={post.id} className="p-4 rounded-2xl bg-slate-50 border">
                          <span className="font-bold text-sm text-blue-950">{post.author_email}</span>
                          <p className="text-slate-700 text-sm mt-1">{post.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* 2. TEACHER DASHBOARD                                      */}
          {/* ========================================================= */}
          {profile?.role === 'teacher' && (() => {
            const showTeacherProfile = activeNavTab === 'overview' || activeNavTab === 'profile';
            const showTeacherAttendance = activeNavTab === 'overview' || activeNavTab === 'attendance';
            const showTeacherResults = activeNavTab === 'results';
            const showTeacherNotices = activeNavTab === 'overview' || activeNavTab === 'notices';

            const clickedClassStudents = activeClickedPeriod
              ? students.filter(s => s.class_name?.trim().toLowerCase() === activeClickedPeriod.className.trim().toLowerCase())
              : [];

            return (
              <div className="space-y-8">
                {showTeacherProfile && (
                  <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider bg-emerald-700 px-3 py-1 rounded-full">
                        👨‍🏫 Faculty Portal
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">{profile.member_name || 'Faculty Member'}</h1>
                      <p className="text-emerald-200 text-sm">{profile.institute_name}</p>
                    </div>
                    <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-700 text-right">
                      <p className="text-xs text-emerald-300 uppercase font-bold">Teacher ID</p>
                      <p className="font-mono font-extrabold text-xl text-white">{profile.member_code || 'T1'}</p>
                    </div>
                  </div>
                )}

                {showTeacherResults && renderResultMarksheetManager()}

                {showTeacherAttendance && renderMasterTimeTableGrid('teacher')}

                {showTeacherAttendance && activeClickedPeriod && (
                  <div id="live-attendance-sheet" className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-emerald-600 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
                      <div>
                        <span className="text-xs font-extrabold uppercase bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                          📋 Live Period Attendance Register Opened
                        </span>
                        <h2 className="text-2xl font-black text-slate-900 mt-2">
                          {activeClickedPeriod.className} — <span className="text-emerald-700">{activeClickedPeriod.subjectName}</span>
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">
                          <strong>Time Slot:</strong> {activeClickedPeriod.periodKey} &nbsp;|&nbsp; <strong>Total Students in {activeClickedPeriod.className}:</strong>{' '}
                          <span className="bg-blue-900 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                            {clickedClassStudents.length} Students
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-emerald-900 mb-0.5">Attendance Date</label>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-emerald-300 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectAllPresentLocal(clickedClassStudents)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
                        >
                          ✓ Mark All {clickedClassStudents.length} Present (P)
                        </button>
                      </div>
                    </div>

                    {clickedClassStudents.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed">
                        <p className="text-sm font-bold text-slate-600">
                          0 Students found in <strong>{activeClickedPeriod.className}</strong>.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Ask the Administrator to add students to "{activeClickedPeriod.className}" from the Admin Panel.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="border-b-2 bg-slate-100 text-slate-700 text-xs uppercase">
                                <th className="p-3.5">S.No</th>
                                <th className="p-3.5">Roll Number</th>
                                <th className="p-3.5">Student Name</th>
                                <th className="p-3.5 text-center bg-emerald-100/60 text-emerald-950 font-extrabold">
                                  Mark Attendance ({activeClickedPeriod.periodKey})
                                </th>
                                <th className="p-3.5 text-center">Overall P / A</th>
                              </tr>
                            </thead>
                            <tbody>
                              {clickedClassStudents.map((stu, idx) => {
                                const todayRecord = attendanceRecords.find(
                                  r => r.student_id === stu.id && r.attendance_date === selectedDate && r.lecture_name === activeLectureLabel
                                );
                                const currentStatus = todayRecord?.status;
                                const stuAllRecords = attendanceRecords.filter(r => r.student_id === stu.id);
                                const pCount = stuAllRecords.filter(r => r.status === 'P').length;
                                const aCount = stuAllRecords.filter(r => r.status === 'A').length;

                                return (
                                  <tr key={stu.id} className="border-b hover:bg-slate-50">
                                    <td className="p-3.5 font-mono text-xs text-slate-500">0{idx + 1}</td>
                                    <td className="p-3.5 font-mono font-bold text-blue-950">{stu.roll_number}</td>
                                    <td className="p-3.5 font-extrabold text-slate-900">{stu.name}</td>
                                    <td className="p-3.5 text-center bg-emerald-50/30">
                                      <div className="inline-flex items-center gap-2.5">
                                        <button
                                          type="button"
                                          onClick={() => handleSelectAttendanceLocal(stu, 'P')}
                                          className={`w-11 h-10 rounded-xl font-extrabold text-sm transition shadow-xs ${
                                            currentStatus === 'P'
                                              ? 'bg-green-600 text-white ring-2 ring-green-300 scale-105'
                                              : 'bg-white border-2 border-green-600 text-green-700 hover:bg-green-50'
                                          }`}
                                        >
                                          P
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSelectAttendanceLocal(stu, 'A')}
                                          className={`w-11 h-10 rounded-xl font-extrabold text-sm transition shadow-xs ${
                                            currentStatus === 'A'
                                              ? 'bg-red-600 text-white ring-2 ring-red-300 scale-105'
                                              : 'bg-white border-2 border-red-600 text-red-700 hover:bg-red-50'
                                          }`}
                                        >
                                          A
                                        </button>
                                      </div>
                                    </td>
                                    <td className="p-3.5 text-center text-xs font-bold">
                                      <span className="text-green-700 bg-green-50 px-2 py-1 rounded mr-1">P: {pCount}</span>
                                      <span className="text-red-700 bg-red-50 px-2 py-1 rounded">A: {aCount}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-emerald-50/70 p-4 rounded-2xl">
                          <p className="text-xs text-emerald-950 font-bold">
                            ✅ Done marking attendance for all {clickedClassStudents.length} students in {activeClickedPeriod.className}?
                          </p>
                          <button
                            type="button"
                            disabled={savingAll}
                            onClick={() => handleSaveEntireClassSheet(clickedClassStudents)}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-md transition"
                          >
                            {savingAll ? 'Saving Attendance...' : `💾 Save ${activeClickedPeriod.className} Attendance`}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {showTeacherNotices && (
                  <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-2">📢 Post Class Announcement</h2>
                    <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} className="w-full border rounded-xl p-3 text-sm" rows={3} placeholder="Write an announcement..." />
                    <div className="mt-3 flex justify-end">
                      <button onClick={handleCreatePost} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Publish Announcement</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* 3. ADMINISTRATOR DASHBOARD                                */}
          {/* ========================================================= */}
          {profile?.role === 'admin' && (() => {
            const showSecurity = activeNavTab === 'overview' || activeNavTab === 'security';
            const showStudents = activeNavTab === 'overview' || activeNavTab === 'students';
            const showResults = activeNavTab === 'overview' || activeNavTab === 'results';
            const showTeachers = activeNavTab === 'overview' || activeNavTab === 'teachers';
            const showNotices = activeNavTab === 'overview' || activeNavTab === 'notices';

            const classSpecificStudents = selectedAdminClass
              ? students.filter(s => s.class_name === selectedAdminClass)
              : [];

            return (
              <div className="space-y-8">
                
                {/* A. ADMIN MASTER TIME-TABLE BUILDER */}
                {showTeachers && renderMasterTimeTableGrid('admin')}

                {/* B. MANAGE TEACHERS */}
                {showTeachers && (
                  <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">👨‍🏫 Register Teachers (Unique ID like T1, T2, TCH-101 & Password)</h3>
                    <form onSubmit={handleAddTeacher} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border">
                      <input type="text" placeholder="Teacher Name *" value={tName} onChange={e => setTName(e.target.value)} required className="border bg-white p-2.5 rounded-xl text-sm" />
                      <input type="text" placeholder="Teacher ID (e.g. T1, T2) *" value={tUniqueId} onChange={e => setTUniqueId(e.target.value)} required className="border bg-white p-2.5 rounded-xl text-sm" />
                      <input type="text" placeholder="Password *" value={tPassword} onChange={e => setTPassword(e.target.value)} required className="border bg-white p-2.5 rounded-xl text-sm" />
                      <select value={tClass} onChange={e => setTClass(e.target.value)} required className="border p-2.5 rounded-xl text-sm bg-white">
                        <option value="" disabled>-- Primary Class * --</option>
                        {allClassOptions.map((clsName, idx) => <option key={idx} value={clsName}>{clsName}</option>)}
                      </select>
                      <button type="submit" className="bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm">+ Add Teacher</button>
                    </form>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b bg-slate-50 text-slate-600">
                            <th className="p-3">Name</th>
                            <th className="p-3">Unique ID</th>
                            <th className="p-3">Primary Class</th>
                            <th className="p-3">Password (Editable)</th>
                            <th className="p-3">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teachers.map(t => (
                            <tr key={t.id} className="border-b">
                              <td className="p-3 font-semibold">{t.name}</td>
                              <td className="p-3 font-mono text-blue-900 font-bold">{t.unique_id}</td>
                              <td className="p-3">{t.assigned_class}</td>
                              <td className="p-3">
                                <span className="font-mono bg-slate-100 px-2 py-1 rounded mr-2">{t.password}</span>
                                <button onClick={() => handleEditTeacherPassword(t.id, t.password)} className="text-xs text-blue-600 underline font-semibold">Edit</button>
                              </td>
                              <td className="p-3">
                                <button onClick={() => handleDeleteTeacher(t.id)} className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded font-bold">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* C. CLASS-WISE STUDENT DIRECTORY */}
                {showStudents && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border-2 border-blue-200">
                    {!selectedAdminClass ? (
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
                          <div>
                            <span className="text-xs font-extrabold uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                              Student Directory • Step 1
                            </span>
                            <h3 className="text-xl font-black text-slate-900 mt-2">
                              🎓 Select Class to View or Add Students
                            </h3>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <input 
                              type="text" 
                              placeholder="New Class (e.g. Class 7)" 
                              value={newClassName} 
                              onChange={(e) => setNewClassName(e.target.value)} 
                              className="border border-slate-300 px-3 py-2 rounded-xl text-xs flex-1 sm:w-52" 
                            />
                            <button onClick={handleAddClass} className="bg-blue-900 text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0">
                              + Add Class
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {allClassOptions.map((clsName, idx) => {
                            const count = students.filter(s => s.class_name === clsName).length;
                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedAdminClass(clsName)}
                                className="cursor-pointer group relative p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 bg-gradient-to-br from-white to-slate-50 hover:to-blue-50/40 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                              >
                                {/* DELETE BUTTON */}
                                <button
                                  onClick={(e) => handleDeleteClass(e, clsName)}
                                  className="absolute top-3 right-3 text-red-600 bg-red-100 hover:bg-red-200 px-2 py-0.5 rounded-lg transition text-lg font-black"
                                  title="Delete Class"
                                >
                                  ✖
                                </button>

                                <div>
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 font-black flex items-center justify-center text-sm">
                                      📚
                                    </span>
                                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-blue-900 text-white mt-1 mr-6">
                                      {count} Students
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-slate-900 text-base mt-4 group-hover:text-blue-700 transition">
                                    {clsName}
                                  </h4>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-between items-center text-xs font-bold text-blue-700">
                                  <span>Open Class List</span>
                                  <span className="group-hover:translate-x-1 transition">→</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b">
                          <div>
                            <button
                              onClick={() => setSelectedAdminClass(null)}
                              className="text-xs font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full mb-2 inline-flex items-center gap-1"
                            >
                              ← Back to All Classes
                            </button>
                            <h3 className="text-2xl font-black text-slate-900">
                              🎓 {selectedAdminClass} — Students ({classSpecificStudents.length})
                            </h3>
                          </div>
                        </div>

                        <form onSubmit={handleAddStudentToSelectedClass} className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 space-y-4">
                          <h4 className="text-sm font-extrabold text-blue-950">
                            ➕ Add New Student to <span className="underline">{selectedAdminClass}</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            <input type="text" placeholder="Student Full Name *" value={sName} onChange={e => setSName(e.target.value)} required className="border bg-white p-2.5 rounded-xl text-xs font-semibold sm:col-span-2" />
                            <input type="text" placeholder="Roll No (e.g. 101) *" value={sRoll} onChange={e => setSRoll(e.target.value)} required className="border bg-white p-2.5 rounded-xl text-xs font-semibold" />
                            <input type="text" placeholder="Section (A)" value={sSection} onChange={e => setSSection(e.target.value)} className="border bg-white p-2.5 rounded-xl text-xs" />
                            <input type="text" placeholder="Rank (1st)" value={sPosition} onChange={e => setSPosition(e.target.value)} className="border bg-white p-2.5 rounded-xl text-xs" />
                            <button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs">
                              + Add Student
                            </button>
                          </div>
                        </form>

                        {classSpecificStudents.length > 0 && (
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="border-b bg-slate-100 text-slate-700 text-xs uppercase">
                                <th className="p-3">Roll Number</th>
                                <th className="p-3">Student Name</th>
                                <th className="p-3">Section & Rank</th>
                                <th className="p-3">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {classSpecificStudents.map(s => (
                                <tr key={s.id} className="border-b">
                                  <td className="p-3">
                                    <span className="font-mono font-bold text-blue-950 bg-blue-50 px-2.5 py-1 rounded mr-2">{s.roll_number}</span>
                                    <button onClick={() => handleEditRollNumber(s.id, s.roll_number)} className="text-xs text-blue-600 underline font-semibold">Edit</button>
                                  </td>
                                  <td className="p-3 font-bold text-slate-900">{s.name}</td>
                                  <td className="p-3 text-xs">Sec-{s.section || 'A'} • 🏆 {s.position || '1st'}</td>
                                  <td className="p-3">
                                    <button onClick={() => handleDeleteStudent(s.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg font-bold">Delete</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* D. SEPARATE 6-SUBJECT RESULT MARKSHEET PAGE */}
                {showResults && renderResultMarksheetManager()}

                {/* E. ADMIN SECURITY */}
                {showSecurity && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-xs border-2 border-amber-200">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase">🔐 Admin Profile & Security</h3>
                        <span className="font-mono font-extrabold text-sm bg-blue-100 text-blue-950 px-2.5 py-1 rounded-lg">ID: {adminCode}</span>
                      </div>
                      <form onSubmit={handleSaveAdminCredentials} className="space-y-3 mt-4">
                        <input type="text" required placeholder="Create Admin Username" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full border p-2.5 rounded-xl text-sm" />
                        <input type="text" required placeholder="Set Admin Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full border p-2.5 rounded-xl text-sm" />
                        <button type="submit" disabled={savingCreds} className="w-full bg-blue-900 text-white font-bold py-2.5 rounded-xl text-sm">💾 Save Admin Credentials</button>
                      </form>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200">
                      <h3 className="text-sm font-bold text-slate-800 mb-1">👥 Make Co-Admin / Moderator</h3>
                      <div className="flex gap-2 mb-3 mt-3">
                        <input type="email" placeholder="Enter email..." value={newModEmail} onChange={(e) => setNewModEmail(e.target.value)} className="flex-1 border p-2.5 rounded-xl text-sm" />
                        <button onClick={handleAddModerator} className="bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold">+ Make Admin</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {coAdmins.map(mod => (
                          <span key={mod} className="bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-2">
                            {mod} <button onClick={() => handleRemoveModerator(mod)} className="text-red-600 font-bold">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {showNotices && (
                  <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">📢 Post Official Announcement</h3>
                    <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} className="w-full border rounded-xl p-3 text-sm" rows={2} placeholder="Write an official notice..." />
                    <button onClick={handleCreatePost} className="mt-2 bg-blue-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Post Notice</button>
                  </div>
                )}

              </div>
            );
          })()}

        </div>
      </main>
    </div>
  );
}