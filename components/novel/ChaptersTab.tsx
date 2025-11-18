'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NovelWithRelations } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit, Sparkles } from 'lucide-react';

interface Props {
  novel: NovelWithRelations;
  onUpdate: () => void;
}

export default function ChaptersTab({ novel, onUpdate }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newChapter, setNewChapter] = useState({
    title: '',
    outline: '',
  });

  const createChapter = async () => {
    if (!newChapter.title) return;

    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId: novel.id,
          ...newChapter,
        }),
      });

      if (res.ok) {
        const chapter = await res.json();
        setDialogOpen(false);
        setNewChapter({ title: '', outline: '' });
        router.push(`/chapters/${chapter.id}`);
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  };

  const generateOutline = async () => {
    if (!newChapter.title) return;

    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'outline',
          prompt: `为章节"${newChapter.title}"生成详细大纲`,
          novelId: novel.id,
          chapterNumber: novel.chapters.length + 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewChapter({ ...newChapter, outline: data.content });
      }
    } catch (error) {
      console.error('Error generating outline:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">章节管理</h2>
          <p className="text-sm text-zinc-500">
            共 {novel.chapters.length} 章，{novel.chapters.reduce((sum, c) => sum + c.wordCount, 0).toLocaleString()} 字
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              新建章节
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>创建新章节</DialogTitle>
              <DialogDescription>
                第 {novel.chapters.length + 1} 章
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="chapter-title" className="text-sm font-medium">
                  章节标题 *
                </label>
                <Input
                  id="chapter-title"
                  placeholder="例如：初入江湖"
                  value={newChapter.title}
                  onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="chapter-outline" className="text-sm font-medium">
                    章节大纲
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={generateOutline}
                    disabled={!newChapter.title || generating}
                  >
                    <Sparkles className="h-3 w-3" />
                    {generating ? 'AI 生成中...' : 'AI 生成大纲'}
                  </Button>
                </div>
                <Textarea
                  id="chapter-outline"
                  placeholder="章节大纲..."
                  value={newChapter.outline}
                  onChange={(e) => setNewChapter({ ...newChapter, outline: e.target.value })}
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={createChapter} disabled={!newChapter.title}>
                创建并编辑
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {novel.chapters.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 text-center">
            <FileText className="h-12 w-12 text-zinc-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">还没有章节</h3>
            <p className="text-sm text-zinc-500 mb-4">
              点击上方按钮创建第一章
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {novel.chapters.map((chapter) => (
            <Card
              key={chapter.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/chapters/${chapter.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">第 {chapter.number} 章</Badge>
                      <CardTitle className="text-lg">{chapter.title}</CardTitle>
                    </div>
                    {chapter.outline && (
                      <CardDescription className="line-clamp-2 mt-2">
                        {chapter.outline}
                      </CardDescription>
                    )}
                  </div>
                  <Badge
                    variant={
                      chapter.status === 'completed'
                        ? 'default'
                        : chapter.status === 'writing'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {chapter.status === 'completed'
                      ? '已完成'
                      : chapter.status === 'writing'
                      ? '撰写中'
                      : '草稿'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span>{chapter.wordCount.toLocaleString()} 字</span>
                  {chapter.scenes && chapter.scenes.length > 0 && (
                    <span>{chapter.scenes.length} 个场景</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
