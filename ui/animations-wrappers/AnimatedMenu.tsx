import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

const AnimatedMenu = ({
  children,
  isOpen,
  className = '',
  from = 'left',
}: {
  children: ReactNode;
  isOpen: boolean;
  className?: string;
  from: 'left' | 'right' | 'top' | 'bottom';
}) => {
  const menuVariants = {
    open: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
    closed: {
      opacity: 0,
      x: from === 'left' ? '-30%' : from === 'right' ? '30%' : 0,
      y: from === 'top' ? '-30%' : from === 'bottom' ? '30%' : 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      {/* Animated Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            style={{
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            className={className}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AnimatedMenu;
