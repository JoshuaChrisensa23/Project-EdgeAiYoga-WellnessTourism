import React from "react";

interface Metrics {
  angle1: number;
  angle2: number;
  accuracy: number;
}

interface InfoPanelProps {
  metrics: Metrics;
  selectedPose: string;
  setSelectedPose: (pose: string) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onFullScreen: () => void;
  onLogout?: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  metrics,
  selectedPose,
  setSelectedPose,
  isPaused,
  setIsPaused,
  isMuted,
  setIsMuted,
  onFullScreen,
}) => {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl flex flex-col justify-between border border-gray-800 h-fit space-y-4">
      <div>
        {/* Dropdown untuk memilih Target Pengujian Pose */}
        <div className="mb-6">
          <label
            htmlFor="pose-select-info"
            className="text-sm font-medium text-gray-300 block mb-2"
          >
            Pilih Target Pengujian Pose:
          </label>
          <select
            id="pose-select-info"
            title="Pilih Target Pengujian Pose"
            value={selectedPose}
            onChange={(e) => setSelectedPose(e.target.value)}
            className="w-full bg-gray-950 text-emerald-400 text-sm rounded-lg border border-gray-700 p-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="TREE">Tree Pose (Keseimbangan Vertikal)</option>
            <option value="WARRIOR_II">
              Warrior II Pose (Ekstensi Horizontal)
            </option>
            <option value="COBRA">Cobra Pose (Level Lantai)</option>
          </select>
        </div>

        <h2 className="text-lg font-bold mb-4 text-gray-200">
          Matriks Hasil Evaluasi
        </h2>

        <div className="space-y-3">
          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
            <span className="text-xs text-gray-400 block mb-1">
              Sudut Utama (Primer)
            </span>
            <span className="text-3xl font-black text-emerald-400">
              {metrics.angle1}°
            </span>
          </div>

          {selectedPose !== "COBRA" && (
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <span className="text-xs text-gray-400 block mb-1">
                Sudut Sekunder
              </span>
              <span className="text-3xl font-black text-emerald-300">
                {metrics.angle2}°
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="bg-gray-950 text-emerald-400 text-sm rounded-lg border border-gray-700 p-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer hover:bg-gray-900 transition-colors"
          >
            {isPaused ? "Lanjutkan Latihan" : "Pause Latihan"}
          </button>
          <div className="flex flex-row gap-2">
            <button
              onClick={onFullScreen}
              className="w-1/2 bg-gray-950 text-emerald-400 text-sm rounded-lg border border-gray-700 p-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer hover:bg-gray-900 transition-colors"
            >
              Full Screen
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-1/2 bg-gray-950 text-emerald-400 text-sm rounded-lg border border-gray-700 p-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer hover:bg-gray-900 transition-colors"
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
