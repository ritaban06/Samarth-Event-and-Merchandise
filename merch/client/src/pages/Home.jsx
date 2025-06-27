import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Calendar, MapPin, Award, Users, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SamarthLogo from '../images/logo_safalya.png';
import '../grad.css';

const SafalyaHomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false); // Start with music paused
  const audioRef = useRef(null);

  // Past guests data
  const pastGuests = [
    { name: "Prof. Minerva McGonagall", role: "AI Research Scientist", image: "/api/placeholder/200/200" }
  ];

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % pastGuests.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle music play/pause
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Audio playback failed:", error);
        });
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  return (
    <>
      <div className="min-h-screen text-white font-sans">
        {/* Background Music */}
        <audio ref={audioRef} loop>
        <source src="/harry.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
        </audio>

        {/* Music Toggle Button */}
        <button
          onClick={toggleMusic}
          className="fixed bottom-6 left-6 bg-purple-800/50 backdrop-blur-sm p-3 rounded-full border border-purple-700/50 hover:border-yellow-400/50 transition-colors duration-300 z-50"
        >
          {isMusicPlaying ? <Volume2 className="h-8 w-8 text-yellow-300" /> : <VolumeX className="h-8 w-8 text-yellow-300" />}
        </button>

        {/* Hero Section */}
        <header className="relative min-h-screen h-max flex items-center justify-center overflow-hidden px-6">
          <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 "></div>

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              <span className="gradient-text">SAFALYA</span>
              <span className="text-2xl md:text-3xl font-light block mt-2">The Annual Educational Fest of TMSL</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto font-light leading-relaxed">
              The largest educational fest of Eastern India. A magical celebration of resilience, talent, and the unwavering pursuit of success.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-12">
              <div className="flex items-center space-x-2 text-yellow-300">
                <Calendar className="h-5 w-5" />
                <span className="text-lg">March 19-21, 2025</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-purple-500/50"></div>
              <div className="flex items-center space-x-2 text-yellow-300">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">Techno Main Salt Lake</span>
              </div>
            </div>

            <Link to="/events">
              <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-full px-8 py-4 text-lg transition-all duration-500 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105 group">
                EXPLORE EVENTS
                <ChevronRight className="inline ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
            <div className="w-1 h-10 bg-gradient-to-b from-transparent to-yellow-400/50 rounded-full"></div>
            <span className="text-sm mt-2 text-yellow-300">Scroll Down</span>
          </div>
        </header>

      
      
      {/* About Section */}
      <section id="about" className="py-5 px-3 border border-blue-800 bg-slate-950/40 m-auto w-4/5 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-300">About Safalya ✨</h2>
              <p className="text-lg leading-relaxed mb-6 text-purple-100">
                Safalya is not just an event; it's a celebration of resilience, talent, and the unwavering pursuit of success. Our commitment to creating an environment of empowerment and motivation is reflected in the diverse range of activities Safalya offers.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-purple-100">
                With participation from students representing many colleges across the state and substantial prize pools, Safalya fosters skill development, intellectual growth, and healthy competition, making it a true celebration of learning, innovation, and collaboration.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-purple-800/30 backdrop-blur-sm p-4 rounded-lg border border-purple-700/50 hover:border-yellow-400/50 transition-colors duration-300">
                  <div className="text-yellow-300 text-2xl font-bold">10+</div>
                  <div className="text-purple-200">Events</div>
                </div>
                <div className="bg-purple-800/30 backdrop-blur-sm p-4 rounded-lg border border-purple-700/50 hover:border-yellow-400/50 transition-colors duration-300">
                  <div className="text-yellow-300 text-2xl font-bold">3</div>
                  <div className="text-purple-200">Days</div>
                </div>
                <div className="bg-purple-800/30 backdrop-blur-sm p-4 rounded-lg border border-purple-700/50 hover:border-yellow-400/50 transition-colors duration-300">
                  <div className="text-yellow-300 text-2xl font-bold">₹30K+</div>
                  <div className="text-purple-200">Prize Pool</div>
                </div>
                <div className="bg-purple-800/30 backdrop-blur-sm p-4 rounded-lg border border-purple-700/50 hover:border-yellow-400/50 transition-colors duration-300">
                  <div className="text-yellow-300 text-2xl font-bold">5+</div>
                  <div className="text-purple-200">Guests</div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="rounded-lg overflow-hidden ">
                <img 
                  src={SamarthLogo} 
                  alt="Safalya Event Highlights" 
                  className="w-full h-full object-cover"
                />
                
              </div>
              {/* <div className="absolute -bottom-6 -right-6 bg-purple-800/60 backdrop-blur-md p-4 rounded-lg border border-yellow-400/20 shadow-lg">
                <div className="text-yellow-300 font-bold mb-1">March 19-21</div>
                <div className="text-sm text-purple-200">Mark your calendars!</div>
              </div> */}
            </div>
          </div>
        </div>
      </section>
      
      
      
      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-300">Why Join Safalya? 🏆</h2>
            <p className="text-lg text-purple-200 max-w-3xl mx-auto">
              Experience the magic of learning, innovation, and collaboration in Eastern India's largest educational fest.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-purple-800/20 backdrop-blur-sm p-6 rounded-xl border border-purple-700/30 hover:border-yellow-400/30 transition-colors duration-300 hover:shadow-lg">
              <div className="bg-gradient-to-tr from-yellow-400 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-yellow-300">Prize Pool</h3>
              <p className="text-purple-100">
                Compete for exciting prizes worth over ₹30K across various events.
              </p>
            </div>
            
            <div className="bg-purple-800/20 backdrop-blur-sm p-6 rounded-xl border border-purple-700/30 hover:border-yellow-400/30 transition-colors duration-300 hover:shadow-lg">
              <div className="bg-gradient-to-tr from-yellow-400 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-yellow-300">Networking</h3>
              <p className="text-purple-100">
                Connect with 1000+ students from colleges across Eastern India.
              </p>
            </div>
            
            <div className="bg-purple-800/20 backdrop-blur-sm p-6 rounded-xl border border-purple-700/30 hover:border-yellow-400/30 transition-colors duration-300 hover:shadow-lg">
              <div className="bg-gradient-to-tr from-yellow-400 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-yellow-300">Learning</h3>
              <p className="text-purple-100">
                Participate in hands-on workshops and panels led by industry experts.
              </p>
            </div>
            
            <div className="bg-purple-800/20 backdrop-blur-sm p-6 rounded-xl border border-purple-700/30 hover:border-yellow-400/30 transition-colors duration-300 hover:shadow-lg">
              <div className="bg-gradient-to-tr from-yellow-400 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-yellow-300">Memories</h3>
              <p className="text-purple-100">
                Create lasting memories through unique experiences and challenges.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Past Guests Slideshow
      <section id="guests" className="py-20 px-6 bg-purple-950/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-300">Distinguished Past Guests ⚡</h2>
            <p className="text-lg text-purple-200 max-w-3xl mx-auto">
              We've been honored to host some of the most brilliant minds in education and innovation.
            </p>
          </div>
          
          <div className="relative overflow-hidden py-8">
            {/* Slideshow */}
            {/* <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100 / pastGuests.length}%)` }}>
              {pastGuests.map((guest, index) => (
                <div key={index} className="min-w-full md:min-w-1/3 px-4">
                  <div className="bg-gradient-to-br from-purple-800/40 to-purple-900/40 backdrop-blur-md p-6 rounded-xl border border-purple-700/30 hover:border-yellow-400/50 transition-all duration-300 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-yellow-300/50">
                      <img src={guest.image} alt={guest.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold mb-1 text-yellow-300">{guest.name}</h3>
                    <p className="text-purple-200 mb-4">{guest.role}</p>
                    <p className="text-purple-300 text-sm italic">
                      "Safalya represents the future of educational innovation in Eastern India."
                    </p>
                  </div>
                </div>
              ))}
            </div> */}
            
            {/* Navigation dots */}
            {/* <div className="flex justify-center mt-6 space-x-2">
              {pastGuests.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentSlide === index ? 'bg-yellow-400' : 'bg-purple-600'}`}
                />
              ))}
            </div>
          </div>
        </div> */}
      {/* </section> */}
      
      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-800/30 to-purple-900/30 backdrop-blur-md rounded-2xl overflow-hidden border border-purple-500/30 relative">
          <div className="absolute inset-0 bg-[url('/api/placeholder/1200/400')] bg-cover bg-center opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-500/10 to-purple-800/30"></div>
          
          <div className="relative z-10 p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-purple-200">
              Ready to Experience the Magic?
            </h2>
            <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
              Join us for three days of inspiration, learning, and unforgettable experiences at SAFALYA 2025.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a href='/login'><button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-full px-8 py-4 text-lg transition-all duration-500 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105">
                Register Now
              </button></a>
              <a href="https://www.samarthtmsl.xyz/contact"><button className="bg-transparent border-2 border-purple-400 text-white font-bold rounded-full px-8 py-4 text-lg transition-all duration-500 hover:border-yellow-300 hover:text-yellow-300">
                Contact Us
              </button></a>
            </div>
          </div>
        </div>
      </section>
      
      
    </div>
    <Footer/>
    </>
  );
};

export default SafalyaHomePage;
