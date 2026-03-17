/**
 * Pattern sources:
 * - packages/plugins/@nocobase/plugin-workflow-javascript/src/client/index.tsx
 * - packages/plugins/@yh-project/plugin-k3cloud/src/client/plugin.tsx
 *
 * Copy this to your client plugin entry when registering a workflow instruction.
 */

import { Plugin } from '@nocobase/client';
import PluginWorkflowClient from '@nocobase/plugin-workflow/client';

import { tExpr } from './locale';
import ExampleNodeInstruction from './instructions/ExampleNodeInstruction';

export default class PluginExampleClient extends Plugin {
  async load() {
    const workflowPlugin = this.app.pm.get('workflow') as PluginWorkflowClient;

    if (!workflowPlugin) {
      console.warn('[plugin-example] workflow client plugin not found, skip registering workflow instructions');
      return;
    }

    workflowPlugin.registerInstructionGroup('example', {
      label: tExpr('Example'),
    });

    workflowPlugin.registerInstruction('example-node', ExampleNodeInstruction);
  }
}
