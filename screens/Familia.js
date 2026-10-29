import { StyleSheet, Text, View } from 'react-native';
import { Opcao, Pagina, Painel, Selo, cores, estilos } from '../components/ui.js';

export default function Familia({ usuario, membros, alterarNivel }) {
  return (
    <Pagina>
      <Text style={estilos.subtitulo}>
        Defina quem pode cadastrar, editar e excluir itens (responsável) e quem apenas usa o estoque e a lista (membro).
      </Text>
      {membros.map(function cartaoMembro(membro) {
        const voceMesmo = membro.id === usuario.id;
        return (
          <Painel key={membro.id}>
            <View style={css.topo}>
              <View style={css.avatar}><Text style={css.inicial}>{membro.nome.slice(0, 1).toUpperCase()}</Text></View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={css.nome}>{membro.nome}{voceMesmo ? ' (você)' : ''}</Text>
                <Text style={css.email}>{membro.email}</Text>
              </View>
              <Selo texto={membro.nivel === 'responsavel' ? 'Responsável' : 'Membro'} tom={membro.nivel === 'responsavel' ? 'ok' : 'neutro'} />
            </View>
            {/* Ninguém altera o próprio nível: evita que a casa fique sem responsável. */}
            {!voceMesmo && <View style={estilos.linha}>
              <Opcao texto="Membro" ativo={membro.nivel === 'membro'} onPress={function () { alterarNivel(membro.id, 'membro'); }} />
              <Opcao texto="Responsável" ativo={membro.nivel === 'responsavel'} onPress={function () { alterarNivel(membro.id, 'responsavel'); }} />
            </View>}
          </Painel>
        );
      })}
    </Pagina>
  );
}

const css = StyleSheet.create({
  topo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: cores.primariaClara, alignItems: 'center', justifyContent: 'center' },
  inicial: { color: cores.primaria, fontSize: 18, fontWeight: '800' },
  nome: { color: cores.texto, fontSize: 16, fontWeight: '700' },
  email: { color: cores.muted, fontSize: 13 },
});
