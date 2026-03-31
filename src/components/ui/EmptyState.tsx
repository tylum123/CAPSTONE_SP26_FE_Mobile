/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import React from "react";
import { View, Text } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "./Button";
import { cn } from "../../utils/provide_formatting_helpers";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  actionLabel, 
  onAction,
  className 
}: EmptyStateProps) {
  return (
    <View className={cn("items-center justify-center py-12 px-6", className)}>
      <View className="relative mb-6">
        <LinearGradient
          colors={["#f8fafb", "#f1f5f9"]}
          className="w-24 h-24 rounded-full justify-center items-center border border-slate-100 shadow-sm"
        >
          {Icon ? <Icon size={44} color="#94a3b8" strokeWidth={1.5} /> : null}
        </LinearGradient>
        <View className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm border border-slate-50">
           <Text className="text-[10px]">🍃</Text>
        </View>
      </View>
      
      <Text className="text-[18px] font-extrabold text-slate-800 text-center mb-2" style={{ letterSpacing: -0.4 }}>
        {title}
      </Text>
      
      {message && (
        <Text className="text-[14px] text-slate-400 text-center leading-[20px] max-w-[260px] mb-6">
          {message}
        </Text>
      )}
      
      {actionLabel && onAction && (
        <Button 
          variant="default" 
          size="md" 
          onPress={onAction}
          className="px-10 rounded-full"
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
