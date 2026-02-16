import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { saveUser } from '@utils/storage';

export default function WelcomeScreen() {
  const handleSelectUser = async (name: string) => {
    await saveUser(name);
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
      <Text className="mb-6 font-avigul text-4xl text-natural dark:text-neutral-100">
        בחר משתמש:
      </Text>

      <View className="h-[200px] w-full flex-row justify-center gap-6 px-12">
        <TouchableOpacity
          onPress={() => handleSelectUser('amit')}
          className="flex-1 items-center justify-center rounded-3xl  shadow-sm ">
          <Image
            source={require('@assets/amit-selection.png')}
            className="h-full w-full"
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSelectUser('ori')}
          className="flex-1 items-center justify-center rounded-3xl shadow-sm">
          <Image
            source={require('@assets/ori-selection.png')}
            className="h-full w-full"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
