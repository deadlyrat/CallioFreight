import React, { useState } from 'react';
import { generateSceneDescriptions, generateColoringPageImage } from '../services/ai';
import { jsPDF } from 'jspdf';
import { Download, Wand2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Generator() {
  const [childName, setChildName] = useState('');
  const [theme, setTheme] = useState('');
  const [imageSize, setImageSize] = useState('1K');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !theme.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    setProgressPercent(5);
    setProgressMsg("Brainstorming fun scenes...");

    try {
      const scenes = await generateSceneDescriptions(theme);
      setProgressPercent(20);
      
      const newImages: string[] = [];
      
      // Generate images sequentially to show progress and avoid overwhelming the API
      for (let i = 0; i < scenes.length; i++) {
        setProgressMsg(`Drawing page ${i + 1} of 5: ${scenes[i]}...`);
        const imgData = await generateColoringPageImage(scenes[i], imageSize);
        
        if (imgData) {
          newImages.push(imgData);
          setGeneratedImages(prev => [...prev, imgData]);
        } else {
          console.warn(`Failed to generate image for scene: ${scenes[i]}`);
        }
        
        setProgressPercent(20 + ((i + 1) / scenes.length) * 80);
      }

      if (newImages.length === 0) {
        throw new Error("Failed to generate any images. Please try again.");
      }

      setProgressMsg("All done!");
      setProgressPercent(100);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (generatedImages.length === 0) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: "letter"
    });

    // Cover Page
    doc.setFontSize(48);
    doc.setFont("helvetica", "bold");
    doc.text(`${childName}'s`, 4.25, 4, { align: "center" });
    
    doc.setFontSize(36);
    doc.text(`Coloring Book`, 4.25, 5, { align: "center" });
    
    doc.setFontSize(24);
    doc.setFont("helvetica", "normal");
    doc.text(`Theme: ${theme}`, 4.25, 6, { align: "center" });

    // Image Pages
    generatedImages.forEach((imgData) => {
      doc.addPage();
      // Letter size is 8.5 x 11. 
      // Aspect ratio is 3:4. 
      // Let's make it 7.5 width x 10 height, centered.
      // X = (8.5 - 7.5) / 2 = 0.5
      // Y = (11 - 10) / 2 = 0.5
      doc.addImage(imgData, 'PNG', 0.5, 0.5, 7.5, 10);
    });

    doc.save(`${childName.replace(/\s+/g, '_')}_Coloring_Book.pdf`);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Input Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Wand2 className="text-indigo-500" />
          Create a New Book
        </h2>
        
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Child's Name</label>
              <input
                type="text"
                required
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g., Emma"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Theme</label>
              <input
                type="text"
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., Space Dinosaurs"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                disabled={isGenerating}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Image Quality (Size)</label>
            <div className="flex gap-4">
              {['1K', '2K', '4K'].map((size) => (
                <label key={size} className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${imageSize === size ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold' : 'border-slate-200 hover:border-indigo-300 text-slate-600'}`}>
                  <input
                    type="radio"
                    name="imageSize"
                    value={size}
                    checked={imageSize === size}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="sr-only"
                    disabled={isGenerating}
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !childName.trim() || !theme.trim()}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate Coloring Book
              </>
            )}
          </button>
        </form>

        {/* Progress Bar */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>{progressMsg}</span>
                <span className="font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  className="bg-indigo-600 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Preview Area */}
      {generatedImages.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="text-indigo-500" />
              Preview
            </h2>
            <button
              onClick={handleDownloadPDF}
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {generatedImages.map((img, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50 relative group"
              >
                <img src={img} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-700 shadow-sm">
                  Page {idx + 1}
                </div>
              </motion.div>
            ))}
            {/* Placeholder for remaining pages if still generating */}
            {isGenerating && Array.from({ length: 5 - generatedImages.length }).map((_, idx) => (
              <div key={`placeholder-${idx}`} className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
