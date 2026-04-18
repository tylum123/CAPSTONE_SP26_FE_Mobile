/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import React from "react";
import { View, Text, Pressable, ScrollView, ViewStyle } from "react-native";

interface TabItem {
  key: string;
  label: string;
  badgeCount?: number;
}

interface PillTabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: ViewStyle;
  scrollable?: boolean;
}

export function PillTabs({
  items,
  activeKey,
  onChange,
  style,
  scrollable,
}: PillTabsProps) {
  const content = (
    <View
      className="flex-row bg-slate-100 rounded-2xl p-1.5 gap-2 self-stretch"
      style={style}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            className={[
              "flex-1 flex-row items-center justify-center py-3 px-0.5 rounded-xl gap-1",
              isActive ? "bg-white" : "bg-transparent",
            ].join(" ")}
            style={
              isActive
                ? {
                    shadowColor: "#0f172a",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                    elevation: 1,
                  }
                : {}
            }
            hitSlop={8}
          >
            <Text
              className={[
                "text-[13px]",
                isActive ? "text-slate-900 font-bold" : "text-slate-600",
              ].join(" ")}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            {typeof item.badgeCount === "number" ? (
              <View
                className={[
                  "min-w-5 px-0.5 py-0.5 rounded-lg items-center",
                  isActive ? "bg-primary-50" : "bg-slate-200",
                ].join(" ")}
              >
                <Text
                  className={[
                    "text-[11px] font-bold",
                    isActive ? "text-primary-700" : "text-slate-600",
                  ].join(" ")}
                >
                  {item.badgeCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}
