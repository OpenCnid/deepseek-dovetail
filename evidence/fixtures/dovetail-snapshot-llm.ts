import type { Context } from '@deepseek-ai/cordis'
import {
  CallId,
  LlmAdapter,
  ReasoningEffortId,
  type GenerateOptions,
  type LlmResolvedModelInfo,
  type StreamChunk,
} from '@deepseek-ai/dsh-llm'

const OFF = ReasoningEffortId('off')

function textOf(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(textOf).join('\n')
  if (typeof value === 'object' && value !== null) return Object.values(value).map(textOf).join('\n')
  return ''
}

class DovetailSnapshotAdapter extends LlmAdapter {
  override async resolveModel(provider: string, model: string): Promise<LlmResolvedModelInfo> {
    return {
      provider,
      id: model,
      name: model,
      reasoning: { efforts: [{ id: OFF, name: 'Off' }], defaultEffort: OFF },
    }
  }

  async * stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    const conversation = textOf(options.messages)
    const toolResult = options.messages.at(-1)?.content.find(block => block.type === 'tool-result')
    const hasColdTool = options.tools?.some(tool => tool.name === 'subagent') ?? false
    if (conversation.includes('SNAPSHOT_SELF_PLAY') && toolResult === undefined && hasColdTool) {
      const args = JSON.stringify({
        description: 'Blind evaluator snapshot',
        prompt: 'Review the supplied neutral fixture without inherited parent history.',
        run_in_background: false,
      })
      yield { type: 'block-start', index: 0, blockType: 'tool-call' }
      yield { type: 'tool-call-delta', index: 0, id: CallId('dovetail-cold-child'), name: 'subagent', argumentsDelta: args }
      yield { type: 'block-end', index: 0, block: { type: 'tool-call', id: CallId('dovetail-cold-child'), name: 'subagent', arguments: args } }
      yield { type: 'usage', usage: { inputTokens: 13, outputTokens: 7 } }
      yield { type: 'finish', reason: { kind: 'tool-calls' } }
      return
    }

    const reply = conversation.includes('Judge two anonymous candidate outputs')
      ? 'TIE: the keyless adapter measures routing only, not candidate quality.'
      : toolResult === undefined ? 'DOVETAIL_KEYLESS_SNAPSHOT_OK' : 'DOVETAIL_COLD_SUBAGENT_SETTLED'
    yield { type: 'block-start', index: 0, blockType: 'text' }
    yield { type: 'text-delta', index: 0, text: reply }
    yield { type: 'block-end', index: 0, block: { type: 'text', text: reply } }
    yield { type: 'usage', usage: { inputTokens: 11, outputTokens: 5 } }
    yield { type: 'finish', reason: { kind: 'stop' } }
  }
}

export const name = 'dovetail-snapshot-llm'
export const inject = ['llm']

export function apply(ctx: Context): void {
  ctx.llm.registerAdapter(['dovetail-snapshot'], new DovetailSnapshotAdapter())
}
