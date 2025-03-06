export { useDialogControl as useReportDialogControl } from "~/components/Dialog";
import * as Dialog from "~/components/Dialog";
import { ReportDialogProps } from "./types";
import { Text } from "../ui/text";

export function ReportDialog(props: ReportDialogProps) {
  console.log("props", props.control.isOpen);
  return (
    <Dialog.Outer control={props.control}>
      <Dialog.Handle />
      <ReportDialogInner {...props} />
    </Dialog.Outer>
  );
}
function ReportDialogInner(props: ReportDialogProps) {
  return (
    <Dialog.Inner>
      <Text>Report</Text>
    </Dialog.Inner>
  );
}
