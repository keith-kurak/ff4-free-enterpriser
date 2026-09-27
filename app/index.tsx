import { Redirect } from "expo-router";

// The old React Navigation linking config mapped "/" to the Current Run tab.
export default function Index() {
  return <Redirect href="/current" />;
}
