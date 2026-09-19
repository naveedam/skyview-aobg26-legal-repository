# Skyview AOBG26 Legal Repository

**Official Legal Document Repository & Case Management System**  
*Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association*  
*Repository: [`naveedam/skyview-aobg26-legal-repository`](https://github.com/naveedam/skyview-aobg26-legal-repository)*  
*Owner Account: `skyviewaobg26@gmail.com`*

---

## 1. Project Overview

The **Skyview AOBG26 Legal Repository** is a secure, serverless cloud platform built specifically for the **Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association**. It enables association members (allottees, prospective buyers, litigants, and registered owners) across **Block Venus** and **Block Jupiter** to submit essential legal records, court petitions, execution orders, allotment documents, and payment proofs.

All incoming files are dynamically validated, assigned sequential submission IDs (`SV-SUB-000001`), organized into a standardized Google Drive hierarchical folder structure, and cataloged into a centralized **Master Register** spreadsheet with an automated, hidden **Settings** store.

---

## 2. Key Features

- **Zero-Setup Cold Start**: No pre-configured folder IDs or spreadsheet IDs required in the code. A single click by the administrator provisions the complete cloud architecture.
- **Multi-Unit Property Support**: Members owning multiple apartments across towers can submit all units and corresponding documents in a single submission.
- **Dynamic Unit Code Calculation**: Automatically formats standard unit codes (e.g., `VA-1204` for Venus Tower A Floor 12 Flat 04; `JC-0802` for Jupiter Tower C Floor 08 Flat 02).
- **Multi-Classification Legal Status**: Allows selecting any combination of *Allottee*, *Prospective Buyer*, *Litigant*, and *Registered Owner*.
- **Standardized File Naming Convention**:
  ```
  Block_Tower_Unit_DocumentType_YYYYMMDD_Sequence.ext
  ```
  *Example:* `Venus_A_VA1204_ConsumerForumOrder_20260918_01.pdf`
- **Dynamic Google Drive Hierarchy**: Automatically routes and creates unit folders inside specific Tower directories under Block Venus or Block Jupiter.
- **Master Register Spreadsheet**: Pre-formatted with Association teal headers (`#0F766E`), frozen rows, formatted timestamps, and column widths across all 17 attributes.
- **Hidden Settings Sheet**: Securely persists all provisioned Folder IDs, Sheet IDs, and association configurations directly inside Google Sheets, eliminating code changes when migrating folders.
- **Live Administrator Dashboard**: Real-time analytical cards, instant cross-field search, multi-attribute filtering (Block, Tower, Document Type), direct Drive links, and single-click CSV export.
- **Server-Side Security Restriction**: Admin Dashboard access is restricted on the server-side to the Association Administrator account (`ADMIN_EMAIL: skyviewaobg26@gmail.com`). Unauthorized visits are redirected to the Member Portal.
- **Automated Gmail Confirmation Receipts**: Automatically dispatches an official confirmation receipt via Gmail to the member after every successful upload with Subject `Skyview Repository Submission Received – {Submission ID}`, containing Submission ID, Member Name, Units Submitted, Number of Documents, and Timestamp.

---

## 3. Technology Stack

- **Platform Runtime**: Google Apps Script (V8 Engine)
- **Deployment**: Google Apps Script Web App (`executeAs: USER_DEPLOYING`, `access: ANYONE`)
- **CLI & Version Control**: Google Clasp (`@google/clasp`) + Git/GitHub
- **Storage Infrastructure**: Google Drive API
- **Database / Ledger**: Google Sheets API (Master Register + Hidden Settings)
- **Frontend Architecture**: Server-Side Rendered HTML5 + Responsive CSS3 + Vanilla JavaScript (ES6+)

---

## 4. Repository Folder Structure

```
skyview-aobg26-legal-repository/
├── appsscript.json             # Google Apps Script manifest (V8, OAuth scopes, Web App config)
├── Code.gs                     # Main HTTP router (doGet) and first-run auto-detection
├── Admin.gs                    # One-click repository provisioning & admin dashboard data endpoints
├── Drive.gs                    # Google Drive hierarchical folder manager & file persistence
├── Upload.gs                   # Member submission processor, multi-unit validation, & naming engine
├── Sheet.gs                    # Master Register batch writer & hidden Settings sheet manager
├── Utils.gs                    # Centralized constants, unit code formatters, and HTML helpers
├── html/
│   ├── index.html              # Member Portal view (multi-unit repeater, uploads, receipt modal)
│   ├── admin.html              # Administrator Dashboard & Setup screen view
│   ├── styles.html             # Association production stylesheet (Teal theme, Bento cards)
│   └── scripts.html            # Client-side validation, base64 reader, and RPC bridge
├── docs/
│   ├── README.md               # Complete project documentation and specifications
│   ├── DEPLOYMENT.md           # Step-by-step production deployment instructions
│   └── CHANGELOG.md            # Version release notes and change history
├── .gitignore                  # Clasp and environment ignore rules
└── LICENSE                     # MIT Open Source License
```

---

## 5. Google Drive Architecture

When initialized, the platform automatically provisions the following directory tree under Google Drive:

```
📁 Skyview Legal Repository (Root Folder)
├── 📁 Block Venus
│   ├── 📁 Tower A
│   │   └── 📁 VA-1204/   (Created automatically upon first upload for this unit)
│   ├── 📁 Tower B
│   ├── 📁 Tower C
│   └── 📁 Tower D
├── 📁 Block Jupiter
│   ├── 📁 Tower A
│   ├── 📁 Tower B
│   ├── 📁 Tower C
│   ├── 📁 Tower D
│   └── 📁 Tower E
├── 📁 Association Documents
├── 📁 Court Proceedings
└── 📊 Skyview Master Register (Spreadsheet)
    ├── 📑 Register  (Main document database, 17 columns)
    └── 📑 Settings  (Hidden system configuration store)
```

---

## 6. Workflows

### Administrator Workflow
1. Log in with the association owner account (`skyviewaobg26@gmail.com`).
2. Access the deployed Web App URL.
3. If uninitialized, the platform automatically displays the **Administrator Setup Screen**.
4. Click **Initialize Skyview Repository**; all Google Drive folders and the Master Register spreadsheet are provisioned in ~5 seconds.
5. Access the **Admin Dashboard** (`?page=admin`) to view live metrics, search records, open Drive folders, or export CSV files.

### Member Workflow
1. Open the public Web App URL.
2. Enter contact details: Full Name, Mobile Number, and Email.
3. Select applicable **Legal Status** checkboxes.
4. Add property units (Block, Tower, Floor, Flat).
5. Attach documents (PDF, JPG, JPEG, PNG up to 25 MB each), specify document type, and add optional remarks.
6. Click **Submit Legal Documents to Repository**.
7. Receive a formatted on-screen receipt with a unique **Submission ID** (e.g., `SV-SUB-000001`).

---

## 7. License

This project is licensed under the [MIT License](../LICENSE).  
Copyright © 2026 Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association.
