/* AI CONTEXT:
 * Action: Displays a list of recent conversations for the worker.
 * Inputs: Conversation list from message service.
 * Outputs: Rendered inbox UI, navigation to specific chat.
 * Dependencies: Message service, Auth context, Navigation. */

import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { ArrowLeft, MessageSquare, ChevronRight } from "lucide-react-native";
import { Avatar } from "../components/ui/Avatar";
import { messageService } from "../services/message.service";
import { ConversationDTO } from "../types/export_type_definitions";
import { useAuth } from "../context/AuthContext";
import { signalRService } from "../services/signalr.service";

export function ConversationListScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await messageService.getConversations();
      // Sắp xếp danh sách theo thời gian tin nhắn cuối cùng (mới nhất lên đầu)
      const sortedData = [...data].sort((a, b) => {
        const timeA = new Date(a.lastMessage?.createdAt || 0).getTime();
        const timeB = new Date(b.lastMessage?.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setConversations(sortedData);
    } catch (error) {
      console.error("Fetch conversations error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isSubscribed = true;

      const handleNewMessage = () => {
        if (isSubscribed) {
          fetchConversations();
        }
      };

      const setupSignalR = async () => {
        await signalRService.startConnection();
        signalRService.addListener("NewMessage", handleNewMessage);
        signalRService.addListener("ReceiveMessage", handleNewMessage);
        signalRService.addListener("newMessage", handleNewMessage);
        signalRService.addListener("receiveMessage", handleNewMessage);
        signalRService.addListener("MessageReceived", handleNewMessage);
      };

      fetchConversations().then(() => {
        setupSignalR();
      });

      return () => {
        isSubscribed = false;
        signalRService.removeListener("NewMessage", handleNewMessage);
        signalRService.removeListener("ReceiveMessage", handleNewMessage);
        signalRService.removeListener("newMessage", handleNewMessage);
        signalRService.removeListener("receiveMessage", handleNewMessage);
        signalRService.removeListener("MessageReceived", handleNewMessage);
      };
    }, [fetchConversations])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const getFormatTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const renderItem = ({ item }: { item: ConversationDTO }) => {
    // Chống lỗi nếu lastMessage bị null/undefined
    if (!item.lastMessage) return null;
    
    const isMe = String(item.lastMessage.senderId) === String(user?.id);
    const lastMsgContent = item.lastMessage.content || "Không có nội dung tin nhắn";
    
    return (
      <TouchableOpacity 
        className="flex-row items-center px-4 py-3 bg-white border-b border-slate-50"
        activeOpacity={0.7}
        onPress={() => {
          const stackNav = navigation.getParent() ?? navigation;
          stackNav.navigate("Chat", {
            farmerId: item.contact.id,
            farmerName: item.contact.name,
            farmerAvatar: item.contact.avatarUrl,
          });
        }}
      >
        <Avatar source={item.contact.avatarUrl ? { uri: item.contact.avatarUrl } : undefined} size={50} />
        
        <View className="flex-1 ml-3 h-12 justify-center">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-[16px] font-bold text-slate-900" numberOfLines={1}>
              {item.contact.name}
            </Text>
            <Text className="text-[11px] text-slate-400">
              {getFormatTime(item.lastMessage.createdAt)}
            </Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className={["text-[13px] flex-1 mr-2", item.unreadCount > 0 ? "text-slate-900 font-semibold" : "text-slate-500"].join(" ")} numberOfLines={1}>
              {isMe ? `Bạn: ${lastMsgContent}` : lastMsgContent}
            </Text>
            {item.unreadCount > 0 && (
              <View className="bg-emerald-500 rounded-full min-w-[18px] h-[18px] px-1 justify-center items-center">
                <Text className="text-[10px] text-white font-bold">{item.unreadCount > 99 ? "99+" : item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
        
        <ChevronRight size={16} color="#cbd5e1" className="ml-1" />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 bg-white border-b border-slate-200" style={{ paddingTop: insets.top + 10 }}>
        {navigation.canGoBack() && (
          <TouchableOpacity className="p-1 mr-2" onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
        )}
        <Text className="text-xl font-bold text-slate-900">Tin nhắn</Text>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.contact.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10b981"]} />}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center px-10">
              <View className="w-16 h-16 bg-slate-100 rounded-full justify-center items-center mb-4">
                <MessageSquare size={32} color="#94a3b8" />
              </View>
              <Text className="text-lg font-bold text-slate-900 mb-2">Chưa có tin nhắn</Text>
              <Text className="text-slate-500 text-center">Bắt đầu trò chuyện với chủ nông trại để trao đổi về công việc.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
