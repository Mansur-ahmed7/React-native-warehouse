import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useWarehouseStore } from "../store/useWarehouseStore";
import { Part, Condition, CompatibleCar } from "../types/inventory";
import { BRANDS } from "../data/brands";
import { images } from "../constants/images";

export default function ScannerTab() {
  const [permission, requestPermission] = useCameraPermissions();

  // Store Slices & Actions
  const {
    parts,
    recentScans,
    addToCart,
    addRecentScan,
    setActiveTab,
    triggerToast,
    updatePart,
    deletePart,
  } = useWarehouseStore();

  // Local Search & Popup States
  const [searchQueryScanner, setSearchQueryScanner] = useState("");
  const [scannedPart, setScannedPart] = useState<Part | null>(null);
  const [showScanPopup, setShowScanPopup] = useState(false);
  const [isHandlingScan, setIsHandlingScan] = useState(false);
  const sweepAnim = useRef(new Animated.Value(0)).current;

  // Edit Modal States inside Scanner (to support "View Item" outlined trigger)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPartNumber, setEditPartNumber] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editBuyPriceUSD, setEditBuyPriceUSD] = useState("");
  const [editSellPriceIQD, setEditSellPriceIQD] = useState("");
  const [editCondition, setEditCondition] = useState<Condition>("new");
  const [editSupplier, setEditSupplier] = useState("");
  const [editThreshold, setEditThreshold] = useState("");
  const [editCompatibleCars, setEditCompatibleCars] = useState<CompatibleCar[]>([]);

  // Inline Add Compatible Car inside Edit Modal
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [carBrand, setCarBrand] = useState<string>("Toyota");
  const [carModel, setCarModel] = useState("");
  const [carYearFrom, setCarYearFrom] = useState("");
  const [carYearTo, setCarYearTo] = useState("");
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  // Viewfinder sweeping vertical line animation loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sweepAnim, {
          toValue: 200,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sweepAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    return () => sweepAnim.stopAnimation();
  }, [sweepAnim]);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Map parts to their premium product images
  const getPartImage = (part: Part | null) => {
    if (!part) return null;
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

  // Filter Parts Search List
  const filteredScannerParts = searchQueryScanner
    ? parts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQueryScanner.toLowerCase()) ||
          p.partNumber.toLowerCase().includes(searchQueryScanner.toLowerCase())
      )
    : [];

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (isHandlingScan || showScanPopup || isEditModalVisible) return;

    const scannedValue = result.data.trim();
    if (!scannedValue) return;

    setIsHandlingScan(true);

    const match = parts.find(
      (part) => part.partNumber.toLowerCase() === scannedValue.toLowerCase()
    );

    if (match) {
      setSearchQueryScanner("");
      setScannedPart(match);
      addRecentScan(match.id);
      setShowScanPopup(true);
    } else {
      setSearchQueryScanner(scannedValue);
      triggerToast("✗ Part not found", true);
    }

    setTimeout(() => setIsHandlingScan(false), 1500);
  };

  // Trigger Fast-Add Action
  const handleFastAdd = (part: Part) => {
    addToCart(part.id);
    addRecentScan(part.id);
    setShowScanPopup(false);
    triggerToast(`✓ ${part.name} added to sale`);
  };

  // Open Edit Details Modal
  const handleOpenEdit = (part: Part) => {
    setShowScanPopup(false);
    setEditName(part.name);
    setEditPartNumber(part.partNumber);
    setEditQuantity(String(part.quantity));
    setEditBuyPriceUSD(String(part.buyPriceUSD));
    setEditSellPriceIQD(part.sellPriceIQD.toLocaleString());
    setEditCondition(part.condition);
    setEditSupplier(part.supplier);
    setEditThreshold(String(part.lowStockThreshold));
    setEditCompatibleCars(part.compatibleCars);
    setIsEditModalVisible(true);
  };

  // Save changes from Edit Modal
  const handleEditSubmit = () => {
    if (!scannedPart) return;

    const qty = parseInt(editQuantity) || 0;
    const threshold = parseInt(editThreshold) || 3;
    const buyUSD = parseFloat(editBuyPriceUSD) || 0;
    const sellIQD = parseInt(editSellPriceIQD.replace(/[^0-9]/g, "")) || 0;

    updatePart(scannedPart.id, {
      name: editName,
      partNumber: editPartNumber,
      condition: editCondition,
      supplier: editSupplier,
      buyPriceUSD: buyUSD,
      sellPriceIQD: sellIQD,
      quantity: qty,
      lowStockThreshold: threshold,
      compatibleCars: editCompatibleCars,
    });

    setIsEditModalVisible(false);
    triggerToast("✓ Part details updated successfully");
  };

  // Delete part inside edit modal
  const handleDeletePart = () => {
    if (!scannedPart) return;

    Alert.alert(
      "Delete Part",
      `Are you sure you want to delete ${scannedPart.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePart(scannedPart.id);
            setIsEditModalVisible(false);
            triggerToast(`✗ ${scannedPart.name} deleted`);
          },
        },
      ]
    );
  };

  // Add Compatible Car Chip
  const addCompatibleCar = () => {
    if (!carModel || !carYearTo) {
      Alert.alert("Error", "Please fill in vehicle model and end year.");
      return;
    }
    const fromYear = parseInt(carYearFrom) || 2015;
    const toYear = parseInt(carYearTo) || 2022;

    const newCar: CompatibleCar = {
      brand: carBrand,
      model: carModel,
      yearFrom: fromYear,
      yearTo: toYear,
    };

    setEditCompatibleCars([...editCompatibleCars, newCar]);
    setCarModel("");
    setCarYearFrom("");
    setCarYearTo("");
    setShowAddCarForm(false);
  };

  return (
    <View className="flex-grow flex-shrink">
      {/* Header bar */}
      <View className="flex-row items-center justify-between px-6 mb-4">
        <View className="w-10" />
        <Text className="font-poppins-bold text-[24px] text-text-primary text-center">
          Scanner / باركۆد
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Camera viewfinder sweeping laser lines */}
        {searchQueryScanner === "" && (
          <View className="items-center px-6 mb-5">
            <View
              className="w-full max-w-[325px] aspect-square rounded-[36px] bg-black overflow-hidden items-center justify-center relative shadow-lg active:opacity-95"
            >
              {permission?.granted ? (
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing="back"
                  active={!showScanPopup && !isEditModalVisible}
                  barcodeScannerSettings={{
                    barcodeTypes: [
                      "qr",
                      "code128",
                      "code39",
                      "code93",
                      "ean13",
                      "ean8",
                      "upc_a",
                      "upc_e",
                      "codabar",
                      "itf14",
                    ],
                  }}
                  onBarcodeScanned={
                    showScanPopup || isEditModalVisible || isHandlingScan
                      ? undefined
                      : handleBarcodeScanned
                  }
                  onMountError={(event) => {
                    triggerToast(`✗ ${event.message}`, true);
                  }}
                />
              ) : (
                <View className="absolute inset-0 bg-zinc-900 opacity-90 items-center justify-center px-7">
                  <MaterialCommunityIcons color="#52525b" name="camera-off" size={80} />
                  <Text className="font-poppins-bold text-[15px] text-white text-center mt-4">
                    Camera access is needed for barcode scanning.
                  </Text>
                  <Pressable
                    onPress={requestPermission}
                    className="mt-4 px-5 py-2.5 rounded-full bg-[#0066FF] active:bg-blue-700"
                  >
                    <Text className="font-poppins-bold text-[13px] text-white">
                      Allow Camera
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Glowing vertical sweeping laser */}
              <View pointerEvents="none" className="w-[200px] h-[200px] items-center justify-center relative bg-black/10 rounded-3xl border border-white/20">
                <Animated.View
                  style={{
                    transform: [{ translateY: sweepAnim }],
                    position: "absolute",
                    left: 10,
                    right: 10,
                    height: 3,
                    backgroundColor: "#0066FF",
                    shadowColor: "#0066FF",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                />

                {/* corner blue brackets */}
                <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#0066FF] rounded-tl-lg" />
                <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#0066FF] rounded-tr-lg" />
                <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#0066FF] rounded-bl-lg" />
                <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#0066FF] rounded-br-lg" />

                <MaterialCommunityIcons color="rgba(255,255,255,0.15)" name="barcode" size={120} />
              </View>
            </View>
            <Text className="font-poppins-semibold text-[13px] text-text-secondary mt-3.5 text-center">
              Point camera at barcode
            </Text>
          </View>
        )}

        {/* OR divider */}
        {searchQueryScanner === "" && (
          <View className="flex-row items-center px-6 mb-5">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="font-poppins-bold text-[12px] text-gray-400 mx-4">OR</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>
        )}

        {/* Search bar */}
        <View className="px-6 mb-5">
          <View className="w-full flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-gray-200 shadow-sm">
            <MaterialCommunityIcons color="#9CA3AF" name="magnify" size={22} className="mr-3" />
            <TextInput
              value={searchQueryScanner}
              onChangeText={setSearchQueryScanner}
              placeholder="Search by name or part number..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 font-poppins-medium text-[15px] text-text-primary p-0 m-0"
            />
            {searchQueryScanner !== "" && (
              <Pressable onPress={() => setSearchQueryScanner("")}>
                <MaterialCommunityIcons color="#9CA3AF" name="close-circle" size={18} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Search Results / Recent scans list */}
        {searchQueryScanner !== "" ? (
          <View className="px-6 gap-3 mb-6">
            {filteredScannerParts.length === 0 ? (
              <View className="items-center justify-center py-8 bg-white rounded-3xl border border-red-100 p-6 shadow-sm">
                <MaterialCommunityIcons color="#EF4444" name="alert-circle-outline" size={42} />
                <Text className="font-poppins-bold text-[16px] text-red-600 mt-2.5 text-center">
                  ✗ Part not found
                </Text>
                <Pressable
                  onPress={() => setActiveTab("inventory")}
                  className="mt-3 bg-red-50 border border-red-200 px-5 py-2 rounded-full active:bg-red-100"
                >
                  <Text className="font-poppins-bold text-[13px] text-red-600">
                    + Add New Item
                  </Text>
                </Pressable>
              </View>
            ) : (
              filteredScannerParts.map((part) => {
                const partImg = getPartImage(part);
                return (
                  <Pressable
                    key={part.id}
                    onPress={() => {
                      setScannedPart(part);
                      setShowScanPopup(true);
                    }}
                    className="flex-row bg-white rounded-2xl p-3 border border-gray-100 shadow-sm items-center justify-between active:bg-gray-50"
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 rounded-xl bg-gray-50 mr-3 items-center justify-center overflow-hidden border border-gray-100">
                        {partImg ? (
                          <Image source={partImg} style={{ width: "100%", height: "100%" }} />
                        ) : (
                          <Text className="font-poppins-bold text-[14px] text-blue-600">
                            {(part.compatibleCars[0]?.brand || "T").charAt(0)}
                          </Text>
                        )}
                      </View>
                      <View className="flex-1 pr-2">
                        <Text className="font-poppins-bold text-[14px] text-text-primary" numberOfLines={1}>
                          {part.name}
                        </Text>
                        <Text className="font-poppins-semibold text-[11.5px] text-gray-400 mt-0.5">
                          {part.partNumber}
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons color="#0066FF" name="chevron-right" size={20} />
                  </Pressable>
                );
              })
            )}
          </View>
        ) : (
          /* History Scanned List */
          <View className="px-6 mb-6">
            <Text className="font-poppins-bold text-[17px] text-text-primary mb-3">
              Recent Scans
            </Text>

            <View className="gap-3">
              {recentScans.map((id) => {
                const part = parts.find((p) => p.id === id);
                if (!part) return null;
                const partImg = getPartImage(part);

                return (
                  <Pressable
                    key={part.id}
                    onPress={() => {
                      setScannedPart(part);
                      setShowScanPopup(true);
                    }}
                    className="flex-row bg-white rounded-2xl p-3 border border-gray-100 shadow-sm items-center justify-between active:bg-gray-50"
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 rounded-xl bg-gray-50 mr-3 items-center justify-center overflow-hidden border border-gray-100">
                        {partImg ? (
                          <Image source={partImg} style={{ width: "100%", height: "100%" }} />
                        ) : (
                          <Text className="font-poppins-bold text-[14px] text-blue-600">
                            {(part.compatibleCars[0]?.brand || "T").charAt(0)}
                          </Text>
                        )}
                      </View>
                      <View className="flex-1 pr-2">
                        <Text className="font-poppins-bold text-[14px] text-text-primary" numberOfLines={1}>
                          {part.name}
                        </Text>
                        <Text className="font-poppins-semibold text-[11.5px] text-gray-400 mt-0.5">
                          {part.partNumber}
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons color="#0066FF" name="chevron-right" size={20} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Slide-Up Bottom Sheet Popup */}
      {showScanPopup && scannedPart && (
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
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setShowScanPopup(false)}
          />
          <View className="bg-white rounded-t-[30px] p-6 pb-10 shadow-2xl gap-5">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-1" />

            <View className="flex-row">
              {/* Photo Thumbnail */}
              <View className="w-[85px] h-[85px] bg-gray-50 rounded-xl overflow-hidden mr-4 items-center justify-center border border-gray-100">
                {getPartImage(scannedPart) ? (
                  <Image
                    source={getPartImage(scannedPart)}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center bg-blue-50">
                    <Text className="font-poppins-bold text-[20px] text-blue-600">
                      {(scannedPart.compatibleCars[0]?.brand || "T").charAt(0)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Part specifications */}
              <View className="flex-1 justify-between py-1">
                <View>
                  <Text className="font-poppins-bold text-[18px] text-text-primary leading-[22px]" numberOfLines={1}>
                    {scannedPart.name}
                  </Text>
                  <Text className="font-poppins-semibold text-[13px] text-gray-400 mt-0.5">
                    {scannedPart.partNumber}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="font-poppins-bold text-[17px] text-text-primary">
                    {scannedPart.sellPriceIQD.toLocaleString()} IQD
                  </Text>

                  {/* Stock label */}
                  <View
                    className={`px-2.5 py-0.5 rounded border ${
                      scannedPart.status === "outOfStock"
                        ? "bg-red-50 border-red-200"
                        : scannedPart.status === "lowStock"
                        ? "bg-amber-50 border-amber-200"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <Text
                      className={`font-poppins-bold text-[11px] ${
                        scannedPart.status === "outOfStock"
                          ? "text-red-600"
                          : scannedPart.status === "lowStock"
                          ? "text-amber-700"
                          : "text-green-700"
                      }`}
                    >
                      {scannedPart.status === "outOfStock"
                        ? "Out of Stock"
                        : scannedPart.status === "lowStock"
                        ? `Low Stock: ×${scannedPart.quantity}`
                        : `✓ In Stock × ${scannedPart.quantity}`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* CTA action buttons */}
            <View className="flex-row gap-3.5 mt-2">
              <Pressable
                onPress={() => handleOpenEdit(scannedPart)}
                className="flex-1 py-4.5 rounded-[18px] bg-white border border-[#0066FF] items-center justify-center active:bg-blue-50/10"
              >
                <Text className="font-poppins-bold text-[15px] text-[#0066FF]">
                  View Item
                </Text>
              </Pressable>

              {scannedPart.status === "outOfStock" ? (
                <View className="flex-1 py-4.5 rounded-[18px] bg-gray-100 items-center justify-center border border-gray-200">
                  <Text className="font-poppins-bold text-[15px] text-red-500">
                    Out of Stock
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => handleFastAdd(scannedPart)}
                  className="flex-1 py-4.5 rounded-[18px] bg-[#0066FF] items-center justify-center active:bg-blue-700 shadow-md"
                >
                  <Text className="font-poppins-bold text-[15px] text-white">
                    + Add to Sale
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Edit Modal inside Scanner */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="w-full bg-white rounded-t-[36px] px-6 pb-8 pt-6 shadow-2xl">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full align-self-center mx-auto mb-5" />

            <View className="flex-row items-center justify-between mb-5">
              <Text className="font-poppins-bold text-[24px] text-text-primary">
                Edit Part Detail
              </Text>
              <Pressable
                onPress={() => setIsEditModalVisible(false)}
                className="w-9 h-9 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
              >
                <MaterialCommunityIcons color="#0F172A" name="close" size={22} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[380px] mb-5">
              <View className="gap-4">
                <View>
                  <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                    Part Name
                  </Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                  />
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      Part Number
                    </Text>
                    <TextInput
                      value={editPartNumber}
                      onChangeText={setEditPartNumber}
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      Condition
                    </Text>
                    <View className="flex-row border border-gray-200 rounded-xl overflow-hidden h-[48px]">
                      {(["new", "used", "refurbished"] as Condition[]).map((cond) => (
                        <Pressable
                          key={cond}
                          onPress={() => setEditCondition(cond)}
                          className={`flex-1 items-center justify-center ${
                            editCondition === cond ? "bg-[#0066FF]" : "bg-white"
                          }`}
                        >
                          <Text
                            className={`font-poppins-bold text-[11px] uppercase ${
                              editCondition === cond ? "text-white" : "text-text-primary"
                            }`}
                          >
                            {cond}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      Quantity
                    </Text>
                    <TextInput
                      value={editQuantity}
                      onChangeText={setEditQuantity}
                      keyboardType="number-pad"
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      Alert Threshold
                    </Text>
                    <TextInput
                      value={editThreshold}
                      onChangeText={setEditThreshold}
                      keyboardType="number-pad"
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      Buy Price (USD)
                    </Text>
                    <TextInput
                      value={editBuyPriceUSD}
                      onChangeText={setEditBuyPriceUSD}
                      keyboardType="numeric"
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      Sell Price (IQD)
                    </Text>
                    <TextInput
                      value={editSellPriceIQD}
                      onChangeText={(t) => setEditSellPriceIQD(t.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))}
                      keyboardType="number-pad"
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                  </View>
                </View>

                <View>
                  <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-2">
                    Compatible Cars
                  </Text>
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {editCompatibleCars.map((car, idx) => (
                      <View
                        key={idx}
                        className="flex-row items-center bg-blue-50 px-2.5 py-1.5 rounded-full border border-blue-100"
                      >
                        <Text className="font-poppins-bold text-[11.5px] text-[#0066FF] mr-1.5">
                          {car.brand} {car.model} ({car.yearFrom}-{car.yearTo})
                        </Text>
                        <Pressable
                          onPress={() =>
                            setEditCompatibleCars(editCompatibleCars.filter((_, i) => i !== idx))
                          }
                        >
                          <MaterialCommunityIcons color="#0066FF" name="close-circle" size={14} />
                        </Pressable>
                      </View>
                    ))}
                  </View>

                  {!showAddCarForm ? (
                    <Pressable
                      onPress={() => setShowAddCarForm(true)}
                      className="flex-row items-center border border-dashed border-[#0066FF] py-2 px-3.5 rounded-xl active:bg-blue-50/10 justify-center"
                    >
                      <MaterialCommunityIcons color="#0066FF" name="plus" size={16} className="mr-1" />
                      <Text className="font-poppins-bold text-[12px] text-[#0066FF]">
                        Add Compatible Vehicle
                      </Text>
                    </Pressable>
                  ) : (
                    <View className="bg-gray-50 p-4 border border-gray-200 rounded-2xl gap-3">
                      <View className="relative z-50">
                        <Pressable
                          onPress={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                          className="w-full flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-3.5 py-3"
                        >
                          <Text className="font-poppins-semibold text-[14px] text-text-primary">
                            {carBrand}
                          </Text>
                          <MaterialCommunityIcons
                            color="#6B7280"
                            name={isBrandDropdownOpen ? "chevron-up" : "chevron-down"}
                            size={18}
                          />
                        </Pressable>

                        {isBrandDropdownOpen && (
                          <View className="absolute top-[52px] left-0 right-0 max-h-[140px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg z-50">
                            <ScrollView nestedScrollEnabled={true}>
                              {BRANDS.map((brand) => (
                                <Pressable
                                  key={brand}
                                  onPress={() => {
                                    setCarBrand(brand);
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

                      <TextInput
                        value={carModel}
                        onChangeText={setCarModel}
                        placeholder="Model name"
                        className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 font-poppins-semibold text-[14px] text-text-primary"
                      />

                      <View className="flex-row gap-3">
                        <TextInput
                          value={carYearFrom}
                          onChangeText={carYearFrom => setCarYearFrom(carYearFrom)}
                          placeholder="Year From: 2015"
                          keyboardType="number-pad"
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 font-poppins-semibold text-[13px] text-text-primary"
                        />
                        <TextInput
                          value={carYearTo}
                          onChangeText={carYearTo => setCarYearTo(carYearTo)}
                          placeholder="Year To: 2022"
                          keyboardType="number-pad"
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 font-poppins-semibold text-[13px] text-text-primary"
                        />
                      </View>

                      <View className="flex-row justify-end gap-3 mt-1">
                        <Pressable
                          onPress={() => setShowAddCarForm(false)}
                          className="px-4 py-2 rounded-xl bg-white border border-gray-200 active:bg-gray-50"
                        >
                          <Text className="font-poppins-bold text-[12px] text-text-secondary">
                            Cancel
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={addCompatibleCar}
                          className="px-4 py-2 rounded-xl bg-[#0066FF] active:bg-blue-700"
                        >
                          <Text className="font-poppins-bold text-[12px] text-white">
                            Add Vehicle
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            <View className="flex-row gap-3 mt-1">
              <Pressable
                onPress={handleDeletePart}
                className="flex-1 items-center justify-center rounded-[20px] bg-red-50 border border-red-200 py-4 active:bg-red-100 shadow-sm"
              >
                <Text className="font-poppins-bold text-[16px] text-red-600">
                  Delete Part
                </Text>
              </Pressable>
              <Pressable
                onPress={handleEditSubmit}
                className="flex-2 items-center justify-center rounded-[20px] bg-[#0066FF] py-4 active:bg-blue-700 shadow-md"
              >
                <Text className="font-poppins-bold text-[16px] text-white">
                  Save Changes
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
