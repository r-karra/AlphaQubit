
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Activity, Cpu, BarChart2, ChevronRight, ChevronLeft, Sliders, AlertCircle } from 'lucide-react';

// --- SURFACE CODE DIAGRAM ---
export const SurfaceCodeDiagram: React.FC = () => {
  // 3x3 grid of data qubits (9 total)
  // Interspersed with 4 stabilizers (checkers)
  const [errors, setErrors] = useState<number[]>([]);
  const [measurementErrors, setMeasurementErrors] = useState<number[]>([]);
  
  // Map data qubit indices (0-8) to affected stabilizers (0-3)
  // Layout:
  // D0  S0  D1
  // S1  D4  S2
  // D3  S3  D5
  // (Simplified layout for viz)
  
  // Adjacency list: DataQubit Index -> Stabilizer Indices
  const adjacency: Record<number, number[]> = {
    0: [0, 1],
    1: [0, 2],
    2: [1, 3],
    3: [2, 3],
    4: [0, 1, 2, 3], // Center affects all in this simplified tightly packed model
  };

  const toggleError = (id: number) => {
    setErrors(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const toggleMeasurementError = (id: number) => {
    setMeasurementErrors(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const resetAll = () => {
    setErrors([]);
    setMeasurementErrors([]);
  };

  // Calculate active stabilizers based on parity (even errors = off, odd errors = on)
  // PLUS measurement error simulation (XOR)
  const activeStabilizers = [0, 1, 2, 3].filter(stabId => {
    let errorCount = 0;
    Object.entries(adjacency).forEach(([dataId, stabs]) => {
        if (errors.includes(parseInt(dataId)) && stabs.includes(stabId)) {
            errorCount++;
        }
    });
    const calculatedParity = errorCount % 2 !== 0;
    const isMeasurementError = measurementErrors.includes(stabId);
    // XOR: Active if parity is odd AND no measurement error, OR parity is even AND measurement error.
    // Actually, physically: Measured = Parity XOR Error.
    return calculatedParity ? !isMeasurementError : isMeasurementError;
  });

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-stone-200 my-8">
      <div className="flex justify-between items-center w-full mb-4">
         <h3 className="font-serif text-xl text-stone-800">Interactive: Surface Code Detection</h3>
         <button onClick={resetAll} className="p-2 text-stone-500 hover:text-stone-900 transition-colors" title="Reset">
            <RotateCcw size={18} />
         </button>
      </div>
      
      <p className="text-sm text-stone-500 mb-6 text-center max-w-md">
        Click <strong>Data Qubits</strong> (circles) to inject errors. Click <strong>Stabilizers</strong> (squares) to simulate measurement errors (noise).
      </p>
      
      <div className="relative w-64 h-64 bg-[#F5F4F0] rounded-lg border border-stone-200 p-4 flex flex-wrap justify-between content-between relative select-none">
         {/* Grid Lines */}
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
            <div className="w-2/3 h-2/3 border border-stone-400"></div>
            <div className="absolute w-full h-[1px] bg-stone-400"></div>
            <div className="absolute h-full w-[1px] bg-stone-400"></div>
         </div>

         {/* Stabilizers (Z=Blue, X=Red) - positioned absolutely for control */}
         {[
             {id: 0, x: '50%', y: '20%', type: 'Z', color: 'bg-blue-500'},
             {id: 1, x: '20%', y: '50%', type: 'X', color: 'bg-red-500'},
             {id: 2, x: '80%', y: '50%', type: 'X', color: 'bg-red-500'},
             {id: 3, x: '50%', y: '80%', type: 'Z', color: 'bg-blue-500'},
         ].map(stab => {
             const isActive = activeStabilizers.includes(stab.id);
             const isMeasurementCorrupted = measurementErrors.includes(stab.id);
             return (
                <motion.button
                    key={`stab-${stab.id}`}
                    onClick={() => toggleMeasurementError(stab.id)}
                    className={`absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center text-white text-xs font-bold rounded-sm shadow-sm transition-all duration-300 z-20 
                        ${isActive ? stab.color + ' opacity-100 scale-110 ring-4 ring-offset-2 ring-stone-200' : 'bg-stone-300 opacity-60 hover:opacity-100'}
                        ${isMeasurementCorrupted ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
                    `}
                    style={{ left: stab.x, top: stab.y }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isMeasurementCorrupted ? <AlertCircle size={14} className="text-white" /> : stab.type}
                </motion.button>
             );
         })}

         {/* Data Qubits */}
         {[
             {id: 0, x: '20%', y: '20%'}, {id: 1, x: '80%', y: '20%'},
             {id: 4, x: '50%', y: '50%'}, // Center
             {id: 2, x: '20%', y: '80%'}, {id: 3, x: '80%', y: '80%'},
         ].map(q => (
             <button
                key={`data-${q.id}`}
                onClick={() => toggleError(q.id)}
                className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 z-10 
                    ${errors.includes(q.id) ? 'bg-stone-800 border-stone-900 text-nobel-gold scale-110' : 'bg-white border-stone-300 hover:border-stone-500 hover:scale-110'}
                `}
                style={{ left: q.x, top: q.y }}
             >
                {errors.includes(q.id) && <Activity size={14} />}
             </button>
         ))}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-mono text-stone-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-stone-800 border border-stone-900"></div> Data Error</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-blue-500"></div> Z-Check</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-500"></div> X-Check</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm border-2 border-yellow-400 bg-stone-300"></div> Measure Noise</div>
      </div>
      
      <div className="mt-4 h-6 text-sm font-serif italic text-stone-600">
        {errors.length === 0 && measurementErrors.length === 0 
            ? "System is stable." 
            : `Detected ${activeStabilizers.length} parity violations.`}
      </div>
    </div>
  );
};

// --- TRANSFORMER DECODER DIAGRAM ---
export const TransformerDecoderDiagram: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [attentionHeads, setAttentionHeads] = useState(4); // 1 to 8

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
        interval = setInterval(() => {
            setStep(s => (s + 1) % 4);
        }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextStep = () => setStep(s => (s + 1) % 4);
  const prevStep = () => setStep(s => (s - 1 + 4) % 4);

  const stepsInfo = [
    { title: "Syndrome Input", desc: "Noisy measurement data enters the model." },
    { title: "Attention Layer", desc: "Model attends to spatial & temporal correlations." },
    { title: "Processing", desc: "Deep layers refine the error probability map." },
    { title: "Prediction", desc: "Final output: Correcting the logical error." }
  ];

  return (
    <div className="flex flex-col items-center p-8 bg-[#F5F4F0] rounded-xl border border-stone-200 my-8">
      <h3 className="font-serif text-xl mb-4 text-stone-900">AlphaQubit Architecture</h3>
      <p className="text-sm text-stone-600 mb-6 text-center max-w-md h-10">
        {stepsInfo[step].desc}
      </p>

      <div className="relative w-full max-w-lg h-56 bg-white rounded-lg shadow-inner overflow-hidden mb-6 border border-stone-200 flex items-center justify-center gap-8 p-4">
        
        {/* Input Stage */}
        <div className="flex flex-col items-center gap-2 relative z-10">
            <motion.div 
                className={`w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 0 ? 'border-nobel-gold bg-nobel-gold/10 scale-110 shadow-lg' : 'border-stone-200 bg-stone-50'}`}
                animate={{ scale: step === 0 ? 1.1 : 1 }}
            >
                <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${Math.random() > 0.7 ? 'bg-stone-800' : 'bg-stone-300'}`}></div>)}
                </div>
            </motion.div>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${step === 0 ? 'text-nobel-gold' : 'text-stone-400'}`}>Syndrome</span>
        </div>

        {/* Arrows */}
        <motion.div animate={{ opacity: step >= 1 ? 1 : 0.2, x: step >= 1 ? 0 : -5 }}>→</motion.div>

        {/* Transformer Stage */}
        <div className="flex flex-col items-center gap-2 relative z-10">
             <motion.div 
                className={`w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-colors duration-500 relative overflow-hidden ${step === 1 || step === 2 ? 'border-stone-800 bg-stone-900 text-white shadow-xl' : 'border-stone-200 bg-stone-50'}`}
                animate={{ scale: step === 1 || step === 2 ? 1.1 : 1 }}
             >
                <Cpu size={24} className={step === 1 || step === 2 ? 'text-nobel-gold' : 'text-stone-300'} />
                
                {/* Attention Visualization */}
                {(step === 1 || step === 2) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {[...Array(attentionHeads)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-full h-[1px] bg-nobel-gold/60"
                                style={{ top: `${15 + (i * 70) / attentionHeads}%` }}
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity, 
                                    delay: i * 0.1,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                        {step === 2 && (
                            <motion.div 
                                className="absolute w-12 h-12 rounded-full border border-nobel-gold/50"
                                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                        )}
                    </div>
                )}
             </motion.div>
             <span className={`text-[10px] uppercase font-bold tracking-wider ${step === 1 || step === 2 ? 'text-stone-900' : 'text-stone-400'}`}>Transformer</span>
        </div>

        {/* Arrows */}
        <motion.div animate={{ opacity: step >= 3 ? 1 : 0.2, x: step >= 3 ? 0 : -5 }}>→</motion.div>

        {/* Output Stage */}
        <div className="flex flex-col items-center gap-2 relative z-10">
            <motion.div 
                className={`w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 3 ? 'border-green-500 bg-green-50 scale-110 shadow-lg' : 'border-stone-200 bg-stone-50'}`}
                animate={{ scale: step === 3 ? 1.1 : 1 }}
            >
                {step === 3 ? (
                    <motion.div 
                        initial={{ scale: 0, rotate: -45 }} 
                        animate={{ scale: 1, rotate: 0 }}
                    >
                        <span className="text-2xl font-serif text-green-600">X</span>
                    </motion.div>
                ) : (
                    <span className="text-2xl font-serif text-stone-300">?</span>
                )}
            </motion.div>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${step === 3 ? 'text-green-600' : 'text-stone-400'}`}>Correction</span>
        </div>

      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-6">
          {[0, 1, 2, 3].map(s => (
              <div key={s} className={`h-1 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-nobel-gold' : 'w-2 bg-stone-300'}`}></div>
          ))}
      </div>

      {/* Controls */}
      <div className="w-full flex flex-col items-center gap-4 pt-4 border-t border-stone-200/50">
          <div className="flex items-center gap-4">
               <button 
                  onClick={prevStep}
                  disabled={isPlaying}
                  className={`p-2 rounded-full hover:bg-stone-200 transition-colors ${isPlaying ? 'opacity-30 cursor-not-allowed' : 'text-stone-700'}`}
               >
                   <ChevronLeft size={20} />
               </button>

               <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-stone-900 text-nobel-gold hover:bg-stone-800 transition-all shadow-md hover:scale-105"
               >
                   {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1"/>}
               </button>

               <button 
                  onClick={nextStep}
                  disabled={isPlaying}
                  className={`p-2 rounded-full hover:bg-stone-200 transition-colors ${isPlaying ? 'opacity-30 cursor-not-allowed' : 'text-stone-700'}`}
               >
                   <ChevronRight size={20} />
               </button>
          </div>

          <div className="flex items-center gap-3 mt-2 w-full max-w-xs px-4">
              <Sliders size={14} className="text-stone-400" />
              <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                      <span>Attention Heads</span>
                      <span>{attentionHeads}</span>
                  </div>
                  <input 
                      type="range" 
                      min="1" 
                      max="8" 
                      value={attentionHeads} 
                      onChange={(e) => setAttentionHeads(parseInt(e.target.value))}
                      className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-nobel-gold"
                  />
              </div>
          </div>
      </div>
    </div>
  );
};

// --- PERFORMANCE CHART ---
export const PerformanceMetricDiagram: React.FC = () => {
    const [distance, setDistance] = useState<3 | 5 | 11>(5);
    
    // Values represent Logical Error Rate (approx %).
    // Lower is better.
    // Updated with correct Paper values:
    // Dist 3: MWPM 3.5%, Alpha 2.9%
    // Dist 5: MWPM 3.6%, Alpha 2.75%
    // Dist 11: MWPM ~0.0041%, Alpha ~0.0009% (Based on paper's hard input simulation data)
    const data = {
        3: { mwpm: 3.5, alpha: 2.9 },
        5: { mwpm: 3.6, alpha: 2.75 },
        11: { mwpm: 0.0041, alpha: 0.0009 } 
    };

    const currentData = data[distance];
    // Normalize to max value of current set to visually fill the chart, with some headroom
    const maxVal = Math.max(currentData.mwpm, currentData.alpha) * 1.25;
    
    const formatValue = (val: number) => {
        if (val < 0.01) return val.toFixed(4) + '%';
        return val.toFixed(2) + '%';
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 items-center p-8 bg-stone-900 text-stone-100 rounded-xl my-8 border border-stone-800 shadow-lg">
            <div className="flex-1 min-w-[240px]">
                <h3 className="font-serif text-xl mb-2 text-nobel-gold">Performance vs Standard</h3>
                <p className="text-stone-400 text-sm mb-4 leading-relaxed">
                    AlphaQubit consistently achieves lower logical error rates (LER) than the standard Minimum-Weight Perfect Matching (MWPM) decoder.
                </p>
                <div className="flex gap-2 mt-6">
                    {[3, 5, 11].map((d) => (
                        <button 
                            key={d}
                            onClick={() => setDistance(d as any)} 
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 border ${distance === d ? 'bg-nobel-gold text-stone-900 border-nobel-gold' : 'bg-transparent text-stone-400 border-stone-700 hover:border-stone-500 hover:text-stone-200'}`}
                        >
                            Distance {d}
                        </button>
                    ))}
                </div>
                <div className="mt-6 font-mono text-xs text-stone-500 flex items-center gap-2">
                    <BarChart2 size={14} className="text-nobel-gold" /> 
                    <span>LOGICAL ERROR RATE (LOWER IS BETTER)</span>
                </div>
            </div>
            
            <div className="relative w-64 h-72 bg-stone-800/50 rounded-xl border border-stone-700/50 p-6 flex justify-around items-end">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none opacity-10">
                   <div className="w-full h-[1px] bg-stone-400"></div>
                   <div className="w-full h-[1px] bg-stone-400"></div>
                   <div className="w-full h-[1px] bg-stone-400"></div>
                   <div className="w-full h-[1px] bg-stone-400"></div>
                </div>

                {/* MWPM Bar */}
                <div className="w-20 flex flex-col justify-end items-center h-full z-10">
                    <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                        <div className="absolute -top-5 w-full text-center text-sm font-mono text-stone-400 font-bold bg-stone-900/90 py-1 px-2 rounded backdrop-blur-sm border border-stone-700/50 shadow-sm">{formatValue(currentData.mwpm)}</div>
                        <motion.div 
                            className="w-full bg-stone-600 rounded-t-md border-t border-x border-stone-500/30"
                            initial={{ height: 0 }}
                            animate={{ height: `${(currentData.mwpm / maxVal) * 100}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        />
                    </div>
                    <div className="h-6 flex items-center text-xs font-bold text-stone-500 uppercase tracking-wider">Standard</div>
                </div>

                {/* AlphaQubit Bar */}
                <div className="w-20 flex flex-col justify-end items-center h-full z-10">
                     <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                        <div className="absolute -top-5 w-full text-center text-sm font-mono text-nobel-gold font-bold bg-stone-900/90 py-1 px-2 rounded backdrop-blur-sm border border-nobel-gold/30 shadow-sm">{formatValue(currentData.alpha)}</div>
                        <motion.div 
                            className="w-full bg-nobel-gold rounded-t-md shadow-[0_0_20px_rgba(197,160,89,0.25)] relative overflow-hidden"
                            initial={{ height: 0 }}
                            animate={{ height: Math.max(1, (currentData.alpha / maxVal) * 100) + '%' }}
                            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
                        >
                           {/* Shine effect */}
                           <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
                        </motion.div>
                    </div>
                     <div className="h-6 flex items-center text-xs font-bold text-nobel-gold uppercase tracking-wider">AlphaQubit</div>
                </div>
            </div>
        </div>
    )
}
