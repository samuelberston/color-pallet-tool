import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Trash2, Palette as PaletteIcon, Plus, Download, Upload, Check, Info, Shuffle, Sun, Moon } from 'lucide-react';
import { SketchPicker } from 'react-color';
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

  const handleColorChange = (color) => {
    setCurrentColor(color.hex);
  };

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

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={addToPalette}
                className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 hover:scale-105 shadow-md"
                title="Add current color to palette (Ctrl+A)"
              >
                <Plus className="w-4 h-4" />
                Add to Palette
              </button>
              <button
                onClick={generateRandomColor}
                className="flex items-center justify-center gap-2 p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 hover:scale-105 shadow-md"
                title="Generate random color (Ctrl+R)"
              >
                <Shuffle className="w-4 h-4" />
                Random
              </button>
            </div>

            {/* Manual Color Input */}
            {showColorInput ? (
              <form onSubmit={handleColorInput} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="Enter color (e.g., #FF0000, rgb(255,0,0))"
                    className="flex-1 p-2 border border-gray-300 rounded"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowColorInput(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowColorInput(true)}
                className="w-full p-3 mb-6 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-800 transition-colors"
              >
                Enter Color Manually
              </button>
            )}

            {/* Color Harmony Generator */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <PaletteIcon className="w-5 h-5" />
                Color Harmonies
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => generateHarmony('complementary')}
                  className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 hover:scale-105 shadow-sm text-sm"
                  title="Two colors opposite on the color wheel"
                >
                  Complementary
                </button>
                <button
                  onClick={() => generateHarmony('analogous')}
                  className="p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-200 hover:scale-105 shadow-sm text-sm"
                  title="Colors adjacent on the color wheel"
                >
                  Analogous
                </button>
                <button
                  onClick={() => generateHarmony('triadic')}
                  className="p-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-200 hover:scale-105 shadow-sm text-sm"
                  title="Three colors evenly spaced on the color wheel"
                >
                  Triadic
                </button>
                <button
                  onClick={() => generateHarmony('split-complementary')}
                  className="p-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-200 hover:scale-105 shadow-sm text-sm"
                  title="Base color plus two adjacent to its complement"
                >
                  Split-Comp
                </button>
                <button
                  onClick={() => generateHarmony('tetradic')}
                  className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 hover:scale-105 shadow-sm text-sm"
                  title="Four colors forming a rectangle on the color wheel"
                >
                  Tetradic
                </button>
                <button
                  onClick={() => generateHarmony('monochromatic')}
                  className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 hover:scale-105 shadow-sm text-sm"
                  title="Variations of a single hue"
                >
                  Monochromatic
                </button>
              </div>
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
            <div className="grid grid-cols-5 gap-3 mb-6">
              {palette.map((color, index) => (
                <div key={index} className="group relative">
                  <div
                    className="aspect-square rounded-xl cursor-pointer border-2 border-gray-200 hover:border-gray-400 transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentColor(color)}
                    title={`Click to select ${color}`}
                  />
                  <button
                    onClick={() => removeFromPalette(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-lg"
                    title="Remove color"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(color)}
                    className="absolute -top-2 -left-2 w-6 h-6 bg-gray-600 hover:bg-gray-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-lg"
                    title="Copy color"
                  >
                    {copiedColor === color ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <div className="text-xs text-center mt-2 font-mono text-gray-600">{color}</div>
                </div>
              ))}
              {palette.length < 8 && (
                <div 
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={addToPalette}
                  title="Add current color to palette"
                >
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
              )}
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
        <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs text-gray-600 max-w-xs">
          <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
          <div>Ctrl+C: Copy current color</div>
          <div>Ctrl+S: Save palette</div>
          <div>Ctrl+R: Random color</div>
          <div>Esc: Close dialogs</div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
