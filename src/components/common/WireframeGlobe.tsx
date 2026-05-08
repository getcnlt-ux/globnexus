import { motion, useSpring, useTransform, useMotionValue } from 'motion/react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Ship, Globe, Truck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OrbitObjectProps {
  Icon: any;
  pos: string;
  label: string;
  delay?: number;
  glow?: string;
}

function OrbitObject({ Icon, pos, label, delay = 0, glow = "" }: OrbitObjectProps) {
  return (
    <motion.div 
       animate={{ y: [0, -20, 0] }}
       transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
       className={cn("absolute", pos)}
    >
       <Link to="/apply" className="relative group block">
          <div className={cn(
             "w-24 h-24 glass-panel rounded-full flex items-center justify-center border-white/30 transition-all duration-500 hover:scale-125 bg-blue-500/10",
             glow,
             "group-hover:border-blue-400 group-hover:bg-blue-500/30"
          )}>
             <Icon size={32} strokeWidth={1} className="text-blue-200 group-hover:text-white transition-colors" />
             <div className="absolute inset-[-4px] border border-blue-500/0 group-hover:border-blue-400/60 rounded-full animate-spin-slow" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-5 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
             <span className="text-xs font-sans text-white font-bold tracking-tight whitespace-nowrap bg-blue-600/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-lg">{label}</span>
          </div>
       </Link>
    </motion.div>
  );
}

export default function WireframeGlobe() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 100 };
  
  const rotateX = useSpring(useTransform(mouseY, [-400, 400], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-400, 400], [-10, 10]), springConfig);

  useEffect(() => {
    // Throttle mask move for smoother performance
    let frameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const { innerWidth, innerHeight } = window;
        mouseX.set(e.clientX - innerWidth / 2);
        mouseY.set(e.clientY - innerHeight / 2);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="relative flex items-center justify-center min-h-[800px] perspective-2000 overflow-visible will-change-transform">
      
      {/* Global Connection Nodes (Background) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)] blur-[40px]" />
      </div>

      {/* Connection Lines */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
        <svg viewBox="0 0 800 800" className="w-full h-full text-blue-400">
          <motion.path
            d="M200,200 L600,600 M600,200 L200,600 M400,100 L400,700"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="10 10"
            animate={{ strokeDashoffset: [0, 40] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
        </svg>
      </div>

      {/* THE CENTRAL GLOBE */}
      <div className="relative z-20 flex flex-col items-center group mt-[-50px]">
        <div className="absolute -bottom-16 w-64 h-24 bg-blue-500/20 blur-[60px] rounded-full scale-150 pointer-events-none" />
        <motion.div 
           animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
           transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
           className="absolute -bottom-8 w-40 h-8 border border-blue-400/40 rounded-[100%] shadow-[0_0_40px_rgba(96,165,250,0.5)]" 
        />

        <motion.div
           style={{ rotateX, rotateY }}
           className="relative w-[500px] h-[500px] will-change-transform"
        >
          <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <defs>
              <radialGradient id="globeGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(59,130,246,0.15)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0)" />
              </radialGradient>
            </defs>
            
            <circle cx="200" cy="200" r="160" fill="url(#globeGradient)" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            
            <motion.g
              animate={{ rotateY: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              style={{ originX: '200px', originY: '200px' }}
            >
              {[0, 45, 90, 135].map((rot) => (
                <ellipse
                  key={rot}
                  cx="200" cy="200" rx="160" ry={30 + rot * 0.5}
                  fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"
                  transform={`rotate(${rot} 200 200)`}
                />
              ))}
            </motion.g>

            {[120, 200, 280].map((y) => {
              const r = Math.sqrt(Math.pow(160, 2) - Math.pow(y - 200, 2));
              if (isNaN(r)) return null;
              return (
                <ellipse
                  key={y}
                  cx="200" cy={y} rx={r} ry={r * 0.15}
                  fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.3"
                />
              );
            })}

            {[
              { x: 120, y: 160 }, { x: 280, y: 240 }, { x: 220, y: 110 },
              { x: 140, y: 290 }
            ].map((dot, i) => (
              <motion.g key={i}>
                <circle cx={dot.x} cy={dot.y} r="2" fill="white">
                  <animate attributeName="opacity" values="1;0.4;1" dur={`${3 + i}s`} repeatCount="indefinite" />
                </circle>
              </motion.g>
            ))}

            <motion.circle
              cx="200" cy="200" r="175"
              fill="none" stroke="currentColor" strokeWidth="1"
              strokeDasharray="20 180"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
          </svg>

          <div className="absolute inset-x-0 -bottom-12 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-[0.4em] text-blue-400 uppercase">System_Active_Global</span>
            </div>
            <p className="text-[9px] font-mono text-zinc-500 tracking-[0.2em]">NETWORK_NODE_8820</p>
          </div>
        </motion.div>
      </div>

      {/* ORBITAL NETWORK ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full overflow-visible">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-blue-500/5 rounded-full" />
           
           <OrbitObject Icon={Plane} pos="top-[15%] left-[28%]" label="GLOBAL_AIR" glow="shadow-[0_0_20px_#3b82f6]" />
           <OrbitObject Icon={Ship} pos="bottom-[22%] left-[20%]" label="CARGO_SEA" delay={1} glow="shadow-[0_0_20px_#3b82f6]" />
           <OrbitObject Icon={Globe} pos="top-[25%] right-[22%]" label="NETWORK_HUB" delay={2} glow="shadow-[0_0_30px_rgba(59,130,246,0.2)]" />
           <OrbitObject Icon={Truck} pos="bottom-[15%] right-[28%]" label="SUPPLY_CHAIN" delay={3} glow="shadow-[0_0_20px_#3b82f6]" />
        </div>
      </div>

      {/* Atmospheric Particles */}
      <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
         {[...Array(8)].map((_, i) => (
           <motion.div
             key={i}
             animate={{ 
               y: [-20, -100],
               opacity: [0, 1, 0]
             }}
             transition={{ 
               duration: 8 + Math.random() * 8, 
               repeat: Infinity, 
               delay: Math.random() * 5 
             }}
             className="absolute w-[1px] h-8 bg-blue-400"
             style={{ 
               left: (Math.random() * 100) + '%', 
               top: (Math.random() * 80 + 10) + '%'
             }}
           />
         ))}
      </div>
    </div>
  );
}
