import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, Alert, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useWarehouseStore } from "../store/useWarehouseStore";

export default function SettingsTab() {
  const {
    settings,
    setLanguage,
    setTheme,
    setExchangeRate,
    setActiveTab,
    exportBackup,
    importBackup,
    parts,
    carBrands,
    addCarBrand,
    removeCarBrand,
  } = useWarehouseStore();
  const [rateText, setRateText] = useState(String(settings.exchangeRate));
  const [newBrandInput, setNewBrandInput] = useState("");
  const isKu = settings.language === "ku";

  const t = {
    language: isKu ? "زمان" : "LANGUAGE",
    theme: isKu ? "ڕوکار" : "THEME",
    themeLight: isKu ? "ڕوکاری ڕووناک" : "Light Mode",
    themeDark: isKu ? "ڕوکاری تاریک" : "Dark Mode",
    exchangeRate: isKu ? "نرخی گۆڕینەوە" : "EXCHANGE RATE",
    carBrands: isKu ? "مارکەکانی ئۆتۆمبێل" : "CAR BRANDS",
    newBrandPlaceholder: isKu ? "ناوی نوێی مارکە..." : "New brand name...",
    add: isKu ? "زیادکردن" : "Add",
    account: isKu ? "هەژمار" : "ACCOUNT",
    staffMember: isKu ? "کارمەندی بەش" : "Staff Member",
    warehouseStaff: isKu ? "کارمەندی کۆگا" : "Warehouse Staff",
    logout: isKu ? "چوونەدەرەوە" : "Log Out",
    backup: isKu ? "پاڵپشتی کۆگا" : "BACKUP",
    exportBackup: isKu ? "هەناردەکردنی پاڵپشتی" : "Export Backup",
    exportBackupSub: isKu ? "پاشەکەوتکردنی فایلێکی JSON بۆ درایڤ/تیلێگرام/هتد." : "Save a JSON backup to Drive/Telegram/etc.",
    importBackup: isKu ? "هاوردەکردنی پاڵپشتی" : "Import Backup",
    importBackupSub: isKu ? "گێڕانەوەی کاڵاکانی کۆگا لە فایلی پاڵپشتییەوە" : "Restore inventory from a backup file",
    recordNewSale: isKu ? "تۆمارکردنی فرۆشتنی نوێ" : "Record New Sale",
    duplicateBrandTitle: isKu ? "مارکەی دووبارە" : "Duplicate Brand",
    duplicateBrandMsg: isKu ? "ئەم مارکەیە پێشتر هەیە." : "This brand already exists.",
    cannotRemoveTitle: isKu ? "ناتوانرێت لاببرێت" : "Cannot remove",
    cannotRemoveMsg: (count: number) => isKu 
      ? `ناتوانرێت لاببرێت — بەکارهاتووە لەلایەن ${count} کاڵاوە`
      : `Cannot remove — used by ${count} parts`,
    removeConfirmTitle: (brand: string) => isKu ? `لادانی ${brand}؟` : `Remove ${brand}?`,
    removeConfirmMsg: (brand: string) => isKu 
      ? `ئایا دڵنیای لە لادانی ${brand}؟`
      : `Are you sure you want to remove ${brand}?`,
    cancel: isKu ? "پاشگەزبوونەوە" : "Cancel",
    remove: isKu ? "لادان" : "Remove",
  };

  const handleRateChange = (value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    setRateText(clean);
    const parsed = parseInt(clean, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setExchangeRate(parsed);
    }
  };

  const handleAddBrand = () => {
    const trimmed = newBrandInput.trim();
    if (!trimmed) return;
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (carBrands.includes(capitalized)) {
      Alert.alert(t.duplicateBrandTitle, t.duplicateBrandMsg);
      return;
    }
    addCarBrand(capitalized);
    setNewBrandInput("");
  };

  const handleRemoveBrand = (brand: string) => {
    const usedPartsCount = parts.filter(p => 
      p.compatibleCars && p.compatibleCars.some(c => c.brand.toLowerCase() === brand.toLowerCase())
    ).length;

    if (usedPartsCount > 0) {
      Alert.alert(
        t.cannotRemoveTitle,
        t.cannotRemoveMsg(usedPartsCount)
      );
      return;
    }

    Alert.alert(
      t.removeConfirmTitle(brand),
      t.removeConfirmMsg(brand),
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.remove,
          style: "destructive",
          onPress: () => {
            removeCarBrand(brand);
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 px-6">
      <Text
        style={{
          fontFamily: "Poppins-Bold",
          fontSize: 34,
          color: "#0F172A",
          lineHeight: 42,
          marginBottom: 20,
          textAlign: isKu ? "right" : "left",
        }}
      >
        {isKu ? "ڕێکخستنەکان" : "Settings"}
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <View className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-5">
          <SectionHeader icon="translate" title={t.language} color="#8B5CF6" isKu={isKu} />
          <RadioRow
            label="English"
            selected={settings.language === "en"}
            onPress={() => setLanguage("en")}
            isKu={isKu}
          />
          <RadioRow
            label="کوردی (سۆرانی)"
            selected={settings.language === "ku"}
            onPress={() => setLanguage("ku")}
            isKu={isKu}
          />
        </View>

        <View className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-5">
          <SectionHeader
            icon="theme-light-dark"
            title={t.theme}
            color="#0066FF"
            isKu={isKu}
          />
          <RadioRow
            label={t.themeLight}
            selected={settings.theme === "light"}
            onPress={() => setTheme("light")}
            isKu={isKu}
          />
          <RadioRow
            label={t.themeDark}
            selected={settings.theme === "dark"}
            onPress={() => setTheme("dark")}
            isKu={isKu}
          />
        </View>

        <View className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 mb-5">
          <View style={{ flexDirection: isKu ? "row-reverse" : "row", alignItems: "center", marginBottom: 16 }}>
            <MaterialCommunityIcons
              color="#10B981"
              name="swap-horizontal"
              size={22}
            />
            <Text style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: "#64748B", marginLeft: isKu ? 0 : 8, marginRight: isKu ? 8 : 0 }}>
              {t.exchangeRate}
            </Text>
          </View>
          <View style={{ flexDirection: isKu ? "row-reverse" : "row", alignItems: "center", backgroundColor: "#F6F7FB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14, color: "#64748B", marginRight: isKu ? 0 : 8, marginLeft: isKu ? 8 : 0 }}>
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
                textAlign: isKu ? "left" : "right",
              }}
            />
            <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14, color: "#64748B", marginLeft: isKu ? 0 : 8, marginRight: isKu ? 8 : 0 }}>
              IQD
            </Text>
          </View>
        </View>

        {/* CAR BRANDS SECTION */}
        <View style={brandStyles.card}>
          <View style={[brandStyles.sectionHeader, isKu ? brandStyles.rtlRow : undefined]}>
            <Ionicons name="car" size={22} color="#3B82F6" />
            <Text style={[brandStyles.sectionTitle, { marginLeft: isKu ? 0 : 8, marginRight: isKu ? 8 : 0 }]}>{t.carBrands}</Text>
          </View>
          {carBrands.map((brand) => (
            <View key={brand} style={[brandStyles.row, isKu ? brandStyles.rtlRow : undefined]}>
              <Text style={[brandStyles.brandName, isKu ? brandStyles.rtlText : undefined]}>{brand}</Text>
              <Pressable
                onPress={() => handleRemoveBrand(brand)}
                style={brandStyles.trashIcon}
              >
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </Pressable>
            </View>
          ))}
          <View style={[brandStyles.addBrandRow, isKu ? brandStyles.rtlRow : undefined]}>
            <Ionicons name="add-circle-outline" size={22} color="#0066FF" />
            <TextInput
              value={newBrandInput}
              onChangeText={setNewBrandInput}
              placeholder={t.newBrandPlaceholder}
              placeholderTextColor="#9CA3AF"
              style={[brandStyles.textInput, isKu ? brandStyles.rtlText : undefined]}
            />
            <Pressable
              onPress={handleAddBrand}
              disabled={!newBrandInput.trim()}
              style={[
                brandStyles.addButton,
                !newBrandInput.trim() && brandStyles.addButtonDisabled,
                isKu ? { paddingLeft: 16, paddingRight: 16 } : null,
              ]}
            >
              <Text style={brandStyles.addButtonText}>{t.add}</Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-6">
          <SectionHeader
            icon="account-circle-outline"
            title={t.account}
            color="#475569"
            isKu={isKu}
          />
          <InfoRow
            icon="account-outline"
            label={t.staffMember}
            value={t.warehouseStaff}
            isKu={isKu}
          />
          <InfoRow icon="logout" label={t.logout} value="" danger isKu={isKu} />
        </View>

        <View className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-6">
          <SectionHeader
            icon="cloud-upload-outline"
            title={t.backup}
            color="#0EA5E9"
            isKu={isKu}
          />
          <ActionRow
            icon="export-variant"
            label={t.exportBackup}
            subLabel={t.exportBackupSub}
            onPress={exportBackup}
            isKu={isKu}
          />
          <ActionRow
            icon="import"
            label={t.importBackup}
            subLabel={t.importBackupSub}
            onPress={importBackup}
            isKu={isKu}
          />
        </View>

        <Pressable
          onPress={() => setActiveTab("sale")}
          style={{ flexDirection: isKu ? "row-reverse" : "row", alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#0066FF", paddingVertical: 14, shadowColor: "#000000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
        >
          <MaterialCommunityIcons
            color="#FFFFFF"
            name="plus-circle-outline"
            size={20}
          />
          <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16, color: "#FFFFFF", marginLeft: isKu ? 0 : 8, marginRight: isKu ? 8 : 0 }}>
            {t.recordNewSale}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const brandStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 12,
    color: "#475569",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  brandName: {
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    color: "#0F172A",
  },
  trashIcon: {
    padding: 4,
  },
  addBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    color: "#0F172A",
    paddingVertical: 8,
    margin: 0,
    padding: 0,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0066FF",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  addButtonText: {
    fontFamily: "Poppins-Bold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  rtlRow: {
    flexDirection: "row-reverse",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});

