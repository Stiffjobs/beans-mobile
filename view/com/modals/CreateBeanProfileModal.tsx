import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useModalControls } from "~/state/modals";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { createBeanProfileSchema } from "~/lib/schemas";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/input/Input";
import { ErrorMessage } from "~/components/ErrorMessage";
import { RequiredLabel } from "~/components/RequiredLabel";
import { useCreateBeanProfile } from "~/state/queries/bean_profiles";
import { ChevronDown } from "~/lib/icons/ChevronDown";
import { X } from "~/lib/icons";
export const snapPoints = ["fullscreen"];

export function Component() {
  const createBeanProfileMutation = useCreateBeanProfile();
  const form = useForm({
    defaultValues: {
      origin: "",
      roaster: "",
      producer: "",
      farm: "",
      process: "",
      variety: "",
      elevation: "",
      description: undefined,
      finished: false,
    } as z.infer<typeof createBeanProfileSchema>,
    validators: {
      onMount: createBeanProfileSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      await createBeanProfileMutation.mutateAsync({ ...value });
    },
  });
  return (
    <>
      <Header />
      <KeyboardAwareScrollView>
        <View className="flex-1 px-10 gap-4">
          <form.Field name="origin">
            {(field) => (
              <View className="gap-2">
                <RequiredLabel>Origin</RequiredLabel>
                <Input
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="e.g. Alishan, Chiayi, Taiwan"
                />
                <ErrorMessage
                  message={field.state.meta.errors
                    .map((e) => e?.message)
                    .join(", ")}
                />
              </View>
            )}
          </form.Field>
          <form.Field name="roaster">
            {(field) => (
              <View className="gap-2">
                <RequiredLabel>Roaster</RequiredLabel>
                <Input
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="e.g. SEY"
                />
                <ErrorMessage
                  message={field.state.meta.errors
                    .map((e) => e?.message)
                    .join(", ")}
                />
              </View>
            )}
          </form.Field>
          <form.Field name="producer">
            {(field) => (
              <View className="gap-2">
                <RequiredLabel>Producer</RequiredLabel>
                <Input
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="e.g. Cheng-Lun Fang"
                />
                <ErrorMessage
                  message={field.state.meta.errors
                    .map((e) => e?.message)
                    .join(", ")}
                />
              </View>
            )}
          </form.Field>
          <form.Field name="farm">
            {(field) => (
              <View className="gap-2">
                <RequiredLabel>Farm</RequiredLabel>
                <Input
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="e.g. Zou Zhou Yuan Estate"
                />
                <ErrorMessage
                  message={field.state.meta.errors
                    .map((e) => e?.message)
                    .join(", ")}
                />
              </View>
            )}
          </form.Field>
          <form.Field name="process">
            {(field) => (
              <View className="gap-2">
                <RequiredLabel>Process</RequiredLabel>
                <Input
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="e.g. Washed"
                />
                <ErrorMessage
                  message={field.state.meta.errors
                    .map((e) => e?.message)
                    .join(", ")}
                />
              </View>
            )}
          </form.Field>
          <form.Field name="variety">
            {(field) => (
              <View className="gap-2">
                <RequiredLabel>Variety</RequiredLabel>
                <Input
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="e.g. Gesha"
                />
                <ErrorMessage
                  message={field.state.meta.errors
                    .map((e) => e?.message)
                    .join(", ")}
                />
              </View>
            )}
          </form.Field>
          <form.Field name="elevation">
            {(field) => (
              <View className="gap-2">
                <RequiredLabel>Elevation</RequiredLabel>
                <Input
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="e.g. 1300 masl"
                />
                <ErrorMessage
                  message={field.state.meta.errors
                    .map((e) => e?.message)
                    .join(", ")}
                />
              </View>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <View className="gap-2">
                <Label>Description (Optional)</Label>
                <Input
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  placeholder="Add any additional notes about the bean"
                  multiline
                  numberOfLines={4}
                />
                <ErrorMessage
                  message={field.state.meta.errors
                    .map((e) => e?.message)
                    .join(", ")}
                />
              </View>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                onPress={form.handleSubmit}
                disabled={!canSubmit || isSubmitting}
              >
                <Text>{isSubmitting ? "Submitting..." : "Submit"}</Text>
              </Button>
            )}
          />
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}

function Header() {
  const { closeModal } = useModalControls();

  return (
    <View className="flex-row justify-between items-center p-4">
      <View />
      <Button variant={"ghost"} size={"icon"} onPress={closeModal}>
        <X className="text-primary" />
      </Button>
    </View>
  );
}
