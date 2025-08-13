import React, { useEffect, useState } from 'react';
import { FaBookOpen, FaFileDownload, FaCheckCircle, FaChevronDown } from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';

const Academics = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        setTeachersLoading(true);
        const res = await axiosInstance.get('/public/teachers');
        setTeachers(res.data?.data || []);
      } catch (e) {
        console.error('Failed to load teachers', e);
      } finally {
        setTeachersLoading(false);
      }
    };
    loadTeachers();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-6 flex items-center justify-center gap-3">
          <FaBookOpen className="text-blue-600" />
          <span>Academic Excellence</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          At Sri Prathibha Model High School, we offer a well-rounded academic program designed to challenge, inspire, and prepare students for future success.
        </p>
      </section>

      {/* Class-wise Syllabus Section */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Class-wise Syllabus</h2>
        <p className="mb-8 text-gray-700">
          Select your class to download the corresponding syllabus. Our comprehensive curriculum is designed to meet educational standards and foster holistic development.
        </p>
        
        <div className="relative w-full max-w-md mb-6">
          <select 
            className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => setSelectedClass(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Select Your Class</option>
            <option value="1">Class 1</option>
            <option value="2">Class 2</option>
            <option value="3">Class 3</option>
            <option value="4">Class 4</option>
            <option value="5">Class 5</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <FaChevronDown className="fill-current h-4 w-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={async (e) => {
              e.preventDefault();
              if (!selectedClass) return;
              try {
                const apiUrl = `http://localhost:3000/api/public/syllabus/class/${selectedClass}/term/1`;
                // Direct open
                window.open(apiUrl, '_blank');
                // Fallback form submit
                const form = document.createElement('form');
                form.method = 'GET';
                form.action = apiUrl;
                form.target = '_blank';
                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);
              } catch (error) {
                console.error('Error downloading syllabus:', error);
                alert(`Error downloading syllabus: ${error.message}`);
              }
            }}
            className={`flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              !selectedClass ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!selectedClass}
          >
            <FaFileDownload size={18} />
            Download Syllabus
          </button>
        </div>
        
        <p className="mt-4 text-sm text-gray-500">
          <em>Last updated: July 2024</em>
        </p>
      </section>

      {/* Subjects List Section */}
      <section className="max-w-5xl mx-auto mt-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">Subjects We Offer</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            'Mathematics',
            'Science',
            'English',
            'Social Studies',
            'Languages (Telugu/Hindi)',
            'Computer Science',
            'Environmental Science',
            'Art & Craft',
            'Physical Education',
          ].map((subject) => (
            <li
              key={subject}
              className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <FaCheckCircle className="text-green-500 flex-shrink-0" />
              <span className="text-gray-800">{subject}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Teachers Section */}
      <section className="max-w-6xl mx-auto mt-16">
        <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">Our Dedicated Teachers</h2>
        {teachersLoading ? (
          <p className="text-center text-gray-600">Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p className="text-center text-gray-600">Teacher profiles will appear here soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.map((t) => {
              const photoUrl = t.photoFileId
                ? `${axiosInstance.defaults.baseURL?.replace(/\/api$/, '') || ''}/api/public/teachers/photo/${t.photoFileId}`
                : null;
              return (
                <div key={t._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                  <div className="h-48 bg-gray-100">
                    {photoUrl ? (
                      <img src={photoUrl} alt={t.name} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-gray-400">No Photo</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{t.name}</h3>
                    {(t.degrees?.length ?? 0) > 0 && (
                      <p className="text-sm text-blue-700 mb-2">{t.degrees.join(', ')}</p>
                    )}
                    <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Experience:</span> {t.experience ?? 0} years</p>
                    {(t.subjects?.length ?? 0) > 0 && (
                      <p className="text-sm text-gray-700"><span className="font-medium">Subjects:</span> {t.subjects.join(', ')}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Academic Highlights Section */}
      <section className="max-w-5xl mx-auto mt-16 bg-blue-50 border-l-4 border-blue-500 rounded-xl shadow-inner p-8">
        <h3 className="text-xl font-semibold text-blue-800 mb-4">Our Academic Approach</h3>
        <ul className="space-y-3 text-gray-700 list-disc pl-6">
          <li>Curriculum based on CBSE/State Board guidelines.</li>
          <li>Emphasis on conceptual clarity and real-world application.</li>
          <li>Regular assessments and personalized feedback.</li>
          <li>Extracurricular integration for holistic development.</li>
        </ul>
      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto mt-16 text-center">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">Ready to Learn More?</h3>
        <p className="text-gray-700 mb-6">
          Contact us or visit our campus to explore how our academic programs can shape your child’s future.
        </p>
        <a
          href="/contact"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-blue-700 transition"
        >
          Contact Us Today
        </a>
      </section>
    </div>
  );
};

export default Academics;