import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '../services/auth';
import { AuthError } from '../types/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await loginUser({ email, password });
    setLoading(false);

    if (result.success) {
      router.replace('/');
    } else {
      setError(result.error?.general || 'Login failed');
    }
  };

  return (
    <View className="flex-1 p-6 bg-white dark:bg-gray-900">
      <View className="max-w-sm w-full mx-auto">
        <Text className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
          Welcome Back
        </Text>

        <View className="space-y-4">
          {error && (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          )}

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
          </View>

          <TouchableOpacity
            className="w-full bg-blue-500 py-3 rounded-lg"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/register')}
            className="mt-4"
          >
            <Text className="text-blue-500 text-center">
              Don't have an account? Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 