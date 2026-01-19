# 🚀 Guia Rápido - Servidor Imortal

## Início Rápido (30 segundos)

### 1. Iniciar o Servidor Imortal
```bash
/workspaces/bullex-signal-ai/start-immortal-server.sh
```

Aguarde ver:
```
✅ SERVIDOR IMORTAL INICIADO COM SUCESSO!
✅ Servidor respondendo na porta 8080
✅ Monitor imortal ativo
```

### 2. Verificar Status
```bash
/workspaces/bullex-signal-ai/check-server.sh
```

### 3. Abrir no Navegador
O Codespace vai mostrar um popup com o link, ou acesse:
```
https://<seu-codespace>-8080.app.github.dev
```

## ✅ Pronto! Seu servidor está IMORTAL!

### O que acontece agora?

✅ **Se o servidor morrer**: Revive automaticamente em até 15 segundos  
✅ **Se o Codespace hibernar**: Auto-start quando acordar  
✅ **Se você abrir um novo terminal**: Verifica e inicia se necessário  

## 🧪 Testar Resiliência

Quer ter certeza que funciona? Execute:

```bash
/workspaces/bullex-signal-ai/test-hibernation.sh
```

Este script vai:
1. ✅ Verificar que o servidor está rodando
2. ❌ Matar o servidor (simular crash/hibernação)
3. ⏳ Aguardar o monitor reviver
4. ✅ Confirmar que reviveu

**Tempo esperado de recuperação**: 4-15 segundos

## 📊 Comandos Úteis

### Ver Logs em Tempo Real
```bash
# Logs do servidor
tail -f /tmp/vite-server.log

# Logs do monitor
tail -f /tmp/monitor-immortal.log
```

### Ver Processos
```bash
# Ver servidor
lsof -i:8080

# Ver monitor
ps aux | grep immortal-monitor
```

### Reiniciar Tudo
```bash
# Parar tudo
pkill -f "immortal-monitor.sh"
lsof -ti:8080 | xargs kill -9

# Iniciar novamente
/workspaces/bullex-signal-ai/start-immortal-server.sh
```

## 🆘 Troubleshooting

### Servidor não inicia?
```bash
# Ver logs de erro
cat /tmp/vite-server.log

# Verificar porta
lsof -i:8080

# Reiniciar
/workspaces/bullex-signal-ai/start-immortal-server.sh
```

### Monitor não está ativo?
```bash
# Verificar se está rodando
ps aux | grep immortal-monitor

# Se não estiver, reiniciar tudo
/workspaces/bullex-signal-ai/start-immortal-server.sh
```

### Depois de hibernação não voltou?
```bash
# Abrir um novo terminal (vai executar .bashrc)
# OU
# Executar manualmente
/workspaces/bullex-signal-ai/start-immortal-server.sh
```

## 🎯 Como Funciona?

### Tecnologias Usadas
- **nohup**: Processo não é morto quando o terminal fecha
- **disown**: Desassocia processo do shell
- **daemon**: Processo em background independente
- **loop infinito**: Monitor que nunca para

### Arquitetura
```
Terminal fecha → Processo continua (nohup + disown)
Servidor morre → Monitor detecta → Revive (15s)
Codespace hiberna → .bashrc executa → Auto-start
```

## 🎉 Sucesso!

Seu servidor está configurado e rodando de forma imortal!

**Próximos passos:**
1. Desenvolver sua aplicação normalmente
2. O servidor se manterá vivo automaticamente
3. Não se preocupe com hibernação do Codespace

---

**Documentação completa**: [HIBERNATION_SOLVED.md](HIBERNATION_SOLVED.md)  
**Status**: ✅ Testado e Aprovado  
**Data**: 16 de Janeiro de 2026
