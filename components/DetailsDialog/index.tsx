import { DetailsDialogProps } from "./types";
import * as Dialog from "~/components/Dialog";
import { Text } from "../ui/text";
import { useCallback } from "react";
import { View } from "react-native";
import { IconName, StyledIcon } from "~/view/com/icons/StyledIcons";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { Separator } from "../ui/separator";
import { cn } from "~/lib/utils";
import { useModalControls, useModals } from "~/state/modals";
export { useDialogControl as useDetailsDialogControl } from "~/components/Dialog";

export function DetailsDialog(props: DetailsDialogProps) {
  return (
    <Dialog.Outer
      snapPoints={Dialog.BottomSheetSnapPoint.Quarter}
      control={props.control}
    >
      <DetailsDialogInner {...props} />
    </Dialog.Outer>
  );
}

function DetailsDialogInner(props: DetailsDialogProps) {
  const handleDelete = useCallback(() => {}, []);
  const handleEdit = () => {
    props.control.close();
    props.params.openModal();
  };
  return (
    <Dialog.ScrollableInner>
      <View className="flex-1 mx-8 bg-accent my-8 rounded-2xl">
        <DetailsDialogItem onPress={handleEdit} icon="Pen" label="Edit" />
        <Separator />
        <DetailsDialogItem
          destructive
          onPress={handleDelete}
          icon="Trash"
          label="Delete"
        />
      </View>
    </Dialog.ScrollableInner>
  );
}

function DetailsDialogItem({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: IconName;
  destructive?: boolean;
  label: string;
  onPress?: () => void;
}) {
  const handlePress = onPress ?? (() => alert("test"));
  return (
    <TouchableOpacity onPress={handlePress}>
      <View className="flex-row p-4 items-center gap-4">
        <StyledIcon
          name={icon}
          className={cn(
            "w-5 h-5 text-primary",
            destructive && "text-destructive",
          )}
        />
        <Text
          className={cn(
            destructive && "text-destructive",
            "font-semibold text-lg",
          )}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
