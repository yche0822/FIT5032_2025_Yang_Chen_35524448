<template>
  <div class="page">
    <div class="card">
      <div class="card-header">
        <h1>Send Email (with Attachment)</h1>
        <p class="sub">Fill the form below to send an email via Google Apps Script</p>
      </div>

      <form @submit.prevent="send" class="form">
        <!-- To -->
        <div class="field">
          <label class="label">Recipient Email</label>
          <input v-model="to" type="email" placeholder="e.g. user@example.com" required class="input" />
        </div>

        <!-- Subject -->
        <div class="field">
          <label class="label">Subject</label>
          <input v-model="subject" type="text" placeholder="Subject" required class="input" />
        </div>

        <!-- Message -->
        <div class="field">
          <label class="label">Message (HTML supported)</label>
          <textarea
            v-model="message"
            class="textarea"
            rows="6"
            placeholder="Write your message here. HTML is supported."
          ></textarea>
          <div class="hint">Tip: Use simple HTML, e.g. &lt;p&gt;...&lt;/p&gt;, &lt;br/&gt;</div>
        </div>

        <!-- File -->
        <div class="field">
          <label class="label">Attachment (optional)</label>
          <div class="filebox">
            <!-- 隐藏原生 file，保留同样的 @change 逻辑 -->
            <input id="fileInput" type="file" @change="onPick" class="file-hidden" />
            <label for="fileInput" class="btn secondary">Choose File</label>
            <span class="filename" v-if="file">{{ file.name }}</span>
            <span class="filename placeholder" v-else>No file selected</span>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" class="btn primary" :disabled="loading">
          <span v-if="loading" class="spinner" aria-hidden="true"></span>
          {{ loading ? "Sending..." : "Send" }}
        </button>

        <!-- Status -->
        <div v-if="status" class="status" :class="{
          success: status.startsWith('✅'),
          error: status.startsWith('❌'),
          info: !status.startsWith('✅') && !status.startsWith('❌')
        }">
          {{ status }}
        </div>
      </form>

      <div class="footer-tip">Your request is proxied to your deployed Google Apps Script endpoint.</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Replace with your deployed Google Apps Script URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbycVPRNydvPIqWBCm3d-kKs9FsSj1Fa8RODDZ1iSfN_Xd1TEnVOE7eW-u8pO35t8nqdpA/exec"

const to = ref("")
const subject = ref("")
const message = ref("")
const file = ref(null)
const status = ref("")
const loading = ref(false)

function onPick(e) {
  file.value = e.target.files[0] || null
}

// Convert file to base64 (raw content, without data: prefix)
async function fileToBase64(file) {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let bin = ""
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return { base64: btoa(bin), type: file.type || "application/octet-stream" }
}

async function send() {
  loading.value = true
  status.value = "Sending..."

  try {
    let payload = {
      to: to.value,
      subject: subject.value,
      html: `<p>${message.value}</p>`
    }

    if (file.value) {
      const { base64, type } = await fileToBase64(file.value)
      payload.fileBase64 = base64
      payload.contentType = type
      payload.fileName = file.value.name
    }

    // Use text/plain to avoid CORS preflight
    const resp = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    })

    const data = await resp.json().catch(async () => JSON.parse(await resp.text()))
    if (!resp.ok || !data.ok) throw new Error(data.error || "send failed")

    status.value = "✅ Email sent"
  } catch (err) {
    status.value = "❌ Send failed: " + (err.message || "")
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Layout */
.page {
  min-height: 100vh;
  background: linear-gradient(#f6f7fb, #eef1f6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
}
.card {
  width: 100%;
  max-width: 720px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(16, 24, 40, 0.08);
  border: 1px solid #eef0f3;
  overflow: hidden;
}
.card-header {
  padding: 22px 24px 16px;
  background: linear-gradient(90deg, #5b7cfa, #4aa3ff);
  color: #fff;
}
.card-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: .2px;
}
.sub {
  margin: 6px 0 0;
  opacity: .9;
  font-size: 12px;
}
.form {
  padding: 22px 24px;
}

/* Fields */
.field { margin-bottom: 18px; }
.label {
  display: block;
  margin-bottom: 8px;
  color: #2a2f3a;
  font-size: 13px;
  font-weight: 600;
}
.input, .textarea {
  width: 100%;
  border: 1px solid #d9dee7;
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  transition: box-shadow .15s ease, border-color .15s ease;
}
.input::placeholder, .textarea::placeholder { color: #9aa4b2; }
.input:focus, .textarea:focus {
  outline: none;
  border-color: #5b7cfa;
  box-shadow: 0 0 0 3px rgba(91,124,250,.15);
}
.textarea { resize: vertical; min-height: 140px; }
.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #8a95a3;
}

/* File */
.filebox {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px dashed #d9dee7;
  border-radius: 12px;
  padding: 10px 12px;
}
.file-hidden {
  display: none;
}
.filename {
  font-size: 13px;
  color: #2a2f3a;
}
.filename.placeholder { color: #9aa4b2; }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform .04s ease, box-shadow .15s ease, background .15s ease;
}
.btn:active { transform: translateY(1px); }

.btn.primary {
  width: 100%;
  color: #fff;
  background: linear-gradient(90deg, #5b7cfa, #4aa3ff);
  box-shadow: 0 6px 16px rgba(74,163,255,.25);
}
.btn.primary:hover { filter: brightness(0.98); }
.btn.primary:disabled {
  opacity: .6;
  cursor: not-allowed;
  box-shadow: none;
}

.btn.secondary {
  background: #eef2ff;
  color: #3f5efb;
}
.btn.secondary:hover { background: #e3e8ff; }

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Status */
.status {
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  border: 1px solid;
}
.status.success {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.status.error {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}
.status.info {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

/* Footer */
.footer-tip {
  border-top: 1px solid #f1f3f6;
  padding: 12px 16px 16px;
  text-align: center;
  font-size: 12px;
  color: #8a95a3;
}
</style>
