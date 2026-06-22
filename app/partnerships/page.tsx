"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Navbar from "../components/landingPage/Navbar";
import Footer from "../components/landingPage/Footer";
import {
  Play, Users, Globe, BookOpen, Shield, TrendingUp,
  CheckCircle, ArrowRight, Mail, Star, Heart, Video,
  Zap, Award, MessageCircle, ChevronRight,
} from "lucide-react";

// ── Animation helpers ──────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────

const stats = [
  { value: "10K+", label: "Believers on Breed" },
  { value: "50+", label: "Active Preachers" },
  { value: "95%", label: "Weekly Retention Rate" },
  { value: "12+", label: "Countries Reached" },
];

const platformBenefits = [
  {
    icon: Video,
    title: "Dedicated Video Hosting",
    body: "Every edition of 100 Days of Discipleship gets a structured, searchable course home — not buried in a YouTube feed or lost in a WhatsApp group.",
  },
  {
    icon: Users,
    title: "Built-In Discipleship Community",
    body: "Learners complete lessons, discuss chapters, and hold each other accountable — all within the same platform. Community is core, not an add-on.",
  },
  {
    icon: BookOpen,
    title: "Structured Learning Journeys",
    body: "Each edition becomes a navigable course with chapters, lessons, and progress tracking — so disciples can go at their pace and pick up where they left off.",
  },
  {
    icon: TrendingUp,
    title: "Deep Analytics",
    body: "Your team sees exactly how many believers completed each lesson, where they dropped off, and which content drives the deepest engagement.",
  },
  {
    icon: Shield,
    title: "Exclusive Access Control",
    body: "You decide who sees what. Content can be gated to enrolled believers, creating intentional discipleship cohorts rather than passive viewership.",
  },
  {
    icon: Globe,
    title: "Global Distribution",
    body: "Breed is built for the diaspora and the global church. Believers in Lagos, London, and Houston are all on the same platform, in the same community.",
  },
];

const proposalTerms = [
  "Full editorial control — your team approves all content presentation before publishing",
  "Co-branded experience: '100 Days of Discipleship × Breed' within the platform",
  "Detailed quarterly impact reports: completions, retention, geographic reach",
  "Dedicated support contact for your ministry team",
  "Revenue sharing on any premium cohorts or future editions you choose to monetise",
  "Zero cost to get started — Breed covers all hosting, streaming, and infrastructure",
];

const whyNow = [
  {
    icon: Zap,
    title: "The discipleship window is closing",
    body: "Short-form content is training a generation to scroll, not sit. 100 Days of Discipleship is one of the few programmes proven to hold attention for an extended season — Breed is built to protect that.",
  },
  {
    icon: Heart,
    title: "Your content deserves permanence",
    body: "Previous editions of 100 Days live in scattered drives and fading group chats. Archiving them on Breed makes them evergreen — a disciple joining today can start from Edition 1.",
  },
  {
    icon: Award,
    title: "We share your theology of depth",
    body: "Breed exists because we believe casual Christianity is not enough. We're not building an entertainment app — we're building a formation tool. That's the same conviction behind 100 Days.",
  },
];

