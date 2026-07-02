import { useState, useRef, useEffect } from "react";
import CameraView from "./components/CameraView";
import InfoPanel from "./components/InfoPanel";
import PausePanelInfo from "./components/PausePanelInfo";
import ImageTestView from "./components/ImageTestView";
import { usePoseEstimator } from "./hooks/usePoseEstimator";
import { JOINTS, calculateAngle, Point } from "./utils/geometry";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { Sun, Moon, Camera, FolderOpen } from "lucide-react";
interface Metrics {
  angle1: number;
  angle2: number;
  accuracy: number;
}

interface Repetitions {
  Tree: number;
  Mountain: number;
  WarriorII: number;
  Chair: number;
}

interface Feedback {
  status: string;
  stateLabel: string;
  statusType: "INFO" | "EXCELLENT" | "GOOD" | "BAD";
}

function App() {
  const poseLandmarkerRef = usePoseEstimator();
  const [theme, setTheme] = useState<"light" | "dark">("light"); // Default is Light Mode
  const [mode, setMode] = useState<"CAMERA" | "IMAGE">("CAMERA"); // "CAMERA" atau "IMAGE"
  const [selectedPose, setSelectedPose] = useState<string>("WARRIOR_II");
  const [metrics, setMetrics] = useState<Metrics>({
    angle1: 0,
    angle2: 0,
    accuracy: 0,
  });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [repetitions, setRepetitions] = useState<Repetitions>({
    Tree: 0,
    Mountain: 0,
    WarriorII: 0,
    Chair: 0,
  });
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const poseStartTimeRef = useRef<number | null>(null);
  const hasIncrementedRef = useRef<boolean>(false);
  const fsmStateRef = useRef<number>(0); // 0 = Stand, 1 = Squat
  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const [fps, setFps] = useState<number>(0);

  useEffect(() => {
    poseStartTimeRef.current = null;
    hasIncrementedRef.current = false;
    fsmStateRef.current = 0;
  }, [selectedPose]);

  const [feedback, setFeedback] = useState<Feedback>({
    status:
      "Silakan posisikan tubuh Anda di depan kamera untuk memulai latihan.",
    stateLabel: "",
    statusType: "INFO",
  });

  const isDark = theme === "dark";

  const getFeedbackStyle = (type: "INFO" | "EXCELLENT" | "GOOD" | "BAD") => {
    if (type === "EXCELLENT") {
      return isDark
        ? {
            colorClass:
              "bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
            ringColor:
              "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
          }
        : {
            colorClass:
              "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
            ringColor:
              "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
          };
    }
    if (type === "GOOD") {
      return isDark
        ? {
            colorClass:
              "bg-amber-950/80 text-amber-300 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
            ringColor:
              "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]",
          }
        : {
            colorClass:
              "bg-amber-50 text-amber-800 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
            ringColor:
              "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
          };
    }
    if (type === "BAD") {
      return isDark
        ? {
            colorClass:
              "bg-rose-950/80 text-rose-300 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
            ringColor: "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]",
          }
        : {
            colorClass:
              "bg-rose-50 text-rose-800 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
            ringColor: "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]",
          };
    }
    return isDark
      ? {
          colorClass: "bg-gray-950 text-gray-400 border-gray-800",
          ringColor: "border-gray-700",
        }
      : {
          colorClass: "bg-slate-100 text-slate-500 border-slate-200",
          ringColor: "border-slate-200",
        };
  };

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const calculateAccuracy = (
    currentAngle: number,
    minTarget: number,
    maxTarget: number,
  ): number => {
    if (currentAngle >= minTarget && currentAngle <= maxTarget) {
      return 100;
    }

    const distance =
      currentAngle < minTarget
        ? minTarget - currentAngle
        : currentAngle - maxTarget;

    const maxTolerance = 45;

    const accuracy = 100 - (distance / maxTolerance) * 100;
    return Math.max(0, Math.round(accuracy));
  };

  const evaluatePose = (landmarks: NormalizedLandmark[]) => {
    let angle1 = 0;
    let angle2 = 0;
    let minTarget = 0;
    let maxTarget = 0;
    let activePoints: (Point | undefined | null)[] = [];

    if (selectedPose === "TREE") {
      const leftHip = landmarks[JOINTS.LEFT_HIP];
      const leftKnee = landmarks[JOINTS.LEFT_KNEE];
      const leftAnkle = landmarks[JOINTS.LEFT_ANKLE];

      const rightHip = landmarks[JOINTS.RIGHT_HIP];
      const rightKnee = landmarks[JOINTS.RIGHT_KNEE];
      const rightAnkle = landmarks[JOINTS.RIGHT_ANKLE];

      const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

      let activeKneeAngle, supportKneeAngle;

      if (leftKneeAngle < rightKneeAngle) {
        activeKneeAngle = leftKneeAngle;
        supportKneeAngle = rightKneeAngle;
      } else {
        activeKneeAngle = rightKneeAngle;
        supportKneeAngle = leftKneeAngle;
      }

      angle1 = activeKneeAngle;
      angle2 = supportKneeAngle;

      minTarget = 0;
      maxTarget = 60;
      activePoints =
        leftKneeAngle < rightKneeAngle
          ? [leftHip, leftKnee, leftAnkle]
          : [rightHip, rightKnee, rightAnkle];
    } else if (selectedPose === "WARRIOR_II") {
      const wrist = landmarks[JOINTS.RIGHT_WRIST];
      const shoulder = landmarks[JOINTS.RIGHT_SHOULDER];
      const rightHip = landmarks[JOINTS.RIGHT_HIP];
      const rightKnee = landmarks[JOINTS.RIGHT_KNEE];
      const rightAnkle = landmarks[JOINTS.RIGHT_ANKLE];
      const leftHip = landmarks[JOINTS.LEFT_HIP];
      const leftKnee = landmarks[JOINTS.LEFT_KNEE];
      const leftAnkle = landmarks[JOINTS.LEFT_ANKLE];

      angle1 = calculateAngle(wrist, shoulder, rightHip);
      const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
      const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);

      // Cari lutut yang terentang penuh
      angle2 = Math.max(leftKneeAngle, rightKneeAngle);

      minTarget = 80;
      maxTarget = 105;
      activePoints = [wrist, shoulder, rightHip];
    } else if (selectedPose === "COBRA") {
      const shoulder = landmarks[JOINTS.RIGHT_SHOULDER];
      const hip = landmarks[JOINTS.RIGHT_HIP];
      const groundVirtualPoint = hip ? { x: shoulder?.x ?? 0, y: hip.y } : null;

      angle1 = calculateAngle(shoulder, hip, groundVirtualPoint);
      angle2 = 0;
      minTarget = 50;
      maxTarget = 95;
      activePoints = [shoulder, hip, groundVirtualPoint];
    } else if (selectedPose === "CHAIR") {
      const rightHip = landmarks[JOINTS.RIGHT_HIP];
      const rightKnee = landmarks[JOINTS.RIGHT_KNEE];
      const rightAnkle = landmarks[JOINTS.RIGHT_ANKLE];
      const leftHip = landmarks[JOINTS.LEFT_HIP];
      const leftKnee = landmarks[JOINTS.LEFT_KNEE];
      const leftAnkle = landmarks[JOINTS.LEFT_ANKLE];

      const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
      const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      angle1 = (rightKneeAngle + leftKneeAngle) / 2;
      angle2 = 0;
      minTarget = 160;
      maxTarget = 180;
      activePoints = [
        rightHip,
        rightKnee,
        rightAnkle,
        leftHip,
        leftKnee,
        leftAnkle,
      ];
    }

    let accuracyScore = calculateAccuracy(angle1, minTarget, maxTarget);
    if (selectedPose === "TREE" && angle2 < 160 && accuracyScore === 100) {
      accuracyScore = 75;
    }

    let isValid = false;
    if (selectedPose === "TREE") {
      isValid = angle1 <= 60 && angle2 >= 170;
    } else if (selectedPose === "WARRIOR_II") {
      const bentKneeAngle = Math.min(
        calculateAngle(
          landmarks[JOINTS.LEFT_HIP],
          landmarks[JOINTS.LEFT_KNEE],
          landmarks[JOINTS.LEFT_ANKLE],
        ),
        calculateAngle(
          landmarks[JOINTS.RIGHT_HIP],
          landmarks[JOINTS.RIGHT_KNEE],
          landmarks[JOINTS.RIGHT_ANKLE],
        ),
      );
      isValid =
        angle1 >= 80 &&
        angle1 <= 105 &&
        angle2 >= 170 &&
        angle2 <= 180 &&
        bentKneeAngle <= 150;
    } else if (selectedPose === "COBRA") {
      isValid = angle1 >= 50 && angle1 <= 95;
    } else if (selectedPose === "CHAIR") {
      isValid = angle1 <= 115;
    }

    let statusText: string;
    let stateLabel: string;
    let statusType: "EXCELLENT" | "GOOD" | "BAD";

    if (isValid || accuracyScore === 100) {
      stateLabel = "EXCELLENT";
      statusText = `[HIJAU - EXCELLENT] Pose Sempurna! Akurasi: ${accuracyScore}% (${angle1}°). Sesuai standar Jurnal JUTIF.`;
      statusType = "EXCELLENT";
    } else if (accuracyScore >= 70 && accuracyScore <= 99) {
      stateLabel = "GOOD";
      statusText = `[KUNING - GOOD] Pose Cukup Baik. Akurasi: ${accuracyScore}% (${angle1}°). Perlu sedikit penyesuaian.`;
      statusType = "GOOD";
    } else {
      stateLabel = "BAD";
      statusText = `[MERAH - BAD] Pose Kurang Tepat! Akurasi: ${accuracyScore}% (${angle1}°). Perbaiki postur tubuh Anda!`;
      statusType = "BAD";
    }

    return {
      angle1,
      angle2,
      minTarget,
      maxTarget,
      activePoints,
      accuracyScore,
      stateLabel,
      statusText,
      statusType,
      isValid,
    };
  };

  const handleFrameUpdate = (
    imageElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    canvasElement: HTMLCanvasElement,
  ) => {
    if (isPaused) return;
    if (!poseLandmarkerRef.current) return;
    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    frameCountRef.current++;
    if (now - lastFrameTimeRef.current >= 1000) {
      setFps(
        Math.round(
          (frameCountRef.current * 1000) / (now - lastFrameTimeRef.current),
        ),
      );
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }

    // Di sini proses deteksi MediaPipe berjalan di browser (Client-Side).
    // Fungsi .detect() memanggil instruksi model AI yang dieksekusi melalui WebAssembly (WASM)
    // untuk melakukan ekstraksi 33 titik koordinat tubuh (landmarks) secara real-time.
    const result = poseLandmarkerRef.current.detect(imageElement);

    if (result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];

      const evaluation = evaluatePose(landmarks);

      let statusText = evaluation.statusText;
      if (evaluation.isValid) {
        if (poseStartTimeRef.current === null) {
          poseStartTimeRef.current = Date.now();
          hasIncrementedRef.current = false;
        }

        const elapsed = Date.now() - poseStartTimeRef.current;
        const secondsRemaining = Math.max(
          0,
          Math.ceil((4000 - elapsed) / 1000),
        );

        if (elapsed >= 4000) {
          if (!hasIncrementedRef.current) {
            let poseKey: keyof Repetitions = "Tree";
            if (selectedPose === "WARRIOR_II") poseKey = "WarriorII";
            else if (selectedPose === "COBRA") poseKey = "Mountain";

            if (selectedPose !== "CHAIR") {
              setRepetitions((prev) => ({
                ...prev,
                [poseKey]: prev[poseKey] + 1,
              }));
            }
            hasIncrementedRef.current = true;
          }
          statusText = `[HIJAU - EXCELLENT] Repetisi berhasil! Pertahankan pose.`;
        } else {
          statusText = `[HIJAU - EXCELLENT] Pose Sempurna! Tahan selama ${secondsRemaining} detik lagi...`;
        }
      } else {
        poseStartTimeRef.current = null;
        hasIncrementedRef.current = false;
      }

      // FSM Repetition Logic untuk Pose Dinamis (CHAIR)
      if (selectedPose === "CHAIR") {
        const thetaKnee = evaluation.angle1;
        if (fsmStateRef.current === 0 && thetaKnee <= 115) {
          // Beralih ke State 1 (Berjongkok)
          fsmStateRef.current = 1;
        } else if (fsmStateRef.current === 1 && evaluation.accuracyScore === 100) {
          // Beralih kembali ke State 0 (Berdiri) & tambah repetisi
          fsmStateRef.current = 0;
          setRepetitions((prev) => ({
            ...prev,
            Chair: prev.Chair + 1,
          }));
        }
        statusText = `FSM State: ${fsmStateRef.current === 0 ? "Berdiri" : "Berjongkok"}. Sudut Lutut: ${Math.round(thetaKnee)}°`;
      }

      setMetrics({
        angle1: evaluation.angle1,
        angle2: evaluation.angle2,
        accuracy: evaluation.accuracyScore,
      });

      setFeedback({
        status: statusText,
        stateLabel: evaluation.stateLabel,
        statusType: evaluation.statusType,
      });

      drawSkeleton(
        ctx,
        canvasElement,
        landmarks,
        evaluation.isValid
          ? "#10B981"
          : evaluation.accuracyScore >= 70
            ? "#F59E0B"
            : "#F43F5E",
        evaluation.activePoints,
      );
    }
  };

  const handleImageProcessed = (
    imageElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    canvasElement: HTMLCanvasElement,
  ) => {
    if (!poseLandmarkerRef.current) return;
    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;

    // Di sini proses ekstraksi landmark MediaPipe pada file gambar dijalankan.
    // WebAssembly (WASM) memproses pixel gambar secara lokal menggunakan instruksi biner tingkat rendah
    // untuk mengidentifikasi sendi-sendi pose yoga tanpa mengirim data ke server (Edge AI).
    const result = poseLandmarkerRef.current.detect(imageElement);

    if (result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];

      const evaluation = evaluatePose(landmarks);

      // FSM Repetition Logic untuk Video Processing (CHAIR)
      let statusText = evaluation.statusText;
      if (selectedPose === "CHAIR") {
        const thetaKnee = evaluation.angle1;
        if (fsmStateRef.current === 0 && thetaKnee <= 115) {
          fsmStateRef.current = 1;
        } else if (fsmStateRef.current === 1 && evaluation.accuracyScore === 100) {
          fsmStateRef.current = 0;
          setRepetitions((prev) => ({
            ...prev,
            Chair: prev.Chair + 1,
          }));
        }
        statusText = `FSM State: ${fsmStateRef.current === 0 ? "Berdiri" : "Berjongkok"}. Sudut Lutut: ${Math.round(thetaKnee)}°`;
      }

      setMetrics({
        angle1: evaluation.angle1,
        angle2: evaluation.angle2,
        accuracy: evaluation.accuracyScore,
      });

      setFeedback({
        status: statusText,
        stateLabel: evaluation.stateLabel,
        statusType: evaluation.statusType,
      });

      drawSkeleton(
        ctx,
        canvasElement,
        landmarks,
        evaluation.isValid
          ? "#10B981"
          : evaluation.accuracyScore >= 70
            ? "#F59E0B"
            : "#F43F5E",
        evaluation.activePoints,
      );
    } else {
      setFeedback({
        status:
          "Sistem gagal mengekstraksi landmark tubuh. Pastikan tubuh terlihat utuh.",
        stateLabel: "",
        statusType: "INFO",
      });
    }
  };

  const drawSkeleton = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    landmarks: NormalizedLandmark[],
    colorHex: string,
    activePoints: (Point | undefined | null)[] = [],
  ) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colorHex;
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = Math.max(3, canvas.width / 250);

    const CONNECTIONS = [
      [JOINTS.LEFT_SHOULDER, JOINTS.RIGHT_SHOULDER],
      [JOINTS.LEFT_SHOULDER, JOINTS.LEFT_ELBOW],
      [JOINTS.LEFT_ELBOW, JOINTS.LEFT_WRIST],
      [JOINTS.RIGHT_SHOULDER, JOINTS.RIGHT_ELBOW],
      [JOINTS.RIGHT_ELBOW, JOINTS.RIGHT_WRIST],
      [JOINTS.LEFT_SHOULDER, JOINTS.LEFT_HIP],
      [JOINTS.RIGHT_SHOULDER, JOINTS.RIGHT_HIP],
      [JOINTS.LEFT_HIP, JOINTS.RIGHT_HIP],
      [JOINTS.LEFT_HIP, JOINTS.LEFT_KNEE],
      [JOINTS.LEFT_KNEE, JOINTS.LEFT_ANKLE],
      [JOINTS.RIGHT_HIP, JOINTS.RIGHT_KNEE],
      [JOINTS.RIGHT_KNEE, JOINTS.RIGHT_ANKLE],
    ] as const;

    CONNECTIONS.forEach(([indexStart, indexEnd]) => {
      const startPoint = landmarks[indexStart];
      const endPoint = landmarks[indexEnd];

      if (
        startPoint &&
        endPoint &&
        (startPoint.visibility ?? 0) > 0.5 &&
        (endPoint.visibility ?? 0) > 0.5
      ) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
        ctx.stroke();
      }
    });

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    (Object.values(JOINTS) as number[]).forEach((index) => {
      const landmark = landmarks[index];
      if (landmark && (landmark.visibility ?? 0) > 0.5) {
        ctx.beginPath();
        ctx.arc(
          landmark.x * canvas.width,
          landmark.y * canvas.height,
          4,
          0,
          2 * Math.PI,
        );
        ctx.fill();
      }
    });

    (Object.values(JOINTS) as number[]).forEach((index) => {
      const landmark = landmarks[index];
      if (landmark && (landmark.visibility ?? 0) > 0.5) {
        ctx.beginPath();
        ctx.arc(
          landmark.x * canvas.width,
          landmark.y * canvas.height,
          Math.max(6, canvas.width / 180),
          0,
          2 * Math.PI,
        );
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    if (activePoints.length >= 2) {
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const firstPoint = activePoints[0];
      if (firstPoint) {
        ctx.moveTo(firstPoint.x * canvas.width, firstPoint.y * canvas.height);
        for (let i = 1; i < activePoints.length; i++) {
          const point = activePoints[i];
          if (point) {
            ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
          }
        }
        ctx.stroke();
      }
    }

    activePoints.forEach((point) => {
      if (point) {
        ctx.fillStyle = colorHex;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          point.x * canvas.width,
          point.y * canvas.height,
          10,
          0,
          2 * Math.PI,
        );
        ctx.fill();
        ctx.stroke();
      }
    });
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (metrics.accuracy / 100) * circumference;

  const getPoseDetails = () => {
    switch (selectedPose) {
      case "TREE":
        return {
          title: "Tree Pose",
          joints: "Lutut Kiri (Hip-Knee-Ankle)",
          target: "≤ 60°",
        };
      case "WARRIOR_II":
        return {
          title: "Warrior II Pose",
          joints: "Bahu Kanan (Wrist-Shoulder-Hip)",
          target: "80° - 105°",
        };
      case "COBRA":
        return {
          title: "Cobra Pose",
          joints: "Tulang Belakang Kanan (Shoulder-Hip-Ground)",
          target: "50° - 95°",
        };
      case "CHAIR":
        return {
          title: "Chair Pose",
          joints: "Lutut (Hip-Knee-Ankle)",
          target: "≥ 160°",
        };
      default:
        return {
          title: "Unknown Pose",
          joints: "-",
          target: "-",
        };
    }
  };

  const poseDetails = getPoseDetails();
  const isModeCam = mode === "CAMERA";
  const feedbackStyle = getFeedbackStyle(feedback.statusType);

  return (
    <div
      className={`min-h-screen p-6 flex flex-col items-center justify-center relative transition-colors duration-300 ${isDark ? "bg-gray-950 text-white" : "bg-slate-50 text-slate-900"}`}
    >
      {/* Background radial glow */}
      <div
        className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-opacity duration-300 ${isDark ? "bg-emerald-500/5 opacity-100" : "bg-emerald-500/10 opacity-70"}`}
      />
      <div
        className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-opacity duration-300 ${isDark ? "bg-purple-500/5 opacity-100" : "bg-purple-500/10 opacity-70"}`}
      />

      <header className="mb-6 text-center relative z-10 flex flex-col items-center w-full max-w-6xl">
        <h1
          className="text-4xl tracking-tight transition-all duration-300 border-b-4 border-emerald-500 font-bold pb-4 px-4"
          style={{ color: isDark ? "#34D399" : "#059669" }}
        >
          Edge AI Yoga Assistant
        </h1>
        {/* <p
          className={`text-xs mt-1 uppercase tracking-widest font-semibold transition-colors duration-300 ${isDark ? "text-gray-400" : "text-slate-500"}`}
        >
          Edge AI Client-Side System Evaluation (Statistical Mode)
        </p> */}

        {/* Theme Toggle Button */}
        <button
          onClick={() =>
            setTheme((prev) => (prev === "light" ? "dark" : "light"))
          }
          className={`absolute top-0 right-4 p-2.5 rounded-full border shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center ${
            isDark
              ? "bg-gray-900 border-gray-800 text-amber-400 hover:text-amber-300"
              : "bg-white border-slate-200 text-indigo-600 hover:text-indigo-850"
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl w-full relative z-10">
        <div className="lg:col-span-2 space-y-4">
          <div
            className={`backdrop-blur-md p-4 rounded-xl border flex items-center justify-between transition-colors duration-300 ${isDark ? "bg-gray-900/60 border-gray-800/80 text-gray-300" : "bg-white border-slate-200 text-slate-700 shadow-sm"}`}
          >
            <label htmlFor="pose-select-app" className="text-sm font-medium">
              Target Pengujian Pose :
            </label>
            <span
              className={`text-sm rounded-lg border p-2 transition-colors duration-300 ${isDark ? "bg-gray-950 text-emerald-400 border-gray-700 font-bold" : "bg-slate-50 text-emerald-700 border-slate-200 font-bold"}`}
            >
              {poseDetails.title} ({poseDetails.joints}) - {poseDetails.target}
            </span>
          </div>
          {mode === "CAMERA" ? (
            isPaused ? (
              <PausePanelInfo
                sessionPaused={isPaused}
                avgFps={60}
                repetitions={repetitions}
                onClose={() => setIsPaused(false)}
                onReset={() => {
                  setRepetitions({
                    Tree: 0,
                    Mountain: 0,
                    WarriorII: 0,
                    Chair: 0,
                  });
                }}
                isDark={isDark}
              />
            ) : (
              <CameraView
                onFrameUpdate={handleFrameUpdate}
                isMuted={isMuted}
                isDark={isDark}
              />
            )
          ) : (
            <div className="space-y-4">
              <ImageTestView
                onImageProcessed={handleImageProcessed}
                isDark={isDark}
              />
            </div>
          )}
        </div>

        <div className="space-y-4 flex flex-col justify-start">
          {/* TABS SELECTOR MODE (KAMERA VS GAMBAR) */}
          <div
            className={`backdrop-blur-md p-4 g-4 rounded-xl border flex items-center transition-colors duration-300 ${isDark ? "bg-gray-900/60 border-gray-800/80 text-gray-300" : "bg-white border-slate-200 text-slate-700 shadow-sm"}`}
          >
            <button
              onClick={() => {
                setMode("CAMERA");
                setMetrics({ angle1: 0, angle2: 0, accuracy: 0 });
                setFeedback({
                  status:
                    "Silakan posisikan tubuh Anda di depan kamera untuk memulai latihan.",
                  stateLabel: "",
                  statusType: "INFO",
                });
              }}
              className={`px-5 py-2.5 w-1/2 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${
                mode === "CAMERA"
                  ? isDark
                    ? "bg-emerald-500 text-gray-950 shadow-md transform scale-105"
                    : "bg-emerald-600 text-white shadow-md transform scale-105"
                  : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Camera className="w-4 h-4" /> Kamera
            </button>
            <button
              onClick={() => {
                setMode("IMAGE");
                setMetrics({ angle1: 0, angle2: 0, accuracy: 0 });
                setFeedback({
                  status: "Silakan unggah gambar uji untuk memulai evaluasi.",
                  stateLabel: "",
                  statusType: "INFO",
                });
              }}
              className={`px-5 py-2.5 w-1/2 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${
                mode === "IMAGE"
                  ? isDark
                    ? "bg-emerald-500 text-gray-950 shadow-md transform scale-105"
                    : "bg-emerald-600 text-white shadow-md transform scale-105"
                  : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <FolderOpen className="w-4 h-4" /> Testing
            </button>
          </div>
          <div>
            <InfoPanel
              metrics={metrics}
              radius={radius}
              feedback={{
                status: feedback.status,
                colorClass: feedbackStyle.colorClass,
                stateLabel: feedback.stateLabel,
                ringColor: feedbackStyle.ringColor,
              }}
              circumference={circumference}
              poseDetails={poseDetails}
              strokeDashoffset={strokeDashoffset}
              selectedPose={selectedPose}
              setSelectedPose={setSelectedPose}
              isModeCam={isModeCam}
              isPaused={isPaused}
              setIsPaused={setIsPaused}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              onFullScreen={handleFullScreen}
              reps={
                selectedPose === "TREE"
                  ? repetitions.Tree
                  : selectedPose === "WARRIOR_II"
                    ? repetitions.WarriorII
                    : selectedPose === "COBRA"
                      ? repetitions.Mountain
                      : selectedPose === "CHAIR"
                        ? repetitions.Chair
                        : 0
              }
              isDark={isDark}
              fps={fps}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
