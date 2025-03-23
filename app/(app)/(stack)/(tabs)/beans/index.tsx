import { Pressable, useWindowDimensions, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useState } from "react";
import { useModalControls } from "~/state/modals";
import { FAB } from "~/components/FAB";
import { useListBeanProfiles } from "~/state/queries/bean_profiles";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { RefreshControl } from "react-native";
import { BeanProfileProps } from "~/lib/types";
import {
  NavigationState,
  Route,
  SceneRendererProps,
  TabDescriptor,
  TabView,
} from "react-native-tab-view";
import { BlockDrawerGesture } from "~/view/shell/BlockDrawerGesture";
import { CustomTabBar } from "~/view/com/pager/TabBar";
import { Muted } from "~/components/ui/typography";

const renderTabBar = (
  props: SceneRendererProps & {
    navigationState: NavigationState<Route>;
    options: Record<string, TabDescriptor<Route>> | undefined;
  },
) => {
  const { options, ...rest } = props;
  return (
    <BlockDrawerGesture>
      <CustomTabBar
        className="bg-background"
        tabStyle={{ width: "auto" }}
        activeClassName="text-primary"
        inactiveClassName="text-primary/50"
        indicatorClassName="bg-primary/75"
        {...rest}
      />
    </BlockDrawerGesture>
  );
};

interface ScreenProps {
  data: BeanProfileProps[];
  refreshing: boolean;
  handlePTR: () => void;
}
export default function Beans() {
  const { openModal } = useModalControls();
  const openCreateBeanProfileModal = useCallback(() => {
    openModal({ name: "create-bean-profile" });
  }, [openModal]);

  const fetchListBeanProfiles = useListBeanProfiles();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchListBeanProfiles.refetch();
    setRefreshing(false);
  }, [fetchListBeanProfiles]);
  const routes = [
    { key: "unfinished", title: "Unfinished" },
    { key: "finished", title: "Finished" },
  ];
  const [index, setIndex] = useState(0);
  const layout = useWindowDimensions();
  const finished =
    fetchListBeanProfiles.data?.filter((profile) => profile.finished) ?? [];
  const unfinished =
    fetchListBeanProfiles.data?.filter((profile) => !profile.finished) ?? [];
  const renderScene = useCallback(
    (
      props: SceneRendererProps & {
        route: {
          key: string;
        };
      },
    ) => {
      switch (props.route.key) {
        case "unfinished":
          return (
            <UnFinishedBeanProfiles
              data={unfinished}
              refreshing={refreshing}
              handlePTR={handleRefresh}
            />
          );
        case "finished":
          return (
            <FinishedBeanProfiles
              data={finished}
              refreshing={refreshing}
              handlePTR={handleRefresh}
            />
          );
      }
    },
    [fetchListBeanProfiles.data],
  );

  return (
    <View className="flex-1">
      <TabView
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        navigationState={{ index, routes }}
      />
      <FAB iconName="PackagePlus" onPress={openCreateBeanProfileModal} />
    </View>
  );
}

function UnFinishedBeanProfiles({ data, refreshing, handlePTR }: ScreenProps) {
  return (
    <FlashList
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handlePTR} />
      }
      contentContainerClassName="pt-6"
      estimatedItemSize={200}
      ItemSeparatorComponent={() => <View className="h-2" />}
      data={data}
      ListEmptyComponent={() => (
        <Muted className="text-center">No data yet</Muted>
      )}
      renderItem={({ item }) => <BeanProfileCard {...item} />}
    />
  );
}
function FinishedBeanProfiles({ data, refreshing, handlePTR }: ScreenProps) {
  return (
    <FlashList
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handlePTR} />
      }
      estimatedItemSize={200}
      ListEmptyComponent={() => (
        <Muted className="text-center">No data yet</Muted>
      )}
      ItemSeparatorComponent={() => <View className="h-2" />}
      contentContainerClassName="pt-6"
      data={data}
      renderItem={({ item }) => <BeanProfileCard {...item} />}
    />
  );
}

function BeanProfileCard(profile: BeanProfileProps) {
  const { openModal } = useModalControls();
  const handlePress = useCallback(() => {
    openModal({
      name: "edit-bean-profile",
      id: profile._id,
    });
  }, [profile._id]);

  return (
    <Pressable onPress={handlePress}>
      <Card className="mx-4">
        <CardHeader>
          <View className="flex flex-col">
            <CardTitle className="text-primary">{profile.origin}</CardTitle>
            <CardDescription>{profile.producer}</CardDescription>
          </View>
        </CardHeader>

        <CardContent className="py-1 gap-2">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Roaster</Text>
            <Text className="text-foreground">{profile.roaster}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Variety</Text>
            <Text className="text-foreground">{profile.variety}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Farm</Text>
            <Text className="text-foreground">{profile.farm}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Process</Text>
            <Text className="text-foreground">{profile.process}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Elevation</Text>
            <Text className="text-foreground">{profile.elevation}</Text>
          </View>
        </CardContent>

        <CardFooter>
          {profile.description && (
            <Text className="text-muted-foreground text-sm ml-2">
              · {profile.description}
            </Text>
          )}
        </CardFooter>
      </Card>
    </Pressable>
  );
}
