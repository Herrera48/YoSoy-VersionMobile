import styled from 'styled-components/native';

interface HeaderProps {
  titulo: string;
  subtitulo: string;
}

const Contenedor = styled.View`
  padding-bottom: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #e4e9ec;
  margin-bottom: 24px;
`;

const Titulo = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: #1f5e5c;
`;

const Subtitulo = styled.Text`
  font-size: 15px;
  line-height: 21px;
  color: #5e6e77;
  margin-top: 6px;
`;

export default function Header({ titulo, subtitulo }: HeaderProps) {
  return (
    <Contenedor>
      <Titulo>{titulo}</Titulo>
      <Subtitulo>{subtitulo}</Subtitulo>
    </Contenedor>
  );
}
