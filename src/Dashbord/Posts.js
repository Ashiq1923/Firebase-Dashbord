import React, { useState, useEffect } from 'react';
import AddPostPopup from '../Components/Postscomponent/AddPostPopup';
import { db } from '../config/Firebase/Firebaseconfiguration';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    setCurrentUser(auth.currentUser);
  }, [auth]);

  useEffect(() => {
    const postsCollectionRef = collection(db, 'posts');
    
    const unsubscribe = onSnapshot(postsCollectionRef, (snapshot) => {
      const postsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLike = async (postId, isLiked) => {
    const postRef = doc(db, 'posts', postId);
    try {
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

  const [expandedPostId, setExpandedPostId] = useState(null);

  const toggleContent = (postId) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  };

  const handlePostAdded = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="post-list ml-[20px]">
      <div className="ml-[43%] mb-[40px] text-4xl font-bold">Posts</div>

     
      {posts.map((post) => {
        const isLiked = post.likedBy && post.likedBy.includes(currentUser?.uid);

        return (
          <div
            key={post.id}
            className="post-card w-[90%] h-auto p-4 mb-[40px] border rounded shadow-xl"
          >
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
                className={`p-2 rounded ${
                  isLiked ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                } text-white`}
              >
                {isLiked ? 'Unlike' : 'Like'}
              </button>
              <span>{post.likedBy ? post.likedBy.length : 0} Likes</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Posts;
