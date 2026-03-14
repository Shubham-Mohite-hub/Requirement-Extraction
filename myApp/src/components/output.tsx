import React from 'react';
import {
  Network,
  Gauge,
  Users,
  Gavel,
  Calendar,
  AlertCircle,
  Pencil,
  ArrowLeft,
  PlusCircle,
  Check
} from 'lucide-react';

// --- Reusable Components ---

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

function RequirementItem({ title, source, checked = true }: { title: string; source: string; checked?: boolean; key?:any }) {
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

function CompactItem({ title, checked = true }: { title: string; checked?: boolean; key?:any }) {
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
  // Safety check for loading/null data
  if (!data || !data.analysis_details) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
        <p>No requirements data available. Please run extraction first.</p>
      </div>
    );
  }

  const { analysis_details, metadata, predicted_category } = data;

  return (
    <div className="flex h-screen bg-[#141121] text-slate-100 font-sans antialiased overflow-hidden selection:bg-[#4729e0]/30">
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
        
        {/* Header */}
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
            <p className="text-slate-400 text-sm max-w-2xl">
              AI-generated results from {metadata?.source || "input source"}. Review and confirm items below.
            </p>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-8 pb-24 flex-1">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Functional Requirements */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Network className="w-5 h-5 text-[#4729e0]" />
                <h3 className="text-lg font-bold text-white">Functional Requirements</h3>
              </div>
              <div className="grid gap-3">
                {analysis_details["functional_requirements"]?.map((req: string, i: number) => (
                  <RequirementItem key={i} title={req} source="AI Predicted Function" />
                ))}
              </div>
            </section>

            {/* Non Functional */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-5 h-5 text-[#4729e0]" />
                <h3 className="text-lg font-bold text-white">Non-Functional Requirements</h3>
              </div>
              <div className="grid gap-3">
                {analysis_details["non_functional_requirements"]?.map((req: string, i: number) => (
                  <RequirementItem key={i} title={req} source="Quality Constraint" />
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Stakeholders */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[#4729e0]" />
                  <h3 className="text-lg font-bold text-white">Stakeholders</h3>
                </div>
                <div className="grid gap-3">
                  {analysis_details["stakeholders"]?.map((item: string, i: number) => (
                    <CompactItem key={i} title={item} />
                  ))}
                </div>
              </section>

              {/* Timelines */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#4729e0]" />
                  <h3 className="text-lg font-bold text-white">Timelines</h3>
                </div>
                <div className="grid gap-3">
                  {analysis_details["timelines"]?.map((item: string, i: number) => (
                    <CompactItem key={i} title={item} />
                  ))}
                </div>
              </section>
            </div>

          </div>
        </div>

        {/* Sticky Footer */}
        <footer className="sticky bottom-0 w-full px-8 py-4 bg-[#141121]/90 backdrop-blur-lg border-t border-slate-800 z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button 
                onClick={() => window.location.reload()} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors font-semibold text-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              Analyze New Source
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#4729e0] text-white hover:bg-[#4729e0]/90 transition-all font-bold text-sm shadow-lg shadow-[#4729e0]/20">
              Confirm & Save Results
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}