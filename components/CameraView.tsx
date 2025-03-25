import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';

interface CameraViewProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
}

export default function CameraView({ onCapture, onClose }: CameraViewProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>(CameraType.back);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not ready');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        exif: false
      });
      onCapture(photo.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
      console.error(error);
    }
  };

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  // Show loading state while checking permissions
  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Requesting camera permission...</Text>
      </View>
    );
  }

  // Show error if permission denied
  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white mb-4">No access to camera</Text>
        <TouchableOpacity 
          onPress={onClose}
          className="bg-white px-4 py-2 rounded"
        >
          <Text>Close Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg">
          Camera is not supported in web browser
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="mt-4 bg-white rounded-lg px-4 py-2"
        >
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Camera 
        ref={cameraRef}
        type={type}
        className="flex-1"
      >
        <View className="flex-1">
          <View className="flex-row justify-between items-center px-4 pt-12">
            <TouchableOpacity 
              onPress={onClose}
              className="p-2"
            >
              <MaterialCommunityIcons name="close" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={toggleCameraType}
              className="p-2"
            >
              <MaterialCommunityIcons name="camera-flip" size={32} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 justify-end pb-10">
            <View className="flex-row justify-center">
              <TouchableOpacity
                onPress={takePicture}
                className="w-20 h-20 bg-white rounded-full items-center justify-center"
              >
                <View className="w-16 h-16 bg-white rounded-full border-4 border-gray-800" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Camera>
    </View>
  );
} 