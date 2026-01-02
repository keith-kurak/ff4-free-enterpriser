import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { RootStackParamList } from "./RootStackNavigator";

const prefix = Linking.createURL("/");

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix],
  config: {
    screens: {
      Main: {
        path: "",
        screens: {
          CurrentRunTab: {
            path: "current",
            screens: {
              CurrentRun: "",
              NewRun: "new",
              CompleteRun: "complete",
            },
          },
          HistoryTab: {
            path: "history",
            screens: {
              History: "",
              RunDetail: ":runId",
            },
          },
          ReferenceTab: {
            path: "reference",
            screens: {
              Reference: "",
              VanillaStory: "vanilla-story",
              ShopLocations: "shops",
              VanillaKeyItemLocations: "vanilla-key-items",
              FEKeyItems: "fe-key-items",
              FEKeyItemLocations: "fe-key-item-locations",
            },
          },
        },
      },
      About: "about",
      Privacy: "privacy",
    },
  },
};
