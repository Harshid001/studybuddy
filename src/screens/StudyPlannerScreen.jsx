import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useData } from "../context/DataContext";
import { Card, CardBody, CardHead, CardTitle, EmptyState, PrimaryBtn, OutlineBtn } from "../components/UI";

const HOURS = ["1h", "2h", "3h", "4h+"];

function parseDays(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, idx) => ({ id: `${idx}-${line.slice(0, 8)}`, text: line, done: false }));
}

export default function StudyPlannerScreen() {
  const { profiles, studyPlans, addStudyPlan, deleteStudyPlan } = useData();
  const [studentId, setStudentId] = useState(profiles[0]?.id || "");
  const [syllabus, setSyllabus] = useState("");
  const [days, setDays] = useState("14");
  const [hours, setHours] = useState("2h");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState([]);
  const [error, setError] = useState("");

  const plans = useMemo(() => studyPlans[studentId] || [], [studyPlans, studentId]);

  const generate = async () => {
    if (!syllabus.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:
            "You are an expert academic coach. Create a detailed, day-by-day study roadmap. Format response as: Day 1: [topic] - [duration] - [key points]. Include revision days. Be specific and motivating.",
          messages: [{ role: "user", content: `Syllabus: ${syllabus}\nDays: ${days}\nDaily hours: ${hours}` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("\n") || "";
      setGenerated(parseDays(text));
    } catch (e) {
      setError("Could not generate study plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card className="mb-4">
        <CardHead><CardTitle>AI Study Planner</CardTitle></CardHead>
        <CardBody>
          <Text className="text-ink3 font-lato mb-2" style={{ fontSize: 12 }}>Student</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {profiles.map((p) => (
                <TouchableOpacity key={p.id} onPress={() => setStudentId(p.id)} className={`px-3 py-1.5 rounded border ${studentId === p.id ? "bg-navylt border-navymid" : "bg-white border-rule2"}`}>
                  <Text className={`font-lato ${studentId === p.id ? "text-navy" : "text-ink2"}`}>{p.name.split(" ")[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <TextInput value={syllabus} onChangeText={setSyllabus} multiline placeholder="Paste syllabus or topics" className="mt-3 bg-white border border-rule2 rounded px-3 py-2 text-ink font-lato" style={{ minHeight: 90 }} />
          <View className="flex-row gap-2 mt-3">
            <TextInput value={days} onChangeText={setDays} keyboardType="number-pad" placeholder="Days till exam" className="flex-1 bg-white border border-rule2 rounded px-3 py-2 text-ink font-lato" />
          </View>
          <View className="flex-row gap-2 mt-3">
            {HOURS.map((h) => (
              <TouchableOpacity key={h} onPress={() => setHours(h)} className={`px-3 py-1.5 rounded border ${hours === h ? "bg-navylt border-navymid" : "bg-white border-rule2"}`}>
                <Text className={`${hours === h ? "text-navy" : "text-ink2"} font-lato`}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="mt-3"><PrimaryBtn label="Generate Plan" onPress={generate} loading={loading} full /></View>
          {error ? <Text className="text-danger mt-2 font-lato">{error}</Text> : null}
        </CardBody>
      </Card>

      {loading ? <ActivityIndicator color="#1a4480" /> : null}
      {!loading && generated.length > 0 && (
        <Card className="mb-4">
          <CardHead><CardTitle>Generated Plan</CardTitle></CardHead>
          <CardBody className="gap-2">
            {generated.map((d) => (
              <TouchableOpacity key={d.id} onPress={() => setGenerated((prev) => prev.map((x) => x.id === d.id ? { ...x, done: !x.done } : x))} className={`p-3 rounded border ${d.done ? "bg-successlt border-green-200" : "bg-white border-rule2"}`}>
                <Text className="font-lato text-ink">{d.done ? "✅ " : ""}{d.text}</Text>
              </TouchableOpacity>
            ))}
            <View className="mt-2 flex-row gap-2">
              <PrimaryBtn label="Save Plan" onPress={() => studentId && addStudyPlan(studentId, { days: generated })} />
              <OutlineBtn label="Clear" onPress={() => setGenerated([])} />
            </View>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHead><CardTitle>Saved Plans</CardTitle></CardHead>
        <CardBody>
          {!studentId || plans.length === 0 ? (
            <EmptyState icon="🗓️" title="No saved plans" desc="Generate and save a study plan for this student." />
          ) : plans.map((p) => (
            <View key={p.id} className="mb-3 p-3 bg-white border border-rule2 rounded">
              <Text className="font-latoBold text-ink mb-2">Plan with {p.days?.length || 0} days</Text>
              <TouchableOpacity onPress={() => deleteStudyPlan(studentId, p.id)}><Text className="text-danger font-lato">Delete</Text></TouchableOpacity>
            </View>
          ))}
        </CardBody>
      </Card>
    </ScrollView>
  );
}
