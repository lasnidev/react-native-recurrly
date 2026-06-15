import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as { errors?: unknown[] }).errors)
  ) {
    const firstError = (
      error as { errors: { longMessage?: string; message?: string }[] }
    ).errors[0];
    return firstError?.longMessage ?? firstError?.message ?? fallback;
  }

  return fallback;
};

export default function SignUp() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isVerificationStep, setIsVerificationStep] = useState(false);

  const isSubmitting = fetchStatus === "fetching";
  const email = emailAddress.trim();

  const canSubmit = useMemo(
    () => email.length > 0 && password.length >= 8 && !isSubmitting,
    [email, password, isSubmitting],
  );

  const validateAccount = () => {
    const nextErrors: Record<string, string> = {};

    if (!email) {
      nextErrors.email = "Enter your email address.";
    } else if (!emailPattern.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Create a password.";
    } else if (password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    setLocalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const finishSignUp = async () => {
    const result = await signUp?.finalize({
      navigate: () => router.replace("/"),
    });

    if (result?.error) {
      setFormError(
        getErrorMessage(
          result.error,
          "We could not finish creating your account.",
        ),
      );
      return;
    }

    router.replace("/");
  };

  const handleSubmit = async () => {
    if (!signUp || !validateAccount()) return;

    setFormError("");

    try {
      const result = await signUp.password({ emailAddress: email, password });

      if (result.error) {
        setFormError(
          getErrorMessage(
            result.error,
            "We could not create your account yet.",
          ),
        );
        return;
      }

      if (signUp.status === "complete") {
        await finishSignUp();
        return;
      }

      if (
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields.includes("email_address")
      ) {
        if (signUp.unverifiedFields.length > 1) {
          return;
        }

        const emailResult = await signUp.verifications.sendEmailCode();

        if (emailResult.error) {
          setFormError(
            getErrorMessage(
              emailResult.error,
              "We could not send a verification code.",
            ),
          );
          return;
        }

        setIsVerificationStep(true);
        return;
      }

      setFormError(
        "We need a little more information before opening your account.",
      );
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Something went wrong. Please try again."),
      );
    }
  };

  const handleVerify = async () => {
    if (!signUp) return;

    const trimmedCode = code.trim();
    if (trimmedCode.length < 6) {
      setLocalErrors({ code: "Enter the verification code." });
      return;
    }

    setLocalErrors({});
    setFormError("");

    try {
      const result = await signUp.verifications.verifyEmailCode({
        code: trimmedCode,
      });

      if (result.error) {
        setFormError(
          getErrorMessage(
            result.error,
            "That code did not work. Please try again.",
          ),
        );
        return;
      }

      if (signUp.status === "complete") {
        await finishSignUp();
        return;
      }

      setFormError(
        "We could not verify that code yet. Please request a new one.",
      );
    } catch (error) {
      setFormError(
        getErrorMessage(error, "That code did not work. Please try again."),
      );
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;

    setFormError("");
    const result = await signUp.verifications.sendEmailCode();

    if (result.error) {
      setFormError(
        getErrorMessage(result.error, "We could not send a new code."),
      );
    }
  };

  const resetFlow = async () => {
    await signUp?.reset();
    setIsVerificationStep(false);
    setCode("");
    setFormError("");
    setLocalErrors({});
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content justify-center"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recurly</Text>
                <Text className="auth-wordmark-sub">Smart Billing</Text>
              </View>
            </View>

            <Text className="auth-title">
              {isVerificationStep ? "Verify your email" : "Create your account"}
            </Text>
            <Text className="auth-subtitle">
              {isVerificationStep
                ? "Enter the code we sent so your billing workspace stays protected."
                : "Start tracking renewals, payments, and subscription spend in one place."}
            </Text>
          </View>

          <View className="auth-card">
            {isVerificationStep ? (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={`auth-input ${localErrors.code || errors.fields.code ? "auth-input-error" : ""}`}
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter your code"
                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    maxLength={8}
                  />
                  {(localErrors.code || errors.fields.code?.message) && (
                    <Text className="auth-error">
                      {localErrors.code ?? errors.fields.code?.message}
                    </Text>
                  )}
                </View>

                {formError ? (
                  <Text className="auth-error">{formError}</Text>
                ) : null}

                <Pressable
                  className={`auth-button ${isSubmitting ? "auth-button-disabled" : ""}`}
                  onPress={handleVerify}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">
                      Verify and continue
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={handleResendCode}
                >
                  <Text className="auth-secondary-button-text">
                    Send a new code
                  </Text>
                </Pressable>
                <Pressable onPress={resetFlow}>
                  <Text className="auth-link text-center">
                    Use a different email
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={`auth-input ${localErrors.email || errors.fields.emailAddress ? "auth-input-error" : ""}`}
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                  />
                  {(localErrors.email ||
                    errors.fields.emailAddress?.message) && (
                    <Text className="auth-error">
                      {localErrors.email ?? errors.fields.emailAddress?.message}
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${localErrors.password || errors.fields.password ? "auth-input-error" : ""}`}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a secure password"
                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                    secureTextEntry
                    textContentType="newPassword"
                  />
                  {(localErrors.password ||
                    errors.fields.password?.message) && (
                    <Text className="auth-error">
                      {localErrors.password ?? errors.fields.password?.message}
                    </Text>
                  )}
                  <Text className="auth-helper">Use 8 or more characters.</Text>
                </View>

                {formError ? (
                  <Text className="auth-error">{formError}</Text>
                ) : null}

                <Pressable
                  className={`auth-button ${!canSubmit ? "auth-button-disabled" : ""}`}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </Pressable>

                <View nativeID="clerk-captcha" />

                <View className="auth-link-row">
                  <Text className="auth-link-copy">
                    Already have an account?
                  </Text>
                  <Link href="/sign-in" asChild>
                    <Pressable>
                      <Text className="auth-link">Sign in</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
