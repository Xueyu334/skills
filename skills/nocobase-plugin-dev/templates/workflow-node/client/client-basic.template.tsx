/**
 * Pattern sources:
 * - packages/plugins/@nocobase/plugin-workflow-variable/src/client/Instruction.tsx
 * - packages/plugins/@nocobase/plugin-workflow/src/client/nodes/calculation.tsx
 *
 * Use this as the smallest client instruction template.
 */

import React from 'react';
import { AppstoreOutlined } from '@ant-design/icons';
import { defaultFieldNames, Instruction, WorkflowVariableInput } from '@nocobase/plugin-workflow/client';

import { NAMESPACE } from '../locale';

export default class ExampleNodeInstruction extends Instruction {
  title = `{{t("Example node", { ns: "${NAMESPACE}" })}}`;
  type = 'example-node';
  group = 'extended';
  description = `{{t("Resolve config and return a simple result.", { ns: "${NAMESPACE}" })}}`;
  icon = (<AppstoreOutlined />);
  fieldset = {
    resource: {
      type: 'string',
      title: `{{t("Resource", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableInput',
      'x-component-props': {
        useTypedConstant: ['string'],
        changeOnSelect: true,
      },
      required: true,
    },
    payload: {
      type: 'string',
      title: `{{t("Payload", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableInput',
      'x-component-props': {
        useTypedConstant: ['object', 'string'],
        changeOnSelect: true,
      },
    },
    ignoreFail: {
      type: 'boolean',
      title: `{{t("Ignore fail", { ns: "${NAMESPACE}" })}}`,
      'x-decorator': 'FormItem',
      'x-component': 'Checkbox',
      default: false,
    },
  };
  components = {
    WorkflowVariableInput,
  };

  useVariables({ key, title }, { fieldNames = defaultFieldNames } = {}) {
    return {
      [fieldNames.value]: key,
      [fieldNames.label]: title,
    };
  }
}
