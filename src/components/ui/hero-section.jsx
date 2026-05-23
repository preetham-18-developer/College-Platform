import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { supabase } from '../../services/supabase';
import AuthModal from '../AuthModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const cardsVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.3 },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

export const FinancialHero = ({
  title,
  description,
  buttonText,
  imageUrl1,
  imageUrl2,
  className,
  searchComponent
}) => {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const gridBackgroundStyle = {
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px)',
    backgroundSize: '3rem 3rem',
  };

  return (
    <section className={cn('position-relative w-100 overflow-hidden bg-light-subtle text-dark border-bottom', className)}>
      <div className="position-absolute top-0 start-0 w-100 h-100" style={gridBackgroundStyle} />
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient" style={{ background: 'linear-gradient(to bottom, transparent, rgba(248, 249, 250, 0.8), #f8f9fa)' }} />

      <motion.div
        className="position-relative container d-flex flex-column flex-lg-row align-items-center justify-content-between px-4 py-5 gap-5 min-vh-75"
        style={{ minHeight: '80vh', zIndex: 1 }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left: Text Content */}
        <div className="d-flex flex-column align-items-center text-center align-items-lg-start text-lg-start col-lg-6">
          <motion.div variants={itemVariants} className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-white shadow-sm border mb-4">
            <Sparkles size={16} className="text-primary" />
            <span className="fw-medium small text-muted">Discover Your Dream College</span>
          </motion.div>

          <motion.h1 className="display-4 fw-bold tracking-tight mb-4" variants={itemVariants}>
            {title}
          </motion.h1>
          
          <motion.p className="lead text-muted mb-5" variants={itemVariants}>
            {description}
          </motion.p>
          
          <motion.div variants={itemVariants} className="w-100 mb-4">
            {searchComponent}
          </motion.div>

          {!user && (
            <motion.div variants={itemVariants} className="mt-2">
              <Button size="lg" className="shadow-sm" onClick={() => setIsAuthOpen(true)}>
                {buttonText}
                <ArrowRight className="ms-2" size={20} />
              </Button>
            </motion.div>
          )}
        </div>

        {/* Right: Card Images */}
        <motion.div
          className="position-relative col-lg-6 d-flex align-items-center justify-content-center mt-5 mt-lg-0"
          style={{ height: '400px' }}
          variants={cardsVariants}
        >
          {/* Back Card */}
          <motion.img
            src={imageUrl2}
            alt="Campus Life"
            variants={cardItemVariants}
            whileHover={{ y: -10, rotate: -5, transition: { duration: 0.3 } }}
            className="position-absolute rounded-4 shadow-lg object-fit-cover border border-4 border-white"
            style={{ height: '320px', width: '240px', transform: 'rotate(-6deg) translateX(40px)', zIndex: 1 }}
          />
          {/* Front Card */}
          <motion.img
            src={imageUrl1}
            alt="Students"
            variants={cardItemVariants}
            whileHover={{ y: -10, rotate: 5, transition: { duration: 0.3 } }}
            className="position-absolute rounded-4 shadow-lg object-fit-cover border border-4 border-white"
            style={{ height: '320px', width: '240px', transform: 'rotate(6deg) translateX(-40px)', zIndex: 2 }}
          />
        </motion.div>
      </motion.div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </section>
  );
};
