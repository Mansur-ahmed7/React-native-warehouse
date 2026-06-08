import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useWarehouseStore } from "../store/useWarehouseStore";

type Period = "today" | "week" | "month";

const periodOptions: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export default function ReportsTab() {
  const router = useRouter();
  const { parts, salesHistory, settings, setActiveTab } =
    useWarehouseStore();
  const [period, setPeriod] = useState<Period>("today");
  const isKu = settings.language === "ku";

  const t = {
    title: isKu ? "راپۆرتەکان" : "Reports",
    today: isKu ? "ئەمڕۆ" : "Today",
    week: isKu ? "ئەم هەفتەیە" : "This Week",
    month: isKu ? "ئەم مانگە" : "This Month",
    totalParts: isKu ? "کۆی پارچەکان" : "Total Parts",
    inventoryValue: isKu ? "بەهای کۆگا" : "Inventory Value",
    revenue: isKu ? "داهات" : "Revenue",
    profit: isKu ? "قازانج" : "Profit",
    lowStock: isKu ? "کاڵای کەمبوو" : "Low Stock",
    outOfStock: isKu ? "کاڵای نەماو" : "Out of Stock",
    recentSales: isKu ? "فرۆشتنەکانی ئەم دواییە" : "Recent Sales",
    noSales: isKu ? "هیچ فرۆشتنێک لەم ماوەیەدا تۆمار نەکراوە." : "No sales recorded for this period.",
    items: (count: number) => isKu ? `${count} دانە` : `${count} items`,
    recordNewSale: isKu ? "تۆمارکردنی فرۆشتنی نوێ" : "Record New Sale",
  };

  const filteredSales = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    if (period === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else {
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
    }

    return salesHistory.filter((sale) => sale.timestamp >= start);
  }, [period, salesHistory]);

  const totalInventoryValue = parts.reduce(
    (sum, part) => sum + part.buyPriceUSD * settings.exchangeRate * part.quantity,
    0
  );
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalCost = filteredSales.reduce(
    (sum, sale) =>
      sum +
      sale.items.reduce((itemSum, item) => {
        const part = parts.find((p) => p.id === item.partId);
        return itemSum + (part ? part.buyPriceUSD * settings.exchangeRate * item.quantity : 0);
      }, 0),
    0
  );
  const totalProfit = totalRevenue - totalCost;
  const lowStockCount = parts.filter((part) => part.status === "lowStock").length;
  const outOfStockCount = parts.filter((part) => part.status === "outOfStock").length;

  return (
    <View className="flex-1 px-6">
      <Text className="font-poppins-bold text-[34px] text-text-primary leading-[42px] mb-4" style={isKu ? styles.rtlText : undefined}>
        {t.title}
      </Text>

      <View className="flex-row bg-white rounded-2xl border border-gray-100 p-1 mb-5 shadow-sm" style={isKu ? styles.rtlRow : undefined}>
        {periodOptions.map((option) => {
          const selected = period === option.key;
          const displayLabel = option.key === "today" ? t.today : option.key === "week" ? t.week : t.month;
          return (
            <Pressable
              key={option.key}
              onPress={() => setPeriod(option.key)}
              className={`flex-1 items-center justify-center py-2.5 rounded-xl ${
                selected ? "bg-[#0066FF]" : "bg-transparent"
              }`}
            >
              <Text
                className={`font-poppins-bold text-[12.5px] ${
                  selected ? "text-white" : "text-text-secondary"
                }`}
              >
                {displayLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="flex-row gap-3 mb-3" style={isKu ? styles.rtlRow : undefined}>
          <StatCard label={t.totalParts} value={String(parts.length)} icon="package-variant-closed" isKu={isKu} />
          <StatCard
            label={t.inventoryValue}
            value={`${Math.round(totalInventoryValue).toLocaleString()} IQD`}
            icon="warehouse"
            isKu={isKu}
          />
        </View>
        <View className="flex-row gap-3 mb-5" style={isKu ? styles.rtlRow : undefined}>
          <StatCard
            label={t.revenue}
            value={`${totalRevenue.toLocaleString()} IQD`}
            icon="cash-register"
            isKu={isKu}
          />
          <StatCard
            label={t.profit}
            value={`${Math.round(totalProfit).toLocaleString()} IQD`}
            icon="trending-up"
            accent="#10B981"
            isKu={isKu}
          />
        </View>

        <View className="flex-row gap-3 mb-5" style={isKu ? styles.rtlRow : undefined}>
          <AlertBadge
            label={t.lowStock}
            count={lowStockCount}
            color="#D97706"
            bg="bg-amber-50"
            border="border-amber-200"
            onPress={() => router.push("/stock/low")}
            isKu={isKu}
          />
          <AlertBadge
            label={t.outOfStock}
            count={outOfStockCount}
            color="#DC2626"
            bg="bg-red-50"
            border="border-red-200"
            onPress={() => router.push("/stock/out")}
            isKu={isKu}
          />
        </View>

        <SectionTitle title={t.recentSales} isKu={isKu} />
        <View className="gap-3 mb-5">
          {filteredSales.length === 0 ? (
            <EmptyCard text={t.noSales} isKu={isKu} />
          ) : (
            filteredSales.map((sale) => (
              <View
                key={sale.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
              >
                <View className="flex-row items-center justify-between" style={isKu ? styles.rtlRow : undefined}>
                  <View style={isKu ? styles.rtlAlign : undefined}>
                    <Text className="font-poppins-bold text-[15px] text-text-primary" style={isKu ? styles.rtlText : undefined}>
                      {sale.receiptNumber}
                    </Text>
                    <Text className="font-poppins-semibold text-[11.5px] text-gray-400 mt-0.5" style={isKu ? styles.rtlText : undefined}>
                      {t.items(sale.items.reduce((sum, item) => sum + item.quantity, 0))}
                    </Text>
                  </View>
                  <Text className="font-poppins-bold text-[15px] text-[#0066FF]" style={isKu ? styles.rtlText : undefined}>
                    {sale.total.toLocaleString()} IQD
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Pressable
          onPress={() => setActiveTab("sale")}
          className="w-full flex-row items-center justify-center rounded-2xl bg-[#0066FF] py-4.5 active:bg-blue-700 shadow-md"
          style={isKu ? styles.rtlRow : undefined}
        >
          <MaterialCommunityIcons color="#FFFFFF" name="plus-circle-outline" size={20} />
          <Text className="font-poppins-bold text-[16px] text-white" style={isKu ? { marginRight: 8 } : { marginLeft: 8 }}>
            {t.recordNewSale}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent = "#0066FF",
  isKu,
}: {
  label: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent?: string;
  isKu: boolean;
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm min-h-[118px] items-center justify-center">
      <MaterialCommunityIcons color={accent} name={icon} size={24} />
      <Text className="font-poppins-semibold text-[11.5px] text-text-secondary mt-2.5 text-center">
        {label}
      </Text>
      <Text className="font-poppins-bold text-[14.5px] text-text-primary mt-1 text-center" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function AlertBadge({
  label,
  count,
  color,
  bg,
  border,
  onPress,
  isKu,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
  border: string;
  onPress?: () => void;
  isKu: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-2xl px-4 py-3 border ${bg} ${border} active:opacity-70 items-center justify-center`}
    >
      <Text className="font-poppins-bold text-[22px] text-center" style={{ color }}>
        {count}
      </Text>
      <Text className="font-poppins-semibold text-[12px] text-center mt-0.5" style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionTitle({ title, isKu }: { title: string; isKu: boolean }) {
  return (
    <Text className="font-poppins-bold text-[17px] text-text-primary mb-3" style={isKu ? styles.rtlText : undefined}>
      {title}
    </Text>
  );
}

function EmptyCard({ text, isKu }: { text: string; isKu: boolean }) {
  return (
    <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm items-center">
      <Text className="font-poppins-semibold text-[13px] text-text-secondary text-center" style={isKu ? styles.rtlText : undefined}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
