/**
 * Pattern sources:
 * - packages/plugins/@nocobase/plugin-workflow-javascript/src/server/plugin.ts
 * - packages/plugins/@yh-project/plugin-k3cloud/src/server/plugin.ts
 *
 * Copy this to your server plugin entry when registering a workflow instruction.
 */

import { Plugin } from '@nocobase/server';
import PluginWorkflowServer from '@nocobase/plugin-workflow';

import ExampleNodeInstruction from './instructions/ExampleNodeInstruction';

export default class PluginExampleServer extends Plugin {
  async load() {
    const workflowPlugin = this.app.pm.get(PluginWorkflowServer) as PluginWorkflowServer;

    if (!workflowPlugin) {
      this.log.warn('workflow server plugin not found, skip registering workflow instructions');
      return;
    }

    workflowPlugin.registerInstruction('example-node', ExampleNodeInstruction);
  }
}
