import React, { useState } from 'react';
import AddPostPopup from './AddPostPopup'; // Import your AddPostPopup component

const PostsHeader = ({ username }) => {
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility

  const handleAddPostClick = () => {
    setShowPopup(true); // Show the popup when the button is clicked
  };

  return (
    <div className="p-4 fixed w-[70%] bg-gray-300 flex justify-between items-center">
      <h1 className="text-lg font-semibold">Posts</h1>
      <button 
        onClick={handleAddPostClick} 
        className="p-2 bg-blue-500 text-white rounded"
      >
        + Add Post
      </button>

      {/* Show the AddPostPopup when showPopup is true */}
      {showPopup && <AddPostPopup setShowPopup={setShowPopup} username={username} />}
    </div>
  );
};

export default PostsHeader;
