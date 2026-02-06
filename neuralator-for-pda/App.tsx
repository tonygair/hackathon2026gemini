
import React, { useState, useEffect, useRef } from 'react';
import { WitnessStatus, AnalysisResult, QuietZone, Incident } from './types';
import { analyzeTranscript, generateManagerNotification } from './services/geminiService';

// --- COMPONENTS ---

const ChillAnimal = ({ level, size = 100, minimal = false }: { level: number; size?: number, minimal?: boolean }) => {
  // Levels & Neutral Animals (No panic colors)
  // 0-20:  Penguin (Slate-300) - Calm
  // 21-40: Turtle  (Slate-400) - Steady
  // 41-60: Owl     (Gray-400)  - Wise
  // 61-80: Koala   (Zinc-400)  - Rest
  // 81-100: Bear    (Stone-400) - Grounding

  let color = "#cbd5e1"; // slate-300
  let animal = "penguin";
  
  if (level > 80) {
    color = "#a8a29e"; // stone-400 (Warm Grey)
    animal = "bear";
  } else if (level > 60) {
    color = "#a1a1aa"; // zinc-400 (Cool Grey)
    animal = "koala";
  } else if (level > 40) {
    color = "#94a3b8"; // slate-400
    animal = "owl";
  } else if (level > 20) {
    color = "#94a3b8"; // slate-400
    animal = "turtle";
  }

  // Use a slow pulse (breathing) animation for high levels instead of shaking
  const animationClass = level > 80 ? 'animate-pulse' : 'transition-all duration-1000';

  return (
    <div 
      className={animationClass}
      style={{ width: size, height: size, color: color }}
    >
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={minimal ? "6" : "2.5"} strokeLinecap="round" strokeLinejoin="round">
        {/* Penguin (Calm) */}
        {animal === 'penguin' && (
            <>
                <path d="M50 20 C38 20 28 35 28 60 C28 85 38 90 50 90 C62 90 72 85 72 60 C72 35 62 20 50 20 Z" fill="currentColor" fillOpacity="0.1" />
                {!minimal && <path d="M50 35 C42 35 38 50 38 65 C38 80 42 85 50 85 C58 85 62 80 62 65 C62 50 58 35 50 35 Z" />}
                {!minimal && <path d="M48 30 L52 30 L50 34 Z" fill="currentColor" />}
                <circle cx="45" cy="28" r={minimal ? "4" : "1.5"} fill="currentColor" stroke="none" />
                <circle cx="55" cy="28" r={minimal ? "4" : "1.5"} fill="currentColor" stroke="none" />
            </>
        )}

        {/* Turtle (Steady) */}
        {animal === 'turtle' && (
            <>
                <path d="M25 60 C25 40 35 30 50 30 C65 30 75 40 75 60" fill="currentColor" fillOpacity="0.1" strokeWidth={minimal ? "4" : "3"} />
                <path d="M25 60 L75 60" />
                {!minimal && <path d="M50 30 L50 60" strokeWidth="1" />}
                {!minimal && <path d="M35 40 L65 40" strokeWidth="1" />}
                <path d="M75 55 Q85 50 85 60 Q85 70 75 65" fill="currentColor" fillOpacity="0.1" />
                <circle cx="80" cy="58" r={minimal ? "2" : "1"} fill="currentColor" stroke="none" />
                <path d="M30 60 L25 75" strokeWidth={minimal ? "4" : "3"} />
                <path d="M70 60 L75 75" strokeWidth={minimal ? "4" : "3"} />
            </>
        )}

        {/* Owl (Wise) */}
        {animal === 'owl' && (
            <>
                <path d="M30 35 Q20 20 35 15 Q50 25 65 15 Q80 20 70 35" fill="currentColor" fillOpacity="0.1" />
                <ellipse cx="50" cy="55" rx="22" ry="30" />
                <circle cx="40" cy="40" r={minimal ? "6" : "8"} fill="currentColor" fillOpacity="0.1" />
                <circle cx="60" cy="40" r={minimal ? "6" : "8"} fill="currentColor" fillOpacity="0.1" />
                <circle cx="40" cy="40" r={minimal ? "3" : "2"} fill="currentColor" stroke="none" />
                <circle cx="60" cy="40" r={minimal ? "3" : "2"} fill="currentColor" stroke="none" />
                {!minimal && <path d="M48 48 L50 52 L52 48" strokeWidth="2" />}
                <path d="M35 80 L65 80" strokeWidth={minimal ? "4" : "3"} strokeLinecap="round" />
            </>
        )}

        {/* Koala (Rest - Replaces Monkey) */}
        {animal === 'koala' && (
            <>
                {/* Ears */}
                <circle cx="25" cy="40" r="12" fill="currentColor" fillOpacity="0.1" />
                <circle cx="75" cy="40" r="12" fill="currentColor" fillOpacity="0.1" />
                {/* Head */}
                <circle cx="50" cy="50" r="28" fill="currentColor" fillOpacity="0.05" />
                {!minimal && <path d="M25 40 Q20 40 22 55" strokeWidth="1" opacity="0.5" />} 
                {!minimal && <path d="M75 40 Q80 40 78 55" strokeWidth="1" opacity="0.5" />}
                {/* Nose - Big oval characteristic */}
                <ellipse cx="50" cy="52" rx="9" ry="12" fill="currentColor" />
                {/* Eyes */}
                <circle cx="38" cy="42" r={minimal ? "2" : "1.5"} fill="currentColor" stroke="none" />
                <circle cx="62" cy="42" r={minimal ? "2" : "1.5"} fill="currentColor" stroke="none" />
            </>
        )}

        {/* Bear (Grounding - Replaces Porcupine) */}
        {animal === 'bear' && (
            <>
                {/* Ears */}
                <circle cx="28" cy="28" r="9" fill="currentColor" fillOpacity="0.1" />
                <circle cx="72" cy="28" r="9" fill="currentColor" fillOpacity="0.1" />
                {/* Head */}
                <circle cx="50" cy="50" r="32" fill="currentColor" fillOpacity="0.05" />
                {/* Muzzle */}
                <ellipse cx="50" cy="58" rx="14" ry="11" fill="currentColor" fillOpacity="0.1" stroke="none" />
                <ellipse cx="50" cy="58" rx="14" ry="11" strokeWidth={minimal ? "2" : "1"} />
                {/* Nose */}
                <path d="M46 54 L54 54 L50 60 Z" fill="currentColor" stroke="none" />
                {/* Eyes */}
                <circle cx="38" cy="42" r={minimal ? "2" : "1.5"} fill="currentColor" stroke="none" />
                <circle cx="62" cy="42" r={minimal ? "2" : "1.5"} fill="currentColor" stroke="none" />
                {/* Mouth - Gentle curve */}
                {!minimal && <path d="M50 60 L50 63 Q45 65 44 63 M50 63 Q55 65 56 63" strokeWidth="1" />}
            </>
        )}
      </svg>
    </div>
  );
};

