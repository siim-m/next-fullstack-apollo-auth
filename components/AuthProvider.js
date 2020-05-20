import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const initialAuthState = {
    token: undefined,
    userId: undefined,
  };

  const [authState, setAuthState] = useState(initialAuthState);

  useEffect(() => {
    if (localStorage.getItem('userId') !== authState.userId) {
      setAuthState({
        ...authState,
        userId: localStorage.getItem('userId'),
      });
    }
  }, [authState]);

  const signIn = (userId, token) => {
    setAuthState({
      ...authState,
      userId,
      token,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
    }
  };

  const setAuthToken = (token) => {
    setAuthState({
      ...authState,
      token,
    });
  };

  const signOut = () => {
    setAuthState(initialAuthState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
  };

  return (
    <AuthContext.Provider value={{ authState, setAuthToken, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.object,
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider as default, useAuth };
