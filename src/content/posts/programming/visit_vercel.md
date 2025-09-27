---
title: 如何在国内访问Vercel部署的应用
published: 2025-09-27
description:  '加速Vercel应用访问'
image: ''
tags: [DNS加速]
category: '编程'
draft: false
---

&emsp;&emsp; 博客这两天一直裸连打不开，貌似Vercel被墙了，就换了下解析的DNS加速国内的裸连。

&emsp;&emsp;具体域名准备，解析和Vercel的设置不再赘述，不属于本文的教学范围。

# Cloudflare 配置

&emsp;&emsp;前往[Cloudflare](https://www.cloudflare-cn.com/)，进入个人中心。

<center>

![](visit_vercel/20250927125551.png)
</center>

&emsp;&emsp;添加一个新的域,配置全部使用默认即可

<center>

![](visit_vercel/20250927130042.png)
</center>



&emsp;&emsp;按照需求选择套餐

<center>

![](visit_vercel/20250927130246.png)
</center>

&emsp;&emsp;选择你要为国内加速的记录解析

<center>

![](visit_vercel/20250927130502.png)
</center>

&emsp;&emsp;Cloudflare会给你分配两个DNS服务器

<center>

![](visit_vercel/20250927130613.png)
</center>

# DNS配置

&emsp;&emsp;前往你购买域名的服务商，这里以阿里云为例。

&emsp;&emsp;在域名管理界面修改DNS服务器，更换为Cloudflare提供的DNS服务器。

<center>

![](visit_vercel/20250927131138.png)
</center>

# 重定向配置

&emsp;&emsp;由于Cloudflare的站点加密模式，可能会出现重定向次数过多的情况。

&emsp;&emsp;前往Cloudflare，进入你域名的SSL/TLS配置项。

&emsp;&emsp;将Encryption mode 更改为 FULL(Strict)

<center>

![](visit_vercel/20250927131725.png)
</center>


&emsp;&emsp;至此，所有的配置已完成，你需要等待DNS缓存刷新，国内加速才会生效，刷新时间一般取决于服务商不会超过24小时。