// src/screens/SplashScreen.js
import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { colors } from "../utils/theme";

export default function SplashScreen() {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;
  const dotAnim   = useRef(new Animated.Value(0)).current;
  const ringSpin  = useRef(new Animated.Value(0)).current;
  const shimmerX  = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    const dots = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );

    const ring = Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const shimmer = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: 200,
        duration: 2000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    );

    entrance.start();
    dots.start();
    ring.start();
    shimmer.start();

    return () => {
      entrance.stop();
      dots.stop();
      ring.stop();
      shimmer.stop();
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      dotAnim.stopAnimation();
      ringSpin.stopAnimation();
      shimmerX.stopAnimation();
    };
  }, []);

  const spin = ringSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.navy2 }}
    >
      {/* Top accent stripe */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: colors.navy }} />

      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: "center" }}
      >
        <Animated.View
          style={{
            position: "absolute",
            width: 116,
            height: 116,
            borderRadius: 58,
            borderWidth: 2,
            borderColor: "rgba(26,68,128,0.4)",
            transform: [{ rotate: spin }],
          }}
        />
        {/* Logo */}
        <View style={{ marginBottom: 18 }}>
          <View style={{
            position: "absolute",
            top: 6,
            left: 5,
            width: 72,
            height: 72,
            borderRadius: 16,
            backgroundColor: "rgba(0,0,0,0.18)",
          }} />
          <View style={{
            position: "absolute",
            top: 3,
            left: 2,
            width: 72,
            height: 72,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.08)",
          }} />
          <View
            style={{
              width: 72, height: 72, borderRadius: 16,
              backgroundColor: colors.navy,
              alignItems: "center", justifyContent: "center",
              shadowColor: "#000", shadowOpacity: 0.4,
              shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
            }}
          >
            <Text style={{ fontSize: 36 }}>🎓</Text>
          </View>
        </View>

        {/* App name */}
        <View style={{ overflow: "hidden", marginBottom: 4 }}>
          <Text
            style={{
              fontFamily: "PlayfairDisplay_900Black",
              fontSize: 32, color: "#ffffff",
              letterSpacing: -0.5,
            }}
          >
            StudyBuddy
          </Text>
          <Animated.View
            style={{
              position: "absolute",
              width: 28,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.35)",
              transform: [{ translateX: shimmerX }, { skewX: "-20deg" }],
            }}
          />
        </View>

        {/* Tagline */}
        <Text
          style={{
            fontFamily: "Lato_400Regular",
            fontSize: 13, color: "rgba(255,255,255,0.55)",
            letterSpacing: 1.5, textTransform: "uppercase",
            marginBottom: 40,
          }}
        >
          Admin Dashboard
        </Text>

        {/* Loading indicator */}
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <Animated.View
              key={i}
              style={{
                width: 6, height: 6, borderRadius: 3,
                backgroundColor: "rgba(255,255,255,0.4)",
                opacity: dotAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: i === 1 ? [0.3, 1] : [0.3, 0.6],
                }),
              }}
            />
          ))}
        </View>
        <Text
          style={{
            fontFamily: "Lato_400Regular",
            fontSize: 12, color: "rgba(255,255,255,0.4)",
            marginTop: 12,
          }}
        >
          Loading…
        </Text>
      </Animated.View>

      {/* Bottom version tag */}
      <View style={{ position: "absolute", bottom: 32 }}>
        <Text
          style={{
            fontFamily: "SourceCodePro_400Regular",
            fontSize: 10, color: "rgba(255,255,255,0.25)",
            letterSpacing: 1,
          }}
        >
          v1.0.0 · StudyBuddy Team
        </Text>
      </View>
    </View>
  );
}
