import React, { useState } from 'react';

/**
 * --- ICON COMPONENTS ---
 * Inlined to make this file dependency-free.
 */
const ActivityIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const LineChartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18"/>
    <path d="m19 9-5 5-4-4-3 3"/>
  </svg>
);

const CalculatorIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="16" height="20" x="4" y="2" rx="2"/>
    <line x1="8" x2="16" y1="6" y2="6"/>
    <line x1="16" x2="16" y1="14" y2="18"/>
  </svg>
);

const ChevronLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const Maximize2Icon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 3 21 3 21 9"/>
    <polyline points="9 21 3 21 3 15"/>
    <line x1="21" x2="14" y1="3" y2="10"/>
    <line x1="3" x2="10" y1="21" y2="14"/>
  </svg>
);

/**
 * --- MATHEMATICAL UTILITY ---
 * Lanczos approximation for log(Gamma(z))
 */
const logGamma = (z) => {
  const p = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < p.length; i++) {
    x += p[i] / (z + i + 1);
  }
  const t = z + p.length - 0.5;
  return Math.log(Math.sqrt(2 * Math.PI)) + (z + 0.5) * Math.log(t) - t + Math.log(x);
};

/**
 * --- MAIN COMPONENT ---
 */
const BohrMollerupViz = () => {
  const [step, setStep] = useState(0);
  const [nVal, setNVal] = useState(2); // The integer 'n'
  const [xOffset] = useState(0.5); // The 'x' in 'n+x'
  
  // State for svg dimensions/scaling
  const width = 800;
  const height = 500;
  
  // Dynamic scaling based on current nVal to keep the view focused
  const centerX = nVal;
  const centerY = logGamma(nVal);
  
  // Scale factors
  const scaleX = 100; // pixels per unit x
  const scaleY = 60;  // pixels per unit y
  
  // Coordinate transformation: Data Space -> Screen Space
  const toScreen = (x, y) => {
    const screenX = width / 2 + (x - centerX) * scaleX;
    const screenY = height / 2 - (y - centerY) * scaleY; // Invert Y
    return { x: screenX, y: screenY };
  };

  // Points of interest
  const pPrev = { x: nVal - 1, y: logGamma(nVal - 1) };
  const pCurr = { x: nVal, y: logGamma(nVal) };
  const pNext = { x: nVal + 1, y: logGamma(nVal + 1) };
  const pTarget = { x: nVal + xOffset, y: logGamma(nVal + xOffset) };

  // Slopes for the "Sandwich"
  const slopeLower = (pCurr.y - pPrev.y) / (pCurr.x - pPrev.x);
  const slopeUpper = (pNext.y - pCurr.y) / (pNext.x - pCurr.x);

  // Calculate trap bounds at x = n + xOffset
  const yLowerBound = pCurr.y + slopeLower * xOffset;
  const yUpperBound = pCurr.y + slopeUpper * xOffset;
  
  const pLowerBound = { x: pTarget.x, y: yLowerBound };
  const pUpperBound = { x: pTarget.x, y: yUpperBound };

  // Steps configuration
  const steps = [
    {
      id: "setup",
      title: "1. The Convexity Condition",
      desc: "The theorem requires log Γ(x) to be convex. This means the curve must bend upwards. Geometrically, the slope of the chord connecting any two points must be non-decreasing as we move to the right.",
      action: "Notice how the curve bends up?",
      math: "f''(x) > 0"
    },
    {
      id: "slopes",
      title: "2. The Slope Inequality",
      desc: "Compare the slopes at integer 'n'. The slope coming from the left (Blue) must be less than or equal to the slope going to the right (Red).",
      action: "Blue Slope ≤ Red Slope",
      math: "S_{n-1, n} \\le S_{n, n+1}"
    },
    {
      id: "trap",
      title: "3. The 'Sandwich' Trap",
      desc: "For any point 'n+x' (Green), the value must lie between the line extended from the left and the line extended to the right. It is physically trapped between these two slopes.",
      action: "The green dot is stuck.",
      math: "\\text{Lower} \\le \\log \\Gamma(n+x) \\le \\text{Upper}"
    },
    {
      id: "limit",
      title: "4. The Limit (Squeeze)",
      desc: "Increase 'n' to a large number. As we go further out, the relative difference between the Blue slope and Red slope vanishes. The trap closes completely.",
      action: "Drag the slider below!",
      math: "\\lim_{n \\to \\infty} (\\text{Upper} - \\text{Lower}) = 0"
    }
  ];

  // Helper to draw the main curve
  const renderCurve = () => {
    let path = "";
    // Draw from n-2 to n+2 for context
    const startX = nVal - 1.5;
    const endX = nVal + 2.5;
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const x = startX + (i / steps) * (endX - startX);
      const y = logGamma(x);
      const pt = toScreen(x, y);
      path += (i === 0 ? "M" : "L") + ` ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }
    return <path d={path} fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6,4" />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <ActivityIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Bohr-Mollerup Visualizer</h1>
            <p className="text-xs text-slate-500 font-medium">Interactive Proof for Γ(x) Uniqueness</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <span className="hidden md:inline">Thesis Chapter 3</span>
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <span className="bg-slate-100 px-3 py-1 rounded-full">Step {step + 1} / 4</span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT PANEL: CONTROLS & EXPLANATION --- */}
        <div className="lg:col-span-1 flex flex-col gap-6 order-2 lg:order-1">
          
          {/* Card: Explanation */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
            <div className="mb-6">
              <span className="text-indigo-600 font-bold tracking-wider text-xs uppercase mb-2 block">
                Current Concept
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{steps[step].title}</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                {steps[step].desc}
              </p>
              
              {/* Math Display */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-center font-mono text-slate-700 text-sm">
                 {/* Primitive math rendering for basic symbols */}
                 {steps[step].id === 'setup' && <span>f''(x) &gt; 0 <br/><span className="text-xs text-slate-400">(Convexity)</span></span>}
                 {steps[step].id === 'slopes' && <span>Slope<sub>blue</sub> &le; Slope<sub>red</sub></span>}
                 {steps[step].id === 'trap' && <span>y<sub>blue</sub> &le; y<sub>green</sub> &le; y<sub>red</sub></span>}
                 {steps[step].id === 'limit' && <span>Limit as n&rarr;&infin; : Gap = 0</span>}
              </div>
            </div>

            {/* Controls specific to step 4 */}
            {step === 3 && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6 animation-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                    <Maximize2Icon className="w-4 h-4" />
                    Increase n towards Infinity
                  </label>
                  <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-indigo-100 text-indigo-600">
                    n = {nVal.toFixed(1)}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="15" 
                  step="0.1"
                  value={nVal} 
                  onChange={(e) => setNVal(parseFloat(e.target.value))}
                  className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
                />
                <div className="flex justify-between mt-2 text-xs text-indigo-700/70">
                  <span>2</span>
                  <span>15</span>
                </div>
                <p className="text-xs text-indigo-600 mt-3 border-t border-indigo-200 pt-2">
                  Gap width: <span className="font-mono font-bold">{(yUpperBound - yLowerBound).toFixed(4)}</span>
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-auto flex gap-3 pt-6 border-t border-slate-100">
              <button 
                onClick={() => {
                  setStep(Math.max(0, step - 1));
                  if(step === 3 && nVal > 2) setNVal(2); // Reset n when going back
                }}
                disabled={step === 0}
                className="px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
              >
                <ChevronLeftIcon className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={() => setStep(Math.min(3, step + 1))}
                disabled={step === 3}
                className="flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {step === 3 ? "Proof Visualized" : "Next Step"} 
                {step !== 3 && <ChevronRightIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: VISUALIZATION --- */}
        <div className="lg:col-span-2 order-1 lg:order-2 h-[400px] lg:h-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
          
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" className="touch-none select-none">
            
            {/* Grid Background */}
            <defs>
              <pattern id="grid" width="100" height="60" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 60" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
              </pattern>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Axes Lines (approximate) */}
            <line x1="0" y1={height - 20} x2={width} y2={height - 20} stroke="#e2e8f0" strokeWidth="2" />
            <line x1={40} y1={0} x2={40} y2={height} stroke="#e2e8f0" strokeWidth="2" />

            {/* --- THE CURVE --- */}
            {renderCurve()}

            {/* --- SLOPE LINES (Step 1+) --- */}
            {step >= 1 && (
              <>
                {/* Lower Bound Slope (Blue) Extension */}
                <line 
                  x1={toScreen(pPrev.x, pPrev.y).x} 
                  y1={toScreen(pPrev.x, pPrev.y).y}
                  x2={toScreen(nVal + 2, pCurr.y + slopeLower * 2).x}
                  y2={toScreen(nVal + 2, pCurr.y + slopeLower * 2).y}
                  stroke="#3b82f6" 
                  strokeWidth="2"
                  strokeOpacity={0.6}
                />
                
                {/* Upper Bound Slope (Red) Extension */}
                <line 
                  x1={toScreen(pCurr.x, pCurr.y).x} 
                  y1={toScreen(pCurr.x, pCurr.y).y}
                  x2={toScreen(nVal + 2, pCurr.y + slopeUpper * 2).x}
                  y2={toScreen(nVal + 2, pCurr.y + slopeUpper * 2).y}
                  stroke="#ef4444" 
                  strokeWidth="2"
                  strokeOpacity={0.6}
                />
              </>
            )}

            {/* --- POINTS & LABELS --- */}
            
            {/* Point n-1 */}
            <g transform={`translate(${toScreen(pPrev.x, pPrev.y).x}, ${toScreen(pPrev.x, pPrev.y).y})`}>
              <circle r="5" fill="#94a3b8" />
              <text y="20" textAnchor="middle" className="text-xs font-mono fill-slate-500">n-1</text>
            </g>

            {/* Point n (The Pivot) */}
            <g transform={`translate(${toScreen(pCurr.x, pCurr.y).x}, ${toScreen(pCurr.x, pCurr.y).y})`}>
              <circle r="6" fill="#1e293b" stroke="white" strokeWidth="2" />
              <text y="25" textAnchor="middle" className="text-sm font-bold font-mono fill-slate-800">n</text>
            </g>

            {/* Point n+1 */}
            <g transform={`translate(${toScreen(pNext.x, pNext.y).x}, ${toScreen(pNext.x, pNext.y).y})`}>
              <circle r="5" fill="#94a3b8" />
              <text y="20" textAnchor="middle" className="text-xs font-mono fill-slate-500">n+1</text>
            </g>

            {/* --- THE TRAP (Step 2+) --- */}
            {step >= 2 && (
              <>
                {/* Vertical Line for n+x */}
                <line 
                  x1={toScreen(pTarget.x, pLowerBound.y).x} 
                  y1={toScreen(pTarget.x, pLowerBound.y).y + 40}
                  x2={toScreen(pTarget.x, pUpperBound.y).x} 
                  y2={toScreen(pTarget.x, pUpperBound.y).y - 40}
                  stroke="#22c55e"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  strokeOpacity="0.5"
                />

                {/* The Trap Zone Highlight */}
                <path 
                  d={`
                    M ${toScreen(pTarget.x, pUpperBound.y).x} ${toScreen(pTarget.x, pUpperBound.y).y}
                    L ${toScreen(pTarget.x, pLowerBound.y).x} ${toScreen(pTarget.x, pLowerBound.y).y}
                  `}
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeOpacity="0.3"
                />

                {/* Target Point (Green) */}
                <g transform={`translate(${toScreen(pTarget.x, pTarget.y).x}, ${toScreen(pTarget.x, pTarget.y).y})`}>
                  <circle r="6" fill="#22c55e" stroke="white" strokeWidth="2" />
                  <text y="-15" textAnchor="middle" className="text-xs font-bold font-mono fill-green-600">n+x</text>
                </g>
                
                {/* Trap Labels */}
                <text 
                  x={toScreen(pTarget.x, pUpperBound.y).x + 10} 
                  y={toScreen(pTarget.x, pUpperBound.y).y} 
                  className="text-xs font-mono fill-red-500 font-bold"
                >
                  Max Slope
                </text>
                <text 
                  x={toScreen(pTarget.x, pLowerBound.y).x + 10} 
                  y={toScreen(pTarget.x, pLowerBound.y).y + 10} 
                  className="text-xs font-mono fill-blue-500 font-bold"
                >
                  Min Slope
                </text>
              </>
            )}

            {/* Info Overlay on graph */}
            <text x="20" y="30" className="text-sm font-bold fill-slate-400">log Γ(x)</text>
          </svg>

          {/* Step Indicator Overlay */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
             <span className="text-xs font-medium text-slate-500">Visualization Mode</span>
          </div>

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
             <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-1">
               <LineChartIcon className="w-4 h-4" />
             </div>
             <div>
               <h4 className="font-bold text-slate-900 text-sm">Geometric Floor</h4>
               <p className="text-xs text-slate-500 mt-1">The blue line (slope from previous integer) sets the minimum possible growth rate.</p>
             </div>
          </div>
          <div className="flex items-start gap-3">
             <div className="bg-red-50 p-2 rounded-lg text-red-600 mt-1">
               <ActivityIcon className="w-4 h-4" />
             </div>
             <div>
               <h4 className="font-bold text-slate-900 text-sm">Geometric Ceiling</h4>
               <p className="text-xs text-slate-500 mt-1">The red line (slope to next integer) sets the maximum possible growth rate.</p>
             </div>
          </div>
          <div className="flex items-start gap-3">
             <div className="bg-green-50 p-2 rounded-lg text-green-600 mt-1">
               <CalculatorIcon className="w-4 h-4" />
             </div>
             <div>
               <h4 className="font-bold text-slate-900 text-sm">Unique Limit</h4>
               <p className="text-xs text-slate-500 mt-1">As n grows, these lines merge. The function is squeezed into a single, unique definition.</p>
             </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default BohrMollerupViz;
