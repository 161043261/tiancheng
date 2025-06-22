# MySQL

## 说明

- `<databaseName>` 表示必填的「数据库名」
- `[-D <databaseName>]` 表示「指定数据库名」是可选的

```bash
alter user 'root'@'localhost' identified with mysql_native_password BY 'pass';
flush privileges;
sudo systemctl restart mysql

# -p 后面没有空格
mysql -u <username> -p<password> [-D <databaseName>]
```

- 函数: 字符串函数, 数值函数, 日期函数, 流程函数
- 外键
- 内连接, 外连接, 自连接
- 事务
- 存储引擎
- 索引
- SQL 优化
- 视图
- 存储过程
- 触发器
- 锁
- 日志
- 主从复制
- 分库分表
- 读写分离

## 创建表, 修改表

```sql
-- 查询所有数据库
show databases;

-- 创建数据库
create database [if not exists] <databaseName> [default charset <charsetName>] [collate collateName];
-- e.g.
create database if not exists db0 default charset utf8mb3 collate utf8mb3_general_ci;

-- 使用数据库
use <databaseName>;

-- 查询当前数据库
select database();

-- 删除数据库
drop database [if exists] <databaseName>;
drop database [if exists] <databaseName>, <databaseName2>, ...;

-- 查询当前数据库的所有表
show tables;
show tables from <databaseName>;

-- 创建表
create table [if not exists] <tableName> (
  <primaryKey>  int unsigned auto_increment primary key,  -- 无符号整型自增主键
  <columnName2> varchar(160) not null unique,             -- 非空唯一变长字符串
  <columnName3> boolean default true,                     -- 默认 true
  <columnName4> int check (columnName2 between 0 and 100) -- 检查约束
)
  collate utf8mb3_general_ci -- 使用 utf8mb3_general_ci 排序规则
  default charset = utf8mb3  -- 使用 utf8mb3 字符集
  engine = InnoDB;           -- 使用 InnoDB 存储引擎

-- 描述表结构
desc <tableName>;
-- 等价于
describe <tableName>;
explain <tableName>;
show columns from <tableName>;
show fields from <tableName>;

-- 查询创建表的 sql
show create table <tableName>;
-- 格式化输出
show create table <tableName> \G;

-- 删除表
drop table [if exists] <tableName>;
drop table [if exists] <tableName>, <tableName2>, ...;

-- 清空表
truncate table <tableName>

-- 增加字段
alter table <tableName> add <newColumnName> <dataType>;

-- 在指定字段的后面增加字段
alter table <tableName> add <newColumnName> <dataType> after <columnName>;

-- 删除字段
alter table <tableName> drop <columnName>;

-- 修改字段的数据类型 (modify)
alter table <tableName> modify <columnName> <dataType>;

-- 修改字段的字段名和数据类型 (change)
alter table <tableName> change <oldColumnName> <newColumnName> <dataType>;

-- 修改表名
alter table <oldTableName> rename <newTableName>;
```

## 数据类型

| 数据类型       | 大小             | 描述                |
| -------------- | ---------------- | ------------------- |
| tinyint        | 1 byte           | 极小整数            |
| smallint       | 2 bytes          | 小整数              |
| mediumint      | 3 bytes          | 中整数              |
| int 或 integer | 4 bytes          | 大整数              |
| bigint         | 8 bytes          | 极大整数            |
| float          | 4 bytes          | 单精度浮点数        |
| double         | 8 bytes          | 双精度浮点数        |
| decimal        |                  | 小数                |
| char           | 0 ~ 2^8-1 bytes  | 定长字符串          |
| varchar        | 0 ~ 2^16-1 bytes | 变长字符串          |
| tinyblob       | 0 ~ 2^8-1 bytes  | 极短二进制数据      |
| tinytext       | 0 ~ 2^8-1 bytes  | 极短文本数据        |
| blob           | 0 ~ 2^16-1 bytes | 短二进制数据        |
| text           | 0 ~ 2^16-1 bytes | 短文本数据          |
| mediumblob     | 0 ~ 2^24-1 bytes | 二进制数据          |
| mediumtext     | 0 ~ 2^24-1 bytes | 文本数据            |
| longblob       | 0 ~ 2^32-1 bytes | 长二进制数据        |
| longtext       | 0 ~ 2^32-1 bytes | 长文本数据          |
| date           | 3 bytes          | yyyy-mm-dd          |
| time           | 3 bytes          | hh:mm:ss            |
| year           | 1 bytes          | yyyy                |
| datetime       | 8 bytes          | yyyy-mm-dd hh:mm:ss |
| timestamp      | 4 bytes          | yyyy-mm-dd hh:mm:ss |

