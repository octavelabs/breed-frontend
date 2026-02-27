'use client'

import { useState, useEffect, useRef } from "react";
import Footer from "../components/landingPage/Footer";
import Navbar from "../components/landingPage/Navbar";

const sections = [
  {
    id: "intro",
    title: "Information We Collect",
    content: `
    <p className='font-semibold mb-2'>a. Personal Information</p>
    <ul className="pl-8">
        <li className="list-disc">
          Full name
        </li>
        <li className="list-disc">
          Email address
        </li>
        <li className="list-disc">
          Profile photo (optional)
        </li>
        <li className="list-disc">
          Account login credentials
        </li>
        <li className="list-disc">
          Spiritual growth preferences (such as devotion habits or learning interests)
        </li>
      </ul>
      <p className="font-semibold">b. Usage Information</p>
      <ul className="pl-8">
        <li className="list-disc">
          Device type
        </li>
        <li className="list-disc">
          IP address
        </li>
        <li className="list-disc">Pages visited and features used </li>
        <li className="list-disc">Time spent on the platform </li>
      </ul>
      <p className="font-semibold">c. Community & Group Activity</p>
      <ul className="pl-8">
        <li className="list-disc">Group participation data</li>
        <li className="list-disc">
          Devotion streaks
        </li>
        <li className="list-disc">
          Attendance logs
        </li>
         <li className="list-disc">
          Progress tracking
        </li>
      </ul>`,
  },
  {
    id: "section1",
    title: "How We Use Your Information",
    content: `
    <p className='font-semibold'>We use your information to:</p>
     <ul className="pl-8">
        <li className="list-disc">Create and manage your account</li>
        <li className="list-disc">
          Personalize your discipleship experience
        </li>
        <li className="list-disc">
          Enable devotion scheduling and accountability tools
        </li>
         <li className="list-disc">
          Track growth progress and consistency
        </li>
         <li className="list-disc">
          Send important updates and notifications
        </li>
         <li className="list-disc">
          Improve platform features
        </li>
         <li className="list-disc">
          Maintain security and prevent misuse
        </li>
      </ul>
      <p>We do not sell your personal data.</p>
    `,
  },
  {
    id: "section2",
    title: "Sharing of Information",
    content: `
    <p className='font-semibold'>We may share limited information with:</p>
    <ul className="pl-8">
        <li className="list-disc">Trusted infrastructure providers (hosting, analytics, notifications)</li>
        <li className="list-disc">
          Group leaders or mentors you voluntarily connect with
        </li>
      </ul>
      <p>We only share what is necessary to operate Breed effectively.</p>
      <p>We may also disclose information if required by law.</p>`,
  },
  {
    id: "section3",
    title: "Cookies and Tracking",
    content: `
    <p>Breed uses cookies or similar technologies to:</p>
     <ul className="pl-8">
        <li className="list-disc">Keep you logged in</li>
        <li className="list-disc">
          Remember preferences
        </li>
        <li className="list-disc">
          Analyze usage trends
        </li>
      </ul>
      <p>You may disable cookies in your browser, though some features may not function properly.</p>`,
  },
   {
    id: "section4",
    title: "Data Retention",
    content: `
    <p>We retain your information while your account remains active.</p>
    <p>You may request account deletion at any time, after which your data will be permanently removed unless legally required otherwise.</p>
    `,
  },
   {
    id: "section5",
    title: "Security",
    content: `
    <p>We take reasonable steps to protect your data using modern security practices. However, no online system is completely secure.</p>
    `,
  },
   {
    id: "section6",
    title: "Children’s Privacy",
    content: `
    <p>Breed is intended for users aged 13 and above. We do not knowingly collect data from children under 13.</p>
    `,
  },
    {
    id: "section7",
    title: "Your Rights",
    content: `
    <p>You may request to:</p>
      <ul className="pl-8">
        <li className="list-disc">Access your data</li>
        <li className="list-disc">
          Correct inaccuracies
        </li>
        <li className="list-disc">
          Delete your account
        </li>
        <li>Withdraw consent</li>
      </ul>
      <p>Contact us to exercise these rights.</p>
    `,
  },
   {
    id: "section8",
    title: "Changes to This Policy",
    content: `
    <p>We may update this Privacy Policy occasionally. Continued use of Breed means you accept any changes.</p>
    `,
  },
  {
    id: "section9",
    title: "Contact",
    content: `
    <p>For privacy questions, contact:</p>
    <p>Breed Believers Network</p>
    <p>Email: support@joinbreed.com</p>
    `,
  },
];

