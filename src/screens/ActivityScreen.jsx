// src/screens/ActivityScreen.js
import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useData } from "../context/DataContext";
import { AV_BG } from "../utils/theme";
import {
  Card, CardHead, CardTitle, CardBody,
  EmptyState, SearchBox, Avatar, Badge, Mono,
} from "../components/UI";

// ── Activity Log ─────────────────────────────────────────────
export function ActivityScreen() {
  const { buildTimeline } = useData();
  const events = buildTimeline().reverse();

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View className="mb-4 pb-3 border-b border-rule">
        <Text className="font-playfair text-ink" style={{ fontSize: 22 }}>Activity Log</Text>
        <Text className="text-ink3 font-lato mt-1" style={{ fontSize: 13 }}>
          Every question asked and note generated — newest first
        </Text>
      </View>
      <Card>
        <CardHead>
          <CardTitle>All Events</CardTitle>
          <View className="bg-navylt border border-navymid rounded px-2 py-0.5">
            <Text className="font-mono text-navy" style={{ fontSize: 10 }}>{events.length} events</Text>
          </View>
        </CardHead>
        <CardBody className="!px-4 !py-2">
          {events.length === 0 ? (
            <EmptyState icon="📭" title="Nothing yet"
              desc="Activity will appear here once students start using StudyBuddy." />
          ) : events.map((ev, i) => (
            <View key={i} className="flex-row items-start gap-3 py-3"
              style={{ borderBottomWidth: i < events.length - 1 ? 1 : 0, borderBottomColor: "#e4e1d8" }}>
              <View className="w-8 h-8 rounded-full items-center justify-center border border-rule"
                style={{ backgroundColor: ev.type === "question" ? "#edf2fa" : "#fef3e2" }}>
                <Text style={{ fontSize: 13 }}>{ev.type === "question" ? "💬" : "📝"}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-lato text-ink" style={{ fontSize: 13, lineHeight: 19 }}>
                  <Text className="font-latoBold text-navy">{ev.profile.name}</Text>
                  {ev.type === "question" ? " asked: " : " created note: "}
                  {(ev.content || "").slice(0, 75)}{ev.content.length > 75 ? "…" : ""}
                </Text>
                <Text className="text-ink3 font-lato mt-0.5" style={{ fontSize: 11 }}>
                  {ev.profile.label}{ev.subject ? ` · ${ev.subject}` : ""}
                </Text>
              </View>
              <Mono size={10} color="#b8b8c0">{ev.time}</Mono>
            </View>
          ))}
        </CardBody>
      </Card>
    </ScrollView>
  );
}

