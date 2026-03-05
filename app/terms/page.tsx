import Footer from "../components/landingPage/Footer";
import Navbar from "../components/landingPage/Navbar";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="bg-[#F7EDFE] pt-[100px] md:pt-[200px] ">
        <main className="w-[80%] mx-auto pb-8">
          <h1 className="text-[35px] md:text-[50px] xl:text-[64px] leading-[42px] md:leading-[60px] xl:leading-[72px] font-medium text-[#4E0A7C]">
            Terms Of Service
          </h1>
          <p className="text-[18px] font-medium text-[#180426] mt-[40px] mb-2">
            Breed Believers Network
          </p>
          <p className="text-[18px] font-medium text-[#180426]  mb-5">
            Last updated: February 21, 2026
          </p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Acceptance of Terms
          </h2>
          <p>
            By accessing or using Breed, you agree to be bound by these Terms.
            If you do not agree, please discontinue use.
          </p>

          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Description of Service
          </h2>
          <p>
            Breed is a faith-based platform that supports spiritual growth
            through:
          </p>

          <ul className="pl-8">
            <li className="list-disc">Curated Christian content</li>
            <li className="list-disc">Personal and group devotion tools</li>
            <li className="list-disc">Discipleship tracking</li>
            <li className="list-disc">Accountability circles</li>
            <li className="list-disc">
              Learning resources and courses (currently free)
            </li>
            <li className="list-disc">Progress dashboards</li>
          </ul>
          <p>Features may change or expand over time.</p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Eligibility
          </h2>

          <p className="my-2">
            You must be at least 13 years old to use Breed.
          </p>

          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            User Accounts
          </h2>
          <p>You agree to:</p>
          <ul className="pl-8">
            <li className="list-disc">Provide accurate information.</li>
            <li className="list-disc">Keep your login details secure.</li>
            <li className="list-disc">
              Accept responsibility for activity on your account.
            </li>
          </ul>
          <p>We may suspend accounts that violate these Terms.</p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Community Standards
          </h2>
          <p>You agree not to:</p>
          <ul className="pl-8">
            <li className="list-disc">Post harmful or offensive content.</li>
            <li className="list-disc">Misrepresent your identity.</li>
            <li className="list-disc">Promote hatred or division.</li>
            <li className="list-disc">Attempt to disrupt the platform.</li>
          </ul>

          <p>
            Breed is built on Christian values of love, respect, and
            edification.
          </p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Free courses
          </h2>
          <p>
            All learning content and courses are currently offered free of
            charge. Breed Believers Network reserves the right to introduce paid
            features in the future, with prior notice.
          </p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Children’s Privacy
          </h2>
          <p>
            Breed is intended for users aged 13 and above. We do not knowingly
            collect data from children under 13.{" "}
          </p>

          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Intellectual Property
          </h2>
          <p>
            All platform branding, design, and software belong to Breed
            Believers Network.
          </p>
          <p>
            You may not copy or redistribute any part of Breed without written
            permission.{" "}
          </p>

          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these Terms.
          </p>
          <p>Users may delete their accounts at any time.</p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Disclaimer
          </h2>
          <p>
            Breed provides spiritual growth tools and Christian educational
            resources but does not replace pastoral counseling, medical advice,
            or professional services.
          </p>
          <p>All content is provided “as is.”</p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Limitation of Liability
          </h2>
          <p>
            Breed Believers Network is not responsible for indirect or
            consequential damages arising from platform use.
          </p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Governing Law
          </h2>
          <p>
            These Terms are governed by applicable local laws where Breed
            Believers Network is registered.
          </p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Changes to Terms
          </h2>
          <p>
            We may update these Terms periodically. Continued use of Breed means
            acceptance of changes.
          </p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Contact Us
          </h2>
          <p>Questions about these Terms?</p>
          <p className="mt-2">
            Email:{" "}
            <a
              href="mailto:support@joinbreed.com
"
            >
              support@joinbreed.com
            </a>
          </p>
        </main>
      </div>
      <Footer />
    </>
  );
}
