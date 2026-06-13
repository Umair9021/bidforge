import { type ReactNode } from "react";
import { motion } from "motion/react";

export function ContainerScroll({
  children,
  title,
  eyebrow,
}: {
  children: ReactNode;
  title?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="relative" style={{ perspective: 1200 }}>
      {(title || eyebrow) && (
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {eyebrow}
          {title}
        </motion.div>
      )}
      {/* 3D tilt-in entrance — driven by in-view (not page scroll) so it does not
          conflict with GSAP ScrollSmoother's virtualized scrolling. */}
      <motion.div
        initial={{ rotateX: 22, scale: 0.92, y: 40, opacity: 0 }}
        whileInView={{ rotateX: 0, scale: 1, y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center top",
          willChange: "transform",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
