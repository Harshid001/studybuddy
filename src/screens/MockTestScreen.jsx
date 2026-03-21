import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useData } from "../context/DataContext";
import { Card, CardBody, CardHead, CardTitle, EmptyState, PrimaryBtn } from "../../components/UI";

const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","History","Geography","English","Hindi","Computer","Economics"];
const DIFF = ["Easy", "Medium", "Hard", "Mixed"];
const COUNTS = [5, 10, 15, 20];
const Q_TYPES = ["MCQ", "True/False", "Fill in the Blank", "Short Answer"];

export default function MockTestScreen() {
  const { profiles, testResults, addTestResult } = useData();
  const [studentId, setStudentId] = useState(profiles[0]?.id || "");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);
  const [qType, setQType] = useState("MCQ");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const level = profiles.find((p) => p.id === studentId)?.label || "school";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "Return only valid JSON.",
          messages: [{ role: "user", content: `Generate ${count} ${qType} questions on ${subject} at ${difficulty} level for a ${level} student. Format STRICTLY as JSON array: [{q:'question', options:['A','B','C','D'], answer:'A', explanation:'why'}]. Return ONLY the JSON array.` }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map((b) => b.text || "").join("\n") || "[]";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setQuestions(Array.isArray(parsed) ? parsed : []);
      setAnswers({});
      setSubmitted(false);
      setStartedAt(Date.now());
      setElapsedSec(0);
      startTimer();
    } catch (e) {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const score = useMemo(() => questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0), [questions, answers]);

  const submit = () => {
    setSubmitted(true);
    clearInterval(timerRef.current);
    if (studentId) {
      addTestResult({ studentId, subject, score, total: questions.length, date: Date.now(), questions, answers, timeTaken: Date.now() - startedAt });
    }
  };

  const step = submitted ? 3 : questions.length > 0 ? 2 : 1;

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card className="mb-4">
        <CardHead><CardTitle>AI Mock Test Generator - Step {step}</CardTitle></CardHead>
        <CardBody>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}><View className="flex-row gap-2">{profiles.map((p) => <TouchableOpacity key={p.id} onPress={() => setStudentId(p.id)} className={`px-3 py-1 rounded border ${studentId === p.id ? "bg-teallt border-teal" : "bg-white border-rule2"}`}><Text>{p.name.split(" ")[0]}</Text></TouchableOpacity>)}</View></ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}><View className="flex-row gap-2">{SUBJECTS.map((s) => <TouchableOpacity key={s} onPress={() => setSubject(s)} className={`px-3 py-1 rounded border ${subject === s ? "bg-navylt border-navymid" : "bg-white border-rule2"}`}><Text>{s}</Text></TouchableOpacity>)}</View></ScrollView>
          <View className="flex-row gap-2 mt-2">{DIFF.map((d) => <TouchableOpacity key={d} onPress={() => setDifficulty(d)} className={`px-3 py-1 rounded border ${difficulty === d ? "bg-teallt border-teal" : "bg-white border-rule2"}`}><Text>{d}</Text></TouchableOpacity>)}</View>
          <View className="flex-row flex-wrap gap-2 mt-2">{Q_TYPES.map((d) => <TouchableOpacity key={d} onPress={() => setQType(d)} className={`px-3 py-1 rounded border ${qType === d ? "bg-violetlt border-violet" : "bg-white border-rule2"}`}><Text>{d}</Text></TouchableOpacity>)}</View>
          <View className="flex-row gap-2 mt-2">{COUNTS.map((n) => <TouchableOpacity key={n} onPress={() => setCount(n)} className={`px-3 py-1 rounded border ${count === n ? "bg-amberlt border-amber" : "bg-white border-rule2"}`}><Text>{n}</Text></TouchableOpacity>)}</View>
          <View className="mt-3"><PrimaryBtn label="Generate Test" onPress={generate} loading={loading} full /></View>
        </CardBody>
      </Card>

      {loading ? <ActivityIndicator color="#1a4480" /> : null}

      {!loading && questions.length === 0 ? <Card><EmptyState icon="📝" title="No test yet" desc="Configure and generate a test." /></Card> : null}

      {questions.length > 0 && (
        <Card>
          <CardHead><CardTitle>{submitted ? `Score: ${score}/${questions.length}` : `Attempt Test - ${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, "0")}`}</CardTitle></CardHead>
          <CardBody className="gap-3">
            {questions.map((q, i) => (
              <View key={i} className="p-3 border border-rule2 rounded bg-white">
                <Text className="font-latoBold text-ink">{i + 1}. {q.q}</Text>
                <View className="mt-2 gap-1">
                  {(q.options || []).map((opt, oi) => (
                    <TouchableOpacity key={oi} onPress={() => !submitted && setAnswers((a) => ({ ...a, [i]: opt }))} className={`px-2 py-1 rounded border ${answers[i] === opt ? "bg-navylt border-navymid" : "bg-paper border-rule2"}`}>
                      <Text>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {submitted ? <Text className="mt-2 font-lato text-ink2">Correct: {q.answer}. {q.explanation}</Text> : null}
              </View>
            ))}
            {!submitted ? <PrimaryBtn label="Submit Test" onPress={submit} /> : (
              <View className="flex-row gap-2">
                <PrimaryBtn label="Retry" onPress={() => { setSubmitted(false); setAnswers({}); setElapsedSec(0); startTimer(); }} />
                <TouchableOpacity onPress={() => { clearInterval(timerRef.current); setQuestions([]); setAnswers({}); setSubmitted(false); setElapsedSec(0); }} className="px-4 py-2 rounded border border-rule2 bg-white"><Text>New Test</Text></TouchableOpacity>
              </View>
            )}
          </CardBody>
        </Card>
      )}

      <Card className="mt-4">
        <CardHead><CardTitle>Test History</CardTitle></CardHead>
        <CardBody>
          {testResults.length === 0 ? <EmptyState icon="📊" title="No history" desc="Completed tests appear here." /> : testResults.slice(0, 8).map((t) => (
            <View key={t.id} className="py-2 border-b border-rule">
              <Text className="font-lato">{t.subject} - {t.score}/{t.total}</Text>
            </View>
          ))}
        </CardBody>
      </Card>
    </ScrollView>
  );
}
