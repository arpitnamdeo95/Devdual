import React from 'react';
import { motion } from 'framer-motion';

export const DynamicLogo: React.FC = () => {
  return (
    <motion.div
      className="relative w-8 h-8 flex items-center justify-center"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 border-2 border-primary-container/60 rounded-full" />
      {/* Inner square rotated */}
      <motion.div
        className="w-4 h-4 border-2 border-primary-container"
        animate={{ rotate: [0, -360] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{ borderRadius: 0 }}
      />
      {/* Center dot */}
      <div className="absolute w-1.5 h-1.5 bg-primary-container rounded-full shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
    </motion.div>
  );
};
