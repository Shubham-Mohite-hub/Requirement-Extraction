import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function KnowledgeGraph({ data }: { data: any }) {
  const graphData = useMemo(() => {
    if (!data || !data.analysis_details) return { nodes: [], links: [] };

    const { analysis_details, metadata, predicted_category } = data;
    
    // 1. Root Node (The Project)
    const nodes: any[] = [{ 
      id: 'Root', 
      label: metadata?.project_id || 'Project', 
      color: '#4729e0', 
      val: 12,
      type: 'Project'
    }];
    const links: any[] = [];

    // 2. Stakeholder Nodes
    analysis_details.stakeholders?.forEach((s: string) => {
      nodes.push({ id: s, label: `Stakeholder: ${s}`, color: '#10b981', val: 8, type: 'Stakeholder' });
      links.push({ source: 'Root', target: s });
    });

    // 3. Functional Requirements (Limited to top 10 for clarity)
    analysis_details.functional_requirements?.slice(0, 10).forEach((req: string, i: number) => {
      const id = `FR-${i}`;
      // Truncate label for the node
      const shortLabel = req.length > 30 ? req.substring(0, 30) + "..." : req;
      nodes.push({ id, label: `Req: ${shortLabel}`, color: '#3b82f6', val: 5, type: 'Requirement' });
      links.push({ source: 'Root', target: id });
    });

    // 4. Category Node
    if (predicted_category) {
      nodes.push({ id: 'Cat', label: `Domain: ${predicted_category}`, color: '#f59e0b', val: 7, type: 'Domain' });
      links.push({ source: 'Root', target: 'Cat' });
    }

    return { nodes, links };
  }, [data]);

  return (
    <div className="h-full w-full bg-[#141121] rounded-2xl border border-slate-800/50 relative overflow-hidden">
      {/* Legend Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Knowledge Map</h3>
        <p className="text-slate-500 text-xs mb-4">Interactive Entity Relationship Graph</p>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-[#4729e0]" /> Project
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-[#10b981]" /> Stakeholders
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Requirements
          </div>
        </div>
      </div>

      <ForceGraph2D
        graphData={graphData}
        backgroundColor="#141121"
        nodeLabel="label"
        nodeRelSize={6}
        nodeColor={(node: any) => node.color}
        linkColor={() => "#334155"}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        d3VelocityDecay={0.3}
      />
    </div>
  );
}