import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Terminal,
  Settings
} from 'lucide-react';
import { GAS_FILES } from '../gasCodeRepository';
import { GasFile } from '../types';

export const GasCodeHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<GasFile>(GAS_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'guide' | 'scopes'>('code');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: GasFile) => {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Google Apps Script Source Code &amp; Deployment Hub
              </span>
              <span className="text-xs text-slate-500 font-mono">11 Production Files</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Skyview AOBG26 Legal Repository — Apps Script Suite
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ready for 100% native deployment inside Google Apps Script under <strong>skyviewaobg26@gmail.com</strong>
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'code' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Source Files ({GAS_FILES.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'guide' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Deployment Manual</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('scopes')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'scopes' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Scopes &amp; Security</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Sidebar */}
          <div className="lg:col-span-4 space-y-2">
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
                Project Files
              </span>
              <div className="space-y-1">
                {GAS_FILES.map(file => {
                  const isSelected = selectedFile.name === file.name;
                  return (
                    <button
                      key={file.name}
                      type="button"
                      onClick={() => {
                        setSelectedFile(file);
                        setCopied(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200 shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-700' : 'text-slate-400'}`} />
                        <span className="font-mono truncate">{file.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans">
                        {file.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Zero External Dependencies</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Runs exclusively on Google Apps Script, Google Drive, and Google Sheets. No Node.js, Firebase, Supabase, or external database required.
              </p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
            {/* Header bar */}
            <div className="bg-slate-950/80 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-xs font-bold text-teal-300 ml-2">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  — {selectedFile.description}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                  title="Copy file contents"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  title="Download file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto overflow-y-auto max-h-[620px] leading-relaxed selection:bg-teal-800">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Google Apps Script Deployment &amp; Publishing Guide
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Step-by-step instructions for <strong>skyviewaobg26@gmail.com</strong> to deploy and publish the web application without requiring external hosting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">1</span>
                <span>Create Apps Script Project</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log into <strong>skyviewaobg26@gmail.com</strong> and open <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">script.google.com</a>. Click <strong>"New project"</strong> and rename it to <strong>"Skyview AOBG26 Legal Repository"</strong>.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">2</span>
                <span>Show appsscript.json Manifest</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                In the left sidebar, click <strong>Project Settings (⚙️)</strong>. Check <strong>"Show 'appsscript.json' manifest file in editor"</strong>. Return to the editor and paste the manifest file with the OAuth scopes and timezone.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">3</span>
                <span>Paste the 10 Code &amp; HTML Files</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create the `.gs` script files (<code>Code.gs</code>, <code>Admin.gs</code>, <code>Drive.gs</code>, <code>Upload.gs</code>, <code>Sheet.gs</code>, <code>Utils.gs</code>) and HTML files (<code>index.html</code>, <code>admin.html</code>, <code>styles.html</code>, <code>scripts.html</code>) using the <strong>+</strong> button in the left pane.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">4</span>
                <span>Deploy as Web App</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click <strong>Deploy &gt; New deployment</strong>. Select type <strong>Web app</strong>. Configure:<br />
                • <strong>Execute as:</strong> <code>Me (skyviewaobg26@gmail.com)</code><br />
                • <strong>Who has access:</strong> <code>Anyone</code><br />
                <em>This ensures members can upload documents to the private Drive without having direct access to browse or edit Drive folders.</em>
              </p>
            </div>
          </div>

          {/* Initialization details */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              First-Run Administrator Initialization
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Upon visiting the published Web App URL (or appending <code>?page=admin</code>), the Administrator clicks <strong>"Initialize Skyview Repository"</strong>. In ~5 seconds, Google Apps Script will automatically:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              <li>Create Google Drive Root: <strong>Skyview Legal Repository</strong></li>
              <li>Create <strong>Block Venus</strong> with Tower A, Tower B, Tower C, Tower D</li>
              <li>Create <strong>Block Jupiter</strong> with Tower A, Tower B, Tower C, Tower D, Tower E</li>
              <li>Create folders <strong>Association Documents</strong> and <strong>Court Proceedings</strong></li>
              <li>Create Google Spreadsheet <strong>Skyview Master Register</strong> with formatted Register and hidden Settings sheets</li>
              <li>Record all Folder IDs into <code>ScriptProperties</code> and the Settings sheet (zero hardcoded IDs).</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'scopes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Required OAuth Authorization Scopes &amp; Security Model
            </h2>
            <p className="text-xs text-slate-500">
              The application uses the least privilege model necessary to automate Drive and Sheets operations.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="font-mono text-xs font-bold text-teal-800 mb-1">
                https://www.googleapis.com/auth/drive
              </div>
              <p className="text-xs text-slate-600">
                Authorizes the script to create the <code>Skyview Legal Repository</code> root folder, generate Tower and Unit directories (e.g. <code>VA-1204</code>), and upload member documents directly into the unit folders.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="font-mono text-xs font-bold text-teal-800 mb-1">
                https://www.googleapis.com/auth/spreadsheets
              </div>
              <p className="text-xs text-slate-600">
                Authorizes the creation and management of the <code>Skyview Master Register</code> spreadsheet and the hidden <code>Settings</code> sheet storing repository metadata.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="font-mono text-xs font-bold text-teal-800 mb-1">
                https://www.googleapis.com/auth/userinfo.email
              </div>
              <p className="text-xs text-slate-600">
                Authorizes verification of the active user session email to ensure only <code>skyviewaobg26@gmail.com</code> can access repository initialization and administrative controls.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Member Security &amp; Drive Privacy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Because the Web App is deployed with <strong>Execute as: "Me"</strong>, individual members who visit the form have <strong>zero direct read or write access</strong> to the Association's Google Drive. The script serves as an isolated, secure intermediary that validates file formats, enforces 25MB limits, creates the folder hierarchy, and indexes each document in the Master Register.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
