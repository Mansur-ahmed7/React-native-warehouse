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
import { VerificationModal } from "@/components/verification-modal";
import { useAuthStore } from "@/store/useAuthStore";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Simple email validation regex
  const isEmailValid = /\S+@\S+\.\S+/.test(email);

  const handleSignIn = () => {
    if (!email) return;
    setIsModalVisible(true);
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

          {/* Form Card (Email input ONLY, NO PASSWORD field) */}
          <View className="w-full gap-4 mb-6">
            {/* Email Field */}
            <View className="w-full flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
              <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                <MaterialCommunityIcons
                  color="#2563EB"
                  name="email-outline"
                  size={20}
                />
              </View>
              <View className="flex-1">
                <Text className="font-poppins-medium text-[11px] text-text-secondary leading-[13px]">
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="alex@gmail.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="font-poppins-semibold text-[15px] text-text-primary p-0 m-0 mt-0.5"
                />
              </View>
              {isEmailValid && (
                <MaterialCommunityIcons
                  color="#10B981"
                  name="check-circle"
                  size={22}
                />
              )}
            </View>
          </View>

          {/* Action Button */}
          <Pressable
            onPress={handleSignIn}
            className={`w-full flex-row items-center justify-center rounded-[20px] bg-[#4A3DFF] py-4.5 mb-6 active:bg-blue-700 shadow-sm ${
              !email ? "opacity-60" : ""
            }`}
            disabled={!email}
          >
            <Text className="font-poppins-semibold text-[18px] text-white">
              Sign In
            </Text>
            <View className="absolute right-5">
              <MaterialCommunityIcons color="#FFFFFF" name="arrow-right" size={20} />
            </View>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center justify-center mb-6">
            <View className="flex-grow h-[1px] bg-gray-200" />
            <Text className="font-poppins-medium text-[12px] text-text-secondary px-3 uppercase tracking-wider">
              or continue with
            </Text>
            <View className="flex-grow h-[1px] bg-gray-200" />
          </View>

          {/* Social Auth List */}
          <View className="gap-3.5 mb-8">
            <Pressable className="w-full flex-row items-center justify-center bg-white rounded-2xl py-3.5 border border-gray-100 shadow-sm active:bg-gray-50">
              <MaterialCommunityIcons color="#EA4335" name="google" size={20} />
              <Text className="font-poppins-semibold text-[15px] text-text-primary ml-3">
                Continue with Google
              </Text>
            </Pressable>

            <Pressable className="w-full flex-row items-center justify-center bg-white rounded-2xl py-3.5 border border-gray-100 shadow-sm active:bg-gray-50">
              <MaterialCommunityIcons color="#1877F2" name="facebook" size={20} />
              <Text className="font-poppins-semibold text-[15px] text-text-primary ml-3">
                Continue with Facebook
              </Text>
            </Pressable>

            <Pressable className="w-full flex-row items-center justify-center bg-white rounded-2xl py-3.5 border border-gray-100 shadow-sm active:bg-gray-50">
              <MaterialCommunityIcons color="#000000" name="apple" size={20} />
              <Text className="font-poppins-semibold text-[15px] text-text-primary ml-3">
                Continue with Apple
              </Text>
            </Pressable>
          </View>

          {/* Bottom Navigation Link */}
          <View className="flex-row justify-center items-center">
            <Text className="font-poppins-medium text-[14px] text-text-secondary">
              {"Don't have an account? "}
            </Text>
            <Pressable
              onPress={() => router.push("/(auth)/signup")}
              className="active:opacity-60"
            >
              <Text className="font-poppins-bold text-[14px] text-[#4A3DFF]">
                Sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Verification modal */}
      <VerificationModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        email={email}
        onSuccess={() => {
          login(email);
        }}
      />
    </KeyboardAvoidingView>
  );
}
