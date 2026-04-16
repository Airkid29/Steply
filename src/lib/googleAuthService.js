// Decode JWT without verifying (for demo purposes)
// In production, verify signature on backend
export const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT');
    
    // Decode payload (second part)
    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    
    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

export const handleGoogleSuccess = (credentialResponse) => {
  const token = credentialResponse.credential;
  const decoded = decodeJWT(token);
  
  if (!decoded || !decoded.email) {
    throw new Error('Invalid Google credentials');
  }

  return {
    id: decoded.sub,
    email: decoded.email?.trim().toLowerCase(),
    full_name: decoded.name || decoded.email.split('@')[0],
    picture: decoded.picture,
    auth_provider: 'google',
  };
};
