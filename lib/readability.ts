import { ReadabilityMetrics } from '@/types';

/**
 * 分析文本可读性
 */
export function analyzeReadability(text: string): ReadabilityMetrics {
  // 移除多余的空白字符
  const cleanText = text.trim().replace(/\s+/g, ' ');

  // 计算字数（中文按字符数，英文按单词数）
  const chineseChars = cleanText.match(/[\u4e00-\u9fa5]/g) || [];
  const englishWords = cleanText.match(/[a-zA-Z]+/g) || [];
  const wordCount = chineseChars.length + englishWords.length;

  // 计算句子数
  const sentences = cleanText.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  // 平均句子长度
  const avgSentenceLength = wordCount / sentenceCount;

  // 确定阅读难度
  let readingLevel = 'easy';
  if (avgSentenceLength > 30) {
    readingLevel = 'hard';
  } else if (avgSentenceLength > 20) {
    readingLevel = 'medium';
  }

  // 简单的情感分析
  const positiveWords = ['快乐', '幸福', '美好', '喜悦', '成功', '胜利', '爱', '温暖', '希望', '笑'];
  const negativeWords = ['悲伤', '痛苦', '失败', '绝望', '恐惧', '死亡', '黑暗', '孤独', '哭', '恨'];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    positiveCount += (cleanText.match(new RegExp(word, 'g')) || []).length;
  });

  negativeWords.forEach(word => {
    negativeCount += (cleanText.match(new RegExp(word, 'g')) || []).length;
  });

  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (positiveCount > negativeCount * 1.5) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount * 1.5) {
    sentiment = 'negative';
  }

  // 节奏分析（基于句子长度变化）
  let pacing: 'fast' | 'medium' | 'slow' = 'medium';
  if (avgSentenceLength < 15) {
    pacing = 'fast';
  } else if (avgSentenceLength > 25) {
    pacing = 'slow';
  }

  return {
    wordCount,
    sentenceCount,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    readingLevel,
    sentiment,
    pacing,
  };
}

/**
 * 检测重复词
 */
export function detectRepetitiveWords(text: string, threshold: number = 3): string[] {
  const words = text.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]{3,}/g) || [];
  const wordCount: Record<string, number> = {};

  words.forEach(word => {
    // 忽略常见的连接词和助词
    const ignoreWords = ['的', '了', '是', '在', '有', '和', '就', '不', '人', '我', '他', '她', '它', '这', '那', '为', '以', '着', '之', '而', '于', '与', '及', '或'];
    if (!ignoreWords.includes(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });

  const repetitive: string[] = [];
  Object.entries(wordCount).forEach(([word, count]) => {
    if (count >= threshold) {
      repetitive.push(`"${word}" (${count}次)`);
    }
  });

  return repetitive;
}

/**
 * 分析情节张力
 */
export function analyzeTension(chapters: { content: string; number: number }[]): { chapterNumber: number; tensionScore: number }[] {
  return chapters.map(chapter => {
    const text = chapter.content || '';

    // 张力关键词
    const tensionWords = [
      '突然', '忽然', '猛然', '瞬间', '立刻', '马上',
      '危险', '紧张', '惊', '震', '颤',
      '战斗', '对抗', '冲突', '矛盾',
      '秘密', '真相', '发现', '揭露',
      '生死', '决定', '选择', '关键'
    ];

    let tensionScore = 0;

    tensionWords.forEach(word => {
      const matches = text.match(new RegExp(word, 'g')) || [];
      tensionScore += matches.length;
    });

    // 对话密度也会影响节奏
    const dialogueCount = (text.match(/["「『"]/g) || []).length;
    tensionScore += dialogueCount * 0.5;

    // 短句密度（快节奏）
    const sentences = text.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
    const shortSentences = sentences.filter(s => s.length < 20).length;
    tensionScore += shortSentences * 0.3;

    // 归一化到 0-100
    const normalizedScore = Math.min(100, Math.round((tensionScore / text.length) * 1000));

    return {
      chapterNumber: chapter.number,
      tensionScore: normalizedScore,
    };
  });
}
