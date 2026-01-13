#!/bin/bash
# AI柔軟判定のテスト

echo "=== AI柔軟判定テスト ==="

# テストデータ
cat > /tmp/test_ai_verify.json << 'EOF'
{
  "question_id": 1,
  "actual_answer": "カレー",
  "user_answers": [
    {
      "user_id": "USER001",
      "predicted_answer": "カレーライス"
    },
    {
      "user_id": "USER002",
      "predicted_answer": "カレー"
    },
    {
      "user_id": "USER003",
      "predicted_answer": "ラーメン"
    }
  ]
}
EOF

echo "テストデータ:"
cat /tmp/test_ai_verify.json | jq .

echo ""
echo "AI判定を実行中..."

curl -s -X POST http://localhost:3000/admin/api/ai/verify-prediction \
  -H "Content-Type: application/json" \
  -d @/tmp/test_ai_verify.json | jq .

echo ""
echo "=== テスト完了 ==="
