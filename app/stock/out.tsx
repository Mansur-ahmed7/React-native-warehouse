import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useWarehouseStore } from "@/store/useWarehouseStore";
import { Part } from "@/types/inventory";
import { images } from "@/constants/images";
import RestockModal from "@/components/RestockModal";

export default function OutOfStockScreen() {
  const router = useRouter();
  const { parts, settings } = useWarehouseStore();
  const language = settings.language;
  const isKu = language === "ku";

  // Modal State
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Filter Parts: quantity === 0
  const outOfStockParts = parts.filter((part) => part.quantity === 0);

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

  const handleOpenRestock = (part: Part) => {
    setSelectedPart(part);
    setIsModalVisible(true);
  };



  // Format Date (e.g., "12 May 2026")
  const formatRestockDate = (dateStr?: string) => {
    if (!dateStr) return isKu ? "هیچکات" : "Never";
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Kurdish Localized Strings
  const t = {
    title: isKu ? "کاڵا نەماوەکان" : "Out of Stock Items",
    itemsCount: isKu ? `${outOfStockParts.length} کاڵا` : `${outOfStockParts.length} items`,
    outOfStock: isKu ? "کاڵا نەماوە" : "Out of Stock",
    remaining: isKu ? "یەکە ماوەتەوە" : "remaining",
    lastRestocked: isKu ? "دوایین دابینکردنەوە" : "Last restocked",
    supplier: isKu ? "دابینکەر" : "Supplier",
    buy: isKu ? "کڕین" : "Buy",
    sell: isKu ? "فرۆشتن" : "Sell",
    restockNow: isKu ? "دابینکردنەوەی ئێستا" : "Restock Now",
    emptyState: isKu ? "هیچ کاڵایەکی نەماو نییە" : "No out of stock items",
  };

  const renderItemCard = ({ item }: { item: Part }) => {
    const partImg = getPartImage(item);
    const displayName = item.name;

    // Compatible Car tag logic
    const firstCar = item.compatibleCars?.[0];
    const hasMoreCars = item.compatibleCars?.length > 1;

    return (
      <View style={styles.card}>
        {/* TOP ROW */}
        <View style={[styles.cardTopRow, isKu ? styles.rtlRow : undefined]}>
          {partImg ? (
            <Image source={partImg} style={styles.cardImage} contentFit="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={32} color="#9CA3AF" />
            </View>
          )}

          <View style={[styles.cardTextContainer, isKu ? styles.rtlAlign : undefined]}>
            <Text style={[styles.partName, isKu ? styles.rtlText : undefined]} numberOfLines={2}>
              {displayName}
            </Text>
            {item.partNumber ? (
              <Text style={[styles.partNumber, isKu ? styles.rtlText : undefined]}>
                {item.partNumber}
              </Text>
            ) : null}

            {/* Compatible Cars tags */}
            {firstCar ? (
              <View style={[styles.compatibilityRow, isKu ? styles.rtlRow : undefined]}>
                <View style={styles.carTag}>
                  <Text style={styles.carTagText} numberOfLines={1}>
                    {firstCar.brand} {firstCar.model} ({firstCar.yearFrom}-{firstCar.yearTo})
                  </Text>
                </View>
                {hasMoreCars ? (
                  <View style={styles.moreCarsTag}>
                    <Text style={styles.moreCarsTagText}>
                      +{item.compatibleCars.length - 1} more
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        {/* MIDDLE SECTION */}
        <View style={styles.cardMiddleSection}>
          <View style={[styles.stockRow, isKu ? styles.rtlRow : undefined]}>
            <View style={[styles.stockStatusContainer, isKu ? styles.rtlRow : undefined]}>
              <Ionicons
                name="close-circle"
                size={18}
                color="#DC2626"
                style={isKu ? styles.iconLeftKu : styles.iconRightEn}
              />
              <Text style={styles.stockStatusText}>{t.outOfStock}</Text>
            </View>
            <Text style={styles.remainingText}>0 {t.remaining}</Text>
          </View>

          <Text style={[styles.detailText, isKu ? styles.rtlText : undefined]}>
            {t.lastRestocked}: {formatRestockDate(item.updated_at)}
          </Text>


          <Text style={[styles.detailText, isKu ? styles.rtlText : undefined]}>
            {t.buy}: ${item.buyPriceUSD} · {t.sell}: {item.sellPriceIQD.toLocaleString()} IQD
          </Text>
        </View>

        {/* BOTTOM SECTION - Red Outlined Button */}
        <Pressable
          style={styles.restockButton}
          onPress={() => handleOpenRestock(item)}
        >
          <Ionicons name="cube" size={16} color="#DC2626" style={styles.buttonIcon} />
          <Text style={styles.restockButtonText}>{t.restockNow}</Text>
        </Pressable>

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={[styles.topNav, isKu ? styles.rtlRow : undefined]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </Pressable>
        <Text style={styles.navTitle}>{t.title}</Text>
        <Text style={styles.navCount}>{t.itemsCount}</Text>
      </View>

      {/* Main List */}
      <FlatList
        data={outOfStockParts}
        keyExtractor={(item) => item.id}
        renderItem={renderItemCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="close-circle-outline" size={48} color="#DC2626" />
            </View>
            <Text style={styles.emptyText}>{t.emptyState}</Text>
          </View>
        }
      />

      {/* Shared Restock Modal */}
      <RestockModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        item={selectedPart}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  topNav: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#0F172A",
    flex: 1,
    textAlign: "center",
  },
  navCount: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: "#64748B",
  },
  listContent: {
    paddingVertical: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  partName: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#0F172A",
    lineHeight: 22,
  },
  partNumber: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  compatibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flexWrap: "wrap",
    gap: 4,
  },
  carTag: {
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: "80%",
  },
  carTagText: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: "#2563EB",
  },
  moreCarsTag: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  moreCarsTagText: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: "#64748B",
  },
  cardMiddleSection: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    marginBottom: 14,
  },
  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  stockStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconRightEn: {
    marginRight: 6,
  },
  iconLeftKu: {
    marginLeft: 6,
  },
  stockStatusText: {
    fontFamily: "Poppins-Bold",
    fontSize: 14,
    color: "#DC2626",
  },
  remainingText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12.5,
    color: "#64748B",
  },
  detailText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  restockButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 6,
  },
  restockButtonText: {
    fontFamily: "Poppins-Bold",
    fontSize: 14,
    color: "#DC2626",
  },
  infoBanner: {
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoBannerLtrBorder: {
    borderLeftWidth: 3,
    borderLeftColor: "#2563EB",
  },
  infoBannerRtlBorder: {
    borderRightWidth: 3,
    borderRightColor: "#2563EB",
  },
  infoBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoBannerText: {
    fontFamily: "Poppins-Medium",
    fontSize: 11.5,
    color: "#2563EB",
    lineHeight: 16,
  },
  callLink: {
    fontFamily: "Poppins-Bold",
    fontSize: 11.5,
    color: "#2563EB",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  // RTL Support Utilities
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
