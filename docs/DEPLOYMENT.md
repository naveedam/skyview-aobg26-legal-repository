# Skyview AOBG26 Legal Repository - Deployment Guide

**Target GitHub Repository:** [`naveedam/skyview-aobg26-legal-repository`](https://github.com/naveedam/skyview-aobg26-legal-repository)  
**Association:** Skyview Allottees cum Prospective Buyers & Litigants' Welfare Association  
**Administrator Account:** `skyviewaobg26@gmail.com`

---

## Zero-Third-Party Architecture Notice
> **Important:** This solution runs 100% natively on Google Cloud / Google Workspace infrastructure (Google Apps Script, Google Drive, and Google Sheets). **Do not deploy to Vercel, Firebase, AWS, or any third-party web host.** There are no monthly database hosting bills, no API tokens to purchase, and zero operational server costs for the association.

---

## Step-by-Step Production Deployment

Follow these exact steps to deploy the repository from GitHub into production:

### Step 1: Create a New Google Apps Script Project
1. Open your browser and navigate to **[script.google.com](https://script.google.com)**.
2. Ensure you are signed in using the official association Google account:
   ```
   skyviewaobg26@gmail.com
   ```
3. Click **New project** (+ button in top-left).
4. Rename the project from *"Untitled project"* to:
   ```
   Skyview AOBG26 Legal Repository
   ```

---

### Step 2: Import All Project Files
You can import the project files using either **Google Clasp** (recommended) or the **Google Apps Script Web Editor**:

#### Option A: Using Clasp CLI (Recommended)
```bash
# 1. Clone the repository
git clone https://github.com/naveedam/skyview-aobg26-legal-repository.git
cd skyview-aobg26-legal-repository

# 2. Login to clasp using the association account
npx @google/clasp login

# 3. Create or link the project
# (Paste your Apps Script Project Script ID from Project Settings)
npx @google/clasp clone <SCRIPT_ID>

# 4. Push all files to Apps Script
npx @google/clasp push
```

#### Option B: Manual Web Editor Copy
If not using the clasp CLI:
1. In the Apps Script editor, open **Project Settings** (gear icon) and check **"Show 'appsscript.json' manifest file in editor"**.
2. Replace `appsscript.json` with the repository's `appsscript.json`.
3. Create the 6 `.gs` script files:
   - `Code.gs`
   - `Admin.gs`
   - `Drive.gs`
   - `Upload.gs`
   - `Sheet.gs`
   - `Utils.gs`
4. Create the 4 HTML files:
   - `index.html` (Member Portal)
   - `admin.html` (Admin Dashboard & Setup)
   - `styles.html` (CSS Stylesheet)
   - `scripts.html` (Client JavaScript)

---

### Step 3: Deploy as Web App
1. In the top-right corner of the Apps Script editor, click **Deploy** → **New deployment**.
2. Click the gear icon next to *"Select type"* and select **Web app**.
3. In the configuration dialog, enter:
   - **Description:** `Skyview AOBG26 Production Release v1.0`

---

### Step 4: Execute As: Me
1. Under **Execute as**, select:
   ```
   Me (skyviewaobg26@gmail.com)
   ```
   *This ensures that member file uploads and sheet append operations execute with the association's Google Drive storage quota.*

---

### Step 5: Access: Anyone with the link
1. Under **Who has access**, select:
   ```
   Anyone with the link
   ```
   *(Or "Anyone" so association members can upload without needing Google Workspace organizational accounts).*
2. Click **Deploy**.
3. When prompted, click **Authorize access** and accept Google Drive and Google Sheets permissions.
4. Copy the generated **Web app URL** (e.g., `https://script.google.com/macros/s/.../exec`).

---

### Step 6: First Login → Click "Initialize Repository"
1. Open the copied Web App URL in your browser.
2. Because the repository has not yet been provisioned, the application automatically detects the first-run state and opens the **Administrator Setup Screen**.
3. Click the blue button:
   ```
   Initialize Skyview Repository
   ```
4. Within ~5 seconds, the system automatically creates:
   - Root folder: `Skyview Legal Repository`
   - `Block Venus` with child folders `Tower A`, `Tower B`, `Tower C`, `Tower D`
   - `Block Jupiter` with child folders `Tower A`, `Tower B`, `Tower C`, `Tower D`, `Tower E`
   - `Association Documents` and `Court Proceedings` folders
   - `Skyview Master Register` spreadsheet with styled `Register` sheet and hidden `Settings` store
5. The application automatically redirects to the **Member Portal**.

---

### Step 7: Share the Member Portal URL with Association Members
1. Share the primary Web App URL with association members via WhatsApp, Email, or the official noticeboard:
   ```
   https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec
   ```
2. For administrators and advocates, append `?page=admin` to view the **Administrator Dashboard**:
   ```
   https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec?page=admin
   ```

---

## Verification Checklist

| Step | Item | Status |
| :--- | :--- | :---: |
| 1 | Google Apps Script project created under `skyviewaobg26@gmail.com` | [ ] |
| 2 | All 6 `.gs` scripts, 4 `.html` templates, and `appsscript.json` loaded | [ ] |
| 3 | Web app deployed with `Execute as: Me` and `Access: Anyone` | [ ] |
| 4 | First-run setup executed and Drive hierarchy verified | [ ] |
| 5 | Test submission performed from Member Portal | [ ] |
| 6 | Record verified in `Skyview Master Register` spreadsheet | [ ] |
| 7 | Uploaded file confirmed in Drive: `Block Venus` / `Tower A` / `VA-XXXX` | [ ] |
