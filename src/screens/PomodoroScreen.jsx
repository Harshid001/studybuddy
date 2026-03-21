import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useData } from "../context/DataContext";
import { Card, CardBody, CardHead, CardTitle, EmptyState, PrimaryBtn, ProgressRing } from "../components/UI";

const MODES = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export default function PomodoroScreen() {
  const { profiles, pomodoroLog, addPomodoroSession } = useData();
  const [studentId, setStudentId] = useState(profiles[0]?.id || "");
  const [subject, setSubject] = useState("General");
  const [mode, setMode] = useState("focus");
  const [duration, setDuration] = useState(MODES.focus);
  const [left, setLeft] = useState(MODES.focus);
  const [running, setRunning] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insight, setInsight] = useState("");
  const [timerState, setTimerState] = useState("IDLE");
  const timerRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    setTimerState("RUNNING");
    timerRef.current = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          clearInterval(timerRef.current);
          if (studentId) addPomodoroSession({ studentId, subject, duration, date: Date.now(), type: mode === "focus" ? "focus" : "break" });
          setTimerState(mode === "focus" ? "BREAK" : "IDLE");
          return duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running, duration, studentId, subject, mode, addPomodoroSession]);

  const todaysFocus = useMemo(() => {
    const today = new Date().toDateString();
    return pomodoroLog
      .filter((s) => s.studentId === studentId && s.type === "focus" && new Date(s.date).toDateString() === today)
      .reduce((sum, s) => sum + s.duration, 0);
  }, [pomodoroLog, studentId]);

  const streak = useMemo(() => {
    const days = new Set(
      pomodoroLog
        .filter((s) => s.studentId === studentId && s.type === "focus")
        .map((s) => new Date(s.date).toDateString())
    );
    let n = 0;
    const d = new Date();
    while (days.has(d.toDateString())) {
      n += 1;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [pomodoroLog, studentId]);

  const weekHeat = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const c = pomodoroLog.filter((s) => s.studentId === studentId && new Date(s.date).toDateString() === key).length;
      out.push(c);
    }
    return out;
  }, [pomodoroLog, studentId]);

  const askInsight = async () => {
    setInsightLoading(true);
    try {
      const sessions = pomodoroLog.filter((s) => s.studentId === studentId).slice(0, 40);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a productivity coach.",
          messages: [{ role: "user", content: `Based on these study sessions, give 3 personalized productivity tips: ${JSON.stringify(sessions)}` }],
        }),
      });
      const data = await res.json();
      setInsight(data.content?.map((b) => b.text || "").join("\n") || "No insights generated.");
    } catch (e) {
      setInsight("Could not generate insights right now.");
    } finally {
      setInsightLoading(false);
    }
  };

  const pct = ((duration - left) / duration) * 100;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card className="mb-4">
        <CardHead><CardTitle>Smart Pomodoro</CardTitle></CardHead>
        <CardBody className="items-center">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full mb-2">
            <View className="flex-row gap-2">
              {profiles.map((p) => (
                <TouchableOpacity key={p.id} onPress={() => setStudentId(p.id)} className={`px-3 py-1 rounded border ${studentId === p.id ? "bg-navylt border-navymid" : "bg-white border-rule2"}`}>
                  <Text className="font-lato">{p.name.split(" ")[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <ProgressRing progress={pct} label={`${mm}:${ss}`} />
          <Text className="font-lato mt-2 text-ink3">State: {timerState}</Text>
          <View className="flex-row gap-2 mt-3">
            {Object.keys(MODES).map((m) => (
              <TouchableOpacity key={m} onPress={() => { setMode(m); setDuration(MODES[m]); setLeft(MODES[m]); }} className={`px-3 py-1.5 rounded border ${mode === m ? "bg-navylt border-navymid" : "bg-white border-rule2"}`}>
                <Text className={`${mode === m ? "text-navy" : "text-ink2"} font-lato`}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput value={String(Math.round(duration / 60))} onChangeText={(v) => { const s = Math.max(1, Number(v || 1)) * 60; setDuration(s); setLeft(s); }} keyboardType="number-pad" className="mt-3 w-24 text-center bg-white border border-rule2 rounded px-2 py-1.5" />
          <TextInput value={subject} onChangeText={setSubject} placeholder="Subject" className="mt-2 w-full bg-white border border-rule2 rounded px-3 py-2" />
          <View className="flex-row gap-2 mt-3">
            <PrimaryBtn label={running ? "Pause" : "Start"} onPress={() => { setRunning((r) => !r); if (running) setTimerState("PAUSED"); }} />
            <TouchableOpacity onPress={() => { setRunning(false); setLeft(duration); setTimerState("IDLE"); }} className="px-4 py-2 rounded border border-rule2 bg-white"><Text>Reset</Text></TouchableOpacity>
          </View>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHead><CardTitle>Stats</CardTitle></CardHead>
        <CardBody>
          <Text className="font-lato">Today focus: {Math.round(todaysFocus / 60)} mins</Text>
          <Text className="font-lato mt-1">Streak: {streak} day(s)</Text>
          <View className="flex-row gap-1 mt-2">
            {weekHeat.map((c, i) => (
              <View key={i} style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: c >= 4 ? "#1a4480" : c >= 2 ? "#5b21b6" : c >= 1 ? "#b45309" : "#e4e1d8" }} />
            ))}
          </View>
        </CardBody>
      </Card>

      <Card>
        <CardHead><CardTitle>AI Insight</CardTitle></CardHead>
        <CardBody>
          <PrimaryBtn label="Get AI Insight" onPress={askInsight} loading={insightLoading} />
          {insightLoading ? <ActivityIndicator className="mt-2" color="#1a4480" /> : null}
          {insight ? <Text className="font-lato text-ink mt-3">{insight}</Text> : <EmptyState icon="💡" title="No insight yet" desc="Generate personalized productivity tips from session history." />}
        </CardBody>
      </Card>
    </ScrollView>
  );
}
