import React from 'react';
import { motion } from 'framer-motion';

interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'glow' | 'ghost';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  icon,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-5 py-2 text-xs',
    md: 'px-8 py-3 text-sm',
    lg: 'px-12 py-4 text-base',
  }[size];

  const baseClasses = `group relative font-display font-bold tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50 disabled:pointer-events-none ${sizeClasses}`;

  const renderContent = () => (
    <>
      <span className="relative z-10 flex items-center gap-2 group-hover:animate-glitch">
        {icon}
        {/* Main label with RGB glitch clones */}
        <span className="relative inline-block">
          {children}
          {/* Glitch clones - visible on hover */}
          <span className="absolute inset-0 text-[#ff00c1] opacity-0 group-hover:opacity-50 group-hover:animate-ping pointer-events-none -z-10 blur-[1px]">
            {children}
          </span>
          <span className="absolute inset-0 text-[#00fff0] opacity-0 group-hover:opacity-50 group-hover:animate-pulse pointer-events-none -z-10 blur-[1px] translate-x-[1px]">
            {children}
          </span>
        </span>
      </span>
      {/* Universal light sweep for interactive variants */}
      {(variant === 'primary' || variant === 'secondary' || variant === 'glow') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-20 -translate-x-[200%] group-hover:animate-light-sweep pointer-events-none" />
      )}
    </>
  );

  const tapProps = { scale: 0.94, rotate: -0.5 };
  const hoverScale = 1.02;

  if (variant === 'primary') {
    return (
      <motion.button
        whileHover={{ scale: hoverScale, boxShadow: '0 0 30px rgba(0, 229, 255, 0.4)' }}
        whileTap={tapProps}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} bg-primary-container text-background hover:bg-white hover:text-black clip-angle shadow-glow-primary hover:shadow-glow-intense ${className}`}
      >
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ x: '-101%' }}
          whileHover={{ x: '0%' }}
          transition={{ duration: 0.3, ease: "circOut" }}
        />
        {renderContent()}
      </motion.button>
    );
  }

  if (variant === 'secondary') {
    return (
      <motion.button
        whileHover={{ scale: hoverScale, borderColor: 'rgba(168,85,247,0.8)' }}
        whileTap={tapProps}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} border border-outline-variant text-on-surface-variant hover:text-secondary-container hover:border-secondary-container bg-surface/10 hover:bg-surface/20 backdrop-blur-sm hover:shadow-glow-purple/20 ${className}`}
      >
        {renderContent()}
      </motion.button>
    );
  }

  if (variant === 'danger') {
    return (
      <motion.button
        whileHover={{ scale: hoverScale, backgroundColor: 'rgba(255, 95, 87, 0.1)' }}
        whileTap={tapProps}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} border border-accent-red/50 text-accent-red hover:text-white hover:bg-accent-red bg-transparent clip-angle ${className}`}
      >
        {renderContent()}
      </motion.button>
    );
  }

  if (variant === 'glow') {
    return (
      <motion.button
        whileHover={{ scale: hoverScale }}
        whileTap={tapProps}
        onClick={onClick}
        disabled={disabled}
        animate={{
          boxShadow: [
            '0 0 15px rgba(0, 229, 255, 0.1)',
            '0 0 30px rgba(0, 229, 255, 0.3)',
            '0 0 15px rgba(0, 229, 255, 0.1)',
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className={`${baseClasses} bg-primary-container text-background hover:bg-white hover:text-black clip-angle shadow-glow-primary ${className}`}
      >
        {renderContent()}
      </motion.button>
    );
  }

  // ghost
  return (
    <motion.button
      whileHover={{ scale: 1.05, opacity: 1 }}
      whileTap={tapProps}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} bg-transparent text-primary-container/60 hover:text-primary-container transition-opacity underline-offset-4 decoration-primary-container/30 ${className}`}
    >
      {renderContent()}
    </motion.button>
  );
};
