# Skyview AOBG26 Legal Repository
## Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
**Owner Account:** `skyviewaobg26@gmail.com`

---

## 1. Project Overview & Architecture

This repository contains the complete production-ready Google Apps Script (GAS) application to securely organize and index property and legal documents submitted by association members directly inside Google Drive and Google Sheets without external databases or servers.

### Directory & File Structure
```text
├── appsscript.json   # Project manifest, execution settings, OAuth scopes, Asia/Kolkata timezone
├── Code.gs           # Web App routing, HTML Service template inclusion, config provider
├── Admin.gs          # First-run initialization, stats aggregation, search queries, CSV export
├── Drive.gs          # Folder hierarchy navigator, automatic unit folder creation, file persistence
├── Upload.gs         # Member submission processor, file validations, batch sheet appending
├── Sheet.gs          # Master Register spreadsheet management, row reader/appender, Settings sheet
├── Utils.gs          # Unit code generation (VA-1204), standardized naming, atomic submission ID
├── index.html        # Member Upload Portal responsive template
├── admin.html        # Administrator Dashboard & First-Run Setup template
├── styles.html       # Material-inspired responsive CSS (Primary #0F766E, Secondary #2563EB)
└── scripts.html      # Client-side JavaScript (dynamic unit cards, file reader, RPC handlers)
```

---

## 2. Required Authorization Scopes

