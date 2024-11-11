import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { logout, getDocument, updateDocument } from '../config/Firebase/Firebaseconfiguration'; // Import required Firebase functions
import { auth } from '../config/Firebase/Firebaseconfiguration'; // Import auth
import Sidebar from '../Components/Sidebar'; // Import Sidebar component
import EditProfilePopup from '../Components/EditProfilePopup'; // Import EditProfilePopup component
import LogoutConfirmationPopup from '../Components/LogoutConfirmationPopup'; // Import LogoutConfirmationPopup component
import Posts from '../Dashbord/Posts';
import PostsHeader from '../Components/Postscomponent/PostsHeader';
import Yourprofile from '../Dashbord/Yourprofile';
import Allprofile from '../Dashbord/Allprofile';
import Userprofile from '../Dashbord/Userprofile';

function Home() {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false); // Logout confirmation popup
  const [showEditPopup, setShowEditPopup] = useState(false); // Edit profile popup
  const [username, setUsername] = useState(''); // State to hold username
  const [newUsername, setNewUsername] = useState(''); // State for editing username
  const [loading, setLoading] = useState(true); // State to manage loading status
  const navigate = useNavigate();

  // Fetch username on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Listen for authentication state changes
        const user = auth.currentUser;
        if (user) {
          // Fetch user data from Firestore
          const userData = await getDocument('users', user.uid);
          if (userData && userData.username) {
            setUsername(userData.username); // Set the username from fetched data
            setNewUsername(userData.username); // Initialize edit field with current username
          } else {
            console.warn("No username found for the user.");
            setUsername('No Username'); // Fallback message if no username found
          }
        } else {
          console.warn("No authenticated user found.");
          setUsername('No Username'); // Fallback message if no authenticated user
        }
      } catch (error) {
        console.error('Error fetching username:', error.message);
        setUsername('Error fetching username'); // Fallback message on error
      } finally {
        setLoading(false); // Set loading to false once the data is fetched or an error occurs
      }
    };

    // Check if the user is authenticated on mount and then fetch user data
    fetchUserData();

    // Optionally, listen for auth state changes (this is a more reactive approach)
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData(); // Re-fetch the user data if the authentication state changes
      } else {
        setUsername('No Username');
        setLoading(false);
      }
    });

    // Cleanup the listener when the component is unmounted
    return () => unsubscribe();

  }, []); // This will run once when the component mounts

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout(); // Log out the user
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  // Handle Profile Edit Save
  const handleSaveEdit = async () => {
    try {
      const user = auth.currentUser; // Get the current user
      if (user) {
        // Update Firestore with new username
        await updateDocument('users', user.uid, {
          username: newUsername,
        });
        setUsername(newUsername); // Update displayed username
        setShowEditPopup(false); // Close the edit popup
        alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
    }
  };

  return (
    <div className="flex w-[100%]">
      {/* Sidebar Component */}
      <Sidebar
        username={username}
        showEditPopup={showEditPopup}
        setShowEditPopup={setShowEditPopup}
        setShowLogoutPopup={setShowLogoutPopup}
        loading={loading} // Pass loading state to Sidebar to handle username display
      />

      {/* Edit Profile Popup Component */}
      <EditProfilePopup
        showEditPopup={showEditPopup}
        newUsername={newUsername}
        setNewUsername={setNewUsername}
        handleSaveEdit={handleSaveEdit}
      />

      {/* Logout Confirmation Popup Component */}
      <LogoutConfirmationPopup
        showLogoutPopup={showLogoutPopup}
        handleLogout={handleLogout}
        setShowLogoutPopup={setShowLogoutPopup}
      />
<div className='fixed ml-[30%] w-[70%] border-2 bg-gray-500'> <PostsHeader/></div>
      {/* Content Area */}
      <div className="ml-[30%]  w-[70%] mt-[80px] h-screen p-4">
        <Routes>

          <Route path='/Home' element={<Posts/>}/>
          <Route path='/Yourprofile' element={<Yourprofile/>}/>
          <Route path='/Allprofile' element={<Allprofile/>}/>
          <Route path='/Userprofile/:id' element={<Userprofile />} />
        </Routes>
      </div>
    </div>
  );
}

export default Home;
