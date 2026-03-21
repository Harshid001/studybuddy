// src/screens/NotesScreen.js
import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Share } from "react-native";
import { useData } from "../context/DataContext";
import { AV_BG } from "../utils/theme";
import {
  Card, CardHead, CardTitle, CardBody,
  EmptyState, SearchBox, Avatar, Badge, Mono,
} from "../components/UI";

export default function NotesScreen() {
  const { profiles, notes, addNoteForStudent } = useData();
  const [search,    setSearch]    = useState("");
  const [filterStu, setFilterStu] = useState("");
  const [showGen, setShowGen] = useState(false);
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("Summary");
  const [genStudent, setGenStudent] = useState("");
  const [genSubject, setGenSubject] = useState("Mathematics");
  const [loading, setLoading] = useState(false);

  // Flatten all notes into one list
  const allNotes = useMemo(() => {
    const list = [];
    profiles.forEach(p => {
      Object.values(notes[p.id] || {}).forEach(n => {
        list.push({ note: n, profile: p, pidx: profiles.indexOf(p) });
      });
    });
    return list;
  }, [profiles, notes]);

  const filtered = useMemo(() =>
    allNotes.filter(({ note: n, profile: p }) => {
      if (filterStu && p.id !== filterStu) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          (n.title   || "").toLowerCase().includes(s) ||
          (n.subject || "").toLowerCase().includes(s) ||
          (n.content || "").toLowerCase().includes(s)
        );
      }
      return true;
    }),
  [allNotes, search, filterStu]);

  // Count notes per student for the filter bar
  const studentCounts = useMemo(() => {
    const map = {};
    allNotes.forEach(({ profile: p }) => {
      map[p.id] = (map[p.id] || 0) + 1;
    });
    return map;
  }, [allNotes]);

  const totalNotes = allNotes.length;

  return (
    <ScrollView
      className="flex-1 bg-paper"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      {/* Page header */}
      <View className="mb-4 pb-4 border-b border-rule">
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="font-playfair text-ink" style={{ fontSize: 22 }}>
              AI-Generated Notes
            </Text>
            <Text className="text-ink3 font-lato mt-1" style={{ fontSize: 13 }}>
              {totalNotes} note{totalNotes !== 1 ? "s" : ""} across all students
            </Text>
          </View>
          <View className="bg-navylt border border-navymid rounded px-3 py-1.5">
            <Text className="font-mono text-navy" style={{ fontSize: 11 }}>
              {totalNotes} total
            </Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <SearchBox
        placeholder="Search by title, subject, or content…"
        value={search}
        onChangeText={setSearch}
      />

      {/* Student filter chips */}
      {profiles.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3 mb-4"
        >
          <View className="flex-row gap-2">
            {/* "All" chip */}
            <TouchableOpacity
              onPress={() => setFilterStu("")}
              style={{
                paddingHorizontal: 12, paddingVertical: 6,
                borderRadius: 4, borderWidth: 1.5,
                borderColor: filterStu === "" ? "#1a4480" : "#cdc9bc",
                backgroundColor: filterStu === "" ? "#edf2fa" : "#fff",
                flexDirection: "row", alignItems: "center", gap: 5,
              }}
            >
              <Text style={{
                fontSize: 12,
                color: filterStu === "" ? "#1a4480" : "#4a4a52",
                fontWeight: filterStu === "" ? "700" : "400",
              }}>
                All ({totalNotes})
              </Text>
            </TouchableOpacity>

            {/* Per-student chips */}
            {profiles
              .filter(p => (studentCounts[p.id] || 0) > 0)
              .map((p, i) => {
                const isActive = filterStu === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setFilterStu(isActive ? "" : p.id)}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 6,
                      borderRadius: 4, borderWidth: 1.5,
                      borderColor: isActive ? "#1a4480" : "#cdc9bc",
                      backgroundColor: isActive ? "#edf2fa" : "#fff",
                      flexDirection: "row", alignItems: "center", gap: 5,
                    }}
                  >
                    <Text style={{ fontSize: 13 }}>{p.emoji || "👤"}</Text>
                    <Text style={{
                      fontSize: 12,
                      color: isActive ? "#1a4480" : "#4a4a52",
                      fontWeight: isActive ? "700" : "400",
                    }}>
                      {p.name.split(" ")[0]} ({studentCounts[p.id] || 0})
                    </Text>
                  </TouchableOpacity>
                );
              })
            }
          </View>
        </ScrollView>
      )}

      {/* Notes list */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={totalNotes === 0 ? "📝" : "🔍"}
            title={totalNotes === 0 ? "No notes yet" : "No notes match"}
            desc={
              totalNotes === 0
                ? "Notes will appear here once students use the AI tutor to generate them."
                : "Try adjusting your search or clearing the student filter."
            }
          />
        </Card>
      ) : (
        <View className="gap-3">
          {filtered.map(({ note: n, profile: p, pidx }, i) => (
            <NoteCard key={i} note={n} profile={p} pidx={pidx} />
          ))}
        </View>
      )}
      <TouchableOpacity onPress={() => setShowGen(true)} style={{ position: "absolute", right: 18, bottom: 18 }} className="w-14 h-14 rounded-full bg-navy items-center justify-center">
        <Text style={{ fontSize: 22, color: "#fff" }}>✏️</Text>
      </TouchableOpacity>

      <Modal visible={showGen} transparent animationType="slide" onRequestClose={() => setShowGen(false)}>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-2xl p-4">
            <Text className="font-playfair text-ink text-lg">Generate Note</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2"><View className="flex-row gap-2">{profiles.map((p) => <TouchableOpacity key={p.id} onPress={() => setGenStudent(p.id)} className={`px-3 py-1 rounded border ${genStudent === p.id ? "bg-navylt border-navymid" : "bg-white border-rule2"}`}><Text>{p.name.split(" ")[0]}</Text></TouchableOpacity>)}</View></ScrollView>
            <TextInput value={topic} onChangeText={setTopic} placeholder="Topic" className="mt-2 bg-paper border border-rule2 rounded px-3 py-2" />
            <TextInput value={genSubject} onChangeText={setGenSubject} placeholder="Subject" className="mt-2 bg-paper border border-rule2 rounded px-3 py-2" />
            <View className="flex-row flex-wrap gap-2 mt-2">{["Summary","Key Points","Mind Map Text","Exam Focus","Revision Sheet"].map((s) => <TouchableOpacity key={s} onPress={() => setStyle(s)} className={`px-2 py-1 rounded border ${style === s ? "bg-amberlt border-amber" : "bg-white border-rule2"}`}><Text>{s}</Text></TouchableOpacity>)}</View>
            <TouchableOpacity
              className="mt-3 bg-navy rounded px-4 py-2"
              onPress={async () => {
                setLoading(true);
                try {
                  const level = profiles.find((p) => p.id === genStudent)?.label || "school";
                  const res = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      model: "claude-sonnet-4-20250514",
                      max_tokens: 1000,
                      system: `You are an expert note-maker for Indian students. Create ${style} notes on ${topic} for ${level} student. Format: Title, Key Concepts (bullet), Important Formulas/Dates, Memory Tips, 3 Practice Questions. Use clear headings.`,
                      messages: [{ role: "user", content: `${genSubject}: ${topic}` }],
                    }),
                  });
                  const data = await res.json();
                  const content = data.content?.map((b) => b.text || "").join("\n") || "";
                  if (genStudent) {
                    addNoteForStudent(genStudent, {
                      title: topic || "Generated note",
                      subject: genSubject,
                      content,
                      style,
                      date: Date.now(),
                      wordCount: content.split(/\s+/).filter(Boolean).length,
                    });
                  }
                  setShowGen(false);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-latoBold text-center">Generate</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ── Individual Note Card ──────────────────────────────────────
