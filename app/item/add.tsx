import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BRANDS } from "@/data/brands";
import { Brand, CarCompatibility, ItemCondition } from "@/types/inventory";

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();

  // Photo state
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Controlled states matching screenshot
  const [name, setName] = useState("Brake Pad Set");
  const [partNumber, setPartNumber] = useState("04465-0R040");
  const [condition, setCondition] = useState<ItemCondition>("New");
  const [supplier, setSupplier] = useState("Ahmad Auto Parts");
  const [buyPriceUSD, setBuyPriceUSD] = useState("28.00");
  const [sellPriceIQD, setSellPriceIQD] = useState("45,000");
  const [quantity, setQuantity] = useState("12");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");

  // Compatible Cars list state initialized with sample data matching screenshot exactly
  const [compatibilities, setCompatibilities] = useState<CarCompatibility[]>([
    {
      id: "c-1",
      brand: "Toyota",
      model: "Camry",
      yearFrom: 2015,
      yearTo: 2020,
    },
    {
      id: "c-2",
      brand: "Toyota",
      model: "Corolla",
      yearFrom: 2014,
      yearTo: 2019,
    },
    {
      id: "c-3",
      brand: "Toyota",
      model: "ES" as any,
      yearFrom: 2016,
      yearTo: 2021,
    }, // Lexus - ES - 2016 to 2021 (fallback Lexus if typed, or Toyota as brand type)
  ]);

  // Inline Add Form visibility & inputs
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBrand, setNewBrand] = useState<Brand>("Audi");
  const [newModel, setNewModel] = useState("A4");
  const [newYearFrom, setNewYearFrom] = useState("");
  const [newYearTo, setNewYearTo] = useState("2022");

  // Brand dropdown open state
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  // Exchange rate constant
  const EXCHANGE_RATE = 1310;

  // Real-time dynamic profit calculation
  const cleanBuyUSD = parseFloat(buyPriceUSD) || 0;
  const cleanSellIQD = parseInt(sellPriceIQD.replace(/[^0-9]/g, "")) || 0;
  const profitIQD = cleanSellIQD - Math.round(cleanBuyUSD * EXCHANGE_RATE);

  // Handle suggested sell price input format (e.g. adds commas dynamically)
  const handleSellPriceChange = (text: string) => {
    const cleanNum = text.replace(/[^0-9]/g, "");
    if (!cleanNum) {
      setSellPriceIQD("");
      return;
    }
    const formatted = parseInt(cleanNum).toLocaleString();
    setSellPriceIQD(formatted);
  };

  // Remove compatible car chip
  const removeCompatibility = (id: string) => {
    setCompatibilities(compatibilities.filter((c) => c.id !== id));
  };

  // Add compatible car to list
  const addCompatibility = () => {
    if (!newModel || !newYearTo) {
      alert("Please fill in model and ending year fields.");
      return;
    }

    const yearFrom = parseInt(newYearFrom) || 2015;
    const yearTo = parseInt(newYearTo) || 2022;

    const newEntry: CarCompatibility = {
      id: `c-${Date.now()}`,
      brand: newBrand,
      model: newModel,
      yearFrom,
      yearTo,
    };

    setCompatibilities([...compatibilities, newEntry]);

    // Reset Form
    setNewModel("");
    setNewYearFrom("");
    setNewYearTo("");
    setShowAddForm(false);
  };

  // Select a photo from the device camera roll
  const pickImage = async () => {
    console.log("[Photo] pickImage triggered");
    setShowPhotoOptions(false);

    try {
      // First try to check permissions
      console.log("[Photo] Requesting media library permissions...");
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync().catch((err) => {
          console.warn(
            "[Photo] Permission request error (safe to ignore if direct launch works):",
            err,
          );
          return { status: "granted" as const }; // Fallback to try launching directly
        });

      console.log("[Photo] Media library permission status:", status);

      console.log("[Photo] Launching image library...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      console.log("[Photo] Image library response:", result);

      if (!result.canceled) {
        const assets = result.assets;
        const uri =
          assets && assets.length > 0 ? assets[0].uri : (result as any).uri;
        console.log("[Photo] Selected image URI:", uri);
        if (uri) {
          setPhotoUri(uri);
        } else {
          console.warn("[Photo] No URI returned in result:", result);
        }
      }
    } catch (error: any) {
      console.error("[Photo] Error selecting from gallery:", error);
      alert("Could not open gallery: " + (error?.message || error));
    }
  };

  // Capture a photo using the device camera
  const takePhoto = async () => {
    console.log("[Photo] takePhoto triggered");
    setShowPhotoOptions(false);

    try {
      // First try to check permissions
      console.log("[Photo] Requesting camera permissions...");
      const { status } =
        await ImagePicker.requestCameraPermissionsAsync().catch((err) => {
          console.warn(
            "[Photo] Camera permission request error (safe to ignore if direct launch works):",
            err,
          );
          return { status: "granted" as const }; // Fallback to try launching directly
        });

      console.log("[Photo] Camera permission status:", status);

      console.log("[Photo] Launching camera...");
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      console.log("[Photo] Camera response:", result);

      if (!result.canceled) {
        const assets = result.assets;
        const uri =
          assets && assets.length > 0 ? assets[0].uri : (result as any).uri;
        console.log("[Photo] Captured image URI:", uri);
        if (uri) {
          setPhotoUri(uri);
        } else {
          console.warn("[Photo] No URI returned in result:", result);
        }
      }
    } catch (error: any) {
      console.error("[Photo] Error taking photo:", error);
      alert("Could not open camera: " + (error?.message || error));
    }
  };

  // Brand list for compatibility form (omit "All")
  const brandList = BRANDS.filter((b) => b !== "All") as Brand[];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar backgroundColor="#FFFFFF" style="dark" />

      {/* Navigation Header */}
      <View
        className="flex-row items-center justify-between border-b border-gray-100 bg-white px-5 pb-3"
        style={{ paddingTop: Math.max(insets.top, 12) }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50 active:bg-gray-100"
        >
          <MaterialCommunityIcons color="#334155" name="arrow-left" size={24} />
        </Pressable>
        <Text className="font-poppins-bold text-[20px] text-text-primary text-center">
          Add Item
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
      >
        {/* Photo Upload Area */}
        <View className="items-center justify-center mb-6">
          <Pressable
            onPress={() => {
              console.log(
                "[Photo] Photo container pressed! Opening options overlay...",
              );
              setShowPhotoOptions(true);
            }}
            className="w-[110px] h-[110px] rounded-2xl border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50 overflow-hidden active:bg-gray-100 relative"
          >
            {photoUri ? (
              <>
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
                <View className="absolute bottom-0 left-0 right-0 bg-black/40 py-1 items-center justify-center">
                  <Text className="font-poppins-semibold text-[9px] text-white">
                    Change
                  </Text>
                </View>
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  color="#9CA3AF"
                  name="camera"
                  size={32}
                />
                <Text className="font-poppins-semibold text-[11px] text-[#9CA3AF] mt-2 text-center">
                  Tap to add photo
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Form Fields Card */}
        <View className="gap-5 mb-8">
          {/* NAME */}
          <View>
            <Text className="font-poppins-bold text-[12px] text-gray-400 uppercase tracking-wider mb-2">
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Brake Pad Set"
              placeholderTextColor="#9CA3AF"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary shadow-sm"
            />
          </View>

          {/* PART NUMBER */}
          <View>
            <Text className="font-poppins-bold text-[12px] text-gray-400 uppercase tracking-wider mb-2">
              Part Number
            </Text>
            <TextInput
              value={partNumber}
              onChangeText={setPartNumber}
              placeholder="e.g. 04465-0R040"
              placeholderTextColor="#9CA3AF"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary shadow-sm"
            />
          </View>

          {/* CONDITION SEGMENT SELECTOR */}
          <View>
            <Text className="font-poppins-bold text-[12px] text-gray-400 uppercase tracking-wider mb-2">
              Condition
            </Text>
            <View className="w-full flex-row bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {(["New", "Used", "Refurbished"] as ItemCondition[]).map(
                (cond, idx) => {
                  const isSelected = condition === cond;
                  return (
                    <Pressable
                      key={cond}
                      onPress={() => setCondition(cond)}
                      className={`flex-1 py-3 items-center justify-center ${
                        isSelected ? "bg-[#0066FF]" : "bg-white"
                      } ${idx > 0 ? "border-l border-gray-200" : ""}`}
                    >
                      <Text
                        className={`font-poppins-semibold text-[14px] ${
                          isSelected
                            ? "text-white"
                            : "text-text-primary font-medium"
                        }`}
                      >
                        {cond}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>
          </View>

          {/* SUPPLIER */}
          <View>
            <Text className="font-poppins-bold text-[12px] text-gray-400 uppercase tracking-wider mb-2">
              Supplier
            </Text>
            <TextInput
              value={supplier}
              onChangeText={setSupplier}
              placeholder="e.g. Ahmad Auto Parts"
              placeholderTextColor="#9CA3AF"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary shadow-sm"
            />
          </View>

          {/* BUY PRICE (USD) */}
          <View>
            <Text className="font-poppins-bold text-[12px] text-gray-400 uppercase tracking-wider mb-2">
              Buy Price (USD)
            </Text>
            <View className="w-full flex-row items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <View className="bg-gray-50 border-r border-gray-200 px-4.5 py-3.5 items-center justify-center">
                <Text className="font-poppins-bold text-[15px] text-text-secondary">
                  $
                </Text>
              </View>
              <TextInput
                value={buyPriceUSD}
                onChangeText={setBuyPriceUSD}
                keyboardType="numeric"
                placeholder="28.00"
                placeholderTextColor="#9CA3AF"
                className="flex-1 font-poppins-semibold text-[15px] text-text-primary px-4 py-3"
              />
            </View>
            {buyPriceUSD ? (
              <Text className="font-poppins-medium text-[11px] text-[#10B981] mt-1.5 ml-1">
                ≈{" "}
                {Math.round(
                  (parseFloat(buyPriceUSD) || 0) * EXCHANGE_RATE,
                ).toLocaleString()}{" "}
                IQD
              </Text>
            ) : null}
          </View>

          {/* SUGGESTED SELL PRICE (IQD) */}
          <View>
            <Text className="font-poppins-bold text-[12px] text-gray-400 uppercase tracking-wider mb-2">
              Suggested Sell Price (IQD)
            </Text>
            <View className="w-full flex-row items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <TextInput
                value={sellPriceIQD}
                onChangeText={handleSellPriceChange}
                keyboardType="number-pad"
                placeholder="45,000"
                placeholderTextColor="#9CA3AF"
                className="flex-1 font-poppins-semibold text-[15px] text-text-primary px-4 py-3"
              />
              <View className="bg-gray-50 border-l border-gray-200 px-4 py-3.5 items-center justify-center">
                <Text className="font-poppins-bold text-[13px] text-text-secondary">
                  IQD
                </Text>
              </View>
            </View>
          </View>

          {/* LIVE PROFIT BANNER */}
          <View
            className={`w-full flex-row items-center justify-between rounded-xl px-4 py-3.5 ${profitIQD >= 0 ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}
          >
            <View className="flex-row items-center">
              <View
                className={`w-6 h-6 rounded-full items-center justify-center mr-2.5 ${profitIQD >= 0 ? "bg-green-500" : "bg-amber-500"}`}
              >
                <MaterialCommunityIcons
                  color="#FFFFFF"
                  name={profitIQD >= 0 ? "trending-up" : "trending-down"}
                  size={14}
                />
              </View>
              <Text
                className={`font-poppins-bold text-[15px] ${profitIQD >= 0 ? "text-green-700" : "text-amber-700"}`}
              >
                Profit: {profitIQD > 0 ? "+" : ""}
                {profitIQD.toLocaleString()} IQD
              </Text>
            </View>
            <Text className="font-poppins-semibold text-[12px] text-gray-400">
              at 1,310 rate
            </Text>
          </View>

          {/* QUANTITY */}
          <View>
            <Text className="font-poppins-bold text-[12px] text-gray-400 uppercase tracking-wider mb-2">
              Quantity
            </Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="12"
              placeholderTextColor="#9CA3AF"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary shadow-sm"
            />
          </View>

          {/* LOW STOCK THRESHOLD */}
          <View>
            <Text className="font-poppins-bold text-[12px] text-gray-400 uppercase tracking-wider mb-2">
              Low Stock Threshold
            </Text>
            <TextInput
              value={lowStockThreshold}
              onChangeText={setLowStockThreshold}
              keyboardType="number-pad"
              placeholder="5"
              placeholderTextColor="#9CA3AF"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary shadow-sm"
            />
            <Text className="font-poppins-medium text-[11px] text-gray-400 mt-1.5 ml-1">
              Alert when stock falls below this number
            </Text>
          </View>

          {/* COMPATIBLE CARS SECTION */}
          <View>
            <Text className="font-poppins-bold text-[12px] text-gray-400 uppercase tracking-wider mb-2.5">
              Compatible Cars
            </Text>

            <View className="w-full bg-white border border-gray-100 rounded-2xl p-4.5 shadow-sm border border-gray-200">
              {/* Chip container */}
              <View className="flex-row flex-wrap gap-2.5 mb-4">
                {compatibilities.map((c) => (
                  <View
                    key={c.id}
                    className="flex-row items-center bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full"
                  >
                    <Text className="font-poppins-semibold text-[12px] text-text-primary">
                      {c.brand} — {c.model} — {c.yearFrom} to {c.yearTo}
                    </Text>
                    <Pressable
                      onPress={() => removeCompatibility(c.id)}
                      className="ml-2 w-4 h-4 rounded-full bg-gray-200 items-center justify-center active:bg-gray-300"
                    >
                      <MaterialCommunityIcons
                        color="#475569"
                        name="close"
                        size={10}
                      />
                    </Pressable>
                  </View>
                ))}
              </View>

              {/* Toggle Inline Form Button */}
              {!showAddForm ? (
                <Pressable
                  onPress={() => setShowAddForm(true)}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-[#0066FF] items-center justify-center bg-blue-50/5 active:bg-blue-50/10"
                >
                  <Text className="font-poppins-bold text-[14px] text-[#0066FF]">
                    + Add Compatible Car
                  </Text>
                </Pressable>
              ) : (
                /* INLINE ADD FORM CONTAINER */
                <View className="w-full bg-[#F6F7FB] border border-gray-200 rounded-2xl p-4 gap-4 mt-2">
                  <View className="flex-row gap-3">
                    {/* Brand dropdown select */}
                    <View className="flex-1 relative">
                      <Pressable
                        onPress={() =>
                          setIsBrandDropdownOpen(!isBrandDropdownOpen)
                        }
                        className="w-full flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-3.5 py-3"
                      >
                        <Text className="font-poppins-semibold text-[14px] text-text-primary">
                          {newBrand}
                        </Text>
                        <MaterialCommunityIcons
                          color="#6B7280"
                          name={
                            isBrandDropdownOpen ? "chevron-up" : "chevron-down"
                          }
                          size={18}
                        />
                      </Pressable>

                      {/* Brand List Custom Dropdown Select */}
                      {isBrandDropdownOpen && (
                        <View className="absolute top-[52px] left-0 right-0 max-h-[160px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg z-50">
                          <ScrollView nestedScrollEnabled={true}>
                            {brandList.map((brand) => (
                              <Pressable
                                key={brand}
                                onPress={() => {
                                  setNewBrand(brand);
                                  setIsBrandDropdownOpen(false);
                                }}
                                className="px-4 py-3 border-b border-gray-50 active:bg-blue-50/10"
                              >
                                <Text className="font-poppins-semibold text-[14px] text-text-primary">
                                  {brand}
                                </Text>
                              </Pressable>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>

                    {/* Model Text Input */}
                    <TextInput
                      value={newModel}
                      onChangeText={setNewModel}
                      placeholder="e.g. A4"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 font-poppins-semibold text-[14px] text-text-primary"
                    />
                  </View>

                  <View className="flex-row gap-3">
                    {/* Year From */}
                    <TextInput
                      value={newYearFrom}
                      onChangeText={setNewYearFrom}
                      placeholder="Year From: 2015"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 font-poppins-semibold text-[14px] text-text-primary"
                    />

                    {/* Year To */}
                    <TextInput
                      value={newYearTo}
                      onChangeText={setNewYearTo}
                      placeholder="Year To: 2022"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 font-poppins-semibold text-[14px] text-text-primary"
                    />
                  </View>

                  {/* Inline Form Actions */}
                  <View className="flex-row justify-end gap-3 mt-1">
                    <Pressable
                      onPress={() => setShowAddForm(false)}
                      className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 active:bg-gray-50"
                    >
                      <Text className="font-poppins-bold text-[14px] text-text-secondary">
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={addCompatibility}
                      className="px-6 py-2.5 rounded-xl bg-[#0066FF] active:bg-blue-700"
                    >
                      <Text className="font-poppins-bold text-[14px] text-white">
                        Add
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Footer Actions */}
        <View className="gap-3.5">
          <Pressable
            onPress={() => {
              alert("Part saved successfully!");
              router.back();
            }}
            className="w-full items-center justify-center rounded-[20px] bg-[#0066FF] py-4.5 active:bg-blue-700 shadow-md"
          >
            <Text className="font-poppins-bold text-[17px] text-white">
              Save
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            className="w-full items-center justify-center rounded-[20px] bg-white border border-[#0066FF] py-4 active:bg-blue-50/10"
          >
            <Text className="font-poppins-bold text-[16px] text-[#0066FF]">
              Cancel
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Custom Absolute Photo Options Picker (Bulletproof Overlay) */}
      {showPhotoOptions && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            justifyContent: "flex-end",
            zIndex: 99999,
          }}
        >
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={() => {
              console.log("[Photo] Closed overlay via backdrop tap");
              setShowPhotoOptions(false);
            }}
          />
          <View className="bg-white rounded-t-[30px] px-6 pt-6 pb-10 gap-5 shadow-2xl">
            {/* Handle Bar indicator */}
            <View className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" />

            <Text className="font-poppins-bold text-[18px] text-text-primary text-center">
              Select Photo
            </Text>

            <View className="gap-3">
              <Pressable
                onPress={takePhoto}
                className="w-full flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 active:bg-gray-100"
              >
                <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center mr-4">
                  <MaterialCommunityIcons
                    color="#0066FF"
                    name="camera"
                    size={22}
                  />
                </View>
                <Text className="font-poppins-semibold text-[15px] text-text-primary">
                  Take Photo
                </Text>
              </Pressable>

              <Pressable
                onPress={pickImage}
                className="w-full flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 active:bg-gray-100"
              >
                <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center mr-4">
                  <MaterialCommunityIcons
                    color="#0066FF"
                    name="image"
                    size={22}
                  />
                </View>
                <Text className="font-poppins-semibold text-[15px] text-text-primary">
                  Choose from Gallery
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                console.log("[Photo] Closed overlay via cancel button");
                setShowPhotoOptions(false);
              }}
              className="w-full py-4 rounded-2xl border border-gray-200 items-center justify-center active:bg-gray-50 mt-1"
            >
              <Text className="font-poppins-bold text-[15px] text-text-secondary">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
