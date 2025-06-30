// services/passwordResetService.js - Fixed version
const API_BASE_URL = import.meta.env.VITE_BASE_URL 

export const passwordResetService = {
  initiatePasswordReset: async (email) => {
    try {
      console.log('🔐 Initiating password reset for email:', email);
      console.log('🌐 Using API base URL:', API_BASE_URL);

      const endpoint = `${API_BASE_URL}/auth/password/forgot`;
      console.log('📡 Full endpoint URL:', endpoint);

     
      const normalizedEmail = email.trim().toLowerCase();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      console.log('📡 Password reset response status:', response.status);
      
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      //  (status 200-299)
      if (response.ok) {
        console.log('✅ Password reset request successful');
        return {
          success: true,
          message: data.message || 'If the email exists in our system, a password reset link has been sent.',
          email: normalizedEmail,
          data: data.data
        };
      } else {
        
        console.error('❌ Password reset request failed:', data);
        
        if (response.status === 400) {
          throw new Error(data.message || 'Invalid email address format.');
        } else if (response.status === 429) {
          throw new Error('Too many reset attempts. Please wait a few minutes before trying again.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later or contact support.');
        } else {
          throw new Error(data.message || 'Failed to send reset email. Please try again.');
        }
      }
    } catch (error) {
      console.error('💥 Password reset initiation error:', error);
      
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  },

  validateResetToken: async (token) => {
    try {
      console.log('🔍 Validating reset token...');

      const endpoint = `${API_BASE_URL}/auth/password/validate-token?token=${encodeURIComponent(token)}`;
      console.log('📡 Validation endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Token validation response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Validation response:', data);
      
      if (response.ok) {
        console.log('✅ Reset token is valid');
        return {
          valid: true,
          email: data.email,
          ...data
        };
      } else {
        console.error('❌ Token validation failed:', data);
        
        if (response.status === 400 || response.status === 404) {
          throw new Error('Invalid or expired reset token. Please request a new password reset.');
        } else if (response.status === 410) {
          throw new Error('This reset token has already been used. Please request a new password reset.');
        } else {
          throw new Error(data.message || 'Token validation failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('💥 Token validation error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      console.log('🔐 Resetting password with token...');

      const endpoint = `${API_BASE_URL}/auth/password/reset`;
      console.log('📡 Reset endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          newPassword 
        }),
      });

      console.log('📡 Password reset response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Reset response:', data);
      
      if (response.ok) {
        console.log('✅ Password reset successful');
        return {
          success: true,
          message: data.message || 'Password reset successful. You can now login with your new password.',
          ...data
        };
      } else {
        console.error('❌ Password reset failed:', data);
        
        if (response.status === 400) {
          if (data.message && data.message.toLowerCase().includes('token')) {
            throw new Error('Invalid or expired reset token. Please request a new reset link.');
          } else if (data.message && data.message.toLowerCase().includes('password')) {
            throw new Error('Password does not meet requirements. Please choose a stronger password.');
          } else {
            throw new Error(data.message || 'Invalid request. Please check your input and try again.');
          }
        } else if (response.status === 404) {
          throw new Error('Reset token not found. Please request a new reset link.');
        } else if (response.status === 410) {
          throw new Error('Reset token has already been used. Please request a new reset link.');
        } else {
          throw new Error(data.message || 'Password reset failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('💥 Password reset error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  },

  // Debug helper to test the connection
  testConnection: async () => {
    try {
      console.log('🔌 Testing API connection...');
      
      const response = await fetch(`${API_BASE_URL}/auth/password/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const data = await response.json();
      
      return {
        connected: true,
        status: response.status,
        message: data.message,
        working: response.ok
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }
};


if (import.meta.env.DEV) {
  window.debugPasswordReset = passwordResetService;
  console.log('🛠️ Debug tools available: window.debugPasswordReset');
}



export const debugPasswordResetFlow = {
  
  testEmailUrlGeneration: async (email) => {
    try {
      const response = await passwordResetService.initiatePasswordReset(email);
      console.log('🔍 Password reset response:', response);
      
      
      if (response.resetUrl || response.url || response.link) {
        console.log('📧 Generated reset URL:', response.resetUrl || response.url || response.link);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Debug error:', error);
      throw error;
    }
  },

  
  analyzeCurrentUrl: () => {
    const currentUrl = window.location.href;
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    
    console.log('🌐 Current URL Analysis:', {
      fullUrl: currentUrl,
      pathname: pathname,
      search: search,
      hash: hash,
      isResetPasswordPath: pathname.includes('/reset-password'),
      isForgotPasswordPath: pathname.includes('/forgot-password'),
      hasToken: search.includes('token=') || pathname.split('/').length > 2
    });

    return {
      currentUrl,
      pathname,
      search,
      hash,
      isCorrectPath: pathname.includes('/reset-password'),
      hasToken: search.includes('token=') || pathname.split('/').length > 2
    };
  },

  
  simulateEmailClick: (token) => {
    const correctUrls = [
      `/reset-password/${token}`,
      `/reset-password?token=${token}`
    ];
    
    console.log('✅ Email should link to one of these URLs:', correctUrls);
    console.log('🔗 Full URLs would be:');
    correctUrls.forEach(url => {
      console.log(`   ${window.location.origin}${url}`);
    });
  }
};


if (import.meta.env.DEV) {
  window.debugPasswordReset = {
    ...passwordResetService,
    debug: debugPasswordResetFlow
  };
  
  console.log('🛠️ Enhanced debug tools available:');
  console.log('  - window.debugPasswordReset.debug.testEmailUrlGeneration("email@test.com")');
  console.log('  - window.debugPasswordReset.debug.analyzeCurrentUrl()');
  console.log('  - window.debugPasswordReset.debug.simulateEmailClick("your-token-here")');
}

export default passwordResetService;