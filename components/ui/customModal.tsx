import { useEffect, useState } from "react";
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

  dismissOnBackdropPress?: boolean;

  onPrimary: (value?: string) => void;
  onSecondary?: () => void;
  onRequestClose: () => void;
};

export function CustomModal({
  visible = false,
  title,
  message,
  prompt = false,
  placeHolderText = "",
  defaultValue = "",
  primaryButtonText = "OK",
  secondaryButtonText = "Cancel",
  dismissOnBackdropPress = true,
  onPrimary,
  onSecondary,
  onRequestClose,
}: CustomModalProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (visible) setValue(defaultValue);
  }, [visible, defaultValue]);

  const handleBackDropOnPress = () => {
    if (dismissOnBackdropPress) onRequestClose();
  };

  return (
    <Modal
      onRequestClose={onRequestClose}
      visible={visible}
      animationType="fade"
      transparent
    >
      <Pressable style={styles.backdrop} onPress={handleBackDropOnPress}>
        <Pressable
          style={styles.modalView}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.title}>{title}</Text>

          {!!message && <Text style={styles.message}>{message}</Text>}

          {prompt && (
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder={placeHolderText}
              style={styles.input}
            />
          )}

          <View style={styles.buttonRow}>
            {!!onSecondary && (
              <Pressable style={styles.button} onPress={onSecondary}>
                <Text>{secondaryButtonText}</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={() => onPrimary(prompt ? value : undefined)}
            >
              <Text>{primaryButtonText}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
    backgroundColor: "white",
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
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#d9d9d9",
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
    backgroundColor: "#f2f2f2",
  },
  primaryButton: { backgroundColor: "#e6e6e6" },

  secondaryText: { color: "red" },
});
