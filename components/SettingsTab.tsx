import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useWarehouseStore } from "../store/useWarehouseStore";

export default function SettingsTab() {
  const { settings, setLanguage, setTheme, setExchangeRate, setActiveTab } =
    useWarehouseStore();
  const [rateText, setRateText] = useState(String(settings.exchangeRate));

  const handleRateChange = (value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    setRateText(clean);
    const parsed = parseInt(clean, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setExchangeRate(parsed);
    }
  };

  return (
    <View className="flex-1 px-6">
      <Text className="font-poppins-bold text-[34px] text-text-primary leading-[42px] mb-5">
        Settings / ڕێێکخستن
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-5">
          <SectionHeader icon="translate" title="LANGUAGE" color="#8B5CF6" />
          <RadioRow
            label="English"
            selected={settings.language === "en"}
            onPress={() => setLanguage("en")}
          />
          <RadioRow
            label="کوردی (سۆرانی)"
            selected={settings.language === "ku"}
            onPress={() => setLanguage("ku")}
          />
        </View>

        <View className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-5">
          <SectionHeader icon="theme-light-dark" title="THEME" color="#0066FF" />
          <RadioRow
            label="Light Mode"
            selected={settings.theme === "light"}
            onPress={() => setTheme("light")}
          />
          <RadioRow
            label="Dark Mode"
            selected={settings.theme === "dark"}
            onPress={() => setTheme("dark")}
          />
        </View>

        <View className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 mb-5">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons color="#10B981" name="swap-horizontal" size={22} />
            <Text className="font-poppins-bold text-[13px] text-text-secondary ml-2">
              EXCHANGE RATE
            </Text>
          </View>
          <View className="flex-row items-center bg-[#F6F7FB] border border-gray-200 rounded-2xl px-4 py-3">
            <Text className="font-poppins-semibold text-[14px] text-text-secondary mr-2">
              1 USD =
            </Text>
            <TextInput
              value={rateText}
              onChangeText={handleRateChange}
              keyboardType="number-pad"
              style={{
                flex: 1,
                fontFamily: "Poppins-Bold",
                fontSize: 18,
                color: "#0F172A",
                padding: 0,
                margin: 0,
                textAlign: "right",
              }}
            />
            <Text className="font-poppins-semibold text-[14px] text-text-secondary ml-2">
              IQD
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-6">
          <SectionHeader icon="account-circle-outline" title="ACCOUNT" color="#475569" />
          <InfoRow icon="account-outline" label="Staff Member" value="Warehouse Staff" />
          <InfoRow icon="logout" label="Log Out" value="" danger />
        </View>

        <Pressable
          onPress={() => setActiveTab("sale")}
          className="w-full flex-row items-center justify-center rounded-2xl bg-[#0066FF] py-4.5 active:bg-blue-700 shadow-md"
        >
          <MaterialCommunityIcons color="#FFFFFF" name="plus-circle-outline" size={20} />
          <Text className="font-poppins-bold text-[16px] text-white ml-2">
            Record New Sale
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SectionHeader({
  icon,
  title,
  color,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  color: string;
}) {
  return (
    <View className="flex-row items-center px-5 pt-5 pb-2">
      <MaterialCommunityIcons color={color} name={icon} size={22} />
      <Text className="font-poppins-bold text-[12px] text-text-secondary ml-2">
        {title}
      </Text>
    </View>
  );
}

function RadioRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-5 py-4 border-t border-gray-50 active:bg-gray-50"
    >
      <Text className="font-poppins-semibold text-[15px] text-text-primary">{label}</Text>
      <View
        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          selected ? "border-[#0066FF]" : "border-gray-300"
        }`}
      >
        {selected && <View className="w-3 h-3 rounded-full bg-[#0066FF]" />}
      </View>
    </Pressable>
  );
}

function InfoRow({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4 border-t border-gray-50">
      <View className="flex-row items-center">
        <MaterialCommunityIcons color={danger ? "#DC2626" : "#64748B"} name={icon} size={21} />
        <Text
          className={`font-poppins-semibold text-[15px] ml-3 ${
            danger ? "text-red-600" : "text-text-primary"
          }`}
        >
          {label}
        </Text>
      </View>
      {value ? (
        <Text className="font-poppins-bold text-[13px] text-text-secondary">{value}</Text>
      ) : null}
    </View>
  );
}