const StressGraph = ({ history, current }: { history: number[], current: number }) => {
    // Generate SVG path from history
    const width = 100;
    const height = 40;
    const maxData = history.length;
    
    // Normalize data to points
    const points = history.map((val, i) => {
        const x = (i / (maxData - 1)) * width;
        const y = height - ((val / 100) * height);
        return `${x},${y}`;
    }).join(' ');

    const lastX = width;
    const lastY = height - ((current / 100) * height);
    
    // Determine color based on current stress
    const isHighStress = current > 60;
    const strokeColor = isHighStress ? "#fb923c" : "#38bdf8"; // Orange-400 : Sky-400

    return (
        <div className="w-full h-full flex flex-col justify-end">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Gradient Fill */}
                <defs>
                    <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2"/>
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0"/>
                    </linearGradient>
                </defs>
                <path 
                    d={`M0,${height} ${points} L${width},${height} Z`} 
                    fill="url(#stressGradient)" 
                    stroke="none"
                />
                <path 
                    d={`M0,${height - ((history[0]/100)*height)} ${points}`} 
                    fill="none" 
                    stroke={strokeColor} 
                    strokeWidth="2" 
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Current Dot */}
                <circle cx={lastX} cy={lastY} r="3" fill={strokeColor} />
            </svg>
        </div>
    );
};

