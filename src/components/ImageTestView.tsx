import React, { useRef, useState } from "react";

interface ImageTestViewProps {
  onImageProcessed: (image: HTMLImageElement, canvas: HTMLCanvasElement) => void;
  externalImageSrc?: string | null;
}

const ImageTestView: React.FC<ImageTestViewProps> = ({ onImageProcessed, externalImageSrc }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(externalImageSrc || null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Menangani file gambar yang diunggah oleh pengguna
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageSrc(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Dipanggil saat elemen gambar selesai dimuat di layar
  const handleImageLoad = () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    
    if (image && canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        onImageProcessed(image, canvas);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full bg-gray-900 p-6 rounded-2xl border border-gray-800">
      <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl p-4 hover:border-emerald-500 transition-colors">
        <label className="cursor-pointer text-sm text-gray-400 hover:text-emerald-400">
          <span>📁 Klik untuk Unggah Gambar Uji (Yoga Pose)</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload} 
          />
        </label>
      </div>

      {imageSrc && (
        <div className="relative mt-2 max-w-full overflow-auto rounded-xl shadow-lg bg-gray-950 flex justify-center p-2">
          <div className="relative inline-block">
            {/* Gambar tersembunyi/nyata sebagai input MediaPipe */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Source Test"
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
              className="max-h-[500px] w-auto object-contain opacity-45 rounded-lg"
            />
            {/* Kanvas di atas gambar untuk menggambar kerangka sendi */}
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