// ── Progress Reports ─────────────────────────────────────────
export function ProgressScreen() {
  const { profiles, getChatCount, getNoteCount, getActivity, getLastActive, chats } = useData();
  const KW = ["math","science","physics","chemistry","biology","history","geography","english","hindi","computer"];

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View className="mb-4 pb-3 border-b border-rule">
        <Text className="font-playfair text-ink" style={{ fontSize: 22 }}>Progress Reports</Text>
        <Text className="text-ink3 font-lato mt-1" style={{ fontSize: 13 }}>
          Detailed per-student learning summary
        </Text>
      </View>
      {profiles.length === 0 ? (
        <Card>
          <EmptyState icon="📈" title="No data yet"
            desc="Enrol students and have them use StudyBuddy to track their progress." />
        </Card>
      ) : profiles.map(p => {
        const q        = getChatCount(p.id);
        const n        = getNoteCount(p.id);
        const act      = getActivity(q);
        const last     = getLastActive(p.id);
        const msgs     = chats[p.id] || [];
        const subjects = [...new Set(
          msgs.filter(m => m.role === "user")
            .map(m => KW.find(k => m.content.toLowerCase().includes(k)))
            .filter(Boolean)
        )];
        return (
          <Card key={p.id} className="mb-4">
            <View className="px-4 py-3 border-b border-rule flex-row items-center justify-between"
              style={{ backgroundColor: "#f8f7f4" }}>
              <View className="flex-row items-center gap-2.5">
                <Text style={{ fontSize: 22 }}>{p.emoji || "👤"}</Text>
                <View>
                  <Text className="font-playfair text-ink" style={{ fontSize: 16 }}>{p.name}</Text>
                  <Text className="text-ink3 font-lato" style={{ fontSize: 11 }}>{p.label}</Text>
                </View>
              </View>
              <Badge label={act.label} color={act.color} bg={act.bg} border={act.border} />
            </View>
            <CardBody>
              <View className="mb-3 p-2 rounded border border-rule2 bg-white">
                <Text className="font-latoBold text-ink2">Predicted Exam Performance</Text>
                <Text className="font-lato mt-1">
                  {q >= 10 ? "🟢 Excellent (85-100%)" : q >= 5 ? "🟡 Good (65-84%)" : q >= 1 ? "🟠 Needs Work (45-64%)" : "🔴 At Risk (Below 45%)"}
                </Text>
              </View>
              <View className="flex-row gap-3 mb-3">
                {[
                  { val: q, label: "Questions", color: "#1a4480", bg: "#edf2fa", border: "#c8d8f0" },
                  { val: n, label: "Notes",     color: "#b45309", bg: "#fef3e2", border: "#fcd38d" },
                  { val: subjects.length, label: "Subjects", color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" },
                ].map(it => (
                  <View key={it.label} className="flex-1 items-center py-3 rounded"
                    style={{ backgroundColor: it.bg, borderWidth: 1, borderColor: it.border }}>
                    <Text className="font-playfair" style={{ fontSize: 26, color: it.color }}>{it.val}</Text>
                    <Text className="font-latoBold mt-0.5"
                      style={{ fontSize: 9, letterSpacing: 0.8, textTransform: "uppercase", color: "#8e8e98" }}>
                      {it.label}
                    </Text>
                  </View>
                ))}
              </View>
              {subjects.length > 0 && (
                <View className="flex-row flex-wrap gap-1.5 mb-3">
                  {subjects.map(s => (
                    <View key={s} className="bg-navylt border border-navymid rounded px-2 py-0.5">
                      <Text className="text-navy2 font-lato" style={{ fontSize: 11 }}>{s}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View className="mb-2">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-ink3 font-latoBold"
                    style={{ fontSize: 9, letterSpacing: 0.8, textTransform: "uppercase" }}>Engagement</Text>
                  <Mono size={10} color="#8e8e98">{act.pct}%</Mono>
                </View>
                <View className="bg-rule rounded-sm overflow-hidden" style={{ height: 5 }}>
                  <View style={{ width: `${act.pct}%`, height: "100%", backgroundColor: act.color, borderRadius: 2 }} />
                </View>
              </View>
              <View className="flex-row justify-between mt-2 pt-2 border-t border-rule">
                <Text className="text-ink3 font-lato" style={{ fontSize: 11.5 }}>{p.label}</Text>
                {last && <Mono size={10} color="#b8b8c0">Last: {last.split(",")[0]}</Mono>}
              </View>
            </CardBody>
          </Card>
        );
      })}
    </ScrollView>
  );
}

// ── Chat History ─────────────────────────────────────────────
export function ChatsScreen() {
  const { profiles, chats } = useData();
  const [search,    setSearch]    = useState("");
  const [filterStu, setFilterStu] = useState("");

  const filtered = useMemo(() =>
    profiles.filter(p => {
      if (filterStu && p.id !== filterStu) return false;
      const msgs = chats[p.id] || [];
      if (!msgs.length) return false;
      if (search) return msgs.some(m => m.content.toLowerCase().includes(search.toLowerCase()));
      return true;
    }),
  [profiles, chats, search, filterStu]);

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View className="mb-4 pb-3 border-b border-rule">
        <Text className="font-playfair text-ink" style={{ fontSize: 22 }}>Chat History</Text>
        <Text className="text-ink3 font-lato mt-1" style={{ fontSize: 13 }}>Every conversation with the AI tutor</Text>
      </View>
      <SearchBox placeholder="Search messages…" value={search} onChangeText={setSearch} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 mb-4">
        <View className="flex-row gap-2">
          {[{ id: "", name: "All Students", emoji: "" }, ...profiles].map(p => (
            <TouchableOpacity key={p.id}
              onPress={() => setFilterStu(filterStu === p.id ? "" : p.id)}
              style={{
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, borderWidth: 1.5,
                borderColor: filterStu === p.id ? "#1a4480" : "#cdc9bc",
                backgroundColor: filterStu === p.id ? "#edf2fa" : "#fff",
                flexDirection: "row", alignItems: "center", gap: 4,
              }}>
              {p.emoji ? <Text style={{ fontSize: 13 }}>{p.emoji}</Text> : null}
              <Text style={{ fontSize: 12, color: filterStu === p.id ? "#1a4480" : "#4a4a52",
                fontWeight: filterStu === p.id ? "700" : "400" }}>
                {p.id === "" ? "All Students" : p.name.split(" ")[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon="💬" title="No chats found"
            desc={profiles.length === 0 ? "Enrol students to see their conversations here." : "Try adjusting your search or filter."} />
        </Card>
      ) : filtered.map(p => {
        const origIdx = profiles.indexOf(p);
        const msgs = (chats[p.id] || []).filter(m => !search || m.content.toLowerCase().includes(search.toLowerCase()));
        return (
          <Card key={p.id} className="mb-4">
            <CardHead>
              <View className="flex-row items-center gap-2">
                <Avatar emoji={p.emoji} bg={AV_BG[origIdx % AV_BG.length]} size={28} />
                <Text className="font-playfair text-ink" style={{ fontSize: 15 }}>{p.name}</Text>
                <View className="bg-navylt border border-navymid rounded px-2 py-0.5">
                  <Text className="font-mono text-navy" style={{ fontSize: 10 }}>{msgs.length} msgs</Text>
                </View>
              </View>
            </CardHead>
            <CardBody className="gap-2">
              {msgs.slice(-4).map((m, j) => (
                <View key={j} className="rounded px-3 py-2"
                  style={{
                    backgroundColor: m.role === "user" ? "#edf2fa" : "#fff",
                    borderWidth: 1, borderColor: m.role === "user" ? "#c8d8f0" : "#e4e1d8",
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "90%",
                  }}>
                  <Text className="font-latoBold"
                    style={{ fontSize: 10.5, color: m.role === "user" ? "#0f2d5c" : "#4a4a52" }}>
                    {m.role === "user" ? p.name : "StudyBuddy AI"}:
                  </Text>
                  <Text className="font-lato mt-0.5" numberOfLines={3}
                    style={{ fontSize: 12.5, lineHeight: 18, color: m.role === "user" ? "#0f2d5c" : "#1c1c1e" }}>
                    {m.content}
                  </Text>
                  {m.time && <Mono size={9.5} color="#b8b8c0">{m.time}</Mono>}
                </View>
              ))}
              {msgs.length > 4 && (
                <Text className="text-navy font-latoBold text-center mt-1" style={{ fontSize: 12 }}>
                  + {msgs.length - 4} more messages
                </Text>
              )}
            </CardBody>
          </Card>
        );
      })}
    </ScrollView>
  );
}
