import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useRef } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { images } from "../constants/images";
import { useCarBrands } from "../data/brands";
import { useWarehouseStore } from "../store/useWarehouseStore";
import { CompatibleCar, Condition, Part } from "../types/inventory";

export default function InventoryTab() {
  const insets = useSafeAreaInsets();
  const carBrands = useCarBrands();

  // Store Slices & Actions
  const {
    parts,
    settings,
    addToCart,
    setActiveTab,
    addPart,
    updatePart,
    deletePart,
    triggerToast,
  } = useWarehouseStore();

  const isKu = settings.language === "ku";

  // Kurdish Localized Strings
  const t = {
    title: isKu ? "کۆگا" : "Inventory",
    searchPlaceholder: isKu ? "بگەڕێ بۆ پارچەکان..." : "Search parts...",
    all: isKu ? "هەمووی" : "All",
    noPartsFound: isKu ? "هیچ پارچەیەک نەدۆزرایەوە" : "No parts found",
    refineSearch: isKu ? "هەوڵبدە گەڕانەکەت یان فلتەرەکانت بگۆڕیت." : "Try refining your search or brand filters.",
    buy: isKu ? "کڕین:" : "Buy:",
    universal: isKu ? "گشتگیر" : "Universal",
    inStock: isKu ? "لە کۆگادایە" : "In Stock",
    lowStock: isKu ? "کەمبووەتەوە" : "Low Stock",
    outOfStock: isKu ? "نەماوە" : "Out of Stock",
    addToSale: isKu ? "+ زیادکردن بۆ فرۆشتن" : "+ Add to Sale",
    addNewPart: isKu ? "زیادکردنی پارچەی نوێ" : "Add New Part",
    partImage: isKu ? "وێنەی پارچە" : "Part Image",
    tapAddPhoto: isKu ? "تەپ بکە بۆ زیادکردنی وێنە" : "Tap to add photo",
    partName: isKu ? "ناوی پارچە" : "Part Name",
    partNamePlaceholder: isKu ? "بۆ نموونە سێتی پد بڕێک" : "e.g. Brake Pad Set",
    partNumber: isKu ? "ژمارەی پارچە" : "Part Number",
    partNumberPlaceholder: isKu ? "بۆ نموونە 04465-0R040" : "e.g. 04465-0R040",
    compModel: isKu ? "ناوی مۆدێلی گونجاو" : "Compatibility Model Name",
    compModelPlaceholder: isKu ? "بۆ نموونە Camry" : "e.g. Camry",
    brand: isKu ? "مارکە" : "Brand",
    quantity: isKu ? "بڕ" : "Quantity",
    lowStockAlert: isKu ? "ئاستی هۆشداری" : "Low Stock Alert",
    buyPriceUSD: isKu ? "نرخی کڕین (USD)" : "Buy Price (USD)",
    sellPriceIQD: isKu ? "نرخی فرۆشتن (IQD)" : "Sell Price (IQD)",
    addToInventory: isKu ? "زیادکردن بۆ کۆگا" : "Add to Inventory",
    editPartDetail: isKu ? "دەستکاریکردنی زانیارییەکانی پارچە" : "Edit Part Detail",
    condition: isKu ? "بارودۆخ" : "Condition",
    compatibleCars: isKu ? "ئۆتۆمبێلە گونجاوەکان" : "Compatible Cars",
    addCompatibleVehicle: isKu ? "زیادکردنی ئۆتۆمبێلی گونجاو" : "Add Compatible Vehicle",
    carModelPlaceholder: isKu ? "ناوی مۆدێل (بۆ نموونە Camry)" : "Model name (e.g. Camry)",
    yearFromPlaceholder: isKu ? "لە ساڵی: ٢٠١٥" : "Year From: 2015",
    yearToPlaceholder: isKu ? "تا ساڵی: ٢٠٢٢" : "Year To: 2022",
    cancel: isKu ? "پاشگەزبوونەوە" : "Cancel",
    addVehicle: isKu ? "زیادکردنی ئۆتۆمبێل" : "Add Vehicle",
    deletePart: isKu ? "ڕەشکردنەوەی پارچە" : "Delete Part",
    saveChanges: isKu ? "پاشەکەوتکردنی گۆڕانکارییەکان" : "Save Changes",
    // Dialog/Alert strings
    deleteConfirmTitle: isKu ? "ڕەشکردنەوەی پارچە" : "Delete Part",
    deleteConfirmMsg: (name: string) => isKu ? `ئایا دڵنیای لە ڕەشکردنەوەی ${name}؟` : `Are you sure you want to delete ${name}?`,
    delete: isKu ? "ڕەشکردنەوە" : "Delete",
    attachPhoto: isKu ? "هاوپێچکردنی وێنە" : "Attach Photo",
    choosePhotoOption: isKu ? "شێوازی هەڵبژاردنی وێنە دیاری بکە" : "Choose a photo option",
    takePhoto: isKu ? "وێنەگرتن" : "Take Photo",
    chooseGallery: isKu ? "هەڵبژاردن لە گەلەری" : "Choose from Gallery",
    permissionNeeded: isKu ? "پێویستی بە ڕێگەدان هەیە" : "Permission Needed",
    cameraPermissionMsg: isKu ? "تکایە ڕێگە بە کامێرا بدە بۆ وێنەگرتن." : "Please allow camera access to take pictures.",
    galleryPermissionMsg: isKu ? "تکایە ڕێگە بە گەلەری بدە بۆ هاوپێچکردنی وێنە." : "Please allow photo library access to attach pictures.",
    errorTitle: isKu ? "هەڵە" : "Error",
    fillRequired: isKu ? "تکایە هەموو خانە پێویستەکان پڕ بکەرەوە." : "Please fill in all required fields.",
    fillVehicleError: isKu ? "تکایە مۆدێلی ئۆتۆمبێل و ساڵی کۆتایی بنووسە." : "Please fill in vehicle model and end year.",
    partAddedToast: (name: string) => isKu ? `✓ ${name} بۆ کۆگا زیادکرا` : `✓ ${name} added to inventory`,
    partUpdatedToast: isKu ? "✓ زانیارییەکان بە سەرکەوتوویی نوێکرانەوە" : "✓ Part updated successfully",
    partDeletedToast: (name: string) => isKu ? `✗ ${name} ڕەشکرایەوە` : `✗ ${name} deleted`,
    partAddedSaleToast: (name: string) => isKu ? `✓ ${name} بۆ فرۆشتن زیادکرا` : `✓ ${name} added to sale`,
  };

  // Local Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");

  // Inline Add Modal States
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPartNumber, setNewPartNumber] = useState("");
  const [newBrand, setNewBrand] = useState<string>("Toyota");
  const [newCompatibility, setNewCompatibility] = useState("");
  const [newQuantity, setNewQuantity] = useState("12");
  const [newBuyPriceUSD, setNewBuyPriceUSD] = useState("28.00");
  const [newSellPriceIQD, setNewSellPriceIQD] = useState("45,000");
  const [newCondition, setNewCondition] = useState<Condition>("new");
  const [newSupplier, setNewSupplier] = useState("Ahmad Auto Parts");
  const [newThreshold, setNewThreshold] = useState("5");
  const [newPhotoUri, setNewPhotoUri] = useState<string | undefined>();

  // Inline Edit Modal States
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [editPhotoUri, setEditPhotoUri] = useState<string | undefined>();
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

  const brandFilters = [isKu ? "هەمووی" : "All", ...carBrands];
  // Helper to match selection across languages
  const getSelectedBrandKey = () => {
    if (selectedBrand === "هەمووی" || selectedBrand === "All") return "All";
    return selectedBrand;
  };

  const newBuyPriceIQDPreview = Math.round(
    (parseFloat(newBuyPriceUSD.replace(/,/g, "")) || 0) * settings.exchangeRate
  );
  const editBuyPriceIQDPreview = Math.round(
    (parseFloat(editBuyPriceUSD.replace(/,/g, "")) || 0) * settings.exchangeRate
  );

  // Map parts to their premium product images
  const getPartImage = (part: Part) => {
    if (part.imageUri) {
      return { uri: part.imageUri };
    }

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

  const handleImageResult = (
    result: ImagePicker.ImagePickerResult,
    target: "new" | "edit"
  ) => {
    if (result.canceled || !result.assets || !result.assets[0]?.uri) return;
    if (target === "new") {
      setNewPhotoUri(result.assets[0].uri);
    } else {
      setEditPhotoUri(result.assets[0].uri);
    }
  };

  const pickPartImage = (target: "new" | "edit") => {
    Alert.alert(t.attachPhoto, t.choosePhotoOption, [
      {
        text: t.takePhoto,
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(t.permissionNeeded, t.cameraPermissionMsg);
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          });
          handleImageResult(result, target);
        },
      },
      {
        text: t.chooseGallery,
        onPress: async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(t.permissionNeeded, t.galleryPermissionMsg);
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          });
          handleImageResult(result, target);
        },
      },
      { text: t.cancel, style: "cancel" },
    ]);
  };

  // Filter Parts List
  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (part.nameKu && part.nameKu.toLowerCase().includes(searchQuery.toLowerCase())) ||
      part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.compatibleCars.some((c) =>
        `${c.brand} ${c.model}`.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const brandKey = getSelectedBrandKey();
    const matchesBrand =
      brandKey === "All" ||
      part.compatibleCars.some((c) => c.brand.toLowerCase() === brandKey.toLowerCase());

    return matchesSearch && matchesBrand;
  });

  // Calculate profit margin for a part
  const getProfit = (part: Part) => {
    return part.sellPriceIQD - Math.round(part.buyPriceUSD * settings.exchangeRate);
  };

  // Handle Add Item Submit
  const handleAddSubmit = () => {
    if (!newName || !newPartNumber || !newBuyPriceUSD || !newSellPriceIQD) {
      Alert.alert(t.errorTitle, t.fillRequired);
      return;
    }

    const qty = parseInt(newQuantity) || 0;
    const threshold = parseInt(newThreshold) || 3;
    const buyUSD = parseFloat(newBuyPriceUSD) || 0;
    const sellIQD = parseInt(newSellPriceIQD.replace(/[^0-9]/g, "")) || 0;

    const newPart: Part = {
      id: `part-${Date.now()}`,
      name: newName,
      nameKu: newName, // Default nameKu directly to the entered name
      partNumber: newPartNumber,
      condition: newCondition,
      supplier: newSupplier,
      buyPriceUSD: buyUSD,
      sellPriceIQD: sellIQD,
      quantity: qty,
      lowStockThreshold: threshold,
      compatibleCars: newCompatibility
        ? [
            {
              brand: newBrand,
              model: newCompatibility,
              yearFrom: 2015,
              yearTo: 2020,
            },
          ]
        : [],
      status: "inStock",
      imageUri: newPhotoUri,
    };

    addPart(newPart);
    setIsAddModalVisible(false);
    triggerToast(t.partAddedToast(newName));

    // Reset Form
    setNewName("");
    setNewPartNumber("");
    setNewBrand("Toyota");
    setNewCompatibility("");
    setNewPhotoUri(undefined);
    setNewQuantity("12");
    setNewBuyPriceUSD("28.00");
    setNewSellPriceIQD("45,000");
    setNewCondition("new");
    setNewSupplier("Ahmad Auto Parts");
    setNewThreshold("5");
  };

  // Open Edit Modal & Populate States
  const handleOpenEdit = (part: Part) => {
    setEditingPart(part);
    setEditName(part.name);
    setEditPartNumber(part.partNumber);
    setEditQuantity(String(part.quantity));
    setEditBuyPriceUSD(String(part.buyPriceUSD));
    setEditSellPriceIQD(part.sellPriceIQD.toLocaleString());
    setEditCondition(part.condition);
    setEditSupplier(part.supplier);
    setEditThreshold(String(part.lowStockThreshold));
    setEditCompatibleCars(part.compatibleCars);
    setEditPhotoUri(part.imageUri);
    setIsEditModalVisible(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = () => {
    if (!editingPart) return;

    const qty = parseInt(editQuantity) || 0;
    const threshold = parseInt(editThreshold) || 3;
    const buyUSD = parseFloat(editBuyPriceUSD) || 0;
    const sellIQD = parseInt(editSellPriceIQD.replace(/[^0-9]/g, "")) || 0;

    updatePart(editingPart.id, {
      name: editName,
      partNumber: editPartNumber,
      condition: editCondition,
      supplier: editSupplier,
      buyPriceUSD: buyUSD,
      sellPriceIQD: sellIQD,
      quantity: qty,
      lowStockThreshold: threshold,
      compatibleCars: editCompatibleCars,
      imageUri: editPhotoUri,
    });

    setIsEditModalVisible(false);
    triggerToast(t.partUpdatedToast);
  };

  // Handle Delete Part
  const handleDeletePart = () => {
    if (!editingPart) return;

    Alert.alert(
      t.deleteConfirmTitle,
      t.deleteConfirmMsg(editingPart.name),
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.delete,
          style: "destructive",
          onPress: () => {
            deletePart(editingPart.id);
            setIsEditModalVisible(false);
            triggerToast(t.partDeletedToast(editingPart.name));
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

  // Draggable Modal Animation States
  const addModalY = useRef(new Animated.Value(0)).current;
  const addPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          addModalY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.vy > 1.5 || gestureState.dy > 150) {
          Animated.timing(addModalY, { toValue: 1000, duration: 200, useNativeDriver: true }).start(() => {
            setIsAddModalVisible(false);
            addModalY.setValue(0);
          });
        } else {
          Animated.spring(addModalY, { toValue: 0, bounciness: 8, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const editModalY = useRef(new Animated.Value(0)).current;
  const editPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          editModalY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.vy > 1.5 || gestureState.dy > 150) {
          Animated.timing(editModalY, { toValue: 1000, duration: 200, useNativeDriver: true }).start(() => {
            setIsEditModalVisible(false);
            editModalY.setValue(0);
          });
        } else {
          Animated.spring(editModalY, { toValue: 0, bounciness: 8, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <View className="flex-1">
      {/* Header Section */}
      <View className="flex-row items-center justify-between px-6 mb-5">
        <Text className="font-poppins-bold text-[34px] text-text-primary leading-[42px]">
          {t.title}
        </Text>
        <Pressable
          onPress={() => setIsAddModalVisible(true)}
          className="w-12 h-12 rounded-full bg-[#0066FF] items-center justify-center shadow-lg active:bg-blue-700"
        >
          <MaterialCommunityIcons color="#FFFFFF" name="plus" size={28} />
        </Pressable>
      </View>

      {/* Search Bar Section */}
      <View className="px-6 mb-5">
        <View className="w-full flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm">
          <MaterialCommunityIcons
            color="#9CA3AF"
            name="magnify"
            size={22}
            className="mr-3"
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.searchPlaceholder}
            placeholderTextColor="#9CA3AF"
            className="flex-1 font-poppins-medium text-[15px] text-text-primary p-0 m-0"
          />
          {searchQuery !== "" && (
            <Pressable onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons color="#9CA3AF" name="close-circle" size={18} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Brand Filter Pills */}
      <View className="mb-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
        >
          {brandFilters.map((brand) => {
            const isSelected = selectedBrand === brand;
            return (
              <Pressable
                key={brand}
                onPress={() => setSelectedBrand(brand)}
                className={`px-6 py-2 rounded-full ${isSelected ? "bg-[#0066FF]" : "bg-gray-105"}`}
              >
                <Text className={`font-poppins-semibold text-[14px] ${isSelected ? "text-white" : "text-text-primary"}`}>
                  {brand}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Parts List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: (insets.bottom || 24) + 90,
        }}
      >
        {filteredParts.length === 0 ? (
          <View className="items-center justify-center py-10 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <MaterialCommunityIcons color="#9CA3AF" name="package-variant-closed" size={48} />
            <Text className="font-poppins-semibold text-[16px] text-text-primary mt-3 text-center">
              {t.noPartsFound}
            </Text>
            <Text className="font-poppins-medium text-[13px] text-text-secondary mt-1 text-center">
              {t.refineSearch}
            </Text>
          </View>
        ) : (
          filteredParts.map((part) => {
            const partImg = getPartImage(part);
            const profit = getProfit(part);

            // Stock Status Badges color configs
            let statusBg = "bg-green-50 border-green-200";
            let statusText = "text-green-700";
            let statusIcon = "check-circle";
            let statusLabel = t.inStock;

            if (part.status === "lowStock") {
              statusBg = "bg-amber-50 border-amber-200";
              statusText = "text-amber-700";
              statusIcon = "alert-circle";
              statusLabel = t.lowStock;
            } else if (part.status === "outOfStock") {
              statusBg = "bg-red-50 border-red-200";
              statusText = "text-red-700";
              statusIcon = "close-circle";
              statusLabel = t.outOfStock;
            }

            return (
              <Pressable
                key={part.id}
                onPress={() => handleOpenEdit(part)}
                className="w-full bg-white rounded-[20px] p-3.5 border border-gray-100 shadow-sm mb-4 active:opacity-90 overflow-hidden"
              >
                {/* Product Layout Grid Row */}
                <View className="flex-row items-center">
                  {/* Photo thumbnail */}
                  <View className="w-[100px] h-[100px] bg-gray-50 rounded-xl overflow-hidden mr-4 items-center justify-center border border-gray-100">
                    {partImg ? (
                      <Image
                        source={partImg}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center bg-blue-50">
                        <Text className="font-poppins-bold text-[24px] text-blue-600">
                          {(part.compatibleCars[0]?.brand || "T").charAt(0)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Descriptions block */}
                  <View className="flex-1 justify-between min-h-[100px] py-1">
                    <View className="flex-row justify-between items-start w-full">
                      <View className="flex-1 mr-2 overflow-hidden">
                        <Text
                          className="font-poppins-bold text-[17px] text-text-primary leading-[22px]"
                          numberOfLines={1}
                        >
                          {part.name}
                        </Text>
                        <Text
                          className="font-poppins-semibold text-[13px] text-gray-400 mt-0.5 leading-[16px]"
                          numberOfLines={1}
                        >
                          {part.partNumber}
                        </Text>
                      </View>
                      <View className="w-[90px] shrink-0 items-end">
                        <Text className="font-poppins-bold text-[16px] text-text-primary leading-[20px]">
                          {part.sellPriceIQD.toLocaleString()} IQD
                        </Text>
                        <Text className="font-poppins-semibold text-[12px] text-gray-400 mt-0.5">
                          {t.buy} ${part.buyPriceUSD.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Compatibility Badge */}
                    <View className="flex-row mt-1">
                      <View className="bg-blue-50/70 px-2.5 py-0.5 rounded-md">
                        <Text className="font-poppins-semibold text-[11px] text-[#0066FF]">
                          {part.compatibleCars[0]
                            ? `${part.compatibleCars[0].brand} ${part.compatibleCars[0].model} ${part.compatibleCars[0].yearFrom}-${part.compatibleCars[0].yearTo}`
                            : t.universal}
                        </Text>
                      </View>
                    </View>

                    {/* Bottom Status Info */}
                    <View className="flex-row items-center justify-between mt-2.5 w-full">
                      <View className="flex-row items-center">
                        <View
                          className={`flex-row items-center px-2 py-0.5 rounded-md border ${statusBg}`}
                        >
                          <MaterialCommunityIcons
                            name={statusIcon as any}
                            size={13}
                            className={`mr-1 ${statusText}`}
                          />
                          <Text className={`font-poppins-bold text-[11px] ${statusText}`}>
                            {statusLabel}
                          </Text>
                        </View>
                        <Text className="font-poppins-bold text-[13px] text-text-secondary ml-2">
                          ×{part.quantity}
                        </Text>
                      </View>

                      {/* Profit conditionally formatted */}
                      <Text
                        className={`font-poppins-bold text-[13px] ${profit >= 0 ? "text-[#10B981]" : "text-amber-500"}`}
                      >
                        {profit > 0 ? "+" : ""}
                        {profit.toLocaleString()} IQD
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Fast-add to sale row */}
                <View className="border-t border-gray-50 mt-3 pt-2.5 flex-row justify-end">
                  {part.status === "outOfStock" ? (
                    <View className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-200">
                      <Text className="font-poppins-bold text-[12px] text-red-500">
                        {t.outOfStock}
                      </Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => {
                        addToCart(part.id);
                        setActiveTab("sale");
                        triggerToast(t.partAddedSaleToast(part.name));
                      }}
                      className="flex-row items-center bg-[#0066FF] px-4 py-2 rounded-xl active:bg-blue-700"
                    >
                      <MaterialCommunityIcons
                        color="#FFFFFF"
                        name="cart-plus"
                        size={15}
                        className="mr-1.5"
                      />
                      <Text className="font-poppins-bold text-[12px] text-white">
                        {t.addToSale}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Inline Add Item Modal Form */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/60"
        >
          <Pressable className="flex-1" onPress={() => setIsAddModalVisible(false)} />
          <Animated.View
            style={{ transform: [{ translateY: addModalY }], height: "85%" }}
            className="w-full bg-white rounded-t-[36px] px-6 pb-8 pt-2 shadow-2xl flex-col"
          >
            {/* Draggable Handle */}
            <View
              {...addPanResponder.panHandlers}
              className="w-full py-4 -mb-2 mt-0 z-10"
              style={{ cursor: "pointer" }}
            >
              <View className="w-12 h-1.5 bg-gray-200 rounded-full align-self-center mx-auto" />
            </View>

            <View className="flex-row items-center justify-between mb-5 gap-3">
              <Text className="font-poppins-bold text-[24px] text-text-primary flex-1">
                {t.addNewPart}
              </Text>
              <Pressable
                onPress={() => setIsAddModalVisible(false)}
                className="w-9 h-9 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
              >
                <MaterialCommunityIcons color="#0F172A" name="close" size={22} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-5">
              <View className="gap-4">
                {/* Photo Upload */}
                <View>
                  <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                    {t.partImage}
                  </Text>
                  <Pressable
                    onPress={() => pickPartImage("new")}
                    className="w-full h-[120px] bg-[#F6F7FB] border border-gray-100 rounded-xl items-center justify-center overflow-hidden mb-2"
                  >
                    {newPhotoUri ? (
                      <Image
                        source={{ uri: newPhotoUri }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="items-center">
                        <MaterialCommunityIcons name="camera-plus" size={32} color="#9CA3AF" />
                        <Text className="font-poppins-medium text-[13px] text-[#9CA3AF] mt-2">
                          {t.tapAddPhoto}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>

                <View>
                  <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                    {t.partName}
                  </Text>
                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder={t.partNamePlaceholder}
                    placeholderTextColor="#9CA3AF"
                    className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                  />
                </View>

                <View>
                  <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                    {t.partNumber}
                  </Text>
                  <TextInput
                    value={newPartNumber}
                    onChangeText={setNewPartNumber}
                    placeholder={t.partNumberPlaceholder}
                    placeholderTextColor="#9CA3AF"
                    className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                  />
                </View>

                <View>
                  <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                    {t.compModel}
                  </Text>
                  <TextInput
                    value={newCompatibility}
                    onChangeText={setNewCompatibility}
                    placeholder={t.compModelPlaceholder}
                    placeholderTextColor="#9CA3AF"
                    className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                  />
                </View>

                <View>
                  <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                    {t.brand}
                  </Text>
                  <View className="flex-row gap-2 flex-wrap">
                    {carBrands.map((b) => {
                      const isSelected = newBrand === b;
                      return (
                        <Pressable
                          key={b}
                          onPress={() => setNewBrand(b)}
                          className={`px-4 py-2 rounded-full border ${
                            isSelected ? "bg-[#0066FF] border-[#0066FF]" : "bg-white border-gray-200"
                          }`}
                        >
                          <Text className={`font-poppins-semibold text-[13px] ${isSelected ? "text-white" : "text-text-primary"}`}>
                            {b}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      {t.quantity}
                    </Text>
                    <TextInput
                      value={newQuantity}
                      onChangeText={setNewQuantity}
                      keyboardType="number-pad"
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      {t.lowStockAlert}
                    </Text>
                    <TextInput
                      value={newThreshold}
                      onChangeText={setNewThreshold}
                      keyboardType="number-pad"
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      {t.buyPriceUSD}
                    </Text>
                    <TextInput
                      value={newBuyPriceUSD}
                      onChangeText={setNewBuyPriceUSD}
                      keyboardType="numeric"
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                    {newBuyPriceUSD ? (
                      <Text
                        className="font-poppins-medium text-[11px] text-[#10B981] mt-1 ml-1"
                        numberOfLines={1}
                      >
                        ≈ {newBuyPriceIQDPreview.toLocaleString()} IQD
                      </Text>
                    ) : null}
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      {t.sellPriceIQD}
                    </Text>
                    <TextInput
                      value={newSellPriceIQD}
                      onChangeText={(t) =>
                        setNewSellPriceIQD(t.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                      }
                      keyboardType="number-pad"
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <Pressable
              onPress={handleAddSubmit}
              className="w-full items-center justify-center rounded-[20px] bg-[#0066FF] py-4.5 active:bg-blue-700 shadow-md"
            >
              <Text className="font-poppins-semibold text-[17px] text-white">
                {t.addToInventory}
              </Text>
            </Pressable>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Inline Edit Modal Form */}
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
          <Pressable className="flex-1" onPress={() => setIsEditModalVisible(false)} />
          <Animated.View
            style={{ transform: [{ translateY: editModalY }], height: "85%" }}
            className="w-full bg-white rounded-t-[36px] px-6 pb-8 pt-2 shadow-2xl flex-col"
          >
            {/* Draggable Handle */}
            <View
              {...editPanResponder.panHandlers}
              className="w-full py-4 -mb-2 mt-0 z-10"
              style={{ cursor: "pointer" }}
            >
              <View className="w-12 h-1.5 bg-gray-200 rounded-full align-self-center mx-auto" />
            </View>

            <View className="flex-row items-center justify-between mb-5 gap-3">
              <Text className="font-poppins-bold text-[24px] text-text-primary flex-1">
                {t.editPartDetail}
              </Text>
              <Pressable
                onPress={() => setIsEditModalVisible(false)}
                className="w-9 h-9 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
              >
                <MaterialCommunityIcons color="#0F172A" name="close" size={22} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-5">
              <View className="gap-4">
                {/* Photo Upload */}
                <View>
                  <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                    {t.partImage}
                  </Text>
                  <Pressable
                    onPress={() => pickPartImage("edit")}
                    className="w-full h-[120px] bg-[#F6F7FB] border border-gray-100 rounded-xl items-center justify-center overflow-hidden"
                  >
                    {editPhotoUri ? (
                      <Image
                        source={{ uri: editPhotoUri }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : editingPart && getPartImage(editingPart) ? (
                      <Image
                        source={getPartImage(editingPart)!}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="items-center">
                        <MaterialCommunityIcons name="camera-plus" size={32} color="#9CA3AF" />
                        <Text className="font-poppins-medium text-[13px] text-[#9CA3AF] mt-2">
                          {t.tapAddPhoto}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>

                {/* Part Name */}
                <View>
                  <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                    {t.partName}
                  </Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                  />
                </View>

                {/* Part Number & Condition */}
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      {t.partNumber}
                    </Text>
                    <TextInput
                      value={editPartNumber}
                      onChangeText={setEditPartNumber}
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      {t.condition}
                    </Text>
                    <View className="flex-row border border-gray-200 rounded-xl overflow-hidden h-[48px]">
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

                {/* Stock Controls */}
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      {t.quantity}
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
                      {t.lowStockAlert}
                    </Text>
                    <TextInput
                      value={editThreshold}
                      onChangeText={setEditThreshold}
                      keyboardType="number-pad"
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                  </View>
                </View>

                {/* Buy/Sell Prices Side-by-Side */}
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      {t.buyPriceUSD}
                    </Text>
                    <TextInput
                      value={editBuyPriceUSD}
                      onChangeText={setEditBuyPriceUSD}
                      keyboardType="numeric"
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                    {editBuyPriceUSD ? (
                      <Text
                        className="font-poppins-medium text-[11px] text-[#10B981] mt-1 ml-1"
                        numberOfLines={1}
                      >
                        ≈ {editBuyPriceIQDPreview.toLocaleString()} IQD
                      </Text>
                    ) : null}
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-1.5">
                      {t.sellPriceIQD}
                    </Text>
                    <TextInput
                      value={editSellPriceIQD}
                      onChangeText={(t) =>
                        setEditSellPriceIQD(t.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                      }
                      keyboardType="number-pad"
                      className="w-full bg-[#F6F7FB] border border-gray-100 rounded-xl px-4 py-3 font-poppins-semibold text-[15px] text-text-primary"
                    />
                  </View>
                </View>

                {/* Compatible Vehicles */}
                <View>
                  <Text className="font-poppins-semibold text-[13px] text-text-secondary mb-2">
                    {t.compatibleCars}
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

                  {/* Add Compatible Car Button */}
                  {!showAddCarForm ? (
                    <Pressable
                      onPress={() => setShowAddCarForm(true)}
                      className="flex-row items-center border border-dashed border-[#0066FF] py-2 px-3.5 rounded-xl active:bg-blue-50/10 justify-center w-full"
                    >
                      <MaterialCommunityIcons color="#0066FF" name="plus" size={16} className="mr-1" />
                      <Text className="font-poppins-bold text-[12px] text-[#0066FF]">
                        {t.addCompatibleVehicle}
                      </Text>
                    </Pressable>
                  ) : (
                    <View className="bg-gray-50 p-4 border border-gray-200 rounded-2xl gap-3 w-full">
                      {/* Car Brand Select Dropdown */}
                      <View className="relative z-50 w-full">
                        <Pressable
                          onPress={() =>
                            setIsBrandDropdownOpen(!isBrandDropdownOpen)
                          }
                          className="w-full flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-3.5 py-3"
                        >
                          <Text className="font-poppins-semibold text-[14px] text-text-primary">
                            {carBrand}
                          </Text>
                          <MaterialCommunityIcons
                            color="#6B7280"
                            name={
                              isBrandDropdownOpen
                                ? "chevron-up"
                                : "chevron-down"
                            }
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

                      {/* Model */}
                      <TextInput
                        value={carModel}
                        onChangeText={setCarModel}
                        placeholder={t.carModelPlaceholder}
                        placeholderTextColor="#9CA3AF"
                        style={[{ width: "100%", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontFamily: "Poppins-Semibold", fontSize: 14, color: "#0F172A" }]}
                      />

                      {/* Year From & To */}
                      <View className="flex-row gap-3 w-full">
                        <TextInput
                          value={carYearFrom}
                          onChangeText={setCarYearFrom}
                          placeholder={t.yearFromPlaceholder}
                          placeholderTextColor="#9CA3AF"
                          keyboardType="number-pad"
                          style={[{ flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontFamily: "Poppins-Semibold", fontSize: 13, color: "#0F172A" }]}
                        />
                        <TextInput
                          value={carYearTo}
                          onChangeText={(carYearTo) => setCarYearTo(carYearTo)}
                          placeholder={t.yearToPlaceholder}
                          placeholderTextColor="#9CA3AF"
                          keyboardType="number-pad"
                          style={[{ flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontFamily: "Poppins-Semibold", fontSize: 13, color: "#0F172A" }]}
                        />
                      </View>

                      {/* Action buttons inside form */}
                      <View className="flex-row justify-end gap-3 mt-1 w-full">
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
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
