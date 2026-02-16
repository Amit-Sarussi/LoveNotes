import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";

interface WideButtonProps {
  text: string;
  onClick: () => void;
}

export default function WideButton({ text, onClick }: WideButtonProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Duolingo-style colors
  const mainColor = "#FF758F"; // Primary pink
  const shadowColor = "#e65a78"; // Darker pink for 3D effect
  const textColor = "#FFFFFF";

  return (
    <Pressable onPress={onClick} className="w-full">
      {({ pressed }) => (
        <View className="h-[60px] w-full relative">
          {/* Shadow Layer (Bottom) */}
          <View
            className="absolute w-full rounded-2xl"
            style={{
              backgroundColor: shadowColor,
              height: 54, // Container height (60) - offset (6)
              top: 6,     // Push down to bottom
            }}
          />

          {/* Button Face (Top) */}
          <View
            className="absolute w-full rounded-2xl items-center justify-center border-b-[1px] border-white/20"
            style={{
              backgroundColor: mainColor,
              height: 54, // Same as shadow
              top: pressed ? 6 : 0, // Move down on press
            }}
          >
            <Text 
              className="font-avigul-bold text-xl tracking-wider uppercase shadow-sm" 
              style={{ color: textColor }}
            >
              {text}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
