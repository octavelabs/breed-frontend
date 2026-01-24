export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white pt-16">
      <div className="container mx-auto px-4">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src="/logo.png" alt="Breed" className="h-8 mb-4" />
            <p className="text-purple-100 text-sm leading-relaxed">
              Your spiritual companion app built to help you stay consistent in
              your walk with God
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold mb-4 text-sm">Product</h3>
            <ul className="space-y-2 text-purple-100 text-sm">
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
            <h3 className="font-bold mb-4 text-sm">Resources</h3>
            <ul className="space-y-2 text-purple-100 text-sm">
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
            <h3 className="font-bold mb-4 text-sm">Company</h3>
            <ul className="space-y-2 text-purple-100 text-sm">
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

        {/* Divider */}
        <div className="border-t border-purple-500 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-purple-100 text-sm">
          <p>© 2025 Breed.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
        <img src="./Logo2.png" alt="logo" className="pt-16" />
      </div>
    </footer>
  );
}
