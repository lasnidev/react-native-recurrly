import { useAuth } from "@clerk/expo";
import { styled } from "nativewind";
import React, { useState } from "react";
import { Alert, Pressable, Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      Alert.alert("Logout Failed", "Unable to log out. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-lg font-semibold mb-5">Insights</Text>
      <Pressable
        onPress={handleLogout}
        disabled={isLoading}
        className={`rounded-lg p-4 items-center ${
          isLoading ? "bg-red-400" : "bg-red-600"
        }`}
      >
        <Text className="text-white font-semibold">
          {isLoading ? "Logging out..." : "Logout"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Insights;
