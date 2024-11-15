'use client';

import { useState } from 'react';
import { Clipboard, Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TranslationResult } from '@/components/TranslationResult';
import { TranslationQueue } from '@/lib/translation/TranslationQueue';
import { TRANSLATION_TONES, CHUNK_SIZE, BATCH_SIZE } from '@/lib/constants';
import { chunkText, createTranslationPrompt } from '@/lib/utils/text';

export default function TranslationApp() {
  const [input, setInput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [doubleCheck, setDoubleCheck] = useState(false);
  const [translationTone, setTranslationTone] = useState('literal');
  const [isCompleted, setIsCompleted] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setInput(text);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setInput(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    setProgress(0);
    setIsCompleted(false);
    setTranslatedText('');

    const chunks = chunkText(input, CHUNK_SIZE);
    setTotalChunks(chunks.length);
    setCurrentChunk(0);

    const queue = new TranslationQueue(BATCH_SIZE, (index, result) => {
      setCurrentChunk(prev => prev + 1);
      setProgress(((index + 1) / chunks.length) * 100);
    });

    try {
      const queueItems = chunks.map((chunk, index) => ({
        chunk,
        index,
        prompt: createTranslationPrompt(chunk, translationTone),
      }));

      const results = await queue.add(queueItems);
      setTranslatedText(results.join('\n').trim());
      setIsCompleted(true);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownload = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], {
      type: 'text/plain;charset=utf-8',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `translation-${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-3xl bg-gray-800 text-gray-100">
        <CardContent className="space-y-6 p-6">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text Input</TabsTrigger>
              <TabsTrigger value="file">File Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="space-y-4">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Enter text to translate..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-grow bg-gray-700 text-gray-100 border-gray-600"
                />
                <Button
                  onClick={handlePaste}
                  variant="outline"
                  size="icon"
                  className="bg-gray-700 text-gray-100 border-gray-600"
                >
                  <Clipboard className="h-4 w-4" />
                  <span className="sr-only">Paste from clipboard</span>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="file" className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <Label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-400">TXT files only</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".txt"
                  />
                </Label>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="double-check"
              checked={doubleCheck}
              onCheckedChange={checked => setDoubleCheck(checked as boolean)}
              className="border-gray-400 text-primary"
            />
            <Label
              htmlFor="double-check"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Double-check translation
            </Label>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Translation Tone</Label>
            <RadioGroup
              value={translationTone}
              onValueChange={setTranslationTone}
              className="grid grid-cols-1 gap-2"
            >
              {TRANSLATION_TONES.map(({ value, label, description }) => (
                <div
                  key={value}
                  className="flex items-center space-x-2 bg-gray-700 rounded-md p-4"
                >
                  <RadioGroupItem
                    value={value}
                    id={value}
                    className="border-gray-400 text-primary"
                  />
                  <div className="flex flex-col">
                    <Label htmlFor={value} className="text-sm font-medium">
                      {label}
                    </Label>
                    <p className="text-sm text-gray-400 mt-1">{description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {(isTranslating || translatedText) && (
            <TranslationResult
              translatedText={translatedText}
              isTranslating={isTranslating}
              currentChunk={currentChunk}
              totalChunks={totalChunks}
            />
          )}
          {isTranslating && <Progress value={progress} className="w-full" />}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={handleTranslate}
            disabled={isTranslating || !input}
            className="w-full"
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Translating...
              </>
            ) : (
              'Translate'
            )}
          </Button>
          {isCompleted && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="ml-2 bg-gray-700 text-gray-100 border-gray-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
