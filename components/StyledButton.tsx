import { Pressable, Text, View, Image } from 'react-native';
import { useColorScheme } from 'nativewind';
import splash from '../assets/readme.png';

// Helper to darken a hex color by a percentage
function darkenColor(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));

  return `rgb(${r},${g},${b})`;
}

interface StyledButtonProps {
  num: number;
  disabled?: boolean;
  isCurrent?: boolean; // Now utilized
  onPress?: () => void;
}

// ... darkenColor helper remains the same ...

interface StyledButtonProps {
  num: number;
  disabled?: boolean;
  isCurrent?: boolean;
  onPress?: () => void;
}

export default function StyledButton({ num, disabled, isCurrent, onPress }: StyledButtonProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const primaryColor = disabled ? (isDark ? '#404040' : '#e5e5e5') : '#c9184a';
  const textColor = disabled ? (isDark ? '#737373' : '#afafaf') : '#ffffff';
  const shadowColor = darkenColor(primaryColor, 0.3);

  return (
    <Pressable disabled={disabled} onPress={onPress}>
      {({ pressed }) => (
        <View className="items-center justify-center">
          {/* Main button moves down when pressed */}
          <View
            className="z-20 flex aspect-[7/6] w-24 items-center justify-center rounded-[40%]"
            style={{
              backgroundColor: primaryColor,
              // The image is inside this View, so it moves with the button tap
              marginTop: pressed ? 10 : 0,
            }}>
            {/* IMAGE: Positioned absolutely relative to the button center */}
            {isCurrent && (
              <View className="absolute -top-20 z-30" style={{ width: 100, height: 100 }}>
                <Image source={splash} className="h-full w-full" resizeMode="contain" />
              </View>
            )}

            <Text className="font-avigul-bold text-[34px]" style={{ color: textColor }}>
              {num}
            </Text>
          </View>

          {/* Shadow disappears when pressed */}
          {!pressed && (
            <View
              className="z-10 -mt-[72px] aspect-[7/6.7] w-24 rounded-[40%]"
              style={{ backgroundColor: shadowColor }}
            />
          )}
        </View>
      )}
    </Pressable>
  );
}
