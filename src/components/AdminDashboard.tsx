import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  FolderTree, 
  ShieldCheck, 
  Users, 
  FileCheck2, 
  Scale, 
  Award, 
  Sparkles, 
  RotateCcw,
  CheckCircle,
  Eye,
  FileSpreadsheet,
  Layers,
  Folder
} from 'lucide-react';
import { MasterRegisterRecord, AdminStatistics, BlockName } from '../types';

interface AdminDashboardProps {
  records: MasterRegisterRecord[];
  isInitialized: boolean;
  onInitialize: () => void;
  onResetRepo: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  records,
  isInitialized,
  onInitialize,
  onResetRepo
}) => {
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState<string>('ALL');
  const [filterTower, setFilterTower] = useState<string>('ALL');
  const [filterLegalStatus, setFilterLegalStatus] = useState<string>('ALL');
  const [filterDocType, setFilterDocType] = useState<string>('ALL');

  // Preview Document Modal
  const [viewingRecord, setViewingRecord] = useState<MasterRegisterRecord | null>(null);

  // Folder Explorer Drawer/Modal State
  const [showDriveTree, setShowDriveTree] = useState(false);

  // Compute 8 Statistics Cards
  const stats: AdminStatistics = useMemo(() => {
    const uniqueMembers = new Set<string>();
    const uniqueSubmissions = new Set<string>();
    const uniqueUnits = new Set<string>();
    const venusUnits = new Set<string>();
    const jupiterUnits = new Set<string>();
    const litigants = new Set<string>();
    const registeredOwners = new Set<string>();

    records.forEach(r => {
      const memberKey = (r.email || r.mobile || r.memberName).toLowerCase().trim();
      if (memberKey) uniqueMembers.add(memberKey);
      if (r.submissionId) uniqueSubmissions.add(r.submissionId);

      if (r.unitCode) {
        uniqueUnits.add(r.unitCode);
        if (r.block === 'Venus' || r.unitCode.startsWith('V')) {
          venusUnits.add(r.unitCode);
        } else if (r.block === 'Jupiter' || r.unitCode.startsWith('J')) {
          jupiterUnits.add(r.unitCode);
        }
      }

      const statusLower = (r.legalStatus || '').toLowerCase();
      if (statusLower.includes('litigant')) litigants.add(memberKey);
      if (statusLower.includes('registered owner')) registeredOwners.add(memberKey);
    });

    return {
      totalMembers: uniqueMembers.size,
      totalSubmissions: uniqueSubmissions.size,
      totalUnits: uniqueUnits.size,
      totalDocuments: records.length,
      venusUnits: venusUnits.size,
      jupiterUnits: jupiterUnits.size,
      litigants: litigants.size,
      registeredOwners: registeredOwners.size
    };
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Search Box: supports Member name, Mobile number, Unit code, Flat number, Submission ID
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = r.memberName.toLowerCase().includes(query);
        const matchesMobile = r.mobile.includes(query);
        const matchesUnit = r.unitCode.toLowerCase().includes(query);
        const matchesFlat = r.flat.includes(query);
        const matchesSubId = r.submissionId.toLowerCase().includes(query);
        const matchesDocType = r.documentType.toLowerCase().includes(query);

        if (!matchesName && !matchesMobile && !matchesUnit && !matchesFlat && !matchesSubId && !matchesDocType) {
          return false;
        }
      }

      // Filter Block
      if (filterBlock !== 'ALL' && r.block !== filterBlock) return false;

      // Filter Tower
      if (filterTower !== 'ALL' && r.tower !== filterTower) return false;

      // Filter Legal Status
      if (filterLegalStatus !== 'ALL' && !r.legalStatus.includes(filterLegalStatus)) return false;

      // Filter Doc Type
      if (filterDocType !== 'ALL' && r.documentType !== filterDocType) return false;

      return true;
    });
  }, [records, searchTerm, filterBlock, filterTower, filterLegalStatus, filterDocType]);

  // Export to CSV handler
  const handleExportCsv = () => {
    const headers = [
      'Submission ID',
      'Upload Timestamp',
      'Member Name',
      'Mobile',
      'Email',
      'Legal Status',
      'Block',
      'Tower',
      'Floor',
      'Flat',
      'Unit Code',
      'Document Type',
      'Remarks',
      'Original Filename',
      'Stored Filename',
      'Google Drive File ID',
      'Google Drive Link'
    ];

    const rows = records.map(r => [
      r.submissionId,
      r.uploadTimestamp,
      `"${r.memberName.replace(/"/g, '""')}"`,
      r.mobile,
      r.email,
      `"${r.legalStatus.replace(/"/g, '""')}"`,
      r.block,
      r.tower,
      r.floor,
      r.flat,
      r.unitCode,
      `"${r.documentType.replace(/"/g, '""')}"`,
      `"${(r.remarks || '').replace(/"/g, '""')}"`,
      `"${r.originalFilename.replace(/"/g, '""')}"`,
      `"${r.storedFilename.replace(/"/g, '""')}"`,
      r.driveFileId,
      r.driveLink
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skyview_Master_Register_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // If Not Initialized, show the requested First-Run Experience screen
  if (!isInitialized) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-lg text-center">
          <div className="w-16 h-16 bg-teal-50 text-[#0F766E] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-teal-200 shadow-sm">
            <FolderTree className="w-9 h-9" />
          </div>

          <span className="text-xs uppercase font-mono font-bold tracking-widest text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 inline-block mb-3">
            First-Run Setup Experience
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Initialize Skyview Repository
          </h1>

          <p className="text-sm text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
            No repository has been detected yet in Google Drive for <strong>skyviewaobg26@gmail.com</strong>.
            Click below to automatically construct the complete folder architecture, block towers, court proceeding directories, and the Master Register spreadsheet with its hidden Settings store.
          </p>

          {/* Drive Structure Visualization */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 text-left font-mono text-xs max-w-lg mx-auto mb-8 shadow-inner overflow-x-auto leading-relaxed border border-slate-800">
            <div className="text-teal-400 font-bold mb-2 flex items-center gap-2">
              <Folder className="w-4 h-4" /> Skyview Legal Repository (Root)
            </div>
            <div className="pl-4 text-slate-300">
              ├── 📁 Block Venus<br />
              │&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower A<br />
              │&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower B<br />
              │&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower C<br />
              │&nbsp;&nbsp;&nbsp;&nbsp;└── 📁 Tower D<br />
              ├── 📁 Block Jupiter<br />
              │&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower A<br />
              │&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower B<br />
              │&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower C<br />
              │&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower D<br />
              │&nbsp;&nbsp;&nbsp;&nbsp;└── 📁 Tower E<br />
              ├── 📁 Association Documents<br />
              ├── 📁 Court Proceedings<br />
              └── 📊 Skyview Master Register.xlsx (Sheet: Register + Hidden: Settings)
            </div>
          </div>

          <button
            type="button"
            onClick={onInitialize}
            className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-teal-700/20 transition-all inline-flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <span>Initialize Skyview Repository</span>
          </button>

          <p className="text-xs text-slate-400 mt-4">
            Generates root folder, 9 tower folders, 2 legal folders, and spreadsheet ID mappings without hardcoding.
          </p>
        </div>
      </div>
    );
  }

  // Initialized Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Administrator Console
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Owner: <strong>skyviewaobg26@gmail.com</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Skyview AOBG26 Legal Repository Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowDriveTree(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-300 transition-colors inline-flex items-center gap-1.5"
            >
              <FolderTree className="w-4 h-4 text-teal-700" />
              <span>Drive Tree</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onResetRepo}
              className="bg-white hover:bg-slate-50 text-slate-500 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 transition-colors inline-flex items-center gap-1"
              title="Reset repository to uninitialized state to test First Run setup"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Setup</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Members</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{stats.totalMembers}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Submissions</span>
            <FileCheck2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{stats.totalSubmissions}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Units</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{stats.totalUnits}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Documents</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{stats.totalDocuments}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Venus Units</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{stats.venusUnits}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Jupiter Units</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{stats.jupiterUnits}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Litigants</span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{stats.litigants}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Reg. Owners</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.registeredOwners}</div>
        </div>
      </div>

      {/* Main Search & Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header & Filter Toolbar */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-700" />
                <span>Skyview Master Register & Legal Index</span>
              </h2>
              <p className="text-xs text-slate-500">
                Live index of all documents uploaded by allottees, buyers, and litigants
              </p>
            </div>

            <span className="text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full self-start sm:self-auto">
              {filteredRecords.length} / {records.length} records matching
            </span>
          </div>

          {/* Instant Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Member Name, Mobile, Unit Code (e.g. VA-1204), Flat (04), or Submission ID..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
            />
          </div>

          {/* Multi-Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Block
              </label>
              <select
                value={filterBlock}
                onChange={e => setFilterBlock(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="ALL">All Blocks</option>
                <option value="Venus">Venus</option>
                <option value="Jupiter">Jupiter</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Tower
              </label>
              <select
                value={filterTower}
                onChange={e => setFilterTower(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="ALL">All Towers</option>
                <option value="A">Tower A</option>
                <option value="B">Tower B</option>
                <option value="C">Tower C</option>
                <option value="D">Tower D</option>
                <option value="E">Tower E</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Legal Status
              </label>
              <select
                value={filterLegalStatus}
                onChange={e => setFilterLegalStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="Litigant">Litigant</option>
                <option value="Registered Owner">Registered Owner</option>
                <option value="Allottee">Allottee</option>
                <option value="Prospective Buyer">Prospective Buyer</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Document Type
              </label>
              <select
                value={filterDocType}
                onChange={e => setFilterDocType(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="ALL">All Document Types</option>
                <option value="Allotment Letter">Allotment Letter</option>
                <option value="Builder Buyer Agreement">Builder Buyer Agreement</option>
                <option value="Payment Receipt">Payment Receipt</option>
                <option value="Consumer Forum Order">Consumer Forum Order</option>
                <option value="Execution Petition">Execution Petition</option>
                <option value="RERA Order">RERA Order</option>
                <option value="Absolute Sale Deed">Absolute Sale Deed</option>
                <option value="Encumbrance Certificate">Encumbrance Certificate</option>
                <option value="Possession Letter">Possession Letter</option>
                <option value="Khata">Khata</option>
                <option value="Legal Notice">Legal Notice</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Master Register Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Unit Code</th>
                <th className="px-4 py-3.5">Member Details</th>
                <th className="px-4 py-3.5">Legal Status</th>
                <th className="px-4 py-3.5">Document Type</th>
                <th className="px-4 py-3.5">Submission ID</th>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Stored Filename</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No documents match your query or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold bg-[#0F766E]/10 text-[#0F766E] px-2 py-0.5 rounded border border-[#0F766E]/20">
                        {r.unitCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{r.memberName}</div>
                      <div className="text-[11px] text-slate-500">{r.mobile}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-slate-600 block max-w-xs truncate">
                        {r.legalStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{r.documentType}</div>
                      {r.remarks && (
                        <div className="text-[10px] text-slate-400 italic truncate max-w-xs">
                          {r.remarks}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {r.submissionId}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {r.uploadTimestamp}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-teal-800 max-w-[200px] truncate">
                      {r.storedFilename}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setViewingRecord(r)}
                        className="bg-slate-100 hover:bg-teal-50 text-teal-700 border border-slate-300 hover:border-teal-300 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document View / Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-slate-800 text-base">
                  Document Details & Drive Reference
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Unit Code:</span>
                  <span className="font-mono font-bold text-teal-700">{viewingRecord.unitCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Member:</span>
                  <span className="font-semibold">{viewingRecord.memberName} ({viewingRecord.mobile})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Document Type:</span>
                  <span className="font-semibold">{viewingRecord.documentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submission ID:</span>
                  <span className="font-mono">{viewingRecord.submissionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Original File:</span>
                  <span className="text-slate-700">{viewingRecord.originalFilename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stored Filename:</span>
                  <span className="font-mono text-teal-800">{viewingRecord.storedFilename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Drive Path:</span>
                  <span className="font-mono text-slate-600">
                    Skyview Legal Repository / Block {viewingRecord.block} / Tower {viewingRecord.tower} / {viewingRecord.unitCode}
                  </span>
                </div>
              </div>

              {viewingRecord.remarks && (
                <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-lg text-teal-900">
                  <span className="font-bold">Remarks:</span> {viewingRecord.remarks}
                </div>
              )}

              {/* Direct Drive link simulated action */}
              <div className="pt-2 flex justify-end gap-2">
                <a
                  href={viewingRecord.driveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0F766E] hover:bg-[#0D655E] text-white px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Drive File</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drive Hierarchy Visualizer Modal */}
      {showDriveTree && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-slate-800 text-base">
                  Google Drive Folder Hierarchy Simulator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDriveTree(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Here is how documents and unit folders are mapped under the Association's Google Drive account (<strong>skyviewaobg26@gmail.com</strong>):
            </p>

            <div className="bg-slate-900 text-slate-100 rounded-xl p-5 text-left font-mono text-xs max-h-96 overflow-y-auto leading-relaxed border border-slate-800">
              <div className="text-teal-400 font-bold mb-1">
                📁 Skyview Legal Repository (Root Folder ID: root_skyview_01)
              </div>
              <div className="pl-4 text-slate-300 space-y-1">
                <div>├── 📁 Block Venus</div>
                <div className="pl-4 text-slate-400">
                  <div>├── 📁 Tower A</div>
                  {records.filter(r => r.block === 'Venus' && r.tower === 'A').length > 0 ? (
                    records.filter(r => r.block === 'Venus' && r.tower === 'A').map((r, idx) => (
                      <div key={idx} className="pl-6 text-teal-300">
                        └── 📁 {r.unitCode} &gt; 📄 {r.storedFilename}
                      </div>
                    ))
                  ) : (
                    <div className="pl-6 text-slate-600 italic">└── (Unit folders auto-created upon upload)</div>
                  )}
                  <div>├── 📁 Tower B</div>
                  <div>├── 📁 Tower C</div>
                  <div>└── 📁 Tower D</div>
                </div>
                <div>├── 📁 Block Jupiter</div>
                <div className="pl-4 text-slate-400">
                  <div>├── 📁 Tower A</div>
                  <div>├── 📁 Tower B</div>
                  <div>├── 📁 Tower C</div>
                  {records.filter(r => r.block === 'Jupiter' && r.tower === 'C').length > 0 ? (
                    records.filter(r => r.block === 'Jupiter' && r.tower === 'C').map((r, idx) => (
                      <div key={idx} className="pl-6 text-teal-300">
                        └── 📁 {r.unitCode} &gt; 📄 {r.storedFilename}
                      </div>
                    ))
                  ) : (
                    <div className="pl-6 text-slate-600 italic">└── (Unit folders auto-created upon upload)</div>
                  )}
                  <div>├── 📁 Tower D</div>
                  <div>└── 📁 Tower E</div>
                </div>
                <div>├── 📁 Association Documents</div>
                <div>├── 📁 Court Proceedings</div>
                <div className="text-emerald-400 font-semibold">
                  └── 📊 Skyview Master Register (Spreadsheet + Hidden Settings Sheet)
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDriveTree(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Close Explorer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
