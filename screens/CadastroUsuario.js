import { useState } from 'react';
import { Text } from 'react-native';
import { Aviso, Botao, Campo, Pagina, Painel, estilos } from '../components/ui.js';

export default function CadastroUsuario({ navigation, aoCadastrar }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  function cadastrar() {
    setSucesso('');
    if (nome.trim().length < 2) { setErro('Informe seu nome.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setErro('Informe um e-mail válido.'); return; }
    if (senha.length < 6) { setErro('A senha precisa ter pelo menos 6 caracteres.'); return; }
    if (senha !== confirmacao) { setErro('As senhas não conferem.'); return; }
    // Entrega 1: cadastro em memória. Na Entrega 3 a API salva a senha com hash (bcrypt).
    if (!aoCadastrar(nome, email)) { setErro('Já existe uma conta com esse e-mail.'); return; }
    setErro('');
    setSucesso('Conta criada como membro da família! Volte e entre com seu e-mail.');
    setNome(''); setEmail(''); setSenha(''); setConfirmacao('');
  }

  return (
    <Pagina>
      <Text style={estilos.subtitulo}>Toda conta nova começa como <Text style={{ fontWeight: '700' }}>membro</Text>. O responsável da casa pode mudar o nível depois.</Text>
      <Painel>
        <Aviso mensagem={erro} />
        <Aviso mensagem={sucesso} tipo="sucesso" />
        <Campo rotulo="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome" />
        <Campo rotulo="E-mail" value={email} onChangeText={setEmail} placeholder="voce@email.com" autoCapitalize="none" keyboardType="email-address" />
        <Campo rotulo="Senha" value={senha} onChangeText={setSenha} placeholder="Mínimo de 6 caracteres" secureTextEntry />
        <Campo rotulo="Confirmar senha" value={confirmacao} onChangeText={setConfirmacao} placeholder="Repita a senha" secureTextEntry />
        <Botao titulo="Criar conta" onPress={cadastrar} />
        <Botao titulo="Já tenho conta" variante="secundario" onPress={function voltar() { navigation.goBack(); }} />
      </Painel>
    </Pagina>
  );
}
