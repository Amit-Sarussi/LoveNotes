import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Vibration,
  Keyboard, // Added
  Image,
  TouchableWithoutFeedback, // Added
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchNotes, Note, sendChatMessage } from '../../utils/api';
import { getUser } from '../../utils/storage';
import { Ionicons } from '@expo/vector-icons';

export default function NoteScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // 1. Track keyboard state
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    getUser().then(setCurrentUser);
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false)
    );

    async function loadNote() {
      try {
        const notes = await fetchNotes();
        const noteIndex = Number(id) - 1;
        if (notes && notes[noteIndex]) {
          setNote(notes[noteIndex]);
        } else {
          setError('Note not found');
        }
      } catch (err) {
        setError('Failed to load note');
      } finally {
        setLoading(false);
      }
    }
    loadNote();

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [id]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !currentUser) return;
    Keyboard.dismiss(); // Dismiss on send

    try {
      await sendChatMessage({
        message: replyText.trim(),
        sender: currentUser,
        replyId: id as string,
      });
      Alert.alert('Reply Sent', 'Your message has been sent!');
      setReplyText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send reply');
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!currentUser) return;
    console.log('Reaction sent:', emoji);

    try {
      await sendChatMessage({
        message: emoji,
        sender: currentUser,
        replyId: id as string,
      });
      Vibration.vibrate(20);
      Alert.alert('נשלח!', `הגבת עם ${emoji}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send reaction');
    }
  };

  useEffect(() => {
    // Use 'Will' for iOS (instant) and 'Did' for Android (which doesn't support 'Will')
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    // ... rest of your loadNote logic

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [id]);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      {/* 2. The "Dismiss Layer": Only active when keyboard is up */}
      {isKeyboardVisible && (
        <Pressable onPress={Keyboard.dismiss} className="absolute inset-0 z-20 bg-transparent" />
      )}

      <View className="z-10 flex-row items-center px-6 py-4">
        <Pressable
          onPress={() => router.back()}
          className="-ml-2 rounded-full p-2 active:bg-neutral-200 dark:active:bg-neutral-700">
          <Ionicons name="arrow-back" size={28} color="#fb7185" />
        </Pressable>
        <Text className="ml-2 font-avigul-bold text-xl text-neutral-800 dark:text-neutral-100">
          פתק #{id}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fb7185" />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          <View className="flex-1">
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              className="flex-1 px-6 pt-10"
              showsVerticalScrollIndicator={false}
              // 3. Disable internal tap handling to let our "Dismiss Layer" handle it
              keyboardShouldPersistTaps="always">
              <View className="flex flex-col gap-8 px-4 pb-32">
                <View className="-mb-6 flex w-full flex-row items-center justify-start">
                  <Text className="font-avigul-bold text-5xl text-[#c9184a]">"</Text>
                </View>
                <View className="flex w-full flex-col items-center justify-center">
                  <Text className="mb-2 text-center font-avigul text-xl text-neutral-500">
                    אני אוהב אותך כל כך כי
                  </Text>
                  <Text className="text-center font-avigul text-4xl text-neutral-800 dark:text-white">
                    {note?.message}
                  </Text>
                </View>
                <View className="flex w-full flex-row items-center justify-end">
                  <Text className="font-avigul-bold text-5xl text-[#c9184a]">"</Text>
                </View>

                <View className="mt-20 flex flex-row flex-wrap items-center justify-center gap-y-10">
                  {['❤️', '🥰', '😍', '🫶', '❤️‍🔥', '🍆'].map((emoji, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        handleReaction(emoji);
                      }}
                      className="w-1/3 items-center justify-center active:opacity-50">
                      <Text className="text-center text-5xl" style={{ lineHeight: 64 }}>
                        {emoji}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* 4. Input Area: Ensure Z-INDEX is higher than the Dismiss Layer */}
            <View
              className={`z-30 rounded-t-[32px] bg-white px-4 pt-4 shadow-lg dark:bg-neutral-900 ${
                isKeyboardVisible ? 'pb-4' : 'pb-10'
              }`}>
              <View className="flex-row items-center gap-3">
                <TextInput
                  className="max-h-[120px] min-h-[60px] flex-1 rounded-full bg-neutral-100 px-5 py-4 pr-6 text-right font-avigul text-lg text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
                  placeholder="תכתוב הודעה"
                  placeholderTextColor="#9ca3af"
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                />
                <Pressable
                  onPress={handleSendReply}
                  className={`h-[60px] w-[60px] items-center justify-center rounded-full ${
                    replyText.trim() ? 'bg-rose-500' : 'bg-neutral-200 dark:bg-neutral-800'
                  }`}
                  disabled={!replyText.trim()}>
                  <Image
                    source={require('../../assets/send.png')}
                    style={{
                      width: 24,
                      height: 24,
                      tintColor: replyText.trim() ? 'white' : '#9ca3af',
                    }}
                    resizeMode="contain"
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
