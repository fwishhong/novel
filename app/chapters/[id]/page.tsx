'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Sparkles, CheckCircle, AlertCircle, BarChart2 } from 'lucide-react';

interface Chapter {
  id: string;
  number: number;
  title: string;
  outline?: string;
  content?: string;
  wordCount: number;
  status: string;
  novel: {
    id: string;
    title: string;
    characters: any[];
    worldSettings: any[];
    memories: any[];
  };
}

export default function ChapterEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [analyzeDialogOpen, setAnalyzeDialogOpen] = useState(false);

  const [genPrompt, setGenPrompt] = useState('');
  const [genType, setGenType] = useState<'chapter' | 'scene' | 'continue'>('chapter');
  const [genLength, setGenLength] = useState<'short' | 'medium' | 'long'>('medium');

  const [readabilityMetrics, setReadabilityMetrics] = useState<any>(null);
  const [consistencyChecks, setConsistencyChecks] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchChapter();
  }, [resolvedParams.id]);

  const fetchChapter = async () => {
    try {
      const res = await fetch(`/api/chapters/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setChapter(data);
        setContent(data.content || '');
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
    }
  };

  const saveChapter = async () => {
    if (!chapter) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/chapters/${chapter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          status: content.length > 100 ? 'writing' : 'draft',
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setChapter(updated);
      }
    } catch (error) {
      console.error('Error saving chapter:', error);
    } finally {
      setSaving(false);
    }
  };

  const generateContent = async () => {
    if (!chapter || !genPrompt) return;

    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: genType,
          prompt: genPrompt,
          novelId: chapter.novel.id,
          chapterNumber: chapter.number,
          length: genLength,
          existingContent: genType === 'continue' ? content : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (genType === 'continue') {
          setContent(content + '\n\n' + data.content);
        } else {
          setContent(data.content);
        }
        setAiDialogOpen(false);
        setGenPrompt('');
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setGenerating(false);
    }
  };

  const analyzeContent = async () => {
    if (!chapter || !content) return;

    setAnalyzing(true);
    try {
      // Readability analysis
      const readRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'readability',
          content,
        }),
      });

      if (readRes.ok) {
        const readData = await readRes.json();
        setReadabilityMetrics(readData.metrics);
      }

      // Consistency check
      const consRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'consistency',
          content,
          novelId: chapter.novel.id,
        }),
      });

      if (consRes.ok) {
        const consData = await consRes.json();
        setConsistencyChecks(consData.checks || []);
      }

      setAnalyzeDialogOpen(true);
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">第 {chapter.number} 章</Badge>
                  <h1 className="text-lg font-bold">{chapter.title}</h1>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {chapter.novel.title} · {content.length.toLocaleString()} 字
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={analyzeContent}
                disabled={!content || analyzing}
                className="gap-2"
              >
                <BarChart2 className="h-4 w-4" />
                {analyzing ? '分析中...' : '分析'}
              </Button>

              <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI 助手
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>AI 生成助手</DialogTitle>
                    <DialogDescription>
                      让 AI 帮你创作内容
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">生成类型</label>
                      <Select value={genType} onValueChange={(v: any) => setGenType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chapter">完整章节</SelectItem>
                          <SelectItem value="scene">场景描写</SelectItem>
                          <SelectItem value="continue">续写</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">长度</label>
                      <Select value={genLength} onValueChange={(v: any) => setGenLength(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">短 (500-800字)</SelectItem>
                          <SelectItem value="medium">中 (1000-1500字)</SelectItem>
                          <SelectItem value="long">长 (2000-3000字)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">生成要求</label>
                      <Textarea
                        placeholder={
                          genType === 'continue'
                            ? '描述接下来的情节走向...'
                            : '描述你想要的内容...'
                        }
                        value={genPrompt}
                        onChange={(e) => setGenPrompt(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
                      取消
                    </Button>
                    <Button
                      onClick={generateContent}
                      disabled={!genPrompt || generating}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      {generating ? '生成中...' : '生成'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                onClick={saveChapter}
                disabled={saving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-4">
          {/* Main Editor */}
          <div className="md:col-span-3">
            <Card>
              <CardContent className="p-0">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="开始写作..."
                  className="min-h-[600px] border-0 text-base leading-relaxed resize-none focus-visible:ring-0"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            {/* Outline */}
            {chapter.outline && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">章节大纲</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                    {chapter.outline}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Characters */}
            {chapter.novel.characters.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">相关人物</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {chapter.novel.characters.slice(0, 5).map((char: any) => (
                    <div key={char.id} className="text-xs">
                      <div className="font-medium">{char.name}</div>
                      {char.personality && (
                        <div className="text-zinc-500 line-clamp-2">
                          {char.personality}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* World Settings */}
            {chapter.novel.worldSettings.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">世界设定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {chapter.novel.worldSettings.slice(0, 3).map((setting: any) => (
                    <div key={setting.id} className="text-xs">
                      <div className="font-medium">{setting.title}</div>
                      <div className="text-zinc-500 line-clamp-2">
                        {setting.description}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Dialog */}
      <Dialog open={analyzeDialogOpen} onOpenChange={setAnalyzeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>内容分析</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Readability */}
            {readabilityMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">可读性分析</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500">字数：</span>
                      <span className="font-medium">{readabilityMetrics.wordCount}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">句子数：</span>
                      <span className="font-medium">{readabilityMetrics.sentenceCount}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">平均句长：</span>
                      <span className="font-medium">{readabilityMetrics.avgSentenceLength}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">难度：</span>
                      <Badge variant="outline">
                        {readabilityMetrics.readingLevel === 'easy' && '简单'}
                        {readabilityMetrics.readingLevel === 'medium' && '中等'}
                        {readabilityMetrics.readingLevel === 'hard' && '较难'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-zinc-500">情感：</span>
                      <Badge variant="outline">
                        {readabilityMetrics.sentiment === 'positive' && '积极'}
                        {readabilityMetrics.sentiment === 'negative' && '消极'}
                        {readabilityMetrics.sentiment === 'neutral' && '中性'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-zinc-500">节奏：</span>
                      <Badge variant="outline">
                        {readabilityMetrics.pacing === 'fast' && '快'}
                        {readabilityMetrics.pacing === 'medium' && '中'}
                        {readabilityMetrics.pacing === 'slow' && '慢'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Consistency */}
            {consistencyChecks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">一致性检查</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {consistencyChecks.map((check, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {check.isConsistent ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {check.type === 'character' && '人物一致性'}
                          {check.type === 'timeline' && '时间线一致性'}
                          {check.type === 'setting' && '设定一致性'}
                          {check.type === 'plot' && '情节一致性'}
                        </div>
                        {check.conflicts && check.conflicts.length > 0 && (
                          <ul className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 space-y-1">
                            {check.conflicts.map((conflict: string, i: number) => (
                              <li key={i}>• {conflict}</li>
                            ))}
                          </ul>
                        )}
                        {check.suggestions && check.suggestions.length > 0 && (
                          <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                            {check.suggestions.map((suggestion: string, i: number) => (
                              <li key={i}>💡 {suggestion}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
