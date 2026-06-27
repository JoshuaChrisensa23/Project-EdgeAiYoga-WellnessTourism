import { useRef } from 'react';
import Webcam from 'react-webcam';

const CameraView = ({ onFrameUpdate, isMuted = true }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Fungsi internal untuk memicu inferensi frame per frame
  const handleVideoFrame = () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      // Menyesuaikan ukuran canvas dengan video input
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Mengirim objek video dan canvas ke fungsi pemrosesan utama
      onFrameUpdate(video, canvas);
    }
    
    // Melakukan loop rekursif untuk pemrosesan real-time
    requestAnimationFrame(handleVideoFrame);
  };

  return (
    <div className="relative flex justify-center items-center bg-gray-900 rounded-2xl overflow-hidden shadow-xl max-w-full">
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