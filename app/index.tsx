import { Image, ScrollView, Text, View } from 'react-native';

import { profesionales } from '../data/profesionales';

export default function Home() {
  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>YoSoy</Text>
        <Text style={{ fontSize: 16, textAlign: 'center', marginTop: 8 }}>
          Profesionales disponibles
        </Text>
      </View>

      <View>
        {profesionales.map((profesional) => (
          <View
            key={profesional.id}
            style={{ flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' }}
          >
            <Image
              source={{ uri: profesional.avatar }}
              style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>
                {profesional.nombre} {profesional.apellido}
              </Text>
              <Text style={{ fontSize: 13, marginTop: 2 }}>
                {profesional.especialidad} · {profesional.matricula}
              </Text>
              <Text style={{ fontSize: 13, marginTop: 2 }}>{profesional.modalidad}</Text>
              <Text style={{ fontSize: 13, marginTop: 4 }}>{profesional.descripcion}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
