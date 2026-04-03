import React, { useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  index?: number;
}

const TAG_LABELS = ['01', '02', '03', '04', '05', '06'];

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay = 0,
  index = 0,
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { y: 30, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      whileHover={{ y: -6 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-surface-container-low/40 backdrop-blur-sm border border-outline-variant/40 overflow-hidden cursor-default transition-all duration-300 hover:border-primary-container/30"
      style={{ 
        clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' 
      }}
    >
      {/* Radial spotlight on hover */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 229, 255, 0.1),
              transparent 70%
            )
          `,
        }}
      />

      {/* Top neon edge */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary-container/60 to-transparent"
        animate={{ opacity: isHovered ? 1 : 0, scaleX: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.4 }}
      />

      {/* Left accent bar */}
      <motion.div 
        className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary-container/0 via-primary-container/40 to-primary-container/0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative z-10 p-8">
        {/* Card Header: Icon & Index */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative group/icon">
            <div className="p-3 bg-surface-container border border-outline-variant/40 group-hover:border-primary-container/30 transition-colors duration-300">
              {icon}
            </div>
            <motion.div
              className="absolute inset-0 bg-primary-container/10 -z-10 blur-xl"
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1.2 : 0.8 }}
            />
          </div>
          <span className="font-code text-[10px] text-outline-variant group-hover:text-primary-container/50 tracking-[0.2em] transition-colors duration-300">
            /{TAG_LABELS[index % 6]}
          </span>
        </div>

        {/* Content */}
        <h3 className="font-display font-bold text-xl mb-3 text-white group-hover:text-primary-container transition-colors duration-300 tracking-wide leading-tight">
          {title}
        </h3>

        <p className="font-body text-on-surface-variant leading-relaxed text-sm mb-6 group-hover:text-on-surface transition-colors duration-300">
          {description}
        </p>

        {/* Action Link */}
        <motion.div
          className="flex items-center gap-1 text-primary-container font-code text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all"
          animate={{ x: isHovered ? 4 : 0 }}
        >
          <span>Initialize</span>
          <ChevronRight className="w-3 h-3" />
        </motion.div>

        {/* Bottom corner accent decorative SVG */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-40 transition-all duration-500 transform translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M20 0 L20 20 L0 20" stroke="#00e5ff" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};
