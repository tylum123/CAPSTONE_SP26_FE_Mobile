import { View, ViewStyle, StyleProp } from "react-native";
import { Shimmer } from "./Shimmer";
import { cn } from "../../utils/helpers";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: "circle" | "rect" | "text";
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ 
  width, 
  height, 
  variant = "rect", 
  className,
  style 
}: SkeletonProps) {
  const borderRadius = variant === "circle" ? 999 : variant === "text" ? 4 : 8;

  return (
    <Shimmer
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
        },
        style,
      ]}
      className={className}
    />
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <View className={cn("flex-row items-center gap-3", className)}>
      <Skeleton variant="circle" width={46} height={46} />
      <View className="flex-1 gap-2">
        <Skeleton variant="text" width="60%" height={14} />
        <Skeleton variant="text" width="40%" height={10} />
      </View>
    </View>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <View className={cn("bg-white p-4 rounded-[20px] border border-slate-100 mb-2", className)}>
      <SkeletonRow />
      <View className="h-px bg-slate-100 my-3" />
      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-2">
           <Skeleton width={80} height={18} variant="text" />
           <Skeleton width={60} height={18} variant="text" />
        </View>
        <Skeleton width={100} height={24} variant="rect" />
      </View>
    </View>
  );
}
