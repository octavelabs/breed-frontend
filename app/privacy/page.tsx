import Footer from "../components/landingPage/Footer";
import Navbar from "../components/landingPage/Navbar";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <div className="bg-[#F7EDFE] pt-[100px] md:pt-[200px] ">
        <main className="w-[80%] mx-auto pb-8">
          <h1 className="text-[64px] leading-[72px] font-medium text-[#4E0A7C]">
            Privacy Policy
          </h1>
          <p className="text-[18px] font-medium text-[#180426] mt-[40px] mb-2">
            Breed Believers Network
          </p>
          <p className="text-[18px] font-medium text-[#180426]  mb-5">
            Last updated: February 21, 2026
          </p>

          <p>
            Breed Believers Network (“we,” “our,” or “us”) operates Breed, a
            Christian discipleship and spiritual growth platform designed to
            help believers grow in faith through devotional tools, discipleship
            groups, curated Christian content, accountability features, and
            structured learning experiences. Your privacy matters to us. This
            Privacy Policy explains how we collect, use, store, and protect your
            information when you use Breed. By accessing or using Breed, you
            agree to this Privacy Policy.
          </p>

          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Information We Collect
          </h2>
          <p>When you create an account, we may collect:</p>
          <p className="font-semibold">a. Personal Information</p>
          <ul className="pl-8">
            <li className="list-disc">Full name</li>
            <li className="list-disc">Email address</li>
            <li className="list-disc">Profile photo (optional)</li>
            <li className="list-disc">Account login credentials</li>
            <li className="list-disc">
              Spiritual growth preferences (such as devotion habits or learning
              interests)
            </li>
          </ul>
          <p className="font-semibold">b. Usage Information</p>
          <ul className="pl-8">
            <li className="list-disc">Device type</li>
            <li className="list-disc">Browser or app version</li>
            <li className="list-disc">IP address </li>
            <li className="list-disc">Pages visited and features used </li>
            <li className="list-disc">Time spent on the platform</li>
          </ul>
          <p className="font-semibold">c. Community & Group Activity</p>
          <ul className="pl-8">
            <li className="list-disc">Group participation data</li>
            <li className="list-disc">Devotion streaks</li>
            <li className="list-disc">Attendance logs</li>
            <li className="list-disc">Progress tracking</li>
          </ul>
          <p>
            This information is used only to support your spiritual growth
            journey.
          </p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            How We Use Your Information
          </h2>
          <p>We use your information to:</p>

          <ul className="pl-8">
            <li className="list-disc">Create and manage your account</li>
            <li className="list-disc">
              Personalize your discipleship experience
            </li>
            <li className="list-disc">
              Enable devotion scheduling and accountability tools
            </li>
            <li className="list-disc">Track growth progress and consistency</li>
            <li className="list-disc">
              Send important updates and notifications
            </li>
            <li className="list-disc">Improve platform features</li>
            <li className="list-disc">Maintain security and prevent misuse</li>
          </ul>
          <p>We do not sell your personal data.</p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            How We Share Your Information
          </h2>

          <p className="my-2">We may share limited information with:</p>

          <ul className="pl-8">
            <li className="list-disc">
              Trusted infrastructure providers (hosting, analytics,
              notifications)
            </li>
            <li className="list-disc">
              Group leaders or mentors you voluntarily connect with
            </li>
          </ul>

          <p className="my-2">
            We only share what is necessary to operate Breed effectively.
          </p>
          <p>We may also disclose information if required by law.</p>

          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Cookies and Tracking
          </h2>
          <p>Breed uses cookies or similar technologies to:</p>
          <ul className="pl-8">
            <li className="list-disc">Keep you logged in</li>
            <li className="list-disc">Remember preferences</li>
            <li className="list-disc">Analyze usage trends</li>
          </ul>

          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Data Retention
          </h2>
          <p>We retain your information while your account remains active.</p>
          <p>
            You may request account deletion at any time, after which your data
            will be permanently removed unless legally required otherwise.{" "}
          </p>

          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Security
          </h2>
          <p>
            We take reasonable steps to protect your data using modern security
            practices. However, no online system is completely secure.
          </p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Children’s Privacy
          </h2>
          <p>
            Breed is intended for users aged 13 and above. We do not knowingly
            collect data from children under 13.{" "}
          </p>

          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Your Rights
          </h2>
          <p>You may request to:</p>

          <ul className="pl-8">
            <li className="list-disc">Access your data</li>
            <li className="list-disc">Correct inaccuracies</li>
            <li className="list-disc">Delete your account</li>
            <li className="list-disc">Withdraw consent</li>
          </ul>
          <p className="my-2">Contact us to exercise these rights.</p>

          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy occasionally. Continued use of
            Breed means you accept any changes.
          </p>
          <h2 className="text-[#4E0A7C] text-xl my-4 font-semibold">
            Contact Us
          </h2>
          <p>For privacy questions, contact:</p>
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
