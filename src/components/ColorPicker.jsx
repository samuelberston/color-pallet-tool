import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Trash2, Palette as PaletteIcon, Plus, Download, Upload, Check, Info, Shuffle } from 'lucide-react';
import chroma from 'chroma-js';
import ImageColorExtractor from './ImageColorExtractor';

const ColorPicker = () => {
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [palette, setPalette] = useState(['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']);
  const [savedPalettes, setSavedPalettes] = useState([
    { name: 'Ocean Blues', colors: ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'] },
    { name: 'Sunset Vibes', colors: ['#f97316', '#ea580c', '#dc2626', '#be123c', '#9f1239'] },
    { name: 'Forest Greens', colors: ['#065f46', '#047857', '#059669', '#10b981', '#34d399'] },
    { name: 'Purple Dreams', colors: ['#581c87', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'] }
  ]);
  const [paletteName, setPaletteName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [copiedColor, setCopiedColor] = useState(null);
  const [showColorInput, setShowColorInput] = useState(false);
  const [colorInput, setColorInput] = useState('');
  const [notification, setNotification] = useState(null);


  // Show notification
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Copy color to clipboard with feedback
  const copyToClipboard = useCallback(async (color) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      showNotification(`Copied ${color} to clipboard!`, 'success');
      setTimeout(() => setCopiedColor(null), 2000);
    } catch {
      showNotification('Failed to copy color', 'error');
    }
  }, [showNotification]);

  // Generate random color
  const generateRandomColor = () => {
    const randomColor = chroma.random().hex();
    setCurrentColor(randomColor);
  };

  // Manual color input
  const handleColorInput = (e) => {
    e.preventDefault();
    if (chroma.valid(colorInput)) {
      setCurrentColor(colorInput);
      setShowColorInput(false);
      setColorInput('');
    } else {
      showNotification('Invalid color format. Try #FF0000 or rgb(255,0,0)', 'error');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'c':
            e.preventDefault();
            copyToClipboard(currentColor);
            break;
          case 's':
            e.preventDefault();
            setShowSaveDialog(true);
            break;
          case 'r':
            e.preventDefault();
            generateRandomColor();
            break;
        }
      }
      if (e.key === 'Escape') {
        setShowSaveDialog(false);
        setShowColorInput(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentColor, copyToClipboard]);

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
      showNotification(`Palette "${paletteName}" saved successfully!`, 'success');
    }
  };

  // Load saved palette
  const loadPalette = (savedPalette) => {
    setPalette(savedPalette.colors);
    setCurrentColor(savedPalette.colors[0]);
    showNotification(`Loaded palette "${savedPalette.name}"`, 'success');
  };

  // Delete saved palette
  const deleteSavedPalette = (index) => {
    const deletedPalette = savedPalettes[index];
    setSavedPalettes(savedPalettes.filter((_, i) => i !== index));
    showNotification(`Deleted palette "${deletedPalette.name}"`, 'info');
  };
  
  const handlePaletteFromImage = (newPalette) => {
    setPalette(newPalette);
    if (newPalette.length > 0) {
      setCurrentColor(newPalette[0]);
    }
    showNotification(`Extracted ${newPalette.length} colors from image`, 'success');
  };

  const textColor = chroma(currentColor).luminance() > 0.5 ? '#000000' : '#ffffff';
  const colorData = chroma.valid(currentColor) ? chroma(currentColor) : null;

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">Color Palette Pro</h1>
          <p className="text-gray-500 text-lg">Your go-to tool for creating beautiful color palettes.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Color Picker Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center gap-3">
              <PaletteIcon className="w-6 h-6" />
              Color Picker
            </h2>

            {/* Color Display */}
            <div
              className="w-full h-32 rounded-xl mb-4 flex items-center justify-center text-2xl font-mono border-2 border-gray-200 shadow-inner transition-all duration-300"
              style={{ backgroundColor: currentColor, color: textColor }}
            >
              {currentColor.toUpperCase()}
            </div>

            {/* Color Information */}
            {colorData && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">HEX</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-800">{currentColor.toUpperCase()}</span>
                    <button
                      onClick={() => copyToClipboard(currentColor)}
                      className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md"
                      title="Copy hex code"
                    >
                      {copiedColor === currentColor ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">RGB</span>
                  <span className="font-mono text-gray-800">{colorData.rgb().map(v => Math.round(v)).join(', ')}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">HSL</span>
                  <span className="font-mono text-gray-800">
                    {(() => {
                      const [h, s, l] = colorData.hsl();
                      return `${isNaN(h) ? 0 : Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
                    })()}
                  </span>
                </div>
              </div>
            )}

            {/* HSL Sliders */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Hue</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={colorData ? Math.round(colorData.hsl()[0] || 0) : 0}
                  onChange={(e) => {
                    if (colorData) {
                      const newColor = chroma.hsl(e.target.value, colorData.hsl()[1], colorData.hsl()[2]).hex();
                      setCurrentColor(newColor);
                    }
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: colorData ? `linear-gradient(to right, ${chroma.hsl(0, 1, 0.5).hex()}, ${chroma.hsl(60, 1, 0.5).hex()}, ${chroma.hsl(120, 1, 0.5).hex()}, ${chroma.hsl(180, 1, 0.5).hex()}, ${chroma.hsl(240, 1, 0.5).hex()}, ${chroma.hsl(300, 1, 0.5).hex()}, ${chroma.hsl(360, 1, 0.5).hex()})` : `linear-gradient(to right, ${chroma.hsl(0, 1, 0.5).hex()}, ${chroma.hsl(60, 1, 0.5).hex()}, ${chroma.hsl(120, 1, 0.5).hex()}, ${chroma.hsl(180, 1, 0.5).hex()}, ${chroma.hsl(240, 1, 0.5).hex()}, ${chroma.hsl(300, 1, 0.5).hex()}, ${chroma.hsl(360, 1, 0.5).hex()})`
                  }}
                  title="Hue"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Saturation</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={colorData ? colorData.hsl()[1] : 0}
                  onChange={(e) => {
                    if (colorData) {
                      const newColor = chroma.hsl(colorData.hsl()[0], parseFloat(e.target.value), colorData.hsl()[2]).hex();
                      setCurrentColor(newColor);
                    }
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: colorData ? `linear-gradient(to right, ${chroma.hsl(colorData.hsl()[0], 0, colorData.hsl()[2]).hex()}, ${chroma.hsl(colorData.hsl()[0], 1, colorData.hsl()[2]).hex()})` : '#ccc'
                  }}
                  title="Saturation"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Lightness</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={colorData ? colorData.hsl()[2] : 0}
                  onChange={(e) => {
                    if (colorData) {
                      const newColor = chroma.hsl(colorData.hsl()[0], colorData.hsl()[1], parseFloat(e.target.value)).hex();
                      setCurrentColor(newColor);
                    }
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: colorData ? `linear-gradient(to right, black, ${chroma.hsl(colorData.hsl()[0], colorData.hsl()[1], 0.5).hex()}, white)` : '#ccc'
                  }}
                  title="Lightness"
                />
              </div>
            </div>

            {/* Quick Actions & Manual Input */}
            <div className="space-y-4">
              {/* Quick Actions & Manual Input */}
              <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={addToPalette}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    title="Add current color to palette (Ctrl+A)"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Palette
                  </button>
                  <button
                    onClick={generateRandomColor}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    title="Generate random color (Ctrl+R)"
                  >
                    <Shuffle className="w-4 h-4" />
                    Random
                  </button>
                </div>
                {showColorInput ? (
                  <form onSubmit={handleColorInput}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        placeholder="e.g. #FF0000"
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowColorInput(true)}
                    className="w-full p-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-800 transition-colors text-sm"
                  >
                    Enter Color Manually
                  </button>
                )}
              </div>

              {/* Color Harmony Generator */}
              <details className="bg-gray-50 p-3 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
                  <PaletteIcon className="w-5 h-5" />
                  Color Harmonies
                </summary>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {['complementary', 'analogous', 'triadic', 'split-complementary', 'tetradic', 'monochromatic'].map(type => (
                    <button
                      key={type}
                      onClick={() => generateHarmony(type)}
                      className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs capitalize"
                    >
                      {type.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {/* Palette Visualization Section */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Current Palette</h2>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Save Palette
              </button>
            </div>

            {/* Current Palette */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              {palette.map((color, index) => (
                <div key={index} className="group relative aspect-square">
                  <div
                    className="w-full h-full rounded-lg cursor-pointer border-2 border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentColor(color)}
                    title={`Click to select ${color}`}
                  />
                  <div className="absolute top-0 right-0 flex translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <button
                      onClick={() => copyToClipboard(color)}
                      className="w-6 h-6 bg-gray-700 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg"
                      title="Copy color"
                    >
                      {copiedColor === color ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => removeFromPalette(index)}
                      className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                      title="Remove color"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {palette.length < 10 && (
                <button
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={addToPalette}
                  title="Add current color to palette"
                >
                  <Plus className="w-6 h-6 text-gray-400" />
                </button>
              )}
            </div>

            {/* Saved Palettes */}
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Saved Palettes</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {savedPalettes.map((savedPalette, index) => (
                <div key={index} className="group flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {savedPalette.colors.slice(0, 5).map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="w-6 h-6 rounded-full border-2 border-white group-hover:border-gray-100"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="font-medium text-gray-800 text-sm">{savedPalette.name}</div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => loadPalette(savedPalette)}
                      className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      title="Load palette"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSavedPalette(index)}
                      className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Delete palette"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Color Extractor Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <ImageColorExtractor onPaletteReady={handlePaletteFromImage} />
          </div>
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-semibold mb-4">Save Palette</h3>
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                placeholder="Enter palette name"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') savePalette();
                }}
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
                  className="flex-1 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
                  disabled={!paletteName.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' && <Check className="w-4 h-4" />}
              {notification.type === 'error' && <Info className="w-4 h-4" />}
              {notification.type === 'info' && <Info className="w-4 h-4" />}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Info */}
        <div className="fixed bottom-2 left-2 bg-gray-800 text-white rounded-lg shadow-lg p-2 text-xs max-w-xs opacity-75 hover:opacity-100 transition-opacity">
          <div className="font-semibold mb-1">Shortcuts:</div>
          <div>Ctrl+C: Copy • Ctrl+S: Save • Ctrl+R: Random</div>
        </div>
      </div>
    </>
  );
};

export default ColorPicker;
