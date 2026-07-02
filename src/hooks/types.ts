import { Point } from "../utils/geometry";

export interface PoseEvaluation {
  angle1: number;
  angle2: number;
  minTarget: number;
  maxTarget: number;
  activePoints: (Point | undefined | null)[];
  accuracyScore: number;
  stateLabel: string;
  statusText: string;
  statusType: "EXCELLENT" | "GOOD" | "BAD";
  isValid: boolean;
}
