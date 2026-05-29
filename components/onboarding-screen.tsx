import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { colors } from "@/theme";

type FeatureIconProps = {
  className: string;
  color: string;
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  size: number;
};

function FeatureIcon({ className, color, name, size }: FeatureIconProps) {
  return (
    <View
      className={`soft-shadow absolute h-[72px] w-[72px] items-center justify-center rounded-[18px] bg-white ${className}`}
      style={{ height: size, width: size }}
    >
      <MaterialCommunityIcons color={color} name={name} size={size * 0.5} />
    </View>
  );
}

function StorageDrawer() {
  return (
    <View className="absolute bottom-0 left-[68px] h-[112px] w-[106px]">
      <View className="absolute bottom-0 h-[104px] w-full rounded-t-[6px] bg-[#063B86]" />
      <View className="absolute left-2 top-4 h-2 w-[88px] rounded-full bg-[#0B2550]" />
      <View className="absolute left-3 top-8 h-2 w-[80px] rounded-full bg-[#9EC7FF]" />
      <View className="absolute left-3 top-[50px] h-2 w-[80px] rounded-full bg-[#9EC7FF]" />
      <View className="absolute left-3 top-[72px] h-2 w-[80px] rounded-full bg-[#9EC7FF]" />
      <View className="absolute bottom-0 left-2 h-3 w-3 rounded-full bg-[#16233A]" />
      <View className="absolute bottom-0 right-2 h-3 w-3 rounded-full bg-[#16233A]" />
    </View>
  );
}

function Box({ className }: { className: string }) {
  return (
    <View className={`rounded-[4px] bg-[#B98D68] ${className}`}>
      <View className="absolute left-1/2 top-0 h-4 w-5 -translate-x-[10px] bg-[#D6B092]" />
    </View>
  );
}

function WarehouseShelves() {
  return (
    <View className="absolute bottom-[2px] right-[-24px] h-[328px] w-[202px]">
      <View className="absolute left-2 top-0 h-full w-[14px] rounded-[3px] bg-[#102746]" />
      <View className="absolute right-5 top-0 h-full w-[14px] rounded-[3px] bg-[#102746]" />
      <View className="absolute left-0 top-8 h-[18px] w-full rounded-[3px] bg-[#112B4E]" />
      <View className="absolute left-0 top-[120px] h-[18px] w-full rounded-[3px] bg-[#112B4E]" />
      <View className="absolute left-0 top-[214px] h-[18px] w-full rounded-[3px] bg-[#112B4E]" />
      <View className="absolute left-7 top-[46px] h-[74px] w-[144px] bg-[#DFE9F8]" />
      <View className="absolute left-7 top-[138px] h-[76px] w-[144px] bg-[#F1F5FB]" />
      <View className="absolute left-7 top-[232px] h-[82px] w-[144px] bg-[#E6EDF7]" />

      <View className="absolute left-9 top-[58px] h-[58px] w-[58px] rounded-full bg-[#BAC4D0]" />
      <View className="absolute left-[52px] top-[71px] h-8 w-8 rounded-full bg-[#243247]" />
      <View className="absolute right-10 top-[54px] h-[66px] w-[66px] rounded-full bg-[#AEB9C8]" />
      <View className="absolute right-[58px] top-[72px] h-8 w-8 rounded-full bg-[#E5EAF2]" />

      <Box className="absolute left-9 top-[152px] h-[56px] w-[58px]" />
      <View className="absolute right-10 top-[146px] h-[64px] w-[38px] rounded-[8px] bg-[#0754B8]" />
      <Box className="absolute left-9 top-[248px] h-[54px] w-[64px]" />
      <Box className="absolute right-9 top-[246px] h-[58px] w-[72px]" />
    </View>
  );
}

