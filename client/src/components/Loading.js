import React from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div
        className="flex flex-col items-center"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </motion.div>
    </div>
  );
};

export default Loading;
