import { useEffect, useRef } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

export const usePoseEstimator = () => {
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  useEffect(() => {
    const initTracker = async () => {
      // WASM (WebAssembly) berjalan di sini: FilesetResolver memuat file binari WASM (.wasm)
      // dari CDN ke dalam browser client untuk melakukan komputasi matematis/AI performa tinggi secara lokal.
      const vision = await FilesetResolver.forVisionTasks(
        import.meta.env.VITE_MEDIAPIPE_WASM_URL || "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );

      // MediaPipe Pose Landmarker diinisialisasi di sini:
      // Menggunakan model deep learning (pose_landmarker_full.task) untuk mendeteksi titik koordinat tubuh (landmarks).
      // Model didelegasikan ke GPU client melalui WebGL/WASM untuk akselerasi hardware secara real-time.
      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              import.meta.env.VITE_MEDIAPIPE_MODEL_URL || "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
            delegate: "GPU",
          },
          runningMode: "IMAGE", // UBAH DARI "VIDEO" MENJADI "IMAGE" UNTUK TESTING GAMBAR
          outputSegmentationMasks: false,
        },
      );
      console.log("Edge AI Pose Landmarker (Modus Gambar) Siap.");
    };

    initTracker();
  }, []);

  return poseLandmarkerRef;
};
