import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useWarehouseStore } from "../store/useWarehouseStore";
import { images } from "../constants/images";
import { SaleRecord } from "../types/inventory";

export default function ReceiptOverlay() {
  const insets = useSafeAreaInsets();
  
  // Store Slices & Actions
  const {
    activeSaleRecord,
    parts,
    setShowReceipt,
    setActiveTab,
    triggerToast,
  } = useWarehouseStore();

  if (!activeSaleRecord) return null;

  // Format Receipt Date Helper
  const formatReceiptDate = (date: Date | string | undefined): string => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year} — ${hours}:${minutes}`;
  };

  // Map parts to their premium product images
  const getPartImage = (partId: string) => {
    const part = parts.find((p) => p.id === partId);
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

  // Print Receipt Action
  const handlePrintReceipt = () => {
    if (Platform.OS === "web") {
      window.print();
    } else {
      Alert.alert(
        "Print Receipt",
        "Printer service is only supported on Web mode for this prototype."
      );
    }
  };

  // Share Receipt on WhatsApp as Plain Text
  const handleShareWhatsApp = () => {
    const formattedDate = formatReceiptDate(activeSaleRecord.timestamp);
    let text = `*Auto Parts Store - Erbil, Kurdistan*\n`;
    text += `Receipt: ${activeSaleRecord.receiptNumber}\n`;
    text += `Date: ${formattedDate}\n`;
    text += `------------------------------------\n`;

    activeSaleRecord.items.forEach((item) => {
      const part = parts.find((p) => p.id === item.partId);
      if (part) {
        text += `• ${part.name} (${part.nameKu || ""})\n`;
        text += `  ${item.quantity} x ${item.unitPrice.toLocaleString()} = ${(item.quantity * item.unitPrice).toLocaleString()} IQD\n`;
      }
    });

    text += `------------------------------------\n`;
    text += `*Subtotal:* ${activeSaleRecord.subtotal.toLocaleString()} IQD\n`;
    text += `*Discount:* -${activeSaleRecord.discount.toLocaleString()} IQD\n`;
    text += `*TOTAL:* ${activeSaleRecord.total.toLocaleString()} IQD\n`;
    text += `*Amount Paid:* ${activeSaleRecord.amountPaid.toLocaleString()} IQD\n`;
    text += `*Change Returned:* ${activeSaleRecord.changeReturned.toLocaleString()} IQD\n\n`;
    text += `Thank you! / سوپاس`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch((err) => {
      console.error("Failed to open WhatsApp:", err);
      Alert.alert("Error", "Could not open WhatsApp.");
    });
  };

  // Share compiled PDF Receipt
  const handleSharePdf = async (sale: SaleRecord) => {
    try {
      triggerToast("Compiling PDF Receipt...");

      const itemsHtml = sale.items
        .map((item) => {
          const part = parts.find((p) => p.id === item.partId);
          if (!part) return "";
          return `
            <div class="item-row">
              <div class="item-details">
                <div class="item-name">${part.name}</div>
                ${part.nameKu ? `<div class="item-kurdish">${part.nameKu}</div>` : ""}
              </div>
              <div class="item-price">
                ${item.quantity} × ${item.unitPrice.toLocaleString()} = ${(item.quantity * item.unitPrice).toLocaleString()} IQD
              </div>
            </div>
          `;
        })
        .join("");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Receipt</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #333;
              margin: 0;
              padding: 20px;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
            }
            .receipt-container {
              max-width: 450px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              border-radius: 20px;
              padding: 24px;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
            }
            .header-block {
              background-color: rgba(0, 102, 255, 0.05);
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 20px;
            }
            .store-title {
              font-size: 20px;
              font-weight: bold;
              color: #0f172a;
              margin: 0;
            }
            .store-subtitle {
              font-size: 13px;
              color: #0066FF;
              font-weight: 600;
              margin: 4px 0 0 0;
            }
            .meta-row {
              margin-top: 12px;
              font-size: 12px;
              color: #6b7280;
            }
            .meta-row span {
              display: block;
              margin-top: 3px;
            }
            .divider {
              border-top: 1px dashed #cbd5e1;
              margin: 20px 0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              font-size: 13px;
            }
            .item-details {
              flex: 1;
              padding-right: 12px;
            }
            .item-name {
              font-weight: bold;
              color: #1e293b;
            }
            .item-kurdish {
              font-size: 11px;
              color: #94a3b8;
              margin-top: 2px;
            }
            .item-price {
              font-weight: bold;
              color: #0f172a;
              text-align: right;
            }
            .totals-block {
              font-size: 13px;
              color: #475569;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .total-grand {
              font-size: 16px;
              font-weight: bold;
              color: #0066FF;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
              margin-top: 8px;
            }
            .total-change {
              color: #10b981;
              font-weight: bold;
            }
            .footer-msg {
              text-align: center;
              font-weight: bold;
              color: #64748b;
              margin-top: 20px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header-block">
              <div style="font-size: 24px; margin-bottom: 8px;">🔧</div>
              <div class="store-title">Auto Parts Store</div>
              <div class="store-subtitle">Erbil, Kurdistan</div>
              <div class="meta-row">
                <span>📅 Date: ${formatReceiptDate(sale.timestamp)}</span>
                <span>🧾 Receipt: ${sale.receiptNumber}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="items-list">
              ${itemsHtml}
            </div>
            
            <div class="divider"></div>
            
            <div class="totals-block">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${sale.subtotal.toLocaleString()} IQD</span>
              </div>
              <div class="total-row">
                <span>Discount:</span>
                <span style="color: #ef4444;">-${sale.discount.toLocaleString()} IQD</span>
              </div>
              <div class="total-row total-grand">
                <span>TOTAL:</span>
                <span>${sale.total.toLocaleString()} IQD</span>
              </div>
              <div class="total-row" style="margin-top: 8px;">
                <span>Amount Paid:</span>
                <span>${sale.amountPaid.toLocaleString()} IQD</span>
              </div>
              <div class="total-row total-change">
                <span>Change Returned:</span>
                <span>${sale.changeReturned.toLocaleString()} IQD</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer-msg">
              Thank you! / سوپاس
            </div>
          </div>
        </body>
        </html>
      `;

      if (Platform.OS === "web") {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        window.open(uri, "_blank");
      } else {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Share Receipt ${sale.receiptNumber}`,
          UTI: "com.adobe.pdf",
        });
      }
    } catch (error: any) {
      console.error("PDF generation failed:", error);
      Alert.alert("Error", "Could not generate or share PDF: " + error.message);
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#F6F7FB",
        zIndex: 999999,
      }}
      className="flex-1"
    >
      {/* Web CSS printer styling injected dynamically */}
      {Platform.OS === "web" && (
        <style>
          {`
            @media print {
              body {
                background-color: white !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .no-print, header, nav, button, footer {
                display: none !important;
              }
              div[style*="position: absolute"] {
                background-color: white !important;
              }
              .receipt-overlay-container {
                padding: 0 !important;
                background-color: white !important;
                position: static !important;
                height: auto !important;
              }
              .receipt-card-wrapper {
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
                max-width: 100% !important;
                width: 100% !important;
                background: white !important;
              }
              .print-hidden-elements {
                display: none !important;
              }
            }
          `}
        </style>
      )}

      {/* Header Bar */}
      <View
        style={{ paddingTop: Math.max(insets.top, 12) }}
        className="flex-row items-center justify-between px-5 pb-3 border-b border-gray-100 bg-white print-hidden-elements"
      >
        <Pressable
          onPress={() => {
            setShowReceipt(false);
            setActiveTab("inventory");
          }}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
        >
          <MaterialCommunityIcons color="#0F172A" name="close" size={24} />
        </Pressable>

        <Text className="font-poppins-bold text-[18px] text-text-primary text-center">
          Receipt / وەصل
        </Text>

        <Pressable
          onPress={() => handleSharePdf(activeSaleRecord)}
          className="w-10 h-10 items-center justify-center rounded-full bg-blue-50 active:bg-blue-100"
        >
          <MaterialCommunityIcons color="#0066FF" name="share-variant-outline" size={20} />
        </Pressable>
      </View>

      {/* Scrollable Receipt Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        className="flex-1 receipt-overlay-container"
      >
        {/* Receipt Card */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            overflow: "hidden",
            elevation: 2,
          }}
          className="receipt-card-wrapper mb-5 shadow-sm"
        >
          {/* Store Header Block (light blue background) */}
          <View className="bg-[#0066FF]/5 p-5 flex-row items-center">
            <View className="w-12 h-12 rounded-xl bg-[#0066FF] items-center justify-center mr-4">
              <MaterialCommunityIcons color="#FFFFFF" name="wrench" size={22} />
              <MaterialCommunityIcons
                color="#FFFFFF"
                name="cog"
                size={13}
                style={{ position: "absolute", top: 8, right: 8 }}
              />
            </View>
            <View className="flex-1">
              <Text className="font-poppins-bold text-[18px] text-text-primary leading-[22px]">
                Auto Parts Store
              </Text>
              <Text className="font-poppins-semibold text-[13px] text-[#0066FF] mt-0.5">
                Erbil, Kurdistan
              </Text>

              <View className="flex-row items-center mt-2.5">
                <MaterialCommunityIcons
                  color="#6B7280"
                  name="calendar-range"
                  size={13}
                  className="mr-1"
                />
                <Text className="font-poppins-semibold text-[11.5px] text-text-secondary">
                  {formatReceiptDate(activeSaleRecord.timestamp)}
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                <MaterialCommunityIcons
                  color="#6B7280"
                  name="receipt"
                  size={13}
                  className="mr-1"
                />
                <Text className="font-poppins-bold text-[11.5px] text-[#0066FF]">
                  {activeSaleRecord.receiptNumber}
                </Text>
              </View>
            </View>
          </View>

          {/* Dashed divider */}
          <View
            style={{
              borderStyle: "dashed",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              marginHorizontal: 20,
              marginVertical: 16,
              height: 0,
            }}
          />

          {/* Items List */}
          <View className="px-5 gap-3.5">
            {activeSaleRecord.items.map((item, idx) => {
              const part = parts.find((p) => p.id === item.partId);
              const partImg = getPartImage(item.partId);
              if (!part) return null;

              return (
                <View key={`${item.partId}-${idx}`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 pr-3">
                      {/* Part Photo Thumbnail */}
                      <View className="w-[44px] h-[44px] bg-gray-50 rounded-lg overflow-hidden mr-3 items-center justify-center border border-gray-100">
                        {partImg ? (
                          <Image
                            source={partImg}
                            style={{ width: "100%", height: "100%" }}
                          />
                        ) : (
                          <Text className="font-poppins-bold text-[13px] text-blue-600">
                            {part.compatibleCars[0]?.brand?.charAt(0) || "P"}
                          </Text>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text
                          className="font-poppins-bold text-[13.5px] text-text-primary"
                          numberOfLines={1}
                        >
                          {part.name}
                        </Text>
                        {part.nameKu && (
                          <Text className="font-poppins-semibold text-[11px] text-gray-400 mt-0.5 leading-[13px]">
                            {part.nameKu}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Cost calculation */}
                    <Text className="font-poppins-bold text-[13px] text-text-primary text-right">
                      {item.quantity} × {item.unitPrice.toLocaleString()} ={" "}
                      {(item.quantity * item.unitPrice).toLocaleString()} IQD
                    </Text>
                  </View>
                  {idx < activeSaleRecord.items.length - 1 && (
                    <View className="h-[1px] bg-gray-100 mt-3" />
                  )}
                </View>
              );
            })}
          </View>

          {/* Dashed divider */}
          <View
            style={{
              borderStyle: "dashed",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              marginHorizontal: 20,
              marginVertical: 16,
              height: 0,
            }}
          />

          {/* Totals Block */}
          <View className="px-5 gap-3">
            <View className="flex-row justify-between">
              <Text className="font-poppins-semibold text-[13.5px] text-text-secondary">
                Subtotal:
              </Text>
              <Text className="font-poppins-bold text-[13.5px] text-text-primary">
                {activeSaleRecord.subtotal.toLocaleString()} IQD
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-poppins-semibold text-[13.5px] text-text-secondary">
                Discount:
              </Text>
              <Text className="font-poppins-bold text-[13.5px] text-red-600">
                -{activeSaleRecord.discount.toLocaleString()} IQD
              </Text>
            </View>

            <View className="h-[1px] bg-gray-100 my-0.5" />

            <View className="flex-row justify-between items-center">
              <Text className="font-poppins-bold text-[15.5px] text-text-primary">
                TOTAL:
              </Text>
              <Text className="font-poppins-bold text-[20px] text-[#0066FF]">
                {activeSaleRecord.total.toLocaleString()} IQD
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-poppins-semibold text-[13.5px] text-text-secondary">
                Amount Paid:
              </Text>
              <Text className="font-poppins-bold text-[13.5px] text-text-primary">
                {activeSaleRecord.amountPaid.toLocaleString()} IQD
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="font-poppins-bold text-green-700">
                Change Returned:
              </Text>
              <Text className="font-poppins-bold text-[17px] text-[#10B981]">
                {activeSaleRecord.changeReturned.toLocaleString()} IQD
              </Text>
            </View>
          </View>

          {/* Dashed divider */}
          <View
            style={{
              borderStyle: "dashed",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              marginHorizontal: 20,
              marginVertical: 18,
              height: 0,
            }}
          />

          {/* Centered Thank You */}
          <View className="items-center pb-8">
            <Text className="font-poppins-bold text-[15px] text-text-secondary">
              Thank you! / سوپاس
            </Text>
          </View>

          {/* Serrated Wavy Bottom Edge */}
          <View
            className="flex-row overflow-hidden w-full h-3 justify-between"
            style={{ marginTop: -1 }}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  backgroundColor: "white",
                  transform: [{ rotate: "45deg" }],
                  marginTop: -7,
                  borderColor: "#E2E8F0",
                  borderWidth: 1,
                }}
              />
            ))}
          </View>
        </View>

        {/* Action Buttons Below Receipt Card */}
        <View className="gap-3.5 print-hidden-elements">
          {/* Share on WhatsApp */}
          <Pressable
            onPress={handleShareWhatsApp}
            className="w-full flex-row items-center justify-center rounded-2xl bg-[#25D366] py-4.5 active:opacity-90 shadow-sm"
          >
            <MaterialCommunityIcons
              color="#FFFFFF"
              name="whatsapp"
              size={20}
              className="mr-2"
            />
            <Text className="font-poppins-bold text-[16px] text-white">
              Share on WhatsApp
            </Text>
          </Pressable>

          {/* Share PDF Receipt */}
          <Pressable
            onPress={() => handleSharePdf(activeSaleRecord)}
            className="w-full flex-row items-center justify-center rounded-2xl bg-[#0066FF] py-4.5 active:bg-blue-700 shadow-md"
          >
            <MaterialCommunityIcons
              color="#FFFFFF"
              name="file-pdf-box"
              size={20}
              className="mr-2"
            />
            <Text className="font-poppins-bold text-[16px] text-white">
              Share PDF Receipt
            </Text>
          </Pressable>

          {/* Print Receipt */}
          <Pressable
            onPress={handlePrintReceipt}
            className="w-full flex-row items-center justify-center rounded-2xl bg-white border-2 border-[#0066FF] py-4 active:bg-blue-50/10"
          >
            <MaterialCommunityIcons
              color="#0066FF"
              name="printer-outline"
              size={20}
              className="mr-2"
            />
            <Text className="font-poppins-bold text-[15.5px] text-[#0066FF]">
              Print Receipt
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
