import { Link, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const SubscriptionDetails = () => {
    const {id} = useLocalSearchParams<{id: string}>();


  return (
    <View className="m-20">
      <Text>Subscription Details: {id}</Text>
      <Link href="/">Go back</Link>
    </View>
  )
}

export default SubscriptionDetails