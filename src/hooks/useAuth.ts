// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// ❌ REMOVER - Não precisamos de role
// export const useIsBarber = () => {
//   const { user } = useAuth();
//   return user?.role === 'barber';
// };