'use client';

import { useState } from 'react';

export default function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    // 实现语音录入逻辑
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      {isRecording ? '停止录音' : '开始录音'}
    </button>
  );
}
