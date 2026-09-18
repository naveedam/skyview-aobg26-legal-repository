import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Plus, 
  Trash2, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  FileCheck,
  ShieldAlert,
  FolderTree
} from 'lucide-react';
import { 
  LegalStatus, 
  BlockName, 
  DocumentType, 
  UnitSubmissionItem, 
  UploadedFileMeta, 
  MasterRegisterRecord 
} from '../types';

interface MemberPortalProps {
  onNewSubmission: (records: MasterRegisterRecord[], submissionId: string) => void;
  nextSubmissionCounter: number;
}

const LEGAL_STATUS_OPTIONS: LegalStatus[] = [
  'Allottee',
  'Prospective Buyer',
  'Litigant',
  'Registered Owner'
];

const DOCUMENT_TYPES: DocumentType[] = [
  'Allotment Letter',
  'Builder Buyer Agreement',
  'Payment Receipt',
  'Consumer Forum Order',
  'Execution Petition',
  'RERA Order',
  'Absolute Sale Deed',
  'Encumbrance Certificate',
  'Possession Letter',
  'Khata',
  'Legal Notice',
  'Other'
];

const FLOORS = Array.from({ length: 26 }, (_, i) => i.toString().padStart(2, '0'));
const FLATS = ['01', '02', '03', '04'];

