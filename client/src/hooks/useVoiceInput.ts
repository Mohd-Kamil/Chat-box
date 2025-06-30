import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseVoiceInputOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceInput({ onResult, onError }: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      toast({
        title: "Voice input captured",
        description: `"${transcript}"`,
      });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      const errorMessage = getErrorMessage(event.error);
      if (onError) {
        onError(errorMessage);
      }
      toast({
        title: "Voice input error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, [onResult, onError, toast]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      return;
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initializeRecognition();
      }

      if (recognitionRef.current) {
        recognitionRef.current.start();
        toast({
          title: "Listening...",
          description: "Speak now, I'm listening!",
        });
      }
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      toast({
        title: "Failed to start voice input",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [isSupported, isListening, initializeRecognition, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'network':
        return 'Network error occurred during voice recognition';
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone access and try again.';
      case 'no-speech':
        return 'No speech detected. Please try speaking again.';
      case 'audio-capture':
        return 'Audio capture failed. Please check your microphone.';
      case 'aborted':
        return 'Voice recognition was aborted';
      default:
        return 'An error occurred during voice recognition';
    }
  };

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}

// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
