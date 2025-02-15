
import { motion } from "framer-motion";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <p className="text-xs font-medium text-neutral-500">{product.category}</p>
        <h3 className="mt-1 text-lg font-medium text-neutral-900">
          {product.title}
        </h3>
        <p className="mt-2 font-medium text-neutral-900">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
