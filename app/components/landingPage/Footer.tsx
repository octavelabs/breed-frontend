import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#A967F1] from-0% to-[#5B26B1] to-100% text-white pt-16">
      <div className="container mx-auto px-6">
        {/* Footer Content */}
        <div className="w-full flex flex-col xl:flex-row gap-[32px] xl:gap-0">
         <div className="w-full xl:w-[50%]">

            <p className="text-white text-sm xl:text-[18px] leading-relaxed w-full xl:w-1/2">
              Your spiritual companion app built to help you stay consistent in
              your walk with God
            </p>
          </div>
        <div className="w-full xl:w-[50%] grid grid-cols-3 md:grid-cols-[2fr_1fr_1fr] gap-8 mb-12">
          <div>
            <h3 className="font-bold mb-4 text-sm xl:text-[18px]">Product</h3>
            <ul className="space-y-5 text-purple-100 text-sm xl:text-[18px]">
              <li>
                <Link href="/believers" className="cursor-pointer">
                  For Believers
                </Link>
              </li>
              <li>
                <Link href="/preachers" className="cursor-pointer">
                  For Preachers
                </Link>
              </li>
              <li>
                <a href="#" className="cursor-pointer">
                  For Churches(coming soon)
                </a>
              </li>
            </ul>
          </div>

    
          <div>
            <h3 className="font-bold mb-4 text-sm xl:text-[18px]">Company</h3>
            <ul className="space-y-5 text-purple-100 text-sm xl:text-[18px]">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Partner With Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Give
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="text-end">
            <h3 className="font-bold mb-4 text-sm xl:text-[18px]">Socials</h3>
            <ul className="space-y-5 text-purple-100 text-sm xl:text-[18px]">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
               <li>
                <a href="#" className="hover:text-white transition-colors">
                  Facebook
                </a>
              </li>
               <li>
                <a href="#" className="hover:text-white transition-colors">
                  Threads
                </a>
              </li>
            </ul>
          </div>
        </div>
        </div>

        {/* Divider */}
        <div className=" my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-row justify-between items-center text-white text-sm">
          <p>© 2025 Breed.</p>
          <div className="flex gap-6 items-center">
            <Link href="/terms" className=" transition-colors underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className=" transition-colors underline">
              Privacy Policy
            </Link>
          </div>
        </div>
        <img src="/Logo2.png" alt="logo" className="pt-16 w-full" />
      </div>
    </footer>
  );
}