## 插入, 更新, 删除

```sql
-- 插入
insert into <tableName> (<column1>, <column2>, ...)
values (<row1value1>, <row2value2>, ...), (<row2value1>, <row2value2>, ...), ...;
-- All columns
insert into <tableName>
values (<row1value1>, <row2value2>, ...), (<row2value1>, <row2value2>, ...), ...;

-- 更新
update <tableName> set <column1> = <value1>, <column2> = <value2>, ... [where <condition_expr>];

-- 删除
delete from <tableName> [where <condition_expr>];
```

## 查询

- and &&
- or ||
- not !
- between l and r 左闭右闭 [l, r]
- in `Array.prototype.includes`
- like 通配符 (\_ 匹配单个字符, % 匹配任意个字符)
- is [not] null

```sql
select [distinct] <column1> [as <alias1>], <column2> [as <alias2>], ... -- distinct 去重

from <tableName>

where <condition_expr>                                 -- where 分组前过滤

group by <column1>, <column2>, ...                     -- group by 分组字段列表

having <condition_expr>                                -- having 分组后过滤

order by <column1> [asc]|desc, column2 [asc]|desc, ... -- order by 排序查询

limit <startIndex>, <pageSize>;                        -- limit 分页查询
```

### 聚合函数

- count, max, min, avg, sum
- null 值不参与聚合函数的计算
- where 条件中不能有聚合函数, having 条件中可以有聚合函数

## 用户管理, 权限控制

| 权限                | 说明                       |
| ------------------- | -------------------------- |
| all, all privileges | 所有权限                   |
| select              | 查询权限                   |
| insert              | 插入权限                   |
| update              | 修改权限                   |
| delete              | 删除权限                   |
| alter               | 修改表的权限               |
| drop                | 删除数据库, 表, 视图的权限 |
| create              | 创建数据库, 表的权限       |

```sql
-- 查询用户
use mysql;
select * from user;

-- 创建用户
create user '<username>'@'<hostname>' identified by '<password>';

-- 修改用户密码
alter user '<username>'@'<hostname>' identified with mysql_native_password by '<newPassword>';

-- 删除用户
drop user '<username>'@'<hostname>';

-- 查询权限
show grants for '<username>'@'<hostname>';

-- 授予权限
grant <privilegeName1>, <privilegeNam2>, ... on <databaseName>.<tableName> to '<username>'@'hostname';

-- 撤销权限
revoke <privilegeName1>, <privilegeNam2>, ... on <databaseName>.<tableName> from '<username>'@'<hostname>';
```

## 函数

### 字符串函数

- concat(s1, s2, ...)
- lower(str)
- upper(str)
- lpad(str, n, padStr)
- rpad(str, n, padStr)
- trim(str)
- substring(str, start, len)

### 数值函数

- ceil(x)
- floor(x)
- mod(x, y)
- rand()
- round(x, y)

### 日期函数

- curdate()
- curtime()
- now()
- year(date)
- month(date)
- day(date)
- date_add(date, interval)
- datediff(date1, date2)

### 流程函数

`if(<cond>, <ret1>, <ret2>)`

等价于 `return cond ? ret1 : ret2;`

`ifnull(<val1>, <val2>)`

等价于 `return val1 != null ? val1 : val2;`

`case when <cond1> then <ret1> when <cond2> then <ret2> ... else <default> end`

等价于 `if (cond1) return ret1; if (cond2) return ret2; ... return default;`

