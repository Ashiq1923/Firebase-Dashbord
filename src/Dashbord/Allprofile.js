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

    <div className=" w-[100%] h-auto md:flex justify-center mt-[30px] ml-[20px] md:ml-[19%] gap-6 md:p-6 md:border-2">
    <h1 className='fixed top-[0px] left-[16%] text-2xl font-bold bg-slate-200 border-2 p-4 w-[84%]'>All Users</h1>
      {users.map((user) => (
        
        <Link 
          to={`/Userprofile/${user.id}`} // Pass user.id in the URL
          key={user.id} 
          className=" flex mb-[10px] w-[110%] h-[100px]  p-2 flex-row md:flex-col items-center md:w-[15%] md:h-[150px] border rounded-lg shadow-lg transform transition-transform  hover:scale-105 hover:shadow-xl "
        >
          <div className="  w-12 h-12 ml-[10px] flex items-center justify-center border-2 border-gray-500 text-[gray] text-2xl font-bold rounded-full md:w-16 md:h-16 md:mb-2 md:mt-[20px] md:mr-[10px]">
            {user.username ? user.username[0].toUpperCase() : 'U'}
          </div>
          <p className="  font-semibold text-gray-800 ml-[20px]  md:text-center md:ml-[-0px]">{user.username}</p>
        </Link>
      ))}
    </div>
    
  );
}

export default Allprofile;