export const MemberPortal: React.FC<MemberPortalProps> = ({ onNewSubmission, nextSubmissionCounter }) => {
  // Member Details State
  const [memberName, setMemberName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [legalStatuses, setLegalStatuses] = useState<LegalStatus[]>([]);

  // Repeating Units State
  const [units, setUnits] = useState<UnitSubmissionItem[]>([
    {
      id: 'unit_init_1',
      block: 'Venus',
      tower: 'A',
      floor: '12',
      flat: '04',
      unitCode: 'VA-1204',
      documentType: 'Consumer Forum Order',
      remarks: 'CC 142/2021 Final Execution Order',
      files: []
    }
  ]);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState('');
  const [receiptModal, setReceiptModal] = useState<{
    submissionId: string;
    memberName: string;
    timestamp: string;
    unitsCount: number;
    docsCount: number;
    files: { unitCode: string; storedFilename: string; docType: string }[];
  } | null>(null);

  // Form Validation errors
  const [errors, setErrors] = useState<string[]>([]);

  // Format internal unit code
  const computeUnitCode = (block: BlockName, tower: string, floor: string, flat: string) => {
    const prefix = block === 'Jupiter' ? 'J' : 'V';
    const cleanTower = (tower || 'A').toUpperCase();
    const fl = floor.padStart(2, '0');
    const ft = flat.padStart(2, '0');
    return `${prefix}${cleanTower}-${fl}${ft}`;
  };

  // Standardized file name generator
  const getStandardFilename = (
    block: BlockName, 
    tower: string, 
    unitCode: string, 
    docType: DocumentType, 
    seq: number, 
    origName: string
  ) => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const cleanUnit = unitCode.replace('-', '');
    const cleanDoc = docType.replace(/[^a-zA-Z0-9]/g, '');
    const ext = origName.includes('.') ? origName.slice(origName.lastIndexOf('.')).toLowerCase() : '.pdf';
    const seqStr = seq.toString().padStart(2, '0');
    return `${block}_${tower}_${cleanUnit}_${cleanDoc}_${dateStr}_${seqStr}${ext}`;
  };

  // Add new unit card
  const handleAddUnit = () => {
    const newId = 'unit_' + Date.now();
    setUnits(prev => [
      ...prev,
      {
        id: newId,
        block: 'Venus',
        tower: 'A',
        floor: '00',
        flat: '01',
        unitCode: 'VA-0001',
        documentType: 'Allotment Letter',
        remarks: '',
        files: []
      }
    ]);
  };

  // Remove unit card
  const handleRemoveUnit = (id: string) => {
    if (units.length <= 1) return;
    setUnits(prev => prev.filter(u => u.id !== id));
  };

  // Update unit property
  const handleUpdateUnit = (id: string, updates: Partial<UnitSubmissionItem>) => {
    setUnits(prev => prev.map(u => {
      if (u.id !== id) return u;
      const updated = { ...u, ...updates };
      // If block changed and tower is invalid for Venus, default to 'A'
      if (updates.block === 'Venus' && updated.tower === 'E') {
        updated.tower = 'A';
      }
      updated.unitCode = computeUnitCode(updated.block, updated.tower, updated.floor, updated.flat);
      return updated;
    }));
  };

  // Toggle legal status checkbox
  const handleToggleLegalStatus = (status: LegalStatus) => {
    setLegalStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  // File Upload handler per unit
  const handleFilesSelect = (unitId: string, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
    const newFiles: UploadedFileMeta[] = [];

    Array.from(fileList).forEach((file, index) => {
      const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
      if (!validExtensions.includes(ext)) {
        alert(`File "${file.name}" has an unsupported format. Allowed formats: PDF, JPG, JPEG, PNG.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        alert(`File "${file.name}" exceeds the 25 MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setUnits(currentUnits => currentUnits.map(u => {
          if (u.id !== unitId) return u;
          const seqIndex = u.files.length + 1;
          const stdName = getStandardFilename(u.block, u.tower, u.unitCode, u.documentType, seqIndex, file.name);
          const fileMeta: UploadedFileMeta = {
            id: 'file_' + Date.now() + '_' + index,
            name: file.name,
            size: file.size,
            type: file.type || 'application/pdf',
            dataUrl: reader.result as string,
            standardizedFilename: stdName
          };
          return {
            ...u,
            files: [...u.files, fileMeta]
          };
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove file from a unit
  const handleRemoveFile = (unitId: string, fileId: string) => {
    setUnits(prev => prev.map(u => {
      if (u.id !== unitId) return u;
      return {
        ...u,
        files: u.files.filter(f => f.id !== fileId)
      };
    }));
  };

  // Preload Sample Data (Naveed Ahmed - Venus A 1204 & Jupiter C 0802)
  const handleLoadSampleData = () => {
    setMemberName('Naveed Ahmed');
    setMobile('+91 9876543210');
    setEmail('naveedahmed0625@gmail.com');
    setLegalStatuses(['Litigant', 'Registered Owner']);
    
    // Sample mock PDF base64
    const sampleDataUrl = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr...';

    setUnits([
      {
        id: 'unit_sample_1',
        block: 'Venus',
        tower: 'A',
        floor: '12',
        flat: '04',
        unitCode: 'VA-1204',
        documentType: 'Consumer Forum Order',
        remarks: 'Consumer Case CC/142/2021 Final Decree',
        files: [
          {
            id: 'file_s_1',
            name: 'Consumer_Forum_Order_CC142.pdf',
            size: 1.8 * 1024 * 1024,
            type: 'application/pdf',
            dataUrl: sampleDataUrl,
            standardizedFilename: 'Venus_A_VA1204_ConsumerForumOrder_20260918_01.pdf'
          }
        ]
      },
      {
        id: 'unit_sample_2',
        block: 'Jupiter',
        tower: 'C',
        floor: '08',
        flat: '02',
        unitCode: 'JC-0802',
        documentType: 'Builder Buyer Agreement',
        remarks: 'Stamped & Executed Agreement dated 14/03/2018',
        files: [
          {
            id: 'file_s_2',
            name: 'BBA_Signed_Copy.pdf',
            size: 4.2 * 1024 * 1024,
            type: 'application/pdf',
            dataUrl: sampleDataUrl,
            standardizedFilename: 'Jupiter_C_JC0802_BuilderBuyerAgreement_20260918_01.pdf'
          }
        ]
      }
    ]);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    if (!memberName.trim()) validationErrors.push('Member Full Name is required.');
    if (!mobile.trim()) validationErrors.push('Mobile Number is required.');
    if (!email.trim()) validationErrors.push('Email Address is required.');
    if (legalStatuses.length === 0) validationErrors.push('Select at least one Legal Status.');

    const totalFilesCount = units.reduce((acc, u) => acc + u.files.length, 0);
    if (totalFilesCount === 0) {
      validationErrors.push('Please upload at least one document for your unit(s).');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);
    setIsSubmitting(true);
    setSubmissionProgress('Creating standardized folder hierarchy in Google Drive...');

    // Generate Submission ID e.g. SV-SUB-000001
    const submissionId = `SV-SUB-${nextSubmissionCounter.toString().padStart(6, '0')}`;
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Simulate multi-step Google Apps Script / Drive process
    await new Promise(r => setTimeout(r, 600));
    setSubmissionProgress('Writing files to Drive and generating Master Register rows...');
    await new Promise(r => setTimeout(r, 700));

    const records: MasterRegisterRecord[] = [];
    const summaryFiles: { unitCode: string; storedFilename: string; docType: string }[] = [];

    units.forEach(u => {
      u.files.forEach((f, idx) => {
        const stdName = getStandardFilename(u.block, u.tower, u.unitCode, u.documentType, idx + 1, f.name);
        const driveFileId = `drive_file_${Math.random().toString(36).substring(2, 11)}`;
        const driveLink = `https://drive.google.com/file/d/${driveFileId}/view`;

        records.push({
          submissionId,
          uploadTimestamp: timestamp,
          memberName,
          mobile,
          email,
          legalStatus: legalStatuses.join(', '),
          block: u.block,
          tower: u.tower,
          floor: u.floor,
          flat: u.flat,
          unitCode: u.unitCode,
          documentType: u.documentType,
          remarks: u.remarks,
          originalFilename: f.name,
          storedFilename: stdName,
          driveFileId,
          driveLink,
          fileDataUrl: f.dataUrl,
          fileSize: f.size
        });

        summaryFiles.push({
          unitCode: u.unitCode,
          storedFilename: stdName,
          docType: u.documentType
        });
      });
    });

    onNewSubmission(records, submissionId);

    setIsSubmitting(false);
    setReceiptModal({
      submissionId,
      memberName,
      timestamp,
      unitsCount: units.length,
      docsCount: records.length,
      files: summaryFiles
    });
  };

  const handleReset = () => {
    setReceiptModal(null);
    setMemberName('');
    setMobile('');
    setEmail('');
    setLegalStatuses([]);
    setUnits([
      {
        id: 'unit_new_1',
        block: 'Venus',
        tower: 'A',
        floor: '00',
        flat: '01',
        unitCode: 'VA-0001',
        documentType: 'Allotment Letter',
        remarks: '',
        files: []
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Association Header Card */}
      <div className="bg-gradient-to-br from-[#0F766E] to-[#115E59] rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 border border-white/30 text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full">
              Member Upload Portal
            </span>
            <span className="text-xs bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-3 py-0.5 rounded-full font-mono">
              Skyview AOBG26
            </span>
          </div>

          <button
            type="button"
            onClick={handleLoadSampleData}
            className="text-xs font-semibold bg-white/15 hover:bg-white/25 border border-white/30 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            title="Auto-fill sample multi-unit member submission"
          >
            <span>⚡ Load Naveed Ahmed Test Data</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Skyview AOBG26 Legal Repository
        </h1>
        <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-2xl">
          Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
        </p>

        <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center gap-6 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-emerald-300" />
            <span>Auto-organizes Drive by Block & Tower</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-300" />
            <span>Private Association Google Drive Storage</span>
          </div>
        </div>
      </div>

      {/* Validation Errors Notice */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 text-sm">Please correct the following:</h4>
            <ul className="list-disc list-inside text-xs text-red-700 mt-1 space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Member Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 font-bold text-sm flex items-center justify-center border border-teal-200">
                1
              </span>
              <h2 className="text-lg font-bold text-slate-800">Member Details</h2>
            </div>
            <span className="text-xs text-slate-500">* All fields required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={memberName}
                onChange={e => setMemberName(e.target.value)}
                placeholder="e.g. Naveed Ahmed"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">As recorded on property papers</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">For official legal notices</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. naveed@example.com"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Submission receipt will be sent here</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Legal Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 font-bold text-sm flex items-center justify-center border border-teal-200">
                2
              </span>
              <h2 className="text-lg font-bold text-slate-800">Legal Status</h2>
            </div>
            <span className="text-xs text-slate-500">Multiple selection allowed</span>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Select all categories applicable to you. You may select more than one (e.g. <em>Litigant</em> and <em>Registered Owner</em>):
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {LEGAL_STATUS_OPTIONS.map(status => {
              const isChecked = legalStatuses.includes(status);
              return (
                <label
                  key={status}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none ${
                    isChecked 
                      ? 'border-teal-600 bg-teal-50/70 text-teal-900 shadow-sm ring-1 ring-teal-600/20' 
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleLegalStatus(status)}
                    className="w-4 h-4 rounded text-teal-700 accent-teal-700 focus:ring-teal-600"
                  />
                  <span className="text-xs font-semibold">{status}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* SECTION 3 & 4: Property Units & Documents */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 font-bold text-sm flex items-center justify-center border border-teal-200">
                3
              </span>
              <h2 className="text-lg font-bold text-slate-800">Property Units & Legal Documents</h2>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
              {units.length} Unit{units.length > 1 ? 's' : ''} added
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            A member may own multiple apartments. Add as many Unit Cards as needed. Unit codes (e.g., <strong>VA-1204</strong>) and target Drive folders are automatically generated.
          </p>

          {/* Unit Cards List */}
          <div className="space-y-6">
            {units.map((unit, index) => {
              const towers = unit.block === 'Venus' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E'];
              return (
                <div key={unit.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  {/* Card Header */}
                  <div className="bg-slate-100/90 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-800">
                        Property Unit #{index + 1}
                      </span>
                      <span className="bg-[#0F766E] text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full tracking-wide shadow-sm">
                        {unit.unitCode}
                      </span>
                    </div>

                    {units.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveUnit(unit.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-md border border-red-200 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Unit</span>
                      </button>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-6">
                    {/* Unit Spec Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Block */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Block <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={unit.block}
                          onChange={e => handleUpdateUnit(unit.id, { block: e.target.value as BlockName })}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                        >
                          <option value="Venus">Venus</option>
                          <option value="Jupiter">Jupiter</option>
                        </select>
                      </div>

                      {/* Tower */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tower <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={unit.tower}
                          onChange={e => handleUpdateUnit(unit.id, { tower: e.target.value })}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                        >
                          {towers.map(t => (
                            <option key={t} value={t}>Tower {t}</option>
                          ))}
                        </select>
                      </div>

                      {/* Floor */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Floor <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={unit.floor}
                          onChange={e => handleUpdateUnit(unit.id, { floor: e.target.value })}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                        >
                          {FLOORS.map(fl => (
                            <option key={fl} value={fl}>{fl}</option>
                          ))}
                        </select>
                      </div>

                      {/* Flat Number */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Flat Number <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={unit.flat}
                          onChange={e => handleUpdateUnit(unit.id, { flat: e.target.value })}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                        >
                          {FLATS.map(ft => (
                            <option key={ft} value={ft}>{ft}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Document Upload Area */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Unit Legal Documents
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Drive Path: Block {unit.block} &gt; Tower {unit.tower} &gt; {unit.unitCode}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Document Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={unit.documentType}
                            onChange={e => handleUpdateUnit(unit.id, { documentType: e.target.value as DocumentType })}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                          >
                            {DOCUMENT_TYPES.map(doc => (
                              <option key={doc} value={doc}>{doc}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Remarks <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={unit.remarks}
                            onChange={e => handleUpdateUnit(unit.id, { remarks: e.target.value })}
                            placeholder="e.g. Registered in 2021, Stamp Duty Paid"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                          />
                        </div>
                      </div>

                      {/* File Picker & Dropzone */}
                      <label className="border-2 border-dashed border-slate-300 hover:border-teal-600 bg-slate-50/50 hover:bg-teal-50/30 rounded-xl p-5 text-center cursor-pointer transition-colors block">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={e => handleFilesSelect(unit.id, e.target.files)}
                        />
                        <UploadCloud className="w-8 h-8 text-teal-600 mx-auto mb-1.5" />
                        <span className="text-xs font-semibold text-slate-800 block">
                          Click to Browse or Drag & Drop Documents Here
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Accepted: PDF, JPG, JPEG, PNG (Up to 25 MB each) • Multiple files supported
                        </span>
                      </label>

                      {/* Uploaded Files Preview List */}
                      {unit.files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Attached Files ({unit.files.length}):
                          </span>
                          {unit.files.map((file, fIdx) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            >
                              <div className="overflow-hidden pr-3">
                                <div className="font-semibold text-slate-800 truncate">
                                  {file.name}
                                </div>
                                <div className="font-mono text-[11px] text-teal-700 truncate">
                                  ↳ {file.standardizedFilename}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {unit.documentType}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveFile(unit.id, file.id)}
                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors shrink-0"
                                title="Remove file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Another Unit Button */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-start">
            <button
              type="button"
              onClick={handleAddUnit}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg border border-slate-300 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Property Unit</span>
            </button>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Documents are stored directly into Association Drive under respective Unit folders.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{submissionProgress}</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Submit Legal Documents to Repository</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Submission Success Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center mb-1">
              Documents Secured Successfully
            </h3>
            <p className="text-xs text-slate-500 text-center mb-6">
              Your legal records have been registered in the Skyview Master Register and uploaded to your Unit Drive folder.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5 mb-6">
              <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500">Submission ID</span>
                <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {receiptModal.submissionId}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500">Member Name</span>
                <span className="font-semibold text-slate-800">{receiptModal.memberName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500">Timestamp</span>
                <span className="text-slate-600">{receiptModal.timestamp}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500">Units Recorded</span>
                <span className="font-semibold text-slate-800">{receiptModal.unitsCount} Unit(s)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Documents Indexed</span>
                <span className="font-semibold text-teal-700">{receiptModal.docsCount} Document(s)</span>
              </div>
            </div>

            <div className="mb-6 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 space-y-1.5 text-[11px]">
              <span className="font-semibold text-slate-600 block">Stored Drive Filenames:</span>
              {receiptModal.files.map((f, i) => (
                <div key={i} className="font-mono text-teal-800 truncate">
                  [{f.unitCode}] {f.storedFilename}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="w-full bg-[#0F766E] hover:bg-[#0D655E] text-white font-semibold text-sm py-2.5 px-6 rounded-xl transition-colors"
              >
                Done / New Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
