import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; requires2FA?: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  verify2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  selectBranch: (branchId: string) => void;
  selectedBranchId: string | null;
  tempUser: User | null;
  setTempUser: (user: User | null) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'staff';
  restaurantName?: string;
  branchId?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - extended with more data
const mockUsers: (User & { password: string; twoFactorEnabled?: boolean })[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@restaurant.com',
    password: 'admin123',
    role: 'admin',
    phone: '+237 6 12 34 56 78',
    twoFactorEnabled: false,
  },
  {
    id: '2',
    name: 'Branch Manager',
    email: 'manager@restaurant.com',
    password: 'manager123',
    role: 'manager',
    branchId: '1',
    phone: '+237 6 23 45 67 89',
    twoFactorEnabled: false,
  },
  {
    id: '3',
    name: 'Waiter Staff',
    email: 'staff@restaurant.com',
    password: 'staff123',
    role: 'staff',
    branchId: '1',
    phone: '+237 6 34 56 78 90',
    twoFactorEnabled: false,
  },
  {
    id: '4',
    name: 'Multi-Branch Manager',
    email: 'multi@restaurant.com',
    password: 'multi123',
    role: 'manager',
    phone: '+237 6 45 67 89 01',
    twoFactorEnabled: false,
    // No branchId - has access to multiple branches
  },
  {
    id: '5',
    name: 'Secure Admin',
    email: '2fa@restaurant.com',
    password: 'secure123',
    role: 'admin',
    phone: '+237 6 56 78 90 12',
    twoFactorEnabled: true,
  },
];

// Mock storage for password reset tokens
const resetTokens: { [key: string]: { email: string; expires: number } } = {};

// Mock storage for registered users
let registeredUsers = [...mockUsers];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('rms_user');
    const storedBranchId = localStorage.getItem('rms_selected_branch');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedBranchId) {
      setSelectedBranchId(storedBranchId);
    }
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; requires2FA?: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock authentication
    const foundUser = registeredUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, twoFactorEnabled, ...userWithoutPassword } = foundUser;
      
      // Check if 2FA is enabled
      if (twoFactorEnabled) {
        setTempUser(userWithoutPassword);
        // In a real app, send OTP here
        console.log('2FA code sent to:', foundUser.phone);
        return { success: true, requires2FA: true };
      }

      // Regular login without 2FA
      setUser(userWithoutPassword);
      
      if (rememberMe) {
        localStorage.setItem('rms_user', JSON.stringify(userWithoutPassword));
      } else {
        sessionStorage.setItem('rms_user', JSON.stringify(userWithoutPassword));
      }
      
      // If user has a specific branch, set it
      if (userWithoutPassword.branchId) {
        setSelectedBranchId(userWithoutPassword.branchId);
        localStorage.setItem('rms_selected_branch', userWithoutPassword.branchId);
      }
      
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email already exists
    if (registeredUsers.find(u => u.email === data.email)) {
      return { success: false, error: 'Email already registered' };
    }

    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      return { success: false, error: 'Please fill in all required fields' };
    }

    // Create new user
    const newUser: User & { password: string } = {
      id: String(registeredUsers.length + 1),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'staff',
      phone: data.phone || '',
      branchId: data.branchId,
    };

    registeredUsers.push(newUser);
    
    return { success: true };
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundUser = registeredUsers.find(u => u.email === email);
    
    if (!foundUser) {
      // For security, don't reveal if email exists
      return { success: true };
    }

    // Generate mock reset token
    const token = Math.random().toString(36).substring(2);
    resetTokens[token] = {
      email,
      expires: Date.now() + 3600000, // 1 hour
    };

    // In a real app, send email with reset link
    console.log('Password reset link:', `http://localhost/reset-password?token=${token}`);
    
    return { success: true };
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const resetData = resetTokens[token];
    
    if (!resetData) {
      return { success: false, error: 'Invalid or expired reset link' };
    }

    if (Date.now() > resetData.expires) {
      delete resetTokens[token];
      return { success: false, error: 'Reset link has expired' };
    }

    // Update user password
    const userIndex = registeredUsers.findIndex(u => u.email === resetData.email);
    if (userIndex !== -1) {
      registeredUsers[userIndex].password = newPassword;
      delete resetTokens[token];
      return { success: true };
    }

    return { success: false, error: 'User not found' };
  };

  const verify2FA = async (code: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock OTP verification (in real app, verify with backend)
    // For demo, accept '123456' as valid code
    if (code === '123456') {
      if (tempUser) {
        setUser(tempUser);
        localStorage.setItem('rms_user', JSON.stringify(tempUser));
        setTempUser(null);
        
        // If user has a specific branch, set it
        if (tempUser.branchId) {
          setSelectedBranchId(tempUser.branchId);
          localStorage.setItem('rms_selected_branch', tempUser.branchId);
        }
        
        return { success: true };
      }
      return { success: false, error: 'Session expired. Please login again.' };
    }

    return { success: false, error: 'Invalid verification code' };
  };

  const selectBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    localStorage.setItem('rms_selected_branch', branchId);
  };

  const logout = () => {
    setUser(null);
    setTempUser(null);
    setSelectedBranchId(null);
    localStorage.removeItem('rms_user');
    sessionStorage.removeItem('rms_user');
    localStorage.removeItem('rms_selected_branch');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        register,
        forgotPassword,
        resetPassword,
        verify2FA,
        selectBranch,
        selectedBranchId,
        tempUser,
        setTempUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
