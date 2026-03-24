import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ScrollView, View, Text } from 'react-native';
import StyledButton from './StyledButton';
import { useRouter } from 'expo-router';
import { setViewedNote } from '@utils/storage';

export type ProgressMapRef = {
  scrollToToday: () => void;
};
interface ProgressMapProps {
  onScrollThreshold?: (passed: boolean) => void;
  daysPassed: number;
  viewedNotes: number[];
  setViewedNotes: React.Dispatch<React.SetStateAction<number[]>>;
}

const ProgressMap = forwardRef<ProgressMapRef, ProgressMapProps>(
  ({ onScrollThreshold, daysPassed, viewedNotes, setViewedNotes }, ref) => {
    const router = useRouter();
    const scrollRef = useRef<ScrollView>(null);
    const lastPassed = useRef<boolean>(false);

    const totalButtons = 365;
    const spacingY = 100;
    const amplitude = 120;
    const buttonWidth = 90;
    const targetIndex = Math.min(Math.max(daysPassed - 1, 0), totalButtons - 1);

    const todayY = spacingY * (totalButtons - targetIndex);
    const visibilityDistance = 600;

    function scrollToToday() {
      const y = spacingY * (totalButtons - targetIndex) - 200;
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
    }

    useImperativeHandle(ref, () => ({ scrollToToday }));

    useEffect(() => {
      const t = setTimeout(() => {
        requestAnimationFrame(scrollToToday);
      }, 100);
      return () => clearTimeout(t);
    }, [viewedNotes, daysPassed]);

    const buttons = React.useMemo(() => {
      const result: React.ReactElement[] = [];
      for (let i = 0; i < totalButtons; i++) {
        const x = Math.sin((i * Math.PI) / 5.35) * amplitude - buttonWidth / 2;
        const y = spacingY * (totalButtons - i);
        result.push(
          <View key={i + 1} style={{ position: 'absolute', left: x, top: y }}>
            <StyledButton
              num={i + 1}
              disabled={daysPassed < i + 1}
              onPress={() => {
                router.push(`/note/${i + 1}`);
                setTimeout(() => {
                  void setViewedNote(i + 1);
                  setViewedNotes((prev) => Array.from(new Set([...prev, i + 1])));
                }, 0);
              }}
              isCurrent={!viewedNotes.includes(i + 1) && !(daysPassed < i + 1)}
            />
          </View>
        );
      }
      result.reverse();
      return result;
    }, [daysPassed, router, viewedNotes]);

    const contentHeight = spacingY * totalButtons + amplitude * 2;

    return (
      <ScrollView
        ref={scrollRef}
        className="h-full w-full"
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const scrollY = nativeEvent.contentOffset.y;

          if (onScrollThreshold) {
            // show button if the scrollY is far from the "today" button
            const passed = Math.abs(scrollY - todayY) > visibilityDistance;
            if (passed !== lastPassed.current) {
              lastPassed.current = passed;
              onScrollThreshold(passed);
            }
          }
        }}
        scrollEventThrottle={16} // ~60fps
        contentContainerStyle={{ height: contentHeight }}>
        <View className="-mb-20 mt-16 flex flex-row items-center justify-center">
          <Text className="font-avigul-bold text-[19px] text-gray-300 dark:text-neutral-600">
            הגעת לסוף ❤️
          </Text>
        </View>

        <View className="flex flex-col items-center">
          <View>{buttons}</View>
        </View>
      </ScrollView>
    );
  }
);

export default ProgressMap;
