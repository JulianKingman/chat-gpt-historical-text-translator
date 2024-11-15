import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface TranslationResultProps {
  translatedText: string;
  isTranslating: boolean;
  currentChunk: number;
  totalChunks: number;
}

export function TranslationResult({
  translatedText,
  isTranslating,
  currentChunk,
  totalChunks,
}: TranslationResultProps) {
  return (
    <div className="mt-4">
      <Label className="text-base font-semibold mb-2">Translation Result</Label>
      <Textarea
        value={translatedText}
        readOnly
        className="w-full h-48 bg-gray-700 text-gray-100 border-gray-600"
      />
      {isTranslating && (
        <p className="text-sm text-gray-400 mt-2">
          Translating chunk {currentChunk} of {totalChunks}...
        </p>
      )}
    </div>
  );
}
