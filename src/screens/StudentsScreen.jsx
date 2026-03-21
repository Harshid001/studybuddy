// src/screens/StudentsScreen.js
import React, { useState, useMemo, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, TouchableWithoutFeedback } from "react-native";
import { useData, AV_BG } from "../context/DataContext";
import {
  Card, CardHead, CardTitle, CardBody, Avatar, Badge,
  ActivityBar, EmptyState, SearchBox, Mono,
} from "../components/UI";
import StudentDetailModal from "../components/StudentDetailModal";
import AddStudentModal from "../components/AddStudentModal";

const LEVEL_FILTERS = [
  { label: "All", value: "" },
  { label: "Std 1–5",  value: "primary" },
  { label: "Std 6–8",  value: "middle" },
  { label: "Std 9–10", value: "secondary" },
  { label: "Std 11–12",value: "higher" },
  { label: "Engineering", value: "engineering" },
];

const ACTIVITY_FILTERS = [
  { label: "All",      value: "" },
  { label: "Active",   value: "active" },
  { label: "Learning", value: "moderate" },
  { label: "Inactive", value: "inactive" },
];

export default function StudentsScreen() {
  const { profiles, getChatCount, getNoteCount, getLastActive, getActivity } = useData();
  const [search,   setSearch]   = useState("");
  const [level,    setLevel]    = useState("");
  const [activity, setActivity] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [editId,   setEditId]   = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);
  const pressAnim = useRef({}).current;
  const chipUnderline = useRef(new Animated.Value(1)).current;

  const filtered = useMemo(() => profiles.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
                  !p.label.toLowerCase().includes(search.toLowerCase())) return false;
    if (level && !p.levelKey?.includes(level)) return false;
    if (activity) {
      const q = getChatCount(p.id);
      if (activity === "active"   && q < 5)           return false;
      if (activity === "moderate" && (q < 1 || q >= 5)) return false;
      if (activity === "inactive" && q > 0)            return false;
    }
    return true;
  }), [profiles, search, level, activity]);

  return (
    <>
      <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-start justify-between mb-4 pb-4 border-b border-rule">
          <View>
            <Text className="font-playfair text-ink" style={{ fontSize: 22 }}>All Students</Text>
            <Text className="text-ink3 font-lato mt-1" style={{ fontSize: 13 }}>
              {profiles.length} enrolled · {profiles.filter(p => getChatCount(p.id) > 0).length} active
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => { setEditId(null); setShowAdd(true); }}
            className="bg-navy rounded px-4 py-2"
          >
            <Text className="text-white font-latoBold" style={{ fontSize: 12 }}>+ Add Student</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <SearchBox placeholder="Search by name or class…" value={search} onChangeText={setSearch} />

        {/* Level filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 mb-1">
          <View className="flex-row gap-2">
            {LEVEL_FILTERS.map(f => (
              <TouchableOpacity
                key={f.value}
                onPress={() => {
                  setLevel(f.value);
                  chipUnderline.setValue(0);
                  Animated.timing(chipUnderline, { toValue: 1, duration: 180, useNativeDriver: false }).start();
                }}
                style={{
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, borderWidth: 1.5,
                  borderColor: level === f.value ? "#1a4480" : "#cdc9bc",
                  backgroundColor: level === f.value ? "#edf2fa" : "#fff",
                }}
              >
                <Text style={{ fontSize: 12, color: level === f.value ? "#1a4480" : "#4a4a52", fontWeight: level === f.value ? "700" : "400" }}>
                  {f.label}
                </Text>
                {level === f.value ? (
                  <Animated.View style={{ position: "absolute", left: 0, right: 0, bottom: -2, height: 2, backgroundColor: "#1a4480", transform: [{ scaleX: chipUnderline }] }} />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Activity filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 mb-4">
          <View className="flex-row gap-2">
            {ACTIVITY_FILTERS.map(f => (
              <TouchableOpacity
                key={f.value}
                onPress={() => setActivity(f.value)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, borderWidth: 1.5,
                  borderColor: activity === f.value ? "#0d6e6e" : "#cdc9bc",
                  backgroundColor: activity === f.value ? "#e4f4f4" : "#fff",
                }}
              >
                <Text style={{ fontSize: 12, color: activity === f.value ? "#0d6e6e" : "#4a4a52", fontWeight: activity === f.value ? "700" : "400" }}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Student cards */}
        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={profiles.length === 0 ? "🎒" : "🔍"}
              title={profiles.length === 0 ? "No students enrolled" : "No results"}
              desc={profiles.length === 0 ? "Tap '+ Add Student' to enrol your first student." : "Try adjusting your search or filters."}
            />
          </Card>
        ) : filtered.map((p, i) => {
          const origIdx = profiles.indexOf(p);
          const q   = getChatCount(p.id);
          const n   = getNoteCount(p.id);
          const act = getActivity(q);
          const last= getLastActive(p.id);
          if (!pressAnim[p.id]) pressAnim[p.id] = new Animated.Value(1);
          return (
            <TouchableWithoutFeedback
              key={p.id}
              onPress={() => setDetailId(p.id)}
              onPressIn={() => Animated.spring(pressAnim[p.id], { toValue: 0.98, useNativeDriver: true, speed: 40, bounciness: 0 }).start()}
              onPressOut={() => Animated.spring(pressAnim[p.id], { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 0 }).start()}
            >
              <Animated.View style={{ transform: [{ scale: pressAnim[p.id] }] }}>
              <Card className="mb-3" style={{ borderTopWidth: 4, borderTopColor: act.color }}>
                <CardBody>
                  <View className="flex-row items-center gap-3">
                    <Avatar emoji={p.emoji} bg={AV_BG[origIdx % AV_BG.length]} size={42} />
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-latoBold text-ink" style={{ fontSize: 14 }}>{p.name}</Text>
                        <Badge label={act.label} color={act.color} bg={act.bg} border={act.border} />
                      </View>
                      <Text className="text-ink3 font-lato mt-0.5" style={{ fontSize: 11.5 }}>{p.label}</Text>
                    </View>
                    <Text className="text-navy font-latoBold" style={{ fontSize: 12 }}>View →</Text>
                  </View>

                  {/* Stats row */}
                  <View className="flex-row gap-3 mt-3 pt-3 border-t border-rule">
                    <View className="flex-1 items-center">
                      <Text className="font-playfair text-navy" style={{ fontSize: 20 }}>{q}</Text>
                      <Text className="text-ink3 font-latoBold" style={{ fontSize: 9, letterSpacing: .8, textTransform: "uppercase" }}>Questions</Text>
                    </View>
                    <View className="w-px bg-rule" />
                    <View className="flex-1 items-center">
                      <Text className="font-playfair text-amber" style={{ fontSize: 20 }}>{n}</Text>
                      <Text className="text-ink3 font-latoBold" style={{ fontSize: 9, letterSpacing: .8, textTransform: "uppercase" }}>Notes</Text>
                    </View>
                    <View className="w-px bg-rule" />
                    <View className="flex-1 items-center">
                      <ActivityBar pct={act.label === "Active" ? Math.min(100, q * 8) : act.label === "Learning" ? q * 20 : 0} color={act.color} />
                      <Text className="text-ink3 font-latoBold mt-1" style={{ fontSize: 9, letterSpacing: .8, textTransform: "uppercase" }}>Progress</Text>
                    </View>
                    <View className="w-px bg-rule" />
                    <View className="flex-1 items-center">
                      <Mono size={10} color="#1a4480">{last ? last.split(",")[0] : "—"}</Mono>
                      <Text className="text-ink3 font-latoBold mt-0.5" style={{ fontSize: 9, letterSpacing: .8, textTransform: "uppercase" }}>Last Active</Text>
                    </View>
                  </View>
                </CardBody>
              </Card>
              </Animated.View>
            </TouchableWithoutFeedback>
          );
        })}
      </ScrollView>

      <StudentDetailModal
        studentId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(id) => { setEditId(id); setShowAdd(true); }}
      />
      <AddStudentModal
        visible={showAdd}
        onClose={() => { setShowAdd(false); setEditId(null); }}
        editStudentId={editId}
      />
    </>
  );
}
