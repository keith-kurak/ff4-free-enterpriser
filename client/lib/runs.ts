import AsyncStorage from "@react-native-async-storage/async-storage";
import { Run } from "@/types";

// Storage for flagset-based runs. The legacy keys in storage.ts are left as they
// are: a legacy active run is no longer shown, and legacy completed runs are
// read only for the history screen.
const CURRENT_RUN_KEY = "ff4fe_v2_current_run";
const COMPLETED_RUNS_KEY = "ff4fe_v2_completed_runs";

export async function getCurrentRun(): Promise<Run | null> {
  try {
    const data = await AsyncStorage.getItem(CURRENT_RUN_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting current run:", error);
    return null;
  }
}

export async function saveCurrentRun(run: Run): Promise<void> {
  try {
    await AsyncStorage.setItem(CURRENT_RUN_KEY, JSON.stringify(run));
  } catch (error) {
    console.error("Error saving current run:", error);
  }
}

export async function clearCurrentRun(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CURRENT_RUN_KEY);
  } catch (error) {
    console.error("Error clearing current run:", error);
  }
}

export async function getRuns(): Promise<Run[]> {
  try {
    const data = await AsyncStorage.getItem(COMPLETED_RUNS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting runs:", error);
    return [];
  }
}

export async function completeRun(run: Run): Promise<void> {
  try {
    const runs = await getRuns();
    runs.unshift(run);
    await AsyncStorage.setItem(COMPLETED_RUNS_KEY, JSON.stringify(runs));
    await AsyncStorage.removeItem(CURRENT_RUN_KEY);
  } catch (error) {
    console.error("Error completing run:", error);
  }
}

export async function deleteRun(runId: string): Promise<void> {
  try {
    const runs = await getRuns();
    await AsyncStorage.setItem(
      COMPLETED_RUNS_KEY,
      JSON.stringify(runs.filter((r) => r.id !== runId)),
    );
  } catch (error) {
    console.error("Error deleting run:", error);
  }
}
