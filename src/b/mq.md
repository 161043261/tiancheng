# MQ 消息队列

## 概念

- cluster 集群: 运行 kafka 实例的机器集合
- broker 代理: 单个 kafka 实例
- event 事件: 即消息, 包含: 事件键、事件值、事件时间戳
- topic 主题: 事件类比日志记录, 主题类比日志文件, 分区类比日志目录
- producer: 生产者, 将消息写入一个或多个主题的客户端
- consumer: 消费者, 从一个或多个主题读取消息的客户端
- partition 分区: 每个主题的事件分区存储, 事件键相同的事件会被存储到同一个分区; 为了保证按正确的顺序读取消息, 相同时刻, 只允许一个消费组成员从指定分区中读取消息
- replica 副本: 一个分区通常会被复制到一个或多个代理, 以避免消息丢失, 实现高可用
- leader 分区领导者: 虽然一个分区通常会被复制到一个或多个代理, 但是某个代理会被选举为该分区的领导者, 并且只有领导者可以读取或写入该分区
- consumer group 消费者组: 由 groupId 标识的一组消费者实例的集合
- group coordinator 消费者组协调员: 消费者组中的实例, 负责为消费者组成员分配消费的分区
- offset 偏移量: 分区中消费的偏移量, 消费者消费后, 会提交该偏移量, 通知代理「本消费者组已消费该消息」; 如果消息者组重新启动, 将从提交的最高偏移量开始继续消费
- rebalance 重新平衡: 当消费者加入或离开消费者组时, 该消费者组必须重新平衡, 即必须选择一个协调员, 重新为消费者组成员分配消费的分区
- heartbeat 心跳: 分区领导者用于确认消费者是否存活的机制; 每个消费者必须每隔 `heartbeatInterval` 时间间隔向分区领导者发送心跳请求; 如果某个消费者在 `sessionTimeout` 时间间隔内未发送心跳请求, 则视为死亡, 并从消费者组中移除, 进而触发重新平衡

```sh
# 示例事件
Event key: "Alice"
Event value: "Made a payment of $200 to Bob"
Event timestamp: "Jun. 25, 2020 at 2:06 p.m."
```

### partition 分区设计

- 负载均衡、提高吞吐量、提高可扩展性
- 保存消息的副本, 实现高可用

## 搭建 kafka 集群

```bash
git clone git@github.com:conduktor/kafka-stack-docker-compose.git

# Full stack
docker compose -f full-stack.yml up -d
docker compose -f full-stack.yml down -v
# Single Zookeeper / Single Kafka
docker compose -f zk-single-kafka-single.yml up -d
docker compose -f zk-single-kafka-single.yml down -v
# Single Zookeeper / Multiple Kafka
docker compose -f zk-single-kafka-multiple.yml up -d
docker compose -f zk-single-kafka-multiple.yml down -v
# Multiple Zookeeper / Single Kafka
docker compose -f zk-multiple-kafka-single.yml up -d
docker compose -f zk-multiple-kafka-single.yml down -v
# Multiple Zookeeper / Multiple Kafka
docker compose -f zk-multiple-kafka-multiple.yml up -d
docker compose -f zk-multiple-kafka-multiple.yml down -v
```