function SectionHeader({
  icon,
  title,
  color,
  isKu,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  color: string;
  isKu?: boolean;
}) {
  return (
    <View style={{ flexDirection: isKu ? "row-reverse" : "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
      <MaterialCommunityIcons color={color} name={icon} size={22} />
      <Text
        style={{
          fontFamily: "Poppins-Bold",
          fontSize: 12,
          color: "#64748B",
          marginLeft: isKu ? 0 : 8,
          marginRight: isKu ? 8 : 0,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function RadioRow({
  label,
  selected,
  onPress,
  isKu,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  isKu?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: isKu ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
      }}
    >
      <Text
        style={{
          fontFamily: "Poppins-SemiBold",
          fontSize: 15,
          color: "#0F172A",
          textAlign: isKu ? "right" : "left",
        }}
      >
        {label}
      </Text>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: selected ? "#0066FF" : "#D1D5DB",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && (
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#0066FF" }} />
        )}
      </View>
    </Pressable>
  );
}

function InfoRow({
  icon,
  label,
  value,
  danger = false,
  isKu,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  danger?: boolean;
  isKu?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: isKu ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
      }}
    >
      <View style={{ flexDirection: isKu ? "row-reverse" : "row", alignItems: "center" }}>
        <MaterialCommunityIcons
          color={danger ? "#DC2626" : "#64748B"}
          name={icon}
          size={21}
        />
        <Text
          style={{
            fontFamily: "Poppins-SemiBold",
            fontSize: 15,
            color: danger ? "#DC2626" : "#0F172A",
            marginLeft: isKu ? 0 : 12,
            marginRight: isKu ? 12 : 0,
          }}
        >
          {label}
        </Text>
      </View>
      {value ? (
        <Text style={{ fontFamily: "Poppins-Bold", fontSize: 13, color: "#64748B" }}>
          {value}
        </Text>
      ) : null}
    </View>
  );
}

function ActionRow({
  icon,
  label,
  subLabel,
  onPress,
  isKu,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  subLabel: string;
  onPress: () => void | Promise<unknown>;
  isKu?: boolean;
}) {
  return (
    <Pressable
      onPress={() => void onPress()}
      style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
      }}
    >
      <View style={{ flexDirection: isKu ? "row-reverse" : "row", alignItems: "flex-start" }}>
        <MaterialCommunityIcons color="#0EA5E9" name={icon} size={21} />
        <View style={{ flex: 1, marginLeft: isKu ? 0 : 12, marginRight: isKu ? 12 : 0, alignItems: isKu ? "flex-end" : "flex-start" }}>
          <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 15, color: "#0F172A", textAlign: isKu ? "right" : "left" }}>
            {label}
          </Text>
          <Text style={{ fontFamily: "Poppins-Regular", fontSize: 12.5, color: "#64748B", marginTop: 4, textAlign: isKu ? "right" : "left" }}>
            {subLabel}
          </Text>
        </View>
        <MaterialCommunityIcons
          color="#94A3B8"
          name={isKu ? "chevron-left" : "chevron-right"}
          size={22}
        />
      </View>
    </Pressable>
  );
}
