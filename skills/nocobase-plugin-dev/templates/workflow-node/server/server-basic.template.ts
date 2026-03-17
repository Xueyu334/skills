/**
 * Pattern sources:
 * - packages/plugins/@nocobase/plugin-workflow/src/server/instructions/CalculationInstruction.ts
 * - packages/plugins/@nocobase/plugin-workflow-variable/src/server/VariableInstruction.ts
 * - packages/plugins/@yh-project/plugin-k3cloud/src/server/instructions/KingDeeSaveInstruction.ts
 *
 * Use this as the default template for a synchronous workflow instruction.
 * Replace the config fields, side effect, and result payload for your plugin.
 */

import { FlowNodeModel, Instruction, InstructionResult, JOB_STATUS, Processor } from '@nocobase/plugin-workflow';

export interface ExampleNodeConfig {
  resource?: string;
  payload?: any;
  ignoreFail?: boolean;
}

export default class ExampleNodeInstruction extends Instruction {
  async run(node: FlowNodeModel, input: any, processor: Processor): Promise<InstructionResult> {
    const config = (processor.getParsedValue(node.config, node.id) ?? {}) as ExampleNodeConfig;
    const { resource, payload, ignoreFail = false } = config;

    if (!resource) {
      return {
        status: ignoreFail ? JOB_STATUS.RESOLVED : JOB_STATUS.FAILED,
        result: {
          ok: false,
          message: 'resource is required',
        },
      };
    }

    try {
      // Replace this block with your real side effect.
      const result = {
        ok: true,
        message: '',
        data: {
          resource,
          payload,
        },
      };

      return {
        status: JOB_STATUS.RESOLVED,
        result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        status: ignoreFail ? JOB_STATUS.RESOLVED : JOB_STATUS.FAILED,
        result: {
          ok: false,
          message,
          data: {
            requestParams: config,
          },
        },
      };
    }
  }

  // Add test(config) when the client node sets testable = true.
}
