'use client';

import { useState } from 'react';
import { NovelWithRelations } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, TrendingUp, FileText, AlertCircle } from 'lucide-react';

interface Props {
  novel: NovelWithRelations;
}

export default function AnalysisTab({ novel }: Props) {
  const [tensionData, setTensionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeTension = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tension',
          novelId: novel.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTensionData(data.tensionCurve);
      }
    } catch (error) {
      console.error('Error analyzing tension:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalWords = novel.chapters.reduce((sum, c) => sum + c.wordCount, 0);
  const avgChapterLength = novel.chapters.length > 0
    ? Math.round(totalWords / novel.chapters.length)
    : 0;

  const completedChapters = novel.chapters.filter(c => c.status === 'completed').length;
  const completionRate = novel.chapters.length > 0
    ? Math.round((completedChapters / novel.chapters.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">数据分析</h2>
        <p className="text-sm text-zinc-500">
          了解你的作品统计信息和质量指标
        </p>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>总字数</CardDescription>
            <CardTitle className="text-3xl">{totalWords.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500">
              {novel.chapters.length} 章
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>平均章节长度</CardDescription>
            <CardTitle className="text-3xl">{avgChapterLength.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500">字/章</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>完成度</CardDescription>
            <CardTitle className="text-3xl">{completionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500">
              {completedChapters} / {novel.chapters.length} 章已完成
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>人物数量</CardDescription>
            <CardTitle className="text-3xl">{novel.characters.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-zinc-500">
              {novel.characters.filter(c => c.importance === 'main').length} 个主角
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tension Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>情节张力分析</CardTitle>
              <CardDescription className="mt-1">
                分析各章节的紧张程度和节奏变化
              </CardDescription>
            </div>
            <Button
              onClick={analyzeTension}
              disabled={loading || novel.chapters.length === 0}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {loading ? '分析中...' : '开始分析'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!tensionData ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <BarChart className="h-12 w-12 text-zinc-400 mb-4" />
              <p className="text-sm text-zinc-500">
                点击"开始分析"查看情节张力曲线
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tensionData.map((item: any) => (
                <div key={item.chapterNumber} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-16">
                    第{item.chapterNumber}章
                  </span>
                  <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        item.tensionScore > 60
                          ? 'bg-red-500'
                          : item.tensionScore > 30
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${item.tensionScore}%` }}
                    />
                  </div>
                  <span className="text-sm text-zinc-500 w-12 text-right">
                    {item.tensionScore}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plot Points Status */}
      <Card>
        <CardHeader>
          <CardTitle>情节点追踪</CardTitle>
          <CardDescription>
            伏笔和关键情节的状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          {novel.plotPoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <FileText className="h-8 w-8 text-zinc-400 mb-2" />
              <p className="text-sm text-zinc-500">暂无情节点记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {novel.plotPoints.map((point) => (
                <div key={point.id} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                  <Badge
                    variant={
                      point.status === 'resolved'
                        ? 'default'
                        : point.status === 'developing'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {point.type}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm">{point.description}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {point.status === 'setup' && '伏笔已埋下'}
                      {point.status === 'developing' && '发展中'}
                      {point.status === 'resolved' && '已完成'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warnings */}
      {novel.chapters.length > 5 && (
        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle>写作建议</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {avgChapterLength < 1000 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                • 章节平均长度偏短，建议每章保持在 2000-3000 字以获得更好的阅读体验
              </p>
            )}
            {novel.characters.length < 3 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                • 人物数量较少，可以考虑添加更多配角丰富情节
              </p>
            )}
            {novel.worldSettings.length === 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                • 建议添加世界设定，帮助保持故事的一致性
              </p>
            )}
            {avgChapterLength < 1000 && novel.characters.length >= 3 && novel.worldSettings.length > 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                • 目前没有明显问题，继续保持！
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
