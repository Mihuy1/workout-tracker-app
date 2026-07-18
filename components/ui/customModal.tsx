import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type CustomModalProps = {
  visible: boolean;
  title: string;
  message?: string;

  prompt?: boolean;
  placeHolderText?: string;
  defaultValue?: string;

  primaryButtonText?: string;
  secondaryButtonText?: string;

  primaryButtonRed?: boolean;
  secondaryButtonRed?: boolean;

  dismissOnBackdropPress?: boolean;

  onPrimary: (value?: string) => void;
  onSecondary?: () => void;
  onRequestClose: () => void;
};

export function CustomModal(props: CustomModalProps) {
  return (
    <Modal
      visible={props.visible}
      onRequestClose={props.onRequestClose}
      animationType="fade"
      transparent
    >
      {props.visible && <CustomModalContent {...props} />}
    </Modal>
  );
}

function CustomModalContent({
  title,
  message,
  prompt = false,
  placeHolderText = "",
  defaultValue = "",
  primaryButtonText = "OK",
  secondaryButtonText = "Cancel",
  primaryButtonRed,
  secondaryButtonRed,
  dismissOnBackdropPress = true,
  onPrimary,
  onSecondary,
  onRequestClose,
}: CustomModalProps) {
  const [value, setValue] = useState(defaultValue);
  const theme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  const handleBackDropOnPress = () => {
    if (dismissOnBackdropPress) onRequestClose();
  };

  return (
    <Pressable style={styles.backdrop} onPress={handleBackDropOnPress}>
      <Pressable
        style={[styles.modalView, { backgroundColor: colors.surface }]}
        onPress={(e) => e.stopPropagation()}
      >
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        {!!message && (
          <Text style={[styles.message, { color: colors.mutedText }]}>
            {message}
          </Text>
        )}

        {prompt && (
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeHolderText}
            placeholderTextColor={colors.placeholder}
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
        )}

        <View style={styles.buttonRow}>
          {!!onSecondary && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: colors.noButtonBackground,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={onSecondary}
            >
              <Text
                style={[
                  { color: colors.noButtonText },
                  secondaryButtonRed ? styles.redText : undefined,
                ]}
              >
                {secondaryButtonText}
              </Text>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              {
                backgroundColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => onPrimary(prompt ? value : undefined)}
          >
            <Text
              style={[
                { color: colors.text, fontWeight: "600" },
                primaryButtonRed ? styles.redText : undefined,
              ]}
            >
              {primaryButtonText}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    width: "88%",
    maxWidth: 420,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    lineHeight: 20,
  },
  input: {
    width: "100%",
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryButton: {},
  redText: { color: "red" },
});
