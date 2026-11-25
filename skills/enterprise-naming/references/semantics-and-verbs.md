# 后缀语义矩阵、动词辨析与中式英语修正

本文件用于在确定英文词根前，区分易混后缀与业务动词，防止中式直译和语义漂移。

---

## 1. 后缀语义矩阵

| 后缀 | 准确语义 | 适用场景示例 | 易错/禁止混用 |
| :--- | :--- | :--- | :--- |
| `_id` | 代理主键或外键关联 ID | `user_id`, `org_id`, `material_id` | 不要用 `_id` 存放用户可编辑的业务编码 |
| `_code` | 业务编码、字典码、唯一标识码 | `material_code`, `dept_code`, `currency_code` | 不要把流水单号叫 `_code` |
| `_no` | 流水号、单据号、票据号、行号 | `order_no`, `voucher_no`, `line_no`, `batch_no` | 不全局禁止 `*_num`（如 `page_num`），但表示数量时优先用 `_count`/`_qty`，避免与编号混淆 |
| `_seq` | 顺序号、排序权重、流水序号 | `sort_seq`, `step_seq`, `process_seq` | 区分物理排序 `seq` 与业务单号 `no` |
| `_count` | 离散个数、条数、次数 | `retry_count`, `attachment_count`, `item_count` | 优先用 `_count` 区分数量与编号（不全局禁止 `*_num`，如分页 `page_num` 等既有惯例） |
| `_qty` | 业务数量（物料/库存/订单数量，常带小数） | `order_qty`, `stock_qty`, `received_qty` | ERP/供应链数量统一用 `qty`（全称 `quantity`） |
| `_amount` | 金额（货币价值） | `total_amount`, `tax_amount`, `paid_amount` | 优先全拼 `amount`，不用 `amt`；分作单位时加 `_cents` / `_fen` |
| `_price` | 单价 | `unit_price`, `tax_inclusive_price` | 区分含税单价与不含税单价（`net_price` / `price_excl_tax`） |
| `_rate` / `_ratio` | 费率、税率、汇率 / 比例、占比 | `tax_rate`, `exchange_rate`, `discount_rate`, `pass_ratio` | 百分比或小数在注释中说明精度（如 `0.13` vs `13%`） |
| `_ms` / `_sec` / `_bytes` | 工程度量显式单位 | `timeout_ms`, `retention_days`, `file_size_bytes`, `voltage_kv` | 禁止无单位命名 `timeout` / `file_size` 引发秒/毫秒混淆 |
| `_status` | 有生命周期流转的状态 | `order_status`, `approval_status`, `payment_status` | 不要与静态分类 `_type` 混用 |
| `_type` / `_category` | 静态分类、业务类型 | `order_type`, `material_category`, `account_type` | `type` 偏类型枚举，`category` 偏树形/层级分类 |
| `_level` | 级别、严重度、优先级 | `risk_level`, `priority_level`, `alarm_level` | 避免与 SQL 保留字 `level` 裸用冲突 |
| `_time` / `_at` / `_date` | 精确到时分秒的时刻 / 纯日期 | `approval_completed_at`, `submit_time`, `delivery_date`, `birth_date` | **按业务时间精度判断**而非仅看物理类型：纯日期用 `_date`，精确时刻用 `_time`/`_at`；**Oracle `DATE` 可存时分秒**，如“审批完成时间”即使存为 Oracle `DATE` 仍用 `approval_completed_at` |

---

## 2. 高频中英文业务动词辨析

### 2.1 查询类（Service / Mapper / Repository）

| 动词 | 语义与约定 | 示例 |
| :--- | :--- | :--- |
| `get*` | 按主键/唯一键查询**确定存在或预期单条**记录 | `getById`, `getByOrderNo` |
| `find*` | 查询可能为空（常返回 `Optional<T>` / `null`） | `findActiveConfig`, `findByCode` |
| `list*` | 查询不分页列表 | `listOrderItems`, `listByOrgId` |
| `page*` | 分页查询 | `pageOrders` |
| `count*` / `exists*` | 计数 / 存在性判断 | `countPendingTasks`, `existsByCode` |
| `query*` / `search*` | 复杂条件筛选 / 全文或关键字检索 | `queryInventorySummary`, `searchMaterials` |

### 2.2 校验、审核与稽核

| 中文场景 | 推荐英文动词 | 准确区分 |
| :--- | :--- | :--- |
| 格式/规则/入参校验 | `validate` / `check` | `validateOrderPayload`（抛异常或返回校验结果）；`checkStock`（前置检查） |
| 核实真伪/验证码/签名 | `verify` | `verifySignature`, `verifyCaptcha` |
| 人工复核/审阅 | `review` | `reviewExpenseClaim`（侧重审阅过程，不等于终审通过） |
| 审批通过 / 驳回 | `approve` / `reject` | `approveOrder`, `rejectOrder`（明确的审批决策结果） |
| 财务/系统审计稽核 | `audit` | `auditVoucher`, `auditLog`（偏合规审计，**一般审批不要全叫 `audit`**） |
| 业务确认 | `confirm` | `confirmReceipt`, `confirmDelivery` |

### 2.3 启停、流转与终止

