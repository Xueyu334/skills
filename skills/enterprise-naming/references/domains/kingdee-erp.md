# 金蝶云星空 (K3Cloud) 与金蝶 EAS 行业术语词库

本词库专用于 ERP、财务、供应链及生产制造系统（尤其是对接或基于**金蝶云星空 K3Cloud / 金蝶 EAS** 建设的自研微服务、报表、集成接口或二开插件）。

## 使用原则（先分清“自研命名”还是“金蝶原生元数据”）

1. **现代自研代码 / 自建库表 / 对外 API**：使用本表“标准代码词根 / 英文”与“推荐表·字段·类示例”，遵守项目主栈（Java/TS/C#）命名规范，不使用 `F*` 或 `T_*` 命名新表新字段。
2. **金蝶原生 BOS / EAS 数据查询、SQL 报表或插件二开**：访问原生表/字段时，**必须保留目标产品平台原生标识符不变**，避免映射错误或破坏平台单据契约。
3. **严格区分产品与元数据版本**：文中原生表名/字段示例均以 `[云星空]` / `[EAS]` 显式标注适用产品，**不可将 `[云星空]`（K3Cloud）的 `T_*`/`F*` 字段直接套用于 `[EAS]`**，反之亦然；尤其涉及组织归属字段、状态编码和单据明细表名时，必须以目标产品实际版本及单据元数据为准。

---

## 1. 多组织与基础资料（`org_` / `bd_`）

| 中文术语 | 标准代码词根 / 英文 | 表 / 字段 / 类示例 | 金蝶云星空 / EAS 对照与说明 |
| :--- | :--- | :--- | :--- |
| 核算组织 | `acct_org` | `acct_org_id`, `acct_org_code` | 财务记账、账簿与成本核算归属主体；原生字段因产品（`[云星空]`/`[EAS]`）、财务模块及单据而异，须按具体单据元数据确认，**切勿误用 `FCreateOrgId` / `FUseOrgId`** |
| 业务组织 | `biz_org` | `biz_org_id`, `biz_org_code` | 采销存、生产等业务执行归属（如销售/采购/库存/生产组织）；原生字段随具体产品与单据变化，须按单据元数据确认 |
| 创建组织 | `create_org` | `create_org_id` | 基础资料最初创建归属组织；`[云星空]` 基础资料常见 `FCreateOrgId`（`[EAS]` 按具体基础资料与组织单元元数据确认） |
| 使用组织 | `use_org` | `use_org_id` | 基础资料分配后实际启用的组织；`[云星空]` 基础资料常见 `FUseOrgId`（`[EAS]` 按具体基础资料与组织单元元数据确认） |
| 账簿 | `acct_book` / `ledger_book` | `fin_acct_book`, `acct_book_id` | `[云星空]` 总账账簿字段常见 `FAccountBookID`（`[EAS]` 按账簿元数据确认） |
| 会计政策 | `acct_policy` | `acct_policy_id`, `AcctPolicy` | 决定币别、科目表、折旧政策等 |
| 会计期间 | `acct_period` / `fiscal_period` | `fiscal_year`, `acct_period` | 如 2026 年第 11 期：`fiscal_year=2026`, `period_no=11` |
| 币别 / 本位币 | `currency` / `base_currency` | `currency_code`, `base_currency_code` | 原币 `original_currency`、本位币 `base_currency`（或 `functional_currency`） |
| 汇率 / 汇率类型 | `exchange_rate` / `rate_type` | `exchange_rate`, `rate_type_code` | 间接/直接汇率注意精度（常 `DECIMAL(18, 8)`） |
| 物料 | `material` | `bd_material`, `material_id`, `material_code` | `[云星空]` 原生表 `T_BD_MATERIAL`、字段 `FMATERIALID` / `FNUMBER`（`[EAS]` 按物料元数据确认） |
| 物料分组 | `material_group` | `bd_material_group`, `material_group_id` | 物料树形分类，`[云星空]` 常见 `FMaterialGroup` |
| 物料属性 | `material_attr` / `erp_cls` | `material_attr` (`SELF_MADE`/`PURCHASED`/`SUBCONTRACT`/`PHANTOM`) | 区分自制、外购、委外、虚拟件、配置件 |
| 计量单位 / 换算率 | `uom` / `conversion_rate` | `base_uom_id`, `aux_uom_id`, `uom_convert_rate` | 基本单位、采购/销售/库存单位、浮动/固定换算 |
| 辅助属性 | `aux_prop` | `aux_prop_id`, `aux_prop_json` | 如颜色、尺码、等级；`[云星空]` 常见 `FAuxPropId` |
| 批号 / 序列号 | `lot_no` / `serial_no` | `lot_no`（或 `batch_no`）, `serial_no` | 按批次追溯多件同批物料用 `lot_no`（`[云星空]` `FLot`），一物一码单件追溯用 `serial_no`（`[云星空]` `FSN`） |
| 仓库 / 仓位 | `warehouse` / `stock_loc` (`bin`) | `warehouse_id`, `stock_loc_id` | `[云星空]` 仓库 `T_BD_STOCK`、仓位 `FStockLocId`（`[EAS]` 按仓储元数据确认） |
| 供应商 / 客户 | `supplier` / `customer` | `bd_supplier`, `bd_customer`, `supplier_id` | `[云星空]` 原生表 `T_BD_SUPPLIER` / `T_BD_CUSTOMER`（`[EAS]` 按客商元数据确认） |
| 采购员 / 销售员 | `purchaser` / `salesperson` | `purchaser_id`, `salesperson_id` | `[云星空]` 常见 `FPurchaserId` / `FSalerId`（`[EAS]` 按业务员元数据确认） |

