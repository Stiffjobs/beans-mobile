import React, { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import PagerView from "react-native-pager-view";
import { Label } from "~/components/ui/label";
import { H4 } from "~/components/ui/typography";
import { Text } from "~/components/ui/text";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Input } from "~/components/ui/input";
import { RequiredLabel } from "~/components/RequiredLabel";
import { editPostSchema } from "~/lib/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimeMaskInput } from "../time/TimeMaskInput";
import Slider from "@react-native-community/slider";
import { SelectRoastLevel } from "~/components/SelectRoastLevel";
import { RoastLevelEnum } from "~/lib/constants";
import { useModalControls } from "~/state/modals";
import { Button } from "~/components/ui/button";
import { WindowOverlay } from "../util/WindowOverlay";
import { PortalHost } from "@rn-primitives/portal";
import { Separator } from "@rn-primitives/select";
import { Pager } from "../pager/Pager";

export const snapPoints = ["fullscreen"];
type FormFields = z.infer<typeof editPostSchema>;

export function Component() {
  const form = useForm<FormFields>({
    resolver: zodResolver(editPostSchema),
  });
  const [activePage, setActivePage] = React.useState(0);
  const pagerRef = useRef<PagerView>(null);
  const { closeModal } = useModalControls();

  return (
    <>
      <View className="flex flex-row justify-between p-4 bg-background">
        <Button onPress={closeModal} variant={"ghost"} size="sm">
          <Text className="text-destructive">Cancel</Text>
        </Button>
        <Text>{activePage + 1}/2</Text>
        <Button onPress={closeModal} variant={"secondary"} size="sm">
          <Text>Save</Text>
        </Button>
      </View>
      <Separator />
      <Pager
        ref={pagerRef}
        onPageSelected={(index) => {
          setActivePage(index);
        }}
        initialPage={activePage}
      >
        <KeyboardAwareScrollView key={1}>
          <View className="flex-1 px-10 mt-6 mb-20 gap-2">
            <Label>Created on</Label>
            <Text className="text-sm text-muted-foreground mb-2">
              Fields marked with <Text className="text-destructive">*</Text> are
              required
            </Text>
            <Controller
              control={form.control}
              name="bean"
              render={({ field: { onChange } }) => {
                return (
                  <>
                    <RequiredLabel>Bean</RequiredLabel>
                    <Input
                      multiline={false}
                      numberOfLines={1}
                      onChangeText={onChange}
                    />
                    {form.formState.errors?.bean && (
                      <ErrorMessage
                        message={form.formState?.errors?.bean.message}
                      />
                    )}
                  </>
                );
              }}
            />
            <Controller
              control={form.control}
              name="roastLevel"
              render={({ field: { onChange } }) => (
                <>
                  <RequiredLabel>Roast level</RequiredLabel>
                  <SelectRoastLevel
                    portalHost={EDIT_POST_SELECT_PORTAL}
                    placeholder="Select a roast level"
                    options={Object.values(RoastLevelEnum).map((value) => ({
                      label: value,
                      value: value,
                    }))}
                    onChange={onChange}
                  />
                  {form.formState.errors.roastLevel && (
                    <ErrorMessage
                      message={form.formState.errors.roastLevel.message}
                    />
                  )}
                </>
              )}
            />
            <Controller
              control={form.control}
              name="coffeeIn"
              render={({ field: { onChange } }) => (
                <>
                  <RequiredLabel>Coffee in (g)</RequiredLabel>
                  <Input numberOfLines={1} onChangeText={onChange} />
                  {form.formState.errors.coffeeIn && (
                    <ErrorMessage
                      message={form.formState.errors.coffeeIn.message}
                    />
                  )}
                </>
              )}
            />
            <Controller
              control={form.control}
              name="ratio"
              render={({ field: { onChange } }) => (
                <>
                  <Label>Ratio</Label>
                  <Input numberOfLines={1} onChangeText={onChange} />
                  {form.formState.errors.ratio && (
                    <ErrorMessage
                      message={form.formState.errors.coffeeIn?.message}
                    />
                  )}
                </>
              )}
            />
            <Controller
              control={form.control}
              name="beverageWeight"
              render={({ field: { onChange } }) => (
                <>
                  <RequiredLabel>Beverage weight(g)</RequiredLabel>
                  <Input numberOfLines={1} onChangeText={onChange} />
                  {form.formState.errors.beverageWeight && (
                    <ErrorMessage
                      message={form.formState.errors.beverageWeight.message}
                    />
                  )}
                </>
              )}
            />
            <Controller
              control={form.control}
              name="brewTemperature"
              render={({ field: { onChange } }) => (
                <>
                  <RequiredLabel>Brew temperature (°C)</RequiredLabel>
                  <Input
                    numberOfLines={1}
                    onChangeText={onChange}
                    keyboardType="numeric"
                  />
                  {form.formState.errors.brewTemperature && (
                    <ErrorMessage
                      message={form.formState.errors.brewTemperature.message}
                    />
                  )}
                </>
              )}
            />
            {/* TODO: this should look like a dropdown with options */}
            <Controller
              name="filterPaper"
              control={form.control}
              render={({ field: { onChange } }) => (
                <>
                  <RequiredLabel>Filter paper</RequiredLabel>
                  <Input numberOfLines={1} onChangeText={onChange} />
                  {form.formState.errors.filterPaper && (
                    <ErrorMessage
                      message={form.formState.errors.filterPaper.message}
                    />
                  )}
                </>
              )}
            />
            <Controller
              control={form.control}
              name="brewingWater"
              render={({ field: { onChange } }) => (
                <>
                  <RequiredLabel>Brewing water (ppm)</RequiredLabel>
                  <Input numberOfLines={1} onChangeText={onChange} />
                  {form.formState.errors.brewingWater && (
                    <ErrorMessage
                      message={form.formState.errors.brewingWater.message}
                    />
                  )}
                </>
              )}
            />
            {/* TODO: this should look like a dropdown with options */}
            <Controller
              control={form.control}
              name="grinder"
              render={({ field: { onChange } }) => (
                <>
                  <RequiredLabel>Grinder</RequiredLabel>
                  <Input numberOfLines={1} onChangeText={onChange} />
                  {form.formState.errors.grinder && (
                    <ErrorMessage
                      message={form.formState.errors.grinder.message}
                    />
                  )}
                </>
              )}
            />
            {/* TODO: this should look like  */}
            <Controller
              control={form.control}
              name="grindSetting"
              render={({ field: { onChange } }) => (
                <>
                  <RequiredLabel>Grind setting</RequiredLabel>
                  <Input numberOfLines={1} onChangeText={onChange} />
                  {form.formState.errors.grindSetting && (
                    <ErrorMessage
                      message={form.formState.errors.grindSetting.message}
                    />
                  )}
                </>
              )}
            />
            <Controller
              control={form.control}
              name="bloomTime"
              render={({ field: { onChange, value } }) => {
                return (
                  <>
                    <RequiredLabel>Bloom time</RequiredLabel>
                    <TimeMaskInput value={value} onChange={onChange} />
                    {form.formState.errors.bloomTime && (
                      <ErrorMessage
                        message={form.formState.errors.bloomTime.message}
                      />
                    )}
                  </>
                );
              }}
            />
            <Controller
              control={form.control}
              name="totalDrawdownTime"
              render={({ field: { onChange, value } }) => {
                return (
                  <>
                    <RequiredLabel>Total drawdown time</RequiredLabel>
                    <TimeMaskInput value={value} onChange={onChange} />
                    {form.formState.errors.totalDrawdownTime && (
                      <ErrorMessage
                        message={
                          form.formState.errors.totalDrawdownTime.message
                        }
                      />
                    )}
                  </>
                );
              }}
            />
            {/* INFO: under is for optional fields */}
            <Controller
              control={form.control}
              name="methodName"
              render={({ field: { onChange } }) => (
                <>
                  <Label>Preparation method</Label>
                  <Input onChangeText={onChange} />
                  {form.formState.errors.methodName && (
                    <ErrorMessage
                      message={form.formState.errors.methodName.message}
                    />
                  )}
                </>
              )}
            />
            <Controller
              control={form.control}
              name="brewer"
              render={({ field: { onChange } }) => (
                <>
                  <Label>Brewer</Label>
                  <Input onChangeText={onChange} />
                  {form.formState.errors.brewer && (
                    <ErrorMessage
                      message={form.formState.errors.brewer.message}
                    />
                  )}
                </>
              )}
            />
            <Controller
              control={form.control}
              name="otherTools"
              render={({ field: { onChange } }) => (
                <>
                  <Label>Other tools</Label>
                  <Input onChangeText={onChange} />
                  {form.formState.errors.otherTools && (
                    <ErrorMessage
                      message={form.formState.errors.otherTools.message}
                    />
                  )}
                </>
              )}
            />
            <Controller
              control={form.control}
              name="flavor"
              render={({ field: { onChange } }) => (
                <>
                  <Label>Flavor</Label>
                  <Input onChangeText={onChange} />
                  {form.formState.errors.flavor && (
                    <ErrorMessage
                      message={form.formState.errors.flavor?.message}
                    />
                  )}
                </>
              )}
            />
            <Controller
              control={form.control}
              name="tds"
              render={({ field: { onChange, value } }) => (
                <>
                  <Label>TDS</Label>
                  <Slider
                    minimumValue={1.0}
                    maximumValue={2.0}
                    step={0.01}
                    onValueChange={(newValue) => {
                      onChange(newValue);
                      // Calculate and set EY when TDS changes
                      const beverageWeight = parseFloat(
                        form.getValues("beverageWeight") || "0",
                      );
                      const coffeeIn = parseFloat(
                        form.getValues("coffeeIn") || "0",
                      );
                      if (beverageWeight && coffeeIn) {
                        const ey = (newValue * beverageWeight) / coffeeIn;
                        form.setValue("ey", ey);
                      }
                    }}
                  />
                  <Text>{value?.toFixed(2)}</Text>
                  {form.formState.errors.tds && (
                    <ErrorMessage message={form.formState.errors.tds.message} />
                  )}
                </>
              )}
            />
            <Controller
              control={form.control}
              name="ey"
              render={({ field: { value } }) => (
                <>
                  <Label>Extraction Yield (%)</Label>
                  <H4>{value?.toFixed(2)}%</H4>
                  {form.formState.errors.ey && (
                    <ErrorMessage message={form.formState.errors.ey.message} />
                  )}
                </>
              )}
            />
          </View>
        </KeyboardAwareScrollView>
        <KeyboardAwareScrollView key={2}>
          <Text>Helloworld</Text>
        </KeyboardAwareScrollView>
      </Pager>
      <WindowOverlay>
        <PortalHost name={EDIT_POST_SELECT_PORTAL} />
      </WindowOverlay>
    </>
  );
}
const EDIT_POST_SELECT_PORTAL = "edit-post-select";
