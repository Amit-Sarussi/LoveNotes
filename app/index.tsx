import ProgressBar from '@components/ProgressBar';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getGreeting } from '@utils/greeting';
import { getDaysPassed } from '@utils/startDate';
import ProgressMap, { ProgressMapRef } from '@components/ProgressMap';
import WideButton from '@components/WideButton';
import { Animated } from 'react-native';
import FloatingButton from '@components/FloatingButton';
import { getUser, clearUser, getViewedNotes } from '@utils/storage';
import { initStartDate } from '@utils/startDate';
import { router, useFocusEffect } from 'expo-router';

import { useColorScheme } from 'nativewind';

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const greeting = getGreeting();
  const daysPassed = getDaysPassed();

  const mapRef = useRef<ProgressMapRef>(null);
  const [showButton, setShowButton] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPressed, setIsPressed] = useState(false);
  const [viewedNotes, setViewedNotes] = useState<number[]>([]);
  const [availableNotes, setAvailableNotes] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      checkUser();
    }, [])
  );

  const checkUser = async () => {
    await initStartDate();
    const viewedNotes = await getViewedNotes();
    setViewedNotes(viewedNotes || []);
    const user = await getUser();
    if (!user) {
      router.replace('/welcome');
    } else {
      const displayMap: Record<string, string> = {
        ori: 'אורי',
        amit: 'עמית',
      };
      setUserName(displayMap[user] || user);
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    await clearUser();
    router.replace('/welcome');
  };

  const FadeView: React.FC<{ visible: boolean; children: React.ReactNode }> = ({
    visible,
    children,
  }) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 300, // fade duration in ms
        useNativeDriver: true,
      }).start();
    }, [visible]);

    return <Animated.View style={{ opacity }}>{children}</Animated.View>;
  };

  const onScrollThreshold = useCallback((passed: boolean) => setShowButton(passed), []);

  if (isLoading) {
    return <View className="flex-1 bg-white dark:bg-neutral-900" />;
  }

  const gradientColors = isDark
    ? (['rgba(23,23,23,1)', 'rgba(23,23,23,0)'] as const) // neutral-900
    : (['rgba(255,255,255,1)', 'rgba(255,255,255,0)'] as const);

  const viewedNotesStatus = () => {
    const diff = Math.max(getDaysPassed() - viewedNotes.length, 0);
    if (diff === 0) {
      return 'קראת את כל הפתקים שיש לך';
    } else if (diff === 1) {
      return 'יש לך פתק אחד שלא קראת';
    } else {
      return 'יש לך ' + diff + ' פתקים שלא קראת';
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1 bg-white px-6 pt-2 dark:bg-neutral-900">
      <View className="flex h-full w-full items-center justify-start">
        <View className="z-20 flex w-full items-center gap-2 bg-white dark:bg-neutral-900">
          <View className="flex w-full flex-row-reverse items-center justify-between">
            <TouchableOpacity className="" onPress={() => router.push('/chat')}>
              <View className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <Image
                  source={require('@assets/chat.png')}
                  className="h-[60%] w-[60%]"
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
            <View className="flex-row-reverse">
              <Text className="font-avigul text-4xl text-natural dark:text-neutral-100">
                {greeting},
              </Text>
              <Text
                onPress={handleReset}
                suppressHighlighting={true}
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}
                className={`${isPressed ? 'text-[#b01541]' : 'text-[#c9184a]'} font-avigul text-4xl`}>
                {' '}
                {userName}
              </Text>
            </View>
            <TouchableOpacity className="" onPress={() => router.push('/chat')}>
              <View className="invisible h-12 w-12 rounded-full"></View>
            </TouchableOpacity>
          </View>
          <ProgressBar />
          <View className="flex flex-row-reverse items-center gap-2 py-2">
            <Text className="font-avigul text-[22px] text-natural dark:text-neutral-100">
              <Text className="font-avigul-bold text-primary">{daysPassed}</Text>/365
            </Text>
            <Text className="font-avigul-bold text-[19px] text-natural dark:text-neutral-100">
              -
            </Text>
            <Text className="font-avigul text-[19px] text-natural dark:text-neutral-100">
              {viewedNotesStatus()}
            </Text>
          </View>
        </View>
        <View>
          <LinearGradient
            colors={gradientColors}
            style={{
              height: 50,
              width: '100%',
              zIndex: 20,
              position: 'absolute',
              top: '0%',
              left: '-50%',
            }}
          />
        </View>
        <ProgressMap ref={mapRef} onScrollThreshold={onScrollThreshold} daysPassed={daysPassed} />
        <FloatingButton visible={showButton} onPress={() => mapRef.current?.scrollToToday()} />
      </View>
    </SafeAreaView>
  );
}
