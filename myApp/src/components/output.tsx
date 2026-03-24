import React, { useState } from 'react';
import {
  Network,
  Gauge,
  AlertCircle,
  Pencil,
  ArrowLeft,
  PlusCircle,
  Check,
  Download,
  Loader2,
  Share2,
  History,      // Added for the state change
  ChevronRight  // Added for the state change
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
function RequirementCard({ title, source, checked = true }: RequirementItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#1c1a2e] border border-slate-800 rounded-xl hover:border-[#4729e0]/50 transition-all group">
      <div className="flex items-center gap-4">
        <CustomCheckbox checked={checked} />
        <div className="flex flex-col">
          <span className="text-slate-100 font-medium text-sm">{title}</span>
          <span className="text-xs text-slate-400">{source}</span>
        </div>
      </div>
      <button className="p-2 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
}

interface RequirementsPanelProps {
  data: any;
  setView: (view: string) => void;
  projectId?: string;
  userId?: string;
}

export default function RequirementsPanel({ data, setView, projectId, userId }: RequirementsPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!data || !data.analysis_details) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-[#141121]">
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
      const response = await fetch('http://127.0.0.1:5000/api/jira-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements: analysis_details.functional_requirements,
          projectKey: 'KAN' 
        }),
      });

      if (response.ok) {
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 5000);
      }
    } catch (error) {
      console.error("Jira Error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- MongoDB Save Logic ---
  const handleSave = async () => {
    setIsSaving(true);
    
    // 1. Construct the payload with fallbacks
    // We check props first, then the data object, then the metadata inside data
    const finalProjectId = projectId || data.project_id || data.metadata?.project_id || data.projectId;
    const finalUserId = userId || data.userId || data.metadata?.userId;

    const payload = {
      ...data,
      project_id: finalProjectId,
      userId: finalUserId
    };

    // DEBUG: Check this in your browser console (F12) to see if these are defined
    console.log("Payload being sent to backend:", payload);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/save-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsSaved(true);
      } else {
        const errorData = await response.json();
        console.error("Backend validation failed:", errorData);
        alert(`Save failed: ${errorData.message || "Validation Error"}`);
      }
    } catch (error) {
      console.error("Network/Server Error:", error);
      alert("Server is offline or unreachable.");
    } finally {
      setIsSaving(false);
    }
  };

  <div className="flex items-center gap-3">
  {!isSaved ? (
    <button 
      onClick={handleSave} 
      disabled={isSaving}
      className="flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all font-bold text-sm shadow-lg shadow-[#4729e0]/20 bg-[#4729e0] text-white hover:bg-[#4729e0]/90 disabled:opacity-70"
    >
      {isSaving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <PlusCircle className="w-4 h-4" />
          <span>Confirm & Save</span>
        </>
      )}
    </button>
  ) : (
    /* This button appears ONLY after handleSave completes successfully */
    <button 
      onClick={() => setView("history")} 
      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all animate-in zoom-in-95 duration-300"
    >
      <History className="w-4 h-4" /> 
      Saved to History
      <ChevronRight className="w-4 h-4 ml-1" />
    </button>
  )}
</div>

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(71, 41, 224);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("ReqMind AI: Requirements Report", 14, 25);
    doc.setFontSize(10);
    doc.text(`Project: ${projectId || metadata?.project_id || "Report"}`, 14, 34);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("1. Functional Requirements", 14, 55);

    const functionalRows = analysis_details.functional_requirements?.map((req: string, i: number) => [`FR-${i + 1}`, req]) || [];
    autoTable(doc, {
      startY: 60,
      head: [['ID', 'Requirement Description']],
      body: functionalRows,
      headStyles: { fillColor: [71, 41, 224] },
    });

    doc.save(`ReqMind_Report.pdf`);
  };

  return (
    <div className="flex h-screen bg-[#141121] text-slate-100 overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
        <header className="px-8 pt-10 pb-6 shrink-0">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Requirements Review</h2>
            <p className="text-slate-400 text-sm italic">{predicted_category} | {projectId || metadata?.project_id}</p>
          </div>
        </header>

        <div className="px-8 pb-32 flex-1">
          <div className="max-w-5xl mx-auto space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Network className="w-5 h-5 text-[#4729e0]" />
                <h3 className="text-lg font-bold text-white">Functional Requirements</h3>
              </div>
              <div className="grid gap-3">
                {analysis_details.functional_requirements?.map((req: string, i: number) => (
                  <RequirementCard key={i} title={req} source="AI Extraction" />
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
                  <RequirementCard key={i} title={req} source="Non-Functional" />
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="fixed bottom-0 right-0 left-0 lg:left-64 px-8 py-6 bg-[#141121]/95 backdrop-blur-md border-t border-slate-800 z-20">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> New Analysis
            </button>
            
            <div className="flex gap-3">
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

              <button onClick={downloadPDF} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all font-bold text-sm">
                <Download className="w-4 h-4" /> Download Report
              </button>

              <div className="flex items-center gap-3">
                {!isSaved ? (
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all font-bold text-sm shadow-lg shadow-[#4729e0]/20 bg-[#4729e0] text-white hover:bg-[#4729e0]/90 disabled:opacity-70"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                    {isSaving ? "Saving..." : "Confirm & Save"}
                  </button>
                ) : (
                  <button 
                    onClick={() => setView("history")} 
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-all animate-in zoom-in-95 duration-300"
                  >
                    <History className="w-4 h-4" /> 
                    Saved to History
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}