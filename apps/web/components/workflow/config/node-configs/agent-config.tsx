'use client';

/**
 * Agent Node Configuration - Scientific Luxury Edition
 *
 * Configuration form for AI Agent nodes.
 */

import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { NodeConfigProps } from '../node-config-panel';

const AGENT_TYPES = [
  { value: 'research', label: 'Research Agent', description: 'Web search and analysis' },
  { value: 'coding', label: 'Coding Agent', description: 'Code generation and review' },
  { value: 'data', label: 'Data Agent', description: 'Data processing and analysis' },
  { value: 'orchestrator', label: 'Orchestrator', description: 'Coordinate other agents' },
  { value: 'custom', label: 'Custom Agent', description: 'Custom behaviour' },
];

export function AgentNodeConfig({ config, onChange }: NodeConfigProps) {
  const handleChange = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange]
  );

  return (
    <div className="space-y-4">
      {/* Agent Type */}
      <div>
        <Label className="text-[10px] tracking-[0.2em] text-white/40 uppercase">Agent Type</Label>
        <select
          value={(config.agentType as string) || 'research'}
          onChange={(e) => handleChange('agentType', e.target.value)}
          className="mt-2 w-full rounded-sm border-[0.5px] border-white/[0.06] bg-[#050505] px-3 py-2 text-sm text-white/90"
        >
          {AGENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[10px] text-white/30">
          {
            AGENT_TYPES.find((t) => t.value === ((config.agentType as string) || 'research'))
              ?.description
          }
        </p>
      </div>

      {/* Agent Instructions */}
      <div>
        <Label className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
          Agent Instructions
        </Label>
        <Textarea
          value={(config.instructions as string) || ''}
          onChange={(e) => handleChange('instructions', e.target.value)}
          placeholder="Describe what this agent should accomplish..."
          rows={4}
          className="mt-2 resize-none border-[0.5px] border-white/[0.06] bg-white/[0.02] text-sm text-white/90 placeholder:text-white/30 focus:border-white/20"
        />
      </div>

      {/* Tools Selection */}
      <div>
        <Label className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
          Available Tools
        </Label>
        <div className="mt-2 space-y-2">
          {['web_search', 'code_interpreter', 'file_browser', 'calculator'].map((tool) => (
            <div
              key={tool}
              className="flex items-center justify-between rounded-sm border-[0.5px] border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <span className="font-mono text-xs text-white/70">{tool}</span>
              <Switch
                checked={((config.tools as string[]) || []).includes(tool)}
                onCheckedChange={(checked) => {
                  const currentTools = (config.tools as string[]) || [];
                  handleChange(
                    'tools',
                    checked ? [...currentTools, tool] : currentTools.filter((t) => t !== tool)
                  );
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Max Iterations */}
      <div>
        <Label className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
          Max Iterations
        </Label>
        <Input
          type="number"
          value={(config.maxIterations as number) || 10}
          onChange={(e) => handleChange('maxIterations', parseInt(e.target.value))}
          className="mt-2 border-[0.5px] border-white/[0.06] bg-white/[0.02] text-white/90"
        />
        <p className="mt-1 text-[10px] text-white/30">Maximum reasoning loops before stopping</p>
      </div>

      {/* Verbose Logging */}
      <div className="flex items-center justify-between rounded-sm border-[0.5px] border-white/[0.06] bg-white/[0.02] p-3">
        <div>
          <p className="text-sm text-white/90">Verbose Logging</p>
          <p className="text-[10px] text-white/40">Log detailed agent reasoning steps</p>
        </div>
        <Switch
          checked={(config.verbose as boolean) ?? false}
          onCheckedChange={(checked) => handleChange('verbose', checked)}
        />
      </div>

      {/* Human in the Loop */}
      <div className="flex items-center justify-between rounded-sm border-[0.5px] border-white/[0.06] bg-white/[0.02] p-3">
        <div>
          <p className="text-sm text-white/90">Human in the Loop</p>
          <p className="text-[10px] text-white/40">Require approval for critical actions</p>
        </div>
        <Switch
          checked={(config.humanInLoop as boolean) ?? false}
          onCheckedChange={(checked) => handleChange('humanInLoop', checked)}
        />
      </div>
    </div>
  );
}
