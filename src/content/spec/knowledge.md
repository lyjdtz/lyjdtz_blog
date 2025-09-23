### <center> 这里展示了一些我掌握的技能</center>

<div class="relative w-full h-[600px] overflow-hidden bg-[rgb(10,15,50)]" id="knowledge-graph-container">
  <!-- 知识图谱内容将通过JavaScript动态生成 -->
  <div class="absolute inset-0 flex items-center justify-center text-neutral-500" id="graph-loading">
    正在加载知识图谱...
  </div>
</div>

<script>
    // 检查是否需要刷新页面
    if (!window.location.href.includes('?refreshed=true')) {
      // 添加刷新标记并重新加载页面
      window.location.href = window.location.href + '?refreshed=true';
    } else {
      // 如果已经刷新过，继续执行原有的逻辑
      document.addEventListener('DOMContentLoaded', () => {
      // 获取容器
      const container = document.getElementById('knowledge-graph-container');
      const loadingIndicator = document.getElementById('graph-loading');
      
      // 全局线宽参数 - 用户可以自定义此值来改变连线粗细
      const DEFAULT_LINK_STROKE_WIDTH = 3.5; // 默认线宽为2.0像素
      
      // 回到中心按钮的缩放比例参数 - 用户可以自定义此值
      const CENTER_BUTTON_ZOOM_FACTOR = 1.2; // 大于1表示放大，小于1表示缩小
      
      // 当前的图谱对象引用
      let currentGraph = null;
      
      // 初始化交互功能
      const resetButton = document.createElement('button');
      resetButton.textContent = '回到中心';
      resetButton.className = 'absolute top-4 left-4 z-10 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors';
      container.appendChild(resetButton);
      
      // 跟踪节点的折叠状态
      const collapsedNodes = new Map();
      // 缓存节点间的父子关系
      let nodesMap = new Map();
      let parentMap = new Map();
      let childrenMap = new Map();
    
      // 使用fetch加载JSON数据
      async function loadGraphData() {
      try {
        const response = await fetch('/src/content/spec/knowledge-graph-data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('加载知识图谱数据失败:', error);
        // 返回示例数据作为备选
        return {
          "nodes": [
            { "id": 1, "label": "错误", "type": "domain", "color": "#3b82f6" },
          ],
          "links": []
        };
      }
    }
    
    // 初始化知识图谱
    async function initGraph() {
      try {
        // 加载数据
        const graphData = await loadGraphData();
        
        // 移除加载指示器
        if (loadingIndicator && loadingIndicator.parentNode === container) {
          loadingIndicator.remove();
        }
        
        // 创建知识图谱
        const graph = createKnowledgeGraph(graphData);
        
        // 初始化交互功能
        initInteractions(graph, graph.initialTransform, graphData, resetButton);
        
      } catch (error) {
        console.error('初始化知识图谱失败:', error);
        // 只替换加载指示器，而不是整个容器的内容
        if (loadingIndicator && loadingIndicator.parentNode === container) {
          loadingIndicator.textContent = '加载知识图谱失败';
          loadingIndicator.classList.remove('text-neutral-500');
          loadingIndicator.classList.add('text-red-500');
        }
      }
    }
    
    // 创建知识图谱
    function createKnowledgeGraph(graphData) {
      // 初始化节点映射和父子关系缓存
      nodesMap.clear();
      parentMap.clear();
      childrenMap.clear();
      
      // 构建节点映射
      graphData.nodes.forEach(node => {
        nodesMap.set(node.id, node);
        childrenMap.set(node.id, []);
      });
      
      // 构建父子关系
      graphData.links.forEach(link => {
        parentMap.set(link.target, link.source);
        childrenMap.get(link.source).push(link.target);
      });
      // 获取容器尺寸
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      
      // 创建SVG容器
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'knowledge-graph';
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);
      container.appendChild(svg);
      
      // 添加右上角标注 - 说明黄色高光代表正在学习中
      const annotationGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      annotationGroup.id = 'annotation-group';
      
      // 计算右上角位置 - 可修改此值调整左右位置（距离右侧的像素值）
      const annotationRightOffset = 100; // 可修改此数值调整标注位置
      const annotationX = containerRect.width - annotationRightOffset;
      const annotationY = 30;
      
      // 创建黄色高亮示例圆
      const highlightCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      highlightCircle.setAttribute('cx', annotationX);
      highlightCircle.setAttribute('cy', annotationY);
      highlightCircle.setAttribute('r', '8');
      highlightCircle.setAttribute('fill', '#3b82f6');
      highlightCircle.setAttribute('stroke', '#ffcc00');
      highlightCircle.setAttribute('stroke-width', '4');
      highlightCircle.setAttribute('filter', 'drop-shadow(0 0 8px #ffcc00)');
      annotationGroup.appendChild(highlightCircle);
      
      // 创建说明文本
      const annotationText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      annotationText.setAttribute('x', annotationX + 20);
      annotationText.setAttribute('y', annotationY + 4);
      annotationText.setAttribute('font-size', '14px');
      annotationText.setAttribute('fill', '#8a2be2');
      annotationText.setAttribute('font-weight', '600');
      annotationText.textContent = '学习中';
      annotationGroup.appendChild(annotationText);
      
      svg.appendChild(annotationGroup);
      
      // 创建图谱组元素
      const graphGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      graphGroup.id = 'graph-group';
      svg.appendChild(graphGroup);
      
      // 创建连线组（置于底层）
      const linksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      linksGroup.id = 'links-group';
      graphGroup.appendChild(linksGroup);
      
      // 创建节点组（置于上层）
      const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodesGroup.id = 'nodes-group';
      graphGroup.appendChild(nodesGroup);
      
      // 应用自动布局算法
      applyAutomaticLayout(graphData, centerX, centerY);
      
      // 渲染连线
      renderLinks(graphData, linksGroup, DEFAULT_LINK_STROKE_WIDTH);
      
      // 渲染节点
      renderNodes(graphData, nodesGroup);
      
      // 计算初始缩放和偏移
      const initialTransform = calculateInitialTransform(graphData, containerRect.width, containerRect.height);
      
      // 保存当前图谱引用
      currentGraph = {
        svg,
        graphGroup,
        linksGroup,
        nodesGroup,
        graphData,
        initialTransform
      };
      
      // 返回图谱相关对象
      return currentGraph;
    }
    
    // 应用自动布局算法
    function applyAutomaticLayout(graphData, centerX, centerY) {
      // 分离节点类型
      const domainNodes = graphData.nodes.filter(node => node.type === 'domain');
      const skillNodes = graphData.nodes.filter(node => node.type === 'skill');
      const knowledgeNodes = graphData.nodes.filter(node => node.type === 'knowledge');
      
      // 设置domain节点在中心
      domainNodes.forEach(node => {
        node.x = centerX;
        node.y = centerY;
      });
      
      if (domainNodes.length === 0) return;
      
      const mainDomain = domainNodes[0];
      
      // 计算布局参数
      const level1Spacing = 200; // 第一层子节点与主节点的水平距离
      const nodeVerticalGap = 80; // 同一层级节点之间的垂直间距
      const levelSpacing = 180; // 不同层级之间的水平间距
      
      // 构建节点连接关系映射
      const parentMap = new Map();
      const childrenMap = new Map();
      
      // 初始化childrenMap
      graphData.nodes.forEach(node => {
        childrenMap.set(node.id, []);
      });
      
      // 建立父子关系
      graphData.links.forEach(link => {
        parentMap.set(link.target, link.source);
        childrenMap.get(link.source).push(link.target);
      });
      
      // 第一层：skill节点围绕domain节点左右对称排列，优先左边
      const domainChildren = childrenMap.get(mainDomain.id) || [];
      const level1Nodes = skillNodes.filter(node => domainChildren.includes(node.id));
      
      // 计算左右两侧的节点数量
      const totalLevel1Nodes = level1Nodes.length;
      const leftCount = Math.ceil(totalLevel1Nodes / 2);
      const rightCount = totalLevel1Nodes - leftCount;
      
      // 计算垂直居中的偏移量
      const leftVerticalOffset = (leftCount - 1) * nodeVerticalGap / 2;
      const rightVerticalOffset = (rightCount - 1) * nodeVerticalGap / 2;
      
      // 放置左侧节点（优先左边）
      level1Nodes.slice(0, leftCount).forEach((node, index) => {
        node.x = centerX - level1Spacing;
        node.y = centerY - leftVerticalOffset + index * nodeVerticalGap;
        node.side = 'left'; // 标记节点所在的侧
      });
      
      // 放置右侧节点
      level1Nodes.slice(leftCount).forEach((node, index) => {
        node.x = centerX + level1Spacing;
        node.y = centerY - rightVerticalOffset + index * nodeVerticalGap;
        node.side = 'right'; // 标记节点所在的侧
      });
      
      // 为所有节点分配位置
      // 首先确定每个节点的最终排列方向
      graphData.nodes.forEach(node => {
        if (node.type === 'domain') {
          node.ultimateSide = 'center';
        } else if (node.type === 'skill') {
          // skill节点的最终方向就是自己所在的侧
          node.ultimateSide = node.side || 'center';
        } else {
          // 知识节点需要追溯到最上层的skill节点来确定最终方向
          let currentId = node.id;
          let ultimateSide = 'center';
          
          while (currentId && parentMap.has(currentId)) {
            const parentId = parentMap.get(currentId);
            const parentNode = graphData.nodes.find(n => n.id === parentId);
            
            if (parentNode) {
              if (parentNode.type === 'skill' && parentNode.side) {
                // 找到最上层的skill节点后，使用它的side属性
                ultimateSide = parentNode.side;
                break;
              } else if (parentNode.type === 'domain') {
                // 如果到达了domain节点，停止追溯
                break;
              }
            }
            
            currentId = parentId;
          }
          
          node.ultimateSide = ultimateSide;
        }
      });
      
      // 确保所有层级的skill节点也继承最顶层skill节点的排列方向
      graphData.nodes.forEach(node => {
        if (node.type === 'skill' && node.side === undefined) {
          let currentId = node.id;
          let ultimateSide = 'center';
          
          while (currentId && parentMap.has(currentId)) {
            const parentId = parentMap.get(currentId);
            const parentNode = graphData.nodes.find(n => n.id === parentId);
            
            if (parentNode) {
              if (parentNode.type === 'skill' && parentNode.side) {
                ultimateSide = parentNode.side;
                break;
              } else if (parentNode.type === 'domain') {
                break;
              }
            }
            
            currentId = parentId;
          }
          
          node.ultimateSide = ultimateSide;
        }
      });
      
      // 按照层级为所有节点分配位置
      // 计算每个节点的深度
      const levelGroups = new Map();
      const levelDepths = new Map();
      
      graphData.nodes.forEach(node => {
        const getDepth = (nodeId) => {
          if (levelDepths.has(nodeId)) return levelDepths.get(nodeId);
          
          if (!parentMap.has(nodeId)) {
            levelDepths.set(nodeId, 0);
            return 0;
          }
          
          const parentId = parentMap.get(nodeId);
          const depth = getDepth(parentId) + 1;
          levelDepths.set(nodeId, depth);
          return depth;
        };
        
        const depth = getDepth(node.id);
        node.depth = depth; // 设置节点的深度属性，用于后续的颜色继承逻辑
        
        if (!levelGroups.has(depth)) {
          levelGroups.set(depth, { left: [], right: [], center: [] });
        }
        
        const side = node.ultimateSide || 'center';
        levelGroups.get(depth)[side].push(node);
      });
      
      // 放置每个层级的节点
      levelGroups.forEach((group, depth) => {
        if (depth === 0) return; // 跳过中心节点
        
        // 处理左侧节点
        group.left.forEach((node, index) => {
          const parentId = parentMap.get(node.id);
          const parentNode = graphData.nodes.find(n => n.id === parentId);
          
          if (parentNode) {
            // 对于第一层节点，使用固定间距
            if (depth === 1) {
              const siblings = levelGroups.get(depth).left;
              const siblingIndex = siblings.indexOf(node);
              const siblingsCount = siblings.length;
              const verticalOffset = (siblingIndex - (siblingsCount - 1) / 2) * nodeVerticalGap;
              
              node.x = centerX - level1Spacing;
              node.y = centerY + verticalOffset;
              node.side = 'left';
            } else {
              // 对于更深层级的节点，根据父节点和ultimateSide属性排列在左侧
              node.x = parentNode.x - levelSpacing;
              
              // 计算垂直位置 - 让兄弟节点在一条垂线上，按照顺序从上到下排列
              const siblings = childrenMap.get(parentId) || [];
              const siblingIndex = siblings.indexOf(node.id);
              
              // 所有兄弟节点在同一条垂线上，按照顺序从上到下排列
              // 计算第一个节点的Y坐标，让整个组居中对齐
              const firstNodeY = parentNode.y - (siblings.length - 1) * nodeVerticalGap / 2;
              node.y = firstNodeY + siblingIndex * nodeVerticalGap;
            }
          }
        });
        
        // 处理右侧节点
        group.right.forEach((node, index) => {
          const parentId = parentMap.get(node.id);
          const parentNode = graphData.nodes.find(n => n.id === parentId);
          
          if (parentNode) {
            // 对于第一层节点，使用固定间距
            if (depth === 1) {
              const siblings = levelGroups.get(depth).right;
              const siblingIndex = siblings.indexOf(node);
              const siblingsCount = siblings.length;
              const verticalOffset = (siblingIndex - (siblingsCount - 1) / 2) * nodeVerticalGap;
              
              node.x = centerX + level1Spacing;
              node.y = centerY + verticalOffset;
              node.side = 'right';
            } else {
              // 对于更深层级的节点，根据父节点和ultimateSide属性排列在右侧
              node.x = parentNode.x + levelSpacing;
              
              // 计算垂直位置 - 让兄弟节点在一条垂线上，按照顺序从上到下排列
              const siblings = childrenMap.get(parentId) || [];
              const siblingIndex = siblings.indexOf(node.id);
              
              // 所有兄弟节点在同一条垂线上，按照顺序从上到下排列
              // 计算第一个节点的Y坐标，让整个组居中对齐
              const firstNodeY = parentNode.y - (siblings.length - 1) * nodeVerticalGap / 2;
              node.y = firstNodeY + siblingIndex * nodeVerticalGap;
            }
          }
        });
      });
    }
    
    // 渲染连线
    function renderLinks(graphData, linksGroup, strokeWidth = 1.5) {
      graphData.links.forEach(link => {
        const sourceNode = graphData.nodes.find(node => node.id === link.source);
        const targetNode = graphData.nodes.find(node => node.id === link.target);
        
        // 只有当源节点和目标节点都应该被渲染时，才渲染连接线
        if (sourceNode && targetNode && shouldRenderNode(sourceNode.id) && shouldRenderNode(targetNode.id)) {
          // 创建直线连接
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', sourceNode.x);
          line.setAttribute('y1', sourceNode.y);
          line.setAttribute('x2', targetNode.x);
          line.setAttribute('y2', targetNode.y);
          line.setAttribute('stroke', '#8a2be2'); // 紫色连接线
          line.setAttribute('stroke-width', strokeWidth.toString()); // 使用自定义线宽
          line.setAttribute('opacity', '0.7');
          
          linksGroup.appendChild(line);
        }
      });
    }
    
    // 检查节点是否应该被渲染（考虑折叠状态）
    function shouldRenderNode(nodeId) {
      // 如果节点没有父节点，应该渲染
      if (!parentMap.has(nodeId)) return true;
      
      // 检查所有祖先节点是否都没有被折叠
      let currentId = parentMap.get(nodeId);
      while (currentId) {
        if (collapsedNodes.has(currentId) && collapsedNodes.get(currentId)) {
          return false;
        }
        currentId = parentMap.has(currentId) ? parentMap.get(currentId) : null;
      }
      
      return true;
    }
    
    // 渲染节点
    function renderNodes(graphData, nodesGroup) {
      // 定义节点颜色映射（在代码中统一管理颜色）
      const nodeColors = new Map([
        // 总父节点颜色
        [1, '#8A2BE2'], // 知识图谱（蓝色）
        // 第二层节点颜色
        [2, '#10b981'], 
        [3, '#f59e0b'], 
      ]);
      
      // 首先构建节点映射，方便查找父节点
      const nodeMap = new Map();
      graphData.nodes.forEach(node => {
        nodeMap.set(node.id, node);
      });
      
      // 构建父节点映射
      const parentMap = new Map();
      graphData.links.forEach(link => {
        parentMap.set(link.target, link.source);
      });
      
      // 过滤掉应该被折叠的节点
      const nodesToRender = graphData.nodes.filter(node => shouldRenderNode(node.id));
      
      nodesToRender.forEach(node => {
        // 创建节点组
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        nodeGroup.classList.add('graph-node');
        nodeGroup.dataset.nodeId = node.id;
        
        // 检查节点是否有子节点且不是总父节点
        const isParentNode = childrenMap.has(node.id) && childrenMap.get(node.id).length > 0;
        const isMainDomain = node.type === 'domain' && node.depth === 0;
        const isCollapsible = isParentNode && !isMainDomain;
        
        // 确定节点颜色
        let nodeColor;
        
        // 总父节点（domain类型，深度为0）和第二层节点（深度为1的skill节点）
        // 从代码中的颜色映射获取颜色
        if ((node.type === 'domain' && node.depth === 0) || 
            (node.type === 'skill' && node.depth === 1)) {
          nodeColor = nodeColors.get(node.id) || '#3b82f6'; // 默认蓝色
        } else {
          // 其他节点继承父节点的颜色
          const parentId = parentMap.get(node.id);
          const parentNode = parentMap.has(node.id) ? nodeMap.get(parentId) : null;
          
          if (parentNode) {
            // 尝试从父节点的ID获取颜色
            nodeColor = nodeColors.get(parentId) || '#3b82f6'; // 默认蓝色
          } else {
            nodeColor = '#3b82f6'; // 默认蓝色
          }
        }
        
        // 根据节点类型创建不同形状
        if (node.type === 'domain') {
          // 领域节点 - 圆形
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('r', '30');
          circle.setAttribute('fill', nodeColor);
          // 检查是否需要高亮（发光黄色描边）
          if (node.highlighted) {
            circle.setAttribute('stroke', '#ffcc00');
            circle.setAttribute('stroke-width', '4');
            circle.setAttribute('filter', 'drop-shadow(0 0 8px #ffcc00)');
          } else {
            circle.setAttribute('stroke', '#333');
            circle.setAttribute('stroke-width', '1');
          }
          nodeGroup.appendChild(circle);
        } else if (node.type === 'skill') {
          // 技能节点 - 圆角矩形
          const textLength = Math.max(80, node.label.length * 10);
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', `-${textLength / 2}`);
          rect.setAttribute('y', '-20');
          rect.setAttribute('width', textLength);
          rect.setAttribute('height', '40');
          rect.setAttribute('rx', '8');
          rect.setAttribute('fill', nodeColor);
          // 检查是否需要高亮（发光黄色描边）
          if (node.highlighted) {
            rect.setAttribute('stroke', '#ffcc00');
            rect.setAttribute('stroke-width', '4');
            rect.setAttribute('filter', 'drop-shadow(0 0 8px #ffcc00)');
          } else {
            rect.setAttribute('stroke', '#333');
            rect.setAttribute('stroke-width', '1');
          }
          nodeGroup.appendChild(rect);
        } else {
          // 知识点节点 - 方形
          const textLength = Math.max(60, node.label.length * 9);
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', `-${textLength / 2}`);
          rect.setAttribute('y', '-15');
          rect.setAttribute('width', textLength);
          rect.setAttribute('height', '30');
          rect.setAttribute('rx', '2');
          rect.setAttribute('fill', nodeColor);
          // 检查是否需要高亮（发光黄色描边）
          if (node.highlighted) {
            rect.setAttribute('stroke', '#ffcc00');
            rect.setAttribute('stroke-width', '4');
            rect.setAttribute('filter', 'drop-shadow(0 0 8px #ffcc00)');
          } else {
            rect.setAttribute('stroke', '#333');
            rect.setAttribute('stroke-width', '1');
          }
          nodeGroup.appendChild(rect);
        }
        
        // 如果是可折叠节点，添加折叠标记
        if (isCollapsible) {
          const isCollapsed = collapsedNodes.has(node.id) && collapsedNodes.get(node.id);
          const collapseIcon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          
          // 根据节点类型设置折叠标记的位置
          let iconX, iconY, points;
          
          if (node.type === 'domain') {
            // 领域节点 - 圆形，将标记放在右侧
            iconX = 35;
            iconY = 0;
            points = isCollapsed ? '0,-5 0,5 5,0' : '-5,0 5,0 0,-5';
          } else if (node.type === 'skill') {
            // 技能节点 - 圆角矩形，将标记放在右侧
            const textLength = Math.max(80, node.label.length * 10);
            iconX = textLength / 2 + 10;
            iconY = 0;
            points = isCollapsed ? '0,-5 0,5 5,0' : '-5,0 5,0 0,-5';
          } else {
            // 知识点节点 - 方形，将标记放在右侧
            const textLength = Math.max(60, node.label.length * 9);
            iconX = textLength / 2 + 8;
            iconY = 0;
            points = isCollapsed ? '0,-4 0,4 4,0' : '-4,0 4,0 0,-4';
          }
          
          collapseIcon.setAttribute('transform', `translate(${iconX}, ${iconY})`);
          collapseIcon.setAttribute('points', points);
          collapseIcon.setAttribute('fill', '#ffffff');
          nodeGroup.appendChild(collapseIcon);
        }
        
        // 添加文字标签
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', '#ffffff');
        text.setAttribute('font-size', '12px');
        text.setAttribute('font-weight', '500');
        text.textContent = node.label;
        nodeGroup.appendChild(text);
        
        // 添加悬停效果
        nodeGroup.addEventListener('mouseenter', () => {
          nodeGroup.setAttribute('transform', `translate(${node.x}, ${node.y}) scale(1.15)`);
          nodeGroup.style.transition = 'transform 0.2s ease';
          // 增加阴影效果以增强视觉突出度
          nodeGroup.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))';
          
          // 如果是可折叠节点，改变光标样式
          if (isCollapsible) {
            nodeGroup.style.cursor = 'pointer';
          }
        });
        
        nodeGroup.addEventListener('mouseleave', () => {
          nodeGroup.setAttribute('transform', `translate(${node.x}, ${node.y})`);
          nodeGroup.style.filter = 'none';
          
          // 恢复默认光标样式
          nodeGroup.style.cursor = 'default';
        });
        
        // 如果是可折叠节点，添加点击事件以切换折叠状态
        if (isCollapsible) {
          nodeGroup.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            
            // 切换折叠状态
            const currentState = collapsedNodes.has(node.id) ? collapsedNodes.get(node.id) : false;
            collapsedNodes.set(node.id, !currentState);
            
            // 重新渲染图谱
            currentGraph.linksGroup.innerHTML = '';
            currentGraph.nodesGroup.innerHTML = '';
            
            renderLinks(currentGraph.graphData, currentGraph.linksGroup, DEFAULT_LINK_STROKE_WIDTH);
            renderNodes(currentGraph.graphData, currentGraph.nodesGroup);
          });
        }
        
        nodesGroup.appendChild(nodeGroup);
      });
    }
    
    // 计算图谱的初始缩放比例和偏移量，使整个图谱可见
    function calculateInitialTransform(graphData, containerWidth, containerHeight) {
      if (!graphData.nodes || graphData.nodes.length === 0) {
        return { scale: 1, offsetX: 0, offsetY: 0 };
      }
      
      // 找到所有节点的边界
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      
      graphData.nodes.forEach(node => {
        // 考虑节点大小，添加一些边距
        const nodeWidth = node.type === 'domain' ? 120 : Math.max(60, node.label.length * 9);
        const nodeHeight = 60;
        
        minX = Math.min(minX, node.x - nodeWidth / 2);
        minY = Math.min(minY, node.y - nodeHeight / 2);
        maxX = Math.max(maxX, node.x + nodeWidth / 2);
        maxY = Math.max(maxY, node.y + nodeHeight / 2);
      });
      
      // 计算内容的宽高
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      
      // 计算缩放比例，留出一些边距（10%）
      const scaleX = (containerWidth * 0.9) / contentWidth;
      const scaleY = (containerHeight * 0.9) / contentHeight;
      const scale = Math.min(scaleX, scaleY, 1); // 不超过原始大小
      
      // 计算偏移量，使图谱居中
      const offsetX = (containerWidth - contentWidth * scale) / 2 - minX * scale;
      const offsetY = (containerHeight - contentHeight * scale) / 2 - minY * scale;
      
      return { scale, offsetX, offsetY };
    }
    
    // 初始化交互功能
    function initInteractions(graph, initialTransform = null, graphData = null, resetButtonRef = null) {
      let scale = initialTransform?.scale || 1;
      let offsetX = initialTransform?.offsetX || 0;
      let offsetY = initialTransform?.offsetY || 0;
      let isPanning = false;
      let lastMouseX = 0;
      let lastMouseY = 0;
      
      // 更新图谱变换
      function updateTransform() {
        graph.graphGroup.setAttribute('transform', `translate(${offsetX}, ${offsetY}) scale(${scale})`);
      }
      
      // 应用初始变换
      if (initialTransform) {
        updateTransform();
      }
      
      // 实现回到总父节点的功能
      if (resetButtonRef && graphData) {
        resetButtonRef.addEventListener('click', () => {
          // 找到总父节点（domain类型的第一个节点）
          const mainDomain = graphData.nodes.find(node => node.type === 'domain');
          
          if (mainDomain) {
            // 获取容器尺寸
            const containerRect = container.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;
            
            // 计算需要的偏移量，使总父节点位于中心
            // 应用自定义缩放因子
            const baseScale = initialTransform?.scale || 1;
            const targetScale = baseScale * CENTER_BUTTON_ZOOM_FACTOR;
            const targetOffsetX = centerX - mainDomain.x * targetScale;
            const targetOffsetY = centerY - mainDomain.y * targetScale;
            
            // 平滑过渡到目标位置和缩放
            const duration = 500; // 动画持续时间（毫秒）
            const startTime = performance.now();
            const startScale = scale;
            const startOffsetX = offsetX;
            const startOffsetY = offsetY;
            
            function animate(currentTime) {
              const elapsedTime = currentTime - startTime;
              const progress = Math.min(elapsedTime / duration, 1);
              
              // 使用缓动函数使动画更平滑
              const easeOutQuad = 1 - (1 - progress) * (1 - progress);
              
              scale = startScale + (targetScale - startScale) * easeOutQuad;
              offsetX = startOffsetX + (targetOffsetX - startOffsetX) * easeOutQuad;
              offsetY = startOffsetY + (targetOffsetY - startOffsetY) * easeOutQuad;
              
              updateTransform();
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            }
            
            requestAnimationFrame(animate);
          }
        });
      }
      
      // 鼠标滚轮缩放
      graph.svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const rect = graph.svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // 缩放前的鼠标位置对应的图谱坐标
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(5, scale * scaleFactor));
        
        // 调整偏移量，使鼠标指向的点保持不变
        offsetX = mouseX - (mouseX - offsetX) * (newScale / scale);
        offsetY = mouseY - (mouseY - offsetY) * (newScale / scale);
        
        scale = newScale;
        updateTransform();
      });
      
      // 鼠标拖拽平移
      graph.svg.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // 左键
          isPanning = true;
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
          graph.svg.style.cursor = 'grabbing';
        }
      });
      
      document.addEventListener('mousemove', (e) => {
        if (isPanning) {
          const deltaX = e.clientX - lastMouseX;
          const deltaY = e.clientY - lastMouseY;
          
          offsetX += deltaX;
          offsetY += deltaY;
          
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
          
          updateTransform();
        }
      });
      
      document.addEventListener('mouseup', () => {
        if (isPanning) {
          isPanning = false;
          graph.svg.style.cursor = 'grab';
        }
      });
      
      document.addEventListener('mouseleave', () => {
        if (isPanning) {
          isPanning = false;
          graph.svg.style.cursor = 'grab';
        }
      });
      
      // 初始化鼠标样式
      graph.svg.style.cursor = 'grab';
      
      // 窗口大小改变时重新布局
      window.addEventListener('resize', () => {
        const containerRect = container.getBoundingClientRect();
        graph.svg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);
        
        // 重新应用布局
        applyAutomaticLayout(graph.graphData, containerRect.width / 2, containerRect.height / 2);
        
        // 重新渲染
        graph.linksGroup.innerHTML = '';
        graph.nodesGroup.innerHTML = '';
        
        renderLinks(graph.graphData, graph.linksGroup, DEFAULT_LINK_STROKE_WIDTH);
        renderNodes(graph.graphData, graph.nodesGroup);
      });
    }
    
    // 启动知识图谱
    initGraph();
  });
}
</script>