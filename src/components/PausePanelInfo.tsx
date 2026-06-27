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
  onReset = () => {}
}) => {
  const totalReps = Object.values(repetitions).reduce((sum, val) => sum + val, 0);

  return (
    <div className="w-full min-h-[400px] flex items-center justify-center p-6 bg-gray-100 rounded-2xl border border-gray-300 shadow-inner">
      <div className="bg-white border border-gray-400 p-8 w-full max-w-xl shadow-md rounded-sm relative text-left">
        {/* Yellow top decorator line/triangle as seen in the top edge of the image */}
        <div className="absolute top-0 left-1/4 w-3 h-1.5 bg-[#f59e0b] clip-path-triangle"></div>

        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-600 text-sm font-medium select-none">
              {sessionPaused ? 'Session paused' : 'Session active'}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2 select-none tracking-tight">
              Workout Summary
            </h2>
          </div>
          <div className="text-right">
            <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider block mb-0.5 select-none">
              Avg FPS
            </span>
            <span className="text-4xl font-extrabold text-gray-900 leading-none select-none">
              {avgFps}
            </span>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden border border-gray-400 mb-8 rounded-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-400">
                <th className="border-r border-gray-400 px-4 py-2.5 text-left font-bold text-gray-900 select-none w-2/3">
                  Pose Type
                </th>
                <th className="px-4 py-2.5 text-center font-bold text-gray-900 select-none">
                  Repetitions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-400">
                <td className="border-r border-gray-400 px-4 py-2.5 text-left text-gray-800">
                  Tree
                </td>
                <td className="px-4 py-2.5 text-center text-gray-800">
                  {repetitions.Tree}
                </td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="border-r border-gray-400 px-4 py-2.5 text-left text-gray-800">
                  Mountain
                </td>
                <td className="px-4 py-2.5 text-center text-gray-800">
                  {repetitions.Mountain}
                </td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="border-r border-gray-400 px-4 py-2.5 text-left text-gray-900 relative bg-blue-50/10">
                  {/* Focus border with blue handle dot matching the screenshot */}
                  <div className="absolute inset-[-1px] border-2 border-blue-500 pointer-events-none">
                    <div className="absolute bottom-[-5px] right-[-5px] w-2.5 h-2.5 bg-blue-600 border border-white rounded-full"></div>
                  </div>
                  <span className="font-semibold text-blue-600">Warrior II</span>
                </td>
                <td className="px-4 py-2.5 text-center text-gray-800">
                  {repetitions.WarriorII}
                </td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="border-r border-gray-400 px-4 py-2.5 text-left text-gray-800">
                  Chair
                </td>
                <td className="px-4 py-2.5 text-center text-gray-800">
                  {repetitions.Chair}
                </td>
              </tr>
              <tr className="bg-gray-50/50 font-bold">
                <td className="border-r border-gray-400 px-4 py-2.5 text-left text-gray-900">
                  Total
                </td>
                <td className="px-4 py-2.5 text-center text-gray-900">
                  {totalReps}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Buttons Segmented Control */}
        <div className="flex justify-center">
          <div className="inline-flex border border-gray-400 rounded-sm overflow-hidden shadow-sm">
            <button 
              onClick={onClose}
              className="bg-[#fef08a] hover:bg-[#fde047] active:bg-[#facc15] text-gray-900 font-semibold px-12 py-3 text-sm transition-colors border-r border-gray-400 focus:outline-none"
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
