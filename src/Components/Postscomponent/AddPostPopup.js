import React, { useState, useEffect } from 'react';
import { db, auth } from '../../config/Firebase/Firebaseconfiguration';
import { collection, doc, setDoc, serverTimestamp, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';

const AddPostPopup = ({ setShowPopup, onPostAdded }) => {
  const [postContent, setPostContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [userDataLoading, setUserDataLoading] = useState(true);

  const getFormattedDate = () => {
    const date = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (!user) {
        alert('You must be logged in to post');
        setUserDataLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        } else {
          alert('User data not found!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to fetch user data');
      } finally {
        setUserDataLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSavePost = async () => {
    if (!postContent.trim()) {
      alert('Post content cannot be empty');
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        alert('You must be logged in to post');
        setLoading(false);
        return;
      }

      const newPostId = doc(collection(db, 'posts')).id;

      const postData = {
        username: username,
        email: user.email,
        uid: user.uid,
        content: postContent,
        timestamp: serverTimestamp(),
        createdAt: getFormattedDate(),
      };

      const postsCollectionRef = doc(db, 'posts', newPostId);
      await setDoc(postsCollectionRef, postData);

      const userProfilePostRef = doc(db, 'usersprofileposts', user.email);
      const userPostsSubcollectionRef = doc(userProfilePostRef, 'postss', newPostId);
      await setDoc(userPostsSubcollectionRef, postData);

      alert('Post added successfully');
      setShowPopup(false);

      // Trigger re-render in Posts component
      if (onPostAdded) {
        onPostAdded(postData); // Pass post data to the parent component
      }
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 w-1/3 rounded">
        <h2 className="text-xl mb-4">Add a Post</h2>

        {userDataLoading ? (
          <div>Loading user data...</div>
        ) : (
          <>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-2 border-2 mb-4"
              placeholder="Write something..."
            />
            <div className="flex justify-end">
              <button
                onClick={handleSavePost}
                className="bg-blue-500 text-white p-2 rounded mr-2"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-300 p-2 rounded"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddPostPopup;