export default function PrivacyPolicyPage() {
  const [activeId, setActiveId] = useState(sections[0].id);
  const [openMobile, setOpenMobile] = useState(sections[0].id);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lock scroll during transition
  useEffect(() => {
    if (isTransitioning) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isTransitioning]);

  const handleSectionChange = (sectionId: string | null) => {
    if (sectionId === null) return;
    setActiveId(sectionId);
    setIsTransitioning(true);

    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Unlock scroll after 600ms
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const activeSection = sections.find(s => s.id === activeId);

  return (
    <>
    <Navbar />
    <div className="bg-[#F7EDFE] pt-[100px] md:pt-[200px] ">
   <main className="w-[80%] mx-auto">
      <h1 className="text-[64px] leading-[72px] font-medium text-[#4E0A7C]">
         Privacy Policy
      </h1>
      <p className="text-[18px] font-medium text-[#180426] mt-[40px] mb-2">Breed Believers Network</p>
      <p className="text-[18px] font-medium text-[#180426]  mb-5">Last updated: February 21, 2026</p>
      
      <p>
        Breed Believers Network (“we,” “our,” or “us”) operates Breed, a Christian discipleship and spiritual growth platform designed to help believers grow in faith through devotional tools, discipleship groups, curated Christian content, accountability features, and structured learning experiences.
Your privacy matters to us. This Privacy Policy explains how we collect, use, store, and protect your information when you use Breed.
By accessing or using Breed, you agree to this Privacy Policy.

      </p>
      
      <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
        2. Information We Collect
      </h2>
      <p>When you create an account, we may collect:</p>
      <p className='font-semibold'>a. Personal Information</p>
      <ul className="pl-8">
        <li className="list-disc">
          Contact details: name, email address, phone number, location
          (city/country).
        </li>
        <li className="list-disc">
          Profile information: profession, sector, role, business details,
          interests, and goals.
        </li>
        <li className="list-disc">
          Membership details: membership tier, participation history,
          preferences.
        </li>
        <li className="list-disc">
          Application data: when you apply for grants, programs, sponsorship, or
          specific opportunities
        </li>
        <li className="list-disc">
          Communication content: messages you send to us or within structured
          community channels (circles, forms, feedback, surveys)
        </li>
      </ul>
      <p className="font-semibold">b. Information we collect automatically</p>
      <ul className="pl-8">
        <li className="list-disc">
          Device information: device type, operating system, browser type.
        </li>
        <li className="list-disc">
          Usage information: pages viewed, session duration, app features used,
          referring URLs
        </li>
        <li className="list-disc">Log data: IP address, access dates and times. </li>
      </ul>
      <p className="font-semibold">c. Information from third parties</p>
      <ul className="pl-8">
        <li className="list-disc">payment providers and processors;</li>
        <li className="list-disc">
          partners and platforms that host joint events or programs;
        </li>
        <li className="list-disc">
          social platforms (e.g. if you interact with our pages or connect via
          social login).{" "}
        </li>
      </ul>
      <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
        4. How We Use Your Information
      </h2>
      <p>We use your information to:</p>

      <ul className="pl-8">
        <li className="list-disc">
          provide and manage our services, including membership, events,
          programs, and the Zuri Circle App;
        </li>
        <li className="list-disc">
          create and maintain your account and member profile;{" "}
        </li>
        <li className="list-disc">
          communicate with you about updates, events, opportunities, and
          resources;{" "}
        </li>
        <li className="list-disc">
          analyse how our platforms and programs are used, so we can improve
          them;
        </li>
        <li className="list-disc">
          manage grants, demos, and selection processes fairly and
          transparently;
        </li>
        <li className="list-disc">
          comply with legal obligations and protect the rights, safety, and
          integrity of our members and platforms.
        </li>
      </ul>
      <p className="my-2">
        Where required by law, we rely on one or more legal bases to process
        your information, including
      </p>
      <ul className="pl-8">
        <li className="list-disc">your consent;</li>
        <li className="list-disc">
          performance of a contract with you (membership, program
          participation);{" "}
        </li>
        <li className="list-disc">
          our legitimate interests (for example, improving our services,
          protecting our community, or understanding our reach and impact);{" "}
        </li>
        <li className="list-disc">compliance with legal obligations.</li>
      </ul>
      <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
        5. How We Share Your Information
      </h2>
      <p>
        We do not sell your personal information.
      </p>
      <p className="my-2">We may share your data with:</p>

      <ul className="pl-8">
        <li className="list-disc">
          <span className="font-semibold">Service providers</span> who support
          our operations (such as payment processors, email services, hosting
          providers, and analytics tools), under appropriate confidentiality
          and data protection obligations.
        </li>
        <li className="list-disc">
          <span className="font-semibold">Partners and sponsors</span> where you
          participate in co-branded programs, events, or grants, and where
          sharing is necessary to run the initiative.
        </li>
        <li className="list-disc">
          <span className="font-semibold">Professional advisers</span>, such as
          legal or accounting advisers, where reasonably necessary.
        </li>
        <li className="list-disc">
          <span className="font-semibold">Authorities or regulators</span> where
          required by law or to protect our rights, safety, or the rights and
          safety of others.
        </li>
      </ul>

      <p className="my-2">
        Where we share data with partners for storytelling or reporting, we aim
        to use aggregated or anonymised information wherever possible.
      </p>

      <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
        6. International Transfers
      </h2>
      <p>
        Because Zuri Circle works with women and partners across several
        countries, your data may be transferred to and processed in countries
        other than your own.
      </p>
      <p className="my-2">
        Where we transfer personal data across borders, we take reasonable
        steps to ensure appropriate safeguards are in place, in line with
        applicable data protection laws.
      </p>

      <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
        7. Data Retention
      </h2>
      <p>
        We keep your personal data for as long as necessary to:
      </p>

      <ul className="pl-8">
        <li className="list-disc">
          Deliver the services you use;
        </li>
        <li className="list-disc">
          Fulfil the purposes described in this Policy;
        </li>
        <li className="list-disc">
          Comply with legal, accounting, or reporting obligations.
        </li>
      </ul>
            <p className="my-2">
        When data is no longer needed, we will securely delete it or anonymise it.
      </p>

      <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
        8. Security
      </h2>
      <p>
        We take reasonable technical and organisational measures to protect
        your information from unauthorised access, loss, misuse, or disclosure.
      </p>
      <p className="my-2">
        No system is completely secure. While we work to protect your data, we
        cannot guarantee absolute security.
      </p>

      <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
        9. Your Rights
      </h2>
      <p>
        Depending on your location and applicable law, you may have rights over
        your personal data, including the right to:
      </p>

      <ul className="pl-8">
        <li className="list-disc">
          Access the personal data we hold about you;
        </li>
        <li className="list-disc">
          Request correction of inaccurate or incomplete data;
        </li>
        <li className="list-disc">
          Request deletion of your data in certain circumstances;
        </li>
        <li className="list-disc">
          Object to or restrict certain types of processing;
        </li>
        <li className="list-disc">
          Withdraw consent where processing is based on consent;
        </li>
        <li className="list-disc">
          Opt out of marketing communications.
        </li>
      </ul>

      <p className="my-2">
        To exercise any of these rights, please contact us using the details
        below. We may request proof of identity before responding to your
        request.
      </p>

      <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
        10. Marketing Communications
      </h2>
      <p>
        We may send you updates about programs, events, or opportunities that we believe may be
relevant to you.
      </p>
      <p className="my-2">
        You can opt out of marketing emails at any time by using the “unsubscribe” link in the email
or by contacting us.
        Please note that even if you opt out of marketing, we may still send you essential service or
transactional messages (for example, information about your membership, programs you
have joined, or important changes to our terms).
      </p>
      <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
        11. Cookies & Similar Technologies
      </h2>
      <p>Our website and app may use cookies or similar technologies to:</p>
      <ul className="pl-8">
        <li className="list-disc">
          remember your preferences;
        </li>
        <li className="list-disc">
          improve performance;
        </li>
        <li className="list-disc">
          analyse usage and traffic patterns.
        </li>
      </ul>
      <p>You can typically adjust your browser or device settings to refuse cookies or to alert you
when cookies are being sent. However, some features of our platforms may not work
properly without cookies.</p>
<h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
        12. Children’s Privacy
      </h2>
      <p>Zuri Circle is not directed at children under 18, and we do not knowingly collect personal
data from anyone under 18.
If you believe we have collected information from a child, please contact us so that we can
review and, if appropriate, delete it.</p>
<h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
        13. Changes to This Policy
      </h2>
      <p>We may update this Privacy Policy from time to time.
When we do, we will update the “Last Updated” date at the top of this page and, where
appropriate, notify you via email or through our platforms.
Your continued use of our services after any changes means you accept the updated Policy.</p>
 <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
        14. Contact Us
      </h2>
      <p>For questions about these Terms, please contact:</p>
      <p className="mt-2">
        Email: <a href="mailto:legal@zuricircle.com">legal@zuricircle.com</a>
      </p>
    </main>
    </div>
    <Footer />
    </>
  );
}

//  <div className="min-h-screen bg-[#F7EFFF] px-4 py-10 ">
//       <div className="container mx-auto  pt-[100px] md:pt-[200px]">
//         <h1 className="text-[64px] leading-[72px] font-medium text-[#4E0A7C]">Privacy Policy</h1>
//         <p className="text-[18px] font-medium text-[#180426] mt-[40px] mb-5">Last Updated: 21st of February, 2026</p>
//         <p className="text-[#4E5255] text-[18px] border-b border-[#D2D9DF] pb-10">
// Breed Believers Network (“we,” “our,” or “us”) operates Breed, a Christian discipleship and spiritual growth platform designed to help believers grow in faith through devotional tools, discipleship groups, curated Christian content, accountability features, and structured learning experiences.
// Your privacy matters to us. This Privacy Policy explains how we collect, use, store, and protect your information when you use Breed.
// By accessing or using Breed, you agree to this Privacy Policy.
//         </p>
//         {/* Desktop Layout */}
//         <div className="hidden md:grid grid-cols-[240px_1fr] gap-10 mt-10">
//           <aside className="space-y-[36px]">
//             {sections.map(section => (
//               <button
//                 key={section.id}
//                 onClick={() => handleSectionChange(section.id)}
//                 className={`block w-full text-left text-sm font-medium px-2 pb-5 rounded transition ${
//                   activeId === section.id
//                     ? "text-purple-800 border-b border-[#D2D9DF]"
//                     : "text-purple-600 "
//                 }`}
//               >
//                 {section.title}
//               </button>
//             ))}
//           </aside>

//           <main className="text-sm text-purple-800 leading-relaxed space-y-6">
//             <h2 className="text-lg font-semibold">{activeSection?.title}</h2>
//             {activeSection?.content.includes('<') ? (
//               <div dangerouslySetInnerHTML={{ __html: activeSection.content }} />
//             ) : (
//               activeSection?.content.split("\n\n").map((p: string, i: number) => (
//                 <p key={i}>{p}</p>
//               ))
//             )}
//           </main>
//         </div>

//         {/* Mobile Accordion */}
//         <div className="md:hidden mt-8 space-y-4">
//           {sections.map(section => {
//             const isOpen = openMobile === section.id;
//             return (
//               <div key={section.id} className="border-b border-purple-300 pb-2">
//                 <button
//                   onClick={() =>
//                     setOpenMobile(isOpen ? '' : section.id)
//                   }
//                   className="w-full flex items-center justify-between text-left text-purple-800 font-medium"
//                 >
//                   {section.title}
//                   <span className="text-xl">{isOpen ? "−" : "+"}</span>
//                 </button>

//                 {isOpen && (
//                   <div className="mt-3 text-sm text-purple-700 leading-relaxed space-y-4">
//                     {section.content.includes('<') ? (
//                       <div dangerouslySetInnerHTML={{ __html: section.content }} />
//                     ) : (
//                       section.content.split("\n\n").map((p, i) => (
//                         <p key={i}>{p}</p>
//                       ))
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
