"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen, Users, Heart, Mic2, GraduationCap, Shield,
  TrendingUp, Globe, Zap, ChevronRight, Mail, ArrowRight,
  CheckCircle, Play, Star, Target, Layers, Sparkles,
} from "lucide-react";
import Navbar from "@/app/components/landingPage/Navbar";
import Footer from "@/app/components/landingPage/Footer";

// ── Shared animation variants ──────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────

function Badge({ children, color = "purple" }: { children: React.ReactNode; color?: "purple" | "blue" | "green" | "pink" }) {
  const colors = {
    purple: "bg-[#E7C8FF] border-[#6A0BA9] text-[#330750]",
    blue:   "bg-[#C8DBFF] border-[#34399C] text-[#1e2266]",
    green:  "bg-[#B4F6D5] border-[#067647] text-[#067647]",
    pink:   "bg-[#F3C4DD] border-[#C83785] text-[#7a1a4a]",
  };
  return (
    <motion.div variants={fadeUp} className="inline-block mb-5">
      <span className={`border rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest ${colors[color]}`}>
        {children}
      </span>
    </motion.div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({ value, label, sub, icon: Icon, accent }: {
  value: string; label: string; sub?: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <motion.div variants={fadeUp}
      className="bg-white rounded-[24px] p-7 border border-[#E7C8FF] shadow-sm hover:shadow-lg transition-shadow duration-300 group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${accent}`}>
        <Icon size={22} className="text-white" />
      </div>
      <p className="text-3xl xl:text-4xl font-bold text-[#180426] font-[family-name:var(--font-almarai)] leading-none mb-1">{value}</p>
      <p className="text-sm font-semibold text-[#180426] mt-1">{label}</p>
      {sub && <p className="text-xs text-[#60666B] mt-1 leading-relaxed">{sub}</p>}
    </motion.div>
  );
}

// ── Feature Pill ──────────────────────────────────────────────────────────

function FeaturePill({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: string }) {
  return (
    <motion.div variants={fadeUp}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border ${color}`}>
      <Icon size={15} />
      {label}
    </motion.div>
  );
}

// ── Revenue Card ──────────────────────────────────────────────────────────

function RevenueCard({ title, desc, tag, gradient }: {
  title: string; desc: string; tag: string; gradient: string;
}) {
  return (
    <motion.div variants={fadeUp}
      className={`rounded-[24px] p-6 text-white ${gradient} relative overflow-hidden`}>
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-8 w-36 h-36 rounded-full bg-white/5" />
      <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4">
        {tag}
      </span>
      <h3 className="text-lg font-bold mb-2 font-[family-name:var(--font-almarai)]">{title}</h3>
      <p className="text-sm leading-relaxed text-white/80">{desc}</p>
    </motion.div>
  );
}

// ── Why Now Card ──────────────────────────────────────────────────────────

function WhyNowCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <motion.div variants={fadeUp}
      className="flex gap-4 group cursor-default">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#A967F1] to-[#5B26B1] flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <h4 className="font-bold text-[#180426] mb-1 font-[family-name:var(--font-almarai)]">{title}</h4>
        <p className="text-sm text-[#4E5255] leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

// ── Team Card ─────────────────────────────────────────────────────────────

function TeamCard({ name, role, bio, img }: { name: string; role: string; bio: string; img?: string }) {
  return (
    <motion.div variants={fadeUp}
      className="bg-white rounded-[24px] p-6 border border-[#E7C8FF] shadow-sm hover:shadow-lg transition-all duration-300 text-center">
      <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] flex items-center justify-center overflow-hidden">
        {img
          ? <Image src={img} alt={name} width={80} height={80} className="w-full h-full object-cover" />
          : <span className="text-2xl font-bold text-white font-[family-name:var(--font-almarai)]">{name.charAt(0)}</span>
        }
      </div>
      <h3 className="font-bold text-[#180426] font-[family-name:var(--font-almarai)]">{name}</h3>
      <p className="text-xs text-[#870BD6] font-semibold uppercase tracking-wider mt-1 mb-3">{role}</p>
      <p className="text-sm text-[#4E5255] leading-relaxed">{bio}</p>
    </motion.div>
  );
}

// ── Problem Card ──────────────────────────────────────────────────────────

function ProblemCard({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <motion.div variants={fadeUp}
      className="bg-white/60 backdrop-blur-sm rounded-[24px] p-7 border border-[#E7C8FF] hover:border-[#A967F1] hover:shadow-xl transition-all duration-300 group">
      <span className="text-5xl font-[family-name:var(--font-almarai)] font-bold text-[#E7C8FF] group-hover:text-[#D8AAFF] transition-colors leading-none block mb-4">{num}</span>
      <h3 className="text-lg font-bold text-[#180426] font-[family-name:var(--font-almarai)] mb-3">{title}</h3>
      <p className="text-sm text-[#4E5255] leading-relaxed">{body}</p>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function InvestPage() {
  const [deckEmail, setDeckEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleDeckRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (deckEmail.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-[#F7EDFE] min-h-screen overflow-x-hidden">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* ─── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="relative pt-[140px] md:pt-[180px] pb-[100px] overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#E7C8FF]/60 to-[#F1DFFF]/30 blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-[#C8DBFF]/40 to-[#F7EDFE] blur-3xl pointer-events-none" />

        <div className="px-4 lg:px-[50px] xl:px-[96px] max-w-[1740px] mx-auto relative z-10">
          <Section>
            <div className="max-w-4xl mx-auto text-center">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-[#E7C8FF] border border-[#6A0BA9] rounded-full px-5 py-2 mb-8">
                <span className="w-2 h-2 rounded-full bg-[#870BD6] animate-pulse" />
                <span className="text-[#330750] text-xs font-bold uppercase tracking-widest">Seed Round · Now Open</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-[42px] md:text-[64px] xl:text-[78px] font-[family-name:var(--font-almarai)] font-bold text-[#180426] leading-[1.08] tracking-tight mb-6"
              >
                Where Faith Meets the{" "}
                <span className="bg-gradient-to-r from-[#A967F1] to-[#5B26B1] bg-clip-text text-transparent">
                  Future.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg md:text-xl text-[#4E5255] leading-relaxed max-w-2xl mx-auto mb-10"
              >
                Breed is building the world&apos;s first comprehensive digital discipleship platform —
                where 2.4 billion Christians grow in faith, find community, and encounter God every day.
                We&apos;re not building an app. We&apos;re building the spiritual infrastructure of a generation.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <a
                  href="#contact"
                  className="bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full px-8 py-4 font-bold text-base hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Request Investor Deck <ArrowRight size={16} />
                </a>
                <a
                  href="mailto:invest@joinbreed.com"
                  className="border-[1.5px] border-[#5B26B1] text-[#5B26B1] rounded-full px-8 py-4 font-bold text-base hover:shadow-lg hover:scale-105 transition-all duration-300 bg-white/80 flex items-center justify-center gap-2"
                >
                  Book a Call <ChevronRight size={16} />
                </a>
              </motion.div>

              {/* Trust strip */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#4E5255]">
                {["Faith × Technology", "Purpose-Built Platform", "Global Vision", "Early-Stage Investment"].map((t) => (
                  <span key={t} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-[#870BD6]" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>
          </Section>

          {/* Hero imagery */}
          <Section>
            <motion.div variants={fadeUp} className="mt-16 grid grid-cols-3 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
              {["/hero1.png", "/community1.png", "/breedApp.png", "/community2.png", "/hero3.png"].map((src, i) => (
                <div
                  key={i}
                  className={`rounded-[20px] overflow-hidden ${i === 2 ? "md:col-span-1 aspect-[3/4]" : "aspect-square"} ${i === 0 || i === 4 ? "hidden md:block" : ""}`}
                >
                  <Image src={src} alt="" width={300} height={300} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ─── 2. PROBLEM ────────────────────────────────────────────────────── */}
      <section className="py-[100px] bg-[#F4E3FE]">
        <div className="px-4 lg:px-[50px] xl:px-[96px] max-w-[1740px] mx-auto">
          <Section>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge>The Problem</Badge>
              <motion.h2 variants={fadeUp} className="text-[36px] md:text-[52px] font-[family-name:var(--font-almarai)] font-bold text-[#180426] leading-tight mb-5">
                Spiritual Growth Has No Digital Home
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[#4E5255] leading-relaxed">
                Two billion Christians are scattered across fragmented platforms with no unified experience built for their faith journey.
                The Church is the largest community on earth — yet it has no digital infrastructure worthy of its mission.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProblemCard
                num="01"
                title="The Fragmented Faith Life"
                body="The average Christian uses 4–6 different apps to manage their spiritual life — podcast apps for sermons, WhatsApp groups for community, YouTube for teaching, and notes apps for reflection. Nothing connects."
              />
              <ProblemCard
                num="02"
                title="Discipleship Without Infrastructure"
                body="The Great Commission — to make disciples of all nations — remains the Church's core mandate. But discipleship today is still fully analogue, dependent on who you happen to know in your local church."
              />
              <ProblemCard
                num="03"
                title="Creators Without a Platform"
                body="Thousands of gifted preachers, teachers, and ministry leaders are building their audiences on platforms that were never designed for faith content — and monetising through disconnected tools."
              />
            </div>

            <motion.div variants={fadeUp} className="mt-12 bg-white/70 backdrop-blur-sm rounded-[28px] p-8 border border-[#E7C8FF] max-w-3xl mx-auto text-center">
              <p className="text-xl md:text-2xl font-[family-name:var(--font-almarai)] font-bold text-[#180426] leading-snug">
                &ldquo;The Church invented community. But in 2025, there is still no
                <span className="bg-gradient-to-r from-[#A967F1] to-[#5B26B1] bg-clip-text text-transparent"> purpose-built digital home</span> for believers to grow together.&rdquo;
              </p>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ─── 3. SOLUTION ───────────────────────────────────────────────────── */}
      <section className="py-[100px] bg-[#F7EDFE]">
        <div className="px-4 lg:px-[50px] xl:px-[96px] max-w-[1740px] mx-auto">
          <Section>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge>The Solution</Badge>
              <motion.h2 variants={fadeUp} className="text-[36px] md:text-[52px] font-[family-name:var(--font-almarai)] font-bold text-[#180426] leading-tight mb-5">
                One Platform. Every Dimension of Faith.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[#4E5255] leading-relaxed">
                Breed unifies every element of the modern believer&apos;s spiritual life into a single,
                beautifully designed platform — accessible to every Christian, everywhere.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                {[
                  { icon: BookOpen, label: "Daily Devotionals", desc: "Curated scripture-based devotionals to anchor believers each morning.", color: "bg-[#34399C]" },
                  { icon: GraduationCap, label: "Faith Courses", desc: "Structured, video-led theological courses from verified preachers and teachers.", color: "bg-[#870BD6]" },
                  { icon: Users, label: "Communities", desc: "Purpose-built community spaces for connection, discussion, and accountability.", color: "bg-[#C83785]" },
                  { icon: Shield, label: "Discipleship", desc: "One-on-one and group discipleship infrastructure with goal tracking and mentoring.", color: "bg-[#5B26B1]" },
                  { icon: Heart, label: "Prayer Wall", desc: "A shared prayer ecosystem where believers intercede for each other in real time.", color: "bg-[#A967F1]" },
                  { icon: Mic2, label: "Creator Ecosystem", desc: "Full tools for preachers and teachers to build, publish, and monetise their ministry.", color: "bg-[#34399C]" },
                ].map(({ icon: Icon, label, desc, color }) => (
                  <motion.div key={label} variants={fadeUp}
                    className="flex items-start gap-4 bg-white rounded-[16px] p-5 border border-[#E7C8FF] hover:shadow-md hover:border-[#A967F1] transition-all duration-300 group">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-[#180426] text-sm">{label}</p>
                      <p className="text-xs text-[#60666B] mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div variants={fadeIn} className="relative">
                <div className="bg-gradient-to-b from-[#A967F1] to-[#5B26B1] rounded-[32px] p-1 shadow-2xl">
                  <div className="bg-[#F7EDFE] rounded-[28px] overflow-hidden">
                    <Image src="/breedApp.png" alt="Breed App" width={600} height={700} className="w-full object-cover" />
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-5 py-3 shadow-xl border border-[#E7C8FF]">
                  <p className="text-xs text-[#60666B]">Active Users</p>
                  <p className="text-xl font-bold text-[#870BD6] font-[family-name:var(--font-almarai)]">Growing Daily</p>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-5 py-3 shadow-xl border border-[#E7C8FF]">
                  <p className="text-xs text-[#60666B]">Platform</p>
                  <p className="text-sm font-bold text-[#180426]">iOS · Android · Web</p>
                </div>
              </motion.div>
            </div>
          </Section>
        </div>
      </section>

      {/* ─── 4. PRODUCT SHOWCASE ───────────────────────────────────────────── */}
      <section className="py-[100px] bg-[#180426] overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#A967F1]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="px-4 lg:px-[50px] xl:px-[96px] max-w-[1740px] mx-auto relative z-10">
          <Section>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge color="blue">The Product</Badge>
              <motion.h2 variants={fadeUp} className="text-[36px] md:text-[52px] font-[family-name:var(--font-almarai)] font-bold text-white leading-tight mb-5">
                Built for Depth.<br />Not Just Engagement.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-white/60 leading-relaxed">
                Every surface of Breed is designed to move believers from consumption to transformation.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {[
                { img: "/DailyEdification1.png", label: "Daily Devotionals", tag: "Believer" },
                { img: "/breedApp2.png",          label: "Community & Chat",   tag: "Social" },
                { img: "/DailyEdification2.png",  label: "Courses & Teaching", tag: "Growth" },
              ].map(({ img, label, tag }) => (
                <motion.div key={label} variants={fadeUp}
                  className="relative rounded-[24px] overflow-hidden aspect-[4/5] group">
                  <Image src={img} alt={label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#180426]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E7C8FF] bg-[#870BD6]/30 border border-[#870BD6]/50 px-3 py-1 rounded-full mb-2 inline-block">{tag}</span>
                    <p className="text-white font-bold font-[family-name:var(--font-almarai)] text-lg">{label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { img: "/Forum1.png",       label: "Prayer & Intercession Communities",  tag: "Prayer" },
                { img: "/discipleship.png", label: "Discipleship & Mentorship Tools",    tag: "Discipleship" },
              ].map(({ img, label, tag }) => (
                <motion.div key={label} variants={fadeUp}
                  className="relative rounded-[24px] overflow-hidden aspect-[16/7] group">
                  <Image src={img} alt={label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#180426]/70 to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#B4F6D5] bg-[#067647]/30 border border-[#067647]/50 px-3 py-1 rounded-full mb-2 inline-block">{tag}</span>
                    <p className="text-white font-bold font-[family-name:var(--font-almarai)] text-xl">{label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ─── 5. MARKET OPPORTUNITY ─────────────────────────────────────────── */}
      <section className="py-[100px] bg-[#F4E3FE]">
        <div className="px-4 lg:px-[50px] xl:px-[96px] max-w-[1740px] mx-auto">
          <Section>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge>The Market</Badge>
              <motion.h2 variants={fadeUp} className="text-[36px] md:text-[52px] font-[family-name:var(--font-almarai)] font-bold text-[#180426] leading-tight mb-5">
                A $180B+ Opportunity at the Intersection of Faith, Education & Community
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[#4E5255] leading-relaxed">
                Breed sits at the convergence of three of the fastest-growing digital markets — faith media,
                e-learning, and community platforms — with an addressable audience no competitor has meaningfully captured.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-12">
              <StatCard
                value="2.38B"
                label="Christians Worldwide"
                sub="The single largest religious community on earth, increasingly digital-first"
                icon={Globe}
                accent="bg-gradient-to-b from-[#A967F1] to-[#5B26B1]"
              />
              <StatCard
                value="$14B+"
                label="Faith Digital Media Market"
                sub="Growing at 8.4% CAGR as believers shift to on-demand spiritual content"
                icon={TrendingUp}
                accent="bg-[#34399C]"
              />
              <StatCard
                value="$279B"
                label="Global E-Learning by 2029"
                sub="Faith-based learning is one of the fastest-growing niches within online education"
                icon={GraduationCap}
                accent="bg-[#C83785]"
              />
              <StatCard
                value="$250B+"
                label="Creator Economy (2025)"
                sub="Ministry creators have no purpose-built platform — Breed captures this gap"
                icon={Sparkles}
                accent="bg-[#067647]"
              />
            </div>

            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { pct: "63%", text: "of 18–34 year old Christians use digital tools to support their faith life (Barna, 2023)" },
                { pct: "4×",  text: "faster growth in faith-based digital content vs. general religious media since 2020" },
                { pct: "0",   text: "purpose-built global platforms exist for the complete Christian discipleship journey — until now" },
              ].map(({ pct, text }) => (
                <div key={pct} className="bg-white rounded-[24px] p-7 border border-[#E7C8FF] text-center">
                  <p className="text-5xl font-bold text-[#870BD6] font-[family-name:var(--font-almarai)] mb-3">{pct}</p>
                  <p className="text-sm text-[#4E5255] leading-relaxed">{text}</p>
                </div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ─── 6. WHY NOW ────────────────────────────────────────────────────── */}
      <section className="py-[100px] bg-[#F7EDFE]">
        <div className="px-4 lg:px-[50px] xl:px-[96px] max-w-[1740px] mx-auto">
          <Section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge color="green">Why Now</Badge>
                <motion.h2 variants={fadeUp} className="text-[36px] md:text-[48px] font-[family-name:var(--font-almarai)] font-bold text-[#180426] leading-tight mb-5">
                  The Conditions for Breed Have Never Been More Favourable.
                </motion.h2>
                <motion.p variants={fadeUp} className="text-base text-[#4E5255] leading-relaxed mb-10">
                  Timing is everything in technology. Several powerful macro-trends have converged to make this
                  the perfect moment to build — and invest in — Breed.
                </motion.p>
                <div className="space-y-7">
                  <WhyNowCard icon={Zap} title="Post-Pandemic Digital Church Acceleration"
                    desc="COVID permanently shifted millions of believers online. Churches that resisted digital engagement now actively seek platforms to extend their reach." />
                  <WhyNowCard icon={Layers} title="The Creator Economy Is Maturing"
                    desc="A new generation of preachers and ministry leaders are building audiences online — and actively seeking monetisation infrastructure beyond Instagram and YouTube." />
                  <WhyNowCard icon={Globe} title="Mobile-First Faith Consumption"
                    desc="67% of global church attendance is now supplemented with digital content. The phone is the new pew." />
                  <WhyNowCard icon={Target} title="AI-Personalised Spiritual Growth"
                    desc="AI enables deeply personalised faith journeys — tailored devotionals, adaptive learning paths, and intelligent community matching at scale." />
                  <WhyNowCard icon={TrendingUp} title="Global South Church Explosion"
                    desc="The fastest-growing Christian communities are in Africa, Asia, and Latin America — mobile-native regions with no faith platform built for them." />
                </div>
              </div>
              <motion.div variants={fadeIn} className="relative hidden lg:block">
                <div className="rounded-[32px] overflow-hidden shadow-2xl">
                  <Image src="/ValueProposition.png" alt="Why Now" width={600} height={700} className="w-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#180426]/30 to-transparent rounded-[32px]" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur rounded-2xl p-5">
                  <p className="text-xs text-[#60666B] mb-1">The window is open.</p>
                  <p className="font-bold text-[#180426] font-[family-name:var(--font-almarai)]">First-mover advantage in a $14B+ market with zero incumbent platforms.</p>
                </div>
              </motion.div>
            </div>
          </Section>
        </div>
      </section>

      {/* ─── 7. BUSINESS MODEL ─────────────────────────────────────────────── */}
      <section className="py-[100px] bg-[#F4E3FE]">
        <div className="px-4 lg:px-[50px] xl:px-[96px] max-w-[1740px] mx-auto">
          <Section>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge color="pink">Business Model</Badge>
              <motion.h2 variants={fadeUp} className="text-[36px] md:text-[52px] font-[family-name:var(--font-almarai)] font-bold text-[#180426] leading-tight mb-5">
                Multiple Revenue Streams. One Ecosystem.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[#4E5255] leading-relaxed">
                Breed&apos;s model mirrors the most successful consumer platforms — free at entry, deeply valuable at every premium tier.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <RevenueCard
                tag="Core"
                title="Freemium Subscription"
                desc="Free tier with essential features. Breed Plus unlocks unlimited courses, premium communities, advanced discipleship tools, and ad-free devotionals."
                gradient="bg-gradient-to-br from-[#5B26B1] to-[#330750]"
              />
              <RevenueCard
                tag="Creator"
                title="Course Marketplace"
                desc="Preachers publish paid courses. Breed takes a platform fee on every sale. As the creator base grows, this becomes a high-margin, compounding revenue stream."
                gradient="bg-gradient-to-br from-[#C83785] to-[#7a1a4a]"
              />
              <RevenueCard
                tag="Creator"
                title="Ministry Creator Tools"
                desc="Verified teachers and ministries pay for advanced analytics, audience tools, scheduled content, and white-label community features."
                gradient="bg-gradient-to-br from-[#34399C] to-[#1a1d5e]"
              />
              <RevenueCard
                tag="Enterprise"
                title="Church & Ministry Licences"
                desc="Institutional licensing for churches and denominations to deploy Breed as their digital discipleship infrastructure — a high-ACV B2B channel."
                gradient="bg-gradient-to-br from-[#870BD6] to-[#5B26B1]"
              />
              <RevenueCard
                tag="Community"
                title="Community Monetisation"
                desc="Community leaders can charge for premium groups, paid events, and exclusive content — with Breed taking a platform share."
                gradient="bg-gradient-to-br from-[#067647] to-[#03331f]"
              />
              <RevenueCard
                tag="Future"
                title="Partnerships & Integrations"
                desc="Strategic partnerships with Bible publishers, Christian organisations, seminaries, and media networks unlock high-margin licensing and co-distribution revenue."
                gradient="bg-gradient-to-br from-[#B54708] to-[#5c2200]"
              />
            </div>
          </Section>
        </div>
      </section>

      {/* ─── 8. VISION ─────────────────────────────────────────────────────── */}
      <section className="py-[120px] bg-[#180426] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(135,11,214,0.25)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A967F1]/50 to-transparent" />

        <div className="px-4 lg:px-[50px] xl:px-[96px] max-w-[1740px] mx-auto relative z-10">
          <Section>
            <div className="max-w-4xl mx-auto text-center">
              <Badge>The Vision</Badge>
              <motion.h2 variants={fadeUp} className="text-[40px] md:text-[62px] xl:text-[72px] font-[family-name:var(--font-almarai)] font-bold text-white leading-[1.08] mb-8">
                Building the{" "}
                <span className="bg-gradient-to-r from-[#A967F1] to-[#E7C8FF] bg-clip-text text-transparent">
                  Spiritual OS
                </span>{" "}
                of the Global Church.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/60 leading-relaxed mb-10 max-w-3xl mx-auto">
                In 10 years, Breed will be the foundational infrastructure through which hundreds of millions
                of believers grow in faith, ministers impact nations, and the Church fulfils the Great Commission at scale.
                This isn&apos;t just an app. This is a civilisation-shaping mission.
              </motion.p>

              <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
                {[
                  { icon: "🌍", title: "Global Discipleship at Scale", desc: "Breed enables every believer on earth to access world-class discipleship — regardless of geography, language, or access to a local church." },
                  { icon: "⚡", title: "Empowering the Preachers of Tomorrow", desc: "A generation of digital-native ministers will build their entire ministry — audience, income, and impact — on Breed." },
                  { icon: "🏛️", title: "Infrastructure for the Church's Future", desc: "Denominations, seminaries, and global ministries will use Breed as the connective tissue for their digital discipleship strategy." },
                ].map(({ icon, title, desc }) => (
                  <motion.div key={title} variants={fadeUp}
                    className="bg-white/5 border border-white/10 rounded-[24px] p-7 text-left hover:bg-white/10 transition-colors duration-300">
                    <span className="text-3xl mb-4 block">{icon}</span>
                    <h3 className="font-bold text-white font-[family-name:var(--font-almarai)] mb-3">{title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.blockquote variants={fadeUp} className="border-l-4 border-[#A967F1] pl-6 text-left max-w-2xl mx-auto">
                <p className="text-lg text-white/80 italic leading-relaxed mb-2">
                  &ldquo;Go therefore and make disciples of all nations — teaching them to observe everything I have commanded you.&rdquo;
                </p>
                <cite className="text-sm text-[#A967F1] font-semibold">Matthew 28:19-20</cite>
              </motion.blockquote>
            </div>
          </Section>
        </div>
      </section>

      {/* ─── 9. TEAM ───────────────────────────────────────────────────────── */}
      <section className="py-[100px] bg-[#F7EDFE]">
        <div className="px-4 lg:px-[50px] xl:px-[96px] max-w-[1740px] mx-auto">
          <Section>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge>The Team</Badge>
              <motion.h2 variants={fadeUp} className="text-[36px] md:text-[52px] font-[family-name:var(--font-almarai)] font-bold text-[#180426] leading-tight mb-5">
                Builders Who Believe in the Mission.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[#4E5255] leading-relaxed">
                Breed is built by a team that lives the problem daily — believers who understand both the
                technological opportunity and the spiritual mission behind it.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <TeamCard
                name="Clinton Adabanya"
                role="Founder & CEO"
                bio="Visionary builder with a passion for building digital infrastructure for the global Church. Combines deep product thinking with a clear understanding of the mission."
                img="/bisola.jpg"
              />
              <TeamCard
                name="Product Team"
                role="Design & Engineering"
                bio="A team of mission-aligned engineers and designers building Breed with world-class technical standards and an uncompromising commitment to user experience."
              />
              <TeamCard
                name="Ministry Advisors"
                role="Spiritual & Strategic"
                bio="Seasoned ministers, theologians, and faith community leaders advising on content strategy, church partnerships, and global ministry expansion."
              />
            </div>

            <motion.div variants={fadeUp} className="mt-12 bg-white rounded-[24px] p-8 border border-[#E7C8FF] max-w-2xl mx-auto text-center">
              <Star className="w-8 h-8 text-[#870BD6] mx-auto mb-4" />
              <p className="font-bold text-[#180426] font-[family-name:var(--font-almarai)] text-lg mb-2">We&apos;re actively building our team.</p>
              <p className="text-sm text-[#4E5255]">
                We&apos;re looking for mission-aligned operators, engineers, and advisors to join us in this moment.
                If you believe in what we&apos;re building — let&apos;s talk.
              </p>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ─── 10. INVESTOR CTA ──────────────────────────────────────────────── */}
      <section id="contact" className="py-[120px] bg-gradient-to-b from-[#A967F1] to-[#330750] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.08)_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="px-4 lg:px-[50px] xl:px-[96px] max-w-[1740px] mx-auto relative z-10">
          <Section>
            <div className="max-w-3xl mx-auto text-center">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-5 py-2 mb-8">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-white/90 text-xs font-bold uppercase tracking-widest">Seed Round · Limited Allocation</span>
              </motion.div>

              <motion.h2 variants={fadeUp} className="text-[38px] md:text-[58px] font-[family-name:var(--font-almarai)] font-bold text-white leading-tight mb-6">
                Join Us at the Beginning of Something Historic.
              </motion.h2>

              <motion.p variants={fadeUp} className="text-lg text-white/70 leading-relaxed mb-12">
                Breed is at a pivotal moment. We have product, we have users, and we have a clear path to scale.
                We&apos;re looking for investors who don&apos;t just write cheques — but who believe in the mission and
                want to be part of something that will outlast all of us.
              </motion.p>

              {/* Deck request form */}
              <motion.div variants={fadeUp} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[28px] p-8 mb-8">
                {submitted ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-[#B4F6D5] mx-auto mb-4" />
                    <p className="text-white font-bold font-[family-name:var(--font-almarai)] text-xl mb-2">Thank you — we&apos;ll be in touch.</p>
                    <p className="text-white/60 text-sm">Expect the investor deck in your inbox within 24 hours.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-white font-bold text-lg mb-4">Request the Investor Deck</p>
                    <form onSubmit={handleDeckRequest} className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        required
                        value={deckEmail}
                        onChange={(e) => setDeckEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 bg-white/10 border border-white/30 rounded-full px-6 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 text-sm"
                      />
                      <button
                        type="submit"
                        className="bg-white text-[#5B26B1] font-bold rounded-full px-8 py-3.5 hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm whitespace-nowrap"
                      >
                        Send Me the Deck
                      </button>
                    </form>
                    <p className="text-white/40 text-xs mt-3">Your information is kept strictly confidential.</p>
                  </>
                )}
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:invest@joinbreed.com"
                  className="flex items-center gap-2 bg-white text-[#5B26B1] font-bold rounded-full px-8 py-4 hover:shadow-2xl hover:scale-105 transition-all duration-300 justify-center"
                >
                  <Mail size={16} /> invest@joinbreed.com
                </a>
                <a
                  href="https://cal.com/breed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border-[1.5px] border-white text-white font-bold rounded-full px-8 py-4 hover:bg-white/10 hover:scale-105 transition-all duration-300 justify-center"
                >
                  <Play size={16} /> Schedule a Meeting
                </a>
              </motion.div>

              <motion.p variants={fadeUp} className="text-white/40 text-sm mt-10 max-w-md mx-auto leading-relaxed">
                &ldquo;Two billion believers. Zero purpose-built platforms. One team with the conviction to change that.&rdquo;
              </motion.p>
            </div>
          </Section>
        </div>
      </section>

      <Footer />
    </div>
  );
}
