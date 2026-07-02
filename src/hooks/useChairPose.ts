import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { JOINTS, calculateAngle, calculateAccuracy } from "../utils/geometry";
import { PoseEvaluation } from "./types";

export const useChairPose = () => {
  const evaluate = (landmarks: NormalizedLandmark[]): PoseEvaluation => {
    const rightHip = landmarks[JOINTS.RIGHT_HIP];
    const rightKnee = landmarks[JOINTS.RIGHT_KNEE];
    const rightAnkle = landmarks[JOINTS.RIGHT_ANKLE];
    const leftHip = landmarks[JOINTS.LEFT_HIP];
    const leftKnee = landmarks[JOINTS.LEFT_KNEE];
    const leftAnkle = landmarks[JOINTS.LEFT_ANKLE];

    // Gunakan rata-rata sudut lutut
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const angle1 = (rightKneeAngle + leftKneeAngle) / 2;
    const angle2 = 0;
    const minTarget = 0;
    const maxTarget = 115;
    const activePoints = [
      rightHip,
      rightKnee,
      rightAnkle,
      leftHip,
      leftKnee,
      leftAnkle,
    ];

    const accuracyScore = calculateAccuracy(angle1, minTarget, maxTarget);
    const isValid = angle1 <= 115;

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
