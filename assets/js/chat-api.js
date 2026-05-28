/**
 * chat-api.js - LLM API 调用层
 *
 * 功能：
 * - 多 API 提供商配置
 * - API Key 管理（localStorage 存储）
 * - 流式/非流式聊天请求
 * - 模型列表管理
 */
(() => {
  'use strict';

  // ==================== 内置提供商配置 ====================
  const PROVIDERS = {
    deepseek: {
      name: 'DeepSeek',
      baseUrl: 'https://api.deepseek.com/v1',
      apiType: 'openai',
      models: [
        { id: 'deepseek-chat', name: 'DeepSeek V4 Flash ⚡' },
        { id: 'deepseek-reasoner', name: 'DeepSeek R1 (Reasoner)' },
        { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro' }
      ],
      defaultModel: 'deepseek-chat'
    },
    siliconflow: {
      name: 'SiliconFlow',
      baseUrl: 'https://api.siliconflow.cn/v1',
      apiType: 'openai',
      models: [
        { id: 'deepseek-ai/DeepSeek-V4', name: 'DeepSeek V4' },
        { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3' },
        { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1' },
        { id: 'Pro/deepseek-ai/DeepSeek-V4', name: 'DeepSeek V4 (Pro 版)' },
        { id: 'Pro/deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3 (Pro 版)' },
        { id: 'Qwen/Qwen3-235B-A22B', name: 'Qwen3 235B' },
        { id: 'Qwen/Qwen3-70B-A14B', name: 'Qwen3 70B' },
        { id: 'Qwen/Qwen3-32B', name: 'Qwen3 32B' },
        { id: 'Qwen/Qwen3-8B', name: 'Qwen3 8B' },
        { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B' },
        { id: 'Qwen/Qwen2.5-32B-Instruct', name: 'Qwen 2.5 32B' },
        { id: 'Qwen/Qwen2.5-14B-Instruct', name: 'Qwen 2.5 14B' },
        { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B' },
        { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4 9B' },
        { id: 'THUDM/glm-4-9b-chat-1m', name: 'GLM-4 9B (1M Context)' }
      ],
      defaultModel: 'deepseek-ai/DeepSeek-V4'
    },
    openai: {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      apiType: 'openai',
      models: [
        { id: 'gpt-5.5', name: 'GPT-5.5 (旗舰)' },
        { id: 'gpt-5.4', name: 'GPT-5.4' },
        { id: 'o4-mini', name: 'o4-mini' },
        { id: 'o4', name: 'o4' },
        { id: 'o3', name: 'o3' },
        { id: 'o3-mini', name: 'o3-mini' },
        { id: 'gpt-4.1', name: 'GPT-4.1' },
        { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
        { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano' },
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }
      ],
      defaultModel: 'gpt-5.4'
    },
    moonshot: {
      name: 'Moonshot',
      baseUrl: 'https://api.moonshot.cn/v1',
      apiType: 'openai',
      models: [
        { id: 'moonshot-v1-8k', name: 'Moonshot 8K' },
        { id: 'moonshot-v1-32k', name: 'Moonshot 32K' },
        { id: 'moonshot-v1-128k', name: 'Moonshot 128K' }
      ],
      defaultModel: 'moonshot-v1-128k'
    },
    groq: {
      name: 'Groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiType: 'openai',
      models: [
        { id: 'llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B' },
        { id: 'llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B' },
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
        { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
      ],
      defaultModel: 'llama-4-scout-17b-16e-instruct'
    },
    // ---- 新增提供商 ----
    bailian: {
      name: '阿里百炼 Qwen',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      apiType: 'openai',
      models: [
        { id: 'qwen3-7b-max', name: 'Qwen 3.7 Max (旗舰)' },
        { id: 'qwen3-7b-plus', name: 'Qwen 3.6 Plus' },
        { id: 'qwen3-235b-a22b', name: 'Qwen3 235B MoE' },
        { id: 'qwen3-70b-a14b', name: 'Qwen3 70B MoE' },
        { id: 'qwen3-32b', name: 'Qwen3 32B' },
        { id: 'qwen3-8b', name: 'Qwen3 8B' }
      ],
      defaultModel: 'qwen3-7b-max'
    },
    zhipu: {
      name: '智谱 GLM',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      apiType: 'openai',
      models: [
        { id: 'glm-5-1-fast', name: 'GLM-5.1 高速版 (400 tok/s)' },
        { id: 'glm-5', name: 'GLM-5 (旗舰)' }
      ],
      defaultModel: 'glm-5-1-fast'
    },
    mistral: {
      name: 'Mistral',
      baseUrl: 'https://api.mistral.ai/v1',
      apiType: 'openai',
      models: [
        { id: 'mistral-large-3', name: 'Mistral Large 3' }
      ],
      defaultModel: 'mistral-large-3'
    },
    anthropic: {
      name: 'Anthropic Claude',
      baseUrl: 'https://api.anthropic.com/v1',
      apiType: 'anthropic',
      models: [
        { id: 'claude-opus-4-7', name: 'Claude Opus 4.7' },
        { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5 (编码王者)' }
      ],
      defaultModel: 'claude-sonnet-4-5'
    },
    google: {
      name: 'Google Gemini',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      apiType: 'google',
      models: [
        { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash (极速)' },
        { id: 'gemini-omni', name: 'Gemini Omni (多模态)' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (1M上下文)' }
      ],
      defaultModel: 'gemini-2.5-flash'
    },
    baidu: {
      name: '百度 ERNIE',
      baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
      apiType: 'baidu',
      models: [
        { id: 'ernie-5.1', name: 'ERNIE 5.1 (全模态旗舰)' },
        { id: 'ernie-4.5', name: 'ERNIE 4.5 (性价比)' }
      ],
      defaultModel: 'ernie-5.1'
    }
  };

  // ==================== 存储 Key ====================
  const STORAGE_KEYS = 'nous_api_keys';
  const STORAGE_CONFIG = 'nous_chat_config';
  const STORAGE_HISTORY = 'nous_chat_history';

  // ==================== API Manager ====================
  const apiManager = {
    /** 获取所有保存的 API Key */
    getKeys() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS) || '{}');
      } catch { return {}; }
    },

    /** 保存某个提供商的 Key */
    setKey(provider, keyData) {
      const keys = this.getKeys();
      keys[provider] = { ...keys[provider], ...keyData };
      localStorage.setItem(STORAGE_KEYS, JSON.stringify(keys));
    },

    /** 删除某个提供商的 Key */
    removeKey(provider) {
      const keys = this.getKeys();
      delete keys[provider];
      localStorage.setItem(STORAGE_KEYS, JSON.stringify(keys));
    },

    /** 获取当前激活的提供商配置 */
    getActiveConfig() {
      const config = this.getConfig();
      const provider = config.provider || 'deepseek';
      const keys = this.getKeys();
      const keyData = keys[provider];
      return { provider, ...config, apiKey: keyData?.key || '' };
    },

    /** 获取当前配置（模型、温度等） */
    getConfig() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_CONFIG) || '{}');
      } catch { return {}; }
    },

    /** 保存当前配置 */
    setConfig(config) {
      const existing = this.getConfig();
      const merged = { ...existing, ...config };
      localStorage.setItem(STORAGE_CONFIG, JSON.stringify(merged));
    },

    /** 获取指定提供商的可用模型列表 */
    getModels(providerId) {
      // 先查内置
      const builtin = PROVIDERS[providerId];
      if (builtin) return builtin.models;
      // 查自定义
      const keys = this.getKeys();
      const custom = keys[providerId];
      if (custom && custom.models) return custom.models;
      return [];
    },

    /** 获取指定提供商的默认模型 */
    getDefaultModel(providerId) {
      const builtin = PROVIDERS[providerId];
      if (builtin) return builtin.defaultModel;
      const models = this.getModels(providerId);
      return models.length ? models[0].id : '';
    },

    /** 获取指定提供商的 Base URL */
    getBaseUrl(providerId) {
      const keys = this.getKeys();
      const custom = keys[providerId];
      if (custom && custom.customBaseUrl) return custom.customBaseUrl;
      const builtin = PROVIDERS[providerId];
      if (builtin) return builtin.baseUrl;
      return '';
    },

    /** 获取所有提供商列表（内置 + 自定义） */
    getAllProviders() {
      const providers = { ...PROVIDERS };
      const keys = this.getKeys();
      // 添加自定义提供商
      Object.keys(keys).forEach(k => {
        if (!providers[k] && keys[k].customName) {
          providers[k] = {
            name: keys[k].customName,
            baseUrl: keys[k].customBaseUrl || '',
            models: keys[k].models || [],
            defaultModel: (keys[k].models && keys[k].models.length) ? keys[k].models[0].id : '',
            custom: true
          };
        }
      });
      return providers;
    },

    /** 添加自定义 API */
    addCustomProvider(name, baseUrl, key, modelsStr) {
      const id = 'custom_' + Date.now();
      const models = modelsStr.split(',').map(s => s.trim()).filter(Boolean).map(m => ({ id: m, name: m }));
      const keyData = {
        key,
        customBaseUrl: baseUrl,
        customName: name,
        models,
        custom: true
      };
      this.setKey(id, keyData);
      return id;
    }
  };

  // ==================== Chat API 调用 ====================
  const chatAPI = {
    /**
     * 流式聊天请求
     * @param {Array} messages - [{role, content}, ...]
     * @param {Object} config - { provider, model, temperature }
     * @param {Function} onChunk - (text) => {} 每收到一段文本调用
     * @param {Function} onDone - () => {} 完成回调
     * @param {Function} onError - (err) => {} 错误回调
     * @returns {AbortController} 用于取消请求
     */
    streamChat(messages, config, onChunk, onDone, onError) {
      const { provider, model, temperature, reasoningEffort } = config;
      const keys = apiManager.getKeys();
      const keyData = keys[provider];
      const apiKey = keyData?.key || '';

      if (!apiKey) {
        if (onError) onError(new Error('API Key 未配置。请在设置中填写 API Key。'));
        return null;
      }

      const abortController = new AbortController();
      const providerCfg = PROVIDERS[provider] || {};

      // 根据 apiType 路由到不同的 API 处理
      switch (providerCfg.apiType || 'openai') {
        case 'anthropic':
          return this._streamAnthropic(model, messages, temperature, apiKey, abortController, onChunk, onDone, onError);
        case 'google':
          return this._streamGoogle(model, messages, temperature, apiKey, abortController, onChunk, onDone, onError);
        case 'baidu':
          return this._streamBaidu(model, messages, temperature, apiKey, abortController, onChunk, onDone, onError);
        default:
          return this._streamOpenAI(provider, model, messages, temperature, apiKey, reasoningEffort, abortController, onChunk, onDone, onError);
      }
    },

    // -------- OpenAI 兼容 API --------
    _streamOpenAI(provider, model, messages, temperature, apiKey, reasoningEffort, abortController, onChunk, onDone, onError) {
      const baseUrl = apiManager.getBaseUrl(provider);
      if (!baseUrl) {
        if (onError) onError(new Error('Base URL 未配置。'));
        return null;
      }

      const isReasoner = model.includes('reasoner') || model.includes('r1') || model.includes('o3') || model.includes('o4');
      const effort = reasoningEffort || 'medium';

      const body = {
        model,
        messages,
        stream: true,
        temperature: temperature ?? 0.7
      };

      // DeepSeek 系列思考模式需要 extra_body 参数
      if (isReasoner && (provider === 'deepseek' || provider.startsWith('custom_'))) {
        body.reasoning_effort = effort;
        body.extra_body = { thinking: { type: 'enabled' } };
      }

      // 如果提供商是 DeepSeek，添加 system prompt（非 reasoning 模型才加）
      if (provider === 'deepseek' && !isReasoner) {
        body.messages = [
          { role: 'system', content: 'You are a helpful assistant. Please answer in the language the user uses.' },
          ...messages
        ];
      }

      this._fetchSSE(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      }, abortController, onChunk, onDone, onError, (parsed) => {
        const delta = parsed.choices?.[0]?.delta;
        let text = '';
        if (delta && delta.content) text += delta.content;
        if (delta && delta.reasoning_content) text += delta.reasoning_content;
        return text || null;
      });

      return abortController;
    },

    // -------- Anthropic Claude API --------
    _streamAnthropic(model, messages, temperature, apiKey, abortController, onChunk, onDone, onError) {
      const baseUrl = PROVIDERS.anthropic.baseUrl;
      if (!baseUrl) {
        if (onError) onError(new Error('Base URL 未配置。'));
        return null;
      }

      // 转换消息格式：Anthropic 使用 user/assistant 角色
      const claudeMessages = [];
      let systemContent = '';
      for (const msg of messages) {
        if (msg.role === 'system') {
          systemContent = msg.content;
          continue;
        }
        claudeMessages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
      }

      const body = {
        model,
        messages: claudeMessages,
        max_tokens: 4096,
        stream: true
      };
      if (systemContent) body.system = systemContent;
      if (temperature != null) body.temperature = temperature;

      this._fetchSSE(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body)
      }, abortController, onChunk, onDone, onError, (parsed) => {
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          return parsed.delta.text;
        }
        return null;
      });

      return abortController;
    },

    // -------- Google Gemini API --------
    _streamGoogle(model, messages, temperature, apiKey, abortController, onChunk, onDone, onError) {
      const baseUrl = PROVIDERS.google.baseUrl;
      if (!baseUrl) {
        if (onError) onError(new Error('Base URL 未配置。'));
        return null;
      }

      // 转换消息格式
      const contents = [];
      let systemInstruction = null;
      for (const msg of messages) {
        if (msg.role === 'system') {
          systemInstruction = { parts: [{ text: msg.content }] };
          continue;
        }
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }

      const body = { contents };
      if (systemInstruction) body.system_instruction = systemInstruction;
      if (temperature != null) body.generationConfig = { temperature };

      const url = `${baseUrl}/models/${model}:streamGenerateContent?key=${encodeURIComponent(apiKey)}`;

      this._fetchGoogleSSE(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }, abortController, onChunk, onDone, onError);

      return abortController;
    },

    // -------- 百度 ERNIE API (使用 access_token) --------
    _streamBaidu(model, messages, temperature, apiKey, abortController, onChunk, onDone, onError) {
      // 百度 ERNIE API 需要使用 access_token
      // apiKey 格式: "client_id|client_secret" 或已获取的 token
      const baseUrl = PROVIDERS.baidu.baseUrl;
      if (!baseUrl) {
        if (onError) onError(new Error('Base URL 未配置。'));
        return null;
      }

      // 转换消息格式
      const baiduMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const body = {
        messages: baiduMessages,
        stream: true
      };
      if (temperature != null) body.temperature = temperature;

      // 尝试直接使用 key 作为 access_token，或者格式为 "client_id|client_secret"
      const useKeyDirectly = !apiKey.includes('|');
      const url = useKeyDirectly
        ? `${baseUrl}/chat/${model}?access_token=${encodeURIComponent(apiKey)}`
        : null; // 需要先获取 token，简化处理：让用户直接传 token

      if (!url) {
        if (onError) onError(new Error('百度 ERNIE 请直接粘贴 access_token，格式 "client_id|client_secret" 暂不支持自动获取。'));
        return null;
      }

      body.stream = true;

      this._fetchSSE(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }, abortController, onChunk, onDone, onError, (parsed) => {
        if (parsed.result) return parsed.result;
        // 兼容 OpenAI 格式
        const delta = parsed.choices?.[0]?.delta;
        if (delta && delta.content) return delta.content;
        return null;
      });

      return abortController;
    },

    // ==================== 底层 SSE 读取工具 ====================

    /** 通用 SSE 流读取（OpenAI 风格 data: 事件） */
    _fetchSSE(url, fetchOptions, abortController, onChunk, onDone, onError, parseFn) {
      fetch(url, { ...fetchOptions, signal: abortController.signal })
        .then(async response => {
          if (!response.ok) {
            let errMsg = `HTTP ${response.status}`;
            try {
              const errData = await response.json();
              errMsg = errData.error?.message || errData.error || errMsg;
            } catch {}
            throw new Error(errMsg);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data:')) continue;
              const data = trimmed.slice(5).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const text = parseFn ? parseFn(parsed) : parsed;
                if (text) { if (onChunk) onChunk(text); }
              } catch { /* 忽略 */ }
            }
          }

          if (onDone) onDone();
        })
        .catch(err => {
          if (err.name === 'AbortError') {
            if (onDone) onDone();
            return;
          }
          if (onError) onError(err);
        });
    },

    /** Google Gemini 专用 SSE 读取（返回 JSON 数组，非 data: 前缀） */
    _fetchGoogleSSE(url, fetchOptions, abortController, onChunk, onDone, onError) {
      fetch(url, { ...fetchOptions, signal: abortController.signal })
        .then(async response => {
          if (!response.ok) {
            let errMsg = `HTTP ${response.status}`;
            try {
              const errData = await response.json();
              errMsg = errData.error?.message || JSON.stringify(errData.error) || errMsg;
            } catch {}
            throw new Error(errMsg);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            // Google Gemini 返回的是行分隔的 JSON 对象，每行一个完整 JSON
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              try {
                const parsed = JSON.parse(trimmed);
                const candidates = parsed.candidates;
                if (candidates && candidates.length > 0) {
                  const parts = candidates[0]?.content?.parts;
                  if (parts) {
                    for (const part of parts) {
                      if (part.text && onChunk) onChunk(part.text);
                    }
                  }
                }
              } catch { /* 忽略 */ }
            }
          }

          if (onDone) onDone();
        })
        .catch(err => {
          if (err.name === 'AbortError') {
            if (onDone) onDone();
            return;
          }
          if (onError) onError(err);
        });
    },

    /**
     * 非流式聊天请求（降级方案）
     */
    async chat(messages, config) {
      const { provider, model, temperature } = config;
      const baseUrl = apiManager.getBaseUrl(provider);
      const keys = apiManager.getKeys();
      const keyData = keys[provider];
      const apiKey = keyData?.key || '';

      if (!apiKey) throw new Error('API Key 未配置');
      if (!baseUrl) throw new Error('Base URL 未配置');

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: temperature ?? 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        let errMsg = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          errMsg = errData.error?.message || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    }
  };

  // ==================== 对话历史管理 ====================
  const chatHistory = {
    /** 获取所有历史对话列表 */
    getAll() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]');
      } catch { return []; }
    },

    /** 保存整个历史列表 */
    saveAll(list) {
      localStorage.setItem(STORAGE_HISTORY, JSON.stringify(list));
    },

    /** 创建新对话 */
    create(messages) {
      const list = this.getAll();
      const session = {
        id: 'chat_' + Date.now(),
        title: this._generateTitle(messages),
        messages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.unshift(session);
      // 最多保留 50 条
      if (list.length > 50) list.length = 50;
      this.saveAll(list);
      return session;
    },

    /** 更新对话 */
    update(id, messages) {
      const list = this.getAll();
      const found = list.find(s => s.id === id);
      if (found) {
        found.messages = messages;
        found.updatedAt = new Date().toISOString();
        if (messages.length >= 2) {
          found.title = this._generateTitle(messages);
        }
        this.saveAll(list);
      }
    },

    /** 删除对话 */
    remove(id) {
      let list = this.getAll();
      list = list.filter(s => s.id !== id);
      this.saveAll(list);
    },

    /** 根据消息生成标题 */
    _generateTitle(messages) {
      const first = messages.find(m => m.role === 'user');
      if (first && first.content) {
        const text = first.content.replace(/[^\w\u4e00-\u9fff]/g, ' ').trim();
        return text.length > 40 ? text.slice(0, 40) + '…' : text;
      }
      return 'New Chat';
    }
  };

  // ==================== 导出全局接口 ====================
  window.ChatAPI = { PROVIDERS, apiManager, chatAPI, chatHistory };

})();
