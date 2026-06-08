import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import InventoryTab from "../components/InventoryTab";
import ReceiptOverlay from "../components/ReceiptOverlay";
import ReportsTab from "../components/ReportsTab";
import SaleTab from "../components/SaleTab";
import ScannerTab from "../components/ScannerTab";
import SettingsTab from "../components/SettingsTab";
import { useWarehouseStore } from "../store/useWarehouseStore";
import { TabName } from "../types/inventory";

const navItems: { key: TabName; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: "inventory", label: "Inventory", icon: "package-variant-closed" },
  { key: "scanner", label: "Scanner", icon: "barcode-scan" },
  { key: "sale", label: "Sale", icon: "cart-outline" },
  { key: "reports", label: "Reports", icon: "chart-box-outline" },
  { key: "settings", label: "Settings", icon: "cog-outline" },
];

function BottomNav({
  activeTab,
  cartCount,
  onTabChange,
  language,
}: {
  activeTab: TabName;
  cartCount: number;
  onTabChange: (tab: TabName) => void;
  language: string;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      className={`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 pt-2 shadow-lg ${
        isSmallScreen ? "px-1.5" : "px-3"
      }`}
    >
      <View className="flex-row items-center justify-between">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          let displayLabel = item.label;
          if (language === "ku") {
            if (item.key === "inventory") displayLabel = "کۆگا";
            if (item.key === "scanner") displayLabel = "سکانەر";
            if (item.key === "sale") displayLabel = "فرۆشتن";
            if (item.key === "reports") displayLabel = "راپۆرتەکان";
            if (item.key === "settings") displayLabel = "ڕێکخستنەکان";
          }
          const showBadge = item.key === "sale" && cartCount > 0;

          return (
            <Pressable
              key={item.key}
              onPress={() => onTabChange(item.key)}
              className="flex-1 min-h-[58px] items-center justify-center active:opacity-80"
            >
              <View className="relative">
                <MaterialCommunityIcons
                  color={isActive ? "#0066FF" : "#94A3B8"}
                  name={item.icon}
                  size={24}
                />
                {showBadge && (
                  <View className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 items-center justify-center border-2 border-white">
                    <Text className="font-poppins-bold text-[10px] text-white leading-[12px]">
                      {cartCount > 99 ? "99+" : cartCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                className={`font-poppins-bold mt-1 ${
                  isActive ? "text-[#0066FF]" : "text-slate-400"
                }`}
                style={{ fontSize: isSmallScreen ? 9.5 : 10.5 }}
                numberOfLines={1}
              >
                {displayLabel}
              </Text>
              <View
                className={`w-1.5 h-1.5 rounded-full mt-1 ${
                  isActive ? "bg-[#0066FF]" : "bg-transparent"
                }`}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function Index() {
  const { activeTab, showReceipt, cartItemCount, setActiveTab, toast, settings } = useWarehouseStore();
  const insets = useSafeAreaInsets();

  const paddingTop = Math.max(insets.top, 16);
  const bottomNavHeight = 66 + Math.max(insets.bottom, 12);

  return (
    <View className="flex-1 bg-[#F6F7FB]">
      <StatusBar backgroundColor="#F6F7FB" style="dark" />
      <View 
        style={{ paddingTop, paddingBottom: bottomNavHeight }}
        className="flex-1"
      >
        {activeTab === "inventory" && <InventoryTab />}
        {activeTab === "scanner" && <ScannerTab />}
        {activeTab === "sale" && <SaleTab />}
        {activeTab === "reports" && <ReportsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </View>

      {showReceipt && <ReceiptOverlay />}

      {toast && (
        <View
          pointerEvents="none"
          style={{ top: Math.max(insets.top, 16) }}
          className={`absolute left-6 right-6 rounded-2xl px-4 py-3 shadow-lg ${
            toast.isError ? "bg-red-600" : "bg-green-600"
          }`}
        >
          <Text className="font-poppins-bold text-[14px] text-white text-center">
            {toast.message}
          </Text>
        </View>
      )}

      <BottomNav
        activeTab={activeTab}
        cartCount={cartItemCount()}
        onTabChange={setActiveTab}
        language={settings.language}
      />
    </View>
  );
}