`case <expr> when <val1> then <ret1> when <val2> then <ret2> ... else <default> end`

等价于 `if (expr == val1) return ret1; if (expr == val2) return ret2; ... return default`

```shell
# 字符串函数
CONCAT, LOWER, UPPER, LPAD, RPAD, TRIM, SUBSTRING
# 数值函数
CEIL, FLOOR, MOD, RAND, ROUND
# 日期函数
CURDATE, CURTIME, NOW, YEAR, MONTH, DAY, DATE_ADD, DATEDIFF
# 流程函数
IF, IFNULL, CASE [...] WHEN ... THEN ...  ELSE ... END
```

### 1.6 约束

| 约束     | 关键字      |
| -------- | :---------- |
| 非空约束 | NOT NULL    |
| 唯一约束 | UNIQUE      |
| 主键约束 | PRIMARY KEY |
| 默认约束 | DEFAULT     |
| 检查约束 | CHECK       |
| 外键约束 | FOREIGN KEY |

```sql
CREATE TABLE tableName (
    primaryKey  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  # 无符号整型自增主键
    columnName0 VARCHAR(16) NOT NULL UNIQUE,              # 非空唯一变长字符串
    columnName1 BOOLEAN DEFAULT TRUE,                     # 默认TRUE
    columnName2 INT CHECK (columnName2 BETWEEN 0 AND 100) # 检查约束
);
```

外键: 关联两表的数据, 保证数据的一致性, 完整性

### 1.7 多表查询

1. 一对多: "多的一方"的外键, 关联"一的一方"的主键
2. 多对多: 创建中间表, 中间表至少有 2 个外键, 分别关联两方的主键
3. 一对一: 一方的外键, 关联另一方的主键, 外键唯一 (UNIQUE)

多表查询分类

- 连接查询
  - 内连接: L∩R
  - 外连接: 左外连接: L 和 L∩R; 右外连接: R 和 L∩R
  - 自连接
- 子查询

连接查询

```sql
# 隐式内连接
SELECT columnNames FROM table1, table2 WHERE conditions;
# 显式内连接
SELECT columnNames FROM table1 [INNER] JOIN table2 ON conditions;
# 左外连接
SELECT columnNames FROM table1 LEFT [OUTER] JOIN table2 ON conditions;
# 右外连接
SELECT columnNames FROM table1 RIGHT [OUTER] JOIN table2 ON conditions;
# 自连接
SELECT columnNames FROM tableName alias1 JOIN tableName alias2 ON conditions;
```

联合查询: 联合查询的列数, 列类型应相同

```sql
SELECT columnNames FROM table1 ...
UNION [ALL]
SELECT columnNames FROM table2 ...;
```

子查询

- 标量子查询: 子查询结果为 1 个标量
- 列子查询: 子查询结果为 1 列
- 行子查询: 子查询结果为 1 行
- 表子查询: 子查询结果为多行多列

```sql
# 标量子查询
SELECT *
FROM employee
WHERE departmentID = (
    SELECT departmentID FROM department WHERE departmentName = "Finace"
);
# 列子查询
SELECT *
FROM employee
WHERE salary > [ALL|SOME] (
    SELECT salary FROM employee WHERE departmentID = (
        SELECT departmentID FROM department WHERE departmentName = "Finace"
    )
);
# 行子查询
SELECT *
FROM employee
WHERE (salary, leaderID) = (
    SELECT salary, leaderID FROM employee WHERE employeeName = "Hu Tao"
);
# 表子查询
SELECT *
FROM employee
WHERE (job, salary) IN (
    SELECT job, salary FROM employee WHERE employeeName = "Ganyu" OR employeeName = "Keqing"
);
SELECT t.*, d.*
FROM (SELECT * FROM employee WHERE birthday >= '2002-02-28') AS t
         LEFT JOIN department AS d ON t.departmentID = d.departmentID;
```

### 1.8 事务

事务: 不可分割的操作集合

- 原子性 (Atomicity)
- 一致性 (Consistency)
- 隔离性 (Isolation)
- 持久性 (Durable)

