import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useData } from "../context/DataContext";
import { Card, CardBody, CardHead, CardTitle, EmptyState, PrimaryBtn } from "../../components/UI";

const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","History","Geography","English","Hindi","Computer","Economics"];
const COMPLEXITY = ["Quick (1h)", "Medium (3h)", "Big (6h+)"];

function daysUntil(dateText) {
  const [d, m, y] = dateText.split("/").map(Number);
  const due = new Date(y, (m || 1) - 1, d || 1);
  return Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function AssignmentScreen() {
  const { profiles, assignments, addAssignment, updateAssignment } = useData();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [dueDate, setDueDate] = useState("");
  const [complexity, setComplexity] = useState(COMPLEXITY[0]);
  const [studentId, setStudentId] = useState(profiles[0]?.id || "");
  const [loading, setLoading] = useState(false);

  const breakdown = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a helpful study planner.",
          messages: [{ role: "user", content: `Break down this assignment: '${title}' for ${subject}. Create 5-7 specific actionable sub-tasks with time estimates. Format: numbered list. Each item: [Task]: [time estimate]` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("\n") || "";
      const tasks = text.split("\n").filter(Boolean).slice(0, 7).map((t, i) => ({ id: `${i}-${Date.now()}`, text: t, done: false }));
      addAssignment({ title, subject, dueDate, complexity, studentId, tasks, completed: false, createdAt: Date.now() });
      setTitle("");
      setDueDate("");
    } finally {
      setLoading(false);
    }
  };

  const sorted = useMemo(() => [...assignments].sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate)), [assignments]);
  const pending = sorted.filter((a) => !a.completed);
  const completed = sorted.filter((a) => a.completed);
  const dueSoonCount = pending.filter((a) => daysUntil(a.dueDate) <= 3).length;

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card className="mb-4">
        <CardHead><CardTitle>Assignment Planner</CardTitle></CardHead>
        <CardBody>
          <View className="mb-3 p-2 rounded border border-rule2 bg-white flex-row justify-between">
            <Text className="font-lato">Pending: {pending.length}</Text>
            <Text className="font-lato">Due Soon: {dueSoonCount}</Text>
            <Text className="font-lato">Completed: {completed.length}</Text>
          </View>
          <TextInput value={title} onChangeText={setTitle} placeholder="Assignment title" className="bg-white border border-rule2 rounded px-3 py-2" />
          <TextInput value={dueDate} onChangeText={setDueDate} placeholder="DD/MM/YYYY" className="mt-2 bg-white border border-rule2 rounded px-3 py-2" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2"><View className="flex-row gap-2">{SUBJECTS.map((s) => <TouchableOpacity key={s} onPress={() => setSubject(s)} className={`px-3 py-1 rounded border ${subject === s ? "bg-navylt border-navymid" : "bg-white border-rule2"}`}><Text>{s}</Text></TouchableOpacity>)}</View></ScrollView>
          <View className="flex-row gap-2 mt-2">{COMPLEXITY.map((c) => <TouchableOpacity key={c} onPress={() => setComplexity(c)} className={`px-3 py-1 rounded border ${complexity === c ? "bg-amberlt border-amber" : "bg-white border-rule2"}`}><Text>{c}</Text></TouchableOpacity>)}</View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2"><View className="flex-row gap-2">{profiles.map((p) => <TouchableOpacity key={p.id} onPress={() => setStudentId(p.id)} className={`px-3 py-1 rounded border ${studentId === p.id ? "bg-teallt border-teal" : "bg-white border-rule2"}`}><Text>{p.name.split(" ")[0]}</Text></TouchableOpacity>)}</View></ScrollView>
          <View className="mt-3"><PrimaryBtn label="AI Break Down" onPress={breakdown} loading={loading} full /></View>
          {loading ? <ActivityIndicator className="mt-2" color="#1a4480" /> : null}
        </CardBody>
      </Card>

      <Card>
        <CardHead><CardTitle>Assignments</CardTitle></CardHead>
        <CardBody>
          {pending.length === 0 ? <EmptyState icon="📋" title="No assignments" desc="Create your first assignment with AI breakdown." /> : pending.map((a) => {
            const left = daysUntil(a.dueDate);
            const done = (a.tasks || []).filter((t) => t.done).length;
            return (
              <View key={a.id} className="mb-3 p-3 rounded border border-rule2 bg-white">
                <Text className="font-latoBold text-ink">{a.title}</Text>
                <Text className="text-ink3 font-lato">{a.subject} · Due {a.dueDate} · {left <= 1 ? "Due Today/Tomorrow" : left <= 3 ? "Due Soon" : "On Track"}</Text>
                <View className="mt-2 gap-1">
                  {(a.tasks || []).map((t) => (
                    <TouchableOpacity key={t.id} onPress={() => updateAssignment(a.id, { tasks: a.tasks.map((x) => x.id === t.id ? { ...x, done: !x.done } : x) })}>
                      <Text className="font-lato">{t.done ? "✅" : "⬜"} {t.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text className="mt-1 text-ink2 font-lato">{done}/{(a.tasks || []).length} completed</Text>
                <View className="mt-2 h-2 bg-rule rounded">
                  <View style={{ width: `${(done / Math.max(1, (a.tasks || []).length)) * 100}%`, height: "100%", backgroundColor: "#1a4480", borderRadius: 4 }} />
                </View>
                <TouchableOpacity className="mt-2" onPress={() => updateAssignment(a.id, { completed: true })}><Text className="text-navy font-latoBold">Complete</Text></TouchableOpacity>
              </View>
            );
          })}
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHead><CardTitle>Archived</CardTitle></CardHead>
        <CardBody>
          {completed.length === 0 ? <EmptyState icon="✅" title="No completed assignments" desc="Completed tasks appear here." /> : completed.map((a) => (
            <View key={a.id} className="py-2 border-b border-rule">
              <Text className="font-latoBold text-ink">{a.title}</Text>
              <Text className="font-lato text-ink3">{a.subject} · {a.dueDate}</Text>
            </View>
          ))}
        </CardBody>
      </Card>
    </ScrollView>
  );
}
