import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <motion.div
        className="relative"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      >
        <motion.div
          className="w-16 h-16 border-4 border-purple-300 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
};

export default Loader;