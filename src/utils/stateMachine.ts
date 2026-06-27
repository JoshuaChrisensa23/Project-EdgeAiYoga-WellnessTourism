import { createMachine } from "xstate";

export const poseSessionMachine = createMachine(
  {
    types: {} as {
      context: {
        currentPose: string;
        targetReps: number;
        progress: number;
        repsCompleted: number;
        calibration: any;
      };
      events:
        | { type: "START" }
        | { type: "PAUSE" }
        | { type: "FINISH" }
        | { type: "DETECT"; data: any }
        | { type: "RESET_WORKOUT" }
        | { type: "RESUME" };
    },
    id: "poseSession",
    initial: "IDLE",
    context: {
      currentPose: "TREE",
      targetReps: 5,
      progress: 0, // 0-1 untuk menghitung seberapa dekat ke targetRep
      repsCompleted: 0,
      calibration: null,
    },
    states: {
      IDLE: {
        on: {
          START: { target: "ACTIVE", actions: "initializeSession" },
        },
      },
      ACTIVE: {
        on: {
          PAUSE: "PAUSED",
          FINISH: "FINISHED", // Pindah ke FINISHED saat latihan selesai
          DETECT: {
            target: "ACTIVE",
            actions: ["updateMetrics", "checkPoseValidity", "updateRepCounter"],
          },
          RESET_WORKOUT: "IDLE",
        },
      },
      PAUSED: {
        on: {
          RESUME: "ACTIVE",
          RESET_WORKOUT: "IDLE",
        },
      },
      FINISHED: {
        on: {
          RESET_WORKOUT: "IDLE",
        },
      },
    },
  },
  {
    actions: {
      initializeSession: () => {
        console.log("Mulai sesi latihan");
        // reset state
      },
      updateMetrics: ({ event }) => {
        // update metrics dari event.data
        if (event.type === "DETECT") {
          console.log("Update metrics: ", event.data);
        }
      },
      checkPoseValidity: () => {
        // cek apakah pose valid
        // perbarui progress
      },
      updateRepCounter: ({ context }) => {
        // update rep counter
        console.log("Reps completed: ", context.repsCompleted);
        // jika sudah selesai
        if (context.repsCompleted >= context.targetReps) {
          const mutableContext = context as any;
          mutableContext.currentPose = "WARRIOR_II"; // Ganti pose target
          mutableContext.targetReps = 5;
          mutableContext.progress = 0;
          console.log("Ganti pose ke: WARRIOR_II");
        }
      },
    },
  },
);