---

## 2. 财务管理（总账 / 应收应付 / 资金 / 固定资产 / 成本）

| 中文术语 | 标准代码词根 / 英文 | 表 / 字段 / 类示例 | 金蝶云星空 / EAS 对照与说明 |
| :--- | :--- | :--- | :--- |
| 会计科目 | `acct_subject` / `account` | `fin_acct_subject`, `subject_code` | `[云星空]` 表 `T_BD_ACCOUNT`（`[EAS]` 按科目元数据确认）；用 `acct_subject` 可避免与登录 `user_account` 混淆 |
| 核算维度 / 辅助核算 | `flex_dim` / `acct_dimension` | `acct_dimension_json`, `flex_item_id` | 如部门、客户、供应商、项目多维核算；`[云星空]` 常见 `FFlexId` |
| 凭证 / 凭证字 / 分录 | `voucher` / `voucher_group` / `voucher_entry` | `fin_voucher`, `fin_voucher_entry`, `voucher_no` | `[云星空]` 表 `T_GL_VOUCHER`、`T_GL_VOUCHERENTRY`（`[EAS]` 按总账凭证元数据确认） |
| 借方金额 / 贷方金额 | `debit_amount` / `credit_amount` | `debit_amount`, `credit_amount`, `debit_local_amount` | 区分原币借贷与本位币借贷（`*Amount` vs `*LocalAmount`） |
| 期初余额 / 期末余额 | `opening_balance` / `closing_balance` | `opening_balance`, `closing_balance` | 表示**某一时点**的账面余额（也可表达为 `begin_balance` / `end_balance`），勿与期间发生额混用 |
| 本期发生额 | `period_amount` / `period_debit_amount` / `period_credit_amount` | `period_debit_amount`, `period_credit_amount`, `period_net_amount` | 表示**会计期间内**的累计发生额（借/贷/净发生额），明确区分于期初/期末时点余额 |
| 过账 / 反过账 | `post` / `unpost` | `postVoucher()`, `posted`, `post_time` | 凭证记账过账动作；`[云星空]` 常见 `FPosted` |
| 结账 / 反结账 / 损益结转 | `close_period` / `reopen_period` / `profit_loss_transfer` | `closeAcctPeriod()` | 期末结账与损益结转 |
| 应收单 / 应付单 | `receivable_bill` / `payable_bill` | `ar_receivable_bill`, `ap_payable_bill` | 区分订单与财务确认债权债务单据 |
| 收款单 / 付款单 | `receipt_bill` / `payment_bill` | `ar_receipt_bill`, `ap_payment_bill` | 退款单：`receipt_refund_bill` / `payment_refund_bill` |
| 收付款核销（匹配发票/单据） | `apply_payment` / `apply_receipt` | `applyPayment()`, `ar_payment_application`, `applied_amount` | 收款/付款匹配应收应付单或发票并扣减余额时优先使用；若项目已沿用金蝶既有接口术语（如 `writeOff`/`verify`），保持既有契约一致 |
| 坏账 / 尾差核销 | `write_off` | `writeOff()`, `fin_write_off_record`, `written_off_amount` | 坏账核销、小额尾差核销或不可收回金额冲销时使用 |
| 往来对账 | `reconcile` | `reconcileStatement()`, `fin_reconciliation` | 双方账单余额与明细差异核对确认用 `reconcile()` |
| 含税价 / 不含税金额 / 税额 | `tax_included_price` / `tax_excluded_amount` / `tax_amount` | `tax_rate`, `tax_amount`, `amount_excl_tax`, `amount_incl_tax` | 明细行命名统一后缀，避免 `price` 含不含税混淆 |
| 固定资产卡片 / 折旧 | `asset_card` / `depreciation` | `fa_asset_card`, `accum_depr_amount` | 原值 `original_value`、累计折旧 `accum_depr_amount`、净值 `net_value` |
| 资金调拨 / 承兑汇票 | `fund_transfer` / `acceptance_bill` | `cm_fund_transfer`, `bill_maturity_date` | 区分银行承兑 `bank_acceptance` 与商业承兑 `commercial_acceptance` |
| 成本中心 / 成本卷积 / 在产品 | `cost_center` / `cost_rollup` / `wip` | `cost_center_id`, `wip_amount` | 在产品 `wip`（Work In Progress），实际成本 `actual_cost` |

