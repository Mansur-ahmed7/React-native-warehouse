import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { Part } from "@/types/inventory";
import { images } from "@/constants/images";

interface RestockModalProps {
  visible: boolean;
  onClose: () => void;
  item: Part | null;
}

export default function RestockModal({ visible, onClose, item }: RestockModalProps) {
  const { settings, updatePart, triggerToast } = useWarehouseStore();
  const exchangeRate = settings.exchangeRate;
  const isKu = settings.language === "ku";

  const t = {
    title: isKu ? "دابینکردنەوە" : "Restock",
    unitsReceived: isKu ? "بڕی وەرگیراو" : "UNITS RECEIVED",
    supplier: isKu ? "دابینکەر" : "SUPPLIER",
    supplierPlaceholder: isKu ? "ناوی دابینکەر" : "Supplier name",
    supplierHint: isKu ? "دەستکاری بکە ئەگەر لە دابینکەرێکی ترەوەیە" : "Edit if restocking from different supplier",
    buyPrice: isKu ? "نرخی کڕین" : "BUY PRICE",
    buyPricePlaceholder: isKu ? "0.00" : "0.00",
    buyPriceHint: isKu ? "دەستکاری بکە ئەگەر نرخ گۆڕاوە" : "Update if price has changed",
    sellPrice: isKu ? "نرخی فرۆشتن (IQD)" : "SELL PRICE (IQD)",
    sellPriceHint: isKu ? "دەستکاری بکە ئەگەر نرخ گۆڕاوە" : "Update if selling price has changed",
    profitPreview: (profit: number, rate: number) => isKu 
      ? `قازانجی نوێ: +${profit.toLocaleString()} دینار بۆ هەر دانەیەک بە نرخی گۆڕینەوەی ${rate.toLocaleString()}`
      : `New profit: +${profit.toLocaleString()} IQD per unit at ${rate.toLocaleString()} rate`,
    restockDate: isKu ? "ڕێکەوتی دابینکردنەوە" : "RESTOCK DATE",
    confirmButton: (qty: number) => isKu 
      ? `✓ دڵنیایی دابینکردنەوە — زیادکردنی ${qty} دانە`
      : `✓ Confirm Restock — Add ${qty} units`,
    cancelButton: isKu ? "پاشگەزبوونەوە" : "Cancel",
    invalidPriceTitle: isKu ? "نرخ هەڵەیە" : "Invalid Price",
    invalidPriceMessage: isKu ? "تکایە نرخێکی دروست بنووسە." : "Please enter a valid price.",
    errorTitle: isKu ? "هەڵە" : "Error",
    errorMessage: isKu ? "سەرنەکەوت لە نوێکردنەوەی کۆگا." : "Failed to update item stock.",
    toastSuccess: (qty: number, name: string) => isKu 
      ? `✓ دابینکردنەوەی ${qty} دانە بۆ ${name} ئەنجامدرا`
      : `✓ Restocked ${qty} units for ${name}`,
  };

  const displayName = item?.name;

  // Form States
  const [units, setUnits] = useState(10);
  const [supplier, setSupplier] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [currency, setCurrency] = useState<"USD" | "IQD">("USD");

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setUnits(10);
      setSupplier(item.supplier || "");
      setBuyPrice(String(item.buyPriceUSD || ""));
      setSellPrice(item.sellPriceIQD ? item.sellPriceIQD.toLocaleString() : "");
      setCurrency("USD");
    }
  }, [item, visible]);

  const handleCurrencyChange = (newCurrency: "USD" | "IQD") => {
    if (newCurrency === currency) return;

    const val = parseFloat(buyPrice.replace(/,/g, "")) || 0;
    if (val > 0) {
      if (newCurrency === "IQD") {
        // Convert USD to IQD
        const iqdVal = Math.round(val * exchangeRate);
        setBuyPrice(String(iqdVal));
      } else {
        // Convert IQD to USD
        const usdVal = Number((val / exchangeRate).toFixed(2));
        setBuyPrice(String(usdVal));
      }
    }
    setCurrency(newCurrency);
  };

  if (!item) return null;

  // Handle Stepper
  const handleIncrement = () => {
    setUnits((prev) => Math.min(999, prev + 1));
  };

  const handleDecrement = () => {
    setUnits((prev) => Math.max(1, prev - 1));
  };

  // Profit Calculation
  const calcProfit = (buyStr: string, sellStr: string, curr: "USD" | "IQD") => {
    const cleanBuy = buyStr.replace(/,/g, "");
    const parsedBuy = parseFloat(cleanBuy) || 0;
    const cleanSell = sellStr.replace(/,/g, "");
    const parsedSell = parseFloat(cleanSell) || 0;

    if (curr === "USD") {
      return parsedSell - Math.round(parsedBuy * exchangeRate);
    } else {
      return parsedSell - Math.round(parsedBuy);
    }
  };

  const currentProfit = calcProfit(buyPrice, sellPrice, currency);

  // Format Date (e.g., "07 Jun 2026")
  const formatDate = (date: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const today = new Date();

  // Handle Submit
  const handleConfirm = () => {
    const cleanPrice = buyPrice.replace(/,/g, "");
    const parsedVal = parseFloat(cleanPrice);
    if (isNaN(parsedVal) || parsedVal < 0) {
      Alert.alert(t.invalidPriceTitle, t.invalidPriceMessage);
      return;
    }

    const cleanSell = sellPrice.replace(/,/g, "");
    const parsedSell = parseInt(cleanSell);
    if (isNaN(parsedSell) || parsedSell < 0) {
      Alert.alert(isKu ? "نرخ هەڵەیە" : "Invalid Sell Price", isKu ? "تکایە نرخێکی فرۆشتنی دروست بنووسە." : "Please enter a valid selling price.");
      return;
    }

    let finalBuyUSD = parsedVal;
    if (currency === "IQD") {
      finalBuyUSD = Number((parsedVal / exchangeRate).toFixed(4));
    }

    const success = updatePart(item.id, {
      quantity: item.quantity + units,
      buyPriceUSD: finalBuyUSD,
      sellPriceIQD: parsedSell,
      updated_at: new Date().toISOString(),
    });

    if (success) {
      triggerToast(t.toastSuccess(units, displayName || item.name));
      onClose();
    } else {
      Alert.alert(t.errorTitle, t.errorMessage);
    }
  };

  // Custom Image Resolver
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

  const partImage = getPartImage(item);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.sheet}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={[styles.header, isKu ? styles.rtlRow : undefined]}>
              <View style={[styles.headerLeft, isKu ? styles.rtlRow : undefined]}>
                {partImage ? (
                  <Image source={partImage} style={styles.image} contentFit="cover" />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={20} color="#9CA3AF" />
                  </View>
                )}
                <View style={[styles.headerTextContainer, isKu ? styles.rtlAlign : undefined, { marginLeft: isKu ? 0 : 12, marginRight: isKu ? 12 : 0 }]}>
                  <Text style={[styles.headerTitle, isKu ? styles.rtlText : undefined]}>{t.title}</Text>
                  <Text style={[styles.headerSubTitle, isKu ? styles.rtlText : undefined]} numberOfLines={1}>
                    {displayName}
                  </Text>
                </View>
              </View>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={20} color="#475569" />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              style={styles.scrollView}
            >
              {/* Stepper Field */}
              <Text style={[styles.label, isKu ? styles.rtlText : undefined]}>{t.unitsReceived}</Text>
              <View style={[styles.stepperContainer, isKu ? styles.rtlRow : undefined]}>
                <Pressable style={styles.stepperButton} onPress={handleDecrement}>
                  <Ionicons name="remove" size={20} color="#475569" />
                </Pressable>
                <TextInput
                  value={String(units)}
                  onChangeText={(text) => {
                    const clean = text.replace(/[^0-9]/g, "");
                    setUnits(clean ? parseInt(clean) : 0);
                  }}
                  keyboardType="number-pad"
                  style={styles.stepperValue}
                  selectTextOnFocus={true}
                />
                <Pressable style={styles.stepperButton} onPress={handleIncrement}>
                  <Ionicons name="add" size={20} color="#0066FF" />
                </Pressable>
              </View>

              {/* Buy Price Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, isKu ? styles.rtlText : undefined]}>{t.buyPrice}</Text>
                
                {/* Currency Toggle */}
                <View style={[styles.toggleRow, isKu ? styles.rtlRow : undefined]}>
                  <Pressable
                    style={[
                      styles.toggleButton,
                      currency === "USD" ? styles.toggleActive : styles.toggleInactive,
                    ]}
                    onPress={() => handleCurrencyChange("USD")}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        currency === "USD" ? styles.toggleTextActive : styles.toggleTextInactive,
                      ]}
                    >
                      USD
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.toggleButton,
                      currency === "IQD" ? styles.toggleActive : styles.toggleInactive,
                    ]}
                    onPress={() => handleCurrencyChange("IQD")}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        currency === "IQD" ? styles.toggleTextActive : styles.toggleTextInactive,
                      ]}
                    >
                      IQD
                    </Text>
                  </Pressable>
                </View>

                <View style={[styles.inputRow, isKu ? styles.rtlRow : undefined]}>
                  {currency === "USD" ? (
                    <Text style={styles.currencyPrefix}>$</Text>
                  ) : null}
                  <TextInput
                    value={buyPrice}
                    onChangeText={setBuyPrice}
                    keyboardType="decimal-pad"
                    style={[styles.textInputWithPrefix, isKu ? styles.rtlText : undefined]}
                    placeholder={currency === "USD" ? "0.00" : "0"}
                    placeholderTextColor="#9CA3AF"
                  />
                  {currency === "IQD" ? (
                    <Text style={styles.currencySuffix}>IQD</Text>
                  ) : null}
                </View>
                <Text style={[styles.hint, isKu ? styles.rtlText : undefined]}>{t.buyPriceHint}</Text>
              </View>

              {/* Sell Price Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, isKu ? styles.rtlText : undefined]}>{t.sellPrice}</Text>
                <View style={[styles.inputRow, isKu ? styles.rtlRow : undefined]}>
                  <TextInput
                    value={sellPrice}
                    onChangeText={(text) => {
                      const clean = text.replace(/[^0-9]/g, "");
                      setSellPrice(clean ? parseInt(clean).toLocaleString() : "");
                    }}
                    keyboardType="number-pad"
                    style={[styles.textInputWithPrefix, isKu ? styles.rtlText : undefined, { marginLeft: isKu ? 0 : 4, marginRight: isKu ? 4 : 0 }]}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.currencySuffix}>IQD</Text>
                </View>
                <Text style={[styles.hint, isKu ? styles.rtlText : undefined]}>{t.sellPriceHint}</Text>
              </View>

              {/* Profit Preview Banner */}
              <View style={[styles.profitBanner, isKu ? styles.rtlRow : undefined]}>
                <Ionicons name="trending-up" size={20} color="#16A34A" />
                <Text style={[styles.profitText, isKu ? styles.rtlText : undefined, { marginLeft: isKu ? 0 : 8, marginRight: isKu ? 8 : 0 }]}>
                  {t.profitPreview(currentProfit, exchangeRate)}
                </Text>
              </View>

              {/* Restock Date Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, isKu ? styles.rtlText : undefined]}>{t.restockDate}</Text>
                <View style={[styles.dateContainer, isKu ? styles.rtlRow : undefined]}>
                  <Text style={styles.dateText}>{formatDate(today)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#64748B" />
                </View>
              </View>
            </ScrollView>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Pressable style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>
                  {t.confirmButton(units)}
                </Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>{t.cancelButton}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: "100%",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 24,
    paddingTop: 8,
    maxHeight: "90%",
  },
  dragHandleContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#0F172A",
  },
  headerSubTitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "#64748B",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  scrollView: {
    flexShrink: 1,
    marginBottom: 12,
  },
  label: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    color: "#64748B",
    marginBottom: 8,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    color: "#0F172A",
    marginHorizontal: 24,
    minWidth: 60,
    textAlign: "center",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    color: "#0F172A",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencyPrefix: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#0F172A",
    marginRight: 4,
  },
  textInputWithPrefix: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    color: "#0F172A",
  },
  hint: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
  profitBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  profitText: {
    flex: 1,
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: "#166534",
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    color: "#0F172A",
  },
  buttonContainer: {
    marginTop: 8,
  },
  confirmButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  confirmButtonText: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#64748B",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  toggleButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  toggleActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  toggleInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  toggleText: {
    fontFamily: "Poppins-Bold",
    fontSize: 14,
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  toggleTextInactive: {
    color: "#64748B",
  },
  currencySuffix: {
    fontFamily: "Poppins-Bold",
    fontSize: 15,
    color: "#0F172A",
    marginLeft: 4,
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
