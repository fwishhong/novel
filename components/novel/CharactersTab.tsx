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
import { Plus, Users, User } from 'lucide-react';

interface Props {
  novel: NovelWithRelations;
  onUpdate: () => void;
}

export default function CharactersTab({ novel, onUpdate }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    age: '',
    gender: '',
    personality: '',
    background: '',
    appearance: '',
    abilities: '',
    goals: '',
    speechPattern: '',
    importance: 'main',
  });

  const createCharacter = async () => {
    if (!newCharacter.name) return;

    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novelId: novel.id,
          ...newCharacter,
          age: newCharacter.age ? parseInt(newCharacter.age) : null,
        }),
      });

      if (res.ok) {
        setDialogOpen(false);
        setNewCharacter({
          name: '',
          age: '',
          gender: '',
          personality: '',
          background: '',
          appearance: '',
          abilities: '',
          goals: '',
          speechPattern: '',
          importance: 'main',
        });
        onUpdate();
      }
    } catch (error) {
      console.error('Error creating character:', error);
    }
  };

  const character = selectedCharacter
    ? novel.characters.find(c => c.id === selectedCharacter)
    : null;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Left: Character List */}
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">人物列表</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                新增
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>创建新人物</DialogTitle>
                <DialogDescription>
                  填写人物的详细信息
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">姓名 *</label>
                    <Input
                      placeholder="角色名字"
                      value={newCharacter.name}
                      onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">年龄</label>
                    <Input
                      type="number"
                      placeholder="年龄"
                      value={newCharacter.age}
                      onChange={(e) => setNewCharacter({ ...newCharacter, age: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">性别</label>
                    <Select
                      value={newCharacter.gender}
                      onValueChange={(value) => setNewCharacter({ ...newCharacter, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择性别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">男</SelectItem>
                        <SelectItem value="female">女</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">重要性</label>
                    <Select
                      value={newCharacter.importance}
                      onValueChange={(value) => setNewCharacter({ ...newCharacter, importance: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">主角</SelectItem>
                        <SelectItem value="supporting">配角</SelectItem>
                        <SelectItem value="minor">龙套</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">性格</label>
                  <Textarea
                    placeholder="角色的性格特点..."
                    value={newCharacter.personality}
                    onChange={(e) => setNewCharacter({ ...newCharacter, personality: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">背景故事</label>
                  <Textarea
                    placeholder="角色的背景和经历..."
                    value={newCharacter.background}
                    onChange={(e) => setNewCharacter({ ...newCharacter, background: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">外貌</label>
                  <Textarea
                    placeholder="角色的外貌描写..."
                    value={newCharacter.appearance}
                    onChange={(e) => setNewCharacter({ ...newCharacter, appearance: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">能力/技能</label>
                  <Textarea
                    placeholder="角色的能力、修为、技能等..."
                    value={newCharacter.abilities}
                    onChange={(e) => setNewCharacter({ ...newCharacter, abilities: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">目标/动机</label>
                  <Textarea
                    placeholder="角色想要达成什么..."
                    value={newCharacter.goals}
                    onChange={(e) => setNewCharacter({ ...newCharacter, goals: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">说话风格</label>
                  <Input
                    placeholder="例如：高冷、幽默、文雅等"
                    value={newCharacter.speechPattern}
                    onChange={(e) => setNewCharacter({ ...newCharacter, speechPattern: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={createCharacter} disabled={!newCharacter.name}>
                  创建
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {novel.characters.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-32 text-center">
              <Users className="h-8 w-8 text-zinc-400 mb-2" />
              <p className="text-sm text-zinc-500">暂无人物</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {novel.characters.map((char) => (
              <Card
                key={char.id}
                className={`cursor-pointer transition-all ${
                  selectedCharacter === char.id
                    ? 'ring-2 ring-purple-500 shadow-md'
                    : 'hover:shadow-sm'
                }`}
                onClick={() => setSelectedCharacter(char.id)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <CardTitle className="text-base">{char.name}</CardTitle>
                    </div>
                    <Badge
                      variant={
                        char.importance === 'main'
                          ? 'default'
                          : char.importance === 'supporting'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-xs"
                    >
                      {char.importance === 'main'
                        ? '主角'
                        : char.importance === 'supporting'
                        ? '配角'
                        : '龙套'}
                    </Badge>
                  </div>
                  {char.personality && (
                    <CardDescription className="text-xs line-clamp-1 mt-1">
                      {char.personality}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Right: Character Detail */}
      <div className="md:col-span-2">
        {character ? (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{character.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    {character.age && <span>{character.age}岁</span>}
                    {character.gender && <span>·</span>}
                    {character.gender && (
                      <span>
                        {character.gender === 'male' ? '男' : character.gender === 'female' ? '女' : '其他'}
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant={character.status === 'alive' ? 'default' : 'destructive'}
                >
                  {character.status === 'alive' ? '在世' : '已故'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {character.personality && (
                <div>
                  <h3 className="font-medium mb-2">性格</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {character.personality}
                  </p>
                </div>
              )}

              {character.background && (
                <div>
                  <h3 className="font-medium mb-2">背景故事</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                    {character.background}
                  </p>
                </div>
              )}

              {character.appearance && (
                <div>
                  <h3 className="font-medium mb-2">外貌</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {character.appearance}
                  </p>
                </div>
              )}

              {character.abilities && (
                <div>
                  <h3 className="font-medium mb-2">能力/技能</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {character.abilities}
                  </p>
                </div>
              )}

              {character.goals && (
                <div>
                  <h3 className="font-medium mb-2">目标/动机</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {character.goals}
                  </p>
                </div>
              )}

              {character.speechPattern && (
                <div>
                  <h3 className="font-medium mb-2">说话风格</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {character.speechPattern}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-96 text-center">
              <User className="h-16 w-16 text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">选择一个人物</h3>
              <p className="text-sm text-zinc-500">
                点击左侧人物卡片查看详情
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
