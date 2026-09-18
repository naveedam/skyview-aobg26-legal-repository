import React, { useState } from 'react';
import { 
  FolderTree, 
  Sparkles, 
  Folder, 
  FileSpreadsheet, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Database,
  Building2,
  Lock
} from 'lucide-react';

interface AdminSetupScreenProps {
  onInitialize: () => void;
}

interface StepItem {
  id: string;
  label: string;
  detail: string;
}

const INIT_STEPS: StepItem[] = [
  { id: 'root', label: 'Skyview Legal Repository', detail: 'Root Google Drive folder container' },
  { id: 'venus', label: 'Block Venus & Towers A–D', detail: '4 tower directories created for Venus' },
  { id: 'jupiter', label: 'Block Jupiter & Towers A–E', detail: '5 tower directories created for Jupiter' },
  { id: 'assoc', label: 'Association Documents & Court Proceedings', detail: 'Legal case and administrative repositories' },
  { id: 'sheet', label: 'Skyview Master Register', detail: 'Google Sheet with styled Register database' },
  { id: 'settings', label: 'Hidden Settings Sheet', detail: 'Storing all generated Folder IDs & Spreadsheet IDs' }
];

export const AdminSetupScreen: React.FC<AdminSetupScreenProps> = ({ onInitialize }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [redirecting, setRedirecting] = useState(false);

  const handleStartSetup = () => {
    setIsInitializing(true);
    setCurrentStepIndex(0);
    setCompletedSteps([]);

    // Step-by-step progress simulation
    const runStep = (index: number) => {
      if (index < INIT_STEPS.length) {
        setCurrentStepIndex(index);
        setTimeout(() => {
          setCompletedSteps(prev => [...prev, INIT_STEPS[index].id]);
          runStep(index + 1);
        }, 350);
      } else {
        // All steps completed
        setRedirecting(true);
        setTimeout(() => {
          onInitialize();
        }, 700);
      }
    };

    runStep(0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-teal-50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-50 rounded-full blur-3xl pointer-events-none" />

        {/* Top Icon Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 mb-6 shadow-xs">
          <FolderTree className="w-10 h-10 stroke-[1.75]" />
        </div>

        {/* Header Titles */}
        <div className="inline-flex items-center gap-2 bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
          <span>Administrator Setup Required</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Skyview Legal Repository Initialization
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mt-3 leading-relaxed">
          The Skyview repository has not yet been initialized in Google Drive. 
          Click below to automatically create the complete folder structure, 
          provision tower directories, and generate the <strong>Skyview Master Register</strong> with a hidden <strong>Settings</strong> store.
        </p>

        {/* Zero-Config Assurance Box */}
        <div className="mt-6 mb-8 max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-center justify-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>No folder IDs, manual configuration, or code edits required. Simply click once to provision.</span>
        </div>

        {/* Drive Structure Visual Tree */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 text-left font-mono text-xs max-w-xl mx-auto mb-8 shadow-inner overflow-x-auto leading-relaxed border border-slate-800">
          <div className="text-teal-400 font-bold mb-3 flex items-center gap-2 pb-2 border-b border-slate-800">
            <Folder className="w-4 h-4" /> 
            <span>Skyview Legal Repository (Root Drive Folder)</span>
          </div>
          <div className="pl-3 text-slate-300 space-y-0.5">
            <div>├── 📁 <span className="text-purple-300 font-semibold">Block Venus</span></div>
            <div>│&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower A</div>
            <div>│&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower B</div>
            <div>│&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower C</div>
            <div>│&nbsp;&nbsp;&nbsp;&nbsp;└── 📁 Tower D</div>
            <div>├── 📁 <span className="text-amber-300 font-semibold">Block Jupiter</span></div>
            <div>│&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower A</div>
            <div>│&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower B</div>
            <div>│&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower C</div>
            <div>│&nbsp;&nbsp;&nbsp;&nbsp;├── 📁 Tower D</div>
            <div>│&nbsp;&nbsp;&nbsp;&nbsp;└── 📁 Tower E</div>
            <div>├── 📁 <span className="text-blue-300">Association Documents</span></div>
            <div>├── 📁 <span className="text-rose-300">Court Proceedings</span></div>
            <div className="pt-1 text-teal-300 font-medium">
              └── 📊 Skyview Master Register (Spreadsheet)
            </div>
            <div className="pl-6 text-slate-400 text-[11px]">
              ├── 📄 Sheet: "Register" (17 Standardized Columns)
            </div>
            <div className="pl-6 text-slate-400 text-[11px] flex items-center gap-1">
              <span>└──</span> <Lock className="w-3 h-3 text-amber-400 inline" /> <span>Hidden Sheet: "Settings" (Stores Root, Tower, &amp; Sheet IDs)</span>
            </div>
          </div>
        </div>

        {/* Step by Step Progress Status during Initialization */}
        {isInitializing && (
          <div className="max-w-md mx-auto mb-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>Provisioning Progress</span>
              <span className="text-teal-700 font-mono">
                {completedSteps.length} / {INIT_STEPS.length}
              </span>
            </h3>
            <div className="space-y-2.5">
              {INIT_STEPS.map((step, idx) => {
                const isDone = completedSteps.includes(step.id);
                const isCurrent = currentStepIndex === idx && !isDone;
                return (
                  <div 
                    key={step.id} 
                    className={`flex items-start gap-2.5 text-xs transition-opacity ${
                      isDone 
                        ? 'text-slate-800' 
                        : isCurrent 
                          ? 'text-teal-900 font-medium' 
                          : 'text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <div>
                      <span className={isDone ? 'font-medium' : ''}>{step.label}</span>
                      <p className="text-[11px] text-slate-400 leading-tight">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {redirecting && (
              <div className="mt-4 pt-3 border-t border-slate-200 text-center text-xs font-bold text-teal-700 flex items-center justify-center gap-1.5 animate-pulse">
                <span>Initialization complete! Redirecting to Member Portal...</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>
        )}

        {/* Primary Action Button */}
        {!isInitializing && (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleStartSetup}
              className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-teal-700/20 transition-all inline-flex items-center gap-3 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <span>Initialize Skyview Repository</span>
            </button>
            <p className="text-xs text-slate-400 mt-3 font-medium">
              Requires one click. After initialization, you will be automatically redirected to the Member Portal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