function NoteCard({ note: n, profile: p, pidx }) {
  const [expanded, setExpanded] = useState(false);
  const preview = (n.content || "")
    .replace(/<[^>]+>/g, "")
    .trim();
  const hasMore = preview.length > 160;

  return (
    <Card style={{ borderLeftWidth: 3, borderLeftColor: "#b45309" }}>
      {/* Note header */}
      <CardBody>
        {/* Author row */}
        <View className="flex-row items-center gap-2 mb-2.5">
          <Avatar emoji={p.emoji} bg={AV_BG[pidx % AV_BG.length]} size={26} />
          <Text className="font-latoBold text-ink2" style={{ fontSize: 11.5 }}>
            {p.name}
          </Text>
          <Text className="text-ink4 font-lato" style={{ fontSize: 11 }}>
            · {p.label}
          </Text>
        </View>

        {/* Title */}
        <Text className="font-playfair text-ink" style={{ fontSize: 15, lineHeight: 22 }}>
          {n.title || "Untitled Note"}
        </Text>

        {/* Meta */}
        <View className="flex-row items-center gap-2 mt-1.5 mb-2.5">
          <Badge
            label={n.subject || "General"}
            color="#b45309"
            bg="#fef3e2"
            border="#fcd38d"
          />
          {n.date ? (
            <Mono size={10} color="#b8b8c0">{n.date}</Mono>
          ) : null}
          {n.wordCount ? <Badge label={`${n.wordCount} words`} color="#1a4480" bg="#edf2fa" border="#c8d8f0" /> : null}
        </View>

        {/* Content preview */}
        {preview ? (
          <>
            <Text
              className="font-lato text-ink2"
              style={{ fontSize: 13, lineHeight: 20 }}
              numberOfLines={expanded ? undefined : 3}
            >
              {preview}
            </Text>
            {hasMore && (
              <TouchableOpacity
                onPress={() => setExpanded(prev => !prev)}
                className="mt-1.5"
              >
                <Text className="font-latoBold text-navy" style={{ fontSize: 12 }}>
                  {expanded ? "Show less ↑" : "Read more ↓"}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity className="mt-2" onPress={() => Share.share({ message: `${n.title}\n\n${preview}` })}>
              <Text className="text-navy font-latoBold" style={{ fontSize: 12 }}>📤 Share</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text className="text-ink4 font-lato" style={{ fontSize: 12 }}>
            No content preview available.
          </Text>
        )}
      </CardBody>
    </Card>
  );
}
