import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#A967F1] from-0% to-[#5B26B1] to-100% text-white pt-16">
      <div className="container mx-auto px-6">
        {/* Footer Content */}
        <div className="w-full flex flex-col xl:flex-row gap-[32px] xl:gap-0">
         <div className="w-full xl:w-[50%]">

            <p className="text-white text-sm xl:text-[20px] leading-relaxed w-full xl:w-1/2">
              Your spiritual companion app built to help you stay consistent in
              your walk with God
            </p>
          </div>
        <div className="w-full xl:w-[50%] grid grid-cols-3 md:grid-cols-[2fr_1fr_1fr] gap-8 mb-12">
          <div>
            <h3 className="font-bold mb-4 text-sm xl:text-[20px]">Product</h3>
            <ul className="space-y-2 text-purple-100 text-sm xl:text-[20px]">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  For Believers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  For Preachers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  For Churches(coming soon)
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold mb-4 text-sm xl:text-[20px]">Resources</h3>
            <ul className="space-y-2 text-purple-100 text-sm xl:text-[20px]">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Lorem Ipsum
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Lorem Ipsum
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Lorem Ipsum
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold mb-4 text-sm xl:text-[20px]">Company</h3>
            <ul className="space-y-2 text-purple-100 text-sm xl:text-[20px]">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        </div>

        {/* Divider */}
        <div className="border-t border-purple-500 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-row justify-between items-center text-white text-sm">
          <p>© 2025 Breed.</p>
          <div className="flex gap-6 items-center">
            <Link href="/terms" className=" transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className=" transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
        <img src="./Logo2.png" alt="logo" className="pt-16" />
      </div>
    </footer>
  );
}
