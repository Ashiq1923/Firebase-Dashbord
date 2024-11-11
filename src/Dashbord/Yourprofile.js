import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import Firebase Auth
import { db } from '../config/Firebase/Firebaseconfiguration'; // Import the Firestore instance

const Yourprofile = () => {
    const [userData, setUserData] = useState(null); // To store user profile data
    const [userPosts, setUserPosts] = useState([]); // To store user posts
    const [loading, setLoading] = useState(true); // To manage loading state
    const [expandedPostId, setExpandedPostId] = useState(null); // Track expanded post
    const [editingPostId, setEditingPostId] = useState(null); // Track post being edited
    const [newContent, setNewContent] = useState(""); // New content for editing
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Control delete modal visibility
    const [postIdToDelete, setPostIdToDelete] = useState(null); // Post ID to be deleted
  
    const auth = getAuth();
    const userEmail = auth.currentUser?.email; // Get current user's email dynamically
  
    useEffect(() => {
      const fetchUserData = async () => {
        if (!userEmail) return; // Check if email exists
  
        try {
          const userRef = doc(db, 'users', auth.currentUser?.uid); // User reference
          const userDoc = await getDoc(userRef); // Get user data
  
          if (userDoc.exists()) {
            setUserData(userDoc.data()); // Set user data
          } else {
            console.log('No such user!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
  
      const fetchUserPosts = async () => {
        if (!userEmail) return; // Check if email exists
  
        try {
          const userPostsRef = doc(db, 'usersprofileposts', userEmail); // Reference to user posts collection
          const postsCollection = collection(userPostsRef, 'postss'); // Fetch posts subcollection
          const querySnapshot = await getDocs(postsCollection);
  
          const posts = [];
          querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() }); // Push post data into array
          });
          setUserPosts(posts); // Set the posts state
        } catch (error) {
          console.error('Error fetching user posts:', error);
        }
      };
  
      fetchUserData();
      fetchUserPosts();
      setLoading(false); // Set loading to false after data fetching
    }, [userEmail]);
  
    const handleEditPost = (postId, content) => {
      setEditingPostId(postId); // Set the post to be edited
      setNewContent(content); // Pre-fill content for editing
    };
  
    const handleSaveEdit = async () => {
      if (!newContent.trim()) return; // Prevent saving empty content
  
      try {
        const postRef = doc(db, 'usersprofileposts', userEmail, 'postss', editingPostId);
        await updateDoc(postRef, { content: newContent }); // Update content in Firestore
  
        // Also update in the main posts collection
        const mainPostRef = doc(db, 'posts', editingPostId);
        await updateDoc(mainPostRef, { content: newContent });
  
        // Immediately update state to reflect the changes
        setUserPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === editingPostId ? { ...post, content: newContent } : post
          )
        );
  
        // Close the edit modal and reset content
        setEditingPostId(null);
        setNewContent(""); 
      } catch (error) {
        console.error('Error updating post:', error);
      }
    };
  
    const handleDeletePost = async () => {
      try {
        const postRef = doc(db, 'usersprofileposts', userEmail, 'postss', postIdToDelete);
        await deleteDoc(postRef); // Delete from user posts collection
  
        // Also delete from main posts collection
        const mainPostRef = doc(db, 'posts', postIdToDelete);
        await deleteDoc(mainPostRef);
  
        // Immediately update state to remove the deleted post from the UI
        setUserPosts(prevPosts => prevPosts.filter(post => post.id !== postIdToDelete));
  
        // Close the delete modal and reset postIdToDelete
        setShowDeleteModal(false);
        setPostIdToDelete(null);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    };
  
    // Toggle content visibility
    const toggleContent = (postId) => {
      setExpandedPostId(prev => (prev === postId ? null : postId)); // Toggle the post's expanded state
    };
  
    // Function to format createdAt timestamp into readable date
    const formatDate = (timestamp) => {
      if (!timestamp) return 'Invalid Date'; // If no timestamp, return 'Invalid Date'
      const date = new Date(timestamp.seconds * 1000); // Convert Firestore Timestamp to Date object
      return date.toLocaleString(); // Format the date into a readable string
    };
  
    if (loading) {
      return <p>Loading...</p>; // Show loading text while data is fetching
    }
  
    return (
      <div className="p-6 ml-[20%]">
        {/* Profile Header */}
        <div className="flex items-center   bg-green-700 w-[70%] p-4 rounded shadow-2xl gap-4 mb-6">
          <div className="w-20 h-20 border-2 shadow-2xl border-white rounded-full flex items-center justify-center">
            {userData?.profilePicture ? (
              <img src={userData.profilePicture} alt="Profile" className="w-full h-full rounded-full" />
            ) : (
              <span className="text-3xl text-white">{userData?.username?.[0]?.toUpperCase() || 'A'}</span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">{userData?.username || 'No Username'}</h2>
            <p className="text-sm text-gray-200">{userData?.email || 'No email available'}</p>
          </div>
        </div>
  
        {/* User Posts */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Posts</h3>
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div key={post.id} className="w-full md:w-[80%] lg:w-[70%] h-auto mb-4 p-6 border rounded-lg shadow-xl bg-white">
                {/* Post Content */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center">
                      {userData?.profilePicture ? (
                        <img src={userData.profilePicture} alt="Profile" className="w-full h-full rounded-full" />
                      ) : (
                        <span className="text-xl text-gray-500">{userData?.username?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{userData?.username || 'Anonymous'}</p>
                      <span className="text-xs text-gray-400">{post.createdAt}</span>
                    </div>
                  </div>
  
                  {/* Post Content */}
                  <div
                    className="w-[100%] p-2 shadow rounded border-2"
                    style={{
                      maxHeight: expandedPostId === post.id ? 'none' : '150px', // Expand if post is selected
                      overflow: 'hidden',
                    }}
                  >
                    <p className="w-[100%] text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words mt-2">
                      {post.content || 'No content available.'}
                    </p>
                  </div>
                </div>
  
                {/* Edit and Delete Buttons */}
                <div className="mt-[10px] flex gap-4">
                  <button
                    onClick={() => handleEditPost(post.id, post.content)}
                    className="text-blue-500 text-sm p-2 hover:bg-gray-200 hover:shadow-xl rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { setShowDeleteModal(true); setPostIdToDelete(post.id); }}
                    className="text-red-500 text-sm p-2 hover:bg-gray-200 hover:shadow-xl rounded"
                  >
                    Delete
                  </button>
                </div>
  
                {/* Show See More / See Less based on content visibility */}
                {post.content && post.content.length > 150 && (
                  <button
                    onClick={() => toggleContent(post.id)} // Toggle only for the clicked post
                    className="text-blue-500 text-sm mt-2"
                  >
                    {expandedPostId === post.id ? 'See Less' : 'See More'}
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No posts available.</p>
          )}
        </div>
  
        {/* Edit Modal */}
        {editingPostId && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full h-40 p-2 border rounded-lg"
                placeholder="Edit your post..."
              />
              <div className="flex justify-end gap-4 mt-4">
                <button onClick={() => setEditingPostId(null)} className="text-gray-600">Cancel</button>
                <button onClick={handleSaveEdit} className="text-blue-500">Save</button>
              </div>
            </div>
          </div>
        )}
  
        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[300px]">
              <p className="text-gray-800">Are you sure you want to delete this post?</p>
              <div className="flex justify-end gap-4 mt-4">
                <button onClick={() => setShowDeleteModal(false)} className="text-gray-600">No</button>
                <button onClick={handleDeletePost} className="text-red-500">Yes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default Yourprofile;
  