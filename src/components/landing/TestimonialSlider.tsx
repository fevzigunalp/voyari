"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Voyari, eşimle uzun zamandır hayalini kurduğumuz Toskana road trip'ini iki saatte planladı. Karavanımıza özel rota, mola ve şarap rotası dahil her detay yerli yerindeydi.",
    name: "Selin & Cem",
    role: "İstanbul → Toskana, Karavan",
    rating: 5,
  },
  {
    quote:
      "Çocuklarımızla Yunan adalarına gulet turu istedik. AI ekibi hem güvenli koyları hem çocuk dostu rotaları belirledi; mürettebatlı gulet önerisi mükemmeldi.",
    name: "Aslı & Ekrem",
    role: "Aile · Bodrum çıkışlı gulet",
    rating: 5,
  },
  {
    quote:
      "Solo backpacker olarak Japonya keşfimi planladım. Bütçe dashboard'u sayesinde her günü kontrol altında tutabildim. Lokal restoran önerileri inanılmazdı.",
    name: "Mert",
    role: "Solo · Tokyo / Kyoto",
    rating: 5,
  },
];

export function TestimonialSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % TESTIMONIALS.length),
      6500,
    );
    return () => clearInterval(id);
  }, []);

  const current = TESTIMONIALS[index];

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl md:text-5xl tracking-tight">
            Voyari ile <span className="text-gradient-gold">Tasarlananlar</span>
          </h2>
          <p className="mt-3 text-text-secondary">
            Erken kullanıcılarımızdan birkaç anı.
          </p>
        </div>

        <div className="relative glass rounded-3xl p-8 md:p-12 min-h-[280px] overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -top-10 -left-6 text-[#D4A853] opacity-15"
          >
            <Quote className="h-32 w-32" strokeWidth={1} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-[#E8C97A] fill-[#E8C97A]"
                  />
                ))}
              </div>
              <p className="font-display text-xl md:text-2xl leading-relaxed text-text-primary">
                &ldquo;{current.quote}&rdquo;
              </p>
              <div className="mt-6">
                <div className="text-sm font-semibold text-[#E8C97A]">
                  {current.name}
                </div>
                <div className="text-xs text-text-muted font-mono uppercase tracking-[0.18em] mt-1">
                  {current.role}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Tanıklık ${i + 1}`}
                onClick={() => setIndex(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 28 : 10,
                  background:
                    i === index
                      ? "linear-gradient(90deg,#D4A853,#F59E0B)"
                      : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
