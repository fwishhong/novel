import Anthropic from '@anthropic-ai/sdk';
import { GenerationContext, GenerationRequest, ConsistencyCheck } from '@/types';
import { Character, Memory, WorldSetting, PlotPoint } from '@prisma/client';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export class AIService {
  /**
   * 构建生成上下文提示词
   */
  private buildContextPrompt(context: GenerationContext): string {
    let prompt = `你是一个专业的网络小说作家助手。以下是当前创作的上下文信息：\n\n`;

    // 添加人物信息
    if (context.relevantCharacters && context.relevantCharacters.length > 0) {
      prompt += `## 相关人物：\n`;
      context.relevantCharacters.forEach(char => {
        prompt += `- **${char.name}**`;
        if (char.age) prompt += ` (${char.age}岁)`;
        prompt += `\n`;
        if (char.personality) prompt += `  性格：${char.personality}\n`;
        if (char.background) prompt += `  背景：${char.background}\n`;
        if (char.speechPattern) prompt += `  说话风格：${char.speechPattern}\n`;
        if (char.goals) prompt += `  目标：${char.goals}\n`;
        prompt += `\n`;
      });
    }

    // 添加世界设定
    if (context.worldSettings && context.worldSettings.length > 0) {
      prompt += `## 世界设定：\n`;
      context.worldSettings.forEach(setting => {
        prompt += `- **${setting.title}** (${setting.category})\n`;
        prompt += `  ${setting.description}\n\n`;
      });
    }

    // 添加情节点
    if (context.plotPoints && context.plotPoints.length > 0) {
      prompt += `## 重要情节点：\n`;
      context.plotPoints.forEach(point => {
        prompt += `- [${point.type}] ${point.description}`;
        if (point.status === 'setup') {
          prompt += ` (伏笔已埋下，待回收)`;
        } else if (point.status === 'resolved') {
          prompt += ` (已完成)`;
        }
        prompt += `\n`;
      });
      prompt += `\n`;
    }

    // 添加记忆/上下文
    if (context.relevantMemories && context.relevantMemories.length > 0) {
      prompt += `## 重要记忆/事件：\n`;
      context.relevantMemories.forEach(memory => {
        prompt += `- [${memory.type}] ${memory.content}`;
        if (memory.context) prompt += ` - ${memory.context}`;
        prompt += `\n`;
      });
      prompt += `\n`;
    }

    // 添加最近内容
    if (context.recentContent) {
      prompt += `## 前文内容：\n${context.recentContent}\n\n`;
    }

    return prompt;
  }

  /**
   * 生成章节内容
   */
  async generateChapter(request: GenerationRequest): Promise<string> {
    const contextPrompt = this.buildContextPrompt(request.context);

    const systemPrompt = `你是一个专业的网络小说作家。你的任务是基于给定的上下文和要求，创作高质量的小说内容。

要求：
1. 保持人物性格一致，符合已有的人物设定
2. 遵循世界观设定，不要出现矛盾
3. 注意前后情节的连贯性
4. 语言生动，富有感染力
5. 适当运用对话、动作、心理描写等多种手法
6. 保持适当的节奏，张弛有度
7. 如果有伏笔需要回收，要自然地呼应前文

${contextPrompt}`;

    const userPrompt = `请根据以下要求创作内容：

${request.prompt}

${request.tone ? `写作风格：${request.tone}` : ''}
${request.length === 'short' ? '长度：约500-800字' : request.length === 'long' ? '长度：约2000-3000字' : '长度：约1000-1500字'}

请直接开始创作，不要加任何前言或说明。`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: request.length === 'short' ? 1500 : request.length === 'long' ? 4000 : 2500,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: systemPrompt + '\n\n' + userPrompt
          }
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error) {
      console.error('AI Generation error:', error);
      throw new Error('AI生成失败，请稍后重试');
    }
  }

  /**
   * 生成场景描写
   */
  async generateScene(
    sceneDescription: string,
    characters: Character[],
    context: GenerationContext
  ): Promise<string> {
    return this.generateChapter({
      type: 'scene',
      prompt: `创作以下场景：${sceneDescription}`,
      context: {
        ...context,
        relevantCharacters: characters,
      },
      length: 'medium',
    });
  }

  /**
   * 生成人物对话
   */
  async generateDialogue(
    character: Character,
    situation: string,
    context: GenerationContext
  ): Promise<string> {
    const prompt = `请为角色"${character.name}"生成对话。

场景：${situation}

要求：
1. 符合角色性格：${character.personality || '根据背景推断'}
2. 符合说话风格：${character.speechPattern || '自然真实'}
3. 对话要推进情节或展现人物性格

只输出对话内容，使用引号包裹。`;

    return this.generateChapter({
      type: 'dialogue',
      prompt,
      context: {
        ...context,
        relevantCharacters: [character],
      },
      length: 'short',
    });
  }

  /**
   * 一致性检查
   */
  async checkConsistency(
    content: string,
    context: GenerationContext
  ): Promise<ConsistencyCheck[]> {
    const contextPrompt = this.buildContextPrompt(context);

    const prompt = `你是一个小说编辑，负责检查内容的一致性。请仔细检查以下新创作的内容是否与已有设定、情节、人物性格等保持一致。

${contextPrompt}

## 待检查的新内容：
${content}

请从以下几个方面检查一致性：
1. 人物性格是否符合设定
2. 时间线是否有矛盾
3. 世界观设定是否一致
4. 情节是否合理连贯

请以JSON格式返回检查结果，格式如下：
[
  {
    "type": "character|timeline|setting|plot",
    "isConsistent": true/false,
    "conflicts": ["冲突描述1", "冲突描述2"],
    "suggestions": ["建议1", "建议2"]
  }
]

如果完全一致，conflicts和suggestions可以为空数组。`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      const responseContent = message.content[0];
      if (responseContent.type === 'text') {
        // 尝试解析JSON
        const jsonMatch = responseContent.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      // 如果解析失败，返回默认结果
      return [{
        type: 'plot',
        isConsistent: true,
        conflicts: [],
        suggestions: [],
      }];
    } catch (error) {
      console.error('Consistency check error:', error);
      return [{
        type: 'plot',
        isConsistent: true,
        conflicts: ['检查失败，请手动审核'],
        suggestions: [],
      }];
    }
  }

  /**
   * 生成章节大纲
   */
  async generateOutline(
    chapterGoal: string,
    context: GenerationContext
  ): Promise<string> {
    const contextPrompt = this.buildContextPrompt(context);

    const prompt = `请为以下章节目标生成详细大纲：

${chapterGoal}

${contextPrompt}

要求：
1. 分成3-5个场景
2. 每个场景包括：地点、出场人物、主要事件、情感基调
3. 确保推进整体情节
4. 考虑节奏的起伏

请用清晰的分点格式输出。`;

    return this.generateChapter({
      type: 'chapter',
      prompt,
      context,
      length: 'medium',
    });
  }

  /**
   * 续写内容
   */
  async continueWriting(
    existingContent: string,
    direction: string,
    context: GenerationContext
  ): Promise<string> {
    const prompt = `请续写以下内容：

已有内容：
${existingContent}

续写方向：${direction}

要求：
1. 自然衔接前文
2. 保持风格一致
3. 推进情节发展`;

    return this.generateChapter({
      type: 'chapter',
      prompt,
      context: {
        ...context,
        recentContent: existingContent,
      },
      length: 'medium',
    });
  }

  /**
   * 润色内容
   */
  async polishContent(content: string): Promise<string> {
    const prompt = `请润色以下内容，提升文学性和可读性：

${content}

要求：
1. 保持原意不变
2. 优化用词和句式
3. 增强画面感和感染力
4. 消除重复和冗余
5. 保持原有风格

请直接输出润色后的内容。`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      const responseContent = message.content[0];
      if (responseContent.type === 'text') {
        return responseContent.text;
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Polish error:', error);
      throw new Error('润色失败，请稍后重试');
    }
  }
}

export const aiService = new AIService();
