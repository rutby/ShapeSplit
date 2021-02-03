# Shadow2D

凹多边形拆分凸多边形算法, 核心思想是逆时针顺序遍历顶点, 叉积求相邻线段的方向, 取得凹点. 取上一个顶点与凹点的延长线所组成线段的延长线, 与其他线段的最近交点, 构成新的顶点, 继续遍历, 直到找到已遍历顶点. 第一轮结束. 对剩余顶点做第二轮, 第三轮遍历.

# Preview

![preview1](preview/preview1.png)

![preview2](preview/preview2.png)