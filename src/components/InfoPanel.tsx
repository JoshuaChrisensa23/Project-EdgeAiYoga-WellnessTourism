import React from "react";

interface Metrics {
  angle1: number;
  angle2: number;
  accuracy: number;
}

interface Feedback {
  status: string;
  colorClass: string;
  stateLabel: string;
  ringColor: string;
}

interface InfoPanelProps {
  metrics: Metrics;
  radius: number;
  feedback: Feedback;
  circumference: number;
  poseDetails: { title: string; joints: string; target: string };
  strokeDashoffset: number;
  selectedPose: string;
  setSelectedPose: (pose: string) => void;
  isModeCam: boolean;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onFullScreen: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  metrics,
  radius,
  feedback,
  circumference,
  poseDetails,
  strokeDashoffset,
  selectedPose,
  setSelectedPose,
  isModeCam,
  isPaused,
  setIsPaused,
  isMuted,
  setIsMuted,
  onFullScreen,
}) => {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl flex flex-col border border-gray-800 h-fit space-y-5">
      {/* 1. Dropdown Pemilihan Pose */}
      <div>
        <label
          htmlFor="pose-select-info"
          className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2"
        >
          Pilih Target Pengujian Pose:
        </label>
        <select
          id="pose-select-info"
          title="Pilih Target Pengujian Pose"
          value={selectedPose}
          onChange={(e) => setSelectedPose(e.target.value)}
          className="w-full bg-gray-950 text-emerald-400 font-semibold text-sm rounded-xl border border-gray-850 p-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer"
        >
          <option value="TREE">Tree Pose (Keseimbangan Vertikal)</option>
          <option value="WARRIOR_II">
            Warrior II Pose (Ekstensi Horizontal)
          </option>
          <option value="COBRA">Cobra Pose (Level Lantai)</option>
        </select>
      </div>

      {/* 2. Visualisasi Akurasi & Metrik */}
      <div className="bg-gray-950/40 p-5 rounded-2xl border border-gray-800/80 flex flex-col items-center relative overflow-hidden">
        {/* Ambient background glow */}
        <div
          className={`absolute w-32 h-32 rounded-full -top-10 -right-10 transition-all duration-700 opacity-20 blur-3xl pointer-events-none ${
            metrics.accuracy === 100
              ? "bg-emerald-500"
              : metrics.accuracy >= 70
                ? "bg-amber-500"
                : metrics.accuracy > 0
                  ? "bg-rose-500"
                  : "bg-transparent"
          }`}
        />

        <h3 className="text-sm font-bold text-gray-300 self-start mb-4 border-l-2 border-emerald-500 pl-2">
          Matriks Hasil Evaluasi
        </h3>

        {/* SVG Circular Progress Ring */}
        <div className="relative w-36 h-36 flex items-center justify-center flex-col mx-auto mb-4">
          <div
            className={`absolute inset-4 rounded-full transition-all duration-700 opacity-10 blur-xl ${
              metrics.accuracy === 100
                ? "bg-emerald-500"
                : metrics.accuracy >= 70
                  ? "bg-amber-500"
                  : "bg-rose-500"
            }`}
          />

          <svg className="w-full h-full transform -rotate-90">
            <defs>
              <linearGradient
                id="emeraldGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient
                id="amberGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>
            </defs>
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-gray-900/60"
              strokeWidth="9"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="transition-all duration-700 ease-out"
              stroke={
                metrics.accuracy === 100
                  ? "url(#emeraldGrad)"
                  : metrics.accuracy >= 70
                    ? "url(#amberGrad)"
                    : "url(#roseGrad)"
              }
              strokeWidth="9"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span
              className={`text-4xl font-extrabold tracking-tight transition-colors duration-500 ${
                metrics.accuracy === 100
                  ? "text-emerald-400"
                  : metrics.accuracy >= 70
                    ? "text-amber-400"
                    : "text-rose-400"
              }`}
            >
              {metrics.accuracy}%
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">
              Accuracy
            </span>
          </div>
        </div>

        {/* State Label Badge */}
        {feedback.stateLabel && (
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider border mb-4 transition-all duration-500 ${
              feedback.stateLabel === "EXCELLENT"
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                : feedback.stateLabel === "GOOD"
                  ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                  : "bg-rose-950/40 text-rose-400 border-rose-500/30"
            }`}
          >
            {feedback.stateLabel}
          </div>
        )}

        {/* Real-time Angle & Target Angle */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-900/80 text-center">
            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block mb-1">
              Sudut Terukur
            </span>
            <span
              className={`text-xl font-bold transition-colors duration-500 ${
                metrics.accuracy === 100
                  ? "text-emerald-400"
                  : metrics.accuracy >= 70
                    ? "text-amber-400"
                    : "text-rose-400"
              }`}
            >
              {metrics.angle1}°
            </span>
          </div>
          <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-900/80 text-center">
            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block mb-1">
              Target Jurnal
            </span>
            <span className="text-xl font-bold text-gray-300">
              {poseDetails.target}
            </span>
          </div>
        </div>

        {/* Sendi Info */}
        <div className="w-full mt-3 px-1 text-center">
          <span className="text-[10px] text-gray-500 font-medium block">
            Sendi Terpantau:{" "}
            <span className="text-gray-300 font-semibold">
              {poseDetails.joints}
            </span>
          </span>
        </div>
      </div>

      {/* 3. Kontrol Latihan & Feedback */}
      {isModeCam ? (
        <>
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-800">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                isPaused
                  ? "bg-emerald-500 text-gray-950 border-emerald-400 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-gray-950 text-emerald-400 border-gray-800 hover:border-emerald-500/50 hover:bg-gray-900"
              }`}
            >
              {isPaused ? (
                <>
                  <span>▶</span> Lanjutkan Latihan
                </>
              ) : (
                <>
                  <span>⏸</span> Pause Latihan
                </>
              )}
            </button>
            <div className="flex gap-2">
              <button
                onClick={onFullScreen}
                className="w-1/2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 bg-gray-950 text-emerald-400 border-gray-800 hover:border-emerald-500/50 hover:bg-gray-900"
              >
                <span>⛶</span> Full Screen
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-1/2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 bg-gray-950 text-emerald-400 border-gray-800 hover:border-emerald-500/50 hover:bg-gray-900"
              >
                {isMuted ? (
                  <>
                    <span>🔇</span> Unmute
                  </>
                ) : (
                  <>
                    <span>🔊</span> Mute
                  </>
                )}
              </button>
            </div>
          </div>

          <div
            className={`p-4 w-full rounded-xl text-center font-bold text-xs leading-relaxed border transition-all duration-500 ${feedback.colorClass}`}
          >
            {feedback.status}
          </div>
        </>
      ) : (
        <div
          className={`p-4 w-full rounded-xl text-center font-bold text-xs leading-relaxed border transition-all duration-500 ${feedback.colorClass}`}
        >
          {feedback.status}
        </div>
      )}
    </div>
  );
};

export default InfoPanel;
