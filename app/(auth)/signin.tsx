import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";

import { images } from "@/constants/images";
import { useAuthStore } from "@/store/useAuthStore";

const PREDEFINED_USERS = [
  { username: "admin", password: "admin123", name: "Admin Manager" },
  { username: "staff1", password: "staff123", name: "Staff Member 1" },
  { username: "staff2", password: "staff223", name: "Staff Member 2" },
  { username: "staff3", password: "staff323", name: "Staff Member 3" },
  { username: "staff4", password: "staff423", name: "Staff Member 4" },
  { username: "staff5", password: "staff523", name: "Staff Member 5" },
  { username: "staff6", password: "staff623", name: "Staff Member 6" },
  { username: "staff7", password: "staff723", name: "Staff Member 7" },
  { username: "staff8", password: "staff823", name: "Staff Member 8" },
  { username: "staff9", password: "staff923", name: "Staff Member 9" },
  { username: "staff10", password: "staff1023", name: "Staff Member 10" },
];

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = () => {
    setErrorMessage("");
    if (!username || !password) return;

    const matchedUser = PREDEFINED_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password
    );

    if (matchedUser) {
      login(matchedUser.username);
      router.replace("/");
    } else {
      setErrorMessage("Invalid username or password");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#F6F7FB]"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <View className="px-6">
          {/* Header Row */}
          <View className="flex-row items-center justify-between w-full mb-3">
            <Pressable
              onPress={() => router.back()}
              className="w-11 h-11 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 active:bg-gray-100"
            >
              <MaterialCommunityIcons
                color="#0F172A"
                name="chevron-left"
                size={28}
              />
            </Pressable>

            {/* Logo and Brand Title */}
            <View className="flex-row items-center">
              <Image
                source={images.logo}
                className="w-8 h-8 mr-2"
                contentFit="contain"
              />
              <View>
                <Text className="font-poppins-bold text-[16px] text-text-primary leading-[18px]">
                  Warehouse
                </Text>
                <Text className="font-poppins-semibold text-[9px] text-[#2563EB] tracking-[3px] uppercase mt-[-2px]">
                  CAR PARTS
                </Text>
              </View>
            </View>

            {/* Placeholder to balance layout */}
            <View className="w-11" />
          </View>

          {/* Titles */}
          <View className="items-center mb-4">
            <Text className="font-poppins-bold text-[28px] text-text-primary text-center">
              Welcome back
            </Text>
            <Text className="font-poppins-medium text-[14px] text-text-secondary text-center px-4 mt-1 leading-[20px]">
              Sign in to manage your warehouse inventory. ✨
            </Text>
          </View>

          {/* Central 3D Illustration Segment */}
          <View className="align-self-center mx-auto relative w-[240px] h-[190px] items-center justify-center overflow-hidden bg-[#EDF4FF] rounded-[36px] mb-6">
            {/* Background elements */}
            <View className="absolute bottom-0 h-[130px] w-full bg-[#E5EDFA]" />
            <View className="absolute bottom-0 left-[-20px] h-[90px] w-[120px] rounded-t-[30px] bg-white/40" />
            <View className="absolute bottom-0 right-[-30px] h-[100px] w-[140px] rounded-t-[32px] bg-white/40" />

            {/* Floating feature graphics */}
            <View className="absolute left-3 top-10 w-9 h-9 items-center justify-center rounded-[8px] bg-white shadow-sm">
              <MaterialCommunityIcons color="#2563EB" name="barcode" size={18} />
            </View>
            <View className="absolute right-3 top-12 w-9 h-9 items-center justify-center rounded-[8px] bg-white shadow-sm">
              <MaterialCommunityIcons
                color="#F5A623"
                name="package-variant-closed"
                size={18}
              />
            </View>

            <View className="absolute left-10 top-2 w-3 h-3 rounded-full bg-blue-300 opacity-60" />
            <View className="absolute right-14 top-4 w-2 h-2 rounded-full bg-purple-300 opacity-60" />

            {/* Worker Character Image */}
            <Image
              source={images.welcome}
              style={{ width: 160, height: 180, position: "absolute", bottom: -10 }}
              contentFit="contain"
            />
          </View>

          {/* Form Card */}
          <View className="w-full gap-4 mb-6">
            {/* Username Field */}
            <View className="w-full flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
              <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                <MaterialCommunityIcons
                  color="#2563EB"
                  name="account-outline"
                  size={20}
                />
              </View>
              <View className="flex-1">
                <Text className="font-poppins-medium text-[11px] text-text-secondary leading-[13px]">
                  Username
                </Text>
                <TextInput
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setErrorMessage("");
                  }}
                  placeholder="admin or staff1"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="font-poppins-semibold text-[15px] text-text-primary p-0 m-0 mt-0.5"
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="w-full flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
              <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                <MaterialCommunityIcons
                  color="#2563EB"
                  name="lock-outline"
                  size={20}
                />
              </View>
              <View className="flex-1">
                <Text className="font-poppins-medium text-[11px] text-text-secondary leading-[13px]">
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrorMessage("");
                  }}
                  placeholder="•••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  className="font-poppins-semibold text-[15px] text-text-primary p-0 m-0 mt-0.5"
                />
              </View>
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="w-8 h-8 items-center justify-center active:opacity-60"
              >
                <MaterialCommunityIcons
                  color="#6B7280"
                  name={showPassword ? "eye" : "eye-off-outline"}
                  size={20}
                />
              </Pressable>
            </View>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text className="font-poppins-semibold text-[13px] text-red-500 text-center mb-4">
              {errorMessage}
            </Text>
          ) : null}

          {/* Action Button */}
          <Pressable
            onPress={handleSignIn}
            className={`w-full flex-row items-center justify-center rounded-[20px] bg-[#4A3DFF] py-4.5 mb-6 active:bg-blue-700 shadow-sm ${
              !username || !password ? "opacity-60" : ""
            }`}
            disabled={!username || !password}
          >
            <Text className="font-poppins-semibold text-[18px] text-white">
              Sign In
            </Text>
            <View className="absolute right-5">
              <MaterialCommunityIcons color="#FFFFFF" name="arrow-right" size={20} />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