```sql
SELECT @@autocommit;  # 查询事务提交方式
# 隐式事务
SET @@autocommit = 1; # 自动提交
SET @@autocommit = 0; # 手动提交
# 显式事务
START TRANSACTION;    # 开启事务
BEGIN;                # 开启事务
COMMIT;               # 提交事务
ROLLBACK;             # 回滚事务
```

并发事务问题

- 脏读: 一个事务读到另一个事务未提交的数据
- 不可重复读: 一个事务先后读同一条记录, 但两次读出的数据不同
- 幻读: 一个事务查询某条记录时, 该记录不存在; 插入记录时, 该记录又已存在

事务隔离级别

| 隔离级别               | 脏读 | 幻读 | 不可重复读 |
| ---------------------- | ---- | ---- | ---------- |
| Read Uncommitted       | √    | √    | √          |
| Read Committed         | X    | √    | √          |
| Repeatable Read (默认) | X    | X    | √          |
| Serializable           | X    | X    | X          |

## 第二章 索引

### 2.1 索引

索引是高效获取数据的数据结构

- 优点: 提高查询, 排序效率
- 缺点: 占用存储空间 (.myi 文件) , 降低增删改效率

索引结构

- B+ Tree
- Hash: 不支持范围查询, 查询效率高
- R Tree: 空间索引
- Full-text: 全文索引

| 分类     | 数量       | 关键字   |
| -------- | ---------- | -------- |
| 主键索引 | 1 个       | PRIMARY  |
| 唯一索引 | 可以有多个 | UNIQUE   |
| 普通索引 | 可以有多个 |          |
| 全文索引 | 可以有多个 | FULLTEXT |

- 单列索引: 1 个索引包含 1 列
- 联合索引: 1 个索引包含多列

根据索引的存储形式, 可分为

- 聚集索引: 索引与数据合并存储, B+树的叶子节点存储行数据
  聚集索引只有 1 个
  - 若存在主键, 则主键索引是聚集索引
  - 若不存在主键, 则第一个唯一索引是聚集索引
  - 若都不存在, 则 InnoDB 创建一个 rowid 作为隐藏的聚集索引
- 二级索引: 索引与数据分开存储, B+树的叶子节点存储主键
  二级索引可以有多个

回表查询: 先通过二级索引查询主键值; 再根据主键值, 通过聚集索引查询行数据

```sql
# 建立索引
CREATE [UNIQUE|FULLTEXT] INDEX indexName ON tableName (column1, column2, ...);
# 查询索引
SHOW INDEX FROM tableName[\G];
# 删除索引
DROP INDEX indexNames ON tableName;
```

### 2.2 SQL 性能分析

```sql
# 查询INSERT, UPDATE, DELETE, SELECT的频率
SHOW [SESSION|GLOBAL] STATUS LIKE 'Com_______';
# 慢查询日志
SHOW VARIABLES LIKE "slow_query_log";
# 是否支持profile操作
SELECT @@have_profiling;
# 是否开启profile操作
SELECT @@profiling;
# 开启profile操作
SET [SESSION|GLOBAL] profiling = 1;
# 查询每一条SQL的耗时
SHOW PROFILES;
# 查询指定queryID的SQL的耗时
SHOW PROFILE FOR QUERY queryID;
# 查询指定queryID的SQL的CPU占用
SHOW PROFILE CPU FOR QUERY queryID;
# 执行计划
USE mysql;
[EXPLAIN|DESC] SELECT * FROM user;
```

执行计划

- id: 查询的序列号
  id 相同, 执行顺序从上到下; id 不同, id 越大越先执行
- select_type: 查询的类型
  - SIMPLE: 简单查询, 即不包含连接查询, 子查询
  - PRIMARY: 主查询
  - UNION: UNION 后的查询
  - SUBQUERY: 子查询
- type: 连接类型
  性能从高到低: NULL, system, const, eq_ref, ref, range, index, all
- possible_key: 可能使用的索引
- key: 使用的索引 (NULL 表示未使用索引)
- key_len: 索引的最大可能长度
- rows: 可能查询的行数
- fitered: 返回行数占读取行数的百分比, fitered 的值越大越好

