import React from "react";
import logo from "../images/samarth_logo_white.webp";
import logo2 from "../images/samarth_logo_colour.webp";
import PravidhiLogo from '../images/PravidhiLogo.webp';
import TiLogo from '../images/ti_logo.webp';
import { FaFacebook, FaGlobe, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { Sparkles } from "lucide-react";

const Footer = () => {
  const FooterLinkData = {
    socials: [
      {
        icon: <FaGlobe className="text-xl" />,
        link: "https://www.samarthtmsl.xyz",
      },
      {
        icon: <FaFacebook className="text-xl" />,
        link: "https://www.facebook.com/SamarthTMSL",
      },
      {
        icon: <FaInstagram className="text-xl" />,
        link: "https://www.instagram.com/samarth_tmsl_official",
      },
      {
        icon: <FaLinkedin className="text-xl" />,
        link: "https://www.linkedin.com/company/samarthtmsl",
      },
    ],
  };

  return (
    <div className="relative bg-[#121212] flex flex-col backdrop-blur-lg border-t pt-8 md:pt-12 mt-16 border-[#60A5FA]">
      {/* Modern decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3B82F6] via-[#F59E0B] to-[#3B82F6]"></div>
      
      {/* Floating particles
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-2 h-2 bg-[#A78BFA] rounded-full opacity-40"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 5}s ease-in-out infinite, glow ${2 + Math.random() * 3}s ease-in-out infinite`
            }}
          />
        ))}
      </div> */}
      
      <div className="flex flex-col md:flex-row justify-evenly px-12 relative z-10">
        <div className="my-4 md:mx-6 max-w-3xl glass rounded-lg p-6">
          <h2 className="text-xl lg:text-3xl font-bold text-left text-[#DAA520] mb-4  flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-[#DAA520]" /> About Us
          </h2>
          <p className="text-gray-300 text-base md:text-lg text-left leading-relaxed">
            <strong className="text-[#DAA520]">SAMARTH</strong>, the educational society of Techno Main Salt Lake, founded in 2019. 
            SAMARTH literally means Competent, strong and powerful.
          </p>
        </div>
        
        <div className="flex flex-col my-4 md:mx-6">
          <div className="glass rounded-lg p-6">
            <div className="flex flex-row items-center justify-center flex-wrap mb-6">
              <img className="h-16 md:h-24 mx-2 md:mx-4" loading="lazy" src={PravidhiLogo} alt="Pravidhi Logo" /> 
              <div className="h-16 md:h-24 w-0 border border-[#DAA520] rounded-xl bg-[#DAA520]/30 mx-2 md:mx-4" />
              <div className="flex flex-row p-0 m-0 items-center">
                <img className="h-16 md:h-24" loading="lazy" src={logo2} alt="Samarth Logo" />
                <img className="h-14 md:h-20" loading="lazy" src={TiLogo} alt="TI Logo" />
              </div>
            </div>
            
            <div className="flex flex-col items-center mt-2">
              <h4 className="text-[#DAA520] text-xl font-semibold mb-3 ">
                Follow Us
              </h4>
              <div className="flex w-max space-x-6">
                {FooterLinkData.socials.map((item, index) => (
                  <a 
                    key={index}
                    href={item.link} 
                    className="text-white hover:text-[#DAA520] transition-all duration-300 ease-in"
                    aria-label="Social media link"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-white mt-4 py-6 px-4 relative z-10">
        {/* Decorative divider with Hogwarts-inspired design */}
        <div className="relative">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#A78BFA] to-transparent mb-6"></div>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#121212] px-4">
            <Sparkles className="w-5 h-5 text-[#DAA520]" />
          </div>
        </div>
        
        {/* Footer Content */}
        <div className="text-center">
          <p className="text-gray-400 text-sm ">
            &copy; 2024 <span className="font-bold text-[#A78BFA]">Team Samarth</span> 
            <br className="md:hidden" />
            <span className="hidden md:inline"> | </span>
            All rights reserved.
         </p>
        </div>
      </div>
      
      {/* Decorative elements - Hogwarts house symbols (simplified)
      <div className="absolute bottom-4 left-4 w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#DAA520] to-[#A78BFA] opacity-20 animate-pulse"></div> */}
    </div>
  );
};

export default Footer;