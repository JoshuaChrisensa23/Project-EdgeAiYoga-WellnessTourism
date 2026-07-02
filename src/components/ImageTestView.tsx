import React, { useRef, useState } from "react";

interface ImageTestViewProps {
  onImageProcessed: (
    image: HTMLImageElement | HTMLVideoElement,
    canvas: HTMLCanvasElement,
  ) => void;
  externalImageSrc?: string | null;
  isDark?: boolean;
}

const ImageTestView: React.FC<ImageTestViewProps> = ({
  onImageProcessed,
  externalImageSrc,
  isDark = false,
}) => {
  const [mediaInfo, setMediaInfo] = useState<{
    url: string;
    type: string;
  } | null>(externalImageSrc ? { url: externalImageSrc, type: "image" } : null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Bersihkan efek ketika unmount atau media berubah
  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mediaInfo]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const type = file.type.startsWith("video/") ? "video" : "image";
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setMediaInfo({ url: e.target.result as string, type });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (image && canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onImageProcessed(image, canvas);
      }
    }
  };

  const handleVideoPlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Set ukuran canvas sesuai video
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const processFrame = () => {
      if (video.paused || video.ended) return;
      onImageProcessed(video, canvas);
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  return (
    <div
      className={`flex flex-col items-center gap-4 w-full p-6 rounded-2xl border transition-colors duration-300 ${
        isDark
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-slate-200 shadow-md"
      }`}
    >
      <div
        className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 hover:border-emerald-500 transition-colors ${
          isDark ? "border-gray-700" : "border-slate-300"
        }`}
      >
        <label
          className={`cursor-pointer text-sm transition-colors ${
            isDark
              ? "text-gray-400 hover:text-emerald-400"
              : "text-slate-500 hover:text-emerald-600 font-medium"
          }`}
        >
          <span>📁 Klik untuk Unggah Media Uji (Gambar/Video Yoga Pose)</span>
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {mediaInfo && (
        <div
          className={`relative mt-2 max-w-full overflow-auto rounded-xl shadow-lg flex justify-center p-2 border transition-colors duration-300 ${
            isDark
              ? "bg-gray-950 border-transparent"
              : "bg-slate-100 border-slate-200"
          }`}
        >
          <div className="relative inline-block">
            {mediaInfo.type === "video" ? (
              <video
                ref={videoRef}
                src={mediaInfo.url}
                autoPlay
                loop
                muted
                playsInline
                crossOrigin="anonymous"
                onPlay={handleVideoPlay}
                className="max-h-[500px] w-auto object-contain opacity-45 rounded-lg"
              />
            ) : (
              <img
                ref={imageRef}
                src={mediaInfo.url}
                alt="Source Test"
                onLoad={handleImageLoad}
                crossOrigin="anonymous"
                className="max-h-[500px] w-auto object-contain opacity-45 rounded-lg"
              />
            )}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageTestView;
