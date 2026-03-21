// src/components/StudentDetailModal.js
import React from "react";
import { View, Text, ScrollView, Modal, TouchableOpacity, Alert } from "react-native";
import { useData, AV_BG, AV_CLR } from "../context/DataContext";
import { Avatar, Pill, Badge, OutlineBtn, SectionLabel, Mono } from "./UI";

export default function StudentDetailModal({ studentId, onClose, onEdit }) {
  const { profiles, chats, notes, getChatCount, getNoteCount, getLastActive, getActivity } = useData();

  if (!studentId) return null;
  const p   = profiles.find(x => x.id === studentId);
  if (!p) return null;
  const idx  = profiles.indexOf(p);
  const msgs = chats[studentId] || [];
  const nt   = notes[studentId] || {};
  const q    = getChatCount(studentId);
  const n    = getNoteCount(studentId);
  const act  = getActivity(q);
  const last = getLastActive(studentId);

  return (
    <Modal visible={!!studentId} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40" style={{ justifyContent: "flex-end" }}>
        <View
          className="bg-white rounded-t-2xl"
          style={{ maxHeight: "92%", borderTopWidth: 3, borderTopColor: "#1a4480" }}
        >
          {/* Header */}
          <View className="px-5 pt-5 pb-4 bg-navylt border-b border-rule flex-row items-center gap-3">
            <Avatar emoji={p.emoji} bg={AV_BG[idx % AV_BG.length]} size={52} />
            <View className="flex-1">
              <Text className="font-playfair text-navy2" style={{ fontSize: 20 }}>{p.name}</Text>
              <Text className="text-ink2 mt-0.5 font-lato" style={{ fontSize: 12.5 }}>{p.label}</Text>
              <View className="mt-1.5">
                <Badge label={act.label} color={act.color} bg={act.bg} border={act.border} />
              </View>
            </View>
            <TouchableOpacity onPress={onClose}
              className="w-8 h-8 rounded-full bg-white border border-rule items-center justify-center">
              <Text style={{ fontSize: 14, color: "#8e8e98" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false}>
            {/* Stats grid */}
            <View className="flex-row gap-3 mb-5">
              {[
                { val: q,            label: "Questions",    color: "#1a4480" },
                { val: n,            label: "Notes",        color: "#b45309" },
                { val: msgs.length,  label: "Messages",     color: "#0d6e6e" },
                { val: last || "—",  label: "Last Active",  color: "#5b21b6", small: true },
              ].map(it => (
                <View key={it.label} className="flex-1 bg-paper border border-rule rounded p-3">
                  <Text className="font-playfair" style={{ fontSize: it.small ? 13 : 22, color: it.color }}>
                    {it.val}
                  </Text>
                  <Text className="text-ink3 font-latoBold mt-0.5" style={{ fontSize: 9, letterSpacing: .8, textTransform: "uppercase" }}>
                    {it.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Conversations */}
            <SectionLabel label={`Conversation History (${msgs.length} messages)`} />
            <ScrollView
              className="bg-paper border border-rule rounded p-3 mb-4"
              style={{ maxHeight: 220 }}
              nestedScrollEnabled
            >
              {msgs.length === 0 ? (
                <Text className="text-ink4 text-center font-lato py-4" style={{ fontSize: 12 }}>No messages yet</Text>
              ) : msgs.map((m, i) => (
                <View
                  key={i}
                  className={`rounded px-3 py-2 mb-2 ${m.role === "user" ? "bg-navylt border border-navymid self-end" : "bg-white border border-rule self-start"}`}
                  style={{ maxWidth: "88%" }}
                >
                  <Text className="font-latoBold" style={{ fontSize: 11, color: m.role === "user" ? "#0f2d5c" : "#4a4a52" }}>
                    {m.role === "user" ? p.name : "StudyBuddy AI"}:
                  </Text>
                  <Text className="font-lato mt-0.5" style={{ fontSize: 12.5, lineHeight: 18, color: m.role === "user" ? "#0f2d5c" : "#1c1c1e" }}>
                    {m.content.slice(0, 280)}{m.content.length > 280 ? "…" : ""}
                  </Text>
                  {m.time ? <Mono size={10} color="#b8b8c0">{m.time}</Mono> : null}
                </View>
              ))}
            </ScrollView>

            {/* Notes */}
            <SectionLabel label={`Notes Generated (${n})`} />
            {Object.values(nt).length === 0 ? (
              <Text className="text-ink4 font-lato pb-2" style={{ fontSize: 12 }}>No notes yet.</Text>
            ) : Object.values(nt).map((note, i) => (
              <View key={i} className="bg-paper border border-rule rounded p-3 mb-2"
                style={{ borderLeftWidth: 3, borderLeftColor: "#b45309" }}>
                <Text className="font-playfair text-ink" style={{ fontSize: 13.5 }}>
                  {note.title || "Untitled"}
                </Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <Badge label={note.subject || "General"} color="#b45309" bg="#fef3e2" border="#fcd38d" />
                  <Mono size={10} color="#b8b8c0">{note.date || ""}</Mono>
                </View>
                <Text className="text-ink2 font-lato mt-2" style={{ fontSize: 12, lineHeight: 18 }} numberOfLines={2}>
                  {(note.content || "").replace(/<[^>]+>/g, "")}
                </Text>
              </View>
            ))}

            {/* Actions */}
            <View className="flex-row gap-3 mt-4 mb-6">
              <OutlineBtn label="✏️  Edit Student" onPress={() => { onClose(); onEdit(studentId); }} />
              <OutlineBtn label="Close" onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
