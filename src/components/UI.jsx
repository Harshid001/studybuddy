// src/components/UI.js
import React, { useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, TextInput, Pressable,
  ActivityIndicator, Animated, Easing,
} from "react-native";
import { AV_CLR } from "./context/DataContext";

// ── Badge / Pill ──
export function Badge({ label, color, bg, border }) {
  return (
    <View
      style={{ backgroundColor: bg, borderColor: border, borderWidth: 1 }}
      className="px-2.5 py-1 rounded-full"
    >
      <Text style={{ color, fontSize: 10, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}

// ── Pill with preset colors ──
export function Pill({ label, variant = "blue" }) {
  const variants = {
    blue:   { bg: "#edf2fa", color: "#0f2d5c", border: "#c8d8f0" },
    green:  { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
    amber:  { bg: "#fef3e2", color: "#b45309", border: "#fcd38d" },
    red:    { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
    teal:   { bg: "#e4f4f4", color: "#0d6e6e", border: "#9dd4d4" },
    purple: { bg: "#f5f3ff", color: "#5b21b6", border: "#ddd6fe" },
  };
  const v = variants[variant] || variants.blue;
  return <Badge label={label} {...v} />;
}

// ── Card ──
export function Card({ children, className = "", style }) {
  return (
    <View
      className={`bg-white rounded-lg border border-rule overflow-hidden ${className}`}
      style={[{ shadowColor: "#1c1c1e", shadowOpacity: 0.09, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 }, style]}
    >
      {children}
    </View>
  );
}

export function PressCard({ children, onPress, className = "", style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (toValue) => {
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 30, bounciness: 0 }).start();
  };
  return (
    <Pressable onPress={onPress} onPressIn={() => animateTo(0.985)} onPressOut={() => animateTo(1)}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Card className={className} style={style}>{children}</Card>
      </Animated.View>
    </Pressable>
  );
}

export function CardHead({ children }) {
  return (
    <View className="px-4 py-3 bg-paper border-b border-rule flex-row items-center justify-between">
      {children}
    </View>
  );
}

export function CardTitle({ children }) {
  return <Text className="text-ink font-latoBold text-sm">{children}</Text>;
}

export function CardBody({ children, className = "" }) {
  return <View className={`p-4 ${className}`}>{children}</View>;
}

// ── Stat Card ──
export function StatCard({ icon, label, value, note, accentColor = "#1a4480" }) {
  const animated = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = React.useState(0);
  useEffect(() => {
    const id = animated.addListener(({ value: v }) => setShown(Math.round(v)));
    Animated.timing(animated, { toValue: Number(value) || 0, duration: 800, useNativeDriver: false }).start();
    return () => { animated.removeListener(id); animated.stopAnimation(); };
  }, [animated, value]);
  return (
    <Card style={{ borderTopWidth: 4, borderTopColor: accentColor, shadowColor: accentColor }}>
      <View className="p-4">
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${accentColor}26`, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 26 }}>{icon}</Text>
        </View>
        <Text className="text-ink3 font-latoBold mt-2" style={{ fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase" }}>
          {label}
        </Text>
        <Text className="font-playfairBlack mt-1" style={{ fontSize: 30, color: accentColor, lineHeight: 34 }}>
          {typeof value === "number" ? shown : value}
        </Text>
        <Text className="text-ink3 mt-1" style={{ fontSize: 11 }}>{note}</Text>
      </View>
    </Card>
  );
}

// ── Section Header ──
export function SectionHeader({ title, subtitle, action, onAction }) {
  return (
    <View className="pb-4 border-b border-rule mb-1">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-4">
          <Text className="font-playfair text-ink" style={{ fontSize: 22, letterSpacing: -0.3 }}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-ink3 mt-1" style={{ fontSize: 13 }}>{subtitle}</Text>
          ) : null}
        </View>
        {action ? (
          <PrimaryBtn label={action} onPress={onAction} small />
        ) : null}
      </View>
    </View>
  );
}

// ── Buttons ──
export function PrimaryBtn({ label, onPress, small = false, full = false, loading = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      className={`bg-navy items-center justify-center rounded-[10px] ${full ? "w-full" : ""}`}
      style={{ paddingHorizontal: small ? 14 : 20, paddingVertical: small ? 7 : 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.15)" }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text className="text-white font-latoBold" style={{ fontSize: small ? 12 : 13, letterSpacing: 0.3 }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function OutlineBtn({ label, onPress, small = false, danger = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`items-center justify-center rounded border ${danger ? "border-red-300 bg-dangerlt" : "border-rule2 bg-white"}`}
      style={{ paddingHorizontal: small ? 12 : 18, paddingVertical: small ? 6 : 9 }}
    >
      <Text
        className={`font-latoBold ${danger ? "text-danger" : "text-ink2"}`}
        style={{ fontSize: small ? 11 : 13 }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function GhostBtn({ label, onPress, full = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-paper border border-rule2 rounded items-start justify-center ${full ? "w-full" : ""}`}
      style={{ paddingHorizontal: 14, paddingVertical: 10 }}
    >
      <Text className="text-ink2 font-lato" style={{ fontSize: 13 }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Search Box ──
export function SearchBox({ placeholder, value, onChangeText }) {
  return (
    <View className="flex-row items-center bg-white border border-rule2 rounded px-3 py-2 flex-1">
      <Text className="text-ink4 mr-2">🔍</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#b8b8c0"
        value={value}
        onChangeText={onChangeText}
        className="flex-1 text-ink font-lato"
        style={{ fontSize: 13 }}
      />
    </View>
  );
}

// ── Empty State ──
export function EmptyState({ icon = "📭", title, desc }) {
  return (
    <View className="items-center justify-center py-12 px-6">
      <Text style={{ fontSize: 36 }}>{icon}</Text>
      <Text className="font-playfair text-ink mt-3 text-center" style={{ fontSize: 17 }}>{title}</Text>
      {desc ? (
        <Text className="text-ink3 text-center mt-2 font-lato" style={{ fontSize: 13, lineHeight: 20 }}>
          {desc}
        </Text>
      ) : null}
    </View>
  );
}

// ── Section Label (small uppercase divider) ──
export function SectionLabel({ label }) {
  return (
    <View className="border-b border-rule pb-1.5 mb-3">
      <Text className="text-ink3 font-latoBold" style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase" }}>
        {label}
      </Text>
    </View>
  );
}

// ── Avatar ──
export function Avatar({ emoji, bg, size = 36, ring, idx = 0 }) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, borderWidth: 2, borderColor: ring || AV_CLR[idx % 10] }}
      className="items-center justify-center"
    >
      <Text style={{ fontSize: size * 0.45 }}>{emoji || "👤"}</Text>
    </View>
  );
}

export function PulsingDot({ color, size = 8 }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 1.5, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    loop.start();
    return () => { loop.stop(); scale.stopAnimation(); };
  }, [scale]);
  return (
    <View style={{ width: size * 2, height: size * 2, alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", width: size * 2, height: size * 2, borderRadius: size, backgroundColor: `${color}4D` }} />
      <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ scale }] }} />
    </View>
  );
}

