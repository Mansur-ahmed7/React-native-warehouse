import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useWarehouseStore } from "../store/useWarehouseStore";

type Period = "today" | "week" | "month";

const periodOptions: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export default function ReportsTab() {
  const { parts, salesHistory, customers, settings, settleCustomerDebt, setActiveTab } =
    useWarehouseStore();
  const [period, setPeriod] = useState<Period>("today");

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
  const debtCustomers = customers.filter((customer) => customer.balance > 0);

  return (
    <View className="flex-1 px-6">
      <Text className="font-poppins-bold text-[34px] text-text-primary leading-[42px] mb-4">
        Reports / راپۆرت
      </Text>

      <View className="flex-row bg-white rounded-2xl border border-gray-100 p-1 mb-5 shadow-sm">
        {periodOptions.map((option) => {
          const selected = period === option.key;
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
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="flex-row gap-3 mb-3">
          <StatCard label="Total Parts" value={String(parts.length)} icon="package-variant-closed" />
          <StatCard
            label="Inventory Value"
            value={`${Math.round(totalInventoryValue).toLocaleString()} IQD`}
            icon="warehouse"
          />
        </View>
        <View className="flex-row gap-3 mb-5">
          <StatCard
            label="Revenue"
            value={`${totalRevenue.toLocaleString()} IQD`}
            icon="cash-register"
          />
          <StatCard
            label="Profit"
            value={`${Math.round(totalProfit).toLocaleString()} IQD`}
            icon="trending-up"
            accent="#10B981"
          />
        </View>

        <View className="flex-row gap-3 mb-5">
          <AlertBadge
            label="Low Stock"
            count={lowStockCount}
            color="#D97706"
            bg="bg-amber-50"
            border="border-amber-200"
          />
          <AlertBadge
            label="Out of Stock"
            count={outOfStockCount}
            color="#DC2626"
            bg="bg-red-50"
            border="border-red-200"
          />
        </View>

        <SectionTitle title="Recent Sales" />
        <View className="gap-3 mb-5">
          {filteredSales.length === 0 ? (
            <EmptyCard text="No sales recorded for this period." />
          ) : (
            filteredSales.map((sale) => (
              <View
                key={sale.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-poppins-bold text-[15px] text-text-primary">
                      {sale.receiptNumber}
                    </Text>
                    <Text className="font-poppins-semibold text-[11.5px] text-gray-400 mt-0.5">
                      {sale.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </Text>
                  </View>
                  <Text className="font-poppins-bold text-[15px] text-[#0066FF]">
                    {sale.total.toLocaleString()} IQD
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <SectionTitle title="Outstanding Debt" />
        <View className="gap-3 mb-6">
          {debtCustomers.length === 0 ? (
            <EmptyCard text="All customer balances are clear." />
          ) : (
            debtCustomers.map((customer) => (
              <View
                key={customer.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View
                    className={`w-11 h-11 rounded-full items-center justify-center mr-3 ${
                      customer.color === "green"
                        ? "bg-green-100"
                        : customer.color === "purple"
                        ? "bg-purple-100"
                        : "bg-blue-100"
                    }`}
                  >
                    <Text className="font-poppins-bold text-[13px] text-text-primary">
                      {customer.initials}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-poppins-bold text-[14.5px] text-text-primary"
                      numberOfLines={1}
                    >
                      {customer.name}
                    </Text>
                    <Text className="font-poppins-semibold text-[11.5px] text-gray-400">
                      {customer.balance.toLocaleString()} IQD
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => settleCustomerDebt(customer.id)}
                  className="px-4 py-2 rounded-xl bg-green-50 border border-green-200 active:bg-green-100"
                >
                  <Text className="font-poppins-bold text-[12px] text-green-700">
                    Settle
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Pressable
          onPress={() => setActiveTab("sale")}
          className="w-full flex-row items-center justify-center rounded-2xl bg-[#0066FF] py-4.5 active:bg-blue-700 shadow-md"
        >
          <MaterialCommunityIcons color="#FFFFFF" name="plus-circle-outline" size={20} />
          <Text className="font-poppins-bold text-[16px] text-white ml-2">
            Record New Sale
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
}: {
  label: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent?: string;
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm min-h-[118px]">
      <MaterialCommunityIcons color={accent} name={icon} size={24} />
      <Text className="font-poppins-semibold text-[11.5px] text-text-secondary mt-3">
        {label}
      </Text>
      <Text className="font-poppins-bold text-[15px] text-text-primary mt-1" numberOfLines={2}>
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
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <View className={`flex-1 rounded-2xl px-4 py-3 border ${bg} ${border}`}>
      <Text className="font-poppins-bold text-[22px]" style={{ color }}>
        {count}
      </Text>
      <Text className="font-poppins-semibold text-[12px]" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="font-poppins-bold text-[17px] text-text-primary mb-3">
      {title}
    </Text>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm items-center">
      <Text className="font-poppins-semibold text-[13px] text-text-secondary text-center">
        {text}
      </Text>
    </View>
  );
}
