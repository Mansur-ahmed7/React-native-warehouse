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
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useWarehouseStore } from "../store/useWarehouseStore";
import { Part, Condition, CompatibleCar } from "../types/inventory";
import { useCarBrands } from "../data/brands";
import { images } from "../constants/images";

export default function ScannerTab() {
  const [permission, requestPermission] = useCameraPermissions();
  const carBrands = useCarBrands();

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
    settings,
  } = useWarehouseStore();

  const isKu = settings.language === "ku";

  // Kurdish Localized Strings
  const t = {
    title: isKu ? "سکانەر" : "Scanner",
    cameraPermissionMsg: isKu ? "پێویستە مۆڵەتی کامێرا بدەیت بۆ سکانکردنی بارکۆد." : "Camera access is needed for barcode scanning.",
    allowCamera: isKu ? "ڕێگەدان بە کامێرا" : "Allow Camera",
    pointCamera: isKu ? "کامێراکە ڕووبەڕووی بارکۆدەکە بکەرەوە" : "Point camera at barcode",
    or: isKu ? "یان" : "OR",
    searchPlaceholder: isKu ? "بگەڕێ بەپێی ناو یان ژمارەی پارچە..." : "Search by name or part number...",
    partNotFound: isKu ? "✗ پارچەکە نەدۆزرایەوە" : "✗ Part not found",
    addNewItem: isKu ? "+ زیادکردنی کاڵای نوێ" : "+ Add New Item",
    recentScans: isKu ? "سکانەکانی ئەم دواییە" : "Recent Scans",
    outOfStock: isKu ? "کاڵا نەماوە" : "Out of Stock",
    lowStock: (qty: number) => isKu ? `کەمبووەتەوە: ×${qty}` : `Low Stock: ×${qty}`,
    inStock: (qty: number) => isKu ? `✓ لە کۆگادایە × ${qty}` : `✓ In Stock × ${qty}`,
    viewItem: isKu ? "بینینی کاڵا" : "View Item",
    addToSale: isKu ? "+ زیادکردن بۆ فرۆشتن" : "+ Add to Sale",
    editPartDetail: isKu ? "دەستکاریکردنی زانیارییەکانی پارچە" : "Edit Part Detail",
    partName: isKu ? "ناوی پارچە" : "Part Name",
    partNumber: isKu ? "ژمارەی پارچە" : "Part Number",
    condition: isKu ? "بارودۆخ" : "Condition",
    quantity: isKu ? "بڕ" : "Quantity",
    alertThreshold: isKu ? "ئاستی هۆشداری" : "Alert Threshold",
    buyPriceUSD: isKu ? "نرخی کڕین (USD)" : "Buy Price (USD)",
    sellPriceIQD: isKu ? "نرخی فرۆشتن (IQD)" : "Sell Price (IQD)",
    compatibleCars: isKu ? "ئۆتۆمبێلە گونجاوەکان" : "Compatible Cars",
    addCompatibleVehicle: isKu ? "زیادکردنی ئۆتۆمبێلی گونجاو" : "Add Compatible Vehicle",
    carModelPlaceholder: isKu ? "ناوی مۆدێل (بۆ نموونە Camry)" : "Model name (e.g. Camry)",
    yearFromPlaceholder: isKu ? "لە ساڵی: ٢٠١٥" : "Year From: 2015",
    yearToPlaceholder: isKu ? "تا ساڵی: ٢٠٢٢" : "Year To: 2022",
    cancel: isKu ? "پاشگەزبوونەوە" : "Cancel",
    addVehicle: isKu ? "زیادکردنی ئۆتۆمبێل" : "Add Vehicle",
    deletePart: isKu ? "ڕەشکردنەوەی پارچە" : "Delete Part",
    saveChanges: isKu ? "پاشەکەوتکردنی گۆڕانکارییەکان" : "Save Changes",
    deletePartConfirmTitle: isKu ? "ڕەشکردنەوەی پارچە" : "Delete Part",
    deletePartConfirmMsg: (name: string) => isKu ? `ئایا دڵنیای لە ڕەشکردنەوەی ${name}؟` : `Are you sure you want to delete ${name}?`,
    delete: isKu ? "ڕەشکردنەوە" : "Delete",
    fillRequired: isKu ? "تکایە زانیارییە پێویستەکان پڕ بکەرەوە." : "Please fill in all required fields.",
    fillVehicleError: isKu ? "تکایە مۆدێلی ئۆتۆمبێل و ساڵی کۆتایی بنووسە." : "Please fill in vehicle model and end year.",
    errorTitle: isKu ? "هەڵە" : "Error",
    partDeleted: (name: string) => isKu ? `✗ ${name} ڕەشکرایەوە` : `✗ ${name} deleted`,
    partUpdated: isKu ? "✓ زانیارییەکانی پارچە بە سەرکەوتوویی نوێکرانەوە" : "✓ Part details updated successfully",
    partAddedSale: (name: string) => isKu ? `✓ ${name} بۆ فرۆشتن زیادکرا` : `✓ ${name} added to sale`,
  };

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
          toValue: 193,
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
      triggerToast(t.partNotFound, true);
    }

    setTimeout(() => setIsHandlingScan(false), 1500);
  };

  // Trigger Fast-Add Action
  const handleFastAdd = (part: Part) => {
    addToCart(part.id);
    addRecentScan(part.id);
    setShowScanPopup(false);
    triggerToast(t.partAddedSale(part.name));
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
    triggerToast(t.partUpdated);
  };

  // Delete part inside edit modal
  const handleDeletePart = () => {
    if (!scannedPart) return;

    Alert.alert(
      t.deletePartConfirmTitle,
      t.deletePartConfirmMsg(scannedPart.name),
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.delete,
          style: "destructive",
          onPress: () => {
            deletePart(scannedPart.id);
            setIsEditModalVisible(false);
            triggerToast(t.partDeleted(scannedPart.name));
          },
        },
      ]
    );
  };

  // Add Compatible Car Chip
  const addCompatibleCar = () => {
    if (!carModel || !carYearTo) {
      Alert.alert(t.errorTitle, t.fillVehicleError);
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
      <View className="flex-row items-center justify-between px-6 mb-4" style={isKu ? styles.rtlRow : undefined}>
        <View className="w-10" />
        <Text className="font-poppins-bold text-[24px] text-text-primary text-center">
          {t.title}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Camera viewfinder sweeping laser lines */}
        {searchQueryScanner === "" && (
          <View className="items-center px-6 mb-5">
            <View style={styles.cameraWrapper}>
              {permission?.granted ? (
                <View style={styles.cameraContainer}>
                  <CameraView
                    style={styles.camera}
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
                </View>
              ) : (
                <View className="absolute inset-0 bg-zinc-900 opacity-90 items-center justify-center px-7">
                  <MaterialCommunityIcons color="#52525b" name="camera-off" size={80} />
                  <Text className="font-poppins-bold text-[15px] text-white text-center mt-4">
                    {t.cameraPermissionMsg}
                  </Text>
                  <Pressable
                    onPress={requestPermission}
                    className="mt-4 px-5 py-2.5 rounded-full bg-[#0066FF] active:bg-blue-700"
                  >
                    <Text className="font-poppins-bold text-[13px] text-white">
                      {t.allowCamera}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Glowing vertical sweeping laser overlay container */}
              <View style={styles.overlayContainer} pointerEvents="none">
                <View className="w-[200px] h-[200px] items-center justify-center relative bg-black/10 rounded-3xl border border-white/20">
                  <Animated.View
                    style={{
                      transform: [{ translateY: sweepAnim }],
                      position: "absolute",
                      top: 2,
                      left: 10,
                      right: 10,
                      height: 3,
                      backgroundColor: "#0066FF",
                      shadowColor: "#0066FF",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 6,
                      elevation: 4,
                      zIndex: 10,
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
            </View>
            <Text className="font-poppins-semibold text-[13px] text-text-secondary mt-3.5 text-center" style={isKu ? styles.rtlText : undefined}>
              {t.pointCamera}
            </Text>
          </View>
        )}

        {/* OR divider */}
        {searchQueryScanner === "" && (
          <View className="flex-row items-center px-6 mb-5" style={isKu ? styles.rtlRow : undefined}>
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="font-poppins-bold text-[12px] text-gray-400 mx-4">{t.or}</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>
        )}

        {/* Search bar */}
        <View className="px-6 mb-5">
          <View className="w-full flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-gray-200 shadow-sm" style={isKu ? styles.rtlRow : undefined}>
            <MaterialCommunityIcons color="#9CA3AF" name="magnify" size={22} style={isKu ? { marginLeft: 12 } : { marginRight: 12 }} />
            <TextInput
              value={searchQueryScanner}
              onChangeText={setSearchQueryScanner}
              placeholder={t.searchPlaceholder}
              placeholderTextColor="#9CA3AF"
              style={[{ flex: 1, fontFamily: "Poppins-Medium", fontSize: 15, color: "#0F172A", padding: 0, margin: 0, textAlign: isKu ? "right" : "left" }]}
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
                  {t.partNotFound}
                </Text>
                <Pressable
                  onPress={() => setActiveTab("inventory")}
                  className="mt-3 bg-red-50 border border-red-200 px-5 py-2 rounded-full active:bg-red-100"
                >
                  <Text className="font-poppins-bold text-[13px] text-red-600">
                    {t.addNewItem}
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
                    style={isKu ? styles.rtlRow : undefined}
                  >
                    <View className="flex-row items-center flex-1" style={isKu ? styles.rtlRow : undefined}>
                      <View
                        className="w-12 h-12 rounded-xl bg-gray-50 items-center justify-center overflow-hidden border border-gray-100"
                        style={isKu ? { marginLeft: 12 } : { marginRight: 12 }}
                      >
                        {partImg ? (
                          <Image source={partImg} style={{ width: "100%", height: "100%" }} />
                        ) : (
                          <Text className="font-poppins-bold text-[14px] text-blue-600">
                            {(part.compatibleCars[0]?.brand || "T").charAt(0)}
                          </Text>
                        )}
                      </View>
                      <View className="flex-1 pr-2" style={isKu ? styles.rtlAlign : undefined}>
                        <Text className="font-poppins-bold text-[14px] text-text-primary" numberOfLines={1} style={isKu ? styles.rtlText : undefined}>
                          {part.name}
                        </Text>
                        <Text className="font-poppins-semibold text-[11.5px] text-gray-400 mt-0.5" style={isKu ? styles.rtlText : undefined}>
                          {part.partNumber}
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons color="#0066FF" name={isKu ? "chevron-left" : "chevron-right"} size={20} />
                  </Pressable>
                );
              })
            )}
          </View>
        ) : (
          /* History Scanned List */
          <View className="px-6 mb-6">
            <Text className="font-poppins-bold text-[17px] text-text-primary mb-3" style={isKu ? styles.rtlText : undefined}>
              {t.recentScans}
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
                    style={isKu ? styles.rtlRow : undefined}
                  >
                    <View className="flex-row items-center flex-1" style={isKu ? styles.rtlRow : undefined}>
                      <View
                        className="w-12 h-12 rounded-xl bg-gray-50 items-center justify-center overflow-hidden border border-gray-100"
                        style={isKu ? { marginLeft: 12 } : { marginRight: 12 }}
                      >
                        {partImg ? (
                          <Image source={partImg} style={{ width: "100%", height: "100%" }} />
                        ) : (
                          <Text className="font-poppins-bold text-[14px] text-blue-600">
                            {(part.compatibleCars[0]?.brand || "T").charAt(0)}
                          </Text>
                        )}
                      </View>
                      <View className="flex-1 pr-2" style={isKu ? styles.rtlAlign : undefined}>
                        <Text className="font-poppins-bold text-[14px] text-text-primary" numberOfLines={1} style={isKu ? styles.rtlText : undefined}>
                          {part.name}
                        </Text>
                        <Text className="font-poppins-semibold text-[11.5px] text-gray-400 mt-0.5" style={isKu ? styles.rtlText : undefined}>
                          {part.partNumber}
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons color="#0066FF" name={isKu ? "chevron-left" : "chevron-right"} size={20} />
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

            <View className="flex-row" style={isKu ? styles.rtlRow : undefined}>
              {/* Photo Thumbnail */}
              <View
                className="w-[85px] h-[85px] bg-gray-50 rounded-xl overflow-hidden items-center justify-center border border-gray-100"
                style={isKu ? { marginLeft: 16 } : { marginRight: 16 }}
              >
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
              <View className="flex-1 justify-between py-1" style={isKu ? styles.rtlAlign : undefined}>
                <View style={isKu ? styles.rtlAlign : undefined}>
                  <Text className="font-poppins-bold text-[18px] text-text-primary leading-[22px]" numberOfLines={1} style={isKu ? styles.rtlText : undefined}>
                    {scannedPart.name}
                  </Text>
                  <Text className="font-poppins-semibold text-[13px] text-gray-400 mt-0.5" style={isKu ? styles.rtlText : undefined}>
                    {scannedPart.partNumber}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mt-2 w-full" style={isKu ? styles.rtlRow : undefined}>
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
                        ? t.outOfStock
                        : scannedPart.status === "lowStock"
                        ? t.lowStock(scannedPart.quantity)
                        : t.inStock(scannedPart.quantity)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* CTA action buttons */}
            <View className="flex-row gap-3.5 mt-2" style={isKu ? styles.rtlRow : undefined}>
              <Pressable
                onPress={() => handleOpenEdit(scannedPart)}
                className="flex-1 py-4.5 rounded-[18px] bg-white border border-[#0066FF] items-center justify-center active:bg-blue-50/10"
              >
                <Text className="font-poppins-bold text-[15px] text-[#0066FF]">
                  {t.viewItem}
                </Text>
              </Pressable>

              {scannedPart.status === "outOfStock" ? (
                <View className="flex-1 py-4.5 rounded-[18px] bg-gray-100 items-center justify-center border border-gray-200">
                  <Text className="font-poppins-bold text-[15px] text-red-500">
                    {t.outOfStock}
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => handleFastAdd(scannedPart)}
                  className="flex-1 py-4.5 rounded-[18px] bg-[#0066FF] items-center justify-center active:bg-blue-700 shadow-md"
                >
                  <Text className="font-poppins-bold text-[15px] text-white">
                    {t.addToSale}
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

            <View className="flex-row items-center justify-between mb-5 gap-3" style={isKu ? styles.rtlRow : undefined}>
              <Text className="font-poppins-bold text-[24px] text-text-primary flex-1" style={isKu ? styles.rtlText : undefined}>
                {t.editPartDetail}
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
                <View style={isKu ? styles.rtlAlign : undefined}>
                  <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5" style={isKu ? styles.rtlText : undefined}>
                    {t.partName}
                  </Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    style={[{ width: "100%", backgroundColor: "#F6F7FB", borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontFamily: "Poppins-Semibold", fontSize: 15, color: "#0F172A", textAlign: isKu ? "right" : "left" }]}
                  />
                </View>

                <View className="flex-row gap-4" style={isKu ? styles.rtlRow : undefined}>
                  <View className="flex-1" style={isKu ? styles.rtlAlign : undefined}>
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5" style={isKu ? styles.rtlText : undefined}>
                      {t.partNumber}
                    </Text>
                    <TextInput
                      value={editPartNumber}
                      onChangeText={setEditPartNumber}
                      style={[{ width: "100%", backgroundColor: "#F6F7FB", borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontFamily: "Poppins-Semibold", fontSize: 15, color: "#0F172A", textAlign: isKu ? "right" : "left" }]}
                    />
                  </View>
                  <View className="flex-1" style={isKu ? styles.rtlAlign : undefined}>
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5" style={isKu ? styles.rtlText : undefined}>
                      {t.condition}
                    </Text>
                    <View className="flex-row border border-gray-200 rounded-xl overflow-hidden h-[48px]" style={isKu ? styles.rtlRow : undefined}>
                      {(["new", "used"] as Condition[]).map((cond) => {
                        let condLabel = cond;
                        if (isKu) {
                          if (cond === "new") condLabel = "نوێ" as any;
                          if (cond === "used") condLabel = "بەکارهاتوو" as any;
                        }
                        return (
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
                              {condLabel}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-4" style={isKu ? styles.rtlRow : undefined}>
                  <View className="flex-1" style={isKu ? styles.rtlAlign : undefined}>
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5" style={isKu ? styles.rtlText : undefined}>
                      {t.quantity}
                    </Text>
                    <TextInput
                      value={editQuantity}
                      onChangeText={setEditQuantity}
                      keyboardType="number-pad"
                      style={[{ width: "100%", backgroundColor: "#F6F7FB", borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontFamily: "Poppins-Semibold", fontSize: 15, color: "#0F172A", textAlign: isKu ? "right" : "left" }]}
                    />
                  </View>
                  <View className="flex-1" style={isKu ? styles.rtlAlign : undefined}>
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5" style={isKu ? styles.rtlText : undefined}>
                      {t.alertThreshold}
                    </Text>
                    <TextInput
                      value={editThreshold}
                      onChangeText={setEditThreshold}
                      keyboardType="number-pad"
                      style={[{ width: "100%", backgroundColor: "#F6F7FB", borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontFamily: "Poppins-Semibold", fontSize: 15, color: "#0F172A", textAlign: isKu ? "right" : "left" }]}
                    />
                  </View>
                </View>

                <View className="flex-row gap-4" style={isKu ? styles.rtlRow : undefined}>
                  <View className="flex-1" style={isKu ? styles.rtlAlign : undefined}>
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5" style={isKu ? styles.rtlText : undefined}>
                      {t.buyPriceUSD}
                    </Text>
                    <TextInput
                      value={editBuyPriceUSD}
                      onChangeText={setEditBuyPriceUSD}
                      keyboardType="numeric"
                      style={[{ width: "100%", backgroundColor: "#F6F7FB", borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontFamily: "Poppins-Semibold", fontSize: 15, color: "#0F172A", textAlign: isKu ? "right" : "left" }]}
                    />
                  </View>
                  <View className="flex-1" style={isKu ? styles.rtlAlign : undefined}>
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5" style={isKu ? styles.rtlText : undefined}>
                      {t.sellPriceIQD}
                    </Text>
                    <TextInput
                      value={editSellPriceIQD}
                      onChangeText={(t) => setEditSellPriceIQD(t.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))}
                      keyboardType="number-pad"
                      style={[{ width: "100%", backgroundColor: "#F6F7FB", borderWidth: 1, borderColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontFamily: "Poppins-Semibold", fontSize: 15, color: "#0F172A", textAlign: isKu ? "right" : "left" }]}
                    />
                  </View>
                </View>

                <View style={isKu ? styles.rtlAlign : undefined}>
                  <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-2" style={isKu ? styles.rtlText : undefined}>
                    {t.compatibleCars}
                  </Text>
                  <View className="flex-row flex-wrap gap-2 mb-3" style={isKu ? styles.rtlRow : undefined}>
                    {editCompatibleCars.map((car, idx) => (
                      <View
                        key={idx}
                        className="flex-row items-center bg-blue-50 px-2.5 py-1.5 rounded-full border border-blue-100"
                        style={isKu ? styles.rtlRow : undefined}
                      >
                        <Text className="font-poppins-bold text-[11.5px] text-[#0066FF]" style={isKu ? { marginLeft: 6 } : { marginRight: 6 }}>
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
                      className="flex-row items-center border border-dashed border-[#0066FF] py-2 px-3.5 rounded-xl active:bg-blue-50/10 justify-center w-full"
                      style={isKu ? styles.rtlRow : undefined}
                    >
                      <MaterialCommunityIcons color="#0066FF" name="plus" size={16} style={isKu ? { marginLeft: 4 } : { marginRight: 4 }} />
                      <Text className="font-poppins-bold text-[12px] text-[#0066FF]">
                        {t.addCompatibleVehicle}
                      </Text>
                    </Pressable>
                  ) : (
                    <View className="bg-gray-50 p-4 border border-gray-200 rounded-2xl gap-3 w-full" style={isKu ? styles.rtlAlign : undefined}>
                      <View className="relative z-50 w-full">
                        <Pressable
                          onPress={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                          className="w-full flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-3.5 py-3"
                          style={isKu ? styles.rtlRow : undefined}
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
                              {carBrands.map((brand) => (
                                <Pressable
                                  key={brand}
                                  onPress={() => {
                                    setCarBrand(brand);
                                    setIsBrandDropdownOpen(false);
                                  }}
                                  className="px-4 py-3 border-b border-gray-50 active:bg-blue-50/10"
                                  style={isKu ? styles.rtlAlign : undefined}
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
                        placeholder={t.carModelPlaceholder}
                        placeholderTextColor="#9CA3AF"
                        style={[{ width: "100%", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontFamily: "Poppins-Semibold", fontSize: 14, color: "#0F172A", textAlign: isKu ? "right" : "left" }]}
                      />

                      <View className="flex-row gap-3 w-full" style={isKu ? styles.rtlRow : undefined}>
                        <TextInput
                          value={carYearFrom}
                          onChangeText={carYearFrom => setCarYearFrom(carYearFrom)}
                          placeholder={t.yearFromPlaceholder}
                          placeholderTextColor="#9CA3AF"
                          keyboardType="number-pad"
                          style={[{ flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontFamily: "Poppins-Semibold", fontSize: 13, color: "#0F172A", textAlign: isKu ? "right" : "left" }]}
                        />
                        <TextInput
                          value={carYearTo}
                          onChangeText={carYearTo => setCarYearTo(carYearTo)}
                          placeholder={t.yearToPlaceholder}
                          placeholderTextColor="#9CA3AF"
                          keyboardType="number-pad"
                          style={[{ flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontFamily: "Poppins-Semibold", fontSize: 13, color: "#0F172A", textAlign: isKu ? "right" : "left" }]}
                        />
                      </View>

                      <View className="flex-row justify-end gap-3 mt-1 w-full" style={isKu ? styles.rtlRow : undefined}>
                        <Pressable
                          onPress={() => setShowAddCarForm(false)}
                          className="px-4 py-2 rounded-xl bg-white border border-gray-200 active:bg-gray-50"
                        >
                          <Text className="font-poppins-bold text-[12px] text-text-secondary">
                            {t.cancel}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={addCompatibleCar}
                          className="px-4 py-2 rounded-xl bg-[#0066FF] active:bg-blue-700"
                        >
                          <Text className="font-poppins-bold text-[12px] text-white">
                            {t.addVehicle}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            <View className="gap-3 mt-1">
              <Pressable
                onPress={handleEditSubmit}
                className="w-full items-center justify-center rounded-[20px] bg-[#0066FF] py-4 active:bg-blue-700 shadow-md"
              >
                <Text className="font-poppins-bold text-[16px] text-white">
                  {t.saveChanges}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDeletePart}
                className="w-full items-center justify-center rounded-[20px] bg-red-50 border border-red-200 py-4 active:bg-red-100 shadow-sm"
              >
                <Text className="font-poppins-bold text-[16px] text-red-600">
                  {t.deletePart}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraWrapper: {
    borderRadius: 20,
    overflow: "hidden", // Wrap the entire camera section in a View with overflow: 'hidden'
    width: "100%",
    height: Dimensions.get("window").height * 0.45,
    maxWidth: 325,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraContainer: {
    borderRadius: 20,
    overflow: "hidden",
    width: "100%",
    height: "100%",
    elevation: 0, // Android ignores borderRadius on native views. Use built-in View with elevation: 0
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20, // Add borderRadius directly to the CameraView style prop itself (iOS)
    overflow: "hidden",
  },
  rtlRow: {
    flexDirection: "row-reverse",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  rtlAlign: {
    alignItems: "flex-end",
  },
});
