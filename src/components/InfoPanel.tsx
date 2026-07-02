import React from "react";
import { Play, Pause, Maximize, VolumeX, Volume2 } from "lucide-react";

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
  reps: number;
  isDark: boolean;
  fps: number;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  metrics,
  radius,
  feedback,
  circumference,
  // poseDetails,
  strokeDashoffset,
  selectedPose,
  setSelectedPose,
  isModeCam,
  isPaused,
  setIsPaused,
  isMuted,
  setIsMuted,
  onFullScreen,
  reps,
  isDark,
  fps,
}) => {
  return (
    <div
      className={`p-6 rounded-2xl shadow-xl flex flex-col border h-fit space-y-5 transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"}`}
    >
      {/* 1. Dropdown Pemilihan Pose */}
      <div>
        <label
          htmlFor="pose-select-info"
          className={`text-xs font-semibold uppercase tracking-wider block mb-2 transition-colors duration-300 ${isDark ? "text-gray-400" : "text-slate-500"}`}
        >
          Pilih Target Pengujian Pose:
        </label>
        <select
          id="pose-select-info"
          title="Pilih Target Pengujian Pose"
          value={selectedPose}
          onChange={(e) => setSelectedPose(e.target.value)}
          className={`w-full font-semibold text-sm rounded-xl border p-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer ${
            isDark
              ? "bg-gray-950 text-emerald-400 border-gray-850"
              : "bg-slate-50 text-emerald-700 border-slate-200"
          }`}
        >
          <option value="TREE">Tree Pose (Keseimbangan Vertikal)</option>
          <option value="WARRIOR_II">
            Warrior II Pose (Ekstensi Horizontal)
          </option>
          <option value="COBRA">Cobra Pose (Level Lantai)</option>
          <option value="CHAIR">Chair Pose (FSM Squat Dinamis)</option>
        </select>
      </div>

      {/* 2. Visualisasi Akurasi & Metrik */}
      <div
        className={`p-5 rounded-2xl border flex flex-col items-center relative overflow-hidden transition-colors duration-300 ${
          isDark
            ? "bg-gray-950/40 border-gray-800/80"
            : "bg-slate-50/50 border-slate-200/80"
        }`}
      >
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
        <h3
          className={`text-sm font-bold self-start mb-4 border-l-2 border-emerald-500 pl-2 transition-colors duration-300 ${isDark ? "text-gray-300" : "text-slate-800"}`}
        >
          Akurasi Pose Yoga
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
              className={`transition-colors duration-300 ${isDark ? "stroke-gray-900/60" : "stroke-slate-200"}`}
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

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={`text-4xl font-extrabold tracking-tight transition-colors duration-500 ${
                metrics.accuracy === 100
                  ? isDark
                    ? "text-emerald-400"
                    : "text-emerald-600"
                  : metrics.accuracy >= 70
                    ? isDark
                      ? "text-amber-400"
                      : "text-amber-600"
                    : isDark
                      ? "text-rose-400"
                      : "text-rose-600"
              }`}
            >
              {metrics.accuracy}%
            </span>
            <span
              className={`text-[10px] uppercase font-black tracking-widest mt-1 transition-colors duration-300 ${isDark ? "text-gray-500" : "text-slate-400"}`}
            >
              Accuracy
            </span>
          </div>
        </div>
        {feedback.stateLabel && (
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider border mb-4 transition-all duration-505 ${
              feedback.stateLabel === "EXCELLENT"
                ? isDark
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                  : "bg-emerald-100 text-emerald-800 border-emerald-200"
                : feedback.stateLabel === "GOOD"
                  ? isDark
                    ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                    : "bg-amber-100 text-amber-800 border-amber-200"
                  : isDark
                    ? "bg-rose-950/40 text-rose-400 border-rose-500/30"
                    : "bg-rose-100 text-rose-800 border-rose-200"
            }`}
          >
            {feedback.stateLabel}
          </div>
        )}
        {/* Real-time Angle & Target Angle */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div
            className={`p-3 rounded-xl border text-center transition-colors duration-300 ${isDark ? "bg-gray-950/60 border-gray-900/80" : "bg-slate-100 border-slate-200"}`}
          >
            <span
              className={`text-[10px] uppercase font-semibold tracking-wider block mb-1 transition-colors duration-300 ${isDark ? "text-gray-500" : "text-slate-400"}`}
            >
              Repetisi
            </span>
            <span
              className={`text-xl font-bold transition-colors duration-300 ${isDark ? "text-gray-300" : "text-slate-800"}`}
            >
              {reps}
            </span>
          </div>
          <div
            className={`p-3 rounded-xl border text-center transition-colors duration-300 ${isDark ? "bg-gray-950/60 border-gray-900/80" : "bg-slate-100 border-slate-200"}`}
          >
            <span
              className={`text-[10px] uppercase font-semibold tracking-wider block mb-1 transition-colors duration-300 ${isDark ? "text-gray-500" : "text-slate-400"}`}
            >
              FPS
            </span>
            <span
              className={`text-xl font-bold transition-colors duration-300 ${isDark ? "text-gray-300" : "text-slate-800"}`}
            >
              {fps}
            </span>
          </div>
        </div>
        {/* Sendi Info */}
        {/* <div className="w-full mt-3 px-1 text-center">
          <span
            className={`text-[10px] font-medium block transition-colors duration-300 ${isDark ? "text-gray-500" : "text-slate-400"}`}
          >
            Sendi Terpantau:{" "}
            <span
              className={`font-semibold transition-colors duration-300 ${isDark ? "text-gray-300" : "text-slate-700"}`}
            >
              {poseDetails.joints}
            </span>
          </span>
        </div> */}
      </div>

      {/* 3. Kontrol Latihan & Feedback */}
      {isModeCam ? (
        <>
          <div
            className={`flex flex-col gap-2 pt-2 border-t transition-colors duration-300 ${isDark ? "border-gray-800" : "border-slate-200"}`}
          >
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                isPaused
                  ? isDark
                    ? "bg-emerald-500 text-gray-950 border-emerald-400 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700 shadow-md"
                  : isDark
                    ? "bg-gray-950 text-emerald-400 border-gray-800 hover:border-emerald-500/50 hover:bg-gray-900"
                    : "bg-white text-emerald-750 border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50 shadow-sm"
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4" /> Lanjutkan Latihan
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" /> Pause Latihan
                </>
              )}
            </button>
            <div className="flex gap-2">
              <button
                onClick={onFullScreen}
                className={`w-1/2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                  isDark
                    ? "bg-gray-950 text-emerald-400 border-gray-800 hover:border-emerald-500/50 hover:bg-gray-900"
                    : "bg-white text-emerald-750 border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50 shadow-sm"
                }`}
              >
                <Maximize className="w-4 h-4" /> Full Screen
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-1/2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                  isDark
                    ? "bg-gray-950 text-emerald-400 border-gray-800 hover:border-emerald-500/50 hover:bg-gray-900"
                    : "bg-white text-emerald-750 border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50 shadow-sm"
                }`}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4" /> Unmute
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" /> Mute
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
