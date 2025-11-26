import React from 'react';
import { LoginForm } from './components/LoginForm';
import { HomeView } from './components/home/HomeView';
import { useAuthStore } from './stores/useAuthStore';

function App() {
  const { user } = useAuthStore();

  if (!user) {
    return <LoginForm />;
  }

  return <HomeView />;
}

export default App;