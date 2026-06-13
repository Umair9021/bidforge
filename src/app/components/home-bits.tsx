import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import * as THREE from "three";

/* ---------------- Type Text ---------------- */
export function TypeText({
  phrases,
  className = "",
  speed = 55,
  pause = 1500,
}: {
  phrases: string[];
  className?: string;
  speed?: number;
  pause?: number;
}) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);

  useEffect(() => {
    const current = phrases[i % phrases.length];
    let t: number;
    if (!del && text === current) {
      t = window.setTimeout(() => setDel(true), pause);
    } else if (del && text === "") {
      setDel(false);
      setI((p) => p + 1);
    } else {
      t = window.setTimeout(
        () =>
          setText(del ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1)),
        del ? speed / 2 : speed
      );
    }
    return () => clearTimeout(t);
  }, [text, del, i, phrases, speed, pause]);

  return (
    <span className={className}>
      {text}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.7, repeat: Infinity }}
        className="inline-block w-[2px] ml-1 align-middle"
        style={{ height: "1em", background: "var(--foreground)" }}
      />
    </span>
  );
}

/* ---------------- Curved Loop ---------------- */
export function CurvedLoop({
  text,
  speed = 30,
  className = "",
  amplitude = 40,
}: {
  text: string;
  speed?: number;
  className?: string;
  amplitude?: number;
}) {
  const repeated = Array.from({ length: 8 }).map(() => text).join("  •  ");
  const pathId = useRef(`curve-${Math.random().toString(36).slice(2, 9)}`).current;
  const pathD = `M -200,100 Q 300,${100 - amplitude} 800,100 T 1800,100 T 2800,100`;

  return (
    <div className={`w-full overflow-hidden ${className}`} aria-hidden>
      <svg
        viewBox="0 0 1600 200"
        className="w-full h-[140px] sm:h-[160px]"
        preserveAspectRatio="none"
      >
        <defs>
          <path id={pathId} d={pathD} />
          <linearGradient id={`${pathId}-grad`} x1="0" x2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <text
          fill={`url(#${pathId}-grad)`}
          style={{
            fontSize: 70,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
          }}
        >
          <textPath href={`#${pathId}`} startOffset="0%">
            {repeated}
            <animate
              attributeName="startOffset"
              from="0%"
              to="-50%"
              dur={`${speed}s`}
              repeatCount="indefinite"
            />
          </textPath>
        </text>
      </svg>
    </div>
  );
}

/* ---------------- Glare Hover ---------------- */
export function GlareHover({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50, active: false });

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = (ref.current as HTMLDivElement).getBoundingClientRect();
        setPos({
          x: ((e.clientX - r.left) / r.width) * 100,
          y: ((e.clientY - r.top) / r.height) * 100,
          active: true,
        });
      }}
      onMouseLeave={() => setPos((p) => ({ ...p, active: false }))}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: pos.active ? 1 : 0,
          background: `radial-gradient(420px circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.18), transparent 45%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.05), transparent 30%, transparent 70%, rgba(255,255,255,0.05))",
        }}
      />
    </div>
  );
}

/* ---------------- Antigravity (floats / repels from cursor) ---------------- */
export function Antigravity({
  children,
  strength = 30,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 14 });
  const sy = useSpring(my, { stiffness: 120, damping: 14 });
  const tx = useTransform(sx, (v) => v);
  const ty = useTransform(sy, (v) => v);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const radius = 180;
      if (dist < radius) {
        const force = (1 - dist / radius) * strength;
        mx.set((-dx / dist) * force);
        my.set((-dy / dist) * force);
      } else {
        mx.set(0);
        my.set(0);
      }
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my, strength]);

  return (
    <motion.div ref={ref} style={{ x: tx, y: ty }} className={className}>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}


/* ---------------- Three.js wave-grid backdrop ---------------- */
export function ThreeBackdrop({ dark = false }: { dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 2.8, 6.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Tilted wireframe wave plane (perspective floor that ripples)
    const segments = 60;
    const planeSize = 22;
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, segments, segments);
    planeGeo.rotateX(-Math.PI / 2.2);

    const baseColor = new THREE.Color(dark ? 0x8b9eff : 0x6366f1);
    const planeMat = new THREE.MeshBasicMaterial({
      color: baseColor,
      wireframe: true,
      transparent: true,
      opacity: dark ? 0.32 : 0.22,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.position.y = -1.6;
    scene.add(plane);

    // Cache original Y positions so we can displace per-frame
    const pos = planeGeo.attributes.position as THREE.BufferAttribute;
    const baseY = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) baseY[i] = pos.getY(i);

    // Subtle depth particles (no orbiting rings, no central blob)
    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 180;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 18;
      dustPositions[i * 3 + 1] = Math.random() * 4 - 0.5;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: dark ? 0xffffff : 0x6366f1,
      size: 0.022,
      transparent: true,
      opacity: 0.55,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    let mouseX = 0;
    let mouseY = 0;
    const onMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.25;
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) * 0.001;

      // Ripple the plane vertices on the Y axis (it's already rotated, so this is depth)
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const wave =
          Math.sin(x * 0.35 + t * 0.9) * 0.35 +
          Math.cos(z * 0.45 + t * 0.7) * 0.28 +
          Math.sin((x + z) * 0.18 + t * 0.4) * 0.18;
        pos.setY(i, baseY[i] + wave);
      }
      pos.needsUpdate = true;

      dust.rotation.y += 0.0006;
      dust.position.y = Math.sin(t * 0.4) * 0.15;

      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.04;
      camera.position.y += (2.8 + -mouseY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [dark]);

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none"
      aria-hidden
    />
  );
}
