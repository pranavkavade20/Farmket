import { type ComponentType } from 'react';
import { motion } from 'framer-motion';
import { User, Wheat, Store, ShoppingCart, CheckCircle } from 'lucide-react';

const FlowNode = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  index, 
  totalNodes,
}: { 
  icon: ComponentType<{ className?: string }>, 
  title: string, 
  subtitle: string, 
  index: number,
  totalNodes: number,
}) => {
  const isLast = index === totalNodes - 1;

  return (
    <div className="relative flex flex-col items-center w-full max-w-[200px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: index * 0.2 }}
        className="z-10"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: index * 0.5, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-2xl bg-surface border-2 border-border-strong flex flex-col items-center justify-center shadow-lg relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-brand/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          <Icon className="w-10 h-10 text-foreground mb-1" />
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
        className="mt-6 text-center"
      >
        <h4 className="font-bold text-lg">{title}</h4>
        <p className="text-sm text-foreground-secondary">{subtitle}</p>
      </motion.div>

      {!isLast && (
        <div className="absolute top-12 left-24 w-[calc(100%-48px)] md:w-[calc(100vw/5)] h-0.5 bg-border-subtle -z-10 hidden md:block overflow-hidden">
          <motion.div 
            className="h-full bg-brand origin-left"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: [1, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2, ease: 'linear' }}
          />
        </div>
      )}
      {!isLast && (
        <div className="w-0.5 h-16 bg-border-subtle md:hidden my-4 relative overflow-hidden">
          <motion.div 
            className="w-full bg-brand origin-top"
            initial={{ scaleY: 0, opacity: 1 }}
            animate={{ scaleY: 1, opacity: [1, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  );
};

export const MarketplaceFlow = () => {
  const nodes = [
    { icon: User, title: "Farmer", subtitle: "Harvests crop" },
    { icon: Wheat, title: "Product", subtitle: "Digitized inventory" },
    { icon: Store, title: "Marketplace", subtitle: "AI matchmaking" },
    { icon: ShoppingCart, title: "Buyer", subtitle: "Purchases goods" },
    { icon: CheckCircle, title: "Order", subtitle: "Fulfilled securely" }
  ];

  return (
    <section className="bg-background py-32 relative">
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-6 md:px-12 text-center mb-20"
      >
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">The seamless flow of trade.</h2>
        <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
          Farmket streamlines the agricultural supply chain, removing friction at every step from farm to table.
        </p>
      </motion.div>

      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-12 relative pb-32">
        {nodes.map((node, index) => (
          <FlowNode 
            key={index}
            index={index}
            totalNodes={nodes.length}
            {...node}
          />
        ))}
      </div>
    </section>
  );
};
