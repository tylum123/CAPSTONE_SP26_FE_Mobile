/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import React from "react";
import { View, ViewStyle } from "react-native";

type CardVariant = "default" | "elevated" | "flat" | "outline" | "tinted";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  variant?: CardVariant;
}

const variantClass: Record<CardVariant, string> = {
  default:  "bg-white border border-slate-100 rounded-[20px] overflow-hidden shadow-sm",
  elevated: "bg-white rounded-[20px] overflow-hidden shadow-md",
  flat:     "bg-white border border-slate-200 rounded-[20px] overflow-hidden",
  outline:  "bg-transparent border-2 border-primary-200 rounded-[20px] overflow-hidden",
  tinted:   "bg-primary-50 border border-primary-100 rounded-[20px] overflow-hidden",
};

export function Card({ children, style, className, variant = "default" }: CardProps) {
  return (
    <View className={[variantClass[variant], className].filter(Boolean).join(" ")} style={style}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style, className }: CardProps) {
  return (
    <View className={["p-4 border-b border-slate-100", className].filter(Boolean).join(" ")} style={style}>
      {children}
    </View>
  );
}

export function CardContent({ children, style, className }: CardProps) {
  return (
    <View className={["p-4", className].filter(Boolean).join(" ")} style={style}>
      {children}
    </View>
  );
}
