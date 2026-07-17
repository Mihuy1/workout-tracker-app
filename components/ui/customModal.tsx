import { useThemeColor } from "@/hooks/use-theme-color";
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

  const overlay = useThemeColor({}, "overlay");
  const surface = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const mutedText = useThemeColor({}, "mutedText");
  const placeholder = useThemeColor({}, "placeholder");
  const inputBackground = useThemeColor({}, "inputBackground");
  const borderColor = useThemeColor({}, "border");
  const buttonBackground = useThemeColor({}, "surfaceMuted");
  const primaryColor = useThemeColor({}, "primary");
  const onPrimaryColor = useThemeColor({}, "onPrimary");
  const dangerColor = useThemeColor({}, "danger");
  const dangerText = useThemeColor({}, "dangerText");
  const primaryButtonBackground = primaryButtonRed
    ? dangerColor
    : primaryColor;

  // useEffect(() => {
  //   if (visible) setValue(defaultValue);
  // }, [visible, defaultValue]);

  const handleBackDropOnPress = () => {
    if (dismissOnBackdropPress) onRequestClose();
  };

  return (
    <Pressable
      style={[styles.backdrop, { backgroundColor: overlay }]}
      onPress={handleBackDropOnPress}
    >
      <Pressable
        style={[styles.modalView, { backgroundColor: surface }]}
        onPress={(e) => e.stopPropagation()}
      >
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>

        {!!message && (
          <Text style={[styles.message, { color: mutedText }]}>{message}</Text>
        )}

        {prompt && (
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeHolderText}
            placeholderTextColor={placeholder}
            style={[
              styles.input,
              {
                backgroundColor: inputBackground,
                borderColor,
                color: textColor,
              },
            ]}
          />
        )}

        <View style={styles.buttonRow}>
          {!!onSecondary && (
            <Pressable
              style={[styles.button, { backgroundColor: buttonBackground }]}
              onPress={onSecondary}
            >
              <Text
                style={{
                  color: secondaryButtonRed ? dangerText : textColor,
                }}
              >
                {secondaryButtonText}
              </Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.button, { backgroundColor: primaryButtonBackground }]}
            onPress={() => onPrimary(prompt ? value : undefined)}
          >
            <Text style={{ color: onPrimaryColor }}>{primaryButtonText}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
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
});
