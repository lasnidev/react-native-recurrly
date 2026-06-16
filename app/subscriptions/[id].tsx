import { Link, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View>
        <Text className="text-lg font-sans-bold text-primary mb-2">
          Subscription Details
        </Text>
        <Text className="text-base text-muted-foreground mb-4">ID: {id}</Text>
        <Link href="/">Go back</Link>
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionDetails;
