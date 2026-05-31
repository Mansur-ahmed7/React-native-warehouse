import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useWarehouseStore } from "../store/useWarehouseStore";
import { Part } from "../types/inventory";
import { images } from "../constants/images";

export default function SaleTab() {
  // Store Slices & Actions
  const {
    cart,
    parts,
    removeFromCart,
    updateCartQty,
    completeSale,
    clearCart,
    setActiveTab,
    triggerToast,
  } = useWarehouseStore();

  // Local Checkout States
  const [amountPaidIQD, setAmountPaidIQD] = useState("");
  const [discountIQD, setDiscountIQD] = useState("0");

  // Map parts to their premium product images
  const getPartImage = (part: Part) => {
    const nameLower = part.name.toLowerCase();
    if (nameLower.includes("brake") || nameLower.includes("pad")) {
      return images.brakePads;
    }
    if (nameLower.includes("filter")) {
      return images.oilFilter;
    }
    if (nameLower.includes("spark") || nameLower.includes("plug")) {
      return images.sparkPlug;
    }
    if (nameLower.includes("alloy") || nameLower.includes("wheel")) {
      return images.alloyWheel;
    }
    return null;
  };

  // If cart is empty, render the beautiful empty state placeholder
  if (cart.length === 0) {
    return (
      <View className="flex-1 px-6 items-center justify-center">
        <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-4">
          <MaterialCommunityIcons color="#0066FF" name="shopping-outline" size={42} />
        </View>
        <Text className="font-poppins-bold text-[20px] text-text-primary text-center">
          Your cart is empty
        </Text>
        <Text className="font-poppins-medium text-[13.5px] text-text-secondary mt-1.5 text-center px-10 leading-[20px]">
          Scan barcodes or search items under the Scanner tab to build a sale instantly.
        </Text>
        <Pressable
          onPress={() => setActiveTab("scanner")}
          className="mt-6 bg-[#0066FF] px-7 py-3 rounded-full active:bg-blue-700 shadow-md"
        >
          <Text className="font-poppins-bold text-[14px] text-white">
            Go to Scanner
          </Text>
        </Pressable>
      </View>
    );
  }

  // Calculate Subtotals
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalTypes = cart.length;

  const cleanDiscount = parseInt(discountIQD.replace(/[^0-9]/g, "")) || 0;
  const cartTotal = Math.max(0, cartSubtotal - cleanDiscount);
  const cleanAmountPaid = parseInt(amountPaidIQD.replace(/[^0-9]/g, "")) || 0;
  const changeReturnIQD = Math.max(0, cleanAmountPaid - cartTotal);

  // Complete Sale Checkout modifier
  const handleCompleteCheckout = () => {
    if (cleanAmountPaid < cartTotal) {
      triggerToast("✗ Insufficient amount received", true);
      return;
    }
    // complete sale in store
    completeSale(cleanAmountPaid, cleanDiscount);
    
    // Clear Local checkout form states
    setAmountPaidIQD("");
    setDiscountIQD("0");
  };

  return (
    <View className="flex-1 px-6">
      <View className="mb-4">
        <Text className="font-poppins-bold text-[34px] text-text-primary leading-[42px]">
          Sale / فرۆشتن
        </Text>
        <Text className="font-poppins-semibold text-[13.5px] text-gray-400 mt-1">
          Add items to the sale
        </Text>
      </View>

      {/* Quick navigation Scanner row */}
      <View className="flex-row gap-3.5 mb-5">
        <Pressable
          onPress={() => setActiveTab("scanner")}
          className="flex-1 flex-row items-center justify-center py-3 bg-[#0066FF]/5 border border-[#0066FF]/20 rounded-xl active:bg-[#0066FF]/10"
        >
          <MaterialCommunityIcons color="#0066FF" name="barcode-scan" size={18} className="mr-2" />
          <Text className="font-poppins-bold text-[14px] text-[#0066FF]">Scan Barcode</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("scanner")}
          className="flex-1 flex-row items-center justify-center py-3 bg-white border border-gray-200 rounded-xl active:bg-gray-50"
        >
          <MaterialCommunityIcons color="#6B7280" name="magnify" size={18} className="mr-2" />
          <Text className="font-poppins-bold text-[14px] text-text-secondary">Search Item</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Text className="font-poppins-bold text-[14.5px] text-text-primary mb-3">
          Items in Sale
        </Text>

        {/* Cart items cards list */}
        <View className="gap-3.5 mb-5">
          {cart.map((item) => {
            const part = parts.find((p) => p.id === item.partId);
            if (!part) return null;
            const partImg = getPartImage(part);

            return (
              <View
                key={item.partId}
                className="flex-row bg-white rounded-2xl p-3 border border-gray-150 shadow-sm items-center justify-between"
              >
                <View className="flex-row items-center flex-1 pr-3">
                  {/* Photo thumbnail */}
                  <View className="w-12 h-12 rounded-xl bg-gray-50 mr-3 items-center justify-center overflow-hidden border border-gray-100">
                    {partImg ? (
                      <Image source={partImg} style={{ width: "100%", height: "100%" }} />
                    ) : (
                      <Text className="font-poppins-bold text-[14px] text-blue-600">
                        {(part.compatibleCars[0]?.brand || "T").charAt(0)}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-bold text-[14.5px] text-text-primary" numberOfLines={1}>
                      {part.name}
                    </Text>
                    {part.nameKu && (
                      <Text className="font-poppins-semibold text-[11.5px] text-gray-400 leading-[14px] mt-0.5">
                        {part.nameKu}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Quantity Stepper Adjusters & Trash delete icon */}
                <View className="flex-row items-center gap-3">
                  <View className="items-end">
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-2 py-1.5 border border-gray-100">
                      <Pressable
                        onPress={() => updateCartQty(item.partId, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white items-center justify-center border border-gray-100 active:bg-gray-100"
                      >
                        <MaterialCommunityIcons color="#475569" name="minus" size={14} />
                      </Pressable>
                      <Text className="font-poppins-bold text-[14px] text-text-primary mx-3">
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => updateCartQty(item.partId, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white items-center justify-center border border-gray-100 active:bg-gray-100"
                      >
                        <MaterialCommunityIcons color="#0066FF" name="plus" size={14} />
                      </Pressable>
                    </View>
                    <Text className="font-poppins-bold text-[13px] text-text-primary mt-1.5 mr-1">
                      {(item.unitPrice * item.quantity).toLocaleString()} IQD
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => removeFromCart(item.partId)}
                    className="w-9 h-9 items-center justify-center rounded-xl bg-red-50 border border-red-150 active:bg-red-100"
                  >
                    <MaterialCommunityIcons color="#EF4444" name="trash-can-outline" size={18} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        {/* Totals Summary Calculations card */}
        <View className="bg-white rounded-[24px] p-5 border border-gray-200 shadow-sm mb-5 gap-3.5">
          <View className="flex-row justify-between">
            <Text className="font-poppins-semibold text-[14px] text-text-secondary">Items:</Text>
            <Text className="font-poppins-bold text-[14px] text-text-primary">{totalTypes} types, {totalUnits} units</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-poppins-semibold text-[14px] text-text-secondary">Subtotal:</Text>
            <Text className="font-poppins-bold text-[14px] text-text-primary">{cartSubtotal.toLocaleString()} IQD</Text>
          </View>

          {/* Commas Formatted Discount Input box */}
          <View className="flex-row justify-between items-center">
            <Text className="font-poppins-semibold text-[14px] text-text-secondary">Discount:</Text>
            <View className="flex-row items-center bg-[#F6F7FB] border border-gray-200 rounded-xl px-3 py-1.5 w-28">
              <TextInput
                value={discountIQD}
                onChangeText={(text) => {
                  const clean = text.replace(/[^0-9]/g, "");
                  setDiscountIQD(clean ? parseInt(clean).toLocaleString() : "0");
                }}
                keyboardType="number-pad"
                style={{
                  flex: 1,
                  fontFamily: "Poppins-Bold",
                  fontSize: 14,
                  color: "#0F172A",
                  textAlign: "right",
                  padding: 0,
                  marginRight: 6,
                }}
              />
              <Text className="font-poppins-bold text-[11px] text-gray-400">IQD</Text>
            </View>
          </View>

          <View className="w-full h-[1px] bg-gray-100 my-0.5" />
          <View className="flex-row justify-between items-center">
            <Text className="font-poppins-bold text-[16px] text-text-primary">TOTAL:</Text>
            <Text className="font-poppins-bold text-[22px] text-[#0066FF]">{cartTotal.toLocaleString()} IQD</Text>
          </View>
        </View>

        {/* Amount Received Box with Formatted Commas */}
        <View className="mb-5">
          <Text className="font-poppins-bold text-[12.5px] text-gray-400 uppercase tracking-wider mb-2">
            Amount Received / پڕی پارەی وەرگیراو
          </Text>
          <View className="w-full flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-gray-200 shadow-sm">
            <TextInput
              value={amountPaidIQD}
              onChangeText={(text) => {
                const clean = text.replace(/[^0-9]/g, "");
                setAmountPaidIQD(clean ? parseInt(clean).toLocaleString() : "");
              }}
              keyboardType="number-pad"
              placeholder="200,000"
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1,
                fontFamily: "Poppins-Bold",
                fontSize: 19,
                color: "#0F172A",
                padding: 0,
                margin: 0,
              }}
            />
            <View className="bg-gray-50 border-l border-gray-100 px-4 py-2 ml-2 items-center justify-center">
              <Text className="font-poppins-bold text-[14.5px] text-gray-400">IQD</Text>
            </View>
          </View>
        </View>

        {/* Green Change to Return banner */}
        <View className="w-full flex-row items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3.5 mb-6">
          <View className="flex-row items-center">
            <View className="w-7 h-7 rounded-full bg-green-500 items-center justify-center mr-2.5">
              <MaterialCommunityIcons color="#FFFFFF" name="arrow-up-right" size={16} />
            </View>
            <Text className="font-poppins-bold text-[14.5px] text-green-700">
              Change to Return:
            </Text>
          </View>
          <Text className="font-poppins-bold text-[17px] text-[#10B981]">
            {changeReturnIQD.toLocaleString()} IQD
          </Text>
        </View>

        {/* Action checkout buttons */}
        <View className="gap-3.5 mb-8">
          <Pressable
            onPress={handleCompleteCheckout}
            className="w-full flex-row items-center justify-center rounded-2xl bg-[#0066FF] py-4.5 active:bg-blue-700 shadow-md"
          >
            <MaterialCommunityIcons color="#FFFFFF" name="printer-outline" size={20} className="mr-2" />
            <Text className="font-poppins-bold text-[16px] text-white">
              Complete Sale & Print Receipt
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              clearCart();
              setAmountPaidIQD("");
              setDiscountIQD("0");
              triggerToast("✓ Sale saved as draft");
            }}
            className="w-full flex-row items-center justify-center rounded-2xl bg-white border-2 border-[#0066FF] py-4 active:bg-blue-50/10"
          >
            <MaterialCommunityIcons color="#0066FF" name="file-document-outline" size={20} className="mr-2" />
            <Text className="font-poppins-bold text-[15.5px] text-[#0066FF]">
              Save as Draft
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