---

## 3. 供应链管理（采购 / 销售 / 库存 `scm_`）

| 中文术语 | 标准代码词根 / 英文 | 表 / 字段 / 类示例 | 金蝶云星空 / EAS 对照与说明 |
| :--- | :--- | :--- | :--- |
| 请购单 / 采购申请 | `purchase_req` | `scm_purchase_req`, `req_no` | `[云星空]` 表 `T_PUR_REQUISITION`（`[EAS]` 按请购单元数据确认） |
| 采购订单 | `purchase_order` | `scm_purchase_order`, `po_no` / `order_no` | `[云星空]` 表 `T_PUR_POORDER`（`[EAS]` 按采购订单元数据确认） |
| 收料通知单 / 采购入库单 | `receive_notice` / `purchase_inbound` | `scm_receive_notice`, `scm_purchase_inbound` | 退料单：`purchase_return` |
| 销售报价单 / 销售订单 | `sales_quotation` / `sales_order` | `scm_sales_order`, `so_no` / `order_no` | `[云星空]` 表 `T_SAL_ORDER`、`T_SAL_ORDERENTRY`（`[EAS]` 按销售订单元数据确认） |
| 发货通知单 / 销售出库单 | `delivery_notice` / `sales_outbound` | `scm_delivery_notice`, `scm_sales_outbound` | 退货单：`sales_return` |
| 即时库存 / 可用量 / 锁库量 | `inventory` / `available_qty` / `locked_qty` | `inv_inventory`, `on_hand_qty`, `locked_qty` | `[云星空]` 表 `T_STK_INVENTORY`（`[EAS]` 按库存元数据确认）；物理现存量用 `on_hand_qty`，可下单/可分配余量用 `available_qty`，单据预留锁定用 `locked_qty` / `reserved_qty` |
| 直接调拨 / 分步调拨 | `direct_transfer` / `step_transfer` | `inv_transfer_order`, `transfer_out` / `transfer_in` | 一步直接移库用 `direct_transfer`；跨组织或需先出后入在途确认用 `step_transfer`（配 `from_*` / `to_*`） |
| 盘点方案 / 盘盈 / 盘亏 | `stocktake_plan` / `stock_gain` / `stock_loss` | `inv_stocktake_order`, `diff_qty` | 账面数量 `book_qty`、实盘数量 `counted_qty`、差异数量 `diff_qty` |
| 库存状态 | `stock_status` | `stock_status_id`（主数据外键） / `stock_status_code`（`AVAILABLE`/`FROZEN`/`DEFECTIVE`） | 关联独立库存状态主数据表时用 `stock_status_id`；直接存储状态编码或枚举值时用 `stock_status_code`（`[云星空]`/`[EAS]` 按各自元数据确认） |
| 货主 / 保管者 | `owner` / `keeper` | `owner_type`, `owner_id`, `keeper_id` | 资产/物权归属方用 `owner`（`[云星空]` 货主多态关联需配 `owner_type` + `owner_id`），实际仓库管理/代管方用 `keeper` |
| 生产日期 / 到期日 / 保质期 | `produce_date` / `expiry_date` / `shelf_life_days` | `produce_date`, `expiry_date`, `shelf_life_days` | 保质期管理带显式单位 `_days` |

---

## 4. 生产制造与工程数据（`mfg_` / `eng_` / `qc_`）

