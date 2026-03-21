import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useData } from "../context/DataContext";
import { Card, CardBody, CardHead, CardTitle, EmptyState } from "../components/UI";

export default function GamificationScreen() {
  const { profiles, getClassLeaderboard } = useData();
  const leaderboard = getClassLeaderboard();

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card className="mb-4">
        <CardHead><CardTitle>Gamified Learning Tracker</CardTitle></CardHead>
        <CardBody>
          {profiles.length === 0 ? <EmptyState icon="🎮" title="No students yet" desc="Add students to track XP and leaderboard." /> : leaderboard.map((row, i) => (
            <View key={row.profile.id} className="py-2 border-b border-rule flex-row items-center justify-between">
              <Text className="font-latoBold">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {row.profile.name}</Text>
              <Text className="font-lato">{row.level.emoji} {row.xp} XP</Text>
            </View>
          ))}
        </CardBody>
      </Card>
    </ScrollView>
  );
}