| 中文场景 | 推荐英文动词 | 准确区分 |
| :--- | :--- | :--- |
| 启用 / 禁用（基础资料/账号） | `enable` / `disable` | 常规开关启用与停用；金蝶语境下：**禁用 → `forbid`，取消禁用（启用）→ `unforbid`** |
| 激活 / 停用（租户/设备/凭证） | `activate` / `deactivate` | 生命周期激活态切换 |
| 锁定 / 解锁；冻结 / 解冻 | `lock` / `unlock`; `freeze` / `unfreeze` | 库存锁库用 `lockStock`；账户/资金冻结用 `freezeAccount` |
| 提交 / 撤回（发起人主动） | `submit` / `withdraw` | 审批流尚未终审前由发起人主动撤回用 `withdraw` |
| 撤销 / 吊销（权限/令牌/已发指令） | `revoke` | `revokeToken`, `revokePermission` |
| 主动取消（未完成业务单） | `cancel` | `cancelOrder`（客户或业务方取消订单） |
| 单据作废（已生效单据逻辑失效） | `void` / `invalidate` | `voidInvoice`, `voidVoucher`（保留痕迹但财务/业务失效） |
| 正常完结/结案 | `close` / `complete` | `closeOrder`（业务完成或手工关闭）；`completeTask` |
| 强制终止（异常中断流程） | `terminate` | `terminateProcess` |
| 反审核 / 重开 | `unapprove` / `reopen` | 审批退回重审或关闭后重新打开 |

### 2.4 派发、分配与结算对账

| 中文场景 | 推荐英文动词 | 示例 |
| :--- | :--- | :--- |
| 派单 / 调度 | `dispatch` | `dispatchWorkOrder` |
| 指派 / 转派负责人 | `assign` / `reassign` | `assignHandler`, `reassignApprover` |
| 分配资源 / 分摊费用 | `allocate` / `apportion` | `allocateStock`, `apportionCost` |
| 结转 / 过账 / 结账 | `carryForward` / `post` / `closePeriod` | `postVoucher`, `closeAccountingPeriod` |
| 收付款核销（匹配发票/单据） | `applyPayment` / `applyReceipt` | `applyPayment()`（若项目已沿用金蝶既有接口术语如 `writeOff`/`verify`，保持一致） |
| 坏账 / 尾差核销 | `writeOff` | `writeOffBadDebt()`, `writeOffBalance()` |
| 对账 / 结算 | `reconcile` / `settle` | `reconcileStatement()`, `settlePayable()` |

---

## 3. 常见中式英语（Chinglish）反模式与修正

| 中式直译（禁止） | 问题分析 | 推荐命名 |
| :--- | :--- | :--- |
| `open_bill` / `do_bill` | 按字面翻译“开单” | `create_order` / `issue_invoice` |
| `user_num` / `order_num` | 按语义区分 `count`/`quantity`/`number`，不全局禁止 `*_num`（如 `page_num`），但业务字段易混淆编号与数量 | 离散个数用 `user_count` / `order_count`；业务数量用 `*_qty`；编号用 `order_no` |
| `shenhe_status` / `zhuangtai` | 拼音命名 | `approval_status` / `status` |
| `money` / `price_money` | 过于口语化，不区分单价/金额 | `amount` / `unit_price` / `balance` |
| `good_name` / `goods_info` | `good` 形容词误用；`info` 冗余 | `product_name` / `material_name` / `goods` |
| `add_time` / `modify_time` | 命名风格混杂 | `create_time` / `update_time`（或 `created_at` / `updated_at`） |
| `delete_flag` (配字符串 Y/N 或 0/1 不明) | 语义不如布尔明确 | `is_deleted` (DB) + `deleted` (Java) / `IsDeleted` (C#) |
| `check_pass` / `pass_flag` | 动词名词混杂 | `approval_result` / `passed` / `is_passed` |
| `back_reason` / `return_msg` | “退回原因”直译、“返回信息”歧义 | `reject_reason` / `return_reason` / `response_message` |
| `up_file` / `load_file` | 缺词根 | `upload_file` / `attachment` |
| `look_detail` / `see_log` | 口语动词 | `view_detail` / `get_detail` / `query_logs` |
| `person_liable` / `head_man` | 直译“责任人” | `owner_id` / `assignee_id` / `responsible_user_id` |
| `big_type` / `small_type` | 直译“大类/小类” | `primary_category` / `secondary_category` 或 `parent_category` |
| `before_qty` / `after_qty` | 偏模糊 | `qty_before` / `qty_after` 或 `opening_qty` / `closing_qty` |
| `all_money` / `sum_money` | 不规范 | `total_amount` |
| `use_status` | 含义模糊（使用状态 vs 启用状态） | `enabled` / `enable_status` / `usage_status` |
| `out_store` / `in_store` | 易与“商店”混淆 | `outbound` / `inbound`（或 `stock_out` / `stock_in`） |
| `company_name_zh` vs `c_name` | 简写不一致 | `company_name` / `company_name_en` |
| `work_flow` | 英文为单个词 `workflow` | `workflow` |
| `data_info` / `order_data_info` | 无意义后缀堆叠 | `order` / `order_detail` / `order_payload` |
