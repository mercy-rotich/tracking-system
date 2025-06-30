
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  
  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    return false;
  }
  
  if (trimmedEmail.length > 254) { // RFC 5321 limit
    return false;
  }
  
  return emailRegex.test(trimmedEmail);
};


export const validateUniversityEmail = (email) => {
  if (!validateEmail(email)) {
    return false;
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  const universityDomains = [
    'must.ac.ke',
    'students.must.ac.ke',
    'staff.must.ac.ke'
  ];
  
  return universityDomains.some(domain => trimmedEmail.endsWith(`@${domain}`));
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  
  return password.length >= 6;
};


export const validateStrongPassword = (password) => {
  if (!validatePassword(password)) {
    return {
      isValid: false,
      errors: ['Password must be at least 6 characters long'],
      strength: 'weak'
    };
  }
  
  const errors = [];
  let strength = 'weak';
  let score = 0;
  
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  
  if (score >= 6) {
    strength = 'strong';
  } else if (score >= 4) {
    strength = 'medium';
  }
  if (password.length < 8) {
    errors.push('Password should be at least 8 characters long for better security');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Consider adding uppercase letters');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Consider adding numbers');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Consider adding special characters');
  }
  
  return {
    isValid: true, 
    errors: errors,
    strength: strength,
    score: score
  };
};


export const validatePasswordConfirmation = (password, confirmPassword) => {
  const errors = [];
  
  if (!confirmPassword || !confirmPassword.trim()) {
    errors.push('Please confirm your password');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};


export const validateLoginForm = (formData) => {
  const errors = {};
  
  if (!formData.username || !formData.username.trim()) {
    errors.username = 'Username is required';
  }
  
  if (!formData.password || !formData.password.trim()) {
    errors.password = 'Password is required';
  } else if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters long';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  };
};


export const validatePasswordResetForm = (newPassword, confirmPassword) => {
  const errors = {};
  
  
  if (!newPassword || !newPassword.trim()) {
    errors.newPassword = 'New password is required';
  } else if (!validatePassword(newPassword)) {
    errors.newPassword = 'Password must be at least 6 characters long';
  }
  
 
  const confirmValidation = validatePasswordConfirmation(newPassword, confirmPassword);
  if (!confirmValidation.isValid) {
    errors.confirmPassword = confirmValidation.errors[0];
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  };
};


export const getTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
};


export const getTokenFromPath = (pathname) => {
  const pathParts = pathname.split('/');
  const resetIndex = pathParts.findIndex(part => part === 'reset-password');
  
  if (resetIndex !== -1 && pathParts[resetIndex + 1]) {
    return pathParts[resetIndex + 1];
  }
  
  return null;
};


export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') 
    .substring(0, 1000); 
};


export const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};


export const getEmailDomain = (email) => {
  if (!validateEmail(email)) {
    return null;
  }
  
  const parts = email.trim().toLowerCase().split('@');
  return parts[1] || null;
};


export const getPasswordStrengthText = (password) => {
  if (!password) {
    return { text: '', color: 'gray' };
  }
  
  const validation = validateStrongPassword(password);
  
  switch (validation.strength) {
    case 'strong':
      return { text: 'Strong password', color: 'green' };
    case 'medium':
      return { text: 'Good password', color: 'orange' };
    default:
      return { text: 'Weak password', color: 'red' };
  }
};


export const validateField = (fieldName, value, rules = {}) => {
  const errors = [];
  
  
  if (rules.required && (!value || value.trim().length === 0)) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }
  
  
  if (!value || value.trim().length === 0) {
    return { isValid: true, errors: [] };
  }
  
  
  if (rules.email && !validateEmail(value)) {
    errors.push('Please enter a valid email address');
  }
  
  
  if (rules.universityEmail && !validateUniversityEmail(value)) {
    errors.push('Please use your university email address');
  }
  
  
  if (rules.password && !validatePassword(value)) {
    errors.push('Password must be at least 6 characters long');
  }
  
 
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
  }
  
 
  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`${fieldName} must be no more than ${rules.maxLength} characters long`);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};
export default {
  validateEmail,
  validatePassword,
  getTokenFromUrl,
  validateUniversityEmail,
  validateStrongPassword,
  validatePasswordConfirmation,
  validateLoginForm,
  validatePasswordResetForm,
  getTokenFromPath,
  sanitizeInput,
  isEmpty,
  getEmailDomain,
  getPasswordStrengthText,
  validateField
};