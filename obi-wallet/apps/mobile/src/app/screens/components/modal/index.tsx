import { StyleSheet, View } from "react-native";
import RNModal, { ModalProps as RNModalProps } from "react-native-modal";

export interface ModalProps extends Partial<RNModalProps> {
  isVisible: boolean;
  onClose: () => void;
}

export const MODAL_TIMING = 500;

export function Modal({ children, isVisible, onClose, ...props }: ModalProps) {
  return (
    <RNModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationInTiming={MODAL_TIMING}
      animationOutTiming={MODAL_TIMING}
      backdropTransitionInTiming={MODAL_TIMING}
      backdropTransitionOutTiming={MODAL_TIMING}
      backdropOpacity={0.6}
      {...props}
    >
      <ModalContainer>{children}</ModalContainer>
    </RNModal>
  );
}

function ModalContainer({ children }: { children?: React.ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#110F1D",
    borderRadius: 12,
    padding: 20,
  },
});
