// src/screens/AdminScreen.js
import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Animated } from "react-native";
import { useData, AV_BG } from "../context/DataContext";
import {
  Card, CardHead, CardTitle, CardBody, Avatar, Badge,
  EmptyState, SearchBox, GhostBtn, OutlineBtn, SectionLabel, PulsingDot,
} from "../components/UI";
import AddStudentModal from "../components/AddStudentModal";

export default function AdminScreen({ navigation }) {
  const {
    profiles, getChatCount, getNoteCount, getActivity,
    removeStudent, clearAll, getTotalStats,
  } = useData();

  const [search,  setSearch]  = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState(null);
  const rowAnim = useRef([]).current;
  const stats = getTotalStats();

  const filtered = profiles.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = (p) => {
    Alert.alert(
      "Remove Student",
      `Remove ${p.name}? All their data will be permanently deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => removeStudent(p.id) },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Reset All Data",
      "Delete ALL student data permanently? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => clearAll() },
      ]
    );
  };

  useEffect(() => {
    filtered.forEach((_, i) => {
      if (!rowAnim[i]) rowAnim[i] = new Animated.Value(0);
      Animated.timing(rowAnim[i], { toValue: 1, duration: 280, delay: i * 60, useNativeDriver: true }).start();
    });
    return () => rowAnim.forEach((a) => a?.stopAnimation());
  }, [filtered.length]);

  return (
    <>
      <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-start justify-between mb-5 pb-4 border-b border-rule">
          <View>
            <Text className="font-playfair text-ink" style={{ fontSize: 22 }}>Admin Panel</Text>
            <Text className="text-ink3 font-lato mt-1" style={{ fontSize: 13 }}>
              Manage students and platform settings
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => { setEditId(null); setShowAdd(true); }}
            className="bg-navy rounded px-4 py-2"
          >
            <Text className="text-white font-latoBold" style={{ fontSize: 12 }}>+ Enrol</Text>
          </TouchableOpacity>
        </View>

        {/* AI Model Status */}
        <Card className="mb-4" style={{ borderLeftWidth: 4, borderLeftColor: "#1a4480" }}>
          <CardBody className="!bg-navylt">
            <Text className="font-playfair text-navy2 mb-2" style={{ fontSize: 16 }}>AI Model Status</Text>
            <View className="flex-row items-center bg-white border border-rule rounded px-3 py-2.5 mb-3">
              <View className="mr-2"><PulsingDot color="#166534" size={8} /></View>
              <Text className="font-mono text-navy2" style={{ fontSize: 12 }}>claude-sonnet-4-20250514</Text>
              <Text className="text-ink3 font-lato ml-auto" style={{ fontSize: 10 }}>Connected</Text>
            </View>
            <Text className="text-ink2 font-lato" style={{ fontSize: 12.5, lineHeight: 19 }}>
              The AI Tutor is powered by <Text className="font-latoBold text-navy">Claude Sonnet 4</Text> by Anthropic. It answers academic questions across all subjects.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AITutor")}
              className="bg-navy rounded px-4 py-2 mt-3 self-start"
            >
              <Text className="text-white font-latoBold" style={{ fontSize: 12 }}>Open AI Tutor →</Text>
            </TouchableOpacity>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Card className="mb-4">
          <CardHead><CardTitle>📊 Quick Stats</CardTitle></CardHead>
          <CardBody>
            {[
              { label: "Total Enrolled",   val: stats.total,  color: "#1a4480" },
              { label: "Active Learners",  val: stats.active, color: "#166534" },
              { label: "Questions Asked",  val: stats.totalQ, color: "#b45309" },
              { label: "Notes Generated",  val: stats.totalN, color: "#5b21b6" },
            ].map((it, i, arr) => (
              <View key={it.label}
                className="flex-row items-center justify-between py-2.5"
                style={{ borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: "#e4e1d8" }}>
                <Text className="text-ink2 font-lato" style={{ fontSize: 13 }}>{it.label}</Text>
                <Text className="font-playfair" style={{ fontSize: 20, color: it.color }}>{it.val}</Text>
              </View>
            ))}
          </CardBody>
        </Card>

        {/* Admin Actions */}
        <Card className="mb-4">
          <CardHead><CardTitle>⚙️ Admin Actions</CardTitle></CardHead>
          <CardBody className="gap-2">
            <TouchableOpacity
              onPress={() => { setEditId(null); setShowAdd(true); }}
              className="bg-paper border border-rule2 rounded px-3 py-3 flex-row items-center"
              style={{ borderLeftWidth: 3, borderLeftColor: "#0d6e6e" }}
            >
              <Text className="text-ink2 font-lato" style={{ fontSize: 13 }}>➕  Enrol New Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Progress")}
              className="bg-paper border border-rule2 rounded px-3 py-3 flex-row items-center"
              style={{ borderLeftWidth: 3, borderLeftColor: "#0d6e6e" }}
            >
              <Text className="text-ink2 font-lato" style={{ fontSize: 13 }}>📊  View Progress Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Activity")}
              className="bg-paper border border-rule2 rounded px-3 py-3 flex-row items-center"
              style={{ borderLeftWidth: 3, borderLeftColor: "#b45309" }}
            >
              <Text className="text-ink2 font-lato" style={{ fontSize: 13 }}>⚡  View Activity Log</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClearAll}
              className="bg-dangerlt border border-red-200 rounded px-3 py-3 flex-row items-center"
              style={{ borderLeftWidth: 3, borderLeftColor: "#b91c1c", overflow: "hidden" }}
            >
              {[...Array(10)].map((_, i) => (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    left: i * 18 - 20,
                    top: -8,
                    width: 1,
                    height: 70,
                    backgroundColor: "rgba(185,28,28,0.08)",
                    transform: [{ rotate: "45deg" }],
                  }}
                />
              ))}
              <Text className="text-danger font-lato" style={{ fontSize: 13 }}>🗑  Reset All Data</Text>
            </TouchableOpacity>
          </CardBody>
        </Card>

        {/* Student Roster */}
        <Card>
          <CardHead>
            <CardTitle>
              👥 Student Roster{" "}
              <Text className="font-mono text-navy" style={{ fontSize: 11 }}>({profiles.length})</Text>
            </CardTitle>
          </CardHead>
          <CardBody>
            <SearchBox placeholder="Search students…" value={search} onChangeText={setSearch} />
            <View className="mt-3">
              {filtered.length === 0 ? (
                <EmptyState
                  icon="👥" title="No students"
                  desc={profiles.length === 0 ? "Tap '+ Enrol' to add your first student." : "No students match your search."}
                />
              ) : filtered.map((p, i) => {
                const origIdx = profiles.indexOf(p);
                const q   = getChatCount(p.id);
                const act = getActivity(q);
                return (
                  <Animated.View
                    key={p.id}
                    className="flex-row items-center gap-3 py-3"
                    style={{
                      borderBottomWidth: i < filtered.length - 1 ? 1 : 0,
                      borderBottomColor: "#e4e1d8",
                      borderLeftWidth: 3, borderLeftColor: "transparent",
                      paddingLeft: 6,
                      opacity: rowAnim[i] || 1,
                      transform: [{ translateX: rowAnim[i] ? rowAnim[i].interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) : 0 }],
                    }}
                  >
                    <Avatar emoji={p.emoji} bg={AV_BG[origIdx % AV_BG.length]} size={38} />
                    <View className="flex-1">
                      <Text className="font-latoBold text-ink" style={{ fontSize: 13.5 }}>{p.name}</Text>
                      <Text className="text-ink3 font-lato" style={{ fontSize: 11 }}>{p.label} · {q} questions</Text>
                    </View>
                    <Badge label={act.label} color={act.color} bg={act.bg} border={act.border} />
                    <TouchableOpacity
                      onPress={() => { setEditId(p.id); setShowAdd(true); }}
                      className="w-8 h-8 rounded bg-navylt border border-navymid items-center justify-center ml-1"
                    >
                      <Text style={{ fontSize: 14 }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemove(p)}
                      className="w-8 h-8 rounded bg-dangerlt border border-red-200 items-center justify-center"
                    >
                      <Text style={{ fontSize: 13 }}>🗑</Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </CardBody>
        </Card>
      </ScrollView>

      <AddStudentModal
        visible={showAdd}
        onClose={() => { setShowAdd(false); setEditId(null); }}
        editStudentId={editId}
      />
    </>
  );
}
