import React from 'react';

interface Repetitions {
  Tree: number;
  Mountain: number;
  WarriorII: number;
  Chair: number;
}

interface PausePanelInfoProps {
  sessionPaused?: boolean;
  avgFps?: number;
  repetitions?: Repetitions;
  onClose?: () => void;
  onReset?: () => void;
  isDark?: boolean;
}

const PausePanelInfo: React.FC<PausePanelInfoProps> = ({ 
  sessionPaused = true,
  avgFps = 53,
  repetitions = {
    Tree: 0,
    Mountain: 0,
    WarriorII: 0,
    Chair: 0,
  },
  onClose = () => {},
  onReset = () => {},
  isDark = false
}) => {
  const totalReps = Object.values(repetitions).reduce((sum, val) => sum + val, 0);

  return (
    <div className={`w-full min-h-[400px] flex items-center justify-center p-6 rounded-2xl border shadow-inner transition-colors duration-300 ${
      isDark ? "bg-gray-950 border-gray-800" : "bg-slate-100 border-slate-200"
    }`}>
      <div className={`border p-8 w-full max-w-xl shadow-md rounded-2xl relative text-left transition-colors duration-300 ${
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
      }`}>
        {/* Yellow top decorator line/triangle */}
        <div className="absolute top-0 left-1/4 w-3 h-1.5 bg-[#f59e0b] clip-path-triangle"></div>

        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className={`text-sm font-medium select-none transition-colors duration-300 ${isDark ? "text-gray-400" : "text-slate-500"}`}>
              {sessionPaused ? 'Session paused' : 'Session active'}
            </p>
            <h2 className={`text-2xl font-bold mt-2 select-none tracking-tight transition-colors duration-300 ${isDark ? "text-white" : "text-slate-900"}`}>
              Workout Summary
            </h2>
          </div>
          <div className="text-right">
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-0.5 select-none transition-colors duration-300 ${isDark ? "text-gray-500" : "text-slate-400"}`}>
              Avg FPS
            </span>
            <span className={`text-4xl font-extrabold leading-none select-none transition-colors duration-300 ${isDark ? "text-white" : "text-slate-900"}`}>
              {avgFps}
            </span>
          </div>
        </div>

        {/* Table Section */}
        <div className={`overflow-hidden border mb-8 rounded-xl transition-colors duration-300 ${isDark ? "border-gray-800" : "border-slate-200"}`}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className={`border-b transition-colors duration-300 ${isDark ? "bg-gray-950 border-gray-850" : "bg-slate-50 border-slate-200"}`}>
                <th className={`border-r px-4 py-2.5 text-left font-bold select-none w-2/3 transition-colors duration-300 ${
                  isDark ? "text-gray-300 border-gray-850" : "text-slate-700 border-slate-200"
                }`}>
                  Pose Type
                </th>
                <th className={`px-4 py-2.5 text-center font-bold select-none transition-colors duration-300 ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                  Repetitions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b transition-colors duration-300 ${isDark ? "border-gray-800" : "border-slate-200"}`}>
                <td className={`border-r px-4 py-2.5 text-left transition-colors duration-300 ${
                  isDark ? "text-gray-400 border-gray-800" : "text-slate-750 border-slate-200"
                }`}>
                  Tree
                </td>
                <td className={`px-4 py-2.5 text-center transition-colors duration-300 ${isDark ? "text-gray-450" : "text-slate-650"}`}>
                  {repetitions.Tree}
                </td>
              </tr>
              <tr className={`border-b transition-colors duration-300 ${isDark ? "border-gray-800" : "border-slate-200"}`}>
                <td className={`border-r px-4 py-2.5 text-left transition-colors duration-300 ${
                  isDark ? "text-gray-400 border-gray-800" : "text-slate-750 border-slate-200"
                }`}>
                  Mountain
                </td>
                <td className={`px-4 py-2.5 text-center transition-colors duration-300 ${isDark ? "text-gray-450" : "text-slate-650"}`}>
                  {repetitions.Mountain}
                </td>
              </tr>
              <tr className={`border-b transition-colors duration-300 ${isDark ? "border-gray-800" : "border-slate-200"}`}>
                <td className={`border-r px-4 py-2.5 text-left relative transition-colors duration-300 ${
                  isDark ? "border-gray-800" : "border-slate-200"
                }`}>
                  <div className="absolute inset-[-1px] border-2 border-blue-500 pointer-events-none rounded-xl">
                    <div className="absolute bottom-[-5px] right-[-5px] w-2.5 h-2.5 bg-blue-600 border border-white rounded-full"></div>
                  </div>
                  <span className="font-semibold text-blue-600">Warrior II</span>
                </td>
                <td className={`px-4 py-2.5 text-center transition-colors duration-300 ${isDark ? "text-gray-400" : "text-slate-650"}`}>
                  {repetitions.WarriorII}
                </td>
              </tr>
              <tr className={`border-b transition-colors duration-300 ${isDark ? "border-gray-800" : "border-slate-200"}`}>
                <td className={`border-r px-4 py-2.5 text-left transition-colors duration-300 ${
                  isDark ? "text-gray-400 border-gray-800" : "text-slate-750 border-slate-200"
                }`}>
                  Chair
                </td>
                <td className={`px-4 py-2.5 text-center transition-colors duration-300 ${isDark ? "text-gray-450" : "text-slate-650"}`}>
                  {repetitions.Chair}
                </td>
              </tr>
              <tr className={`font-bold transition-colors duration-300 ${isDark ? "bg-slate-900/50" : "bg-gray-50/50"}`}>
                <td className={`border-r px-4 py-2.5 text-left transition-colors duration-300 ${
                  isDark ? "text-white border-gray-805" : "text-slate-800 border-slate-200"
                }`}>
                  Total
                </td>
                <td className={`px-4 py-2.5 text-center transition-colors duration-300 ${isDark ? "text-white" : "text-slate-800"}`}>
                  {totalReps}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Buttons Segmented Control */}
        <div className="flex justify-center">
          <div className={`inline-flex border rounded-xl overflow-hidden shadow-sm transition-colors duration-300 ${
            isDark ? "border-gray-800" : "border-slate-200"
          }`}>
            <button 
              onClick={onClose}
              className="bg-[#fef08a] hover:bg-[#fde047] active:bg-[#facc15] text-gray-900 font-semibold px-12 py-3 text-sm transition-colors border-r border-gray-300 focus:outline-none"
            >
              Close
            </button>
            <button 
              onClick={onReset}
              className="bg-[#bbf7d0] hover:bg-[#86efac] active:bg-[#4ade80] text-gray-900 font-semibold px-12 py-3 text-sm transition-colors focus:outline-none"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PausePanelInfo;
