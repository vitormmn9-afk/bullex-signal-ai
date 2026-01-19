#!/bin/bash

# Teste de estresse - Múltiplas quedas do servidor
# Verifica se o monitor consegue reviver o servidor várias vezes seguidas

echo "🔥 Teste de Estresse - Múltiplas Hibernações"
echo "============================================="
echo ""

TOTAL_TESTS=5
PASSED=0
FAILED=0

echo "🎯 Vamos simular $TOTAL_TESTS hibernações seguidas..."
echo ""

for i in $(seq 1 $TOTAL_TESTS); do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧪 Teste $i/$TOTAL_TESTS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 1. Verificar que está rodando
    if ! lsof -i:8080 > /dev/null 2>&1; then
        echo "❌ Servidor já estava morto antes do teste $i!"
        FAILED=$((FAILED + 1))
        continue
    fi
    echo "✅ Servidor está rodando"
    
    # 2. Matar o servidor
    echo "💀 Matando servidor..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    sleep 1
    
    # 3. Verificar que morreu
    if lsof -i:8080 > /dev/null 2>&1; then
        echo "⚠️ Servidor não morreu completamente, tentando novamente..."
        lsof -ti:8080 | xargs kill -9 2>/dev/null
        sleep 1
    fi
    echo "💀 Servidor morto"
    
    # 4. Aguardar reviver (timeout de 30 segundos)
    echo "⏳ Aguardando reviver..."
    REVIVED=false
    for j in {1..30}; do
        if lsof -i:8080 > /dev/null 2>&1; then
            echo "✅ Reviveu em ${j}s!"
            PASSED=$((PASSED + 1))
            REVIVED=true
            break
        fi
        sleep 1
    done
    
    if [ "$REVIVED" = false ]; then
        echo "❌ Não reviveu após 30 segundos!"
        FAILED=$((FAILED + 1))
    fi
    
    # 5. Aguardar estabilizar antes do próximo teste
    if [ $i -lt $TOTAL_TESTS ]; then
        echo "⏸️ Aguardando 3s antes do próximo teste..."
        sleep 3
    fi
    
    echo ""
done

# Resultado final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESULTADO DO TESTE DE ESTRESSE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total de testes: $TOTAL_TESTS"
echo "✅ Passou: $PASSED"
echo "❌ Falhou: $FAILED"
echo ""

# Calcular taxa de sucesso
SUCCESS_RATE=$((PASSED * 100 / TOTAL_TESTS))

if [ $SUCCESS_RATE -ge 100 ]; then
    echo "🎉 PERFEITO! 100% de taxa de sucesso!"
    echo "🏆 O sistema é VERDADEIRAMENTE IMORTAL!"
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo "✅ MUITO BOM! ${SUCCESS_RATE}% de taxa de sucesso"
    echo "🎯 Sistema altamente resiliente"
elif [ $SUCCESS_RATE -ge 60 ]; then
    echo "⚠️ ACEITÁVEL. ${SUCCESS_RATE}% de taxa de sucesso"
    echo "💡 Pode precisar de ajustes"
else
    echo "❌ PRECISA MELHORAR. ${SUCCESS_RATE}% de taxa de sucesso"
    echo "🔧 Sistema precisa de correções"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Status final
echo ""
echo "📊 Status Final do Sistema:"
/workspaces/bullex-signal-ai/check-server.sh

exit $FAILED
