/**
 * useChat — Custom hook tách toàn bộ messaging logic ra khỏi ChatScreen.
 *
 * Trước đây: fetchMessages, sendMessage, polling, partnerInfo resolution
 * nằm trực tiếp trong ChatScreen component.
 *
 * Sau khi refactor: ChatScreen chỉ render UI, hook quản lý state & side-effects.
 *
 * Features:
 * - Fetch messages với polling mỗi 5s
 * - Auto-resolve partner name/avatar từ message.sender/receiver (dùng UserBriefDTO)
 * - Gửi tin nhắn với optimistic update + rollback on error
 * - Mark as read khi load
 * - Cleanup khi unmount
 *
 * Usage:
 *   const { messages, partnerInfo, inputText, setInputText, loading, handleSend } = useChat(farmerId, defaultName, defaultAvatar);
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/message.service';
import type { MessageDTO, UserBriefDTO } from '../types/define_worker_interfaces';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PartnerInfo {
  name: string;
  avatar?: string;
}

interface UseChatResult {
  messages: MessageDTO[];
  partnerInfo: PartnerInfo;
  inputText: string;
  setInputText: (text: string) => void;
  loading: boolean;
  handleSend: () => Promise<void>;
  refetch: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChat(
  farmerId: string | undefined,
  defaultName: string = 'Chủ nông trại',
  defaultAvatar?: string,
): UseChatResult {
  const { user } = useAuth();
  const currentAuthId = user?.authUserId || '';

  const [messages, setMessages]     = useState<MessageDTO[]>([]);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo>({ name: defaultName, avatar: defaultAvatar });
  const [inputText, setInputText]   = useState('');
  const [loading, setLoading]       = useState(true);
  const isMounted                   = useRef(true);

  // ── fetchMessages ──────────────────────────────────────────────────────────

  const fetchMessages = useCallback(async () => {
    if (!farmerId) {
      setLoading(false);
      return;
    }
    try {
      const response = await messageService.getMessages(farmerId, 1, 100);
      if (!isMounted.current) return;

      // Normalize payload — BE may return raw array, paginated wrapper, or nested data
      let items: MessageDTO[] = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response && Array.isArray((response as any).data)) {
        items = (response as any).data;
      } else if (response && Array.isArray((response as any).data?.data)) {
        items = (response as any).data.data;
      } else if (response && Array.isArray((response as any).items)) {
        items = (response as any).items;
      }

      if (items.length > 0) {
        // Sort ascending by time
        const sorted = [...items].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Auto-resolve partner info from embedded sender/receiver (UserBriefDTO)
        const partnerRaw = items.find(m =>
          (m.senderId.toLowerCase() === farmerId.toLowerCase() ||
           m.receiverId.toLowerCase() === farmerId.toLowerCase()) &&
          (m.sender || m.receiver)
        );
        if (partnerRaw && isMounted.current) {
          const partnerDTO: UserBriefDTO | undefined =
            partnerRaw.senderId.toLowerCase() === farmerId.toLowerCase()
              ? partnerRaw.sender
              : partnerRaw.receiver;
          if (partnerDTO) {
            setPartnerInfo({
              name: partnerDTO.name || defaultName,
              avatar: partnerDTO.avatarUrl || defaultAvatar,
            });
          }
        }

        if (isMounted.current) setMessages(sorted);
      }

      // Mark conversation as read
      await messageService.markAsRead({ senderId: farmerId }).catch(() => {});
    } catch (err) {
      console.log('[useChat] fetchMessages error:', err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [farmerId, defaultName, defaultAvatar]);

  // ── Polling setup ──────────────────────────────────────────────────────────

  useEffect(() => {
    isMounted.current = true;
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000);
    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [fetchMessages]);

  // ── handleSend — optimistic update ────────────────────────────────────────

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !farmerId) return;
    const content = inputText.trim();
    setInputText('');

    const tempMsg: MessageDTO = {
      id: `temp-${Date.now()}`,
      senderId: currentAuthId,
      receiverId: farmerId,
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMsg]);

    try {
      await messageService.sendMessage({ receiverId: farmerId, content });
      // Refresh shortly after to get the real message with server id
      setTimeout(fetchMessages, 500);
    } catch (err) {
      console.log('[useChat] send error:', err);
      // Rollback optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  }, [inputText, farmerId, currentAuthId, fetchMessages]);

  return {
    messages,
    partnerInfo,
    inputText,
    setInputText,
    loading,
    handleSend,
    refetch: fetchMessages,
  };
}
