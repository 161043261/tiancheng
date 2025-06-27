# MySQL

## 说明

- `<databaseName>` 表示必填的「数据库名」
- `[-D <databaseName>]` 表示「指定数据库名」是可选的
- `{read uncommitted | read committed | repeatable read | serializable}` 表示四种事务隔离级别中的一种

```bash
alter user 'root'@'localhost' identified with mysql_native_password BY 'pass';
flush privileges;
sudo systemctl restart mysql;

# -p 后面没有空格
mysql -u <username> -p<password> [-D <databaseName>];
```

### 高级

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
create database [if not exists] <databaseName> [default charset <charsetName>] [collate <collateName>];
-- e.g.
create database if not exists db0 default charset utf8mb3 collate utf8mb3_general_ci;

-- 使用数据库
use <databaseName>;

-- 查询当前数据库
select database();

-- 删除数据库
drop database [if exists] <databaseName>;
drop database [if exists] <databaseName1>, <databaseName2>, ...;

-- 查询当前数据库的所有表
show tables;
show tables from <databaseName>;

-- 创建表
create table [if not exists] <tableName> (
  <primaryKey>  int unsigned auto_increment primary key,  -- 无符号整型自增主键
  <columnName2> varchar(160) not null unique,             -- 非空唯一变长字符串
  <columnName3> boolean default true,                     -- 默认 true
  <columnName4> int check (columnName4 between 0 and 100) -- 检查约束
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
insert into <tableName> (<columnName1>, <columnName2>, ...)
values (<row1value1>, <row2value2>, ...), (<row2value1>, <row2value2>, ...), ...;
-- All columns
insert into <tableName>
values (<row1value1>, <row2value2>, ...), (<row2value1>, <row2value2>, ...), ...;

-- 更新
update <tableName> set <columnName1> = <value1>, <columnName2> = <value2>, ... [where <conditionExpr>];

-- 删除
delete from <tableName> [where <conditionExpr>];
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
select [distinct] <columnName1> [as <alias1>], <columnName2> [as <alias2>], ... -- distinct 去重

from <tableName>

where <conditionExpr>                                            -- where 分组前过滤

group by <columnName1>, <columnName2>, ...                       -- group by 分组字段列表

having <conditionExpr>                                           -- having 分组后过滤

order by <columnName1> [asc]|desc, <columnName2> [asc]|desc, ... -- order by 排序查询

limit <startIndex>, <pageSize>;                                  -- limit 分页查询
limit <pageSize> offset <startIndex>;                            -- limit 分页查询
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
grant <privilegeName1>, <privilegeName2>, ... on <databaseName>.<tableName> to '<username>'@'hostname';

-- 撤销权限
revoke <privilegeName1>, <privilegeName2>, ... on <databaseName>.<tableName> from '<username>'@'<hostname>';
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

## 约束

| 约束     | 关键字      |
| -------- | ----------- |
| 非空约束 | not null    |
| 唯一约束 | unique      |
| 主键约束 | primary key |
| 默认约束 | default     |
| 检查约束 | check       |
| 外键约束 | foreign key |

```sql
create table <tableName> (
  <primaryKey>  int unsigned auto_increment primary key,    -- 主键约束: 无符号整型自增主键
  <columnName2> varchar(16) not null unique,                -- 非空约束、唯一约束: 非空唯一变长字符串
  <columnName3> boolean default true,                       -- 默认约束: 默认 true
  <columnName4> int check (<columnName4> between 0 and 100) -- 检查约束
);
```

### 外键约束

外键: 关联两表的数据, 保证数据的一致性, 完整性

```sql
-- 创建子表时, 添加从子表某列指向父表某列的外键
create table <tableName> (
  [constraint] [<foreignKeyName>] foreign key (<columnName>) references <foreignTableName> (<foreignColumnName>);
)

-- 修改子表时, 添加从子表某列指向父表某列的外键
alter table <tableName> add constraint <foreignKeyName> foreign key (<columnName>) references <foreignTableName> <foreignColumnName>;
-- e.g. 添加从 t_emp 员工表 (子表) dep_id 字段指向 t_dep 部门表 (父表) id 字段的外键
alter table t_emp add constraint fk_emp_dep_id foreign key (dep_id) references t_dep id;

-- 删除外键
alter table <tableName> drop foreign key <foreignKeyName>;
```

场景: 从 t_emp 员工表 (子表) dep_id 字段指向 t_dep 部门表 (父表) id 字段的外键

### no action/restrict

t_dep 部门表 (父表) 中删除某行, 或更新某行的 id 时; 如果 t_emp 员工表 (子表) 中存在 dep_id == 该 id 的记录, 则不允许删除/更新

### cascade

t_dep 部门表 (父表) 中删除某行, 或更新某行的 id 时; 时, 如果 t_emp 员工表 (子表) 中存在 dep_id == 该 id 的记录, 则同时删除/更新子表中的记录

### set null

t_dep 部门表 (父表) 中删除某行, 或更新某行的 id 时; 如果 t_emp 员工表 (子表) 中存在 dep_id == 该 id 的记录, 则将子表中, 记录的 dep_id 字段值设置为 null

### set default

t_dep 部门表 (父表) 中删除某行, 或更新某行的 id 时; 如果 t_emp 员工表 (子表) 中存在 dep_id == 该 id 的记录, 则将子表中, 记录的 dep_id 字段值设置为默认值 (InnoDB 不支持)

## 多表查询

1. 一对多: 部门表 -> 员工表; 通常为 "多" (员工表, 子表) 建立外键 (foreign key), 指向 "一" 的主键 (部门表, 父表)
2. 多对多: 学生表 -> 课程表; 通常创建中间表, 中间表有 2 个外键, 分别指向两个表的主键, 即转换为「学生表 -> 中间表」,「课程表 -> 中间表」两个一对多问题
3. 一对一: 常用于单表拆分, 基本字段放在一张表中, 详情字段放在另一张表中; 通常详情表的外键 (user_id), 指向基础表的主键 (id), 并且外键所在的列使用唯一约束

### 多表查询分类

- 连接查询
  - 内连接: 查询 left 表、right 表交集的数据
  - 外连接
    - 左外连接: 查询 left 表、和 left 表、right 表交集的数据
    - 右外连接: 查询 right 表、和 left 表、right 表交集的数据
  - 自连接: left 表 == right 表 == 自身, 自连接必须使用表别名
- 联合查询
- 子查询

## 连接查询

```sql
-------------
-- 隐式内连接
-------------
select <columnName1>, <columnName2>, ... from <tableName1>, <tableName2> where <conditionExpr>;
-- e.g. 查询每个员工的姓名, 和关联的部门名
select t_emp.name, t_dep.name from t_emp, t_dep where t_emp.dep_id = t_dep.id;

-------------
-- 显式内连接
-------------
select <columnName1>, <columnName2>, ... from <tableName1> [inner] join <tableName2> on <conditionExpr>;
select e.name, d.name from t_emp as e inner join t_dep as d on e.dep_id = d.id; -- as 可省略

-------------
-- 左外连接
-------------
select <columnName1>, <columnName2>, ... from <tableName1> left [outer] join <tableName2> on <conditionExpr>;
-- e.g. 查询 t_emp 表的所有数据, 和关联的部门数据 (即使某些员工没有部门, 查询结果中也会保留这些员工)
select e.*, d.* from t_emp as e left outer join t_dep as d on e.dep_id = d.id;
-- 等价于
select e.*, d.* from t_dep as d right outer join t_emp as e on e.dep_id = d.id;

-------------
-- 右外连接
-------------
select <columnName1>, <columnName2>, ... from <tableName1> right [outer] join <tableName2> on <conditionExpr>;
-- e.g. 查询 t_dep 表的所有数据, 和关联的员工数据 (即使某些部门没有员工, 查询结果中也会保留这些部门)
select d.*, e.* from t_emp as e right outer join t_dep as d on e.dep_id = d.id;
-- 等价于
select d.*, e.* from t_dep as d left outer join t_emp as e on d.id = e.dep_id;

-------------
-- 自连接
-------------
select <columnName1>, <columnName2>, ... from <tableName> <alias1> join <tableName> <alias2> on <conditionExpr>;
-- e.g. 自连接 + 内连接: 在 t_emp 表中, 查询每个员工的姓名, 和关联的领导的姓名
select e.name, l.name from t_emp as e, t_emp as l where e.leader_id = l.id

-- e.g. 在 t_emp 表中, 查询每个员工的姓名, 和关联的领导的姓名 (即使某些员工没有领导, 查询结果中也会保留这些员工)

-- e.g. 自连接 + 左外连接
select e.name as 'employeeName', l.name as 'leaderName' from t_emp as e left outer join t_emp as l where e.leader_id = l.id;
-- e.g. 自连接 + 右外连接
select e.name 'employeeName', l.name 'leaderName' from t_emp l right join t_emp e where e.leader_id = l.id;
```

## 联合查询

联合多个查询结果, 合并为新的结果集; 联合查询的列数, 列的类型必须相同

```sql
select <columnName1>, <columnName2>, ... from <tableName1> ...
union [all]
select <columnName1>, <columnName2>, ... from <tableName2> ...;

-- e.g.
select * from t_emp where salary < 5000
union [all]
select * from t_emp where age > 50;

-- 使用 union 时, 和 or 条件查询等价, 会去重
-- 使用 union all 时, 和 or 条件查询不等价, 不会去重
select * from t_emp where salary < 5000 or age > 50;
-- 当某个员工月薪 < 5000, 年龄也 > 50 时, 则该员工在联合查询的结果集中会出现两次
```

## 子查询

根据子查询的结果, 可以分为

- 标量子查询: 子查询的结果为 1 个值
- 列子查询: 子查询的结果为 1 列
- 行子查询: 子查询的结果为 1 行
- 表子查询: 子查询的结果为多行多列 (一张表)

根据子查询的位置, 可以分为

- where 后的子查询
- from 后的子查询
- select 后的子查询

```sql
-- 标量子查询: 子查询的结果为 1 个值
select * from t_emp
where dep_id = (
  select id from t_dep where dep_name = "Web Infra"
)

-- 列子查询: 子查询的结果为 1 列
select * from t_emp
where salary > [all | some] (
  select salary from t_emp where dep_id = (
    select id from t_dep where dep_name = "Web Infra"
  )
)

-- 行子查询: 子查询的结果为 1 行
select * from t_emp
where (salary, leader_id) = (
  select salary, leader_id from t_emp where name = "whoami"
)

-- 表子查询: 子查询的结果为多行多列 (一张表)
select * from t_emp
where (job, salary) in (
  select job, salary from t_emp where name = "Yukino" or name = "Shita"
)

select e.*, d.* from (
  select * from t_emp where birthday >= "2002-02-28" as e left outer join t_dep as d on e.dep_id = d.id
)
```

> [!important] 高级篇
>
> - 事务
> - 存储引擎
> - 索引
> - SQL 优化
> - 视图
> - 存储过程
> - 触发器
> - 锁
> - 日志
> - 主从复制
> - 分库分表
> - 读写分离

## 事务

MySQL 的事务默认自动提交

### 事务的 4 大特性: ACID

- 原子性 Atomicity: 事务是不可分割的最小操作单元, 要么全部成功, 要么全部失败
- 一致性 Consistency: 事务完成时, 所有的数据必须保持一致
- 隔离性 Isolation: 数据库提供的隔离机制 (隔离级别), 保证事务在不受外部并发操作影响的环境下执行
- 持久性 Durable: 事务提交或回滚后, 对数据库中数据的改变是持久的

```sql
-- 查询事务提交方式
select @@autocommit;
-- 设置自动提交
set @@autocommit = 1;
-- 设置手动提交
set @@autocommit = 0;

-- 开启事务
start transaction;
-- 等价于
begin;

-- 提交事务
commit;

-- 回滚事务
rollback;
```

### 并发事务问题: 脏读、幻读、不可重复读

并发事务问题: 两个或多个事务同时操作同一个数据库, 或同一张表时, 可能发生的问题

- 脏读: 一个事务读到另一个事务未提交的数据
- 不可重复读: 一个事务先后读同一条记录, 但两次读出的数据不同
- 幻读: 一个事务查询某条记录时, 发现该记录不存在; 插入记录时, 却发现该记录已存在

### 事务隔离级别

MySQL 的默认事务隔离级别是 repeatable read 可重复读

| 隔离级别                  | 脏读 | 不可重复读 | 幻读 |
| ------------------------- | ---- | ---------- | ---- |
| read-uncommitted 读未提交 | √    | √          | √    |
| read-committed 读已提交   | X    | √          | √    |
| repeatable-read 可重复读  | X    | X          | √    |
| serializable 串行化       | X    | X          | X    |

```sql
-- 查询事务隔离级别
select @@transaction_isolation;

-- 设置事务隔离级别
set [session | global] transaction isolation level {read uncommitted | read committed | repeatable read | serializable};
```

## InnoDB 存储引擎

- 增、删、改操作满足事务的 4 大特性 ACID (Atomicity 原子性、Consistency 一致性、Isolation 隔离性、Durable 持久性)
- 支持事务
- 支持外键约束, 保证数据的一致性, 完整性
- 支持行级锁, 提高并发性能

InnoDB 存储引擎的每个数据库对应一个目录, 每张表对应一个 .ibd 表空间文件, 存储索引和数据

- 表空间 TableSpace 是分段 Segment 的
- 段 Segment 是分区 Extent 的
- 区 Extent 是分页 Page 的 (索引页、数据页), 区的大小固定 1MB
- 页 Page 是分行 Row 的 (行式数据库), 页的大小固定 16KB, 每个区有 64 页, 页是磁盘操作的最小单元

## 索引

- 优点: 提高查询、排序效率
- 缺点: 降低增、删、改效率

### 索引结构

- B+ 树
- Hash 哈希索引
  - 不支持范围查询、不能利用哈希索引进行排序操作
  - 精确查询的效率很高
  - 通过挂链表的方式解决哈希冲突
- R 树, 空间索引
- fulltext 全文索引: 类似 ElasticSearch, 用于查找文本中的关键词

InnoDB 存储引擎支持 B+ 树索引和 fulltext 全文索引

- B 树非叶节点和叶子节点都存储数据
- 经典 B+ 树非叶节点存储索引, 叶子节点存储数据, 叶子节点形成单向链表
- InnoDB 的 B+ 树, 叶子节点形成双向循环链表
- B+ 树对比 B 树、二叉树, 页的大小固定时, 层级更浅, 搜索效率高

### 索引分类

| 分类     | 数量               | 关键字   |
| -------- | ------------------ | -------- |
| 主键索引 | 一张表中只有一个   | primary  |
| 唯一索引 | 一张表中可以有多个 | unique   |
| 普通索引 | 一张表中可以有多个 |          |
| 全文索引 | 一张表中可以有多个 | fulltext |

InnoDB 存储引擎中, 根据索引的存储形式, 也可以分为

- 聚集索引: 索引和数据合并存储, 叶子节点存储完整的一行数据, 一张表的聚集索引有且只有 1 个
  1. 如果表有主键, 则主键索引是聚集索引
  2. 如果表没有主键, 则选择第一个唯一索引作为聚集索引
  3. 如果表既没有主键索引, 又没有唯一索引, 则 InnoDB 会生成一个隐式的 rowid 列作为聚集索引
- 二级索引: 二级索引是除了聚集索引的其他索引, 叶子节点存储聚集索引列的值和二级索引列的值, 一张表的二级索引可以有多个

```sql
-- id 是主键, 也是聚集索引
-- 聚集索引树的叶子节点存储 [id, name, age]
create table users (
  id int primary key,
  name varchar(50),
  age int
)

-- 为 name 字段建立索引 (二级索引)
-- 二级索引树的叶子节点存储 [name, id]
create index idx_name on users (name);
insert into users values (1, 'Alice', 22), (2, 'Bob', 23);

-- 先在二级索引树中找到 name = 'Bob' 的叶子节点, 叶子节点存储 [name: 'Bob', id: 2]
-- 再在聚集索引树中找到 id = 2 的叶子节点, 叶子节点存储 [id: 2, name: 'Bob', age: 23]
select * from users where name = 'Bob'
```

=================================================

- 单列索引: 1 个索引包含 1 列
- 联合索引: 1 个索引包含多列

根据索引的存储形式, 可分为

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
