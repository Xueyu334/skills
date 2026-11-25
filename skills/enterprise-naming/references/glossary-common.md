# 企业通用高频业务词表

用于统一跨业务系统的基础词根。优先级遵循：`用户当次明确指定 > 项目明确约定及业务词典 > 项目已有的稳定命名习惯 > 行业词库 > 本通用词表`。若既有代码存在明显历史遗留错误命名，不无条件继承；与特定行业（如金蝶 ERP）词根冲突时以对应行业词库为准。

---

## 1. 组织架构与权限（`sys_` / `org_`）

| 中文概念 | 标准词根 / 英文 | 常用表名 / 类名示例 | 字段示例与选择依据 |
| :--- | :--- | :--- | :--- |
| 租户 | `tenant` | `sys_tenant` / `Tenant` | `tenant_id`, `tenant_code`, `tenant_name` |
| 组织 / 机构 | `org` / `organization` | `sys_org` / `Organization` | `org_id`, `org_code`, `parent_org_id`；通用层级组织架构用 `org` |
| 公司 / 法人实体 | `company` / `legal_entity` | `sys_company` / `Company` | `company_id`, `tax_no`；业务公司/分公司用 `company`，财税独立法人主体用 `legal_entity` |
| 部门 | `dept` / `department` | `sys_dept` / `Department` | `dept_id`, `dept_code`, `dept_name` |
| 岗位 / 职位 | `position` / `post` | `sys_position` / `Position` | `position_id`, `position_code`；通用 HR 与组织编制优先 `position`，传统/政务系统既有习惯可用 `post` |
| 员工 | `employee` | `sys_employee` / `Employee` | `employee_id`, `employee_no`（工号）, `hire_date`；表示人事在职人员用 `employee` |
| 用户 | `user` | `sys_user` / `SysUser` | `user_id`, `username`；系统使用者主体与资料归属用 `user`（避免裸表名 `user`） |
| 登录账号 | `account` | `sys_account` / `UserAccount` | `account_no`, `account_status`；认证凭证与登录标识（如多账号绑定同一用户、登录锁定状态）用 `account` |
| 角色 | `role` | `sys_role` / `SysRole` | `role_id`, `role_code`, `role_name` |
| 权限 | `permission` | `sys_permission` / `Permission` | `permission_code`, `resource_type`；控制“能否执行某操作/访问某资源”（如“能否导出报表”）用 `permission` |
| 菜单 | `menu` | `sys_menu` / `SysMenu` | `menu_type`, `route_path`；控制“前端导航与页面入口展示”（如“报表入口显示在哪个菜单”）用 `menu`（仅当项目把按钮权限挂在菜单树下时复用菜单表） |
| 数据权限范围 | `data_scope` | `DataScopeEnum` | `ALL`, `ORG_AND_CHILD`, `DEPT`, `SELF` |

---

## 2. 流程与审批（`wf_` / `approval_`）

| 中文概念 | 标准词根 / 英文 | 常用表名 / 类名示例 | 字段示例与选择依据 |
| :--- | :--- | :--- | :--- |
| 流程定义 / 模板 | `process_def` / `workflow_template` | `wf_process_def` | `process_key`, `version`, `deployed`；引擎级可版本化模型（如 BPMN 流程定义）用 `process_def`，业务层配置模板用 `workflow_template` |
| 流程实例 | `process_instance` | `wf_process_instance` | `instance_id`, `business_key`, `process_status` |
| 审批单 / 申请单 | `approval_request` | `ApprovalRequest` | `request_no`, `applicant_id`, `apply_time` |
| 审批节点 | `approval_node` | `ApprovalNode` | `node_code`, `node_name`, `node_type` |
| 待办任务 | `todo_task` / `approval_task` | `wf_approval_task` | `task_id`, `assignee_id`, `task_status`, `due_time`；个人待办列表用 `todo_task`，流程引擎节点任务实体用 `approval_task` |
| 审批记录 / 审批意见 | `approval_record` / `approval_comment` | `wf_approval_record` | `action` (`APPROVE`/`REJECT`/`RETURN`), `approval_comment`；动作流水实体用 `approval_record`，文本意见字段用 `approval_comment`（多库场景避免裸用 `comment`，防 Oracle 等库冲突） |
| 抄送 / 知会 | `cc` / `carbon_copy` | `wf_cc_record` | `cc_user_id`, `is_read` |
| 转审 / 转办 | `transfer` / `reassign` | `wf_task_transfer` / `TaskTransferRecord` | `from_user_id`, `to_user_id`, `transfer_reason`；针对**单条进行中待办**临时移交他人处理（转出后原处理人不再处理该任务） |
| 委托 / 代理审批 | `delegate` | `wf_delegate_rule` / `WorkflowDelegate` | `delegator_id`, `delegatee_id`, `start_time`, `end_time`；按**时间段/流程范围**提前配置的规则级代理（如休假期间自动交由代理人审批） |
| 加签 | `add_sign` / `countersign` | `CountersignModeEnum` | `PRE_SIGN`（前加签）, `POST_SIGN`（后加签） |

