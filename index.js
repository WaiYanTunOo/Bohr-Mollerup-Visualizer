import React, { useState, useEffect } from 'react';
import { LineChart, ArrowRight, MousePointer2, ChevronRight, Calculator, Activity } from 'lucide-react';

const BohrMollerupViz = () => {
  const [step, setStep] = useState(0);
  const [nVal, setNVal] = useState(2);
  
  // Simulated log-gamma values for visualization (scaled for display)
  // We use a simple convex function to represent the visual intuition: f(x) = x^2 (easier to see curvature)
  // In reality, log(Gamma) is roughly x*log(x), which is also convex.
  const f = (x) => 0.5 * x * x; 
  
  // Calculate points based on current n
  const pPrev = { x: nVal - 1, y: f(nVal - 1) };
  const pCurr = { x: nVal, y: f(nVal) };
  const pNext = { x: nVal + 1, y: f(nVal + 1) };
  const pTarget = { x: nVal + 0.5, y: f(nVal + 0.5) }; // representing n+x where x=0.5

  // Slopes
  const slopeLower = (pCurr.y - pPrev.y) / (pCurr.x - pPrev.x);
  const slopeUpper = (pNext.y - pCurr.y) / (pNext.x - pCurr.x);
  
  // SVG Scaling
  const scaleX = 60;
  const scaleY = 30;
  const offsetX = 50;
  const offsetY = 350; // Inverted Y axis for SVG

  const toSvg = (x, y) => ({
    x: x * scaleX + offsetX,
    y: offsetY - y * scaleY
  });

  const ptPrev = toSvg(pPrev.x, pPrev.y);
  const ptCurr = toSvg(pCurr.x, pCurr.y);
  const ptNext = toSvg(pNext.x, pNext.y);
  const ptTarget = toSvg(pTarget.x, pTarget.y);

  // Extend lines for slope visualization
  const extendLine = (p1, slope, length) => {
    return {
      x2: p1.x + length,
      y2: p1.y + slope * length
    };
  };
  
  const lineLowerEnd = toSvg(pCurr.x + 1.5, pCurr.y + slopeLower * 1.5);
  const lineUpperEnd = toSvg(pCurr.x + 1.5, pCurr.y + slopeUpper * 1.5);

  const steps = [
    {
      title: "1. The Setup: Connecting the Dots",
      desc: "Imagine we have the factorial points (integers). We want to draw a curve connecting them. The rule is: the curve must be CONVEX (bending upward).",
      visual: "dots"
    },
    {
      title: "2. The Geometric Trap",
      desc: "Because the curve bends upward, the slope keeps increasing. Look at point 'n'. The slope coming from the left (Blue Line) must be flatter than the slope going to the right (Red Line).",
      visual: "slopes"
    },
    {
      title: "3. The 'Sandwich'",
      desc: "Our unknown point at 'n+x' (the green dot) is trapped. It MUST lie above the Blue line but below the Red line. It has nowhere else to go.",
      visual: "sandwich"
    },
    {
      title: "4. The Limit (Squeeze)",
      desc: "Now, increase 'n' to a huge number. As we go further out, the relative curvature decreases. The Blue slope and Red slope become nearly identical. The 'trap' closes tight!",
      visual: "squeeze"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
      
      {/* Header */}
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Visualizing the Bohr-Mollerup Proof
            </h1>
            <p className="opacity-80 mt-1">Why Gamma is the only solution</p>
          </div>
          <div className="text-sm bg-indigo-500/50 px-3 py-1 rounded-full">
            Step {step + 1} of 4
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          
          {/* Left Panel: Explanation */}
          <div className="p-8 flex flex-col justify-between bg-slate-50 border-r border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-indigo-900 mb-4">{steps[step].title}</h2>
              <p className="text-lg leading-relaxed text-slate-700 mb-6">
                {steps[step].desc}
              </p>

              {/* Step 4 Controls */}
              {step === 3 && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Increase 'n' to Squeeze the Bounds:
                  </label>
                  <input 
                    type="range" 
                    min="2" 
                    max="15" 
                    step="0.1"
                    value={nVal} 
                    onChange={(e) => setNVal(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
                    <span>n = {nVal}</span>
                    <span>Gap: {(slopeUpper - slopeLower).toFixed(4)}</span>
                  </div>
                  <p className="text-xs text-indigo-600 mt-2 italic">
                    Note: As n increases, the blue and red lines merge into one path.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => {
                  setStep(Math.max(0, step - 1));
                  if(step === 3) setNVal(2); 
                }}
                disabled={step === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${step === 0 ? 'bg-slate-200 text-slate-400' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              >
                Back
              </button>
              <button 
                onClick={() => setStep(Math.min(3, step + 1))}
                disabled={step === 3}
                className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${step === 3 ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                {step === 3 ? "Complete" : "Next Step"}
                {step !== 3 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Right Panel: Visualization */}
          <div className="p-4 bg-white flex items-center justify-center relative overflow-hidden h-[400px]">
             
             {/* Graph Container */}
             <svg viewBox={`0 0 600 400`} className="w-full h-full overflow-visible">
                
                {/* Grid Lines */}
                <defs>
                  <pattern id="grid" width="60" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 30" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Main Curve (Log Gamma representation) */}
                <path 
                  d={`M ${toSvg(nVal-1.5, f(nVal-1.5)).x} ${toSvg(nVal-1.5, f(nVal-1.5)).y} 
                      Q ${ptCurr.x} ${ptCurr.y + 20} ${toSvg(nVal+2, f(nVal+2)).x} ${toSvg(nVal+2, f(nVal+2)).y}`}
                  fill="none" 
                  stroke="#cbd5e1" 
                  strokeWidth="3" 
                  strokeDasharray="5,5"
                />

                {/* Points */}
                <circle cx={ptPrev.x} cy={ptPrev.y} r="6" fill="#64748b" />
                <text x={ptPrev.x} y={ptPrev.y + 20} textAnchor="middle" className="text-xs fill-slate-500">n-1</text>
                
                <circle cx={ptCurr.x} cy={ptCurr.y} r="6" fill="#1e293b" />
                <text x={ptCurr.x} y={ptCurr.y + 25} textAnchor="middle" className="text-sm font-bold fill-slate-800">n</text>

                <circle cx={ptNext.x} cy={ptNext.y} r="6" fill="#64748b" />
                <text x={ptNext.x} y={ptNext.y + 20} textAnchor="middle" className="text-xs fill-slate-500">n+1</text>

                {/* Slopes Visualization */}
                {(step >= 1) && (
                  <>
                    {/* Lower Slope Line (Blue) */}
                    <line 
                      x1={ptPrev.x} y1={ptPrev.y} 
                      x2={lineLowerEnd.x} y2={lineLowerEnd.y} 
                      stroke="#3b82f6" 
                      strokeWidth="2"
                    />
                    <text x={lineLowerEnd.x + 5} y={lineLowerEnd.y} className="text-xs fill-blue-500 font-bold">Lower Bound Slope</text>

                    {/* Upper Slope Line (Red) */}
                    <line 
                      x1={ptCurr.x} y1={ptCurr.y} 
                      x2={lineUpperEnd.x} y2={lineUpperEnd.y} 
                      stroke="#ef4444" 
                      strokeWidth="2"
                    />
                    <text x={lineUpperEnd.x + 5} y={lineUpperEnd.y - 5} className="text-xs fill-red-500 font-bold">Upper Bound Slope</text>
                  </>
                )}

                {/* The Trap (Sandwich) */}
                {(step >= 2) && (
                  <>
                    {/* Target Point */}
                    <circle cx={ptTarget.x} cy={ptTarget.y} r="6" fill="#22c55e" stroke="white" strokeWidth="2" />
                    <text x={ptTarget.x} y={ptTarget.y - 15} textAnchor="middle" className="text-xs fill-green-600 font-bold">n+x</text>
                    
                    {/* Vertical Line indicating the squeeze area */}
                    <line 
                      x1={ptTarget.x} y1={ptCurr.y + slopeLower * 0.5 * scaleY * -1 + 60} // Approx manual calc for visual
                      x2={ptTarget.x} y2={ptCurr.y + slopeUpper * 0.5 * scaleY * -1 - 60} 
                      stroke="#22c55e" 
                      strokeWidth="2" 
                      strokeOpacity="0.3"
                      strokeDasharray="2,2"
                    />
                  </>
                )}

             </svg>
             
             {/* Coordinate axis labels */}
             <div className="absolute bottom-2 left-4 text-xs text-slate-400">X axis (n) →</div>
             <div className="absolute left-2 top-4 text-xs text-slate-400 rotate-90 origin-left">log f(x) ↑</div>

          </div>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="max-w-4xl w-full mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-2">
            <LineChart className="w-4 h-4 text-blue-500" /> Convexity
          </h3>
          <p className="text-sm text-slate-600">The curve connects factorials. Because it curves up (convex), slope <span className="font-mono">n-1 → n</span> is less than slope <span className="font-mono">n → n+1</span>.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-2">
            <MousePointer2 className="w-4 h-4 text-green-500" /> The Squeeze
          </h3>
          <p className="text-sm text-slate-600">The value at <span className="font-mono">n+x</span> is trapped between the lower slope (blue) and upper slope (red).</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-purple-500" /> Infinity
          </h3>
          <p className="text-sm text-slate-600">As <span className="font-mono">n → ∞</span>, the curve flattens locally. The red and blue lines merge. The trap closes completely.</p>
        </div>
      </div>

    </div>
  );
};

export default BohrMollerupViz;
