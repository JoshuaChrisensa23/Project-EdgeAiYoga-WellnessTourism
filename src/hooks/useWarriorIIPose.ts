import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { JOINTS, calculateAngle, calculateAccuracy } from "../utils/geometry";
import { PoseEvaluation } from "./types";

export const useWarriorIIPose = () => {
  const evaluate = (landmarks: NormalizedLandmark[]): PoseEvaluation => {
    const wrist = landmarks[JOINTS.RIGHT_WRIST];
    const shoulder = landmarks[JOINTS.RIGHT_SHOULDER];
    const rightHip = landmarks[JOINTS.RIGHT_HIP];
    const rightKnee = landmarks[JOINTS.RIGHT_KNEE];
    const rightAnkle = landmarks[JOINTS.RIGHT_ANKLE];
    const leftHip = landmarks[JOINTS.LEFT_HIP];
    const leftKnee = landmarks[JOINTS.LEFT_KNEE];
    const leftAnkle = landmarks[JOINTS.LEFT_ANKLE];

    const angle1 = calculateAngle(wrist, shoulder, rightHip);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);

    // Cari lutut yang terentang penuh
    const angle2 = Math.max(leftKneeAngle, rightKneeAngle);
    const bentKneeAngle = Math.min(leftKneeAngle, rightKneeAngle);

    const minTarget = 80;
    const maxTarget = 105;
    const activePoints = [wrist, shoulder, rightHip];

    const accuracyScore = calculateAccuracy(angle1, minTarget, maxTarget);
    const isValid =
      angle1 >= 80 &&
      angle1 <= 105 &&
      angle2 >= 170 &&
      angle2 <= 180 &&
      bentKneeAngle <= 150;

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
