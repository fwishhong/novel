'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Users, FileText } from 'lucide-react';

interface Novel {
  id: string;
  title: string;
  genre?: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    chapters: number;
    characters: number;
  };
}

export default function Home() {
  const router = useRouter();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newNovel, setNewNovel] = useState({
    title: '',
    genre: '',
    description: '',
    outline: '',
  });

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const res = await fetch('/api/novels?userId=default-user');
      const data = await res.json();
      setNovels(data);
    } catch (error) {
      console.error('Error fetching novels:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNovel = async () => {
    if (!newNovel.title) return;

    try {
      const res = await fetch('/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newNovel, userId: 'default-user' }),
      });

      if (res.ok) {
        const novel = await res.json();
        setDialogOpen(false);
        setNewNovel({ title: '', genre: '', description: '', outline: '' });
        router.push(`/novels/${novel.id}`);
      }
    } catch (error) {
      console.error('Error creating novel:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            小说创作工作室
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            AI 辅助的长篇网络小说创作平台
          </p>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {novels.length} 部作品
            </Badge>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                创建新小说
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>创建新小说</DialogTitle>
                <DialogDescription>
                  填写基本信息，开始你的创作之旅
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    小说标题 *
                  </label>
                  <Input
                    id="title"
                    placeholder="例如：修真世界的奇幻冒险"
                    value={newNovel.title}
                    onChange={(e) => setNewNovel({ ...newNovel, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="genre" className="text-sm font-medium">
                    类型
                  </label>
                  <Input
                    id="genre"
                    placeholder="例如：玄幻、都市、科幻等"
                    value={newNovel.genre}
                    onChange={(e) => setNewNovel({ ...newNovel, genre: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    简介
                  </label>
                  <Textarea
                    id="description"
                    placeholder="简短描述你的小说内容..."
                    value={newNovel.description}
                    onChange={(e) => setNewNovel({ ...newNovel, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="outline" className="text-sm font-medium">
                    大纲（可选）
                  </label>
                  <Textarea
                    id="outline"
                    placeholder="整体故事大纲和主线..."
                    value={newNovel.outline}
                    onChange={(e) => setNewNovel({ ...newNovel, outline: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={createNovel} disabled={!newNovel.title}>
                  创建
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Novels Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-zinc-500">加载中...</div>
          </div>
        ) : novels.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
              <BookOpen className="h-12 w-12 text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">还没有作品</h3>
              <p className="text-sm text-zinc-500 mb-4">
                点击上方按钮创建你的第一部小说
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {novels.map((novel) => (
              <Card
                key={novel.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/novels/${novel.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-1">{novel.title}</CardTitle>
                      {novel.genre && (
                        <Badge variant="secondary" className="text-xs">
                          {novel.genre}
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant={
                        novel.status === 'completed'
                          ? 'default'
                          : novel.status === 'writing'
                          ? 'outline'
                          : 'secondary'
                      }
                    >
                      {novel.status === 'completed'
                        ? '已完结'
                        : novel.status === 'writing'
                        ? '连载中'
                        : '草稿'}
                    </Badge>
                  </div>
                  {novel.description && (
                    <CardDescription className="line-clamp-2 mt-2">
                      {novel.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{novel._count.chapters} 章</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{novel._count.characters} 人物</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">
                    更新于 {new Date(novel.updatedAt).toLocaleDateString('zh-CN')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
