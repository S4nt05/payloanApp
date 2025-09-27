import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons'; // 🔑 Importamos Ionicons

interface Props {
    title: string;
    value: string | number;
    iconName?: keyof typeof Ionicons.glyphMap; // Tipo de ícono de Ionicons
    iconColor?: string;
    isCurrency?: boolean; // Para formatear si es moneda
}

export default function SummaryCard({ title, value, iconName, iconColor, isCurrency = false }: Props) {
    
    // Convertir el valor a string, y formatear si es moneda (usando un formato simple aquí)
    const displayValue = isCurrency && typeof value === 'number' 
        ? `$ ${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
        : String(value);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '30' }]}>
                    <Ionicons name={iconName} size={20} color={iconColor} />
                </View>
                <Text style={styles.title}>{title}</Text>
            </View>
            <Text style={[styles.value, isCurrency && { color: iconColor }]}>{displayValue}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { 
        flex: 1, 
        backgroundColor: theme.colors.surface, 
        padding: 16, 
        borderRadius: 16, 
        width: '48%', 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        borderWidth: 1, 
        borderColor: theme.colors.border + '50'
    }, 
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconContainer: {
        padding: 8,
        borderRadius: 8,
        marginRight: 10,
    },
    title: { 
        color: '#6B7280', 
        fontSize: 13,
        fontWeight: '600'
    }, 
    value: { 
        fontSize: 24, 
        fontWeight: '800', 
        color: theme.colors.text, 
    } 
});
