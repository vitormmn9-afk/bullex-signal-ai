import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ResetResultsButtonProps {
  onReset?: () => void;
}

export function ResetResultsButton({ onReset }: ResetResultsButtonProps) {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleReset = () => {
    setIsResetting(true);
    
    try {
      // Carregar sinais atuais
      const signalsOTC = JSON.parse(localStorage.getItem('signals_OTC') || '[]');
      const signalsOPEN = JSON.parse(localStorage.getItem('signals_OPEN') || '[]');
      
      // Contar resultados antes do reset
      const countResults = (signals: any[]) => {
        const wins = signals.filter(s => s.result === 'WIN').length;
        const losses = signals.filter(s => s.result === 'LOSS').length;
        return { wins, losses, total: signals.length };
      };
      
      const beforeOTC = countResults(signalsOTC);
      const beforeOPEN = countResults(signalsOPEN);
      
      // Resetar apenas os resultados dos sinais (manter sinais mas limpar WIN/LOSS)
      const resetSignals = (signals: any[]) => 
        signals.map(signal => ({
          ...signal,
          result: signal.result === 'PENDING' ? 'PENDING' : null,
          executed_at: null,
        }));
      
      const resetOTC = resetSignals(signalsOTC);
      const resetOPEN = resetSignals(signalsOPEN);
      
      // Salvar sinais resetados
      localStorage.setItem('signals_OTC', JSON.stringify(resetOTC));
      localStorage.setItem('signals_OPEN', JSON.stringify(resetOPEN));
      
      // Limpar cache de notificações
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('notified-')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // NÃO LIMPAR: ai_learning_state, ai_learning_history, patterns, etc.
      // Isso mantém o aprendizado da IA intacto
      
      const totalWins = beforeOTC.wins + beforeOPEN.wins;
      const totalLosses = beforeOTC.losses + beforeOPEN.losses;
      const totalSignals = beforeOTC.total + beforeOPEN.total;
      
      toast({
        title: "✅ Resultados Resetados!",
        description: `Removidos ${totalWins} vitórias e ${totalLosses} derrotas de ${totalSignals} sinais.
        
🧠 Aprendizado da IA mantido
📚 Padrões mantidos
⚙️ Configurações mantidas`,
        duration: 8000,
      });
      
      console.log('🔄 RESET DE RESULTADOS COMPLETO');
      console.log('═'.repeat(60));
      console.log('📊 Estatísticas Antes:');
      console.log(`   OTC: ${beforeOTC.wins}W / ${beforeOTC.losses}L (${beforeOTC.total} sinais)`);
      console.log(`   OPEN: ${beforeOPEN.wins}W / ${beforeOPEN.losses}L (${beforeOPEN.total} sinais)`);
      console.log(`   TOTAL: ${totalWins}W / ${totalLosses}L`);
      console.log('');
      console.log('✅ Resultados resetados, sinais mantidos como PENDING');
      console.log('🧠 Aprendizado da IA: MANTIDO');
      console.log('📚 Padrões e histórico: MANTIDOS');
      console.log('═'.repeat(60));
      
      // Callback para atualizar a UI
      if (onReset) {
        onReset();
      }
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao resetar resultados:', error);
      toast({
        title: "❌ Erro ao Resetar",
        description: "Ocorreu um erro ao resetar os resultados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 border-orange-500/50 text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-600"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Reset Resultados</span>
          <span className="sm:hidden">Reset</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Resetar Resultados?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p className="font-medium text-foreground">
              Esta ação irá:
            </p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <RotateCcw className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-orange-900">
                  Remover todas as marcações de <strong>Vitória</strong> e <strong>Derrota</strong>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <RotateCcw className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-orange-900">
                  Resetar estatísticas de acertos
                </span>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-900">
                  <strong>Manter</strong> todo o aprendizado da IA
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-900">
                  <strong>Manter</strong> padrões e configurações
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-900">
                  <strong>Manter</strong> histórico de sinais
                </span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground pt-2">
              💡 Útil para testar a IA novamente sem perder o conhecimento adquirido
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={isResetting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isResetting ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Resetando...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar Resultados
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
