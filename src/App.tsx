import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Github, ExternalLink, Star, Code2, User, Mail, Linkedin } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Rain, Fog } from './components/Scene';
import { cn } from './lib/utils';
import heroImg from './assets/spider-noir-hero.png';
import hangingImg from './assets/spider-noir-hanging.png';

// --- Types ---
interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
}

// --- Constants ---

const NOIR_IMAGES = {
  standing: heroImg,
  hanging: hangingImg
};

// --- Components ---

const NoirCharacter = ({ scrollProgress }: { scrollProgress: any }) => {
  // Stop vertical movement after shrinking (at 0.2 scroll progress)
  const y = useTransform(scrollProgress, [0, 0.2, 1], ['0%', '20%', '20%']);
  const scale = useTransform(scrollProgress, [0, 0.2], [1.2, 0.25]);
  const x = useTransform(scrollProgress, [0, 0.2], ['0px', '0px']);
  const opacity = useTransform(scrollProgress, [0, 0.1], [1, 1]);
  const isHanging = useTransform(scrollProgress, [0, 0.1], [0, 1]);

  // Image switching logic
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    return scrollProgress.on('change', (latest: number) => {
      setIsScrolled(latest > 0.05);
    });
  }, [scrollProgress]);

  return (
    <motion.div
      style={{ y, scale, opacity, x }}
      className="fixed right-0 md:right-8 top-32 md:top-48 z-[70] pointer-events-none flex flex-col items-center"
    >
      {/* Web Thread - Extends infinitely upwards so it never cuts out when the container scales down */}
      <motion.div
        style={{ height: '3000vh', opacity: isHanging }}
        className="w-[2px] bg-white absolute bottom-[72%] left-1/2 -translate-x-1/2 origin-bottom shadow-[0_0_15px_rgba(255,255,255,0.8)]"
      />

      {/* Spider-Man Noir Silhouette */}
      <div className="relative w-[500px] h-[500px] flex items-center justify-center overflow-hidden group">
        {/* Soft white burst to highlight the black silhouette - oval shaped */}
        <div className="absolute inset-0 bg-white/30 blur-3xl rounded-[100%] scale-x-50 scale-y-75" />
        <motion.img
          key={isScrolled ? 'hanging' : 'standing'}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: [0, -2, 2, -1, 0],
          }}
          transition={{
            opacity: { duration: 0.3 },
            x: { repeat: Infinity, duration: 0.2, repeatType: "reverse", ease: "linear" }
          }}
          src={isScrolled ? NOIR_IMAGES.hanging : NOIR_IMAGES.standing}
          alt="Spider-Man Noir"
          className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          style={{ mixBlendMode: 'multiply' }}
          referrerPolicy="no-referrer"
        />
        {/* Glitch Overlay */}
        <motion.div
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ repeat: Infinity, duration: 2, times: [0, 0.1, 0.2] }}
          className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"
        />
      </div>
    </motion.div>
  );
};

