'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, setCookie } from 'cookies-next';
import auth_service from '../users/services/auth.service';

export default function AuthGuard({ children, requiredRole = null }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie('token');
    
    if (!token) {
      setAuthorized(false);
      router.push('/login');
      return;
    }

    const checkUser = async () => {
      try {
        // info del user
        const userData = await auth_service.me();
        
        if (userData.error) {
          throw new Error('Error al obtener información del usuario');
        }
        
        // info de cookies
        if (!getCookie('user')) {
          setCookie("user", JSON.stringify(userData.user), { maxAge: 5 * 60 * 60, path: "/" });
        }
        
        if (!getCookie('empleado')) {
          setCookie("empleado", JSON.stringify(userData.empleado), { maxAge: 5 * 60 * 60, path: "/" });
        }
        
        // verificar uno o varios roles
        if (requiredRole) {
          // convierte a array si es un string con formato "rol1,rol2,rol3"
          const rolesArray = requiredRole && requiredRole.includes(',') 
          ? requiredRole.split(',').map(role => role.trim())
          : requiredRole ? [requiredRole] : [];
            
          // verifica si el usuario tiene al menos uno de los roles requeridos
          const hasRequiredRole = rolesArray.some(role => 
            auth_service.hasRole(role)
          );
          
          if (!hasRequiredRole) {
            router.push('/dashboard/unauthorized');
            setAuthorized(false);
            return;
          }
        }
        
        setAuthorized(true);
      } catch (error) {
        console.error("Error de autenticación:", error);
        auth_service.logoutClient(router);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, requiredRole]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
} 