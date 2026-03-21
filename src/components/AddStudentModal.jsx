// src/components/AddStudentModal.js
import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Modal, KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { useData, EMOJIS, LEVEL_LABELS } from "./context/DataContext";
import { PrimaryBtn, OutlineBtn } from "./UI";

const LEVELS = [
  { key: "primary",     label: "Primary (Std 1–5)" },
  { key: "middle",      label: "Middle School (Std 6–8)" },
  { key: "secondary",   label: "Secondary (Std 9–10)" },
  { key: "higher",      label: "Higher Secondary (Std 11–12)" },
  { key: "engineering", label: "Engineering / College" },
];

export default function AddStudentModal({ visible, onClose, editStudentId = null }) {
  const { addStudent, updateStudent, profiles } = useData();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [levelKey,  setLevelKey]  = useState("");
  const [std,       setStd]       = useState("");
  const [notesText, setNotesText] = useState("");
  const [emoji,     setEmoji]     = useState(EMOJIS[0]);
  const [saving,    setSaving]    = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editStudentId && visible) {
      const p = profiles.find(x => x.id === editStudentId);
      if (p) {
        const parts = p.name.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
        setLevelKey(p.levelKey || "");
        setStd(p.std || "");
        setNotesText(p.notes || "");
        setEmoji(p.emoji || EMOJIS[0]);
      }
    } else if (!editStudentId && visible) {
      setFirstName(""); setLastName(""); setLevelKey("");
      setStd(""); setNotesText(""); setEmoji(EMOJIS[0]);
    }
  }, [editStudentId, visible]);

  const handleSave = async () => {
    if (!firstName.trim()) { Alert.alert("Required", "First name is required."); return; }
    if (!levelKey)          { Alert.alert("Required", "Please select a level."); return; }
    setSaving(true);
    const name  = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    const label = LEVEL_LABELS[levelKey] + (std ? ` · ${std}` : "");
    const data  = { name, label, emoji, levelKey, std, notes: notesText };
    if (editStudentId) updateStudent(editStudentId, data);
    else               addStudent(data);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1 bg-black/50 items-center justify-center px-4"
        >
          <TouchableOpacity activeOpacity={1} className="w-full max-w-lg">
            <View
              className="bg-white rounded-lg overflow-hidden"
              style={{ borderTopWidth: 4, borderTopColor: "#1a4480", shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 }}
            >
              {/* Header */}
              <View className="px-6 pt-6 pb-2">
                <Text className="font-playfair text-navy2" style={{ fontSize: 21 }}>
                  {editStudentId ? "Edit Student" : "Enrol New Student"}
                </Text>
                <Text className="text-ink3 mt-1 font-lato" style={{ fontSize: 13 }}>
                  {editStudentId ? "Update the student's details below." : "Fill in the details to add a student."}
                </Text>
              </View>

              <ScrollView className="px-6 pb-6" style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
                {/* Name row */}
                <View className="flex-row gap-3 mt-4">
                  <View className="flex-1">
                    <Text className="text-ink2 font-latoBold mb-1.5" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                      First Name *
                    </Text>
                    <TextInput
                      value={firstName} onChangeText={setFirstName}
                      placeholder="e.g. Aarav" placeholderTextColor="#b8b8c0"
                      className="bg-paper border border-rule2 rounded px-3 py-2.5 text-ink font-lato"
                      style={{ fontSize: 13.5 }}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-ink2 font-latoBold mb-1.5" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                      Last Name
                    </Text>
                    <TextInput
                      value={lastName} onChangeText={setLastName}
                      placeholder="e.g. Patel" placeholderTextColor="#b8b8c0"
                      className="bg-paper border border-rule2 rounded px-3 py-2.5 text-ink font-lato"
                      style={{ fontSize: 13.5 }}
                    />
                  </View>
                </View>

                {/* Level */}
                <View className="mt-4">
                  <Text className="text-ink2 font-latoBold mb-1.5" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                    Class / Level *
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {LEVELS.map(lv => (
                      <TouchableOpacity
                        key={lv.key}
                        onPress={() => setLevelKey(lv.key)}
                        style={{
                          paddingHorizontal: 12, paddingVertical: 7,
                          borderRadius: 4, borderWidth: 1.5,
                          borderColor: levelKey === lv.key ? "#1a4480" : "#cdc9bc",
                          backgroundColor: levelKey === lv.key ? "#edf2fa" : "#f8f7f4",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: levelKey === lv.key ? "#1a4480" : "#4a4a52", fontWeight: levelKey === lv.key ? "700" : "400" }}>
                          {lv.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Standard / Year */}
                {levelKey ? (
                  <View className="mt-4">
                    <Text className="text-ink2 font-latoBold mb-1.5" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                      Standard / Year
                    </Text>
                    <TextInput
                      value={std} onChangeText={setStd}
                      placeholder="e.g. 8, 10, 2nd Year…" placeholderTextColor="#b8b8c0"
                      className="bg-paper border border-rule2 rounded px-3 py-2.5 text-ink font-lato"
                      style={{ fontSize: 13.5 }}
                    />
                  </View>
                ) : null}

                {/* Avatar picker */}
                <View className="mt-4">
                  <Text className="text-ink2 font-latoBold mb-1.5" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                    Choose Avatar
                  </Text>
                  <View className="flex-row flex-wrap gap-1.5 bg-paper2 rounded p-2.5 border border-rule2">
                    {EMOJIS.map(e => (
                      <TouchableOpacity
                        key={e}
                        onPress={() => setEmoji(e)}
                        style={{
                          width: 38, height: 38, borderRadius: 4, borderWidth: 2,
                          borderColor: emoji === e ? "#1a4480" : "transparent",
                          backgroundColor: emoji === e ? "#edf2fa" : "transparent",
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>{e}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Notes */}
                <View className="mt-4">
                  <Text className="text-ink2 font-latoBold mb-1.5" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                    Notes (optional)
                  </Text>
                  <TextInput
                    value={notesText} onChangeText={setNotesText}
                    placeholder="Any notes about this student…" placeholderTextColor="#b8b8c0"
                    multiline numberOfLines={3}
                    className="bg-paper border border-rule2 rounded px-3 py-2.5 text-ink font-lato"
                    style={{ fontSize: 13, minHeight: 70, textAlignVertical: "top" }}
                  />
                </View>

                {/* Buttons */}
                <View className="flex-row gap-3 mt-5">
                  <OutlineBtn label="Cancel" onPress={onClose} />
                  <View className="flex-1">
                    <PrimaryBtn label="Save Student" onPress={handleSave} loading={saving} full />
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
