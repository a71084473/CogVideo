import { useState } from 'react'

interface Props {
  apiKey: string
  onApiKeyChange: (key: string) => void
}

/**
 * Anthropic API key 設定。
 * 金鑰只儲存在瀏覽器的 localStorage，直接從瀏覽器呼叫 Claude API。
 * 未設定時，生成會退回 mock 資料模式。
 */
export default function ApiKeySettings({ apiKey, onApiKeyChange }: Props) {
  const [draft, setDraft] = useState(apiKey)
  const [open, setOpen] = useState(false)

  const save = () => {
    onApiKeyChange(draft.trim())
    setOpen(false)
  }

  return (
    <div className="mt-6 border-t border-line pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="api-key-panel"
        className="flex items-center gap-3 text-xs tracking-widest text-faint hover:text-ink"
      >
        <span
          aria-hidden
          className={`inline-block h-2 w-2 rounded-full border ${
            apiKey ? 'border-ink bg-ink' : 'border-faint'
          }`}
        />
        {apiKey ? 'AI 已連線 · Claude 真實生成' : 'AI 未連線 · 目前使用示範資料'}
        <span className="underline underline-offset-4">{open ? '收合' : '設定 API Key'}</span>
      </button>

      {open && (
        <form
          id="api-key-panel"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
          className="mt-4 max-w-xl border border-line p-4"
        >
          <label htmlFor="api-key" className="mb-2 block text-xs tracking-widest text-faint">
            ANTHROPIC API KEY
          </label>
          <div className="flex gap-2">
            <input
              id="api-key"
              type="password"
              autoComplete="off"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="sk-ant-..."
              aria-describedby="api-key-help"
              className="flex-1 border border-field bg-transparent px-3 py-2 font-mono text-sm text-ink placeholder:text-faint focus:border-ink"
            />
            <button
              type="submit"
              className="border border-ink px-4 py-2 text-xs tracking-widest text-ink hover:bg-ink hover:text-paper"
            >
              儲存
            </button>
          </div>
          <p id="api-key-help" className="mt-3 text-xs leading-relaxed text-faint">
            金鑰只會存在你瀏覽器的 localStorage，並直接從瀏覽器呼叫 Claude API，
            不經過任何伺服器。清空欄位並儲存即可移除。
            （正式產品建議改用後端代理保護金鑰。）
          </p>
        </form>
      )}
    </div>
  )
}
