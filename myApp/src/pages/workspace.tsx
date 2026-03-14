import { useState } from "react";
import Sidebar from "../components/Sidebar";
import InputPage from "../components/input";
import RequirementsPanel from "../components/output";

export default function App() {
  const [showRequirements, setShowRequirements] = useState(false);
  const [analysisData, setAnalysisData] = useState(null); // New state for data
  const [loading, setLoading] = useState(false);         // New state for loading
   
  const handleExtract = async (text, sourceType) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/analyze-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text, 
          projectId: "VIIT_HACK_01", // You can make this dynamic later
          source: sourceType 
        }),
      });

      const data = await response.json();
      console.log("Data from Backend:", data);
      setAnalysisData(data);
      setShowRequirements(true); // Switch to the dashboard view
    } catch (error) {
      alert("Backend not responding. Make sure 'node index.js' is running!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex h-screen bg-[#141121] text-slate-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {!showRequirements ? (
          <InputPage onExtract={handleExtract} />
        ) : (
          <RequirementsPanel data={analysisData} />
        )}
      </div>

    </div>
  );
}