In `appsscript.json`:
- `https://www.googleapis.com/auth/drive`: Required to create the repository folders, generate Tower & Unit folders (`VA-1204`, etc.), and write uploaded legal documents.
- `https://www.googleapis.com/auth/spreadsheets`: Required to create and update the `Skyview Master Register` spreadsheet and the hidden `Settings` sheet.
- `https://www.googleapis.com/auth/userinfo.email`: Required to identify the administrator (`skyviewaobg26@gmail.com`) and secure access to the dashboard.

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Open Google Apps Script
1. Log in to your Google account: **`skyviewaobg26@gmail.com`**.
2. Navigate to [script.google.com](https://script.google.com/) and click **"New project"**.
3. Rename the project to: **`Skyview AOBG26 Legal Repository`**.

### Step 2: Enable Manifest View
1. In the left sidebar of the Apps Script editor, click **Project Settings** (gear icon ⚙️).
2. Check the box: **"Show 'appsscript.json' manifest file in editor"**.
3. Click the **Editor** icon (`< >`) in the sidebar.

### Step 3: Add the Source Files
Copy the contents of each file from this repository into your Apps Script project:
1. **`appsscript.json`**: Replace the entire contents with `appsscript.json`.
2. **`Code.gs`**: Replace `Code.gs` with the content from `Code.gs`.
3. Create new Script files (`+` > **Script**):
   - `Admin.gs`
   - `Drive.gs`
   - `Upload.gs`
   - `Sheet.gs`
   - `Utils.gs`
4. Create new HTML files (`+` > **HTML**):
   - `index.html`
   - `admin.html`
   - `styles.html`
   - `scripts.html`
   *(Note: in Apps Script, omit the `.html` extension when typing the filename).*

### Step 4: Authorize and Test Initial Run
1. In `Code.gs` or `Admin.gs`, select `checkRepositoryStatus` or `initializeRepository` from the function dropdown at the top.
2. Click **Run**.
3. Google will prompt: **"Authorization required"**. Click **Review permissions**.
4. Select `skyviewaobg26@gmail.com`.
5. Click **Advanced** > **Go to Skyview AOBG26 Legal Repository (unsafe)**.
6. Click **Allow** to grant Drive and Sheets permissions.

### Step 5: Publish as a Web App
1. At the top right of the Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure the deployment parameters:
   - **Description**: `Skyview AOBG26 Legal Repository v1.0 Production`
   - **Execute as**: **`Me (skyviewaobg26@gmail.com)`**  
     *(CRITICAL: By executing as "Me", the script writes files to the Association's private Drive while keeping the Drive folders completely hidden and inaccessible to individual members).*
   - **Who has access**: **`Anyone`**  
     *(Allows all association members to submit documents without needing access to the Association's Google Drive).*
4. Click **Deploy**.
5. Copy the **Web App URL** provided.

---

## 4. How the Administrator Initializes the Repository

1. Open the Web App URL in your browser while logged into `skyviewaobg26@gmail.com` or append `?page=admin` to the URL:
   `https://script.google.com/macros/s/.../exec?page=admin`
2. Since this is the first run, the screen will display the **First-Run Repository Initialization** panel.
3. Click **"Initialize Skyview Repository"**.
4. Within a few seconds, Apps Script automatically creates:
   - Google Drive Root Folder: `Skyview Legal Repository`
   - `Block Venus` with `Tower A`, `Tower B`, `Tower C`, `Tower D`
   - `Block Jupiter` with `Tower A`, `Tower B`, `Tower C`, `Tower D`, `Tower E`
   - `Association Documents`
   - `Court Proceedings`
   - Google Spreadsheet: `Skyview Master Register`
   - Formatted `Register` sheet with frozen header row and custom teal styling
   - Hidden `Settings` sheet saving all Folder IDs and Spreadsheet IDs.
5. The Admin Dashboard will instantly refresh and display the 8 statistics cards and the searchable master register table!

---

## 5. Testing Instructions with Sample Data

### Test Case: Naveed Ahmed (Multi-Unit & Multi-Document Submission)
1. Open the Web App URL: `https://script.google.com/macros/s/.../exec`
2. **Section 1 — Member Details**:
   - **Full Name**: `Naveed Ahmed`
   - **Mobile Number**: `+91 9876543210`
   - **Email Address**: `naveedahmed0625@gmail.com`
3. **Section 2 — Legal Status**:
   - Select both checkboxes:
     ☑ **Litigant**
     ☑ **Registered Owner**
4. **Section 3 — Property Units**:
   - **Unit 1**:
     - Block: `Venus`
     - Tower: `A`
     - Floor: `12`
     - Flat Number: `04`
     - *Verified unit badge dynamically shows:* **`VA-1204`**
     - Document Type: `Consumer Forum Order`
     - Remarks: `CC 142/2021 Final Order`
     - Attach a test PDF or sample image.
   - Click **"+ Add Another Property Unit"**:
   - **Unit 2**:
     - Block: `Jupiter`
     - Tower: `C`
     - Floor: `08`
     - Flat Number: `02`
     - *Verified unit badge dynamically shows:* **`JC-0802`**
     - Document Type: `Builder Buyer Agreement`
     - Remarks: `Executed in March 2018`
     - Attach another test document.
5. Click **"Submit Legal Documents to Repository"**.
6. **Verify Submission Receipt**:
   - Submission modal pops up showing: **`SV-SUB-000001`**, 2 Units, 2 Documents.
7. **Verify Google Drive**:
   - Open Drive: `Skyview Legal Repository` > `Block Venus` > `Tower A` > **`VA-1204`**
   - File exists with standardized name:  
     `Venus_A_VA1204_ConsumerForumOrder_YYYYMMDD_01.pdf`
   - Open Drive: `Skyview Legal Repository` > `Block Jupiter` > `Tower C` > **`JC-0802`**
   - File exists with standardized name:  
     `Jupiter_C_JC0802_BuilderBuyerAgreement_YYYYMMDD_01.pdf`
8. **Verify Master Register**:
   - Open `Skyview Master Register` spreadsheet:
   - Two new rows are appended with Submission ID `SV-SUB-000001`, timestamps, member details, legal status (`Litigant, Registered Owner`), unit codes, document types, remarks, original filenames, stored filenames, and direct clickable Drive links.
9. **Verify Admin Dashboard**:
   - Go to `?page=admin`
   - Total Members: 1
   - Total Submissions: 1
   - Total Units: 2
   - Total Documents: 2
   - Venus Units: 1
   - Jupiter Units: 1
   - Litigants: 1
   - Registered Owners: 1
   - Search `VA-1204` or `Naveed` — filter works instantaneously!
