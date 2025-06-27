import { createContext, useContext, useState, useEffect } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Create a custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

// Create the AuthProvider component
export const AuthProvider = ({ children, setIsLoggedIn }) => {
    const [user, setUser] = useState(null);

    // Load user data from localStorage on initial render
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser({
                    uid: parsedUser.uid,
                    email: parsedUser.email,
                    userName: parsedUser.userName || '',
                    photoURL: parsedUser.photoURL || '',
                });
                setIsLoggedIn(true);
            } catch (error) {
                // If there's an error parsing user data, clear everything
                console.error('Error parsing user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                setIsLoggedIn(false);
            }
        } else {
            // If either token or user data is missing, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsLoggedIn(false);
        }
    }, [setIsLoggedIn]);

    // Function to update user data
    const updateUser = (userData) => {
        const userToStore = {
            uid: userData.uid,
            email: userData.email,
            userName: userData.userName || '', // Changed from name to userName
            photoURL: userData.photoURL || '', // Add photoURL
            // Add any other necessary user fields
        };
        setUser(userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));
        setIsLoggedIn(true);
    };

    // Function to clear user data on logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ user, updateUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};