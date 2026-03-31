/* AI CONTEXT:
 * Action: Manages real-time messaging between worker and farmer.
 * Inputs: User IDs, chat messages, route parameters.
 * Outputs: Sent messages payload, rendered conversation UI.
 * Dependencies: Chat service, Auth context, Navigation parameters. */

import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Send, Paperclip, MoreVertical, Phone, Video } from "lucide-react-native";
import { Avatar } from "../components/ui/Avatar";

interface Message {
  id: number; text: string; sender: "worker" | "farmer"; timestamp: string; read: boolean;
}

export function ChatScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { farmerName = "Nguyễn Văn A", farmerAvatar = "https://i.pravatar.cc/150?img=12" } = route.params || {};

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Chào bạn! Tôi quan tâm đến công việc thu hoạch lúa.", sender: "worker", timestamp: "09:30", read: true },
    { id: 2, text: "Chào bạn! Cảm ơn bạn đã quan tâm. Công việc bắt đầu lúc 6h sáng ngày 22/01.", sender: "farmer", timestamp: "09:32", read: true },
    { id: 3, text: "Bạn đã có kinh nghiệm thu hoạch lúa chưa?", sender: "farmer", timestamp: "09:32", read: true },
    { id: 4, text: "Vâng, tôi đã có 2 năm kinh nghiệm làm việc này.", sender: "worker", timestamp: "09:35", read: true },
    { id: 5, text: "Tuyệt vời! Công việc kéo dài khoảng 6 tiếng. Bạn có cần tôi cung cấp công cụ không?", sender: "farmer", timestamp: "09:36", read: false },
  ]);
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const ts = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    setMessages((p) => [...p, { id: p.length + 1, text: inputText, sender: "worker", timestamp: ts, read: false }]);
    setInputText("");
    setTimeout(() => {
      setMessages((p) => [...p, { id: p.length + 1, text: "Tôi đã nhận được tin nhắn của bạn. Cảm ơn!", sender: "farmer", timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }), read: false }]);
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 bg-white border-b border-slate-200" style={{ paddingTop: insets.top + 10 }}>
        <TouchableOpacity className="p-1 mr-2" onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 flex-row items-center gap-2">
          <Avatar source={{ uri: farmerAvatar }} size={40} />
          <View>
            <Text className="text-lg font-semibold text-slate-900">{farmerName}</Text>
            <Text className="text-xs font-medium text-primary-600">Đang hoạt động</Text>
          </View>
        </TouchableOpacity>
        <View className="flex-row gap-1">
          {[Phone, Video, MoreVertical].map((Icon, i) => (
            <TouchableOpacity key={i} className="p-1"><Icon size={20} color="#475569" /></TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Messages */}
      <ScrollView ref={scrollViewRef} className="flex-1" contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 100 }} showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
        {messages.map((msg) => (
          <View key={msg.id} className={["max-w-[80%] px-4 py-3 rounded-2xl mb-2", msg.sender === "worker" ? "self-end bg-primary-600 rounded-br-[4px]" : "self-start bg-white rounded-bl-[4px]"].join(" ")}>
            <Text className={["text-[15px] leading-[22px] mb-1", msg.sender === "worker" ? "text-white" : "text-slate-900"].join(" ")}>{msg.text}</Text>
            <Text className={["text-xs self-end", msg.sender === "worker" ? "text-primary-100" : "text-slate-500"].join(" ")}>{msg.timestamp}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View className="flex-row items-end p-4 bg-white border-t border-slate-200 gap-2">
        <TouchableOpacity className="p-2 mb-1">
          <Paperclip size={22} color="#475569" />
        </TouchableOpacity>
        <TextInput
          className="flex-1 max-h-[100px] px-4 py-2 bg-slate-100 rounded-full text-[15px] text-slate-900"
          placeholder="Nhập tin nhắn..." placeholderTextColor="#94a3b8"
          value={inputText} onChangeText={setInputText} multiline maxLength={500}
        />
        <TouchableOpacity
          className={["w-10 h-10 justify-center items-center rounded-full mb-1", inputText.trim() ? "bg-primary-600" : "bg-slate-300"].join(" ")}
          onPress={handleSend} disabled={!inputText.trim()}
        >
          <Send size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
