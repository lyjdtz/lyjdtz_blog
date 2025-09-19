---
title: 关于变量命名本身
published: 2025-09-19
description:  '关于变量名字本身存储的探讨'
image: ''
tags: [C++]
category: 'programming'
draft: false
---

对于这样一段代码
```C++ "student"
typedef struct
    {
        int name;
        int number;
    } student;
```

&emsp;&emsp;在 C/C++ 里，“类型名字”本身（即"student"）不是运行期的对象，它只是编译期符号表里的一个条目。因此它既不会出现在最终的可执行文件的数据段、BSS 段，也不会出现在栈或堆上。


&emsp;&emsp;编译器在解析完这段代码后，会把 student 登记到内部的符号表里：

&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;“有一个聚合类型，它有两个 4 字节的整型成员，总大小 8，对齐要求 4。”

&emsp;&emsp;登记的是元数据，不是数据对象。一旦生成机器码，这个名字就被“忘掉”了（debug 版会保留一部分给调试器用，但那是 DWARF 信息，不在 .data/.bss/stack/heap 里）。

&emsp;&emsp;为了让调试器能告诉你“这块 8 字节的数据是 student 类型”，编译器把类型描述信息写进了 .debug_info、.debug_abbrev 等段。这些段在运行期不会被映射到进程地址空间的可写区域，也不影响 sizeof(student)。