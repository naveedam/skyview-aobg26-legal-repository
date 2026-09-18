import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Code2, 
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { MemberPortal } from './components/MemberPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminSetupScreen } from './components/AdminSetupScreen';
import { GasCodeHub } from './components/GasCodeHub';
import { MasterRegisterRecord } from './types';

// Default Seed Records (including Naveed Ahmed test case)
const INITIAL_SEED_RECORDS: MasterRegisterRecord[] = [
  {
    submissionId: 'SV-SUB-000001',
    uploadTimestamp: '2026-09-18 10:15:30',
    memberName: 'Naveed Ahmed',
    mobile: '+91 9876543210',
    email: 'naveedahmed0625@gmail.com',
    legalStatus: 'Litigant, Registered Owner',
    block: 'Venus',
    tower: 'A',
    floor: '12',
    flat: '04',
    unitCode: 'VA-1204',
    documentType: 'Consumer Forum Order',
    remarks: 'CC 142/2021 Final Execution Order with compensation award',
    originalFilename: 'Consumer_Forum_Decree_CC142.pdf',
    storedFilename: 'Venus_A_VA1204_ConsumerForumOrder_20260918_01.pdf',
    driveFileId: 'drive_file_naveed_01',
    driveLink: 'https://drive.google.com/file/d/drive_file_naveed_01/view',
    fileSize: 2.1 * 1024 * 1024
  },
  {
    submissionId: 'SV-SUB-000001',
    uploadTimestamp: '2026-09-18 10:15:30',
    memberName: 'Naveed Ahmed',
    mobile: '+91 9876543210',
    email: 'naveedahmed0625@gmail.com',
    legalStatus: 'Litigant, Registered Owner',
    block: 'Jupiter',
    tower: 'C',
    floor: '08',
    flat: '02',
    unitCode: 'JC-0802',
    documentType: 'Builder Buyer Agreement',
    remarks: 'Original stamped agreement signed with Developer',
    originalFilename: 'BBA_Signed_2018.pdf',
    storedFilename: 'Jupiter_C_JC0802_BuilderBuyerAgreement_20260918_01.pdf',
    driveFileId: 'drive_file_naveed_02',
    driveLink: 'https://drive.google.com/file/d/drive_file_naveed_02/view',
    fileSize: 4.8 * 1024 * 1024
  },
  {
    submissionId: 'SV-SUB-000002',
    uploadTimestamp: '2026-09-18 11:30:12',
    memberName: 'Priya Sundaram',
    mobile: '+91 9845012345',
    email: 'priya.sundaram@example.com',
    legalStatus: 'Allottee, Litigant',
    block: 'Venus',
    tower: 'B',
    floor: '15',
    flat: '01',
    unitCode: 'VB-1501',
    documentType: 'RERA Order',
    remarks: 'Karnataka RERA Complaint CMP/1049/2020 direction order',
    originalFilename: 'RERA_Complaint_Order.pdf',
    storedFilename: 'Venus_B_VB1501_RERAOrder_20260918_01.pdf',
    driveFileId: 'drive_file_priya_01',
    driveLink: 'https://drive.google.com/file/d/drive_file_priya_01/view',
    fileSize: 1.5 * 1024 * 1024
  },
  {
    submissionId: 'SV-SUB-000003',
    uploadTimestamp: '2026-09-18 14:05:45',
    memberName: 'Rajesh K. Sharma',
    mobile: '+91 9711223344',
    email: 'sharma.rajesh@example.com',
    legalStatus: 'Registered Owner',
    block: 'Jupiter',
    tower: 'E',
    floor: '04',
    flat: '03',
    unitCode: 'JE-0403',
    documentType: 'Absolute Sale Deed',
    remarks: 'Registered Sale Deed with Sub-Registrar Bommanahalli',
    originalFilename: 'Sale_Deed_Registered.pdf',
    storedFilename: 'Jupiter_E_JE0403_AbsoluteSaleDeed_20260918_01.pdf',
    driveFileId: 'drive_file_rajesh_01',
    driveLink: 'https://drive.google.com/file/d/drive_file_rajesh_01/view',
    fileSize: 6.2 * 1024 * 1024
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'portal' | 'admin' | 'gas_hub'>('portal');
  
  // Local persistence for simulation
  const [records, setRecords] = useState<MasterRegisterRecord[]>(() => {
    try {
      const saved = localStorage.getItem('skyview_master_register');
      return saved ? JSON.parse(saved) : INITIAL_SEED_RECORDS;
    } catch {
      return INITIAL_SEED_RECORDS;
    }
  });

  const [justInitializedNotice, setJustInitializedNotice] = useState<boolean>(false);

  // First-run detection: defaults to false if never initialized so user experiences setup screen
  const [isInitialized, setIsInitialized] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('skyview_repo_initialized');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [submissionCounter, setSubmissionCounter] = useState<number>(() => {
    return records.length > 0 ? records.length + 1 : 1;
  });

  useEffect(() => {
    try {
      localStorage.setItem('skyview_master_register', JSON.stringify(records));
      localStorage.setItem('skyview_repo_initialized', JSON.stringify(isInitialized));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [records, isInitialized]);

  // Handle new submission from Member Portal
  const handleNewSubmission = (newRecords: MasterRegisterRecord[], submissionId: string) => {
    setRecords(prev => [...newRecords, ...prev]);
    setSubmissionCounter(prev => prev + 1);
  };

  // Handle Repository Initialization from Setup Screen
  const handleInitializeRepo = () => {
    setIsInitialized(true);
    // After successful initialization, automatically redirect to the Member Portal
    setActiveTab('portal');
    setJustInitializedNotice(true);
    setTimeout(() => {
      setJustInitializedNotice(false);
    }, 6000);
  };

  const handleResetRepo = () => {
    setIsInitialized(false);
    try {
      localStorage.removeItem('skyview_repo_initialized');
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center font-bold text-white tracking-wider shadow-xs">
              SV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight leading-tight">
                  Skyview AOBG26 Legal Repository
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-bold bg-white/20 border border-white/30 px-2 py-0.5 rounded-full">
                  {isInitialized ? 'Production Ready' : 'Setup Required'}
                </span>
              </div>
              <p className="text-[11px] text-teal-100/90 leading-tight">
                Skyview Allottees cum Prospective Buyers &amp; Litigants' Welfare Association
              </p>
            </div>
          </div>

          {/* Navigation / Switcher */}
          <div className="flex items-center gap-2">
            {isInitialized ? (
              <div className="flex items-center bg-black/20 p-1 rounded-xl border border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('portal')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'portal' 
                      ? 'bg-white text-teal-900 shadow-xs font-bold' 
                      : 'text-teal-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Member Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'admin' 
                      ? 'bg-white text-teal-900 shadow-xs font-bold' 
                      : 'text-teal-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('gas_hub')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'gas_hub' 
                      ? 'bg-white text-teal-900 shadow-xs font-bold' 
                      : 'text-teal-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Apps Script Code (11 Files)</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-teal-100 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                  ⚙️ First-Run Setup Mode
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('gas_hub')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                    activeTab === 'gas_hub' 
                      ? 'bg-white text-teal-900 shadow-xs font-bold' 
                      : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>View Script Code</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Success Notification Banner after Initialization */}
      {justInitializedNotice && (
        <div className="bg-emerald-600 text-white text-xs sm:text-sm font-semibold py-3 px-4 shadow-sm flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>
            Repository initialized successfully! All Drive folders, Tower directories, and Master Register with hidden Settings have been created. Welcome to the Member Portal.
          </span>
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1">
        {/* On application load, if not initialized, display Administrator Setup screen instead of Member Portal */}
        {!isInitialized && activeTab !== 'gas_hub' ? (
          <AdminSetupScreen onInitialize={handleInitializeRepo} />
        ) : (
          <>
            {activeTab === 'portal' && (
              <MemberPortal 
                onNewSubmission={handleNewSubmission}
                nextSubmissionCounter={submissionCounter}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard 
                records={records}
                isInitialized={isInitialized}
                onInitialize={handleInitializeRepo}
                onResetRepo={handleResetRepo}
              />
            )}

            {activeTab === 'gas_hub' && (
              <GasCodeHub />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Skyview Allottees cum Prospective Buyers &amp; Litigants' Welfare Association
          </span>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Admin: <strong>skyviewaobg26@gmail.com</strong></span>
            <span>•</span>
            <span>Stack: Google Apps Script + Drive + Sheets</span>
            {isInitialized && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleResetRepo}
                  className="text-amber-600 hover:text-amber-800 underline cursor-pointer flex items-center gap-1 font-sans"
                  title="Simulate uninitialized first-run state again"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Setup (Test First-Run)</span>
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
