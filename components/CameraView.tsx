import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CameraViewProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const [type, setType] = useState(CameraType.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef<Camera>(null);

  const toggleCameraType = () => {
    setType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const toggleFlash = () => {
    setFlash(current => 
      current === Camera.Constants.FlashMode.off 
        ? Camera.Constants.FlashMode.on 
        : Camera.Constants.FlashMode.off
    );
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        onCapture(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        type={type}
        flashMode={flash}
        style={styles.camera}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.headerButton}
          >
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={toggleFlash}
            style={styles.headerButton}
          >
            <MaterialCommunityIcons 
              name={flash === Camera.Constants.FlashMode.on ? "flash" : "flash-off"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={toggleCameraType}
            style={styles.footerButton}
          >
            <MaterialCommunityIcons name="camera-flip" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={takePicture}
            style={styles.captureButton}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
          
          <View style={styles.placeholder} />
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerButton: {
    padding: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  footerButton: {
    padding: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  placeholder: {
    width: 48,
    height: 48,
  },
});

export default CameraView; 