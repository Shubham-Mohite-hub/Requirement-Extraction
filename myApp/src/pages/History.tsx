import React, { useEffect, useState } from 'react';
import { Calendar, FileText, ArrowRight, Clock } from 'lucide-react';

interface HistoryPageProps {
  onViewItem: (item: any) => void;
}

export default function HistoryPage({ onViewItem }: HistoryPageProps) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => console.error("History fetch error:", err));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full text-slate-400">
      <div className="w-6 h-6 border-2 border-[#4729e0] border-t-transparent rounded-full animate-spin mr-3"></div>
      Loading your history...
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
        <Clock className="text-[#4729e0]" /> Extraction History
      </h2>
      
      <div className="grid gap-4 pb-20">
        {history.length > 0 ? history.map((item: any) => (
          <div key={item._id} className="bg-[#1c1a2e] border border-slate-800 p-5 rounded-2xl hover:border-[#4729e0]/50 transition-all group flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4729e0]">
                {item.project_id || "UNCATEGORIZED"}
              </span>
              <h3 className="text-white font-bold capitalize">
                {item.predicted_category || "Requirement Analysis"}
              </h3>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#4729e0]" /> 
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-[#4729e0]" /> 
                  {item.analysis_details?.functional_requirements?.length || 0} Requirements
                </span>
              </div>
            </div>
            
            {/* Functional Arrow Button */}
            <button 
              onClick={() => onViewItem(item)}
              className="p-3 bg-[#4729e0]/10 text-[#4729e0] rounded-xl group-hover:bg-[#4729e0] group-hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title="View Details"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )) : (
          <div className="text-center py-20 bg-[#1c1a2e] border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500 italic">No history found. Start by extracting some requirements!</p>
          </div>
        )}
      </div>
    </div>
  );
}