"use client";

import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

type HeroCourse = { id: number; title: string; imageUrl?: string | null };

function TunnelCard({ course, index, progress }: { course: HeroCourse; index: number; progress: MotionValue<number> }) {
  const angle = index * 137.5 * Math.PI / 180;
  const z = useTransform(progress, [0, 1], [-450 - index * 90, 350 - index * 90]);
  const opacity = useTransform(progress, [0, 0.35], [0, 1]);
  const transform = useTransform(z, (value) => `translate3d(-50%, -50%, ${value}px) rotate(${index % 2 ? -8 : 8}deg)`);
  return (
    <motion.div aria-hidden="true" className="absolute aspect-[4/5] w-24 overflow-hidden rounded-lg border border-[#e6ebef] bg-white sm:w-40 lg:w-52" style={{ left: `${50 + Math.cos(angle) * (34 + index % 3 * 3)}%`, top: `${50 + Math.sin(angle) * (32 + index % 2 * 5)}%`, transform, opacity }}>
      {/* Course images are decorative here; course details are listed below. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={course.imageUrl || "/bg-hero.jpg"} alt="" className="h-full w-full object-cover" />
      <span className="absolute inset-x-0 bottom-0 bg-white/95 px-3 py-2 text-xs font-medium text-[#003049] sm:text-sm">{course.title}</span>
    </motion.div>
  );
}

export default function PerspectiveTunnelHero({ courses }: { courses: HeroCourse[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useMotionValue(0);
  const textScale = useTransform(progress, [0, 1], [0.65, 1.12]);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const returning = useRef(false);

  useEffect(() => {
    progress.set(0);
    animation.current = animate(progress, 1, { duration: 2.4, ease: "easeInOut" });
    return () => animation.current?.stop();
  }, [progress]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroVisible = (sectionRef.current?.getBoundingClientRect().bottom ?? 0) > 0;
      if (!returning.current && scrollY > lastScrollY && heroVisible) {
        returning.current = true;
        animation.current?.stop();
        animation.current = animate(progress, 0, {
          duration: 1.6,
          ease: "easeInOut",
        });
      } else if (returning.current && scrollY < lastScrollY && heroVisible) {
        returning.current = false;
        animation.current?.stop();
        animation.current = animate(progress, 1, { duration: 2.4, ease: "easeInOut" });
      }
      lastScrollY = scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [progress]);

  return (
    <section ref={sectionRef} className="relative">
    <div className="relative isolate flex h-[clamp(460px,70svh,680px)] items-center justify-center overflow-hidden bg-[#f6f8fa] px-6 py-24 text-[#003049]" style={{ perspective: "1200px" }}>
      <div className="pointer-events-none absolute inset-0 z-10" style={{ transformStyle: "preserve-3d" }}>
        {courses.map((course, index) => <TunnelCard key={course.id} course={course} index={index} progress={progress} />)}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[35%] bg-gradient-to-b from-[#f6f8fa]/0 to-white" />
      <motion.div style={{ scale: textScale }} className="pointer-events-none relative mx-auto flex max-w-3xl flex-col items-center px-5 py-10 text-center sm:px-12">
        <p className="mb-5 text-xs font-semibold tracking-[0.24em] text-[#b35900] sm:text-sm">E-TRAINING · LEARNING FOR THE FUTURE</p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">พลิกโฉมการเรียนรู้ <br />สู่โลกดิจิทัล</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#4a5e6f] sm:text-xl">แพลตฟอร์มที่จะช่วยพัฒนาทักษะของคุณให้พร้อมสำหรับอนาคต</p>
      </motion.div>
    </div>
    </section>
  );
}
