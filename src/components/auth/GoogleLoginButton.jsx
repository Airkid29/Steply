import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useState } from 'react';

export default function GoogleLoginButton({ variant = 'default' }) {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const result = await loginWithGoogle({
        credential: credentialResponse.credential,
      });
      
      // Redirection based on onboarding status
      if (result.needsOnboarding) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    console.error('Google Login failed');
    alert('Login failed. Please try again.');
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      locale="en"
      theme={variant === 'outline' ? 'light' : 'dark'}
      size="large"
      text={variant === 'outline' ? 'signin' : 'signin'}
      width={variant === 'outline' ? '100%' : 'auto'}
    />
  );
}
