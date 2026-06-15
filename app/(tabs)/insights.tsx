import { useAuth } from "@clerk/expo";
import { styled } from "nativewind";
import React from "react";
import { Pressable, Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-lg font-semibold mb-5">Insights</Text>
      <Pressable
        onPress={handleLogout}
        className="bg-red-600 rounded-lg p-4 items-center"
      >
        <Text className="text-white font-semibold">Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Insights;
