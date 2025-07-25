# Redis

```bash
docker exec -it redis /bin/bash

redis-cli

redis-cli -h <host> -p <port> -a <password>
```

## 配置

```bash
config get <param> [<param2> ...]
config set <param> <value> [<param2> <value2> ...]

# e.g.
config get loglevel
config set loglevel "notice" # 默认 notice
```

## 数据类型

- string 字符串
- hash 哈希
- list 列表
- set 集合
- zset (sorted set) 有序集合
- stream
- bitmap
- ...

## string 字符串

```bash
set <key> <value>

get <key>

incr <key> # increase

decr <key> # decrease

append <key> <value>

del <key> [<key2> ...] # delete

# e.g.
set name Yukino
append name Shita
get name # "YukinoShita"
```

## hash 哈希

hash 类似 `Map<string, string>`, `map[string]string`

```bash
hset <key> <field> <value> [<field2> <value2> ...]

hget <key> <field>

hgetall <key>

hdel <key> <field> [<field2> ...]
```

## list 列表

list 类似 `string[], Array<string>`, `[]string`

```bash
lpush <key> <elem> [<elem2> ...]
rpush <key> <elem> [<elem2> ...]
lpop <key>
rpop <key>
lrange <key> <start> <stop> # 左闭右闭

# e.g.
lpush hobbies dance sing rap basketball
lrange hobbies 0 2 # "basketball" "rap" "sing"
```

## set 集合

set 类似 `Set<string>`, `map[string]struct{}`, 不重复

```bash
sadd <key> <member> [<member2> ...]

srem <key> <member> [<member2> ...] # remove

smembers <key>

sismember <key> <value>
```

## zset (sorted set) 有序集合

zset 类似 `[score: number, member: string][]`, member 成员唯一; 并且指定排序规则: zset 的每个成员都关联一个 float64 类型的分数, redis 按照分数从小到大, 分数相同时, 按照成员的字典序从小到大, 对成员进行排序

```bash
zadd <key> <score> <member> [<score2> <member2> ...]
# e.g.
zadd stat 5 a 2 b 8 c 3 d

zrange <key> <start> <stop> [withscores]
# e.g.
zrange stat 0 2 # "b" "d" "a"
zrange stat 0 2 withscores # "b" "2" "d" "3" "a" "5"

zrem <key> <member> [<member2> ...] # remove

zscore <key> <member>
# e.g.
zscore stat a # "5"
```
