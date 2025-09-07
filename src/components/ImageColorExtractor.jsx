import React, { useState, useRef } from 'react';
import { Palette as ColorPalette, usePalette } from 'color-thief-react';
import { Upload, Droplet } from 'lucide-react';

const ImageColorExtractor = ({ onPaletteReady }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${("000000" + rgbToHex(pixel[0], pixel[1], pixel[2])).slice(-6)}`;
    onPaletteReady([hex]);
  };

  const rgbToHex = (r, g, b) => {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Upload className="w-6 h-6" />
        Image Color Extractor
      </h2>

      <div className="mb-4">
        <label htmlFor="image-upload" className="cursor-pointer w-full inline-flex items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center hover:border-gray-400 hover:bg-gray-100 transition-colors">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
          <input id="image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
        </label>
      </div>

      {uploadedImage && (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Uploaded Image</h3>
            <p className="text-sm text-gray-500 mb-2">Click on the image to pick a color.</p>
            <canvas
              ref={canvasRef}
              className="rounded-lg border-2 border-gray-200 cursor-crosshair w-full"
              onClick={handleCanvasClick}
              onLoad={() => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.src = uploadedImage;
                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx.drawImage(img, 0, 0);
                }
              }}
            >
              <img src={uploadedImage} alt="Uploaded" className="hidden" onLoad={(e) => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                canvas.width = e.target.naturalWidth;
                canvas.height = e.target.naturalHeight;
                ctx.drawImage(e.target, 0, 0);
              }} />
            </canvas>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Extracted Palette</h3>
            <ColorPalette src={uploadedImage} count={6} format="hex" crossOrigin="anonymous">
              {({ data, loading }) => {
                if (loading) return <div>Loading...</div>;
                if (!data) return <div>Could not extract palette.</div>
                return (
                  <div>
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {data.map((color, index) => (
                        <div key={index} className="h-16 rounded-lg" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <button
                      onClick={() => onPaletteReady(data)}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Droplet className="w-4 h-4" />
                      Use this Palette
                    </button>
                  </div>
                );
              }}
            </ColorPalette>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageColorExtractor;
