# Changelog

All notable changes to the **Skyview AOBG26 Legal Repository** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-09-18

### Security & Email Receipt Hardening
- **Server-Side Admin Dashboard Security Restriction (`Code.gs`, `Admin.gs`)**:
  - Restricts the Admin Dashboard and setup screens strictly on the server-side.
  - Access is granted only when `Session.getActiveUser().getEmail()` equals `ADMIN_EMAIL` (`skyviewaobg26@gmail.com`).
  - Any unauthorized or non-admin access attempt is intercepted and immediately redirected to the Member Portal.
  - Server-side RPC methods `getAdminDashboardData()` and `initializeRepository()` strictly reject non-admin invocations.
- **Gmail Confirmation Email Receipt (`Upload.gs`)**:
  - Automatically dispatches an official Gmail confirmation email to the submitting member upon successful processing.
  - Email Subject: `Skyview Repository Submission Received – {Submission ID}`
  - Email Body includes Submission ID, Member Name, Units Submitted, Number of Documents, and Timestamp.
  - Includes dual HTML and plain-text templates with Association branding, drive filing notice, and administrative contact.
- **OAuth Scopes Update in Manifest (`appsscript.json`)**:
  - Added `https://www.googleapis.com/auth/drive.file` OAuth scope to the manifest.
  - Configured mail delivery scopes (`https://www.googleapis.com/auth/gmail.send`, `https://www.googleapis.com/auth/script.send_mail`).

---

## [1.0.0] - 2026-09-18

### Initial Production Release

The initial production release of the Skyview AOBG26 Legal Repository for the **Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association** (`naveedam/skyview-aobg26-legal-repository`).

### Added
- **Self-Initializing Administrator Setup (`Admin.gs`)**:
  - Cold-start detection in `doGet()` intercepting uninitialized visits.
  - One-click automatic creation of Google Drive root directory (`Skyview Legal Repository`).
  - Automated provisioning of `Block Venus` with child tower folders (`Tower A`, `Tower B`, `Tower C`, `Tower D`).
  - Automated provisioning of `Block Jupiter` with child tower folders (`Tower A`, `Tower B`, `Tower C`, `Tower D`, `Tower E`).
  - Automated creation of `Association Documents` and `Court Proceedings` directories.
  - Automated generation of the `Skyview Master Register` spreadsheet with Association teal styling (`#0F766E`), frozen header, and formatted columns.
  - Automatic creation of the hidden `Settings` sheet, dynamically persisting all folder and spreadsheet IDs to avoid hardcoded constants.

- **Dynamic Drive Folder Management (`Drive.gs`)**:
  - Dynamic resolution of Root, Block, and Tower directories from the hidden Settings sheet.
  - Dynamic on-demand creation of individual Unit folders (e.g., `VA-1204`, `JC-0802`) upon document upload.
  - Base64 binary decoding and direct Drive file creation with custom metadata descriptions.

- **Member Portal & Multi-Unit Repeater (`Upload.gs`, `index.html`, `scripts.html`)**:
  - Responsive, high-contrast Material-inspired user interface.
  - Member contact collection with mandatory Name, Mobile, and Email validation.
  - Multi-select Legal Status checkbox group (*Allottee*, *Prospective Buyer*, *Litigant*, *Registered Owner*).
  - Dynamic repeating property units section allowing members to register multiple flats in one submission.
  - Automatic client-side unit code formatting (e.g., `VA-1204` based on Block, Tower, Floor, Flat).
  - File upload supporting PDF, JPG, JPEG, and PNG formats up to 25 MB.
  - Standardized filename generation:
    `Block_Tower_Unit_DocumentType_YYYYMMDD_Sequence.ext`
  - Atomic sequential submission ID generator with `LockService` (`SV-SUB-000001`).
  - Instant on-screen submission receipt modal with breakdown of recorded units and documents.

- **Master Register Spreadsheet Engine (`Sheet.gs`)**:
  - 17-column comprehensive document cataloging schema.
  - Atomic batch row insertion (`appendRegisterRows`) preventing partial state corruption.
  - Dynamic getters and setters for the hidden `Settings` sheet with high-speed `ScriptProperties` caching.
  - Real-time register record queries and metric aggregation.

- **Live Administrator Dashboard (`Admin.gs`, `admin.html`)**:
  - 8 real-time analytical metric cards (Total Members, Submissions, Units, Documents, Venus Units, Jupiter Units, Litigants, Registered Owners).
  - Instant live search bar filtering across Member Name, Mobile, Unit Code, Flat number, and Submission ID.
  - Dropdown filters for Block, Tower, and Document Type.
  - Direct deep-links to the Root Google Drive Folder and Master Register spreadsheet.
  - One-click CSV export utility generating client-downloadable spreadsheet extracts.

- **Clasp & GitHub Tooling**:
  - Standard `appsscript.json` manifest with V8 runtime and required OAuth scopes (`drive`, `spreadsheets`, `userinfo.email`).
  - Configured `.gitignore` keeping `.clasp.json` local and uncommitted.
  - MIT License for open collaboration.
  - Step-by-step deployment guide in `docs/DEPLOYMENT.md`.
