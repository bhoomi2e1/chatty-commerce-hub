
import { motion } from "framer-motion";
import { Search, ShoppingCart, Menu } from "lucide-react";
import { useState, useEffect } from "react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-12">
          <a href="/" className="text-xl font-semibold text-neutral-900">
            STORE
          </a>
          <nav className="hidden md:block">
            <ul className="flex gap-8">
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  New Arrivals
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  Collections
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button className="hidden rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:block">
            <Search className="h-5 w-5" />
          </button>
          <button className="hidden rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:block">
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
