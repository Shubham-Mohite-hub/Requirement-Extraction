import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, FolderOpen, Loader2, LayoutGrid } from "lucide-react";

interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function ProjectSelection() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch live projects from your Node.js backend
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/projects/${user.id}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user?.id]);

  // 2. Create a new project and save it to MongoDB
  const handleCreateProject = async () => {
    const projectName = prompt("Enter New Project Name:");
    if (!projectName || !user?.id) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          userId: user.id,
          description: "Analysis workspace"
        }),
      });

      const newProj = await response.json();
      if (newProj._id) {
        // Redirect immediately to the new project workspace
        navigate(`/workplace/${newProj._id}?name=${encodeURIComponent(newProj.name)}`);
      }
    } catch (error) {
      alert("Failed to create project. Is backend running?");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0c1d] text-white p-8 md:p-12">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#4729e0] mb-2">
            <LayoutGrid size={18} />
            <span className="text-xs font-bold uppercase tracking-tighter">Workspace Hub</span>
          </div>
          <h1 className="text-4xl font-black text-white">Project Selection</h1>
          <p className="text-slate-400 mt-1">Select a workspace to continue your analysis, {user?.firstName}.</p>
        </div>
        <button 
          onClick={handleCreateProject}
          className="group flex items-center gap-2 bg-[#4729e0] px-6 py-4 rounded-2xl font-bold shadow-xl shadow-[#4729e0]/20 hover:scale-105 transition-all"
        >
          <FolderPlus size={20} /> Create New Project
        </button>
      </header>

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center text-slate-500">
          <Loader2 className="animate-spin mb-4 text-[#4729e0]" size={40} />
          <p>Syncing your workspaces...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500">No projects found. Create your first one to get started!</p>
            </div>
          ) : (
            projects.map((proj) => (
              <div 
                key={proj._id}
                onClick={() => navigate(`/workplace/${proj._id}?name=${encodeURIComponent(proj.name)}`)}
                className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-[#4729e0] hover:bg-[#4729e0]/5 transition-all cursor-pointer"
              >
                <div className="size-12 rounded-xl bg-[#4729e0]/10 flex items-center justify-center text-[#4729e0] mb-6 group-hover:scale-110 transition-transform">
                  <FolderOpen size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-white">{proj.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {proj.description || "Project-specific requirement analysis."}
                </p>
                <div className="pt-4 border-t border-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Created {new Date(proj.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}