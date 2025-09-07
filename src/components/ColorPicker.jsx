import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Palette, Plus, Download, Upload } from 'lucide-react';

const ColorPicker = () => {
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [hexInput, setHexInput] = useState('#3b82f6');
  const [palette, setPalette] = useState(['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']);
  const [savedPalettes, setSavedPalettes] = useState([
    { name: 'Ocean Blues', colors: ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'] },
    { name: 'Sunset Vibes', colors: ['#f97316', '#ea580c', '#dc2626', '#be123c', '#9f1239'] }
  ]);
  const [paletteName, setPaletteName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Convert RGB to HSL for better color manipulation
  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  };

  // Update hex input when color changes
  useEffect(() => {
    setHexInput(currentColor);
  }, [currentColor]);

  // Handle hex input change
  const handleHexChange = (value) => {
    setHexInput(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setCurrentColor(value);
    }
  };

  // Copy color to clipboard
  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
  };

  // Add current color to palette
  const addToPalette = () => {
    if (!palette.includes(currentColor)) {
      setPalette([...palette, currentColor]);
    }
  };

  // Remove color from palette
  const removeFromPalette = (index) => {
    setPalette(palette.filter((_, i) => i !== index));
  };

  // Generate complementary colors
  const generateComplementary = () => {
    const rgb = hexToRgb(currentColor);
    if (!rgb) return;
    
    const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const complementaryH = (h + 180) % 360;
    
    const hslToRgb = (h, s, l) => {
      h /= 360; s /= 100; l /= 100;
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      if (s === 0) {
        return [l, l, l];
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        return [
          hue2rgb(p, q, h + 1/3),
          hue2rgb(p, q, h),
          hue2rgb(p, q, h - 1/3)
        ];
      }
    };
    
    const [r, g, b] = hslToRgb(complementaryH, s, l);
    const compHex = '#' + Math.round(r * 255).toString(16).padStart(2, '0') + 
                          Math.round(g * 255).toString(16).padStart(2, '0') + 
                          Math.round(b * 255).toString(16).padStart(2, '0');
    
    setPalette([currentColor, compHex]);
  };

  // Generate analogous colors
  const generateAnalogous = () => {
    const rgb = hexToRgb(currentColor);
    if (!rgb) return;
    
    const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const analogous = [];
    
    for (let i = -60; i <= 60; i += 30) {
      const newH = (h + i + 360) % 360;
      const [r, g, b] = hslToRgb(newH, s, l);
      const hex = '#' + Math.round(r * 255).toString(16).padStart(2, '0') + 
                        Math.round(g * 255).toString(16).padStart(2, '0') + 
                        Math.round(b * 255).toString(16).padStart(2, '0');
      analogous.push(hex);
    }
    
    setPalette(analogous);
  };

  const hslToRgb = (h, s, l) => {
    h /= 360; s /= 100; l /= 100;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    if (s === 0) {
      return [l, l, l];
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      return [
        hue2rgb(p, q, h + 1/3),
        hue2rgb(p, q, h),
        hue2rgb(p, q, h - 1/3)
      ];
    }
  };

  // Save current palette
  const savePalette = () => {
    if (paletteName.trim()) {
      setSavedPalettes([...savedPalettes, { name: paletteName, colors: [...palette] }]);
      setPaletteName('');
      setShowSaveDialog(false);
    }
  };

  // Load saved palette
  const loadPalette = (savedPalette) => {
    setPalette(savedPalette.colors);
    setCurrentColor(savedPalette.colors[0]);
  };

  // Delete saved palette
  const deleteSavedPalette = (index) => {
    setSavedPalettes(savedPalettes.filter((_, i) => i !== index));
  };

  const rgb = hexToRgb(currentColor);
  const textColor = rgb && (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 186 ? '#000000' : '#ffffff';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Color Picker & Palette Visualizer</h1>
          <p className="text-gray-600">Create, explore, and manage beautiful color palettes</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Color Picker Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Palette className="w-6 h-6" />
              Color Picker
            </h2>
            
            {/* Color Display */}
            <div 
              className="w-full h-32 rounded-xl mb-6 flex items-center justify-center text-2xl font-mono border-4 border-gray-200 shadow-inner transition-all duration-300"
              style={{ backgroundColor: currentColor, color: textColor }}
            >
              {currentColor.toUpperCase()}
            </div>

            {/* HTML Color Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Picker</label>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-200"
              />
            </div>

            {/* Hex Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hex Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg font-mono"
                  placeholder="#000000"
                />
                <button
                  onClick={() => copyToClipboard(currentColor)}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Color Information */}
            {rgb && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div>
                  <div className="text-sm text-gray-600">RGB</div>
                  <div className="font-mono text-sm">{rgb.r}, {rgb.g}, {rgb.b}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">HSL</div>
                  <div className="font-mono text-sm">
                    {rgbToHsl(rgb.r, rgb.g, rgb.b).map(v => Math.round(v)).join(', ')}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={addToPalette}
                className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add to Palette
              </button>
              <button
                onClick={generateComplementary}
                className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Complementary
              </button>
              <button
                onClick={generateAnalogous}
                className="p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors col-span-2"
              >
                Generate Analogous
              </button>
            </div>
          </div>

          {/* Palette Visualization Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Current Palette</h2>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Save
              </button>
            </div>

            {/* Current Palette */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {palette.map((color, index) => (
                <div key={index} className="group relative">
                  <div
                    className="aspect-square rounded-lg cursor-pointer border-2 border-gray-200 hover:border-gray-400 transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentColor(color)}
                  />
                  <button
                    onClick={() => removeFromPalette(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="text-xs text-center mt-1 font-mono">{color}</div>
                </div>
              ))}
            </div>

            {/* Large Palette Preview */}
            <div className="h-24 rounded-lg overflow-hidden mb-6 border-2 border-gray-200">
              <div className="flex h-full">
                {palette.map((color, index) => (
                  <div
                    key={index}
                    className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Saved Palettes */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Saved Palettes</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {savedPalettes.map((savedPalette, index) => (
                <div key={index} className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex gap-1 flex-1">
                    {savedPalette.colors.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{savedPalette.name}</div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => loadPalette(savedPalette)}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteSavedPalette(index)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Save Palette</h3>
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                placeholder="Enter palette name"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={savePalette}
                  className="flex-1 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
