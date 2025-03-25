import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, ScrollView, Image, Modal, Platform, ActivityIndicator, Alert, Linking } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import CameraView from '../components/CameraView';
import { PredictionResponse, AnalysisResult } from '../types';
import { getCurrentUser, logoutUser } from '../services/auth';
import treatments from '../src/treatments';
import doctor_data from "../assets/doctor_data.json";
// Rest of the code remains the same...

const supportedDiseases = [
  {
    name: "Acne and Rosacea",
    icon: "face-woman-shimmer",
  },
  {
    name: "Actinic Keratosis Basal Cell Carcinoma",
    icon: "hospital-box",
  },
  {
    name: "Eczema",
    icon: "bandage",
  },
  {
    name: "Melanoma Skin Cancer",
    icon: "alert-circle",
  },
  {
    name: "Psoriasis & Lichen Planus",
    icon: "medical-bag",
  },
  {
    name: "Fungal Infections",
    icon: "bacteria",
  },
  {
    name: "Urticaria Hives",
    icon: "dots-hexagon",
  },
  {
    name: "Nail Disease",
    icon: "hand",
  },
];

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [treatmentSuggestions, setTreatmentSuggestions] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(true);
  const router = useRouter();


  useEffect(() => {
    checkUser();
    (async () => {
      try {
        if (Platform.OS !== 'web') {
          const cameraStatus = await Camera.requestCameraPermissionsAsync();
          setHasCameraPermission(cameraStatus.status === 'granted');

          const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
          setHasGalleryPermission(galleryStatus.status === 'granted');
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Camera permission is required to use this feature'
        );
      }
    })();
  }, []);

  const checkUser = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.replace('/login');
    } else {
      setUsername(user.name);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  const handleImageSelection = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleCameraPress = async () => {
    if (Platform.OS === 'web') {
      alert('Camera is not available in web browser');
      return;
    }
    
    if (!hasCameraPermission) {
      alert('Camera permission is required to use this feature');
      return;
    }
    
    setShowCamera(true);
  };

  const handleCameraCapture = async (uri: string) => {
    try {
      setShowCamera(false);
      setSelectedImage(uri);
      // Process the image...
    } catch (error) {
      console.error('Camera capture error:', error);
      Alert.alert(
        'Error',
        'Failed to capture image. Please try again.'
      );
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64data = reader.result as string;
        
        try {
          const result = await fetch(
            'https://jaganathc-skindiseaseprediction.hf.space/run/predict',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                data: [base64data]
              })
            }
          );

          const data = await result.json();
          const [name, description, symptoms, causes, treatment] = data.data;
          
          // Get treatment suggestions based on the condition name
          const conditionKey = name.toLowerCase().replace(/\s+/g, '_');
          const suggestedTreatments = treatments[conditionKey] || [];
          setTreatmentSuggestions(suggestedTreatments);

          setAnalysisResult({
            name,
            description,
            symptoms,
            causes,
            treatment
          });
        } catch (error) {
          console.error('Analysis error:', error);
          setError('Failed to analyze image. Please try again.');
        } finally {
          setIsAnalyzing(false);
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Image processing error:', error);
      setError('Failed to process image. Please try again.');
      setIsAnalyzing(false);
    }
  };

