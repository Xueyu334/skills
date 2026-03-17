/**
 * Pattern sources:
 * - packages/plugins/@nocobase/plugin-workflow-delay/src/server/DelayInstruction.ts
 * - packages/plugins/@nocobase/plugin-workflow-javascript/src/server/ScriptInstruction.ts
 * - packages/plugins/@nocobase/plugin-workflow-request/src/server/RequestInstruction.ts
 *
 * Use this when the instruction has to exit first and resume later from an
 * external callback, queue, timer, or webhook.
 */

import { FlowNodeModel, Instruction, JOB_STATUS, Processor } from '@nocobase/plugin-workflow';

export interface ExampleAsyncNodeConfig {
  requestId?: string;
  delayMs?: number;
}

export default class ExampleAsyncNodeInstruction extends Instruction {
  async run(node: FlowNodeModel, prevJob, processor: Processor) {
    const config = (processor.getParsedValue(node.config, node.id) ?? {}) as ExampleAsyncNodeConfig;
    const { requestId, delayMs = 1_000 } = config;

    if (!requestId) {
      return {
        status: JOB_STATUS.FAILED,
        result: {
          ok: false,
          message: 'requestId is required',
        },
      };
    }

    const job = await processor.saveJob({
      status: JOB_STATUS.PENDING,
      nodeId: node.id,
      nodeKey: node.key,
      upstreamId: prevJob?.id ?? null,
      result: {
        requestId,
      },
    });

    await processor.exit();

    // Replace this timer with your real callback / event / queue consumer.
    setTimeout(async () => {
      const savedJob = await this.workflow.app.db.getRepository('jobs').findOne({
        filterByTk: job.id,
      });

      if (!savedJob) {
        return;
      }

      savedJob.set({
        status: JOB_STATUS.RESOLVED,
        result: {
          ok: true,
          message: '',
          data: {
            requestId,
          },
        },
      });

      await this.workflow.resume(savedJob);
    }, delayMs);

    return job;
  }

  async resume(node: FlowNodeModel, job, processor: Processor) {
    return job;
  }
}
