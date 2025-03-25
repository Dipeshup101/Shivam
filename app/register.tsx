import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '../services/auth';
import { AuthError } from '../types/auth';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<AuthError>({});
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: AuthError = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const result = await registerUser({ name, email, password });
    setLoading(false);

    if (result.success) {
      router.replace('/');
    } else {
      setErrors(result.error || {});
    }
  };

  return (
    <View className="flex-1 p-6 bg-white dark:bg-gray-900">
      <View className="max-w-sm w-full mx-auto">
        <Text className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
          Create Account
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-600 dark:text-gray-300 mb-2">Name</Text>
            <TextInput
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
            {errors.name && (
              <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-600 dark:text-gray-300 mb-2">Email</Text>
            <TextInput
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-600 dark:text-gray-300 mb-2">Password</Text>
            <TextInput
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
            )}
          </View>

          <TouchableOpacity
            className="w-full bg-blue-500 py-3 rounded-lg"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/login')}
            className="mt-4"
          >
            <Text className="text-blue-500 text-center">
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 