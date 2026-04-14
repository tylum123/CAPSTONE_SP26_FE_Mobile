/* AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Component: Custom animated range-slider experience level selector.
 * Rule: DO NOT modify existing code logic.
 */
import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, PanResponder, Animated } from "react-native";

export const EXPERIENCE_LEVELS = [
  { id: 1, label: "Dưới 6 tháng" },
  { id: 2, label: "Dưới 12 tháng" },
  { id: 3, label: "Trên 12 tháng" },
];

interface ExperienceSelectorProps {
  selected: number;
  onSelect: (id: number) => void;
}

export function ExperienceSelector({ selected, onSelect }: ExperienceSelectorProps) {
  const TRACK_WIDTH = 280; 
  const THUMB_SIZE = 28;
  const SNAP_MAX = TRACK_WIDTH - THUMB_SIZE;
  const snapPositions = [0, TRACK_WIDTH / 2 - THUMB_SIZE / 2, SNAP_MAX];
  const labelCenters = [0, TRACK_WIDTH / 2, TRACK_WIDTH];

  const thumbX = useRef(new Animated.Value(snapPositions[selected - 1] ?? 0)).current;
  const currentX = useRef(snapPositions[selected - 1] ?? 0);
  const [fillWidth, setFillWidth] = React.useState(labelCenters[selected - 1] ?? labelCenters[0]);

  const getIdForX = (x: number) => {
    let best = 0;
    let bestDist = Infinity;
    snapPositions.forEach((p, i) => { const d = Math.abs(p - x); if (d < bestDist) { bestDist = d; best = i; } });
    return best + 1;
  };

  useEffect(() => {
    const target = snapPositions[selected - 1] ?? 0;
    Animated.spring(thumbX, { toValue: target, useNativeDriver: true, tension: 120, friction: 8 }).start();
    currentX.current = target;
    setFillWidth(labelCenters[selected - 1] ?? labelCenters[0]);
  }, [selected]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        thumbX.stopAnimation(val => { currentX.current = val; });
        thumbX.setOffset(currentX.current);
        thumbX.setValue(0);
      },
      onPanResponderMove: (_, gs) => {
        const raw = Math.max(0, Math.min(SNAP_MAX, currentX.current + gs.dx));
        thumbX.setValue(raw - currentX.current);
        setFillWidth(raw + THUMB_SIZE / 2); 
      },
      onPanResponderRelease: (_, gs) => {
        thumbX.flattenOffset();
        thumbX.stopAnimation();
        const rawX = Math.max(0, Math.min(SNAP_MAX, currentX.current + gs.dx));
        const snappedId = getIdForX(rawX);
        const snappedX = snapPositions[snappedId - 1];
        currentX.current = snappedX;
        Animated.spring(thumbX, { toValue: snappedX, useNativeDriver: true, tension: 150, friction: 10 }).start();
        setFillWidth(labelCenters[snappedId - 1]);
        onSelect(snappedId);
      },
    })
  ).current;

  return (
    <View style={{ paddingVertical: 12, paddingHorizontal: 4 }}>
      <View style={{ width: TRACK_WIDTH, alignSelf: "center", flexDirection: "row", marginBottom: 18 }}>
        {EXPERIENCE_LEVELS.map((level, i) => (
          <TouchableOpacity
            key={level.id}
            onPress={() => onSelect(level.id)}
            style={{
              flex: 1,
              alignItems: i === 0 ? "flex-start" : i === 2 ? "flex-end" : "center",
            }}
          >
            <Text style={{
              fontSize: 12,
              fontWeight: selected === level.id ? "800" : "600",
              color: selected === level.id ? "#059669" : "#94A3B8",
              textAlign: i === 0 ? "left" : i === 2 ? "right" : "center",
            }}>
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ width: TRACK_WIDTH, alignSelf: "center", height: THUMB_SIZE, justifyContent: "center" }}>
        <View style={{ height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, width: "100%", position: "absolute" }} />
        <View style={{ height: 6, backgroundColor: "#059669", borderRadius: 3, width: fillWidth, position: "absolute", left: 0 }} />
        
        {snapPositions.map((_, i) => (
          <View key={i} style={{
            position: "absolute",
            left: labelCenters[i] - 5,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: "#FFFFFF",
            borderWidth: 2,
            borderColor: selected - 1 >= i ? "#059669" : "#CBD5E1",
          }} />
        ))}

        <Animated.View
          {...panResponder.panHandlers}
          style={{
            width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2,
            position: "absolute", left: 0,
            backgroundColor: "#059669",
            borderWidth: 3, borderColor: "#ffffff",
            elevation: 8,
            shadowColor: "#059669", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
            transform: [{ translateX: thumbX }],
          }}
        />
      </View>
    </View>
  );
}
