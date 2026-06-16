import { icons } from "@/constants/icon";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categories = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const frequencies = ["Monthly", "Yearly"] as const;

type Category = (typeof categories)[number];
type Frequency = (typeof frequencies)[number];

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
}

const categoryColors: Record<Category, string> = {
  Entertainment: "#f8d2f4",
  "AI Tools": "#cfe2ff",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#d4f1e0",
  Cloud: "#c5d8f5",
  Music: "#f7d6d1",
  Other: "#d1d1d1",
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category>("Entertainment");
  const [formError, setFormError] = useState("");

  const parsedPrice = useMemo(() => Number(price.trim()), [price]);
  const canSubmit =
    name.trim().length > 0 &&
    Number.isFinite(parsedPrice) &&
    parsedPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    setFormError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Enter a subscription name.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFormError("Enter a valid price greater than 0.");
      return;
    }

    const startDate = dayjs();
    const renewalDate = startDate.add(
      1,
      frequency === "Monthly" ? "month" : "year",
    );

    onCreate({
      id: `subscription-${Date.now()}`,
      name: trimmedName,
      price: parsedPrice,
      frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.wallet,
      billing: frequency,
      color: categoryColors[category],
      currency: "USD",
      plan: `${frequency} Plan`,
      paymentMethod: "Payment method not set",
    });

    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="modal-overlay justify-end"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView
          className="modal-container"
          edges={["left", "right", "bottom"]}
        >
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable
              className="modal-close"
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close new subscription form"
              hitSlop={8}
            >
              <Text className="modal-close-text">X</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerClassName="modal-body"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-field">
              <Text className="auth-label">Name</Text>
              <TextInput
                className="auth-input bg-white"
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  setFormError("");
                }}
                placeholder="Subscription name"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View className="auth-field">
              <Text className="auth-label">Price</Text>
              <TextInput
                className="auth-input bg-white"
                value={price}
                onChangeText={(value) => {
                  setPrice(value);
                  setFormError("");
                }}
                placeholder="0.00"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>

            <View className="auth-field">
              <Text className="auth-label">Frequency</Text>
              <View className="picker-row">
                {frequencies.map((option) => {
                  const isActive = option === frequency;

                  return (
                    <Pressable
                      key={option}
                      className={clsx(
                        "picker-option",
                        isActive && "picker-option-active",
                      )}
                      onPress={() => setFrequency(option)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isActive }}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          isActive && "picker-option-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="auth-field">
              <Text className="auth-label">Category</Text>
              <View className="category-scroll">
                {categories.map((option) => {
                  const isActive = option === category;

                  return (
                    <Pressable
                      key={option}
                      className={clsx(
                        "category-chip",
                        isActive && "category-chip-active",
                      )}
                      onPress={() => setCategory(option)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isActive }}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          isActive && "category-chip-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {formError ? (
              <Text className="auth-error">{formError}</Text>
            ) : null}

            <Pressable
              className={clsx(
                "auth-button",
                !canSubmit && "auth-button-disabled",
              )}
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityRole="button"
            >
              <Text className="auth-button-text">Create subscription</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