export default function App() {
  // --- STATE ---
  const [viewMode, setViewMode] = useState<'FACE' | 'APP'>('FACE');
  const [currentTime, setCurrentTime] = useState(new Date());

  // App Logic State
  const [bpm, setBpm] = useState(72);
  const [burnout, setBurnout] = useState(15); // Start calm (Penguin)
  const [stressHistory, setStressHistory] = useState<number[]>(new Array(15).fill(15)); // Graph Data
  const [status, setStatus] = useState<WitnessStatus>(WitnessStatus.MONITORING);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [sensoryOverload, setSensoryOverload] = useState(false);
  const [witnessMode, setWitnessMode] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Watch Data / Health Feed
  const [useWatchData, setUseWatchData] = useState(false);
  const [watchBpm, setWatchBpm] = useState(75);
  const [watchHrv, setWatchHrv] = useState(55); // Heart Rate Variability (ms)
  
  // Audio Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // GPS / Travel State
  const [travelingTo, setTravelingTo] = useState<string | null>(null);
  const [distanceRemaining, setDistanceRemaining] = useState<number>(0);
  const [notificationSent, setNotificationSent] = useState<string | null>(null);
  
  // Device Detection
  const [isNative, setIsNative] = useState(false);

  // --- REFS ---
  const bpmInterval = useRef<any | null>(null);
  const burnoutInterval = useRef<any | null>(null);
  const historyInterval = useRef<any | null>(null);
  const travelInterval = useRef<any | null>(null);
  const timeInterval = useRef<any | null>(null);
  
  // Crown Logic Refs
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<any>(null);
  const witnessModeRef = useRef(witnessMode);

  // --- MOCK DATA ---
  const quietZones: QuietZone[] = [
    { name: "Blue Sensory Pod", distance: "45m", description: "Soft lighting, weighted blankets.", lat: 0, lng: 0 },
    { name: "Reading Nook", distance: "120m", description: "Zero-noise zone, noise cancelling available.", lat: 0, lng: 0 },
    { name: "Outdoor Zen Garden", distance: "280m", description: "Natural breeze, water features.", lat: 0, lng: 0 },
  ];

  const demoInputs = [
    { label: "Neutral", text: "Could we please review the timeline for the next sprint?" },
    { label: "Aggressive", text: "Do it now or you're fired! I don't care about your excuses." },
    { label: "Coercive", text: "Everyone else is staying late. You don't want to be the only one letting the team down, do you?" }
  ];

  // --- INIT DETECT ---
  useEffect(() => {
    const checkScreen = () => {
        // Pixel Watch is approx 384px-450px. We use 500px as a safe threshold.
        setIsNative(window.innerWidth < 500); 
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // --- INIT SPEECH RECOGNITION ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true; // Continuous listening for Witness Mode
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                const text = finalTranscript || interimTranscript;
                if (text) {
                    setTranscript(text);
                }
            };

            recognition.onend = () => {
                // Auto-restart if in Witness Mode
                if (witnessModeRef.current) {
                    try { recognition.start(); } catch (e) { console.error(e); }
                } else {
                    setIsListening(false);
                }
            };
            
            recognition.onerror = () => {
                 if (!witnessModeRef.current) setIsListening(false);
            };
            
            recognitionRef.current = recognition;
        }
    }
  }, []);

  // Sync Witness Mode with Mic
  useEffect(() => {
    witnessModeRef.current = witnessMode;
    if (witnessMode) {
        setIsListening(true);
        try { recognitionRef.current?.start(); } catch (e) {}
    } else {
        setIsListening(false);
        try { recognitionRef.current?.stop(); } catch (e) {}
    }
  }, [witnessMode]);


  // --- SIMULATION LOGIC ---
  useEffect(() => {
    // Clock Tick
    timeInterval.current = setInterval(() => {
        setCurrentTime(new Date());
    }, 1000);

    // History Tracking
    historyInterval.current = setInterval(() => {
        setStressHistory(prev => {
            const newHist = [...prev, burnout];
            if (newHist.length > 20) newHist.shift(); // Keep last 20 points
            return newHist;
        });
    }, 3000); // Sample every 3 seconds

    // BPM & Burnout Simulation
    if (!useWatchData) {
        // --- RANDOM MODE ---
        bpmInterval.current = setInterval(() => {
          setBpm(prev => {
             // Dynamic BPM based on current burnout + noise
             const baseBpm = 60 + (burnout * 0.8);
             // Symmetric noise: -5 to +5 (Range 11)
             const noise = Math.floor(Math.random() * 11) - 5;
             return Math.floor(Math.max(60, Math.min(180, baseBpm + noise)));
          });
        }, 4000); // 4 seconds (Slower)

        burnoutInterval.current = setInterval(() => {
          setBurnout(prev => {
            // "Random values" - Symmetric Random Walk
            // Range: -15 to +15 (Symmetric)
            const change = Math.floor(Math.random() * 31) - 15; 
            const newVal = Math.max(0, Math.min(100, prev + change));
            
            if (newVal > 85 && viewMode === 'FACE') {
                setViewMode('APP'); 
            }
            return newVal;
          });
        }, 6000); // 6 seconds (Half speed of 3s)
    } else {
        // --- PIXEL WATCH CONNECTED MODE ---
        // Force update immediately when inputs change
        setBpm(watchBpm);
        
        // Calculate Burnout from HRV (Inverse relationship)
        // High HRV (e.g. 60+) = Low Stress
        // Low HRV (e.g. < 30) = High Stress
        // Mapping: 20ms -> 90 Burnout, 80ms -> 10 Burnout
        const calculatedBurnout = Math.max(0, Math.min(100, 116 - (watchHrv * 1.33)));
        setBurnout(Math.floor(calculatedBurnout));
        
        if (calculatedBurnout > 85 && viewMode === 'FACE') {
            setViewMode('APP');
        }
    }

    return () => {
      if (bpmInterval.current) clearInterval(bpmInterval.current);
      if (burnoutInterval.current) clearInterval(burnoutInterval.current);
      if (historyInterval.current) clearInterval(historyInterval.current);
      if (timeInterval.current) clearInterval(timeInterval.current);
    };
  }, [burnout, viewMode, useWatchData, watchBpm, watchHrv]);

  // Monitor BPM for overload
  useEffect(() => {
    if (bpm > 115 && !sensoryOverload) {
      setSensoryOverload(true);
      if (viewMode === 'FACE') setViewMode('APP');
    } else if (bpm <= 100 && sensoryOverload) {
      const timer = setTimeout(() => setSensoryOverload(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [bpm, sensoryOverload, viewMode]);

  // Travel Simulation
  useEffect(() => {
    if (travelingTo && distanceRemaining > 0) {
        travelInterval.current = setInterval(() => {
            setDistanceRemaining(prev => Math.max(0, prev - 5)); 
        }, 1000);
    } else if (travelingTo && distanceRemaining <= 0) {
        clearInterval(travelInterval.current);
        handleArrival(travelingTo);
        setTravelingTo(null);
    }
    return () => clearInterval(travelInterval.current);
  }, [travelingTo, distanceRemaining]);

  const handleArrival = async (zoneName: string) => {
      const note = await generateManagerNotification(zoneName);
      setNotificationSent(note);
      setBurnout(15);
      setBpm(70);
      setTimeout(() => setNotificationSent(null), 8000);
  };

  const startTravel = (zone: QuietZone) => {
      const dist = parseInt(zone.distance.replace('m', ''));
      setDistanceRemaining(dist);
      setTravelingTo(zone.name);
  };

  // --- ACTIONS ---
  const handleCrownClick = () => {
    // Always function as Home button
    setViewMode('FACE');
    
    // Triple click detection logic
    clickCountRef.current += 1;
    
    if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
    }

    if (clickCountRef.current === 3) {
        setWitnessMode(prev => !prev);
        clickCountRef.current = 0;
    } else {
        clickTimeoutRef.current = setTimeout(() => {
            clickCountRef.current = 0;
        }, 400); // 400ms reset window
    }
  };

  const handleTranscriptSubmit = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeTranscript(transcript);
    setIsAnalyzing(false);

    // Apply the AI-determined stress adjustment directly
    const newBurnout = Math.max(0, Math.min(100, burnout + result.stressAdjustment));
    setBurnout(newBurnout);
    
    if (useWatchData) {
        const newSimulatedHrv = Math.max(10, Math.min(100, (116 - newBurnout) / 1.33));
        setWatchHrv(Math.floor(newSimulatedHrv));
    }

    if (result.isAggressive) {
      setStatus(WitnessStatus.THREAT_DETECTED);
      setIncidents(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        quote: transcript,
        reason: result.reason
      }, ...prev]);
      
      setTimeout(() => setStatus(WitnessStatus.MONITORING), 10000);
    } else {
      setStatus(WitnessStatus.MONITORING);
    }
    setTranscript('');
  };

  // --- RENDER ---
  return (
    <div className={isNative ? "w-screen h-screen bg-black overflow-hidden relative" : "watch-container relative"}>
      
      {/* --- WATCH DEVICE FRAME (Simulator or Native Wrapper) --- */}
      <div className={isNative ? "w-full h-full relative" : "relative group"}>
          
          {/* Watch Body / Screen Wrapper */}
          <div className={isNative 
              ? "w-full h-full relative overflow-hidden" // Native: Fill screen, no borders
              : `relative w-[360px] h-[360px] rounded-full bg-black border-[12px] border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-slate-800 transition-all duration-300 ${sensoryOverload ? 'ring-4 ring-orange-500/30' : ''}` // Simulator
          }>
             
             {/* Crown Button (Hardware Visual - Simulator Only) */}
             {!isNative && (
                 <div 
                    className="absolute -right-[22px] top-1/2 -translate-y-1/2 w-[14px] h-12 bg-gradient-to-r from-slate-600 to-slate-800 rounded-r-md cursor-pointer hover:brightness-110 active:scale-95 active:brightness-90 shadow-lg border-l border-black/50 transition-all z-0"
                    onClick={handleCrownClick}
                    title="Press Crown for Home (x3 for Witness Mode)"
                 ></div>
             )}

             {/* Crown Touch Zone (Invisible - Native Only) */}
             {/* A strip on the right edge to simulate crown press on physical device if hardware button isn't mapped */}
             {isNative && (
                <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-24 z-[60] bg-transparent"
                    onClick={handleCrownClick}
                />
             )}

             {/* Screen Area (Masked) */}
             <div className="w-full h-full rounded-full overflow-hidden bg-black relative z-10 flex flex-col items-center justify-center">
                 
                 {/* Witness Mode Active Overlay (Replaces Full Screen Overlay) */}
                 {witnessMode && (
                    <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-between py-6">
                        {/* Top Indicator */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 bg-red-950/90 px-2 py-0.5 rounded-full border border-red-500/40 backdrop-blur-sm shadow-lg shadow-red-900/20">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-[ping_1s_ease-in-out_infinite]"></div>
                                <span className="text-[8px] font-black text-red-400 tracking-widest">REC</span>
                            </div>
                            <div className="text-[7px] text-orange-500 font-bold animate-pulse mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                                ⚡ HIGH BATTERY
                            </div>
                        </div>

                        {/* Bottom Live Transcript */}
                        <div className="w-full px-8 text-center bg-gradient-to-t from-black via-black/80 to-transparent pb-4 pt-8">
                             <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1">Live Transcript</p>
                             <p className="text-white text-xs font-medium leading-relaxed animate-fade-in min-h-[1.5em]">
                                {transcript || "Listening..."}
                             </p>
                        </div>
                    </div>
                 )}

                 {/* === MODE: WATCH FACE === */}
                 {viewMode === 'FACE' && (
                     <div className="w-full h-full relative flex items-center justify-center animate-fade-in">
                        
                        {/* Widget: Weather (Top Center) */}
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10">
                             <button className="flex flex-col items-center justify-center w-auto px-3 h-10 rounded-xl hover:bg-slate-900/40 transition-colors group">
                                <div className="flex items-center gap-1">
                                    <span className="text-blue-400 text-sm drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]">🌧️</span>
                                    <span className="text-sm font-medium text-slate-200">2°</span>
                                </div>
                                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider whitespace-nowrap">S. Shields</span>
                             </button>
                        </div>

                        {/* Digital Time */}
                        <div className="flex flex-col items-center mb-1 z-0">
                            <span className="text-[72px] leading-none font-thin tracking-tighter text-white drop-shadow-xl">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">
                                {currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric' }).toUpperCase()}
                            </span>
                        </div>

                        {/* Widget: Steps (Bottom Left 7:30) */}
                         <div className="absolute bottom-14 left-14 z-10">
                             <button 
                                className="w-12 h-12 rounded-full bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center hover:bg-slate-800 hover:border-emerald-500/50 transition-all active:scale-95 group"
                             >
                                {/* Google Fit Style Ring (Static SVG) */}
                                <div className="absolute inset-0 rounded-full border-2 border-slate-800 border-t-emerald-500 border-r-emerald-500 rotate-45 opacity-60"></div>
                                
                                <span className="text-emerald-400 text-lg mb-0.5 group-hover:scale-110 transition-transform">👣</span>
                                <span className="text-[8px] font-bold text-slate-300">4,203</span>
                             </button>
                        </div>

                        {/* Widget: App / Chill Animal (Bottom Right 4:30) */}
                        <div className="absolute bottom-14 right-14 z-10">
                             <button 
                                onClick={() => setViewMode('APP')}
                                className="w-14 h-14 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:border-slate-600 transition-all active:scale-95 group/widget shadow-lg backdrop-blur-sm"
                             >
                                <ChillAnimal level={burnout} size={36} minimal={true} />
                                
                                {/* Notification Dot if stressed (Neutral Orange) */}
                                {burnout > 50 && (
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-orange-400/80 rounded-full border-2 border-black animate-pulse" />
                                )}
                             </button>
                        </div>
                     </div>
                 )}

                 {/* === MODE: APP === */}
                 {viewMode === 'APP' && (
                     <div className="w-full h-full pt-12 px-8 pb-10 flex flex-col items-center animate-fade-in custom-scrollbar overflow-y-auto relative">
                        
                        {/* Debug Toggle - Top Center (Safe Area) */}
                        <button 
                            onClick={() => setShowDebug(!showDebug)}
                            className="absolute top-3 left-1/2 -translate-x-1/2 text-slate-700 hover:text-sky-400 transition-colors z-50 p-2"
                            title="Toggle Debug Controls"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </button>

                        {/* Status Header - Hidden during full-screen modes */}
                        {!travelingTo && !notificationSent && (
                             <div className="flex flex-col items-center gap-1 mb-4 shrink-0 mt-0">
                                 <ChillAnimal level={burnout} size={70} minimal={true} />
                                 <span className={`text-[10px] font-bold mt-2 ${status === WitnessStatus.THREAT_DETECTED ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                                     {status === WitnessStatus.THREAT_DETECTED ? 'THREAT DETECTED' : 'MONITORING'}
                                 </span>
                                 {useWatchData && (
                                     <div className="flex items-center gap-1 mt-1 text-[8px] text-emerald-400 font-medium bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                         <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                         Pixel Watch Connected
                                     </div>
                                 )}
                             </div>
                        )}

                        {/* Main Interaction Area */}
                        {!showMap && !travelingTo && !notificationSent && (
                            <div className="w-full flex flex-col items-center">
                                
                                {/* Debug / Simulation Inputs (Toggleable) */}
                                {showDebug && (
                                    <div className="w-full flex flex-col items-center animate-fade-in border-b border-slate-800 pb-3 mb-2">
                                        
                                        {/* Pixel Watch Bridge */}
                                        <div className="w-full bg-slate-900/50 rounded-xl p-3 border border-slate-800 mb-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] text-slate-300 font-bold">Pixel Watch Bridge</span>
                                                <button 
                                                    onClick={() => setUseWatchData(!useWatchData)}
                                                    className={`w-8 h-4 rounded-full relative transition-colors ${useWatchData ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${useWatchData ? 'left-4.5' : 'left-0.5'}`}></div>
                                                </button>
                                            </div>
                                            
                                            {useWatchData && (
                                                <div className="flex flex-col gap-3 animate-fade-in">
                                                    <div>
                                                        <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                                                            <span>Heart Rate</span>
                                                            <span className="text-emerald-400 font-mono">{watchBpm} BPM</span>
                                                        </div>
                                                        <input 
                                                            type="range" min="40" max="180" 
                                                            value={watchBpm} onChange={(e) => setWatchBpm(parseInt(e.target.value))}
                                                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                                                            <span>HRV (Variability)</span>
                                                            <span className="text-sky-400 font-mono">{watchHrv} ms</span>
                                                        </div>
                                                        <input 
                                                            type="range" min="10" max="100" 
                                                            value={watchHrv} onChange={(e) => setWatchHrv(parseInt(e.target.value))}
                                                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                                        />
                                                        <div className="text-[8px] text-slate-500 mt-1 italic text-right">Lower HRV = Higher Stress</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-[9px] text-slate-500 font-bold mb-2 uppercase tracking-wider">Simulation Controls</div>
                                        
                                        {/* Input Group */}
                                        <div className="w-full flex gap-0 mb-2">
                                            <input 
                                                type="text" 
                                                placeholder="Input..."
                                                className="flex-1 min-w-0 bg-slate-900 border-y border-l border-slate-800 rounded-l-full px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
                                                value={transcript}
                                                onChange={(e) => setTranscript(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleTranscriptSubmit()}
                                                disabled={isAnalyzing}
                                            />
                                            
                                            {/* Send Button */}
                                            <button 
                                                onClick={handleTranscriptSubmit}
                                                disabled={isAnalyzing || !transcript.trim()}
                                                className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-r-full border border-sky-600 px-3 flex items-center justify-center transition-colors"
                                            >
                                                <span className="text-xs font-bold">➤</span>
                                            </button>
                                        </div>
                                        
                                        {/* Demo Chips */}
                                        <div className="flex gap-1.5 mb-2 w-full justify-center flex-wrap">
                                            {demoInputs.map((item, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => setTranscript(item.text)}
                                                    className="text-[8px] bg-slate-800/50 border border-slate-700/50 px-2 py-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all"
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="w-full flex gap-2 mb-4 px-2 h-20">
                                    {/* Stress Graph Widget (Left) */}
                                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-2 relative overflow-hidden flex flex-col">
                                        <div className="absolute top-2 left-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Trend</div>
                                        <StressGraph history={stressHistory} current={burnout} />
                                    </div>

                                    {/* Compact Chill Widget (Right) */}
                                    <button 
                                        onClick={() => setShowMap(true)} 
                                        className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center hover:bg-slate-800 hover:border-sky-500/50 transition-all active:scale-95 group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-sky-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="text-3xl filter drop-shadow-[0_0_10px_rgba(56,189,248,0.3)] group-hover:scale-110 transition-transform">❄️</div>
                                    </button>
                                </div>
                                
                                {incidents.length > 0 && (
                                    <div className="w-full text-center border-t border-slate-800 pt-2">
                                        <p className="text-[9px] text-slate-500 mb-1">Last Log:</p>
                                        <p className="text-[10px] text-slate-300 italic line-clamp-2">"{incidents[0].quote}"</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Map View */}
                        {showMap && !travelingTo && (
                            <div className="w-full flex flex-col h-full relative">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <span className="text-[10px] font-bold text-sky-400">QUIET ZONES</span>
                                    <button onClick={() => setShowMap(false)} className="text-slate-500 text-xs px-2">✕</button>
                                </div>
                                <div className="flex flex-col gap-2 overflow-y-auto pb-8">
                                    {quietZones.map((zone, i) => (
                                        <div key={i} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                                            <div className="text-left">
                                                <div className="text-[11px] font-bold text-slate-200">{zone.name}</div>
                                                <div className="text-[9px] text-slate-500">{zone.distance}</div>
                                            </div>
                                            <button onClick={() => startTravel(zone)} className="bg-sky-600 px-3 py-1.5 rounded-full text-[10px] font-bold text-white">GO</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Travel Mode */}
                        {travelingTo && (
                            <div className="flex flex-col items-center justify-center h-full pb-8">
                                <div className="animate-bounce mb-4"><ChillAnimal level={burnout} size={60} minimal={true} /></div>
                                <div className="text-sky-400 text-xs font-bold animate-pulse">Navigating...</div>
                                <div className="text-3xl font-mono text-white my-2">{distanceRemaining}m</div>
                                <div className="text-[10px] text-slate-400 mb-4">{travelingTo}</div>
                                <button onClick={() => {setTravelingTo(null); clearInterval(travelInterval.current);}} className="text-red-400 text-[10px] border border-red-900/50 px-4 py-2 rounded-full">Cancel Route</button>
                            </div>
                        )}
                        
                         {/* Notification Sent Mode */}
                        {notificationSent && (
                            <div className="flex flex-col items-center justify-center h-full pb-8 text-center px-4">
                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-3 text-green-400">✓</div>
                                <div className="text-xs text-green-400 font-bold mb-2">ARRIVED</div>
                                <div className="text-[10px] text-slate-300 italic">"{notificationSent}"</div>
                                <button onClick={() => setNotificationSent(null)} className="mt-6 text-[10px] text-slate-500">Dismiss</button>
                            </div>
                        )}

                     </div>
                 )}
             </div>

             {/* Dome Glass Effect (Simulator Only) */}
             {!isNative && <div className="absolute inset-0 rounded-full pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_60%)] z-20 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"></div>}
          </div>
          
          {/* Watch Straps (Visual only - Simulator Only) */}
          {!isNative && (
            <>
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-20 bg-slate-900 rounded-t-3xl -z-10 shadow-inner"></div>
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-20 bg-slate-900 rounded-b-3xl -z-10 shadow-inner"></div>
            </>
          )}
      </div>
      
      {/* Footer Instructions (Simulator Only) */}
      {!isNative && (
          <div className="fixed bottom-8 text-slate-600 text-xs text-center w-full pointer-events-none">
              Use <strong>Crown</strong> (right) to Home &bull; Triple Click for <strong>Witness Mode</strong>
          </div>
      )}
    </div>
  );
}
