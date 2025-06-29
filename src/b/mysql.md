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

- 索引
- 锁
- 存储引擎

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

1. 一对多: 部门表 -> 员工表; 通常为 "多" (员工表, 子表) 创建外键 (foreign key), 指向 "一" 的主键 (部门表, 父表)
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

mysql 的事务默认自动提交

### 事务的 4 大特性: ACID

- 原子性 Atomicity: 事务是不可分割的最小操作单元, 要么全部成功, 要么全部失败
- 一致性 Consistency: 事务完成时, 所有的数据必须保持一致
- 隔离性 Isolation: 数据库提供的隔离机制 (隔离级别), 保证事务在不受外部并发操作影响的环境下执行
- 持久性 Durability: 事务提交或回滚后, 对数据库中数据的改变是持久的

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

mysql 的默认事务隔离级别是 Repeatable Read 可重复读, 没有脏读、不可重复读, 只有幻读

| 隔离级别, √ 代表有, X 代表无 | 脏读 | 不可重复读 | 幻读 |
| ---------------------------- | ---- | ---------- | ---- |
| Read Uncommitted 读未提交    | √    | √          | √    |
| Read Committed 读已提交      | X    | √          | √    |
| Repeatable Read 可重复读     | X    | X          | √    |
| Serializable 串行化          | X    | X          | X    |

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

- 表空间 (.ibd 文件) 是分段 Segment 的
  - 索引段: B+ 树的叶子节点
  - 数据段: B+ 树的非叶节点
  - 回滚段
- 段 Segment 是分区 Extent 的
- 区 Extent 是分页 Page 的, 区的大小固定 1MB
- 页 Page 是分行 Row 的 (行式数据库), 页的大小固定 16KB, 1 个区有 64 页, 页是磁盘操作的最小单元

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

#### 聚集索引、二级索引

InnoDB 存储引擎中, 根据索引的存储形式, 也可以分为

- 聚集索引: 索引和数据合并存储, 叶子节点存储完整的行数据, 一张表的聚集索引有且只有 1 个
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

回表查询: 先通过二级索引查询主键值; 再根据主键值, 通过聚集索引查询行数据

#### 单列索引、联合索引

- 单列索引: 1 个索引关联 1 个字段
- 联合索引: 1 个索引关联多个字段

```sql
-- 建立索引
create [unique | fulltext] index <indexName> on <tableName> (<column>, <column2>, ...);

-- 查询索引
show index from <tableName> [\G];

-- 删除索引
drop index <indexName>, <indexName2>, ... on <tableName>;
```

### sql 性能分析

```sql
-- 查询 CRUD 的频率
-- Com_insert, Com_delete, Com_update, Com_select
show [session | global] status like 'Com_______';

-- 是否开启慢查询日志, 默认关闭
-- show variables like 'slow_query_log';

-- 是否开启 profiling, 默认开启
select @@have_profiling;

-- 在 session/global 级别开启 profiling
set [session | global] profiling = 1;

-- 查询每条 sql 的 queryID、耗时、查询语句
show profiles;

-- 查询指定 queryID 的 sql 各个阶段的耗时
show profile for query <queryID>;

-- 查询指定 queryID 的 sql 各个阶段的耗时和 cpu 占用
show profile cpu for query <queryID>;

-- 查看 select 语句的执行计划
[explain | desc] select * from <tableName>;

-- +----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
-- | id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra |
-- +----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
-- type: ALL 表示未使用索引
-- key: NULL 表示未使用索引
```

- id 查询的序列号; id 相同则执行顺序从上到下; id 不同则 id 越大越先执行
- select_type 查询的类型
  - simple 简单查询, 即不包含连接查询、子查询
  - primary 主查询
  - union 联合查询 union 后的查询
  - subquery 子查询
- type 连接类型, 性能从高到低 NULL, system, const, eq_ref, ref, range, index, ALL
- possible_key 可能使用的索引, 一个或多个
- key 实际使用的索引, NULL 表示未使用索引
- key_len 索引字段占用的字节数
- rows: 查询的行数
- filtered: 返回行数占读取行数的百分比, filtered 的值越大越好

```bash
# /etc/my.cnf 开启慢查询日志
show_query_log=1
# sql 查询时间超过 2s 时, 记录慢查询日志
long_query_time=2

# 慢日志
/var/lib/mysql/localhost-slow.log
```

### 覆盖索引

联合索引的列包含查询的全部列, 避免回表查询

