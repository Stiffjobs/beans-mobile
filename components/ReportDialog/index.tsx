export { useDialogControl as useReportDialogControl } from "~/components/Dialog";
import * as Dialog from "~/components/Dialog";
import { ReportDialogProps } from "./types";
import { Text } from "../ui/text";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { useModalControls } from "~/state/modals";

export function ReportDialog(props: ReportDialogProps) {
  return (
    <Dialog.Outer control={props.control}>
      <ReportDialogInner {...props} />
    </Dialog.Outer>
  );
}
function ReportDialogInner(props: ReportDialogProps) {
  const { openModal } = useModalControls();
  const handleOpenModal = () => {
    props.control.close();
    openModal({
      name: "edit-post",
    });
  };
  return (
    <Dialog.Inner>
      <TouchableOpacity onPress={handleOpenModal}>
        <Text>Open modal btn</Text>
      </TouchableOpacity>
    </Dialog.Inner>
  );
}
