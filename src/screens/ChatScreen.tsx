import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react-native";
import { Avatar } from "../components/ui/Avatar";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { tabBarTranslateY } from "../navigation/WorkerTabNavigator";

interface Message {
  id: number;
  text: string;
  sender: "worker" | "farmer";
  timestamp: string;
  read: boolean;
}

export function ChatScreen({ navigation, route }: any) {
  const { farmerId, farmerName, farmerAvatar } = route.params || {
    farmerId: "1",
    farmerName: "Nguyễn Văn A",
    farmerAvatar: "https://i.pravatar.cc/150?img=12",
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Chào bạn! Tôi quan tâm đến công việc thu hoạch lúa.",
      sender: "worker",
      timestamp: "09:30",
      read: true,
    },
    {
      id: 2,
      text: "Chào bạn! Cảm ơn bạn đã quan tâm. Công việc bắt đầu lúc 6h sáng ngày 22/01.",
      sender: "farmer",
      timestamp: "09:32",
      read: true,
    },
    {
      id: 3,
      text: "Bạn đã có kinh nghiệm thu hoạch lúa chưa?",
      sender: "farmer",
      timestamp: "09:32",
      read: true,
    },
    {
      id: 4,
      text: "Vâng, tôi đã có 2 năm kinh nghiệm làm việc này.",
      sender: "worker",
      timestamp: "09:35",
      read: true,
    },
    {
      id: 5,
      text: "Tuyệt vời! Công việc kéo dài khoảng 6 tiếng. Bạn có cần tôi cung cấp công cụ không?",
      sender: "farmer",
      timestamp: "09:36",
      read: false,
    },
  ]);

  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const lastScrollY = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentScrollY - lastScrollY.current;

    if (scrollDiff > 5) {
      // Scrolling down - hide tab bar
      Animated.timing(tabBarTranslateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (scrollDiff < -5) {
      // Scrolling up - show tab bar
      Animated.timing(tabBarTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() === "") return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: "worker",
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Simulate farmer response
    setTimeout(() => {
      const farmerReply: Message = {
        id: messages.length + 2,
        text: "Tôi đã nhận được tin nhắn của bạn. Cảm ơn!",
        sender: "farmer",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: false,
      };
      setMessages((prev) => [...prev, farmerReply]);
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.gray[900]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.farmerInfo}
          onPress={() => {
            /* Navigate to farmer profile */
          }}
        >
          <Avatar source={{ uri: farmerAvatar }} size={40} />
          <View>
            <Text style={styles.farmerName}>{farmerName}</Text>
            <Text style={styles.onlineStatus}>Đang hoạt động</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Phone size={20} color={COLORS.gray[600]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Video size={20} color={COLORS.gray[600]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MoreVertical size={20} color={COLORS.gray[600]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sender === "worker"
                ? styles.workerMessage
                : styles.farmerMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.sender === "worker" && styles.workerMessageText,
              ]}
            >
              {message.text}
            </Text>
            <Text
              style={[
                styles.messageTime,
                message.sender === "worker" && styles.workerMessageTime,
              ]}
            >
              {message.timestamp}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Paperclip size={22} color={COLORS.gray[600]} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={COLORS.gray[400]}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim() === "" && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={inputText.trim() === ""}
        >
          <Send
            size={20}
            color={inputText.trim() === "" ? COLORS.gray[400] : COLORS.white}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.emerald[50],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  farmerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  onlineStatus: {
    fontSize: 12,
    color: COLORS.emerald[600],
  },
  headerActions: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  workerMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.emerald[600],
    borderBottomRightRadius: 4,
  },
  farmerMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.gray[900],
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  workerMessageText: {
    color: COLORS.white,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.gray[500],
    alignSelf: "flex-end",
  },
  workerMessageTime: {
    color: COLORS.emerald[100],
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    gap: SPACING.sm,
  },
  attachButton: {
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.full,
    fontSize: 15,
    color: COLORS.gray[900],
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.emerald[600],
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xs,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
});
