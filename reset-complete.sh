#!/bin/bash

echo "🔄 =========================================="
echo "🔄 RESET COMPLETO DO SISTEMA"
echo "🔄 =========================================="
echo ""

# 1. Limpar localStorage (será feito no próximo acesso)
echo "✅ 1/5 Preparando reset de localStorage..."

# 2. Limpar dados de aprendizado IA
echo "✅ 2/5 Limpando dados de aprendizado da IA..."
rm -f /tmp/ai-learning-*.json 2>/dev/null
rm -f /tmp/signal-history-*.json 2>/dev/null
rm -f /tmp/market-structure-*.json 2>/dev/null

# 3. Limpar logs
echo "✅ 3/5 Limpando logs do sistema..."
rm -f /tmp/vite-server.log 2>/dev/null
rm -f /tmp/ultra-monitor.log 2>/dev/null
rm -f /tmp/monitor.log 2>/dev/null

# 4. Criar script de reset para o navegador
echo "✅ 4/5 Criando script de reset do navegador..."
cat > /workspaces/bullex-signal-ai/public/reset-storage.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Completo - Bullex Signal AI</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        h1 {
            color: #667eea;
            margin-bottom: 20px;
            text-align: center;
            font-size: 2em;
        }
        
        .status {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        
        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .status-item:last-child {
            border-bottom: none;
        }
        
        .status-label {
            font-weight: 600;
            color: #333;
        }
        
        .status-value {
            color: #666;
            font-family: monospace;
        }
        
        .btn {
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 10px;
            font-size: 1.1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            margin: 10px 0;
        }
        
        .btn-reset {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }
        
        .btn-reset:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(245, 87, 108, 0.3);
        }
        
        .btn-back {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-back:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .icon {
            font-size: 3em;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .success {
            color: #4caf50;
        }
        
        .warning {
            color: #ff9800;
        }
        
        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        
        .info-box h3 {
            color: #1976d2;
            margin-bottom: 10px;
        }
        
        .info-box ul {
            margin-left: 20px;
            color: #555;
        }
        
        .info-box li {
            margin: 5px 0;
        }
        
        #result {
            display: none;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon" id="icon">🔄</div>
        <h1>Reset Completo do Sistema</h1>
        
        <div class="status">
            <div class="status-item">
                <span class="status-label">📦 Sinais OTC</span>
                <span class="status-value" id="signalsOTC">Carregando...</span>
            </div>
            <div class="status-item">
                <span class="status-label">📦 Sinais OPEN</span>
                <span class="status-value" id="signalsOPEN">Carregando...</span>
            </div>
            <div class="status-item">
                <span class="status-label">🧠 Histórico IA</span>
                <span class="status-value" id="aiHistory">Carregando...</span>
            </div>
            <div class="status-item">
                <span class="status-label">📊 Estado Aprendizado</span>
                <span class="status-value" id="learningState">Carregando...</span>
            </div>
            <div class="status-item">
                <span class="status-label">🎯 Taxa de Acerto</span>
                <span class="status-value" id="winRate">Carregando...</span>
            </div>
        </div>
        
        <div class="info-box">
            <h3>⚠️ O que será limpo:</h3>
            <ul>
                <li>Todos os sinais (OTC e OPEN)</li>
                <li>Histórico de aprendizado da IA</li>
                <li>Estado de evolução da IA</li>
                <li>Estatísticas de vitórias/derrotas</li>
                <li>Padrões aprendidos</li>
                <li>Cache do sistema</li>
            </ul>
        </div>
        
        <button class="btn btn-reset" onclick="resetAll()">
            🗑️ RESETAR TUDO
        </button>
        
        <div id="result">
            <div class="info-box" style="background: #e8f5e9; border-color: #4caf50;">
                <h3 style="color: #2e7d32;">✅ Reset Concluído!</h3>
                <p style="color: #555; margin-top: 10px;">
                    Sistema resetado com sucesso. Clique no botão abaixo para voltar ao app.
                </p>
            </div>
        </div>
        
        <button class="btn btn-back" onclick="goToApp()">
            🏠 VOLTAR AO APP
        </button>
    </div>
    
    <script>
        // Carregar estatísticas atuais
        function loadStats() {
            try {
                // Sinais
                const signalsOTC = JSON.parse(localStorage.getItem('signals_OTC') || '[]');
                const signalsOPEN = JSON.parse(localStorage.getItem('signals_OPEN') || '[]');
                document.getElementById('signalsOTC').textContent = signalsOTC.length + ' sinais';
                document.getElementById('signalsOPEN').textContent = signalsOPEN.length + ' sinais';
                
                // Histórico IA
                const aiHistory = JSON.parse(localStorage.getItem('ai_learning_history') || '[]');
                document.getElementById('aiHistory').textContent = aiHistory.length + ' operações';
                
                // Estado
                const learningState = JSON.parse(localStorage.getItem('ai_learning_state') || '{}');
                const phase = learningState.evolutionPhase || 'Iniciante';
                document.getElementById('learningState').textContent = phase;
                
                // Win Rate
                const winRate = learningState.winRate || 0;
                document.getElementById('winRate').textContent = winRate.toFixed(1) + '%';
                
            } catch (e) {
                console.error('Erro ao carregar stats:', e);
            }
        }
        
        function resetAll() {
            if (!confirm('⚠️ TEM CERTEZA?\n\nIsso irá apagar TODOS os dados do sistema!')) {
                return;
            }
            
            try {
                // Limpar localStorage
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (
                        key.startsWith('signals_') ||
                        key.startsWith('ai_') ||
                        key.includes('learning') ||
                        key.includes('history') ||
                        key.includes('state') ||
                        key.includes('evolution')
                    )) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                // Limpar sessionStorage
                sessionStorage.clear();
                
                // Atualizar UI
                document.getElementById('icon').textContent = '✅';
                document.getElementById('icon').className = 'icon success';
                
                document.getElementById('signalsOTC').textContent = '0 sinais';
                document.getElementById('signalsOPEN').textContent = '0 sinais';
                document.getElementById('aiHistory').textContent = '0 operações';
                document.getElementById('learningState').textContent = 'Resetado';
                document.getElementById('winRate').textContent = '0.0%';
                
                document.getElementById('result').style.display = 'block';
                
                alert('✅ Reset concluído com sucesso!\n\nTodos os dados foram limpos.');
                
            } catch (e) {
                alert('❌ Erro ao resetar: ' + e.message);
                console.error('Erro:', e);
            }
        }
        
        function goToApp() {
            window.location.href = '/';
        }
        
        // Carregar stats ao iniciar
        loadStats();
    </script>
</body>
</html>
EOF

echo "✅ 5/5 Reset preparado com sucesso!"
echo ""
echo "🌐 =========================================="
echo "🌐 ACESSE O RESET NO NAVEGADOR:"
echo "🌐 =========================================="
echo ""
echo "   http://localhost:8080/reset-storage.html"
echo ""
echo "🎯 O que será limpo:"
echo "   ✅ Todos os sinais (OTC e OPEN)"
echo "   ✅ Histórico de aprendizado da IA"
echo "   ✅ Estado de evolução"
echo "   ✅ Estatísticas e métricas"
echo ""
echo "📊 Sistema pronto para testar do ZERO!"
echo "=========================================="
