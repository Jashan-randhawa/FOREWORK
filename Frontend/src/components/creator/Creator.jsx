import React from 'react'
import Navbar from '../components_lite/Navbar'
import amreshsir from './amreshsir.jpg'; // Import the local image
import ankit from './Ankit.jpg';
import ritik from './ritik.jpg';
import gaurav from './gaurav.jpg';

const Creator = () => {
  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center h-screen max-w-7xl mx-auto p-6">
  <div className="grid grid-cols-1 md:grid-cols-1 gap-6 items-center w-full">

    {/* Text Section */}
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Find Your Dream Job</h2>

      <p className="text-gray-600 mb-2">
        Our Job Searching Portal is a smart and user-friendly platform designed to help
        individuals discover the right career opportunities with ease.
      </p>

      <p className="text-gray-600 mb-2">
        Explore thousands of job listings across multiple industries using advanced search filters,
        personalized recommendations, and a seamless application process.
      </p>

      <p className="text-gray-600 mb-2">
        Whether you're a fresher looking for your first job or a professional seeking career advancement,
        our platform connects you with top employers quickly and efficiently.
      </p>

      <p className="text-gray-600 mb-2">
        Start your journey today and take the next step toward a successful future with the right job that
        matches your skills and goals.
      </p>

      <p className="text-gray-600 mb-2">
        Our portal is built with a focus on transparency and accessibility, ensuring that every user can
        navigate and apply for jobs without any complexity or confusion.
      </p>

      <p className="text-gray-600 mb-2">
        We continuously update listings so you always get access to the latest openings. Users can save
        their favourite jobs, track application progress, and stay informed through timely notifications.
      </p>

      <p className="text-gray-600 mb-2">
        The platform is optimized for all devices, allowing you to search and apply for jobs even on the go.
        Whether on a laptop, tablet, or mobile phone, your experience remains smooth and consistent.
      </p>

      <p className="text-gray-600 mb-2">
        Employers also benefit from the portal by getting access to a large pool of qualified candidates.
        Recruiters can post jobs, review applications, and shortlist talent effortlessly using our intuitive tools.
      </p>

      <p className="text-gray-600 mb-2">
        Our intelligent matching system analyzes your skills, experience, and preferences to recommend
        the most relevant job roles, saving you time and effort in your job search.
      </p>

      <p className="text-gray-600 mb-2">
        We prioritize user security and privacy, ensuring that all personal information, uploaded resumes,
        and job applications remain protected through secure authentication and encrypted storage.
      </p>

      <p className="text-gray-600 mb-2">
        By bridging the gap between opportunity and ambition, our portal empowers job seekers to
        unlock new possibilities and build successful careers with confidence.
      </p>

      <p className="text-gray-600">
        With a mission to support every individual's career journey, we continue to enhance our
        platform with new features, better tools, and smarter recommendations. Your dream job is
        just a few clicks away — start exploring today.
      </p>
    </div>

  </div>
</div>

      
      <hr className="w-full border-gray-300 my-6" />
      
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Developers and Designers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Developer 1 - Ankit Pathak */}
          <a  target="_blank" rel="noopener noreferrer" className="block text-center">
            <img src="https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?semt=ais_hybrid&w=740&q=80" alt="Ankit Pathak" className="mx-auto rounded-lg shadow-md" />
            <h3 className="text-lg font-semibold text-gray-700 mt-2">Jashanpreet Singh</h3>
            <p className="text-gray-600 text-sm">Registration No: 2022033029</p>
            <p className="text-gray-600 text-sm">Full Stack Developer</p>
          </a>
          {/* Developer 2 - Ritik Shrivastava */}
          <a href="#" className="block text-center">
            <img src="https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?semt=ais_hybrid&w=740&q=80" alt="Ritik Shrivastava" className="mx-auto rounded-lg shadow-md" />
            <h3 className="text-lg font-semibold text-gray-700 mt-2">Natish Maan</h3>
            <p className="text-gray-600 text-sm">Registration No: 2022033040</p>
            <p className="text-gray-600 text-sm">UI/UX Designer</p>
          </a>
          {/* Developer 3 - Gaurav Kumar */}
          <a href="#" className="block text-center">
            <img src="https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?semt=ais_hybrid&w=740&q=80" alt="Gaurav Kumar" className="mx-auto rounded-lg shadow-md" />
            <h3 className="text-lg font-semibold text-gray-700 mt-2">Dipanshu Sharma</h3>
            <p className="text-gray-600 text-sm">Registration No: 2022033022</p>
            <p className="text-gray-600 text-sm">Research</p>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Creator
