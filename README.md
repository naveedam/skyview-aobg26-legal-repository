# Skyview AOBG26 Legal Repository
## Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association
**Administrator Account:** Dynamically assigned to the executing Gmail account during initialization

---

## 1. Zero-Configuration Production Objective

The deployed Web App requires **zero manual execution of Apps Script functions** in the code editor. The only deliverable the Association President receives is the **live Web App URL**.

### First-Run Autonomous Behavior
1. **Self-Introspection via Settings Sheet**: On every page load, the application inspects whether the repository has already been initialized by looking for the hidden `Settings` sheet inside the `Skyview Master Register` spreadsheet.
2. **Automatic First-Run Setup Interception**: If the `Settings` sheet does NOT exist, the app automatically presents the **Administrator Setup screen** to initialize the repository.
3. **Automatic Member Portal Delivery**: As soon as the `Settings` sheet exists, opening the Web App automatically displays the **Member Portal**.

### One-Time Self-Initialization
When the administrator clicks **"Initialize Skyview Repository"** on the setup screen:
- Creates root Google Drive folder: `Skyview Legal Repository`.
- Creates `Block Venus` with Tower `A`, `B`, `C`, `D`.
- Creates `Block Jupiter` with Tower `A`, `B`, `C`, `D`, `E`.
- Creates `Association Documents` folder.
- Creates `Court Proceedings` folder.
- Creates `Skyview Master Register` Google Sheet.
- Creates formatted `Register` sheet with 17 standardized columns and Association teal styling.
- Creates hidden `Settings` sheet.
- Stores all folder IDs, spreadsheet ID, initialization timestamp, and the dynamically detected administrator email inside Settings.
- Marks repository as initialized.
- **Redirects automatically to the Member Portal**.

---

## 2. Security & Zero-Code Modifications
- **Never hardcode folder IDs**: All folder and spreadsheet IDs are resolved dynamically from the hidden `Settings` sheet.
- **No source code edits after deployment**: The application is driven entirely by the `Settings` sheet and is portable to any Association Gmail account.
- **Admin Dashboard restricted after initialization**: Accessible via `?page=admin` strictly to the stored administrator email detected during initialization.
- **No Apps Script editor execution**: The Association President never needs to open `script.google.com`, run functions from the editor, or configure script triggers.

---

## 3. Directory & File Structure (clasp push compatible)
```text
google-apps-script/
├── appsscript.json   # Project manifest with USER_DEPLOYING, ANYONE access, scopes
├── Code.gs           # Zero-config router (doGet) checking Settings sheet
├── Admin.gs          # checkRepositoryStatus, initializeRepository, stats, CSV export
├── Drive.gs          # Dynamic folder hierarchy & unit folder locator
├── Upload.gs         # Member upload processor, multi-unit validation, Gmail receipts
├── Sheet.gs          # Master Register and hidden Settings sheet management
├── Utils.gs          # Unit formatting (VA-1204), standardized naming, admin getter
├── index.html        # Member Portal responsive UI
├── admin.html        # Admin Dashboard & First-Run Setup UI
├── styles.html       # Institutional stylesheet (Teal #0F766E, Slate)
└── scripts.html      # Client script, dynamic units, base64 reader, auto-redirect
```

---

## 4. Deployment Guide

### Step 1: Deploy with clasp or paste into Apps Script
```bash
# Optional: deploy via clasp
cd google-apps-script
clasp push
```
Or paste the files into a new project at [script.google.com](https://script.google.com/).

### Step 2: Deploy as Web App
1. Click **Deploy** > **New deployment**.
2. Select type: **Web app**.
3. Configuration:
   - **Execute as**: **`Me (your association Google account)`**
   - **Who has access**: **`Anyone`**
4. Click **Deploy** and copy the Web App URL.

### Step 3: Deliver to Association President
Send the Web App URL to the Association President.
- On first click, the setup screen appears automatically because the hidden `Settings` sheet does not exist yet.
- The President clicks **"Initialize Skyview Repository"**.
- All Drive folders, towers, spreadsheets, and Settings are built in seconds.
- The browser automatically redirects to the Member Portal!
- The Association President never touches Apps Script source code or the script editor.

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