### 2.3 索引使用

索引失效

- 最左前缀匹配原则: 查询时从联合索引的最左列开始, 从左到右进行匹配. 不跳跃联合索引中的列, 若跳跃某一列, 则右侧的列索引失效
- 范围查询时, <, >右侧的列索引失效 (多使用 ≤, ≥)
- 对索引的列进行运算时, 索引失效
- 字符串不加引号时, 导致隐式类型转换, 索引失效
- 头部模糊匹配时, 索引失效; 尾部模糊匹配时, 索引不失效
- 若 OR 左侧条件中的列有索引, OR 右侧条件的列没有索引, 则索引失效
- 数据分布影响: 若 MySQL 评估使用索引比全表扫描慢, 则索引失效

SQL 提示

```sql
# USE INDEX (建议使用)
EXPLAIN SELECT * FROM tableName USE INDEX(indexName) conditions;
# IGNORE INDEX (忽略)
EXPLAIN SELECT * FROM tableName IGNORE INDEX(indexName) conditions;
# FORCE INDEX (强制使用)
EXPLAIN SELECT * FROM tableName FORCE INDEX(indexName) conditions;
```

覆盖索引: 查询时, 使用的索引包含所有返回的列 (减少 SELECT \*, 避免回表查询)

前缀索引: 用字符串的前缀 (前 n 个字符) 建立索引

```sql
CREATE INDEX indexName ON tableName(columnName(n));
```

索引的选择性: 不重复索引值的数量 (基数) 与表中记录数之比, 唯一索引的选择性为 1 (最大值) . 索引的选择性越大, 查询效率越高

### 2.4 索引设计原则

1. 对数据量较大, 查询较频繁的表建立索引
2. 对频繁作为条件查询, 排序查询, 分组查询的列建立索引
3. 选择区分度高的列作为索引, 多建立唯一索引
4. 对于字符串类型的列, 可建立前缀索引
5. 多建立联合索引, 减少单列索引. 查询时联合索引可以覆盖索引, 避免回表查询, 提高查询效率
6. 限制索引的数量
7. 多使用非空约束

### 2.5 SQL 优化

INSERT 优化

- 批量插入
- 手动提交事务
- 主键顺序插入
- 插入大量数据时, 使用 load 指令

主键优化

InnoDB 存储引擎中, 数据根据主键顺序存储, 使用该存储方式的表称为索引组织表 (Index Organized Table, IOT)

- 页分裂: 参考 B+树的插入
- 页合并: 参考 B+树的删除
- 主键设计原则
  - 减小主键长度
  - 使用自增主键, 主键顺序插入
  - 不使用 UUID 等作为主键

ORDER BY 优化
Using filesort: 通过索引或全表扫描, 读取满足条件的记录. 在排序缓冲区 (sort buffer) 中进行排序后, 返回排序结果
Using index: 通过有序索引, 顺序扫描, 直接返回排序结果, 效率高

- 根据待排序的列建立索引, 遵循最左前缀匹配原则
- 多覆盖索引 (查询时, 使用的索引包含所有返回的列)
- 不可避免 filesort, 大量数据待排序时, 可增大排序缓冲区大小 sort_buffer_size (默认 256K)

GROUP BY 优化

- 通过索引提高效率
- 遵循最左前缀匹配原则

LIMIT 优化

- 分页查询时, 通过"覆盖查询 + 子查询"进行优化

COUNT 优化

- count(主键): 主键不为空, 直接累加
- count(列名)
  - 有非空约束: 直接累加
  - 没有非空约束, 判空, 累加
- count(1): 直接累加
- count(\*): 直接累加

按效率排序: count(列名) < count(主键) < count(1) < count(\*), 多使用 count(\*)

UPDATE 优化 (避免行锁升级为表锁)

InnoDB 的行锁是对索引上锁, 不是对记录上锁. 索引失效时, 行锁升级为表锁
尽量通过主键, 索引 UPDATE 数据, 避免行锁升级为表锁
