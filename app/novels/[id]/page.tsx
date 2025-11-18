'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { NovelWithRelations } from '@/types';

import ChaptersTab from '@/components/novel/ChaptersTab';
import CharactersTab from '@/components/novel/CharactersTab';
import WorldTab from '@/components/novel/WorldTab';
import AnalysisTab from '@/components/novel/AnalysisTab';

export default function NovelPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [novel, setNovel] = useState<NovelWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNovel();
  }, [resolvedParams.id]);

  const fetchNovel = async () => {
    try {
      const res = await fetch(`/api/novels/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setNovel(data);
      }
    } catch (error) {
      console.error('Error fetching novel:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-500">加载中...</div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-500">小说不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="border-b bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{novel.title}</h1>
              {novel.genre && (
                <p className="text-sm text-zinc-500">{novel.genre}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="chapters" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="chapters">章节</TabsTrigger>
            <TabsTrigger value="characters">人物</TabsTrigger>
            <TabsTrigger value="world">世界</TabsTrigger>
            <TabsTrigger value="analysis">分析</TabsTrigger>
          </TabsList>

          <TabsContent value="chapters" className="mt-6">
            <ChaptersTab novel={novel} onUpdate={fetchNovel} />
          </TabsContent>

          <TabsContent value="characters" className="mt-6">
            <CharactersTab novel={novel} onUpdate={fetchNovel} />
          </TabsContent>

          <TabsContent value="world" className="mt-6">
            <WorldTab novel={novel} onUpdate={fetchNovel} />
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <AnalysisTab novel={novel} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
