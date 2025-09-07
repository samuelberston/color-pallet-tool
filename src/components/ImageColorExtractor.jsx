import React, { useState, useRef, useCallback } from 'react';
import { Palette as ColorPalette } from 'color-thief-react';
import { Upload, Droplet, Image as ImageIcon, X } from 'lucide-react';

const ImageColorExtractor = ({ onPaletteReady }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    handleImageUpload(e.target.files[0]);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  }, []);

  const clearImage = () => {
    setUploadedImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center gap-3">
        <ImageIcon className="w-6 h-6" />
        Image Extractor
      </h2>

      <div className="mb-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div
          className={`cursor-pointer w-full inline-flex items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all duration-200 ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
        >
          <div className="text-center">
            {isLoading ? (
              <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            ) : (
              <Upload className={`mx-auto h-8 w-8 ${
                isDragOver ? 'text-blue-500' : 'text-gray-400'
              }`} />
            )}
            <p className="mt-2 text-sm text-gray-600">
              {isLoading ? (
                'Loading image...'
              ) : isDragOver ? (
                <span className="font-semibold text-blue-600">Drop image here</span>
              ) : (
                <>
                  <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            {!isLoading && (
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            )}
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            className="sr-only" 
            onChange={handleFileInput} 
            accept="image/*" 
          />
        </div>
      </div>

      {uploadedImage && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Uploaded Image
              </h3>
              <button
                onClick={clearImage}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Droplet className="w-4 h-4" />
                Click anywhere on the image to pick a specific color
              </p>
            </div>
            
            <div className="relative group">
              <canvas
                ref={canvasRef}
                className="rounded-xl border-2 border-gray-200 cursor-crosshair w-full max-h-96 object-contain shadow-md hover:shadow-lg transition-shadow"
                onClick={handleCanvasClick}
                onLoad={() => {
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  img.src = uploadedImage;
                  img.onload = () => {
                    const maxWidth = 800;
                    const maxHeight = 400;
                    let { width, height } = img;
                    
                    if (width > maxWidth) {
                      height = (height * maxWidth) / width;
                      width = maxWidth;
                    }
                    if (height > maxHeight) {
                      width = (width * maxHeight) / height;
                      height = maxHeight;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    canvas.style.width = `${width}px`;
                    canvas.style.height = `${height}px`;
                    ctx.drawImage(img, 0, 0, width, height);
                  }
                }}
              >
                <img src={uploadedImage} alt="Uploaded" className="hidden" onLoad={(e) => {
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  const maxWidth = 800;
                  const maxHeight = 400;
                  let { naturalWidth: width, naturalHeight: height } = e.target;
                  
                  if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                  }
                  if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                  }
                  
                  canvas.width = width;
                  canvas.height = height;
                  canvas.style.width = `${width}px`;
                  canvas.style.height = `${height}px`;
                  ctx.drawImage(e.target, 0, 0, width, height);
                }} />
              </canvas>
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm text-gray-700">
                  Click to pick color
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Droplet className="w-5 h-5" />
              Extracted Palette
            </h3>
            <ColorPalette src={uploadedImage} count={8} format="hex" crossOrigin="anonymous">
              {({ data, loading }) => {
                if (loading) return (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="ml-2 text-gray-600">Extracting colors...</span>
                  </div>
                );
                if (!data) return (
                  <div className="p-8 text-center text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    Could not extract colors from this image.
                  </div>
                );
                return (
                  <div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 mb-6">
                      {data.map((color, index) => (
                        <div key={index} className="group relative">
                          <div 
                            className="aspect-square rounded-xl cursor-pointer border-2 border-gray-200 hover:border-gray-400 transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg" 
                            style={{ backgroundColor: color }}
                            onClick={() => onPaletteReady([color])}
                            title={`Use ${color}`}
                          />
                          <div className="text-xs text-center mt-1 font-mono text-gray-600">{color}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => onPaletteReady(data)}
                        className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-md"
                      >
                        <Droplet className="w-4 h-4" />
                        Use Full Palette
                      </button>
                      <button
                        onClick={() => onPaletteReady(data.slice(0, 5))}
                        className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 hover:scale-105 shadow-md"
                      >
                        <Droplet className="w-4 h-4" />
                        Use Top 5
                      </button>
                    </div>
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