export function OnboardingScreen() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isCompact = height < 760;
  const bottomPadding = Math.max(insets.bottom + 10, 22);
  const topPadding = Math.max(insets.top + (isCompact ? 10 : 16), 28);
  const buttonHeight = isCompact ? 64 : 72;
  const brandHeight = isCompact ? 56 : 64;
  const headlineLineHeight = isCompact ? 38 : 42;
  const descriptionLineHeight = isCompact ? 24 : 27;
  const textReserve =
    brandHeight +
    (isCompact ? 14 : 20) +
    headlineLineHeight * 2 +
    (isCompact ? 10 : 12) +
    descriptionLineHeight * 3 +
    (isCompact ? 8 : 12);
  const heroHeight = Math.max(
    isCompact ? 250 : 315,
    height - topPadding - bottomPadding - buttonHeight - 16 - textReserve,
  );
  const iconSize = isCompact ? 58 : 68;
  const characterHeight = heroHeight * (isCompact ? 0.86 : 0.88);
  const characterWidth = characterHeight * 0.68;
  const shelfHeight = heroHeight * 0.84;

  return (
    <View
      className="flex-1 justify-between bg-background px-7"
      style={{ paddingBottom: bottomPadding, paddingTop: topPadding }}
    >
      <View>
        <View className="items-center" style={{ marginBottom: isCompact ? 14 : 20 }}>
          <View className="w-full items-center">
            <Text
              adjustsFontSizeToFit
              className="w-full text-center font-poppins-bold text-text-primary"
              numberOfLines={1}
              style={{
                fontSize: isCompact ? 31 : 34,
                lineHeight: isCompact ? 34 : 38,
                maxWidth: width - 56,
              }}
            >
              WareHouse
            </Text>
            <Text
              adjustsFontSizeToFit
              className="w-full text-center font-poppins-semibold text-primary-blue"
              numberOfLines={1}
              style={{
                fontSize: isCompact ? 12 : 14,
                letterSpacing: isCompact ? 6 : 7,
                lineHeight: isCompact ? 16 : 18,
                maxWidth: width - 56,
              }}
            >
              CAR PARTS
            </Text>
          </View>
        </View>

        <View className="items-center" style={{ gap: isCompact ? 10 : 12 }}>
          <View className="w-full items-center">
            <Text
              adjustsFontSizeToFit
              className="w-full text-center font-poppins-bold text-text-primary"
              numberOfLines={1}
              style={{
                fontSize: isCompact ? 32 : 36,
                lineHeight: headlineLineHeight,
              }}
            >
                Smart Inventory.
            </Text>
            <Text
              adjustsFontSizeToFit
              className="w-full text-center font-poppins-bold text-primary-blue"
              numberOfLines={1}
              style={{
                fontSize: isCompact ? 32 : 36,
                lineHeight: headlineLineHeight,
              }}
            >
                Stronger Business.
            </Text>
          </View>
          <Text
            className="max-w-[330px] text-center font-poppins-medium text-[#5B647A]"
            style={{
              fontSize: isCompact ? 16 : 18,
              lineHeight: descriptionLineHeight,
            }}
          >
            Manage your car parts, stock, and orders efficiently in one place.
          </Text>
        </View>

        <View
          className="relative mx-[-28px] mt-3 overflow-hidden"
          style={{ height: heroHeight }}
        >
            <View className="absolute bottom-0 h-[365px] w-full bg-[#EDF4FF]" />
            <View className="absolute bottom-0 h-[258px] w-full bg-[#E5EDFA]" />
            <View className="absolute bottom-0 left-[-38px] h-[178px] w-[230px] rounded-t-[40px] bg-white/40" />
            <View className="absolute bottom-0 right-[-58px] h-[216px] w-[270px] rounded-t-[42px] bg-white/40" />
            <View className="absolute bottom-[132px] left-[-10px] h-6 w-[170px] rotate-[-18deg] rounded-full bg-white/45" />
            <View className="absolute bottom-[216px] right-[12px] h-5 w-[150px] rotate-[-16deg] rounded-full bg-white/45" />

            <FeatureIcon
              className="left-[54px] top-[34px]"
              color={colors.primaryBlue}
              name="barcode"
              size={iconSize}
            />
            <FeatureIcon
              className="right-[164px] top-0"
              color="#4F46E5"
              name="clipboard-check-outline"
              size={iconSize}
            />
            <FeatureIcon
              className="right-[54px] top-[44px]"
              color="#F5A623"
              name="package-variant-closed"
              size={iconSize}
            />
            <FeatureIcon
              className="bottom-[132px] left-[28px]"
              color={colors.success}
              name="chart-pie"
              size={iconSize}
            />
            <FeatureIcon
              className="bottom-[74px] right-[54px]"
              color="#6C4EF6"
              name="cog"
              size={iconSize}
            />

            <View
              className="absolute bottom-0 right-[-30px] w-[202px]"
              style={{ height: shelfHeight, transform: [{ scale: shelfHeight / 328 }] }}
            >
              <WarehouseShelves />
            </View>
            <Box className="absolute bottom-[10px] left-[12px] h-[58px] w-[72px]" />
            <StorageDrawer />

            <Image
              className="absolute bottom-0"
              contentFit="contain"
              style={{
                height: characterHeight,
                left: Math.max(70, width * 0.22),
                width: characterWidth,
              }}
              source={images.welcome}
            />
        </View>
      </View>

      <Link href="/" asChild>
        <Pressable
          className="flex-row items-center justify-center rounded-[20px] bg-[#4A3DFF] px-6 active:bg-primary-blue"
          style={{ height: buttonHeight }}
        >
          <Text className="font-poppins-semibold text-[24px] leading-[30px] text-white">
            Get Started
          </Text>
          <View className="absolute right-7">
            <MaterialCommunityIcons
              color="#FFFFFF"
              name="chevron-right"
              size={38}
            />
          </View>
        </Pressable>
      </Link>
    </View>
  );
}
