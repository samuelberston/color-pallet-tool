import React, { useState } from 'react';
import { Copy, Trash2, Palette as PaletteIcon, Plus, Download, Upload } from 'lucide-react';
import { SketchPicker } from 'react-color';
import chroma from 'chroma-js';
import ImageColorExtractor from './ImageColorExtractor';

const ColorPicker = () => {
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [palette, setPalette] = useState(['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']);
  const [savedPalettes, setSavedPalettes] = useState([
    { name: 'Ocean Blues', colors: ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'] },
    { name: 'Sunset Vibes', colors: ['#f97316', '#ea580c', '#dc2626', '#be123c', '#9f1239'] }
  ]);
  const [paletteName, setPaletteName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleColorChange = (color) => {
    setCurrentColor(color.hex);
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

  // Generate color harmonies using chroma-js
  const generateHarmony = (type) => {
    try {
      let colors;
      const base = chroma(currentColor);
      switch (type) {
        case 'complementary':
          colors = [base.hex(), base.set('hsl.h', '+180').hex()];
          break;
        case 'analogous':
          colors = [base.set('hsl.h', '-30').hex(), base.hex(), base.set('hsl.h', '+30').hex()];
          break;
        case 'triadic':
          colors = [base.hex(), base.set('hsl.h', '+120').hex(), base.set('hsl.h', '+240').hex()];
          break;
        case 'split-complementary':
          colors = [base.hex(), base.set('hsl.h', '+150').hex(), base.set('hsl.h', '+210').hex()];
          break;
        case 'tetradic':
          colors = [base.hex(), base.set('hsl.h', '+90').hex(), base.set('hsl.h', '+180').hex(), base.set('hsl.h', '+270').hex()];
          break;
        case 'monochromatic':
          colors = chroma.scale([base.darken(2), base, base.brighten(2)]).mode('lch').colors(5);
          break;
        default:
          colors = [currentColor];
      }
      setPalette(colors);
    } catch (error) {
      console.error("Invalid color for harmony generation:", error);
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
  
  const handlePaletteFromImage = (newPalette) => {
    setPalette(newPalette);
    if (newPalette.length > 0) {
      setCurrentColor(newPalette[0]);
    }
  };

  const textColor = chroma(currentColor).luminance() > 0.5 ? '#000000' : '#ffffff';
  const colorData = chroma.valid(currentColor) ? chroma(currentColor) : null;

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
              <PaletteIcon className="w-6 h-6" />
              Color Picker
            </h2>
            
            {/* Color Display */}
            <div 
              className="w-full h-32 rounded-xl mb-6 flex items-center justify-center text-2xl font-mono border-4 border-gray-200 shadow-inner transition-all duration-300"
              style={{ backgroundColor: currentColor, color: textColor }}
            >
              {currentColor.toUpperCase()}
            </div>

            {/* React Color SketchPicker */}
            <div className="mb-6">
              <SketchPicker
                color={currentColor}
                onChangeComplete={handleColorChange}
                width="100%"
                className="shadow-none border border-gray-200"
              />
            </div>

            {/* Color Information */}
            {colorData && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div>
                  <div className="text-sm text-gray-600">RGB</div>
                  <div className="font-mono text-sm">{colorData.rgb().join(', ')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">HSL</div>
                  <div className="font-mono text-sm">
                    {colorData.hsl().map(v => (isNaN(v) ? '0' : Math.round(v))).join(', ')}
                  </div>
                </div>
                 <div className="col-span-2">
                  <div className="text-sm text-gray-600">Hex Code</div>
                  <div className="flex gap-2 items-center">
                    <span className="font-mono text-sm">{currentColor.toUpperCase()}</span>
                    <button
                      onClick={() => copyToClipboard(currentColor)}
                      className="p-1 text-gray-500 hover:text-gray-800"
                      title="Copy hex code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={addToPalette}
                className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add to Palette
              </button>
               <button
                onClick={() => generateHarmony('complementary')}
                className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Complementary
              </button>
              <button
                onClick={() => generateHarmony('analogous')}
                className="p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Analogous
              </button>
              <button
                onClick={() => generateHarmony('triadic')}
                className="p-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Triadic
              </button>
              <button
                onClick={() => generateHarmony('split-complementary')}
                className="p-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Split-Comp
              </button>
              <button
                onClick={() => generateHarmony('tetradic')}
                className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Tetradic
              </button>
              <button
                onClick={() => generateHarmony('monochromatic')}
                className="p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors col-span-2"
              >
                Monochromatic
              </button>
            </div>
            <ImageColorExtractor onPaletteReady={handlePaletteFromImage} />
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
