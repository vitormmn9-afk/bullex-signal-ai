-- Migration: Add entry_time column to signals table
-- Date: 2026-01-10
-- Description: Adiciona coluna entry_time para armazenar o horário de entrada do sinal

-- Adicionar coluna entry_time
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS entry_time TIMESTAMPTZ;

-- Adicionar comentário na coluna
COMMENT ON COLUMN signals.entry_time IS 'Horário de entrada do sinal (próximo minuto completo após a geração)';

-- Atualizar sinais existentes com entry_time calculado
UPDATE signals 
SET entry_time = (created_at + INTERVAL '1 minute')::timestamp AT TIME ZONE 'UTC'
WHERE entry_time IS NULL AND created_at IS NOT NULL;

-- Criar índice para consultas por entry_time
CREATE INDEX IF NOT EXISTS idx_signals_entry_time 
ON signals(entry_time DESC);

-- Criar índice composto para consultas filtradas
CREATE INDEX IF NOT EXISTS idx_signals_entry_pending 
ON signals(entry_time DESC, result) 
WHERE result = 'PENDING';