export function AnimatedCounter({ value, duration = 800, style }) {
  const a = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = React.useState(0);
  useEffect(() => {
    const id = a.addListener(({ value: v }) => setShown(Math.round(v)));
    Animated.timing(a, { toValue: value || 0, duration, useNativeDriver: false }).start();
    return () => { a.removeListener(id); a.stopAnimation(); };
  }, [a, value, duration]);
  return <Text style={style}>{shown}</Text>;
}

export function ProgressRing({ progress = 0, size = 160, color = "#1a4480", strokeWidth = 12, label }) {
  const p = Math.max(0, Math.min(100, progress));
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: "#e4e1d8", alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", width: size - strokeWidth, height: size - strokeWidth, borderRadius: (size - strokeWidth) / 2, borderWidth: strokeWidth, borderColor: `${color}33` }} />
      <Text className="font-playfairBlack" style={{ fontSize: 28, color }}>{Math.round(p)}%</Text>
      {label ? <Text className="text-ink3 font-lato" style={{ fontSize: 11 }}>{label}</Text> : null}
    </View>
  );
}

// ── Activity Bar ──
export function ActivityBar({ pct, color }) {
  return (
    <View className="bg-rule rounded-sm overflow-hidden" style={{ height: 5, width: 80 }}>
      <View style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: 2 }} />
    </View>
  );
}

// ── Divider ──
export function Divider() {
  return <View className="h-px bg-rule my-1" />;
}

// ── Mono Text ──
export function Mono({ children, size = 11, color = "#8e8e98" }) {
  return (
    <Text className="font-mono" style={{ fontSize: size, color }}>
      {children}
    </Text>
  );
}
