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
      models: [
        { id: 'deepseek-chat', name: 'DeepSeek V3 (Chat)' },
        { id: 'deepseek-reasoner', name: 'DeepSeek R1 (Reasoner)' }
      ],
      defaultModel: 'deepseek-chat'
    },
    siliconflow: {
      name: 'SiliconFlow',
      baseUrl: 'https://api.siliconflow.cn/v1',
      models: [
        { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3' },
        { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1' },
        { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B' },
        { id: 'Qwen/Qwen2.5-32B-Instruct', name: 'Qwen 2.5 32B' },
        { id: 'Qwen/Qwen2.5-14B-Instruct', name: 'Qwen 2.5 14B' },
        { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B' },
        { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4 9B' },
        { id: 'Pro/deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3 (Pro 版)' }
      ],
      defaultModel: 'deepseek-ai/DeepSeek-V3'
    },
    openai: {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
      ],
      defaultModel: 'gpt-4o-mini'
    },
    moonshot: {
      name: 'Moonshot',
      baseUrl: 'https://api.moonshot.cn/v1',
      models: [
        { id: 'moonshot-v1-8k', name: 'Moonshot 8K' },
        { id: 'moonshot-v1-32k', name: 'Moonshot 32K' },
        { id: 'moonshot-v1-128k', name: 'Moonshot 128K' }
      ],
      defaultModel: 'moonshot-v1-8k'
    },
    groq: {
      name: 'Groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      models: [
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
        { id: 'gemma2-9b-it', name: 'Gemma 2 9B' }
      ],
      defaultModel: 'llama-3.3-70b-versatile'
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
      const { provider, model, temperature } = config;
      const baseUrl = apiManager.getBaseUrl(provider);
      const keys = apiManager.getKeys();
      const keyData = keys[provider];
      const apiKey = keyData?.key || '';

      if (!apiKey) {
        if (onError) onError(new Error('API Key 未配置。请在设置中填写 API Key。'));
        return null;
      }
      if (!baseUrl) {
        if (onError) onError(new Error('Base URL 未配置。'));
        return null;
      }

      const abortController = new AbortController();

      const body = {
        model,
        messages,
        temperature: temperature ?? 0.7,
        stream: true
      };

      // 如果提供商是 DeepSeek，添加前缀（非 reasoning 模型才加）
      if (provider === 'deepseek' && model !== 'deepseek-reasoner') {
        body.messages = [
          { role: 'system', content: 'You are a helpful assistant. Please answer in the language the user uses.' },
          ...messages
        ];
      }

      fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body),
        signal: abortController.signal
      })
        .then(async response => {
          if (!response.ok) {
            let errMsg = `HTTP ${response.status}`;
            try {
              const errData = await response.json();
              errMsg = errData.error?.message || errMsg;
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
            // 按行分割 SSE 数据
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留未完成的行

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data:')) continue;
              const data = trimmed.slice(5).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;
                if (delta && delta.content) {
                  if (onChunk) onChunk(delta.content);
                }
                // 处理 reasoning_content（DeepSeek R1 的推理过程）
                if (delta && delta.reasoning_content) {
                  if (onChunk) onChunk(delta.reasoning_content);
                }
              } catch {
                // 忽略解析错误
              }
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

      return abortController;
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