| 中文术语 | 标准代码词根 / 英文 | 表 / 字段 / 类示例 | 金蝶云星空 / EAS 对照与说明 |
| :--- | :--- | :--- | :--- |
| 物料清单 (BOM) | `bom` | `eng_bom`, `eng_bom_item`, `bom_version` | `[云星空]` 表 `T_ENG_BOM`、`T_ENG_BOMCHILD`（`[EAS]` 按工程数据元数据确认） |
| 父项物料 / 子项物料 / 替代料 | `parent_material` / `child_material` / `substitute_material` | `parent_material_id`, `numerator`, `denominator`, `scrap_rate` | 分子/分母用量 `numerator`/`denominator`、损耗率 `scrap_rate` |
| 联副产品 | `co_product` / `by_product` | `output_type` (`MAIN`/`CO_PRODUCT`/`BY_PRODUCT`) | 主产品、联产品、副产品 |
| 工艺路线 / 工序 / 工作中心 | `routing` / `operation` / `work_center` | `eng_routing`, `eng_operation`, `work_center_id` | 工序序列 `oper_seq` |
| 主生产计划 / 物料需求计划 | `mps` / `mrp` | `mfg_mrp_run`, `planned_order` | 计划订单 `planned_order` |
| 生产订单 | `prod_order` / `mo` | `mfg_prod_order`, `mo_no` | `[云星空]` 表 `T_PRD_MO`（Manufacturing Order；`[EAS]` 按生产制造元数据确认） |
| 生产用料清单 | `ppbom` / `prod_bom` | `mfg_ppbom`, `mfg_ppbom_item` | `[云星空]` 表 `T_PRD_PPBOM`（生产备料与发料基准） |
| 生产领料 / 补料 / 退料 | `prod_pick` / `prod_feed` / `prod_return` | `mfg_material_pick`, `picked_qty` | `[云星空]` 对应 `T_PRD_PICKMTRL`、`T_PRD_FEEDMTRL`、`T_PRD_RETURNMTRL` |
| 工序计划 / 派工 / 工序汇报 | `oper_plan` / `dispatch` / `oper_report` | `mfg_oper_report`, `qualified_qty`, `scrap_qty` | 合格数 `qualified_qty`、工废/料废 `scrap_qty`、返修 `rework_qty` |
| 完工汇报 / 生产入库 | `completion_report` / `prod_inbound` | `mfg_completion_report`, `mfg_prod_inbound` | `[云星空]` 对应 `T_PRD_MORPT`、`T_PRD_INSTOCK` |
| 委外订单 / 委外发料 / 委外入库 | `subcontract_order` / `subcontract_issue` / `subcontract_inbound` | `mfg_subcontract_order` | 金蝶常简称 `SUB`（Subcontract），勿用中式 `out_process` |
| 质量检验 / 不良品 / 让步接收 | `inspection` (`iqc`/`ipqc`/`fqc`) / `nonconforming` / `concession` | `qc_inspection_order`, `defect_qty`, `concession_qty` | 检验结论：`QUALIFIED`/`UNQUALIFIED`/`CONCESSION`/`REWORK` |

---

## 5. 金蝶单据模型与状态流转

| 中文术语 | 标准代码词根 / 英文 | 推荐设计 | 金蝶云星空 / EAS 对应说明 |
| :--- | :--- | :--- | :--- |
| 单据头 / 单据体 / 子单据体 | `header` / `entry` / `sub_entry` | 主表 `sales_order` + 子表 `sales_order_entry` + 孙表 `sales_order_sub_entry` | `[云星空]` BOS 三层模型：`BillHead` / `Entity` / `SubEntity`（`[EAS]` 按单据主从元数据确认） |
| 单据类型 | `bill_type` | `bill_type_id`, `bill_type_code` | 决定单据编码规则、转换路由、权限；`[云星空]` 常见 `FBillTypeID` |
| 单据状态 | `doc_status` | 枚举：`TEMP_SAVE`, `CREATED`, `AUDITING`, `APPROVED`, `RE_AUDITING` | `[云星空]` 常见 `FDocumentStatus`（`Z` 暂存/`A` 创建/`B` 审核中/`C` 已审核/`D` 重新审核）；`[EAS]` 状态字段与编码按实际单据元数据确认，不可直接照搬 |
| 禁用状态 | `forbid_status` / `disabled` | 自研推荐 `Boolean disabled`（或 `enabled`） | `[云星空]` 常见 `FForbidStatus`（`A` 正常 / `B` 禁用）；`[EAS]` 按实际基础资料元数据确认；勿把禁用状态和单据审批状态混成一个字段 |
| 整单关闭 / 行关闭 | `closed` / `line_closed` | `close_status`, `manual_closed`, `close_time` | 区分正常完结关闭与手工强制关闭 |
| 下推 / 上拉 / 单据转换 | `push_down` / `pull_up` / `bill_convert` | `BillConvertService.pushConvert()` | 对应单据转换规则（`[云星空]` 常见 `ConvertRule`；`[EAS]` 常见 `BOTP`，物理配置表因产品版本而异） |
| 反写 / 上下游关联追溯 | `write_back` / `source_bill_id` / `source_entry_id` | `src_bill_type`, `src_bill_id`, `src_entry_id` | `[云星空]` 常见关联追踪表 `T_BF_INSTANCE`（`[EAS]` 按 BOTP 关联关系表确认）与上游反写数量 |
