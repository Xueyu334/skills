# 缩写规则、禁用清单、跨库保留字与超长压缩法则

---

## 1. 缩写使用规则与推荐白名单

优先使用下方推荐白名单，同时**允许项目已有稳定缩写与行业标准缩写**；拒绝无项目约定、高歧义的自造缩写，无把握时优先全拼。

### 1.1 通用技术与架构缩写

| 缩写 | 全称 | 适用位置 |
| :--- | :--- | :--- |
| `id` / `uuid` | Identifier / Universally Unique Identifier | 全栈通用 |
| `url` / `uri` / `api` / `ip` | 网络与接口标准词 | 全栈通用 |
| `dto` / `vo` / `bo` / `po` / `do` | 分层传输/视图/领域/持久化对象 | 后端类名后缀 |
| `req` / `resp` / `cmd` | Request / Response / Command | 入出参类名后缀 |
| `sql` / `json` / `xml` / `html` / `pdf` | 标准格式/协议 | 全栈通用 |
| `sync` / `async` | Synchronous / Asynchronous | 方法/任务/配置 |
| `env` / `config` / `param` / `params` | Environment / Configuration / Parameter | 配置/参数类 |
| `auth` / `sso` / `acl` / `rbac` | 认证与授权 | 模块/包/类前缀 |
| `min` / `max` / `avg` / `sum` | 聚合与边界 | 字段/变量前缀或后缀 |

### 1.2 通用业务缩写

| 缩写 | 全称 | 说明 |
| :--- | :--- | :--- |
| `no` | Number（单号/编号） | 仅用于编号（`order_no`），禁用于数量 |
| `seq` | Sequence | 顺序号（`sort_seq`） |
| `org` / `dept` | Organization / Department | 允许用于表/字段/类（如 `org_id`, `dept_code`） |
| `qty` | Quantity | ERP/库存/订单数量推荐缩写（`order_qty`） |
| `ext` | Extension | 扩展字段（`ext_json`, `ext_props`） |
| `pic` / `img` | Picture / Image | 前端资源变量可用；DB 字段推荐 `image_url` / `avatar_url` |
| `spec` | Specification | 物料/商品规格可用（`material_spec`），或全拼 `specification` |
| `uom` | Unit of Measure | ERP 计量单位标准缩写（`base_uom`, `sales_uom`） |

### 1.3 ERP / 财务 / 制造标准缩写（领域白名单）

`erp`, `mes`, `wms`, `srm`, `crm`, `oa`, `hr`, `bom`, `mrp`, `mps`, `wip`, `sku`, `spu`, `po`（采购订单）, `so`（销售订单）, `pr`（请购单）, `mo`（生产订单）, `ppbom`（生产用料清单）, `gl`（总账）, `ap`（应付）, `ar`（应收）, `fa`（固定资产）, `vat`（增值税）, `iqc`, `ipqc`, `fqc`, `oqc`, `qc`。

> 注意：在对外 REST API、前端类型或跨团队字段中，模块前缀可用缩写（如 `bom_item`、`ap_invoice`），但核心实体本身建议尽量可读（如 `purchase_order` 优于裸写 `po` 表名）。

---

## 2. 禁用 / 高歧义缩写黑名单

| 禁用缩写 | 风险/歧义 | 替换为 |
| :--- | :--- | :--- |
| `usr` | 没必要省 1 个字母 | `user` |
| `pwd` | 偏口语或简写，敏感字段需清晰 | `password` / `password_hash` |
| `mgr` | Manager / Migration 歧义 | `manager` |
| `dtl` | Detail 省写生硬 | `detail` / `item` |
| `sts` | Status 省写 | `status` |
| `amt` | Amount 省写（Oracle 超长不得已压缩除外） | `amount` |
| `flg` | Flag 省写 | `is_*`（DB） / 明确布尔名 |
| `cnt` | Count 省写（仅允许 SQL 临时别名） | `count` |
| `msg` | Message 省写（局部变量外禁止用于 DB/公共 API） | `message` |
| `num` | 慎用（易混淆编号与数量；不全局禁止 `*_num` 如 `page_num`） | 离散个数用 `count`，业务数量用 `qty`/`quantity`，编号用 `no`/`number` |
| `str` / `obj` / `val` / `tmp` | 无业务语义占位符 | 表达真实业务含义的名称 |
| `info` / `data`（作无意义后缀） | 信息量为零（如 `user_info_data`） | 直接用 `user` / `user_profile` / `order_detail` |

---

## 3. 保留字冲突与跨库可移植性分级

审查或设计表/列时，先区分**“目标库保留字冲突”**与**“跨库可移植性建议”**：

- **目标库保留字冲突（高严重度 / 兼容性问题）**：仅当标识符在**当前项目实际目标数据库**中属于保留字（裸用会报语法错误或必须加引号转义）时，才判为兼容性问题。
- **跨库可移植性建议（低/中严重度 / 仅建议）**：若在当前单库目标引擎中合法（如 PostgreSQL 官方将 `comment`、`status`、`type`、`size`、`mode` 列为 `non-reserved`），审查既有单库表时不得报为高严重度故障，仅在多库兼容规划或新建表时给出可移植性建议，避免引发不必要的迁移。

