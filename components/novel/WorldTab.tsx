'use client';

import { useState } from 'react';
import { NovelWithRelations } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Globe, Clock, Star } from 'lucide-react';

interface Props {
  novel: NovelWithRelations;
  onUpdate: () => void;
}

export default function WorldTab({ novel, onUpdate }: Props) {
  const [settingDialogOpen, setSettingDialogOpen] = useState(false);
  const [memoryDialogOpen, setMemoryDialogOpen] = useState(false);

  const [newSetting, setNewSetting] = useState({
    category: 'geography',
    title: '',
    description: '',
    importance: '5',
  });

  const [newMemory, setNewMemory] = useState({
    type: 'event',
    content: '',
    context: '',
    importance: '5',
  });

  const createSetting = async () => {
    if (!newSetting.title) return;

    try {
      const res = await fetch('/api/world-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId: novel.id,
          ...newSetting,
          importance: parseInt(newSetting.importance),
        }),
      });

      if (res.ok) {
        setSettingDialogOpen(false);
        setNewSetting({
          category: 'geography',
          title: '',
          description: '',
          importance: '5',
        });
        onUpdate();
      }
    } catch (error) {
      console.error('Error creating setting:', error);
    }
  };

  const createMemory = async () => {
    if (!newMemory.content) return;

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId: novel.id,
          ...newMemory,
          importance: parseInt(newMemory.importance),
        }),
      });

      if (res.ok) {
        setMemoryDialogOpen(false);
        setNewMemory({
          type: 'event',
          content: '',
          context: '',
          importance: '5',
        });
        onUpdate();
      }
    } catch (error) {
      console.error('Error creating memory:', error);
    }
  };

  const categoryMap: Record<string, string> = {
    geography: '地理',
    magic_system: '力量体系',
    politics: '政治势力',
    culture: '文化习俗',
    technology: '科技水平',
  };

  const typeMap: Record<string, string> = {
    character_trait: '人物特质',
    event: '重要事件',
    setting: '设定',
    rule: '规则',
  };

  return (
    <div>
      <Tabs defaultValue="settings">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="settings">世界设定</TabsTrigger>
          <TabsTrigger value="memories">记忆库</TabsTrigger>
          <TabsTrigger value="timeline">时间线</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">世界设定</h2>
            <Dialog open={settingDialogOpen} onOpenChange={setSettingDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  新增设定
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新建世界设定</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">分类</label>
                    <Select
                      value={newSetting.category}
                      onValueChange={(value) => setNewSetting({ ...newSetting, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geography">地理</SelectItem>
                        <SelectItem value="magic_system">力量体系</SelectItem>
                        <SelectItem value="politics">政治势力</SelectItem>
                        <SelectItem value="culture">文化习俗</SelectItem>
                        <SelectItem value="technology">科技水平</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">标题 *</label>
                    <Input
                      placeholder="设定名称"
                      value={newSetting.title}
                      onChange={(e) => setNewSetting({ ...newSetting, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">描述</label>
                    <Textarea
                      placeholder="详细描述..."
                      value={newSetting.description}
                      onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">重要性 (1-10)</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newSetting.importance}
                      onChange={(e) => setNewSetting({ ...newSetting, importance: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSettingDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={createSetting} disabled={!newSetting.title}>
                    创建
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {novel.worldSettings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                <Globe className="h-12 w-12 text-zinc-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无世界设定</h3>
                <p className="text-sm text-zinc-500">
                  添加地理、势力、体系等设定
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {novel.worldSettings.map((setting) => (
                <Card key={setting.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {categoryMap[setting.category] || setting.category}
                          </Badge>
                          <div className="flex items-center">
                            {Array.from({ length: Math.min(setting.importance, 10) }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <CardTitle className="text-base">{setting.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {setting.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="memories" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">记忆库</h2>
            <Dialog open={memoryDialogOpen} onOpenChange={setMemoryDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  新增记忆
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新建记忆</DialogTitle>
                  <DialogDescription>
                    记录重要事件、人物特质等，用于AI生成时的参考
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">类型</label>
                    <Select
                      value={newMemory.type}
                      onValueChange={(value) => setNewMemory({ ...newMemory, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="character_trait">人物特质</SelectItem>
                        <SelectItem value="event">重要事件</SelectItem>
                        <SelectItem value="setting">设定</SelectItem>
                        <SelectItem value="rule">规则</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">内容 *</label>
                    <Textarea
                      placeholder="记忆内容..."
                      value={newMemory.content}
                      onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">上下文</label>
                    <Textarea
                      placeholder="相关背景..."
                      value={newMemory.context}
                      onChange={(e) => setNewMemory({ ...newMemory, context: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">重要性 (1-10)</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newMemory.importance}
                      onChange={(e) => setNewMemory({ ...newMemory, importance: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setMemoryDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={createMemory} disabled={!newMemory.content}>
                    创建
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {novel.memories.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                <Clock className="h-12 w-12 text-zinc-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无记忆</h3>
                <p className="text-sm text-zinc-500">
                  记录重要信息，帮助AI保持一致性
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {novel.memories.map((memory) => (
                <Card key={memory.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="mb-2">
                        {typeMap[memory.type] || memory.type}
                      </Badge>
                      <div className="flex items-center">
                        {Array.from({ length: Math.min(memory.importance, 10) }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <CardDescription className="text-sm text-foreground">
                      {memory.content}
                    </CardDescription>
                    {memory.context && (
                      <CardDescription className="text-xs mt-2">
                        {memory.context}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-48 text-center">
              <Clock className="h-12 w-12 text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">时间线功能</h3>
              <p className="text-sm text-zinc-500">
                即将推出...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