const ResultSection = ({ title, content, suggestions }: { 
  title: string; 
  content: string;
  suggestions?: string[];
}) => (
  <View className="mb-4">
    <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
      {title}
    </Text>
    <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <Text className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
        {content}
      </Text>
      {suggestions && suggestions.length > 0 && (
        <View className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
          <Text className="text-gray-800 dark:text-gray-200 font-medium mb-2">
            Suggested Natural Treatments:
          </Text>
          {suggestions.map((suggestion, index) => (
            <View key={index} className="flex-row mb-2">
              <Text className="text-gray-600 dark:text-gray-300 mr-2">•</Text>
              <Text className="text-gray-600 dark:text-gray-300 flex-1">
                {suggestion}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  </View>
);

const DoctorRecommendations = () => (
  <View className="mb-4">
    <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
      Recommended Doctors
    </Text>
    <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      {doctor_data.doctors.map((doctor, index) => (
        <View key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm">
          <Text className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
            {doctor.name}
          </Text>
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-600 dark:text-gray-400">
              {doctor.specialization} • {doctor.experience}
            </Text>
            <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
              {doctor.consultationFee}
            </Text>
          </View>
          <View className="mt-2">
            <Text className="text-gray-500 dark:text-gray-500">
              {doctor.clinic}
            </Text>
            <Text className="text-gray-500 dark:text-gray-500">
              {doctor.location}
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 mt-2 py-2 px-4 rounded-lg"
              onPress={() => {
                if (doctor.referralLink) {
                  Linking.openURL(doctor.referralLink);
                }
              }}
            >
              <Text className="text-white text-center font-medium">
                Book Appointment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  </View>
);

  return (
    <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <View className="p-4">
        {/* User Info and Logout Section */}
        <View className="flex-row justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <View>
            <Text className="text-gray-600 dark:text-gray-400">Welcome,</Text>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {username}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Supported Diseases Grid */}
        <View className="p-4">
          <Text className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Supported Conditions
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {supportedDiseases.map((disease, index) => (
    <View
                key={index}
                className="w-[48%] bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm"
              >
                <MaterialCommunityIcons
                  name={disease.icon as any}
                  size={24}
                  color="#6366F1"
                  className="mb-2"
                />
                <Text className="text-gray-800 dark:text-gray-200 font-medium">
                  {disease.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upload Section */}
        <View className="p-4">
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
            <Text className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Upload Image
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mb-4">
              Submit an image of the affected area for analysis
            </Text>
            
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-48 rounded-lg mb-4"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 items-center justify-center">
                <MaterialCommunityIcons
                  name="image-off"
                  size={48}
                  color="#9CA3AF"
                />
                <Text className="text-gray-500 dark:text-gray-400 mt-2">
                  No image selected
                </Text>
              </View>
            )}

            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="flex-1 bg-indigo-600 rounded-lg p-4 items-center flex-row justify-center space-x-2"
                onPress={handleImageSelection}
              >
                <MaterialCommunityIcons name="image" size={24} color="white" />
                <Text className="text-white font-semibold">Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-indigo-600 rounded-lg p-4 items-center flex-row justify-center space-x-2"
                onPress={handleCameraPress}
              >
                <MaterialCommunityIcons name="camera" size={24} color="white" />
                <Text className="text-white font-semibold">Camera</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Analysis Section */}
          <View className="space-y-4">
            <TouchableOpacity
              className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 items-center ${
                !selectedImage ? 'opacity-50' : ''
              }`}
              onPress={analyzeImage}
              disabled={!selectedImage || isAnalyzing}
            >
              {isAnalyzing ? (
                <View className="flex-row items-center space-x-2">
                  <ActivityIndicator color="white" />
                  <Text className="text-white font-semibold">Analyzing...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold">Analyze Image</Text>
              )}
            </TouchableOpacity>

            {error && (
              <View className="bg-red-100 border border-red-400 rounded-lg p-4">
                <Text className="text-red-700">{error}</Text>
              </View>
            )}

            {analysisResult && (
              <View className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <View className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {analysisResult.name}
                  </Text>
                </View>

                <ResultSection 
                  title="Description" 
                  content={analysisResult.description} 
                />

                <ResultSection 
                  title="Symptoms" 
                  content={analysisResult.symptoms} 
                />

                <ResultSection 
                  title="Causes" 
                  content={analysisResult.causes} 
                />

                <ResultSection 
                  title="Treatment" 
                  content={analysisResult.treatment}
                  suggestions={treatmentSuggestions}
                />
                
                {/* Doctor recommendations shown only once */}
                <DoctorRecommendations />
                
                {/* Email Report Button */}
                <View className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <TouchableOpacity
                    className="bg-indigo-600 rounded-lg p-4 items-center flex-row justify-center space-x-2"
                    onPress={() => {
                      (async () => {
                        try {
                          // Check if user is logged in and has email
                          const user = await getCurrentUser();
                          
                          if (!user || !user.email) {
                            Alert.alert('Error', 'Please login to send email reports');
                            return;
                          }
                          
                          Alert.alert(
                            'Send Email Report',
                            `Send analysis report to ${user.email}?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Send', 
                                onPress: async () => {
                                  try {
                                    setIsAnalyzing(true);
                                    Alert.alert('Processing', 'Sending your report. This may take a few moments...');
                                    
                                    const sendEmailReport = require('../services/emailService').default;
                                    
                                    // Prepare email data
                                    const emailData = {
                                      results: analysisResult,
                                      treatments: treatmentSuggestions || []
                                    };
                                    
                                    // Send email
                                    const result = await sendEmailReport(user.email, emailData);
                                    
                                    // Show success message
                                    Alert.alert('Success', 'Report sent to your email successfully!');
                                  } catch (error: any) {
                                    console.error('Email error:', error.message);
                                    Alert.alert(
                                      'Email Error', 
                                      `Failed to send email: ${error.message || 'Unknown error'}`
                                    );
                                  } finally {
                                    setIsAnalyzing(false);
                                  }
                                }
                              }
                            ]
                          );
                        } catch (error) {
                          console.error('Error:', error);
                          Alert.alert('Error', 'Failed to prepare email report');
                        }
                      })();
                    }}
                  >
                    <MaterialCommunityIcons name="email-send" size={24} color="white" />
                    <Text className="text-white font-semibold">Email Report</Text>
                  </TouchableOpacity>
                </View>

                <View className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <TouchableOpacity
                    className="flex-row items-center justify-center space-x-2"
                    onPress={() => {
                      setAnalysisResult(null);
                      setSelectedImage(null);
                    }}
                  >
                    <MaterialCommunityIcons 
                      name="refresh" 
                      size={20} 
                      color="#6366F1" 
                    />
                    <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
                      Start New Analysis
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
    </View>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
      >
        <CameraView
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      </Modal>

      {/* Location Permission Modal */}
      <Modal
        visible={showLocationModal}
        animationType="fade"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 w-4/5 p-6 rounded-xl shadow-lg">
            <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Location Access
            </Text>
            <Text className="text-gray-600 dark:text-gray-300 mb-6">
              This app would like to use your location to provide better skin condition analysis based on environmental factors in your area.
            </Text>
            <TouchableOpacity
              className="bg-blue-500 py-3 rounded-lg w-full"
              onPress={() => {
                setShowLocationModal(false);
                // Note: We're not implementing actual location logic as per requirements
                // Just closing the modal on OK button press
              }}
            >
              <Text className="text-white text-center font-semibold">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
