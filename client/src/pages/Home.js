import React from 'react';
import { Link } from 'react-router-dom';
import { FaSchool, FaBook, FaChalkboardTeacher, FaUserTie, FaHeart, FaStar, FaGraduationCap, FaEye, FaBullseye } from 'react-icons/fa';
import AboutSection from '../components/About';
import founderImage from '../assets/images/founder.jpg';

// Note: The founder's image needs to be converted from HEIC to PNG/JPEG
// Please convert the image and update the import path below
// import founderImage from '../assets/images/founder.jpg'; // Uncomment after conversion

const Home = () => (
  <>
    <main className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen pt-24">
      {/* Hero Section - Enhanced with floating animation */}
      <section className="max-w-6xl mx-auto px-6 pt-8 pb-20 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="md:w-1/2 text-center md:text-left">
          <div className="mb-6">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Excellence in Education Since 2002
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-blue-900 mb-6">
              Welcome to <span className="text-blue-700 block mt-2">Sri Prathibha Model High School</span>
            </h1>
          </div>
          <p className="text-xl text-blue-700 max-w-xl mb-8 leading-relaxed">
            Empowering students for a bright future with quality education and strong moral values.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/admissions"
              className="inline-block bg-gradient-to-r from-blue-700 to-blue-500 text-white text-lg font-semibold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-800 hover:to-blue-600 transition-all duration-300"
            >
              Apply for Admission
            </Link>
           
          </div>
        </div>
        <div className="md:w-1/2 relative mt-10 md:mt-0">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
          <img
            src="/school_hero.png"
            alt="School building"
            className="w-full rounded-2xl shadow-2xl transform transition-transform duration-700 hover:scale-105 relative z-10"
          />
        </div>
      </section>

      {/* Stats Section - New addition */}
      <section className="max-w-5xl mx-auto px-6 py-12 mb-16 bg-white rounded-2xl shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: <FaGraduationCap className="text-blue-600 mx-auto" size={36} />, value: '98%', label: 'Pass Rate' },
            { icon: <FaUserTie className="text-blue-600 mx-auto" size={36} />, value: '20+', label: 'Expert Faculty' },
            { icon: <FaStar className="text-blue-600 mx-auto" size={36} />, value: '10+', label: 'Awards Won' },
            { icon: <FaSchool className="text-blue-600 mx-auto" size={36} />, value: '5+', label: 'Acres Campus' },
          ].map((stat, index) => (
            <div key={index} className="p-4">
              {stat.icon}
              <p className="text-3xl font-bold text-blue-900 mt-2">{stat.value}</p>
              <p className="text-blue-700">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision / Mission / History Cards - Enhanced with icons */}
      <section className="max-w-5xl mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <FaSchool className="text-blue-600 mb-4" size={32} />, title: 'Vision', description: 'To nurture knowledge and character in every student.' },
          { icon: <FaBook className="text-blue-600 mb-4" size={32} />, title: 'Mission', description: 'To provide holistic education that develops mind, body, and spirit.' },
          { icon: <FaHeart className="text-blue-600 mb-4" size={32} />, title: 'History', description: 'Established in 2002 with a commitment to educational excellence.' },
        ].map(({ icon, title, description }) => (
          <article
            key={title}
            className="bg-white rounded-xl shadow-lg p-8 text-gray-700 border border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center"
            aria-label={title}
          >
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              {icon}
            </div>
            <h2 className="text-2xl font-semibold mb-3 text-blue-800">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </article>
        ))}
      </section>

      {/* Why Choose Us Section - Enhanced with gradient borders */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-blue-800 mb-4">Why Choose Us?</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-300 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-center">
          {[
            { icon: <FaBook size={40} className="mx-auto text-blue-600" />, title: 'Academic Excellence', desc: 'Structured curriculum & experienced faculty' },
            { icon: <FaChalkboardTeacher size={40} className="mx-auto text-blue-600" />, title: 'Dedicated Staff', desc: 'Highly qualified and passionate teachers' },
            { icon: <FaSchool size={40} className="mx-auto text-blue-600" />, title: 'Modern Campus', desc: 'Smart classrooms, labs, library & sports' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 border-blue-500">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                {icon}
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-4">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Page Section - Improved layout */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Hero Section */}
          <div className="max-w-5xl mx-auto text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-800 px-5 py-2 rounded-full text-sm font-semibold mb-6">
              Our Legacy
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-6 flex items-center justify-center gap-3">
              <FaSchool className="text-blue-600" />
              <span>About Sri Prathibha Model High School</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Since 2002, we've been dedicated to nurturing young minds through academic excellence, moral values, and holistic development.
            </p>
          </div>

          {/* Our Story Section - Redesigned */}
          <section className="max-w-6xl mx-auto mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Our Journey Through The Years</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Founder's Card */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg border border-blue-50 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-48 h-48 rounded-2xl overflow-hidden mb-6 shadow-lg border-4 border-white">
                    <img 
                      src={founderImage} 
                      alt="P.VEERA NARAPPA - Founder" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x300?text=Founder+Image';
                      }}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">P.VEERA NARAPPA</h3>
                  <p className="text-blue-700 mb-4">Founder </p>
                  <p className="text-gray-600 mb-6">
                    "Education is not the filling of a pail, but the lighting of a fire."
                    <span className="block mt-2 text-sm text-blue-600">- William Butler Yeats</span>
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-8">
                <div className="relative pl-8 border-l-2 border-blue-200">
                  <div className="absolute w-4 h-4 bg-blue-600 rounded-full -left-2 top-1"></div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">2002</h3>
                  <p className="text-gray-700">Founded with a vision to provide quality education rooted in ethical values and modern learning techniques.</p>
                </div>
                
                <div className="relative pl-8 border-l-2 border-blue-200">
                  <div className="absolute w-4 h-4 bg-blue-600 rounded-full -left-2 top-1"></div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">2005</h3>
                  <p className="text-gray-700">Established our first computer lab, bringing digital education to our students.</p>
                </div>
                
                <div className="relative pl-8 border-l-2 border-blue-200">
                  <div className="absolute w-4 h-4 bg-blue-600 rounded-full -left-2 top-1"></div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">2015</h3>
                  <p className="text-gray-700">Recognized as one of the top schools in the district for academic excellence.</p>
                </div>
                
                <div className="relative pl-8 border-l-2 border-blue-200">
                  <div className="absolute w-4 h-4 bg-blue-600 rounded-full -left-2 top-1"></div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">2023</h3>
                  <p className="text-gray-700">Expanded our campus and introduced new extracurricular programs.</p>
                </div>
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="mt-16 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 md:p-12 text-white">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-4 flex items-center">
                    <FaEye className="mr-3 text-blue-300" />
                    Our Vision
                  </h3>
                  <p className="text-blue-100">
                    To be a premier educational institution that nurtures knowledge, character, and leadership in every student, preparing them to meet global challenges with confidence and compassion.
                  </p>
                </div>
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-4 flex items-center">
                    <FaBullseye className="mr-3 text-blue-300" />
                    Our Mission
                  </h3>
                  <p className="text-blue-100">
                    To provide a stimulating learning environment that empowers students to achieve their full potential through innovative teaching, moral values, and holistic development programs.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <div className="mt-8">
            <AboutSection />
          </div>

          {/* Core Values Section */}
          <section className="max-w-5xl mx-auto mt-12 px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-blue-800 mb-4">Our Core Values</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-300 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <FaUserTie size={32} className="text-blue-700" />,
                  title: 'Leadership',
                  desc: 'We empower every student to lead with confidence, integrity, and responsibility.',
                },
                {
                  icon: <FaHeart size={32} className="text-red-500" />,
                  title: 'Compassion',
                  desc: 'Fostering empathy, kindness, and social awareness in every learner.',
                },
                {
                  icon: <FaBook size={32} className="text-green-600" />,
                  title: 'Knowledge',
                  desc: 'Cultivating curiosity, innovation, and a lifelong passion for learning.',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">{item.title}</h3>
                  <p className="text-gray-700">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Closing CTA */}
          <section className="max-w-4xl mx-auto mt-16 text-center bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl shadow-lg p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400 rounded-full opacity-20"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-300 rounded-full opacity-20"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Join Our Learning Community</h3>
              <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                Discover how Sri Prathibha Model High School nurtures talent, builds character, and inspires greatness.
              </p>
              <a
                href="/contact"
                className="inline-block bg-white text-blue-800 font-semibold px-8 py-3 rounded-full shadow hover:bg-blue-50 transition duration-300"
              >
                Schedule a Visit
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  </>
);

export default Home;