# 算法

## Node.js ACM 模式

```js
const readline = require("node:readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("line", (line) => {
  console.log(line);
});
```

## 堆排序 (优先级队列)

::: code-group

```ts [堆排序 TS]
// 大/小根堆是满二叉树
// 大根堆: 父节点 >= 左右子节点; 小根堆: 父节点 <= 左右子节点
// 最后一个叶子节点的数组下标 const lastLeafIdx = heapSize - 1;
// 最后一个叶子节点的父节点是最后一个非叶节点
// 最后一个非叶节点的数组下标 const lastNotLeafIdx = Math.floor((lastLeafIdx - 1) / 2)
// 从最后一个非叶节点开始, 构造大/小根堆
function buildMaxHeap(nums: number[], heapSize: number) {
  const lastLeafIdx = heapSize - 1;
  const lastNotLeafIdx = Math.floor((lastLeafIdx - 1) / 2);
  for (let idx = lastNotLeafIdx; idx >= 0; idx--) {
    maxHeapify(nums, idx, heapSize);
  }
}

function buildMinHeap(nums: number[], heapSize: number) {
  const lastLeafIdx = heapSize - 1;
  const lastNotLeafIdx = Math.floor((lastLeafIdx - 1) / 2);
  for (let idx = lastNotLeafIdx; idx >= 0; idx--) {
    minHeapify(nums, idx, heapSize);
  }
}

/**
 *
 * @param nums nums.slice(0, heapSize) 大根堆节点数组
 * @param idx 当前调整的节点的数组下标
 * @param heapSize 大根堆的大小
 * @description 构造大根堆: 小节点不断下沉
 */
function maxHeapify(nums: number[], idx: number, heapSize: number) {
  let childIdx = idx;
  const left = 2 * idx + 1;
  const right = 2 * idx + 2;
  if (left < heapSize && nums[left] > nums[childIdx]) {
    childIdx = left;
  }
  if (right < heapSize && nums[right] > nums[childIdx]) {
    childIdx = right;
  }
  if (childIdx !== idx) {
    [nums[idx], nums[childIdx]] = [nums[childIdx], nums[idx]];
    maxHeapify(nums, childIdx, heapSize);
  }
}

/**
 *
 * @param nums nums.slice(0, heapSize) 小根堆节点数组
 * @param idx 当前调整的节点的数组下标
 * @param heapSize 小根堆的大小
 * @description 构造小根堆: 大节点不断下沉
 */
function minHeapify(nums: number[], idx: number, heapSize: number) {
  let childIdx = idx;
  const left = 2 * idx + 1;
  const right = 2 * idx + 2;
  if (left < heapSize && nums[left] < nums[childIdx]) {
    childIdx = left;
  }
  if (right < heapSize && nums[right] < nums[childIdx]) {
    childIdx = right;
  }
  if (childIdx !== idx) {
    [nums[idx], nums[childIdx]] = [nums[childIdx], nums[idx]];
    minHeapify(nums, childIdx, heapSize);
  }
}
```

```cpp [堆排序 Cpp]
#include <utility> // swap
#include <vector>

using namespace std;

void maxHeapify(vector<int> &nums, int idx, int heapSize) {
  auto childIdx = idx;
  auto left = idx * 2 + 1;
  auto right = idx * 2 + 2;
  if (left < heapSize && nums[left] > nums[childIdx]) {
    childIdx = left;
  }
  if (right < heapSize && nums[right] > nums[childIdx]) {
    childIdx = right;
  }
  if (childIdx != idx) {
    swap(nums[idx], nums[childIdx]);
    maxHeapify(nums, childIdx, heapSize);
  }
}

void minHeapify(vector<int> &nums, int idx, int heapSize) {
  auto childIdx = idx;
  auto left = idx * 2 + 1;
  auto right = idx * 2 + 2;
  if (left < heapSize && nums[left] < nums[childIdx]) {
    childIdx = left;
  }
  if (right < heapSize && nums[right] < nums[childIdx]) {
    childIdx = right;
  }
  if (childIdx != idx) {
    swap(nums[idx], nums[childIdx]);
    minHeapify(nums, childIdx, heapSize);
  }
}

void buildMaxHeap(vector<int> &nums, int heapSize) {
  auto lastLeafIdx = heapSize - 1;
  auto lastNotLeafIdx = (lastLeafIdx - 1) / 2;
  for (auto idx = lastNotLeafIdx; idx >= 0; idx--) {
    maxHeapify(nums, idx, heapSize);
  }
}

void buildMinHeap(vector<int> &nums, int heapSize) {
  auto lastLeafIdx = heapSize - 1;
  auto lastNotLeafIdx = (lastLeafIdx - 1) / 2;
  for (auto idx = lastNotLeafIdx; idx >= 0; idx--) {
    minHeapify(nums, idx, heapSize);
  }
}
```

:::
