import { ReactNode, Ref } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';

// Campo de formulario con etiqueta. Recibe todas las props de TextInput
// (value, onChangeText, secureTextEntry, keyboardType...) y las reenvía.
// `accesorio` es un elemento opcional a la derecha del campo, por ejemplo el
// botón para mostrar u ocultar la contraseña.
interface CampoTextoProps extends TextInputProps {
  etiqueta: string;
  accesorio?: ReactNode;
  ref?: Ref<TextInput>;
}

const Contenedor = styled.View`
  margin-bottom: ${theme.espaciado.lg}px;
`;

const Etiqueta = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoPrincipal};
  margin-bottom: ${theme.espaciado.xs}px;
`;

const Caja = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.md}px;
  border-width: 1px;
  border-color: ${theme.colores.borde};
  padding-horizontal: ${theme.espaciado.md}px;
`;

const Campo = styled.TextInput`
  flex: 1;
  font-size: ${theme.fuentes.md}px;
  color: ${theme.colores.textoPrincipal};
  padding-vertical: ${theme.espaciado.md}px;
`;

export default function CampoTexto({
  etiqueta,
  accesorio,
  ref,
  ...props
}: CampoTextoProps) {
  return (
    <Contenedor>
      <Etiqueta>{etiqueta}</Etiqueta>
      <Caja>
        <Campo
          ref={ref}
          placeholderTextColor={theme.colores.textoSecundario}
          accessibilityLabel={etiqueta}
          {...props}
        />
        {accesorio}
      </Caja>
    </Contenedor>
  );
}
