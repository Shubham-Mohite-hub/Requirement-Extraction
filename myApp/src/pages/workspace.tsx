import { useState } from "react";
import Sidebar from "../components/Sidebar";
import InputPage from "../components/input";
import RequirementsPanel from "../components/output";
import HistoryPage from "./History"; 

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

          return <InputPage onExtract={handleExtract} />;
        })()}
      </div>
    </div>
  );
}