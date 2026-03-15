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
      className="flex-row bg-slate-100 rounded-full p-1 gap-1 self-stretch"
      style={style}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            className={[
              "flex-1 flex-row items-center justify-center py-2 px-1 rounded-full gap-1",
              isActive ? "bg-white" : "bg-transparent",
            ].join(" ")}
            style={
              isActive
                ? {
                    shadowColor: "#0f172a",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    elevation: 2,
                  }
                : {}
            }
            hitSlop={8}
          >
            <Text
              className={[
                "text-[15px]",
                isActive ? "text-slate-900 font-bold" : "text-slate-600",
              ].join(" ")}
            >
              {item.label}
            </Text>
            {typeof item.badgeCount === "number" ? (
              <View
                className={[
                  "min-w-6 px-1 py-0.5 rounded-full items-center",
                  isActive ? "bg-primary-50" : "bg-slate-200",
                ].join(" ")}
              >
                <Text
                  className={[
                    "text-[12px] font-medium",
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
