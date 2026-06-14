import { useSignIn } from "@clerk/expo";
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
    const firstError = (error as { errors: { longMessage?: string; message?: string }[] })
      .errors[0];
    return firstError?.longMessage ?? firstError?.message ?? fallback;
  }

  return fallback;
};

export default function SignIn() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isMfaStep, setIsMfaStep] = useState(false);

  const isSubmitting = fetchStatus === "fetching";
  const email = emailAddress.trim();

  const canSubmit = useMemo(
    () => email.length > 0 && password.length > 0 && !isSubmitting,
    [email, password, isSubmitting],
  );

  const validateCredentials = () => {
    const nextErrors: Record<string, string> = {};

    if (!email) {
      nextErrors.email = "Enter your email address.";
    } else if (!emailPattern.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Enter your password.";
    }

    setLocalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const finishSignIn = async () => {
    const result = await signIn?.finalize({
      navigate: () => router.replace("/"),
    });

    if (result?.error) {
      setFormError(getErrorMessage(result.error, "We could not finish signing you in."));
      return;
    }

    router.replace("/");
  };

  const handleSubmit = async () => {
    if (!signIn || !validateCredentials()) return;

    setFormError("");

    try {
      const result = await signIn.password({ emailAddress: email, password });

      if (result.error) {
        setFormError(getErrorMessage(result.error, "Check your email and password, then try again."));
        return;
      }

      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }

      if (signIn.status === "needs_client_trust") {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code",
        );

        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode();
          setIsMfaStep(true);
          return;
        }
      }

      if (signIn.status === "needs_second_factor") {
        setFormError("Use your second factor to continue.");
        return;
      }

      setFormError("We need one more step before we can open your account.");
    } catch (error) {
      setFormError(getErrorMessage(error, "Something went wrong. Please try again."));
    }
  };

  const handleVerify = async () => {
    if (!signIn) return;

    const trimmedCode = code.trim();
    if (trimmedCode.length < 6) {
      setLocalErrors({ code: "Enter the verification code." });
      return;
    }

    setLocalErrors({});
    setFormError("");

    try {
      const result = await signIn.mfa.verifyEmailCode({ code: trimmedCode });

      if (result.error) {
        setFormError(getErrorMessage(result.error, "That code did not work. Please try again."));
        return;
      }

      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }

      setFormError("We could not verify that code yet. Please request a new one.");
    } catch (error) {
      setFormError(getErrorMessage(error, "That code did not work. Please try again."));
    }
  };

  const handleResendCode = async () => {
    if (!signIn) return;

    setFormError("");
    const result = await signIn.mfa.sendEmailCode();

    if (result.error) {
      setFormError(getErrorMessage(result.error, "We could not send a new code."));
    }
  };

  const resetFlow = async () => {
    await signIn?.reset();
    setIsMfaStep(false);
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
              {isMfaStep ? "Check your inbox" : "Welcome back"}
            </Text>
            <Text className="auth-subtitle">
              {isMfaStep
                ? "Enter the code we sent to confirm it is really you."
                : "Sign in to continue managing your subscriptions."}
            </Text>
          </View>

          <View className="auth-card">
            {isMfaStep ? (
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

                {formError ? <Text className="auth-error">{formError}</Text> : null}

                <Pressable
                  className={`auth-button ${isSubmitting ? "auth-button-disabled" : ""}`}
                  onPress={handleVerify}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Verify and continue</Text>
                  )}
                </Pressable>

                <Pressable className="auth-secondary-button" onPress={handleResendCode}>
                  <Text className="auth-secondary-button-text">Send a new code</Text>
                </Pressable>
                <Pressable onPress={resetFlow}>
                  <Text className="auth-link text-center">Use a different email</Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={`auth-input ${localErrors.email || errors.fields.identifier ? "auth-input-error" : ""}`}
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                  />
                  {(localErrors.email || errors.fields.identifier?.message) && (
                    <Text className="auth-error">
                      {localErrors.email ?? errors.fields.identifier?.message}
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${localErrors.password || errors.fields.password ? "auth-input-error" : ""}`}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(0, 0, 0, 0.45)"
                    secureTextEntry
                    textContentType="password"
                  />
                  {(localErrors.password || errors.fields.password?.message) && (
                    <Text className="auth-error">
                      {localErrors.password ?? errors.fields.password?.message}
                    </Text>
                  )}
                </View>

                {formError ? <Text className="auth-error">{formError}</Text> : null}

                <Pressable
                  className={`auth-button ${!canSubmit ? "auth-button-disabled" : ""}`}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>

                <View className="auth-link-row">
                  <Text className="auth-link-copy">New to Recurly?</Text>
                  <Link href="/sign-up" asChild>
                    <Pressable>
                      <Text className="auth-link">Create an account</Text>
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
