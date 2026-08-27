---
title: 我的世界怪物刷新上限计算机制
published: 2026-08-28
description:  ' '
image: ''
tags: [我的世界]
category: 'Code'
draft: false
---

:::caution
本文内容未经完整严谨验证，仅作讨论参考，需要进一步检验，欢迎勘误。
:::

Chspif服务器内的末地伪和平的加载和怪物上限计算出现了一些奇怪的表现。

在中文Wiki中，关于区块的描述如下：

```js "实体计算加载等级（小于等于31）且计算等级也小于等于31" "强加载区块" "实体计算加载等级或方块计算加载等级（小于等于32）且计算等级等于32" "弱加载区块" "完全加载等级（33）且计算等级等于32" "加载边界区块" "计算等级等于33或加载等级大于33"
区块含有“加载等级”和“计算等级”两个标签。前者范围为0-45，后者范围为0-33。超过上限时二者等级会定格在45/33。
计算等级和加载等级一起决定了区块能否计算实体和方块等内容。如果一个区块加载等级为实体计算加载等级（小于等于31）且计算等级也小于等于31，则区块内的实体、方块实体和计划刻每游戏刻都进行各种计算，这种类型的区块通常被称为强加载区块（Entity Processing Chunk）；如果一个区块加载等级为实体计算加载等级或方块计算加载等级（小于等于32）且计算等级等于32，则区块内的方块实体和计划刻会被计算，实体会被追踪和记录，但无法参加每游戏刻的计算，这种类型的区块通常被称为弱加载区块（Lazy Processing Chunk）。如果一个区块加载等级是完全加载等级（33）且计算等级等于32，则区块内实体会被追踪和记录，但计划刻和方块实体无法参加每游戏刻的计算，这种类型的区块通常被称为加载边界区块（Loading Border Chunk）。计算等级等于33或加载等级大于33代表区块内实体、方块实体和计划刻不会被计算。
```
[原文链接](https://zh.minecraft.wiki/w/%E5%8C%BA%E5%9D%97#%E6%A0%87%E7%AD%BE)

即
- 加载等级<=31 且 计算等级<=31 强加载区块
- 加载等级<=32 且 计算等级=32 弱加载区块
- 加载等级=33 且 计算等级=32 加载区块边界
- 加载等级>33 或 计算等级=33 不加载

而在中文Wiki中，关于怪物生成上限描述如下：

```js "强加载" "弱加载" "加载边界区块"
在生成周期开始时，游戏会计算各生成类别的数量。被统计的生物必须满足以下条件：
必须处于强加载、弱加载或加载边界区块。
```
[原文链接](https://zh.minecraft.wiki/w/%E7%94%9F%E7%89%A9%E7%94%9F%E6%88%90?variant=zh-cn#%E5%91%A8%E6%9C%9F%E7%94%9F%E6%88%90)

但在服务器中观测到，加载等级=33 且 计算等级=33 的区块中的潜影贝，仍然被计入了刷怪上限。该区块符合不加载区块的描述，理应不计入刷怪上限统计。

经反编译26.2/26.1/1.21.11三个版本的源码发现

```js
//每刷怪周期的计数调用
NaturalSpawner.createState(chunkCount, this.level.getAllEntities(), this::getFullChunk, ...);

for (Entity entity : entities) {
    if (entity instanceof Mob && (mob.isPersistenceRequired() || mob.requiresCustomPersistence())
        || entity.getType().getCategory() == MobCategory.MISC) continue;   //排除
    chunkGetter.query(ChunkPos.pack(entity.blockPosition()), chunk -> {
        mobCounts.addTo(category, 1); 
    });
}

// entities 来源 = level.getAllEntities() = visibleEntities.getAllEntities()
// visibleEntities 里是"Visibility.isAccessible()==true"的实体
// Visibility 由 FullChunkStatus 决定
// FullChunkStatus 由加载等级决定:ChunkLevel.fullStatus(loadLevel)
//   ≤31 → ENTITY_TICKING → TICKING   (accessible)
//   32  → BLOCK_TICKING  → TRACKED   (accessible)
//   33  → FULL           → TRACKED   (accessible)
//   ≥34 → INACCESSIBLE   → HIDDEN    (不可访问 → 移出计数)

//检测区块是否加载
private void getFullChunk(long chunkKey, Consumer<LevelChunk> output) {
    ChunkHolder chunkHolder = this.getVisibleChunkIfPresent(chunkKey);
    if (chunkHolder != null) {
        chunkHolder.getFullChunkFuture().getNow(ChunkHolder.UNLOADED_LEVEL_CHUNK).ifSuccess(output);
    }
}
```

故基本可以认为，计算等级并不影响怪物是否计入刷怪上限。

影响指标只有加载等级，且加载等级<=33就会计入。

由于与Wiki内容相悖，本文观点存疑，需进一步深入验证。