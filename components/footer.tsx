import Link from "next/link";
import { Instagram, Youtube, Linkedin } from "lucide-react";
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-black/90 backdrop-blur-md border-t border-[#FED649]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-4 mb-4 group">
              <div className="relative w-16 h-16">
               <Image
  src="https://static.wixstatic.com/media/e7c120_139bc773242b4cb29524927dde26ad3d~mv2.webp"
  alt="KOKOFRESH Logo"
  width={200} // adjust based on your layout
  height={200}
  className="object-contain transition-transform group-hover:scale-105"
  priority // optional — ensures instant load for logos
  quality={100} // keep logo crisp
/>
              </div>
<div className="flex flex-col">
  <span className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
    KOKO FRESH
  </span>
  <span className="font-dancing text-base italic text-[#FED649]/90 mt-1">
    Flavourz of India
  </span>
</div>



            </Link>

            <p className="text-white/70 mb-6 max-w-md">
              Premium Indian spices for the modern kitchen. Every spice tells a story, every blend creates memories.
            </p>

            <div className="flex space-x-4">
              {[
                {
                  icon: <Instagram className="h-5 w-5" />,
                  href: "https://www.instagram.com/koko_fresh_india?igsh=dHltYm0waWVtZTdu",
                  label: "Instagram",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M18.244 2H21.5l-7.25 8.282L22 22h-6.289l-4.912-6.27L5.2 22H1.94l7.753-8.86L2 2h6.289l4.435 5.757L18.244 2zm-1.097 17.924h1.751L8.33 4.124H6.452l10.695 15.8z" />
                    </svg>
                  ),
                  href: "https://x.com/KOKOFresh_IN",
                  label: "X (Twitter)",
                },
                {
                  icon: <Youtube className="h-5 w-5" />,
                  href: "https://youtube.com/@kokofresh_in?si=LxQ0HnklH4rC0Ojc",
                  label: "YouTube",
                },
                {
                  icon: <Linkedin className="h-5 w-5" />,
                  href: "https://www.linkedin.com/company/kokofresh",
                  label: "LinkedIn",
                },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="transition-colors"
                >
                  <span className="text-white/70 hover:text-[#FED649]">
                    {item.icon}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {["Shop", "About", "Contact"].map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={`/${item.toLowerCase().replace(/ /g, "")}`}
                    className="text-white/70 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-[#DD9627] hover:via-[#FED649] hover:to-[#B47B2B] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              {["Shipping", "Privacy Policy","Refund"].map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={`/${item.toLowerCase().replace(/ /g, "")}`}
                    className="text-white/70 hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-[#DD9627] hover:via-[#FED649] hover:to-[#B47B2B] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#FED649]/40 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm">
            © 2025 KOKO FRESH. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
