import React, { useEffect, useRef } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

export const usePoseEstimator = () => {
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  useEffect(() => {
    const initTracker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );

      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
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
