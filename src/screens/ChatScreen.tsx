/* AI CONTEXT:
 * Action: Manages real-time messaging between worker and farmer. Optimized for performance and keyboard layout.
 * Inputs: User IDs, chat messages, route parameters.
 * Outputs: Sent messages payload, rendered conversation UI.
 * Dependencies: Chat service, Auth context, Navigation parameters. */

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, KeyboardAvoidingView, Animated, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import { Avatar } from "../components/ui/Avatar";
import { messageService } from "../services/message.service";
import { useAuth } from "../context/AuthContext";
import { MessageDTO } from "../types/export_type_definitions";
import { signalRService } from "../services/signalr.service";

// ─── UTILS ───────────────────────────────────────────────────────────────────

function normalizeIncomingMessage(raw: any): MessageDTO | null {
  const payload = raw?.data ?? raw?.message ?? raw;
  const id = String(payload?.id ?? payload?.Id ?? payload?.messageId ?? payload?.MessageId ?? "");
  const senderId = String(
    payload?.senderId ?? payload?.SenderId ?? payload?.fromUserId ?? payload?.FromUserId ?? payload?.sender?.id ?? ""
  );
  const receiverId = String(
    payload?.receiverId ?? payload?.ReceiverId ?? payload?.recipientId ?? payload?.RecipientId ?? payload?.toUserId ?? payload?.ToUserId ?? payload?.receiver?.id ?? payload?.recipient?.id ?? ""
  );
  const content = String(payload?.content ?? payload?.Content ?? payload?.messageContent ?? payload?.MessageContent ?? "");

  if (!id || !senderId || !receiverId) return null;

  return {
    id,
    senderId,
    receiverId,
    content,
    read: !!(payload?.read ?? payload?.Read),
    createdAt: payload?.createdAt ?? payload?.CreatedAt ?? payload?.sentAt ?? payload?.SentAt ?? new Date().toISOString(),
    sender: payload?.sender,
    receiver: payload?.receiver,
  };
}

const getFormatTime = (isoString: string) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

/**
 * MessageItem - Memoized to prevent re-renders when user is typing in the input
 */
const MessageItem = memo(({ msg, isWorker, partnerAvatar }: { msg: MessageDTO; isWorker: boolean; partnerAvatar?: string }) => {
  return (
    <View className={["flex-row items-end", isWorker ? "justify-end" : "justify-start"].join(" ")} style={{ marginBottom: 16 }}>
      {!isWorker && (
        <View className="mr-2 mb-1">
          <Avatar source={partnerAvatar ? { uri: partnerAvatar } : undefined} size={28} />
        </View>
      )}
      <View className={[
        "max-w-[80%] px-4 py-3 rounded-2xl shadow-sm", 
        isWorker ? "bg-primary-600 rounded-br-none" : "bg-white border border-slate-100 rounded-bl-none shadow-slate-200"
      ].join(" ")}>
        <Text className={["text-[15px] leading-[22px]", isWorker ? "text-white" : "text-slate-800"].join(" ")}>
          {msg.content}
        </Text>
        <Text className={[
          "text-[10px] mt-1 font-medium", 
          isWorker ? "text-primary-100/60" : "text-slate-400"
        ].join(" ")} style={{ textAlign: "right" }}>
          {getFormatTime(msg.createdAt)}
        </Text>
      </View>
    </View>
  );
});

/**
 * ChatInput - Isolated state to prevent typing from re-rendering the message list
 */
