import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { subscriptions } = useSubscriptions();

  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) return subscriptions;

    const query = searchQuery.toLowerCase();
    return subscriptions.filter(
      (sub) =>
        sub.name.toLowerCase().includes(query) ||
        sub.category?.toLowerCase().includes(query) ||
        sub.plan?.toLowerCase().includes(query),
    );
  }, [searchQuery, subscriptions]);

  const handleCardPress = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderSubscriptionCard = ({ item }: { item: Subscription }) => (
    <SubscriptionCard
      {...item}
      expanded={expandedId === item.id}
      onPress={() => handleCardPress(item.id)}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5 pb-3">
        <Text className="text-2xl font-bold text-foreground mb-4">
          Subscriptions
        </Text>
        <TextInput
          placeholder="Search by name, category, or plan..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="bg-card text-foreground px-4 py-3 rounded-lg border border-gray-700"
        />
      </View>

      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={renderSubscriptionCard}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
        scrollEnabled={true}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-foreground text-center">
              No subscriptions found matching {searchQuery}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
