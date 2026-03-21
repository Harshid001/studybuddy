// src/screens/AITutorScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from "react-native";
import { useData } from "../context/DataContext";
import { Card, CardHead, CardTitle, CardBody, Badge, Pill } from "../components/UI";

const QUICK_PROMPTS = [
  { icon: "🔢", text: "Explain the Pythagorean theorem with an example" },
  { icon: "⚗️", text: "What is photosynthesis? Explain step by step" },
  { icon: "📜", text: "Summarise the causes of World War I" },
  { icon: "⚡", text: "Explain Ohm's Law with a practical example" },
  { icon: "🧬", text: "How does DNA replication work?" },
  { icon: "✍️", text: "How to write a strong essay introduction?" },
];

const SUBJECTS = [
  "Mathematics","Physics","Chemistry","Biology",
  "History","Geography","English","Hindi","Computer Sc.","Economics",
];

export default function AITutorScreen() {
  const { profiles, addChatMessages, addNoteForStudent } = useData();
  const [messages,      setMessages]      = useState([
    { role: "assistant", content: "Hello! 👋 I'm your AI tutor powered by Claude. I can help with any subject — Mathematics, Science, History, English, and more. Select a student and ask me anything!" }
  ]);
  const [input,         setInput]         = useState("");
  const [sending,       setSending]       = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [history,       setHistory]       = useState([]);
  const [sessionLog,    setSessionLog]    = useState([]);
  const [showPrompts,   setShowPrompts]   = useState(true);
  const [mode, setMode] = useState("Simple");
  const [format, setFormat] = useState("Text");
  const [inputFocused, setInputFocused] = useState(false);
  const promptScale = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    const mk = (v, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(300),
        ])
      );
    const a = mk(dot1, 0);
    const b = mk(dot2, 150);
    const c = mk(dot3, 300);
    a.start(); b.start(); c.start();
    return () => { a.stop(); b.stop(); c.stop(); dot1.stopAnimation(); dot2.stopAnimation(); dot3.stopAnimation(); };
  }, [dot1, dot2, dot3]);

  const student = profiles.find(p => p.id === selectedStudent) || null;

  const sendMessage = async (forcedText = "") => {
    const q = (forcedText || input).trim();
    if (!q || sending) return;

    const userMsg = { role: "user", content: q };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setShowPrompts(false);

    const newHistory = [...history, { role: "user", content: q }].slice(-20);
    setHistory(newHistory);

    const system = `You are StudyBuddy, a friendly, knowledgeable AI tutor for Indian school and college students. Make learning clear and engaging.
- Explain concepts with examples and step-by-step solutions where needed
- Use simple language appropriate for the student's level
- Be encouraging and supportive
- For maths/science, show working clearly
Always explain with: 1) Simple definition 2) Real-world example 3) Common mistake to avoid. Use emojis to make it engaging.
Explanation mode: ${mode}. Output format: ${format}.
${student ? `\nYou are helping ${student.name}, enrolled in ${student.label}. Tailor responses to their level.` : ""}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system,
          messages: newHistory,
        }),
      });
      const data  = await res.json();
      const reply = data.content?.map(b => b.text || "").join("\n") || "Sorry, I could not generate a response.";
      const aiMsg = { role: "assistant", content: reply };
      setMessages(prev => [...prev, aiMsg]);
      setHistory(prev => [...prev, { role: "assistant", content: reply }]);
      setSessionLog(prev => [{ q: q.slice(0, 55), t: new Date().toLocaleTimeString("en-IN") }, ...prev]);
      if (student) addChatMessages(student.id, q, reply);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Could not connect to the AI. Please check your internet and try again." }]);
    }
    setSending(false);
  };

  const explainDifferently = async () => {
    sendMessage("Explain the same concept in a completely different way");
  };

  const applyPrompt = (text) => { setInput(text); };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-paper"
      keyboardVerticalOffset={90}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 16 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-rule">
          <View>
            <Text className="font-playfair text-ink" style={{ fontSize: 22 }}>AI Tutor</Text>
            <Text className="text-ink3 font-lato mt-0.5" style={{ fontSize: 13 }}>Powered by Claude AI</Text>
          </View>
          <View className="bg-navylt border border-navymid rounded px-3 py-1">
            <Text className="font-mono text-navy" style={{ fontSize: 10 }}>Claude Sonnet 4</Text>
          </View>
        </View>

        {/* Student selector */}
        <Card className="mb-4">
          <CardBody>
            <Text className="text-ink2 font-latoBold mb-2" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
              Asking as student:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setSelectedStudent("")}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, borderWidth: 1.5,
                    borderColor: selectedStudent === "" ? "#1a4480" : "#cdc9bc",
                    backgroundColor: selectedStudent === "" ? "#edf2fa" : "#fff",
                  }}
                >
                  <Text style={{ fontSize: 12, color: selectedStudent === "" ? "#1a4480" : "#4a4a52", fontWeight: selectedStudent === "" ? "700" : "400" }}>
                    General
                  </Text>
                </TouchableOpacity>
                {profiles.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setSelectedStudent(p.id)}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, borderWidth: 1.5,
                      borderColor: selectedStudent === p.id ? "#1a4480" : "#cdc9bc",
                      backgroundColor: selectedStudent === p.id ? "#edf2fa" : "#fff",
                      flexDirection: "row", alignItems: "center", gap: 4,
                    }}
                  >
                    <Text style={{ fontSize: 13 }}>{p.emoji || "👤"}</Text>
                    <Text style={{ fontSize: 12, color: selectedStudent === p.id ? "#1a4480" : "#4a4a52", fontWeight: selectedStudent === p.id ? "700" : "400" }}>
                      {p.name.split(" ")[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </CardBody>
        </Card>

        <Card className="mb-4">
          <CardBody>
            <Text className="text-ink3 font-lato mb-2">Explanation Mode</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {["Simple", "Detailed", "With Example", "Step-by-Step", "ELI5"].map((m) => (
                <TouchableOpacity key={m} onPress={() => setMode(m)} className={`px-3 py-1 rounded border ${mode === m ? "bg-navylt border-navymid" : "bg-white border-rule2"}`}>
                  <Text>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-ink3 font-lato mb-2">Format</Text>
            <View className="flex-row gap-2">
              {["Text", "Bullet Points", "Numbered Steps"].map((f) => (
                <TouchableOpacity key={f} onPress={() => setFormat(f)} className={`px-3 py-1 rounded border ${format === f ? "bg-teallt border-teal" : "bg-white border-rule2"}`}>
                  <Text>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardBody>
        </Card>

        {/* Chat messages */}
        <Card className="mb-4">
          <CardHead>
            <CardTitle>💬 Conversation</CardTitle>
            {sending && <ActivityIndicator size="small" color="#1a4480" />}
          </CardHead>
          <CardBody>
            <ScrollView
              ref={scrollRef}
              style={{ maxHeight: 340 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {messages.map((m, i) => (
                <View
                  key={i}
                  className="mb-2"
                  style={{ alignItems: m.role === "user" ? "flex-end" : "flex-start" }}
                >
                  <Text
                    className="font-latoBold mb-1"
                    style={{ fontSize: 9, letterSpacing: .8, textTransform: "uppercase", color: "#8e8e98" }}
                  >
                    {m.role === "user" ? (student ? student.name : "You") : "StudyBuddy AI"}
                  </Text>
                  <View
                    className="rounded px-3 py-2.5"
                    style={{
                      maxWidth: "88%",
                      backgroundColor: m.role === "user" ? "#1a4480" : "#fff",
                      borderWidth: m.role === "user" ? 0 : 1,
                      borderColor: "#e4e1d8",
                      borderLeftWidth: m.role === "user" ? 0 : 3,
                      borderLeftColor: m.role === "user" ? "transparent" : "#0d6e6e",
                      shadowColor: m.role === "user" ? "transparent" : "#1c1c1e",
                      shadowOpacity: m.role === "user" ? 0 : 0.08,
                      shadowRadius: m.role === "user" ? 0 : 6,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: m.role === "user" ? 0 : 2,
                    }}
                  >
                    {m.role === "user" ? (
                      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "40%", backgroundColor: "#0f2d5c", borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }} />
                    ) : null}
                    <Text
                      className="font-lato"
                      style={{ fontSize: 13, lineHeight: 19, color: m.role === "user" ? "#fff" : "#1c1c1e", zIndex: 1 }}
                    >
                      {m.content}
                    </Text>
                    {m.role !== "user" ? (
                      <View className="mt-2 flex-row gap-2">
                        <TouchableOpacity onPress={explainDifferently}><Text className="text-navy font-latoBold" style={{ fontSize: 11 }}>🔁 Explain Differently</Text></TouchableOpacity>
                        {student ? (
                          <TouchableOpacity
                            onPress={() =>
                              addNoteForStudent(student.id, {
                                title: m.content.split(" ").slice(0, 6).join(" "),
                                subject: "AI Tutor",
                                content: m.content,
                                date: Date.now(),
                                wordCount: m.content.split(/\s+/).filter(Boolean).length,
                              })
                            }
                          >
                            <Text className="text-amber font-latoBold" style={{ fontSize: 11 }}>📌 Save as Note</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
              {sending && (
                <View style={{ alignItems: "flex-start" }} className="mb-2">
                  <Text className="font-latoBold mb-1" style={{ fontSize: 9, letterSpacing: .8, textTransform: "uppercase", color: "#8e8e98" }}>StudyBuddy AI</Text>
                  <View className="bg-white border border-rule rounded px-3 py-2.5 flex-row gap-1 items-center">
                    <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#b8b8c0", opacity: dot1 }} />
                    <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#b8b8c0", opacity: dot2 }} />
                    <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#b8b8c0", opacity: dot3 }} />
                  </View>
                </View>
              )}
            </ScrollView>
          </CardBody>
        </Card>

        {/* Quick prompts */}
        {showPrompts && (
          <Card className="mb-4">
            <CardHead><CardTitle>📌 Quick Prompts</CardTitle></CardHead>
            <CardBody className="gap-2">
              {QUICK_PROMPTS.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => applyPrompt(p.text)}
                  onPressIn={() => Animated.spring(promptScale, { toValue: 0.97, useNativeDriver: true, speed: 35, bounciness: 0 }).start()}
                  onPressOut={() => Animated.spring(promptScale, { toValue: 1, useNativeDriver: true, speed: 35, bounciness: 0 }).start()}
                  className="flex-row items-center gap-2 bg-paper border border-rule rounded px-3 py-2.5"
                  style={{ transform: [{ scale: promptScale }] }}
                >
                  <Text style={{ fontSize: 15 }}>{p.icon}</Text>
                  <Text className="text-ink2 font-lato flex-1" style={{ fontSize: 12.5 }}>{p.text}</Text>
                </TouchableOpacity>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Subjects */}
        <Card className="mb-4">
          <CardHead><CardTitle>📚 Subjects</CardTitle></CardHead>
          <CardBody>
            <View className="flex-row flex-wrap gap-2">
              {SUBJECTS.map(s => (
                <TouchableOpacity key={s} onPress={() => applyPrompt(`Help me understand: ${s}`)}>
                  <View className="bg-navylt border border-navymid rounded px-3 py-1.5">
                    <Text className="text-navy2 font-lato" style={{ fontSize: 12 }}>{s}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </CardBody>
        </Card>

        {/* Session log */}
        {sessionLog.length > 0 && (
          <Card>
            <CardHead><CardTitle>📋 Session History</CardTitle></CardHead>
            <CardBody>
              {sessionLog.slice(0, 8).map((l, i) => (
                <View key={i} className="flex-row justify-between py-2 border-b border-rule"
                  style={{ borderBottomWidth: i < sessionLog.length - 1 ? 1 : 0 }}>
                  <Text className="text-ink2 font-lato flex-1 mr-2" style={{ fontSize: 12 }}>
                    💬 {l.q}{l.q.length >= 55 ? "…" : ""}
                  </Text>
                  <Text className="font-mono text-ink4" style={{ fontSize: 10 }}>{l.t}</Text>
                </View>
              ))}
            </CardBody>
          </Card>
        )}
      </ScrollView>

      {/* Input bar */}
      <View
        className="bg-white border-t border-rule px-4 py-3 flex-row items-end gap-3"
        style={{ paddingBottom: Platform.OS === "ios" ? 20 : 12 }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type your question here…"
          placeholderTextColor="#b8b8c0"
          multiline
          className="flex-1 bg-paper border border-rule2 rounded px-3 py-2.5 text-ink font-lato"
          style={{
            fontSize: 13,
            maxHeight: 100,
            borderColor: inputFocused ? "#1a4480" : "#cdc9bc",
            shadowColor: "#1a4480",
            shadowOpacity: inputFocused ? 0.3 : 0,
            shadowRadius: inputFocused ? 8 : 0,
          }}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!input.trim() || sending}
          className="bg-navy rounded items-center justify-center"
          style={{ width: 42, height: 42, opacity: !input.trim() || sending ? 0.5 : 1 }}
        >
          {sending
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={{ color: "#fff", fontSize: 16 }}>➤</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
