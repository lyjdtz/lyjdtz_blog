# CHSPIF众筹界面
:::warning
如果你不知道这个界面是干什么的，请不要继续阅读
:::

## 众筹进度

<div class="crowdfunding-progress">
  <div class="progress-info">
    <div class="progress-amounts">
      <span id="current-amount">¥50,000</span> / <span id="target-amount">¥100,000</span>
    </div>
    <div class="progress-percentage" id="progress-percentage">50%</div>
  </div>
  <div class="progress-bar-container">
    <div class="progress-bar-fill" id="progress-bar-fill"></div>
  </div>
</div>

<script>
  // 注意：这里的金额变量可以直接在代码中修改，无需通过前端界面
  // =================== 修改这里的值 ===================
  const TARGET_AMOUNT = 3000; // 目标金额（后台修改处）
  const CURRENT_AMOUNT = 1500; // 当前金额（后台修改处）
  // =================== 修改这里的值 ===================
  
  // 获取DOM元素
  const targetAmountDisplay = document.getElementById('target-amount');
  const currentAmountDisplay = document.getElementById('current-amount');
  const progressPercentage = document.getElementById('progress-percentage');
  const progressBarFill = document.getElementById('progress-bar-fill');

  // 初始化进度显示
  function initProgress() {
    // 计算百分比
    let percentage = 0;
    if (TARGET_AMOUNT > 0) {
      percentage = Math.min((CURRENT_AMOUNT / TARGET_AMOUNT) * 100, 100);
    }
    
    // 格式化金额显示
    const formatAmount = (amount) => {
      return '¥' + amount.toLocaleString('zh-CN');
    };
    
    // 更新显示
    targetAmountDisplay.textContent = formatAmount(TARGET_AMOUNT);
    currentAmountDisplay.textContent = formatAmount(CURRENT_AMOUNT);
    progressPercentage.textContent = `${percentage.toFixed(1)}%`;
    progressBarFill.style.width = `${percentage}%`;
    
    // 根据进度设置颜色
    if (percentage >= 100) {
      progressBarFill.style.backgroundColor = '#22c55e'; // 绿色
    } else if (percentage >= 50) {
      progressBarFill.style.backgroundColor = '#f59e0b'; // 橙色
    } else {
      progressBarFill.style.backgroundColor = '#3b82f6'; // 蓝色
    }
  }

  // 页面加载时初始化
  initProgress();
</script>


:::caution
请务必务必务必确保你在接受众筹前，已经完整阅读了本页面所有内容！
:::

## 为什么众筹
&emsp;&emsp; chspif目前任何服务皆为免费提供给玩家。目前由于兔子生活地点问题，服务器暂时挂在在云端。

&emsp;&emsp; 假设能承担现有玩家体量的云端服务器每个月的支出约为A,构建当前云服务器四倍性能的物理服务器的成本约为B,经计算B约等于8-10倍的A。即构建一台当前云端四倍性能的物理机，只需要当前状态下云端支出的8-10个月即可回本。从性能、成本、拓展和维护上，物理机都是最佳选择。

&emsp;&emsp; 除去服务器成本，目前服务器运维和游戏内各种功能的开发、维护、更新都是兔子一个人在做，所以兔子希望和玩家共同承担机器的成本。

## 如何验证我的身份/资金去向/承诺

### 身份验证
&emsp;&emsp; 你可以点击[这里](https://lyjdtz-1300831543.cos.ap-nanjing.myqcloud.com/7c207834-e394-488b-a7c5-21e587f05d16.pdf)查看兔子的**身份验证文件**。

&emsp;&emsp; 该文件由国家移民管理局出具，文件内包含了国家移民管理局的**电子签名**。

&emsp;&emsp; 你可以点击[这里](https://s.nia.gov.cn/mps/download/index.html)下载国家移民管理局的**电子文件验签颁发者证书**，用于比对验证该文件为国家移民管理局出具，从而验证本众筹由兔子本人发起。

### 资金去向
&emsp;&emsp; 众筹所得每一笔资金来源和去向都会公示在服务器官网，并会同步到Github仓库。

### 承诺有效性
&emsp;&emsp; 本页面的内容同样会同步到Github仓库，你可以关注仓库提交记录来验证本页面的承诺是否有进行过修改。
&emsp;&emsp; [这里](https://github.com/Lyjdtz/Lyjdtz_blog)是仓库地址。

## 众筹方案
- 在物理机架设后，服务器的所有服务仍为玩家免费提供。所以本众筹为**非强制性**，即**是否众筹非强制性**，**众筹金额非强制性**。
- 总物理机假设预算约3000元人民币，其中众筹目标为预算的一半，即**1500元人民币**。
- 若众筹金额超过达到1500元，意味着众筹成功，此时兔子会补贴剩余预算差额和以后所有的运维费用。
- 若众筹金额未达到1500元，意味着众筹失败，所有已经众筹的金额会全部原路退回，服务器以后会按照何种方式运维会待定。

## 承诺
- 众筹失败时，所有金额会**全部原路退回**。
- 参与众筹者会得到稳定的我的世界游戏服务器运维服务，同时有权使用服务器的剩余性能。
- 参与众筹者的名字会被公示到服务器官网上。
- **如果有一天服务器关停，会按照合适的方式对服务器价值进行折损计算，折损后的价值会按照当初众筹的比例再返还给众筹者**。

## 众筹方式
:::warning
请在参与众筹后，联系兔子发送你的众筹证明，以方便验证资金透明/感谢众筹者/退款等。
:::

&emsp;&emsp; 联系方式
- 邮箱：1542761533@qq.com
- QQ: 1542761533
- 微信：a2311668296

&emsp;&emsp;你可以通过以下两种方式参与众筹
    ![](https://img.cdn1.vip/i/6903151ce2f6f_1761809692.webp)

<style>
  .crowdfunding-progress {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1.5rem;
    background-color: #f9fafb;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .progress-amounts {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }
  
  .progress-percentage {
    font-size: 1.25rem;
    font-weight: 700;
    color: #3b82f6;
  }
  
  .progress-bar-container {
    width: 100%;
    height: 24px;
    background-color: #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
  }
  
  .progress-bar-fill {
    height: 100%;
    background-color: #3b82f6;
    border-radius: 12px;
    transition: width 0.3s ease, background-color 0.3s ease;
  }
</style>

