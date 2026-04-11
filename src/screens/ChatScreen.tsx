/* AI CONTEXT:
 * Action: Manages real-time messaging between worker and farmer.
 * Inputs: User IDs, chat messages, route parameters.
 * Outputs: Sent messages payload, rendered conversation UI.
 * Dependencies: Chat service, Auth context, Navigation parameters. */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import { Avatar } from "../components/ui/Avatar";
import { messageService } from "../services/message.service";
import { useAuth } from "../context/AuthContext";
import { MessageDTO } from "../types/export_type_definitions";

export function ChatScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { farmerId, farmerName: initialName = "Chủ nông trại", farmerAvatar: initialAvatar } = route.params || {};
  const [partnerInfo, setPartnerInfo] = useState({ name: initialName, avatar: initialAvatar });
  const { user } = useAuth();
  const currentAuthId = user?.authUserId || "";

  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const showSub = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      isMounted.current = false;
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!farmerId) {
      setLoading(false);
      return;
    }
    try {
      const response = await messageService.getMessages(farmerId, 1, 100);
      if (!isMounted.current) return; // component đã unmount, dừng setState
      let items: MessageDTO[] = [];

      if (!response) {
        // preserve existing messages on empty response
      } else if (Array.isArray(response)) {
        items = response;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      } else if ((response as any).items && Array.isArray((response as any).items)) {
        items = (response as any).items;
      }

      setMessages(prev => {
        const isFirstLoad = prev.length === 0;
        if (items.length > 0 || isFirstLoad) {
          const sorted = [...items].sort(
            (a: MessageDTO, b: MessageDTO) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          // Update partner info from the latest message
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

  useEffect(() => {
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000); 
    return () => clearInterval(intervalId);
  }, [fetchMessages]);

  useEffect(() => { 
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || !farmerId) return;
    const currentText = inputText.trim();
    setInputText("");

    const tempMsg: MessageDTO = {
      id: "temp-" + Date.now(),
      senderId: currentAuthId,
      receiverId: farmerId,
      content: currentText,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((p) => [...p, tempMsg]);
    
    try {
      await messageService.sendMessage({ receiverId: farmerId, content: currentText });
      setTimeout(fetchMessages, 500);
    } catch (err) {
      console.log("ChatScreen: Send message error:", err);
      setMessages((p) => p.filter(m => m.id !== tempMsg.id));
    }
  };

  const getFormatTime = (isoString: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View 
          className="flex-row items-center px-4 pt-3 pb-3 bg-white border-b border-slate-100" 
          style={{ paddingTop: Math.max(insets.top, 10) }}
        >
          <TouchableOpacity className="p-2 -ml-2 rounded-full" activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#1e293b" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 flex-row items-center ml-2 gap-3" activeOpacity={0.9}>
            <Avatar source={partnerInfo.avatar ? { uri: partnerInfo.avatar } : undefined} size={42} />
            <View>
              <Text className="text-[17px] font-bold text-slate-900" numberOfLines={1}>{partnerInfo.name}</Text>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-emerald-500" />
                <Text className="text-[11px] font-medium text-slate-400">Đang hoạt động</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef} 
          className="flex-1 px-4" 
          contentContainerStyle={{ paddingVertical: 24, gap: 16 }} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          {loading && messages.length === 0 ? (
            <View className="flex-1 justify-center items-center my-10">
              <ActivityIndicator size="small" color="#10b981" />
              <Text className="mt-3 text-slate-400 text-xs font-medium uppercase tracking-widest">Đang tải tin nhắn</Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 justify-center items-center my-20">
              <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                <Send size={28} color="#94a3b8" />
              </View>
              <Text className="text-slate-900 font-semibold text-base">Chào {user?.name || "bạn"}!</Text>
              <Text className="text-slate-400 text-sm text-center mt-1 px-10">Hãy bắt đầu cuộc hội thoại bằng cách gửi tin nhắn đầu tiên.</Text>
            </View>
          ) : (
            messages.map((msg) => {
              // Standardized identification: Case-insensitive match against Auth GUID
              const isWorker = msg.senderId.toLowerCase() === currentAuthId.toLowerCase();
              return (
                <View key={msg.id} className={["flex-row items-end", isWorker ? "justify-end" : "justify-start"].join(" ")}>
                  {!isWorker && (
                    <View className="mr-2 mb-1">
                      <Avatar source={partnerInfo.avatar ? { uri: partnerInfo.avatar } : undefined} size={28} />
                    </View>
                  )}
                  <View className={[
                    "max-w-[80%] px-4 py-3 rounded-2xl shadow-sm", 
                    isWorker 
                      ? "bg-primary-600 rounded-br-none" 
                      : "bg-white border border-slate-100 rounded-bl-none shadow-slate-200"
                    ].join(" ")}>
                    <Text className={[
                      "text-[15px] leading-[22px]", 
                      isWorker ? "text-white" : "text-slate-800"
                    ].join(" ")}>{msg.content}</Text>
                    <Text className={[
                      "text-[10px] mt-1 font-medium", 
                      isWorker ? "text-primary-100/60" : "text-slate-400"
                    ].join(" ")} style={{ textAlign: "right" }}>{getFormatTime(msg.createdAt)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Input */}
        <View 
          style={{ 
            paddingHorizontal: 16, 
            paddingTop: 12, 
            paddingBottom: keyboardVisible ? 16 : Math.max(insets.bottom, 16),
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9'
          }}
        >
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-end', 
            backgroundColor: '#f8fafc', 
            borderRadius: 16, 
            borderWidth: 1, 
            borderColor: '#e2e8f0', 
            paddingHorizontal: 12, 
            paddingVertical: 6,
            gap: 8 
          }}>
            <TextInput
              style={{ 
                flex: 1, 
                maxHeight: 120, 
                paddingHorizontal: 4, 
                paddingVertical: 8, 
                fontSize: 15, 
                color: '#0f172a' 
              }}
              placeholder="Nhập tin nhắn..." placeholderTextColor="#94a3b8"
              value={inputText} onChangeText={setInputText} multiline maxLength={1000}
            />
            <TouchableOpacity
              onPress={handleSend} 
              disabled={!inputText.trim()} 
              activeOpacity={0.8}
              style={{
                width: 36,
                height: 36,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 18,
                backgroundColor: inputText.trim() ? '#059669' : '#e2e8f0'
              }}
            >
              <Send size={18} color={inputText.trim() ? "#ffffff" : "#94a3b8"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
