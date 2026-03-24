import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Clock, FileText, ChevronRight, Folder, Calendar, Loader2 } from "lucide-react";

interface HistoryItem {
  _id: string;
  fileName?: string;
  createdAt: string;
  predicted_category: string;
  analysis_details: any;
}

export default function HistoryPage({ onViewItem }: { onViewItem: (item: any) => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { projectId } = useParams();
  const { userId } = useAuth();
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectName = queryParams.get("name") || "Project Workspace";

  useEffect(() => {
    const fetchHistory = async () => {
      if (!projectId || !userId) return;

      try {
        // Updated to 127.0.0.1 to prevent connection issues
        const response = await fetch(`http://127.0.0.1:5000/api/history/${projectId}/${userId}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [projectId, userId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#141121]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#4729e0]" size={40} />
          <p className="text-[#4729e0] font-medium animate-pulse">Loading {projectName} history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[#4729e0] mb-1">
          <Folder size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Project History</span>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">
          {projectName}
        </h2>
      </div>

      {history.length === 0 ? (
        <div className="text-center p-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
          <Clock className="mx-auto mb-4 text-slate-700" size={48} />
          <p className="text-xl font-bold text-slate-300">No history found</p>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm">
            Analyze some requirements in the <strong>Input</strong> tab to see them listed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item) => (
            <div 
              key={item._id}
              onClick={() => onViewItem(item)}
              className="group flex items-center justify-between p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-[#4729e0]/50 hover:bg-[#4729e0]/5 transition-all cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-5">
                <div className="size-14 rounded-xl bg-[#4729e0]/10 flex items-center justify-center text-[#4729e0] group-hover:bg-[#4729e0] group-hover:text-white transition-all shadow-lg">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
                    {item.fileName || "Requirement Extraction"}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="bg-slate-800 text-[#4729e0] px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">
                      {item.predicted_category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(item.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#4729e0] opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <span className="text-sm font-bold">Open Report</span>
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}