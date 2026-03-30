import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { savePassword } from '@utils/storage';
import { testPassword } from '@utils/api';

export default function PasswordScreen() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError('');

    const valid = await testPassword(password.trim());
    if (valid) {
      await savePassword(password.trim());
      router.replace('/');
    } else {
      setError('סיסמה שגויה');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white px-8 dark:bg-neutral-900">
      <Text className="mb-2 font-avigul text-4xl text-natural dark:text-neutral-100">
        הכנס סיסמה
      </Text>
      <Text className="mb-8 font-avigul text-lg text-neutral-400">
        הסיסמה נדרשת כדי להתחבר לשרת
      </Text>

      <TextInput
        className="mb-4 w-full rounded-full bg-neutral-100 px-6 py-4 text-center font-avigul text-xl text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
        placeholder="סיסמה"
        placeholderTextColor="#9ca3af"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoFocus
        onSubmitEditing={handleSubmit}
      />

      {error ? (
        <Text className="mb-4 font-avigul text-lg text-[#c9184a]">{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading || !password.trim()}
        className={`w-full items-center rounded-full py-4 ${
          password.trim() ? 'bg-[#c9184a]' : 'bg-neutral-200 dark:bg-neutral-800'
        }`}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-avigul-bold text-xl text-white">אישור</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
