import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight, Bot, ShieldCheck, Zap, Globe, Cpu, Plane, Ship, Train, Truck, X, Search, Factory, Briefcase, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

function RobotMascot() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 100 };
  
  const rotateX = useSpring(useTransform(mouseY, [-400, 400], [25, -25]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-400, 400], [-25, 25]), springConfig);
  
  const headRotateX = useSpring(useTransform(mouseY, [-400, 400], [15, -15]), springConfig);
  const headRotateY = useSpring(useTransform(mouseX, [-400, 400], [-15, 15]), springConfig);

  const eyeX = useSpring(useTransform(mouseX, [-400, 400], [-10, 10]), springConfig);
  const eyeY = useSpring(useTransform(mouseY, [-400, 400], [-8, 8]), springConfig);
  
  const orbitRotate = useSpring(useTransform(mouseX, [-400, 400], [-35, 35]), springConfig);

  useEffect(() => {
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
      
      {/* Cinematic Background Floor */}
      <div 
        className="absolute bottom-0 w-[300%] h-[600px] grid-background opacity-[0.1]" 
        style={{ 
          transform: "rotateX(82deg) translateY(200px)",
          maskImage: "radial-gradient(ellipse at center, black, transparent 75%)"
        }}
      />

      {/* Holographic Core Glow */}
      <div className="absolute inset-x-0 bottom-1/4 h-[300px] bg-blue-600/15 blur-[180px] rounded-full scale-150 pointer-events-none" />

      {/* THE CENTRAL CHARACTER (Cute Wireframe Robot) */}
      <Link to="/apply" className="relative z-20 flex flex-col items-center group cursor-pointer">
        {/* Ground Glow Ring */}
        <div className="absolute -bottom-16 w-64 h-24 bg-blue-500/25 blur-[60px] rounded-full scale-150 pointer-events-none" />
        <motion.div 
           animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
           transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
           className="absolute -bottom-8 w-40 h-8 border-2 border-blue-400/40 rounded-[100%] shadow-[0_0_30px_rgba(96,165,250,0.6)]" 
        />

        <motion.div
           whileHover={{ scale: 1.02 }}
           animate={{ y: [0, -20, 0] }}
           transition={{ 
             y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
             scale: { duration: 0.3 }
           }}
           className="relative w-[320px] h-[380px] will-change-transform"
        >
          {/* Main Body Parallax */}
          <motion.div style={{ rotateX, rotateY }} className="absolute inset-0 will-change-transform">
            <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />
            
            <svg viewBox="0 0 200 240" className="absolute inset-0 w-full h-full text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.6)]">
              {/* BODY */}
              <path 
                d="M75,120 L125,120 L100,185 Z" 
                fill="rgba(59,130,246,0.15)" 
                stroke="currentColor" 
                strokeWidth="1.2"
              />
              <path d="M75,120 L100,140 L125,120 M100,140 L100,185 M75,120 L100,185 M125,120 L100,185" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />

              {/* ARMS */}
              <path 
                d="M60,130 L35,175 L65,160 Z" 
                fill="rgba(59,130,246,0.1)" 
                stroke="currentColor" 
                strokeWidth="1"
              />
              <path 
                d="M140,130 L165,175 L135,160 Z" 
                fill="rgba(59,130,246,0.1)" 
                stroke="currentColor" 
                strokeWidth="1"
              />

              {/* Head Pivot */}
              <motion.g style={{ rotateX: headRotateX, rotateY: headRotateY, originX: '100px', originY: '70px' }}>
                <path 
                  d="M30,70 C30,30 170,30 170,70 C170,110 30,110 30,70" 
                  fill="rgba(59,130,246,0.08)" 
                  stroke="currentColor" 
                  strokeWidth="1"
                />
                <path d="M50,45 L100,35 L150,45 M100,35 L100,70 M30,70 L50,45 L70,70 M170,70 L150,45 L130,70" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.7" />
                <path d="M70,105 L100,100 L130,105 M100,100 L100,70" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.7" />

                {/* EYES */}
                <motion.g style={{ x: eyeX, y: eyeY }}>
                  <circle cx="70" cy="70" r="16" fill="white" className="blur-[2px] opacity-95 shadow-[0_0_25px_#fff]" />
                  <circle cx="70" cy="70" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-pulse shadow-[0_0_15px_#60a5fa]" />
                  
                  <circle cx="130" cy="70" r="16" fill="white" className="blur-[2px] opacity-95 shadow-[0_0_25px_#fff]" />
                  <circle cx="130" cy="70" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-pulse shadow-[0_0_15px_#60a5fa]" />
                </motion.g>
              </motion.g>

              <circle cx="90" cy="200" r="1.5" fill="currentColor" opacity="0.8">
                <animate attributeName="cy" values="200;230;200" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="110" cy="210" r="1" fill="currentColor" opacity="0.6">
                <animate attributeName="cy" values="210;240;210" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite" />
              </circle>
            </svg>
          </motion.div>

          <div className="absolute bottom-6 left-full ml-8 space-y-4 hidden md:block opacity-40">
             <div className="space-y-1">
                <p className="text-xs font-mono font-black text-blue-500 uppercase tracking-widest">ACTIVE_CONTROL</p>
                <p className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">GL_CORE_NODE_01</p>
             </div>
          </div>
        </motion.div>
      </Link>

      {/* ORBITAL LOGISTICS ECOSYSTEM */}
      <motion.div 
        style={{ rotate: orbitRotate }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="relative w-full h-full overflow-visible">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] border border-blue-500/10 rounded-full" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] border border-dashed border-blue-400/10 rounded-full" />

           <OrbitObject Icon={Plane} pos="top-[8%] left-[20%]" label="AIR_FREIGHT" glow="shadow-[0_0_30px_#3b82f6]" />
           <OrbitObject Icon={Ship} pos="bottom-[14%] left-[12%]" label="OCEAN_CARGO" delay={1} glow="shadow-[0_0_30px_#3b82f6]" />
           <OrbitObject Icon={Train} pos="top-[18%] right-[15%]" label="RAIL_FREIGHT" delay={2} glow="shadow-[0_0_30px_#3b82f6]" />
           <OrbitObject Icon={Truck} pos="bottom-[10%] right-[22%]" label="GROUND_LOG" delay={3} glow="shadow-[0_0_30px_#3b82f6]" />
           <OrbitObject Icon={Search} pos="top-[5%] left-[48%]" label="BUYING_AGENT" delay={0.5} glow="shadow-[0_0_40px_rgba(59,130,246,0.4)]" />
           <OrbitObject Icon={Factory} pos="bottom-[5%] left-[48%]" label="MANUFACTURING" delay={1.5} glow="shadow-[0_0_40px_rgba(6,182,212,0.3)]" />
           <OrbitObject Icon={Briefcase} pos="top-[52%] left-[-8%]" label="CUSTOMS_CERT" delay={2.5} glow="shadow-[0_0_40px_rgba(16,185,129,0.3)]" />
           <OrbitObject Icon={ShoppingCart} pos="top-[52%] right-[-8%]" label="B2B_SOURCING" delay={3.5} glow="shadow-[0_0_40px_rgba(168,85,247,0.3)]" />
        </div>
      </motion.div>

      {/* Atmospheric Particles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
         {[...Array(10)].map((_, i) => (
           <motion.div
             key={i}
             animate={{ 
               y: [-20, -100],
               opacity: [0, 1, 0]
             }}
             transition={{ 
               duration: 6 + Math.random() * 6, 
               repeat: Infinity, 
               delay: Math.random() * 5 
             }}
             className="absolute w-[1px] h-8 bg-blue-400"
             style={{ 
               left: (Math.random() * 100) + '%', 
               top: (Math.random() * 100) + '%'
             }}
           />
         ))}
      </div>
    </div>
  );
}

function OrbitObject({ Icon, pos, label, delay = 0, glow = "" }: { Icon: any, pos: string, label: string, delay?: number, glow?: string }) {
  return (
    <motion.div 
       animate={{ y: [0, -20, 0] }}
       transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
       className={cn("absolute", pos)}
    >
       <Link to="/apply" className="relative group block">
          <div className={cn(
             "w-24 h-24 glass-panel rounded-full flex items-center justify-center border-white/20 transition-all duration-500 hover:scale-125 bg-blue-500/5",
             glow,
             "group-hover:border-blue-400 group-hover:bg-blue-500/20"
          )}>
             <Icon size={32} strokeWidth={1} className="text-blue-300 group-hover:text-white transition-colors" />
             <div className="absolute inset-[-4px] border border-blue-500/0 group-hover:border-blue-400/40 rounded-full animate-spin-slow" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-5 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
             <span className="text-[10px] font-mono text-blue-300 font-bold tracking-[0.3em] whitespace-nowrap bg-black/40 px-3 py-1 rounded-full">{label}</span>
          </div>
       </Link>
    </motion.div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [isFeedVisible, setIsFeedVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div ref={containerRef} className="relative">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-12 md:pt-16 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-8 md:gap-12">
          
          <motion.div
            style={{ y: contentY, opacity }}
            className="z-10"
          >
            <span className="inline-block glass-panel px-4 py-1.5 rounded-full text-xs font-mono tracking-widest text-blue-400 mb-6 font-semibold uppercase">
              {t('home.subtitle')}
            </span>
            <h1 className="text-5xl md:text-[95px] font-display font-extrabold leading-[0.85] mb-6 tracking-tighter text-zinc-900 dark:text-white">
              {t('home.titlePart1')} <br /> 
              <span className="text-zinc-500 italic font-light">{t('home.titlePart2')}</span> <br />
              {t('home.titlePart3')} <span className="text-blue-500">{t('home.titlePart4')}</span>
            </h1>
          <p className="max-w-lg text-zinc-700 dark:text-white text-[17px] mb-[30px] font-medium leading-relaxed drop-shadow-sm">
            {t('home.desc')}
          </p>
            <div className="flex flex-wrap gap-4 md:gap-6">
              <Link to="/apply" className="bg-blue-600 hover:bg-blue-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-bold transition-all flex items-center gap-3 group shadow-[0_10px_30px_rgba(37,99,235,0.3)]">
                {t('home.applyBtn')} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/apply" className="glass-panel hover:border-blue-500/30 px-8 md:px-10 py-4 md:py-5 rounded-full font-bold transition-all border border-black/10 dark:border-white/10 hover:bg-blue-600/10">
                {t('home.certBtn')}
              </Link>
            </div>
          </motion.div>

          <div className="relative hidden lg:block h-[800px] -mt-16 xl:-mt-24">
            {/* Extended Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(circle,rgba(59,130,246,0.03)_0%,transparent_70%)] pointer-events-none" />
            
            {/* Scanning Lines - Subtler */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
              <motion.div 
                animate={{ y: [0, 800] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              />
            </div>

            {/* Faded Binary Background */}
            <div className="absolute top-[20%] right-[-10%] font-mono text-[8px] text-blue-500/5 select-none leading-tight pointer-events-none hidden xl:block">
              {Array(30).fill(0).map((_, i) => (
                <div key={i}>
                  {Math.random() > 0.5 ? '10110100101010110' : '01101011001101010'}
                </div>
              ))}
            </div>

            {/* Background Tech Circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-500/5 rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/5 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-blue-500/2 rounded-full" />
            
            <RobotMascot />
            
            {/* Context Objects - Enhanced variety and legibility */}
            <motion.div 
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[10%] right-[0%] z-30"
            >
              <Link to="/apply" className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl border border-black/5 dark:border-white/20 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all group shadow-xl">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <Plane className="w-5 h-5 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-sans tracking-tight uppercase font-bold text-zinc-700 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">{t('home.airCargo')}</span>
              </Link>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-[10%] right-[5%] z-30"
            >
              <Link to="/apply" className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl border border-white/20 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all group shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <Ship className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-sans tracking-tight uppercase font-bold text-zinc-100 group-hover:text-white transition-colors">{t('home.oceanVessel')}</span>
              </Link>
            </motion.div>

            <motion.div 
              animate={{ x: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-[15%] left-[-15%] z-30"
            >
              <Link to="/apply" className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl border border-white/20 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all group shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                <ShoppingCart className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-sans tracking-tight uppercase font-black text-zinc-100 group-hover:text-white transition-colors">{t('home.purchaseProxy')}</span>
              </Link>
            </motion.div>

            <motion.div 
              animate={{ x: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute top-[55%] left-[-18%] z-30"
            >
              <Link to="/apply" className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl border border-white/20 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all group shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <Truck className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-sans tracking-tight uppercase font-black text-zinc-100 group-hover:text-white transition-colors">{t('home.logisticsProxy')}</span>
              </Link>
            </motion.div>

            <motion.div 
              animate={{ x: [0, 12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
              className="absolute bottom-[20%] left-[-12%] z-30"
            >
              <Link to="/apply" className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl border border-white/20 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all group shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <Factory className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-sans tracking-tight uppercase font-black text-zinc-100 group-hover:text-white transition-colors">{t('home.manufacturing')}</span>
              </Link>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute top-[45%] right-[-10%] z-30"
            >
              <Link to="/apply" className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl border border-white/20 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all group shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-sans tracking-tight uppercase font-black text-zinc-100 group-hover:text-white transition-colors">{t('home.certification')}</span>
              </Link>
            </motion.div>

            {/* Repositioned Live Feed UI - Moved to bottom right near chat expectation */}
            {isFeedVisible && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                drag
                dragConstraints={{ left: -1000, right: 0, top: -500, bottom: 0 }}
                dragElastic={0.1}
                className="fixed bottom-24 right-6 w-56 glass-panel p-4 rounded-2xl border-black/10 dark:border-white/10 backdrop-blur-3xl z-[1000] hidden xl:block cursor-grab active:cursor-grabbing shadow-2xl select-none"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-mono text-blue-400 font-bold tracking-widest uppercase">Live_Feed</span>
                  </div>
                  <button 
                    onClick={() => setIsFeedVisible(false)}
                    className="p-1 hover:bg-white/10 rounded-md transition-colors text-zinc-500 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <StatusItem label="Inbound" value="842" trend="+12%" />
                  <StatusItem label="Active" value="1,249" trend="+5%" />
                  <StatusItem label="Cert" value="98%" trend="OK" />
                </div>

                <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 pointer-events-none">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Globe className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-zinc-400 dark:text-zinc-500">UPTIME</p>
                      <p className="text-[10px] font-bold text-zinc-900 dark:text-white font-mono">99.998%</p>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, delay: 1 }}
                      className="h-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Marquee symbols */}
        <div className="absolute inset-x-0 bottom-10 opacity-10 pointer-events-none">
           <div className="flex whitespace-nowrap animate-marquee gap-20">
              {[Plane, Ship, Train, Truck].map((Icon, i) => (
                <div key={i} className="flex items-center gap-12 text-6xl font-display font-black text-white italic">
                   <Icon size={48} strokeWidth={1} />
                   <div className="w-20 h-[2px] bg-white translate-y-1/2" />
                </div>
              ))}
           </div>
        </div>
      </section>
      
      {/* QUICK TRACKING SECTION */}
      <section className="py-12 px-6 border-y border-black/5 dark:border-white/5 bg-zinc-100/50 dark:bg-zinc-950/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
               <Truck size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{t('agent.tracking.title')}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('agent.tracking.desc')}</p>
            </div>
          </div>
          <Link 
            to="/tracking" 
            className="w-full md:w-auto bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/10 text-zinc-900 dark:text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all group shadow-sm dark:shadow-none"
          >
            <span>{t('agent.tracking.search')}</span>
            <Search className="w-4 h-4 group-hover:scale-125 transition-transform" />
          </Link>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="pt-24 pb-16 bg-white dark:bg-zinc-950 relative border-t border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-blue-500" />}
              title={t('home.feature1Title')}
              description={t('home.feature1Desc')}
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-blue-500" />}
              title={t('home.feature2Title')}
              description={t('home.feature2Desc')}
            />
            <FeatureCard 
              icon={<Cpu className="w-8 h-8 text-blue-500" />}
              title={t('home.feature3Title')}
              description={t('home.feature3Desc')}
            />
          </div>
        </div>
      </section>

      {/* MANUFACTURING SECTION */}
      <section className="pt-16 pb-32 bg-white dark:bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-500 text-xs font-mono font-black tracking-widest uppercase">
              {t('home.mfgInfra')}
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-black leading-tight tracking-tighter text-zinc-900 dark:text-white">
              {t('home.mfgSectionTitlePart1')} <span className="text-cyan-600 dark:text-cyan-500 italic">{t('home.mfgSectionTitlePart2')}</span> <br />
              {t('home.mfgSectionTitlePart3')}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-[17px] font-light leading-relaxed max-w-xl">
              {t('home.mfgSectionDesc')}
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <div className="text-cyan-600 dark:text-cyan-500 font-black text-2xl font-mono">01.</div>
                <div className="font-bold text-zinc-900 dark:text-white">{t('home.mfgStep1Title')}</div>
                <div className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">{t('home.mfgStep1Desc')}</div>
              </div>
              <div className="space-y-2">
                <div className="text-cyan-600 dark:text-cyan-500 font-black text-2xl font-mono">02.</div>
                <div className="font-bold text-zinc-900 dark:text-white">{t('home.mfgStep2Title')}</div>
                <div className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">{t('home.mfgStep2Desc')}</div>
              </div>
            </div>
            <Link to="/apply" className="inline-flex items-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-black px-10 py-5 rounded-full font-black text-lg hover:bg-black dark:hover:bg-zinc-200 transition-all group shadow-xl">
              {t('home.manufacturing')} {t('home.mfgCta')} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden glass-panel border-white/5 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                 {/* Abstract visual for manufacturing */}
                 <div className="relative w-64 h-64">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 border-4 border-dashed border-cyan-500/20 rounded-full"
                    />
                    <div className="absolute inset-4 border-2 border-white/10 rounded-full flex items-center justify-center">
                       <Factory size={80} className="text-cyan-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                    </div>
                 </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute top-10 left-10 glass-panel p-4 rounded-xl border-black/5 dark:border-white/10 backdrop-blur-xl">
                 <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 uppercase mb-1">OEM_CAPACITY</p>
                 <p className="text-xl font-black text-zinc-900 dark:text-white">HIGH_FLEX</p>
              </div>
              <div className="absolute bottom-10 right-10 glass-panel p-4 rounded-xl border-black/5 dark:border-white/10 backdrop-blur-xl">
                 <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 uppercase mb-1">PROTOTYPING</p>
                 <p className="text-xl font-black text-zinc-900 dark:text-white">RAPID_QC</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-32 bg-blue-600 overflow-hidden relative">
        <motion.div 
          className="absolute top-0 right-0 opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        >
          <Globe size={600} />
        </motion.div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 text-white">
            {t('home.ctaTitle')}
          </h2>
          <Link to="/contact" className="bg-white text-blue-600 px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform inline-block">
            {t('home.ctaBtn')}
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatusItem({ label, value, trend }: { label: string, value: string, trend: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono text-zinc-300 uppercase tracking-tight font-black">{label}</p>
        <span className={cn(
          "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm",
          trend.startsWith('+') ? "text-green-400 bg-green-400/10" : "text-blue-400 bg-blue-400/10"
        )}>
          {trend}
        </span>
      </div>
      <p className="text-xl font-display font-black text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode, title: string, description: string }) {
  return (
    <Link to="/services" className="block">
      <motion.div 
        whileHover={{ y: -10 }}
        className="glass-panel p-10 rounded-2xl flex flex-col gap-6 h-full hover:border-blue-500/30 transition-colors"
      >
        <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white uppercase tracking-tight">{title}</h3>
          <p className="text-zinc-600 dark:text-zinc-300 text-base leading-relaxed break-keep font-medium">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}
