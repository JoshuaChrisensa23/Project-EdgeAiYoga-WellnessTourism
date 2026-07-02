import React, { useRef } from "react";
import Webcam from "react-webcam";

interface CameraViewProps {
  onFrameUpdate: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  isMuted?: boolean;
  isDark?: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({
  onFrameUpdate,
  isMuted = true,
  isDark = false,
}) => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onFrameUpdateRef = useRef(onFrameUpdate);
  onFrameUpdateRef.current = onFrameUpdate;

  const handleVideoFrame = () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;

      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        onFrameUpdateRef.current(video, canvas);
      }
    }

    requestAnimationFrame(handleVideoFrame);
  };

  return (
    <div
      className={`relative flex justify-center items-center rounded-2xl overflow-hidden shadow-xl max-w-full border transition-colors duration-300 ${isDark ? "bg-gray-900 border-transparent" : "bg-slate-100 border-slate-200"}`}
    >
      <Webcam
        ref={webcamRef}
        audio={!isMuted}
        onUserMedia={handleVideoFrame}
        className="w-full h-auto rounded-2xl object-cover transform scale-x-[-1]"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none transform scale-x-[-1]"
      />
    </div>
  );
};

export default CameraView;
