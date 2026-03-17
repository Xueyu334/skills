/**
 * Pattern sources:
 * - packages/plugins/@nocobase/plugin-workflow-request/src/client/RequestInstruction.tsx
 * - packages/plugins/@nocobase/plugin-workflow-javascript/src/client/ScriptInstruction.tsx
 * - packages/plugins/@yh-project/plugin-k3cloud/src/client/instructions/KingDeeSaveInstruction.tsx
 * - packages/plugins/@yh-project/plugin-k3cloud/src/client/instructions/KingDeeAuditInstruction.tsx
 *
 * Use this when the node needs:
 * - variable inputs with custom validation
 * - nested result variables
 * - optional 2.0 value block output
 */

import React from 'react';
import { ApiOutlined } from '@ant-design/icons';
import { SchemaInitializerItemType } from '@nocobase/client';
import {
  Instruction,
  ValueBlock,
  WorkflowVariableInput,
  defaultFieldNames,
} from '@nocobase/plugin-workflow/client';
import { SubModelItem } from '@nocobase/flow-engine';

import { lang, NAMESPACE } from '../locale';

function hasValue(value: unknown) {
  return value !== null && value !== undefined && value !== '';
}

export default class ExampleServiceNodeInstruction extends Instruction {
  title = `{{t("Example service node", { ns: "${NAMESPACE}" })}}`;
  type = 'example-service-node';
  group = 'extended';
  description = `{{t("Call an external service and expose a structured result.", { ns: "${NAMESPACE}" })}}`;
  icon = (<ApiOutlined />);
  fieldset = {
    serviceCode: {
      type: 'string',
      title: `{{t("Service code", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableInput',
      'x-component-props': {
        useTypedConstant: ['string'],
        changeOnSelect: true,
      },
      ['x-validator'](value) {
        return hasValue(value) ? '' : lang('{{field}} cannot be empty', { field: lang('Service code') });
      },
      required: true,
    },
    recordId: {
      type: 'string',
      title: `{{t("Record ID", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableInput',
      'x-component-props': {
        useTypedConstant: ['string'],
        changeOnSelect: true,
      },
      ['x-validator'](value, rules, { form }) {
        return hasValue(value) || hasValue(form.values?.recordNo)
          ? ''
          : lang('{{field1}} and {{field2}} cannot both be empty', {
              field1: lang('Record ID'),
              field2: lang('Record No'),
            });
      },
    },
    recordNo: {
      type: 'string',
      title: `{{t("Record No", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableInput',
      'x-component-props': {
        useTypedConstant: ['string'],
        changeOnSelect: true,
      },
      ['x-validator'](value, rules, { form }) {
        return hasValue(value) || hasValue(form.values?.recordId)
          ? ''
          : lang('{{field1}} and {{field2}} cannot both be empty', {
              field1: lang('Record ID'),
              field2: lang('Record No'),
            });
      },
    },
    payload: {
      type: 'object',
      title: `{{t("Payload", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableInput',
      'x-component-props': {
        useTypedConstant: ['object', 'string'],
        changeOnSelect: true,
      },
    },
    skipIfEmpty: {
      type: 'boolean',
      title: `{{t("Skip if empty", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'Checkbox',
      default: false,
    },
  };
  components = {
    WorkflowVariableInput,
  };

  useVariables({ key, title }, { fieldNames = defaultFieldNames } = {}) {
    const okLabel = lang('Success');
    const messageLabel = lang('Result message');
    const dataLabel = lang('Response data');
    const payloadLabel = lang('Response payload');
    const paramsLabel = lang('Request params');

    return {
      [fieldNames.value]: key,
      [fieldNames.label]: title,
      [fieldNames.children]: [
        {
          [fieldNames.value]: 'ok',
          [fieldNames.label]: okLabel,
        },
        {
          [fieldNames.value]: 'message',
          [fieldNames.label]: messageLabel,
        },
        {
          [fieldNames.value]: 'data',
          [fieldNames.label]: dataLabel,
          [fieldNames.children]: [
            {
              [fieldNames.value]: 'responsePayload',
              [fieldNames.label]: payloadLabel,
            },
            {
              [fieldNames.value]: 'requestParams',
              [fieldNames.label]: paramsLabel,
            },
          ],
        },
      ],
    };
  }

  useInitializers(node): SchemaInitializerItemType {
    return {
      name: node.title ?? `#${node.id}`,
      type: 'item',
      title: node.title ?? `#${node.id}`,
      Component: ValueBlock.Initializer,
      node,
      resultTitle: lang('Example result'),
    };
  }

  getCreateModelMenuItem({ node }): SubModelItem {
    return {
      key: node.title ?? `#${node.id}`,
      label: node.title ?? `#${node.id}`,
      useModel: 'NodeValueModel',
      createModelOptions: {
        use: 'NodeValueModel',
        stepParams: {
          valueSettings: {
            init: {
              dataSource: `{{$jobsMapByNodeKey.${node.key}}}`,
              defaultValue: lang('Example result'),
            },
          },
          cardSettings: {
            titleDescription: {
              title: `{{t("Example service node", { ns: "${NAMESPACE}" })}}`,
            },
          },
        },
      },
    };
  }
}
