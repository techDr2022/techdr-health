import type { AppLanguage } from "@/lib/i18n";
import { LANGUAGE_OPTIONS } from "@/lib/i18n";

export type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: {
    isFinal: boolean;
    [index: number]: { transcript: string };
  };
};

export function isSpeechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  return Boolean(getSpeechRecognitionConstructor());
}

export function getSpeechRecognitionConstructor():
  | (new () => BrowserSpeechRecognition)
  | undefined {
  if (typeof window === "undefined") return undefined;
  const win = window as Window & {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition;
}

export function getSpeechLocale(language: AppLanguage) {
  return LANGUAGE_OPTIONS.find((option) => option.code === language)?.speechLocale ?? "en-IN";
}

export function extractTranscript(event: SpeechRecognitionResultEvent) {
  let interim = "";
  let finalText = "";

  for (let index = event.resultIndex; index < event.results.length; index += 1) {
    const result = event.results[index];
    const chunk = result[0]?.transcript ?? "";
    if (result.isFinal) {
      finalText += chunk;
    } else {
      interim += chunk;
    }
  }

  return { interim, finalText, combined: `${finalText}${interim}`.trim() };
}
