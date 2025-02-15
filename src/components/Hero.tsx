
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
          alt="Hero"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </motion.div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 inline-block rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-neutral-900"
          >
            Discover our new collection
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 text-5xl font-medium text-white md:text-7xl"
          >
            The Future of Style
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8 text-lg text-white/90"
          >
            Explore our curated collection of premium products
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-white px-8 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            Shop Now
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
