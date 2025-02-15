
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";

const mockProducts = [
  {
    id: "1",
    title: "Premium Product",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    category: "Electronics",
  },
  {
    id: "2",
    title: "Quality Item",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    category: "Accessories",
  },
  {
    id: "3",
    title: "Modern Design",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
    category: "Home",
  },
  {
    id: "4",
    title: "Essential Product",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    category: "Lifestyle",
  },
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? mockProducts.filter((p) => p.category === selectedCategory)
    : mockProducts;

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      
      <main className="mx-auto max-w-7xl px-6 py-24">
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <span className="mb-4 inline-block rounded-full bg-neutral-100 px-4 py-1.5 text-sm font-medium text-neutral-900">
              Featured Collection
            </span>
            <h2 className="mb-4 text-4xl font-medium text-neutral-900">
              Trending Products
            </h2>
            <p className="mx-auto max-w-2xl text-neutral-600">
              Discover our carefully curated selection of premium products,
              designed to elevate your lifestyle.
            </p>
          </motion.div>

          <div className="mb-12 flex justify-center gap-4">
            {["Electronics", "Accessories", "Home", "Lifestyle"].map(
              (category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category ? null : category
                    )
                  }
                  className={`rounded-full px-6 py-2 text-sm transition-colors ${
                    selectedCategory === category
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                  }`}
                >
                  {category}
                </motion.button>
              )
            )}
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
