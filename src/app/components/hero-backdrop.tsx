import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";

export type BackdropVariant =
  | "constellation"
  | "aurora"
  | "starfield"
  | "shards"
  | "blob"
  | "globe"
  | "textorbit"
  | "gradient"
  | "none";

const VARIANTS: { id: BackdropVariant; label: string; hint: string }[] = [
  { id: "constellation", label: "Constellation", hint: "Dots + connecting lines" },
  { id: "aurora", label: "Aurora ribbons", hint: "Soft flowing curves" },
  { id: "starfield", label: "Starfield", hint: "Depth tunnel drift" },
  { id: "shards", label: "Glass shards", hint: "Translucent panels" },
  { id: "blob", label: "Noisy blob", hint: "Distorted sphere" },
  { id: "globe", label: "Dotted globe", hint: "Rotating sphere of dots" },
  { id: "textorbit", label: "Text orbit", hint: "Floating keywords" },
  { id: "gradient", label: "Gradient mesh", hint: "CSS blobs, no WebGL" },
  { id: "none", label: "None", hint: "Just typography" },
];

const STORAGE_KEY = "bidforge.hero.backdrop.v1";

export function HeroBackdrop({ dark = false }: { dark?: boolean }) {
  const [variant, setVariant] = useState<BackdropVariant>("constellation");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as BackdropVariant | null;
    if (stored && VARIANTS.some((v) => v.id === stored)) setVariant(stored);
  }, []);

  const choose = (v: BackdropVariant) => {
    setVariant(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  return (
    <>
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {variant === "constellation" && <Constellation dark={dark} />}
        {variant === "aurora" && <Aurora dark={dark} />}
        {variant === "starfield" && <Starfield dark={dark} />}
        {variant === "shards" && <Shards dark={dark} />}
        {variant === "blob" && <Blob dark={dark} />}
        {variant === "globe" && <Globe dark={dark} />}
        {variant === "textorbit" && <TextOrbit dark={dark} />}
        {variant === "gradient" && <GradientMesh dark={dark} />}
        {variant === "none" && null}
      </div>
      <VariantPicker current={variant} onChange={choose} />
    </>
  );
}

/* ---------------- Picker UI ---------------- */
function VariantPicker({
  current,
  onChange,
}: {
  current: BackdropVariant;
  onChange: (v: BackdropVariant) => void;
}) {
  const [open, setOpen] = useState(false);
  const label = VARIANTS.find((v) => v.id === current)?.label ?? current;
  return (
    <div className="absolute top-4 right-4 z-20">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-md border border-border/80 bg-card/80 backdrop-blur px-2.5 py-1.5 hover:bg-card transition-colors"
        style={{ fontSize: 11, borderWidth: "0.5px" }}
      >
        Backdrop · <span className="text-muted-foreground">{label}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 mt-1.5 w-60 rounded-md border border-border/80 bg-card/95 backdrop-blur-md shadow-xl overflow-hidden"
            style={{ borderWidth: "0.5px" }}
          >
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  onChange(v.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-secondary transition-colors ${
                  v.id === current ? "bg-secondary/60" : ""
                }`}
              >
                <div style={{ fontSize: 12, fontWeight: 500 }}>{v.label}</div>
                <div className="text-text-tertiary" style={{ fontSize: 10.5 }}>
                  {v.hint}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Helpers ---------------- */
function useThree(
  setup: (
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    mouse: { x: number; y: number },
  ) => { tick: (t: number) => void; dispose: () => void },
  deps: unknown[] = [],
) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    const w = mount.clientWidth || 1;
    const h = mount.clientHeight || 1;
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let cleanup: (() => void) | null = null;
    try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      w / h,
      0.1,
      100,
    );
    camera.position.z = 6;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer!.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const { tick, dispose } = setup(scene, camera, renderer!, mouse);

    const start = performance.now();
    const loop = () => {
      try {
        tick((performance.now() - start) * 0.001);
        renderer!.render(scene, camera);
      } catch {
        /* swallow per-frame errors */
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      dispose();
      renderer?.dispose();
      if (renderer && renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
    } catch (err) {
      console.warn("HeroBackdrop init failed", err);
    }
    return () => cleanup?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/* ---------------- 1. Constellation ---------------- */
function Constellation({ dark }: { dark: boolean }) {
  const color = dark ? 0xb4c5ff : 0x6366f1;
  const ref = useThree((scene, camera, _r, mouse) => {
    const count = 90;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      velocities[i * 3] = (Math.random() - 0.5) * 0.008;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.008;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const dotMat = new THREE.PointsMaterial({
      color,
      size: 0.05,
      transparent: true,
      opacity: 0.9,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    scene.add(dots);

    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.25,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    const lineBuf = new Float32Array(count * count * 6);

    return {
      tick: () => {
        for (let i = 0; i < count; i++) {
          positions[i * 3] += velocities[i * 3];
          positions[i * 3 + 1] += velocities[i * 3 + 1];
          positions[i * 3 + 2] += velocities[i * 3 + 2];
          if (Math.abs(positions[i * 3]) > 6) velocities[i * 3] *= -1;
          if (Math.abs(positions[i * 3 + 1]) > 3.5) velocities[i * 3 + 1] *= -1;
          if (Math.abs(positions[i * 3 + 2]) > 2.5) velocities[i * 3 + 2] *= -1;
        }
        dotGeo.attributes.position.needsUpdate = true;

        let n = 0;
        for (let i = 0; i < count; i++) {
          for (let j = i + 1; j < count; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const d = dx * dx + dy * dy + dz * dz;
            if (d < 2.2) {
              lineBuf[n++] = positions[i * 3];
              lineBuf[n++] = positions[i * 3 + 1];
              lineBuf[n++] = positions[i * 3 + 2];
              lineBuf[n++] = positions[j * 3];
              lineBuf[n++] = positions[j * 3 + 1];
              lineBuf[n++] = positions[j * 3 + 2];
            }
          }
        }
        if (n > 0) {
          lineGeo.setAttribute(
            "position",
            new THREE.BufferAttribute(lineBuf.slice(0, n), 3),
          );
          lineGeo.attributes.position.needsUpdate = true;
        }
        camera.position.x += (mouse.x * 0.4 - camera.position.x) * 0.04;
        camera.position.y += (-mouse.y * 0.3 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
      },
      dispose: () => {
        dotGeo.dispose();
        dotMat.dispose();
        lineGeo.dispose();
        lineMat.dispose();
      },
    };
  }, [dark]);
  return <div ref={ref} className="absolute inset-0" />;
}

/* ---------------- 2. Aurora ---------------- */
function Aurora({ dark }: { dark: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: "60vw",
            height: "60vw",
            left: `${20 + i * 20}%`,
            top: `${-10 + i * 10}%`,
            background: `radial-gradient(circle, ${
              ["rgba(99,102,241,0.35)", "rgba(167,139,250,0.32)", "rgba(56,189,248,0.28)"][i]
            }, transparent 60%)`,
            filter: "blur(60px)",
            mixBlendMode: dark ? "screen" : "multiply",
          }}
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 18 + i * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- 3. Starfield ---------------- */
function Starfield({ dark }: { dark: boolean }) {
  const color = dark ? 0xffffff : 0x6366f1;
  const ref = useThree((scene, camera, _r, mouse) => {
    const count = 800;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = Math.random() * -30;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size: 0.035,
      transparent: true,
      opacity: 0.85,
    });
    const stars = new THREE.Points(geo, mat);
    scene.add(stars);
    camera.position.z = 5;

    return {
      tick: () => {
        for (let i = 0; i < count; i++) {
          positions[i * 3 + 2] += 0.05;
          if (positions[i * 3 + 2] > 2) positions[i * 3 + 2] = -30;
        }
        geo.attributes.position.needsUpdate = true;
        camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.03;
        camera.position.y += (-mouse.y * 0.4 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, -10);
      },
      dispose: () => {
        geo.dispose();
        mat.dispose();
      },
    };
  }, [dark]);
  return <div ref={ref} className="absolute inset-0" />;
}

/* ---------------- 4. Glass shards ---------------- */
function Shards({ dark }: { dark: boolean }) {
  const ref = useThree((scene, camera, _r, mouse) => {
    const meshes: THREE.Mesh[] = [];
    const palette = dark ? [0x6366f1, 0xa78bfa, 0x38bdf8] : [0x4f46e5, 0x8b5cf6, 0x06b6d4];
    for (let i = 0; i < 7; i++) {
      const w = 1.4 + Math.random() * 1.6;
      const h = 0.9 + Math.random() * 1.4;
      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshBasicMaterial({
        color: palette[i % palette.length],
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 5,
      );
      m.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      scene.add(m);
      meshes.push(m);
    }
    return {
      tick: (t) => {
        meshes.forEach((m, i) => {
          m.rotation.x += 0.0015 + i * 0.0002;
          m.rotation.y += 0.002;
          m.position.y += Math.sin(t + i) * 0.0015;
        });
        camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.04;
        camera.position.y += (-mouse.y * 0.4 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
      },
      dispose: () => {
        meshes.forEach((m) => {
          m.geometry.dispose();
          (m.material as THREE.Material).dispose();
        });
      },
    };
  }, [dark]);
  return <div ref={ref} className="absolute inset-0" style={{ filter: "blur(2px)" }} />;
}

/* ---------------- 5. Noisy blob ---------------- */
function Blob({ dark }: { dark: boolean }) {
  const ref = useThree((scene, camera) => {
    const geo = new THREE.IcosahedronGeometry(2.4, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: dark ? 0x8b5cf6 : 0x6366f1,
      transparent: true,
      opacity: 0.7,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const base = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      base[i * 3] = pos.getX(i);
      base[i * 3 + 1] = pos.getY(i);
      base[i * 3 + 2] = pos.getZ(i);
    }
    camera.position.z = 7;
    return {
      tick: (t) => {
        for (let i = 0; i < pos.count; i++) {
          const x = base[i * 3];
          const y = base[i * 3 + 1];
          const z = base[i * 3 + 2];
          const n = Math.sin(x * 1.2 + t) * 0.15 + Math.cos(y * 1.3 + t * 0.8) * 0.12;
          pos.setXYZ(i, x + x * n * 0.2, y + y * n * 0.2, z + z * n * 0.2);
        }
        pos.needsUpdate = true;
        mesh.rotation.y += 0.0025;
        mesh.rotation.x += 0.001;
      },
      dispose: () => {
        geo.dispose();
        mat.dispose();
      },
    };
  }, [dark]);
  return <div ref={ref} className="absolute inset-0" style={{ filter: "blur(28px)" }} />;
}

/* ---------------- 6. Dotted globe ---------------- */
function Globe({ dark }: { dark: boolean }) {
  const ref = useThree((scene, camera, _r, mouse) => {
    const r = 2.4;
    const count = 1400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: dark ? 0xb4c5ff : 0x6366f1,
      size: 0.04,
      transparent: true,
      opacity: 0.85,
    });
    const globe = new THREE.Points(geo, mat);
    scene.add(globe);
    return {
      tick: () => {
        globe.rotation.y += 0.0025;
        globe.rotation.x += (mouse.y * 0.2 - globe.rotation.x) * 0.04;
      },
      dispose: () => {
        geo.dispose();
        mat.dispose();
      },
    };
  }, [dark]);
  return <div ref={ref} className="absolute inset-0" />;
}

/* ---------------- 7. Text orbit ---------------- */
function TextOrbit({ dark }: { dark: boolean }) {
  const words = ["RFP", "Compliance", "Win", "Draft", "Score", "AI", "Pipeline", "Bid"];
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: 900 }}>
      {words.map((w, i) => (
        <motion.div
          key={w}
          className="absolute select-none"
          style={{
            left: `${10 + ((i * 11) % 80)}%`,
            top: `${15 + ((i * 17) % 60)}%`,
            color: dark ? "rgba(180,197,255,0.35)" : "rgba(99,102,241,0.25)",
            fontSize: 16 + (i % 3) * 10,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
          animate={{
            z: [0, 80, 0, -60, 0],
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 10, 0, 0],
            opacity: [0.4, 0.9, 0.5, 0.7, 0.4],
          }}
          transition={{
            duration: 14 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {w}
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- 8. Gradient mesh (CSS) ---------------- */
function GradientMesh({ dark }: { dark: boolean }) {
  const palette = dark
    ? ["#6366f1", "#a78bfa", "#38bdf8", "#f472b6"]
    : ["#4f46e5", "#8b5cf6", "#06b6d4", "#ec4899"];
  return (
    <div className="absolute inset-0 overflow-hidden">
      {palette.map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: "55vw",
            height: "55vw",
            left: `${[10, 55, 30, 65][i]}%`,
            top: `${[-10, 5, 40, 30][i]}%`,
            background: `radial-gradient(circle, ${c}55, transparent 60%)`,
            filter: "blur(80px)",
            mixBlendMode: dark ? "screen" : "multiply",
          }}
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: 22 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
