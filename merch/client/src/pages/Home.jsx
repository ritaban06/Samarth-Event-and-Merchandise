import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiTruck, FiCreditCard, FiStar, FiCalendar, FiMapPin, FiChevronRight } from 'react-icons/fi';
import samarthLogo from '../images/samarth_logo_white.png';

const features = [
  {
    icon: <FiShoppingBag className="w-6 h-6" />,
    title: 'Exclusive Collection',
    description: 'Unique designs that represent our community',
  },
  {
    icon: <FiTruck className="w-6 h-6" />,
    title: 'Fast Delivery',
    description: 'Quick and reliable shipping across India',
  },
  {
    icon: <FiCreditCard className="w-6 h-6" />,
    title: 'Secure Payments',
    description: 'Safe and easy payment options',
  },
  {
    icon: <FiStar className="w-6 h-6" />,
    title: 'Premium Quality',
    description: 'High-quality materials and printing',
  },
];

const categories = [
  {
    name: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=500',
    link: '/products?category=t-shirts',
  },
  {
    name: 'Hoodies',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=500',
    link: '/products?category=hoodies',
  },
  {
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=500',
    link: '/products?category=accessories',
  },
];

const SafalyaHomePage = () => {
  return (
    <>
      <div className="min-h-screen bg-[#0a1929]">
        {/* Hero Section - Samarth Merch */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-[#0a1929]" />
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <img src={samarthLogo} alt="Samarth Logo" className="h-32 mx-auto mb-6" />
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Welcome to Samarth Merch
              </h1>
              <p className="text-xl text-gray-300">
                Wear your pride with our exclusive collection
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                to="/products"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors inline-block"
              >
                Shop Now
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Hero Section - Safalya */}
        <header className="relative min-h-screen h-max flex items-center justify-center overflow-hidden px-6">
          {/* <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0"></div> */}

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-yellow-300 to-purple-300 bg-clip-text text-transparent"></span>
              <span className="text-2xl md:text-3xl font-light block mt-2 text-white">The Merch of TMSL</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto font-light leading-relaxed">
              {/* The largest educational fest of Eastern India. A magical celebration of resilience, talent, and the unwavering pursuit of success. */}
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-12">
              <div className="flex items-center space-x-2 text-yellow-300">
                <FiCalendar className="h-5 w-5" />
                <span className="text-lg">All Business Days</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-purple-500/50"></div>
              <div className="flex items-center space-x-2 text-yellow-300">
                <FiMapPin className="h-5 w-5" />
                <span className="text-lg">Techno Main Salt Lake</span>
              </div>
            </div>

            <Link to="/events">
              <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-full px-8 py-4 text-lg transition-all duration-500 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105 group">
                EXPLORE MERCH
                <FiChevronRight className="inline ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
            <div className="w-1 h-10 bg-gradient-to-b from-transparent to-yellow-400/50 rounded-full"></div>
            <span className="text-sm mt-2 text-yellow-300">Scroll Down</span>
          </div>
        </header>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-purple-300 mb-12">
              Why Choose Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#121826] p-6 rounded-lg text-center"
                >
                  <div className="text-purple-300 mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 px-4 bg-[#121826]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-purple-300 mb-12">
              Shop by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group overflow-hidden rounded-lg"
                >
                  <Link to={category.link}>
                    <div className="aspect-w-1 aspect-h-1">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                      <h3 className="text-2xl font-semibold text-white">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-purple-300 mb-4">
                Stay Updated
              </h2>
              <p className="text-gray-400 mb-8">
                Subscribe to our newsletter for exclusive offers and updates
              </p>
              <form className="flex flex-col sm:flex-row gap-4 justify-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-lg bg-[#121826] text-white border border-purple-300 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="py-20 px-6">
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
                <Link to="/login">
                  <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-full px-8 py-4 text-lg transition-all duration-500 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105">
                     Register Now
                  </button>
                </Link>
                <a href="https://www.samarthtmsl.xyz/contact">
                  <button className="bg-transparent border-2 border-purple-400 text-white font-bold rounded-full px-8 py-4 text-lg transition-all duration-500 hover:border-yellow-300 hover:text-yellow-300">
                    Contact Us
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section> */}
      </div>
    </>
  );
};

export default SafalyaHomePage;