```sql
-- idx_name_age
-- 二级索引的叶子节点存储 [name, age, id]
-- 聚集索引的叶子节点存储行数据
show index from users;

-- using where; using index: 查询时使用了索引, 并且无需回表查询
explain select name, age from users where name = 'whoami' and age = 22;
-- using index condition: 查询时使用了索引, 但是需要回表查询
explain select * from users where name = 'whoami' and age = 22;
```

```sql
create index idx_name on users (name);
select * from users where id = 2; -- 1 次查询
select id, name from users where name = 'Alice'; -- 1 次查询
select id, name, age from users where name = 'Alice'; -- 2 次查询, 需要回表查询 age
```

### 索引失效

#### 最左前缀匹配原则

查询时必须包含联合索引的最左列, 并且不能跳过联合索引中的某一列; 否则联合索引全部/部分失效

```sql
-- idx_name_age_gender
-- 二级索引的叶子节点存储 [name, age, gender, id]
-- 聚集索引的叶子节点存储行数据
show index from users;

-- 联合索引有效
select * from users where name = 'whoami' and age = 22 and gender = 1;
select * from users where name = 'whoami' and age = 22;
select * from users where name = 'whoami';

-- 未包含联合索引的最左列, 联合索引全部失效
select * from users where age = 22 and gender = 1;
select * from users where gender = 1;

-- 跳过联合索引中的 age 列, 联合索引的 gender 列部分失效 (多一次回表查询)
select * from users where name = 'whoami' and gender = 1;
```

#### 其他

- 对索引列使用「左」`like '%xxx'` 或「左右」`like '%xxx%'` 模糊匹配
- 对索引列使用函数
- 对索引列进行表达式计算
- 对索引列进行隐式类型转换 (mysql 比较字符串和数字时, 会自动将字符串转换为数字进行比较)
- where 子句中的 or: 在 where 子句中, 如果 or 前面的是索引列, or 后面的不是索引列, 则索引失效

```sql
-- name 字段是二级索引

-- 对索引列使用「左」或「左右」模糊匹配
select * from users where name like 'htc%'; -- 索引有效
select * from users where name like '%ccc'; -- 索引失效
select * from users where name like '%tc%'; -- 索引失效

-- 对索引列使用函数
select * from users where length(name) = 5; -- 索引失效
-- 解决方法: 创建 length(name) 虚拟列并建立索引
alter table users add key idx_name_length ((length(name)));

-- 对索引列进行表达式计算
select * from users where id = 7 - 1; -- 索引有效
select * from users where id + 1 = 7; -- 索引失效

-- 对索引列进行隐式类转换 (phone: varchar)
-- mysql 比较字符串和数字时, 会自动将字符串转换为数字进行比较
select "10" > 9; -- 1

select * from users where phone = 15395377789; -- 索引失效
-- 原理: 等价于
select * from users where cast(phone as signed int) = 15395377789; -- 索引失效

select * from users where id = "1" -- 索引有效
-- 原理: 等价于
select * from users where id = cast("1" as signed int) -- 索引有效
```

where 子句中的 or: 在 where 子句中, 如果 or 前面的是索引列, or 后面的不是索引列, 则索引失效

```sql
select * from users where id = 1 or age = 7; -- 索引失效
-- 解决方法: 为 age 列建立索引
create index idx_age on users (age);
```

#### sql 提示

- `use index(<indexName>)` mysql 使用索引
- `ignore index(<indexName>)` mysql 忽略索引
- `force index(<indexName>)` 强制 mysql 使用索引

```sql
-- mysql 使用索引
explain select * from <tableName> use index(<indexName>) <conditionExpr>;
-- mysql 忽略索引
explain select * from <tableName> ignore index(<indexName>) <conditionExpr>;
-- 强制 mysql 使用索引
explain select * from <tableName> force index(<indexName>) <conditionExpr>;
```

### 前缀索引

字符串很长时, 可以为长度为 n 的前缀建立索引

```sql
create index <indexName> on <tableName> (<columnName>(n));

-- 计算前缀的选择性 (越接近 1 越好)
select count(distinct substring(name, 1, 5)) / count(*) from users;
create index idx_name_5 on users (name(5));
```

## 锁

- 全局锁: 锁数据库
- 表级锁: 锁一张表, 分为:
  - 表锁
  - 元数据锁 (meta data lock, MDL)
  - 意向锁
  - auto-inc 锁
