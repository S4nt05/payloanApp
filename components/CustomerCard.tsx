import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/utils/theme';

export default function CustomerCard({ item, onPress }:any){
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>{item.country}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card:{ backgroundColor:theme.colors.surface, padding:12, borderRadius:10, marginBottom:8, borderWidth:1, borderColor:theme.colors.border, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  name:{ fontSize:16, fontWeight:'600', color:theme.colors.text },
  sub:{ color:'#6c757d' },
  arrow:{ fontSize:22, color:theme.colors.border }
});