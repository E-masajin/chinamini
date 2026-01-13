#!/bin/bash
# AI問題生成のテスト

echo "=== AI問題生成テスト ==="

# テストデータ
cat > /tmp/test_ai_generate.json << 'EOF'
{
  "theme": "オフィスでの身近な予測",
  "count": 3,
  "event_id": 1
}
EOF

echo "テストデータ:"
cat /tmp/test_ai_generate.json | jq .

echo ""
echo "AI問題生成を実行中..."

curl -s -X POST http://localhost:3000/admin/api/ai/generate-prediction-questions \
  -H "Content-Type: application/json" \
  -d @/tmp/test_ai_generate.json | jq .

echo ""
echo "=== テスト完了 ==="
