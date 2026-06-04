import React from 'react';
import { motion } from 'motion/react';
import { Globe, Shield, Target, TrendingUp, Users, Zap, Award, Factory } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import WireframeGlobe from '../../components/common/WireframeGlobe';

export default function About() {
  const { t } = useTranslation();
  return (
    <div className="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white min-h-screen relative overflow-hidden transition-colors duration-300">
      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* 1. HERO SECTION: Vision & Identity */}
      <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto relative">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 lg:col-span-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass-panel px-4 py-1.5 rounded-full mb-8"
            >
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs font-mono tracking-[0.2em] text-blue-500 font-black uppercase">
                {t('about.subtitle')}
              </span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl xl:text-9xl font-display font-extrabold leading-[0.85] mb-12 tracking-tighter text-zinc-900 dark:text-white">
              {t('about.titlePart1')} <br /> 
              <span className="text-zinc-500 italic font-light">{t('about.titlePart2')}</span> <br />
              {t('about.titlePart3')} <span className="text-blue-500 font-black">{t('about.titlePart4')}</span>
            </h1>
            
            <div className="max-w-2xl text-zinc-800 dark:text-zinc-400 text-lg md:text-xl font-medium leading-relaxed space-y-6 border-l-2 border-blue-500/20 pl-8 break-keep">
              <p>
                {t('about.intro1')}
              </p>
              <p>
                {t('about.intro2')}
              </p>
            </div>
          </motion.div>

          {/* Global Wireframe Globe Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="hidden lg:block lg:col-span-4 relative h-[600px] flex items-center justify-center transform translate-x-12"
          >
            <WireframeGlobe />
          </motion.div>
        </div>
      </section>

      {/* 2. CORE PHILOSOPHY: Insight + Control */}
      <section className="py-40 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-3xl border-y border-black/5 dark:border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.02)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <span className="text-blue-500 font-mono text-xs font-bold tracking-[0.2em] uppercase">{t('about.architectureTitle')}</span>
              <h2 className="text-4xl md:text-6xl font-display font-bold leading-[0.95] tracking-tighter whitespace-pre-line">
                {t('about.philTitle')}
              </h2>
            </div>
            
            <p className="text-zinc-400 text-lg font-light leading-relaxed">
              {t('about.philDesc')}
            </p>
            
            <div className="grid grid-cols-2 gap-10">
               <div className="space-y-5">
                  <div className="w-14 h-14 rounded-2xl glass-panel border-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                     <Target size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">{t('about.strength1Title')}</h4>
                    <p className="text-base text-zinc-800 dark:text-zinc-300 leading-relaxed font-medium">{t('about.strength1Desc')}</p>
                  </div>
               </div>
               <div className="space-y-5">
                  <div className="w-14 h-14 rounded-2xl glass-panel border-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                     <Zap size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">{t('about.strength2Title')}</h4>
                    <p className="text-[17px] text-zinc-800 dark:text-zinc-300 leading-relaxed font-medium">{t('about.strength2Desc')}</p>
                  </div>
               </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative aspect-[4/5] md:aspect-square"
          >
            <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
            <div className="relative glass-panel w-full h-full rounded-[40px] border-black/5 dark:border-white/5 flex items-center justify-center overflow-hidden">
               {/* Tech scan lines decorative */}
               <div className="absolute inset-0 opacity-20">
                 <div className="grid grid-cols-12 h-full w-full">
                   {[...Array(12)].map((_, i) => (
                     <div key={i} className="border-r border-white/5 h-full" />
                   ))}
                 </div>
                 <div className="grid grid-rows-12 h-full w-full absolute inset-0">
                   {[...Array(12)].map((_, i) => (
                     <div key={i} className="border-b border-white/5 w-full" />
                   ))}
                 </div>
               </div>
               
               <div className="scale-75 opacity-60">
                 <WireframeGlobe />
               </div>
               
               {/* Scanning bar */}
               <motion.div 
                 animate={{ top: ['0%', '100%', '0%'] }}
                 transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                 className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent z-20 shadow-[0_0_15px_#3b82f6]"
               />
               
               <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-30">
                 <div className="font-mono text-[10px] text-zinc-500 space-y-1">
                   <p>LAT: 37.5665° N</p>
                   <p>LNG: 126.9780° E</p>
                 </div>
                 <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                   <div className="w-2 h-2 rounded-full bg-blue-500/20" />
                   <div className="w-2 h-2 rounded-full bg-blue-500/20" />
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. KEY STRENGTHS: Why Global Nexis? */}
      <section className="py-40 px-6 relative">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
               <motion.span 
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="text-blue-500 font-mono text-xs font-black tracking-[0.3em] uppercase mb-6 block"
               >
                 {t('about.strengthsLabel')}
               </motion.span>
               <motion.h2 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="text-5xl md:text-7xl font-display font-bold tracking-tighter whitespace-pre-line"
               >
                 {t('about.strengthTitle')}
               </motion.h2>
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-zinc-500 font-mono text-xs uppercase tracking-widest"
            >
              {t('about.verified')}
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <StrengthCard 
               icon={<Globe className="w-8 h-8" />}
               title={t('about.card1Title')}
               desc={t('about.card1Desc')}
               index={0}
             />
             <StrengthCard 
               icon={<Factory className="w-8 h-8" />}
               title={t('about.card2Title')}
               desc={t('about.card2Desc')}
               index={1}
             />
             <StrengthCard 
               icon={<Shield className="w-8 h-8" />}
               title={t('about.card3Title')}
               desc={t('about.card3Desc')}
               index={2}
             />
             <StrengthCard 
               icon={<Award className="w-8 h-8" />}
               title={t('about.card4Title')}
               desc={t('about.card4Desc')}
               index={3}
             />
          </div>
        </div>
      </section>

      {/* 4. MISSION STATEMENT */}
      <section className="py-60 bg-white dark:bg-black relative overflow-hidden text-center px-6 transition-colors duration-300">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_60%)]" />
         
         {/* Decorative Rings */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-black/5 dark:border-white/5 rounded-full pointer-events-none" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-black/5 dark:border-white/5 rounded-full pointer-events-none" />

         <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1 }}
           className="relative z-10 max-w-4xl mx-auto"
         >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 rounded-full bg-blue-600/20 blur-xl mx-auto mb-12"
            />
            
            <h3 className="text-[35px] font-display font-bold dark:font-medium text-zinc-900 dark:text-white mb-16 leading-relaxed max-w-3xl mx-auto">
              "{t('about.mission')}"
            </h3>
            
            <div className="flex items-center justify-center gap-8 mb-16">
              <div className="h-[1px] w-12 bg-zinc-800" />
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="h-[1px] w-12 bg-zinc-800" />
            </div>

            <p className="text-sm md:text-base font-mono font-bold text-blue-500 uppercase tracking-[0.3em] opacity-80">
               {t('about.controlCenter')}
            </p>
         </motion.div>
      </section>
    </div>
  );
}

function StrengthCard({ icon, title, desc, index }: { icon: React.ReactNode, title: string, desc: string, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="glass-panel p-10 rounded-[32px] border-white/5 hover:border-blue-500/30 transition-all flex flex-col gap-8 group"
    >
      <div className="w-16 h-16 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-blue-400 transition-colors">{title}</h3>
        <p className="text-zinc-800 dark:text-zinc-200 text-base leading-relaxed font-bold">{desc}</p>
      </div>
      
      <div className="mt-auto pt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono text-zinc-600 uppercase">System_Active</span>
        <div className="w-8 h-[1px] bg-blue-500/50" />
      </div>
    </motion.div>
  );
}
