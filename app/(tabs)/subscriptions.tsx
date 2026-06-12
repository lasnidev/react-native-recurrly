import images from "@/constants/images";
import { styled } from "nativewind";
import React from "react";
import { Image, Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>Subscriptions </Text>
      <Image source={images.avatar} className="mb-4" />
      <Text>hfrirg freghth wegrfhghg dfgrprg rgrtggh</Text>
    </SafeAreaView>
  );
};

export default Subscriptions;
