import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ViewStyle,
} from "react-native";
import {
  COLORS,
  BORDER_RADIUS,
  SPACING,
  TYPOGRAPHY,
} from "../../constants/theme";

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
    <View style={[styles.container, style]}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[styles.tab, isActive && styles.tabActive]}
            hitSlop={8}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
            {typeof item.badgeCount === "number" ? (
              <View style={[styles.badge, isActive && styles.badgeActive]}>
                <Text
                  style={[styles.badgeText, isActive && styles.badgeTextActive]}
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
        contentContainerStyle={styles.scrollWrap}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.slate[100],
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.xs,
    gap: SPACING.xs,
    alignSelf: "stretch",
  },
  scrollWrap: {
    paddingHorizontal: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "transparent",
    gap: SPACING.xs,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    ...TYPOGRAPHY.body1,
    color: COLORS.slate[600],
  },
  labelActive: {
    color: COLORS.slate[900],
    fontWeight: "700",
  },
  badge: {
    minWidth: 24,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.slate[200],
    alignItems: "center",
  },
  badgeActive: {
    backgroundColor: COLORS.emerald[50],
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.slate[600],
  },
  badgeTextActive: {
    color: COLORS.emerald[700],
  },
});
