import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, AuthError } from '../types/auth';

export const registerUser = async (userData: User): Promise<{ success: boolean; error?: AuthError }> => {
  try {
    // Get existing users
    const existingUsers = await AsyncStorage.getItem('users');
    const users: User[] = existingUsers ? JSON.parse(existingUsers) : [];

    // Check if email already exists
    if (users.some(user => user.email === userData.email)) {
      return {
        success: false,
        error: { email: 'Email already registered' }
      };
    }

    // Add new user
    users.push(userData);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    await AsyncStorage.setItem('currentUser', JSON.stringify(userData));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { general: 'Registration failed. Please try again.' }
    };
  }
};

export const loginUser = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: AuthError; user?: User }> => {
  try {
    const existingUsers = await AsyncStorage.getItem('users');
    const users: User[] = existingUsers ? JSON.parse(existingUsers) : [];

    const user = users.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      return {
        success: false,
        error: { general: 'Invalid email or password' }
      };
    }

    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: { general: 'Login failed. Please try again.' }
    };
  }
};

export const logoutUser = async (): Promise<void> => {
  await AsyncStorage.removeItem('currentUser');
};

export const getCurrentUser = async (): Promise<User | null> => {
  const userString = await AsyncStorage.getItem('currentUser');
  return userString ? JSON.parse(userString) : null;
}; 