---

## 3. 单据、工单与附件（`biz_` / `doc_`）

| 中文概念 | 标准词根 / 英文 | 常用表名 / 类名示例 | 字段示例与选择依据 |
| :--- | :--- | :--- | :--- |
| 单据（ERP/业务通用） | `bill` / `document` | `BillHeader` / `DocStatus` | 财务供应链单据可用 `bill` 或具体单据名（`sales_order`）；状态统一用 `doc_status` |
| 工单 | `work_order` / `ticket` | `work_order` / `WorkOrder` | `work_order_no`, `priority_level`, `dispatch_time`；运维/巡检/维修/派工用 `work_order`，客服/IT 支持/问题求助用 `ticket` |
| 单据号 / 流水号 | `bill_no` / `order_no` / `serial_no` | — | 流水单号优先用 `*_no`，按语义与 `_code`（业务编码）、`_count`/`_qty`（数量）区分 |
| 明细行 / 分录 | `item` / `line` / `entry` | `SalesOrderItem` / `VoucherEntry` | 订单行常用 `item`/`line`；财务凭证/金蝶分录常用 `entry` |
| 行号 | `line_no` / `entry_seq` | — | 订单/明细行用 `line_no`，财务凭证/金蝶分录用 `entry_seq`（从 1 开始递增） |
| 文件对象 | `file_object` / `file_record` | `sys_file` / `FileObject` | `file_name`, `file_ext`, `file_size_bytes`, `storage_path`, `file_hash`；底层存储元数据，与具体业务解耦 |
| 业务附件 | `attachment` | `sys_attachment` / `Attachment` | `biz_type`, `biz_id`, `file_id`；挂载到具体单据/工单的关联记录用 `attachment` |
| 打印模板 | `print_template` | `cfg_print_template` | `template_code`, `template_content` |

---

## 4. 基础档案、台账与字典（`bd_` / `cfg_`）

| 中文概念 | 标准词根 / 英文 | 常用表名 / 类名示例 | 字段示例与选择依据 |
| :--- | :--- | :--- | :--- |
| 主数据 / 基础资料 | `master_data` / `base_data` | 包 `masterdata` / 前缀 `bd_` | 跨系统主数据治理（MDM）用 `master_data`，ERP/业务基础档案用 `base_data`（前缀 `bd_`），避免泛写 `base_info` |
| 设备/资产台账 | `ledger` / `asset_ledger` | `asset_ledger` / `EquipmentLedger` | 台账强调用 `ledger` 或具体实体名（如 `equipment`），不用拼音 `taizhang` |
| 分类 / 类目 | `category` | `material_category` | `category_code`, `parent_id`, `tree_path` |
| 数据字典（类型） | `dict_type` | `sys_dict_type` / `DictType` | `dict_code`, `dict_name`；表示字典分组定义 |
| 字典项 | `dict_item` | `sys_dict_item` / `DictItem` | `dict_type_id`, `item_value`, `item_label`；表示具体枚举键值条目 |
| 标签 | `tag` / `label` | `sys_tag` | `tag_name`, `tag_color`；业务分类/多选打标检索用 `tag`，UI 展示文本或字典显示名用 `label` |
| 编号规则 | `code_rule` / `serial_rule` | `cfg_code_rule` | `rule_code`, `prefix`, `date_format`, `seq_length`；通用编码规则用 `code_rule`，带日期与递增流水的单据号规则用 `serial_rule` / `bill_no_rule` |

---

## 5. 审计、日志与异步任务（`log_` / `his_`）

| 中文概念 | 标准词根 / 英文 | 常用表名 / 类名示例 | 字段示例与选择依据 |
| :--- | :--- | :--- | :--- |
| 操作日志 | `operation_log` | `log_operation` | `module_name`, `action_type`, `request_uri`, `cost_ms` |
| 登录日志 | `login_log` | `log_login` | `login_account`, `client_ip`, `login_status` |
| 审计日志 | `audit_log` | `log_audit` / `AuditLog` | `operator_id`, `resource_type`, `action`, `occur_time`；面向安全与合规追溯（谁在何时操作了什么敏感资源） |
| 数据变更记录 | `change_log` / `data_change` | `log_data_change` / `DataChangeRecord` | `entity_type`, `entity_id`, `before_snapshot`, `after_snapshot`；面向字段级前后值对比追踪 |
| 通知 / 公告 | `notification` / `announcement` | `sys_notification`, `sys_announcement` | 多渠道点对点触达消息用 `notification`（`receiver_id`, `read_time`），面向全员/范围的系统广播用 `announcement` |
| 导入 / 导出任务 | `import_task` / `export_task` | `sys_import_task`, `sys_export_task` | 数据写入与校验失败明细用 `import_task`，异步生成下载产物用 `export_task`（共用 `task_no`, `task_status`, `total_count`, `success_count`, `fail_count`, `result_file_url`） |
