/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import { Play, ArrowRight, Menu, X, Instagram, Youtube, Music2, Twitter, Facebook, ChevronLeft, ChevronRight, MapPin, Phone, Mail } from 'lucide-react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';

function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if device has a fine pointer (mouse)
    const isTouchDevice = !window.matchMedia('(pointer: fine)').matches;
    if (isTouchDevice) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a') || target.classList.contains('cursor-pointer')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] glass flex items-center justify-center mix-blend-difference"
      animate={{
        x: mousePos.x - 16,
        y: mousePos.y - 16,
        scale: isHovering ? 2.5 : 1,
        backgroundColor: isHovering ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 250, mass: 0.5 }}
    >
      <div className="w-1 h-1 bg-white rounded-full" />
    </motion.div>
  );
}

const PROJECTS = [
  {
    id: 1,
    title: "Lacrimosa - Walo",
    description: "Leonardo, shattered by a violent family reality and his own inner emptiness, hits rock bottom during a night of excess and delusions in Rome. Through a painful confrontation with himself and the power of music, he manages to fight back, driving out his mother's aggressor and transforming his pain into art. The conflict resolves in a liberating embrace, marking his spiritual rebirth and the birth of his new identity as Walo.",
    image: "https://i.postimg.cc/k5z1HtF7/WALO-28.jpg",
    premiere: "16 MARCH 2026",
    director: "OLLY",
    music: "TISCOLLYPRODUCTIONS\nSTRINGE\nARDENTEMENTE (PHOTOS)",
    genre: "VIDEOCLIP AND EMOTIONAL",
    actors: [],
    category: "FILM",
    videoUrl: "https://www.youtube.com/watch?v=0zO5BSrg864"
  },
  {
    id: 2,
    title: "L'euphorie d'une rose",
    description: "A creative collaboration exploring the delicate essence of beauty and emotion through visual storytelling.",
    image: "https://i.postimg.cc/CMN5HC4M/Screenshot-2026-03-09-alle-18-37-45.png",
    premiere: "20 DECEMBER 2025",
    director: "OLLY",
    music: "IED\nBALLOON MUSEUM\nTISCOLLYPRODUCTIONS\nSTRINGE",
    genre: "ADS AND EMOTIONAL",
    actors: ["IED STUDENTS"],
    category: "FILM",
    videoUrl: "https://www.youtube.com/watch?v=0zO5BSrg864"
  },
  {
    id: 3,
    title: "BEAUTY IN ACTION\nCREATED BY IMMAGINERIA",
    description: "A hymn to beauty and its transformative power. Beauty in Action will be the core concept of the Milano Cortina 2026 Olympic Closing Ceremony. A tribute to beauty in motion, in all its forms—in sport, in life, in human relationships, and in places. For the first time in the history of the Games, the Closing Ceremony will take place inside a UNESCO World Heritage monument.",
    image: "https://i.postimg.cc/v8ggMx7Y/Screenshot-2026-03-09-alle-18-53-35.png",
    premiere: "6 NOVEMBER 2025",
    director: "FILMMASTER",
    music: "IMMAGINERIA\nFILMMASTER",
    genre: "TEASER AND OLYMPICS",
    actors: [],
    category: "EDITING AND MOTION",
    videoUrl: "https://www.youtube.com/watch?v=SyWfqhYoX70"
  },
  {
    id: 4,
    title: "Il più silenzioso - Spec Ad Folletto",
    description: "When the unexpected strikes, Folletto solves. Silent, precise, invisible.\nA silent gesture, almost invisible.\nA moment of chaos, resolved with elegance.\nThe power of Folletto technology, which transforms an unexpected event into an impeccable solution.\nDiscretion, efficiency, simplicity.",
    image: "https://i.postimg.cc/gjmtdFvX/Timeline-2-01-01-24-21.jpg",
    premiere: "MAY 5, 2025",
    director: "OLLY",
    music: "TISCOLLYPRODUCTIONS\nSTRINGE\nIED",
    genre: "ADS E COMICS",
    actors: [],
    category: "FILM",
    videoUrl: "https://www.youtube.com/watch?v=0QFIwoPNTJ0"
  },
  {
    id: 5,
    title: "DEBONART & GRAND HOTEL TELESE",
    description: "From the vibrant, disruptive energy of Debonadart to the storied, sophisticated elegance of Grand Hotel Telese. Two iconic brands, two completely different souls, both brought to life through tailor-made design and a passion for storytelling.",
    image: "https://i.postimg.cc/CKdW6q0L/Screenshot-2026-03-11-alle-18-49-13.png",
    premiere: "15 JULY 2023",
    director: "OLLY",
    music: "TISCOLLYPRODUCTIONS",
    genre: "HOTELS SOCIAL POSTS",
    actors: [],
    category: "GRAPHICS",
    videoUrl: "https://www.behance.net/gallery/227109919/Debonart-Grand-Hotel-Telese-Graphic-Design-SMM"
  },
  {
    id: 6,
    title: "SS 25 Alessandro Enriquez",
    description: "A feast for the eyes. 🍋✨ We’ve captured the soul of Alessandro Enriquez’s Summer 2025 collection—a vibrant celebration of love, colors, and Mediterranean sun. From bold graphic prints to that signature pop elegance, this shooting is a visual love letter to the Italian summer. Get ready to wear the joy.",
    image: "https://i.postimg.cc/fW00Q2Cf/P1200737.jpg",
    premiere: "28 OCTOBER 2025",
    director: "OLLY",
    music: "GRAVINA IN DANZA\nALESSANDRO ENRIQUEZ",
    genre: "FASHION SHOOTING",
    actors: [],
    category: "PHOTO",
    videoUrl: "https://www.behance.net/gallery/237539953/SS25-Alessandro-Enriquez-x-Gravina-in-Danza"
  },
  {
    id: 14,
    title: "THE CLOCK",
    description: "In a city that never stops, one lonely doorman sees what everyone else misses. Agatha, Teodoro, and Antonio aren't just residents—they are living heartbeats. Through their unique watches that pulse with emotion and personality, our silent observer discovers that time isn't just measured in minutes, but in feelings. A story about the invisible gears that connect us all.",
    image: "https://i.postimg.cc/25FBMV7t/Screenshot-2026-03-11-alle-18-54-13.png",
    premiere: "28 FEBRUARY 2024",
    director: "OLLY",
    music: "IED\nTISCOLLYPRODUCTIONS",
    genre: "MOTION AND PSYCHOLOGICAL",
    actors: [],
    category: "FILM",
    videoUrl: "https://www.youtube.com/watch?v=o2TfunLwsxE"
  },
  {
    id: 7,
    title: "QUATTRO INVERNI - ARIETE\nFAN VIDEOCLIP",
    description: "\"Quattro Inverni\" by Ariete is about a broken relationship and struggle to communicate. Winter is used as a metaphor for loneliness and emotional pain. Ariete expresses waiting, feeling misunderstood, and emotional distance, all wrapped in a melancholic sound.",
    image: "https://i.postimg.cc/T117hjHH/Screenshot-2026-03-11-alle-16-47-37.png",
    premiere: "MAY 13, 2024",
    director: "OLLY",
    music: "IED\nTISCOLLYPRODUCTIONS",
    genre: "VIDEOCLIP, EMOTIONAL",
    actors: [],
    category: "FILM",
    videoUrl: "https://www.youtube.com/watch?v=cQkpyEyWFn4"
  },
  {
    id: 8,
    title: "FUIL : THE ARTISAN",
    description: "From the historic alleys of Naples’ Borgo Orefici to the global stage. Follow a master craftsman as he defies the era of mass production, blending centuries-old traditions with cutting-edge design. By mastering the art of TikTok, he’s not just making jewelry—he’s sparking a global revolution, one viral masterpiece at a time.",
    image: "https://i.postimg.cc/LsMmfhSQ/Screenshot-2026-03-11-alle-16-55-06.png",
    premiere: "15 JULY 2023",
    director: "OLLY",
    music: "IED\nTISCOLLYPRODUCTIONS",
    genre: "DOCUMENTARY AND NEAPOLITAN LIFE",
    actors: [],
    category: "FILM",
    videoUrl: "https://www.youtube.com/watch?v=8x6y4tBF2Vo"
  },
  {
    id: 9,
    title: "IL TRIONFO NON HA SENSI",
    description: "Alessandro Coppola is a model on a mission. Born deaf and diagnosed at 16 with Usher Syndrome—a rare condition leading to blindness—Alessandro is in a race against time. But instead of slowing down, he’s stepping into the spotlight. From high-fashion shoots to inspiring the next generation in schools, this is the story of a dream that refuses to fade into the dark.",
    image: "https://i.postimg.cc/BZ8Zdrmc/Screenshot-2026-03-11-alle-17-00-43.png",
    premiere: "15 APRIL 2023",
    director: "OLLY",
    music: "IED\nTISCOLLYPRODUCTIONS\nSTRINGE",
    genre: "MOCKUMENTARY AND EMOTIONAL",
    actors: [],
    category: "FILM",
    videoUrl: "https://www.youtube.com/watch?v=jf5v1t1B3U0"
  },
  {
    id: 10,
    title: "BONDS BY IQOS & BLENDS\nCREATED BY IMMAGINERIA",
    description: "Immagineria takes the stage for the launch of Bonds by IQOS & Blends. We’ve transformed innovation into immersive motion design, capturing the sleek essence of the new device and the vibrant soul of its blends. Where technology meets pure visual energy.",
    image: "https://i.postimg.cc/NMCM1Yp0/Screenshot-2026-03-11-alle-17-09-21.png",
    premiere: "26 DECEMBER 2025",
    director: "FILMMASTER",
    music: "IMMAGINERIA\nFILMMASTER",
    genre: "MOTION EVENT AND PRESENTATION",
    actors: [],
    category: "EDITING AND MOTION",
    videoUrl: "https://www.behance.net/tiscollyproductions"
  },
  {
    id: 11,
    title: "FAN - TUTTI PAZZI PER CINEMA E SERIE",
    description: "What does it really mean to be a fan? \"FAN. Tutti pazzi per cinema e serie\" dives deep into the heart of movie and TV show obsessions. A docu-series that goes beyond the screen to capture the passion, the community, and the stories of those who live for their favorite characters. Produced in collaboration with IED Roma and Ottoemezzo Movie Factory.",
    image: "https://i.postimg.cc/s29KfHKP/Screenshot-2026-03-11-alle-17-18-42.png",
    premiere: "29 SEPTEMBER 2025",
    director: "CLAUDIO PORTUESI",
    music: "IED\nOTTOEMEZZO MOVIE FACTORY",
    genre: "DOCUMENTARY AND COMICS",
    actors: [],
    category: "EDITING AND MOTION",
    videoUrl: "https://www.behance.net/gallery/236126557/FAN-TUTTI-PAZZI-PER-CINEMA-E-SERIE"
  },
  {
    id: 12,
    title: "FUTUROROMA - BLUE JEANS",
    description: "More than just a garment, a symbol of identity. \"Blue Jeans\" explores the evolution of denim—from workwear to a metaphor for freedom and resistance. Watch as dancers deconstruct tradition in an immersive space where every move generates live visuals and sound. A multisensory journey into the heart of social transformation.",
    image: "https://i.postimg.cc/bdc2tpwg/futuro-roma-festival-danza-cultura-arte-contemporanea-matrice-n-programmma-wom-international-dance-t.jpg",
    premiere: "8 MAY 2025",
    director: "ALESSIA GATTA",
    music: "IED\nFUTUROROMA",
    genre: "EVENT AND DANCE",
    actors: [],
    category: "EDITING AND MOTION",
    videoUrl: "https://www.behance.net/gallery/227168497/GraphicsMotionVj-set-Blue-jeans-(Futuroroma)"
  },
  {
    id: 13,
    title: "WAKE UP NOW",
    description: "Wake Up Now isn't just a name—it's a call to action. An invitation to wake up, connect, and transform your life. It's a space where people find inspiration, support, and fresh perspectives through motivational events and moments of personal growth.",
    image: "https://i.postimg.cc/85GpMcRL/fdbc11226932243-683706815381b.webp",
    premiere: "15 APRIL 2025",
    director: "OLLY",
    music: "TISCOLLYPRODUCTIONS",
    genre: "MOTIVATIONAL EVENTS",
    actors: [],
    category: "GRAPHICS",
    videoUrl: "https://www.behance.net/gallery/226932243/Rebrand-Guide-Wakeupnow"
  }
];

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function CookieConsent({ isInitialLoading }: { isInitialLoading: boolean }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent-v2');
    if (!consent && !isInitialLoading) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoading]);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent-v2', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent-v2', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] md:w-[450px] z-[100]"
        >
          <div className="glass backdrop-blur-3xl p-8 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden group">
            {/* Animated background glow */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Privacy Preference</span>
              </div>
              
              <h4 className="text-xl font-display font-bold text-white uppercase tracking-tighter mb-4">
                Cookies & <span className="italic font-light">Experience</span>
              </h4>
              
              <p className="text-white/40 text-xs leading-relaxed mb-8">
                We use cookies to enhance your cinematic journey. By clicking "Accept", you agree to our use of cookies for analytics and personalized content.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={handleAccept}
                  className="flex-1 px-6 py-3 bg-white text-dark rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg shadow-white/5"
                >
                  Accept
                </button>
                <button
                  onClick={handleDecline}
                  className="px-6 py-3 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-all"
                >
                  Decline
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <Link to="/cookies" className="text-[9px] uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors">
                  Read our full policy
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InitialLoader() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-dark flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 1.5, 
          ease: [0.22, 1, 0.36, 1],
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="relative"
      >
        <img 
          src="https://i.postimg.cc/438q5pxc/logo-trasparent-white.png" 
          alt="Tiscolly Productions" 
          className="h-20 md:h-32 w-auto object-contain"
          referrerPolicy="no-referrer"
        />
        <motion.div 
          className="absolute inset-0 bg-white/10 blur-2xl -z-10 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="h-px bg-gradient-to-r from-transparent via-white to-transparent mt-12"
      />
    </motion.div>
  );
}

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
      setIsMenuOpen(false);
    }
  };

  // Initial loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Update active section on scroll (only on home page)
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const handleScroll = () => {
      const sections = ['home', 'portfolio-preview', 'about'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-dark text-white selection:bg-white selection:text-dark">
      <CustomCursor />
      <CookieConsent isInitialLoading={isInitialLoading} />
      
      <AnimatePresence>
        {isInitialLoading && <InitialLoader />}
      </AnimatePresence>
      
      {/* Navigation */}
      <AnimatePresence>
        {!isInitialLoading && (
          <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 bg-dark/50 backdrop-blur-md"
          >
            <motion.div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => scrollToSection('home')}
              whileHover={{ scale: 1.1, rotate: [-1, 1, -1] }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="https://i.postimg.cc/438q5pxc/logo-trasparent-white.png" 
                alt="Tiscolly Productions" 
                className="h-8 md:h-10 w-auto object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Center Nav - Glass Pills */}
            <div className="hidden lg:flex items-center gap-1 p-1 glass rounded-full relative">
              <button 
                onClick={() => scrollToSection('home')}
                className={`relative px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all z-10 ${activeSection === 'home' ? 'text-dark' : 'text-white/40 hover:text-white'}`}
              >
                {activeSection === 'home' && (
                  <motion.div 
                    layoutId="navPill"
                    className="absolute inset-0 bg-white rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                Home
              </button>
              
              <Link 
                to="/portfolio"
                className={`relative px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all z-10 ${location.pathname === '/portfolio' ? 'text-dark' : 'text-white/40 hover:text-white'}`}
              >
                {location.pathname === '/portfolio' && (
                  <motion.div 
                    layoutId="navPill"
                    className="absolute inset-0 bg-white rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                Portfolio
              </Link>

              <Link 
                to="/about"
                className={`relative px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all z-10 ${location.pathname === '/about' ? 'text-dark' : 'text-white/40 hover:text-white'}`}
              >
                {location.pathname === '/about' && (
                  <motion.div 
                    layoutId="navPill"
                    className="absolute inset-0 bg-white rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                About
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                to="/contact"
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${location.pathname === '/contact' ? 'bg-white text-dark' : 'bg-white text-dark hover:bg-opacity-90'}`}
              >
                Contacts
              </Link>
              <button 
                className="lg:hidden p-2 glass rounded-full"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 glass backdrop-blur-lg md:backdrop-blur-3xl flex flex-col items-center justify-center gap-8 lg:hidden"
          >
            <div className="mb-8">
              <img 
                src="https://i.postimg.cc/438q5pxc/logo-trasparent-white.png" 
                alt="Tiscolly Productions" 
                className="h-12 w-auto object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <button onClick={() => scrollToSection('home')} className="text-4xl font-display font-bold uppercase tracking-tighter">Home</button>
            <Link to="/portfolio" onClick={() => setIsMenuOpen(false)} className="text-4xl font-display font-bold uppercase tracking-tighter">Portfolio</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-4xl font-display font-bold uppercase tracking-tighter">About</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-4xl font-display font-bold uppercase tracking-tighter">Contacts</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Routes with Page Transitions */}
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={
              <PageWrapper>
                <Home isInitialLoading={isInitialLoading} scrollToSection={scrollToSection} />
              </PageWrapper>
            } />
            <Route path="/portfolio" element={
              <PageWrapper>
                <PortfolioPage />
              </PageWrapper>
            } />
            <Route path="/about" element={
              <PageWrapper>
                <AboutPage />
              </PageWrapper>
            } />
            <Route path="/contact" element={
              <PageWrapper>
                <ContactPage />
              </PageWrapper>
            } />
            <Route path="/cookies" element={
              <PageWrapper>
                <CookiesPage />
              </PageWrapper>
            } />
            <Route path="/terms" element={
              <PageWrapper>
                <TermsPage />
              </PageWrapper>
            } />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-20 md:px-12 border-t border-white/10 bg-dark overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center"
              >
                <img 
                  src="https://i.postimg.cc/438q5pxc/logo-trasparent-white.png" 
                  alt="Tiscolly Productions" 
                  className="h-10 md:h-12 w-auto object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                Elevating stories through cinematic motion and visionary design. Based in the heart of Italy, working worldwide.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/20">Legal</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/cookies" className="text-sm text-white/40 hover:text-white transition-colors">Cookies Policy</Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-white/40 hover:text-white transition-colors">Terms & Conditions</Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-6 text-right md:text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/20">Social</h4>
              <div className="flex gap-6 justify-end md:justify-start">
                <motion.a 
                  whileHover={{ y: -5, scale: 1.1 }}
                  href="#" className="text-white/40 hover:text-white transition-colors"
                >
                  <Instagram size={20} />
                </motion.a>
                <motion.a 
                  whileHover={{ y: -5, scale: 1.1 }}
                  href="#" className="text-white/40 hover:text-white transition-colors"
                >
                  <Youtube size={20} />
                </motion.a>
                <motion.a 
                  whileHover={{ y: -5, scale: 1.1 }}
                  href="#" className="text-white/40 hover:text-white transition-colors"
                >
                  <Music2 size={20} />
                </motion.a>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
            <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold">
              © 2026 Tiscolly Productions. All rights reserved.
            </div>
            <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold">
              Crafted with passion in Italy
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Home({ isInitialLoading, scrollToSection }: { isInitialLoading: boolean, scrollToSection: (id: string) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (location.state?.scrollTo && !hasScrolled.current) {
      const id = location.state.scrollTo;
      hasScrolled.current = true;
      
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        // Clear state properly in React Router
        navigate(location.pathname, { replace: true, state: {} });
      }, 100);
    }
  }, [location, navigate]);

  return (
    <div className="flex flex-col">
      <section id="home">
        <HeroSection isInitialLoading={isInitialLoading} scrollToSection={scrollToSection} />
      </section>

      <section id="about">
        <AboutSection />
      </section>

      <section id="showreel">
        <ShowreelSection />
      </section>

      <section id="portfolio-preview">
        <HomePortfolio />
      </section>
    </div>
  );
}

function AboutPage() {
  const navigate = useNavigate();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth the mouse movement
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Parallax offsets for different layers
  const imageX = useTransform(springX, [-0.5, 0.5], [-20, 20]);
  const imageY = useTransform(springY, [-0.5, 0.5], [-20, 20]);
  
  const basedX = useTransform(springX, [-0.5, 0.5], [-40, 40]);
  const basedY = useTransform(springY, [-0.5, 0.5], [-40, 40]);

  const contactsX = useTransform(springX, [-0.5, 0.5], [50, -50]);
  const contactsY = useTransform(springY, [-0.5, 0.5], [50, -50]);

  const followX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const followY = useTransform(springY, [-0.5, 0.5], [30, -30]);

  return (
    <div className="pt-32 pb-20 bg-dark min-h-screen relative overflow-hidden" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {/* Dot Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)', 
             backgroundSize: '30px 30px' 
           }} 
      />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-[1px] bg-white/20" />
              <h1 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
                Our Story
              </h1>
            </div>
            
            <h2 className="text-5xl md:text-8xl font-display font-bold tracking-tighter uppercase mb-12 leading-[0.9]">
              We Don't Just Film.<br />We Create <span className="text-glow">Vortexes</span>.
            </h2>

            <div className="space-y-6 text-white/70 text-lg leading-relaxed max-w-xl mb-12">
              <p>
                Founded in the heart of Italy, Tiscolly Productions was born from a singular vision: to transform the traditional cinematic experience into a powerful, immersive force. We don't believe in static storytelling; we believe in the "Vortex"—a swirling convergence of emotion, technology, and artistic rebellion.
              </p>
              <p>
                Our journey started in the vibrant streets of Rome and Naples, where the contrast between ancient history and modern chaos provided the perfect canvas for our experimental approach. We've spent years honing a style that is both raw and polished, blending the grit of documentary filmmaking with the precision of high-end motion design.
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              <Link 
                to="/contact"
                className="px-10 py-5 bg-white text-dark rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform flex items-center gap-3"
              >
                Start a Project <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>

          <div className="relative h-[700px] flex items-center justify-center">
            {/* Central Image Widget */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ x: imageX, y: imageY }}
              whileHover={{ scale: 1.02 }}
              className="relative w-[360px] h-[500px] rounded-[50px] overflow-hidden shadow-2xl z-20 bg-zinc-900 border border-white/10 transition-shadow duration-500 hover:shadow-white/5"
            >
              <img 
                src="https://i.postimg.cc/nh5gy5nL/WALO-32.jpg" 
                alt="Visionary" 
                className="w-full h-full object-cover opacity-80"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
            </motion.div>

            {/* Floating Widgets - Hidden on mobile for cleaner look */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ x: basedX, y: basedY }}
              whileHover={{ scale: 1.1, zIndex: 40 }}
              className="absolute left-[-40px] top-[100px] w-[220px] p-8 bg-zinc-800/90 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl z-30 cursor-default hidden md:block"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Based</span>
                <ArrowRight size={14} className="text-white/40" />
              </div>
              <div className="text-3xl font-display font-bold text-white leading-tight">
                Rome,<br />Naples
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              style={{ x: contactsX, y: contactsY }}
              whileHover={{ scale: 1.05, zIndex: 40 }}
              className="absolute right-[-20px] bottom-[80px] w-[300px] p-8 bg-red-600 rounded-[32px] shadow-2xl z-30 cursor-default hidden md:block"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] uppercase tracking-widest text-white/80 font-bold">Contacts</span>
                <ArrowRight size={14} className="text-white/80" />
              </div>
              <div className="text-base font-bold text-white mb-2 whitespace-nowrap">
                olly@tiscollyproductions.it
              </div>
            </motion.div>

            <motion.div 
              animate={{ x: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={{ x: followX, y: followY }}
              whileHover={{ scale: 1.1, zIndex: 40 }}
              className="absolute right-[10px] top-[50px] w-[200px] p-8 bg-white rounded-[32px] shadow-2xl z-30 cursor-default hidden md:block"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-[10px] uppercase tracking-widest text-dark/40 font-bold">Follow Us</span>
                <div className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">LIVE</div>
              </div>
              <div className="flex justify-between items-center">
                <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-dark/80 hover:text-red-600 transition-colors">
                  <Instagram size={24} />
                </motion.a>
                <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-dark/80 hover:text-red-600 transition-colors">
                  <Youtube size={24} />
                </motion.a>
                <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-dark/80 hover:text-red-600 transition-colors">
                  <Music2 size={24} />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="mt-32 pt-20 border-t border-white/10">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "Innovation", desc: "We constantly push the boundaries of what's possible with motion design and cinematic techniques.", icon: "✨" },
              { title: "Emotion", desc: "Every frame must serve a purpose. We prioritize the emotional heartbeat of every story we tell.", icon: "❤️" },
              { title: "Impact", desc: "We create visuals that stick. Our work is designed to leave a lasting impression on the viewer's mind.", icon: "💥" }
            ].map((item, i) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                transition={{ delay: i * 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="group p-8 glass rounded-[32px] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all duration-500 relative overflow-hidden"
              >
                {/* Animated background glow on hover */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-500" />
                
                <div className="relative z-10">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                    className="text-3xl mb-6 block"
                  >
                    {item.icon}
                  </motion.div>
                  <h3 className="text-2xl font-display font-bold uppercase mb-4 text-white group-hover:text-glow transition-all duration-500">
                    {item.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/60 transition-colors duration-500">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom line animation */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-white/20 transition-all duration-700 group-hover:w-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowreelSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-5, 5]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <div ref={containerRef} className="py-16 relative overflow-visible">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col items-center mb-16"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-[1px] bg-white/20" />
          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
            Showreel 2025
          </h2>
          <div className="w-8 h-[1px] bg-white/20" />
        </div>
        <h3 className="text-4xl md:text-7xl font-display font-bold tracking-tighter uppercase text-center max-w-4xl leading-[0.9]">
          Experience the Cinematic <span className="text-glow">Vortex</span>
        </h3>
      </motion.div>

      <div className="relative max-w-6xl mx-auto px-4 isolate">
        {/* Enhanced Floating Background Elements */}
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [150, -150]) }}
          className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-red-600/30 rounded-full blur-[100px] z-0"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [-150, 150]) }}
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] z-0"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [50, -50]) }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/20 rounded-full blur-[150px] z-0"
        />

        {/* Floating Video Container */}
        <motion.div 
          style={{ y, rotate, scale }}
          className="relative aspect-video w-full rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)] border border-white/10 bg-zinc-900 group z-10"
        >
          <iframe 
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/KK5qgl5COU0?si=bQaGOn01R3FIpcsH" 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
          ></iframe>
          
          {/* Decorative Corners */}
          <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-white/20 pointer-events-none" />
          <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-white/20 pointer-events-none" />
          <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-white/20 pointer-events-none" />
          <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-white/20 pointer-events-none" />
        </motion.div>
      </div>

      {/* Bottom transition gradient to smooth the cut */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-dark via-dark/80 to-transparent pointer-events-none z-20" />
    </div>
  );
}

function HomePortfolio() {
  const navigate = useNavigate();
  
  // Helper to parse date for sorting
  const parseDate = (dateStr: string) => {
    // Standardize format: remove commas and handle common formats
    try {
      return new Date(dateStr.replace(',', '')).getTime();
    } catch (e) {
      return 0;
    }
  };

  // Get 3 most recent projects
  const recentProjects = [...PROJECTS]
    .sort((a, b) => parseDate(b.premiere) - parseDate(a.premiere))
    .slice(0, 3);

  return (
    <section className="py-16 px-6 md:px-12 bg-dark relative overflow-hidden">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)', 
             backgroundSize: '30px 30px' 
           }} 
      />
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-6 mb-16"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white/20" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
              Latest Works
            </h2>
          </div>
          <h3 className="text-4xl md:text-6xl font-display font-bold tracking-tighter uppercase">
            Recent Creations
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {recentProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group cursor-pointer"
              onClick={() => navigate('/portfolio')}
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden glass relative mb-6">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40 mb-2">{project.category}</p>
                  <h4 className="text-xl font-display font-bold text-white leading-tight uppercase">{project.title}</h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => navigate('/portfolio')}
            className="px-10 py-5 border border-white/20 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-dark transition-all flex items-center gap-3 group"
          >
            View Full Portfolio
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20">
      <ContactSection />
    </div>
  );
}

function PortfolioPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20">
      <PortfolioSection />
    </div>
  );
}

function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState('FILM');
  const categories = ['FILM', 'EDITING AND MOTION', 'GRAPHICS', 'PHOTO'];

  return (
    <div className="bg-dark min-h-screen flex flex-col pt-32 relative overflow-hidden">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)', 
             backgroundSize: '30px 30px' 
           }} 
      />
      <div className="container mx-auto px-6 md:px-12 mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white/20" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
              Portfolio
            </h2>
          </div>
          
          <div className="relative w-full md:w-fit group/scroll">
            <div className="flex items-center gap-2 md:gap-1 p-1 glass rounded-full w-full overflow-x-auto no-scrollbar relative scroll-smooth px-2 md:px-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-5 md:px-6 py-2.5 md:py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap z-10 flex-shrink-0 ${activeCategory === cat ? 'text-dark' : 'text-white/40 hover:text-white'}`}
                >
                  {activeCategory === cat && (
                    <motion.div 
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-white rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {cat}
                </button>
              ))}
              <div className="w-8 md:hidden flex-shrink-0" />
            </div>
            {/* Mobile scroll indicator fade */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-dark to-transparent pointer-events-none md:hidden rounded-r-full opacity-60" />
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <CategorySection category={activeCategory} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function CategorySection({ category }: { category: string }) {
  const filteredProjects = PROJECTS.filter(p => p.category === category);
  const [activeProject, setActiveProject] = useState(0);
  const project = filteredProjects[activeProject] || filteredProjects[0];

  if (!project) return null;

  return (
    <div className="container mx-auto px-6 md:px-12 mb-20 relative group/section">
      {/* Navigation Arrows - Outside the card */}
      {filteredProjects.length > 1 && (
        <>
          <button 
            onClick={() => setActiveProject((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length)}
            className="absolute left-2 md:-left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:scale-125 transition-all z-50 group/btn glass rounded-full md:glass-none md:border-none"
          >
            <ChevronLeft size={24} className="md:w-8 md:h-8 group-hover/btn:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => setActiveProject((prev) => (prev + 1) % filteredProjects.length)}
            className="absolute right-2 md:-right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:scale-125 transition-all z-50 group/btn glass rounded-full md:glass-none md:border-none"
          >
            <ChevronRight size={24} className="md:w-8 md:h-8 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </>
      )}

      <div className="md:h-[650px] relative flex flex-col md:flex-row glass-dark rounded-[40px] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] group/card">
        {/* Liquid Background Effect */}
        <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0],
              x: [0, 20, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -8, 0],
              x: [0, -30, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute -bottom-[20%] -left-[20%] w-[70%] h-[70%] bg-red-600/10 rounded-full blur-[150px]"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden min-h-[60vh] md:min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover opacity-60 group-hover/card:scale-105 transition-transform duration-[2s]"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/40 to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 h-full flex flex-col justify-start px-6 md:px-20 pt-16 md:pt-24 pb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-12 h-[1px] bg-white/40" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60">{category}</span>
            </motion.div>

            <div className="min-h-[120px] md:min-h-[160px] flex flex-col justify-end mb-6">
              <motion.h2 
                key={`title-${project.id}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-6xl font-display font-bold tracking-tighter uppercase text-glow whitespace-pre-line"
              >
                {project.title}
              </motion.h2>
            </div>

            <motion.p 
              key={`desc-${project.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/50 max-w-xl text-sm md:text-base leading-relaxed line-clamp-4 md:line-clamp-none"
            >
              {project.description}
            </motion.p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-96 glass-dark border-l border-white/10 p-8 md:p-12 flex flex-col justify-between relative z-20">
          <div className="space-y-10">
            {[
              { label: "PREMIERE", value: project.premiere },
              { 
                label: project.title === "THE CLOCK" 
                  ? "DIRECTOR & MOTION DESIGNER" 
                  : project.category === 'GRAPHICS' 
                    ? "GRAPHIC DESIGNER" 
                    : project.category === 'PHOTO' 
                      ? "PHOTOGRAPHER" 
                      : "DIRECTOR", 
                value: project.director 
              },
              { label: "PRODUCTION BY", value: project.music },
              { label: "GENRE", value: project.genre }
            ].map((item, i) => (
              <motion.div 
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="group/item"
              >
                <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40 mb-2 group-hover/item:text-red-500 transition-colors">{item.label}</h4>
                <p className="text-[11px] font-bold uppercase whitespace-pre-line leading-relaxed text-white/80 group-hover/item:text-white transition-colors">{item.value}</p>
              </motion.div>
            ))}
          </div>

          <div 
            className={`mt-12 group relative ${project.videoUrl ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={() => project.videoUrl && window.open(project.videoUrl, '_blank')}
          >
            <div className="aspect-video rounded-2xl overflow-hidden glass relative shadow-2xl">
              <img 
                src={project.image} 
                alt="Trailer" 
                className={`w-full h-full object-cover opacity-60 transition-transform duration-700 ${project.videoUrl ? 'group-hover:scale-110' : ''}`}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              {project.videoUrl && project.category !== 'GRAPHICS' && project.category !== 'PHOTO' && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark/20 group-hover:bg-dark/0 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white group-hover:text-dark transition-all duration-500 shadow-xl">
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>
              )}
            </div>
            {project.videoUrl && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <div className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">Watch Now</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Indicator Dots */}
      <div className="flex justify-center gap-3 mt-12">
        {filteredProjects.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveProject(i)}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${activeProject === i ? 'w-8 bg-white' : 'bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}

function ContactSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const dotsY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <div ref={containerRef} className="min-h-screen bg-dark relative overflow-hidden flex flex-col justify-center px-6 md:px-24 py-20">
      {/* Dot Grid Background with Parallax */}
      <motion.div 
        className="absolute inset-0 opacity-20 pointer-events-none z-0" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)', 
          backgroundSize: '30px 30px',
          y: dotsY
        }} 
      />
      
      <div className="container mx-auto relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-start gap-6 mb-20"
        >
          <div className="w-1 h-20 bg-white mt-2" />
          <div>
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-display font-bold tracking-tighter uppercase leading-none">
              Contacts
            </h2>
          </div>
        </motion.div>

        {/* Info Grid - Justified 3 columns */}
        <div className="grid md:grid-cols-3 gap-12 mb-32 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-white/40">
              <Phone size={14} className="text-white" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Phone</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed font-bold">
              +39 3336826451
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-white/40">
              <Mail size={14} className="text-white" />
              <span className="text-[10px] uppercase tracking-widest font-bold">E-mail</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed font-bold">
              olly@tiscollyproductions.it
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-white/40">
              <Instagram size={14} className="text-white" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Social</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Youtube size={18} />
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <Music2 size={18} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Simple Link Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-4 bg-white" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">
              Get in touch
            </span>
          </div>

          <a 
            href="mailto:olly@tiscollyproductions.it"
            className="group relative inline-block"
          >
            <h3 className="text-7xl md:text-9xl font-display font-bold uppercase tracking-tighter leading-none transition-all duration-500 group-hover:italic group-hover:tracking-normal">
              Write us
            </h3>
            <div className="absolute -bottom-4 left-0 w-0 h-1 bg-white transition-all duration-500 group-hover:w-full" />
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
              <ArrowRight size={48} className="md:w-16 md:h-16" />
            </div>
          </a>
        </motion.div>
      </div>
    </div>
  );
}

function HeroSection({ isInitialLoading, scrollToSection }: { isInitialLoading: boolean, scrollToSection: (id: string) => void }) {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="flex flex-col" ref={containerRef}>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-screen flex items-center overflow-hidden"
      >
        {/* Background with Glow - Enhanced */}
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          {/* YouTube Background Video - Hidden on mobile for performance */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-40 hidden md:block">
            <iframe
              className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
              src="https://www.youtube.com/embed/gYgkvB4Y7gA?si=IV9utfBDfhIEDzZP&autoplay=1&mute=1&controls=0&loop=1&playlist=gYgkvB4Y7gA&rel=0&enablejsapi=1"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Mobile Background Image Fallback */}
          <div 
            className="absolute inset-0 md:hidden bg-cover bg-center opacity-30"
            style={{ backgroundImage: 'url(https://i.postimg.cc/k5z1HtF7/WALO-28.jpg)' }}
          />
          
          <div className="absolute inset-0 bg-dark/40" />
          
          {/* Ambient Gradients to fill the space */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px]" />
        </motion.div>

        <AnimatePresence>
          {!isInitialLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative z-10 container mx-auto px-6 md:px-12 flex flex-col items-center text-center pt-20"
            >
              <div className="max-w-5xl">
                <motion.h1 
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="text-5xl sm:text-6xl md:text-[7vw] font-display font-bold leading-[0.85] tracking-tighter mb-8 text-glow uppercase select-none"
                >
                  <div className="flex flex-wrap justify-center">
                    {"IGNITE".split("").map((char, i) => (
                      <motion.span
                        key={i}
                        className="inline-block"
                        whileHover={{ 
                          fontStyle: 'italic', 
                          fontWeight: '900',
                          scale: 1.1,
                          color: '#fff',
                          textShadow: '0 0 20px rgba(255,255,255,0.5)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-center">
                    {"YOUR".split("").map((char, i) => (
                      <motion.span
                        key={i}
                        className="inline-block"
                        whileHover={{ 
                          fontStyle: 'italic', 
                          fontWeight: '900',
                          scale: 1.1,
                          color: '#fff',
                          textShadow: '0 0 20px rgba(255,255,255,0.5)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-center">
                    {"VORTEX".split("").map((char, i) => (
                      <motion.span
                        key={i}
                        className="inline-block"
                        whileHover={{ 
                          fontStyle: 'italic', 
                          fontWeight: '900',
                          scale: 1.1,
                          color: '#fff',
                          textShadow: '0 0 20px rgba(255,255,255,0.5)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
                >
                  Unleash the power of cinematic storytelling. We turn your vision into a swirling force of visual impact that captures the world's attention.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-center gap-6"
                >
                  <button 
                    onClick={() => navigate('/portfolio')}
                    className="px-10 py-5 bg-white text-dark rounded-full font-bold flex items-center gap-3 hover:scale-105 transition-transform group"
                  >
                    Explore Portfolio 
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <ArrowRight size={22} />
                    </motion.span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-dark to-transparent pointer-events-none" />
        
        {/* Animated Light Streaks */}
        {[1, 2, 3].map((i) => (
          <motion.div 
            key={i}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              x: [-100, 100, -100],
              y: [-50, 50, -50]
            }}
            transition={{ 
              duration: 15 + i * 5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 2
            }}
            className={`absolute w-[1200px] h-[1px] bg-gradient-to-r from-transparent via-white/${10 + i * 5} to-transparent blur-md`}
            style={{ 
              top: `${20 + i * 20}%`, 
              left: '-10%',
              rotate: `${-25 + i * 10}deg` 
            }}
          />
        ))}
      </motion.section>
    </div>
  );
}

function AboutSection() {
  const navigate = useNavigate();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth the mouse movement
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Parallax offsets for different layers
  const imageX = useTransform(springX, [-0.5, 0.5], [-15, 15]);
  const imageY = useTransform(springY, [-0.5, 0.5], [-15, 15]);
  
  const basedX = useTransform(springX, [-0.5, 0.5], [-35, 35]);
  const basedY = useTransform(springY, [-0.5, 0.5], [-35, 35]);

  const contactsX = useTransform(springX, [-0.5, 0.5], [45, -45]);
  const contactsY = useTransform(springY, [-0.5, 0.5], [45, -45]);

  const followX = useTransform(springX, [-0.5, 0.5], [-25, 25]);
  const followY = useTransform(springY, [-0.5, 0.5], [25, -25]);

  return (
    <section className="py-16 px-6 md:px-12 bg-dark relative overflow-hidden">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)', 
             backgroundSize: '30px 30px' 
           }} 
      />
      
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 tracking-tighter uppercase">
              WE DON'T JUST FILM.<br />WE CREATE VORTEXES.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-xl">
              We are an elite creative agency dedicated to producing visual content that pushes the boundaries of imagination. Founded on a passion for cinematic storytelling, Tiscolly Productions combines cutting-edge technology and artistic vision to create unforgettable experiences.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/about')}
                className="px-8 py-4 border border-white/20 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-dark transition-all"
              >
                Learn More
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="px-8 py-4 bg-white text-dark rounded-full text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all"
              >
                Work With Us
              </button>
            </div>
          </motion.div>

          <div 
            className="relative h-[600px] flex items-center justify-center"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Central Image Widget */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ x: imageX, y: imageY }}
              whileHover={{ scale: 1.02 }}
              className="relative w-[320px] h-[450px] rounded-[40px] overflow-hidden shadow-2xl z-20 bg-zinc-900 border border-white/10 transition-shadow duration-500 hover:shadow-white/5"
            >
              <img 
                src="https://i.postimg.cc/nh5gy5nL/WALO-32.jpg" 
                alt="Visionary" 
                className="w-full h-full object-cover opacity-80"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
            </motion.div>

            {/* Floating Widgets - Hidden on mobile for cleaner look */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ x: basedX, y: basedY }}
              whileHover={{ scale: 1.1, zIndex: 40 }}
              className="absolute left-[-20px] top-[150px] w-[200px] p-6 bg-zinc-800/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl z-30 cursor-default hidden md:block"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Based</span>
                <ArrowRight size={12} className="text-white/40" />
              </div>
              <div className="text-2xl font-display font-bold text-white leading-tight">
                Rome,<br />Naples
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              style={{ x: contactsX, y: contactsY }}
              whileHover={{ scale: 1.05, zIndex: 40 }}
              className="absolute right-[0px] bottom-[100px] w-[280px] p-6 bg-red-600 rounded-3xl shadow-2xl z-30 cursor-default hidden md:block"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-widest text-white/80 font-bold">Contacts</span>
                <ArrowRight size={12} className="text-white/80" />
              </div>
              <div className="text-sm font-bold text-white mb-2 whitespace-nowrap">
                olly@tiscollyproductions.it
              </div>
            </motion.div>

            <motion.div 
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={{ x: followX, y: followY }}
              whileHover={{ scale: 1.1, zIndex: 40 }}
              className="absolute right-[20px] top-[80px] w-[180px] p-6 bg-white rounded-3xl shadow-2xl z-30 cursor-default hidden md:block"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] uppercase tracking-widest text-dark/40 font-bold">Follow Us</span>
                <div className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">LIVE</div>
              </div>
              <div className="flex justify-between items-center">
                <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-dark/80 hover:text-red-600 transition-colors">
                  <Instagram size={20} />
                </motion.a>
                <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-dark/80 hover:text-red-600 transition-colors">
                  <Youtube size={20} />
                </motion.a>
                <motion.a whileHover={{ scale: 1.2 }} href="#" className="text-dark/80 hover:text-red-600 transition-colors">
                  <Music2 size={20} />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CookiesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 md:px-12">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-12">
            Cookie <span className="italic font-light">Policy</span>
          </h1>
          
          <div className="space-y-12 text-white/60 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">1. Introduction</h2>
              <p>
                This Cookie Policy explains how Tiscolly Productions uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">2. What are cookies?</h2>
              <p>
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">3. Why do we use cookies?</h2>
              <p>
                We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Property.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">4. How can I control cookies?</h2>
              <p>
                You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 md:px-12">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-12">
            Terms & <span className="italic font-light">Conditions</span>
          </h1>
          
          <div className="space-y-12 text-white/60 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">1. Acceptance of Terms</h2>
              <p>
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">2. Intellectual Property</h2>
              <p>
                The Site and its original content, features, and functionality are owned by Tiscolly Productions and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">3. User Responsibilities</h2>
              <p>
                You are responsible for your own communications and for any consequences thereof. Your use of the Services is subject to your acceptance of and compliance with the Agreement.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">4. Limitation of Liability</h2>
              <p>
                In no event shall Tiscolly Productions, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

