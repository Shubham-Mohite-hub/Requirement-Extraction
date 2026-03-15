import React from 'react';
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
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Reusable Components (STRICT TYPES FIXED) ---

function CustomCheckbox({ checked = false }: { checked?: boolean }) {
  return (
    <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
      <input
        type="checkbox"
        defaultChecked={checked}
        className="peer appearance-none w-5 h-5 border border-slate-700 rounded bg-transparent checked:bg-[#4729e0] checked:border-[#4729e0] cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#4729e0]/50"
      />
      <Check
        strokeWidth={3}
        className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
      />
    </div>
  );
}

// Fixed: No 'key' property in the type below
interface RequirementItemProps {
  title: string;
  source: string;
  checked?: boolean;
}

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
      <button className="p-2 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
}

// Fixed: No 'key' property in the type below
interface CompactItemProps {
  title: string;
  checked?: boolean;
}

function CompactItem({ title, checked = true }: CompactItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#1c1a2e] border border-slate-800 rounded-xl group hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-3">
        <CustomCheckbox checked={checked} />
        <span className="text-slate-100 font-medium text-sm">{title}</span>
      </div>
      <button className="p-1.5 text-slate-400 hover:text-[#4729e0] transition-colors">
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- Main Panel ---

export default function RequirementsPanel({ data }: { data: any }) {
  if (!data || !data.analysis_details) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
        <p>No requirements data available. Please run extraction first.</p>
      </div>
    );
  }

  const { analysis_details, metadata, predicted_category } = data;

  const downloadPDF = () => {
    const doc = new jsPDF();
    const projectName = metadata?.project_id || "ReqMind-Analysis";

    // 1. Header & Brand
    doc.setFontSize(22);
    doc.setTextColor(71, 41, 224); // Brand Purple
    doc.text("ReqMind AI - Requirements Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Project ID: ${projectName}`, 14, 30);
    doc.text(`Category: ${predicted_category}`, 14, 35);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);
    doc.line(14, 45, 196, 45);

    // 2. Summary Section (Stakeholders & Timelines)
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Project Context", 14, 55);
    
    doc.setFontSize(10);
    const stakeholders = analysis_details.stakeholders?.join(", ") || "None";
    const timelineData = analysis_details.timelines?.join(", ") || "None";
    
    doc.text(`Stakeholders: ${doc.splitTextToSize(stakeholders, 170)}`, 14, 62);
    doc.text(`Key Timelines: ${doc.splitTextToSize(timelineData, 170)}`, 14, 70);

    // 3. Functional Requirements Table
    doc.setFontSize(14);
    doc.text("Functional Requirements", 14, 85);
    
    const functionalRows = analysis_details.functional_requirements?.map((req: string, i: number) => [i + 1, req]) || [];

    autoTable(doc, {
      startY: 90,
      head: [['#', 'Requirement Description']],
      body: functionalRows,
      headStyles: { fillColor: [71, 41, 224] },
      theme: 'striped',
    });

    // 4. Non-Functional Requirements Table
    // This part is crucial: we get the end position of the previous table
    const finalYAfterFunctional = (doc as any).lastAutoTable.finalY || 150;
    
    doc.setFontSize(14);
    doc.text("Non-Functional Requirements", 14, finalYAfterFunctional + 15);

    const nonFunctionalRows = analysis_details.non_functional_requirements?.map((req: string, i: number) => [i + 1, req]) || [];

    autoTable(doc, {
      startY: finalYAfterFunctional + 20,
      head: [['#', 'Quality / Constraint']],
      body: nonFunctionalRows,
      headStyles: { fillColor: [100, 100, 100] },
      theme: 'grid',
    });

    // 5. Final Footer
    const finalPageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= finalPageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${finalPageCount} - Generated by ReqMind AI`, 14, 285);
    }

    doc.save(`${projectName}_Full_Report.pdf`);
  };

  return (
    <div className="flex h-screen bg-[#141121] text-slate-100 font-sans antialiased overflow-hidden selection:bg-[#4729e0]/30">
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
        <header className="px-8 pt-10 pb-6 shrink-0">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4729e0] bg-[#4729e0]/10 px-2 py-0.5 rounded">
                {metadata?.project_id || "Project Analysis"}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 text-xs">{predicted_category}</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              Extracted Requirements Review
            </h2>
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
                {analysis_details["functional_requirements"]?.map((req: string, i: number) => (
                  <RequirementItem key={`func-${i}`} title={req} source="AI Predicted Function" />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-5 h-5 text-[#4729e0]" />
                <h3 className="text-lg font-bold text-white">Non-Functional Requirements</h3>
              </div>
              <div className="grid gap-3">
                {analysis_details["non_functional_requirements"]?.map((req: string, i: number) => (
                  <RequirementItem key={`nonfunc-${i}`} title={req} source="Quality Constraint" />
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[#4729e0]" />
                  <h3 className="text-lg font-bold text-white">Stakeholders</h3>
                </div>
                <div className="grid gap-3">
                  {analysis_details["stakeholders"]?.map((item: string, i: number) => (
                    <CompactItem key={`stake-${i}`} title={item} />
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#4729e0]" />
                  <h3 className="text-lg font-bold text-white">Timelines</h3>
                </div>
                <div className="grid gap-3">
                  {analysis_details["timelines"]?.map((item: string, i: number) => (
                    <CompactItem key={`time-${i}`} title={item} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        <footer className="sticky bottom-0 w-full px-8 py-4 bg-[#141121]/90 backdrop-blur-lg border-t border-slate-800 z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button 
              onClick={() => window.location.reload()} 
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors font-semibold text-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              New Analysis
            </button>
            <div className="flex gap-3">
                <button 
                  onClick={downloadPDF}
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#4729e0] text-[#4729e0] hover:bg-[#4729e0]/10 transition-all font-bold text-sm"
                >
                  <Download className="w-5 h-5" />
                  Download Report
                </button>
                <button type="button" className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#4729e0] text-white hover:bg-[#4729e0]/90 transition-all font-bold text-sm shadow-lg shadow-[#4729e0]/20">
                  Confirm & Save Results
                  <PlusCircle className="w-5 h-5" />
                </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}