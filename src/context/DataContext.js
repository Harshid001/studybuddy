// src/context/DataContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "studybuddy_v1";
const PLANS_KEY = "studybuddy_plans_v1";
const POMODORO_KEY = "studybuddy_pomodoro_v1";
const TESTS_KEY = "studybuddy_tests_v1";
const TASKS_KEY = "studybuddy_tasks_v1";

const DataContext = createContext(null);

export const LEVEL_LABELS = {
  primary:     "Primary (Std 1–5)",
  middle:      "Middle School (Std 6–8)",
  secondary:   "Secondary (Std 9–10)",
  higher:      "Higher Secondary (Std 11–12)",
  engineering: "Engineering / College",
};

export const EMOJIS = [
  "👦","👧","🧑","👩","🧒","👤","🎓","🧑‍💻","👩‍💻",
  "🧑‍🔬","👩‍🔬","🧑‍🎨","👩‍🎨","🧑‍🚀","👨‍🏫","👩‍🏫","🦸","🧙","🧝","🧑‍🎤",
];

export const AV_BG = [
  "#dbeafe","#dcfce7","#fef3c7","#fce7f3","#cffafe",
  "#e0e7ff","#fef9c3","#d1fae5","#ffe4e6","#f0fdf4",
];
export const AV_CLR = [
  "#1e40af","#166534","#92400e","#9d174d","#0e7490",
  "#3730a3","#854d0e","#065f46","#9f1239","#14532d",
];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function DataProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [chats, setChats]       = useState({});
  const [notes, setNotes]       = useState({});
  const [studyPlans, setStudyPlans] = useState({});
  const [pomodoroLog, setPomodoroLog] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]   = useState(true);

  // ── Load from AsyncStorage ──
  const loadData = useCallback(async () => {
    try {
      const [raw, plansRaw, pomoRaw, testsRaw, tasksRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(PLANS_KEY),
        AsyncStorage.getItem(POMODORO_KEY),
        AsyncStorage.getItem(TESTS_KEY),
        AsyncStorage.getItem(TASKS_KEY),
      ]);
      const parsed = raw ? JSON.parse(raw) : {};
      const profs  = parsed.profiles || [];
      const ch     = parsed.chats || {};
      const nt     = {};
      profs.forEach((p) => { nt[p.id] = p.notes || {}; });
      setProfiles(profs);
      setChats(ch);
      setNotes(nt);
      setStudyPlans(plansRaw ? JSON.parse(plansRaw) : {});
      setPomodoroLog(pomoRaw ? JSON.parse(pomoRaw) : []);
      setTestResults(testsRaw ? JSON.parse(testsRaw) : []);
      setAssignments(tasksRaw ? JSON.parse(tasksRaw) : []);
    } catch (e) {
      console.warn("Load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Save to AsyncStorage ──
  const saveData = useCallback(async (newProfiles, newChats, newNotes) => {
    try {
      const toSave = {
        profiles: newProfiles.map(p => ({ ...p, notes: newNotes[p.id] || {} })),
        chats: newChats,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn("Save error:", e);
    }
  }, []);

  const saveExtra = useCallback(async (key, payload) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
      console.warn("Save error:", e);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Computed helpers ──
  const getChatCount = (id) =>
    (chats[id] || []).filter(m => m.role === "user").length;

  const getNoteCount = (id) =>
    Object.keys(notes[id] || {}).length;

  const getLastActive = (id) => {
    const msgs = chats[id] || [];
    return msgs.length ? msgs[msgs.length - 1].time || null : null;
  };

  const getActivity = (q) => {
    if (q >= 5) return { label: "Active",       color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" };
    if (q >= 1) return { label: "Learning",     color: "#b45309", bg: "#fef3e2", border: "#fcd38d" };
    return             { label: "Not started",  color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" };
  };

  const getTotalStats = () => {
    const total  = profiles.length;
    const totalQ = profiles.reduce((s, p) => s + getChatCount(p.id), 0);
    const totalN = profiles.reduce((s, p) => s + getNoteCount(p.id), 0);
    const active = profiles.filter(p => getChatCount(p.id) > 0).length;
    return { total, totalQ, totalN, active };
  };

  const buildTimeline = () => {
    const events = [];
    profiles.forEach(p => {
      (chats[p.id] || []).forEach((m, i) => {
        if (m.role === "user")
          events.push({ type: "question", profile: p, content: m.content, time: m.time || "—" });
      });
      Object.values(notes[p.id] || {}).forEach(n => {
        events.push({ type: "note", profile: p, content: n.title || "Untitled", subject: n.subject || "", time: n.date || "—" });
      });
    });
    return events;
  };

  const addNoteForStudent = (studentId, note) => {
    const id = note.id || genId();
    const newNotes = {
      ...notes,
      [studentId]: {
        ...(notes[studentId] || {}),
        [id]: { ...note, id },
      },
    };
    setNotes(newNotes);
    saveData(profiles, chats, newNotes);
  };

  const deleteNoteForStudent = (studentId, noteId) => {
    const bucket = { ...(notes[studentId] || {}) };
    delete bucket[noteId];
    const newNotes = { ...notes, [studentId]: bucket };
    setNotes(newNotes);
    saveData(profiles, chats, newNotes);
  };

  // ── Mutations ──
  const addStudent = (data) => {
    const id = genId();
    const newProfile = { id, ...data };
    const newProfiles = [...profiles, newProfile];
    const newChats    = { ...chats,   [id]: [] };
    const newNotes    = { ...notes,   [id]: {} };
    setProfiles(newProfiles);
    setChats(newChats);
    setNotes(newNotes);
    saveData(newProfiles, newChats, newNotes);
    return id;
  };

  const updateStudent = (id, data) => {
    const newProfiles = profiles.map(p => p.id === id ? { ...p, ...data } : p);
    setProfiles(newProfiles);
    saveData(newProfiles, chats, notes);
  };

  const removeStudent = (id) => {
    const newProfiles = profiles.filter(p => p.id !== id);
    const newChats    = { ...chats };   delete newChats[id];
    const newNotes    = { ...notes };   delete newNotes[id];
    setProfiles(newProfiles);
    setChats(newChats);
    setNotes(newNotes);
    saveData(newProfiles, newChats, newNotes);
  };

  const addChatMessages = (studentId, userMsg, aiMsg) => {
    const time = new Date().toLocaleString("en-IN");
    const newMsgs = [
      ...(chats[studentId] || []),
      { role: "user", content: userMsg, time, ts: Date.now() },
      { role: "ai",   content: aiMsg,   time, ts: Date.now() },
    ];
    const newChats = { ...chats, [studentId]: newMsgs };
    setChats(newChats);
    saveData(profiles, newChats, notes);
  };

  const addStudyPlan = (studentId, plan) => {
    const updated = {
      ...studyPlans,
      [studentId]: [{ id: genId(), createdAt: Date.now(), ...plan }, ...(studyPlans[studentId] || [])],
    };
    setStudyPlans(updated);
    saveExtra(PLANS_KEY, updated);
  };

  const deleteStudyPlan = (studentId, planId) => {
    const updated = {
      ...studyPlans,
      [studentId]: (studyPlans[studentId] || []).filter((p) => p.id !== planId),
    };
    setStudyPlans(updated);
    saveExtra(PLANS_KEY, updated);
  };

  const addPomodoroSession = (session) => {
    const updated = [{ ...session, id: genId() }, ...pomodoroLog];
    setPomodoroLog(updated);
    saveExtra(POMODORO_KEY, updated);
  };

  const addTestResult = (result) => {
    const updated = [{ ...result, id: genId() }, ...testResults];
    setTestResults(updated);
    saveExtra(TESTS_KEY, updated);
  };

  const addAssignment = (assignment) => {
    const updated = [{ id: genId(), completed: false, ...assignment }, ...assignments];
    setAssignments(updated);
    saveExtra(TASKS_KEY, updated);
  };

  const updateAssignment = (id, updates) => {
    const updated = assignments.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setAssignments(updated);
    saveExtra(TASKS_KEY, updated);
  };

  const deleteAssignment = (id) => {
    const updated = assignments.filter((a) => a.id !== id);
    setAssignments(updated);
    saveExtra(TASKS_KEY, updated);
  };

  const getStudentXP = useCallback((studentId) => {
    const q = (chats[studentId] || []).filter((m) => m.role === "user").length * 10;
    const n = Object.keys(notes[studentId] || {}).length * 25;
    const t = testResults.filter((r) => r.studentId === studentId).length * 50;
    const p = pomodoroLog.filter((s) => s.studentId === studentId && s.type === "focus").length * 5;
    return q + n + t + p;
  }, [chats, notes, pomodoroLog, testResults]);

  const getStudentLevel = (xp) => {
    if (xp >= 1000) return { label: "Master", emoji: "🏆", color: "#7c3aed", nextXP: null };
    if (xp >= 600) return { label: "Expert", emoji: "⭐", color: "#2563eb", nextXP: 1000 };
    if (xp >= 300) return { label: "Scholar", emoji: "🔥", color: "#ea580c", nextXP: 600 };
    if (xp >= 100) return { label: "Student", emoji: "📚", color: "#0d6e6e", nextXP: 300 };
    return { label: "Seedling", emoji: "🌱", color: "#16a34a", nextXP: 100 };
  };

  const getStudentStreak = useCallback((studentId) => {
    const days = new Set();
    (chats[studentId] || []).forEach((m) => m.ts && days.add(new Date(m.ts).toDateString()));
    Object.values(notes[studentId] || {}).forEach((n) => n.date && days.add(new Date(n.date).toDateString()));
    pomodoroLog.filter((s) => s.studentId === studentId).forEach((s) => days.add(new Date(s.date).toDateString()));
    testResults.filter((s) => s.studentId === studentId).forEach((s) => days.add(new Date(s.date).toDateString()));
    let streak = 0;
    const d = new Date();
    while (days.has(d.toDateString())) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, [chats, notes, pomodoroLog, testResults]);

  const getClassLeaderboard = useCallback(() => {
    return profiles
      .map((profile) => {
        const xp = getStudentXP(profile.id);
        return { profile, xp, level: getStudentLevel(xp), streak: getStudentStreak(profile.id) };
      })
      .sort((a, b) => b.xp - a.xp);
  }, [profiles, getStudentXP, getStudentStreak]);

  const subjectBreakdown = useMemo(() => {
    const keys = ["math", "physics", "chemistry", "biology", "history", "geography", "english", "hindi", "computer", "economics"];
    const map = Object.fromEntries(keys.map((k) => [k, 0]));
    Object.values(chats).flat().forEach((m) => {
      if (m.role !== "user") return;
      const lower = (m.content || "").toLowerCase();
      keys.forEach((k) => {
        if (lower.includes(k)) map[k] += 1;
      });
    });
    return map;
  }, [chats]);

  const clearAll = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY, PLANS_KEY, POMODORO_KEY, TESTS_KEY, TASKS_KEY]);
    setProfiles([]); setChats({}); setNotes({});
    setStudyPlans({}); setPomodoroLog([]); setTestResults([]); setAssignments([]);
  };

  return (
    <DataContext.Provider value={{
      profiles, chats, notes, loading,
      studyPlans, pomodoroLog, testResults, assignments,
      getChatCount, getNoteCount, getLastActive,
      getActivity, getTotalStats, buildTimeline, subjectBreakdown,
      addStudent, updateStudent, removeStudent,
      addChatMessages, addNoteForStudent, deleteNoteForStudent,
      addStudyPlan, deleteStudyPlan, addPomodoroSession, addTestResult,
      addAssignment, updateAssignment, deleteAssignment,
      getStudentXP, getStudentLevel, getStudentStreak, getClassLeaderboard,
      clearAll, loadData,
      AV_BG, AV_CLR,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
