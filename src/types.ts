export type LegalStatus = 'Allottee' | 'Prospective Buyer' | 'Litigant' | 'Registered Owner';

export type BlockName = 'Venus' | 'Jupiter';

export type DocumentType =
  | 'Allotment Letter'
  | 'Builder Buyer Agreement'
  | 'Payment Receipt'
  | 'Consumer Forum Order'
  | 'Execution Petition'
  | 'RERA Order'
  | 'Absolute Sale Deed'
  | 'Encumbrance Certificate'
  | 'Possession Letter'
  | 'Khata'
  | 'Legal Notice'
  | 'Other';

export interface UploadedFileMeta {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  standardizedFilename: string;
}

export interface UnitSubmissionItem {
  id: string;
  block: BlockName;
  tower: string;
  floor: string;
  flat: string;
  unitCode: string;
  documentType: DocumentType;
  remarks: string;
  files: UploadedFileMeta[];
}

export interface MasterRegisterRecord {
  submissionId: string;
  uploadTimestamp: string;
  memberName: string;
  mobile: string;
  email: string;
  legalStatus: string;
  block: BlockName;
  tower: string;
  floor: string;
  flat: string;
  unitCode: string;
  documentType: DocumentType;
  remarks: string;
  originalFilename: string;
  storedFilename: string;
  driveFileId: string;
  driveLink: string;
  fileDataUrl?: string;
  fileSize?: number;
}

export interface AdminStatistics {
  totalMembers: number;
  totalSubmissions: number;
  totalUnits: number;
  totalDocuments: number;
  venusUnits: number;
  jupiterUnits: number;
  litigants: number;
  registeredOwners: number;
}

export interface GasFile {
  name: string;
  path: string;
  type: 'manifest' | 'server' | 'html' | 'docs';
  description: string;
  code: string;
}
