
<style>
  /* Strava活动容器样式 */
  .strava-activities-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 24px;
    width: 100%;
    max-width: 1648px; /* 2个800px容器 + 24px间距 */
    margin: 0 auto;
  }
  
  /* 单个Strava活动样式 - 使用强制规则 */
  .strava-embed-container {
    position: relative;
    overflow: hidden !important; /* 强制隐藏容器的滚动条 */
    height: 500px !important; /* 固定高度 */
    width: calc(50% - 12px) !important; /* 两个并排，减去间距的一半 */
    max-width: 800px !important;
    pointer-events: none; /* 禁用鼠标事件，防止通过鼠标滚动 */
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  /* 针对iframe的样式覆盖 - 使用最高优先级 */
  .strava-embed-container iframe {
    width: 100% !important;
    height: 500px !important; /* 固定高度，与容器一致 */
    border: none !important;
    border-radius: 8px !important;
    overflow: hidden !important; /* 强制禁用iframe自身的滚动条 */
    pointer-events: none !important; /* 禁用iframe内的鼠标事件 */
  }
  
  /* 超级强制规则 - 覆盖所有可能的子元素 */
  .strava-embed-container *,
  .strava-embed-container *::before,
  .strava-embed-container *::after {
    overflow: hidden !important;
    max-height: 100% !important;
    max-width: 100% !important;
    pointer-events: none !important;
  }
  
  /* 防止键盘滚动 */
  .strava-embed-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .strava-embed-container::-webkit-scrollbar {
    display: none;
  }
</style>

<!-- Strava活动嵌入内容区域 - 动态加载 -->
<div class="strava-activities-wrapper">
  <div id="strava-activities-container">
    <div style="text-align: center; padding: 2rem;">
      <p>正在加载Strava活动内容...</p>
    </div>
  </div>
</div>

<!-- 动态加载Strava活动内容和处理脚本 -->
<script>
  if (!window.location.href.includes('?refreshed=true')) {
      // 添加刷新标记并重新加载页面
      window.location.href = window.location.href + '?refreshed=true';
    } else {
  document.addEventListener('DOMContentLoaded', function() {
    // 1. 首先加载Strava嵌入脚本
    function loadStravaEmbedScript() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://strava-embeds.com/embed.js';
        script.onload = function() {
          console.log('Strava embed script loaded successfully');
          resolve();
        };
        script.onerror = function() {
          console.error('Failed to load Strava embed script');
          reject(new Error('Failed to load Strava embed script'));
        };
        document.body.appendChild(script);
      });
    }
    
    // 2. 加载外部HTML文件内容
    function loadExternalHtml(url) {
      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .catch(error => {
          console.error('Failed to load external HTML:', error);
          return `<div style="text-align: center; padding: 2rem; color: red;"><p>加载Strava活动失败: ${error.message}</p></div>`;
        });
    }
    
    // 3. 应用滚动阻止逻辑
    function applyScrollPrevention() {
      const allContainers = document.querySelectorAll('.strava-embed-container');
      
      allContainers.forEach(function(container) {
        const iframe = container.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          try {
            // 尝试在iframe内容中阻止滚动
            iframe.contentWindow.document.body.style.overflow = 'hidden';
            iframe.contentWindow.document.body.style.maxHeight = '100%';
            iframe.contentWindow.document.body.style.maxWidth = '100%';
            
            // 添加滚动事件监听器并阻止其默认行为
            iframe.contentWindow.addEventListener('scroll', function(e) {
              e.preventDefault();
              return false;
            }, { passive: false });
            
            // 阻止鼠标滚轮事件
            iframe.contentWindow.addEventListener('wheel', function(e) {
              e.preventDefault();
              return false;
            }, { passive: false });
            
            // 阻止键盘滚动
            iframe.contentWindow.addEventListener('keydown', function(e) {
              // 阻止方向键、Page Up/Down、空格等滚动键
              const scrollKeys = [32, 33, 34, 38, 40];
              if (scrollKeys.includes(e.keyCode)) {
                e.preventDefault();
                return false;
              }
            });
          } catch (error) {
            // 跨域限制是预期的，这里只是记录日志
            console.log('无法访问iframe内容（跨域限制）:', error);
          }
        }
      });
    }
    
    // 4. 主流程：先加载嵌入脚本，再加载HTML内容
    loadStravaEmbedScript()
      .then(() => {
        console.log('开始加载外部HTML文件...');
        // 加载外部HTML文件
        return loadExternalHtml('/strava/strava_activity_embeds.html');
      })
      .then(htmlContent => {
        console.log('外部HTML文件加载成功，内容长度:', htmlContent.length);
        // 插入加载的内容
        const container = document.getElementById('strava-activities-container');
        if (container) {
          container.innerHTML = htmlContent;
          
          // 重新触发Strava嵌入脚本的处理 - 使用多种可能的方法
          if (window.processEmbedPlaceholders) {
            console.log('使用processEmbedPlaceholders函数处理嵌入内容');
            window.processEmbedPlaceholders();
          } else if (window.stravaEmbed && typeof window.stravaEmbed.process === 'function') {
            console.log('使用stravaEmbed.process函数处理嵌入内容');
            window.stravaEmbed.process();
          } else {
            console.log('尝试通过重新创建脚本标签来触发处理');
            // 尝试重新加载一次脚本以触发处理
            const script = document.createElement('script');
            script.src = 'https://strava-embeds.com/embed.js';
            script.async = true;
            document.body.appendChild(script);
          }
          
          // 等待iframe加载完成后应用滚动阻止
          setTimeout(() => {
            applyScrollPrevention();
          }, 3000); // 增加等待时间到3秒
        }
      })
      .catch(error => {
        console.error('Error in main process:', error);
        const container = document.getElementById('strava-activities-container');
        if (container) {
          container.innerHTML = `<div style="text-align: center; padding: 2rem; color: red;"><p>处理Strava活动时出错: ${error.message}</p><p>请检查控制台获取更多信息</p></div>`;
        }
      });
  });

  // 自动刷新功能 - 仅在首次访问时刷新页面
  (function() {
    const pageVisitedKey = 'me_page_visited';
    
    // 检查是否是首次访问
    if (!localStorage.getItem(pageVisitedKey)) {
      // 设置访问标记
      localStorage.setItem(pageVisitedKey, 'true');
      
      
    }
  })();}
</script>