import React, { useState } from 'react';
import {
  Network,
  Gauge,
  Users,
  Calendar,
  AlertCircle,
  Pencil,
  ArrowLeft,
  PlusCircle,
  Check,
  Download,
  Loader2,
  Share2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Reusable Components ---
function CustomCheckbox({ checked = false }: { checked?: boolean }) {
  return (
    <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
      <input
        type="checkbox"
        defaultChecked={checked}
        className="peer appearance-none w-5 h-5 border border-slate-700 rounded bg-transparent checked:bg-[#4729e0] checked:border-[#4729e0] cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#4729e0]/50"
      />
      <Check strokeWidth={3} className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
    </div>
  );
}

interface RequirementItemProps { title: string; source: string; checked?: boolean; }
function RequirementItem({ title, source, checked = true }: RequirementItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#1c1a2e] border border-slate-800 rounded-xl hover:border-[#4729e0]/50 transition-all group">
      <div className="flex items-center gap-4">
        <CustomCheckbox checked={checked} />
        <div className="flex flex-col">
          <span className="text-slate-100 font-medium text-sm">{title}</span>
          <span className="text-xs text-slate-400">{source}</span>
        </div>
      </div>
      <button className="p-2 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="w-4 h-4" /></button>
    </div>
  );
}

interface CompactItemProps { title: string; checked?: boolean; }
function CompactItem({ title, checked = true }: CompactItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#1c1a2e] border border-slate-800 rounded-xl group hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-3">
        <CustomCheckbox checked={checked} />
        <span className="text-slate-100 font-medium text-sm">{title}</span>
      </div>
      <button className="p-1.5 text-slate-400 hover:text-[#4729e0] transition-colors"><Pencil className="w-4 h-4" /></button>
    </div>
  );
}

export default function RequirementsPanel({ data }: { data: any }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!data || !data.analysis_details) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
        <p>No requirements data available.</p>
      </div>
    );
  }

  const { analysis_details, metadata, predicted_category } = data;

  // --- Real Jira Sync Logic ---
  const handleJiraSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('http://localhost:5000/api/jira-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements: analysis_details.functional_requirements,
          projectKey: 'KAN' // Match your Jira Project Key
        }),
      });

      if (response.ok) {
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 5000);
      } else {
        alert("Jira Sync failed. Check backend configuration.");
      }
    } catch (error) {
      alert("Error connecting to Jira Bridge.");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- MongoDB Save Logic ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/save-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (error) {
      alert("Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(71, 41, 224);
    doc.text("ReqMind AI - Requirements Report", 14, 22);
    // ... (Your existing PDF code remains same)
    doc.save(`${metadata?.project_id || "Report"}.pdf`);
  };

  return (
    <div className="flex h-screen bg-[#141121] text-slate-100 overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
        <header className="px-8 pt-10 pb-6 shrink-0">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Requirements Review</h2>
            <p className="text-slate-400 text-sm italic">{predicted_category} | {metadata?.project_id}</p>
          </div>
        </header>

        <div className="px-8 pb-24 flex-1">
          <div className="max-w-5xl mx-auto space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Network className="w-5 h-5 text-[#4729e0]" />
                <h3 className="text-lg font-bold text-white">Functional Requirements</h3>
              </div>
              <div className="grid gap-3">
                {analysis_details.functional_requirements?.map((req: string, i: number) => (
                  <RequirementItem key={i} title={req} source="AI Extraction" />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-5 h-5 text-[#4729e0]" />
                <h3 className="text-lg font-bold text-white">Quality Constraints</h3>
              </div>
              <div className="grid gap-3">
                {analysis_details.non_functional_requirements?.map((req: string, i: number) => (
                  <RequirementItem key={i} title={req} source="Non-Functional" />
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="sticky bottom-0 w-full px-8 py-4 bg-[#141121]/90 backdrop-blur-lg border-t border-slate-800 z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> New Analysis
            </button>
            <div className="flex gap-3">
              {/* Jira Sync Button */}
              <button 
                onClick={handleJiraSync}
                disabled={isSyncing || syncSuccess}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all border ${
                  syncSuccess ? "bg-blue-600 border-blue-600 text-white" : "border-blue-500 text-blue-500 hover:bg-blue-500/10"
                }`}
              >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : syncSuccess ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {isSyncing ? "Syncing..." : syncSuccess ? "Synced to Jira" : "Export to Jira"}
              </button>

              <button onClick={downloadPDF} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#4729e0] text-[#4729e0] hover:bg-[#4729e0]/10 transition-all font-bold text-sm">
                <Download className="w-4 h-4" /> Download
              </button>

              <button 
                onClick={handleSave} 
                disabled={isSaving || isSaved}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all font-bold text-sm shadow-lg ${
                  isSaved ? "bg-green-600 text-white" : "bg-[#4729e0] text-white hover:bg-[#4729e0]/90 shadow-[#4729e0]/20"
                }`}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                {isSaving ? "Saving..." : isSaved ? "Saved" : "Confirm & Save"}
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}