const testimonialFaith = {
  quote: "The great commission was never just about converts. It was about disciples who disciple. Every tool we build on Breed exists to serve that vision.",
  author: "Clinton Adabanya",
  role: "Founder, Breed",
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PartnershipsPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#F7EDFE] overflow-hidden">

        {/* ── HERO ───────────────────────────────────────────────────────────── */}
        <section
          className="relative flex flex-col justify-center items-center text-center min-h-screen px-4 pt-32 pb-20 bg-cover bg-center"
          style={{ backgroundImage: "url('/partnerWithUs.jpg')" }}
        >
          <div className="absolute inset-0 bg-[#180426CC]" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#E7C8FF] text-[#330750] text-xs md:text-sm font-semibold px-5 py-2 rounded-full mb-8"
            >
              <Star size={14} />
              A Proposal for Kingdom Partnership
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-white text-[36px] md:text-[52px] lg:text-[64px] font-bold leading-tight mb-6"
            >
              Bringing{" "}
              <span className="text-[#D49CFD]">100 Days of Discipleship</span>
              {" "}to Every Believer, Everywhere
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white/80 text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              A formal proposal to Apostle Emmanuel Iren and the Citizen Church team
              for an exclusive content partnership with Breed — the discipleship
              platform built for the serious believer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="mailto:hello@joinbreed.com?subject=100 Days of Discipleship Partnership Inquiry"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold rounded-full hover:opacity-90 hover:scale-105 transition-all"
              >
                <Mail size={18} /> Reach Out to Us
              </a>
              <a
                href="#proposal"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transition-all"
              >
                Read the Proposal <ChevronRight size={18} />
              </a>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-white/40 text-xs tracking-widest uppercase">Scroll to read</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent"
            />
          </motion.div>
        </section>

        {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
        <section className="bg-[#180426] py-12 px-4">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp}>
                <p className="text-[#D49CFD] text-3xl md:text-4xl font-bold mb-1">{s.value}</p>
                <p className="text-white/60 text-sm">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── WHO WE ARE ────────────────────────────────────────────────────── */}
        <section className="py-24 px-4 max-w-5xl mx-auto" id="proposal">
          <Reveal className="text-center mb-16">
            <span className="inline-block bg-[#E7C8FF] text-[#330750] text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              About Breed
            </span>
            <h2 className="text-[#180426] text-3xl md:text-4xl font-bold mb-4">
              Built for the Disciple, Not the Casual Scroller
            </h2>
            <p className="text-[#60666B] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Breed is a discipleship platform purpose-built for believers who take
              their faith seriously. We combine structured courses, community
              accountability, daily devotionals, and live ministry — in one home.
            </p>
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: BookOpen,
                title: "Structured Courses",
                body: "Preachers publish full discipleship courses with chapters, lessons, quizzes, and progress tracking.",
              },
              {
                icon: MessageCircle,
                title: "Accountability Communities",
                body: "Every course has a built-in community where believers process what they're learning together.",
              },
              {
                icon: Play,
                title: "Video-First Ministry",
                body: "Sermon series, teachings, and devotional content delivered in a distraction-free, faith-focused environment.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 shadow-[0px_1px_3px_0px_#1018281A] border border-[#F2E8FC]"
              >
                <div className="w-10 h-10 rounded-full bg-[#F5EBFF] flex items-center justify-center mb-4">
                  <item.icon size={20} color="#870BD6" />
                </div>
                <h3 className="font-bold text-[#180426] mb-2">{item.title}</h3>
                <p className="text-[#60666B] text-sm leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── THE OPPORTUNITY ───────────────────────────────────────────────── */}
        <section className="bg-white py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center mb-16">
              <span className="inline-block bg-[#E7C8FF] text-[#330750] text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                The Opportunity
              </span>
              <h2 className="text-[#180426] text-3xl md:text-4xl font-bold mb-4">
                100 Days of Discipleship Has Already Proven Its Power
              </h2>
              <p className="text-[#60666B] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Thousands of believers across the globe have been transformed by
                the 100 Days of Discipleship programme. The only thing missing is
                a permanent, structured, accessible home for every edition — past
                and future.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <Reveal>
                <div className="space-y-5">
                  {[
                    "Previous editions exist in fragmented WhatsApp groups, Google Drives, and YouTube playlists — with no single, organised home",
                    "Believers who discovered the programme late have no structured way to begin from Edition 1",
                    "There's no platform tracking how many people complete each day, which teachings drive the deepest transformation",
                    "Content this valuable deserves infrastructure that matches its impact",
                  ].map((point, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-[#FEF3F2] border border-[#FECDCA] flex items-center justify-center mt-0.5">
                        <span className="text-[#B42318] text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-[#60666B] text-sm leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal>
                <div className="bg-gradient-to-br from-[#F5EBFF] to-[#ECD9FD] rounded-2xl p-8 border border-[#D49CFD]/30">
                  <h3 className="text-[#180426] font-bold text-xl mb-3">What Breed Solves</h3>
                  <p className="text-[#60666B] text-sm leading-relaxed mb-5">
                    Every edition becomes a structured, searchable, completable course.
                    New believers start from Edition 1. Returning believers continue
                    where they left off. Your team sees the real impact in real time.
                  </p>
                  <div className="flex items-center gap-3 bg-white rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-[#ECFDF3] flex items-center justify-center shrink-0">
                      <TrendingUp size={18} color="#067647" />
                    </div>
                    <div>
                      <p className="text-[#180426] text-sm font-semibold">From scattered to structured</p>
                      <p className="text-[#60666B] text-xs">Every edition archived, organised, and alive</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── PLATFORM BENEFITS ─────────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-[#F7EDFE]">
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center mb-16">
              <span className="inline-block bg-[#E7C8FF] text-[#330750] text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                What Breed Offers
              </span>
              <h2 className="text-[#180426] text-3xl md:text-4xl font-bold mb-4">
                Everything Your Content Deserves
              </h2>
              <p className="text-[#60666B] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Breed isn't just a video host. It's a complete discipleship
                infrastructure — built to honour the depth of what you've created.
              </p>
            </Reveal>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {platformBenefits.map((b) => (
                <motion.div
                  key={b.title}
                  variants={fadeUp}
                  className="bg-white rounded-2xl p-6 border border-[#F2E8FC] shadow-[0px_1px_3px_0px_#1018281A] hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F5EBFF] flex items-center justify-center mb-4">
                    <b.icon size={20} color="#870BD6" />
                  </div>
                  <h3 className="font-bold text-[#180426] mb-2">{b.title}</h3>
                  <p className="text-[#60666B] text-sm leading-relaxed">{b.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── WHY NOW ───────────────────────────────────────────────────────── */}
        <section className="bg-white py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center mb-16">
              <span className="inline-block bg-[#E7C8FF] text-[#330750] text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                Why Now
              </span>
              <h2 className="text-[#180426] text-3xl md:text-4xl font-bold mb-4">
                The Church Needs This Infrastructure Today
              </h2>
            </Reveal>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {whyNow.map((item) => (
                <motion.div key={item.title} variants={fadeUp} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A967F1] to-[#5B26B1] flex items-center justify-center mx-auto mb-5 shadow-lg">
                    <item.icon size={24} color="white" />
                  </div>
                  <h3 className="font-bold text-[#180426] text-lg mb-3">{item.title}</h3>
                  <p className="text-[#60666B] text-sm leading-relaxed">{item.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── THE PROPOSAL ──────────────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-[#180426]">
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center mb-16">
              <span className="inline-block bg-[#E7C8FF]/20 border border-[#D49CFD]/30 text-[#D49CFD] text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                The Formal Proposal
              </span>
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
                What We're Proposing
              </h2>
              <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                A simple, fair, and fully transparent partnership — with your
                team maintaining complete control over your content.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Reveal className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#D49CFD]/20 flex items-center justify-center text-[#D49CFD] text-sm font-bold">1</span>
                  Exclusive Content Licensing
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  We request a licence to host previous editions of 100 Days of
                  Discipleship exclusively on Breed. Content remains entirely
                  yours — we are stewards, not owners.
                </p>
                <ul className="space-y-3">
                  {["All editions from Edition 1 to present", "Video, audio, and study notes (where available)", "Organised by edition, day, and topic"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-white/60 text-sm">
                      <CheckCircle size={15} className="text-[#D49CFD] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#D49CFD]/20 flex items-center justify-center text-[#D49CFD] text-sm font-bold">2</span>
                  Future Edition Integration
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Each new edition of 100 Days is published simultaneously (or
                  exclusively, if preferred) on Breed, with Breed believers
                  participating as a live cohort — completing each day together.
                </p>
                <ul className="space-y-3">
                  {["Real-time cohort participation", "Daily push notifications to enrolled believers", "Live discussion threads for each day's content"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-white/60 text-sm">
                      <CheckCircle size={15} className="text-[#D49CFD] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal className="bg-gradient-to-br from-[#A967F1]/20 to-[#5B26B1]/20 border border-[#D49CFD]/20 rounded-2xl p-8">
              <h3 className="text-white font-bold text-xl mb-6">Partnership Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proposalTerms.map((term) => (
                  <div key={term} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-[#D49CFD] shrink-0 mt-0.5" />
                    <p className="text-white/70 text-sm leading-relaxed">{term}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FOUNDER QUOTE ─────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-gradient-to-br from-[#F5EBFF] to-[#ECD9FD]">
          <Reveal className="max-w-3xl mx-auto text-center">
            <div className="text-5xl text-[#D49CFD] font-serif mb-6 leading-none">"</div>
            <p className="text-[#180426] text-xl md:text-2xl font-medium leading-relaxed mb-8 italic">
              {testimonialFaith.quote}
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A967F1] to-[#5B26B1] flex items-center justify-center text-white font-bold text-sm">
                CA
              </div>
              <div className="text-left">
                <p className="font-semibold text-[#180426] text-sm">{testimonialFaith.author}</p>
                <p className="text-[#60666B] text-xs">{testimonialFaith.role}</p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── ALIGNMENT SECTION ─────────────────────────────────────────────── */}
        <section className="bg-white py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center mb-16">
              <span className="inline-block bg-[#E7C8FF] text-[#330750] text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
                Shared Mission
              </span>
              <h2 className="text-[#180426] text-3xl md:text-4xl font-bold mb-4">
                We Were Built for the Same Thing
              </h2>
              <p className="text-[#60666B] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                100 Days of Discipleship and Breed share the same conviction:
                transformation requires more than inspiration — it requires
                structure, community, and sustained commitment.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Reveal className="bg-[#F7EDFE] rounded-2xl p-8">
                <h3 className="font-bold text-[#180426] text-lg mb-4">100 Days of Discipleship</h3>
                <ul className="space-y-4">
                  {[
                    "100-day intentional commitment to formation",
                    "Daily teaching that demands active engagement",
                    "Proven to build habits that outlast the programme",
                    "Trusted by thousands across Nigeria and the diaspora",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[#60666B]">
                      <CheckCircle size={16} className="text-[#870BD6] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal className="bg-[#F7EDFE] rounded-2xl p-8">
                <h3 className="font-bold text-[#180426] text-lg mb-4">Breed</h3>
                <ul className="space-y-4">
                  {[
                    "Platform designed for sustained spiritual growth",
                    "Community accountability built into every course",
                    "Progress tracking that keeps believers consistent",
                    "Zero entertainment — 100% formation-focused",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[#60666B]">
                      <CheckCircle size={16} className="text-[#870BD6] shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="relative py-28 px-4 overflow-hidden bg-gradient-to-b from-[#A967F1] to-[#5B26B1]">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-white"
                style={{
                  width: `${(i + 1) * 120}px`,
                  height: `${(i + 1) * 120}px`,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>

          <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-white text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Let's Build the Infrastructure<br />Discipleship Deserves
            </h2>
            <p className="text-white/80 text-base md:text-xl mb-10 leading-relaxed">
              We'd love to begin a conversation with Apostle Emmanuel Iren's team.
              Whether a call, a meeting, or an email — we're ready when you are.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@joinbreed.com?subject=100 Days of Discipleship × Breed Partnership&body=Hi Clinton,%0A%0AWe're reaching out regarding the partnership proposal for 100 Days of Discipleship on Breed.%0A%0A"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#5B26B1] font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all"
              >
                <Mail size={18} /> Email Us Directly
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transition-all"
              >
                Contact Page <ArrowRight size={18} />
              </Link>
            </div>
            <p className="text-white/50 text-sm mt-8">
              hello@joinbreed.com · We typically respond within 24 hours
            </p>
          </Reveal>
        </section>

      </div>

      <Footer />
    </>
  );
}