const Spotlight = ({ scrollProgress }: { scrollProgress: any }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const opacity = useTransform(scrollProgress, [0, 0.2], [0, 1]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-500"
      style={{
        background: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(0,0,0,0.85) 100%)`,
        opacity: opacity as any
      }}
    />
  );
};

const ComicPanel = ({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={cn("relative bg-noir-black comic-border p-6 mb-12 overflow-hidden group", className)}
  >
    <div className="absolute inset-0 halftone opacity-5 pointer-events-none" />
    {title && (
      <div className="absolute top-0 left-0 bg-white text-black px-4 py-1 font-mono text-sm uppercase font-bold z-10">
        {title}
      </div>
    )}
    {children}
  </motion.div>
);

const Thunder = () => {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const triggerFlash = () => {
      if (Math.random() > 0.7) {
        setFlash(true);
        setTimeout(() => setFlash(false), 100 + Math.random() * 200);
      }
      setTimeout(triggerFlash, 3000 + Math.random() * 7000);
    };
    const timer = setTimeout(triggerFlash, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      animate={{ opacity: flash ? 0.3 : 0 }}
      className="fixed inset-0 bg-white pointer-events-none z-[60]"
    />
  );
};

export default function App() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [showAll, setShowAll] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    fetch('https://api.github.com/users/PancakesPekka/repos?sort=updated&per_page=100')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRepos(data);
      })
      .catch(err => console.error('Error fetching repos:', err));
  }, []);

  const displayedRepos = showAll ? repos : repos.slice(0, 6);

  return (
    <div className="relative min-h-screen selection:bg-noir-red selection:text-white">
      <div className="grain" />

      {/* Global Noir Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* 3D Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#fff" />
          <Rain />
          <Fog />
        </Canvas>
      </div>

      <NoirCharacter scrollProgress={scrollYProgress} />
      <Spotlight scrollProgress={scrollYProgress} />
      <Thunder />

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-48">

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col justify-center mb-32 relative">
          {/* Manga City Background */}
          <div className="absolute inset-0 -z-10 opacity-20 grayscale contrast-150 brightness-50">
            <img
              src="https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2000&auto=format&fit=crop"
              alt="Noir City"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 halftone opacity-20" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-2xl"
          >
            <h1 className="text-8xl md:text-9xl font-black leading-none mb-8 text-shadow-noir">
              HARI<span className="text-noir-red">.</span>
            </h1>
            <div className="space-y-4 font-mono text-lg md:text-xl border-l-4 border-white pl-6">
              <p className="italic opacity-80">"I am Hari."</p>
              <p className="italic opacity-80">"I build strange things."</p>
              <p className="italic opacity-80">"Code, systems, ideas."</p>
              <p className="italic opacity-80">"Every project leaves a trail."</p>
            </div>
          </motion.div>

          {/* Character Box in Hero Section */}
          <div className="absolute mt-32 right-0 md:right-16 w-80 h-[450px] hidden md:flex items-center justify-center overflow-visible pointer-events-none">
            <div className="text-[10px] font-mono absolute top-24 left-2 text-white/50 px-1 font-bold z-20 mix-blend-difference">TARGET_LOCKED</div>
            <div className="text-[8px] font-mono absolute bottom-24 right-2 opacity-50 z-20 text-white/50 mix-blend-difference">NOIR_ENTITY_001</div>

            {/* Cinematic Spotlight Backdrop (Oval) */}
            <div
              className="absolute inset-0 bg-white/10 blur-3xl rounded-[100%] scale-x-[0.8] scale-y-[1.1]"
            />

            {/* Static Profile Image */}
            <img
              src={NOIR_IMAGES.standing}
              alt="Profile"
              className="w-full h-full object-contain filter grayscale(100%) contrast(150%) opacity-90 relative z-10 scale-125"
              style={{
                maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
                mixBlendMode: 'multiply'
              }}
              referrerPolicy="no-referrer"
            />

            {/* Scanning Line Effect */}
            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[1px] bg-white/30 z-10 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              style={{ clipPath: 'ellipse(30% 50% at 50% 50%)' }}
            />
          </div>

          {/* Rooftop Silhouette Placeholder (3D scene handles most of it) */}
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-noir-black to-transparent pointer-events-none" />
        </section>

        {/* About Section - Dossier Style */}
        <section id="about" className="mb-48">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ComicPanel title="CASE FILE: #001" className="md:rotate-[-1deg]">
              <div className="flex items-start gap-4 mb-6">
                <User className="w-8 h-8 text-noir-red" />
                <h2 className="text-4xl">SUBJECT PROFILE</h2>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <p><span className="text-noir-red">SPECIALIZATION:</span> ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING</p>
                <p><span className="text-noir-red">STATUS:</span> CONSTANTLY EXPLORING NEW SYSTEMS</p>
                <div className="h-px bg-white/20 my-4" />
                <p className="leading-relaxed">
                  I am a developer focused on building intelligent systems and exploring the frontiers of machine learning.
                  My work involves creating efficient pipelines, automating complex workflows, and developing software that
                  solves real-world problems through creative technical solutions.
                </p>
              </div>
            </ComicPanel>

            <ComicPanel title="EVIDENCE: SKILLS" className="md:rotate-[1deg] bg-zinc-900">
              <div className="flex items-start gap-4 mb-6">
                <Code2 className="w-8 h-8 text-noir-red" />
                <h2 className="text-4xl">ARSENAL</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                {['RESEARCH AND DEVELOPMENT', 'NODE', 'TAILWIND', 'REACT', 'PYTHON', 'AUTOMATION PIPELINE', 'CREATIVE THINKER'].map(skill => (
                  <div key={skill} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-noir-red" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 border border-dashed border-white/30 text-[10px] opacity-50 italic">
                * CLASSIFIED: ADDITIONAL CAPABILITIES UNDER DEVELOPMENT
              </div>
            </ComicPanel>
          </div>
        </section>

        {/* Projects Section - Comic Grid */}
        <section id="work" className="mb-48 relative">
          <div className="flex items-baseline gap-4 mb-12">
            <h2 className="text-6xl font-black relative z-50">THE TRAIL</h2>
            <span className="font-mono text-sm opacity-50">/ GITHUB_REPOS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedRepos.map((repo, i) => (
              <motion.a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10, rotate: i % 2 === 0 ? 1 : -1 }}
                viewport={{ once: true }}
                className="group relative bg-zinc-900 comic-border p-6 flex flex-col h-full"
              >
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity group-hover:text-red-500">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-red-500 transition-colors truncate">
                  {repo.name.replace(/-/g, ' ')}
                </h3>
                <p className="text-sm opacity-60 font-mono mb-6 line-clamp-3 flex-grow">
                  {repo.description || "No description provided. The code speaks for itself."}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10 font-mono text-[10px]">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-noir-red" />
                    <span>{repo.language || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {repos.length > 6 && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="bg-white text-black px-8 py-3 font-mono font-bold uppercase hover:bg-noir-red hover:text-white transition-colors comic-border"
              >
                {showAll ? 'SHOW LESS' : 'SHOW ALL WORK'}
              </button>
            </div>
          )}
        </section>

        {/* Handles / Contact Section */}
        <section id="contact" className="mb-24">
          <ComicPanel title="INTERROGATION ROOM" className="max-w-3xl mx-auto">
            <div className="text-center space-y-8">
              <h2 className="text-5xl font-black">GET IN TOUCH</h2>
              <p className="font-mono opacity-70">"If you've got a lead, don't hesitate. The clock is ticking."</p>

              <div className="flex flex-wrap justify-center gap-8 pt-8">
                {[
                  { icon: Mail, label: 'EMAIL', href: 'mailto:hari20070306@gmail.com' },
                  { icon: Github, label: 'GITHUB', href: 'https://github.com/PancakesPekka' },
                  { icon: Linkedin, label: 'LINKEDIN', href: 'https://www.linkedin.com/in/hari-s-' },
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, color: '#8b0000' }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <social.icon className="w-8 h-8" />
                    <span className="font-mono text-xs font-bold">{social.label}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </ComicPanel>
        </section>

        {/* Footer */}
        <footer className="text-center font-mono text-[10px] opacity-30 mt-24">
          <p>© 2026 HARI // NOIR_PORTFOLIO_V1 // BUILT_IN_THE_SHADOWS</p>
        </footer>
      </main>

      {/* Cinematic Overlays */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-noir-black via-transparent to-noir-black opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>
    </div>
  );
}