- 行级锁: 锁一行

### 全局锁

- 所有线程可以查询
- create、alter、drop、增删改等操作都会被阻塞

```sql
-- 对当前数据库 (的所有表) 加全局锁
flush tables with read lock;
-- 释放全局锁 (会话结束后, 自动释放全局锁)
unlock tables;
```

```bash
# 数据备份, 需要加全局锁
mysqldump -uroot -ppass db0 > ./db0.sql
# 数据备份, 开启事务, 无需加全局锁
mysqldump --single-transaction -uroot -ppass db0 > ./db0.sql
```

### 表级锁: 表锁、元数据锁、意向锁

#### 表锁

表锁分为:

- 表共享读锁 (read lock): 所有线程共享读本表, 但是不允许读写其他表
- 表独占写锁 (write lock)
  - 当前线程独占读写本表, 不允许读写其他表
  - 其他线程不允许读写所有表

```sql
-- 加表共享读锁
lock tables <tableName>, <tableName2>, ... read;
-- 加表独占写锁
lock tables <tableName>, <tableName2>, ... write;
-- 释放表锁 (会话结束后, 自动释放全局锁)
unlock tables
```

#### 元数据锁 (MDL)

元数据: 表结构, 无需显式的使用元数据锁

- 对一张表进行 crud 操作时, 加 MDL 读锁
- 对一张表进行修改表结构操作时, 加 MDL 写锁
- 有线程 crud 表时, 加 MDL 读锁; 如果有其他线程修改表结构 (申请 MDL 写锁), 则会被阻塞, 直到 crud 结束释放 MDL 读锁
- 有线程修改表结构时, 加 MDL 写锁; 如果有其他线程 curd 表 (申请 MDL 读锁), 则会被阻塞, 直到修改表结构结束释放 MDL 写锁

申请 MDL 锁的请求会形成一个 FIFO 请求队列

#### 意向锁

意向锁分为:

- 意向共享锁 (Intension Shared Lock, IS) `select ... lock in share mode` 时, 加意向共享锁
- 意向排他锁 (Intension Exclusive Lock, IX) `insert | delete | update | select ... for update` 时, 加意向排他锁

一个线程更新行时, 会对该行加行锁; 如果另一个线程同时对该表加表锁时, 需要逐行检查每行是否加了行锁

InnoDB 存储引起为了解决加行锁与加表锁的冲突, 引入意向锁, 无需逐行检查每行是否加了行锁

一个线程 a 更新行时, 会对该行加行锁, 同时对该表加意向锁; 如果另一个线程 b 同时对该表加表锁时, 如果意向锁和表锁兼容, 则直接加表锁; 如果意向锁和表锁不兼容, 则阻塞, 直到线程 a 更新行的事务结束, 释放行锁和意向锁

#### 意向共享锁和表锁的兼容性

- 意向共享锁 IS: `select ... lock in share mode` 时, 加行共享锁 (行级锁) 和意向共享锁 (表级锁), 意向共享锁与表共享读锁兼容, 与表独占写锁互斥, 即查询行时, 允许读表, 不允许写表
- 意向排他锁 IX: `insert | delete | update | select ... for update` 时, 加行排他锁 (行级锁) 和意向排他锁 (表级锁), 意向排他锁与表共享读锁、表独占写锁都互斥, 即增删改行时, 不允许读写表

**查看意向锁、行锁的加锁情况**

- 表级、意向共享锁 table IS
- 表级、意向排他锁 table IX
- 行级、共享行锁 record S,rec_not_gap
- 行级、排他行锁 record X,rec_not_gap
- 行级、共享间隙锁 record S,gap
- 行级、排他间隙锁 record X,gap
- 行级、共享临键锁 record S
- 行级、排他临键锁 record X

```sql
-- 查看意向锁、行锁的加锁情况
-- object_schema 数据库名
-- object_name 表名
-- index_name 索引名
-- lock_type 锁的级别: 表级锁 table, 行级锁 record
-- lock_mode 锁的类型
-- * 意向共享锁 table IS
-- * 意向排他锁 table IX
-- * 共享行锁 record S,rec_not_gap
-- * 排他行锁 record X,rec_not_gap
-- * 共享间隙锁 record S,gap
-- * 排他间隙锁 record X,gap
-- * 共享临键锁 record S
-- * 排他临键锁 record X
select object_schema, object_name, index_name, lock_type, lock_mode, lock_data from performance_schema.data_locks;
```

