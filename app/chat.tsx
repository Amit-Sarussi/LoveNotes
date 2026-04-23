import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
  Image,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUser, getPassword } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, fetchNotes, Note, registerPushToken } from '@utils/api';
import { registerForPushNotificationsAsync } from '../utils/pushNotifications';

interface Message {
  id: string;
  message: string;
  sender: 'amit' | 'ori';
  time: string;
  replyId?: string;
}

const API_URL = `${API_BASE_URL}/chat`;

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isAtBottomRef = useRef(true);
  const lastMessagesSignatureRef = useRef('');
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    checkUser();
    fetchMessages();
    fetchReplyNotes();
    registerPushNotifications();
    const interval = setInterval(fetchMessages, 3000);

    // Instant keyboard listeners for padding swap
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      clearInterval(interval);
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const checkUser = async () => {
    const user = await getUser();
    setCurrentUser(user);
  };

  const registerPushNotifications = async () => {
    try {
      const user = await getUser();
      if (!user) return;

      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await registerPushToken(user, pushToken);
        console.log('Push token registered:', pushToken);
      }
    } catch (error) {
      console.error('Error registering push notifications:', error);
    }
  };

  const isEmojiOnly = (text: string) => {
    const cleanText = text.trim();
    // Includes variation selectors (\ufe0f) to catch heart emojis
    const emojiRegex =
      /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\ufe0f|\u200d)+$/;
    return emojiRegex.test(cleanText);
  };

  const fetchReplyNotes = async () => {
    try {
      const fetchedNotes = await fetchNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const password = await getPassword();
      const response = await fetch(API_URL, {
        headers: password ? { 'x-password': password } : {},
      });
      if (response.ok) {
        const data = await response.json();
        const sortedMessages = data.sort(
          (a: Message, b: Message) => new Date(a.time).getTime() - new Date(b.time).getTime()
        );
        const firstId = sortedMessages[0]?.id ?? '';
        const lastId = sortedMessages[sortedMessages.length - 1]?.id ?? '';
        const lastTime = sortedMessages[sortedMessages.length - 1]?.time ?? '';
        const signature = `${sortedMessages.length}:${firstId}:${lastId}:${lastTime}`;

        // Avoid re-render churn every poll when data is unchanged.
        if (signature !== lastMessagesSignatureRef.current) {
          setMessages(sortedMessages);
          lastMessagesSignatureRef.current = signature;
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentUser) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      const password = await getPassword();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(password ? { 'x-password': password } : {}),
        },
        body: JSON.stringify({
          message: messageText,
          sender: currentUser,
        }),
      });

      if (response.ok) {
        await fetchMessages();
        // In an inverted list, offset 0 is the latest message (bottom).
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const groupMessagesByTime = (msgs: Message[]) => {
    if (msgs.length === 0) return [];
    const grouped: (Message | { type: 'time'; label: string; id: string })[] = [];
    const FIVE_MINUTES = 5 * 60 * 1000;

    msgs.forEach((msg, index) => {
      const currentDate = new Date(msg.time);
      const currentMs = currentDate.getTime();
      const prevMsg = msgs[index - 1];
      const prevMs = prevMsg ? new Date(prevMsg.time).getTime() : null;

      if (!prevMs || currentMs - prevMs > FIVE_MINUTES) {
        const day = currentDate.getDate();
        const month = currentDate.toLocaleString('he-IL', { month: 'short' });
        const timeStr = currentDate.toLocaleTimeString('he-IL', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        grouped.push({
          type: 'time',
          label: `${day} ${month} ${timeStr}`,
          id: `time-divider-${msg.id}`,
        });
      }
      grouped.push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByTime(messages);
  const listData = [...groupedMessages].reverse();

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'time') {
      return (
        <View className="my-6 items-center justify-center">
          <View className="absolute h-[0.5px] w-[80%] bg-gray-100 dark:bg-neutral-800" />
          <View className="bg-white px-4 dark:bg-neutral-900">
            <Text className="font-avigul text-lg text-gray-400 dark:text-neutral-500">
              {item.label}
            </Text>
          </View>
        </View>
      );
    }

    const isMe = item.sender === currentUser;

    const currentIndex = listData.findIndex((m) => m.id === item.id);
    const prevItem = currentIndex > 0 ? listData[currentIndex - 1] : null;

    // Only show reply indicator if:
    // 1. It is a reply
    // 2. The previous item isn't a message OR doesn't share the same replyId
    const shouldShowReply =
      item.replyId && (!prevItem || !('replyId' in prevItem) || prevItem.replyId !== item.replyId);
    const isEmoji = isEmojiOnly(item.message);
    const replyIndex = item.replyId ? Number(item.replyId) - 1 : -1;
    const repliedNote = item.replyId
      ? notes.find((note) => String(note.id) === String(item.replyId)) ??
        (Number.isInteger(replyIndex) && replyIndex >= 0 ? notes[replyIndex] : undefined)
      : undefined;

    return (
      <View className="flex flex-col gap-1">
        {shouldShowReply && (
          <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'} mx-4`}>
            <TouchableOpacity
              onPress={() => router.push(`/note/${item.replyId}`)}
              className="flex w-[300px] flex-col justify-center gap-8 rounded-[28px] bg-neutral-800 px-4 pt-5">
              <View className="-mb-6 flex w-full flex-row items-center justify-start">
                <Text className="font-avigul-bold text-5xl text-[#c9184a]">"</Text>
              </View>
              <View className="flex w-full flex-col items-center justify-center">
                <Text className="mb-2 text-center font-avigul text-xl text-neutral-500">
                  אני אוהב אותך כל כך כי
                </Text>
                <Text className="text-center font-avigul text-4xl text-neutral-800 dark:text-white">
                  {repliedNote?.message ?? '...'}
                </Text>
              </View>
              <View className="flex w-full flex-row items-center justify-end">
                <Text className="font-avigul-bold text-5xl text-[#c9184a]">"</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'} mx-4 mb-3`}>
          <View
            className={`${isEmoji ? 'px-1' : 'max-w-[75%] rounded-[28px] px-5 py-3'} ${
              !isEmoji && (isMe ? 'bg-gray-200/80' : 'bg-gray-100 dark:bg-neutral-800')
            }`}>
            <Text
              allowFontScaling={false}
              style={
                isEmoji
                  ? { fontSize: 45, includeFontPadding: false, textAlignVertical: 'center' }
                  : null
              }
              className={`font-avigul-bold ${!isEmoji && 'text-lg'} ${
                isMe ? 'text-right text-natural' : 'text-left text-natural dark:text-neutral-100'
              }`}>
              {item.message}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-neutral-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        className="flex-1">
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center px-4 py-3">
            <Pressable
              onPress={() => router.back()}
              className="-ml-2 rounded-full p-2 active:bg-neutral-200 dark:active:bg-neutral-700">
              <Ionicons name="arrow-back" size={28} color="#fb7185" />
            </Pressable>
            <Text className="flex-1 pr-8 text-center font-avigul-bold text-2xl text-natural dark:text-neutral-100">
              צ'אט עם {currentUser === 'ori' ? 'עמית' : 'אורי'}
            </Text>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#FF758F" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={listData}
              renderItem={renderItem}
              keyExtractor={(item: any) => item.id}
              inverted
              contentContainerStyle={{ paddingVertical: 16 }}
              onScroll={(event) => {
                const { contentOffset } = event.nativeEvent;
                // In inverted mode, near latest/bottom means near offset 0.
                isAtBottomRef.current = contentOffset.y < 80;
              }}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            />
          )}

          {/* Input Area matches Note Screen design */}
          <View
            className={`z-30 rounded-t-[32px] bg-white px-4 pt-4 shadow-lg dark:bg-neutral-900 ${
              isKeyboardVisible ? 'pb-4' : 'pb-10'
            }`}>
            <View className="flex-row items-center gap-3">
              <TextInput
                className="max-h-[120px] min-h-[60px] flex-1 rounded-full bg-neutral-100 px-5 py-4 pr-6 text-right font-avigul text-lg text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
                placeholder="תכתוב הודעה"
                placeholderTextColor="#9ca3af"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!inputText.trim()}
                className={`h-[60px] w-[60px] items-center justify-center rounded-full ${
                  inputText.trim() ? 'bg-rose-500' : 'bg-neutral-200 dark:bg-neutral-800'
                }`}>
                <Image
                  source={require('../assets/send.png')}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: inputText.trim() ? 'white' : '#9ca3af',
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
