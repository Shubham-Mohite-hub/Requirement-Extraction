import { useState } from "react";
import Sidebar from "../components/Sidebar";
import InputPage from "../components/input";
import RequirementsPanel from "../components/output";
import HistoryPage from "./History"; 
import PRDView from "../components/PRDview";
import KnowledgeGraph from "../components/KnowledgeGraph";

export default function App() {
  const [showRequirements, setShowRequirements] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("input");

  const handleExtract = async (text, sourceType) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/analyze-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text, 
          projectId: "VIIT_HACK_01", 
          source: sourceType 
        }),
      });

      const data = await response.json();
      console.log("Data from Backend:", data);
      setAnalysisData(data);
      setShowRequirements(true);
      setCurrentView("dashboard"); 
    } catch (error) {
      alert("Backend not responding. Make sure 'node index.js' is running!");
    } finally {
      setLoading(false);
    }
  };

  // Function to load a specific item from history into the dashboard
  const handleViewHistoryItem = (itemData: any) => {
    setAnalysisData(itemData);
    setCurrentView("dashboard");
  };

  const renderContent = () => {
    switch (currentView) {
      case "history":
        return <HistoryPage onViewItem={handleViewHistoryItem} />;
      
      case "dashboard":
        return analysisData ? (
          <RequirementsPanel data={analysisData} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Please extract requirements first.
          </div>
        );

      case "prd":
        return analysisData ? (
          <PRDView data={analysisData} />
        ) : (
          <div className="p-20 text-center text-slate-500">
            Please extract requirements first to generate a PRD.
          </div>
        );

      case "input":
      default:
        return <InputPage onExtract={handleExtract} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#141121] text-slate-100 overflow-hidden">
      
      <Sidebar setView={setCurrentView} currentView={currentView} />

      <div className="flex-1 overflow-auto relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-[#141121]/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-[#4729e0] border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-[#4729e0] font-bold animate-pulse">Processing Requirements...</p>
            </div>
          </div>
        )}

        {(() => {
          if (currentView === "history") {
            // Pass the handler to HistoryPage
            return <HistoryPage onViewItem={handleViewHistoryItem} />;
          }
          
          if (currentView === "dashboard" && analysisData) {
            return <RequirementsPanel data={analysisData} />;
          }
          // Inside workspace.tsx switcher logic:
if (currentView === "prd") {
  return analysisData ? (
    <PRDView data={analysisData} />
  ) : (
    <div className="p-20 text-center text-slate-500">
      Please extract requirements first to generate a PRD.
    </div>
  );
}

{currentView === "graph" && (
  analysisData ? (
    <div className="h-[calc(100vh-20px)] p-4">
      <KnowledgeGraph data={analysisData} />
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-slate-500">
      Please extract requirements first to view the Knowledge Map.
    </div>
  )
)}

          return <InputPage onExtract={handleExtract} />;
        })()}
      </div>
    </div>
  );
}