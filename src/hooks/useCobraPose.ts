import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { JOINTS, calculateAngle, calculateAccuracy } from "../utils/geometry";
import { PoseEvaluation } from "./types";

export const useCobraPose = () => {
  const evaluate = (landmarks: NormalizedLandmark[]): PoseEvaluation => {
    const shoulder = landmarks[JOINTS.RIGHT_SHOULDER];
    const hip = landmarks[JOINTS.RIGHT_HIP];
    const groundVirtualPoint = hip ? { x: shoulder?.x ?? 0, y: hip.y } : null;

    const angle1 = calculateAngle(shoulder, hip, groundVirtualPoint);
    const angle2 = 0;
    const minTarget = 50;
    const maxTarget = 95;
    const activePoints = [shoulder, hip, groundVirtualPoint];

    const accuracyScore = calculateAccuracy(angle1, minTarget, maxTarget);
    const isValid = angle1 >= 50 && angle1 <= 95;

    let stateLabel: string;
    let statusText: string;
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

  return { evaluate };
};
