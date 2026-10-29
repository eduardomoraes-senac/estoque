import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Aviso, Botao, Campo, Pagina, Painel, cores, estilos } from '../components/ui.js';

// Contas de demonstração para testar os dois níveis de usuário.
const CONTAS_TESTE = [
  { email: 'ana@familia.com', descricao: 'Ana · responsável' },
  { email: 'pedro@familia.com', descricao: 'Pedro · membro' },
];

export default function Login({ navigation, aoEntrar, aviso }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function entrar() {
    if (!email.trim() || !senha) { setErro('Informe e-mail e senha.'); return; }
    // Entrega 1: login simulado. Na Entrega 3 a API vai conferir a senha (bcrypt) e devolver um JWT.
    if (!aoEntrar(email)) { setErro('Conta não encontrada. Use uma conta de teste ou crie uma conta.'); }
  }

  function preencher(emailTeste) {
    setEmail(emailTeste);
    setSenha('123456');
    setErro('');
  }

  return (
    <Pagina incluirTopo>
      <View style={css.marca}>
        <View style={css.pote}><View style={css.tampa} /><View style={css.corpo}><Text style={css.check}>✓</Text></View></View>
        <Text style={estilos.etiqueta}>Estoque da família</Text>
        <Text style={estilos.titulo}>Despensa em Dia</Text>
        <Text style={estilos.subtitulo}>Saiba o que tem em casa, o que está vencendo e o que precisa comprar.</Text>
      </View>

      <Painel>
        <Aviso mensagem={erro} />
        <Aviso mensagem={!erro ? aviso : ''} tipo="sucesso" />
        <Campo rotulo="E-mail" value={email} onChangeText={setEmail} placeholder="voce@email.com"
          autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Campo rotulo="Senha" value={senha} onChangeText={setSenha} placeholder="Sua senha" secureTextEntry />
        <Botao titulo="Entrar" onPress={entrar} />
        <Botao titulo="Criar conta" variante="secundario" onPress={function irCadastro() { navigation.navigate('CadastroUsuario'); }} />
      </Painel>

      <Painel style={{ gap: 8 }}>
        <Text style={estilos.tituloPainel}>Contas de teste</Text>
        <Text style={estilos.subtitulo}>Toque para preencher e conhecer cada nível de acesso.</Text>
        {CONTAS_TESTE.map(function contaTeste(conta) {
          return (
            <Pressable key={conta.email} accessibilityRole="button" onPress={function () { preencher(conta.email); }} style={css.conta}>
              <Text style={estilos.texto}>{conta.descricao}</Text>
              <Text style={css.email}>{conta.email}</Text>
            </Pressable>
          );
        })}
      </Painel>
    </Pagina>
  );
}

const css = StyleSheet.create({
  marca: { gap: 8, paddingTop: 24 },
  pote: { width: 56, alignItems: 'center', marginBottom: 8 },
  tampa: { width: 36, height: 9, borderRadius: 4, backgroundColor: cores.texto },
  corpo: { marginTop: 3, width: 48, height: 44, borderRadius: 12, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  check: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  conta: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: cores.fundo, gap: 2 },
  email: { color: cores.muted, fontSize: 13 },
});
