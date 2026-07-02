import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { JOINTS, calculateAngle, calculateAccuracy } from "../utils/geometry";
import { PoseEvaluation } from "./types";

export const useTreePose = () => {
  const evaluate = (landmarks: NormalizedLandmark[]): PoseEvaluation => {
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

    const angle1 = activeKneeAngle;
    const angle2 = supportKneeAngle;

    const minTarget = 0;
    const maxTarget = 60;
    const activePoints =
      leftKneeAngle < rightKneeAngle
        ? [leftHip, leftKnee, leftAnkle]
        : [rightHip, rightKnee, rightAnkle];

    let accuracyScore = calculateAccuracy(angle1, minTarget, maxTarget);
    if (angle2 < 160 && accuracyScore === 100) {
      accuracyScore = 75;
    }

    const isValid = angle1 <= 60 && angle2 >= 170;

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