function ChatInput({ onSend, insets }: { onSend: (text: string) => void; insets: any }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 10),
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 8,
      }}
    >
      <View style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 24,
        paddingHorizontal: 14,
        minHeight: 40,
        maxHeight: 120,
      }}>
        <TextInput
          style={{
            flex: 1,
            fontSize: 14,
            color: '#0f172a',
            lineHeight: 20,
            paddingVertical: 10,
            maxHeight: 120,
          }}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#94a3b8"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
      </View>
      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim()}
        activeOpacity={0.75}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: text.trim() ? '#059669' : '#e2e8f0',
        }}
      >
        <Send size={16} color={text.trim() ? '#ffffff' : '#94a3b8'} />
      </TouchableOpacity>
    </View>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function ChatScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { farmerId, farmerName: initialName = "Chủ nông trại", farmerAvatar: initialAvatar } = route.params || {};
  const [partnerInfo, setPartnerInfo] = useState({ name: initialName, avatar: initialAvatar });
  const { user } = useAuth();
  const currentAuthId = user?.authUserId || "";

  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  // ─── KEYBOARD HANDLING (Stable) ──────────────────────────────────────────
  const kbOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(kbOffset, {
        toValue: e.endCoordinates.height - (Platform.OS === 'android' ? 0 : insets.bottom) + 20,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(kbOffset, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

  // ─── DATA FETCHING ─────────────────────────────────────────────────────────

  const fetchMessages = useCallback(async () => {
    if (!farmerId) {
      setLoading(false);
      return;
    }
    try {
      const response = await messageService.getMessages(farmerId, 1, 100);
      if (!isMounted.current) return;
      let items: MessageDTO[] = [];

      if (Array.isArray(response)) items = response;
      else if (response?.data && Array.isArray(response.data)) items = response.data;
      else if (response?.data?.data && Array.isArray(response.data.data)) items = response.data.data;
      else if ((response as any)?.items && Array.isArray((response as any).items)) items = (response as any).items;

      setMessages(prev => {
        if (items.length > 0) {
          const sorted = [...items].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const partnerMsg = items.find(m =>
            (m.senderId.toLowerCase() === farmerId.toLowerCase() || m.receiverId.toLowerCase() === farmerId.toLowerCase()) &&
            (m.sender || m.receiver)
          );
          if (partnerMsg) {
            const partnerData = partnerMsg.senderId.toLowerCase() === farmerId.toLowerCase() ? partnerMsg.sender : partnerMsg.receiver;
            if (partnerData) {
              setPartnerInfo({
                name: partnerData.name || initialName,
                avatar: partnerData.avatarUrl || initialAvatar
              });
            }
          }
          return sorted;
        }
        return prev;
      });

      await messageService.markAsRead({ senderId: farmerId }).catch(() => {});
    } catch (error) {
      console.log("ChatScreen: Fetch messages error:", error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [farmerId, initialAvatar, initialName]);

  // ─── MESSAGE FETCHING & SIGNALR ────────────────────────────────────────────

  useEffect(() => {
    isMounted.current = true;
    let isSubscribed = true;
    if (!farmerId) {
      fetchMessages();
      return () => { isMounted.current = false; };
    }

    const realtimeEvents = ["NewMessage", "ReceiveMessage", "newMessage", "receiveMessage", "MessageReceived"] as const;
    let onRealtimeMessage: ((raw: any) => void) | null = null;

    const setupSignalR = async () => {
      await signalRService.startConnection();
      onRealtimeMessage = (raw: any) => {
        const message = normalizeIncomingMessage(raw);
        if (!message || !isSubscribed) return;

        if (
          message.senderId.toLowerCase() === farmerId?.toLowerCase() ||
          message.receiverId.toLowerCase() === farmerId?.toLowerCase()
        ) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === message.id)) return prev;
            const filtered = prev.filter(
              (m) => !m.id.toString().startsWith("temp-") || m.content !== message.content
            );
            return [message, ...filtered].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
          if (message.senderId.toLowerCase() === farmerId?.toLowerCase()) {
            messageService.markAsRead({ senderId: farmerId }).catch(() => {});
          }
        }
      };

      for (const eventName of realtimeEvents) {
        signalRService.addListener(eventName, onRealtimeMessage);
      }
    };

    fetchMessages().then(() => setupSignalR());
    const backupInterval = setInterval(fetchMessages, 15000); 

    return () => {
      isMounted.current = false;
      isSubscribed = false;
      clearInterval(backupInterval);
      if (onRealtimeMessage) {
        for (const eventName of realtimeEvents) signalRService.removeListener(eventName, onRealtimeMessage);
      }
    };
  }, [fetchMessages, farmerId]);

  const handleSend = async (content: string) => {
    if (!farmerId) return;
    const tempMsg: MessageDTO = {
      id: "temp-" + Date.now(),
      senderId: currentAuthId,
      receiverId: farmerId,
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((p) => [tempMsg, ...p]);
    try {
      await messageService.sendMessage({ receiverId: farmerId, content });
      setTimeout(fetchMessages, 500);
    } catch (err) {
      setMessages((p) => p.filter(m => m.id !== tempMsg.id));
    }
  };

  const renderItem = useCallback(({ item }: { item: MessageDTO }) => {
    const isWorker = item.senderId.toLowerCase() === currentAuthId.toLowerCase();
    return <MessageItem msg={item} isWorker={isWorker} partnerAvatar={partnerInfo.avatar} />;
  }, [currentAuthId, partnerInfo.avatar]);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View 
        className="flex-row items-center px-4 pt-3 pb-3 bg-white border-b border-slate-100 shadow-sm" 
        style={{ paddingTop: Math.max(insets.top, 10), zIndex: 10 }}
      >
        <TouchableOpacity className="p-2 -ml-2 rounded-full" activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#1e293b" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center ml-2 gap-3">
          <Avatar source={partnerInfo.avatar ? { uri: partnerInfo.avatar } : undefined} size={42} />
          <View>
            <Text className="text-[17px] font-bold text-slate-900" numberOfLines={1}>{partnerInfo.name}</Text>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <Text className="text-[11px] font-medium text-slate-400">Đang hoạt động</Text>
            </View>
          </View>
        </View>
      </View>

      <Animated.View className="flex-1" style={{ paddingBottom: kbOffset }}>
        {/* Messages List */}
        <View className="flex-1">
          {loading && messages.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="small" color="#10b981" />
              <Text className="mt-3 text-slate-400 text-xs font-medium uppercase tracking-widest">Đang tải tin nhắn</Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 justify-center items-center px-10">
              <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                <Send size={28} color="#94a3b8" />
              </View>
              <Text className="text-slate-900 font-semibold text-base">Chào {user?.name || "bạn"}!</Text>
              <Text className="text-slate-400 text-sm text-center mt-1">Hãy bắt đầu cuộc hội thoại bằng cách gửi tin nhắn đầu tiên.</Text>
            </View>
          ) : (
            <FlatList
              data={messages}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              inverted
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={Platform.OS === 'android'}
            />
          )}
        </View>

        {/* Input */}
        <ChatInput onSend={handleSend} insets={insets} />
      </Animated.View>
    </View>
  );
}
