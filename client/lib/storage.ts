import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveRun, CompletedRun } from '@/types';

const ACTIVE_RUN_KEY = 'ff4fe_active_run';
const COMPLETED_RUNS_KEY = 'ff4fe_completed_runs';

export async function getActiveRun(): Promise<ActiveRun | null> {
  try {
    const data = await AsyncStorage.getItem(ACTIVE_RUN_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting active run:', error);
    return null;
  }
}

export async function saveActiveRun(run: ActiveRun): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_RUN_KEY, JSON.stringify(run));
  } catch (error) {
    console.error('Error saving active run:', error);
  }
}

export async function clearActiveRun(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_RUN_KEY);
  } catch (error) {
    console.error('Error clearing active run:', error);
  }
}

export async function getCompletedRuns(): Promise<CompletedRun[]> {
  try {
    const data = await AsyncStorage.getItem(COMPLETED_RUNS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting completed runs:', error);
    return [];
  }
}

export async function saveCompletedRun(run: CompletedRun): Promise<void> {
  try {
    const runs = await getCompletedRuns();
    runs.unshift(run);
    await AsyncStorage.setItem(COMPLETED_RUNS_KEY, JSON.stringify(runs));
  } catch (error) {
    console.error('Error saving completed run:', error);
  }
}

export async function deleteCompletedRun(runId: string): Promise<void> {
  try {
    const runs = await getCompletedRuns();
    const filtered = runs.filter((r) => r.id !== runId);
    await AsyncStorage.setItem(COMPLETED_RUNS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting completed run:', error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([ACTIVE_RUN_KEY, COMPLETED_RUNS_KEY]);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}
