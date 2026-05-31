import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  onSuccess: () => void;
}

export function VerificationModal({
  visible,
  onClose,
  email,
  onSuccess,
}: VerificationModalProps) {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState<number>(59);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Reset timer on visibility change
  useEffect(() => {
    if (visible) {
      setTimer(59);
      setCode(Array(6).fill(""));
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    }
  }, [visible]);

  // Countdown timer
  useEffect(() => {
    if (!visible || timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [visible, timer]);

  // Handle digit change
  const handleChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    if (!cleanText) return;

    const newCode = [...code];
    // Take the last character typed
    const digit = cleanText[cleanText.length - 1];
    newCode[index] = digit;
    setCode(newCode);

    // Auto-advance to the next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // Last digit entered
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        handleVerify(newCode);
      }
    }
  };

  // Handle keypress (specifically Backspace)
  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      const newCode = [...code];
      
      if (newCode[index] !== "") {
        // If current box is not empty, clear it
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        // If current box is empty, clear previous box and focus it
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = (finalCode: string[]) => {
    setIsVerifying(true);
    // Mock API verification call
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess();
      onClose();
      // Navigate to home route (/)
      router.replace("/");
    }, 1200);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/60"
      >
        <View className="w-full bg-white rounded-t-[36px] px-7 pb-10 pt-8 shadow-2xl">
          {/* Top Grabber Indicator */}
          <View className="w-12 h-1.5 bg-gray-200 rounded-full align-self-center mx-auto mb-6" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="font-poppins-bold text-[24px] text-text-primary">
              Verify Code
            </Text>
            <Pressable
              onPress={onClose}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
            >
              <MaterialCommunityIcons color="#0F172A" name="close" size={24} />
            </Pressable>
          </View>

          {/* Info */}
          <View className="mb-8">
            <Text className="font-poppins-medium text-[16px] text-text-secondary leading-[22px]">
              We have sent a 6-digit verification code to
            </Text>
            <Text className="font-poppins-semibold text-[16px] text-[#4A3DFF] mt-1">
              {email || "your email address"}
            </Text>
          </View>

          {/* Verification Code Box Input Row */}
          <View className="flex-row justify-between mb-8" style={{ direction: "ltr" }}>
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <View
                  key={i}
                  className={`w-[46px] h-[58px] rounded-[14px] border-2 bg-[#F6F7FB] items-center justify-center ${
                    code[i] ? "border-[#4A3DFF]" : "border-gray-200"
                  }`}
                >
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[i] = ref;
                    }}
                    value={code[i]}
                    onChangeText={(text) => handleChange(text, i)}
                    onKeyPress={(e) => handleKeyPress(e, i)}
                    keyboardType="number-pad"
                    maxLength={2} // Allows overwriting
                    className="w-full h-full text-center font-poppins-bold text-[22px] text-text-primary"
                    selectTextOnFocus
                    style={{ textAlign: "center" }}
                  />
                </View>
              ))}
          </View>

          {/* Verifying Indicator or Action Row */}
          {isVerifying ? (
            <View className="flex-row justify-center items-center h-12 mb-4">
              <ActivityIndicator color="#4A3DFF" size="small" />
              <Text className="font-poppins-medium text-[15px] text-text-secondary ml-3">
                Verifying code...
              </Text>
            </View>
          ) : (
            <View className="items-center mb-6">
              {timer > 0 ? (
                <Text className="font-poppins-medium text-[15px] text-text-secondary">
                  Resend code in{" "}
                  <Text className="font-poppins-semibold text-[#4A3DFF]">
                    0:{timer < 10 ? `0${timer}` : timer}
                  </Text>
                </Text>
              ) : (
                <Pressable
                  onPress={() => {
                    setTimer(59);
                    setCode(Array(6).fill(""));
                    inputRefs.current[0]?.focus();
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-full active:bg-gray-200"
                >
                  <Text className="font-poppins-semibold text-[15px] text-[#4A3DFF]">
                    Resend Code
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Secure Note */}
          <View className="flex-row items-center justify-center bg-blue-50/50 rounded-2xl py-3 px-4">
            <MaterialCommunityIcons
              color="#2563EB"
              name="shield-check-outline"
              size={20}
            />
            <Text className="font-poppins-medium text-[13px] text-blue-700 ml-2">
              Secured warehouse database access verification.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