### 行级锁: 行锁、间隙锁、临键锁

行级锁: InnoDB 存储引擎支持, 锁的粒度最小、发生锁冲突的概率最低、并发度最高

事务隔离级别: mysql 的默认事务隔离级别是 Repeatable Read 可重复读

| 隔离级别, √ 代表有, X 代表无 | 脏读 | 不可重复读 | 幻读 |
| ---------------------------- | ---- | ---------- | ---- |
| Read Uncommitted 读未提交    | √    | √          | √    |
| Read Committed 读已提交      | X    | √          | √    |
| Repeatable Read 可重复读     | X    | X          | √    |
| Serializable 串行化          | X    | X          | X    |

行级锁分为:

1. 行锁 Record Lock: 锁定某条记录, 防止其他事务对该记录进行 delete 和 update; 在 Read Committed 读已提交和 Repeatable Read 可重复读的事务隔离级别下都支持
2. 间隙锁 Gap Lock: 锁定记录间的间隙, 防止其他事务对该间隙进行 insert, 导致幻读; 在 Repeatable Read 可重复读的事务隔离级别下支持
3. 临键锁 Next-Key Lock: 锁定某条记录, 和该记录前面的间隙; 在 Repeatable Read 可重复读的事务隔离级别下支持

#### 行锁

| sql                             | 行锁类型                                                    |
| ------------------------------- | ----------------------------------------------------------- |
| `insert, delete, update`        | 行排他锁 record X, 不允许其他线程读写该行                   |
| `select`                        | 不加行锁                                                    |
| `select ... lock in share mode` | 行共享锁 record S, 允许其他线程读该行, 不允许其他线程写该行 |
| `select ... for update`         | 行排他锁 record X                                           |

InnoDB 的行锁是基于索引加的锁

- 对于唯一约束的字段, mysql 自动建立唯一索引
- mysql 的默认事务隔离级别是 Repeatable Read 可重复读
- InnoDB 使用临键锁 Next-Key Lock 防止幻读
- 对于使用索引的精确匹配, 如果该记录存在, 则 mysql 为该行加「行锁」
- 对于使用索引的精确匹配, 如果该记录不存在, 则 mysql 为该间隙加「间隙锁」
- 对于使用索引的范围匹配, mysql 为匹配的所有行和间隙加「行锁」、「间隙锁」,可以合并为「临键锁」
- 如果未使用索引, 则 mysql 会为扫描到的**每一行**加「行锁」

## InnoDB 存储引擎

### 事务原理

事务的 4 大特性: 原子性 Atomicity, 一致性 Consistency, 隔离性 Isolation, 持久性 Durability

- 原子性、一致性、持久性: 由 redo log 重做日志, undo log 回滚日志实现
- 隔离性: 由锁和 MVCC 实现

### MVCC, Multi-Version Concurrency Control

MVCC, Multi-Version Concurrency Control 多版本并发控制, 维护一个数据的多个历史版本 (快照), 提供非阻塞读, 保证并发读写时没有冲突

MVCC 的实现依赖于 3 个隐式字段、undo log 回滚日志、readView 快照视图

#### 基本概念: 当前读和快照读

- 当前读: 读取数据时, 读取的是最新版本的数据,「当前读」时会加锁, 阻塞

`insert, delete, update` (加行排他锁)、`select ... lock in share mode` (加行共享锁)、`select ... for update` (加行排他锁) 都是当前读

```sql
begin; -- transaction A
select name from users where id = 2; -- transaction A; Sakura
begin; -- transaction B
update users set name = 'Momoko' where id = 2; -- transaction B
select name from users where id = 2; -- transaction A; Sakura
commit; -- transaction B
select name from users where id = 2; -- transaction A; Sakura
-- 原理: mysql 的默认事务隔离级别是 Repeatable Read 可重复读

-- 当前读
select name from users where id = 2 lock in share mode; -- transaction A; Momoko
select name from users where id = 2 for update; -- transaction A; Momoko
```

快照读: 简单的 select, 读取的是符合事务隔离级别要求的历史版本 (快照),「快照读」时不会加锁, 非阻塞

- 对于 Read Committed 读已提交的事务隔离级别, 每次读取时都会生成新的快照
- 对于 Repeatable Read 可重复读的事务隔离级别, 开启事务后, 只有第一次读取时会生成快照, 保证可重复读
- 对于 Serializable 串行化的事务隔离级别, 快照读退化为当前读
