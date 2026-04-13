"use client";

import { motion } from "framer-motion";

interface Props {
  active: boolean;
  label?: string;
  progress?: number; // 0-100
}

export function ResearchAnimation({
  active,
  label = "Araştırma yapılıyor…",
  progress = 0,
}: Props) {
  return (
    <div className="relative flex items-center justify-center py-10">
      <div className="relative h-60 w-60">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-cyan-400/20"
          animate={
            active
              ? { rotate: 360, scale: [1, 1.05, 1] }
              : { rotate: 0, scale: 1 }
          }
          transition={{
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute inset-6 rounded-full border border-violet-400/30"
          animate={active ? { rotate: -360 } : { rotate: 0 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
        {/* Glow */}
        <motion.div
          className="absolute inset-12 rounded-full bg-gradient-to-br from-cyan-500/30 via-violet-500/30 to-fuchsia-500/30 blur-2xl"
          animate={
            active
              ? { opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.1, 0.9] }
              : { opacity: 0.2, scale: 1 }
          }
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-3xl shadow-[0_0_60px_rgba(139,92,246,0.5)]"
            animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            ✨
          </motion.div>
        </div>

        {/* Orbiting dots */}
        {active &&
          [0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-cyan-300"
              style={{ marginLeft: -4, marginTop: -4 }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.6,
              }}
            >
              <div
                style={{
                  transform: `translateX(${90 + i * 8}px)`,
                }}
                className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
              />
            </motion.div>
          ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 text-center">
        <p className="text-sm font-mono uppercase tracking-[0.2em] text-cyan-200/80">
          {label}
        </p>
        {progress > 0 && (
          <div className="mx-auto mt-2 h-1 w-56 overflow-hidden rounded-full bg-white/[0.05]">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-violet-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
