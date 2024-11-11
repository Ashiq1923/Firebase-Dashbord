import React, { useState, useEffect } from 'react';
import { db } from '../config/Firebase/Firebaseconfiguration'; // Update path as needed
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Allprofile() {
  const [users, setUsers] = useState([]);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    
    <div className="flex  justify-center gap-6 p-6 border-2">
      {users.map((user) => (
        
        <Link 
          to={`/Userprofile/${user.id}`} // Pass user.id in the URL
          key={user.id} 
          className=" flex flex-col items-center w-[15%] h-[150px] border rounded-lg shadow-lg transform transition-transform  hover:scale-105 hover:shadow-xl"
        >
          <div className="mt-[20px] w-16 h-16 flex items-center justify-center border-2 border-gray-500 text-[gray] text-2xl font-bold rounded-full mb-2">
            {user.username ? user.username[0].toUpperCase() : 'U'}
          </div>
          <p className="text-center font-semibold text-gray-800">{user.username}</p>
        </Link>
      ))}
    </div>
  );
}

export default Allprofile;
