// src/screens/DashboardScreen.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Animated } from "react-native";
import { useData, AV_BG } from "../context/DataContext";
import {
  StatCard, Card, CardHead, CardTitle, CardBody,
  Avatar, Badge, EmptyState, OutlineBtn, Mono,
} from "../components/UI";
import StudentDetailModal from "../components/StudentDetailModal";
import AddStudentModal from "../components/AddStudentModal";

export default function DashboardScreen({ navigation }) {
  const {
    profiles, getTotalStats, getChatCount,
    getActivity, buildTimeline, loadData, getClassLeaderboard, subjectBreakdown,
  } = useData();

  const [refreshing,    setRefreshing]    = useState(false);
  const [detailId,      setDetailId]      = useState(null);
  const [editId,        setEditId]        = useState(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const statAnim = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const barAnim = useRef([]).current;

  const stats    = getTotalStats();
  const timeline = buildTimeline().slice(-6).reverse();
  const leaderboard = getClassLeaderboard();
  const today    = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    const statSeq = statAnim.map((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 350, delay: i * 100, useNativeDriver: true })
    );
    Animated.parallel(statSeq).start();
    return () => statAnim.forEach((a) => a.stopAnimation());
  }, [statAnim]);

  useEffect(() => {
    profiles.forEach((_, i) => {
      if (!barAnim[i]) barAnim[i] = new Animated.Value(0);
      barAnim[i].setValue(0);
      Animated.spring(barAnim[i], { toValue: 1, delay: i * 80, useNativeDriver: false }).start();
    });
    return () => barAnim.forEach((a) => a?.stopAnimation());
  }, [profiles.length, stats.totalQ]);

  const statCards = [
    { icon: "👨‍🎓", label: "Total Students",  value: stats.total,  note: `${stats.active} active`,         accent: "#1a4480" },
    { icon: "💬",   label: "Questions Asked", value: stats.totalQ, note: "Across all students",             accent: "#0d6e6e" },
    { icon: "📝",   label: "Notes Generated", value: stats.totalN, note: "AI study notes",                  accent: "#b45309" },
    { icon: "📈",   label: "Engagement",      value: stats.total > 0 ? `${Math.round(stats.active / stats.total * 100)}%` : "—",
                                               note: `${stats.active} active students`,                     accent: "#5b21b6" },
  ];

  return (
    <>
      <ScrollView
        className="flex-1 bg-paper"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a4480" />}
      >
        {/* Greeting */}
        <View className="mb-5 pb-4 border-b border-rule bg-navylt rounded-b-[20px] px-3 pt-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="font-playfair text-ink" style={{ fontSize: 22, letterSpacing: -0.3 }}>
                Good day, Teacher 👋
              </Text>
              <Text className="text-ink3 mt-1 font-lato" style={{ fontSize: 12 }}>{today}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              className="bg-navy rounded px-4 py-2"
            >
              <Text className="text-white font-latoBold" style={{ fontSize: 12 }}>+ Add Student</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats 2×2 grid */}
        <View className="flex-row flex-wrap gap-3 mb-5">
          {statCards.map((c, i) => (
            <Animated.View
              key={i}
              style={{
                width: "47.5%",
                opacity: statAnim[i],
                transform: [{ translateY: statAnim[i].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
              }}
            >
              <StatCard {...c} />
            </Animated.View>
          ))}
        </View>

        {/* Quick Actions */}
        <Card className="mb-4">
          <CardHead><CardTitle>Quick Actions</CardTitle></CardHead>
          <CardBody>
            <View className="flex-row flex-wrap gap-2">
              {[
                { t: "🗓️ Plan My Study", on: () => navigation.navigate("StudyPlanner") },
                { t: "⏱️ Start Focus", on: () => navigation.navigate("Pomodoro") },
                { t: "📝 Take Mock Test", on: () => navigation.navigate("MockTest") },
                { t: "🎮 View Progress", on: () => navigation.navigate("Gamification") },
              ].map((a) => (
                <TouchableOpacity key={a.t} onPress={a.on} className="w-[48%] bg-white border border-rule2 rounded p-3">
                  <Text className="font-latoBold text-ink2">{a.t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardBody>
        </Card>

        {/* Gamification widget */}
        <Card className="mb-4">
          <CardHead><CardTitle>🎮 Class Leaderboard</CardTitle></CardHead>
          <CardBody>
            {leaderboard.length === 0 ? <EmptyState icon="🏆" title="No leaderboard yet" desc="Activity builds XP and levels." /> : leaderboard.slice(0, 3).map((row, i) => (
              <View key={row.profile.id} className="py-2 border-b border-rule flex-row items-center justify-between">
                <Text className="font-latoBold text-ink">{i + 1}. {row.profile.name}</Text>
                <Text className="font-lato text-ink2">{row.level.emoji} {row.xp} XP</Text>
              </View>
            ))}
          </CardBody>
        </Card>

        {/* Student Overview */}
        <Card className="mb-4">
          <CardHead>
            <CardTitle>👨‍🎓 Student Overview</CardTitle>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate("StudentsTab")}>
              <Text className="text-navy font-latoBold" style={{ fontSize: 12 }}>View All →</Text>
            </TouchableOpacity>
          </CardHead>
          <CardBody>
            {profiles.length === 0 ? (
              <EmptyState icon="🎒" title="No students yet" desc="Tap '+ Add Student' to enrol your first student." />
            ) : profiles.slice(0, 5).map((p, i) => {
              const q   = getChatCount(p.id);
              const act = getActivity(q);
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setDetailId(p.id)}
                  className="flex-row items-center py-2.5 border-b border-rule"
                  style={{ borderBottomWidth: i === Math.min(profiles.length, 5) - 1 ? 0 : 1 }}
                >
                  <Avatar emoji={p.emoji} bg={AV_BG[i % AV_BG.length]} size={34} />
                  <View className="flex-1 ml-2.5">
                    <Text className="font-latoBold text-ink" style={{ fontSize: 13.5 }}>{p.name}</Text>
                    <Text className="text-ink3 font-lato" style={{ fontSize: 11 }}>{p.label}</Text>
                  </View>
                  <View className="items-end">
                    <Badge label={act.label} color={act.color} bg={act.bg} border={act.border} />
                    <Mono size={10} color="#b8b8c0">{q} questions</Mono>
                  </View>
                </TouchableOpacity>
              );
            })}
          </CardBody>
        </Card>

        {/* Activity Feed */}
        <Card className="mb-4">
          <CardHead>
            <CardTitle>⚡ Recent Activity</CardTitle>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate("RecordsTab", { screen: "Activity" })}>
              <Text className="text-navy font-latoBold" style={{ fontSize: 12 }}>See All →</Text>
            </TouchableOpacity>
          </CardHead>
          <CardBody className="!px-4 !py-2">
            {timeline.length === 0 ? (
              <EmptyState icon="📭" title="Nothing yet" desc="Activity will appear here once students start using StudyBuddy." />
            ) : timeline.map((ev, i) => (
              <View key={i} className="flex-row items-start gap-3 py-2.5 border-b border-rule"
                style={{ borderBottomWidth: i === timeline.length - 1 ? 0 : 1 }}>
                <View style={{ alignItems: "center", width: 16 }}>
                  <View
                    className="w-3 h-3 rounded-full border border-rule"
                    style={{ backgroundColor: ev.type === "question" ? "#1a4480" : "#b45309", marginTop: 9 }}
                  />
                  {i < timeline.length - 1 ? <View style={{ width: 1, flex: 1, backgroundColor: "#e4e1d8", marginTop: 2 }} /> : null}
                </View>
                <View className="flex-1">
                  <Text className="font-lato text-ink" style={{ fontSize: 13, lineHeight: 18 }}>
                    <Text className="font-latoBold text-navy">{ev.profile.name}</Text>
                    {ev.type === "question" ? " asked: " : " created note: "}
                    {(ev.content || "").slice(0, 55)}{ev.content.length > 55 ? "…" : ""}
                  </Text>
                  <Text className="text-ink3 font-lato mt-0.5" style={{ fontSize: 11 }}>{ev.profile.label}</Text>
                </View>
                <Mono size={10} color="#b8b8c0">{ev.time}</Mono>
              </View>
            ))}
          </CardBody>
        </Card>

        {/* Bar Chart */}
        {profiles.length > 0 && (
          <Card>
            <CardHead><CardTitle>💬 Questions — by Student</CardTitle></CardHead>
            <CardBody>
              <View className="flex-row items-end gap-2" style={{ height: 90 }}>
                {(() => {
                  const max = Math.max(...profiles.map(p => getChatCount(p.id)), 1);
                  const colors = ["#1a4480","#0d6e6e","#b45309","#5b21b6","#1a4480","#0d6e6e"];
                  return profiles.map((p, i) => {
                    const q = getChatCount(p.id);
                    const h = Math.max(4, Math.round((q / max) * 70));
                    if (!barAnim[i]) barAnim[i] = new Animated.Value(0);
                    return (
                      <View key={p.id} className="flex-1 items-center gap-1">
                        <Mono size={9} color="#8e8e98">{q}</Mono>
                        <Animated.View style={{ height: barAnim[i].interpolate({ inputRange: [0, 1], outputRange: [0, h] }), width: "100%", backgroundColor: colors[i % colors.length], borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
                        <Text className="text-ink3 font-latoBold text-center" style={{ fontSize: 9 }} numberOfLines={1}>
                          {p.name.split(" ")[0]}
                        </Text>
                      </View>
                    );
                  });
                })()}
              </View>
            </CardBody>
          </Card>
        )}

        {/* Class analytics */}
        <Card className="mt-4">
          <CardHead><CardTitle>📊 Class Analytics</CardTitle></CardHead>
          <CardBody>
            {Object.entries(subjectBreakdown).map(([k, v]) => (
              <View key={k} className="mb-2">
                <View className="flex-row justify-between"><Text className="font-lato text-ink2">{k}</Text><Text>{v}</Text></View>
                <View className="bg-rule rounded h-2 mt-1"><View style={{ width: `${Math.min(100, v * 12)}%`, height: "100%", backgroundColor: "#1a4480", borderRadius: 4 }} /></View>
              </View>
            ))}
          </CardBody>
        </Card>
      </ScrollView>

      <StudentDetailModal
        studentId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(id) => { setEditId(id); setShowAddModal(true); }}
      />
      <AddStudentModal
        visible={showAddModal}
        onClose={() => { setShowAddModal(false); setEditId(null); }}
        editStudentId={editId}
      />
    </>
  );
}