| 关键词 | 常见真正冲突库（需规避） | 单库合法 / 可移植性提示 | 安全替代命名 |
| :--- | :--- | :--- | :--- |
| `order` | 全库 SQL 保留字 | — | `sales_order` / `purchase_order` / `work_order` / `sort_order` |
| `user` | PG / Oracle / 达梦 | MySQL 非保留字 | `sys_user` / `user_account` / `operator_id` |
| `group` | 全库 SQL 保留字 | — | `user_group` / `material_group` / `biz_group` |
| `status` | — | Oracle/达梦/PG（PG 为 `non-reserved`），多库建议加业务前缀 | `order_status` / `doc_status` / `audit_status` |
| `type` | — | Oracle/达梦/PG（PG 为 `non-reserved`），多库建议加业务前缀 | `order_type` / `biz_type` / `bill_type` |
| `level` | Oracle (`CONNECT BY LEVEL`) / 达梦 | PG 为 `non-reserved` | `risk_level` / `tree_level` / `node_level` |
| `desc` | 全库 `ORDER BY DESC` | — | `description` / `remark`（**严禁用 `desc` 作“描述”列名**） |
| `comment` | Oracle / 达梦 | **PostgreSQL 官方为 `non-reserved`**，单库 PG 仅作跨库可移植性建议 | `remark` / `approval_comment` / `review_note` |
| `key` / `value` | MySQL (`key`) | PG 中 `key`/`value` 为 `non-reserved`，多库建议加前缀 | `config_key` / `dict_value` / `item_key` |
| `date` / `time` | Oracle (`date`) | PG 中 `date`/`time` 为 `non-reserved`（但作类型名易混淆） | `biz_date` / `order_date` / `occur_time` |
| `number` | Oracle 数据类型关键字 | — | `order_no` / `serial_no` / `line_no` |
| `size` / `mode` | Oracle (`size`/`mode`) | **PostgreSQL 官方为 `non-reserved`**，单库 PG 仅作可移植性建议 | `file_size_bytes` / `page_size` / `run_mode` |
| `start` | Oracle (`start`) | PG 中 `start` 为 `non-reserved` | `start_time` / `effective_date` |
| `end` | 全库 SQL 保留字 (`end`) | — | `end_time` / `expire_date` |
| `rank` | MySQL 8+ (`rank`) | **PostgreSQL 未将 `RANK` 列为关键字**，单库使用时无需报告保留字冲突，多库兼容时仅作可移植性建议 | `sort_rank` / `priority_rank` |
| `index` | MySQL / Oracle / 达梦 | **PostgreSQL 官方为 `non-reserved`**，单库 PG 仅作跨库可移植性建议 | `row_index` / `sort_index` / `seq_no` |
| `resource` / `connect` | Oracle / 达梦 | PG 为 `non-reserved` | `sys_resource` / `connection_config` |
| `default` / `check` | 全库 SQL 保留字 (`default`/`check`) | — | `is_default`（或 `default_flag`） / `check_result` |
| `option` | MySQL (`option`) | PG 中 `option` 为 `non-reserved`，多库建议加前缀 | `config_option` / `option_value` |

---

## 4. 超长复合词 4 步压缩法则

针对中文长业务词（如“变电站日常巡检工单审批明细记录表”、“采购订单行累计已入库未开票数量”），先结合**目标数据库版本、实例参数及字节/字符上限**判断是否需要压缩（Oracle 普通表名/列名 30 vs 128 字节取决于 **`COMPATIBLE` 参数**是否 `>= 12.2`；PostgreSQL 63 字节；MySQL 64 字符；达梦默认 128 字节，是否受兼容模式 30 字节限制**待核实**），再按以下顺序精简，禁止直接截断单词或自造无约定缩写：

1. **去虚词与废词**：删除 `of`、`the`、`for`、`info`、`data`、`record`、`table`、`list` 等无信息量词。
2. **去父域上下文冗余**：已经在 `inspection_order` 表或 `SalesOrder` 类中，子字段不再重复表名/类名（用 `order_no` 或 `approval_status`，不要写 `inspection_order_approval_status_code`）。
3. **分层承载语义**：用包名/模块/表名承载大域，类名/字段名保持精简核心语义：
   - 差：`SubstationInspectionWorkOrderApprovalRecordDetailItem`
   - 好：包 `inspection.approval` -> 类 `InspectionApprovalItem` / 表 `mfg_inspect_approval_item`（25 字符，即使在 `COMPATIBLE < 12.2` 的 30 字节 Oracle 下也安全）。
4. **触及目标库字节/字符上限时的压缩顺序**：
   - 先用推荐白名单、项目已有稳定缩写或行业标准缩写（如 `quantity` -> `qty`、`organization` -> `org`、`department` -> `dept`、`specification` -> `spec`、`manufacturing` -> `mfg`、`inventory` -> `inv`）。
   - 若仍超长，合并同义限定词，保留业务区分度最高的 2~3 个词根（如 `po_line_unbilled_in_qty` 23 字符，替代 `purchase_order_entry_accumulated_received_unbilled_quantity`）。
