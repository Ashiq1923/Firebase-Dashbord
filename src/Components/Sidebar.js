import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

const Sidebar = ({ username, showEditPopup, setShowEditPopup, setShowLogoutPopup, loading, shouldRedirect }) => {
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    // If the condition for redirection is met (shouldRedirect is true), navigate to '/Homepage'
    if (shouldRedirect) {
      navigate('/Home');
    }
  }, [navigate, shouldRedirect]); // Only run when `shouldRedirect` changes

  return (
    <div className="fixed bg-slate-800 h-screen col-span-4 w-[30%] border-r-2 ">
      {/* Profile Section */}
      <div className="flex flex-col border-b-2 bg-green-700 p-2  items-center mb-6">
        {/* Profile Picture */}
        <div className="relative w-20 h-20 border-2  mt-[20px] border-white rounded-full flex items-center justify-center mb-2">
          {/* Displaying First Letter of Username as Profile Image */}
          {loading ? (
            <span className="text-3xl text-white">+</span> // Placeholder while loading
          ) : username && username !== 'No Username' ? (
            <span className="text-3xl text-white">{username[0].toUpperCase()}</span> // Show first letter of username
          ) : (
            <span className="text-3xl text-white">+</span> // Placeholder if no username is available
          )}
        </div>

        {/* Username */}
        <p className="text-xl text-white font-semibold mb-2">
          {loading ? 'Loading...' : username || 'No Username'}
        </p>

        {/* Edit Profile Button */}
        <button
  onClick={() => setShowEditPopup(true)}
  className="text-sm text-white mb-[10px] border p-2 rounded shadow-xl transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:underline"
>
  Edit Profile
</button>

      </div>

      {/* Navigation Links */}
      <nav className="flex  mt-[30px] flex-col gap-6">
        <Link to={'/Home'} className="text-lg flex justify-center m-2 text-white p-2 rounded-md hover:bg-gray-500 transition-colors duration-200">
        <i class="text-xl ml-[-30px] mr-[10px] fa-solid fa-house"></i>
          Home
        </Link>
        <Link to={'/Yourprofile'} className="text-lg flex justify-center m-2 text-white p-2 rounded-md hover:bg-gray-500 transition-colors duration-200">
        <i class="text-xl ml-[-30px] mr-[10px] fa-solid fa-user"></i>
          Profile
        </Link>
        <Link to={'/Allprofile'} className="text-lg flex justify-center m-2 text-white p-2 rounded-md hover:bg-gray-500 transition-colors duration-200">
        <i class="text-xl ml-[-30px] mr-[10px] fa-solid fa-users"></i>
          Users
        </Link>
        {/* <Link to={'/Homepage'} className="text-lg p-2 rounded-md hover:bg-gray-200 transition-colors duration-200">
          hah
        </Link>
        
        <Link to={'/Homepage'} className="text-lg p-2 rounded-md hover:bg-gray-200 transition-colors duration-200">
          Home
        </Link> */}

       
      </nav>
     {/* Logout Button */}
     <button
          onClick={() => setShowLogoutPopup(true)} // Show logout popup
          className=" mt-[18%] ml-[12%]  fixed  text-xl p-2 rounded-md hover:bg-gray-200 transition-colors duration-200 text-red-600 font-semibold"
        >
          <i class="mr-[5px] fa-solid fa-right-from-bracket"></i> 
          Logout
        </button>
    </div>
  );
};

export default Sidebar;
