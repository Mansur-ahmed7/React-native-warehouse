import React from "react";
import { View, Text, Pressable } from "react-native";
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
}: {
  activeTab: TabName;
  cartCount: number;
  onTabChange: (tab: TabName) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-3 pt-2 shadow-lg"
    >
      <View className="flex-row items-center justify-between">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
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
                className={`font-poppins-bold text-[10.5px] mt-1 ${
                  isActive ? "text-[#0066FF]" : "text-slate-400"
                }`}
                numberOfLines={1}
              >
                {item.label}
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
  const { activeTab, showReceipt, cartItemCount, setActiveTab, toast } = useWarehouseStore();

  return (
    <View className="flex-1 bg-[#F6F7FB]">
      <StatusBar backgroundColor="#F6F7FB" style="dark" />
      <View className="flex-1 pb-[92px] pt-14">
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
          className={`absolute top-14 left-6 right-6 rounded-2xl px-4 py-3 shadow-lg ${
            toast.isError ? "bg-red-600" : "bg-green-600"
          }`}
        >
          <Text className="font-poppins-bold text-[14px] text-white text-center">
            {toast.message}
          </Text>
        </View>
      )}

      <BottomNav activeTab={activeTab} cartCount={cartItemCount()} onTabChange={setActiveTab} />
    </View>
  );
}
