# Missing i18n Translations

## Instructions
Add these translations to `src/i18n/config.ts` in the appropriate sections.

## English Translations (en)

### userInfo section
Add to `userInfo` object:
```typescript
subscribe: {
    label: "Subscribe to receive monthly personalized fortune reports",
    description: "We will automatically send your exclusive monthly fortune report to your email on the last day of each month."
}
```

### reportContent section (NEW)
Add as a new top-level section:
```typescript
reportContent: {
    title: "What's Included in Your Home Feng Shui Energy Report",
    subtitle: "Comprehensive analysis and personalized recommendations for your living space",
    whatIncluded: "Your Report Includes:",
    item1: {
        title: "2026 Overall Fortune Forecast",
        description: "Detailed analysis of your personal energy trends and opportunities for the coming year."
    },
    item2: {
        title: "Home Energy Strength & Changes",
        description: "Assessment of your home's current energy field and how it affects your life."
    },
    item3: {
        title: "Simple Adjustment Methods",
        description: "Easy-to-implement changes to optimize your home's Feng Shui energy with minimal effort."
    },
    item4: {
        title: "Room-by-Room Optimization",
        description: "Specific recommendations for each room to achieve the best energy flow and balance."
    },
    item5: {
        title: "Risk Mitigation Strategies",
        description: "Effective methods to reduce misfortune and negative energy in your living space."
    },
    pentagon: {
        title: "5 Life Dimensions Energy Analysis",
        description: "We analyze your personal energy across these five essential life dimensions and show the potential improvement after implementing our recommendations.",
        love: "Love",
        wealth: "Wealth",
        career: "Career",
        health: "Health",
        luck: "Luck",
        before: "Before Adjustment",
        after: "After Adjustment"
    }
}
```

## Chinese Translations (zh)

### userInfo section
Add to `userInfo` object:
```typescript
subscribe: {
    label: "订阅我们，以获取每月您的专属运势报告",
    description: "我们将在每月最后一天自动发送您的专属月度运势报告到您的邮箱。"
}
```

### reportContent section (NEW)
Add as a new top-level section:
```typescript
reportContent: {
    title: "您的居家风水能量报告包含哪些内容",
    subtitle: "全面分析和个性化建议，为您的生活空间量身定制",
    whatIncluded: "报告包含：",
    item1: {
        title: "2026年整体运势预测",
        description: "详细分析您来年的个人能量趋势和机遇。"
    },
    item2: {
        title: "居家风水能量的强弱和变化",
        description: "评估您家当前的能量场及其对生活的影响。"
    },
    item3: {
        title: "最简单的调整方式",
        description: "易于实施的改变，用最小的努力优化您家的风水能量。"
    },
    item4: {
        title: "各个房间如何调整才能达到最好的效果",
        description: "针对每个房间的具体建议，实现最佳能量流动和平衡。"
    },
    item5: {
        title: "如何有效降低灾祸和不吉利的运气",
        description: "有效方法减少您生活空间中的不幸和负能量。"
    },
    pentagon: {
        title: "5大生活维度能量分析",
        description: "我们分析您在这五个生活维度的个人能量，并展示实施我们建议后的潜在改善。",
        love: "感情",
        wealth: "财运",
        career: "事业",
        health: "健康",
        luck: "运气",
        before: "调整前",
        after: "调整后"
    }
}
```

## How to Add

1. Open `src/i18n/config.ts`
2. Find the `en` translation section
3. Add the `subscribe` object to the existing `userInfo` section
4. Add the entire `reportContent` section after the existing sections
5. Repeat for the `zh` (Chinese) translation section
6. Save the file

The dev server should auto-reload with the new translations.
