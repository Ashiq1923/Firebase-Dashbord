import React, { useEffect, useState } from 'react';
import { db } from '../config/Firebase/Firebaseconfiguration'; // Firebase configuration
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom'; // useParams and useNavigate for routing
import { getAuth } from 'firebase/auth';

function Userprofile() {
  const { id } = useParams(); // Get the user ID from the URL
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]); // State to hold the posts
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null); // For toggling post content expansion
  const navigate = useNavigate(); // Initialize navigate function
  const auth = getAuth();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = doc(db, 'users', id); // Get user document based on the user ID
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setUserData(docSnap.data()); // Set user data
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [id]);

  // Fetch user posts with real-time updates using onSnapshot
  useEffect(() => {
    setCurrentUser(auth.currentUser); // Set the current logged-in user

    const fetchUserPosts = () => {
      if (userData?.email) {
        const postsCollection = collection(db, 'usersprofileposts', userData.email, 'postss');
        // Real-time updates using onSnapshot
        const unsubscribe = onSnapshot(postsCollection, (postSnapshot) => {
          const postsList = postSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserPosts(postsList); // Set the posts data
        });

        // Cleanup the listener when the component unmounts or the user changes
        return () => unsubscribe();
      }
    };

    if (userData?.email) {
      fetchUserPosts();
    }
  }, [userData, auth]);

  // Handle like/unlike functionality
  const handleLike = async (postId, isLiked) => {
    const postRef = doc(db, 'usersprofileposts', userData.email, 'postss', postId);
    try {
      // Update like/unlike action in Firestore
      if (isLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(currentUser.uid),
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(currentUser.uid),
        });
      }
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  // Toggle post content visibility (See More / See Less)
  const toggleContent = (postId) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  };

  return (
    <div className="flex flex-col items-center p-6 md:ml-[40%] w-[120%] md:w-[70%]">
      {/* Back Button */}
      <div className="w-[70%] md:ml-[10%] fixed top-[70px] left-[87%] md:left-[10%] md:top-[20px]">
        <button
          onClick={() => navigate('/Allprofile')} // Navigate to Allprofile
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <span className="text-5xl font-bold md:block hidden">←</span> {/* Left arrow */}
          <span className="text-2xl text-[red] font-bold md:hidden block">X</span> {/* Left arrow */}
        </button>
      </div>

      {/* Profile Header */}
      <div className="flex items-center bg-green-700 md:mt-[1px] md:w-[70%] p-4 rounded shadow-2xl gap-4 mb-6">
        <div className="w-20 h-20 border-2 shadow-2xl border-white rounded-full flex items-center justify-center">
          {userData?.profilePicture ? (
            <img
              src={userData.profilePicture}
              alt="Profile"
              className="w-full h-full rounded-full"
            />
          ) : (
            <span className="text-3xl text-white">
              {userData?.username?.[0]?.toUpperCase() || 'A'}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {userData?.username || 'No Username'}
          </h2>
          <p className="text-sm text-white">{userData?.email || 'No email available'}</p>
          <p className="text-gray-400">
            {userData?.createdAt
              ? `Joined on ${userData.createdAt.toDate().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}`
              : 'Account creation date not available.'}
          </p>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">Posts</h3>

      {/* User Posts */}
      <div className="w-[100%] mb-[10px] md:w-[70%] mt-6 p-4 rounded shadow-xl bg-white">
        {userPosts.length === 0 ? (
          <p className="text-gray-600">No posts available.</p>
        ) : (
          userPosts.map((post) => {
            const isLiked = post.likedBy && post.likedBy.includes(currentUser?.uid);

            return (
              <div key={post.id} className="mb-[20px] md:mb-4 border-b pb-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center mr-3">
                    {post.username ? post.username[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-bold">{post.username}</p>
                    <p className="text-sm text-gray-500">{post.createdAt}</p>
                  </div>
                </div>

                <div
                  className="mb-3 border rounded p-2 w-full max-h-[150px] overflow-hidden"
                  style={{
                    maxHeight: expandedPostId === post.id ? 'none' : '150px',
                  }}
                >
                  <p className="text-base w-[100%] h-[150px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                </div>

                {post.content && post.content.length > 150 && (
                  <button
                    onClick={() => toggleContent(post.id)}
                    className="text-blue-500 text-sm mt-2"
                  >
                    {expandedPostId === post.id ? 'See Less' : 'See More'}
                  </button>
                )}

                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => handleLike(post.id, isLiked)}
                    className={`p-2 rounded ${isLiked ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'} text-white`}
                  >
                    {isLiked ? 'Unlike' : 'Like'}
                  </button>
                  <span>{post.likedBy ? post.likedBy.length : 0} Likes</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Userprofile;
