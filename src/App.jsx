import { useState } from 'react';
import CameraView from './components/CameraView';
import InfoPanel from './components/InfoPanel';
import PausePanelInfo from './components/PausePanelInfo';
import ImageTestView from './components/ImageTestView';
import { usePoseEstimator } from './hooks/usePoseEstimator';
import { JOINTS, calculateAngle } from './utils/geometry';

function App() {
  const poseLandmarkerRef = usePoseEstimator();
  const [mode, setMode] = useState("CAMERA"); // "CAMERA" atau "IMAGE"
  const [selectedPose, setSelectedPose] = useState("WARRIOR_II");
  const [metrics, setMetrics] = useState({ angle1: 0, angle2: 0, accuracy: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [repetitions, setRepetitions] = useState({
    Tree: 0,
    Mountain: 0,
    WarriorII: 0,
    Chair: 0,
  });
  const [isPoseValid, setIsPoseValid] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('yoga_logged_user') || 'null');
    } catch (e) {
      return e.message;
    }
  });

  const [feedback, setFeedback] = useState({
    status: "Silakan posisikan tubuh Anda di depan kamera untuk memulai latihan.",
    colorClass: "bg-gray-950 text-gray-400 border-gray-800",
    ringColor: "border-gray-700",
    stateLabel: ""
  });

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Fungsi pembantu untuk menghitung persentase akurasi sudut secara linear & halus
  const calculateAccuracy = (currentAngle, minTarget, maxTarget) => {
    if (currentAngle >= minTarget && currentAngle <= maxTarget) {
      return 100; // 100% Benar jika berada di dalam rentang target
    }

    // Hitung jarak terdekat dari batas
    const distance = currentAngle < minTarget 
      ? minTarget - currentAngle 
      : currentAngle - maxTarget;

    // Batas toleransi deviasi maksimum (45 derajat dari batas terdekat)
    const maxTolerance = 45;
    
    // Menghitung persentase penurunan secara linier
    const accuracy = 100 - (distance / maxTolerance) * 100;
    return Math.max(0, Math.round(accuracy));
  };

  // Evaluasi Geometris Bersama (Kamera & Gambar) Sesuai Standar Jurnal JUTIF
  const evaluatePose = (landmarks) => {
    let angle1 = 0;
    let angle2 = 0;
    let minTarget = 0;
    let maxTarget = 0;
    let activePoints = [];

    if (selectedPose === "TREE") {
      const leftHip = landmarks[JOINTS.LEFT_HIP];
      const leftKnee = landmarks[JOINTS.LEFT_KNEE];
      const leftAnkle = landmarks[JOINTS.LEFT_ANKLE];
      
      const rightHip = landmarks[JOINTS.RIGHT_HIP];
      const rightKnee = landmarks[JOINTS.RIGHT_KNEE];
      const rightAnkle = landmarks[JOINTS.RIGHT_ANKLE];

      angle1 = calculateAngle(leftHip, leftKnee, leftAnkle); // Lutut kiri diangkat
      angle2 = calculateAngle(rightHip, rightKnee, rightAnkle); // Kaki kanan tumpuan lurus
      minTarget = 0;
      maxTarget = 60;
      activePoints = [leftHip, leftKnee, leftAnkle];

    } else if (selectedPose === "WARRIOR_II") {
      const wrist = landmarks[JOINTS.RIGHT_WRIST];
      const shoulder = landmarks[JOINTS.RIGHT_SHOULDER];
      const hip = landmarks[JOINTS.RIGHT_HIP];
      const knee = landmarks[JOINTS.RIGHT_KNEE];
      const ankle = landmarks[JOINTS.RIGHT_ANKLE];

      angle1 = calculateAngle(wrist, shoulder, hip); // Bahu kanan lurus mendatar
      angle2 = calculateAngle(hip, knee, ankle); // Kaki tumpuan lurus
      minTarget = 80;
      maxTarget = 105;
      activePoints = [wrist, shoulder, hip];

    } else if (selectedPose === "COBRA") {
      const shoulder = landmarks[JOINTS.RIGHT_SHOULDER];
      const hip = landmarks[JOINTS.RIGHT_HIP];
      const groundVirtualPoint = { x: shoulder.x, y: hip.y };

      angle1 = calculateAngle(shoulder, hip, groundVirtualPoint); // Sudut tulang belakang relatif terhadap lantai
      angle2 = 0;
      minTarget = 30;
      maxTarget = 55;
      activePoints = [shoulder, hip, groundVirtualPoint];
    }

    const accuracyScore = calculateAccuracy(angle1, minTarget, maxTarget);
    
    // Kriteria validasi penuh berdasarkan aturan Jurnal JUTIF Anda
    let isValid = false;
    if (selectedPose === "TREE") {
      isValid = (angle1 <= 60 && angle2 >= 170);
    } else if (selectedPose === "WARRIOR_II") {
      isValid = (angle1 >= 80 && angle1 <= 105 && angle2 >= 170);
    } else if (selectedPose === "COBRA") {
      isValid = (angle1 >= 30 && angle1 <= 55);
    }

    // LOGIKA 3 STATE WARNA & KETERANGAN (EXCELLENT, GOOD, BAD)
    let statusText;
    let colorStyle;
    let ringStyle;
    let stateLabel;

    if (isValid || accuracyScore === 100) {
      stateLabel = "EXCELLENT";
      statusText = `[HIJAU - EXCELLENT] Pose Sempurna! Akurasi: ${accuracyScore}% (${angle1}°). Sesuai standar Jurnal JUTIF.`;
      colorStyle = "bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
      ringStyle = "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]";
    } else if (accuracyScore >= 70 && accuracyScore <= 99) {
      stateLabel = "GOOD";
      statusText = `[KUNING - GOOD] Pose Cukup Baik. Akurasi: ${accuracyScore}% (${angle1}°). Perlu sedikit penyesuaian.`;
      colorStyle = "bg-amber-950/80 text-amber-300 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
      ringStyle = "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]";
    } else {
      stateLabel = "BAD";
      statusText = `[MERAH - BAD] Pose Kurang Tepat! Akurasi: ${accuracyScore}% (${angle1}°). Perbaiki postur tubuh Anda!`;
      colorStyle = "bg-rose-950/80 text-rose-300 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
      ringStyle = "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]";
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
      colorStyle,
      ringStyle,
      isValid
    };
  };

  const handleFrameUpdate = (imageElement, canvasElement) => {
    if (isPaused) return;
    if (!poseLandmarkerRef.current) return;
    const ctx = canvasElement.getContext('2d');

    const result = poseLandmarkerRef.current.detect(imageElement);

    if (result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];
      
      const evaluation = evaluatePose(landmarks);
      
      setMetrics({ 
        angle1: evaluation.angle1, 
        angle2: evaluation.angle2,
        accuracy: evaluation.accuracyScore
      });

      setFeedback({
        status: evaluation.statusText,
        colorClass: evaluation.colorStyle,
        ringColor: evaluation.ringStyle,
        stateLabel: evaluation.stateLabel
      });

      // Menggambar eksoskeleton lengkap & highlight garis penghubung sendi aktif
      drawSkeleton(
        ctx, 
        canvasElement, 
        landmarks, 
        evaluation.isValid ? "#10B981" : evaluation.accuracyScore >= 70 ? "#F59E0B" : "#F43F5E", 
        evaluation.activePoints
      );

      if (evaluation.isValid) {
        if (!isPoseValid) {
          let poseKey = "Tree";
          if (selectedPose === "WARRIOR_II") poseKey = "WarriorII";
          else if (selectedPose === "COBRA") poseKey = "Mountain"; // Map Cobra to Mountain
          
          setRepetitions(prev => ({
            ...prev,
            [poseKey]: prev[poseKey] + 1
          }));
          setIsPoseValid(true);
        }
      } else {
        setIsPoseValid(false);
      }
    }
  };

  const handleImageProcessed = (imageElement, canvasElement) => {
    if (!poseLandmarkerRef.current) return;
    const ctx = canvasElement.getContext('2d');

    const result = poseLandmarkerRef.current.detect(imageElement);

    if (result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];
      
      const evaluation = evaluatePose(landmarks);
      
      setMetrics({ 
        angle1: evaluation.angle1, 
        angle2: evaluation.angle2,
        accuracy: evaluation.accuracyScore
      });

      setFeedback({
        status: evaluation.statusText,
        colorClass: evaluation.colorStyle,
        ringColor: evaluation.ringStyle,
        stateLabel: evaluation.stateLabel
      });

      // Menggambar eksoskeleton lengkap & highlight garis penghubung sendi aktif
      drawSkeleton(
        ctx, 
        canvasElement, 
        landmarks, 
        evaluation.isValid ? "#10B981" : evaluation.accuracyScore >= 70 ? "#F59E0B" : "#F43F5E", 
        evaluation.activePoints
      );
    } else {
      setFeedback({
        status: "Sistem gagal mengekstraksi landmark tubuh. Pastikan tubuh terlihat utuh.",
        colorClass: "bg-gray-950 text-gray-400 border-gray-800",
        ringColor: "border-gray-700",
        stateLabel: ""
      });
    }
  };

  const drawSkeleton = (ctx, canvas, landmarks, colorHex, activePoints = []) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 1. Konfigurasi Gaya Garis dan Titik
    ctx.fillStyle = colorHex;       // Warna titik sendi (Hijau/Kuning/Merah)
    ctx.strokeStyle = colorHex;     // Warna garis tulang (Mengikuti status akurasi)
    ctx.lineWidth = Math.max(3, canvas.width / 250); // Ketebalan garis proporsional dengan ukuran gambar

    // 2. Daftar Hubungan Sendi (Koneksi Tulang) untuk Subset Utama Jurnal JUTIF
    const CONNECTIONS = [
      [JOINTS.LEFT_SHOULDER, JOINTS.RIGHT_SHOULDER], // Garis antar Bahu
      [JOINTS.LEFT_SHOULDER, JOINTS.LEFT_ELBOW],     // Lengan Atas Kiri
      [JOINTS.LEFT_ELBOW, JOINTS.LEFT_WRIST],        // Lengan Bawah Kiri
      [JOINTS.RIGHT_SHOULDER, JOINTS.RIGHT_ELBOW],   // Lengan Atas Kanan
      [JOINTS.RIGHT_ELBOW, JOINTS.RIGHT_WRIST],      // Lengan Bawah Kanan
      [JOINTS.LEFT_SHOULDER, JOINTS.LEFT_HIP],       // Batang Tubuh Kiri
      [JOINTS.RIGHT_SHOULDER, JOINTS.RIGHT_HIP],     // Batang Tubuh Kanan
      [JOINTS.LEFT_HIP, JOINTS.RIGHT_HIP],           // Garis antar Pinggul
      [JOINTS.LEFT_HIP, JOINTS.LEFT_KNEE],           // Paha Kiri
      [JOINTS.LEFT_KNEE, JOINTS.LEFT_ANKLE],         // Betis Kiri
      [JOINTS.RIGHT_HIP, JOINTS.RIGHT_KNEE],         // Paha Kanan
      [JOINTS.RIGHT_KNEE, JOINTS.RIGHT_ANKLE]        // Betis Kanan
    ];

    // 3. Pipa Penggambaran Garis Tulang (Kerangka)
    CONNECTIONS.forEach(([indexStart, indexEnd]) => {
      const startPoint = landmarks[indexStart];
      const endPoint = landmarks[indexEnd];

      // Gambar garis hanya jika kedua titik sendi terdeteksi dengan baik oleh MediaPipe
      if (startPoint && endPoint && startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
        ctx.stroke();
      }
    });

    // 2. Gambar semua landmark yang terdeteksi secara tipis
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; 
    Object.values(JOINTS).forEach((index) => {
      const landmark = landmarks[index];
      if (landmark && landmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    Object.values(JOINTS).forEach((index) => {
      const landmark = landmarks[index];
      if (landmark && landmark.visibility > 0.5) {
        ctx.beginPath();
        // Menggambar bulatan putih di tengah dengan pinggiran warna status
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, Math.max(6, canvas.width / 180), 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF"; // Efek cincin putih di setiap sendi agar kontras
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // 3. Hubungkan sendi aktif yang dievaluasi dengan garis berwarna tebal (eksoskeleton aktif)
    if (activePoints.length >= 2) {
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(activePoints[0].x * canvas.width, activePoints[0].y * canvas.height);
      for (let i = 1; i < activePoints.length; i++) {
        if (activePoints[i]) {
          ctx.lineTo(activePoints[i].x * canvas.width, activePoints[i].y * canvas.height);
        }
      }
      ctx.stroke();
    }

    // 4. Gambar lingkaran yang lebih besar dan menyala untuk sendi aktif yang dievaluasi
    activePoints.forEach((point) => {
      if (point) {
        ctx.fillStyle = colorHex;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    });
  };

  // Hitung circumference untuk progress ring SVG
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (metrics.accuracy / 100) * circumference;

  // Dapatkan detail target range
  const getPoseDetails = () => {
    switch (selectedPose) {
      case "TREE":
        return {
          title: "Tree Pose",
          joints: "Lutut Kiri (Hip-Knee-Ankle)",
          target: "≤ 60°"
        };
      case "WARRIOR_II":
        return {
          title: "Warrior II Pose",
          joints: "Bahu Kanan (Wrist-Shoulder-Hip)",
          target: "80° - 105°"
        };
      case "COBRA":
        return {
          title: "Cobra Pose",
          joints: "Tulang Belakang Kanan (Shoulder-Hip-Ground)",
          target: "30° - 55°"
        };
      default:
        return {
          title: "Unknown Pose",
          joints: "-",
          target: "-"
        };
    }
  };

  const poseDetails = getPoseDetails();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 flex flex-col items-center justify-center relative">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="mb-6 text-center relative z-10 flex flex-col items-center">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tight">
          Edge AI Yoga Assistant
        </h1>
        <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-semibold">
          Edge AI Client-Side System Evaluation (Statistical Mode)
        </p>
        {user && (
          <p className="text-emerald-400 text-sm font-semibold mt-3 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-900/50 inline-block">
            Selamat datang, {user.name}!
          </p>
        )}

        {/* TABS SELECTOR MODE (KAMERA VS GAMBAR) */}
        <div className="flex bg-gray-900/90 p-1.5 rounded-2xl border border-gray-800/80 mt-6 shadow-lg">
          <button 
            onClick={() => {
              setMode("CAMERA");
              setMetrics({ angle1: 0, angle2: 0, accuracy: 0 });
              setFeedback({
                status: "Silakan posisikan tubuh Anda di depan kamera untuk memulai latihan.",
                colorClass: "bg-gray-950 text-gray-400 border-gray-800",
                ringColor: "border-gray-700",
                stateLabel: ""
              });
            }} 
            className={`px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 ${
              mode === "CAMERA" ? "bg-emerald-500 text-gray-950 shadow-md transform scale-105" : "text-gray-400 hover:text-white"
            }`}
          >
            🎥 Kamera Real-Time
          </button>
          <button 
            onClick={() => {
              setMode("IMAGE");
              setMetrics({ angle1: 0, angle2: 0, accuracy: 0 });
              setFeedback({
                status: "Silakan unggah gambar uji untuk memulai evaluasi.",
                colorClass: "bg-gray-950 text-gray-400 border-gray-800",
                ringColor: "border-gray-700",
                stateLabel: ""
              });
            }} 
            className={`px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 ${
              mode === "IMAGE" ? "bg-emerald-500 text-gray-950 shadow-md transform scale-105" : "text-gray-400 hover:text-white"
            }`}
          >
            📁 Pengujian Gambar (JUTIF)
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl w-full relative z-10">
        <div className="lg:col-span-2 space-y-4">
          {mode === "CAMERA" ? (
            isPaused ? (
              <PausePanelInfo 
                sessionPaused={isPaused}
                avgFps={53}
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
              />
            ) : (
              <CameraView onFrameUpdate={handleFrameUpdate} isMuted={isMuted} />
            )
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-900/60 backdrop-blur-md p-4 rounded-xl border border-gray-800/80 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Pilih Target Pengujian Pose:</span>
                <select 
                  value={selectedPose} 
                  onChange={(e) => {
                    setSelectedPose(e.target.value);
                    setMetrics({ angle1: 0, angle2: 0, accuracy: 0 });
                    setFeedback({
                      status: "Silakan unggah gambar uji baru untuk mengevaluasi pose ini.",
                      colorClass: "bg-gray-950 text-gray-400 border-gray-800",
                      ringColor: "border-gray-700",
                      stateLabel: ""
                    });
                  }}
                  className="bg-gray-950 text-emerald-400 text-sm rounded-lg border border-gray-700 p-2 cursor-pointer outline-none"
                >
                  <option value="TREE">Tree Pose (Vertikal)</option>
                  <option value="WARRIOR_II">Warrior II Pose (Horizontal)</option>
                  <option value="COBRA">Cobra Pose (Lantai)</option>
                </select>
              </div>
              <ImageTestView onImageProcessed={handleImageProcessed} />
            </div>
          )}
        </div>

        {/* Panel Metrik & Feedback Kanan */}
        <div className="space-y-4 flex flex-col justify-start">
          {mode === "CAMERA" ? (
            /* Mode Kamera: Render original InfoPanel dari codebase */
            <InfoPanel 
              metrics={metrics} 
              selectedPose={selectedPose} 
              setSelectedPose={setSelectedPose} 
              isPaused={isPaused}
              setIsPaused={setIsPaused}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              onFullScreen={handleFullScreen}
              onLogout={() => {
                localStorage.removeItem('yoga_logged_user');
                setUser(null);
              }}
            />
          ) : (
            /* Mode Gambar: Info panel statis khusus JUTIF */
            <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800/80 space-y-4">
              <h2 className="text-lg font-bold text-gray-200 border-l-2 border-emerald-500 pl-3">Matriks Evaluasi Gambar</h2>
              <div className="space-y-3">
                <div className="bg-gray-950/70 p-4 rounded-xl border border-gray-800/80">
                  <span className="text-xs text-gray-400 block mb-1">Sudut Utama (Primer)</span>
                  <span className="text-3xl font-black text-emerald-400">{metrics.angle1}°</span>
                </div>
                {selectedPose !== "COBRA" && (
                  <div className="bg-gray-950/70 p-4 rounded-xl border border-gray-800/80">
                    <span className="text-xs text-gray-400 block mb-1">Sudut Sekunder</span>
                    <span className="text-3xl font-black text-emerald-300">{metrics.angle2}°</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panel State Akurasi Tambahan: EXCELLENT, GOOD, BAD, & Eksoskeleton Info */}
          <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-800/80 flex flex-col items-center space-y-5">
            <h2 className="text-lg font-bold text-gray-200 self-start border-l-2 border-emerald-500 pl-3">Akurasi & State Evaluasi</h2>
            
            {/* SVG Circular Progress Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className={`absolute inset-2 rounded-full transition-all duration-700 opacity-10 blur-lg ${
                metrics.accuracy === 100 ? 'bg-emerald-500' : metrics.accuracy >= 70 ? 'bg-amber-500' : metrics.accuracy > 0 ? 'bg-rose-500' : 'bg-transparent'
              }`} />
              
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-gray-950/80"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className={`transition-all duration-700 ease-out ${
                    metrics.accuracy === 100 ? 'stroke-emerald-500' : metrics.accuracy >= 70 ? 'stroke-amber-500' : 'stroke-rose-500'
                  }`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black tracking-tight">{metrics.accuracy}%</span>
                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">Accuracy</span>
              </div>
            </div>

            {/* State Label Badge */}
            {feedback.stateLabel && (
              <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest border transition-all duration-500 ${
                feedback.stateLabel === "EXCELLENT" 
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/50" 
                  : feedback.stateLabel === "GOOD" 
                  ? "bg-amber-950/60 text-amber-400 border-amber-500/50" 
                  : "bg-rose-950/60 text-rose-400 border-rose-500/50"
              }`}>
                {feedback.stateLabel}
              </div>
            )}

            {/* Parameter Standar Info */}
            <div className="w-full bg-gray-950/60 p-4 rounded-xl border border-gray-800/80 text-left">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Target Geometri ({poseDetails.title})</span>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs font-semibold text-gray-300">{poseDetails.joints}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60 whitespace-nowrap">{poseDetails.target}</span>
              </div>
            </div>

            {/* Feedback Status Box */}
            <div className={`p-4 w-full rounded-xl text-center font-bold text-xs leading-relaxed border transition-all duration-500 ${feedback.colorClass}`}>
              {feedback.status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;