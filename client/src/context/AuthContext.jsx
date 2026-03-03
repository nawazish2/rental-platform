import { createContext, useContext, useEffect, useReducer } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const initialState = { user: null, loading: true, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload, loading: false, error: null };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    case 'LOGOUT': return { user: null, loading: false, error: null };
    default: return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { dispatch({ type: 'SET_LOADING', payload: false }); return; }
    api.get('/api/auth/me')
      .then((res) => dispatch({ type: 'SET_USER', payload: res.data.user }))
      .catch(() => {
        localStorage.removeItem('token');
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const res = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    dispatch({ type: 'SET_USER', payload: res.data.user });
    return res.data.user;
  };

  const register = async (data) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const res = await api.post('/api/auth/register', data);
    localStorage.setItem('token', res.data.token);
    dispatch({ type: 'SET_USER', payload: res.data.user });
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
