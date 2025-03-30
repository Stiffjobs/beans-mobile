import { BottomSheetFlatList, TouchableOpacity } from "@gorhom/bottom-sheet";
import { BeanProfileListDialogProps } from "./type";
import * as Dialog from "~/components/Dialog";
import { Text } from "../ui/text";
import { useListBeanProfiles } from "~/state/queries/bean_profiles";
import { View } from "react-native";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { t } from "@lingui/core/macro";
export { useDialogControl as useBeanProfileListDialogControl } from "~/components/Dialog";

export function BeanProfileListDialog(props: BeanProfileListDialogProps) {
  return (
    <Dialog.Outer containsList control={props.control}>
      <Inner {...props} />
    </Dialog.Outer>
  );
}

function Inner(props: BeanProfileListDialogProps) {
  const beanProfiles = useListBeanProfiles();

  if (beanProfiles.isLoading) {
    return (
      <Dialog.Inner>
        <Text>Loading...</Text>
      </Dialog.Inner>
    );
  }

  return (
    <Dialog.Inner {...props}>
      <Text className="text-lg font-semibold mb-2">Select Bean Profile</Text>
      <BottomSheetFlatList
        data={beanProfiles.data?.filter((e) => !e.finished) ?? []}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListEmptyComponent={() => (
          <View className="flex flex-1 justify-center items-center">
            <Text>{t`No data yet`}</Text>
          </View>
        )}
        contentContainerClassName={"pb-20"}
        renderItem={({ item: profile }) => (
          <TouchableOpacity
            key={profile._id}
            onPress={() => {
              props.params?.onSelect?.(profile._id);
              props.control.close();
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{profile.roaster}</CardTitle>
                <CardDescription>{profile.origin}</CardDescription>
              </CardHeader>
              <CardContent className="py-2">
                <Details label="Farm" value={profile.farm} />
                <Details label="Varietal" value={profile.variety} />
                <Details label="Process" value={profile.process} />
              </CardContent>
            </Card>
          </TouchableOpacity>
        )}
      />
    </Dialog.Inner>
  );
}

function Details({ label, value }: { label: string; value?: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-muted-foreground">{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}
